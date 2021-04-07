<template>
  <div class="panel panel-default">
        <div class="panel-heading" v-if="showHead"><slot name="title"></slot></div>
        <div class="panel-body" ><slot></slot></div>
        <div class="panel-footer" v-bind:style="footerStyle" v-if="showFooter"><slot name="footer"></slot></div>
  </div>
</template>
<script>
export default {
  name: 'Panel',
   // 声明 props
  props: ["footerPadding"],
  data () {
    return {
      showHead: true,
      showFooter: true
    };
  },
  computed: {
    footerStyle() {
      var ret = {};
      var footerPadding = this.footerPadding;
      if (footerPadding) {
        ret.padding = footerPadding;
      }
      return ret;
    }
  },
  mounted () {
    this.showHead = this.$slots.title !== undefined;
    this.showFooter = this.$slots.footer !== undefined;
  },
  beforeRouteLeave (to, from, next) {
    // 如果跳转到详情页面，则记录关键数据
    // 方便从详情页面返回到该页面的时候继续加载之前位置的数据
    next()
  },
  beforeRouteEnter (to, from, next) {
    next()
  },
  watch: {
  },
  methods: {
  }
}
</script>
<style scoped>

</style>
