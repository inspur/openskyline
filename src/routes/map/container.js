const index = resolve => {
  require.ensure(['views/container/Index.vue'], () => {
    resolve(require('views/container/Index.vue'));
  }, 'index');
};

const clusterIndex = resolve => {
  require.ensure(['views/container/kbcontainerCluster/ContainerClusterIndex.vue'], () => {
    resolve(require('views/container/kbcontainerCluster/ContainerClusterIndex.vue'));
  }, 'clusterIndex');
};

const clusterDetail = resolve => {
  require.ensure(['views/container/kbcontainerCluster/ContainerClusterDetail.vue'], () => {
    resolve(require('views/container/kbcontainerCluster/ContainerClusterDetail.vue'));
  }, 'clusterDetail');
};

const kbcontainerCluster = resolve => {
  require.ensure(['views/container/kbcontainerCluster/ContainerCluster.vue'], () => {
    resolve(require('views/container/kbcontainerCluster/ContainerCluster.vue'));
  }, 'kbcontainerCluster');
};

const containerImages = resolve => {
  require.ensure(['views/container/containerImages/ContainerImages.vue'], () => {
    resolve(require('views/container/containerImages/ContainerImages.vue'));
  }, 'containerImages');
};

const imageServerList = resolve => {
  require.ensure(['views/container/containerImages/ContainerImageList.vue'], () => {
    resolve(require('views/container/containerImages/ContainerImageList.vue'));
  }, 'imageServerList');
};

const imageGroup = resolve => {
  require.ensure(['views/container/containerImages/ImageGroup.vue'], () => {
    resolve(require('views/container/containerImages/ImageGroup.vue'));
  }, 'imageGroup');
};

const imageGroupList = resolve => {
  require.ensure(['views/container/containerImages/ImageGroupList.vue'], () => {
    resolve(require('views/container/containerImages/ImageGroupList.vue'));
  }, 'imageGroupList');
};

const imageList = resolve => {
  require.ensure(['views/container/containerImages/ImageList.vue'], () => {
    resolve(require('views/container/containerImages/ImageList.vue'));
  }, 'imageList');
};

const applicationContainer = resolve => {
  require.ensure(['views/container/containerApplication/ApplicationManage.vue'], () => {
    resolve(require('views/container/containerApplication/ApplicationManage.vue'));
  }, 'applicationContainer');
};

const appDetail = resolve => {
  require.ensure(['views/container/containerApplication/ContainerInstanceDetail.vue'], () => {
    resolve(require('views/container/containerApplication/ContainerInstanceDetail.vue'));
  }, 'appDetail');
};

const appInfo = resolve => {
  require.ensure(['views/container/containerApplication/AppInfo.vue'], () => {
    resolve(require('views/container/containerApplication/AppInfo.vue'));
  }, 'appInfo');
};

const instanceList = resolve => {
  require.ensure(['views/container/containerApplication/InstanceDetailList.vue'], () => {
    resolve(require('views/container/containerApplication/InstanceDetailList.vue'));
  }, 'instanceList');
};

const environmentList = resolve => {
  require.ensure(['views/container/containerApplication/EnvironmentList.vue'], () => {
    resolve(require('views/container/containerApplication/EnvironmentList.vue'));
  }, 'environmentList');
};

const serviceList = resolve => {
  require.ensure(['views/container/containerApplication/ServiceDetail.vue'], () => {
    resolve(require('views/container/containerApplication/ServiceDetail.vue'));
  }, 'serviceList');
};

const eventList = resolve => {
  require.ensure(['views/container/containerApplication/EventList.vue'], () => {
    resolve(require('views/container/containerApplication/EventList.vue'));
  }, 'eventList');
};

const containerApp = resolve => {
  require.ensure(['views/container/containerApplication/ContainerApp.vue'], () => {
    resolve(require('views/container/containerApplication/ContainerApp.vue'));
  }, 'containerApp');
};

const ContainerPodIndex = resolve => {
  require.ensure(['views/container/containerApplication/ContainerPodIndex.vue'], () => {
    resolve(require('views/container/containerApplication/ContainerPodIndex.vue'));
  }, 'ContainerPodIndex');
};

const containerPodDetail = resolve => {
  require.ensure(['views/container/containerApplication/ContainerPodDetail.vue'], () => {
    resolve(require('views/container/containerApplication/ContainerPodDetail.vue'));
  }, 'containerPodDetail');
};
const containerPodInfo = resolve => {
  require.ensure(['views/container/containerApplication/ContainerPodInfo.vue'], () => {
    resolve(require('views/container/containerApplication/ContainerPodInfo.vue'));
  }, 'containerPodInfo');
};
const containerPodLog = resolve => {
  require.ensure(['views/container/containerApplication/ContainerPodLog.vue'], () => {
    resolve(require('views/container/containerApplication/ContainerPodLog.vue'));
  }, 'containerPodLog');
};

const containerVolume = resolve => {
  require.ensure(['views/container/kbcontainerVolume/ContainerVolumeList.vue'], () => {
    resolve(require('views/container/kbcontainerVolume/ContainerVolumeList.vue'));
  }, 'containerVolume');
};

