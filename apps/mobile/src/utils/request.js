import Taro from '@tarojs/taro'

// API 基础地址：
// - H5：默认直连本机后端（http://localhost:3000/api/v1）
// - 小程序：默认直连本机后端（开发期），也可用 TARO_APP_API_BASE_URL 覆盖（真机联调时用局域网 IP）
const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1'

const API_BASE_URL =
  // H5 构建时注入的环境变量（有些构建环境没有 process，所以要做保护）
  (typeof process !== 'undefined' && process?.env?.TARO_APP_API_BASE_URL) ||
  // 运行时全局变量（可选：有些部署会用 window/globalThis 注入）
  (typeof globalThis !== 'undefined' && globalThis?.TARO_APP_API_BASE_URL) ||
  DEFAULT_API_BASE_URL

function normalizePath(path) {
  if (!path) return '/'
  if (path.startsWith('/')) return path
  return `/${path}`
}

// 统一请求封装：
// - 自动携带 token（Authorization: Bearer <token>）
// - 统一处理非 2xx 状态码（弹 Toast + 抛错）
export const request = async (options) => {
  const { url, method = 'GET', data, header = {}, timeout = 15000 } = options || {}
  const token = Taro.getStorageSync('token')

  const finalHeader = {
    'Content-Type': 'application/json',
    ...header,
  }

  if (token && !finalHeader.Authorization) {
    finalHeader.Authorization = `Bearer ${token}`
  }

  try {
    const res = await Taro.request({
      url: API_BASE_URL + normalizePath(url),
      method,
      data,
      timeout,
      header: finalHeader,
    })

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data
    }

    const message =
      (res.data && (res.data.message || res.data.error)) || `HTTP ${res.statusCode}`
    Taro.showToast({ title: message, icon: 'none' })
    const error = new Error(message)
    error.statusCode = res.statusCode
    error.data = res.data
    throw error
  } catch (err) {
    const message = err && err.message ? err.message : 'Request Failed'
    Taro.showToast({ title: message, icon: 'none' })
    throw err
  }
}
