import { useEffect, useMemo, useState } from 'react'
import { View, ScrollView, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { SearchBar, Loading, Empty } from '@nutui/nutui-react-taro'
import { Location } from '@nutui/icons-react-taro'
import { request } from '../../utils/request'
import './index.scss'

export default function City() {
  const [cityList, setCityList] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [scrollIntoView, setScrollIntoView] = useState('')
  const [locating, setLocating] = useState(false)
  const [locatedCity, setLocatedCity] = useState('')
  const [locateError, setLocateError] = useState('')

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

  const handleLocate = async () => {
    if (locating) return
    if (!cityList || cityList.length === 0) {
      Taro.showToast({ title: '城市列表未加载完成', icon: 'none' })
      return
    }
    setLocating(true)
    setLocateError('')
    try {
      const location = await Taro.getLocation({ type: 'wgs84' })
      const res = await Taro.request({
        url: 'https://nominatim.openstreetmap.org/reverse',
        method: 'GET',
        data: {
          lat: location.latitude,
          lon: location.longitude,
          format: 'json',
          zoom: 8,
          addressdetails: 1
        },
        header: {
          'accept-language': 'zh-CN'
        }
      })
      const address = res?.data?.address || {}
      const cityRaw = address.city || ''
      const stateRaw = address.state || ''
      const displayName = String(res?.data?.display_name || '')
      const cityName = String(cityRaw || '').replace(/市$/, '')
      if (!cityName && !displayName) {
        setLocateError('定位失败')
        Taro.showToast({ title: '定位失败', icon: 'none' })
        return
      }
      const sortedCities = [...cityList].sort((a, b) => b.name.length - a.name.length)
      const matchedByDisplay = displayName
        ? sortedCities.find((item) => displayName.includes(item.name))
        : null
      const matchedByCity = cityName
        ? cityList.find((item) => item.name === cityName || item.name === `${cityName}市`)
        : null
      const matchedByState = String(stateRaw || '').endsWith('市')
        ? cityList.find((item) => item.name === stateRaw.replace(/市$/, '') || item.name === stateRaw)
        : null
      const matched = matchedByDisplay || matchedByCity || matchedByState
      setLocatedCity(matched?.name || cityName || stateRaw || '')
      if (matched) {
        handleSelect(matched)
      } else {
        const fallbackName = cityName || stateRaw || '未知'
        setLocateError(`定位到${fallbackName}，暂无该城市`)
        Taro.showToast({ title: `定位到${fallbackName}，暂无该城市`, icon: 'none' })
      }
    } catch (err) {
      const msg = err?.errMsg || err?.message || ''
      const isDenied = /deny|denied|permission|auth/i.test(msg)
      const text = isDenied ? '定位失败，未授权定位权限' : '定位失败，请检查定位权限'
      setLocateError(text)
      Taro.showToast({ title: text, icon: 'none' })
    } finally {
      setLocating(false)
    }
  }

  return (
    <View className="city-page">
      <View className="city-search">
        <View className="city-locate" onClick={handleLocate}>
          <Location size={16} color="#1989fa" />
          <Text className="city-locate-text">{locating ? '定位中' : '定位'}</Text>
        </View>
        <SearchBar
          value={search}
          placeholder="搜索城市"
          onChange={(val) => setSearch(val)}
          onClear={() => setSearch('')}
        />
      </View>

      {(locatedCity || locateError) && (
        <View className="city-location-result">
          <Text className="city-location-label">定位结果：</Text>
          <Text className="city-location-value">{locatedCity || '未知'}</Text>
          {locateError && <Text className="city-location-error">{locateError}</Text>}
        </View>
      )}

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
