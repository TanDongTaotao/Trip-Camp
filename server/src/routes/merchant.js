// 商户端接口（merchant）：
// - 提供酒店信息的录入/编辑/提交审核/我的酒店列表
// - 路由挂载点：/api/v1/merchant
const express = require('express')
const mongoose = require('mongoose')
const { Hotel } = require('../models/Hotel')
const { requireAuth } = require('../middlewares/requireAuth')
const { requireRole } = require('../middlewares/requireRole')
const { AppError } = require('../utils/errors')

const router = express.Router()

function normalizeString(v) {
  return typeof v === 'string' ? v.trim() : ''
}

function parseNumber(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function normalizeStringArray(v) {
  if (!Array.isArray(v)) return []
  return v.map((x) => normalizeString(x)).filter(Boolean)
}

function toHotelManageItem(hotel) {
  const images = Array.isArray(hotel.images) ? hotel.images : []
  return {
    id: String(hotel._id),
    ownerId: hotel.ownerId ? String(hotel.ownerId) : null,
    auditStatus: hotel.auditStatus,
    onlineStatus: hotel.onlineStatus,
    rejectReason: hotel.rejectReason || null,
    updateStatus: hotel.updateStatus || 'none',
    updateRejectReason: hotel.updateRejectReason || null,
    nameCn: hotel.nameCn,
    nameEn: hotel.nameEn || '',
    address: hotel.address,
    city: hotel.city,
    star: hotel.star,
    type: hotel.type,
    minPrice: hotel.minPrice,
    openTime: hotel.openTime,
    coverImage: hotel.coverImage || images[0] || '',
    images,
    tags: Array.isArray(hotel.tags) ? hotel.tags : [],
    bannerText: hotel.bannerText || '',
    roomTypes: Array.isArray(hotel.roomTypes) ? hotel.roomTypes : [],
    nearby: hotel.nearby || {},
    discounts: Array.isArray(hotel.discounts) ? hotel.discounts : [],
    createdAt: hotel.createdAt,
    updatedAt: hotel.updatedAt,
  }
}

function validateRoomTypes(roomTypes) {
  if (!Array.isArray(roomTypes)) return { ok: true, value: [] }

  const normalized = roomTypes.map((rt) => ({
    name: normalizeString(rt && rt.name),
    price: parseNumber(rt && rt.price),
    images: normalizeStringArray(rt && rt.images),
    amenities: normalizeStringArray(rt && rt.amenities),
  }))

  for (const rt of normalized) {
    if (!rt.name) {
      return {
        ok: false,
        message: 'Invalid roomTypes',
        details: { field: 'roomTypes.name' },
      }
    }
    if (rt.price === null || rt.price < 0) {
      return {
        ok: false,
        message: 'Invalid roomTypes',
        details: { field: 'roomTypes.price' },
      }
    }
    if (!Array.isArray(rt.images) || rt.images.length === 0) {
      return {
        ok: false,
        message: 'Invalid roomTypes',
        details: { field: 'roomTypes.images' },
      }
    }
  }

  return { ok: true, value: normalized }
}

function normalizeNearby(nearby) {
  const raw = nearby && typeof nearby === 'object' ? nearby : {}
  return {
    scenic: normalizeStringArray(raw.scenic),
    transport: normalizeStringArray(raw.transport),
    mall: normalizeStringArray(raw.mall),
  }
}

function validateDiscounts(discounts) {
  if (!Array.isArray(discounts)) return { ok: true, value: [] }
  const normalized = discounts.map((d) => ({
    title: normalizeString(d && d.title),
    desc: normalizeString(d && d.desc),
  }))

  for (const d of normalized) {
    if (!d.title) {
      return { ok: false, message: 'Invalid discounts', details: { field: 'discounts.title' } }
    }
  }

  return { ok: true, value: normalized }
}

function pickUpdatableFields(body) {
  const raw = body && typeof body === 'object' ? body : {}

  const roomTypesCheck = validateRoomTypes(raw.roomTypes)
  if (!roomTypesCheck.ok) {
    throw new AppError({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: roomTypesCheck.message,
      details: roomTypesCheck.details,
    })
  }

  const discountsCheck = validateDiscounts(raw.discounts)
  if (!discountsCheck.ok) {
    throw new AppError({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: discountsCheck.message,
      details: discountsCheck.details,
    })
  }

  const updates = {}

  if (raw.nameCn !== undefined) updates.nameCn = normalizeString(raw.nameCn)
  if (raw.nameEn !== undefined) updates.nameEn = normalizeString(raw.nameEn)
  if (raw.address !== undefined) updates.address = normalizeString(raw.address)
  if (raw.city !== undefined) updates.city = normalizeString(raw.city)
  if (raw.star !== undefined) {
    updates.star = parseNumber(raw.star)
    if (updates.star === null || updates.star < 1 || updates.star > 5) {
      throw new AppError({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid star',
        details: { field: 'star' },
      })
    }
  }
  if (raw.type !== undefined) updates.type = normalizeString(raw.type)
  if (raw.openTime !== undefined) updates.openTime = normalizeString(raw.openTime)

  if (raw.coverImage !== undefined) updates.coverImage = normalizeString(raw.coverImage)
  if (raw.images !== undefined) updates.images = normalizeStringArray(raw.images)
  if (raw.tags !== undefined) updates.tags = normalizeStringArray(raw.tags)
  if (raw.bannerText !== undefined) updates.bannerText = normalizeString(raw.bannerText)

  if (raw.roomTypes !== undefined) updates.roomTypes = roomTypesCheck.value
  if (raw.nearby !== undefined) updates.nearby = normalizeNearby(raw.nearby)
  if (raw.discounts !== undefined) updates.discounts = discountsCheck.value

  if (raw.minPrice !== undefined) {
    updates.minPrice = parseNumber(raw.minPrice)
    if (updates.minPrice === null || updates.minPrice < 0) {
      throw new AppError({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid minPrice',
        details: { field: 'minPrice' },
      })
    }
  }

  if (updates.images && updates.images.length > 0 && !updates.coverImage) {
    updates.coverImage = updates.images[0]
  }

  return updates
}

function assertRequiredOnCreate(payload) {
  const requiredFields = ['nameCn', 'address', 'city', 'star', 'type', 'openTime']
  for (const f of requiredFields) {
    if (!payload[f] && payload[f] !== 0) {
      throw new AppError({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Missing required field',
        details: { field: f },
      })
    }
  }

  if (payload.star === null || payload.star < 1 || payload.star > 5) {
    throw new AppError({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Invalid star',
      details: { field: 'star' },
    })
  }

  if (!Array.isArray(payload.images) || payload.images.length === 0) {
    throw new AppError({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Missing images',
      details: { field: 'images' },
    })
  }

  const hasRoomTypes = Array.isArray(payload.roomTypes) && payload.roomTypes.length > 0
  const minPrice = payload.minPrice
  if (!hasRoomTypes && (minPrice === null || minPrice === undefined || minPrice < 0)) {
    throw new AppError({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Missing minPrice or roomTypes',
      details: { field: 'minPrice' },
    })
  }
}

function assertObjectId(id) {
  const normalized = normalizeString(id)
  if (!mongoose.Types.ObjectId.isValid(normalized)) {
    throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Hotel not found' })
  }
  return normalized
}

// GET /api/v1/merchant/hotels
// - 查询商户自己的酒店（分页 + 状态筛选）
router.get('/hotels', requireAuth, requireRole('merchant'), async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id
    const page = Math.max(1, parseNumber(req.query.page) || 1)
    const pageSize = Math.min(50, Math.max(1, parseNumber(req.query.pageSize) || 10))
    const auditStatus = normalizeString(req.query.auditStatus)
    const onlineStatus = normalizeString(req.query.onlineStatus)
    const keyword = normalizeString(req.query.keyword)

    const filter = { ownerId, deletedAt: null }
    if (auditStatus) filter.auditStatus = auditStatus
    if (onlineStatus) filter.onlineStatus = onlineStatus

    if (keyword) {
      const safe = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(safe, 'i')
      filter.$or = [{ nameCn: re }, { nameEn: re }, { address: re }]
    }

    const [total, hotels] = await Promise.all([
      Hotel.countDocuments(filter),
      Hotel.find(filter)
        .sort({ updatedAt: -1, _id: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ])

    res.json({
      list: hotels.map(toHotelManageItem),
      page,
      pageSize,
      total,
    })
  } catch (e) {
    next(e)
  }
})

router.get('/stats', requireAuth, requireRole('merchant'), async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id
    const total = await Hotel.countDocuments({ ownerId, deletedAt: null })
    res.json({ total })
  } catch (e) {
    next(e)
  }
})

