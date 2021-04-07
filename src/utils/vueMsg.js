;
(function() {
  var vueMsg = {};
  // 暴露出的全局配置项，也就是在调用 Vue.use(Vue, options) 时传入的第二个选项参数
  vueMsg.config = {};
  vueMsg.install = function(Vue) {
    Vue.prototype.$errMsg = async function(message, code, logout) {
      switch (code+"") {
      case '401':
        try {
          if (logout) {
            let ret = await this.$ajax({
              type: "post",
              url: "node-api/logout?timestamp=" + (new Date()).getTime()
            });
            // this.$cookie.delete('pid');
            document.location.href = "timeout.html";
          } else {
            this.$notify.error({
              title:Vue.t('code.' + code),
              message:message,
              duration:5000
            })
          }
        } catch (data) {
          __DEV__ && console.warn(data);
        }
        break;
      default:
        //(this.$message || {}).error(Vue.t('code.' + errCode) );
        this.$notify.error({
          title:Vue.t('code.' + code),
          message:message,
          duration:5000
        })
      }
    };
  };

  if (typeof exports == "object") {
    module.exports = vueMsg;
  } else if (typeof define == "function" && define.amd) {
    define([], function() {
      return vueMsg;
    });
  } else if (window.Vue) {
    window.vueMsg = vueMsg;
    Vue.use(vueMsg);
  }
})();
