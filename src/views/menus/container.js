//容器服务菜单
module.exports = function() {
  return {
    flg: Vue.archIs('x86') && Vue.AuthList["m.docker_server"],
    key: "container",
    path: "/container/",
    iconType: "el-icon-fa-cubes",
    name: Vue.t('container.containerService'),
    subMenus: [{
      flg: Vue.AuthList["m.docker_server.clusters"],
      key: "kbcontainerCluster",
      path: "kbcontainerCluster",
      iconType: "el-icon-fa-cubes",
      name: Vue.t('container.kubernetesCluster')
    }, {
      flg: Vue.AuthList["m.docker_server.kbclusters"],
      key: "applicationContainer",
      path: "applicationContainer",
      iconType: "el-icon-fa-desktop",
      name: Vue.t('container.appManage')
    }, {
      flg: false, //Vue.AuthList["m.docker_server.clusters"],
      key: "containerCluster",
      path: "containerCluster",
      iconType: "el-icon-fa-cubes",
      name: Vue.t('container.containerCluster')
    }, {
      flg: false, //Vue.AuthList["m.docker_server.instances"],
      key: "containerInstance",
      path: "containerInstance",
      iconType: "el-icon-fa-desktop",
      name: Vue.t('container.containerInstance')
    }, {
      flg: Vue.AuthList["m.docker_server.volume"],
      key: "containerStorage",
      path: "containerStorage",
      iconType: "el-icon-fa-database",
      name: Vue.t('container.containerVolume')
    }, {
      flg: Vue.AuthList["m.docker_server.images"],
      key: "containerImages",
      path: "containerImages",
      iconType: "el-icon-fa-file-image-o",
      name: Vue.t('container.containerImage')
    }]
  };
}
