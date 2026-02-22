/*
  仪表盘页（阶段 0/1）：
  - 作为登录后的默认首页
  - 通过 GET /api/v1/auth/me 拉取最新用户信息（重点是 role）
  - 同时用 localStorage 的 user 做首屏兜底展示（减少白屏等待）
*/
import { Typography, Card, Row, Col, message, Spin, Button, Space } from 'antd'
import { useEffect, useState } from 'react'
import api from '../utils/api'
import { getUser } from '../utils/auth'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // 首先从localStorage获取用户信息
    const localUser = getUser()
    if (localUser) {
      setUserInfo(localUser)
    }

    // 调用GET /auth/me接口获取最新的用户信息
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/auth/me')
        setUserInfo(response.user)
      } catch (error) {
        // 401 会在 api.js 里统一处理跳转登录；这里提示主要用于非 401 的失败场景
        message.error('获取用户信息失败：' + (error.response?.data?.message || error.message))
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  useEffect(() => {
    const role = userInfo?.role
    if (!role) return
    const fetchStats = async () => {
      setStatsLoading(true)
      try {
        if (role === 'merchant') {
          const response = await api.get('/merchant/stats', { params: { t: Date.now() } })
          setStats(response)
          return
        }
        if (role === 'admin') {
          const response = await api.get('/admin/stats', { params: { t: Date.now() } })
          setStats(response)
          return
        }
        setStats(null)
      } catch (error) {
        message.error('获取统计数据失败：' + (error.response?.data?.message || error.message))
        setStats(null)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [userInfo?.role])

  const handleQuickAddHotel = () => {
    if (userInfo?.role === 'merchant') {
      navigate('/merchant/hotel/add')
      return
    }
    message.warning('当前角色无法录入酒店')
  }

  const handleViewAuditList = () => {
    if (userInfo?.role === 'admin') {
      navigate('/admin/audit')
      return
    }
    message.warning('当前角色无法查看审核列表')
  }

  return (
    <div>
      <Title level={2}>仪表盘</Title>
      <Row gutter={16}>
        <Col span={24}>
          <Card title="欢迎使用 Trip-Camp 管理后台" style={{ marginBottom: 24 }}>
            <Paragraph>
              这里是管理后台的仪表盘页面，您可以在这里查看系统的关键信息和统计数据。
            </Paragraph>
            <div style={{ marginTop: 16 }}>
              <h4>用户信息：</h4>
              {loading ? (
                <Spin size="small" />
              ) : userInfo ? (
                <div>
                  <p>用户名：{userInfo.username}</p>
                  <p>角色：{userInfo.role}</p>
                  <p>用户ID：{userInfo.id}</p>
                </div>
              ) : (
                <p>无法获取用户信息</p>
              )}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="系统状态" variant="borderless">
            <p>服务正常运行</p>
            <p>在线用户：0</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="数据统计" variant="borderless">
            {statsLoading ? (
              <Spin size="small" />
            ) : userInfo?.role === 'merchant' ? (
              <p>我的酒店总数：{typeof stats?.total === 'number' ? stats.total : 0}</p>
            ) : userInfo?.role === 'admin' ? (
              <>
                <p>已上线酒店数：{typeof stats?.onlineCount === 'number' ? stats.onlineCount : 0}</p>
                <p>待上线酒店数：{typeof stats?.offlineCount === 'number' ? stats.offlineCount : 0}</p>
                <p>待审核数：{typeof stats?.pendingCount === 'number' ? stats.pendingCount : 0}</p>
              </>
            ) : (
              <Paragraph type="secondary">暂无可用统计数据</Paragraph>
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="操作快捷" variant="borderless">
            {userInfo?.role === 'merchant' ? (
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Button type="primary" onClick={handleQuickAddHotel}>
                  快速添加酒店
                </Button>
              </Space>
            ) : userInfo?.role === 'admin' ? (
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Button onClick={handleViewAuditList}>
                  查看审核列表
                </Button>
              </Space>
            ) : (
              <Paragraph type="secondary">暂无可用快捷入口</Paragraph>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
