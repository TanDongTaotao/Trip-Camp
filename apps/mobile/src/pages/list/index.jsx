import { useState, useEffect, useRef } from 'react'
import { View, Image, ScrollView, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Tag, Rate, Loading, Empty, Skeleton, Calendar, Input } from '@nutui/nutui-react-taro'
import { ArrowLeft, Search, Location } from '@nutui/icons-react-taro'
import { request } from '../../utils/request'
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

export default function List() {
  const router = useRouter()
  const [list, setList] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('') // priceAsc, priceDesc
  const [initialLoading, setInitialLoading] = useState(false)
  const [error, setError] = useState(null)
  const requestSeqRef = useRef(0)
  const inFlightRef = useRef(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [dateRange, setDateRange] = useState(['', ''])
  const [keywordInput, setKeywordInput] = useState('')
  const [pricePanelOpen, setPricePanelOpen] = useState(false)
  const [starPanelOpen, setStarPanelOpen] = useState(false)

  // 查询参数
  const [queryParams, setQueryParams] = useState({
    city: '',
    keyword: '',
    checkIn: '',
    checkOut: '',
    star: '',
    tags: '',
    minPrice: '',
    maxPrice: ''
  })

  // 初始化参数
  useEffect(() => {
    const params = router.params
    const city = params.city ? decodeURIComponent(params.city) : ''
    const keyword = params.keyword ? decodeURIComponent(params.keyword) : ''
    const checkIn = params.checkIn ? decodeURIComponent(params.checkIn) : ''
    const checkOut = params.checkOut ? decodeURIComponent(params.checkOut) : ''
    const star = params.star ? decodeURIComponent(params.star) : ''
    const tags = params.tags ? decodeURIComponent(params.tags) : ''
    const minPrice = params.minPrice ? Number(decodeURIComponent(params.minPrice)) : ''
    const maxPrice = params.maxPrice ? Number(decodeURIComponent(params.maxPrice)) : ''

    setQueryParams({
      city,
      keyword,
      checkIn,
      checkOut,
      star,
      tags,
      minPrice,
      maxPrice
    })
    fetchList(1, city, keyword, star, '', tags, minPrice, maxPrice)
  }, [])

  useEffect(() => {
    if (queryParams.checkIn && queryParams.checkOut) {
      setDateRange([queryParams.checkIn, queryParams.checkOut])
    }
  }, [queryParams.checkIn, queryParams.checkOut])

  useEffect(() => {
    setKeywordInput(queryParams.keyword || '')
  }, [queryParams.keyword])

  const fetchList = async (pageNum, cityStr, keyStr, starVal, sortVal, tagsStr, minPriceVal, maxPriceVal) => {
    if (inFlightRef.current && pageNum !== 1) return
    const seq = ++requestSeqRef.current
    inFlightRef.current = true
    if (pageNum === 1) {
      setInitialLoading(true)
    }
    setLoading(true)
    setError(null)

    try {
      const res = await request({
        url: '/hotels',
        method: 'GET',
        data: {
          page: pageNum,
          pageSize: 10,
          city: cityStr,
          keyword: keyStr,
          star: starVal,
          sort: sortVal,
          tags: tagsStr,
          minPrice: minPriceVal,
          maxPrice: maxPriceVal
        }
      })

      if (seq !== requestSeqRef.current) return
      if (res.list) {
        if (pageNum === 1) {
          setList(res.list)
        } else {
          setList(prev => [...prev, ...res.list])
        }
        const pageSize = 10
        if (typeof res.total === 'number') {
          setHasMore(pageNum * pageSize < res.total)
        } else {
          setHasMore(res.list.length === pageSize)
        }
        setPage(pageNum)
      }
    } catch (e) {
      if (seq !== requestSeqRef.current) return
      console.error(e)
      setError(e)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      if (seq === requestSeqRef.current) {
        inFlightRef.current = false
        setLoading(false)
        if (pageNum === 1) {
          setInitialLoading(false)
        }
      }
    }
  }

  // 上拉加载
  const handleScrollToLower = () => {
    if (hasMore && !loading) {
      fetchList(
        page + 1,
        queryParams.city,
        queryParams.keyword,
        queryParams.star,
        sort,
        queryParams.tags,
        queryParams.minPrice,
        queryParams.maxPrice
      )
    }
  }

  // 排序切换
  const handleSortChange = (val) => {
    setSort(val)
    setPage(1)
    setHasMore(true)
    fetchList(
      1,
      queryParams.city,
      queryParams.keyword,
      queryParams.star,
      val,
      queryParams.tags,
      queryParams.minPrice,
      queryParams.maxPrice
    )
  }

  const updateQueryAndFetch = (patch) => {
    const next = { ...queryParams, ...patch }
    setQueryParams(next)
    setPage(1)
    setHasMore(true)
    fetchList(
      1,
      next.city,
      next.keyword,
      next.star,
      sort,
      next.tags,
      next.minPrice,
      next.maxPrice
    )
  }

  const handleCitySelect = () => {
    Taro.navigateTo({
      url: `/pages/city/index?current=${encodeURIComponent(queryParams.city || '')}`,
      events: {
        selectCity: (data) => {
          if (data && data.city) {
            updateQueryAndFetch({ city: data.city })
          }
        }
      }
    })
  }

  const formatDate = (d) => {
    if (!d) return ''
    if (typeof d === 'string') return d
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const parseCalendarRange = (param) => {
    if (!param || param.length < 2) return ['', '']
    if (Array.isArray(param[0]) && param[0][3]) {
      return [param[0][3], param[1][3]]
    }
    return [formatDate(param[0]), formatDate(param[1])]
  }

  const handleKeywordCommit = () => {
    const trimmed = (keywordInput || '').trim()
    if (trimmed === (queryParams.keyword || '')) return
    updateQueryAndFetch({ keyword: trimmed })
  }

  const activeTags = queryParams.tags
    ? queryParams.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : []
  const shortDate = (str) => (str && str.length >= 10 ? str.slice(5) : str)
  const priceRanges = [
    { label: '0-150', min: 0, max: 150 },
    { label: '150-300', min: 150, max: 300 },
    { label: '300-450', min: 300, max: 450 },
    { label: '450-600', min: 450, max: 600 },
    { label: '600-1000', min: 600, max: 1000 },
    { label: '1000以上', min: 1000, max: '' }
  ]
  const priceSortLabel = sort === 'priceAsc' ? '价格低→高' : sort === 'priceDesc' ? '价格高→低' : '价格'
  const isPriceActive = sort === 'priceAsc' || sort === 'priceDesc'
  const starOptions = [
    { label: '不限', value: '' },
    { label: '5星', value: 5 },
    { label: '4星', value: 4 },
    { label: '3星', value: 3 },
    { label: '2星', value: 2 },
    { label: '1星', value: 1 }
  ]
  const starLabel = queryParams.star ? `${queryParams.star}星` : '星级'

  return (
    <View className='list-page' style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* 顶部搜索条回填 */}
      <View style={{ background: '#fff', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <View
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => Taro.navigateBack()}
        >
          <ArrowLeft size={18} color="#333" />
        </View>
        <View
          style={{ flex: 1, height: '36px', borderRadius: '18px', border: '1px solid #d9d9d9', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Text style={{ fontSize: '14px', color: '#1f1f1f', fontWeight: 'bold' }} onClick={handleCitySelect}>
              {decodeURIComponent(queryParams.city) || '城市'}
            </Text>
            <View style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }} onClick={() => setShowCalendar(true)}>
              <Text style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>
                {shortDate(decodeURIComponent(queryParams.checkIn)) || '日期'}
              </Text>
              <Text style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>
                {shortDate(decodeURIComponent(queryParams.checkOut)) || ''}
              </Text>
            </View>
            <View style={{ minWidth: 0, flex: 1 }}>
              <Input
                placeholder="地名/酒店/关键词"
                value={keywordInput}
                onChange={(val) => setKeywordInput(val)}
                onBlur={handleKeywordCommit}
                onClear={() => {
                  setKeywordInput('')
                  updateQueryAndFetch({ keyword: '' })
                }}
                style={{ padding: 0, fontSize: '12px', color: '#666' }}
              />
            </View>
          </View>
          <Search size={16} color="#999" />
        </View>
        <View style={{ width: '44px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Location size={16} color="#5A6A7A" />
          <Text style={{ fontSize: '10px', color: '#5A6A7A' }}>地图</Text>
        </View>
      </View>

      {/* 排序筛选栏 */}
      <View style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
          <Tag
            style={{
              fontSize: '12px',
              padding: '6px 0',
              flex: 1,
              textAlign: 'center',
              background: '#fff',
              color: '#333'
            }}
            onClick={() => {
              setPricePanelOpen(false)
              setStarPanelOpen(false)
              handleSortChange('')
            }}
          >
            推荐
          </Tag>
          <Tag
            style={{
              fontSize: '12px',
              padding: '6px 0',
              flex: 1,
              textAlign: 'center',
              background: '#fff',
              color: '#333'
            }}
            onClick={() => {
              setStarPanelOpen(false)
              setPricePanelOpen((prev) => !prev)
            }}
          >
            <View style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Text>{priceSortLabel}</Text>
              <Text style={{ fontSize: '10px', color: '#666' }}>{pricePanelOpen ? '▲' : '▼'}</Text>
            </View>
          </Tag>
          <Tag
            style={{
              fontSize: '12px',
              padding: '6px 0',
              flex: 1,
              textAlign: 'center',
              background: '#fff',
              color: '#333'
            }}
            onClick={() => {
              setPricePanelOpen(false)
              setStarPanelOpen((prev) => !prev)
            }}
          >
            <View style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Text>{starLabel}</Text>
              <Text style={{ fontSize: '10px', color: '#666' }}>{starPanelOpen ? '▲' : '▼'}</Text>
            </View>
          </Tag>
        </View>
        {pricePanelOpen && (
          <View style={{ padding: '10px 12px', borderTop: '1px solid #f0f0f0' }}>
            <View style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {[
                { label: '价格低→高', value: 'priceAsc' },
                { label: '价格高→低', value: 'priceDesc' }
              ].map((item) => (
                <View
                  key={item.value}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '14px',
                    background: sort === item.value ? '#E6F7FF' : '#F5F5F5',
                    color: sort === item.value ? '#1890ff' : '#666',
                    fontSize: '12px'
                  }}
                  onClick={() => {
                    handleSortChange(item.value)
                    setPricePanelOpen(false)
                  }}
                >
                  {item.label}
                </View>
              ))}
            </View>
            <View style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>价格区间</View>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {priceRanges.map((range) => {
                const isActive = queryParams.minPrice === range.min && queryParams.maxPrice === range.max
                return (
                  <View
                    key={range.label}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '14px',
                      background: isActive ? '#E6F7FF' : '#F5F5F5',
                      color: isActive ? '#1890ff' : '#666',
                      fontSize: '12px'
                    }}
                    onClick={() => {
                      if (isActive) {
                        updateQueryAndFetch({ minPrice: '', maxPrice: '' })
                      } else {
                        updateQueryAndFetch({ minPrice: range.min, maxPrice: range.max })
                      }
                    }}
                  >
                    {range.label}
                  </View>
                )
              })}
            </View>
          </View>
        )}
        {starPanelOpen && (
          <View style={{ padding: '10px 12px', borderTop: '1px solid #f0f0f0' }}>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {starOptions.map((item) => {
                const isActive = queryParams.star === item.value
                return (
                  <View
                    key={item.label}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '14px',
                      background: isActive ? '#E6F7FF' : '#F5F5F5',
                      color: isActive ? '#1890ff' : '#666',
                      fontSize: '12px'
                    }}
                    onClick={() => {
                      updateQueryAndFetch({ star: item.value })
                      setStarPanelOpen(false)
                    }}
                  >
                    {item.label}
                  </View>
                )
              })}
            </View>
          </View>
        )}
      </View>

      {activeTags.length > 0 && (
        <View style={{ background: '#fff', padding: '8px 12px', borderBottom: '1px solid #f5f5f5', display: 'flex', flexWrap: 'wrap' }}>
          {activeTags.map((tag, idx) => (
            <Tag key={idx} color="#E6F7FF" textColor="#1890ff" style={{ marginRight: '8px', marginBottom: '4px', fontSize: '10px' }}>
              {tag}
            </Tag>
          ))}
        </View>
      )}

      {/* 酒店列表 */}
      <ScrollView
        scrollY
        style={{ flex: 1 }}
        onScrollToLower={handleScrollToLower}
        lowerThreshold={80}
      >
        {initialLoading && list.length === 0 ? (
          <View style={{ padding: '10px' }}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={{ background: '#fff', marginBottom: '10px', borderRadius: '8px', padding: '12px' }}>
                <Skeleton rows={3} title animated />
              </View>
            ))}
          </View>
        ) : error && list.length === 0 ? (
          <View style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            <View style={{ marginBottom: '12px' }}>加载失败，请检查网络后重试</View>
            <View>
              <Text
                style={{ color: '#1989fa' }}
                onClick={() =>
                  fetchList(
                    1,
                    queryParams.city,
                    queryParams.keyword,
                    queryParams.star,
                    sort,
                    queryParams.tags,
                    queryParams.minPrice,
                    queryParams.maxPrice
                  )
                }
              >
                重新加载
              </Text>
            </View>
          </View>
        ) : list.length > 0 ? (
          <View style={{ padding: '10px' }}>
            {list.map(item => (
              <View
                key={item.id}
                style={{ background: '#fff', marginBottom: '10px', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}
                hoverStyle={{ opacity: 0.9 }}
                onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}&checkIn=${queryParams.checkIn}&checkOut=${queryParams.checkOut}` })}
              >
                {/* 左侧图片 */}
                <Image
                  src={item.coverImage || 'https://img12.360buyimg.com/imagetools/jfs/t1/196130/38/13621/2930/60c733bdEad3e90ac/251c5d836417d6d3.png'}
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  mode="aspectFill"
                />

                {/* 右侧信息 */}
                <View style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <View>
                    <View style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: '6px', rowGap: '4px', marginBottom: '4px' }}>
                      <Text style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '22px', wordBreak: 'break-all', flexShrink: 1 }}>{item.nameCn}</Text>
                      {item.type && (
                        <Tag style={{ fontSize: '10px' }} color={getTypeTagStyle(item.type).color} textColor={getTypeTagStyle(item.type).textColor}>
                          {item.type}
                        </Tag>
                      )}
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <Rate value={item.star} count={5} readOnly size={12} />
                    </View>
                    <View style={{ fontSize: '12px', color: '#666' }}>{item.address}</View>
                  </View>

                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    {item.tags && item.tags.length > 0 && (
                      <View style={{ display: 'flex' }}>
                        {item.tags.slice(0, 2).map((tag, idx) => (
                          <Tag key={idx} color="#E9E9E9" textColor="#999" style={{ marginRight: '4px', fontSize: '10px' }}>{tag}</Tag>
                        ))}
                      </View>
                    )}
                    <View style={{ color: '#ff6400', fontSize: '18px', fontWeight: 'bold' }}>
                      <Text style={{ fontSize: '12px' }}>¥</Text>{item.minPrice}
                      <Text style={{ fontSize: '12px', color: '#999', fontWeight: 'normal' }}>起</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {/* 底部加载状态 */}
            <View style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
              {loading ? <Loading>加载中...</Loading> : (hasMore ? '上拉加载更多' : '没有更多了')}
            </View>
          </View>
        ) : (
          !loading && <Empty description="暂无酒店数据" />
        )}
      </ScrollView>

      <Calendar
        visible={showCalendar}
        type="range"
        title="请选择入住离店日期"
        startDate={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
        endDate={`${new Date().getFullYear() + 1}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
        defaultValue={dateRange[0] && dateRange[1] ? dateRange : []}
        onClose={() => setShowCalendar(false)}
        onConfirm={(param) => {
          const [startStr, endStr] = parseCalendarRange(param)
          if (startStr && endStr) {
            const start = new Date(startStr)
            const end = new Date(endStr)
            if (end <= start) {
              Taro.showToast({ title: '离店日期需晚于入住日期', icon: 'none' })
              return
            }
            setDateRange([startStr, endStr])
            updateQueryAndFetch({ checkIn: startStr, checkOut: endStr })
            setShowCalendar(false)
          }
        }}
      />
    </View>
  )
}
