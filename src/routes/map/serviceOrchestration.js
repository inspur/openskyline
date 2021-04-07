//服务编排菜单
const serviceOrchestration = resolve => {
  require.ensure(['views/service-orchestration/ServiceOrchestration.vue'], () => {
    resolve(require('views/service-orchestration/ServiceOrchestration.vue'));
  }, 'serviceOrchestration');
};

const orchestrationTemplate = resolve => {
  require.ensure(['views/service-orchestration/OrchestrationTemplate.vue'], () => {
    resolve(require('views/service-orchestration/OrchestrationTemplate.vue'));
  }, 'orchestrationTemplate');
};

const templateList = resolve => {
  require.ensure(['views/service-orchestration/templateList.vue'], () => {
    resolve(require('views/service-orchestration/templateList.vue'));
  }, 'templateList');
};

const createCustomTemplate = resolve => {
  require.ensure(['views/service-orchestration/CreateCustomTemplate.vue'], () => {
    resolve(require('views/service-orchestration/CreateCustomTemplate.vue'));
  }, 'createCustomTemplate');
};

const templateDetailIndex = resolve => {
  require.ensure(['views/service-orchestration/TemplateDetailIndex.vue'], () => {
    resolve(require('views/service-orchestration/TemplateDetailIndex.vue'));
  }, 'templateDetailIndex');
};

const editCustomTemplate = resolve => {
  require.ensure(['views/service-orchestration/EditCustomTemplate.vue'], () => {
    resolve(require('views/service-orchestration/EditCustomTemplate.vue'));
  }, 'editCustomTemplate');
};

const templateTopo = resolve => {
  require.ensure(['views/service-orchestration/templateDetail/TemplateTopo.vue'], () => {
    resolve(require('views/service-orchestration/templateDetail/TemplateTopo.vue'));
  }, 'templateTopo');
};

const templateInfo = resolve => {
  require.ensure(['views/service-orchestration/templateDetail/TemplateInfo.vue'], () => {
    resolve(require('views/service-orchestration/templateDetail/TemplateInfo.vue'));
  }, 'templateInfo');
};

const orchestrationList = resolve => {
  require.ensure(['views/service-orchestration/OrchestrationList.vue'], () => {
    resolve(require('views/service-orchestration/OrchestrationList.vue'));
  }, 'orchestrationList');
};

const stackList = resolve => {
  require.ensure(['views/service-orchestration/stackList.vue'], () => {
    resolve(require('views/service-orchestration/stackList.vue'));
  }, 'stackList');
};

const orchestrationDetail = resolve => {
  require.ensure(['views/service-orchestration/OrchestrationDetail.vue'], () => {
    resolve(require('views/service-orchestration/OrchestrationDetail.vue'));
  }, 'orchestrationDetail');
};

const orchestrationTopo = resolve => {
  require.ensure(['views/service-orchestration/orchestrationDetail/OrchestrationTopo.vue'], () => {
    resolve(require('views/service-orchestration/orchestrationDetail/OrchestrationTopo.vue'));
  }, 'orchestrationTopo');
};

const orchestrationInfo = resolve => {
  require.ensure(['views/service-orchestration/orchestrationDetail/OrchestrationInfo.vue'], () => {
    resolve(require('views/service-orchestration/orchestrationDetail/OrchestrationInfo.vue'));
  }, 'orchestrationInfo');
};

const orchestrationRes = resolve => {
  require.ensure(['views/service-orchestration/orchestrationDetail/OrchestrationRes.vue'], () => {
    resolve(require('views/service-orchestration/orchestrationDetail/OrchestrationRes.vue'));
  }, 'orchestrationRes');
};

const orchestrationEvent = resolve => {
  require.ensure(['views/service-orchestration/orchestrationDetail/OrchestrationEvent.vue'], () => {
    resolve(require('views/service-orchestration/orchestrationDetail/OrchestrationEvent.vue'));
  }, 'orchestrationEvent');
};

