/*
  登录态存储工具：
  - 负责 token 与 user 的持久化（localStorage）
  - 给请求封装、路由守卫与布局组件复用

  约定存储 key：
  - token：后端 /auth/login 或 /auth/register 返回的 JWT
  - user：后端返回的公共用户信息（至少包含 id/username/role）
*/

// 存储 token 到 localStorage（刷新页面仍可取到）
export const setToken = (token) => {
  localStorage.setItem('token', token)
}

// 从 localStorage 读取 token（不存在时返回 null）
export const getToken = () => {
  return localStorage.getItem('token')
}

// 从 localStorage 移除 token（常用于退出登录/401 失效）
export const removeToken = () => {
  localStorage.removeItem('token')
}

// 是否已登录：只要本地存在 token，就认为处于“已登录”状态
export const isAuthenticated = () => {
  return !!getToken()
}

// 存储用户信息到 localStorage（用于首屏快速渲染 role/username）
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

// 从 localStorage 读取用户信息（不存在则返回 null）
export const getUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// 从 localStorage 移除用户信息
export const removeUser = () => {
  localStorage.removeItem('user')
}

// 清空所有认证信息：用于主动登出或被动失效（如 401）
export const clearAuth = () => {
  removeToken()
  removeUser()
}
