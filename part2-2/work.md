# 简答题
1.Webpack构建过程：
- 通过input配置找到打包入口，逐层分析模块依赖关系
- 通过loader配置，针对不同模块匹配的loader，使用对应loader处理转换模块内容
- 通过plugins配置，在webpack打包的不同阶段，对打包内容做响应处理
- 最后通过output配置，将打包结果输出到目标路径

2.Loader和Plugin的不同
- Loader是针对对应的模块做转换
- Plugin是在webpack对应的打包阶段，对打包结果做全局整体的处理
- Loader导出一个函数，接收source参数，可以拿到匹配模块的内容，转换之后将结果返回
- Plugin导出一个类，里面包含一个apply函数，该函数接收compiler参数，compiler.hooks中有webpack打包对应的所有钩子函数，可以在对应的钩子函数中做做要处理的事情