//服务编排
module.exports = function() {
  return {
    flg: Vue.AuthList["m.heat"],
    key: "service-orchestration",
    path: "/service-orchestration/",
    iconType: "el-icon-fa-sitemap",
    name: "heat.serviceOrchestration",
    subMenus: [{
      flg: Vue.AuthList["m.heat.template"],
      key: "orchestrationTemplate",
      path: "orchestrationTemplate",
      iconType: "el-icon-fa-sliders",
      name: 'heat.heatTemplate'
    }, {
      flg: Vue.AuthList["m.heat.stack"],
      key: "orchestrationList",
      path: "orchestrationList",
      iconType: "el-icon-fa-tasks",
      name: 'heat.heatStack'
    }]
  };
}
