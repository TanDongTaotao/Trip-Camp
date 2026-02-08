import { useState } from 'react'
import { View, Button, Input, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import './index.scss'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    try {
      const res = await request({
        url: '/auth/login',
        method: 'POST',
        data: { username, password }
      })
      if (res.token) {
        Taro.setStorageSync('token', res.token)
        Taro.showToast({ title: 'Login Success' })
        setTimeout(() => {
            Taro.navigateTo({ url: '/pages/home/index' })
        }, 1000)
      } else {
        Taro.showToast({ title: res.message || 'Login Failed', icon: 'none' })
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <View className='login'>
      <Text className='title'>Login</Text>
      <View className='form-item'>
        <Text>Username: </Text>
        <Input placeholder='Enter username' onInput={e => setUsername(e.detail.value)} />
      </View>
      <View className='form-item'>
        <Text>Password: </Text>
        <Input placeholder='Enter password' password onInput={e => setPassword(e.detail.value)} />
      </View>
      <Button className='btn' onClick={handleLogin}>Login</Button>
    </View>
  )
}
