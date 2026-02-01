// 角色校验中间件：
// - 用于限制某些接口只能由特定角色访问（merchant/admin）
const { AppError } = require('../utils/errors')

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles]

  return function roleMiddleware(req, res, next) {
    const role = req.user && req.user.role
    if (!role || !allowed.includes(role)) {
      return next(
        new AppError({
          status: 403,
          code: 'FORBIDDEN',
          message: 'Permission denied',
        })
      )
    }
    return next()
  }
}

module.exports = { requireRole }
