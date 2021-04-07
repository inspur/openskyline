const SessionHelper = require('../lib/SessionHelper');
const urlApi = require('url');
const request = require('request');
const Consts = require('../constants');
const { getOEM } = require('../lib/util');
const logger = require('log4js').getLogger('INDEX');
const uuid = require('uuid');
exports.enabled = true;
exports.mapping = '/index.html';

exports.middlewares = function(router) {
  let __DEV__ = process.env.NODE_ENV === 'development';
  let serviceAddr = context.getResource('serviceAddr.json');
  return [
    //获取OEM信息
    function(req, res, next) {
      getOEM(serviceAddr['keystone']).then(res => {
        let session = req.session;
        session = Object.assign(session, res);
        next();
      }).catch(e => {
        next();
      });
    },
    //获取项目列表
    function(req, res, next) {
      let session = req.session;
      let restUrl = "/v3/auth/projects";
      session.poc = !!serviceAddr.poc;
      session.objectStorageType = serviceAddr.objectStorageType || 'S3';
      session.S3SuperUser = serviceAddr.S3SuperUser || {};
      session.showSafeDelete = serviceAddr.showSafeDelete || false;
      session.showManageConnect = serviceAddr.showManageConnect || false;
      session.uploadImageUseFakeS3 = 'uploadImageUseFakeS3' in serviceAddr ? serviceAddr.uploadImageUseFakeS3 : true;
      session.sdsipaddress = serviceAddr.sdsipaddress || '';
      session.forceCheckCurrentUser = 'forceCheckCurrentUser' in serviceAddr ? serviceAddr.forceCheckCurrentUser : false;
      session.forceVNCPassword = 'forceVNCPassword' in serviceAddr ? serviceAddr.forceVNCPassword : false;
      session.arch = serviceAddr.arch || 'x86';
      let host = serviceAddr['keystone'];
      let url = urlApi.format({
        protocol: Consts.HTTP,
        host: host
      });
      let options = {
        url: url+restUrl,
        //if you expect binary data, you should set encoding: null
        // encoding : null, //让body 直接是buffer
        method: Consts.GET,
        json: true,
        body: {},
        qs: {},
        headers: {
          [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
          [Consts.KEY_ACCEPT]: Consts.ACCEPT,
          'X-Auth-Token': session[Consts.PROJECT_TOKEN]?session[Consts.PROJECT_TOKEN]:(session[Consts.KEY_TOKEN] || ""),
          'language': session[Consts.KEY_LANGUAGE] || ""
        }
      };
      request(options, function(error, response, body) {
        if (body && 'error' in body && String(body.error.code) === "401") {
          let loginUrl = req.baseUrl ? (req.baseUrl + '/timeout.html') : '/timeout.html';
          res.redirect(loginUrl+"?__="+new Date().getTime());
          return;
        }
        let projectList = [];
        let projects = body.projects || [];
        let flg = false;
        let roleId = req.cookies.roleType;
        let projectName;
        let projectId = req.cookies.pid;
        let roleType = req.cookies.roleType;
        projects.forEach((item, key) => {
          //用户cookie project id可用
          //考虑切换环境情况
          if (item.project_id === projectId&&item.role_type === parseInt(roleType)) {
            flg = true;
            roleId = item.role_id;
            projectName = item.project_name;
          }
          projectList.push({
            name: item.project_name,
            id: item.project_id,
            roleId:item.role_id,
            roleType:item.role_type,
            uuid:item.project_id+"&"+item.role_type,
            active: (item.project_id === projectId && item.role_type == roleType)
          });
        });
        if (!flg) {
          projectId =(projectList[0] || {}).id;
          roleType = (projectList[0] || {}).roleType;
          projectName = (projectList[0] || {}).project_name;
          roleId = (projectList[0] || {}).roleId;
          (projectList[0] || {}).active = true;
        }
        let options = {
          // secure: !__DEV__,
          maxAge: 1000 * 60 * 60 * 24, // would expire after 1 day
          httpOnly: false, // The cookie only accessible by the web server
          signed: false // Indicates if the cookie should be signed
        };
        // Set cookie
        res.cookie('pid', projectId||"", options); // options is optional
        res.cookie('roleType', roleType==undefined?"":roleType, options);
        res.cookie('roleId', roleId==undefined?"":roleId, options);
        req.body['pid'] = projectId;
        req.body['roleType'] = roleType;
        req.body['projectName'] = projectName;
        req.session['pid'] = projectId;
        req.session['roleId'] = roleId;
        req.session[Consts.KEY_ROLE_TYPE] = roleType;
        req.session[Consts.KEY_PROJECT_LIST] = projectList;
        req.session[Consts.KEY_ROLE_ID] = roleId;
        req.session.save(function () {
          next();
        });
      });
    },
    //获取菜单码
    function(req, res, next) {
      let session = req.session;
      var body = req.body;
      let restUrl = "/v3/inspur/auth/menus/"+(body.pid?(body.roleType==0?'-':body.pid):"null");
      let serviceAddr = context.getResource('serviceAddr.json');
      let host = serviceAddr['keystone'];
      let url = urlApi.format({
        protocol: Consts.HTTP,
        host: host
      });
      let options = {
        url: url+restUrl,
        //if you expect binary data, you should set encoding: null
        // encoding : null, //让body 直接是buffer
        method: Consts.GET,
        json: true,
        body: {},
        qs: {},
        headers: {
          [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
          [Consts.KEY_ACCEPT]: Consts.ACCEPT,
          'X-Auth-Token': session[Consts.PROJECT_TOKEN]?session[Consts.PROJECT_TOKEN]:(session[Consts.KEY_TOKEN] || ""),
          'language': session[Consts.KEY_LANGUAGE] || ""
        }
      };
      request(options, function(error, response, body) {
        if ( (body.error || {}).code + "" === "400") {
          let loginUrl = req.baseUrl ? (req.baseUrl + '/timeout.html?serialnumber=no') : '/timeout.html?serialnumber=no';
          res.redirect(loginUrl);
          return;
        }
        if ( (body.error || {}).code + "" === "401") {
          let loginUrl = req.baseUrl ? (req.baseUrl + '/timeout.html#') : '/timeout.html#';
          res.redirect(loginUrl);
          return;
        }
        let opeCodeList = {};
        if (body.menus && body.menus.length>0) {
          body.menus.forEach(function(item) {
            let menuCode = item.menu_code;
            opeCodeList[menuCode] = true;
          });
        }
        req.session[Consts.KEY_MENUCODE_LIST] = opeCodeList;
        next();
      });
    },
    function (req, res, next) { // 如果用户没有任何项目，则无法通过获取ptoken获取endpoints，此时使用内置的leo账号获取leo的endpoint
      let pid = req.body.pid;
      if (pid) {
        next();
      } else {
        let serviceAddr = context.getResource('serviceAddr.json');
        let leoKeystonePassword = serviceAddr.leoKeystonePassword || '';
        let host = urlApi.format({
          protocol: Consts.HTTP,
          host: serviceAddr['keystone']
        });
        let options = {
          url: `${host}/v3/auth/tokens`,
          method: Consts.POST,
          json: true,
          body: {
            "auth": {
              "identity": {
                "methods": [
                  "password"
                ],
                "password": {
                  "user": {
                    "name": "leo",
                    "domain": {
                      "name": "default"
                    },
                    "password": leoKeystonePassword
                  }
                }
              }
            }
          },
          qs: {},
          headers: {
            [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
            [Consts.KEY_ACCEPT]: Consts.ACCEPT
          }
        };
        request(options, function(error, response, body) {
          req.session[Consts.KEY_SERVICES] = {};
          req.session[Consts.KEY_REGION_SERVICES] = {};
          req.session[Consts.KEY_REGIONS] = [];
          if (error) {
            next();
          } else if (body.error) {
            next();
          } else {
            let catalog = body.token.catalog;
            let regionId = req.cookies.region_id;
            let activeRegionId = '';
            let regionServiceObj = {};
            let regions = [];
            let leoIndex = body.token.catalog.findIndex((item) => {
              return item.name === 'leo';
            });
            catalog[leoIndex].endpoints.filter((endpoint) => {
              return endpoint.interface === 'admin';
            }).forEach(region => {
              regions.push({
                region: region.region,
                region_id: region.region_id,
                active: region.region_id === regionId
              });
              if (region.region_id === regionId) {
                activeRegionId = regionId;
              }
            });
            if (activeRegionId === '') {
              activeRegionId = regions[0].region_id;
              regions[0].active = true;
            }
            body.token.catalog.forEach((service, index) => {
              service.endpoints.forEach((endpoint, index1) => {
                let urlRegExp = /^(https?:\/\/.*:\d*)\/?/;
                if (endpoint.interface === 'admin') {
                  let matches = endpoint.url.match(urlRegExp);
                  if (matches) {
                    if (!regionServiceObj[endpoint.region_id]) {
                      regionServiceObj[endpoint.region_id] = {};
                    }
                    regionServiceObj[endpoint.region_id][service.name] = matches[1];
                  }
                }
              });
            });
            req.session[Consts.KEY_SERVICES] = regionServiceObj[activeRegionId];
            req.session[Consts.KEY_REGION_SERVICES] = regionServiceObj;
            req.session[Consts.KEY_REGIONS] = regions;
            next();
          }
        });
      }
    },
    //获取ptoken
    function(req, res, next) {
      let session = req.session;
      let domainList = session.domainList;
      let projectList = session.projectList;
      let body = req.body;
      let restUrl = "/v3/auth/tokens";
      let serviceAddr = context.getResource('serviceAddr.json');
      let host = serviceAddr['keystone'];
      let url = urlApi.format({
        protocol: Consts.HTTP,
        host: host
      });
      let getPIDTraceId = 'req-'+uuid.v1();
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
          'X-Auth-Token': session[Consts.PROJECT_TOKEN]?session[Consts.PROJECT_TOKEN]:(session[Consts.KEY_TOKEN] || ""),
          'language': session[Consts.KEY_LANGUAGE] || "",
          'X-Openstack-Request-Id': getPIDTraceId
        }
      };
      let pid = body.pid;
      let roleType = body.roleType;
      let projectName = body.projectName;
      let isLogin = false;
      if (!pid) { // 无pid情况，只记录登录
        next();
        isLogin = true;
        reordLog('', session['loginTraceId']);
      } else {
        let bodyParam = {
          "auth": {
            "identity": {
              "methods": [
                "token"
              ],
              "token": {
                "id": session[Consts.KEY_TOKEN]
              }
            },
            "scope": {
              project: {
                "id": pid
              }
            }
          }
        };

        options.body = bodyParam;
        let traceId = getPIDTraceId;
        isLogin = !session[Consts.PROJECT_TOKEN];
        if (isLogin) { // 如果是登陆，则使用登陆的追踪ID
          traceId = session['loginTraceId'];
        }
        request(options, function(error, response, body) {
          if ( (body.error || {}).code + "" === "401") {
            let loginUrl = req.baseUrl ? (req.baseUrl + '/timeout.html#') : '/timeout.html#';
            res.redirect(loginUrl);
            return;
          }
          let pToken = response.headers["x-subject-token"];
          let serviceObj = {};
          let regionServiceObj = {};
          let regionList = [];
          let regionId = req.cookies.region_id;
          let activeRegionId = "";
          if (body.token&&body.token.catalog) {
            //先查看有几个region，并记录下来
            let keystoneIndex = body.token.catalog.findIndex((item) => {
              return item.name === "keystone";
            });
            let regions = body.token.catalog[keystoneIndex].endpoints.filter((item) => {
              return item.interface === "admin";
            });
            let flg = false;
            regions.forEach((item, index) => {
              regionList.push({
                region: item.region,
                region_id: item.region_id,
                active: item.region_id === regionId
              });
              if (item.region_id === regionId) {
                activeRegionId = item.region_id;
                flg = true;
              }
            });
            if (!flg) {
              regionList[0].active = true;
              activeRegionId = regionList[0].region_id;
            }
            let options = {
              // secure: !__DEV__,
              maxAge: 1000 * 60 * 60 * 24, // would expire after 1 day
              httpOnly: false, // The cookie only accessible by the web server
              signed: false // Indicates if the cookie should be signed
            };
            // Set cookie
            res.cookie('region_id', activeRegionId, options); // options is optional
            //过滤
            body.token.catalog.forEach((service, index) => {
              service.endpoints.forEach((endpoint, index1) => {
                let urlRegExp = /^(https?:\/\/.*:\d*)\/?/;
                if (endpoint.interface === 'admin') {
                  let matches = endpoint.url.match(urlRegExp);
                  if (matches) {
                    if (!regionServiceObj[endpoint.region_id]) {
                      regionServiceObj[endpoint.region_id] = {};
                    }
                    regionServiceObj[endpoint.region_id][service.name] = matches[1];
                  }
                }
              });
            });
          }
          req.session[Consts.PROJECT_TOKEN] = pToken;
          req.session[Consts.KEY_SERVICES] = regionServiceObj[activeRegionId];
          req.session[Consts.KEY_REGION_SERVICES] = regionServiceObj;
          req.session[Consts.KEY_REGIONS] = regionList;
          next();

          reordLog(activeRegionId, traceId);
        });
      }

      function reordLog(regionId, traceId) {
        //记录登陆和切换项目日志
        let o = {
          url: url+"/v3/inspur/logs",
          method: Consts.POST,
          json: true,
          body: {},
          qs: {},
          headers: {
            [Consts.KEY_CONTENT_TYPE]: Consts.CONTENT_TYPE,
            [Consts.KEY_ACCEPT]: Consts.ACCEPT,
            'language': session[Consts.KEY_LANGUAGE] || "",
            'X-Auth-Token':session[Consts.PROJECT_TOKEN]?session[Consts.PROJECT_TOKEN]:(session[Consts.KEY_TOKEN] || "")
          }
        }
        let date = new Date();
        let time = date.getTime()+date.getTimezoneOffset()*60*1000;
        o.body = {
          logs:[{
            user_name: session[Consts.KEY_USER_NAME],
            user_id:session[Consts.KEY_USER_ID],
            region_id:regionId||"",
            project_id:pid?(roleType==0?"":pid):"",
            target:"user",
            log_level:"info",
            ip:session[Consts.KEY_IP],
            create_time:time,
            description:"user："+session[Consts.KEY_USER_NAME]+" login",
            language:"en",
            trace_id: traceId
          }, {
            user_name: session[Consts.KEY_USER_NAME],
            user_id:session[Consts.KEY_USER_ID],
            region_id:regionId||"",
            project_id:pid?(roleType==0?"":pid):"",
            target:"用户",
            log_level:"信息",
            ip:session[Consts.KEY_IP],
            create_time:time,
            description:"用户："+session[Consts.KEY_USER_NAME]+"登录",
            language:"zh_cn",
            trace_id: traceId
          }]
        }
        if (!isLogin) { //代表切换项目
          if (req.cookies.switch!="region") {
            if (roleType==0) {
              o.body.logs[0].description = "user:"+session[Consts.KEY_USER_NAME]+" enter all";
              o.body.logs[1].description = "用户:"+session[Consts.KEY_USER_NAME]+" 进入所有";
            } else {
              o.body.logs[0].description = "user:"+session[Consts.KEY_USER_NAME]+" enter project:"+(projectName||"");
              o.body.logs[1].description = "用户:"+session[Consts.KEY_USER_NAME]+" 进入项目:"+(projectName||"");
            }
          } else if (req.cookies.switch=="region"){
            let region = req.cookies.region_id;
            o.body.logs[0].description = "user:"+session[Consts.KEY_USER_NAME]+" enter region:"+(region||"");
            o.body.logs[1].description = "用户:"+session[Consts.KEY_USER_NAME]+" 进入region:"+(region||"");
          }
          res.cookie('switch', "", {
            // secure: !__DEV__,
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: false,
            signed: false
          });
          request(o, function () {})
        } else { //如果没有ptoken，代表刚登陆进来
          o.body.logs[0].description = "user:"+session[Consts.KEY_USER_NAME]+" login";
          o.body.logs[1].description = "用户:"+session[Consts.KEY_USER_NAME]+"登录";
          request(o, function () {})
        }
      }
    }
  ];
};

/**
 * 路由请求成功回调函数
 * @required
 * @param  {{}} req [request]
 * @param  {{}} res [response]
 * @return {{}}
 */
exports.get = function(req, res) {
  // let options = {
  //   maxAge: 1000 * 60 * 15, // would expire after 15 minutes
  //   httpOnly: true, // The cookie only accessible by the web server
  //   signed: true // Indicates if the cookie should be signed
  // }

  // // Set cookie
  // res.cookie('cookieName', 'cookieValue', options) // options is optional
  let sessParam = SessionHelper.getSession(req, res) || {};
  // Object.assign(sessParam, sessParam.opeList);
  // sessParam.opeList = JSON.stringify(sessParam.opeList);
  res.render('index', sessParam);
};
