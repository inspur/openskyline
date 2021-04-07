;
(function() {
  var convertRoleLanguage = {};
  convertRoleLanguage.config = {};
  convertRoleLanguage.install = function(Vue) {
    Vue.prototype.$convertRoleLanguage = function(arr, key="name") {
      if (this.$cookie.get('defaultLanguage')=="en") {
        let obj = {
          "超级管理员角色":"Super Administrator Role",
          "项目管理员角色":"Project Management Role",
          "项目用户角色":"Project User Role",
          "安全管理员角色":"Security Administrator Role",
          "审计管理员角色":"Audit Administrator Role"
        }
        arr.forEach((item) => {
          if (obj[item[key]]) {
            item[key] = obj[item[key]];
          }
        })
      }
      return arr;
    };
  };

  if (typeof exports == "object") {
    module.exports = convertRoleLanguage;
  } else if (typeof define == "function" && define.amd) {
    define([], function() {
      return convertRoleLanguage;
    });
  } else if (window.Vue) {
    window.convertRoleLanguage = convertRoleLanguage;
    Vue.use(convertRoleLanguage);
  }
})();
