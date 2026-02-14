/*
  管理端路由入口：
  - /login、/register：公开页面
  - 其余页面：被 PrivateRoute 保护（要求本地有 token）
  - 登录后进入 AdminLayout（后台基础布局：侧边栏 + 顶部 + 内容区）

  阶段 0：完成基础布局、登录页、最小登录态与请求封装
  阶段 1：补齐注册闭环、/auth/me 打通，并基于 role 做菜单/路由最小控制
  阶段 2：添加酒店列表/详情预览页面（可选加分项）
*/
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import MerchantPage from './pages/MerchantPage'
import AdminPage from './pages/AdminPage'
import HotelListPage from './pages/HotelListPage'
import HotelDetailPage from './pages/HotelDetailPage'
import PrivateRoute from './components/PrivateRoute'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* 公开路由：不需要 token */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 受保护路由：需要 token */}
        <Route element={<PrivateRoute />}>
          {/* 后台布局容器 */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="merchant" element={<MerchantPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="hotel/list" element={<HotelListPage />} />
            <Route path="hotel/detail/:id" element={<HotelDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>

        {/* 兜底：任何未知路径都回到登录页 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
