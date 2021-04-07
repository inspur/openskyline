const operationAnalysis = resolve => {
  require.ensure(['views/operationAnalysis/index.vue'], () => {
    resolve(require('views/operationAnalysis/index.vue'));
  }, 'operationAnalysis');
};

const trendPredict = resolve => {
  require.ensure(['views/operationAnalysis/trendPredict/index.vue'], () => {
    resolve(require('views/operationAnalysis/trendPredict/index.vue'));
  }, 'trendPredict');
};

const healthStatus = resolve => {
  require.ensure(['views/operationAnalysis/healthStatus/index.vue'], () => {
    resolve(require('views/operationAnalysis/healthStatus/index.vue'));
  }, 'healthStatus');
};

const clusterResourcePrediction = resolve => {
  require.ensure(['views/operationAnalysis/cluster-resource-prediction/index.vue'], () => {
    resolve(require('views/operationAnalysis/cluster-resource-prediction/index.vue'));
  }, 'clusterResourcePrediction');
};

const logSearch = resolve => {
  require.ensure(['views/operationAnalysis/logSearch/index.vue'], () => {
    resolve(require('views/operationAnalysis/logSearch/index.vue'));
  }, 'logSearch');
};

const logSearchOpenStack = resolve => {
  require.ensure(['views/operationAnalysis/logSearch/openstack/index.vue'], () => {
    resolve(require('views/operationAnalysis/logSearch/openstack/index.vue'));
  }, 'logSearchOpenStack');
};

const logSearchSystem = resolve => {
  require.ensure(['views/operationAnalysis/logSearch/system/index.vue'], () => {
    resolve(require('views/operationAnalysis/logSearch/system/index.vue'));
  }, 'logSearchSystem');
};

const Chain = resolve => {
  require.ensure(['views/operationAnalysis/logSearch/chain/index.vue'], () => {
    resolve(require('views/operationAnalysis/logSearch/chain/index.vue'));
  }, 'Chain');
};

const logAnalysis = resolve => {
  require.ensure(['views/operationAnalysis/logAnalysis/index.vue'], () => {
    resolve(require('views/operationAnalysis/logAnalysis/index.vue'));
  }, 'logAnalysis');
};

const logHost = resolve => {
  require.ensure(['views/operationAnalysis/logAnalysis/LogHost.vue'], () => {
    resolve(require('views/operationAnalysis/logAnalysis/LogHost.vue'));
  }, 'logHost');
};

const logModule = resolve => {
  require.ensure(['views/operationAnalysis/logAnalysis/LogModule.vue'], () => {
    resolve(require('views/operationAnalysis/logAnalysis/LogModule.vue'));
  }, 'logModule');
};

const logError = resolve => {
  require.ensure(['views/operationAnalysis/logError/LogError.vue'], () => {
    resolve(require('views/operationAnalysis/logError/LogError.vue'));
  }, 'logError');
};

const noThresholdAnomalyDetection = resolve => {
  require.ensure(['views/operationAnalysis/no-threshold-anomaly-detection/index.vue'], () => {
    resolve(require('views/operationAnalysis/no-threshold-anomaly-detection/index.vue'));
  }, 'noThresholdAnomalyDetection');
};

const routes = [
  {
    name: 'operationAnalysis',
    path: '/operationAnalysis',
    alias: '/',
    component: operationAnalysis,
    flg: Vue.AuthList['m.operationAnalysis'],
    meta: {
      des: 'operationAnalysis.OPERATION_ANALYSIS'
    },
    children: [{
      name: 'healthStatus',
      path: 'healthStatus',
      alias: '/',
      component: healthStatus,
      flg: Vue.AuthList['m.operationAnalysis.HealthStatus'],
      meta: {
        des: 'operationAnalysis.HEALTH_STATUS'
      }
    }, {
      name: 'logSearch',
      path: 'logSearch',
      component: logSearch,
      alias: '/',
      meta: {
        des: 'operationAnalysis.logSearch'
      },
      redirect:'logSearch/logSearchOpenStack',
      children: [{
        name: 'logSearchOpenStack',
        path: 'logSearchOpenStack',
        alias: '/',
        meta: {
          des: Vue.t("operationAnalysis.LOG_SEARCH_OPENSTACK")
        },
        component: logSearchOpenStack
      }, {
        name: 'logSearchSystem',
        path: 'logSearchSystem',
        alias: '/',
        meta: {
          des: Vue.t("operationAnalysis.LOG_SEARCH_SYSTEM")
        },
        component: logSearchSystem
      }, {
        name: 'chain',
        path: 'chain',
        alias: '/',
        meta: {
          des: Vue.t("operationAnalysis.CHAIN")
        },
        component: Chain
      }]
    }, {
      name: 'logAnalysis',
      path: 'logAnalysis',
      component: logAnalysis,
      alias: '/',
      meta: {
        des: 'operationAnalysis.logAnalysis'
      },
      redirect:'logAnalysis/logHost',
      children: [{
        name: 'logHost',
        path: 'logHost',
        alias: '/',
        meta: {
          des: Vue.t("operationAnalysis.hostLogAnalysis")
        },
        component: logHost
      }, {
        name: 'logModule',
        path: 'logModule',
        alias: '/',
        meta: {
          des: Vue.t("operationAnalysis.zujianLogAnalysis")
        },
        component: logModule
      }]
    }, {
      name: 'logError',
      path: 'logError',
      component: logError,
      alias: '/',
      meta: {
        des: 'operationAnalysis.logerrorTypical'
      }
    }, {
      name: 'clusterResourcePrediction',
      path: 'clusterResourcePrediction',
      alias: '/',
      component: clusterResourcePrediction,
      flg: Vue.AuthList['m.operationAnalysis.CLUSTER_RESOURCE_PREDICTION'],
      meta: {
        des: 'operationAnalysis.CLUSTER_RESOURCE_PREDICTION'
      }
    }, {
      name: 'trendPredict',
      path: 'trendPredict',
      alias: '/',
      component: trendPredict,
      flg: Vue.AuthList['m.operationAnalysis.TrendPredict'],
      meta: {
        des: 'operationAnalysis.TREND_PREDICT'
      }
    }, {
      flg: Vue.AuthList['m.operationAnalysis.NO_THRESHOLD_ANOMALY_DETECTION'] || Vue.AuthList['m.operationAnalysis.noThresholdAnomalyDetection'],
      name: 'no-threshold-anomaly-detection',
      path: 'no-threshold-anomaly-detection',
      component: noThresholdAnomalyDetection,
      alias: '/',
      meta: {
        des: 'operationAnalysis.NO_THRESHOLD_ANOMALY_DETECTION'
      }
    }]
  }
];

export default routes;
