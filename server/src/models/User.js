// 用户模型（User）：
// - username 唯一
// - passwordHash 存哈希，不存明文密码
// - role 用于权限控制（merchant/admin）
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['merchant', 'admin'],
    },
  },
  { timestamps: true }
)
const User = mongoose.model('User', userSchema)

module.exports = { User }