// GET /api/v1/merchant/hotels/:id
// - 查询商户自己的某个酒店（草稿/待审核/已拒绝等也可见）
router.get('/hotels/:id', requireAuth, requireRole('merchant'), async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id
    const id = assertObjectId(req.params.id)

    const hotel = await Hotel.findOne({ _id: id, deletedAt: null })
    if (!hotel) {
      throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Hotel not found' })
    }
    if (String(hotel.ownerId || '') !== String(ownerId || '')) {
      throw new AppError({ status: 403, code: 'FORBIDDEN', message: 'Permission denied' })
    }

    res.json({ hotel: toHotelManageItem(hotel.toObject()) })
  } catch (e) {
    next(e)
  }
})

// POST /api/v1/merchant/hotels
// - 新建酒店（默认 draft + offline）
router.post('/hotels', requireAuth, requireRole('merchant'), async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id
    const updates = pickUpdatableFields(req.body)

    const payload = {
      ownerId,
      auditStatus: 'draft',
      onlineStatus: 'offline',
      rejectReason: null,
      deletedAt: null,
      ...updates,
    }

    assertRequiredOnCreate(payload)

    const hotel = await Hotel.create(payload)
    res.status(201).json({ hotel: toHotelManageItem(hotel.toObject ? hotel.toObject() : hotel) })
  } catch (e) {
    next(e)
  }
})

