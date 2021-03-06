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

// 2. ????????????
// ??????????????????????????????????????? ??????"component" ?????????
// ?????? Vue.extend() ???????????????????????????
// ??????????????????????????????????????????
// ????????????????????????????????????
const routes = [
  // ?????????????????? ???????????????
  {
    name: 'description',
    path: 'description',
    alias: '/',
    component: description,
    meta: {
      title: "??????",
      des: "??????"
    }
  }, {
    name: 'instances',
    path: 'instances',
    component: instindex,
    meta: {
      title: "?????????",
      des: "?????????"
    },
    children: [{
      name: 'list',
      path: 'list',
      alias: '/',
      component: instances,
      meta: {
        title: "????????????",
        des: "????????????"
      }
    }, {
      name: 'add-instance',
      path: 'add-instance',
      alias: '/',
      component: addinstance,
      meta: {
        title: "????????????",
        des: "????????????"
      }
    }, {
      name: 'instance-detail',
      path: 'instance-detail',
      alias: '/',
      component: instanceDetail,
      meta: {
        title: '??????',
        des: '??????'
      },
      children: [{
        name: 'vm-detail',
        path: 'vm-detail',
        alias: '/',
        component: vmDetail,
        meta: {
          title: '??????',
          des: '??????'
        }
      }, {
        name: 'vm-console',
        path: 'vm-console',
        alias: '/',
        component: vmConsole,
        meta: {
          title: '?????????',
          des: '?????????'
        }
      }]
    }]
  }, {
    name: 'volume',
    path: 'volume',
    alias: '/',
    component: volume,
    meta: {
      title: "???",
      des: "???"
    },
    children: [{
      name: 'volumelist',
      path: 'volumelist',
      alias: '/',
      component: volumelist,
      meta: {
        title: "???",
        des: "???"
      }
    }, {
      name: 'volumesolt',
      path: 'volumesolt',
      alias: '/',
      component: volumesolt,
      meta: {
        title: "?????????",
        des: "?????????"
      }
    }, {
      name: 'volumebak',
      path: 'volumebak',
      alias: '/',
      component: volumebak,
      meta: {
        title: "?????????",
        des: "?????????"
      }
    }]
  }, {
    name: 'image',
    path: 'image',
    alias: '/',
    component: image,
    meta: {
      title: '??????',
      des: '??????'
    }
  }
]
export default routes;
