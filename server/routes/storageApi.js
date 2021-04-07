module.exports = function(options, context) {
  const logger = require('log4js').getLogger('storageApi');
  //Consts
  const Consts = require('../constants');
  var proxy = context.getResource('proxy');
  var router = require('express').Router();

  router.use("/:service", function(req, res) {
    let session = req.session;
    let body = req.body;
    let moduleName = req.params.service;
    req.headers[Consts.KEY_CONTENT_TYPE] = Consts.CONTENT_TYPE;
    req.headers[Consts.KEY_ACCEPT] = Consts.ACCEPT;
    // 会话时间
    let polling = body[Consts.POLLING];
    polling && (req.headers['auth-keep'] = 'false');
    let language = session[Consts.KEY_LANGUAGE];
    req.headers["language"] = language || "";
    let timeoutControl = body[Consts.TIME_OUT_CONTROL];
    res.header("Cache-Control","no-cache");
    if (req.query.reqType=="https") {
      proxy.web(req, res, {
        target: 'https://' + moduleName,
        secure:false
      });
    } else {
      proxy.web(req, res, {
        target: 'http://' + moduleName
      });
    }
  });

  return router;
};
