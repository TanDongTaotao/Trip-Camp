// 后端服务入口文件：
// 1) 读取 .env 环境变量
// 2) 连接 MongoDB
// 3) 创建并启动 Express 服务
const { loadEnv, getNumberEnv } = require('./config/env')
const { connectDb } = require('./db')
const { createApp } = require('./app')

async function main() {
  // 读取 server/.env，把变量写入 process.env
  loadEnv()

  // 端口默认 3000，可通过 .env 覆盖
  const port = getNumberEnv('PORT', 3000)

  // 连接数据库（失败会直接抛错并退出）
  await connectDb()

  const app = createApp()
  app.listen(port, () => {
    process.stdout.write(`Server listening on http://localhost:${port}\n`)
  })
}

main().catch((err) => {
  process.stderr.write(`${err && err.stack ? err.stack : String(err)}\n`)
  process.exit(1)
})
