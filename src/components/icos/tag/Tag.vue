<template>
  <transition :name="closeTransition ? '' : 'el-zoom-in-center'">
    <span
      class="el-tag icos_tag"
      :class="[type ? 'el-tag--' + type : '', {'is-hit': hit}]"
      :style="{backgroundColor: color, fontSize: fontSzie+'px'}"
      @click="handleclick"
      :title="title">
      <slot>{{text}}</slot>
      <i class="el-tag__close el-icon-close"
        v-if="closable"
        @click="handleClose"></i>
    </span>
  </transition>
</template>
<script>
  export default {
    name: 'IcosTag',
    props: {
      text: String,
      closable: Boolean,
      type: String,
      hit: Boolean,
      closeTransition: Boolean,
      color: String,
      size: [String, Number],
      title:String
    },
    data() {
      return {
        styles: {},
        fontSzie:""
      };
    },
    mounted() {
      this.tagSize();
    },
    methods: {
      tagSize() {
        this.fontSzie = this.size + "";
        switch (this.fontSzie) {
          case "small": this.fontSzie = "12"; break;
          case "medium": this.fontSzie = "14"; break;
          case "large": this.fontSzie = "16"; break;
          default: this.fontSzie = isNaN(this.size) ? "12" : this.size; break;
        }
      },
      handleClose(event) {
        event.stopPropagation();
        this.$emit('close', event);
      },
      handleclick(event) {
        this.$emit('click', event);
      }
    }
  };
</script>
<style scoped>
  .icos_tag {
    height: auto;
    line-height: inherit
  }
</style>
