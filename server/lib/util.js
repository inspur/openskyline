const SessionHelper = require('../lib/SessionHelper');
const logger = require('log4js').getLogger('Login');
const request = require('request');
const urlApi = require('url');
const Consts = require('../constants');
const fs = require('fs');
const path = require('path');

exports.readHTML = function(path, callback) {
  fs.readFile(path.join(global.root, "views", path), "UTF8", function(err, data) {

  });
};

exports.readFile = function(path, callback) {
  fs.readFile(path, "UTF-8", callback);
};

exports.readFileSync = function(path) {
  return fs.readFileSync(path, "UTF-8");
};

exports.responseData = function(response, data) {
  response.send({ ret: true, data: data });
};

exports.responseError = function(response, errmsg) {
  response.send({ ret: false, errmsg: errmsg });
};

exports.ns = function(name, root) {
  var part = root || global,
    parts = name && name.split('.') || [];

  parts.forEach(function(partName, index, array) {
    if (partName) {
      part = part[partName] || (part[partName] = (index == array.length - 1 ? { flg: true } : {}));
    }
  });

  return part;
};

exports.getOEM = function(host) {
  let restUrl = `/v3/inspur/customparam/oem`;
  let url = urlApi.format({
    protocol: Consts.HTTP,
    host: host
  });
  let options = {
    url: url+restUrl,
    method: Consts.GET,
    json: true,
    headers: {
      [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
      [Consts.KEY_ACCEPT]: Consts.ACCEPT,
      'X-Auth-Token': ''
    }
  };
  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (!error) {
        let result = {
          oemSwitch: false,
          oemProductLogo: '',
          oemBrandLogo: '',
          oemProductName: '',
          oemVersion: '',
          oemEmail: '',
          oemAddress: '',
          oemCopyright: ''
        };
        try {
          if ('oem_switch' in body && body.oem_switch instanceof Array && body.oem_switch.length > 0) {
            result.oemSwitch = body.oem_switch[0].value === '1';
            if ('oem_product_logo' in body && body.oem_product_logo instanceof Array && body.oem_product_logo.length > 0) {
              result.oemProductLogo = body.oem_product_logo[0].value;
            }
            if ('oem_brand_logo' in body && body.oem_brand_logo instanceof Array && body.oem_brand_logo.length > 0) {
              result.oemBrandLogo = body.oem_brand_logo[0].value;
            }
            if ('oem_info' in body && body.oem_info instanceof Array && body.oem_info.length > 0) {
              let oemInfo = JSON.parse(body.oem_info[0].value);
              result.oemProductName = 'productName' in oemInfo ? oemInfo.productName : '';
              result.oemVersion = 'version' in oemInfo ? oemInfo.version : '';
              result.oemEmail = 'email' in oemInfo ? oemInfo.email : '';
              result.oemAddress = 'address' in oemInfo ? oemInfo.address : '';
              result.oemCopyright = 'copyright' in oemInfo ? oemInfo.copyright : '';
            }
          }
        } catch (e) {
          console.error(e);
        }
        resolve(result);
      } else {
        reject(error);
      }
    });
  });
}
