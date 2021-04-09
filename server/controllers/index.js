const SessionHelper = require('../lib/SessionHelper');
const request = require('request');
const Consts = require('../constants');
const uuid = require('uuid');
exports.enabled = true;
exports.mapping = '/index.html';

async function getProjects(endpoint, unscopedToken) {
  let options = {
    url: endpoint + '/v3/auth/projects',
    method: 'GET',
    json: true,
    body: {},
    headers: {
      'X-Auth-Token': unscopedToken
    }
  };
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

async function getScopedToken(endpoint, unscopedToken, projectId) {
  let options = {
    url: endpoint + '/v3/auth/tokens',
    method: 'POST',
    json: true,
    body: {
      "auth": {
        "identity": {
          "methods": [
            "token"
          ],
          "token": {
            "id": unscopedToken
          }
        },
        "scope": {
          "project": {
            "id": projectId
          }
        }
      }
    },
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': unscopedToken
    }
  };
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve({ response, body });
      }
    });
  });
}

async function getMenus() {
  return { "m.systemmanage": true, "m.systemmanage.departmentmanage": true, "m.systemmanage.groupmanage": true, "m.systemmanage.ipsetting": true, "m.systemmanage.opreatelog": true, "m.systemmanage.paramsetting": true, "m.systemmanage.paramsetting.businesstemplate": true, "m.systemmanage.paramsetting.copyRightSetting": true, "m.systemmanage.paramsetting.logsetting": true, "m.systemmanage.paramsetting.metadata": true, "m.systemmanage.paramsetting.moduleswitch": true, "m.systemmanage.paramsetting.systemsetting": true, "m.systemmanage.projectmanage": true, "m.systemmanage.rolemanage": true, "m.systemmanage.serialnumber": true, "m.systemmanage.systemstatus": true, "m.systemmanage.usermanage": true, "m.network": true, "m.network.balance": true, "m.network.firewall": true, "m.network.flaotingip": true, "m.network.network": true, "m.network.router": true, "m.network.securitygroup": true, "m.network.topo": true, "m.network.vpn": true, "m.docker_server": true, "m.docker_server.clusters": true, "m.docker_server.images": true, "m.docker_server.instances": true, "m.docker_server.volume": true, "m.heat": true, "m.heat.stack": true, "m.heat.template": true, "m.calculate": true, "m.calculate.disk": true, "m.calculate.host": true, "m.calculate.instance": true, "m.calculate.keypair": true, "m.calculate.media": true, "m.calculate.resourcespec": true, "m.calculate.snapshot": true, "m.senlin": true, "m.workflow": true, "m.workflow.task": true, "m.operationmanage": true, "m.operationmanage.fault": true, "m.operationmanage.flowmanage": true, "m.operationmanage.orderapprove": true, "m.operationmanage.orderlist": true, "m.calculate.fileStorage": true, "m.calculate.physical": true, "m.database": true, "m.calculate.baremetal": true, "m.systemmanage.usermanage.add": true, "m.systemmanage.usermanage.assignrole": true, "m.systemmanage.usermanage.delete": true, "m.systemmanage.usermanage.disable": true, "m.systemmanage.usermanage.edit": true, "m.systemmanage.usermanage.enable": true, "m.systemmanage.usermanage.resetpassword": true, "m.systemmanage.usermanage.unlock": true, "m.systemmanage.usermanage.userroledetail": true, "m.systemmanage.rolemanage.add": true, "m.systemmanage.rolemanage.delete": true, "m.systemmanage.rolemanage.detail": true, "m.systemmanage.rolemanage.edit": true, "m.systemmanage.groupmanage.add": true, "m.systemmanage.groupmanage.assignrole": true, "m.systemmanage.groupmanage.delete": true, "m.systemmanage.groupmanage.edit": true, "m.systemmanage.groupmanage.personmanage": true, "m.systemmanage.ipsetting.add": true, "m.systemmanage.ipsetting.delete": true, "m.systemmanage.ipsetting.edit": true, "m.systemmanage.projectmanage.create": true, "m.systemmanage.projectmanage.delete": true, "m.systemmanage.projectmanage.edit": true, "m.systemmanage.projectmanage.roledetail": true, "m.systemmanage.projectmanage.updategroup": true, "m.systemmanage.projectmanage.updateperson": true, "m.systemmanage.projectmanage.updatequota": true, "m.systemmanage.projectmanage.usage": true, "m.startpage": true, "m.operationmanage.cost": true, "m.operationmanage.pricesetting": true, "m.operationmanage.report": true, "m.network.qos": true, "m.calculate.logictopo": true, "m.monitor": true, "m.monitor.AlertMange": true, "m.monitor.monitorset": true, "m.monitor.resourcemonitor": true, "m.systemmanage.paramsetting.pimsetting": true, "m.operationAnalysis": true, "m.operationAnalysis.TrendPredict": true, "m.monitor.CustomGraph": true, "m.operationAnalysis.HealthStatus": true, "m.operationAnalysis.logSearch": true, "m.operationAnalysis.logAnalysis": true, "m.operationAnalysis.logError": true, "m.docker_server.kbclusters": true, "m.calculate.recycleBin": true, "m.monitor.EventMonitor": true, "m.operationAnalysis.noThresholdAnomalyDetection": true, "m.systemmanage.certManage": true, "m.operationAnalysis.CLUSTER_RESOURCE_PREDICTION": true, "m.sahara": true, "m.sahara.cluster": true, "m.sahara.clustertemplate": true, "m.sahara.image": true, "m.sahara.nodegroup": true };
}

