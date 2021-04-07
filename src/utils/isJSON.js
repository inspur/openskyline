/**
判断是否是json字符串
 */
;(function() {
  var isJSON = {};
  isJSON.config = {};
  isJSON.install = function(Vue) {
    if (isJSON.installed) {
      return;
    }
    isJSON.installed = true;

    Vue.isJSON = function(str) {
      if (typeof str == "string") {
        try {
          var obj = JSON.parse(str);
          if (str.indexOf('{')>-1) {
            return true;
          } else {
            return false;
          }
        } catch (e) {
          return false;
        }
      }
      return false;
    };
    Vue.prototype.$isJSON = function(str) {
      return Vue.isJSON.call(this, str);
    }
  };
  if (typeof exports == "object") {
    module.exports = isJSON;
  } else if (typeof define == "function" && define.amd) {
    define([], function() {
      return isJSON;
    })
  } else if (window.Vue) {
    window.isJSON = isJSON;
    Vue.use(isJSON);
  }
})();
