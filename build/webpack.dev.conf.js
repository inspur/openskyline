const path = require('path');
const constants = require('../constants');
const config = require('../config');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const utils = require('./utils');
const baseWebpackConfig = require('../webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');

for (let entryName in baseWebpackConfig.entry) {
  baseWebpackConfig.entry[entryName].splice(0, 0, 'webpack-hot-middleware/client');
}

module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  // devtool: '#eval-source-map',
  output: {
    path: constants.DEV,
    publicPath: constants.ROOT_URL,
    filename: utils.assetsPath('js/[name].js'),
    chunkFilename: utils.assetsPath('js/[id].[name].js')
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env,
      __DEV__: true,
      __PROD__: false
    }),
    new HtmlWebpackPlugin({
      filename: 'views/index.html',
      template: path.posix.join(constants.VIEWS, 'index.html'),
      inject: true,
      hash: false,
      cache: false,
      chunks: ['app']
    }),
    new HtmlWebpackPlugin({
      filename: 'views/login.html',
      template: path.join(constants.VIEWS, 'login.html'),
      inject: true,
      hash: false,
      cache: false,
      chunks: ['login']
    }),
    new HtmlWebpackPlugin({
      filename: 'views/timeout.html',
      template: path.posix.join(constants.VIEWS, 'timeout.html'),
      inject: true,
      hash: false,
      cache: false,
      chunks: ['timeout']
    }),
    new HtmlWebpackPlugin({
      filename: 'views/digitalVisualizationScreen.html',
      template: path.posix.join(constants.VIEWS, 'digitalVisualizationScreen.html'),
      inject: true,
      hash: false,
      cache: false,
      chunks: ['digitalVisualizationScreen']
    }),
    new HtmlWebpackPlugin({
      filename: 'views/loginWithToken.html',
      template: path.posix.join(constants.VIEWS, 'loginWithToken.html'),
      inject: true,
      hash: true,
      cache: false,
      chunks: ['login-with-token']
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  optimization: {
    minimize: false
  }
});
