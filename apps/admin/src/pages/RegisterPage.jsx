import { useState } from 'react'
import { Card, Form, Input, Button, message, Typography, Select } from 'antd'
import { LockOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { setToken, setUser } from '../utils/auth'

const { Title } = Typography
const { Option } = Select

const RegisterPage = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/register', values)
      const { token, user } = response
      
      // 存储token和用户信息
      setToken(token)
      setUser(user)
      
      message.success('注册成功')
      navigate('/')
    } catch (error) {
      message.error('注册失败：' + (error.response?.data?.message || error.message))
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
          <Title level={3}>Trip-Camp 管理后台注册</Title>
        </div>
        <Form
          name="register"
          initialValues={{ role: 'merchant' }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }, { min: 3, message: '用户名至少3个字符！' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }, { min: 6, message: '密码至少6个字符！' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item
            name="role"
            rules={[{ required: true, message: '请选择角色！' }]}
          >
            <Select prefix={<TeamOutlined />} placeholder="选择角色">
              <Option value="merchant">商户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%' }} 
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>
          <Form.Item>
            <div style={{ textAlign: 'center' }}>
              已有账号？ <Link to="/login">去登录</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default RegisterPage