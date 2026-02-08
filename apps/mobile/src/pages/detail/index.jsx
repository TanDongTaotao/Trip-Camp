import { View, Text } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'

export default function Detail() {
  const router = useRouter()
  return (
    <View className='index'>
      <Text>Hotel Detail Page. ID: {router.params.id}</Text>
    </View>
  )
}
