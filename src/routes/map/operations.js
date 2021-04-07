const operationManage = resolve => {
  require.ensure(['views/operations/Operations.vue'], () => {
    resolve(require('views/operations/Operations.vue'));
  }, 'operationManage');
};

const processM = resolve => {
  require.ensure(['views/operations/process/Process.vue'], () => {
    resolve(require('views/operations/process/Process.vue'));
  }, 'processM');
};

const processAdd = resolve => {
  require.ensure(['views/operations/process/ProcessAdd.vue'], () => {
    resolve(require('views/operations/process/ProcessAdd.vue'))
  }, 'processAdd')
};

const processModify = resolve => {
  require.ensure(['views/operations/process/ProcessModify.vue'], () => {
    resolve(require('views/operations/process/ProcessModify.vue'))
  }, 'processModify')
};

const flowDetail = resolve => {
  require.ensure(['views/operations/flow/FlowDetail.vue'], () => {
    resolve(require('views/operations/flow/FlowDetail.vue'))
  }, 'flowDetail')
};

const flow = resolve => {
  require.ensure(['views/operations/flow/Flow.vue'], () => {
    resolve(require('views/operations/flow/Flow.vue'));
  }, 'flow');
};

const flowUser = resolve => {
  require.ensure(['views/operations/flow/FlowUser.vue'], () => {
    resolve(require('views/operations/flow/FlowUser.vue'));
  }, 'flowUser');
};

const fault = resolve => {
  require.ensure(['views/operations/fault/Fault.vue'], () => {
    resolve(require('views/operations/fault/Fault.vue'));
  }, 'fault');
};

const handling = resolve => {
  require.ensure(['views/operations/fault/Handling.vue'], () => {
    resolve(require('views/operations/fault/Handling.vue'));
  }, 'handling');
};

const history = resolve => {
  require.ensure(['views/operations/fault/History.vue'], () => {
    resolve(require('views/operations/fault/History.vue'));
  }, 'history');
};

const flowHistoryDetail = resolve => {
  require.ensure(['views/operations/flow/FlowHisDialog.vue'], () => {
    resolve(require('views/operations/flow/FlowHisDialog.vue'));
  }, 'flowHistoryDetail');
};

const flowHistory = resolve => {
  require.ensure(['views/operations/flow/History.vue'], () => {
    resolve(require('views/operations/flow/History.vue'));
  }, 'flowHistory');
};

const userFlow = resolve => {
  require.ensure(['views/operations/flow/UserFlow.vue'], () => {
    resolve(require('views/operations/flow/UserFlow.vue'));
  }, 'userFlow');
};

const submitting = resolve => {
  require.ensure(['views/operations/fault/Submitting.vue'], () => {
    resolve(require('views/operations/fault/Submitting.vue'));
  }, 'submitting');
};

const type = resolve => {
  require.ensure(['views/operations/fault/Type.vue'], () => {
    resolve(require('views/operations/fault/Type.vue'));
  }, 'type');
};

const pending = resolve => {
  require.ensure(['views/operations/flow/Pending.vue'], () => {
    resolve(require('views/operations/flow/Pending.vue'));
  }, 'pending');
};

const productPrice = resolve => {
  require.ensure(['views/operations/account/ProductPrice.vue'], () => {
    resolve(require('views/operations/account/ProductPrice.vue'));
  }, 'productPrice');
};

const priceSetting = resolve => {
  require.ensure(['views/operations/account/PriceSetting.vue'], () => {
    resolve(require('views/operations/account/PriceSetting.vue'));
  }, 'priceSetting');
};

const startProject = resolve => {
  require.ensure(['views/operations/account/StartProject.vue'], () => {
    resolve(require('views/operations/account/StartProject.vue'));
  }, 'startProject');
};

const consumption = resolve => {
  require.ensure(['views/operations/account/Consumption.vue'], () => {
    resolve(require('views/operations/account/Consumption.vue'))
  }, 'consumption')
};

