;(function() {
  // scrollTop animation
  function scrollTop(el, from = 0, to, duration = 500) {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
          return window.setTimeout(callback, 1000 / 60);
        }
      );
    }
    const difference = Math.abs(from - to);
    const step = Math.ceil(difference / duration * 50);

    function scroll(start, end, step) {
      if (start === end) return;

      let d = (start + step > end) ? end : start + step;
      if (start > end) {
        d = (start - step < end) ? end : start - step;
      }

      if (el === window) {
        window.scrollTo(d, d);
      } else {
        el.scrollTop = d;
      }
      window.requestAnimationFrame(() => scroll(d, end, step));
    }
    scroll(from, to, step);
  }

  function scrollToHeader(to = 0) {
    let el = document.querySelector('.layout-content-main')|| {};
    scrollTop(el, el.scrollTop, to);
  }
  var backTop = {};
  // 暴露出的全局配置项，也就是在调用 Vue.use(Vue, options) 时传入的第二个选项参数
  backTop.config = {};
  backTop.install = function(Vue) {
    if (backTop.installed) {
      return;
    }
    backTop.installed = true;
    Vue.scrollTop = scrollTop;
     // 4. 添加实例方法
    Vue.prototype.$scrollTop = scrollTop;

    Vue.scrollToHeader = scrollToHeader;
    Vue.prototype.$scrollToHeader = scrollToHeader;
  };

  if (typeof exports == "object") {
    module.exports = backTop;
  } else if (typeof define == "function" && define.amd) {
    define([], function () {
      return backTop;
    })
  } else if (window.Vue) {
    window.backTop = backTop;
    Vue.use(backTop);
  }
})();
