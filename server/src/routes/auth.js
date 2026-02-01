// 认证模块路由：
// - POST /auth/register：注册（user/merchant；可选 admin）
// - POST /auth/login：登录
// - GET  /auth/me：获取当前登录用户信息
const express = require('express')
const { User } = require('../models/User')
const { AppError } = require('../utils/errors')
const { hashPassword, verifyPassword } = require('../utils/password')
const { signToken } = require('../utils/jwt')
const { requireAuth } = require('../middlewares/requireAuth')

const router = express.Router()

function toUserPublic(user) {
  // 对外只返回可公开字段，避免泄露敏感信息（如 passwordHash）
  return {
    id: String(user._id),
    username: user.username,
    role: user.role,
  }
}

router.post('/register', async (req, res, next) => {
  try {
    const { username, password, role } = req.body || {}

    const allowAdminRegisterRaw = String(process.env.ALLOW_ADMIN_REGISTER || '').toLowerCase()
    const allowAdminRegister = allowAdminRegisterRaw !== 'false'
    const allowedRoles = allowAdminRegister ? ['user', 'merchant', 'admin'] : ['user', 'merchant']

    // 基础参数校验：先保证后端行为稳定，再考虑复杂校验库
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      throw new AppError({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid username',
        details: { field: 'username' },
      })
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new AppError({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid password',
        details: { field: 'password' },
      })
    }
    if (!role || !allowedRoles.includes(role)) {
      throw new AppError({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid role',
        details: { field: 'role' },
      })
    }
    if (role === 'admin' && !allowAdminRegister) {
      throw new AppError({
        status: 403,
        code: 'FORBIDDEN',
        message: 'Admin register disabled',
      })
    }

    const normalizedUsername = username.trim()
    const existing = await User.findOne({ username: normalizedUsername }).lean()
    if (existing) {
      throw new AppError({
        status: 409,
        code: 'USERNAME_TAKEN',
        message: 'Username already exists',
      })
    }

    const passwordHash = await hashPassword(password)
    const user = await User.create({
      username: normalizedUsername,
      passwordHash,
      role,
    })

    // token 内只放最小必要字段（id/role），方便鉴权与角色判断
    const token = signToken({ id: String(user._id), role: user.role })
    res.json({ token, user: toUserPublic(user) })
  } catch (e) {
    next(e)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {}

    // 登录同样做基本校验（避免空值导致异常）
    if (!username || typeof username !== 'string') {
      throw new AppError({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid username',
        details: { field: 'username' },
      })
    }
    if (!password || typeof password !== 'string') {
      throw new AppError({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid password',
        details: { field: 'password' },
      })
    }

    const user = await User.findOne({ username: username.trim() })
    if (!user) {
      throw new AppError({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Username or password incorrect',
      })
    }

    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) {
      throw new AppError({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Username or password incorrect',
      })
    }

    const token = signToken({ id: String(user._id), role: user.role })
    res.json({ token, user: toUserPublic(user) })
  } catch (e) {
    next(e)
  }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    // requireAuth 会把 token payload 放到 req.user
    const userId = req.user && req.user.id
    if (!userId) {
      throw new AppError({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Token missing or invalid',
      })
    }
    const user = await User.findById(userId)
    if (!user) {
      throw new AppError({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Token missing or invalid',
      })
    }
    res.json({ user: toUserPublic(user) })
  } catch (e) {
    next(e)
  }
})

module.exports = { authRouter: router }
