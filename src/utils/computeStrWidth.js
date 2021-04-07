/**
计算字符串占多少像素
 */
;(function() {
  var computeStrWidth = {};
  computeStrWidth.config = {};
  computeStrWidth.install = function(Vue) {
    if (computeStrWidth.installed) {
      return;
    }
    computeStrWidth.installed = true;

    Vue.computeStrWidth = function(str) {
      str = str.replace(/\n/g, '').replace(/\r\n/g, '');
      let span = document.body.appendChild(document.createElement('span'));
      span.className = 'compute_str_width';
      span.innerText = str;
      let width = span.offsetWidth;
      if (span.remove) {
        span.remove();
      } else {
        span.removeNode(true);
      }
      return width;
    };
    Vue.prototype.$computeStrWidth = function(str) {
      return Vue.computeStrWidth.call(this, str);
    }
  };
  if (typeof exports == "object") {
    module.exports = computeStrWidth;
  } else if (typeof define == "function" && define.amd) {
    define([], function() {
      return computeStrWidth;
    })
  } else if (window.Vue) {
    window.computeStrWidth = computeStrWidth;
    Vue.use(computeStrWidth);
  }
})();
