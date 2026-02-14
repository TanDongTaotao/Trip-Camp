# 成员c 阶段二说明文档

## 项目概述

本项目是Trip-Camp项目的管理端（PC后台）部分，由成员C负责开发。在阶段2中，我们完成了以下任务：

1. 保持管理端阶段1能稳定运行（登录/注册/me/角色菜单不回归）
2. 在商户页/管理员页补充阶段3的入口占位信息（纯 UI 占位即可）
3. 实现可选加分项：在管理端增加"酒店列表/详情预览"只读页面，用于快速验证后端 hotels 接口

## 技术栈

- React 18
- Ant Design 5
- React Router 6
- Axios

## 目录结构

```
Trip-Camp/
  apps/
    admin/
      src/
        components/
          AdminLayout.jsx    # 后台基础布局（修改）
        pages/
          MerchantPage.jsx   # 商户管理页面（修改）
          AdminPage.jsx      # 管理员管理页面（修改）
          HotelListPage.jsx  # 酒店列表预览页面（新增）
          HotelDetailPage.jsx # 酒店详情预览页面（新增）
        App.jsx             # 应用主组件（修改）
```

## 核心功能实现

### 1. 商户管理页面（MerchantPage.jsx）

#### 功能说明
- 作为 merchant 角色的功能入口占位
- 阶段 2：添加酒店录入/编辑/提交审核入口占位
- 阶段 3：实现具体业务逻辑

#### 关键代码

```javascript
/*
  商户占位页（阶段 0/1/2）：
  - 作为 merchant 角色的功能入口占位
  - 阶段 2：添加酒店录入/编辑/提交审核入口占位
  - 阶段 3：实现具体业务逻辑
*/
import { Typography, Card, Button, Space } from 'antd'
import { PlusOutlined, EditOutlined, CheckOutlined, TableOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const MerchantPage = () => {
  return (
    <div>
      <Title level={2}>商户管理页面</Title>
      
      {/* 阶段 3 入口占位 */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>酒店管理（阶段 3 功能入口）</Title>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size="middle">
            <Button type="primary" icon={<PlusOutlined />} size="large" style={{ width: 200 }}>
              酒店录入
            </Button>
            <Button icon={<EditOutlined />} size="large" style={{ width: 200 }}>
              酒店编辑
            </Button>
            <Button icon={<CheckOutlined />} size="large" style={{ width: 200 }}>
              提交审核
            </Button>
          </Space>
          
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>酒店列表（阶段 3）</Title>
            <Paragraph>
              这里将显示商户已录入的酒店列表，包括酒店名称、状态、操作等信息。
            </Paragraph>
            <Button icon={<TableOutlined />}>
              查看酒店列表
            </Button>
          </Card>
        </Space>
      </Card>
      
      {/* 页面说明 */}
      <Card>
        <Paragraph>
          这里是商户管理页面的占位内容。
        </Paragraph>
        <Paragraph>
          商户可以在这里进行酒店信息的录入、编辑、提交审核等操作。
        </Paragraph>
        <Paragraph>
          阶段 3 将实现具体功能。
        </Paragraph>
      </Card>
    </div>
  )
}

export default MerchantPage
```

### 2. 管理员管理页面（AdminPage.jsx）

#### 功能说明
- 作为 admin 角色的功能入口占位
- 阶段 2：添加审核/发布/下线列表入口占位
- 阶段 3：实现具体业务逻辑

#### 关键代码

