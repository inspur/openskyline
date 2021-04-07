import Vue from 'vue';

// v-dialogDrag: 弹窗拖拽
Vue.directive('dialogDrag', {
  bind(el, binding, vnode, oldVnode) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    const dragDom = el.querySelector('.el-dialog');
    dialogHeaderEl.style.cursor = 'move';
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null);
    dialogHeaderEl.onmousedown = (e) => {
      const dragDomSty = dragDom.getBoundingClientRect();
      const dragDomWidth = dragDomSty.width;
      const dragDomHeight = dragDomSty.height;
      const bodyWidth = document.body.clientWidth;
      const bodyHeight = document.body.clientHeight;
      const marginBottom = sty.marginBottom.replace(/\px/g, '');
      const marginLeft = sty.marginLeft.replace(/\px/g, '');
      const marginRight = sty.marginRight.replace(/\px/g, '');
      const marginTop = sty.marginTop.replace(/\px/g, '');
      const MAX_TOP = bodyHeight - dragDomHeight - marginBottom - marginTop;
      const MIN_LEFT = dragDomWidth / 2;
      const MAX_LEFT = bodyWidth - dragDomWidth / 2;
      const disX = e.clientX - dialogHeaderEl.offsetLeft;
      const disY = e.clientY - dialogHeaderEl.offsetTop;

      let styL, styT;
      if (sty.left.includes('%')) {
        styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100);
        styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100);
      } else {
        styL = +sty.left.replace(/\px/g, '');
        styT = +sty.top.replace(/\px/g, '');
      };
      document.onmousemove = function (e) {
        const l = e.clientX - disX;
        const t = e.clientY - disY;
        const COMPUTED_L = l + styL;
        const COMPUTED_T = t + styT;
        const TOP = Math.min(Math.max(0, COMPUTED_T), MAX_TOP);
        const LEFT = Math.min(Math.max(MIN_LEFT, COMPUTED_L), MAX_LEFT);
        dragDom.style.left = `${LEFT}px`;
        dragDom.style.top = `${TOP}px`;
      };
      document.onmouseup = function (e) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    }
  }
});

// v-dialogDragWidth: 弹窗宽度拖大 拖小
Vue.directive('dialogDragWidth', {
  bind(el, binding, vnode, oldVnode) {
    const dragDom = binding.value.$el.querySelector('.el-dialog');
    el.onmousedown = (e) => {
      const disX = e.clientX - el.offsetLeft;
      document.onmousemove = function (e) {
        e.preventDefault(); // 移动时禁用默认事件
        const l = e.clientX - disX;
        dragDom.style.width = `${l}px`;
      };
      document.onmouseup = function (e) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    }
  }
});

Vue.directive('divWrap', {
  inserted(el, binding) {
    const wrapper = document.createElement('div');
    const minHeight = binding.value.minHeight ? binding.value.minHeight : '30px';
    const expandText = binding.value.expandText ? binding.value.expandText : '展开';
    const collapseText = binding.value.collapseText ? binding.value.collapseText : '收起';
    const wrapperWidth = el.offsetWidth;

    wrapper.style.overflow = 'hidden';
    wrapper.style.flexDirection = 'row';
    wrapper.style.justifyContent = 'space-between';
    wrapper.style.alignItems = 'center';
    wrapper.style.width = wrapperWidth+'px';
    el.style.textOverflow = 'ellipsis';
    el.parentNode.replaceChild(wrapper, el);
    wrapper.appendChild(el);

    const button = document.createElement('el-button');
    button.classList.add('el-button');
    button.classList.add('el-button--text');
    button.classList.add('el-button--small');
    button.textContent = collapseText;
    wrapper.appendChild(button);

    let expanded = true;

    function expand() {
      wrapper.style.height = '100%';
      wrapper.style.display = 'block';
      button.textContent = collapseText;
      el.style.overflow = 'inherit';
      el.style.height = 'auto';
      el.style.whiteSpace = 'normal';
      expanded = true;
    }

    function collapse() {
      wrapper.style.height = minHeight;
      wrapper.style.display = 'flex';
      button.textContent = expandText;
      el.style.overflow = 'hidden';
      el.style.height = minHeight;
      el.style.whiteSpace = 'nowrap';
      expanded = false;
    }

    button.addEventListener('click', function() {
      if (expanded) {
        collapse();
      } else {
        expand();
      }
    });

    collapse();
  }
});
