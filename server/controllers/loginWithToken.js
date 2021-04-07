const logger = require('log4js').getLogger('Login');
exports.enabled = true;
exports.mapping = '/icos/loginWithToken.html';
exports.middlewares = function (router) {
  return [
    function (req, res, next) {
      next();
    },
    function (req, res, next) {
      next();
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
  res.render('loginWithToken');
};