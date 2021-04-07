const processManage = resolve => {
  require.ensure(['views/process/Process.vue'], () => {
    resolve(require('views/process/Process.vue'));
  }, 'processManage');
};

const flowManagement = resolve => {
  require.ensure(['views/process/flowManage/FlowManage.vue'], () => {
    resolve(require('views/process/flowManage/FlowManage.vue'));
  }, 'flowManagement');
};

const processAdd = resolve => {
  require.ensure(['views/process/flowManage/ProcessAdd.vue'], () => {
    resolve(require('views/process/flowManage/ProcessAdd.vue'))
  }, 'processAdd')
}

const flow = resolve => {
  require.ensure(['views/process/flow/Flow.vue'], () => {
    resolve(require('views/process/flow/Flow.vue'));
  }, 'flow');
};

const pending = resolve => {
  require.ensure(['views/process/flow/Pending.vue'], () => {
    resolve(require('views/process/flow/Pending.vue'));
  }, 'flow');
};

const related = resolve => {
  require.ensure(['views/process/flow/Related.vue'], () => {
    resolve(require('views/process/flow/Related.vue'));
  }, 'flow');
};

// 2. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
// 我们晚点再讨论嵌套路由。
const routes = [
  // 动态路径参数 以冒号开头
  {
    name: 'process',
    path: '/process',
    component: processManage,
    meta: {
      title: "业务管理",
      des: "业务管理"
    },
    children: [{
      name: 'flow-manage',
      path: 'flow-manage',
      alias: '/',
      component: flowManagement,
      meta: {
        des: "流程管理"
      }
      // children: [{
      //   name: 'process-add',
      //   path: 'process-add',
      //   meta: {
      //     des: '添加流程2'
      //   },
      //   component: processAdd
      // }]
    }, {
      name: 'flow',
      path: 'flow',
      alias: '/',
      component: flow,
      meta: {
        des: "流程"
      },
      children: [{
        name: 'pending',
        path: 'pending',
        meta: {
          des: '待处理'
        },
        component: pending
      }, {
        name: 'related',
        path: 'related',
        meta: {
          des: '与我有关的'
        },
        component: related
      }]
    }, {
      name: 'process-add',
      path: 'process-add',
      meta: {
        force: true,
        des: '添加流程'
      },
      component: processAdd
    }]
  }
];

export default routes;
