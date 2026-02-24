module.exports = {
  env: {
    NODE_ENV: '"production"',
    TARO_APP_BAIDU_AK: JSON.stringify(process.env.TARO_APP_BAIDU_AK || '')
  },
  // 这里可以放生产环境用到的全局常量（例如线上 API_BASE_URL）
  defineConstants: {
  },
  mini: {},
  h5: {}
}
