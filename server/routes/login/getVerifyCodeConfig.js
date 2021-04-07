module.exports = function(options, context) {
  const mysql = require('promise-mysql');
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const request = require('request');

  router.get('/', function(req, res) {
    req.session.showVerifyCode = false;
    res.header("Cache-Control","no-cache");
    res.json({
      verification_code: {
        config_key: "verificationCode",
        config_value: "0"
      }
    });
  });

  return router;
};
