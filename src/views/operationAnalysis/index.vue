<template>
  <div class="operation-analysis">
      <router-view :class="{'icos-dark':dark}"></router-view>
  </div>
</template>
<script>
export default {
  name: "OperationAnalysis",
  components: {},
  data() {
    return { dark: Vue.cookie.get("theme") + "" == "dark" };
  },
  computed: {},
  mounted() {},
  beforeRouteLeave(to, from, next) {
    next();
  },
  beforeRouteEnter(to, from, next) {
    next();
  },
  watch: {
    // 切换页面
    $route(to, from) {
      // 如果是当前页面切换分类的情况
    }
  },
  methods: {}
};
</script>
<style scoped>
.operation-analysis {
}

.operation-analysis >>> .module-padding {
  padding: 16px;
}
.operation-analysis >>> .el-tabs__header {
  background-color: inherit;
}
.operation-analysis >>> .el-tabs__item.is-active {
  border: inherit;
  border-bottom: 2px solid #0087ed;
}
.operation-analysis >>> .el-tabs__item {
  border: inherit;
  font-weight: inherit;
  transition: inherit;
  padding: 0;
  margin: 0 16px;
  height: 45px;
  line-height: 45px;
  font-size: 13px;
}
.operation-analysis >>> .el-tabs__item:hover {
  background-color: inherit;
  font-weight: inherit;
}
.operation-analysis >>> .el-tabs__content {
  padding: 0;
}

.operation-analysis >>> .icos-dark {
  background-color: inherit !important;
}
.operation-analysis >>> .isolation-belt {
  margin-bottom: 10px;
}

.operation-analysis >>> .icos-dark .charts-parent {
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.operation-analysis >>> .charts-parent {
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
.operation-analysis >>> .icos-dark .chart-title {
  color: #fff;
}
.operation-analysis >>> .chart-title {
  font-size: 14px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.65);
}
</style>
