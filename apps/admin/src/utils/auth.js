// 登录状态管理工具

// 存储token到localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token)
}

// 从localStorage获取token
export const getToken = () => {
  return localStorage.getItem('token')
}

// 从localStorage移除token
export const removeToken = () => {
  localStorage.removeItem('token')
}

// 检查是否已登录
export const isAuthenticated = () => {
  return !!getToken()
}

// 存储用户信息到localStorage
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

// 从localStorage获取用户信息
export const getUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// 从localStorage移除用户信息
export const removeUser = () => {
  localStorage.removeItem('user')
}

// 清空所有认证信息
export const clearAuth = () => {
  removeToken()
  removeUser()
}