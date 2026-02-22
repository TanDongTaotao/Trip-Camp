import { useEffect, useMemo, useState } from 'react'
import { View, ScrollView, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { SearchBar, Loading, Empty } from '@nutui/nutui-react-taro'
import { request } from '../../utils/request'
import './index.scss'

export default function City() {
  const [cityList, setCityList] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [scrollIntoView, setScrollIntoView] = useState('')

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: '选择城市' })
  }, [])

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true)
      try {
        const res = await request({ url: '/cities', method: 'GET' })
        const list = Array.isArray(res?.list) ? res.list : []
        setCityList(list)
      } catch {
        Taro.showToast({ title: '加载城市失败', icon: 'none' })
        setCityList([])
      } finally {
        setLoading(false)
      }
    }
    fetchCities()
  }, [])

  const filteredList = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return cityList
    return cityList.filter((item) => {
      const nameHit = item.name && item.name.includes(search.trim())
      const pinyinHit = item.pinyin && item.pinyin.toLowerCase().includes(keyword)
      return nameHit || pinyinHit
    })
  }, [cityList, search])

  const grouped = useMemo(() => {
    const groups = {}
    filteredList.forEach((item) => {
      const initial = (item.initial || item.pinyin?.[0] || '#').toUpperCase()
      if (!groups[initial]) groups[initial] = []
      groups[initial].push(item)
    })
    const letters = Object.keys(groups).sort()
    return { groups, letters }
  }, [filteredList])

  const handleSelect = (city) => {
    const eventChannel = Taro.getCurrentInstance().page.getOpenerEventChannel()
    if (eventChannel) {
      eventChannel.emit('selectCity', { city: city.name })
    }
    Taro.navigateBack()
  }

  return (
    <View className="city-page">
      <View className="city-search">
        <SearchBar
          value={search}
          placeholder="搜索城市"
          onChange={(val) => setSearch(val)}
          onClear={() => setSearch('')}
        />
      </View>

      <View className="city-list">
        {loading ? (
          <View className="city-loading">
            <Loading type="spinner" />
          </View>
        ) : filteredList.length === 0 ? (
          <View className="city-empty">
            <Empty description="暂无匹配城市" />
          </View>
        ) : (
          <ScrollView scrollY className="city-scroll" scrollIntoView={scrollIntoView}>
            {grouped.letters.map((letter) => (
              <View key={letter} id={`city-letter-${letter}`} className="city-section">
                <View className="city-letter">{letter}</View>
                {grouped.groups[letter].map((city) => (
                  <View key={city.name} className="city-item" onClick={() => handleSelect(city)}>
                    <Text>{city.name}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {!loading && grouped.letters.length > 0 && (
        <View className="city-index">
          {grouped.letters.map((letter) => (
            <Text
              key={letter}
              className="city-index-item"
              onClick={() => setScrollIntoView(`city-letter-${letter}`)}
            >
              {letter}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}
