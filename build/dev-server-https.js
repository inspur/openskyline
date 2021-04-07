require('./check-versions')()
var config = require('../config')
if (!process.env.NODE_ENV) process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
const fs = require('fs');
var path = require('path')
const tls = require('tls');
const https = require('https');
var express = require('express')
var webpack = require('webpack')
var ora = require('ora')
var proxyMiddleware = require('http-proxy-middleware')
require('shelljs/global');
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable
var constants = require('../constants');

console.warn(
  '  Tip:\n' +
  '  Built files are meant to be served over an HTTP server.\n' +
  '  Opening index.html over file:// won\'t work.\n'
);
// var spinner = ora('building for dev-https...')
// spinner.start()

rm('-rf', constants.DEV)
mkdir('-p', constants.DEV)
mkdir('-p', constants.DEV_VIEWS)
mkdir('-p', path.join(constants.DEV, constants.STATIC))
cp('-R', 'static/*', path.join(constants.DEV, constants.STATIC) )
cp('-R', 'server/views/*.html', constants.DEV_VIEWS)

const server = require('../server/app')
var app = express()
// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
// app.use(staticPath, express.static('./static'));
// app.use(staticPath, express.static(path.join(constants.DEV, staticPath)));
server(app);

/************************server配置***********************************/

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(context, options))
})

var httpsPort = process.env.PORT || config.httpsDev.port
/************************webpack配置***********************************/
var webpackConfig = process.env.NODE_ENV === 'testing'
    ? require('./webpack.prod.conf')
    : require('./webpack.dev.conf')
var compiler = webpack(webpackConfig)
compiler.watch(200, function(err, stats) {
  if (!!server && !!server.active) {
      server.reload()
  }
  if (err) throw err

  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')
  var uri = 'https://localhost:' + httpsPort;

  console.warn('Server has been listening at ' + uri + '\n')
  // spinner.stop();
});
app.use(require('connect-history-api-fallback')())

/**************************server启动*********************************/
var options = {
  pfx:fs.readFileSync(path.posix.join(constants.ROOT_DIR, 'server/ssl/server.pfx')),
  passphrase:'Inspur1!',
  secureOptions: constants.SSL_OP_NO_TLSv1,
 //ciphers: 'DHE-RSA-DES-CBC3-SHA',
  ciphers: 'ECDHE-RSA-AES128-SHA',
}
tls.CLIENT_RENEG_LIMIT = 0;
module.exports = https.createServer(options, app).listen(httpsPort, "0.0.0.0", function(err){
  if (err) {
    return;
  }
  var uri = 'https://localhost:' + httpsPort;
  console.log('https Server will be listening at ' + uri + "\n");
});