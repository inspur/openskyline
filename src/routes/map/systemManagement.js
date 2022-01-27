const systemManagement = resolve => {
  require.ensure(['views/systemManagement/SystemManagement.vue'], () => {
    resolve(require('views/systemManagement/SystemManagement.vue'));
  }, 'systemManagement');
};

const departmentManage = resolve => {
  require.ensure(['views/systemManagement/departmentManage/DepartmentManage.vue'], () => {
    resolve(require('views/systemManagement/departmentManage/DepartmentManage.vue'));
  }, 'departmentManage');
};

const newDepart = resolve => {
  require.ensure(['views/systemManagement/departmentManage/NewDepart.vue'], () => {
    resolve(require('views/systemManagement/departmentManage/NewDepart.vue'));
  }, 'newDepart');
};

const resourceDomain = resolve => {
  require.ensure(['views/systemManagement/resourceDomain/ResourceDomain.vue'], () => {
    resolve(require('views/systemManagement/resourceDomain/ResourceDomain.vue'));
  }, 'resourceDomain');
};

const project = resolve => {
  require.ensure(['views/systemManagement/project/Project.vue'], () => {
    resolve(require('views/systemManagement/project/Project.vue'));
  }, 'project');
}

const viewUsage = resolve => {
  require.ensure(['views/systemManagement/project/ViewUsage.vue'], () => {
    resolve(require('views/systemManagement/project/ViewUsage.vue'));
  }, 'viewUsage');
}

const user = resolve => {
  require.ensure(['views/systemManagement/user/User.vue'], () => {
    resolve(require('views/systemManagement/user/User.vue'));
  }, 'user');
}

const userList = resolve => {
  require.ensure(['views/systemManagement/user/UserList.vue'], () => {
    resolve(require('views/systemManagement/user/UserList.vue'));
  }, 'userList');
}

const addUser = resolve => {
  require.ensure(['views/systemManagement/user/AddUser.vue'], () => {
    resolve(require('views/systemManagement/user/AddUser.vue'));
  }, 'addUser');
}

const emPower = resolve => {
  require.ensure(['views/systemManagement/user/EmPower.vue'], () => {
    resolve(require('views/systemManagement/user/EmPower.vue'));
  }, 'emPower');
}

const org = resolve => {
  require.ensure(['views/systemManagement/org/Org.vue'], () => {
    resolve(require('views/systemManagement/org/Org.vue'));
  }, 'org');
}

const orgList = resolve => {
  require.ensure(['views/systemManagement/org/OrgList.vue'], () => {
    resolve(require('views/systemManagement/org/OrgList.vue'));
  }, 'orgList');
}

const orgUser = resolve => {
  require.ensure(['views/systemManagement/org/OrgUser.vue'], () => {
    resolve(require('views/systemManagement/org/OrgUser.vue'));
  }, 'orgUser');
}

const orgPower = resolve => {
  require.ensure(['views/systemManagement/org/OrgPower.vue'], () => {
    resolve(require('views/systemManagement/org/OrgPower.vue'));
  }, 'orgPower');
}

const role = resolve => {
  require.ensure(['views/systemManagement/role/Role.vue'], () => {
    resolve(require('views/systemManagement/role/Role.vue'));
  }, 'role');
}

const roleList = resolve => {
  require.ensure(['views/systemManagement/role/RoleList.vue'], () => {
    resolve(require('views/systemManagement/role/RoleList.vue'));
  }, 'roleList');
}

const addRole = resolve => {
  require.ensure(['views/systemManagement/role/AddRole.vue'], () => {
    resolve(require('views/systemManagement/role/AddRole.vue'));
  }, 'addRole');
}

const editRole = resolve => {
  require.ensure(['views/systemManagement/role/EditRole.vue'], () => {
    resolve(require('views/systemManagement/role/EditRole.vue'));
  }, 'editRole');
}

const record = resolve => {
  require.ensure(['views/systemManagement/record/Record.vue'], () => {
    resolve(require('views/systemManagement/record/Record.vue'));
  }, 'record');
}

const ipSetting = resolve => {
  require.ensure(['views/systemManagement/IPSetting/IpSetting.vue'], () => {
    resolve(require('views/systemManagement/IPSetting/IpSetting.vue'));
  }, 'ipSetting');
}

const ipWhiteList = resolve => {
  require.ensure(['views/systemManagement/IPSetting/IpWhiteList.vue'], () => {
    resolve(require('views/systemManagement/IPSetting/IpWhiteList.vue'));
  }, 'ipWhiteList');
}

const ipBlackList = resolve => {
  require.ensure(['views/systemManagement/IPSetting/IpBlackList.vue'], () => {
    resolve(require('views/systemManagement/IPSetting/IpBlackList.vue'));
  }, 'ipBlackList');
}

