module.exports = function(options, context) {
  const logger = require('log4js').getLogger('S3Api');
  var bodyParser = require('body-parser');
  //Consts
  const Consts = require('../constants');
  var proxy = context.getResource('proxy');
  var router = require('express').Router();
  var AWS = require('aws-sdk');
  var signer = require('aws-sdk/lib/signers/s3');

  router.use(bodyParser.json())
        .use(bodyParser.urlencoded({
          extended: false
        }))
  .use("/:service", function(req, res) {
    let service = req.params.service;
    let session = req.session;
    if (service === 'cacheAKSK') {
      // 暂存ak/sk到session - 项目切换需要更新ak/sk
      let ak = req.query.ak,
          sk = req.query.sk;
      // logger.warn('req.body', req.body);
      session[Consts.S3AK] = ak;
      session[Consts.S3SK] = sk;
      session.save(function() {
        res.status(200);
        res.end();
      });
      // res.status(200);
      // res.end();
    } else if (service === 'rgw') {
      // logger.warn('req.headers - before\n', req.headers);
      let s3hostAddr = session[Consts.KEY_SERVICES]['S3'];
      let reqDate = req.headers['x-amz-date'];
      delete req.headers['x-amz-date'];
      delete req.headers['authorization'];

      let param2sign = {
        method: req.method,
        headers: [],
        path: req.url
      };
      // lib/signer/s3 读取Content-Type字段
      // 将content-type转为Content-Type - 首字母大写
      if (req.headers['content-type']) {
        param2sign.headers['Content-Type'] =  req.headers['content-type'];
      }
      if (req.headers['content-md5']) {
        param2sign.headers['Content-MD5'] =  req.headers['content-md5'];
      }
      AWS.util.each(req.headers, function (name) {
        if (name.match(/^x-amz-/i)) {
          param2sign.headers[name] =  req.headers[name];
        }
      });

      let requestSigner = new signer(param2sign);
      // 从session读取ak/sk
      let ak = session[Consts.S3AK],
          sk = session[Consts.S3SK];
      // 为请求生成signatrue - req.headers中增加Authorization和X-Amz-Date字段
      requestSigner.addAuthorization({
        accessKeyId: ak,
        secretAccessKey: sk
      }, new Date(reqDate || new Date()));

      // logger.warn('requestSigner.stringToSign()\n', requestSigner.stringToSign());
      req.headers['x-amz-date'] = param2sign.headers['X-Amz-Date'];
      req.headers['Authorization'] = param2sign.headers['Authorization'];
      // logger.warn('req.headers - after\n', req.headers);
      proxy.web(req, res, {
        target: s3hostAddr
      });
    } else {
      res.status(400);
      res.write('not rgw related request, rgw request should use /s3-api/rgw or /s3-api/cacheAKSK');
      res.end();
    }
  });
  return router;
};
