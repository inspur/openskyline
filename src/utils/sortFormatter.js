(function () {
  var sortFormatter = {};
  // 暴露出的全局配置项，也就是在调用 Vue.use(Vue, options) 时传入的第二个选项参数
  sortFormatter.config = {};
  sortFormatter.install = function (Vue) {
    if (sortFormatter.installed) {
      return;
    }
    sortFormatter.installed = true;
    //orderType默认为string排序，还可以传递int排序
    Vue.sortFormatter = function (prop, order, orderType = "string") {
      return function (obj1, obj2) {
        var val1 = eval(`obj1.${prop}`) || "";  // 使用eval支持路径选择，下同
        var val2 = eval(`obj2.${prop}`) || "";
        if (orderType === "string") {
          val1 = val1 + "";
          val2 = val2 + "";
          if (order === "descending") {
            return val1.localeCompare(val2) * -1;
          } else {
            return val1.localeCompare(val2);
          }
        } else {
          if (val1 === undefined || val1 === null || val1 === '') {
            val1 = -Infinity;
          } else if (!isNaN(val1)) {
            val1 = Number(val1);
          }
          if (val2 === undefined || val2 === null || val2 === '') {
            val2 = -Infinity;
          } else if (!isNaN(val2)) {
            val2 = Number(val2);
          }
          if (val1 === val2) {
            return 0;
          }
          if (order === "descending") {
            return val1 > val2 ? -1 : 1;
          } else {
            return val1 > val2 ? 1 : -1;
          }
        }
      }
    };
    Vue.prototype.$sortFormatter = function (prop, order, orderType) {
      return Vue.sortFormatter.call(this, prop, order, orderType);
    }
  };
  if (typeof exports == "object") {
    module.exports = sortFormatter;
  } else if (typeof define == "function" && define.amd) {
    define([], function () {
      return sortFormatter;
    })
  } else if (window.Vue) {
    window.sortFormatter = sortFormatter;
    Vue.use(sortFormatter);
  }
})();
