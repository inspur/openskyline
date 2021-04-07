const index = resolve => {
  require.ensure(['views/clouddata/Index.vue'], () => {
    resolve(require('views/clouddata/Index.vue'));
  }, 'index');
};

const cloudTabs = resolve => {
  require.ensure(['views/clouddata/saharaCluster/CloudTabs.vue'], () => {
    resolve(require('views/clouddata/saharaCluster/CloudTabs.vue'));
  }, 'cloudTabs');
};

const saharaClusterIndex = resolve => {
  require.ensure(['views/clouddata/saharaCluster/cluster/ClusterIndex.vue'], () => {
    resolve(require('views/clouddata/saharaCluster/cluster/ClusterIndex.vue'));
  }, 'saharaClusterIndex');
};

const clusterList = resolve => {
  require.ensure(['views/clouddata/saharaCluster/cluster/ClusterList.vue'], () => {
    resolve(require('views/clouddata/saharaCluster/cluster/ClusterList.vue'));
  }, 'clusterList');
};

const clusterTabs = resolve => {
  require.ensure(['views/clouddata/saharaCluster/cluster/DetailTabs.vue'], () => {
    resolve(require('views/clouddata/saharaCluster/cluster/DetailTabs.vue'));
  }, 'clusterTabs');
};

const clusterTemplate = resolve => {
  require.ensure(['views/clouddata/saharaCluster/clusterTemplate/Index.vue'], () => {
    resolve(require('views/clouddata/saharaCluster/clusterTemplate/Index.vue'));
  }, 'clusterTemplate');
};

const nodeGroup = resolve => {
  require.ensure(['views/clouddata/saharaCluster/nodeGroup/Index.vue'], () => {
    resolve(require('views/clouddata/saharaCluster/nodeGroup/Index.vue'));
  }, 'nodeGroup');
};

const image = resolve => {
  require.ensure(['views/clouddata/saharaCluster/image/ImageList.vue'], () => {
    resolve(require('views/clouddata/saharaCluster/image/ImageList.vue'));
  }, 'image');
};

const imageIndex = resolve => {
  require.ensure(['views/clouddata/saharaCluster/image/ImageIndex.vue'], () => {
    resolve(require('views/clouddata/saharaCluster/image/ImageIndex.vue'));
  }, 'imageIndex');
};

const imageDetail = resolve => {
  require.ensure(['views/clouddata/saharaCluster/image/ImageDetail.vue'], () => {
    resolve(require('views/clouddata/saharaCluster/image/ImageDetail.vue'));
  }, 'imageDetail');
};

const groupDetail = resolve => {
  require.ensure(['views/clouddata/saharaCluster/nodeGroup/DetailTemplate.vue'], () => {
    resolve(require('views/clouddata/saharaCluster/nodeGroup/DetailTemplate.vue'));
  }, 'groupDetail');
};

const groupIndex = resolve => {
  require.ensure(['views/clouddata/saharaCluster/nodeGroup/GroupIndex.vue'], () => {
    resolve(require('views/clouddata/saharaCluster/nodeGroup/GroupIndex.vue'));
  }, 'groupIndex');
};

const routes = [
  {
    name: 'clouddata',
    path: '/clouddata',
    alias: '/',
    component: index,
    flg: Vue.AuthList["m.sahara"],
    meta: {
      des: ""
    },
    children: [{
      name: 'cluster',
      path: 'cluster',
      component: saharaClusterIndex,
      alias: '/',
      children: [{
        nname: "clusterList",
        path: "",
        component: clusterList,
        meta: {
          des: ''
        }
      }, {
        name: 'clusterTabs',
        path: ':clusterId/clusterTabs',
        component: clusterTabs,
        meta: {
          des: ''
        }
      }]
    }, {
      name: "clusterTemplate",
      path: "clusterTemplate",
      component: clusterTemplate,
      alias: '/'
    }, {
      name: "nodeGroup",
      path: "nodeGroup",
      component: groupIndex,
      alias: '/',
      children: [{
        name: 'nodeGroup',
        path: '',
        component: nodeGroup,
        meta: {
          des: ''
        }
      }, {
        name: 'groupDetail',
        path: ':templateId/groupDetail',
        alias: "/",
        component: groupDetail,
        meta: {
          des: Vue.t('cloudTask.detail')
        }
      }]
    }, {
      name: "image",
      path: "image",
      component: imageIndex,
      alias: '/',
      children: [{
        name: 'imageList',
        path: '',
        component: image,
        meta: {
          des: ''
        }
      }, {
        name: 'imageDetail',
        path: ':imageId/imageDetail',
        alias: "/",
        component: imageDetail,
        meta: {
          des: Vue.t('calcStorLang.imageDetail')
        }
      }]
    }]
  }
];

export default routes;
