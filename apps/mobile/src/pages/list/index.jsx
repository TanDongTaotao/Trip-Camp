import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'

export default function List() {
  return (
    <View className='index'>
      {/* 阶段 0 占位页：后续接酒店列表接口（GET /hotels） */}
      <Text>Hotel List Page</Text>
      <Button onClick={() => Taro.navigateTo({ url: '/pages/detail/index?id=1' })}>Go to Detail</Button>
    </View>
  )
}