// PUT /api/v1/merchant/hotels/:id
// - 编辑酒店（仅 owner 可改；仅 draft/rejected 可编辑）
router.put('/hotels/:id', requireAuth, requireRole('merchant'), async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id
    const id = assertObjectId(req.params.id)
    const updates = pickUpdatableFields(req.body)

    const hotel = await Hotel.findOne({ _id: id, deletedAt: null })
    if (!hotel) {
      throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Hotel not found' })
    }
    if (String(hotel.ownerId || '') !== String(ownerId || '')) {
      throw new AppError({ status: 403, code: 'FORBIDDEN', message: 'Permission denied' })
    }

    if (hotel.auditStatus === 'approved' && hotel.onlineStatus === 'online') {
      if (!updates || Object.keys(updates).length === 0) {
        throw new AppError({
          status: 422,
          code: 'VALIDATION_ERROR',
          message: 'No updates provided',
        })
      }
      hotel.updatePayload = updates
      hotel.updateStatus = 'draft'
      hotel.updateRejectReason = null
      await hotel.save()
      res.json({ hotel: toHotelManageItem(hotel.toObject()) })
      return
    }

    if (!['draft', 'rejected', 'pending'].includes(hotel.auditStatus)) {
      throw new AppError({
        status: 409,
        code: 'INVALID_STATE',
        message: 'Hotel cannot be edited in current state',
        details: { auditStatus: hotel.auditStatus },
      })
    }

    const shouldResetAudit = hotel.auditStatus === 'pending'

    for (const [k, v] of Object.entries(updates)) {
      if (v === null) continue
      hotel[k] = v
    }

    if (shouldResetAudit) {
      hotel.auditStatus = 'draft'
      hotel.rejectReason = null
      hotel.onlineStatus = 'offline'
    }

    await hotel.save()
    res.json({ hotel: toHotelManageItem(hotel.toObject()) })
  } catch (e) {
    next(e)
  }
})

// POST /api/v1/merchant/hotels/:id/offline
// - approved + online -> offline（商户自主下线）
router.post('/hotels/:id/offline', requireAuth, requireRole('merchant'), async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id
    const id = assertObjectId(req.params.id)

    const hotel = await Hotel.findOne({ _id: id, deletedAt: null })
    if (!hotel) {
      throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Hotel not found' })
    }
    if (String(hotel.ownerId || '') !== String(ownerId || '')) {
      throw new AppError({ status: 403, code: 'FORBIDDEN', message: 'Permission denied' })
    }

    if (hotel.auditStatus !== 'approved' || hotel.onlineStatus !== 'online') {
      throw new AppError({
        status: 409,
        code: 'INVALID_STATE',
        message: 'Hotel cannot be offlined in current state',
        details: { auditStatus: hotel.auditStatus, onlineStatus: hotel.onlineStatus },
      })
    }

    hotel.onlineStatus = 'offline'
    await hotel.save()
    res.json({ hotel: toHotelManageItem(hotel.toObject()) })
  } catch (e) {
    next(e)
  }
})

// POST /api/v1/merchant/hotels/:id/submit
// - 提交审核（draft/rejected -> pending）
router.post('/hotels/:id/submit', requireAuth, requireRole('merchant'), async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id
    const id = assertObjectId(req.params.id)

    const hotel = await Hotel.findOne({ _id: id, deletedAt: null })
    if (!hotel) {
      throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Hotel not found' })
    }
    if (String(hotel.ownerId || '') !== String(ownerId || '')) {
      throw new AppError({ status: 403, code: 'FORBIDDEN', message: 'Permission denied' })
    }

    if (['draft', 'rejected'].includes(hotel.auditStatus)) {
      hotel.auditStatus = 'pending'
      hotel.rejectReason = null
      hotel.onlineStatus = 'offline'
      await hotel.save()
      res.json({ hotel: toHotelManageItem(hotel.toObject()) })
      return
    }

    if (hotel.auditStatus === 'approved' && hotel.onlineStatus === 'offline') {
      hotel.auditStatus = 'pending'
      hotel.rejectReason = null
      await hotel.save()
      res.json({ hotel: toHotelManageItem(hotel.toObject()) })
      return
    }

    if (hotel.auditStatus === 'approved' && hotel.onlineStatus === 'online') {
      const payload = hotel.updatePayload || {}
      if (!payload || Object.keys(payload).length === 0) {
        throw new AppError({
          status: 422,
          code: 'VALIDATION_ERROR',
          message: 'No updates to submit',
        })
      }
      if (!['draft', 'rejected'].includes(hotel.updateStatus)) {
        throw new AppError({
          status: 409,
          code: 'INVALID_STATE',
          message: 'Update cannot be submitted in current state',
          details: { updateStatus: hotel.updateStatus },
        })
      }
      hotel.updateStatus = 'pending'
      hotel.updateRejectReason = null
      await hotel.save()
      res.json({ hotel: toHotelManageItem(hotel.toObject()) })
      return
    }

    throw new AppError({
      status: 409,
      code: 'INVALID_STATE',
      message: 'Hotel cannot be submitted in current state',
      details: { auditStatus: hotel.auditStatus, onlineStatus: hotel.onlineStatus },
    })
  } catch (e) {
    next(e)
  }
})

module.exports = { merchantRouter: router }
