require('./check-versions')()
require('shelljs/global')
const constants = require('../constants');
env.NODE_ENV = 'production'

const path = require('path')
const config = require('../config')
const webpack = require('webpack')
const webpackConfig = require('./webpack.prod.conf')
const logo = require('./logo');

const assetsPath = path.join(config.build.assetsRoot, config.build.assetsSubDirectory)
rm('-rf', assetsPath)
mkdir('-p', assetsPath)
mkdir('-p', constants.DIST_VIEWS)
cp('-R', 'static/*', assetsPath)

logo(function() {
  webpack(webpackConfig, function (err, stats) {
    if (err) {
      console.error(err);
    }
    if (stats.hasErrors()) {
      console.error(stats.toJson().errors);
    }
  });
});

