module.exports = function() {
  return {
    flg: Vue.AuthList["m.operationmanage"] && Vue.service['leo'],
    key: "operations",
    path: "/operations/",
    iconType: "el-icon-fa-cogs",
    name: 'opt.operationManagement',
    subMenus: [{
      flg: Vue.AuthList["m.operationmanage.flowmanage"],
      key: "flow-manage",
      path: "flow-manage",
      iconType: "el-icon-fa-tasks",
      name: 'opt.processManagement'
    }, {
      flg: Vue.AuthList["m.operationmanage.orderapprove"],
      key: "flow",
      path: "flow",
      iconType: "el-icon-fa-pencil-square-o",
      name: 'opt.orderApprove'
    }, {
      flg: Vue.AuthList["m.operationmanage.order"],
      key: "flowUser",
      path: "flowUser",
      iconType: "el-icon-fa-pencil-square-o",
      name: 'opt.order'
    }, {
      flg: Vue.AuthList["m.operationmanage.orderlist"],
      key:"order",
      path:"order",
      iconType: "el-icon-fa-list-alt",
      name: 'opt.orderStatistics'
    }, {
      flg: Vue.AuthList["m.operationmanage.fault"],
      key: "fault",
      path: "fault",
      iconType: "el-icon-fa-medkit",
      name: 'opt.workSheet'
    }, {
      flg: Vue.archIs('x86') && Vue.AuthList["m.operationmanage.pricesetting"],
      key: "product-price",
      path: "product-price",
      iconType: "el-icon-fa-jpy",
      name: 'opt.productPrice'
    }, {
      flg: Vue.archIs('x86') && Vue.AuthList["m.operationmanage.cost"],
      key: "consumption",
      path: "consumption",
      iconType: "el-icon-fa-money",
      name: 'opt.consumptionProfile'
    }, {
      flg: Vue.AuthList["m.operationmanage.report"],
      key: "report",
      path: "report",
      iconType: "el-icon-fa-file-excel-o",
      name: 'opt.report'
    }]
  };
}
