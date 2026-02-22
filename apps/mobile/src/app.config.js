export default {
  // 页面路由表：按需增加页面路径即可（路径对应 src/pages/*）
  pages: [
    'pages/home/index',
    'pages/city/index',
    'pages/list/index',
    'pages/detail/index'
  ],
  // 全局窗口配置（H5/小程序都会使用到其中一部分）
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'Trip Camp',
    navigationBarTextStyle: 'black'
  }
}
