import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, message } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, LogoutOutlined, HomeOutlined, ShopOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { clearAuth, getUser } from '../utils/auth'
import api from '../utils/api'

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

  // 根据role生成菜单
  const generateMenuItems = (role) => {
    const baseItems = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: '仪表盘'
      }
    ]

    let roleItems = []

    if (role === 'merchant') {
      roleItems = [
        {
          key: '/merchant',
          icon: <ShopOutlined />,
          label: '商户管理'
        }
      ]
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