//容器服务菜单
const index = resolve => {
  require.ensure(['views/workflow/Index.vue'], () => {
    resolve(require('views/workflow/Index.vue'));
  }, 'index');
};

const workflowtasklog = resolve => {
  require.ensure(['views/workflow/TaskLog.vue'], () => {
    resolve(require('views/workflow/TaskLog.vue'));
  }, 'workflowtasklog');
};

const workflowexecutions = resolve => {
  require.ensure(['views/workflow/WorkFlowExecutions.vue'], () => {
    resolve(require('views/workflow/WorkFlowExecutions.vue'));
  }, 'workflowexecutions');
};

const workflowtriggers = resolve => {
  require.ensure(['views/workflow/WorkFlowTriggers.vue'], () => {
    resolve(require('views/workflow/WorkFlowTriggers.vue'));
  }, 'workflowtriggers');
};

const workflowtriggertaskguide = resolve => {
  require.ensure(['views/workflow/WorkFlowTriggerTaskGuide.vue'], () => {
    resolve(require('views/workflow/WorkFlowTriggerTaskGuide.vue'));
  }, 'workflowtriggertaskguide');
};

const workflowtriggertasks = resolve => {
  require.ensure(['views/workflow/WorkFlowTriggerTasks.vue'], () => {
    resolve(require('views/workflow/WorkFlowTriggerTasks.vue'));
  }, 'workflowtriggertasks');
};

const workflowtriggertasktab = resolve => {
  require.ensure(['views/workflow/WorkFlowTriggerTaskTab.vue'], () => {
    resolve(require('views/workflow/WorkFlowTriggerTaskTab.vue'));
  }, 'workflowtriggertasktab');
};

const workflowtasklogdetail = resolve => {
  require.ensure(['views/workflow/WorkFlowTaskDetailGuide.vue'], () => {
    resolve(require('views/workflow/WorkFlowTaskDetailGuide.vue'));
  }, 'workflowtasklogdetail');
};

const workflowexedetail = resolve => {
  require.ensure(['views/workflow/WorkFlowExeDetail.vue'], () => {
    resolve(require('views/workflow/WorkFlowExeDetail.vue'));
  }, 'workflowexedetail');
};

const workflowchildexedetail = resolve => {
  require.ensure(['views/workflow/WorkFlowChildExeDetail.vue'], () => {
    resolve(require('views/workflow/WorkFlowChildExeDetail.vue'));
  }, 'workflowchildexedetail');
};

// 2. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
// 我们晚点再讨论嵌套路由。
const routes = [
  // 动态路径参数 以冒号开头
  {
    name:"workflow",
    path: '/workflow',
    alias: '/',
    component: index,
    flg:Vue.AuthList["m.workflow"],
    meta: {
      des: Vue.t('task.cloudTaskManage')
    },
    children:[{
      name: 'workflowtriggertaskguide',
      path: 'workflowtriggertaskguide',
      alias: '/',
      component: workflowtriggertaskguide,
      flg:Vue.AuthList["m.workflow.task"],
      meta: {
        des: Vue.t('task.cloudTask'),
        desContent:Vue.t('task.cloudTaskDesc')
      },
      children: [{
        name: 'workflowtriggers',
        path: '',
        component: workflowtriggers,
        meta: {
          des: ''
        }
      },
      {
        name: 'workflowtasklogdetail',
        path: 'workflowtasklogdetail/:taskid/:id',
        alias: '/',
        component: workflowtasklogdetail,
        meta: {
          des: Vue.t('task.logDetail')
        },
        children: [{
          name: 'workflowexedetail',
          path: 'workflowexedetail',
          alias: '',
          component: workflowexedetail,
          meta: {
            des: Vue.t('task.detail')
          }
        },
        {
          name: 'workflowchildexedetail',
          path: 'workflowchildexedetail',
          alias: '',
          component: workflowchildexedetail,
          meta: {
            des: Vue.t('task.subtaskLog')
          }
        }]
      },
      {
        name: 'workflowtriggertasktab',
        path: 'workflowtriggertasktab/:taskid',
        alias: '/',
        component: workflowtriggertasktab,
        meta: {
          des: Vue.t('task.taskDetail')
        },
        children: [{
          name: 'workflowtriggertasks',
          path: '',
          component: workflowtriggertasks,
          meta: {
            des: Vue.t('task.task')
          }
        },
        {
          name: 'workflowtasklog',
          path: 'workflowtasklog',
          alias: '/',
          component: workflowtasklog,
          flg:true,
          meta: {
            des: Vue.t('task.taskLog'),
            desContent:Vue.t('task.taskLogDesc')
          },
          children: [{
            name: 'workflowexecutions',
            path: '',
            component: workflowexecutions,
            meta: {
              des: ''
            }
          }]
          }
        ]
       }]
    }]
  }
];

export default routes;