```javascript
/*
  管理员占位页（阶段 0/1/2）：
  - 作为 admin 角色的功能入口占位
  - 阶段 2：添加审核/发布/下线列表入口占位
  - 阶段 3：实现具体业务逻辑
*/
import { Typography, Card, Button, Space } from 'antd'
import { CheckCircleOutlined, PublishOutlined, CloseCircleOutlined, TableOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const AdminPage = () => {
  return (
    <div>
      <Title level={2}>管理员管理页面</Title>
      
      {/* 阶段 3 入口占位 */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>酒店审核管理（阶段 3 功能入口）</Title>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size="middle">
            <Button type="primary" icon={<CheckCircleOutlined />} size="large" style={{ width: 200 }}>
              审核酒店
            </Button>
            <Button icon={<PublishOutlined />} size="large" style={{ width: 200 }}>
              发布酒店
            </Button>
            <Button icon={<CloseCircleOutlined />} size="large" style={{ width: 200 }}>
              下线酒店
            </Button>
          </Space>
          
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>审核列表（阶段 3）</Title>
            <Paragraph>
              这里将显示待审核的酒店列表，包括酒店名称、提交时间、操作等信息。
            </Paragraph>
            <Button icon={<TableOutlined />}>
              查看审核列表
            </Button>
          </Card>
          
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>已发布列表（阶段 3）</Title>
            <Paragraph>
              这里将显示已发布的酒店列表，包括酒店名称、发布时间、操作等信息。
            </Paragraph>
            <Button icon={<TableOutlined />}>
              查看已发布列表
            </Button>
          </Card>
        </Space>
      </Card>
      
      {/* 页面说明 */}
      <Card>
        <Paragraph>
          这里是管理员管理页面的占位内容。
        </Paragraph>
        <Paragraph>
          管理员可以在这里进行酒店信息的审核、发布、下线等操作。
        </Paragraph>
        <Paragraph>
          阶段 3 将实现具体功能。
        </Paragraph>
      </Card>
    </div>
  )
}

export default AdminPage
```

### 3. 酒店列表预览页面（HotelListPage.jsx）

#### 功能说明
- 酒店列表预览页面（阶段 2 可选加分项）
- 作为管理端的酒店列表预览功能
- 只读页面，用于快速验证后端 hotels 接口
- 不做写操作，只展示酒店列表数据

#### 关键代码

```javascript
/*
  酒店列表预览页面（阶段 2 可选加分项）：
  - 作为管理端的酒店列表预览功能
  - 只读页面，用于快速验证后端 hotels 接口
  - 不做写操作，只展示酒店列表数据
*/
import { useState, useEffect } from 'react'
import { Typography, Card, Table, message, Button, Space } from 'antd'
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const { Title, Paragraph } = Typography

const HotelListPage = () => {
  // 加载状态
  const [loading, setLoading] = useState(false)
  // 酒店列表数据
  const [hotels, setHotels] = useState([])
  // 导航实例
  const navigate = useNavigate()

  // 获取酒店列表
  const fetchHotels = async () => {
    setLoading(true)
    try {
      const response = await api.get('/hotels')
      setHotels(response.data || response)
      message.success('获取酒店列表成功')
    } catch (error) {
      message.error('获取酒店列表失败：' + (error.response?.data?.message || error.message))
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取酒店列表
  useEffect(() => {
    fetchHotels()
  }, [])

  // 查看酒店详情
  const handleViewDetail = (hotel) => {
    navigate(`/hotel/detail/${hotel.id}`)
  }

  // 表格列配置
  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price}/晚`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: '待审核',
          published: '已发布',
          offline: '已下线',
        }
        return statusMap[status] || status
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>酒店列表预览</Title>
      
      {/* 页面说明 */}
      <Card style={{ marginBottom: 24 }}>
        <Paragraph>
          这是酒店列表预览页面，用于快速验证后端 hotels 接口。
        </Paragraph>
        <Paragraph>
          本页面为只读页面，不做写操作，只展示酒店列表数据。
        </Paragraph>
      </Card>
      
      {/* 操作栏 */}
      <Space style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={fetchHotels}
          loading={loading}
        >
          刷新列表
        </Button>
      </Space>
      
      {/* 酒店列表 */}
      <Card>
        <Table 
          dataSource={hotels} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>
    </div>
  )
}

export default HotelListPage
```

### 4. 酒店详情预览页面（HotelDetailPage.jsx）

#### 功能说明
- 酒店详情预览页面（阶段 2 可选加分项）
- 作为管理端的酒店详情预览功能
- 只读页面，用于快速验证后端 hotels 接口
- 不做写操作，只展示酒店详情数据

#### 关键代码

```javascript
/*
  酒店详情预览页面（阶段 2 可选加分项）：
  - 作为管理端的酒店详情预览功能
  - 只读页面，用于快速验证后端 hotels 接口
  - 不做写操作，只展示酒店详情数据
*/
import { useState, useEffect } from 'react'
import { Typography, Card, message, Button, Descriptions, Image } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'

