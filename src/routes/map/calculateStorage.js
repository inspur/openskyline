//身份管理菜单
const calculateStorage = resolve => {
  require.ensure(['views/calculate-storage/CalculateStorage.vue'], () => {
    resolve(require('views/calculate-storage/CalculateStorage.vue'));
  }, 'calculateStorage');
};

const azDomainList = resolve => {
  require.ensure(['views/calculate-storage/Index.vue'], () => {
    resolve(require('views/calculate-storage/Index.vue'));
  }, 'azDomainList');
};

const azManagement = resolve => {
  require.ensure(['views/calculate-storage/AvailabilityZones.vue'], () => {
    resolve(require('views/calculate-storage/AvailabilityZones.vue'));
  }, 'azManagement');
};

const domainManagement = resolve => {
  require.ensure(['views/calculate-storage/DomainManagement.vue'], () => {
    resolve(require('views/calculate-storage/DomainManagement.vue'));
  }, 'domainManagement');
};
const volume = resolve => {
  require.ensure(['views/calculate-storage/volume/Volume.vue'], () => {
    resolve(require('views/calculate-storage/volume/Volume.vue'));
  }, 'volume');
};
const volumelist = resolve => {
  require.ensure(['views/calculate-storage/volume/VolumeList.vue'], () => {
    resolve(require('views/calculate-storage/volume/VolumeList.vue'));
  }, 'volumelist');
};

const instancesList = resolve => {
  require.ensure(['views/calculate-storage/instance/Instances.vue'], () => {
    resolve(require('views/calculate-storage/instance/Instances.vue'));
  }, 'instancesList');
};

const hostIndex = resolve => {
  require.ensure(['views/calculate-storage/host-manage/index.vue'], () => {
    resolve(require('views/calculate-storage/host-manage/index.vue'));
  }, 'hostIndex');
};

const hostManagement = resolve => {
  require.ensure(['views/calculate-storage/host-manage/host-aggregation/index.vue'], () => {
    resolve(require('views/calculate-storage/host-manage/host-aggregation/index.vue'));
  }, 'hostManagement');
};

const calculateHost = resolve => {
  require.ensure(['views/calculate-storage/host-manage/host-list/index.vue'], () => {
    resolve(require('views/calculate-storage/host-manage/host-list/index.vue'));
  }, 'calculateHost');
};

const haHostTab = resolve => {
  require.ensure(['views/calculate-storage/host-manage/host-ha/index.vue'], () => {
    resolve(require('views/calculate-storage/host-manage/host-ha/index.vue'));
  }, 'haHostTab');
};

const haSegements = resolve => {
  require.ensure(['views/calculate-storage/host-manage/host-ha/ha-segments/index.vue'], () => {
    resolve(require('views/calculate-storage/host-manage/host-ha/ha-segments/index.vue'));
  }, 'haSegements');
};

const haLog = resolve => {
  require.ensure(['views/calculate-storage/host-manage/host-ha/ha-logs/index.vue'], () => {
    resolve(require('views/calculate-storage/host-manage/host-ha/ha-logs/index.vue'));
  }, 'haLog');
};

const baremachineIndex = resolve => {
  require.ensure(['views/calculate-storage/baremachine/Tabs.vue'], () => {
    resolve(require('views/calculate-storage/baremachine/Tabs.vue'));
  }, 'baremachineIndex');
};

const baremachineSpec = resolve => {
  require.ensure(['views/calculate-storage/baremachine/SpecList.vue'], () => {
    resolve(require('views/calculate-storage/baremachine/SpecList.vue'));
  }, 'baremachineSpec');
};

