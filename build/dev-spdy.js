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
const fs = require('fs');

const options = require('./webpack.dev.conf');

logo(function () {
  const spdy = require('spdy');
  const consts = require('constants');
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
  var sdpyOptions = {
    key: fs.readFileSync(path.join(__dirname, '..', 'server/ssl/server-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '..', 'server/ssl/server-cert.pem')),
    secureOptions: consts.SSL_OP_NO_TLSv1,
    ciphers: 'ECDHE-RSA-AES128-GCM-SHA256',
    spdy: {
      protocols: [ 'h2', 'http/1.1' ],
      plain: false,
      'x-forwarded-for': true,
      connection: {
        windowSize: 1024 * 1024, // Server's window size
        autoSpdy31: false
      }
    }
  }
  const spdyServer = spdy.createServer(sdpyOptions, app);
  spdyServer.listen(port, '0.0.0.0');
  spdyServer.listen(port, 'localhost');

  let firstCompile = true;
  compiler.hooks.done.tap('open broswer', stats => {
    if (firstCompile) {
      console.warn(`App(dev-spdy) running at:`);
      console.warn(`- Local:   https://localhost:${port}/`);
      console.warn(`- Network: https://0.0.0.0:${port}/`);
      console.warn(`Note that the development build is not optimized.`)
      console.warn(`To create a production build, run npm run build.`)
      open(`https://localhost:${port}/`);
      firstCompile = false;
    }
  });
});
