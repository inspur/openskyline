var path = require('path')
require('shelljs/global');
env.NODE_ENV = 'development';
var constants = require('../constants');

rm('-rf', constants.DEV)
mkdir('-p', constants.DEV)
mkdir('-p', constants.DEV_VIEWS)
mkdir('-p', path.join(constants.DEV, constants.STATIC))
cp('-R', 'static/*', path.join(constants.DEV, constants.STATIC) )

const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');
const open = require('open');
const logo = require('./logo');

const options = require('./webpack.dev.conf');

logo(function () {
  const http = require('http');
  const app = require('../server/app');
  let compiler = webpack(options);
  app.set('env', 'development');
  app.use(devMiddleware(compiler, {
    writeToDisk: true
  }));
  app.use(hotMiddleware(compiler, {
    publicPath: '/'
  }));
  const port = 4001;
  const httpServer = http.createServer(app);
  httpServer.listen(port, '0.0.0.0');
  httpServer.listen(port, 'localhost');

  let firstCompile = true;
  compiler.hooks.done.tap('open broswer', stats => {
    if (firstCompile) {
      console.warn(`App running at:`);
      console.warn(`- Local:   http://localhost:${port}/`);
      console.warn(`- Network: http://0.0.0.0:${port}/`);
      console.warn(`Note that the development build is not optimized.`)
      console.warn(`To create a production build, run npm run build.`)
      open(`http://localhost:${port}/`);
      firstCompile = false;
    }
  });
});

