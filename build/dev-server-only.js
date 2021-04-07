const http = require('http');
const open = require('open');
require('shelljs/global');
env.NODE_ENV = 'development';
const app = require('../server/app');
console.warn(
  '  Tip:\n' +
  '  Built files are meant to be served over an HTTP server.\n' +
  '  Opening index.html over file:// won\'t work.\n'
);
const httpServer = http.createServer(app);
httpServer.listen(4001, '0.0.0.0');
httpServer.listen(4001, 'localhost');
open('http://localhost:4001');
