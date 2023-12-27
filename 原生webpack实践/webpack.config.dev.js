const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        // 输出文件名
        filename: 'bundle.js',
        // 输出路径
        path: path.resolve(__dirname, 'dist'),
        // 清除上次打包后的结果，否则的话，原来打包的多余的文件不会删除
        clean: true,
    },
    module: {
        rules: [
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            {
                test: /\.less$/,
                // 从下到上依次执行
                use: ['style-loader', 'css-loader', 'less-loader'],
            },
            {
                test: /\.(png|gif|jpg|jpeg|svg|webp)$/,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            title: 'wepack原生',
            favicon: path.resolve(__dirname, './public/favicon.ico'),
        }),
    ],
    mode: 'development',
}