const orchestratedTemplate = resolve => {
  require.ensure(['views/service-orchestration/orchestrationDetail/OrchestratedTemplate.vue'], () => {
    resolve(require('views/service-orchestration/orchestrationDetail/OrchestratedTemplate.vue'));
  }, 'orchestratedTemplate');
};

// 2. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
// 我们晚点再讨论嵌套路由。
const routes = [
  // 动态路径参数 以冒号开头
  {
    name: 'service-orchestration',
    path: '/service-orchestration',
    component: serviceOrchestration,
    flg:Vue.AuthList["m.heat"],
    meta: {
      title: Vue.t("heat.serviceOrchestration"),
      des: Vue.t("heat.serviceOrchestration")
    },
    children: [{
      name: 'orchestrationTemplate',
      path: 'orchestrationTemplate',
      alias: '/',
      component: orchestrationTemplate,
      flg:Vue.AuthList["m.heat.template"],
      meta: {
        des: Vue.t("heat.heatTemplate"),
        desContent: Vue.t("heat.heatTemplateDesc")
      },
      children: [{
        name: 'templateList',
        path: '',
        component: templateList,
        meta: {
          des: ""
        }
      },
        {
          name: 'editCustomTemplate',
          path: 'editCustomTemplate/:projectId/:id',
          alias: '/',
          component: editCustomTemplate,
          meta: {
            des: Vue.t('heat.modifyTemplate')
          }
        },
        {
        name: 'createCustomTemplate',
        path: 'createCustomTemplate',
        alias: '/',
        component: createCustomTemplate,
        meta: {
          des: Vue.t('heat.createCustomTemplate'),
          desContent:Vue.t('heat.createCustomTemplateDesc')
        }
      }, {
        name: 'templateDetailIndex',
        path: 'templateDetailIndex/:projectId/:id',
        alias: '/',
        component: templateDetailIndex,
        meta: {
          des: Vue.t('heat.templateDetail')
        },
        children:[{
          name: 'templateTopo',
          path: 'templateTopo',
          alias: '/',
          component: templateTopo,
          meta: {
            des: Vue.t('heat.topology')
          }
        }, {
          name: 'templateInfo',
          path: 'templateInfo',
          alias: '/',
          component: templateInfo,
          meta: {
            des: Vue.t('heat.template')
          }
        }]
      }]
    }, {
      name: 'orchestrationList',
      path: 'orchestrationList',
      alias: '/',
      component: orchestrationList,
      flg:Vue.AuthList["m.heat.stack"],
      meta: {
        des: Vue.t("heat.heatStack"),
        desContent:Vue.t("heat.heatStackDesc")
      },
      children: [{
        name: 'stackList',
        path: '',
        component: stackList,
        meta: {
          des: ''
        }
      }, {
        name: 'orchestrationDetail',
        path: 'orchestrationDetail/:stackName/:stackId',
        alias: '/',
        component: orchestrationDetail,
        meta: {
          des: Vue.t('heat.stackDetail')
        },
        children: [{
          name: 'orchestrationTopo',
          path: 'orchestrationTopo',
          alias: '/',
          component: orchestrationTopo,
          meta: {
            des: Vue.t('heat.topology')
          }
        }, {
          name: 'orchestrationInfo',
          path: 'orchestrationInfo',
          alias: '/',
          component: orchestrationInfo,
          meta: {
            des: Vue.t('heat.summary')
          }
        }, {
          name: 'orchestrationRes',
          path: 'orchestrationRes',
          alias: '/',
          component: orchestrationRes,
          meta: {
            des: Vue.t('heat.resources')
          }
        }, {
          name: 'orchestrationEvent',
          path: 'orchestrationEvent',
          alias: '/',
          component: orchestrationEvent,
          meta: {
            des: Vue.t('heat.event')
          }
        }, {
          name: 'orchestratedTemplate',
          path: 'orchestratedTemplate',
          alias: '/',
          component: orchestratedTemplate,
          meta: {
            des: Vue.t('heat.template')
          }
        }]
      }]
    }]
  }
];

export default routes;
