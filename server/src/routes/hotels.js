const express = require('express')
const mongoose = require('mongoose')
const { Hotel } = require('../models/Hotel')
const { AppError } = require('../utils/errors')

const router = express.Router()

// 统一处理字符串参数
function normalizeString(v) {
  return typeof v === 'string' ? v.trim() : ''
}

// 统一处理数字参数（非法则返回 null）
function parseNumber(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 列表卡片字段：按用户端展示最小必要字段输出
function toHotelCard(hotel) {
  const images = Array.isArray(hotel.images) ? hotel.images : []
  return {
    id: String(hotel._id),
    nameCn: hotel.nameCn,
    address: hotel.address,
    city: hotel.city,
    star: hotel.star,
    type: hotel.type,
    minPrice: hotel.minPrice,
    tags: Array.isArray(hotel.tags) ? hotel.tags : [],
    coverImage: hotel.coverImage || images[0] || '',
  }
}

// 详情字段：在卡片基础上补齐详情所需内容
function toHotelDetail(hotel) {
  const roomTypes = Array.isArray(hotel.roomTypes) ? [...hotel.roomTypes] : []
  // 保证房型按价格从低到高，便于前端直接展示
  roomTypes.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))

  const nearbyRaw = hotel.nearby || {}
  const nearby = {
    scenic: Array.isArray(nearbyRaw.scenic) ? nearbyRaw.scenic : Array.isArray(nearbyRaw.sights) ? nearbyRaw.sights : [],
    transport: Array.isArray(nearbyRaw.transport) ? nearbyRaw.transport : [],
    mall: Array.isArray(nearbyRaw.mall) ? nearbyRaw.mall : [],
  }

  return {
    ...toHotelCard(hotel),
    nameEn: hotel.nameEn || '',
    openTime: hotel.openTime,
    images: Array.isArray(hotel.images) ? hotel.images : [],
    bannerText: hotel.bannerText || '',
    roomTypes,
    nearby,
    discounts: Array.isArray(hotel.discounts) ? hotel.discounts : [],
  }
}

// GET /api/v1/hotels
// - 用户端酒店列表查询（分页/筛选/排序）
// - 仅返回已审核通过且已上线的数据
router.get('/', async (req, res, next) => {
  try {
    const city = normalizeString(req.query.city)
    const keyword = normalizeString(req.query.keyword)
    const tagsRaw = normalizeString(req.query.tags)
    const type = normalizeString(req.query.type)

    const minPrice = parseNumber(req.query.minPrice)
    const maxPrice = parseNumber(req.query.maxPrice)
    const star = parseNumber(req.query.star)

    const pageRaw = parseNumber(req.query.page)
    const pageSizeRaw = parseNumber(req.query.pageSize)
    const page = Math.max(1, pageRaw || 1)
    const pageSize = Math.min(50, Math.max(1, pageSizeRaw || 10))

    const sortRaw = normalizeString(req.query.sort)

    const filter = {
      auditStatus: 'approved',
      onlineStatus: 'online',
      deletedAt: null,
    }

    // 精确筛选条件
    if (city) {
      const normalizedCity = city.replace(/市$/, '')
      const safeCity = escapeRegex(normalizedCity)
      filter.city = new RegExp(`^${safeCity}(市)?$`)
    }
    if (type) filter.type = type
    if (star !== null) filter.star = star

    // 价格区间筛选
    if (minPrice !== null || maxPrice !== null) {
      filter.minPrice = {}
      if (minPrice !== null) filter.minPrice.$gte = minPrice
      if (maxPrice !== null) filter.minPrice.$lte = maxPrice
    }

    // 标签筛选：逗号分隔，例如 亲子,豪华
    if (tagsRaw) {
      const tags = tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      if (tags.length > 0) filter.tags = { $in: tags }
    }

    // 关键词模糊查询：酒店名（中/英）或地址
    if (keyword) {
      const safe = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(safe, 'i')
      filter.$or = [{ nameCn: re }, { nameEn: re }, { address: re }]
    }

    // 排序策略
    let sort = { createdAt: -1, _id: 1 }
    if (sortRaw === 'priceAsc') sort = { minPrice: 1, _id: 1 }
    if (sortRaw === 'priceDesc') sort = { minPrice: -1, _id: 1 }
    if (sortRaw === 'starDesc') sort = { star: -1, _id: 1 }

    // 同时获取总数与分页数据
    const [total, hotels] = await Promise.all([
      Hotel.countDocuments(filter),
      Hotel.find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ])

    // 统一返回格式：list + page + pageSize + total
    res.json({
      list: hotels.map(toHotelCard),
      page,
      pageSize,
      total,
    })
  } catch (e) {
    next(e)
  }
})

// GET /api/v1/hotels/:id
// - 用户端酒店详情
// - 仅返回已审核通过且已上线的数据
router.get('/:id', async (req, res, next) => {
  try {
    const id = normalizeString(req.params.id)
    // id 非法时直接返回 404，避免泄露内部错误
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError({
        status: 404,
        code: 'NOT_FOUND',
        message: 'Hotel not found',
      })
    }

    const hotel = await Hotel.findOne({
      _id: id,
      auditStatus: 'approved',
      onlineStatus: 'online',
      deletedAt: null,
    }).lean()

    // 不存在或不可见统一按 404 处理
    if (!hotel) {
      throw new AppError({
        status: 404,
        code: 'NOT_FOUND',
        message: 'Hotel not found',
      })
    }

    res.json({ hotel: toHotelDetail(hotel) })
  } catch (e) {
    next(e)
  }
})

module.exports = { hotelsRouter: router }
