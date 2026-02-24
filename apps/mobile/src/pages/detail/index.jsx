import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView, Map } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Swiper, SwiperItem, Rate, Tag, Divider, Button, Skeleton, Calendar } from '@nutui/nutui-react-taro'
import { Location, Share, ArrowLeft } from '@nutui/icons-react-taro'
import { request } from '../../utils/request'
import { mapService } from '../../utils/mapService'
import LazyImage from '../../components/LazyImage'
import './index.scss'

const hotelTypeStyles = {
  度假酒店: { color: '#FFF7E6', textColor: '#FA8C16' },
  商务酒店: { color: '#E6F7FF', textColor: '#1890FF' },
  高档酒店: { color: '#F6FFED', textColor: '#52C41A' },
  经济酒店: { color: '#F0F0F0', textColor: '#595959' },
  豪华酒店: { color: '#F9F0FF', textColor: '#722ED1' },
  民宿: { color: '#FFF0F6', textColor: '#EB2F96' }
}

const getTypeTagStyle = (type) => {
  if (!type) return { color: '#E6F7FF', textColor: '#1890FF' }
  return hotelTypeStyles[type] || { color: '#E6F7FF', textColor: '#1890FF' }
}

const tagIconMap = {
  亲子: '👪',
  豪华: '👑',
  免费停车场: '🅿️',
  暖气: '🔥',
  空调: '❄️',
  影音设施: '🎬',
  可携带动物: '🐾',
  健身房: '💪',
  泳池: '🏊',
  早餐: '🍳',
  商务: '💼',
  近地铁: '🚇'
}

const getTagIcon = (tag) => tagIconMap[tag] || '🏷️'

