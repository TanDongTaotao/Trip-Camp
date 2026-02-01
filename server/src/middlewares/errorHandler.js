// 全局错误处理中间件：
// - 保证所有错误统一输出为 JSON
// - 前端只需要按 { code, message, details? } 处理即可
const { toErrorResponse } = require('../utils/errors')

function errorHandler(err, req, res, next) {
  const { status, body } = toErrorResponse(err)
  res.status(status).json(body)
}

module.exports = { errorHandler }
