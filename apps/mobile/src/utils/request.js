import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_ENV === 'h5' ? '/api/v1' : 'http://localhost:3000/api/v1'

export const request = async (options) => {
  const { url, method = 'GET', data, header = {} } = options
  const token = Taro.getStorageSync('token')
  
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await Taro.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      }
    })
    return res.data
  } catch (err) {
    Taro.showToast({ title: 'Request Failed', icon: 'none' })
    throw err
  }
}
