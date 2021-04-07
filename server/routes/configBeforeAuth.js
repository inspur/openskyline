module.exports = function(options, context) {
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../constants');
  const request = require('request');

  router.get('/', function(req, res) {
    let serviceAddr = context.getResource('serviceAddr.json');
    let host = serviceAddr['keystone'];
    let url = urlApi.format({
      protocol: Consts.HTTP,
      host: host
    });
    let options = {
      url: `${url}/v3/inspur/system/config/before-auth`,
      method: Consts.GET,
      json: true,
      headers: {
        [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
        [Consts.KEY_ACCEPT]: Consts.ACCEPT,
        'X-Auth-Token': ''
      }
    };
    res.header('Cache-Control', 'no-cache');
    request(options, function(error, response, body) {
      if (body && body.error) {
        res.status(body.error.code);
      }
      res.json(body);
    });
  });

  return router;
};