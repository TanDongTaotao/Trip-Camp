// 密码工具：
// - hashPassword：把明文密码转成哈希（入库用）
// - verifyPassword：校验明文密码与哈希是否匹配（登录用）
const bcrypt = require('bcryptjs')

async function hashPassword(password) {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}

module.exports = {
  hashPassword,
  verifyPassword,
}
