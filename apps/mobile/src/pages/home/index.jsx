import { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { Button, Swiper, SwiperItem, Cell, Calendar, Input, Picker, Rate } from '@nutui/nutui-react-taro'
import { ArrowRight, Search, Location, Date as DateIcon } from '@nutui/icons-react-taro'
import { request } from '../../utils/request'
import './index.scss'

export default function Home() {
  const [userInfo, setUserInfo] = useState(null)
  
  // 查询状态
  const [city, setCity] = useState('上海')
  const [showCityPicker, setShowCityPicker] = useState(false)
  const [date, setDate] = useState(['2024-05-01', '2024-05-02']) // 默认日期，实际应动态获取
  const [showCalendar, setShowCalendar] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [star, setStar] = useState(0) // 0 表示不限
  
  // 城市选项
  const cityOptions = [
    { text: '上海', value: '上海' },
    { text: '北京', value: '北京' },
    { text: '广州', value: '广州' },
    { text: '深圳', value: '深圳' },
    { text: '杭州', value: '杭州' },
  ]

  // 初始化日期为今天和明天
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setDate([formatDate(today), formatDate(tomorrow)])
  }, [])

  // 检查登录态
  const checkAuth = async () => {
    try {
      // 静默检查，不报错
      const token = Taro.getStorageSync('token')
      if (!token) return
      
      const res = await request({ url: '/auth/me', method: 'GET' })
      if (res.user) {
        setUserInfo(res.user)
      }
    } catch (e) {
      // Token 无效，清除
      Taro.removeStorageSync('token')
    }
  }

  useDidShow(() => {
    checkAuth()
  })

  const handleSearch = () => {
    // 跳转到列表页，携带参数
    const params = {
      city,
      checkIn: date[0],
      checkOut: date[1],
      keyword,
      star: star > 0 ? star : ''
    }
    
    // 构建 query string
    const queryString = Object.keys(params)
      .filter(key => params[key])
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
      
    Taro.navigateTo({ url: `/pages/list/index?${queryString}` })
  }

  const handleLogout = () => {
    Taro.removeStorageSync('token')
    setUserInfo(null)
    Taro.showToast({ title: '已退出登录', icon: 'success' })
  }

  return (
    <View className='home-page' style={{ paddingBottom: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
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
          title={city && city !== '' ? city : '选择目的地'} 
          description={city && city !== '' ? '查询目的地' : "选择目的地"}
          extra={<ArrowRight />}
          align="center"
          onClick={() => setShowCityPicker(true)}
        >
          <Location color="#1989fa" style={{ marginRight: '8px' }} />
        </Cell>

        {/* 日期选择 */}
        <Cell 
          title={date[0] && date[1] ? `${date[0]} 至 ${date[1]}` : '选择日期'}
          description={date[0] && date[1] ? `共 ${Math.ceil((new Date(date[1]) - new Date(date[0])) / (1000 * 60 * 60 * 24))} 晚` : '入住和离店日期'}
          extra={<ArrowRight />}
          align="center"
          onClick={() => setShowCalendar(true)}
        >
          <DateIcon color="#1989fa" style={{ marginRight: '8px' }} />
        </Cell>

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

        {/* 查询按钮 */}
        <Button type="primary" block size="large" onClick={handleSearch} style={{ marginTop: '16px' }}>
          查找酒店
        </Button>
      </View>

      {/* 登录状态显示 (辅助调试) */}
      {userInfo ? (
        <View style={{ margin: '16px', padding: '16px', background: '#fff', borderRadius: '8px', textAlign: 'center' }}>
          <View style={{ marginBottom: '10px' }}>欢迎回来, {userInfo.username} ({userInfo.role})</View>
          <Button size="small" type="danger" onClick={handleLogout}>退出登录</Button>
        </View>
      ) : (
        <View style={{ margin: '16px', textAlign: 'center' }}>
          <Button size="small" variant="text" onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>
            去登录 (Login)
          </Button>
        </View>
      )}

      {/* 弹窗组件 */}
      <Picker
        visible={showCityPicker}
        options={[cityOptions]}
        value={[city]}
        onConfirm={(list, values) => {
          // values[0] 是选中的值 (如 '北京')
          // list[0] 是选中的对象 (如 {text:'北京', value:'北京'})
          const selectedValue = values[0] ? values[0] : (list[0] ? list[0].value : '')
          setCity(selectedValue)
          setShowCityPicker(false)
        }}
        onClose={() => setShowCityPicker(false)}
      />
      
      <Calendar
        visible={showCalendar}
        type="range"
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
