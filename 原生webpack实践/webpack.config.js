const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { VueLoaderPlugin } = require('vue-loader')
const isProd = process.env.NODE_ENV === 'production'

console.log('isProd', isProd)
module.exports = {
    entry: {
        module1: './src/module1/index.js',
        module2: './src/module2/index.js',
        vue: './src/vue/index.js',
        // vender: ['lodash'],
    },
    output: {
        // 输出文件名
        filename: 'js/[name]/[name].[contenthash:8].bundle.js',
        // 输出路径
        path: path.resolve(__dirname, 'dist'),
        // 清除上次打包后的结果，否则的话，原来打包的多余的文件不会删除
        clean: true,
    },
    // 是否显示源代码
    devtool: isProd ? 'hidden-source-map' : 'source-map',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        // 为外部资源（如图像，文件等）指定自定义公共路径,这个就是打包出来的css的图片引用路径的前缀
                        // options: { publicPath: '../' },
                    },
                    ,
                    'css-loader',
                    'postcss-loader',
                ],
            },
            {
                test: /\.less$/,
                // 从下到上依次执行

                use: [
                    // 抽离出css的文件
                    {
                        loader: MiniCssExtractPlugin.loader,
                        // 为外部资源（如图像，文件等）指定自定义公共路径,这个就是打包出来的css的图片引用路径的前缀
                        options: { publicPath: '../' },
                    },
                    'css-loader',
                    'postcss-loader',
                    'less-loader',
                ],
            },
            {
                test: /\.(png|gif|jpg|jpeg|svg|webp)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name].[hash:8][ext]',
                },
            },
            // babel将es6语法转换为es5语法
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.vue$/,
                use: 'vue-loader',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            // 这是基于template的html复制一份
            template: './public/index1.html',
            // 这是构建包放入的文件夹路径和文件名，index.html是默认的html文件,多页面必须配置，不然会有冲突
            filename: 'index1.html',
            title: 'wepack原生1',
            favicon: path.resolve(__dirname, './public/favicon.ico'),
            chunks: ['module1'],
        }),
        new HtmlWebpackPlugin({
            template: './public/index2.html',
            filename: 'index2.html',
            title: 'wepack原生2',
            favicon: path.resolve(__dirname, './public/favicon.ico'),
            chunks: ['module2'],
        }),
        new HtmlWebpackPlugin({
            template: './public/vue.html',
            filename: 'vue.html',
            title: 'vue',
            favicon: path.resolve(__dirname, './public/favicon.ico'),
            chunks: ['vue'],
        }),
        // 提取css代码到css文件夹下,
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:8].css',
        }),
        // 压缩css代码
        new OptimizeCssAssetsWebpackPlugin(),
        // 打包体积分析工具
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
        }),
        new VueLoaderPlugin(),
    ],
    optimization: {
        // 多页面入口，设置single即创建一个在所有生成 chunk 之间共享的运行时文件：runtime文件夹
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            // 最少两个模块引用才提取出来
            minChunks: 2,
            // 这个就规定了分离出来的chunk name
            name: 'lodash',
        },
    },
    resolve: {
        extensions: ['.js', '.jsx', '.vue', '.ts', '.tsx', '.json', '.less'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    devServer: {
        static: {
            directory: path.join(__dirname, './public'),
        },
        client: {
            progress: true,
        },
        // 开启热模式更新
        hot: true,
        // 自动打开浏览器
        open: true,
        // 启用gzip
        compress: true,
        proxy: {},
    },
    mode: process.env.NODE_ENV,
}
