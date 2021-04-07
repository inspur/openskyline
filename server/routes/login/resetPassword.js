module.exports = function(options, context) {
  const logger = require('log4js').getLogger('resetPassword');
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const request = require('request');

  router.post('/', function(req, res) {
    let traceId = req.headers['x-openstack-request-id'] || ''; // 获取追踪id
    let session = req.session;
    let baseUrl = req.baseUrl;
    let restUrl = "/v3/inspur/users/"+req.body.user.userId+"/password";
    if (!baseUrl.startsWith('/')) {
      baseUrl = '/' + baseUrl;
    }
    let serviceAddr = context.getResource('serviceAddr.json');
    let host = serviceAddr['keystone'];
    let url = urlApi.format({
      protocol: Consts.HTTP,
      host: host
    });
    let ip = req.headers["x-forwarded-for"]||
      req.ip||
      req.connection.remoteAddress||
      req.socket.remoteAddress||'';
    if (ip.split(',').length>0) {
      ip = ip.split(',')[0];
    }
    req.body.user.remote_ip = ip;
    let date = new Date();
    let time = date.getTime()+date.getTimezoneOffset()*60*1000;
    req.body.user.create_time = time;
    let options = {
      url: url+restUrl,
      method: Consts.POST,
      json: true,
      body: req.body,
      qs: {},
      headers: {
        [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
        [Consts.KEY_ACCEPT]: Consts.ACCEPT,
        "remote-ip":session[Consts.KEY_IP],
        'host':host || "",
        "region-id":req.cookies.region_id||"",
        'X-Auth-Token':session[Consts.PROJECT_TOKEN]||session[Consts.KEY_TOKEN]||"",
        'X-Openstack-Request-Id': traceId
      }
    };
    request(options, function(error, response, body) {
      if(body){
        if (!body.error) {
          res.json(body);
        } else {
          res.status(body.error.code);
          res.json(body);
        }
      } else {
        res.json({});
      }
    });
  });

  return router;
};
