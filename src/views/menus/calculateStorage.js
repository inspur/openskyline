//计算&存储
module.exports = function () {
  let menus = {
    flg: Vue.AuthList["m.calculate"],
    key: "calculate-storage",
    path: "/calculate-storage/",
    iconType: "el-icon-fa-skyatlas",
    name: Vue.t("calcStorLang.calculateStorage"),
    subMenus: [{
      flg: Vue.AuthList["m.calculate.instance"],
      key: "instances-list",
      path: "instances-list",
      iconType: "el-icon-fa-desktop",
      name: Vue.t("calcStorLang.instance")
    }, {
      flg: Vue.AuthList["m.calculate.physical"],
      key: "physical-host",
      path: "physical-host",
      iconType: "el-icon-fa-server",
      name: Vue.t("calcStorLang.physicalHost")
    }, {
      flg: Vue.AuthList["m.calculate.disk"],
      key: "volume",
      path: "volume",
      iconType: "el-icon-fa-houzz",
      name: Vue.t("calcStorLang.blockStorage")
    }, {
      flg: Vue.AuthList["m.calculate.fileStorage"],
      key: "document-storage",
      path: "document-storage",
      iconType: "el-icon-fa-wpforms",
      name: Vue.t("calcStorLang.fileStorage")
    }, {
      flg: Vue.AuthList["m.calculate.snapshot"],
      key: "snapshot",
      path: "snapshot",
      iconType: "el-icon-fa-camera",
      name: Vue.t("calcStorLang.snapshot")
    }, {
      flg: Vue.AuthList["m.calculate.media"],
      key: "image-list",
      path: "image-list",
      iconType: "el-icon-fa-image",
      name: Vue.t("calcStorLang.image")
    }, {
      flg: Vue.AuthList["m.calculate.keypair"],
      key: "high-config",
      path: "high-config",
      iconType: "el-icon-fa-key",
      name: Vue.t("calcStorLang.highConfig")
    }, {
      flg: Vue.AuthList["m.calculate.host"] && Vue.roleType === '0',
      key: "host-management",
      path: "host-management",
      iconType: "el-icon-fa-ioxhost",
      name: Vue.t("calcStorLang.hostManage")
    }, {
      flg: Vue.AuthList["m.calculate.baremetal"],
      // flg: Vue.AuthList["m.calculate.resourcespec"],
      key: "baremachine-management",
      path: "baremachine-management",
      iconType: "el-icon-fa-hdd-o",
      name: Vue.t("calcStorLang.baremetal")
    }, {
      flg: Vue.AuthList["m.calculate.resourcespec"] && Vue.roleType === '0',
      key: "res-spec",
      path: "res-spec",
      iconType: "el-icon-fa-sitemap",
      name: Vue.t("calcStorLang.resourcespec")
    }, {
      flg: Vue.AuthList["m.calculate.logictopo"], //Vue.AuthList["m.calculate.logictopo"]
      key: "resTopo",
      path: "resTopo",
      iconType: "el-icon-fa-connectdevelop",
      name: Vue.t("calcStorLang.logictopo")
    }, {
      flg: Vue.AuthList["m.calculate.recycleBin"],
      key: "recycle-bin",
      path: "recycle-bin",
      iconType: "el-icon-fa-trash-o",
      name: Vue.t("calcStorLang.RECYCLE_BIN")
    }
    ]
  };
  if (Vue.objectStorageType === "S3") {
    menus.subMenus.splice(4, 0, {
      flg: Vue.AuthList["m.calculate.objectStorage"],
      key: "object-storage-s3",
      path: "object-storage-s3",
      iconType: "el-icon-fa-delicious",
      name: Vue.t("calcStorLang.objectStorage")
    });
  } else {
    menus.subMenus.splice(4, 0, {
      flg: Vue.AuthList["m.calculate.objectStorage"],
      key: "object-storage",
      path: "object-storage",
      iconType: "el-icon-fa-delicious",
      name: Vue.t("calcStorLang.objectStorage")
    });
  }
  return menus;
};
