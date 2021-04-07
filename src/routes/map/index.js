import startPage from './startPage';
import projectApply from './projectApply';
import calculateStorageRoutes from './calculateStorage';
import networkRoutes from './network';
import databaseRouters from './database';
import containerRouters from './container';
import serviceOrchestrationRoutes from './serviceOrchestration';
import scalingService from './scalingService';
import operRoutes from './operations';
import workFlowRouters from './workflow';
import intelligentMonitoring from './intelligentMonitoring';
import operationAnalysis from './operationAnalysis';
import cloudDataRoutes from './cloudData';
import systemManagement from './systemManagement';
import menus from '../../views/menus/index.js';
let menusArr = menus.call(Vue);
var routes = [
  ...startPage,
  ...projectApply,
  ...calculateStorageRoutes,
  ...networkRoutes,
  ...databaseRouters,
  ...containerRouters,
  ...cloudDataRoutes,
  ...serviceOrchestrationRoutes,
  ...scalingService,
  ...operRoutes,
  ...workFlowRouters,
  ...intelligentMonitoring,
  ...operationAnalysis,
  ...systemManagement,
  {
    path: '*',
    flg: true,
    redirect: function () {
      let pathArr = [];
      getFirstMenu(menusArr, pathArr);
      Vue.prototype.$notify({
        message: "无权限访问或者url路径有问题",
        type: 'warning'
      });
      return pathArr.join('/').replace(/\/\//g, '/');
    }
  }
];
function deleteNoauth(arr) {
  for (var i=arr.length-1; i>=0; i--) {
    let item = arr[i];
    if (item.hasOwnProperty("flg")) { //设置了flg
      if (item.flg===true) { //有权限
        if (item.children&&item.children.length>0) {
          deleteNoauth(item.children);
        }
      } else {
        arr.splice(i, 1);
      }
    } else { //没设置代表有权限(默认有权限)
      if (item.children&&item.children.length>0) {
        deleteNoauth(item.children);
      }
    }
  }
}
function getFirstMenu(menuArr, pathArr) {
  let obj = menuArr.find((item) => {
    return item.flg;
  })
  pathArr.push(...obj.path.split('/'));
  if (obj.subMenus&&obj.subMenus.length>0) {
    getFirstMenu(obj.subMenus, pathArr);
  }
}
//过滤没有权限的路由
deleteNoauth(routes);
export default routes;
