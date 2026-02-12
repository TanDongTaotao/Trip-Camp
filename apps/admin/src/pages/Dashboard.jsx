/*
  仪表盘页（阶段 0/1）：
  - 作为登录后的默认首页
  - 通过 GET /api/v1/auth/me 拉取最新用户信息（重点是 role）
  - 同时用 localStorage 的 user 做首屏兜底展示（减少白屏等待）
*/
import { Typography, Card, Row, Col, message, Spin } from 'antd'
import { useEffect, useState } from 'react'
import api from '../utils/api'
import { getUser } from '../utils/auth'

const { Title, Paragraph } = Typography

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

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
            <p>酒店总数：0</p>
            <p>待审核：0</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="操作快捷" variant="borderless">
            <p>快速添加酒店</p>
            <p>查看审核列表</p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
