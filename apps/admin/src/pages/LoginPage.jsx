/*
  登录页（阶段 0/1）：
  - 调用 POST /api/v1/auth/login 获取 token 与 user
  - 将 token/user 持久化到 localStorage（用于刷新后恢复登录态）
  - 登录成功后跳转到 /
*/
import { useState } from 'react'
import { Card, Form, Input, Button, message, Typography } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { setToken, setUser } from '../utils/auth'

const { Title } = Typography

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      // 后端接口：POST /auth/login（不需要选择角色）
      const response = await api.post('/auth/login', values)
      const { token, user } = response

      // 存储token和用户信息
      setToken(token)
      setUser(user)

      message.success('登录成功')
      navigate('/')
    } catch (error) {
      // error.response 由 axios 注入；如果是 401，会被 api.js 的拦截器统一处理跳登录
      message.error('登录失败：' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Trip-Camp 管理后台登录</Title>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: '100%' }}
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
          <Form.Item>
            <div style={{ textAlign: 'center' }}>
              没有账号？ <Link to="/register">去注册</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
