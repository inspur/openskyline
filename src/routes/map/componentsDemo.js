const ComponentsDemo = resolve => {
  require.ensure(['views/components-demo/ComponentsDemo.vue'], () => {
    resolve(require('views/components-demo/ComponentsDemo.vue'))
  }, 'ComponentsDemo')
};

const ZtreeDemo = resolve => {
  require.ensure(['views/components-demo/ZtreeDemo.vue'], () => {
    resolve(require('views/components-demo/ZtreeDemo.vue'))
  }, 'ZtreeDemo')
};

const OperationPanelDemo = resolve => {
  require.ensure(['views/components-demo/OperationPanelDemo.vue'], () => {
    resolve(require('views/components-demo/OperationPanelDemo.vue'))
  }, 'OperationPanelDemo')
};

const tabsDemo = resolve => {
  require.ensure(['views/components-demo/tabs/TabsDemo.vue'], () => {
    resolve(require('views/components-demo/tabs/TabsDemo.vue'))
  }, 'tabsDemo')
};

const PanelAllDemo = resolve => {
  require.ensure(['views/components-demo/tabs/PanelAll.vue'], () => {
    resolve(require('views/components-demo/tabs/PanelAll.vue'))
  }, 'PanelAllDemo')
};
const PanelVirtualDemo = resolve => {
  require.ensure(['views/components-demo/tabs/PanelVirtual.vue'], () => {
    resolve(require('views/components-demo/tabs/PanelVirtual.vue'))
  }, 'PanelVirtualDemo')
};
const PanelOpenStackDemo = resolve => {
  require.ensure(['views/components-demo/tabs/PanelOpenStack.vue'], () => {
    resolve(require('views/components-demo/tabs/PanelOpenStack.vue'))
  }, 'PanelOpenStackDemo')
};

import projectRoutes from './project';
import identityRoutes from './identity';

// 2. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
// 我们晚点再讨论嵌套路由。
const routes = [
  // 动态路径参数 以冒号开头
  {
    path: '/components-demo',
    name: 'components-demo',
    component: ComponentsDemo,
    meta: {
      des: "组件Demo"
    },
    children: [{
      name: 'ztree',
      path: 'ztree',
      alias: '/',
      component: ZtreeDemo,
      meta: {
        des: "ztree"
      }
    }, {
      name: 'operation-panel',
      path: 'operation-panel',
      alias: '/',
      component: OperationPanelDemo,
      meta: {
        des: "操作区域"
      }
    }, {
      name: 'tabs',
      path: 'tabs',
      alias: '/',
      component: tabsDemo,
      meta: {
        des: "tabs路由"
      },
      children: [{
        name: 'all',
        path: 'all',
        alias: '/',
        component: PanelAllDemo,
        meta: {
          des: "所有"
        }
      }, {
        name: 'virtual',
        path: 'virtual',
        alias: '/',
        component: PanelVirtualDemo,
        meta: {
          des: "虚拟化平台"
        }
      }, {
        name: 'open-stack',
        path: 'open-stack',
        alias: '/',
        component: PanelOpenStackDemo,
        meta: {
          des: "OpenStack平台"
        }
      }]
    },
    ...projectRoutes,
    ...identityRoutes
    ]
  }

]

export default routes
