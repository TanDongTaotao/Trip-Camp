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

/**
 * 统一请求封装
 * @description
 * 1. 自动处理 BaseURL
 * 2. 自动携带 Token
 * 3. 统一错误处理 (Toast + Throw)
 */
export const request = async (options) => {
  const { url, method = 'GET', data, header = {}, timeout = 15000 } = options || {}

  // 从本地存储获取 Token
  const token = Taro.getStorageSync('token')

  const finalHeader = {
    'Content-Type': 'application/json',
    ...header,
  }

  // 如果存在 Token，自动注入 Authorization 头
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

    // 状态码 2xx 视为成功
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data
    }

    // 非 2xx 视为失败，统一处理
    const message =
      (res.data && (res.data.message || res.data.error)) || `HTTP ${res.statusCode}`
    Taro.showToast({ title: message, icon: 'none' })

    // 构造错误对象并抛出，便于调用方捕获
    const error = new Error(message)
    error.statusCode = res.statusCode
    error.data = res.data
    throw error
  } catch (err) {
    if (err && err.statusCode) {
      throw err
    }

    // 网络错误或其他异常
    const message = err && err.message ? err.message : 'Request Failed'
    Taro.showToast({ title: message, icon: 'none' })
    throw err
  }
}
