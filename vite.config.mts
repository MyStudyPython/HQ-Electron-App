// vite 的根配置 ： 根据不同的运行参数，读取不同的配置文件
import { defineConfig, loadEnv } from 'vite'

// 引入三个环境配置文件
import ViteBaseConfig from './viteConfig/vite.base.config'
import ViteProdConfig from './viteConfig/vite.prod.config'
import ViteDevConfig from './viteConfig/vite.dev.config'
import path from 'path'

// 策略模式做一个动态的配置
const envResolver = {
  build: () => {
    console.log('加载生产环境 : ')
    // 解构的语法
    return { ...ViteBaseConfig, ...ViteProdConfig }
  },
  serve: () => {
    console.log('加载开发环境 : ')
    // 另一种写法
    return Object.assign({}, ViteBaseConfig, ViteDevConfig)
  },
}

// 根据 参数 command 的值，使用不同的环境配置文件
export default defineConfig(({ command, mode }) => {
  console.log('vite start : command : ', command)
  console.log('vite start : mode : ', mode)
  console.log('process.cwd() : ', process.cwd())
  console.log('__dirname: ', __dirname)
  console.log('envdir ： ', path.resolve(process.cwd(), './environmentconfig'))

  // 加载不同环境下的参数
  const envParams = loadEnv(
    mode,
    path.resolve(process.cwd(), './environmentconfig')
  )

  // 根据不同的环境使用不同的配置文件,注意这个地方的写法，非常的奇特
  return envResolver[command]()
})
