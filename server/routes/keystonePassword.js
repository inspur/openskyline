module.exports = function(options, context) {
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../constants');
  const request = require('request');

  router.post('/', function(req, res) {
    let session = req.session;
    let serviceAddr = context.getResource('serviceAddr.json');
    let host = serviceAddr['keystone'];
    let url = urlApi.format({
      protocol: Consts.HTTP,
      host: host
    });
    let ip = req.headers["x-forwarded-for"] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress || '';
    let date = new Date();
    let time = date.getTime()+date.getTimezoneOffset()*60*1000;
    req.body.user.create_time = time;
    let options = {
      url: `${url}/v3/inspur/users/${req.body.userId}/password`,
      method: Consts.POST,
      body: {
        user: req.body.user
      },
      json: true,
      headers: {
        [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
        [Consts.KEY_ACCEPT]: Consts.ACCEPT,
        'X-Auth-Token': '',
        "remote-ip": ip,
        "region-id": ''
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