/*
  管理端（apps/admin）入口：
  - 创建 React 根节点并渲染 App
  - 这里不做业务逻辑，只负责把路由/页面树挂载到 #root
*/
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
