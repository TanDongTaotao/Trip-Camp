// 认证模块路由（Auth）：
//
// 目标：
// - 提供 “注册 / 登录 / 获取当前用户” 三个最小闭环接口
// - 统一错误输出为 { code, message, details? }，便于前端统一处理
//
// 路由（挂载路径：/api/v1/auth）：
// - POST /register：注册（role=merchant/admin）
//   - 注意：是否允许注册 admin 由环境变量 ALLOW_ADMIN_REGISTER 控制
// - POST /login：登录（根据 username/password 校验）
// - GET  /me：获取当前登录用户（需要 Bearer Token）
const express = require('express')
const { User } = require('../models/User')
const { AppError } = require('../utils/errors')
const { hashPassword, verifyPassword } = require('../utils/password')
const { signToken } = require('../utils/jwt')
const { requireAuth } = require('../middlewares/requireAuth')

const router = express.Router()

function toUserPublic(user) {
  // 对外只返回可公开字段：
  // - 避免泄露敏感信息（如 passwordHash）
  // - 同时保持响应结构稳定，便于前端做角色判断与展示
  return {
    id: String(user._id),
    username: user.username,
    role: user.role,
  }
}

router.post('/register', async (req, res, next) => {
  try {
    // 1) 读取参数
    const { username, password, role } = req.body || {}

    // 2) admin 注册策略（更安全、也更符合训练营的默认行为）
    //
    // 推荐策略：
    // - 生产环境：默认禁止 admin 注册（除非显式开启）
    // - 开发/作业环境：默认允许 admin 注册（便于“注册页可选角色”的验收）
    //
    // 可通过环境变量显式覆盖：
    // - ALLOW_ADMIN_REGISTER=true  -> 强制允许
    // - ALLOW_ADMIN_REGISTER=false -> 强制禁止
    const allowAdminRegisterRaw = String(process.env.ALLOW_ADMIN_REGISTER || '').trim().toLowerCase()
    const allowAdminRegisterExplicit = allowAdminRegisterRaw.length > 0
    const allowAdminRegister =
      (allowAdminRegisterExplicit && ['true', '1', 'yes', 'y'].includes(allowAdminRegisterRaw)) ||
      (!allowAdminRegisterExplicit &&
        String(process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production')
    const allowedRoles = ['merchant', 'admin']

    // 3) 基础参数校验
    // - 先保证后端行为稳定，再考虑引入复杂校验库（如 zod/joi）
    const normalizedUsername = typeof username === 'string' ? username.trim() : ''
    if (!normalizedUsername || normalizedUsername.length < 3) {
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

    // 4) 唯一性检查：username 唯一
    const existing = await User.findOne({ username: normalizedUsername }).lean()
    if (existing) {
      throw new AppError({
        status: 409,
        code: 'USERNAME_TAKEN',
        message: 'Username already exists',
      })
    }

    // 5) 写入用户
    // - 密码仅保存哈希
    // - role 用于后续权限控制
    const passwordHash = await hashPassword(password)
    const user = await User.create({
      username: normalizedUsername,
      passwordHash,
      role,
    })

    // 6) 签发 token
    // - token 内只放最小必要字段（id/role），便于鉴权与角色判断
    // - username 等展示信息由 /me 返回，避免 token 体积膨胀
    const token = signToken({ id: String(user._id), role: user.role })
    res.json({ token, user: toUserPublic(user) })
  } catch (e) {
    next(e)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    // 1) 读取参数
    const { username, password } = req.body || {}

    // 2) 基础校验：避免空值导致异常
    const normalizedUsername = typeof username === 'string' ? username.trim() : ''
    if (!normalizedUsername) {
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

    // 3) 查用户并校验密码
    const user = await User.findOne({ username: normalizedUsername })
    if (!user) {
      throw new AppError({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Username or password incorrect',
      })
    }

    if (user.role === 'user') {
      throw new AppError({
        status: 403,
        code: 'FORBIDDEN',
        message: 'User role disabled',
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

    // 4) 登录成功签发 token
    const token = signToken({ id: String(user._id), role: user.role })
    res.json({ token, user: toUserPublic(user) })
  } catch (e) {
    next(e)
  }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    // requireAuth 会把 token payload 放到 req.user（至少包含 id/role）
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
    if (user.role === 'user') {
      throw new AppError({
        status: 403,
        code: 'FORBIDDEN',
        message: 'User role disabled',
      })
    }
    res.json({ user: toUserPublic(user) })
  } catch (e) {
    next(e)
  }
})

module.exports = { authRouter: router }
