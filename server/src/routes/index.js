// API 路由聚合：
// - 所有模块路由都在这里统一挂载
// - app.js 会把它挂载到 /api/v1
const express = require('express')
const { authRouter } = require('./auth')
const { hotelsRouter } = require('./hotels')
const { merchantRouter } = require('./merchant')
const { adminRouter } = require('./admin')
const citiesRouter = require('./cities')
const mapRouter = require('./map')

const router = express.Router()

// 认证相关：/api/v1/auth/*
router.use('/auth', authRouter)

// 用户端酒店查询：/api/v1/hotels*
router.use('/hotels', hotelsRouter)

// 商户端酒店管理：/api/v1/merchant/hotels*
router.use('/merchant', merchantRouter)

// 管理员端酒店管理：/api/v1/admin/hotels*
router.use('/admin', adminRouter)
router.use('/cities', citiesRouter)
router.use('/map', mapRouter)

module.exports = { apiRouter: router }
