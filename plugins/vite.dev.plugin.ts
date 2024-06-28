// 开发环境的自定义插件

import { loadEnv, type Plugin } from 'vite'

import type { AddressInfo } from 'net'
// 导入子进程
import { ChildProcess, spawn } from 'child_process'
// 导入electron命令
import electron from 'electron'
// 导入 文件操作
import fs from 'fs'
import path from 'path'

// 引入esbuild,把 electron 的 ts 打包成 js
import { BuildResult, buildSync } from 'esbuild'

// 手动定义一个方法，用于进行打包的工作
const electronBuild2Js = () => {
  // 每次都先删除target目录，然后执行新的编译动作
  let targetExistFlag = fs.existsSync('electrontarget')
  if (targetExistFlag) {
    console.log('electrontarget 目录存在，执行删除')
    fs.rmSync('electrontarget', { recursive: true })
  } else {
    console.log('electrontarget 目录不存在，无需删除')
  }

  // 把electron 的 入口 ts 文件进行打包操作
  let buildRes: BuildResult = buildSync({
    entryPoints: ['electron/**/*.ts', 'electron/**/*.js'],
    bundle: true,
    outdir: 'electrontarget',
    // outfile:'target/electron/main.js',
    platform: 'node',
    target: 'node20',
    external: ['electron'],
  })

  console.log('编译 electron ts 文件结果 ： ', buildRes)
}

// 自定义的插件的逻辑
export const ElectronDevPlugin = (): Plugin => {
  return {
    name: 'electron-dev-plugin',
    //配置服务的钩子
    configureServer(server) {
      // 先把electron执行一下编译
      electronBuild2Js()

      server.httpServer?.on('listening', () => {
        // 核心1 ： 获取vue3的服务地址
        let addressInfo = server.httpServer?.address() as AddressInfo
        const devUrl = `http://localhost:${addressInfo.port}`
        console.log('plugins-dev : 服务的完整地址 ： ', devUrl)

        // 核心2 ：加载测试环境的环境变量
        let envParams = loadEnv(
          'development',
          path.resolve(process.cwd(), './environmentconfig')
        )
        console.log('plugins-dev : 获取的环境变量 ： ', envParams.VITE_ENV)

        // 核心3 ： 进程传参，发送到electron的进程中
        let electronProcess = spawn(
          electron + '',
          ['electrontarget/main.js', devUrl],
          { stdio: 'inherit' }
        ) as ChildProcess
        console.log('plugins-dev : electronProcess : ', electronProcess.pid)

        // 扩展功能 ： 增加 electron 的热启动功能
        fs.watch('electron', () => {
          console.log('plugins-dev : electron 目录中的文件发生改变了')
          electronProcess.kill()
          // 把electron执行一下编译,然后在重新执行
          electronBuild2Js()
          electronProcess = spawn(
            electron + '',
            ['electrontarget/main.js', devUrl],
            { stdio: 'inherit' }
          ) as ChildProcess
        })
      })
    },
  }
}