export default function Detail() {
  const router = useRouter()
  const { id, checkIn, checkOut } = router.params
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(['', ''])
  const [showCalendar, setShowCalendar] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [mapImageUrl, setMapImageUrl] = useState('')
  const [mapCoords, setMapCoords] = useState(null)
  const [mapLoading, setMapLoading] = useState(false)
  const env = Taro.getEnv()
  const isH5 = env === Taro.ENV_TYPE.WEB || env === Taro.ENV_TYPE.H5

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

  const formatDate = (d) => {
    if (!d) return ''
    if (typeof d === 'string') return d
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const formatDateShort = (dateValue) => {
    if (!dateValue) return ''
    if (dateValue instanceof Date) {
      const month = String(dateValue.getMonth() + 1).padStart(2, '0')
      const day = String(dateValue.getDate()).padStart(2, '0')
      return `${month}月${day}日`
    }
    if (typeof dateValue === 'string') {
      const fullMatch = dateValue.match(/^\s*\d{4}[\/\-年](\d{1,2})[\/\-月](\d{1,2})/)
      if (fullMatch) {
        const month = String(Number(fullMatch[1] || '') || '').padStart(2, '0')
        const day = String(Number(fullMatch[2] || '') || '').padStart(2, '0')
        return `${month}月${day}日`
      }
      const shortMatch = dateValue.match(/(\d{1,2})[\/\-月](\d{1,2})/)
      if (shortMatch) {
        const month = String(Number(shortMatch[1] || '') || '').padStart(2, '0')
        const day = String(Number(shortMatch[2] || '') || '').padStart(2, '0')
        return `${month}月${day}日`
      }
    }
    return String(dateValue)
  }

  const parseCalendarRange = (param) => {
    if (!param || param.length < 2) return ['', '']
    if (Array.isArray(param[0]) && param[0][3]) {
      return [param[0][3], param[1][3]]
    }
    return [formatDate(param[0]), formatDate(param[1])]
  }

  useEffect(() => {
    if (id) {
      fetchDetail(id)
    }
  }, [id])

  useEffect(() => {
    if (checkIn && checkOut) {
      setDateRange([decodeURIComponent(checkIn), decodeURIComponent(checkOut)])
      return
    }
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    setDateRange([formatDate(today), formatDate(tomorrow)])
  }, [checkIn, checkOut])

  useEffect(() => {
    if (!isH5 || typeof document === 'undefined') return
    document.body.classList.add('hide-scrollbar')
    document.documentElement.classList.add('hide-scrollbar')
    return () => {
      document.body.classList.remove('hide-scrollbar')
      document.documentElement.classList.remove('hide-scrollbar')
    }
  }, [isH5])

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

  const openBaiduMap = async () => {
    if (showMap) {
      setShowMap(false)
      return
    }

    const address = detail?.address || ''
    if (!address) {
      Taro.showToast({ title: '暂无酒店地址', icon: 'none' })
      return
    }

    const name = detail?.nameCn || detail?.nameEn || '酒店位置'
    const city = detail?.city || ''

    try {
      setMapLoading(true)

      // 使用地图服务进行地理编码
      const { lng, lat } = await mapService.validateAndGeocode(address, city)

      setMapCoords({ latitude: lat, longitude: lng, title: name })

      if (isH5) {
        // 生成静态地图URL
        const imgUrl = mapService.generateStaticMapUrl(lng, lat, {
          width: 600,
          height: 220,
          zoom: 16
        })
        setMapImageUrl(imgUrl)
      }

      setShowMap(true)
    } catch (error) {
      Taro.showToast({ title: error.message, icon: 'none' })
    } finally {
      setMapLoading(false)
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
  const nightsText = calcNights(dateRange[0], dateRange[1])

  const pageContent = (
    <View style={{ paddingTop: '44px', paddingBottom: '80px', background: '#f5f5f5', minHeight: '100vh' }}>
      <View style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '44px', background: 'rgba(255,255,255,0.96)', display: 'flex', alignItems: 'center', padding: '0 12px', zIndex: 1000, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <View style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => Taro.navigateBack()}>
          <ArrowLeft size={18} color="#333" />
        </View>
        <View style={{ flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>酒店详情</View>
        <View style={{ width: '32px', height: '32px' }} />
      </View>
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
        <View style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: '8px', rowGap: '6px', marginBottom: '4px' }}>
          <Text style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: '26px', wordBreak: 'break-all', flexShrink: 1 }}>{detail.nameCn}</Text>
          {detail.type && (
            <Tag style={{ fontSize: '10px' }} color={getTypeTagStyle(detail.type).color} textColor={getTypeTagStyle(detail.type).textColor}>
              {detail.type}
            </Tag>
          )}
        </View>
        {detail.tags && detail.tags.length > 0 && (
          <ScrollView scrollX className='tag-scroll' style={{ width: '100%', marginBottom: '10px' }}>
            <View style={{ display: 'inline-flex', gap: '10px', flexWrap: 'nowrap' }}>
              {detail.tags.map((tag, idx) => (
                <View key={`${tag}-${idx}`} style={{ display: 'inline-flex', alignItems: 'center', height: '32px', padding: '0 12px', borderRadius: '16px', background: '#f5f5f5', border: '1px solid #eee', fontSize: '13px', fontWeight: 'bold', color: '#333', flexShrink: 0 }}>
                  <Text style={{ marginRight: '6px', fontSize: '14px' }}>{getTagIcon(tag)}</Text>
                  <Text>{tag}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
        <View style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{detail.nameEn}</View>

        <View style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <Rate value={detail.star} count={5} readOnly size={14} />
          <Text style={{ fontSize: '14px', color: '#ff9900', marginLeft: '8px', fontWeight: 'bold' }}>{detail.star}.0分</Text>
        </View>

        <Divider style={{ margin: '10px 0' }} />

        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Location size={16} color="#666" />
            <Text style={{ fontSize: '14px', color: '#333', marginLeft: '4px' }}>{detail.address}</Text>
          </View>
          <View
            style={{ display: 'flex', alignItems: 'center', color: '#1989fa', padding: '4px 6px' }}
            onClick={openBaiduMap}
          >
            <Text style={{ fontSize: '12px' }}>{showMap ? '收起地图' : '地图'}</Text>
          </View>
        </View>
        {showMap && isH5 && (
          <View style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden' }}>
            {mapLoading && <View style={{ padding: '12px', textAlign: 'center', color: '#999' }}>地图加载中...</View>}
            {!mapLoading && mapImageUrl && (
              <Image
                src={mapImageUrl}
                style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                mode="aspectFill"
                onClick={() => {
                  if (mapCoords) {
                    mapService.openMap(mapCoords.longitude, mapCoords.latitude, mapCoords.title || '')
                  }
                }}
              />
            )}
          </View>
        )}
        {showMap && !isH5 && (
          <View style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden' }}>
            {mapLoading && <View style={{ padding: '12px', textAlign: 'center', color: '#999' }}>地图加载中...</View>}
            {!mapLoading && mapCoords && (
              <Map
                style={{ width: '100%', height: '220px' }}
                latitude={mapCoords.latitude}
                longitude={mapCoords.longitude}
                scale={16}
                markers={[
                  {
                    id: 1,
                    latitude: mapCoords.latitude,
                    longitude: mapCoords.longitude,
                    title: mapCoords.title
                  }
                ]}
              />
            )}
          </View>
        )}
      </View>

      {dateRange[0] && dateRange[1] && nightsText && (
        <View
          style={{ background: '#fff', marginBottom: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          onClick={() => setShowCalendar(true)}
        >
          <View>
            <View style={{ fontSize: '14px', color: '#666' }}>入住离店</View>
            <View style={{ marginTop: '4px', fontSize: '14px', fontWeight: 'bold' }}>
              {formatDateShort(dateRange[0])} 至 {formatDateShort(dateRange[1])}
            </View>
          </View>
          <View style={{ textAlign: 'right' }}>
            <View style={{ fontSize: '12px', color: '#999' }}>共 {nightsText}</View>
            <View style={{ fontSize: '12px', color: '#1989fa', marginTop: '4px' }}>点击修改日期</View>
          </View>
        </View>
      )}

      {/* 房型列表 */}
      <View style={{ background: '#fff', padding: '16px 16px 0 16px' }}>
        <View style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>房型预订</View>

        {sortedRoomTypes.length > 0 ? (
          sortedRoomTypes.map((room, idx) => (
            <View key={idx} style={{ display: 'flex', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #eee' }}>
              <LazyImage
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

      <Calendar
        visible={showCalendar}
        type="range"
        title="请选择入住离店日期"
        startDate={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
        endDate={`${new Date().getFullYear() + 1}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
        defaultValue={dateRange}
        onClose={() => setShowCalendar(false)}
        onConfirm={(param) => {
          const [startStr, endStr] = parseCalendarRange(param)
          if (startStr && endStr) {
            setDateRange([startStr, endStr])
          }
          setShowCalendar(false)
        }}
      />
    </View>
  )

  if (isH5) {
    return (
      <View className='detail-page' style={{ height: '100vh', overflow: 'hidden', background: '#f5f5f5' }}>
        <ScrollView scrollY className="page-scroll" style={{ height: '100vh' }}>
          {pageContent}
        </ScrollView>
      </View>
    )
  }

  return <View className='detail-page'>{pageContent}</View>
}
