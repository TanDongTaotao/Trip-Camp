import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Swiper, SwiperItem, Rate, Tag, Divider, Button, Skeleton } from '@nutui/nutui-react-taro'
import { Location, Share } from '@nutui/icons-react-taro'
import { request } from '../../utils/request'
import './index.scss'

export default function Detail() {
  const router = useRouter()
  const { id, checkIn, checkOut } = router.params
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  const calcNights = (startStr, endStr) => {
    if (!startStr || !endStr) return ''
    const start = new Date(startStr)
    const end = new Date(endStr)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return ''
    const diff = end.getTime() - start.getTime()
    const nights = Math.round(diff / (1000 * 60 * 60 * 24))
    if (nights <= 0) return ''
    return `${nights}晚`
  }

  useEffect(() => {
    if (id) {
      fetchDetail(id)
    }
  }, [id])

  const fetchDetail = async (hotelId) => {
    try {
      setLoading(true)
      const res = await request({ url: `/hotels/${hotelId}`, method: 'GET' })
      if (res.hotel) {
        setDetail(res.hotel)
        // 设置标题
        Taro.setNavigationBarTitle({ title: res.hotel.nameCn })
      }
    } catch (e) {
      console.error(e)
      if (e && e.statusCode === 404) {
        Taro.showToast({ title: '酒店已下线或不存在', icon: 'none' })
        setDetail(null)
        setTimeout(() => {
          Taro.navigateBack({ delta: 1 })
        }, 1200)
      } else {
        Taro.showToast({ title: '获取详情失败', icon: 'none' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={{ padding: '16px' }}>
        <Skeleton rows={3} title animated />
        <Skeleton rows={3} title animated style={{ marginTop: '20px' }} />
      </View>
    )
  }

  if (!detail) {
    return <View style={{ padding: '20px', textAlign: 'center' }}>未找到酒店信息</View>
  }

  // 图片列表，如果没有则用封面图，再没有用默认图
  const rawImages = detail.images && detail.images.length > 0 ? detail.images : (detail.coverImage ? [detail.coverImage] : ['https://img12.360buyimg.com/imagetools/jfs/t1/196130/38/13621/2930/60c733bdEad3e90ac/251c5d836417d6d3.png'])
  const images = rawImages.length === 1 ? [rawImages[0], rawImages[0]] : rawImages
  const sortedRoomTypes = Array.isArray(detail.roomTypes)
    ? [...detail.roomTypes].sort((a, b) => Number(a?.price) - Number(b?.price))
    : []
  const nightsText = calcNights(checkIn, checkOut)

  return (
    <View className='detail-page' style={{ paddingBottom: '80px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 顶部轮播 */}
      <Swiper defaultValue={0} loop autoPlay height={200}>
        {images.map((img, idx) => (
          <SwiperItem key={idx}>
            <Image
              src={img}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              mode="aspectFill"
            />
          </SwiperItem>
        ))}
      </Swiper>

      {/* 基础信息 */}
      <View style={{ background: '#fff', padding: '16px', marginBottom: '10px' }}>
        <View style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{detail.nameCn}</View>
        <View style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{detail.nameEn}</View>

        <View style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <Rate value={detail.star} count={5} readOnly size={14} />
          <Text style={{ fontSize: '14px', color: '#ff9900', marginLeft: '8px', fontWeight: 'bold' }}>{detail.star}.0分</Text>
          <Tag type="primary" plain style={{ marginLeft: '12px' }}>{detail.type}</Tag>
        </View>

        <Divider style={{ margin: '10px 0' }} />

        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Location size={16} color="#666" />
            <Text style={{ fontSize: '14px', color: '#333', marginLeft: '4px' }}>{detail.address}</Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', color: '#1989fa' }}>
            <Text style={{ fontSize: '12px' }}>地图</Text>
          </View>
        </View>
      </View>

      {checkIn && checkOut && nightsText && (
        <View style={{ background: '#fff', marginBottom: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <View style={{ fontSize: '14px', color: '#666' }}>入住离店</View>
            <View style={{ marginTop: '4px', fontSize: '14px', fontWeight: 'bold' }}>
              {checkIn} 至 {checkOut}
            </View>
          </View>
          <View style={{ textAlign: 'right' }}>
            <View style={{ fontSize: '12px', color: '#999' }}>共 {nightsText}</View>
            <View style={{ fontSize: '12px', color: '#1989fa', marginTop: '4px' }}>修改日期请返回列表页</View>
          </View>
        </View>
      )}

      {/* 设施服务 */}
      {detail.tags && detail.tags.length > 0 && (
        <View style={{ background: '#fff', padding: '16px', marginBottom: '10px' }}>
          <View style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>设施服务</View>
          <View style={{ display: 'flex', flexWrap: 'wrap' }}>
            {detail.tags.map((tag, idx) => (
              <Tag key={idx} color="#f0f2f5" textColor="#666" style={{ marginRight: '8px', marginBottom: '8px' }}>{tag}</Tag>
            ))}
          </View>
        </View>
      )}

      {/* 房型列表 */}
      <View style={{ background: '#fff', padding: '16px 16px 0 16px' }}>
        <View style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>房型预订</View>

        {sortedRoomTypes.length > 0 ? (
          sortedRoomTypes.map((room, idx) => (
            <View key={idx} style={{ display: 'flex', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #eee' }}>
              <Image
                src={room.images && room.images.length > 0 ? room.images[0] : 'https://img12.360buyimg.com/imagetools/jfs/t1/147573/29/16034/8547/5fa0520dE99a806c9/91b99819777174e7.png'}
                style={{ width: '80px', height: '80px', borderRadius: '4px', marginRight: '10px' }}
                mode="aspectFill"
              />
              <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <View>
                  <View style={{ fontSize: '16px', fontWeight: 'bold' }}>{room.name}</View>
                  <View style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {room.amenities ? room.amenities.join(' · ') : '暂无详情'}
                  </View>
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View style={{ color: '#ff6400', fontSize: '18px', fontWeight: 'bold' }}>
                    <Text style={{ fontSize: '12px' }}>¥</Text>{room.price}
                  </View>
                  <Button type="primary" size="small">预订</Button>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={{ padding: '20px', textAlign: 'center', color: '#999' }}>暂无房型信息</View>
        )}
      </View>

      {/* 底部操作栏 */}
      <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '20px' }}>
          <Share size={20} />
          <Text style={{ fontSize: '10px', marginTop: '2px' }}>分享</Text>
        </View>
        <Button type="primary" block style={{ flex: 1 }}>查看可用房间</Button>
      </View>
    </View>
  )
}
