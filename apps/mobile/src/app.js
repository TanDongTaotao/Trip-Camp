import { Component } from 'react'
import '@nutui/nutui-react-taro/dist/style.css'
import './app.scss'

class App extends Component {
  componentDidMount() { }
  componentDidShow() { }
  componentDidHide() { }
  render() {
    return this.props.children
  }
}
export default App
