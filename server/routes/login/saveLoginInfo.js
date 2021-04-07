module.exports = function(options, context) {
  const logger = require('log4js').getLogger('SaveLoginInfoAction');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const SessionHelper = require('../../lib/SessionHelper');

  router.use(function(req, res, next) {
    next();
  });

  router.all('/', function(req, res) {
    req.session.regenerate(function(err) {
      if (err) {
        res.jsonp({
          [Consts.KEY_FLAG]: false,
          [Consts.KEY_ERRCODE]: 'logout failed',
          [Consts.KEY_RESDATA]: ''
        });
        return;
      }

      SessionHelper.setSession(req, res, function () {
        res.jsonp({
          [Consts.KEY_FLAG]: true,
          [Consts.KEY_RESULT]: Consts.RESULT_SUCCESS
        });  
      });
      //调取权限接口，获取权限列表，存入session
      // SessionHelper.setPrivilege(req, res, function() {
      //   res.jsonp({
      //     [Consts.KEY_FLAG]: true,
      //     [Consts.KEY_RESULT]: Consts.RESULT_SUCCESS
      //   });
      // });
    });
  });

  return router;
};
