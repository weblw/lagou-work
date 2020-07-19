const {merge}=require('webpack-merge')
const webpack=require('webpack')
const path=require('path')

const common=require('./webpack.common')

module.exports=merge(
  common,
  {
    mode:'development',
    devServer:{
      contentBase:path.join(__dirname,'dist'),
      port:3000,
      open:true,
      hot:true
    },
    devtool:'cheap-module-eval-source-map',
    plugins:[
      new webpack.HotModuleReplacementPlugin()
    ]
  }
)