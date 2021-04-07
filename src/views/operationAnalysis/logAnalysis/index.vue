<template>
  <div>
    <icos-page-header :title="$t('operationAnalysis.logAnalysis')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <el-tabs v-model="currentTab" @tab-click="tabClick" type="border-card">
      <el-tab-pane v-for="i in tabs" :key="i.v" :name="i.v" :label="i.l"></el-tab-pane>
    </el-tabs>

    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: "LogAnalysis",
  data() {
    return {
      tabs: [
        { v: "logHost", l: Vue.t("operationAnalysis.hostLogAnalysis") },
        { v: "logModule", l: Vue.t("operationAnalysis.zujianLogAnalysis") }
      ],
      currentTab: this.$route.matched[2].name
    };
  },
  watch: {
    $route(to, from) {
      this.currentTab = this.$route.matched[2].name;
    }
  },
  methods: {
    tabClick(v) {
      this.$router.push({
        name: v.name,
        params: { name: v.name },
        query: { test: v.name }
      });
    }
  }
};
</script>