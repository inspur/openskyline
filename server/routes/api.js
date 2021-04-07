module.exports = function(options, context) {
  const logger = require('log4js').getLogger('API');
  //Consts
  const Consts = require('../constants');
  const url = require('url');
  const proxy = context.getResource('proxy');
  const router = require('express').Router();
  const _ = require('underscore');

  // 路径的菜单码权限校验
  router.use(function(req, res, next) {
    let permissions = [];
    permissions.push({ method: 'get', test: /^$/, anyOf: ['m.systemmanage'] });
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/domains\/config\/(.*)/, anyOf: [] });
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/customparam\/logo/, anyOf: [] });
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/users\/(.*)/, anyOf: [] });
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/serialnumber/, anyOf: [] });
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/system\/config\/file-conf/, anyOf: [] });
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/projects/, anyOf: [] });
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/users\/(.*)\/projects/, anyOf: [] });
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/assignments\/projects\/(.*)\/users/, anyOf: [] });
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/users/, anyOf: [] });
    permissions.push({ method: 'patch', test: /^\/keystone\/v3\/inspur\/users\/self/, anyOf: [] });
    permissions.push({ method: 'post', test: /^\/keystone\/v3\/inspur\/users\/self/, anyOf: [] });
    permissions.push({ method: 'put', test: /^\/leo\/v1\/order\/get_approve_order_amount/, anyOf: [] });
    permissions.push({ method: 'put', test: /^\/leo\/v1\/order\/get_applicant_order_list/, anyOf: [] });
    permissions.push({ method: 'post', test: /^\/leo\/v1\/order\/create_order/, anyOf: [] });
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/auth\/menus\/-/, anyOf: [] });
    // 组
    // 组列表
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/groups/, anyOf: ['m.systemmanage.groupmanage', 'm.systemmanage.project.projectmanage'] });
    // 新建组
    permissions.push({ method: 'post', test: /^\/keystone\/v3\/groups/, anyOf: ['m.systemmanage.groupmanage.add'] });
    // 编辑组
    permissions.push({ method: 'patch', test: /^\/keystone\/v3\/groups\/(.*)/, anyOf: ['m.systemmanage.groupmanage.edit'] });
    // 删除组
    permissions.push({ method: 'delete', test: /^\/keystone\/v3\/inspur\/groups\/(.*)/, anyOf: ['m.systemmanage.groupmanage.delete'] });
    // 组赋权列表
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/assignments\/groups\/(.*)\/roles/, anyOf: ['m.systemmanage.groupmanage.assignrole'] });
    // 组赋权
    permissions.push({ method: 'post', test: /^\/keystone\/v3\/inspur\/assignments\/groups\/(.*)\/roles/, anyOf: ['m.systemmanage.groupmanage.assignrole'] });
    // 组赋权
    permissions.push({ method: 'delete', test: /^\/keystone\/v3\/inspur\/assignments\/groups\/(.*)\/role\/(.*)/, anyOf: ['m.systemmanage.groupmanage.assignrole'] });
    // 人员维护
    permissions.push({ method: 'put', test: /^\/keystone\/v3\/groups\/(.*)\/users\/(.*)/, anyOf: ['m.systemmanage.groupmanage.personmanage'] });
    // 人员维护
    permissions.push({ method: 'delete', test: /^\/keystone\/v3\/groups\/(.*)\/users\/(.*)/, anyOf: ['m.systemmanage.groupmanage.personmanage'] });

    // IP黑白名单
    // 获取IPSetting黑名单
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/system\/ipblacklist/, anyOf: ['m.systemmanage.ipsetting'] });
    // 获取IPSetting白名单
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/system\/ipwhitelist/, anyOf: ['m.systemmanage.ipsetting'] });
    // 新建IPSetting黑名单
    permissions.push({ method: 'post', test: /^\/keystone\/v3\/inspur\/system\/ipblacklist/, anyOf: ['m.systemmanage.ipsetting.add'] });
    // 新建IPSetting白名单
    permissions.push({ method: 'post', test: /^\/keystone\/v3\/inspur\/system\/ipwhitelist/, anyOf: ['m.systemmanage.ipsetting.add'] });
    // 删除IPSetting黑名单
    permissions.push({ method: 'delete', test: /^\/keystone\/v3\/inspur\/system\/ipblacklist/, anyOf: ['m.systemmanage.ipsetting.delete'] });
    // 删除IPSetting白名单
    permissions.push({ method: 'delete', test: /^\/keystone\/v3\/inspur\/system\/ipwhitelist/, anyOf: ['m.systemmanage.ipsetting.delete'] });
    // 编辑IPSetting黑名单
    permissions.push({ method: 'patch', test: /^\/keystone\/v3\/inspur\/system\/ipblacklist/, anyOf: ['m.systemmanage.ipsetting.edit'] });
    // 编辑IPSetting白名单
    permissions.push({ method: 'patch', test: /^\/keystone\/v3\/inspur\/system\/ipwhitelist/, anyOf: ['m.systemmanage.ipsetting.edit'] });

    // 角色管理
    // 角色列表
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/roles/, anyOf: ['m.systemmanage.rolemanage', 'm.systemmanage.project.projectmanage'] });
    // 权限列表
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/menus\/(.*)/, anyOf: ['m.systemmanage.rolemanage'] });
    // 添加角色
    permissions.push({ method: 'post', test: /^\/keystone\/v3\/inspur\/roles/, anyOf: ['m.systemmanage.rolemanage.add'] });
    // 删除角色
    permissions.push({ method: 'delete', test: /^\/keystone\/v3\/inspur\/roles\/(.*)/, anyOf: ['m.systemmanage.rolemanage.delete'] });
    // 查看角色
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/roles\/(.*)/, anyOf: ['m.systemmanage.rolemanage.detail'] });
    // 编辑角色
    permissions.push({ method: 'patch', test: /^\/keystone\/v3\/inspur\/roles\/(.*)/, anyOf: ['m.systemmanage.rolemanage.edit'] });

    // 项目管理
    // 项目列表
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/projects/, anyOf: ['m.systemmanage.projectmanage'] });
    // 项目组列表
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/assignments\/projects\/groups/, anyOf: ['m.systemmanage.projectmanage', 'm.systemmanage.project.projectmanage'] });
    // 修改组
    permissions.push({ method: 'post', test: /^\/keystone\/v3\/inspur\/assignments\/projects\/(.*)\/groups/, anyOf: ['m.systemmanage.projectmanage.updategroup', 'm.systemmanage.project.projectmanage'] });
    // 修改组
    permissions.push({ method: 'delete', test: /^\/keystone\/v3\/inspur\/assignments\/projects\/(.*)\/groups/, anyOf: ['m.systemmanage.projectmanage.updategroup', 'm.systemmanage.project.projectmanage'] });
    // 修改成员
    permissions.push({ method: 'post', test: /^\/keystone\/v3\/inspur\/assignments\/projects\/(.*)/, anyOf: ['m.systemmanage.projectmanage.updateperson', 'm.systemmanage.project.projectmanage'] });
    // 修改成员
    permissions.push({ method: 'delete', test: /^\/keystone\/v3\/inspur\/assignments\/projects\/(.*)/, anyOf: ['m.systemmanage.projectmanage.updateperson', 'm.systemmanage.project.projectmanage'] });

    // 用户管理
    // 用户列表
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/users/, anyOf: ['m.systemmanage.usermanage'] });
    // 组织列表
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/departments/, anyOf: ['m.systemmanage.usermanage', 'm.operationmanage.flowmanage'] });
    // 用户角色列表、权限详情
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/assignments\/users\/(.*)\/roles/, anyOf: ['m.systemmanage.usermanage', 'm.systemmanage.usermanage.userroledetail', 'm.systemmanage.usermanage.assignrole'] });
    // 给用户删除角色（
    permissions.push({ method: 'post', test: /^\/keystone\/v3\/inspur\/assignments\/users\/(.*)\/role\/(.*)/, anyOf: ['m.systemmanage.usermanage.assignrole'] });
    // 给用户添加角色
    permissions.push({ method: 'post', test: /^\/keystone\/v3\/inspur\/assignments\/users\/(.*)\/roles/, anyOf: ['m.systemmanage.usermanage.assignrole'] });
    // 添加用户
    // permissions.push({ method: 'post', test: /^\/keystone\/v3\/users/, anyOf: ['m.systemmanage.usermanage.add'] });
    // 删除用户
    permissions.push({ method: 'delete', test: /^\/keystone\/v3\/users\/(.*)/, anyOf: ['m.systemmanage.usermanage.delete'] });
    // 编辑、禁用用户、启用用户、解锁用户、重置密码
    permissions.push({ method: 'patch', test: /^\/keystone\/v3\/inspur\/users\/(.*)/, anyOf: ['m.systemmanage.usermanage.edit', 'm.systemmanage.usermanage.disable', 'm.systemmanage.usermanage.enable', 'm.systemmanage.usermanage.unlock', 'm.systemmanage.usermanage.resetpassword'] });

    // 参数设置
    // 日志获取
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/logs\/param/, anyOf: ['m.systemmanage.paramsetting'] });
    // 日志设置
    permissions.push({ method: 'patch', test: /^\/keystone\/v3\/inspur\/logs\/param/, anyOf: ['m.systemmanage.paramsetting.logsetting'] });
    // 删除日志
    permissions.push({ method: 'delete', test: /\/keystone\/v3\/inspur\/logs/, anyOf: ['m.systemmanage.paramsetting.logsetting'] });

    // 操作日志
    // 获取日志
    permissions.push({ method: 'get', test: /^\/keystone\/v3\/inspur\/logs/, anyOf: ['m.systemmanage.opreatelog'] });

    let menuCodes = Consts.KEY_MENUCODE_LIST in req.session ? Object.keys(req.session[Consts.KEY_MENUCODE_LIST]) : [];
    let menuCodeWhiteList = permissions.map(item => item.anyOf);
    menuCodeWhiteList = _.flatten(menuCodeWhiteList);

    let forbid = false;
    let match = false;
    // 如果当前访问的路径，在白名单的范围之内，则检查当前用户是否拥有访问该菜单的权限（菜单码），如果没有则拒绝访问
    let currentPath = req.path.toLowerCase();
    let currentMethod = req.method.toLowerCase();
    for (let permission of permissions) {
      if (permission.test.test(currentPath) && currentMethod === permission.method) {
        match = true;
        if (permission.anyOf.length === 0) {
          forbid = false;
        } else {
          if (permission.anyOf.findIndex(menuCode => menuCodes.includes(menuCode)) === -1) {
            forbid = true;
          }
        }
        break;
      }
    }

    // 如果当前所有的权限是白名单权限的子集，则当前管理员判断为安全管理员或审计管理员。此时限制访问其他接口
    if (isSubSet(menuCodes, menuCodeWhiteList)) {
      if (!match) {
        forbid = true;
      }
    }

    if (forbid) {
      res.status(401);
      res.end();
    } else {
      next();
    }
  });

  router.use('/:service', function(req, res) {
    let session = req.session;
    let body = req.body;
    let moduleName = req.params.service;
    let services;
    if (req.headers.regionid && req.headers.regionid !== req.cookies.region_id) { //调用其它region接口
      services = session[Consts.KEY_REGION_SERVICES][req.headers.regionid];
    } else {
      services = session[Consts.KEY_SERVICES];
    }
    if (req.method === "OPTIONS" || req.method === "HEAD") {
      res.status(403);
      res.end();
    }
    if (!services) {
      res.status(401);
      res.end();
    } else {
      let service = services[moduleName];
      if (!service && moduleName === "keystone") {
        let serviceAddr = context.getResource('serviceAddr.json');
        service = 'http://' + serviceAddr['keystone'];
      }
      if (service) {
        if (moduleName === 'ironic') {
          req.headers['X-OpenStack-Ironic-API-Version'] = 'latest';
        }
        if (moduleName === 'manila') {
          req.headers['X-Openstack-Manila-Api-Version'] = '2.32';
        }
        if (moduleName === 'swift') {
          service += '/swift';
        }
        let host = url.parse(service);
        req.headers.host = host.hostname || '';
        req.headers[Consts.KEY_CONTENT_TYPE] = Consts.CONTENT_TYPE;
        req.headers[Consts.KEY_ACCEPT] = Consts.ACCEPT;
        req.headers['X-Auth-Token'] = session[Consts.PROJECT_TOKEN]?session[Consts.PROJECT_TOKEN]:(session[Consts.KEY_TOKEN]?session[Consts.KEY_TOKEN]:"");
        // 会话时间
        let polling = body[Consts.POLLING];
        polling && (req.headers['auth-keep'] = 'false');
        let language = session[Consts.KEY_LANGUAGE];
        let date = new Date();
        req.headers["request-time"] = date.getTime()+date.getTimezoneOffset()*60*1000;
        req.headers["region-id"] = req.cookies.region_id||"";
        req.headers["remote-ip"] = session[Consts.KEY_IP];
        req.headers["language"] = language || "";
        res.header("Cache-Control", "no-cache");
        if (host.protocol === 'https:') {
          proxy.web(req, res, {
            target: service,
            secure: false
          });
        } else {
          proxy.web(req, res, {
            target: service
          });
        }
      } else {
        res.status(503);
        res.end();
      }
    }
  });

  /**
   * 判断数组A是否为数组B的子集
   * @param {*} a 数组A
   * @param {*} b 数组B
   */
  function isSubSet(a, b) {
    let result = true;
    for (let aItem of a) {
      if (b.indexOf(aItem) === -1) {
        result = false;
        break;
      }
    }
    return result;
  }

  return router;
};
