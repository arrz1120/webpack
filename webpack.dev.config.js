const path=require('path')
const webpack=require('webpack')
const HtmlWebpackPlugin=require('html-webpack-plugin')
const CopyWebpackPlugin=require('copy-webpack-plugin')
const MiniCssExtractPlugin=require("mini-css-extract-plugin")
const CleanWebpackPlugin=require('clean-webpack-plugin')
const autoprefixer=require('autoprefixer')
const lanIp=require('address').ip()
const jsonfile=require('jsonfile')
const projectConfig=jsonfile.readFileSync('./project.config.json')
const autoConfig=require('./autoConfig.js')
const NODE_ENV=process.env.NODE_ENV

let entryConf
let pagesConf
if(projectConfig.autoConfig){
  entryConf=autoConfig.entry
  pagesConf=autoConfig.pages
}else{
  entryConf=projectConfig.entry
  pagesConf=projectConfig.pages
}
pagesConf=pagesConf.map((item,i)=>{
  return new HtmlWebpackPlugin({
    title:item.title||'Document',
    template:`./src/${item.tmpl}`,
    filename:item.tmpl,
    minify:false,
    inject:false,
    chunks:item.scripts,
    chunksSortMode:'manual'
  })
})

module.exports={
  mode:'development',
  entry:entryConf,
  output:{
    path:path.resolve(__dirname,'./build'),
    filename:'js/[name].bdle.js',
    chunkFilename:'js/[name].[chunkhash:6].js?',
    publicPath:'',
    hashDigestLength:8
  },
  module:{
    rules:[
      // js
      {
        test:/\.js$/,
        use:'babel-loader',
        exclude:/node_modules/
      },

      // html
      {
        test:/\.html$/,
        use:['handlebars-loader']
      },

      // sass
      {
        test:/\.(scss|css)$/,
        exclude:[path.resolve(__dirname, "src/js/components"),/node_modules/],
        use:[
          'css-hot-loader',
          MiniCssExtractPlugin.loader,
          {
            loader:'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader:'postcss-loader',
            options:{
              ident:'postcss',
              plugins:()=>[
                autoprefixer({
                  browsers:['last 2 versions','Android >= 4.0','iOS 7']
                })
              ]
            }
          },
          {
            loader:'sass-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: ['./src/sass/helper/_util.scss','./src/sass/helper/_variables.scss']
            },
          }
        ],
      },

      // components sass
      {
        test:/\.(scss|css)$/,
        include:path.resolve(__dirname, "src/js/components"),
        use:[
          'style-loader',
          {
            loader:'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader:'postcss-loader',
            options:{
              ident:'postcss',
              plugins:()=>[
                autoprefixer({
                  browsers:['last 2 versions','Android >= 4.0','iOS 7']
                })
              ]
            }
          },
          {
            loader:'sass-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: ['./src/sass/helper/_util.scss','./src/sass/helper/_variables.scss']
            },
          }
        ]
      },

      // png|jpg|gif
      {
        test:/\.(png|jpg|gif)$/,
        exclude:[path.resolve(__dirname, "src/js/components"),/node_modules/],
        use:[
          {
            loader: 'url-loader',
            options: {
              context:'./src',
              publicPath:'../',
              name: `[path][name].[ext]`,
              limit: 1,
            }
          }
        ]
      },

      // components png|jpg|gif
      {
        test:/\.(png|jpg|gif)$/,
        include:path.resolve(__dirname, "src/js/components"),
        use:[
          {
            loader: 'url-loader',
            options: {
              context:'./src/js',
              publicPath:'../images/',
              outputPath:'images/',
              name: `[path][name].[ext]`,
              limit: 1,
            }
          }
        ]
      }
    ]
  },
  plugins:[

    // clean build/
    new CleanWebpackPlugin('build/'),

    // webpack 全局变量:__DEV__
    new webpack.DefinePlugin({
      __DEV__:NODE_ENV==='production'?false:true
    }),

    // 提取 css
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].[id].css'
    }),

    // 复制文件
    new CopyWebpackPlugin([
      {
        from:__dirname+'/src/images',
        to:'images/',
        cache:true
      },
      {
        from:__dirname+'/src/js',
        to:'js/',
        ignore:['lib/**/*','components/**/*'],
        cache:true
      }
    ]),

    // 冷刷新页面, 如果全站用 react 开发,则去此并通过命令行 --hot 开启热更新
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer:{
    port:projectConfig.port,
    contentBase:'./build',
    historyApiFallback:true,
    inline:true,
    host:lanIp,
    noInfo:true,
    open:true,
    // 解决 Invalid Host header
    disableHostCheck: true,
    after(){
      console.log('-----------------------------------------------')
      console.log(`Project is running at http://${lanIp}:${projectConfig.port}`)
      console.log('-----------------------------------------------')
    },
    /*
    proxy:{
      '/mock':{
        target:`代理服务器地址`,
        pathRewrite:{'^/mock':''},
        changeOrigin: true,
      }
    }
    */
  },
  devtool:'cheap-module-eval-source-map'
}
module.exports.plugins=(module.exports.plugins||[]).concat(pagesConf)