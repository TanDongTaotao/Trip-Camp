// 管理员端接口（admin）：
// - 提供酒店信息的审核/发布/下线/（可选）软删除
// - 路由挂载点：/api/v1/admin
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

function toAdminListItem(hotel) {
  const images = Array.isArray(hotel.images) ? hotel.images : []
  return {
    id: String(hotel._id),
    ownerId: hotel.ownerId ? String(hotel.ownerId) : null,
    auditStatus: hotel.auditStatus,
    onlineStatus: hotel.onlineStatus,
    rejectReason: hotel.rejectReason || null,
    nameCn: hotel.nameCn,
    address: hotel.address,
    city: hotel.city,
    star: hotel.star,
    type: hotel.type,
    minPrice: hotel.minPrice,
    tags: Array.isArray(hotel.tags) ? hotel.tags : [],
    coverImage: hotel.coverImage || images[0] || '',
    createdAt: hotel.createdAt,
    updatedAt: hotel.updatedAt,
  }
}

function assertObjectId(id) {
  const normalized = normalizeString(id)
  if (!mongoose.Types.ObjectId.isValid(normalized)) {
    throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Hotel not found' })
  }
  return normalized
}

// GET /api/v1/admin/hotels
// - 按 auditStatus/onlineStatus 筛选 + 分页
router.get('/hotels', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const page = Math.max(1, parseNumber(req.query.page) || 1)
    const pageSize = Math.min(50, Math.max(1, parseNumber(req.query.pageSize) || 10))
    const auditStatus = normalizeString(req.query.auditStatus)
    const onlineStatus = normalizeString(req.query.onlineStatus)
    const keyword = normalizeString(req.query.keyword)
    const ownerId = normalizeString(req.query.ownerId)

    const filter = { deletedAt: null }
    if (auditStatus) filter.auditStatus = auditStatus
    if (onlineStatus) filter.onlineStatus = onlineStatus
    if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) filter.ownerId = ownerId

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
      list: hotels.map(toAdminListItem),
      page,
      pageSize,
      total,
    })
  } catch (e) {
    next(e)
  }
})

// POST /api/v1/admin/hotels/:id/audit
// - approve/reject；reject 必填 rejectReason
router.post('/hotels/:id/audit', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const id = assertObjectId(req.params.id)
    const action = normalizeString(req.body && req.body.action)
    const rejectReason = normalizeString(req.body && req.body.rejectReason)

    if (!['approve', 'reject'].includes(action)) {
      throw new AppError({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid action',
        details: { field: 'action' },
      })
    }

    if (action === 'reject' && !rejectReason) {
      throw new AppError({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Reject reason required',
        details: { field: 'rejectReason' },
      })
    }

    const hotel = await Hotel.findOne({ _id: id, deletedAt: null })
    if (!hotel) {
      throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Hotel not found' })
    }

    if (hotel.auditStatus !== 'pending') {
      throw new AppError({
        status: 409,
        code: 'INVALID_STATE',
        message: 'Hotel cannot be audited in current state',
        details: { auditStatus: hotel.auditStatus },
      })
    }

    if (action === 'approve') {
      hotel.auditStatus = 'approved'
      hotel.rejectReason = null
    } else {
      hotel.auditStatus = 'rejected'
      hotel.rejectReason = rejectReason
      hotel.onlineStatus = 'offline'
    }

    await hotel.save()
    res.json({ hotel: toAdminListItem(hotel.toObject()) })
  } catch (e) {
    next(e)
  }
})

// POST /api/v1/admin/hotels/:id/publish
// - approved + offline -> online
router.post('/hotels/:id/publish', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const id = assertObjectId(req.params.id)
    const hotel = await Hotel.findOne({ _id: id, deletedAt: null })
    if (!hotel) {
      throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Hotel not found' })
    }

    if (hotel.auditStatus !== 'approved' || hotel.onlineStatus !== 'offline') {
      throw new AppError({
        status: 409,
        code: 'INVALID_STATE',
        message: 'Hotel cannot be published in current state',
        details: { auditStatus: hotel.auditStatus, onlineStatus: hotel.onlineStatus },
      })
    }

    hotel.onlineStatus = 'online'
    await hotel.save()
    res.json({ hotel: toAdminListItem(hotel.toObject()) })
  } catch (e) {
    next(e)
  }
})

// POST /api/v1/admin/hotels/:id/offline
// - online -> offline（可再次 publish 恢复）
router.post('/hotels/:id/offline', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const id = assertObjectId(req.params.id)
    const hotel = await Hotel.findOne({ _id: id, deletedAt: null })
    if (!hotel) {
      throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Hotel not found' })
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
    res.json({ hotel: toAdminListItem(hotel.toObject()) })
  } catch (e) {
    next(e)
  }
})

// DELETE /api/v1/admin/hotels/:id
// - 软删除（可选加分）：仅 admin 可操作，用户端不可见
router.delete('/hotels/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const id = assertObjectId(req.params.id)
    const hotel = await Hotel.findOne({ _id: id, deletedAt: null })
    if (!hotel) {
      throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Hotel not found' })
    }

    hotel.deletedAt = new Date()
    hotel.onlineStatus = 'offline'
    await hotel.save()

    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

module.exports = { adminRouter: router }

