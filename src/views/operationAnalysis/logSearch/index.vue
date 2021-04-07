<template>
  <div class="log-search" v-loading="loading">
    <icos-page-header :title="$t('operationAnalysis.logSearch')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <el-tabs v-model="currentTab" @tab-click="tabClick" type="border-card">
      <el-tab-pane v-for="i in tabs" :key="i.v" :name="i.v" :label="i.l"></el-tab-pane>
    </el-tabs>

    <router-view></router-view>
  </div>
</template>
<script>
import { utils } from "../../intelligentMonitoring/public/utils";
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "logSearch",
  components: {},
  data() {
    return {
      loading: false,
      tabs: [
        {
          v: "logSearchOpenStack",
          l: Vue.t("operationAnalysis.LOG_SEARCH_OPENSTACK")
        },
        {
          v: "logSearchSystem",
          l: Vue.t("operationAnalysis.LOG_SEARCH_SYSTEM")
        },
        { v: "chain", l: Vue.t("operationAnalysis.CHAIN") }
      ],
      currentTab: this.$route.matched[2].name,
      roleType: Vue.roleType + ""
    };
  },
  watch: {
    $route(to, from) {
      this.currentTab = this.$route.matched[2].name;
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {});
  },
  beforeRouteUpdate(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  beforeDestroy() {},
  mounted() {},
  computed: {
    ...mapGetters({
      routers: "getRouters",
      order: "getOrderInfo"
    })
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

 <style scoped>
.log-search >>> .columns-checkbox .el-tag {
  cursor: pointer;
}
</style>