const baremachineImage = resolve => {
  require.ensure(['views/calculate-storage/baremachine/image/index.vue'], () => {
    resolve(require('views/calculate-storage/baremachine/image/index.vue'));
  }, 'baremachineImage');
};
const externalPhysicalServer = resolve => {
  require.ensure(['views/calculate-storage/baremachine/ExternalPhysicalServer.vue'], () => {
    resolve(require('views/calculate-storage/baremachine/ExternalPhysicalServer.vue'));
  }, 'externalPhysicalServer');
};
const baremachineList = resolve => {
  require.ensure(['views/calculate-storage/baremachine/BaremachineList.vue'], () => {
    resolve(require('views/calculate-storage/baremachine/BaremachineList.vue'));
  }, 'baremachineList');
};

const resSpecManage = resolve => {
  require.ensure(['views/calculate-storage/resource-spec/Index.vue'], () => {
    resolve(require('views/calculate-storage/resource-spec/Index.vue'));
  }, 'resSpecManage');
};

const highConfig = resolve => {
  require.ensure(['views/calculate-storage/high-config/index.vue'], () => {
    resolve(require('views/calculate-storage/high-config/index.vue'));
  }, 'highConfig');
};

const keyPair = resolve => {
  require.ensure(['views/calculate-storage/high-config/key-pair/Index.vue'], () => {
    resolve(require('views/calculate-storage/high-config/key-pair/Index.vue'));
  }, 'keyPair');
};

const serverGroup = resolve => {
  require.ensure(['views/calculate-storage/high-config/server-group/Index.vue'], () => {
    resolve(require('views/calculate-storage/high-config/server-group/Index.vue'));
  }, 'serverGroup');
};

const gpu = resolve => {
  require.ensure(['views/calculate-storage/high-config/gpu/index.vue'], () => {
    resolve(require('views/calculate-storage/high-config/gpu/index.vue'));
  }, 'gpu');
};

const netUsb = resolve => {
  require.ensure(['views/calculate-storage/high-config/net-usb/index.vue'], () => {
    resolve(require('views/calculate-storage/high-config/net-usb/index.vue'));
  }, 'netUsb');
};

const physicalTabs = resolve => {
  require.ensure(['views/calculate-storage/physical-host/Tabs.vue'], () => {
    resolve(require('views/calculate-storage/physical-host/Tabs.vue'));
  }, 'physicalTabs');
};

const physicalHost = resolve => {
  require.ensure(['views/calculate-storage/physical-host/PhysicalHostList.vue'], () => {
    resolve(require('views/calculate-storage/physical-host/PhysicalHostList.vue'));
  }, 'physicalHost');
};

const physicalDetail = resolve => {
  require.ensure(['views/calculate-storage/physical-host/PhysicalTabs.vue'], () => {
    resolve(require('views/calculate-storage/physical-host/PhysicalTabs.vue'));
  }, 'physicalDetail');
};

