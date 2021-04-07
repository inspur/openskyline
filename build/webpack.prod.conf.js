const path = require('path');
const constants = require('../constants');
const config = require('../config');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const utils = require('./utils');
const baseWebpackConfig = require('../webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { truncate } = require('fs');

module.exports = merge(baseWebpackConfig, {
  mode: 'production',
  devtool: false,
  output: {
    path: config.build.assetsRoot,
    publicPath: constants.ROOT_URL,
    filename: utils.assetsPath('js/[name].js'),
    chunkFilename: utils.assetsPath('js/[id].[name].js')
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.build.env,
      __DEV__: false,
      __PROD__: true
    }),
    new HtmlWebpackPlugin({
      filename: 'views/index.html',
      template: path.posix.join(constants.VIEWS, 'index.html'),
      inject: true,
      hash: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunks: ['app']
    }),
    new HtmlWebpackPlugin({
      filename: 'views/login.html',
      template: path.posix.join(constants.VIEWS, 'login.html'),
      inject: true,
      hash: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true
        // removeAttributeQuotes: truncate
      },
      chunks: ['login']
    }),
    new HtmlWebpackPlugin({
      filename: 'views/timeout.html',
      template: path.posix.join(constants.VIEWS, 'timeout.html'),
      inject: true,
      hash: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunks: ['timeout']
    }),
    new HtmlWebpackPlugin({
      filename: 'views/digitalVisualizationScreen.html',
      template: path.posix.join(constants.VIEWS, 'digitalVisualizationScreen.html'),
      inject: true,
      hash: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunks: ['digitalVisualizationScreen']
    }),
    new HtmlWebpackPlugin({
      filename: 'views/loginWithToken.html',
      template: path.posix.join(constants.VIEWS, 'loginWithToken.html'),
      inject: true,
      hash: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunks: ['login-with-token']
    })
  ],
  optimization: {
    minimize: true,
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: /[\\\/]node_modules[\\\/]/,
          priority: -10,
          chunks: 'initial'
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    }
  }
});
