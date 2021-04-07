let demo = {
  flg: true,
  key: "components-demo",
  iconType: "el-icon-fa-lemon-o",
  name: "组件Demo",
  path: "/components-demo/",
  subMenus: [{
    flg: true,
    key: "identity-project",
    path: "identity-project",
    iconType: "el-icon-fa-pie-chart",
    name: '项目'
  }, {
    flg: true,
    key: "ztree",
    path: "ztree",
    iconType: "el-icon-fa-smile-o",
    name: '树'
  }, {
    flg: true,
    key: "operation-panel",
    path: "operation-panel",
    iconType: "el-icon-fa-smile-o",
    name: '操作区'
  }, {
    flg: true,
    key: "tabs",
    path: "tabs",
    iconType: "el-icon-fa-smile-o",
    name: "Tabs路由"
  }, {
    flg: true,
    key: "description",
    path: "description",
    iconType: "el-icon-fa-pie-chart",
    name: '概述'
  }]
};
//仅在dev模式可见
// !__DEV__ && (demo = {});
export default demo;
