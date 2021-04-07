// 潘启宝写于2020年4月14日 16:18:08，地点---中国济南
<template>
  <div class="vertex">
    <span class="top-left"></span>
    <span class="top-right"></span>
    <span class="bottom-left"></span>
    <span class="bottom-right"></span>
  </div>
</template>

<script>
export default {
  name: "Vertex",
  components: {},
  props: {},
  data() {
    return {
      value: {}
    };
  },
  watch: {},
  beforeDestroy() {
    this.destroy();
  },
  mounted() {},
  beforeCreate() {},
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  methods: {
    init(v) {},
    destroy(v) {}
  }
};
</script>

<style scoped>
.vertex {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.top-left,
.top-right,
.bottom-left,
.bottom-right {
  position: absolute;
  display: inline-block;
  border: 1px solid #2e7eff;
  width: 0.5rem;
  height: 0.5rem;
}

.top-left {
  top: 0;
  left: 0;
  border-right: transparent;
  border-bottom: transparent;
}

.top-right {
  top: 0;
  right: 0;
  border-left: transparent;
  border-bottom: transparent;
}

.bottom-left {
  bottom: 0;
  left: 0;
  border-top: transparent;
  border-right: transparent;
}

.bottom-right {
  bottom: 0;
  right: 0;
  border-top: transparent;
  border-left: transparent;
}
</style>
