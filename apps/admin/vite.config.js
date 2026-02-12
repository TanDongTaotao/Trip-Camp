import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
  Vite 构建配置（管理端）：
  - 使用 @vitejs/plugin-react 支持 JSX/React Refresh
  - 阶段 0 目标是“能跑起来”；这里保持最小配置，后续按需扩展（例如 proxy）
*/
export default defineConfig({
  plugins: [react()],
})
