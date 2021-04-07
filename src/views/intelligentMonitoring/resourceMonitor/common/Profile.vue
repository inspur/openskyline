<template>
  <div class="profile">
    <div v-for="(i,index) in model" :key="i.name+index" class="item">
      <span class="name">{{i.name}}</span>
      ：
      <slot name="slot" :data="i">
        <span class="value">{{i.value|line}}</span>
      </slot>
    </div>
  </div>
</template>


<script>
export default {
  name: "Profile",
  watch: {},
  props: {
    model: { type: Array, default: [] }
  },
  filters: {
    line(v) {
      let v0 = v;
      let v1 = "";
      if (Array.isArray(v)) {
        v0 = v[0]; // 数值
        v1 = v[1]; // 单位
      }
      let b = ["NaN", "undefined", "null", ""].includes(String(v0));

      if (b) {
        v0 = "-";
      } else {
        v0 += " " + v1;
      }
      return v0;
    }
  },
  data() {
    return {};
  },
  computed: {},
  beforeDestroy() {},
  mounted() {},
  methods: {}
};
</script>

<style scoped>
.profile {
  overflow: hidden;
}
.profile .item >>> .el-button {
  padding: 0;
}
.profile .item {
  width: 33%;
  float: left;
}
.profile .name {
  opacity: 0.85;
}
.profile .value {
  opacity: 0.65;
}
</style>