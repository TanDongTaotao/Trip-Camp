const mongoose = require('mongoose')

// 房型子文档：内嵌在酒店文档中，避免额外集合联表
const roomTypeSchema = new mongoose.Schema(
  {
    // 房型名称
    name: { type: String, required: true, trim: true },
    // 房型价格（用于排序与最小价计算）
    price: { type: Number, required: true, min: 0 },
    // 房型图片（可选）
    images: { type: [String], default: [] },
    // 房型/设施标签（可选）
    amenities: { type: [String], default: [] },
  },
  { _id: false }
)

// 附近信息子文档（可选加分字段）
const nearbySchema = new mongoose.Schema(
  {
    // 周边景点
    scenic: { type: [String], default: [] },
    // 交通信息
    transport: { type: [String], default: [] },
    // 商场信息
    mall: { type: [String], default: [] },
  },
  { _id: false }
)

// 优惠/折扣子文档（可选加分字段）
const discountSchema = new mongoose.Schema(
  {
    // 标题（必填）
    title: { type: String, required: true, trim: true },
    // 描述（可选）
    desc: { type: String, trim: true },
  },
  { _id: false }
)

// 酒店主文档
const hotelSchema = new mongoose.Schema(
  {
    // 归属商户（便于商户只能操作自己的酒店）
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // 审核状态：商户提交 -> 管理员审核
    auditStatus: {
      type: String,
      required: true,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft',
    },
    // 上下线状态：管理员发布/下线
    onlineStatus: {
      type: String,
      required: true,
      enum: ['offline', 'online'],
      default: 'offline',
    },
    // 审核拒绝原因（仅 rejected 时有意义）
    rejectReason: { type: String, trim: true, default: null },
    updateStatus: {
      type: String,
      required: true,
      enum: ['none', 'draft', 'pending', 'rejected'],
      default: 'none',
    },
    updateRejectReason: { type: String, trim: true, default: null },
    updatePayload: { type: mongoose.Schema.Types.Mixed, default: null },
    // 软删除时间（可选加分，不做物理删除）
    deletedAt: { type: Date, default: null },

    // 基础信息（作业必做维度）
    nameCn: { type: String, required: true, trim: true },
    nameEn: { type: String, trim: true, default: '' },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    star: { type: Number, required: true, min: 1, max: 5 },
    type: { type: String, required: true, trim: true },
    minPrice: { type: Number, required: true, min: 0 },
    openTime: { type: String, required: true, trim: true },

    // 用户端展示字段
    coverImage: { type: String, trim: true, default: '' },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    bannerText: { type: String, trim: true, default: '' },
    roomTypes: { type: [roomTypeSchema], default: [] },
    nearby: { type: nearbySchema, default: () => ({}) },
    discounts: { type: [discountSchema], default: [] },
  },
  { timestamps: true }
)

// 保存前校验：当有房型时，强制 minPrice 等于房型最低价
//
// 注意：
// - Mongoose 的 required 校验发生在 validate 阶段
// - 如果只在 pre('save') 中赋值 minPrice，创建/更新时可能会先因为 minPrice 缺失而校验失败
// - 因此这里在 pre('validate') 中先把 minPrice 纠正，再进入 required/min 校验
function normalizeMinPrice(doc) {
  if (!Array.isArray(doc.roomTypes) || doc.roomTypes.length === 0) return
  const prices = doc.roomTypes
    .map((rt) => Number(rt && rt.price))
    .filter((p) => Number.isFinite(p))
  if (prices.length === 0) return
  doc.minPrice = Math.min(...prices)
}

hotelSchema.pre('validate', function preValidateNormalizeMinPrice(next) {
  normalizeMinPrice(this)
  next()
})

// 常用查询索引：提高列表筛选与商户查询性能
hotelSchema.index({ auditStatus: 1, onlineStatus: 1, deletedAt: 1 })
hotelSchema.index({ city: 1 })
hotelSchema.index({ minPrice: 1 })
hotelSchema.index({ star: -1 })
hotelSchema.index({ ownerId: 1 })
hotelSchema.index({ ownerId: 1, deletedAt: 1, updatedAt: -1 })
hotelSchema.index({ ownerId: 1, deletedAt: 1, auditStatus: 1, onlineStatus: 1 })

const Hotel = mongoose.model('Hotel', hotelSchema)

module.exports = { Hotel }
