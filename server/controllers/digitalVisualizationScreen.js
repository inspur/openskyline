const SessionHelper = require('../lib/SessionHelper');
const logger = require('log4js').getLogger('digitalVisualizationScreen');
const { getOEM } = require('../lib/util');
exports.enabled = true;
exports.mapping = '/digitalVisualizationScreen.html';

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
  let sessParam = SessionHelper.getSession(req, res) || {};
  res.render('digitalVisualizationScreen', sessParam);
};
