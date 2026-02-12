import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, message } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined, LogoutOutlined, HomeOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { clearAuth, getUser } from '../utils/auth'
import api from '../utils/api'

/*
  后台基础布局（阶段 0/1）：
  - 布局：Sider（菜单）+ Header（用户信息/登出）+ Content（子路由 Outlet）
  - 登录态：
    1) 首屏优先从 localStorage 取 user（快速渲染）
    2) 再调用 GET /auth/me 校准用户信息与 role（联调后端）
  - 角色控制（阶段 1）：
    - 菜单根据 role 最小化展示（merchant 只见商户入口；admin 只见管理员入口）
    - 路由根据 role 做最小兜底重定向（避免手动输入 URL 越权访问）
*/
const { Header, Sider, Content } = Layout

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // 页面加载时，从localStorage获取用户信息
    const localUser = getUser()
    if (localUser) {
      setUser(localUser)
      generateMenuItems(localUser.role)
    }

    // 同时调用/auth/me接口获取最新的用户信息
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/auth/me')
        // 用后端返回的 user 覆盖本地缓存，保证 role 等信息准确
        setUser(response.user)
        generateMenuItems(response.user.role)
      } catch (error) {
        console.error('获取用户信息失败：', error)
        // 如果获取用户信息失败，可能是token过期，需要清除token并跳转到登录页
        if (error.response?.status === 401) {
          clearAuth()
          navigate('/login')
        }
      }
    }

    fetchUserInfo()
  }, [navigate])

  useEffect(() => {
    const role = user?.role
    if (!role) return

    const path = location.pathname
    const isMerchantOnlyPath = path.startsWith('/merchant')
    const isAdminOnlyPath = path.startsWith('/admin')

    // 角色越权兜底：防止用户手动输入 URL 访问不属于自己的页面
    if (role === 'merchant' && isAdminOnlyPath) {
      navigate('/merchant', { replace: true })
      return
    }

    if (role === 'admin' && isMerchantOnlyPath) {
      navigate('/admin', { replace: true })
      return
    }

    if (role !== 'merchant' && role !== 'admin' && (isMerchantOnlyPath || isAdminOnlyPath)) {
      navigate('/', { replace: true })
    }
  }, [location.pathname, navigate, user?.role])

  // 根据role生成菜单
  const generateMenuItems = (role) => {
    // 公共入口：所有登录用户都可见
    const baseItems = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: '仪表盘'
      }
    ]

    let roleItems = []

    // 商户：仅展示商户相关入口
    if (role === 'merchant') {
      roleItems = [
        {
          key: '/merchant',
          icon: <ShopOutlined />,
          label: '商户管理'
        }
      ]
      // 管理员：仅展示管理员相关入口
    } else if (role === 'admin') {
      roleItems = [
        {
          key: '/admin',
          icon: <TeamOutlined />,
          label: '管理员管理'
        }
      ]
    }

    const allItems = [...baseItems, ...roleItems]
    setMenuItems(allItems)
  }

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  const handleMenuClick = (e) => {
    navigate(e.key)
  }

  const handleLogout = () => {
    clearAuth()
    message.success('登出成功')
    navigate('/login')
  }

  // 获取当前路径作为默认选中的菜单项
  const getSelectedKey = () => {
    return location.pathname
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: '#001529' }}
      >
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 4 }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapse}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>欢迎，{user?.username || '管理员'} (role: {user?.role || '未知'})</span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              登出
            </Button>
          </div>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
