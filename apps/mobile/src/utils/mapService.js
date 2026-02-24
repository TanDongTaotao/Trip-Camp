import Taro from '@tarojs/taro'
import { request } from './request'

class MapService {
  constructor() {
    this.baiduAk = process.env.TARO_APP_BAIDU_AK || ''
  }

  async geocode(address) {
    if (!address) {
      throw new Error('地址不能为空')
    }

    try {
      const response = await request({
        url: '/map/geocode',
        method: 'GET',
        data: {
          address
        }
      })

      const location = response?.result?.location
      if (!location || !location.lng || !location.lat) {
        throw new Error('地址解析失败')
      }

      return { lng: location.lng, lat: location.lat }
    } catch (error) {
      console.error('地理编码失败:', error)
      throw new Error(error.message || '地址解析服务异常')
    }
  }

  generateStaticMapUrl(lng, lat, options = {}) {
    const {
      width = 600,
      height = 220,
      zoom = 16,
      markers = true
    } = options

    const params = new URLSearchParams({
      lng: String(lng),
      lat: String(lat),
      width: width.toString(),
      height: height.toString(),
      zoom: zoom.toString()
    })

    if (markers) {
      params.append('markers', '1')
    }

    return `/api/v1/map/staticimage?${params.toString()}`
  }

  generateWebMapUrl(lng, lat, title = '') {
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      title,
      content: title,
      output: 'html',
      src: 'trip-camp'
    })

    return `https://api.map.baidu.com/marker?${params.toString()}`
  }

  generateAppMapUrl(lng, lat, title = '') {
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      title,
      content: title,
      src: 'trip-camp'
    })
    return `baidumap://map/marker?${params.toString()}`
  }

  async openMap(lng, lat, title = '') {
    const env = Taro.getEnv()

    if (env === Taro.ENV_TYPE.WEB || env === Taro.ENV_TYPE.H5) {
      const appUrl = this.generateAppMapUrl(lng, lat, title)
      const webUrl = this.generateWebMapUrl(lng, lat, title)
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = appUrl
      document.body.appendChild(iframe)
      setTimeout(() => {
        document.body.removeChild(iframe)
        window.open(webUrl, '_blank')
      }, 1200)
    } else {
      Taro.openLocation({
        latitude: lat,
        longitude: lng,
        name: title,
        scale: 18
      })
    }
  }

  async validateAndGeocode(address, city = '') {
    if (!address) {
      throw new Error('地址不能为空')
    }

    let fullAddress = address
    if (city && !address.includes(city)) {
      fullAddress = `${city}${address}`
    }

    return await this.geocode(fullAddress)
  }
}

export const mapService = new MapService()
