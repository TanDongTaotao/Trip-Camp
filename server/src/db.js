// 数据库连接模块（MongoDB Atlas / MongoDB）：
// - 只负责连接，不负责业务逻辑
const mongoose = require('mongoose')
const { getRequiredEnv } = require('./config/env')

async function connectDb() {
  const uri = getRequiredEnv('MONGODB_URI')
  if (uri.includes('<') || uri.includes('>')) {
    const error = new Error(
      'MONGODB_URI 仍包含尖括号 <>，请在 server/.env 中替换为真实用户名/密码（不要保留 <>）'
    )
    error.code = 'ENV_INVALID'
    throw error
  }

  // strictQuery=true：避免不明确的查询条件被静默放行
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)

  return mongoose.connection
}

module.exports = { connectDb }
