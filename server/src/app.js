// Express 应用组装文件：
// - 挂载通用中间件（CORS、JSON 解析）
// - 定义健康检查
// - 挂载业务路由（统一 /api/v1 前缀）
// - 统一 404 与错误处理
const express = require('express')
const cors = require('cors')
const { apiRouter } = require('./routes')
const { notFound } = require('./middlewares/notFound')
const { errorHandler } = require('./middlewares/errorHandler')

function createApp() {
  const app = express()

  // 允许跨域：前端（H5/小程序/后台）在开发环境调用本地后端需要它
  app.use(cors())
  // 解析 JSON 请求体
  app.use(express.json({ limit: '1mb' }))

  // 健康检查：用来快速判断服务是否启动成功
  app.get('/health', (req, res) => {
    res.json({ ok: true })
  })

  // 统一 API 前缀：保持接口结构一致，避免前后端路径混乱
  app.use('/api/v1', apiRouter)

  // 未匹配到路由 -> 404
  app.use(notFound)
  // 统一错误输出 JSON
  app.use(errorHandler)

  return app
}

module.exports = { createApp }
