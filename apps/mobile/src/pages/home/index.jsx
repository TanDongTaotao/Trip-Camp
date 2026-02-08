import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'

export default function Home() {
  const checkAuth = async () => {
    try {
      const res = await request({ url: '/auth/me' })
      if (res.user) {
        Taro.showToast({ title: `Hello ${res.user.username}` })
      } else {
        Taro.navigateTo({ url: '/pages/login/index' })
      }
    } catch (e) {
      Taro.navigateTo({ url: '/pages/login/index' })
    }
  }

  return (
    <View className='index'>
      <Text>Home Page (Search)</Text>
      <Button onClick={checkAuth}>Check Login</Button>
      <Button onClick={() => Taro.navigateTo({ url: '/pages/list/index' })}>Go to List</Button>
      <Button onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>Login</Button>
    </View>
  )
}
