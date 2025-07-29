import babel from 'rollup-plugin-babel' 
import serve from 'rollup-plugin-serve'

export default {
    // 指定入口文件
    input :'./src/index.js', // 入口文件
    // 指定输出文件
    output:{
        file:'dist/vue.js', // 输出文件路径
        format:'umd', // 在window上Vue new Vue
        name:"Vue", // 全局变量名
        sourcemap:true // 生成sourcemap文件
    },
    plugins:[
        babel({
            exclude:'node_modules/**', // 排除node_modules目录下的文件
        }),
        serve({
            open:true, // 自动打开浏览器
            openPage:'/index.html', // 打开页面
            contentBase:'', // 服务器根目录
            port:3000 // 端口号
        })
    ]
}