module.exports = {
  publicPath: '/',
  outputDir: 'dist', // 打包的目录
  lintOnSave: false, // 在保存时校验格式
  productionSourceMap: false, // 生产环境是否生成 SourceMap
  devServer: {
    open: true, // 启动服务后是否打开浏览器
    host: '0.0.0.0',
    port: 8080, // 服务端口
    https: false,
    hotOnly: false,
    // proxy: {
    //     '/api': {
    //         //   // target: 'http://192.168.0.159:8080',
    //         //   // target: 'http://192.168.0.180:8080',
    //         //   // target: 'http://www.baidu.com',
    //         target: 'http://localhost:8888',
    //         ws: true,
    //         changeOrigin:true,//允许跨域
    //         pathRewrite: {
    //             '^/api': '/api'
    //         }
    //     }
    // },
    overlay: {
      warnings: true,
      errors: true
    },
    before: app => {}
  }
}
