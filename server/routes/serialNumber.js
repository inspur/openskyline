module.exports = function(options, context) {
  const logger = require('log4js').getLogger('serialNumber');
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../constants');
  const request = require('request');

  router.post('/', function(req, res) {
    let traceId = req.headers['x-openstack-request-id'] || ''; // 获取追踪id
    let session = req.session;
    let body = req.body;
    let baseUrl = req.baseUrl;
    let restUrl = '/v3/inspur/serialnumber';
    if (!baseUrl.startsWith('/')) {
      baseUrl = '/' + baseUrl;
    }
    let serviceAddr = context.getResource('serviceAddr.json');
    let host = serviceAddr['keystone'];
    let url = urlApi.format({
      protocol: Consts.HTTP,
      host: host
    });
    let date = new Date();
    let options = {
      url: url+restUrl,
      method: "post",
      json: true,
      body: body,
      qs: {},
      headers: {
        [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
        [Consts.KEY_ACCEPT]: Consts.ACCEPT,
        "request-time":date.getTime()+date.getTimezoneOffset()*60*1000,
        "remote-ip":session[Consts.KEY_IP],
        'X-Auth-Token': session[Consts.PROJECT_TOKEN]?session[Consts.PROJECT_TOKEN]:(session[Consts.KEY_TOKEN] || ""),
        'language': session[Consts.KEY_LANGUAGE] || "",
        "region-id":req.cookies.region_id||"",
        'X-Openstack-Request-Id': traceId
      }
    };
    request(options, function(error, response, body) {
      if (body&&body.error) {
        res.status(body.error.code);
        res.json(body);
      } else {
        //添加成功后，需要踢出所有用户
        req.sessionStore.all(function(error, obj){
          for(var key in obj) {
            req.sessionStore.destroy(key,function(){})
          }
        })
        res.json(body||{});
      }
    });
  });

  return router;
};