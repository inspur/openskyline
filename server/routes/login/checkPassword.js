module.exports = function (options, context) {
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const request = require('request');

  router.post('/', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if ('userName' in req.session) {
      if (req.session.userName !== username) {
        res.status(403);
        res.json({});
      }
    }
    let serviceAddr = context.getResource('serviceAddr.json');
    let host = urlApi.format({
      protocol: Consts.HTTP,
      host: serviceAddr['keystone']
    });
    let options = {
      url: `${host}/v3/auth/tokens`,
      method: Consts.POST,
      json: true,
      body: {
        'auth': {
          'identity': {
            'methods': [
              'password'
            ],
            'password': {
              'user': {
                'name': username,
                'domain': {
                  'name': 'default'
                },
                'password': password
              }
            }
          }
        }
      },
      headers: {
        [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
        [Consts.KEY_ACCEPT]: Consts.ACCEPT
      }
    };
    request(options, function (error, response, body) {
      if (error || body.error) {
        if (JSON.stringify(body).indexOf('The account is locked for user') > -1) {
          res.status(401);
        } else {
          res.status(403);
        }
      }
      res.json(body);
    });
  });

  return router;
};