import { useState } from 'react'
import { View, Button, Input, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import './index.scss'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // 阶段 0：登录成功后把 token 写入本地存储，后续请求会自动带上 Authorization
  const handleLogin = async () => {
    const u = (username || '').trim()
    const p = password || ''
    if (!u) {
      Taro.showToast({ title: '请输入用户名', icon: 'none' })
      return
    }
    if (!p) {
      Taro.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    try {
      const res = await request({
        url: '/auth/login',
        method: 'POST',
        data: { username: u, password: p },
      })
      if (res.token) {
        Taro.setStorageSync('token', res.token)
        Taro.showToast({ title: 'Login Success' })
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/home/index' })
        }, 1000)
      } else {
        Taro.showToast({ title: res.message || 'Login Failed', icon: 'none' })
      }
    } catch (e) {
      Taro.showToast({ title: e?.message || 'Login Failed', icon: 'none' })
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
