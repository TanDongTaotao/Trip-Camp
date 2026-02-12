import axios from 'axios'
import { getToken, clearAuth } from './auth'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // 后端API基础路径
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：自动携带token
api.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      if (status === 401) {
        // 未授权，需要重新登录
        console.error('未授权，请重新登录')
        // 清除token
        clearAuth()
        // 跳转到登录页
        window.location.href = '/login'
      } else {
        // 其他错误
        console.error('请求错误:', data.message || '未知错误')
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误，请检查网络连接')
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  }
)

// 导出api实例
export default api