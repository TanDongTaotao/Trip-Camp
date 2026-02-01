// 环境变量读取与校验：
// - loadEnv()：从 server/.env 读取配置
// - getRequiredEnv()：缺少关键配置时立刻报错（避免隐性问题）
// - getNumberEnv()：读取数字配置（如 PORT）
const dotenv = require('dotenv')
const path = require('path')

function loadEnv() {
    // nodemon/npm 运行时 cwd 默认是 server/，因此这里读取 server/.env
    const envPath = path.join(process.cwd(), '.env')
    dotenv.config({ path: envPath })
}

function getRequiredEnv(name) {
    const value = process.env[name]
    if (!value) {
        const error = new Error(`Missing required env: ${name}`)
        error.code = 'ENV_MISSING'
        throw error
    }
    return value
}

function getNumberEnv(name, defaultValue) {
    const raw = process.env[name]
    if (!raw) return defaultValue
    const value = Number(raw)
    if (!Number.isFinite(value)) {
        const error = new Error(`Invalid number env: ${name}`)
        error.code = 'ENV_INVALID'
        throw error
    }
    return value
}

module.exports = {
    loadEnv,
    getRequiredEnv,
    getNumberEnv,
}

