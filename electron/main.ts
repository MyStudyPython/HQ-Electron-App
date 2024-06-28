/**
 * electron 的主进程
 */
// 导入模块
import { app, BrowserWindow } from 'electron'

import path from 'path'

// 创建主窗口
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  })

  // 根据是否存在开发路径，决定加载不同的内容
  let devUrl = process.argv[2]
  if (devUrl) {
    win.loadURL(devUrl)
  } else {
    // 这个 pages/index.html 就是 vue3 打包之后的那个 index.html
    win.loadFile(path.resolve(__dirname, 'pages/index.html'))
  }

  console.log('prod file : ', path.resolve(__dirname, 'pages/index.html'))
}

// 应用准备就绪，加载窗口
app.whenReady().then(() => {
  console.log('main.js : ready')

  createWindow()

  // mac 上默认保留一个窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  console.log('--- app ready ---')
})

// 关闭所有窗口 ： 程序退出 ： windows & linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
