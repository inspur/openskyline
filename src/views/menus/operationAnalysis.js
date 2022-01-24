module.exports = function() {
  return {
    flg: false && Vue.AuthList['m.operationAnalysis'],
    key: 'operationAnalysis',
    path: '/operationAnalysis/',
    iconType: 'el-icon-fa-line-chart',
    name: 'operationAnalysis.OPERATION_ANALYSIS',
    subMenus: [{
      flg: false && Vue.service['venus'] && Vue.AuthList['m.operationAnalysis.logSearch'],
      key: 'logSearch',
      path: 'logSearch',
      iconType: 'el-icon-fa-search',
      name: 'operationAnalysis.logSearch'
    }, {
      flg: false && Vue.service['venus'] && Vue.AuthList['m.operationAnalysis.logAnalysis'],
      key: 'logAnalysis',
      path: 'logAnalysis',
      iconType: 'el-icon-fa-podcast',
      name: 'operationAnalysis.logAnalysis'
    }, {
      flg: Vue.service['earth'] && Vue.AuthList['m.operationAnalysis.CLUSTER_RESOURCE_PREDICTION'],
      key: 'clusterResourcePrediction',
      path: 'clusterResourcePrediction',
      iconType: 'el-icon-fa-heartbeat',
      name: 'operationAnalysis.CLUSTER_RESOURCE_PREDICTION'
    }, {
      flg: Vue.service['earth'] && Vue.AuthList['m.operationAnalysis.TrendPredict'],
      key: 'trendPredict',
      path: 'trendPredict',
      iconType: 'el-icon-fa-bar-chart',
      name: 'operationAnalysis.TREND_PREDICT'
    }, {
      flg: Vue.service['earth'] && (Vue.AuthList['m.operationAnalysis.NO_THRESHOLD_ANOMALY_DETECTION'] || Vue.AuthList['m.operationAnalysis.noThresholdAnomalyDetection']),
      key: 'no-threshold-anomaly-detection',
      path: 'no-threshold-anomaly-detection',
      iconType: 'el-icon-fa-hourglass-half',
      name: 'operationAnalysis.NO_THRESHOLD_ANOMALY_DETECTION'
    }]
  };
}
