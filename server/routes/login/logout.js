module.exports = function(options, context) {
  const logger = require('log4js').getLogger('Logout');
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const request = require('request');

  router.post('/', function(req, res) {
    let traceId = req.headers['x-openstack-request-id'] || ''; // 获取追踪id
    let session = req.session;
    let serviceAddr = context.getResource('serviceAddr.json');
    let host = serviceAddr['keystone'];
    let url = urlApi.format({
      protocol: Consts.HTTP,
      host: host
    });
    let options = {
      url: url+"/v3/auth/tokens",
      method: Consts.DELETE,
      json: true,
      body: {},
      qs: {},
      headers: {
        [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
        [Consts.KEY_ACCEPT]: Consts.ACCEPT,
        'X-Openstack-Request-Id': traceId,
        "remote-ip": session[Consts.KEY_IP],
        'host': host || "",
        'X-Subject-Token': session[Consts.KEY_TOKEN]||"",
        'X-Auth-Token': session[Consts.KEY_TOKEN]||""
      }
    };
    request(options, function(error, response, body) {
      if (!error) {
        // 备注：这里用的 session-file-store 在destroy 方法里，并没有销毁cookie
        // 所以客户端的 cookie 还是存在，导致的问题 --> 退出登陆后，服务端检测到cookie
        // 然后去查找对应的 session 文件，报错
        // session-file-store 本身的bug
        req.session.destroy(function(err) {
          if (err) {
            res.json({
              [Consts.KEY_FLAG]: false,
              [Consts.KEY_ERRCODE]: 'logout failed',
              [Consts.KEY_RESDATA]: ''
            });
            return;
          }

          // req.session.loginUser = null;
          res.clearCookie(Consts.IDENTITY_KEY);
          res.clearCookie('connect.sid');
          //  return res.redirect('/login');
          res.json({
            [Consts.KEY_FLAG]: true,
            [Consts.KEY_RESULT]: Consts.RESULT_SUCCESS
          });
        });
      } else {
        res.status(response.statusCode);
        res.json(error);
      }
    });
  });

  return router;
};
