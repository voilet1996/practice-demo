const autoprefixer = require('autoprefixer')
module.exports = {
    // 这个里面也可以配置浏览器等信息，但也可以在package.json中browserslist进行配置
    plugins: [autoprefixer({ grid: true })],
}