const consumeOverview = resolve => {
  require.ensure(['views/operations/account/consumeOverview.vue'], () => {
    resolve(require('views/operations/account/consumeOverview.vue'))
  }, 'consumeOverview')
};

const consumeRecord = resolve => {
  require.ensure(['views/operations/account/consumeRecord.vue'], () => {
    resolve(require('views/operations/account/consumeRecord.vue'))
  }, 'consumeRecord')
};

const report = resolve => {
  require.ensure(['views/operations/report/Report.vue'], () => {
    resolve(require('views/operations/report/Report.vue'))
  }, 'report')
};

const reportManage = resolve => {
  require.ensure(['views/operations/report/ReportManage.vue'], () => {
    resolve(require('views/operations/report/ReportManage.vue'))
  }, 'reportManage')
};

const reportDownload = resolve => {
  require.ensure(['views/operations/report/ReportDownloadCenter.vue'], () => {
    resolve(require('views/operations/report/ReportDownloadCenter.vue'))
  }, 'reportDownload')
};

const order = resolve => {
  require.ensure(['views/operations/flow/OrderList.vue'], () => {
    resolve(require('views/operations/flow/OrderList.vue'))
  }, 'order')
};

const periodReportManage = resolve => {
  require.ensure(['views/operations/period/PeriodReport.vue'], () => {
    resolve(require('views/operations/period/PeriodReport.vue'))
  }, 'periodReportManage')
};

