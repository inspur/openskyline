;(function() {
  var vueMixins = {};
  // 暴露出的全局配置项，也就是在调用 Vue.use(Vue, options) 时传入的第二个选项参数
  vueMixins.config = {};
  vueMixins.install = function(Vue) {
    if (vueMixins.installed) {
      return;
    }
    vueMixins.installed = true;

    // Vue.mixin({
    //   data () {
    //     return {
    //       get authList () {
    //         return window.opeList || {};
    //       }
    //     }
    //   }
    // });
  };

  if (typeof exports == "object") {
    module.exports = vueMixins;
  } else if (typeof define == "function" && define.amd) {
    define([], function () {
      return vueMixins;
    })
  } else if (window.Vue) {
    window.vueMixins = vueMixins;
    Vue.use(vueMixins);
  }
})();
