//云数
module.exports = function () {
  return {
    flg: Vue.service['sahara'] && Vue.AuthList["m.sahara"],
    key: "clouddata",
    path: "/clouddata/",
    iconType: "el-icon-fa-cogs",
    name: Vue.t('cloudData.cloudData'),
    subMenus: [{
      flg: Vue.AuthList["m.sahara.cluster"],
      key: "cluster",
      path: "cluster",
      iconType: "el-icon-fa-cubes",
      name: Vue.t('base.cluster')
    }, {
      flg: Vue.AuthList["m.sahara.clustertemplate"],
      key: "clusterTemplate",
      path: "clusterTemplate",
      iconType: "el-icon-fa-object-ungroup",
      name: Vue.t('container.clusterTemplate')
    }, {
      flg: Vue.AuthList["m.sahara.nodegroup"],
      key: "nodeGroup",
      path: "nodeGroup",
      iconType: "el-icon-fa-users",
      name: Vue.t('cloudData.nodegroup')
    }, {
      flg: Vue.AuthList["m.sahara.image"],
      key: "image",
      path: "image",
      iconType: "el-icon-fa-picture-o",
      name: Vue.t('base.image')
    }]
  };
};
