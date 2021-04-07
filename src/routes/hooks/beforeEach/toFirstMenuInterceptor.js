// 如果是跟路径，调到第一个有权限的菜单
import menus from '../../../views/menus/index.js';
let menusArr = menus.call(Vue);
let pathArr = [];
getFirstMenu(menusArr, pathArr);
let path = pathArr.join('/').replace(/\/\//g, '/');

const toFirstMenuInterceptor = (router) => (to, from, next) => {
  if (to.path==="/") { //如果根目录自动进入有权限的第一个菜单
    if (Vue.projectList.length==0) { //如果没有任何权限
      next('/projectApply');
      return;
    }
    next({
      path:path //,
      // query: {
      //   __: +new Date()
      // }
    });
    return false;
  }
  next();
};
function getFirstMenu(menuArr, pathArr) {
  let obj = menuArr.find((item) => {
    return item.flg;
  })
  if (!obj||!obj.path) {
    return;
  }
  pathArr.push(...obj.path.split('/'));
  if (obj.subMenus&&obj.subMenus.length>0) {
    getFirstMenu(obj.subMenus, pathArr);
  }
}
export default toFirstMenuInterceptor;
