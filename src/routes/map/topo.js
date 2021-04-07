const Topo = resolve => {
  require.ensure(['views/topo/Topo.vue'], () => {
    resolve(require('views/topo/Topo.vue'))
  }, 'Topo')
};
const resTopo = resolve => {
  require.ensure(['views/topo/ResTopo.vue'], () => {
    resolve(require('views/topo/ResTopo.vue'))
  }, 'resTopo')
};
const netTopo = resolve => {
  require.ensure(['views/topo/NetTopo.vue'], () => {
    resolve(require('views/topo/NetTopo.vue'))
  }, 'netTopo')
};
const routes = [
  {
    path: '/topo',
    name: 'topo',
    component: Topo,
    meta: {
      des: "拓扑图"
    },
    children: [{
      name: 'resTopo',
      path: 'resTopo',
      alias: '/',
      component: resTopo,
      meta: {
        des: "资源拓扑图"
      }
    }, {
      name: 'netTopo',
      path: 'netTopo',
      alias: '/',
      component: netTopo,
      meta: {
        des: "网络拓扑图"
      }
    }]
  }]

export default routes
