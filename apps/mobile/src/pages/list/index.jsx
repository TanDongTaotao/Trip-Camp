import { useState, useEffect } from 'react'
import { View, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { SearchBar, Tabs, Tag, Rate, Loading, Empty } from '@nutui/nutui-react-taro'
import { request } from '../../utils/request'
import './index.scss'

export default function List() {
  const router = useRouter()
  const [list, setList] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('') // priceAsc, priceDesc
  
  // 查询参数
  const [queryParams, setQueryParams] = useState({
    city: '',
    keyword: '',
    checkIn: '',
    checkOut: '',
    star: ''
  })

  // 初始化参数
  useEffect(() => {
    const params = router.params
    setQueryParams({
      city: params.city || '',
      keyword: params.keyword || '',
      checkIn: params.checkIn || '',
      checkOut: params.checkOut || '',
      star: params.star || ''
    })
    // 首次加载
    fetchList(1, params.city, params.keyword, params.star, '')
  }, [])

  // 加载数据
  const fetchList = async (pageNum, cityStr, keyStr, starVal, sortVal) => {
    if (loading) return
    setLoading(true)
    
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
          sort: sortVal
        }
      })
      
      if (res.list) {
        if (pageNum === 1) {
          setList(res.list)
        } else {
          setList(prev => [...prev, ...res.list])
        }
        // 判断是否还有更多
        setHasMore(res.list.length === 10)
        setPage(pageNum)
      }
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 上拉加载
  const handleScrollToLower = () => {
    if (hasMore && !loading) {
      fetchList(page + 1, queryParams.city, queryParams.keyword, queryParams.star, sort)
    }
  }

  // 排序切换
  const handleSortChange = (val) => {
    setSort(val)
    setPage(1)
    setHasMore(true)
    fetchList(1, queryParams.city, queryParams.keyword, queryParams.star, val)
  }

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

      {/* 酒店列表 */}
      <ScrollView 
        scrollY 
        style={{ flex: 1 }} 
        onScrollToLower={handleScrollToLower}
      >
        {list.length > 0 ? (
          <View style={{ padding: '10px' }}>
            {list.map(item => (
              <View 
                key={item.id} 
                style={{ background: '#fff', marginBottom: '10px', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}
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
