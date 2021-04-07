import navLinkService from "../navLinkService";
var AWS = require('aws-sdk');
var S3 = require('aws-sdk/clients/s3');
;(function() {
  var vueGlobal = {};
  // 暴露出的全局配置项，也就是在调用 Vue.use(Vue, options) 时传入的第二个选项参数
  vueGlobal.config = {};
  vueGlobal.install = function(Vue) {
    if (vueGlobal.installed) {
      return;
    }
    vueGlobal.installed = true;
    Vue.csrfToken = window.csrfToken || '';
    Vue.projectList = window.projectList || [];
    Vue.regionList = window.regionList || [];
    Vue.service = window.service||{};
    Vue.regionServices = window.regionServices||{};
    Vue.AuthList = window.menuCodeList || {};
    Vue.objectStorageType = window.objectStorageType || "S3";
    Vue.S3SuperUser = window.S3SuperUser || {};
    Vue.showSafeDelete = window.showSafeDelete;
    Vue.showManageConnect = window.showManageConnect;
    Vue.language = window.language || "";
    Vue.userName = window.userName;
    Vue.userId = window.userId;
    Vue.roleId = window.roleId;
    Vue.roleType = window.roleType;
    Vue.orgId = window.orgId;
    Vue.orgName = window.orgName;
    Vue.isLdap = window.isLdap;
    Vue.token = window.token;
    Vue.domainId = window.domainId;
    Vue.domainName = window.domainName;
    Vue.poc = window.poc;
    Vue.uploadImageUseFakeS3 = 'uploadImageUseFakeS3' in window ? window.uploadImageUseFakeS3 : true;  // 上传镜像使用仿真s3，支持断点续传
    Vue.sdsipaddress = window.sdsipaddress || '';
    Vue.oemSwitch = 'oemSwitch' in window ? window.oemSwitch : false;
    Vue.oemProductLogo = 'oemProductLogo' in window ? window.oemProductLogo : '';
    Vue.oemBrandLogo = 'oemBrandLogo' in window ? window.oemBrandLogo : '';
    Vue.oemProductName = 'oemProductName' in window ? window.oemProductName : '';
    Vue.oemVersion = 'oemVersion' in window ? window.oemVersion : '';
    Vue.oemEmail = 'oemEmail' in window ? window.oemEmail : '';
    Vue.oemAddress = 'oemAddress' in window ? window.oemAddress : '';
    Vue.oemCopyright = 'oemCopyright' in window ? window.oemCopyright : '';
    Vue.forceCheckCurrentUser = 'forceCheckCurrentUser' in window ? window.forceCheckCurrentUser : false;
    Vue.forceVNCPassword = 'forceVNCPassword' in window ? window.forceVNCPassword : false;
    let arch = window.arch || 'x86_64';
    if (['x86', 'x86_64', 'amd64'].indexOf(arch) !== -1) { // intel、amd等x86架构
      Vue.arch = 'x86';
    } else if (['arm', 'aarch64', 'arm64'].indexOf(arch) !== -1) { // 飞腾等arm架构
      Vue.arch = 'arm';
    } else if (['mips', 'mips64', 'mips64el'].indexOf(arch) !== -1) { // 龙芯等mips架构
      Vue.arch = 'mips';
    } else if (['alpha'].indexOf(arch) !== -1) { // 申威等alpha架构
      Vue.arch = 'alpha';
    } else {
      Vue.arch = 'x86';
    }
    ///引入s3 全局对象
    if (Vue.objectStorageType === "S3") {
      Vue.s3 = new AWS.S3({
        accessKeyId: "fake-ak", // 假ak
        secretAccessKey: "fake-sk", // 假sk
        // region: "us-east-1",
        endpoint: window.location.protocol + "//" + window.location.host + "/s3-api/rgw",
        s3ForcePathStyle: true,
        maxRetries: 0,
        signatureVersion: 'v2'
      });
    }
    // 4. 添加实例方法
    Vue.prototype.$authList = Vue.AuthList;
    Vue.projectListforNet = [];
    Vue.networkList = [];
    Vue.firewallPolicies = [];
    Vue.networkList = [];
    Vue.subnetsList = [];
    Vue.portsList = [];

    //遍历navLinkService.json文件，将未部署的服务响应的菜单进行隐藏
    for (let key in navLinkService) {
      let value = navLinkService[key];
      let valueArr = [];
      if (value.indexOf('&&') > -1) {
        valueArr = value.split('&&');
        valueArr.forEach((item) => {
          if (!Vue.service[item]) {
            Vue.AuthList[key] = false;
          }
        });
      } else if (value.indexOf('||') > -1) {
        valueArr = value.split('||');
        let flag = false;
        //遍历对应服务，都没部署则不展示，否则按照原有权限展示
        valueArr.forEach((item) => {
          if (Vue.service[item]) {
            flag = true;
          }
        });
        if (!flag) {
          Vue.AuthList[key] = false;
        }
      } else {
        if (!Vue.service[value]) {
          Vue.AuthList[key] = false;
        }
      }
    }

    Vue.prototype.$fillHyphen = (v, unit) => { // 判断是否有数据，如果为空值，则用‘-’代替显示
      if (v === '' || v === undefined || v === null || Number.isNaN(v) || (Array.isArray(v) && v.length < 1)) {
        return '-';
      }
      if (unit !== undefined && unit !== null) {
        v += unit;
      }
      return String(v);
    };
  };

  if (typeof exports == "object") {
    module.exports = vueGlobal;
  } else if (typeof define == "function" && define.amd) {
    define([], function () {
      return vueGlobal;
    })
  } else if (window.Vue) {
    window.vueGlobal = vueGlobal;
    Vue.use(vueGlobal);
  }
})();
