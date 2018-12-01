const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin') //引入分离插件
const config = {
    entry: {
        index: './src/js/idx.js'
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,   // 正则匹配以.css结尾的文件
                use: ExtractTextPlugin.extract({  // 这里我们需要调用分离插件内的extract方法
                    fallback: 'style-loader',  // 相当于回滚，经postcss-loader和css-loader处理过的css最终再经过style-loader处理
                    use: ['css-loader', 'postcss-loader']
                })
            },
            {
                test: /\.(png|jpg|svg|gif)$/,  // 正则匹配图片格式名
                use: [
                    {
                        loader: 'url-loader'  // 使用url-loader
                    }
                ]
            },
            {                             // jsx配置
                test: /(\.jsx|\.js)$/,   
                use: {                    // 注意use选择如果有多项配置，可写成这种对象形式
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "env", "react"
                        ]
                    }
                },
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(), // 热更新插件,
        new htmlWebpackPlugin({
            template: path.join(__dirname, '/src/index.template.html')
        }),
        new ExtractTextPlugin('css/index.css'),// 将css分离到/dist文件夹下的css文件夹中的index.css
        new webpack.BannerPlugin('版权所有，翻版必究')  // new一个插件的实例 


    ],
    devServer: {
        contentBase: "./dist",   // 本地服务器所加载文件的目录
        port: "8088",  // 设置端口号为8088
        inline: true,  // 文件修改后实时刷新
        historyApiFallback: true, //不跳转
        hot: true     //热加载
    }
}
module.exports = config;