const {merge}=require('webpack-merge')
const webpack=require('webpack')
const {CleanWebpackPlugin}=require('clean-webpack-plugin')
const CopyWebpackPlugin=require('copy-webpack-plugin')

const common=require('./webpack.common')

module.exports=merge(
  common,
  {
    mode:'production',
    plugins:[      
      new CleanWebpackPlugin(), 
      new CopyWebpackPlugin({
        patterns:[
          { 
            from:'public',
            globOptions:{
              ignore:['**/*.html']
            }
          },
        ]
      })
    ],
  }
)