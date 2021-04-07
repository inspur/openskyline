//数据库服务菜单
const databaseService = resolve => {
  require.ensure(['views/database/Index.vue'], () => {
    resolve(require('views/database/Index.vue'));
  }, 'databaseService');
};

const databaseInstance = resolve => {
  require.ensure(['views/database/Database.vue'], () => {
    resolve(require('views/database/Database.vue'));
  }, 'databaseInstance');
};

const databaseIndex = resolve => {
  require.ensure(['views/database/Index.vue'], () => {
    resolve(require('views/database/Index.vue'));
  }, 'databaseIndex');
};

const databaseInstanceDetail = resolve => {
  require.ensure(['views/database/DatabaseInstanceDetail.vue'], () => {
    resolve(require('views/database/DatabaseInstanceDetail.vue'));
  }, 'databaseIndex');
};

const databaseList = resolve => {
  require.ensure(['views/database/DatabaseList.vue'], () => {
    resolve(require('views/database/DatabaseList.vue'));
  }, 'databaseList');
};

const userList = resolve => {
  require.ensure(['views/database/UserList.vue'], () => {
    resolve(require('views/database/UserList.vue'));
  }, 'userList');
};

// 2. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
// 我们晚点再讨论嵌套路由。
const routes = [
  // 动态路径参数 以冒号开头
  {
    name: 'databaseService',
    path: '/databaseService',
    alias: '/',
    // redirect:"/databaseService/databaseInstance",
    component: databaseService,
    flg:Vue.AuthList["m.database"],
    meta: {
      des: ""
    },
    children:[{
      name:"databaseInstance",
      path: 'databaseInstance',
      alias: '/',
      component: databaseIndex,
      meta: {
        des: Vue.t('db.databaseService'),
        desContent:Vue.t('db.databaseServiceDesc')
      },
      children:[{
        name:"databaseInstanceList",
        path:"",
        component:databaseInstance,
        meta: {
          des: ""
        }
      }, {
        name:"databaseInstanceDetail",
        path: 'databaseInstanceDetail/:instanceId',
        alias: '/',
        component: databaseInstanceDetail,
        meta: {
          des: Vue.t('db.detail')
        },
        children:[{
          name:"databaseList",
          path:"databaseList",
          alias: '/',
          component:databaseList,
          meta: {
            des: Vue.t('db.database')
          }
        }, {
          name:"userList",
          path:"userList",
          alias: '/',
          component:userList,
          meta: {
            des: Vue.t('db.user')
          }
        }]
      }]
    }]
  }
];

export default routes;
