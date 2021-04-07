<template>
  <div class="intelligent-monitoring">
      <router-view class="intelligent-monitoring-view" :class="{'icos-dark':dark}"></router-view>
  </div>
</template>
<script>
export default {
  name: "IntelligentMontitoring",
  components: {},
  data() {
    return {
      dark: Vue.cookie.get("theme") + "" == "dark"
    };
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
.intelligent-monitoring >>> .display-none {
  display: none;
}
.intelligent-monitoring >>> .isolation-belt {
  margin-bottom: 10px;
}
.intelligent-monitoring >>> .header,
.intelligent-monitoring >>> .body {
  padding: 16px;
}

.intelligent-monitoring >>> .module-padding {
  padding: 16px;
}
.intelligent-monitoring >>> .el-tabs__header {
  background-color: inherit;
}
.intelligent-monitoring >>> .el-tabs__item.is-active {
  border: inherit;
  border-bottom: 2px solid #0087ed;
}
.intelligent-monitoring >>> .el-tabs__item {
  border: inherit;
  font-weight: inherit;
  transition: inherit;
  padding: 0;
  margin: 0 16px;
  height: 45px;
  line-height: 45px;
  font-size: 13px;
}
.intelligent-monitoring >>> .el-tabs__item:hover {
  background-color: inherit;
  font-weight: inherit;
}
.intelligent-monitoring >>> .el-tabs__content {
  padding: 0;
}

.intelligent-monitoring >>> .type2 .el-tabs__header {
  border: inherit;
}
.intelligent-monitoring >>> .type2 .el-tabs__item {
  margin: 0;
  height: 25px;
  line-height: 25px;
}
.intelligent-monitoring >>> .type2 .el-tabs__item:not(:last-child) {
  margin-right: 25px;
}
.intelligent-monitoring >>> .type2 .el-tabs__item.is-active {
  border: inherit;
}

.intelligent-monitoring >>> .el-progress {
  text-align: left;
}
.intelligent-monitoring >>> .el-progress .el-progress__text {
  color: inherit;
  font-size: 12px !important;
}
.intelligent-monitoring >>> .columns-checkbox .el-tag {
  cursor: pointer;
}
.intelligent-monitoring >>> label.el-form-item__label {
  cursor: inherit;
}
.intelligent-monitoring >>> .circle {
  display: inline-block;
  position: relative;
  left: 5px;
}
.intelligent-monitoring >>> .circle::before {
  display: inline-block;
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  position: relative;
  top: -1px;
  left: -5px;
  background-color: #e4e8f1;
}
.intelligent-monitoring >>> .el-table {
  margin: 15px 0;
}
.intelligent-monitoring >>> .el-input__inner {
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  height: 30px;
}
.intelligent-monitoring >>> .el-switch.is-checked .el-switch__core {
  border-color: #0190fe;
  background-color: #20a0ff;
}
.intelligent-monitoring >>> .operate {
  color: #1991eb;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  display: block;
  position: relative;
}
.intelligent-monitoring
  >>> table
  tbody
  tr
  td.tag
  .operate.el-icon-edit::before {
  content: "";
}
.intelligent-monitoring >>> table tbody tr td.tag:hover .operate .el-icon-edit {
  display: inline;
}
.intelligent-monitoring
  >>> table
  tbody
  tr
  td.tag
  .operate .el-icon-edit.is-checked {
  display: inline;
}
.intelligent-monitoring >>> .chart-select.el-select {
  position: absolute;
  right: 8px;
  top: 8px;
}
.intelligent-monitoring >>> .chart-select.el-select .el-input__inner {
  color: rgba(0, 0, 0, 0.65);
}
.intelligent-monitoring >>> .height100 {
  height: 100%;
}
.intelligent-monitoring >>> [class*="chart"] .el-col {
  height: 100%;
}
.intelligent-monitoring >>> .icos-dark .chart {
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.intelligent-monitoring >>> .chart {
  position: relative;
  margin: 15px 0;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 15px 5px;
  height: 250px;
}
.intelligent-monitoring >>> .el-switch .el-switch__core {
  border-color: rgb(162, 210, 246);
  background-color: rgb(162, 210, 246);
}
.intelligent-monitoring >>> .OK::before {
  background-color: #1bce6e;
}
.intelligent-monitoring >>> .OK_RECOVERY::before {
  background-color: #1bce6e;
}
.intelligent-monitoring >>> .WARNING::before {
  background-color: #f3cf1b;
}
.intelligent-monitoring >>> .CRITICAL::before {
  background-color: #f38e1b;
}
.intelligent-monitoring >>> .LOST::before {
  background-color: #f2303a;
}
.intelligent-monitoring >>> .red::before {
  background-color: #f2303a;
}
.intelligent-monitoring >>> .green::before {
  background-color: #1bce6e;
}
.intelligent-monitoring >>> .icos-dark {
  background-color: inherit;
}
</style>