const { Title, Paragraph } = Typography

const HotelDetailPage = () => {
  // 加载状态
  const [loading, setLoading] = useState(false)
  // 酒店详情数据
  const [hotel, setHotel] = useState(null)
  // 导航实例
  const navigate = useNavigate()
  // 路由参数（酒店ID）
  const { id } = useParams()

  // 获取酒店详情
  const fetchHotelDetail = async () => {
    if (!id) return
    
    setLoading(true)
    try {
      const response = await api.get(`/hotels/${id}`)
      setHotel(response.data || response)
      message.success('获取酒店详情成功')
    } catch (error) {
      message.error('获取酒店详情失败：' + (error.response?.data?.message || error.message))
      setHotel(null)
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取酒店详情
  useEffect(() => {
    fetchHotelDetail()
  }, [id])

  // 返回酒店列表
  const handleBack = () => {
    navigate('/hotel/list')
  }

  if (loading) {
    return (
      <div>
        <Title level={2}>酒店详情预览</Title>
        <Card>
          <Paragraph>加载中...</Paragraph>
        </Card>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div>
        <Title level={2}>酒店详情预览</Title>
        <Card>
          <Paragraph>酒店不存在或获取失败</Paragraph>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回列表
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Title level={2}>酒店详情预览</Title>
      
      {/* 操作栏 */}
      <Button 
        style={{ marginBottom: 24 }} 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBack}
      >
        返回列表
      </Button>
      
      {/* 酒店基本信息 */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>{hotel.name}</Title>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="地址">{hotel.address}</Descriptions.Item>
          <Descriptions.Item label="价格">¥{hotel.price}/晚</Descriptions.Item>
          <Descriptions.Item label="状态">
            {{
              pending: '待审核',
              published: '已发布',
              offline: '已下线',
            }[hotel.status] || hotel.status}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {hotel.createdAt ? new Date(hotel.createdAt).toLocaleString() : '未知'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {hotel.updatedAt ? new Date(hotel.updatedAt).toLocaleString() : '未知'}
          </Descriptions.Item>
          <Descriptions.Item label="商户ID">{hotel.merchantId}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      {/* 酒店图片 */}
      {hotel.images && hotel.images.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>酒店图片</Title>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {hotel.images.map((image, index) => (
              <Image 
                key={index} 
                src={image} 
                alt={`${hotel.name} - 图片 ${index + 1}`} 
                width={200} 
              />
            ))}
          </div>
        </Card>
      )}
      
      {/* 酒店描述 */}
      {hotel.description && (
        <Card>
          <Title level={4}>酒店描述</Title>
          <Paragraph>{hotel.description}</Paragraph>
        </Card>
      )}
    </div>
  )
}

export default HotelDetailPage
```

### 5. 应用主组件（App.jsx）

#### 功能说明
- 管理端路由入口
- 阶段 2：添加酒店列表/详情预览页面路由

#### 关键代码

```javascript
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
import HotelListPage from './pages/HotelListPage'  // 新增：酒店列表预览页面
import HotelDetailPage from './pages/HotelDetailPage'  // 新增：酒店详情预览页面
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
            <Route path="hotel/list" element={<HotelListPage />} />  {/* 新增：酒店列表预览页面路由 */}
            <Route path="hotel/detail/:id" element={<HotelDetailPage />} />  {/* 新增：酒店详情预览页面路由 */}
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
```

### 6. 后台基础布局（AdminLayout.jsx）

#### 功能说明
- 后台基础布局
- 阶段 2：添加酒店列表预览菜单项

#### 关键代码

```javascript
/*
  后台基础布局（阶段 0/1/2）：
  - 布局：Sider（菜单）+ Header（用户信息/登出）+ Content（子路由 Outlet）
  - 阶段 1：基于 role 控制菜单（merchant 仅见商户入口；admin 仅见管理员入口）
  - 阶段 2：添加酒店列表预览菜单项（所有角色可见）
*/
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, message } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined, LogoutOutlined, HomeOutlined, ShopOutlined, TeamOutlined, TableOutlined } from '@ant-design/icons'  // 新增：TableOutlined 图标
import { useState, useEffect } from 'react'
import { clearAuth, getUser } from '../utils/auth'
import api from '../utils/api'

const { Header, Sider, Content } = Layout

const AdminLayout = () => {
  // 侧边栏折叠状态
  const [collapsed, setCollapsed] = useState(false)
  // 用户信息
  const [user, setUser] = useState(null)
  // 菜单项
  const [menuItems, setMenuItems] = useState([])
  // 导航实例
  const navigate = useNavigate()
  // 路由位置
  const location = useLocation()

  // 页面加载时获取用户信息
  useEffect(() => {
    // 从localStorage获取用户信息
    const localUser = getUser()
    if (localUser) {
      setUser(localUser)
      generateMenuItems(localUser.role)
    }
    
    // 调用/auth/me接口获取最新的用户信息
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

  // 路由变化时，检查角色权限
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
      },
      {
        key: '/hotel/list',  // 新增：酒店列表预览菜单项
        icon: <TableOutlined />,
        label: '酒店列表预览'
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

    // 合并菜单
    const allItems = [...baseItems, ...roleItems]
    setMenuItems(allItems)
  }

  // 切换侧边栏折叠状态
  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  // 菜单点击处理
  const handleMenuClick = (e) => {
    navigate(e.key)
  }

  // 登出处理
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
      {/* 侧边栏 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{ background: '#001529' }}
      >
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 4 }} />
        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      {/* 主内容区 */}
      <Layout>
        {/* 顶部导航 */}
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
          {/* 侧边栏折叠按钮 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapse}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          {/* 用户信息和登出按钮 */}
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
        {/* 内容区域 */}
        <Content style={{ margin: 24, padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
```

## 功能流程

### 1. 商户管理流程

1. 商户登录系统
2. 进入商户管理页面
3. 看到阶段3的功能入口占位：
   - 酒店录入
   - 酒店编辑
   - 提交审核
   - 酒店列表
4. 阶段3将实现具体功能

### 2. 管理员管理流程

1. 管理员登录系统
2. 进入管理员管理页面
3. 看到阶段3的功能入口占位：
   - 审核酒店
   - 发布酒店
   - 下线酒店
   - 审核列表
   - 已发布列表
4. 阶段3将实现具体功能

### 3. 酒店列表预览流程

1. 登录系统（任何角色）
2. 点击侧边栏的"酒店列表预览"菜单项
3. 进入酒店列表预览页面
4. 系统自动调用后端 `/hotels` 接口获取酒店列表
5. 展示酒店列表数据，包括酒店名称、地址、价格、状态等信息
6. 点击"查看详情"按钮，进入酒店详情预览页面
7. 系统调用后端 `/hotels/{id}` 接口获取酒店详情
8. 展示酒店详情数据

## 安全措施

1. **路由保护**：酒店列表/详情预览页面需要登录才能访问
2. **只读模式**：酒店列表/详情预览页面为只读模式，不做写操作
3. **错误处理**：添加了完善的错误处理，确保页面不会因为接口调用失败而崩溃
4. **加载状态**：添加了加载状态显示，提升用户体验

## 技术亮点

1. **模块化设计**：代码结构清晰，模块化程度高
2. **组件化开发**：使用 React 组件化开发，代码复用性强
3. **响应式布局**：使用 Ant Design 的响应式布局，适配不同屏幕尺寸
4. **状态管理**：使用 React useState 和 useEffect 进行状态管理
5. **API 调用**：使用封装的 api 工具函数进行接口调用
6. **路由管理**：使用 React Router 进行路由管理和导航
7. **用户体验**：添加了加载状态、错误处理、成功提示等，提升用户体验

## 总结

在阶段2中，我们成功完成了以下任务：

1. **保持阶段1稳定运行**：确保登录/注册/me/角色菜单功能正常工作
2. **添加阶段3入口占位**：在商户页和管理员页添加了阶段3的功能入口占位
3. **实现酒店预览页面**：创建了酒店列表和详情预览页面，用于快速验证后端接口

这些工作为阶段3的开发奠定了基础，阶段3将实现具体的业务逻辑，包括酒店录入/编辑/提交审核和酒店审核/发布/下线等功能。