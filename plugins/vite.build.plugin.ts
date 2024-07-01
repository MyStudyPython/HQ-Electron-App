// 打包时用到的插件
// 项目打包时候的自定义插件

import { Plugin } from "vite";

// 通过 spawn 的方式执行 electron-forge 的打包命令
import { ChildProcess, spawn } from "node:child_process";

import os from 'os'

import fs from 'fs'

// 引入esbuild,把 electron 的 ts 打包成 js 
import { BuildResult, buildSync } from "esbuild";

// 手动定义一个方法，用于进行打包的工作
const electronBuild2Js = () => {

    // 每次都先删除target目录，然后执行新的编译动作
    let targetExistFlag = fs.existsSync('electrontarget')
    if(targetExistFlag){
        console.log('electrontarget 目录存在，执行删除')
        fs.rmSync('electrontarget',{recursive:true})
    }else{
        console.log('electrontarget 目录不存在，无需删除')
    }

    // 把electron 的 入口 ts 文件进行打包操作
    let buildRes :BuildResult =  buildSync({
        entryPoints:['electron/**/*.ts','electron/**/*.js'],
        bundle:true,
        outdir:'electrontarget',
        // outfile:'target/electron/electronMain.js',
        platform:'node',
        target:'node20',
        external:['electron']
    })

    console.log('编译 electron ts 文件完成')
}

// 思路 ： 先等vite 打完包，然后再执行 electron的打包动作
// 因为，electron 打包是需要用到 vue 打包之后的 index.html 文件的
export const ElectronBuildPlugin = ():Plugin =>{
    return{
        name:'electron-build-plugin',
        
        buildStart(){
            console.log('vite-prod 开始编译vue对象 ： 先重新编译 electron 的 ts ')

            // 先执行 electron 的 编译动作
            electronBuild2Js();
        },
        
        closeBundle() {
            console.log('vite-vue 打包完成')

            // 先把之前的打包的文件删除
            let dirFlag = fs.existsSync('out')
            if(dirFlag){
                console.log('plugins-build : out目录 存在，先删除')
                fs.rmSync('out',{recursive:true})
            }else{
                console.log('plugins-build : out目录 不存在')
            }
            
           // 下面执行命令进行electron的打包
            const platform = os.platform();
        
            if (platform === 'win32') {
                console.log('当前运行环境是 Windows');
                // windows 上需要执行这种方式
                let buildChildProcess =  spawn('npm.cmd',['run','make'],{stdio: 'inherit'}) as ChildProcess

            } else if (platform === 'darwin') {
                console.log('当前运行环境是 Mac');
                // Mac上可以执行这种方式
                // let buildChildProcess = spawn('electron-forge',['make'],{stdio: 'inherit'}) as ChildProcess
                let buildChildProcess = spawn('npm',['run','make'],{stdio: 'inherit'}) as ChildProcess
            } else {
                console.log('其他平台 : ',platform,'【暂不支持打包】');
            }

        },
    }
}

