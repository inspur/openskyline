module.exports = function() {
  return {
    flg: Vue.AuthList["m.systemmanage"],
    key: "systemManagement",
    path: "/systemManagement/",
    iconType: "el-icon-fa-life-buoy",
    name: 'base.systemManagement',
    subMenus: [
    {
      flg: Vue.AuthList["m.systemmanage.projectmanage"] && Vue.roleType === '0',
      key: "project",
      path: "project",
      iconType: "el-icon-fa-newspaper-o",
      name: 'base.projectManagement'
    }, {
      flg: Vue.AuthList["m.systemmanage.project.projectmanage"] && Vue.roleType === '0',
      key: "projectManage",
      path: "projectManage",
      iconType: "el-icon-fa-newspaper-o",
      name: 'base.projectManagement'
    }, {
      flg: Vue.AuthList["m.systemmanage.groupmanage"] && Vue.roleType === '0',
      key: "org",
      path: "org",
      iconType: "el-icon-fa-group",
      name: 'base.groupManagement'
    }, {
      flg: Vue.AuthList["m.systemmanage.rolemanage"] && Vue.roleType === '0',
      key: "role",
      path: "role",
      iconType: "el-icon-fa-graduation-cap",
      name: 'base.roleManagement'
    }, {
      flg: Vue.AuthList["m.systemmanage.usermanage"] && Vue.roleType === '0',
      //flg:true,
      key: "user",
      path: "user",
      iconType: "el-icon-fa-user-o",
      name: 'base.userManagement'
    }, {
      flg: Vue.AuthList["m.systemmanage.systemstatus"] && Vue.roleType === '0',
      key: "systemStatus",
      path: "systemStatus",
      iconType: "el-icon-fa-desktop",
      name: 'base.systemStatus'
    }, {
      flg: Vue.AuthList["m.systemmanage.paramsetting"] && Vue.roleType === '0',
      key: "parameterSetting",
      path: "parameterSetting",
      iconType: "el-icon-fa-cog",
      name: 'base.parameterSetting'
    }, {
      flg: Vue.service['barbican'] && Vue.AuthList["m.systemmanage.certManage"],
      key: "certManage",
      path: "certManage",
      iconType: "el-icon-fa-key",
      name: 'base.certManage'
    }, {
      flg: Vue.AuthList["m.systemmanage.opreatelog"],
      key: "record",
      path: "record",
      iconType: "el-icon-fa-file-text-o",
      name: 'base.operateRecord'
    }]
  };
}

