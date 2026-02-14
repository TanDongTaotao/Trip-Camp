// API 路由聚合：
// - 所有模块路由都在这里统一挂载
// - app.js 会把它挂载到 /api/v1
const express = require('express')
const { authRouter } = require('./auth')
const { hotelsRouter } = require('./hotels')

const router = express.Router()

// 认证相关：/api/v1/auth/*
router.use('/auth', authRouter)

// 用户端酒店查询：/api/v1/hotels*
router.use('/hotels', hotelsRouter)

module.exports = { apiRouter: router }
