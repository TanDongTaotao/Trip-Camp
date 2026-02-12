import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

/*
  路由守卫（最小登录态实现）：
  - 只判断本地是否存在 token（不在这里请求 /auth/me）
  - 401 失效的兜底由 api.js 的响应拦截器处理（会清 token 并跳登录）

  这样分层的好处：
  - PrivateRoute 保持纯粹：只做“是否放行”的同步判断
  - token 失效与错误处理集中在请求层（api.js），避免到处写重复逻辑
*/
const PrivateRoute = () => {
  // 检查是否已登录
  const authenticated = isAuthenticated()

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default PrivateRoute
