const SessionHelper = require('../lib/SessionHelper');
const { getOEM } = require('../lib/util');
exports.enabled = true;
exports.mapping = '/login.html';
exports.middlewares = function (router) {
  return [
    function (req, res, next) {
      let session = req.session;
      let serviceAddr = context.getResource('serviceAddr.json');
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
  let sessParam = SessionHelper.getSession(req, res) || {};
  res.render('login', sessParam);
};
