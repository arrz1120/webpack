const path=require('path')
const webpack=require('webpack')
const HtmlWebpackPlugin=require('html-webpack-plugin')
const CopyWebpackPlugin=require('copy-webpack-plugin')
const MiniCssExtractPlugin=require("mini-css-extract-plugin")
const CleanWebpackPlugin=require('clean-webpack-plugin')
const autoprefixer=require('autoprefixer')
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
  mode:'production',
  entry:entryConf,
  output:{
    path:path.resolve(__dirname,'./build'),
    filename:'js/[name].bdle.js?[chunkhash]',
    chunkFilename:'js/[name].js?[chunkhash]',
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
          'css-loader',
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
          'sass-loader',
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
          'css-loader',
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
          'sass-loader'
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
              name: `[path][name].[ext]?[hash:8]`,
              limit: 2*1024,
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
              name: `[path][name].[ext]?[hash:8]`,
              limit: 2*1024,
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

    new webpack.HashedModuleIdsPlugin(),

    // 提取 css
    new MiniCssExtractPlugin({
      filename: 'css/[name].css?[contenthash:8]',
      chunkFilename: 'css/[name].css?[contenthash:8]'
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
  ],

  optimization:{
    minimize:true,
    splitChunks:{
      chunks: 'all',
      minSize: 30000,
      minChunks: 3,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter:'-',
      cacheGroups:{
        default:{
          name:'bdle.0'
        },
        bdle1:{
          name:'bdle.1',
          minChunks:4,
          priority: -1
        },
      }
    }
  }
}
module.exports.plugins=(module.exports.plugins||[]).concat(pagesConf)