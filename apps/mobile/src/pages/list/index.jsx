import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'

export default function List() {
  return (
    <View className='index'>
      <Text>Hotel List Page</Text>
      <Button onClick={() => Taro.navigateTo({ url: '/pages/detail/index?id=1' })}>Go to Detail</Button>
    </View>
  )
}