const volumebak = resolve => {
  require.ensure(['views/calculate-storage/snapshot/volumeBak/VolumeBak.vue'], () => {
    resolve(require('views/calculate-storage/snapshot/volumeBak/VolumeBak.vue'));
  }, 'volumebak');
};
const volumetype = resolve => {
  require.ensure(['views/calculate-storage/volume/VolumeType.vue'], () => {
    resolve(require('views/calculate-storage/volume/VolumeType.vue'));
  }, 'volumetype');
};
const docStor = resolve => {
  require.ensure(['views/calculate-storage/document-storage/DocumentStorageTab.vue'], () => {
    resolve(require('views/calculate-storage/document-storage/DocumentStorageTab.vue'));
  }, 'docStor');
};
const CIFS = resolve => {
  require.ensure(['views/calculate-storage/document-storage/CIFS/CIFS.vue'], () => {
    resolve(require('views/calculate-storage/document-storage/CIFS/CIFS.vue'));
  }, 'CIFS');
};
const shareStorage = resolve => {
  require.ensure(['views/calculate-storage/document-storage/DocStor.vue'], () => {
    resolve(require('views/calculate-storage/document-storage/DocStor.vue'));
  }, 'shareStorage');
};
const dsNet = resolve => {
  require.ensure(['views/calculate-storage/document-storage/Net.vue'], () => {
    resolve(require('views/calculate-storage/document-storage/Net.vue'));
  }, 'dsNet');
};
const dsSafeStrategy = resolve => {
  require.ensure(['views/calculate-storage/document-storage/SafeStrategy.vue'], () => {
    resolve(require('views/calculate-storage/document-storage/SafeStrategy.vue'));
  }, 'dsSafeStrategy');
};
const shareType = resolve => {
  require.ensure(['views/calculate-storage/document-storage/ShareType.vue'], () => {
    resolve(require('views/calculate-storage/document-storage/ShareType.vue'));
  }, 'shareType');
};
const dsvolumetype = resolve => {
  require.ensure(['views/calculate-storage/volume/VolumeType.vue'], () => {
    resolve(require('views/calculate-storage/volume/VolumeType.vue'));
  }, 'dsvolumetype');
};
const objStor = resolve => {
  require.ensure(['views/calculate-storage/object-storage/ObjStor.vue'], () => {
    resolve(require('views/calculate-storage/object-storage/ObjStor.vue'));
  }, 'objStor');
};
const catalog = resolve => {
  require.ensure(['views/calculate-storage/object-storage/Catalog.vue'], () => {
    resolve(require('views/calculate-storage/object-storage/Catalog.vue'));
  }, 'catalog');
};
const objStorS3 = resolve => {
  require.ensure(['views/calculate-storage/object-storage-s3/ObjStor.vue'], () => {
    resolve(require('views/calculate-storage/object-storage-s3/ObjStor.vue'));
  }, 'objStorS3');
};
const bucketList = resolve => {
  require.ensure(['views/calculate-storage/object-storage-s3/bucket/BucketList.vue'], () => {
    resolve(require('views/calculate-storage/object-storage-s3/bucket/BucketList.vue'));
  }, 'bucketList');
};
const objectCatalog = resolve => {
  require.ensure(['views/calculate-storage/object-storage-s3/object/ObjectCatalog.vue'], () => {
    resolve(require('views/calculate-storage/object-storage-s3/object/ObjectCatalog.vue'));
  }, 'objectCatalog');
};
const bucketSetting = resolve => {
  require.ensure(['views/calculate-storage/object-storage-s3/setting/BucketSetting.vue'], () => {
    resolve(require('views/calculate-storage/object-storage-s3/setting/BucketSetting.vue'));
  }, 'bucketSetting');
};
const bucket = resolve => {
  require.ensure(['views/calculate-storage/object-storage-s3/object/Bucket.vue'], () => {
    resolve(require('views/calculate-storage/object-storage-s3/object/Bucket.vue'));
  }, 'bucket');
};
const imageList = resolve => {
  require.ensure(['views/calculate-storage/image/ImageList.vue'], () => {
    resolve(require('views/calculate-storage/image/ImageList.vue'));
  }, 'imageList');
};
const snapshot = resolve => {
  require.ensure(['views/calculate-storage/snapshot/Snapshot.vue'], () => {
    resolve(require('views/calculate-storage/snapshot/Snapshot.vue'));
  }, 'snapshot');
};
const instancesolt = resolve => {
  require.ensure(['views/calculate-storage/snapshot/InstanceSolt.vue'], () => {
    resolve(require('views/calculate-storage/snapshot/InstanceSolt.vue'));
  }, 'instancesolt');
};
const volumesolt = resolve => {
  require.ensure(['views/calculate-storage/snapshot/VolumeSolt.vue'], () => {
    resolve(require('views/calculate-storage/snapshot/VolumeSolt.vue'));
  }, 'volumesolt');
};
const dsSnapShot = resolve => {
  require.ensure(['views/calculate-storage/snapshot/DosStorSnapShot.vue'], () => {
    resolve(require('views/calculate-storage/snapshot/DosStorSnapShot.vue'));
  }, 'dsSnapShot');
};
const instanceBackup = resolve => {
  require.ensure(['views/calculate-storage/backup/InstanceBackup.vue'], () => {
    resolve(require('views/calculate-storage/backup/InstanceBackup.vue'));
  }, 'instanceBackup');
};
const resTopo = resolve => {
  require.ensure(['views/calculate-storage/instance/LogicalTopo.vue'], () => {
    resolve(require('views/calculate-storage/instance/LogicalTopo.vue'))
  }, 'resTopo')
};
const resDomainTopo = resolve => {
  require.ensure(['views/topo/ResDomainTopo.vue'], () => {
    resolve(require('views/topo/ResDomainTopo.vue'))
  }, 'resDomainTopo')
};
const ResRegionTopo = resolve => {
  require.ensure(['views/topo/ResRegionTopo.vue'], () => {
    resolve(require('views/topo/ResRegionTopo.vue'))
  }, 'ResRegionTopo')
};
const recycleBin = resolve => {
  require.ensure(['views/calculate-storage/recycle-bin/RecycleBin.vue'], () => {
    resolve(require('views/calculate-storage/recycle-bin/RecycleBin.vue'))
  }, 'RecycleBin')
};
const hostRecycleBin = resolve => {
  require.ensure(['views/calculate-storage/recycle-bin/instance/index.vue'], () => {
    resolve(require('views/calculate-storage/recycle-bin/instance/index.vue'))
  }, 'hostRecycleBin')
};
const volumeRecycleBin = resolve => {
  require.ensure(['views/calculate-storage/recycle-bin/volume/index.vue'], () => {
    resolve(require('views/calculate-storage/recycle-bin/volume/index.vue'))
  }, 'volumeRecycleBin')
};
// 2. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
// 我们晚点再讨论嵌套路由。
const routes = [
  // 动态路径参数 以冒号开头
  {
    name: 'calculate-storage',
    path: '/calculate-storage',
    component: calculateStorage,
    meta: {
      //title: Vue.t("calcStorLang.calculateStorage"),
      des: Vue.t("calcStorLang.calculateStorage")
    },
    children: [{
      flg: Vue.AuthList["m.calculate.instance"],
      name: 'instances-list', //domains
      path: 'instances-list', //domains
      alias: '/',
      component: instancesList, //azDomainList
      meta: {
        des: Vue.t("calcStorLang.instance")
      }
      /*children:[{
        name: 'az-management',
        path: 'az-management',
        alias: '/',
        component: azManagement,
        meta: {
          des: "可用域(AZ)"
        }
      }, {
        name: 'domain-management',
        path: 'domain-management',
        alias: '/',
        component: domainManagement,
        meta: {
          des: "资源域"
        }
      }]*/
    }, {
      flg: Vue.AuthList["m.calculate.recycleBin"],
      name: 'recycle-bin', //domains
      path: 'recycle-bin', //domains
      alias: '/',
      component: recycleBin, //azDomainList
      meta: {
        des: Vue.t("calcStorLang.RECYCLE_BIN")
      },
      children:[{
        name: 'hostRecycleBin',
        path: 'hostRecycleBin',
        alias: '/',
        component: hostRecycleBin,
        meta: {
         // des: "云主机回收站"
        }
      }, {
        name: 'volumeRecycleBin',
        path: 'volumeRecycleBin',
        alias: '/',
        component: volumeRecycleBin,
        meta: {
         // des: "云硬盘回收站"
        }
      }]
    }, {
      flg: Vue.AuthList["m.calculate.disk"],
      name: 'volume',
      path: 'volume',
      alias: '/',
      component: volume,
      meta: {
        des: Vue.t("calcStorLang.blockStorage")
      },
      children: [{
        name: 'volumelist',
        path: 'volumelist',
        alias: '/',
        component: volumelist,
        meta: {
          // title: Vue.t("calcStorLang.volumeList"),
          des: Vue.t("base.cloudDisk")
        }
      }, {
        name: 'volumetype',
        path: 'volumetype',
        alias: '/',
        component: volumetype,
        meta: {
          // title: Vue.t("calcStorLang.volumetype"),
          des: Vue.t("calcStorLang.volumetype")
        }
      }]
    }, {
      flg: Vue.AuthList["m.calculate.fileStorage"],
      name: 'document-storage',
      path: 'document-storage',
      alias: '/',
      component: docStor,
      meta: {
        des: Vue.t("calcStorLang.fileStorage")
      },
      children: [{
        name: 'shareStorage',
        path: 'shareStorage',
        alias: '/',
        component: shareStorage,
        meta: {
          // title: Vue.t("calcStorLang.fileStorage"),
          des: Vue.t("calcStorLang.fileStorage")
        }
      }, {
        name: 'CIFS',
        path: 'CIFS',
        alias: '/',
        component: CIFS,
        meta: {
          des: Vue.t("storage.CIFS")
        }
      }, {
        name: 'dsNet',
        path: 'dsNet',
        alias: '/',
        component: dsNet,
        meta: {
          // title: Vue.t("calcStorLang.net"),
          des: Vue.t("calcStorLang.net")
        }
      }, {
        name: 'shareType',
        path: 'shareType',
        alias: '/',
        component: shareType,
        meta: {
          // title: Vue.t("calcStorLang.fileStorageType"),
          des: Vue.t("calcStorLang.fileStorageType")
        }
      }, {
        name: 'dsSnapShot',
        path: 'dsSnapShot',
        alias: '/',
        component: dsSnapShot,
        meta: {
          // title: Vue.t("calcStorLang.snapshot"),
          des: Vue.t("calcStorLang.snapshot")
        }
      }, {
        name: 'dsSafeStrategy',
        path: 'dsSafeStrategy',
        alias: '/',
        component: dsSafeStrategy,
        meta: {
          // title: Vue.t("calcStorLang.safeStrategy"),
          des: Vue.t("calcStorLang.safeStrategy")
        }
      }]
    }, {
      flg: Vue.AuthList["m.calculate.objectStorage"],
      name: 'object-storage',
      path: 'object-storage',
      alias: '/',
      component: objStor,
      meta: {
        des: Vue.t("calcStorLang.objectStorage"),
        desContent: Vue.t("storage.objectStorageTip")
      },
      children: [{
        name: 'catalog',
        path: 'catalog',
        component: catalog,
        meta: {
          // title: Vue.t("calcStorLang.objList"),
          des: Vue.t("calcStorLang.objList")
        }
      }]
     }, {
      flg: Vue.AuthList["m.calculate.objectStorage"],
      name: 'object-storage-s3',
      path: 'object-storage-s3',
      alias: '/',
      component: objStorS3,
      meta: {
        des: Vue.t("calcStorLang.objectStorage")
      },
      children: [{
        name: 'bucketList',
        path: 'bucketList',
        alias: '/',
        component: bucketList,
        meta: {
          des: Vue.t("lang.bucketList"),
          desContent: Vue.t("storage.objectStorageTip")
        }
      }, {
        name: 'bucket',
        path: 'bucket/:bucketName',
        alias: '/',
        component: bucket,
        meta: {
          des: Vue.t("storage.desContainer")
        },
        children: [{
          name: 'objectCatalog',
          path: 'objectCatalog',
          alias: '/',
          component: objectCatalog,
          meta: {
            des: Vue.t("calcStorLang.objList")
          }
        }, {
          name: 'bucketSetting',
          path: 'bucketSetting',
          alias: '/',
          component: bucketSetting,
          meta: {
            des: Vue.t("lang.setting")
          }
        }]
      }]
    }, {
      flg: Vue.AuthList["m.calculate.physical"],
      name: 'physical-host',
      path: 'physical-host',
      alias: '/',
      component: physicalTabs,
      meta: {
        // title: Vue.t("calcStorLang.physicalHost"),
        des: Vue.t("calcStorLang.physicalHost")
      },
      children: [{
        name: 'list',
        path: 'list',
        alias: '/',
        component: physicalHost
      }, {
        name: 'detail',
        path: 'detail',
        alias: '/',
        component: physicalDetail,
        meta: {
          // title: Vue.t("calcStorLang.detail"),
          des: Vue.t("calcStorLang.detail")
        }
      }]
    }, {
      flg: Vue.AuthList["m.calculate.host"],
      name: 'host-management',
      path: 'host-management',
      alias: '/',
      component: hostIndex,
      meta: {
        des: Vue.t("calcStorLang.hostManage")
      },
      children: [{
        name: 'calculate-host',
        path: 'calculate-host',
        alias: '/',
        component: calculateHost,
        meta: {
          des: Vue.t("calcStorLang.hostList")
        }
      }, {
        name: 'index',
        path: 'index',
        alias: '/',
        component: hostManagement,
        meta: {
          des: Vue.t("calcStorLang.hostAggregation")
        }
      }, {
        name: 'host-ha',
        path: 'host-ha',
        alias: '/',
        component: haHostTab,
        meta: {
          des: Vue.t("calcStorLang.hostha")
        },
        children: [{
          name: 'ha-segments',
          path: 'ha-segments',
          alias: '/',
          component: haSegements,
          meta: {
            des: Vue.t("calcStorLang.hosthadomain")
          }
        }, {
          name: 'ha-log',
          path: 'ha-log',
          alias: '/',
          component: haLog,
          meta: {
            des: Vue.t("calcStorLang.hosthaNote")
          }
        }]
      }, {
        name: 'az-management',
        path: 'az-management',
        alias: '/',
        component: azManagement,
        meta: {
          des: Vue.t("calcStorLang.az") + "(AZ)"
        }
      }]
    }, {
      flg: Vue.AuthList["m.calculate.baremetal"],
      name: 'baremachine-management',
      path: 'baremachine-management',
      alias: '/',
      component: physicalTabs,
      meta: {
        des: Vue.t("calcStorLang.baremetal")
      },
      children: [{
        name: 'baremachineList',
        path: 'baremachineList',
        alias: '/',
        component: baremachineIndex,
        meta: {
          des: Vue.t("calcStorLang.bareMachine")
        },
        children: [{
          name: 'list',
          path: 'list',
          alias: '/',
          component: baremachineList
        }, {
          name: 'baremachineSpec',
          path: 'baremachineSpec',
          alias: '/',
          component: baremachineSpec,
          meta: {
            des: Vue.t("calcStorLang.bareSpec")
          }
        }, {
          name: 'baremachineImage',
          path: 'baremachineImage',
          alias: '/',
          component: baremachineImage,
          meta: {
            des: Vue.t("calcStorLang.bareImage")
          }
        }, {
          name: 'externalPhysicalServer',
          path: 'externalPhysicalServer',
          alias: '/',
          component: externalPhysicalServer,
          meta: {
            des: Vue.t("baremachine.EXTERNAL_PHYSICAL_SERVER")
          }
        }]
      }, {
        name: 'detail',
        path: 'detail',
        alias: '/',
        component: physicalDetail,
        meta: {
          // title: Vue.t("calcStorLang.detail"),
          des: Vue.t("calcStorLang.detail")
        }
      }]
    }, {
      flg: Vue.AuthList["m.calculate.resourcespec"],
      name: 'res-spec',
      path: 'res-spec',
      alias: '/',
      component: resSpecManage,
      meta: {
        des: Vue.t("calcStorLang.resourcespec")
      }
    }, {
      flg: Vue.AuthList["m.calculate.logictopo"],
      name: 'resTopo',
      path: 'resTopo',
      alias: '/',
      component: resTopo,
      meta: {
        des: Vue.t("calcStorLang.logictopo")
      }/*,
      children: [{
        name: 'resDomainTopo',
        path: 'resDomainTopo',
        alias: '/',
        component: resDomainTopo,
        meta: {
          title: "资源域视图",
          des: "资源域视图"
        }
      }, {
        name: 'ResRegionTopo',
        path: 'ResRegionTopo',
        alias: '/',
        component: ResRegionTopo,
        meta: {
          title: "可用域视图",
          des: "可用域视图"
        }
      }]*/
    }, {
      flg: Vue.AuthList["m.calculate.keypair"],
      name: 'high-config',
      path: 'high-config',
      alias: '/',
      component: highConfig,
      meta: {
        des: Vue.t("calcStorLang.highConfig")
      },
      children: [{
        flg: Vue.AuthList["m.calculate.keypair"],
        name: 'key-pair',
        path: 'key-pair',
        alias: '/',
        component: keyPair,
        meta: {
          des: Vue.t("calcStorLang.keypair")
        }
      }, {
        flg: Vue.AuthList["m.calculate.keypair"],
        name: 'server-group',
        path: 'server-group',
        alias: '/',
        component: serverGroup,
        meta: {
          des: Vue.t("calcStorLang.serverGroup")
        }
      }, {
        flg: Vue.AuthList["m.calculate.keypair"],
        name: 'gpu',
        path: 'gpu',
        alias: '/',
        component: gpu,
        meta: {
          des: Vue.t("calcStorLang.GPU")
        }
      }, {
        flg: Vue.AuthList["m.calculate.keypair"],
        name: 'net-usb',
        path: 'net-usb',
        alias: '/',
        component: netUsb,
        meta: {
          des: Vue.t("calcStorLang.NET_USB")
        }
      }]
    }, {
      flg: Vue.AuthList["m.calculate.media"],
      name: 'image-list',
      path: 'image-list',
      alias: '/',
      component: imageList,
      meta: {
        des: Vue.t("calcStorLang.image")
      }
    }, {
      flg: Vue.AuthList["m.calculate.snapshot"],
      name: 'snapshot',
      path: 'snapshot',
      alias: '/',
      component: snapshot,
      meta: {
        des: Vue.t("calcStorLang.snapshot")
      },
      children: [{
        flg: Vue.AuthList["m.calculate.snapshot"],
        name: 'instancesolt',
        path: 'instancesolt',
        alias: '/',
        component: instancesolt,
        meta: {
          // title: Vue.t("calcStorLang.instanceshot"),
          des: Vue.t("calcStorLang.instanceshot")
        }
      }, {
        flg: Vue.AuthList["m.calculate.snapshot"],
        name: 'volumesolt',
        path: 'volumesolt',
        alias: '/',
        component: volumesolt,
        meta: {
          // title: Vue.t("calcStorLang.volumeSnapshot"),
          des: Vue.t("calcStorLang.volumeSnapshot")
        }
      }, {
          flg: Vue.AuthList["m.calculate.snapshot"],
          name: 'volumebak',
          path: 'volumebak',
          alias: '/',
          component: volumebak,
          meta: {
            // title: Vue.t("calcStorLang.volumebak"),
            des: Vue.t("calcStorLang.volumebak")
          }
      }, {
        flg: Vue.AuthList["m.calculate.snapshot"],
        name: 'dsSnapShot',
        path: 'dsSnapShot',
        alias: '/',
        component: dsSnapShot,
        meta: {
          // title: Vue.t("calcStorLang.fileStorage") + Vue.t("calcStorLang.snapshot"),
          des: Vue.t("storage.shareStorageSnapshot")
        }
      }, {
        flg: Vue.AuthList["m.calculate.snapshot"],
        name: 'instanceBackup',
        path: 'instanceBackup',
        alias: '/',
        component: instanceBackup,
        meta: {
          // title: Vue.t("calcStorLang.fileStorage") + Vue.t("calcStorLang.snapshot"),
          des: Vue.t("calcStorLang.instanceBackup")
        }
      }]
    }]
  }
];

export default routes;
