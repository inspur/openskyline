module.exports = function(options, context) {
  const path = require('path');
  const logger = require('log4js').getLogger('skin');
  const urlApi = require('url');
  const router = require('express').Router();
  //constants
  const Consts = require('../../constants');

  ///^(\/login\/|\/index\/)*/
  router.get(/^\/app(\.*)?.css*$/, function(req, res) {
    let theme = req.cookies.theme;
    let filePath = "";
    let __DEV__ = process.env.NODE_ENV === 'development';
    if (__DEV__) {
      filePath = path.join(Consts.DEV, Consts.STATIC, 'css');
    } else {
      filePath = path.join(Consts.DIST, Consts.STATIC, 'css');
    }
    res.type('text/css; charset=utf-8');
    switch (theme) {
    case "light":
      res.sendFile(path.join(filePath, 'app.css'));
      break;
    case "blue":
      // res.redirect(req.baseUrl + '/app_blue.css');
      res.sendFile(path.join(filePath, 'app-blue.css'));
      break;
    case "dark":
      res.sendFile(path.join(filePath, 'app-dark.css'));
      // res.redirect(req.baseUrl + '/app_dark.css');
      break;
    default:
      res.sendFile(path.join(filePath, 'app.css'));
    }
  });

  return router;
};
