const logger = require('log4js').getLogger('SessionHelper');
const urlApi = require('url');
//Consts
const Consts = require('../constants');
const request = require('request');
const util = require('./util');
class SessionHelper {
  static setSession(req, res, cb) {
    let bodyParam = req.body;

    req.session.cookie.maxAge = bodyParam.sessionTimeout*60*1000;
    // req.session._garbage = Date.now();
    // req.session.touch();

    req.session[Consts.KEY_TOKEN] = bodyParam.token;
    req.session[Consts.KEY_SESSION_TIMEOUT] = bodyParam.sessionTimeout; // 系统设置的session超时时间
    req.session[Consts.KEY_IP] = bodyParam.ip;
    // req.session[Consts.KEY_ORG_ID] = bodyParam.orgId;
    // req.session[Consts.KEY_ORG_NAME] = bodyParam.orgName;
    req.session[Consts.KEY_USER_ID] = bodyParam.userId;
    req.session[Consts.KEY_USER_NAME] = bodyParam.userName;
    // req.session[Consts.KEY_PASSWORD] = bodyParam.password;
    req.session[Consts.KEY_LANGUAGE] = bodyParam.language;
    req.session[Consts.KEY_DOMAIN_ID] = bodyParam.domainId;
    req.session[Consts.KEY_DOMAIN_NAME] = bodyParam.domainName;

    req.session['loginTraceId'] = bodyParam.traceId;
    req.session.save(function() {
      cb();
    });
    // 保存远程主机信息
    // req.hostname / req.ip：获取主机名和IP地址
    // logger.info("locale:" + req.getLocale());
    // req.session[Consts.KEY_REMOTE_HOST_IP] = req.getRemoteHost()); // IP
    // req.session[Consts.KEY_REMOTE_PORT, req.getRemotePort()); // PORT
    // req.session[Consts.KEY_REMOTE_ADDR, req.getRemoteAddr()); // ADDR
    // req.session[Consts.KEY_REMOTE_USER, req.getRemoteUser()); // User
    // 清空当前用户操作码信息 -- 解决切换后操作码信息缓存的问题
    // req.session[Consts.KEY_OPE_LIST] = null;
  }

  static getSession(req, res) {
    return req.session;
  }

  static setPrivilege(req, res, cb) {
    let session = req.session;
    let serviceAddr = global.context.getResource('serviceAddr.json');
    let url = urlApi.format({
      protocol: Consts.HTTP,
      // hostname: '',
      // port: 8080,
      host: serviceAddr['ibase']
    });
    let options = {
      url: urlApi.resolve(url, '/ibase/v1/role/user-menu-list'),
      method: Consts.GET,
      json: true,
      body: {},
      qs: {
        page: 1,
        pageSize: 9999
      },
      headers: {
        [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
        [Consts.KEY_ACCEPT]: Consts.ACCEPT,
        'auth-token': session[Consts.KEY_TOKEN]
      }
    };

    request(options, function(err, response, body) {
      let opeCodeList = {};
      if (response.statusCode === 200 && body.flag) {
        let data = (body.resData || {}).data;
        data.forEach(function(item) {
          let menuCode = item.menuCode;
          util.ns(menuCode, opeCodeList);
        });
      }
      req.session[Consts.KEY_OPE_LIST] = opeCodeList;

      cb();
    });
  }

  static setVerifyCode(req, type, verifyCode) {
    let query = req.query;
    req.session[type] = verifyCode;
  }
}

module.exports = SessionHelper;
