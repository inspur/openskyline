const intelligentMonitoring = resolve => {
  require.ensure(['views/intelligentMonitoring/IntelligentMonitoring.vue'], () => {
    resolve(require('views/intelligentMonitoring/IntelligentMonitoring.vue'));
  }, 'intelligentMonitoring');
};

const monitoringSetting = resolve => {
  require.ensure(['views/intelligentMonitoring/monitoringSetting/index.vue'], () => {
    resolve(require('views/intelligentMonitoring/monitoringSetting/index.vue'));
  }, 'monitoringSetting');
};

const SettingDetail = resolve => {
  require.ensure(['views/intelligentMonitoring/monitoringSetting/setting.vue'], () => {
    resolve(require('views/intelligentMonitoring/monitoringSetting/setting.vue'));
  }, 'SettingDetail');
};

const AddDetail = resolve => {
  require.ensure(['views/intelligentMonitoring/monitoringSetting/add.vue'], () => {
    resolve(require('views/intelligentMonitoring/monitoringSetting/add.vue'));
  }, 'AddDetail');
};

const warnManagement = resolve => {
  require.ensure(['views/intelligentMonitoring/warnManagement/WarnManagement.vue'], () => {
    resolve(require('views/intelligentMonitoring/warnManagement/WarnManagement.vue'));
  }, 'warnManagement');
};
const managementDetail = resolve => {
  require.ensure(['views/intelligentMonitoring/warnManagement/warnMainPage/ManagementDetail.vue'], () => {
    resolve(require('views/intelligentMonitoring/warnManagement/warnMainPage/ManagementDetail.vue'));
  }, 'managementDetail');
};

const resourceMonitor = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/ResourceMonitor.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/ResourceMonitor.vue'));
  }, 'resourceMonitor');
};

const host = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/host/Host.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/host/Host.vue'));
  }, 'host');
};

const hostDetail = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/host/Detail.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/host/Detail.vue'));
  }, 'hostDetail');
};

const virtualMachine = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/virtualMachine/VirtualMachine.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/virtualMachine/VirtualMachine.vue'));
  }, 'virtualMachine');
};

const virtualMachineDetail = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/virtualMachine/Detail.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/virtualMachine/Detail.vue'));
  }, 'virtualMachineDetail');
};

const g2Storage = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/g2-storage/index.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/g2-storage/index.vue'));
  }, 'g2Storage');
};

const g2StorageDetail = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/g2-storage/detail.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/g2-storage/detail.vue'));
  }, 'g2StorageDetail');
};

const rabbitMq = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/rabbitMq/RabbitMq.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/rabbitMq/RabbitMq.vue'));
  }, 'rabbitMq');
};

const mySql = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/mySql/MySql.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/mySql/MySql.vue'));
  }, 'mySql');
};

const incloudStorage = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/incloudStorage/IncloudStorage.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/incloudStorage/IncloudStorage.vue'));
  }, 'incloudStorage');
};
const incloudStorageDetail = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/incloudStorage/Detail.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/incloudStorage/Detail.vue'));
  }, 'incloudStorageDetail');
};

const openstackApi = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/openstackApi/OpenstackApi.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/openstackApi/OpenstackApi.vue'));
  }, 'openstackApi');
};

const openstackApiDetail = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/openstackApi/Detail.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/openstackApi/Detail.vue'));
  }, 'openstackApiDetail');
};

const cloudPhysicsMachine = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/cloudPhysicsMachine/index.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/cloudPhysicsMachine/index.vue'));
  }, 'cloudPhysicsMachine');
};

const cloudPhysicsMachineDetail = resolve => {
  require.ensure(['views/intelligentMonitoring/resourceMonitor/cloudPhysicsMachine/Detail.vue'], () => {
    resolve(require('views/intelligentMonitoring/resourceMonitor/cloudPhysicsMachine/Detail.vue'));
  }, 'cloudPhysicsMachineDetail');
};

const customGraph = resolve => {
  require.ensure(['views/intelligentMonitoring/customGraph/CustomGraph.vue'], () => {
    resolve(require('views/intelligentMonitoring/customGraph/CustomGraph.vue'));
  }, 'customGraph');
};

const eventMonitor = resolve => {
  require.ensure(['views/intelligentMonitoring/eventMonitor/EventMonitor.vue'], () => {
    resolve(require('views/intelligentMonitoring/eventMonitor/EventMonitor.vue'));
  }, 'eventMonitor');
};
const eventMonitorSearch = resolve => {
  require.ensure(['views/intelligentMonitoring/eventMonitor/search/Search.vue'], () => {
    resolve(require('views/intelligentMonitoring/eventMonitor/search/Search.vue'));
  }, 'eventMonitorSearch');
};
const eventMonitorSetting = resolve => {
  require.ensure(['views/intelligentMonitoring/eventMonitor/setting/Setting.vue'], () => {
    resolve(require('views/intelligentMonitoring/eventMonitor/setting/Setting.vue'));
  }, 'eventMonitorSetting');
};

