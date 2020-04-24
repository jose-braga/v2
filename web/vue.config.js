module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
    devServer: {
      watchOptions: {
        ignored: [/node_modules/, /public/],
      }
    }
  },
  chainWebpack: config => {
    config
    .plugin('html')
    .tap(args => {
      args[0].title = 'LAQV/UCIBIO data management'
      return args
    })
  },
}