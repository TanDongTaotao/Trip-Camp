import { Component } from 'react'
import './app.scss'

// Taro 应用入口组件：
// - 负责挂载全局样式
// - 负责承载页面路由渲染（this.props.children）
class App extends Component {
  // 小程序端生命周期：首次启动时触发
  componentDidMount () {}
  // 小程序端生命周期：显示时触发
  componentDidShow () {}
  // 小程序端生命周期：隐藏时触发
  componentDidHide () {}
  render () {
    // Taro 会把当前路由页面注入到 children
    return this.props.children
  }
}
export default App
