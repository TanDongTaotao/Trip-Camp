import { View, Text } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'

export default function Detail() {
  // 阶段 0 占位页：读取路由参数（例如 /pages/detail/index?id=1）
  const router = useRouter()
  return (
    <View className='index'>
      <Text>Hotel Detail Page. ID: {router.params.id}</Text>
    </View>
  )
}
