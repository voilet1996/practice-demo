const path = require('path')
const webpack = require('webpack')
// const URL = "dev4.gofusion.cn"
// const URL = "172.10.16.174:9002"; //蔡壮
const URL = '10.45.13.79:9002' //线上
// const URL = "172.10.16.60" //薛新昂

const resolve = (dir) => path.join(__dirname, dir)
const timeStamp = new Date().toLocaleString()
// const IS_PRODUCTION = process.env.NODE_ENV === "production";
// const PUBLIC_PATH = IS_PRODUCTION ? "." : ".";
console.log(`curent time_stamp => ${timeStamp}`)
module.exports = {
    //这个参数可以把静态资源路径变成相对路径
    publicPath: '/schedulecenter',
    //构建好的文件放在哪个目录
    outputDir: './dist/schedulecenter',
    assetsDir: './static',
    lintOnSave: false, // 关闭ESLint编译

    css: {
        // 配置css模块
        loaderOptions: {
            // 向预处理器 Loader 传递配置选项
            less: {
                lessOptions: {
                    // 配置less（其他样式解析用法一致）
                    javascriptEnabled: true, // 设置为true
                },
            },
        },
        extract: false,
    },
    chainWebpack: (config) => {
        //热替换
        // 修复HMR
        // config.resolve.symlinks(true);
        config.resolve.alias
            .set('root', resolve('/'))
            .set('vue$', 'vue/dist/vue.esm.js')
            .set('@', resolve('src'))
            .set('@utils', resolve('src/utils'))
            .set('@com', resolve('src/components'))
            .set('@views', resolve('src/views'))
            .set('@assets', resolve('src/assets'))
    },
    // 打包相关

    configureWebpack: {
        devtool: 'source-map',
        // 修改入口
        entry: './src/main.ts',
        module: {
            rules: [
                // 引入ts，需要加上的一段解析ts的配置

                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    // 给vue文件后面加上ts/tsx的后缀，用于编译
                    options: { appendTsSuffixTo: ['\\.vue$'] },
                    exclude: /node-modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js', '.vue', '.json'],
        },
        plugins: [
            // ===> 打包出来的文件头行注释
            new webpack.BannerPlugin(
                `Built by G.W.S.W. group @${timeStamp} \n`
            ),
        ],
        optimization: {
            splitChunks: false,
        },
    },
    devServer: {
        proxy: {
            '/login': {
                target: `http://${URL}`,
                changeOrigin: true,
                autoRewrite: true,
                pathRewrite: {
                    '^/login': '/login',
                },
            },
            '/api': {
                target: `http://${URL}`,
                changeOrigin: true,
                // autoRewrite: true,
            },
            '/bi': {
                target: `http://${URL}`,
                changeOrigin: true,
                autoRewrite: true,
            },
            '/meta': {
                target: `http://${URL}`,
                changeOrigin: true,
                autoRewrite: true,
            },
        },
    },
}
