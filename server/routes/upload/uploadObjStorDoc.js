module.exports = function(options, context) {
  const logger = require('log4js').getLogger('UploadObjStorDocAction');
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const request = require('request');
  const formidable = require('formidable');
  const fs = require('fs');
  const path = require('path');
  const mime = require('mime');

  // parse a file upload
  router.use(function(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var old_path = files.file.path,
        file_size = files.file.size,
        file_name = files.file.name;
      // fs.readFile(old_path, function(err, data) {
      //   fs.unlink(old_path, function(err) {
      //     if (err) {
      //       logger.warn('Unlink ' + old_path + ' Failed');
      //     } else {
      //       logger.info('Unlink ' + old_path + ' Success');
      //     }
      //   });
        if (err) {
          logger.error(err);
          req.files = {
            error: err
          };
          req.fields = fields;
        } else {
          req.files = {
            fileSize: -1, //切记，大小不一致与上次文件损坏的问题
            path: old_path,
            name:file_name
          };
          req.fields = fields;
        }
        next();
      // });
    });
  });

  router.post('/', function(req, res) {
    let session = req.session;
    let fields = req.fields;
    let qParam = req.query;
    let language = qParam["language"];
    //let imageId = fields["imageUuid"];
    let containerName = fields["containerName"];
    let fileNameTemp = fields["fileName"];
    let projectId = fields["projectId"];
    fileNameTemp =encodeURI(fileNameTemp);
    containerName = encodeURI(containerName);
    projectId = encodeURI(projectId);
    let restUrl = "/swift/swift/v1/" + projectId + "/"  + containerName + "/" + fileNameTemp;
    //let restUrl = "/glance/v2/images/" + imageId + "/file";
    if (!restUrl.startsWith('/')) {
      restUrl = '/' + restUrl;
    }
    let moduleName = restUrl.split('/')[1];
    let host = session[Consts.KEY_SERVICES][moduleName];
    let files = req.files;
    let path = files.path;
    //let opUrl = "/v2/images/" + imageId + "/file";
    let opUrl = "/swift/v1/" + projectId + "/"  + containerName + "/" + fileNameTemp;
    let options = {
      url: urlApi.resolve(host, opUrl),
      //if you expect binary data, you should set encoding: null
      // encoding: null, //让body 直接是buffer
      method: Consts.PUT,
      // json: true,
      // body: {},
      headers: {
        'Content-type': mime.lookup(files.name), //'text/html; charset=utf-8',
        'auth-token': session[Consts.KEY_TOKEN],
        'X-Auth-Token': session[Consts.PROJECT_TOKEN],
        'language': session[Consts.KEY_LANGUAGE]
      }
    };
    if (files['error']) {
      logger.error(files['error']);
      return res.json({
        [Consts.KEY_FLAG]: false,
        [Consts.KEY_ERRCODE]: 'reqTimeout',
        [Consts.KEY_RESDATA]: ''
      });
    }
    var rs = fs.createReadStream(path);
    // options.body = files.binaryData;
    var httpreq = request(options, function(error, response, body) {
      if (!error && (response.statusCode == 201 || response.statusCode == 204)) {
        res.json({
          [Consts.KEY_FLAG]: true
        });
      } else {
        res.json({
          [Consts.KEY_FLAG]: false,
          [Consts.KEY_ERRCODE]: response.statusCode,
          [Consts.KEY_RESDATA]: body
        });
      }
    });
    rs.pipe(httpreq);
    rs.on("error", function (err) {
      logger.error('出错了:' + err);
    });
    rs.on("end", function() {
      fs.unlink(path, function(err) {
          if (err) {
            logger.warn('Unlink ' + path + ' Failed');
          } else {
            logger.info('Unlink ' + path + ' Success');
          }
      });
    });
  });

  return router;
};
