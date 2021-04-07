<template>
<div :class="{ affixed: affixed }" :style="styles">
  <slot></slot>
</div>
</template>

<script>
import EventListener from './EventListener';

export default {
  props: {
    offset: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      affixed: false,
      styles: {}
    };
  },
  methods: {
    scrolling() {
      const scrollTop = document.querySelector('.layout-content-main').scrollTop;
      const offset = this.getOffset(this.$el);
      if (!this.affixed && scrollTop > offset.top - this.offset) {
        this.affixed = true;
        this.styles = {
          top: `${this.offset}px`,
          left: `${offset.left}px`,
          width: `${this.$el.offsetWidth}px`,
          zIndex: 2
        };
      }
      if (this.affixed && scrollTop < this.initialTop - this.offset) {
        this.affixed = false;
        this.styles = {};
      }
    },

    getOffset(element) {
      let elm = element;
      let offset = $(elm).offset();
      let top = elm.offsetTop;
      let left = elm.offsetLeft;
      while (elm.offsetParent !== null) {
        elm = elm.offsetParent;
        top += elm.offsetTop;
        left += elm.offsetLeft;
      }
      return {
        top,
        left
      };
    }
  },
  mounted() {
    let self = this;
    // 获取初始 top 值，方便判断是否脱离 fixed 布局
    this.initialTop = this.getOffset(this.$el).top;
    self.scrolling();

    this.scrollEvent = EventListener.listen(window, 'scroll', this.scrolling);
     // listen scroll event
  },
  beforeDestory() {
    if (this.scrollEvent) {
      this.scrollEvent.remove();
    }
  }
};
</script>