async function getRegions() {
  return [{ "region": "RegionOne", "region_id": "RegionOne", "active": true }];
}

function cutEndpointUrl(url) {
  url = new URL(url);
  let result = url.origin;
  if (url.pathname !== '') {
    result += '/'+url.pathname.split('/')[1];
  }
  return result;
}

exports.middlewares = function (router) {
  const __DEV__ = process.env.NODE_ENV === 'development';
  const serviceAddr = context.getResource('serviceAddr.json');
  const endpoint = `http://${serviceAddr.keystone}`;
  return [
    async function (req, res, next) {
      const session = req.session;

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

      const unscopedToken = session['token'];
      // 获取项目
      let projects = (await getProjects(endpoint, unscopedToken)).projects;
      let projectId = '';
      if (projects.length > 0) {
        projectId = projects[0].id;
        projects[0].active = true;
      }
      // 通过项目获取pToken，并且获取roleId和roleType
      let { body: tokenBody, response: tokenResponse } = await getScopedToken(endpoint, unscopedToken, projectId);
      let scopedToken = tokenResponse.headers['x-subject-token'];
      let roles = tokenBody.token.roles;
      let catalog = tokenBody.token.catalog;
      let services = {};
      for (let catalogItem of catalog) {
        let endpointItem = catalogItem.endpoints[0];
        services[catalogItem['name']] = cutEndpointUrl(endpointItem.url);
      }
      let region = 'RegionOne';
      let roleType = '';
      let roleId = '';
      let adminRole = roles.find(item => item.name === 'admin');
      if (adminRole) {
        roleType = 0;
        roleId = adminRole.id;
      } else {
        let memberRole = roles.find(item => item.name === 'member');
        if (memberRole) {
          roleType = 2;
          roleId = memberRole.id;
        }
      }
      req.session[Consts.KEY_PROJECT_LIST] = projects;
      req.session[Consts.PROJECT_TOKEN] = scopedToken;

      res.cookie('pid', projectId || "");
      res.cookie('roleType', roleType);
      res.cookie('roleId', roleId);
      req.session['pid'] = projectId;
      req.session['roleId'] = roleId;

      // 获取菜单
      req.session[Consts.KEY_MENUCODE_LIST] = await getMenus();
      req.session[Consts.KEY_SERVICES] = services;
      req.session[Consts.KEY_REGION_SERVICES] = [];
      req.session[Consts.KEY_REGIONS] = await getRegions();
      next();
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
exports.get = function (req, res) {
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
