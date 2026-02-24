import Taro from '@tarojs/taro'

// API 基础地址：
// - H5：默认走同源 /api/v1（由 Nginx/DevServer 反代到后端）
// - 小程序：默认直连本机后端（开发期），也可用 TARO_APP_API_BASE_URL 覆盖（真机联调时用局域网 IP）
function getApiBaseUrl() {
  const injected =
    typeof globalThis !== 'undefined' ? globalThis?.TARO_APP_API_BASE_URL : ''

  const isLocalhost =
    typeof injected === 'string' &&
    (injected.includes('://localhost') || injected.includes('://127.0.0.1'))

  try {
    const env = Taro.getEnv()
    const isH5 = env === Taro.ENV_TYPE.WEB || env === Taro.ENV_TYPE.H5
    if (isH5) {
      if (injected && !isLocalhost) return injected
      return '/api/v1'
    }
  } catch (_) {
    if (injected && !isLocalhost) return injected
    return '/api/v1'
  }

  if (injected && !isLocalhost) return injected
  return 'http://localhost:3000/api/v1'
}

const API_BASE_URL = getApiBaseUrl()

function normalizePath(path) {
  if (!path) return '/'
  if (path.startsWith('/')) return path
  return `/${path}`
}

/**
 * 统一请求封装
 * @description
 * 1. 自动处理 BaseURL
 * 2. 统一错误处理 (Toast + Throw)
 */
export const request = async (options) => {
  const { url, method = 'GET', data, header = {}, timeout = 15000 } = options || {}

  const finalHeader = {
    'Content-Type': 'application/json',
    ...header,
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
