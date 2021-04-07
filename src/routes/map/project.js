const project = resolve => {
  require.ensure(['views/project/Project.vue'], () => {
    resolve(require('views/project/Project.vue'));
  }, 'project');
};

const instindex = resolve => {
  require.ensure(['views/project/index.vue'], () => {
    resolve(require('views/project/index.vue'));
  }, 'instindex');
};

const instances = resolve => {
  require.ensure(['views/project/Instances.vue'], () => {
    resolve(require('views/project/Instances.vue'));
  }, 'instances');
};

const instanceDetail = resolve => {
  require.ensure(['views/project/instance/InstanceDetail.vue'], () => {
    resolve(require('views/project/instance/InstanceDetail.vue'));
  }, 'instanceDetail');
};

const vmDetail = resolve => {
  require.ensure(['views/project/instance/VmDetail.vue'], () => {
    resolve(require('views/project/instance/VmDetail.vue'));
  }, 'vmDetail');
};

const vmConsole = resolve => {
  require.ensure(['views/project/instance/VmConsole.vue'], () => {
    resolve(require('views/project/instance/VmConsole.vue'));
  }, 'vmConsole');
};

const addinstance = resolve => {
  require.ensure(['views/project/instance/AddInstance.vue'], () => {
    resolve(require('views/project/instance/AddInstance.vue'));
  }, 'addinstance');
};

const description = resolve => {
  require.ensure(['views/project/Description.vue'], () => {
    resolve(require('views/project/Description.vue'));
  }, 'description');
};

const volume = resolve => {
  require.ensure(['views/project/Volume/Volume.vue'], () => {
    resolve(require('views/project/Volume/Volume.vue'));
  }, 'volume');
};

const volumelist = resolve => {
  require.ensure(['views/project/Volume/VolumeList.vue'], () => {
    resolve(require('views/project/Volume/VolumeList.vue'));
  }, 'volumelist');
};

const volumesolt = resolve => {
  require.ensure(['views/project/Volume/VolumeSolt.vue'], () => {
    resolve(require('views/project/Volume/VolumeSolt.vue'));
  }, 'volumesolt');
};

const volumebak = resolve => {
  require.ensure(['views/project/Volume/VolumeBak.vue'], () => {
    resolve(require('views/project/Volume/VolumeBak.vue'));
  }, 'volumebak');
};

const image = resolve => {
  require.ensure(['views/project/Image/Image.vue'], () => {
    resolve(require('views/project/Image/Image.vue'));
  }, "image");
}

// 2. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
// 我们晚点再讨论嵌套路由。
const routes = [
  // 动态路径参数 以冒号开头
  {
    name: 'description',
    path: 'description',
    alias: '/',
    component: description,
    meta: {
      title: "概述",
      des: "概述"
    }
  }, {
    name: 'instances',
    path: 'instances',
    component: instindex,
    meta: {
      title: "云主机",
      des: "云主机"
    },
    children: [{
      name: 'list',
      path: 'list',
      alias: '/',
      component: instances,
      meta: {
        title: "主机列表",
        des: "主机列表"
      }
    }, {
      name: 'add-instance',
      path: 'add-instance',
      alias: '/',
      component: addinstance,
      meta: {
        title: "创建实例",
        des: "创建实例"
      }
    }, {
      name: 'instance-detail',
      path: 'instance-detail',
      alias: '/',
      component: instanceDetail,
      meta: {
        title: '详情',
        des: '详情'
      },
      children: [{
        name: 'vm-detail',
        path: 'vm-detail',
        alias: '/',
        component: vmDetail,
        meta: {
          title: '概述',
          des: '概述'
        }
      }, {
        name: 'vm-console',
        path: 'vm-console',
        alias: '/',
        component: vmConsole,
        meta: {
          title: '控制台',
          des: '控制台'
        }
      }]
    }]
  }, {
    name: 'volume',
    path: 'volume',
    alias: '/',
    component: volume,
    meta: {
      title: "卷",
      des: "卷"
    },
    children: [{
      name: 'volumelist',
      path: 'volumelist',
      alias: '/',
      component: volumelist,
      meta: {
        title: "卷",
        des: "卷"
      }
    }, {
      name: 'volumesolt',
      path: 'volumesolt',
      alias: '/',
      component: volumesolt,
      meta: {
        title: "卷快照",
        des: "卷快照"
      }
    }, {
      name: 'volumebak',
      path: 'volumebak',
      alias: '/',
      component: volumebak,
      meta: {
        title: "卷备份",
        des: "卷备份"
      }
    }]
  }, {
    name: 'image',
    path: 'image',
    alias: '/',
    component: image,
    meta: {
      title: '镜像',
      des: '镜像'
    }
  }
]
export default routes;
