# 项目描述
Electron + Vue3 + Vite + TypeScript + ~~electron-builder~~ electron-forge
补充:electron 目前是js为主,执行和打包时ts转成js

# 项目所遇到的坑
## electron
### 1. install electron 换淘宝源
> [详情参考官网](https://www.electronjs.org/zh/docs/latest/tutorial/installation)

> windows
> ```sh
> npm config ls
> ```
>
> 在 "user" config from 里面修改
> registry=https://registry.npmjs.org/
> ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
> ELECTRON_CUSTOM_DIR={{ version }}
> 

> mac
> ```sh
> ~/.npmrc
> ```
> 按`i`进行编辑模式,在里面修改
> registry=https://registry.npmjs.org/
> ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
> ELECTRON_CUSTOM_DIR={{ version }}
> 按`esc`退出编辑模式,`:wq`保存退出,在 终端 输入 source ~/.zshrc 使刚才的修改生效

### 2. 运行electron
- 环境变量配置文件准备
  - 在开发环境时，vue 中的路由需要用这个 history 模式；而在打包正式环境时，需要用到 hash 模式；
  - 在开发环境时，electron 需要加载的是 vue 的服务路径；而在打包正式环境时，electron需要加载 vue 打包后的 index.html 文件。
  
  基于以上两点，我们进行 环境变量 的配置。使我们的应用会根据运行时的环境，自动加载正确的内容。

1. 在根目录下 创建三个文件：
    .env    		   (全局通用的环境变量)
    .env.development  （开发环境的环境变量）
    .env.productrion  （生产环境的环境变量）

2. vite 配置文件重构
   - 在项目的根目录创建vite的配置文件目录 viteconfig
   - 在该目录下 创建三个文件：
      vite.base.config.ts   (全局通用的vite配置)
      vite.dev.config.ts   （开发环境的vite配置）
      vite.prod.config.ts  （生产环境的vite配置）
   - 将原来 根目录下的 vite.config.ts 重命名为 【vite.config.mts】,且内容修改为按【运行环境】加载不同的配置文件
   - 为了 解决 vite.config.mts文件中 导入 三个 vite 配置文件提示报错的问题,【修改 tsconfig.node.ts 文件】
3. 一键启动 配置 
   - 实现思路
     - 先启动 vue3 的服务
     - 自定义一个vite插件，监听 vue3 的服务启动，并获取启动的端口
     - 将 electron 的 TS 编译成 JS，输出到 electrontarget 目录中
     - 将 【vue3 的服务访问地址】 和 【环境变量】 作为参数，通过 进程传参的方式，传递给 【electron的主进程】
     - 启动electron
  
  3.1 创建自定义插件
     在 项目根目录下，创建 plugins 目录，用于存放 自定义的插件。
     在 plugins 目录下，创建 vite.dev.plugin.ts 文件, 就是我们要写的插件。
  3.2 加载插件
     在 viteconfig/vite.base.config.ts 文件中，添加 我们的自定义插件。
     在 tsconfig.node.json 中添加插件目录,解决关于插件的异常提示。

4. 一键打包 配置
   - 实现思路
     - 先打包 vue3，将内容输出到 electrontarget/pages 目录下
     - 自定义一个vite插件，在vue3打包完成之后，执行 electron 的打包操作；

   4.1 electron-forge 依赖安装
      ```sh
      pnpm add @electron-forge/cli -D
      ```
   4.2 import 导入 forge 的脚手架
      ```sh
      npx electron-forge import
      ```

   > 遇到问题
   > <span style="color:red; font-weight:bold;">
     An unhandled rejection has occurred inside Forge:
     Error: Failed to install modules: ["electron-squirrel-startup"]

     With output: Command failed with a non-zero return code (1):
     yarn add electron-squirrel-startup
     yarn add v1.22.19
     info No lockfile found.
     </span>
   > 解决问题
   > 重进vscode


   4.3 转换脚本完成后，Forge 会将一些脚本添加到您的 `package.json` 文件中
   ```json
   "scripts": {
    ...
    "start": "electron-forge start",
    "package": "electron-forge package",
    "make": "electron-forge make"
   },
   ```

   4.4 修改 `forge.config.js` 文件内容
   ```js
   const { FusesPlugin } = require('@electron-forge/plugin-fuses');
   const { FuseV1Options, FuseVersion } = require('@electron/fuses');

   module.exports = {
   packagerConfig: {
      asar: true,
   },
   rebuildConfig: {},
   makers: [
      // windows 上的打包
      {
         name: '@electron-forge/maker-squirrel',
         config: {},
      },
   
      // mac 上的打包
      {
         name: '@electron-forge/maker-dmg',
         config: {
         //background: './assets/dmg-background.png',
         format: 'ULFO'
         }
      },
      // 打成 zip 的包，windows 上和 mac 上都有
      {
         name: '@electron-forge/maker-zip',
         platforms: ['darwin','win32'],
      },

   ],
   plugins: [
      {
         name: '@electron-forge/plugin-auto-unpack-natives',
         config: {},
      },
      // Fuses are used to enable/disable various Electron functionality
      // at package time, before code signing the application
      new FusesPlugin({
         version: FuseVersion.V1,
         [FuseV1Options.RunAsNode]: false,
         [FuseV1Options.EnableCookieEncryption]: true,
         [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
         [FuseV1Options.EnableNodeCliInspectArguments]: false,
         [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
         [FuseV1Options.OnlyLoadAppFromAsar]: true,
      }),
   ],
   };
   ```

   4.5 修改`package.json` 文件的配置
   - 需要完善项目的 author、 description 属性的配置（打包时必须要用的属性）;
   - 明确主要的打包脚本,main 属性指定了 electron 的主进程文件，注意，此处我们要指定的是 electron 编译完成之后的 js 的文件目录。
   ```json
   {
      "name": "", // 项目的名称，也是打包之后的程序名称
      "version": "1.0.0", // 版本信息
      "private": true,
      "author": "", // 作者信息，必填
      "description": "", // 描述信息，必填
      "main": "electron/main.ts",
      "scripts": {
         ...
         // 其实就是 一个默认的 vue3 的打包命令
         "build:all":"run-p type-check \"build-only {@}\" --",
         // electron-forge 相关的命令（必须要有）
         "start": "electron-forge start",
         "package": "electron-forge package",
         "make": "electron-forge make"  // electron 打包实际执行的命令就是这个
         ......
      },
      "dependencies": {
         ...
      },
      "devDependencies": {
         ...
      }
   }
   ```

   4.6 自定义打包插件 `plugins/vite.build.plugin.ts`
    - 编译打包 vue3 之前，先将 electron 的ts文件重新编译为 js;
    - 实现 vue3 打包完成之后，继续执行 electron的打包命令。
  
   4.7 把插件放到 `vite.base.config.ts` 中
   ```ts
   // vite 的通用配置

   ......

   // 导入 打包时的插件，实现一键打包两个服务的功能
   import { ElectronBuildPlugin } from '../plugins/vite.build.plugin'


   import { defineConfig } from "vite"
   console.log('load base-config...')
   export default defineConfig({

      plugins: [
         ......
         ElectronBuildPlugin()
      ],

      ......
   })
   ```

   4.8 vite.prod.config.ts 文件属性确认
   - 在打包为生产环境时，会加载 `vite.prod.config.ts` 文件
   - 需要对以下两个属性进行确认，否则会影响打包效果。
     - `base`属性为`./`相对路径
       必须修改，否则打包后无法加载页面
     - 修改vue的打包输出目录
       主要是为了把 vue 打包的内容直接输出到 electrontarget/pages 的目录下，这样就不用手动复制过去了。
   ```ts
   // vite 的生产环境的配置

   import { defineConfig } from "vite"
   console.log('load prod-config...')

   export default defineConfig({

      // 配置打包相关的属性
      base:'./',
      build:{
         outDir:'electrontarget/pages'
      }
   })

   ```

   4.9 确认 `main.ts` 中是按环境加载的
   ```ts
   /**
    * electron 的主进程
    */
   // 导入模块
   const { app, BrowserWindow  } = require('electron')

   // 创建主窗口
   const createWindow = () => {
     const win = new BrowserWindow({
       width: 800,
       height: 600,
     })

     // 根据是否存在开发路径，决定加载不同的内容

     let devUrl = process.argv[2]
     if(devUrl){
       win.loadURL(devUrl)
     }else{
       // 打包时，主要用到的就是这一块，目录也需要搞正确
       // ‘pages/index.html’ 就是 vue 打包之后的存放的目录
       win.loadFile(path.resolve(__dirname,'pages/index.html'))
     }

   }

   ...
   其他的内容不变

   ```
