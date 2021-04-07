const logger = require('log4js').getLogger('timeout');
const { getOEM } = require('../lib/util');
exports.enabled = true;
exports.mapping = '/timeout.html';
exports.middlewares = function (router) {
  return [
    function (req, res, next) {
      let serviceAddr = context.getResource('serviceAddr.json');
      let session = req.session;
      session.arch = serviceAddr.arch || 'x86';
      getOEM(serviceAddr['keystone']).then(res => {
        session = Object.assign(session, res);
        next();
      }).catch(e => {
        next();
      });
    }
  ];
};
/**
 * 路由请求成功回调函数
 * @required
 * @param  {{}} req [request]
 * @param  {{}} res [response]
 * @return {{}}
 */
exports.get = function (req, res) {
  // let remoteAddress = req.headers['x-forwarded-for'] ||
  // req.connection.remoteAddress ||
  // req.socket.remoteAddress ||
  // req.connection.socket.remoteAddress;
  // let localAddress = req.connection.localAddress;
  res.render('timeout');
};
