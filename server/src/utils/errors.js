// 统一错误结构：
// - AppError：用于业务主动抛错（带 status/code/details）
// - toErrorResponse：将错误转成统一 JSON 输出
class AppError extends Error {
  constructor({ status, code, message, details }) {
    super(message)
    this.status = status || 500
    this.code = code || 'INTERNAL_ERROR'
    this.details = details
  }
}

function toErrorResponse(err) {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    }
  }

  return {
    status: 500,
    body: {
      code: err && err.code ? String(err.code) : 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  }
}

module.exports = {
  AppError,
  toErrorResponse,
}
