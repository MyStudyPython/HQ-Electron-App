// vite 的通用配置

import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'

import { defineConfig } from 'vite'

// 导入 electron开发时的插件，实现一键启动两个服务的功能
import { ElectronDevPlugin } from '../plugins/vite.dev.plugin'

// 导入 打包时的插件，实现一键打包两个服务的功能
import { ElectronBuildPlugin } from '../plugins/vite.build.plugin'

console.log('load base-config...')

export default defineConfig({
  plugins: [
    vue(), // 添加自定义的插件
    ElectronDevPlugin(),
    ElectronBuildPlugin(),
  ],

  // 指定参数配置的文件目录(比较关键)
  envDir: 'environmentconfig',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
    },
  },

  base: './', // 修改一下相对路径，否则打包后electron无法识别到
  build: {
    outDir: 'electron/pages',
    // 打包的结果直接生成到 electron 的目录中去，这样electron 构建的时候，可以直接使用 index.html 了就
  },
})