const systemStatus = resolve => {
  require.ensure(['views/systemManagement/systemStatus/SystemStatus.vue'], () => {
    resolve(require('views/systemManagement/systemStatus/SystemStatus.vue'));
  }, 'systemStatus');
}

const systemServer = resolve => {
  require.ensure(['views/systemManagement/systemStatus/SystemServer.vue'], () => {
    resolve(require('views/systemManagement/systemStatus/SystemServer.vue'));
  }, 'systemServer');
}

const computerServer = resolve => {
  require.ensure(['views/systemManagement/systemStatus/ComputerServer.vue'], () => {
    resolve(require('views/systemManagement/systemStatus/ComputerServer.vue'));
  }, 'computerServer');
}

const storageServer = resolve => {
  require.ensure(['views/systemManagement/systemStatus/StorageServer.vue'], () => {
    resolve(require('views/systemManagement/systemStatus/StorageServer.vue'));
  }, 'storageServer');
}

const networkServer = resolve => {
  require.ensure(['views/systemManagement/systemStatus/NetworkServer.vue'], () => {
    resolve(require('views/systemManagement/systemStatus/NetworkServer.vue'));
  }, 'networkServer');
}

const parameterSetting = resolve => {
  require.ensure(['views/systemManagement/parameterSetting/ParameterSetting.vue'], () => {
    resolve(require('views/systemManagement/parameterSetting/ParameterSetting.vue'));
  }, 'parameterSetting');
}

const systemSetting = resolve => {
  require.ensure(['views/systemManagement/parameterSetting/systemSetting/SystemSetting.vue'], () => {
    resolve(require('views/systemManagement/parameterSetting/systemSetting/SystemSetting.vue'));
  }, 'systemSetting');
}

const recordSetting = resolve => {
  require.ensure(['views/systemManagement/parameterSetting/recordSetting/recordSetting.vue'], () => {
    resolve(require('views/systemManagement/parameterSetting/recordSetting/recordSetting.vue'));
  }, 'recordSetting');
}

const passwordStrategy = resolve => {
  require.ensure(['views/systemManagement/parameterSetting/passwordStrategy/PasswordStrategy.vue'], () => {
    resolve(require('views/systemManagement/parameterSetting/passwordStrategy/PasswordStrategy.vue'));
  }, 'passwordStrategy');
}

const moduleSwitch = resolve => {
  require.ensure(['views/systemManagement/parameterSetting/moduleSwitch/ModuleSwitch.vue'], () => {
    resolve(require('views/systemManagement/parameterSetting/moduleSwitch/ModuleSwitch.vue'));
  }, 'moduleSwitch');
}

const leaseParameterSetting = resolve => {
  require.ensure(['views/systemManagement/parameterSetting/leaseParameterSetting/LeaseParameterSetting.vue'], () => {
    resolve(require('views/systemManagement/parameterSetting/leaseParameterSetting/LeaseParameterSetting.vue'));
  }, 'leaseParameterSetting');
}

const metaData = resolve => {
  require.ensure(['views/systemManagement/parameterSetting/metaData/MetaData.vue'], () => {
    resolve(require('views/systemManagement/parameterSetting/metaData/MetaData.vue'));
  }, 'metaData');
}

const templateSetting = resolve => {
  require.ensure(['views/systemManagement/parameterSetting/templateSetting/TemplateSetting.vue'], () => {
    resolve(require('views/systemManagement/parameterSetting/templateSetting/TemplateSetting.vue'));
  }, 'templateSetting');
}

const copyRightSetting = resolve => {
  require.ensure(['views/systemManagement/parameterSetting/copyRightSetting/CopyRightSetting.vue'], () => {
    resolve(require('views/systemManagement/parameterSetting/copyRightSetting/CopyRightSetting.vue'));
  }, 'copyRightSetting');
}

const pimSetting = resolve => {
  require.ensure(['views/systemManagement/parameterSetting/pimSetting/pimSetting.vue'], () => {
    resolve(require('views/systemManagement/parameterSetting/pimSetting/pimSetting.vue'));
  }, 'pimSetting');
}

const opslogSetting = resolve => {
  require.ensure(['views/systemManagement/parameterSetting/opslogSetting/opslogSetting.vue'], () => {
    resolve(require('views/systemManagement/parameterSetting/opslogSetting/opslogSetting.vue'));
  }, 'opslogSetting');
}

const projectManage = resolve => {
  require.ensure(['views/systemManagement/projectManage/ProjectManage.vue'], () => {
    resolve(require('views/systemManagement/projectManage/ProjectManage.vue'));
  }, "projectManage");
}

