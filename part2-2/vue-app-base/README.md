# vue-app-base

1. 在webpack.common.js中配置webpack基本配置
- 项目入口，打包出口
- 基本loader配置：
  - style-loader
  - css-laoder
  - less-loader
  - url-loader
  - vue-laoder
  - babel-loader
  - eslint-loader
- 基本plugin配置：
  - VueLoaderPlugin
  - DefinePlugin
  - HtmlWebpackPlugin 

2.在webpack.dev.js中配置开发环境配置
- 使用webpack-merge合并基础配置与开发配置
- 设置mode为development
- 设置devtool为cheap-module-eval-source-map
- 使用devServer并开启hotModuleReplacement
- plugins配置HotModuleReplacementPlugin

3.在webpack.prod.js中配置生产环境配置
- 设置mode为development
- plugins配置CleanWebpackPlugin清空上次打包结果，CopyWebpackPlugin将public中资源文件拷贝到dist目录