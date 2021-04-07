module.exports = function (options, context) {
  const exec = require('child_process').exec;
  const os = require('os');
  const path = require('path');

  const logger = require('log4js').getLogger('UploadTemplateAction');
  const urlApi = require('url');
  const router = require('express').Router();
  //Consts
  const Consts = require('../../constants');
  const request = require('request');
  const formidable = require('formidable');
  const fs = require('fs');

  // parse a file upload
  router.use(function (req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      if (err) {
        logger.error(err);
        req.files = {
          error: err
        };
        req.fields = fields;
      } else {
        var oldPath = files.file.path;
        req.files = {
          fileSize: -1, //切记，大小不一致与上次文件损坏的问题
          path: oldPath
        };
        req.fields = fields;
      }
      next();
    });
  });

  router.use(function (req, res, next) {
    let session = req.session;
    let platform = os.platform();
    let cmd = '';
    if (platform === 'linux') {
      cmd = 'exec qemu-img';
    } else if (platform === 'win32') {
      cmd = path.resolve(__dirname, '..\\..\\lib\\qemu-img\\win32\\qemu-img.exe');
    }
    let fileName = req.files.path;
    cmd = `${cmd} info ${fileName}`;
    exec(cmd, function (error, stdout, stderr) {
      if (error) {
        logger.error(error);
        next();
      } else {
        console.log(stdout);
        let reg = /virtual size: .* \((\d*) bytes\)/;
        let matches = stdout.match(reg);
        if (matches === null) {
          logger.error('cmd get qemu-img info cannot match virtual size.');
          next();
        } else {
          let id = req.fields.imageUuid;
          let host = session[Consts.KEY_SERVICES]['glance'];
          let restUrl = `/v2/images/${id}`;
          let options = {
            url: urlApi.resolve(host, restUrl),
            method: 'patch',
            body: JSON.stringify([{
              "op": "add",
              "path": "/inspur_virtual_size",
              "value": `${matches[1]}`
            }]),
            headers: {
              'Content-Type': 'application/openstack-images-v2.1-json-patch',
              'auth-token': session[Consts.KEY_TOKEN],
              'X-Auth-Token': session[Consts.PROJECT_TOKEN],
              'language': session[Consts.KEY_LANGUAGE]
            }
          };
          console.log(options);
          request(options, (error, response, body) => {
            console.log('error:', error);
            console.log('body:', body);
            next();
          });
        }
      }
    });
  });

  router.post('/', function (req, res) {
    let session = req.session;
    let fields = req.fields;
    let imageId = fields["imageUuid"];
    let restUrl = "/glance/v2/images/" + imageId + "/file";
    if (!restUrl.startsWith('/')) {
      restUrl = '/' + restUrl;
    }
    let moduleName = restUrl.split('/')[1];
    let host = session[Consts.KEY_SERVICES][moduleName];
    let opUrl = "/v2/images/" + imageId + "/file";
    let options = {
      url: urlApi.resolve(host, opUrl),
      method: Consts.PUT,
      headers: {
        'Content-type': 'application/octet-stream',
        'auth-token': session[Consts.KEY_TOKEN],
        'X-Auth-Token': session[Consts.PROJECT_TOKEN],
        'language': session[Consts.KEY_LANGUAGE]
      }
    };
    let files = req.files;
    if (files['error']) {
      logger.error(files['error']);
      return res.json({
        [Consts.KEY_FLAG]: false,
        [Consts.KEY_ERRCODE]: files['name'] + '上传失败，文件上传超时或网络异常，请重新上传!',
        [Consts.KEY_RESDATA]: ''
      });
    }
    let fileName = files.path;
    var rs = fs.createReadStream(fileName);
    var httpreq = request(options, function (error, response, body) {
      if (!error && (response.statusCode === 200 || response.statusCode === 204)) {
        res.json({
          [Consts.KEY_FLAG]: true
        });
      } else {
        res.json({
          [Consts.KEY_FLAG]: false,
          [Consts.KEY_ERRCODE]: files['name'] + '上传失败!',
          [Consts.KEY_RESDATA]: ''
        });
      }
    });
    rs.pipe(httpreq);
    rs.on("end", function () {
      fs.unlink(fileName, function (err) {
        if (err) {
          logger.warn('Unlink ' + fileName + ' Failed');
        } else {
          logger.info('Unlink ' + fileName + ' Success');
        }
      });
    });
  });

  return router;
};
