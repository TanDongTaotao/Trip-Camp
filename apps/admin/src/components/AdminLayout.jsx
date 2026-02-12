import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, message } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { clearAuth, getUser } from '../utils/auth'

const { Header, Sider, Content } = Layout

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setUser(getUser())
  }, [])

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  const handleLogout = () => {
    clearAuth()
    message.success('登出成功')
    navigate('/login')
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
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              label: '仪表盘'
            },
            {
              key: '2',
              label: '酒店管理'
            },
            {
              key: '3',
              label: '用户管理'
            },
            {
              key: '4',
              label: '系统设置'
            }
          ]}
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
            <span>欢迎，{user?.username || '管理员'}</span>
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