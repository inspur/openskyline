;(function() {
  let update = (el, binding) => {
    Vue.nextTick(() => {
      let unflodHeight = el.getAttribute('element-unflod-height')*1;
      let unflodMore = el.getAttribute('element-unflod-more');
      let unflodLess = el.getAttribute('element-unflod-less');
      let $el = $(el);
      let height = $el.height();
      if (0 == height) {
        return;
      }
      if (height >= unflodHeight) {
        $el.css({
          "overflow": "hidden",
          "height": unflodHeight
        });
        let moreOperateTpl = [
          '<div class="unflod">',
          '<icon class="el-icon-fa-angle-double-down"></icon>',
          '<span style="display:inline-block; margin: 0 5px;">' + unflodMore + '</span>',
          '<icon class="el-icon-fa-angle-double-down"></icon>',
          '</div>'
        ].join('');
        let lessOperateTpl = [
          '<div class="unflod">',
          '<icon class="el-icon-fa-angle-double-up"></icon>',
          '<span style="display:inline-block; margin: 0 5px;">' + unflodLess + '</span>',
          '<icon class="el-icon-fa-angle-double-up"></icon>',
          '</div>'
        ].join('');
        $(moreOperateTpl).data('index', 1).insertAfter($el);

        $($el.parent() ).off('click').on('click', '.unflod', function(evt) {
          var $self = $(this);
          let index = $self.data('index')*1;
          $el.parent().children('.unflod').remove();
          if ( index ) {  //more
            $el.css({
              height: "auto"
            });
            $(lessOperateTpl).data('index', 0).insertAfter($el);
          } else {  //less
            $el.css({
              height: unflodHeight
            });
            $(moreOperateTpl).data('index', 1).insertAfter($el);
          }
        });
      }
    });
  }
  var unflod = {};
  // 暴露出的全局配置项，也就是在调用 Vue.use(Vue, options) 时传入的第二个选项参数
  unflod.config = {};
  unflod.install = Vue => {
    Vue.directive('unflod', {
      bind: function(el, binding) {
        update(el, binding);
      },

      update: function(el, binding) {
        if (binding.oldValue !== binding.value) {
          $(el).parent().children('.unflod').remove();
          update(el, binding);
        }
      },

      unbind: function(el, binding) {
      }
    });
  };

  if (typeof exports == "object") {
    module.exports = unflod;
  } else if (typeof define == "function" && define.amd) {
    define([], function () {
      return unflod;
    })
  } else if (window.Vue) {
    window.unflod = unflod;
    Vue.use(unflod);
  }
})();
