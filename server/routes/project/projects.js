module.exports = function(options, context) {
  const logger = require('log4js').getLogger('Projects');
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const request = require('request');

  router.post('/', function(req, res) {
    let session = req.session;
    let body = req.body;
    let baseUrl = req.baseUrl;
    let restUrl = "/v3/auth/tokens";
    if (!baseUrl.startsWith('/')) {
      baseUrl = '/' + baseUrl;
    }
    let moduleName = baseUrl.split('/')[3];
    let host = session[Consts.KEY_SERVICES][moduleName];
    let url = urlApi.format({
      protocol: Consts.HTTP,
      // hostname: '',
      // port: 8080,
      host: host
    });
    let options = {
      url: url+restUrl,
      //if you expect binary data, you should set encoding: null
      // encoding : null, //让body 直接是buffer
      method: Consts.POST,
      json: true,
      body: {},
      qs: {},
      headers: {
        [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
        [Consts.KEY_ACCEPT]: Consts.ACCEPT,
        'X-Auth-Token': session[Consts.KEY_TOKEN] || "",
        'language': session[Consts.KEY_LANGUAGE] || ""
      }
    };
    let bodyParam = {
      "auth": {
        "identity": {
          "methods": [
            "password"
          ],
          "password": {
            "user": {
              "id": session[Consts.KEY_USER_ID],
              "password": session[Consts.KEY_PASSWORD]
            }
          }
        },
        "scope": {
          "project": {
            "id": body.pid
          }
        }
      }
    };
    options.body = bodyParam;
    request(options, function(error, response, body) {
      let pToken = response.headers["x-subject-token"];
      req.session[Consts.PROJECT_TOKEN] = pToken;

      if (!error && response.statusCode == 201) {
        res.json(body);
      } else {
        res.json({
          [Consts.KEY_FLAG]: false,
          [Consts.KEY_ERRCODE]: 'reqTimeout',
          [Consts.KEY_RESDATA]: ''
        });
      }
    });
  });

  return router;
};
