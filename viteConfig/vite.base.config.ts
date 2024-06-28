// vite 的通用配置

import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'

import { defineConfig } from 'vite'

// 导入 electron开发时的插件，实现一键启动两个服务的功能
import { ElectronDevPlugin } from '../plugins/vite.dev.plugin'

export default defineConfig({
  plugins: [
    vue(), // 添加自定义的插件
    ElectronDevPlugin(),
  ],

  // 指定参数配置的文件目录(比较关键)
  envDir: 'environmentconfig',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
    },
  },
})
