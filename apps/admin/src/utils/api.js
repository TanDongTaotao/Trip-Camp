import axios from 'axios'
import { getToken, clearAuth } from './auth'

/*
  请求封装（Axios 实例）：
  - 统一 baseURL：对齐后端 server 的 API 前缀 /api/v1
  - 请求拦截器：自动注入 Authorization: Bearer <token>
  - 响应拦截器：统一返回 response.data，集中处理 401（清 token 并跳登录）

  说明：管理端不在本地实现任何“后端接口逻辑”，所有数据来源均来自 server。
*/

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // 后端API基础路径
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：自动携带 token
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
    // 统一“拆壳”：页面层直接拿到后端 JSON（例如 { token, user } / { user }）
    return response.data
  },
  error => {
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      if (status === 401) {
        // 未授权，需要重新登录
        console.error('未授权，请重新登录')
        // 清除 token / user（避免继续携带过期凭证）
        clearAuth()
        // 跳转到登录页（这里用 location，避免依赖 React Router 上下文）
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

// 导出 api 实例：供页面/组件调用
export default api
