import { Navigate, Outlet, useEffect } from 'react-router-dom'
import { isAuthenticated, getUser } from '../utils/auth'

const PrivateRoute = () => {
  // 检查是否已登录
  const authenticated = isAuthenticated()
  
  return authenticated ? <Outlet /> : <Navigate to="/login" replace /> 
}

export default PrivateRoute