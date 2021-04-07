module.exports = function(options, context) {
  const logger = require('log4js').getLogger('RecordLog');
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const request = require('request');

  router.post('/', function(req, res) {
    let session = req.session;
    let body = req.body;
    let baseUrl = req.baseUrl;
    let restUrl = "/v3/inspur/logs";
    if (!baseUrl.startsWith('/')) {
      baseUrl = '/' + baseUrl;
    }
    //let moduleName = baseUrl.split('/')[3];
    let serviceAddr = context.getResource('serviceAddr.json');
    let host = serviceAddr['keystone'];
    //let host = session[Consts.KEY_SERVICES][moduleName];
    let url = urlApi.format({
      protocol: Consts.HTTP,
      host: host
    });
    let date = new Date();
    let time = date.getTime()+date.getTimezoneOffset()*60*1000;
    body.logs.forEach((item, index) => {
      item.ip = session[Consts.KEY_IP];
      item.create_time = time;
    })
    let options = {
      url: url+restUrl,
      method: Consts.POST,
      json: true,
      body: body,
      qs: {},
      headers: {
        [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
        [Consts.KEY_ACCEPT]: Consts.ACCEPT,
        "remote-ip":session[Consts.KEY_IP],
        //'X-Auth-Token': session[Consts.PROJECT_TOKEN] || "",
        'X-Auth-Token': session[Consts.PROJECT_TOKEN]?session[Consts.PROJECT_TOKEN]:(session[Consts.KEY_TOKEN] || ""),
        'language': session[Consts.KEY_LANGUAGE] || ""
      }
    };
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 201) {
        res.json(body);
      } else {
        res.json({
          [Consts.KEY_FLAG]: false,
          [Consts.KEY_ERRCODE]: body?(body.error?body.error.code:""):"",
          [Consts.KEY_RESDATA]: ''
        });
      }
    });
  });

  return router;
};