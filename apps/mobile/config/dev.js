module.exports = {
  env: {
    NODE_ENV: '"development"',
    TARO_APP_BAIDU_AK: JSON.stringify(process.env.TARO_APP_BAIDU_AK || '')
  },
  // 这里可以放开发期用到的全局常量（例如 API_BASE_URL）
  defineConstants: {
  },
  mini: {},
  h5: {}
}
