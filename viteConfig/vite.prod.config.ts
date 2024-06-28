// vite 的生产环境的配置

import { defineConfig } from 'vite'
console.log('load prod-config...')

export default defineConfig({
  // 配置打包相关的属性
  base: './',
  build: {
    outDir: 'electrontarget/pages',
  },
})
