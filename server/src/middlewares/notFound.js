// 404 中间件：当请求未匹配到任何路由时触发
const { AppError } = require('../utils/errors')

function notFound(req, res, next) {
  next(
    new AppError({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Route not found',
    })
  )
}

module.exports = { notFound }
