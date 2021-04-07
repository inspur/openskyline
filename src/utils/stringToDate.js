/**
字符串转Date
 */
;(function() {
  var stringToDate = {};
  stringToDate.config = {};
  stringToDate.install = function(Vue) {
    if (stringToDate.installed) {
      return;
    }
    stringToDate.installed = true;

    Vue.stringToDate = function(str) {
      let dateList;
      let timeList;
      if (str) {
        let arr = str.split(" ");
        if (arr[0]) {
          dateList = arr[0].split("-");
        }
        if (arr[1]) {
          timeList = arr[1].split(":");
        }
        return new Date(dateList[0], dateList[1]-1, dateList[2], timeList[0], timeList[1], timeList[2]);
      }
    };
    Vue.prototype.$stringToDate = function(str) {
      return Vue.stringToDate.call(this, str);
    }
  };
  if (typeof exports == "object") {
    module.exports = stringToDate;
  } else if (typeof define == "function" && define.amd) {
    define([], function() {
      return stringToDate;
    })
  } else if (window.Vue) {
    window.stringToDate = stringToDate;
    Vue.use(stringToDate);
  }
})();
