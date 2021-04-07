module.exports = function(options, context) {
  const logger = require('log4js').getLogger('websocket');
  const Consts = require('../constants');
  var proxy = context.getResource('proxy');
  var serviceAddr = context.getResource('serviceAddr.json');
  var serviceIP = serviceAddr['keystone'].split(":")[0];
  var router = require('express').Router();
  try {
    router.use('/:service', function(req, res, head) {
      let session = req.session;
      req.headers['origin'] = 'wss://'+serviceIP+':6678';
      req.headers["Authorization"] = decodeURIComponent(req.query.key);
      proxy.ws(req, res.socket, head, {
        target: 'wss://'+serviceIP+':6678',
        ws: true,
        secure: false,
        changeOrigin: true
      });
    });
  } catch (error) {
    logger.error('error proxy websocket', error.stack);
  }
  return router;
};
