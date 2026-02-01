// 登录校验中间件：
// - 从 Authorization: Bearer <token> 读取 token
// - 校验成功把 payload 放到 req.user
const { AppError } = require('../utils/errors')
const { verifyToken } = require('../utils/jwt')

function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return next(
      new AppError({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Token missing or invalid',
      })
    )
  }

  const token = header.slice('Bearer '.length).trim()
  try {
    const payload = verifyToken(token)
    // 约定：payload 至少包含 id 与 role
    req.user = payload
    return next()
  } catch (e) {
    return next(
      new AppError({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Token missing or invalid',
      })
    )
  }
}

module.exports = { requireAuth }
