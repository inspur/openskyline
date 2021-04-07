module.exports = function(options, context) {
  const logger = require('log4js').getLogger('GetToken');
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const request = require('request');

  router.get('/', function(req, res) {
    let session = req.session;
    res.json({
        token:session[Consts.PROJECT_TOKEN]?session[Consts.PROJECT_TOKEN]:(session[Consts.KEY_TOKEN]?session[Consts.KEY_TOKEN]:"")
    });
  });
  return router;
};
