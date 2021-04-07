module.exports = function () {
  return {
    flg: Vue.AuthList["m.monitor"],
    key: "intelligentMonitoring",
    path: "/intelligentMonitoring/",
    iconType: "el-icon-fa-eye",
    name: 'base.intelligentMonitoring',
    subMenus: [
      {
        flg: Vue.AuthList["m.monitor.resourcemonitor"],
        key: "resourceMonitor",
        path: "resourceMonitor",
        iconType: "el-icon-fa-television",
        name: 'monitor.resMonitor'
      }, {
        flg: Vue.AuthList['m.monitor.CustomGraph'],
        key: 'customGraph',
        path: 'customGraph',
        iconType: 'el-icon-fa-area-chart',
        name: 'monitor.CUSTOM_GRAPH'
      }, {
        flg: Vue.AuthList["m.monitor.monitorset"],
        key: "monitoringSetting",
        path: "monitoringSetting",
        iconType: "el-icon-fa-gear",
        name: 'base.monitoringSetting'
      }, {
        flg: Vue.AuthList["m.monitor.AlertMange"],
        key: "warnManagement",
        path: "warnManagement/LOST",
        iconType: "el-icon-fa-newspaper-o",
        name: 'base.warnManagement'
      }, {
        flg: Vue.AuthList["m.monitor.EventMonitor"],
        key: "eventMonitor",
        path: "eventMonitor",
        iconType: "el-icon-fa-window-restore",
        name: 'monitor.EVENT_MONITOR'
      }]
  };
}

