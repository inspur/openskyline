;
(function () {
  var recordLog = {};
  recordLog.config = {};
  recordLog.install = function (Vue) {
    Vue.prototype.$recordLog = function (obj) {
      this.$ajax({
        type: 'post',
        url: "node-api/keystone/recordLog",
        contentType: "application/json",
        data: JSON.stringify({
          logs: [{
            region_id: this.$cookie.get('region_id') || "",
            user_name: Vue.userName,
            user_id: Vue.userId,
            project_id: Vue.roleType == 0 ? "" : this.$cookie.get("pid"),
            target: obj.target ? (obj.target.en ? obj.target.en : "") : "",
            log_level: obj.level.en,
            description: obj.description ? (obj.description.en ? obj.description.en : "") : "",
            language: "en",
            trace_id: obj.trace_id || ''
          }, {
            region_id: this.$cookie.get('region_id') || "",
            user_name: Vue.userName,
            user_id: Vue.userId,
            project_id: Vue.roleType == 0 ? "" : this.$cookie.get("pid"),
            target: obj.target ? (obj.target.zh_cn ? obj.target.zh_cn : "") : "",
            log_level: obj.level.zh_cn,
            description: obj.description ? (obj.description.zh_cn ? obj.description.zh_cn : "") : "",
            language: "zh_cn",
            trace_id: obj.trace_id || ''
          }]
        })
      })
    };
  };

  if (typeof exports == "object") {
    module.exports = recordLog;
  } else if (typeof define == "function" && define.amd) {
    define([], function () {
      return recordLog;
    });
  } else if (window.Vue) {
    window.recordLog = recordLog;
    Vue.use(recordLog);
  }
})();
