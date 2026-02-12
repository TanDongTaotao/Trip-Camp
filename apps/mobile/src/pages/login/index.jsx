import { useState } from 'react'
import { View, Button, Input, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import './index.scss'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // 登录处理函数
  const handleLogin = async () => {
    const u = (username || '').trim()
    const p = password || ''

    // 1. 简单的表单校验
    if (!u) {
      Taro.showToast({ title: '请输入用户名', icon: 'none' })
      return
    }
    if (!p) {
      Taro.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    try {
      // 2. 调用登录接口
      const res = await request({
        url: '/auth/login',
        method: 'POST',
        data: { username: u, password: p },
      })

      // 3. 登录成功处理
      if (res.token) {
        // 核心：将 Token 存入 Storage，供 request.js 自动读取
        Taro.setStorageSync('token', res.token)
        Taro.showToast({ title: 'Login Success' })

        // 延迟跳转回首页（Redirect 避免返回键回到登录页）
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/home/index' })
        }, 1000)
      } else {
        Taro.showToast({ title: res.message || 'Login Failed', icon: 'none' })
      }
    } catch (e) {
      // request.js 已统一处理 Toast，这里仅做兜底或额外逻辑
      console.error('Login error:', e)
    }
  }

  return (
    <View className='login'>
      <Text className='title'>Login</Text>
      <View className='form-item'>
        <Text>Username: </Text>
        <Input
          placeholder='Enter username'
          value={username}
          onInput={(e) => setUsername(e.detail.value)}
        />
      </View>
      <View className='form-item'>
        <Text>Password: </Text>
        <Input
          placeholder='Enter password'
          password
          value={password}
          onInput={(e) => setPassword(e.detail.value)}
        />
      </View>
      <Button className='btn' onClick={handleLogin}>Login</Button>
    </View>
  )
}
