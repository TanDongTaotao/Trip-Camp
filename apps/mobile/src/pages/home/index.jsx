import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import './index.scss'

export default function Home() {
  const [userInfo, setUserInfo] = useState(null)

  // 检查登录态
  // 调用 GET /auth/me 接口验证 Token 有效性
  const checkAuth = async () => {
    try {
      const res = await request({ url: '/auth/me' })
      if (res.user) {
        // Token 有效，更新用户信息并提示
        setUserInfo(res.user)
        Taro.showToast({ title: `Hello ${res.user.username}` })
      } else {
        // 虽然请求成功但无 user 数据（理论上 request 会抛错），安全起见登出
        handleLogout()
      }
    } catch (e) {
      // 捕获 401 Unauthorized 等错误
      // Token 无效或过期，提示用户并跳转登录
      Taro.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' })
      }, 1000)
    }
  }

  // 登出逻辑
  const handleLogout = () => {
    // 核心：清除 Storage 中的 Token
    Taro.removeStorageSync('token')
    setUserInfo(null)
    // 跳转回登录页
    Taro.navigateTo({ url: '/pages/login/index' })
  }

  // 每次显示页面时检查一下（可选，或者手动点击按钮检查）
  // useDidShow(() => {
  //   checkAuth()
  // })

  return (
    <View className='index'>
      <Text className='title'>Home Page</Text>

      <View className='user-info'>
        {userInfo ? (
          <View>
            <Text>Logged in as: {userInfo.username} ({userInfo.role})</Text>
            <Button className='btn-logout' onClick={handleLogout} type='warn' size='mini'>Logout</Button>
          </View>
        ) : (
          <Text>Not logged in</Text>
        )}
      </View>

      <Button className='btn' onClick={checkAuth} type='primary'>Check Login State (/auth/me)</Button>
      <Button className='btn' onClick={() => Taro.navigateTo({ url: '/pages/list/index' })}>Go to List</Button>
      {!userInfo && <Button className='btn' onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>Go to Login</Button>}
    </View>
  )
}
