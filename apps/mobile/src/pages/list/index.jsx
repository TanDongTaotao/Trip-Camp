import { useState, useEffect, useRef } from 'react'
import { View, Image, ScrollView, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { SearchBar, Tabs, Tag, Rate, Loading, Empty, Skeleton } from '@nutui/nutui-react-taro'
import { request } from '../../utils/request'
import './index.scss'

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

  // 查询参数
  const [queryParams, setQueryParams] = useState({
    city: '',
    keyword: '',
    checkIn: '',
    checkOut: '',
    star: '',
    tags: ''
  })

  // 初始化参数
  useEffect(() => {
    const params = router.params
    setQueryParams({
      city: params.city || '',
      keyword: params.keyword || '',
      checkIn: params.checkIn || '',
      checkOut: params.checkOut || '',
      star: params.star || '',
      tags: params.tags || ''
    })
    fetchList(1, params.city, params.keyword, params.star, '', params.tags || '')
  }, [])

  const fetchList = async (pageNum, cityStr, keyStr, starVal, sortVal, tagsStr) => {
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
          tags: tagsStr
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
      fetchList(page + 1, queryParams.city, queryParams.keyword, queryParams.star, sort, queryParams.tags)
    }
  }

  // 排序切换
  const handleSortChange = (val) => {
    setSort(val)
    setPage(1)
    setHasMore(true)
    fetchList(1, queryParams.city, queryParams.keyword, queryParams.star, val, queryParams.tags)
  }

  const activeTags = queryParams.tags
    ? queryParams.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  return (
    <View className='list-page' style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* 顶部搜索条回填 */}
      <View style={{ background: '#fff', padding: '8px' }}>
        <SearchBar
          shape="round"
          placeholder={`${decodeURIComponent(queryParams.city)} | ${decodeURIComponent(queryParams.checkIn)} 入住`}
          readOnly
          onClick={() => Taro.navigateBack()}
        />
      </View>

      {/* 排序筛选栏 */}
      <View style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
        <Tabs value={sort} onChange={(val) => handleSortChange(val)} activeColor="#1989fa">
          <Tabs.TabPane title="推荐" value="" />
          <Tabs.TabPane title="价格低→高" value="priceAsc" />
          <Tabs.TabPane title="价格高→低" value="priceDesc" />
        </Tabs>
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
                  fetchList(1, queryParams.city, queryParams.keyword, queryParams.star, sort, queryParams.tags)
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
                    <View style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{item.nameCn}</View>
                    <View style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <Rate value={item.star} count={5} readOnly size={12} />
                      <Tag type="primary" plain style={{ marginLeft: '8px', fontSize: '10px' }}>{item.type}</Tag>
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
    </View>
  )
}
