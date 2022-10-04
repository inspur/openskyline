const path = require('path');
const config = require('./config');
const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const WebpackBar = require('webpackbar');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: {
    'app': ['@babel/polyfill', './src/main.js'],
    'login': ['@babel/polyfill', './src/pages/login/login.js'],  // 登陆页
    'login-with-token': ['@babel/polyfill', './src/pages/loginWithToken/loginWithToken.js'],  // 单点登陆页
    'digitalVisualizationScreen': ['@babel/polyfill', './src/pages/digitalVisualizationScreen/entry.js'], // 可视化大屏
    'timeout': ['@babel/polyfill', './src/pages/timeout/timeout.js']  // 超时跳转
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'font-awesome': 'font-awesome/css',
      'vue$': 'vue/dist/vue.common.js',
      'src': path.resolve(__dirname, './src'),
      'assets': path.resolve(__dirname, './src/assets'),
      'components': path.resolve(__dirname, './src/components'),
      'views': path.resolve(__dirname, './src/views'),
      'common': path.resolve(__dirname, './src/common'),
      'utils': path.resolve(__dirname, './src/utils'),
      'directives': path.resolve(__dirname, './src/directives')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader'
        }]
      },
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: file => (
          /node_modules/.test(file) &&
          !/\.vue\.js/.test(file)
        )
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'vue-style-loader'
          },
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            esModule: false
          }
        }]
      }
    ]
  },
  plugins: [
    new ESLintPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jquery: 'jquery',
      'window.jQuery': 'jquery',
      jQuery: 'jquery',
      Vue: 'vue'
    }),
    new webpack.LoaderOptionsPlugin({ options: {} }),
    new VueLoaderPlugin(),
    new WebpackBar({
      reporters: ['fancy']
    })
  ]
};
