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
