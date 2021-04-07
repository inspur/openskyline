import VueRouter from 'vue-router'
import routesMap from './map/' // 路由映射
import hooks from './hooks/' // 路由钩子
Vue.use(VueRouter);
export default {
  getInstance() {
    // 3. 创建 router 实例，然后传 `routes` 配置
    // 你还可以传别的配置参数, 不过先这么简单着吧。
    const router = new VueRouter({
      mode: 'hash',  // hash
      // base: __dirname,
      routes: routesMap // （缩写）相当于 routes: routes
    });
    hooks(router);

    return router;
  }
};
