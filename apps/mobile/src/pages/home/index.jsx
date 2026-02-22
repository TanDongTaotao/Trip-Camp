import { useState, useEffect } from 'react'
import { View, ScrollView, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button, Swiper, SwiperItem, Cell, Calendar, Input, Rate, Tag } from '@nutui/nutui-react-taro'
import { ArrowRight, Search, Location, Date as DateIcon } from '@nutui/icons-react-taro'
import { request } from '../../utils/request'
import './index.scss'

export default function Home() {
  const [bannerHotelId, setBannerHotelId] = useState('')
  const [searching, setSearching] = useState(false)

  // 查询状态
  const [city, setCity] = useState('上海')
  const [date, setDate] = useState(['2024-05-01', '2024-05-02']) // 默认日期，实际应动态获取
  const [showCalendar, setShowCalendar] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [star, setStar] = useState(0) // 0 表示不限
  const [recommendList, setRecommendList] = useState([])
  const [recommendPage, setRecommendPage] = useState(1)
  const [recommendHasMore, setRecommendHasMore] = useState(true)
  const [recommendLoading, setRecommendLoading] = useState(false)

  const tagOptions = ['亲子', '豪华', '免费停车场', '暖气', '空调', '影音设施', '可携带动物', '健身房', '泳池', '早餐', '商务', '近地铁']

  // 初始化日期为今天和明天
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setDate([formatDate(today), formatDate(tomorrow)])
  }, [])

  useEffect(() => {
    const fetchBannerHotel = async () => {
      try {
        const res = await request({
          url: '/hotels',
          method: 'GET',
          data: { page: 1, pageSize: 1 },
        })
        const first = res && Array.isArray(res.list) && res.list.length > 0 ? res.list[0] : null
        setBannerHotelId(first ? first.id : '')
      } catch {
        setBannerHotelId('')
      }
    }
    fetchBannerHotel()
  }, [])

  useEffect(() => {
    if (!city) return
    setRecommendList([])
    setRecommendPage(1)
    setRecommendHasMore(true)
    fetchRecommend(1, city)
  }, [city])

  const shuffleList = (list) => {
    const next = [...list]
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = next[i]
      next[i] = next[j]
      next[j] = temp
    }
    return next
  }

  const fetchRecommend = async (pageNum, cityName) => {
    if (recommendLoading) return
    setRecommendLoading(true)
    try {
      const res = await request({
        url: '/hotels',
        method: 'GET',
        data: {
          page: pageNum,
          pageSize: 6,
          city: cityName || ''
        }
      })
      const list = Array.isArray(res?.list) ? res.list : []
      const shuffled = shuffleList(list)
      if (pageNum === 1) {
        setRecommendList(shuffled)
      } else {
        setRecommendList(prev => [...prev, ...shuffled])
      }
      const pageSize = 6
      if (typeof res.total === 'number') {
        setRecommendHasMore(pageNum * pageSize < res.total)
      } else {
        setRecommendHasMore(list.length === pageSize)
      }
      setRecommendPage(pageNum)
    } catch {
      setRecommendHasMore(false)
    } finally {
      setRecommendLoading(false)
    }
  }

  const buildQueryString = (extra = {}) => {
    const params = {
      city,
      checkIn: date[0],
      checkOut: date[1],
      keyword,
      star: star > 0 ? star : '',
      ...extra
    }
    return Object.keys(params)
      .filter(key => params[key])
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
  }

  const handleSearch = () => {
    if (searching) return
    if (!city) {
      Taro.showToast({ title: '请选择目的地', icon: 'none' })
      return
    }
    if (!date[0] || !date[1]) {
      Taro.showToast({ title: '请选择入住和离店日期', icon: 'none' })
      return
    }
    const start = new Date(date[0])
    const end = new Date(date[1])
    if (end <= start) {
      Taro.showToast({ title: '离店日期需晚于入住日期', icon: 'none' })
      return
    }

    const queryString = buildQueryString()

    setSearching(true)
    Taro.navigateTo({ url: `/pages/list/index?${queryString}` })
    setTimeout(() => setSearching(false), 800)
  }

  const handleTagSearch = (tag) => {
    if (searching) return
    if (!city) {
      Taro.showToast({ title: '请选择目的地', icon: 'none' })
      return
    }
    if (!date[0] || !date[1]) {
      Taro.showToast({ title: '请选择入住和离店日期', icon: 'none' })
      return
    }
    const start = new Date(date[0])
    const end = new Date(date[1])
    if (end <= start) {
      Taro.showToast({ title: '离店日期需晚于入住日期', icon: 'none' })
      return
    }
    const queryString = buildQueryString({ tags: tag })
    setSearching(true)
    Taro.navigateTo({ url: `/pages/list/index?${queryString}` })
    setTimeout(() => setSearching(false), 800)
  }

  const handleCitySelect = () => {
    Taro.navigateTo({
      url: `/pages/city/index?current=${encodeURIComponent(city || '')}`,
      events: {
        selectCity: (data) => {
          if (data && data.city) {
            setCity(data.city)
          }
        }
      }
    })
  }

  return (
    <View className='home-page' style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <ScrollView
        scrollY
        style={{ height: '100vh' }}
        onScrollToLower={() => {
          if (recommendHasMore && !recommendLoading) {
            fetchRecommend(recommendPage + 1, city)
          }
        }}
        lowerThreshold={80}
      >
        {/* 顶部 Banner */}
        <Swiper defaultValue={0} loop autoPlay>
          <SwiperItem>
            <View style={{ height: '200px', background: '#1989fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px' }}>
              Trip Camp Hotel
            </View>
          </SwiperItem>
          <SwiperItem>
            <View style={{ height: '200px', background: '#ff976a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px' }}>
              Enjoy Your Stay
            </View>
          </SwiperItem>
        </Swiper>

        {/* 查询表单区域 */}
        <View style={{ margin: '16px', padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>

          {/* 城市选择 */}
          <Cell
            title={
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Location color="#1989fa" style={{ marginRight: '8px' }} />
                <View>{city && city !== '' ? city : '选择目的地'}</View>
              </View>
            }
            description={city && city !== '' ? '查询目的地' : "选择目的地"}
            extra={<ArrowRight />}
            align="center"
            onClick={handleCitySelect}
          />

          {/* 日期选择 */}
          <Cell
            title={
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <DateIcon color="#1989fa" style={{ marginRight: '8px' }} />
                <View>{date[0] && date[1] ? `${date[0]} 至 ${date[1]}` : '请选择入住离店日期'}</View>
              </View>
            }
            description={date[0] && date[1] ? `共 ${Math.ceil((new Date(date[1]) - new Date(date[0])) / (1000 * 60 * 60 * 24))} 晚` : '请选择入住离店日期'}
            extra={<ArrowRight />}
            align="center"
            onClick={() => setShowCalendar(true)}
          />

          {/* 关键词输入 */}
          <View style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <Input
              placeholder="关键字/位置/品牌/酒店名"
              value={keyword}
              onChange={(val) => setKeyword(val)}
              style={{ padding: 0 }}
            />
          </View>

          {/* 星级筛选 (简单实现) */}
          <View style={{ padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ fontSize: '14px', color: '#666' }}>星级要求</View>
            <Rate value={star} onChange={(val) => setStar(val)} />
          </View>

          <ScrollView scrollX className='tag-scroll' style={{ width: '100%' }}>
            <View style={{ display: 'inline-flex', gap: '10px', paddingBottom: '6px', flexWrap: 'nowrap' }}>
              {tagOptions.map((tag) => (
                <Tag
                  key={tag}
                  type="default"
                  plain={false}
                  onClick={() => handleTagSearch(tag)}
                  style={{ height: '32px', padding: '0 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', background: '#f5f5f5', border: '1px solid #eee', color: '#333', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
                >
                  {tag}
                </Tag>
              ))}
            </View>
          </ScrollView>

          {/* 查询按钮 */}
          <Button type="primary" block size="large" onClick={handleSearch} disabled={searching} style={{ marginTop: '16px' }}>
            {searching ? '跳转中...' : '查找酒店'}
          </Button>
        </View>

        <View style={{ margin: '0 16px 16px', background: '#fff', borderRadius: '8px', padding: '12px' }}>
          <View style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>为你推荐</View>
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {recommendList.map((hotel) => (
              <View
                key={hotel.id}
                style={{ width: 'calc(50% - 5px)', borderRadius: '8px', overflow: 'hidden', background: '#f9f9f9' }}
                onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${hotel.id}&checkIn=${date[0]}&checkOut=${date[1]}` })}
              >
                <Image
                  src={hotel.coverImage || 'https://img12.360buyimg.com/imagetools/jfs/t1/196130/38/13621/2930/60c733bdEad3e90ac/251c5d836417d6d3.png'}
                  style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                  mode="aspectFill"
                />
                <View style={{ padding: '8px' }}>
                  <Text style={{ fontSize: '13px', fontWeight: 'bold', lineHeight: '18px' }}>{hotel.nameCn}</Text>
                  <View style={{ display: 'flex', alignItems: 'center', marginTop: '6px', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: '12px', color: '#2db7f5', fontWeight: 'bold' }}>{hotel.star}.0</Text>
                    <Text style={{ fontSize: '14px', color: '#ff6400', fontWeight: 'bold' }}>¥{hotel.minPrice}</Text>
                  </View>
                </View>
              </View>
            ))}
            {!recommendLoading && recommendList.length === 0 && (
              <View style={{ color: '#999', padding: '12px 0', width: '100%', textAlign: 'center' }}>暂无推荐酒店</View>
            )}
          </View>
          {recommendLoading && (
            <View style={{ color: '#999', padding: '10px 0', textAlign: 'center' }}>加载中...</View>
          )}
        </View>
      </ScrollView>

      <Calendar
        visible={showCalendar}
        type="range"
        title="请选择入住离店日期"
        startDate={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
        endDate={`${new Date().getFullYear() + 1}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
        defaultValue={date}
        onClose={() => setShowCalendar(false)}
        onConfirm={(param) => {
          // param: [start, end]
          if (param && param.length >= 2) {
            // 兼容处理：尝试获取第4个元素（字符串），如果不存在则直接使用
            // NutUI Calendar 返回值可能是 [Date对象, Date对象] 或者 [Array, Array]
            // 打印一下 param 结构有助于调试: console.log('Calendar confirm:', param)

            let startStr = ''
            let endStr = ''

            // 情况1: param 是 [[y,m,d,str], [y,m,d,str]]
            if (Array.isArray(param[0]) && param[0][3]) {
              startStr = param[0][3]
              endStr = param[1][3]
            }
            // 情况2: param 是 [Date, Date] 或 [string, string]
            else {
              // 简单的日期格式化帮助函数
              const fmt = (d) => {
                if (!d) return ''
                if (typeof d === 'string') return d
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
              }
              startStr = fmt(param[0])
              endStr = fmt(param[1])
            }

            if (startStr && endStr) {
              setDate([startStr, endStr])
            }
          }
        }}
      />
    </View>
  )
}