const certManage = resolve => {
  require.ensure(['views/systemManagement/certManage/CertManage.vue'], () => {
    resolve(require('views/systemManagement/certManage/CertManage.vue'));
  }, "certManage");
}

const routes = [{
  name: 'systemManagement',
  path: '/systemManagement',
  alias: '/',
  component: systemManagement,
  flg: Vue.AuthList["m.systemmanage"],
  meta: {
    des: 'base.systemManagement'
  },
  children: [{
    name: 'departmentManage',
    path: 'departmentManage',
    alias: '/',
    component: departmentManage,
    flg: Vue.AuthList["m.systemmanage.departmentmanage"],
    meta: {
      des: "base.deptManagement"
    }
  }, {
    name: 'project',
    path: 'project',
    alias: '/',
    component: project,
    flg: Vue.AuthList["m.systemmanage.projectmanage"],
    meta: {
      des: "base.projectManagement"
    }
  }, {
    name: 'projectManage',
    path: 'projectManage',
    alias: '/',
    component: projectManage,
    flg: Vue.AuthList["m.systemmanage.project.projectmanage"],
    meta: {
      des: "base.projectManagement"
    }
  }, {
    name: 'org',
    path: 'org',
    alias: '/',
    component: org,
    flg: Vue.AuthList["m.systemmanage.groupmanage"],
    meta: {
      des: "base.groupManagement",
      desContent: Vue.t('base.groupDesc')
    },
    children: [{
      name: 'orgList',
      path: '',
      component: orgList,
      meta: {
        des: ""
      }
    }, {
      name: 'orgUser',
      path: 'orgUser/:id/:name',
      component: orgUser,
      meta: {
        des: "base.personnelManintenance"
      }
    }, {
      name: 'orgPower',
      path: 'orgPower/:id/:domainid',
      component: orgPower,
      meta: {
        des: "base.groupWeighting"
      }
    }]
  }, {
    name: 'user',
    path: 'user',
    alias: '/',
    component: user,
    flg: Vue.AuthList["m.systemmanage.usermanage"],
    meta: {
      des: "base.userManagement"
    },
    children: [{
      name: 'userList',
      path: '',
      component: userList,
      meta: {
        des: ""
      }
    }, {
      name: 'addUser',
      path: 'addUser',
      component: addUser,
      meta: {
        des: "base.addUser"
      }
    }, {
      name: 'emPower',
      path: 'emPower/:id/:name',
      component: emPower,
      meta: {
        des: "base.userEmpowerment"
      }
    }]
  }, {
    name: 'role',
    path: 'role',
    alias: '/',
    component: role,
    flg: Vue.AuthList["m.systemmanage.rolemanage"],
    meta: {
      des: "base.roleManagement",
      desContent: Vue.t('base.roleDesc')
    },
    children: [{
      name: 'roleList',
      path: '',
      component: roleList,
      meta: {
        des: ""
      }
    }, {
      name: 'addRole',
      path: 'addRole',
      component: addRole,
      meta: {
        des: "base.addRole"
      }
    }, {
      name: 'editRole',
      path: 'editRole/:id',
      component: editRole,
      meta: {
        des: "base.modifyRole"
      }
    }]
  }, {
    name: 'record',
    path: 'record',
    alias: '/',
    component: record,
    flg: Vue.AuthList["m.systemmanage.opreatelog"],
    meta: {
      des: "base.operateRecord"
    }
  }, {
    name: 'systemStatus',
    path: 'systemStatus',
    alias: '/',
    component: systemStatus,
    flg: Vue.AuthList["m.systemmanage.systemstatus"],
    meta: {
      des: "base.systemStatus"
    },
    children: [{
      path: '',
      name:"systemStatus",
      components:{
        systemServer,
        computerServer,
        storageServer,
        networkServer
      }
    }]
  }, {
    name: 'ipSetting',
    path: 'ipSetting',
    alias: '/',
    component: ipSetting,
    flg: Vue.AuthList["m.systemmanage.ipsetting"],
    meta: {
      des: "base.ipSetting",
      desContent:Vue.t('base.ipSettingDesc')
    },
    children: [{
      path: '',
      name:'ipSetting',
      components:{
        ipWhiteList,
        ipBlackList
      }
    }]
  }, {
    name: 'parameterSetting',
    path: 'parameterSetting',
    alias: '/',
    component: parameterSetting,
    flg: Vue.AuthList["m.systemmanage.paramsetting"],
    meta: {
      des: "base.parameterSetting"
    },
    children: [{
      path: '',
      name:'parameterSetting',
      components:{
        metaData
      }
    }]
  }, {
    name: 'certManage',
    path: 'certManage',
    alias: '/',
    component: certManage,
    flg: Vue.AuthList["m.systemmanage.certManage"],
    meta: {
      des: "base.certManage"
    }
  }]
}]

export default routes;