const containerStorage = resolve => {
  require.ensure(['views/container/kbcontainerVolume/ContainerStorageTab.vue'], () => {
    resolve(require('views/container/kbcontainerVolume/ContainerStorageTab.vue'));
  }, 'containerStorage');
}

const storageProvider = resolve => {
  require.ensure(['views/container/kbcontainerVolume/StorageProvider.vue'], () => {
    resolve(require('views/container/kbcontainerVolume/StorageProvider.vue'));
  }, 'storageProvider');
}

const routes = [
  // 动态路径参数 以冒号开头
  {
    name: "container",
    path: '/container',
    alias: '/',
    component: index,
    flg: Vue.AuthList["m.docker_server"],
    meta: {
      des: Vue.t('container.containerService')
    },
    children: [{
      name: 'kbcontainerCluster',
      path: 'kbcontainerCluster',
      alias: '/',
      component: clusterIndex,
      flg: Vue.AuthList["m.docker_server.clusters"],
      meta: {
        des: Vue.t('container.kubernetesCluster')
      },
      children: [{
        name: 'containerCluster',
        path: '',
        component: kbcontainerCluster,
        meta: {
          des: ''
        }
      }, {
        name: 'clusterDetail',
        path: ':clusterId/:rancherclusterId/:projectId/:pName/clusterDetail',
        alias: "/",
        component: clusterDetail,
        meta: {
          des: Vue.t('container.clusterInfo')
        }
      }]
    }, {
      name: 'applicationContainer',
      path: 'applicationContainer',
      alias: '/',
      component: containerApp,
      flg: Vue.AuthList["m.docker_server.kbclusters"],
      meta: {
        des: Vue.t('container.appManage'),
        desContent: Vue.t('container.containerApp2Desc')
      },
      children: [{
        name: 'containerApp',
        path: '',
        component: applicationContainer,
        meta: {
          des: ""
        }
      }, {
        name: 'appDetail',
        path: ':rancherClusterId/:type/:nameSpace/:appName/appDetail',
        alias: "/",
        component: appDetail,
        meta: {
          des: Vue.t('container.appDetail')
        },
        children: [{
          name: 'appInfo',
          path: 'appInfo',
          alias: "/",
          component: appInfo,
          meta: {
            des: Vue.t('container.basicInfo')
          }
        }, {
          name: 'instanceList',
          path: 'instanceList',
          alias: "/",
          component: ContainerPodIndex,
          meta: {
            des: Vue.t('container.container')
          },
          children: [{
            name: 'ContainerPodIndex',
            path: '',
            component: instanceList
          }, {
            name: 'podDetail',
            path: ':podName/podDetail',
            alias: "/",
            component: containerPodDetail,
            meta: {
              des: Vue.t('container.podDetail')
            },
            children: [{
              name: 'containerPodInfo',
              path: 'podInfo',
              alias: "/",
              component: containerPodInfo,
              meta: {
                des: Vue.t('container.basicInfo')
              }
            }, {
              name: 'containerPodLog',
              path: 'podLog',
              alias: "/",
              component: containerPodLog,
              meta: {
                des: Vue.t('container.log')
              }
            }]
          }]
        }, {
          name: 'environmentList',
          path: 'environmentList',
          alias: "/",
          component: environmentList,
          meta: {
            des: Vue.t('container.environmentParam')
          }
        }, {
          name: 'serviceList',
          path: 'serviceList',
          component: serviceList,
          meta: {
            des: Vue.t('container.service')
          }
        }, {
          name: 'eventList',
          path: 'eventList',
          component: eventList,
          meta: {
            des: Vue.t('container.event')
          }
        }]
      }]
    }, {
      name: "containerImages",
      path: 'containerImages',
      alias: '/',
      component: containerImages,
      flg: Vue.AuthList["m.docker_server.images"],
      meta: {
        des: Vue.t('container.containerImage'),
        desContent: Vue.t('container.containerImageDesc')
      },
      children: [{
        name: "imageServerList",
        path: "",
        component: imageServerList,
        meta: {
          des: ""
        }
      }, {
        name: "imageGroup",
        path: "imageGroup/:harborId/:server",
        component: imageGroup,
        meta: {
          des: Vue.t('container.imageGroup')
        },
        children: [{
          name: "imageGroupList",
          path: "",
          component: imageGroupList,
          meta: {
            des: ""
          }
        }, {
          name: "imageList",
          path: ":groupId/:groupName/imageList",
          component: imageList,
          meta: {
            des: Vue.t('container.image')
          }
        }]
      }]
    }, {
      name: 'containerStorage',
      path: 'containerStorage',
      component: containerStorage,
      alias: '/',
      flg: Vue.AuthList["m.docker_server.volume"],
      meta: {
        des: Vue.t('container.containerVolume'),
        desContent: Vue.t('container.containerVolumeDesc')
      },
      children: [{
        name: 'containerVolume',
        path: 'containerVolume',
        component: containerVolume,
        alias: '/',
        meta: {
          des: Vue.t("container.containerVolume")
        }
      }, {
        name: 'storageProvider',
        path: 'storageProvider',
        component: storageProvider,
        alias: '/',
        meta: {
          des: Vue.t("container.storageProvider")
        }
      }]
    }]
  }
];

export default routes;