const routes = [
  {
    name: 'operations',
    path: '/operations',
    alias: '/',
    component: operationManage,
    flg: Vue.AuthList["m.operationmanage"],
    meta: {
      title: "opt.operationManagement",
      des: "opt.operationManagement"
    },
    children: [{
      name: 'flow-manage',
      path: 'flow-manage',
      alias: '/',
      component: processM,
      flg: Vue.AuthList["m.operationmanage.flowmanage"],
      meta: {
        des: "opt.processManagement",
        desContent: "opt.processContent"
      },
      children: [
        {
          name: 'process-add',
          path: 'process-add',
          meta: {
            force: true,
            des: 'opt.addProcess'
          },
          component: processAdd
        }
      ]
    }, {
      name: 'flow',
      path: 'flow',
      alias: '/',
      component: flow,
      flg: Vue.AuthList["m.operationmanage.orderapprove"],
      meta: {
        des: "opt.orderApprove"
      },
      children: [{
        name: 'pending',
        path: 'pending',
        alias: (Vue.roleType == "0" || Vue.roleType == "2") ? "/" : " ",
        meta: {
          des: 'opt.pending',
          desContent: "opt.pendingContent"
        },
        component: pending
      }, {
        name: 'flowHistory',
        path: 'flowHistory',
        alias: (Vue.roleType == "0" || Vue.roleType == "2") ? "/" : ' ',
        meta: {
          des: 'opt.approvalHistory',
          desContent: "opt.historyContent"
        },
        component: flowHistory
      }, {
        name: 'userFlow',
        path: 'userFlow',
        alias: Vue.roleType == "2" ? "/" : ' ',
        meta: {
          des: 'opt.myApply',
          desContent: "opt.myApplyContent"
        },
        component: userFlow
      }, {
        name: 'flowDetail',
        path: 'flowDetail',
        meta: {
          // force: true,
          des: 'opt.approveDetail'
        },
        component: flowDetail
      }]
    }, {
      name: 'flowUser',
      path: 'flowUser',
      alias: '/',
      component: flowUser,
      flg: Vue.AuthList["m.operationmanage.order"],
      meta: {
        des: "opt.order"
      },
      children: [{
        name: 'userFlow',
        path: 'userFlow',
        alias: Vue.roleType == "3" ? "/" : ' ',
        meta: {
          des: 'opt.applying',
          desContent: "opt.applyingContent"
        },
        component: userFlow
      }, {
        name: 'flowHistory',
        path: 'flowHistory',
        alias: Vue.roleType == "3" ? "/" : ' ',
        meta: {
          des: 'opt.approved',
          desContent: "opt.userHistoryContent"
        },
        component: flowHistory
      }]
    }, {
      name: 'fault',
      path: 'fault',
      alias: '/',
      component: fault,
      flg: Vue.AuthList["m.operationmanage.fault"],
      meta: {
        des: "opt.workSheet"
      },
      children: [{
        name: 'handling',
        path: 'handling',
        alias: (Vue.roleType == "0" || Vue.roleType == "2") ? "/" : ' ',
        meta: {
          des: 'opt.pending'
        },
        component: handling
      }, {
        name: 'history',
        path: 'history',
        alias: (Vue.roleType == "0" || Vue.roleType == "2") ? "/" : ' ',
        meta: {
          des: 'opt.handled'
        },
        component: history
      }, {
        name: 'submitting',
        path: 'submitting',
        alias: (Vue.roleType == "3" || Vue.roleType == "2") ? "/" : ' ',
        meta: {
          des: 'opt.submitFault'
        },
        component: submitting
      }, {
        name: 'type',
        path: 'type',
        alias: (Vue.roleType == "0" || Vue.roleType == "2") ? "/" : ' ',
        meta: {
          des: 'opt.faultType'
        },
        component: type
      }]
    }, {
      name: 'process-modify',
      path: 'process-modify/:id',
      meta: {
        force: true,
        des: 'opt.editProcess'
      },
      component: processModify
    }, {
      name: 'product-price',
      path: 'product-price',
      alias: '/',
      component: productPrice,
      flg: Vue.AuthList["m.operationmanage.pricesetting"],
      meta: {
        des: "opt.productPrice"
      },
      children: [{
        name: 'price-setting',
        path: 'price-setting',
        alias: Vue.roleType == "0" ? "/" : ' ',
        meta: {
          des: 'opt.priceSetting'
        },
        component: priceSetting
      }, {
        name: 'start-project',
        path: 'start-project',
        alias: '/',
        meta: {
          des: 'opt.startproject'
        },
        component: startProject
      }]
    }, {
      name: 'consumption',
      path: 'consumption',
      alias: '/',
      component: consumption,
      flg: Vue.AuthList["m.operationmanage.cost"],
      meta: {
        des: "opt.consumptionProfile"
      },
      children: [{
        name: 'consumeOverview',
        path: 'consumeOverview',
        alias: '/',
        meta: {
          des: 'opt.consumeOverview'
        },
        component: consumeOverview
      }, {
        name: 'consumeRecord',
        path: 'consumeRecord',
        alias: '/',
        meta: {
          des: 'opt.consumeRecord'
        },
        component: consumeRecord
      }]
    }, {
      name: 'report',
      path: 'report',
      alias: '/',
      component: report,
      flg: Vue.AuthList["m.operationmanage.report"],
      meta: {
        des: "opt.report"
      },
      children: [{
        name: 'reportManage',
        path: 'reportManage',
        alias: '/',
        meta: {
          des: 'report.reportManage'
        },
        component: reportManage
      }, {
        name: 'reportDownload',
        path: 'reportDownload',
        alias: '/',
        meta: {
          des: 'report.reportDownload'
        },
        component: reportDownload
      }, {
        name: 'periodReportManage',
        path: 'periodReportManage',
        alias: '/',
        meta: {
          des: 'report.periodReportManage'
        },
        component: periodReportManage
      }]
    }, {
      name: 'order',
      path: 'order',
      alias: '/',
      component: order,
      flg: Vue.AuthList["m.operationmanage.orderlist"],
      meta: {
        des: "opt.orderStatistics",
        desContent: Vue.roleType == "0" ? "opt.orderAdminContent" : "opt.orderProjectContent"
      }
    }]
  }]

export default routes;