const routes = [{
  name: 'intelligentMonitoring',
  path: '/intelligentMonitoring',
  alias: '/',
  component: intelligentMonitoring,
  flg: Vue.AuthList["m.monitor"],
  meta: {
    des: "base.intelligentMonitoring"
  },
  children: [{
    name: 'resourceMonitor',
    path: 'resourceMonitor',
    alias: '/',
    component: resourceMonitor,
    flg: Vue.AuthList["m.monitor.resourcemonitor"],
    meta: {
      des: "monitor.resMonitor"
    },
    redirect: Vue.roleType == '2' ? 'resourceMonitor/virtualMachine' : 'resourceMonitor/host',
    children: [{
        name: 'host',
        path: 'host',
        component: host,
        meta: {
          des: "monitor.HOST_MONITOR"
        },
        children: [{
          name: 'hostDetail',
          path: 'hostDetail/:hostName/:resourceId',
          component: hostDetail,
          meta: {
            des: "monitor.hostDetail"
          }
        }]
      }, {
        name: 'virtualMachine',
        path: 'virtualMachine',
        component: virtualMachine,
        meta: {
          des: "monitor.VIRTUAL_MACHINE_MONITOR"
        },
        children: [{
          name: 'virtualMachineDetail',
          path: 'virtualMachineDetail/:hostName/:vmId/:resourceId',
          component: virtualMachineDetail,
          meta: {
            des: "network.cloudvmdetail"
          }
        }]
      }, {
        name: 'g2Storage',
        path: 'g2Storage',
        component: g2Storage,
        meta: {
          des: "monitor.G2_STORAGE"
        },
        children: [{
          name: 'g2StorageDetail',
          path: 'g2StorageDetail',
          component: g2StorageDetail,
          meta: {
            des: "monitor.G2_STORAGE_DETAIL"
          }
        }]
      },
      {
        name: 'cloudPhysicsMachine',
        path: 'cloudPhysicsMachine',
        component: cloudPhysicsMachine,
        meta: {
          des: "monitor.CLOUD_PHYSICS_MACHINE"
        },
        children: [{
          name: 'cloudPhysicsMachineDetail',
          path: 'cloudPhysicsMachineDetail/:hostName/:resourceId',
          component: cloudPhysicsMachineDetail,
          meta: {
            des: "monitor.CLOUD_PHYSICS_MACHINE_DETAIL"
          }
        }]
      }, {
        name: 'rabbitMq',
        path: 'rabbitMq',
        component: rabbitMq,
        meta: {
          des: "monitor.RABBIT_MQ_CLUSTER"
        }
      }, {
        name: 'incloudStorage',
        path: 'incloudStorage',
        component: incloudStorage,
        meta: {
          des: "monitor.INCLOUD_STORAGE"
        },
        children: [{
          name: 'incloudStorageDetail',
          path: 'incloudStorageDetail/:name/:id',
          component: incloudStorageDetail,
          meta: {
            des: "monitor.sdsStorageDetail"
          }
        }]
      }, {
        name: 'mySql',
        path: 'mySql',
        component: mySql,
        meta: {
          des: "monitor.MY_SQL"
        }
      }, {
        name: 'openstackApi',
        path: 'openstackApi',
        component: openstackApi,
        meta: {
          des: "monitor.OPENSTACK_API_STATUS"
        },
        children: [{
          name: 'openstackApiDetail',
          path: 'openstackApiDetail/:name',
          component: openstackApiDetail,
          meta: {
            des: "monitor.OPENSTACK_API_STATUS_DETAIL"
          }
        }]
      }
    ]
  }, {
    name: 'customGraph',
    path: 'customGraph',
    alias: '/',
    component: customGraph,
    flg: Vue.AuthList['m.monitor.CustomGraph'],
    meta: {
      des: 'monitor.CUSTOM_GRAPH'
    }
  }, {
    name: 'monitoringSetting',
    path: 'monitoringSetting',
    alias: '/',
    component: monitoringSetting,
    flg: Vue.AuthList["m.monitor.monitorset"],
    meta: {
      des: "base.monitoringSetting"
    },
    children: [
      {
        name: 'setting-detail',
        path: 'setting-detail',
        component: SettingDetail,
        meta: {
          des: "base.DETAIL_PAGE"
        }
      },
      {
        name: 'add-detail',
        path: 'add-detail',
        component: AddDetail,
        meta: {
          des: "base.DETAIL_PAGE"
        }
      }
    ]
  }, {
    name: 'warnManagement',
    path: 'warnManagement/:level',
    alias: '/',
    component: warnManagement,
    flg: Vue.AuthList["m.monitor.AlertMange"],
    meta: {
      des: "base.warnManagement"
    },
    // redirect: './warnManagement/LOST/resource-view',
    children: [{
      name: 'management-detail',
      path: 'management-detail',
      component: managementDetail,
      meta: {
        des: "base.DETAIL_PAGE"
      }
    }]
  }, {
    name: 'eventMonitor',
    path: 'eventMonitor',
    alias: '/',
    component: eventMonitor,
    flg: Vue.AuthList["m.monitor.EventMonitor"],
    meta: {
      des: 'monitor.EVENT_MONITOR'
    },
    redirect: 'eventMonitor/search',
    children: [{
      name: 'search',
      path: 'search',
      component: eventMonitorSearch,
      meta: {
        des: "monitor.EVENT_SEARCH"
      }
    }, {
      name: 'setting',
      path: 'setting/:name',
      component: eventMonitorSetting,
      meta: {
        des: "monitor.NOTIFICATION_SETTING"
      }
    }]
  }]
}];

export default routes;
