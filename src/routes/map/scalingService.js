const scalingService = resolve => {
  require.ensure(['views/scaling-service/ScalingService.vue'], () => {
    resolve(require('views/scaling-service/ScalingService.vue'));
  }, 'scalingService');
};
const scalingServiceList = resolve => {
  require.ensure(['views/scaling-service/ScalingServiceList.vue'], () => {
    resolve(require('views/scaling-service/ScalingServiceList.vue'));
  }, 'scalingServiceList');
};
const scalingServiceDetail = resolve => {
  require.ensure(['views/scaling-service/ScalingServiceDetail.vue'], () => {
    resolve(require('views/scaling-service/ScalingServiceDetail.vue'));
  }, 'scalingServiceDetail');
};

const scalingDetail = resolve => {
  require.ensure(['views/scaling-service/ScalServiceDetail.vue'], () => {
    resolve(require('views/scaling-service/ScalServiceDetail.vue'));
  }, 'scalingDetail');
};

const scalingNodelist = resolve => {
  require.ensure(['views/scaling-service/ScalServiceNodeList.vue'], () => {
    resolve(require('views/scaling-service/ScalServiceNodeList.vue'));
  }, 'scalingNodelist');
};

const scalingOperatelog = resolve => {
  require.ensure(['views/scaling-service/ScalServiceOperateLog.vue'], () => {
    resolve(require('views/scaling-service/ScalServiceOperateLog.vue'));
  }, 'scalingOperatelog');
};

const routes = [
  {
    name: 'scaling-service',
    path: '/scaling-service',
    component: scalingService,
    flg: Vue.AuthList["m.senlin"],
    meta: {
      title: "",
      des: "",
      desContent: Vue.t("scalingService.scalingServiceTip")
    },
    children: [{
      name: 'scaling-service-list',
      path: 'scaling-service-list',
      component: scalingServiceList,
      flg: Vue.AuthList["m.senlin"],
      meta: {
      title: Vue.t("scalingService.scalingService"),
      des: Vue.t("scalingService.scalingService")
      },
      children: [{
        path: "",
        components: {
          scalingDetail:scalingDetail,
          scalingNodelist:scalingNodelist,
          scalingOperatelog:scalingOperatelog
        }
      }]
  }]
}];

export default routes;

