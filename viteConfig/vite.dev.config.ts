// vite 的开发环境的配置

import { defineConfig } from 'vite'
console.log('load dev-config...')

export default defineConfig({
  // 指定一下访问的服务端口
  server: {
    port: 5179,
  },
})
