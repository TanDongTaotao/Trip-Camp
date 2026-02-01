// JWT 工具：
// - signToken：签发 token（默认 7 天有效）
// - verifyToken：校验 token
const jwt = require('jsonwebtoken')
const { getRequiredEnv } = require('../config/env')

function signToken(payload, options) {
  const secret = getRequiredEnv('JWT_SECRET')
  return jwt.sign(payload, secret, { expiresIn: '7d', ...(options || {}) })
}

function verifyToken(token) {
  const secret = getRequiredEnv('JWT_SECRET')
  return jwt.verify(token, secret)
}

module.exports = {
  signToken,
  verifyToken,
}
