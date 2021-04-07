;(function() {
  let update = (el, binding) => {
    Vue.nextTick(() => {
      let option = {
        max: 400,
        min: 10,
        defaultTarget: el
      };
      let config = binding.value || {};
      if (config.target) {
        config.defaultTarget = el.querySelector(config.target);
      }
      option = Object.assign({}, option, config);
      apply(option);
    });
  };
  // 设置目标元素宽度或者高度
  let apply = function(option) {
    const BORDER_BOX = "border-box";
    const CONTENT_BOX = "content-box";
    const MAX = option.max;
    const MIN = option.min;
    let element = option.defaultTarget;
    let cs = window.getComputedStyle(element);
    let boxSizing = cs.boxSizing;
    let type = element.nodeName.toLowerCase();
    let offset = 0;
    switch (type) {
      case "textare":
        element.style.height = 0;
        if (boxSizing === BORDER_BOX) {
          offset = element.offsetHeight;
        }
        if (boxSizing === CONTENT_BOX) {
          offset = element.clientHeight;
        }
        let height = element.scrollHeight + offset;
        height = Math.min(Math.max(MIN, height), MAX);
        element.style.height = height + "px";
        break;
      case "input":
        element.style.width = 0;
        let text= element.value;
        let textWidth = computeStrWidth(text, element);
        if (boxSizing === BORDER_BOX) {
          offset = element.offsetWidth;
        }
        if (boxSizing === CONTENT_BOX) {
          offset = element.clientWidth;
        }
        let width = textWidth + offset;
        width = Math.min(Math.max(MIN, width), MAX);
        element.style.width = width + "px";
        break;
      case "select":
        element.style.width = 0;
        let index = element.selectedIndex;
        let textContent = element.options[index].text;
        let textContentWidth = computeStrWidth(textContent);
        if (textContentWidth > MIN && textContentWidth < MAX) {
          element.style.width = textContentWidth + "px";
        }
        textContentWidth = Math.min(Math.max(MIN, textContentWidth), MAX);
        element.style.width = textContentWidth + "px";
        if (cs[appearance] && cs[appearance] !== "none") {
          element.style.width = "calc(" + textContentWidth + " + 2em";
        }
    }
  };
  // 计算内容宽度
  let computeStrWidth = function(str, element) {
    str = str.replace(/\n/g, '').replace(/\r\n/g, '');
    let span = document.body.appendChild(document.createElement('span'));
    span.style.fontSize = element.style.fontSize || "14px";
    span.style.fontFamily = element.style.fontFamily;
    span.innerText = str;
    let width = span.offsetWidth;
    if (span.remove) {
      span.remove();
    } else {
      span.removeNode(true);
    }
    return width;
  };
  const changeWidth = {};
  // 配置成vue插件
  changeWidth.config = {};
  changeWidth.install = Vue => {
    Vue.directive('change-width', {
      bind: function(el, binding) {
        update(el, binding);
      },

      update: function(el, binding) {
        if (binding.oldValue !== binding.value) {
          update(el, binding);
        }
      },
      componentUpdated(el, binding) {
        update(el, binding);
      },
      unbind: function(el, binding) {
      }
    });
  };

  if (typeof exports == "object") {
    module.exports = changeWidth;
  } else if (typeof define == "function" && define.amd) {
    define([], function () {
      return changeWidth;
    })
  } else if (window.Vue) {
    window.changeWidth = changeWidth;
    Vue.use(changeWidth);
  }
})();
