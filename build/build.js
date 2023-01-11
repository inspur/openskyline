require('./check-versions')();
require('shelljs/global');
const constants = require('../constants');
env.NODE_ENV = 'production';

const path = require('path');
const config = require('../config');
const webpack = require('webpack');
const webpackConfig = require('./webpack.prod.conf');
const logo = require('./logo');

// const assetsPath = path.join(config.build.assetsRoot, config.build.assetsSubDirectory);
rm('-rf', constants.DIST);
mkdir('-p', constants.DIST);
// mkdir('-p', assetsPath);
mkdir('-p', constants.DIST_VIEWS);
mkdir('-p', path.join(constants.DIST, '../static'));
// cp('-R', 'static/*', assetsPath);
cp('-R', 'server', path.join(constants.DIST, '../'));
cp('-R', 'constants.js', path.join(constants.DIST, '../'));
cp('-R', 'static/*', path.join(constants.DIST, '../static/'));

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

