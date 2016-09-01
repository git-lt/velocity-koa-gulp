## 基于 koa + gulp 的前端工程构建工具

## 适用场景

- 使用velocity模板的H5多页项目
- 还没有实现组件化，css与js是嵌入在页面中的活动页面或简单页面

## 特点

- 对于现有的Java项目目录结构没有侵入性
- 通过node版的velocity模板引擎生成独立的前端web服务
- 对多页面中内嵌的css与js进行优化
- 自动生成对应的css雪碧图
- 使用mock服务模拟数据请求
- 基于livereload的实时刷新预览
- 监听文件变动，自动构建新的版

## 解决方案

此项目主要针对移动端多页面的优化，项目中的H5页面，特点是引用一个公共的css，js引用cdn上的公共js，而与页面相关的css与js直接嵌入在页面中（减少请求数量）

在没有打包构建工具的情况下

- css3相关新特性需要手动添加各版本和浏览器前缀
- 雪碧图、base64图片需要手动生成，然后再应用到css
- css并没有做相关优化压缩处理
- js没有做语法检查和优化压缩
- 使用velocity模板强依赖后端java环境
- 不能实时编辑 实时预览

## 构建流程

### 初始化
- 读取xx.vm页面
- 提取内嵌的CSS、JS
- 合并css、js，去掉多余的标签，只保留最后一个
- 根据css提取雪碧图，压缩雪碧图，生成base64图片，生成新的css，重新嵌入到xx.vm中

![](http://7xi480.com1.z0.glb.clouddn.com/%E6%88%AA%E5%9B%BE%202016-09-01%2008%E6%97%B628%E5%88%8634%E7%A7%92.jpg)



### 处理css、js

<img src="http://7xi480.com1.z0.glb.clouddn.com/%E6%88%AA%E5%9B%BE%202016-09-01%2008%E6%97%B629%E5%88%8623%E7%A7%92.jpg" width="400px">


### 替换

- 替换xx.vm中的css、js
- 压缩xx.vm
- 发布到相关目录
- 启动livereload监听服务

<img src="http://7xi480.com1.z0.glb.clouddn.com/%E6%88%AA%E5%9B%BE%202016-09-01%2008%E6%97%B629%E5%88%8639%E7%A7%92.jpg" width="400px">

### gulp 任务列表

<img src="http://7xi480.com1.z0.glb.clouddn.com/%E6%88%AA%E5%9B%BE%202016-09-01%2008%E6%97%B630%E5%88%8604%E7%A7%92.jpg" width="400px">

## 需要注意的问题
在build:init之后，调用生成雪碧图的插件生成的css不一定适用，通常背景图片在使用REM做定位时，不同的屏幕宽度下，图片会错位，所以应将背景图定位改成父类相对定位，添加伪类绝对定位，并放大10倍或100倍，然后再使用css3缩放属性缩小相应的倍数，以提高背景图定位的精确度。
具体参考：[移动端web app自适应布局探索与总结](http://www.html-js.com/article/JavaScript-learning-notes%203234)
