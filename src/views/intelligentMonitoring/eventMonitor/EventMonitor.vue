<template>
  <div class="event-monitor">
    <icos-page-header :title="$t('monitor.EVENT_MONITOR')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <el-tabs v-model="currentTab" @tab-click="tabClick" type="border-card">
      <el-tab-pane v-for="i in tabs" :key="i.v" :name="i.v" :label="i.l"></el-tab-pane>
    </el-tabs>

    <router-view class="module-background-color module-padding"></router-view>
  </div>
</template>
<script>
export default {
  name: "EventMonitor",
  data() {
    return {
      tabs: [
        { v: "search", l: Vue.t("monitor.EVENT_SEARCH") },
        { v: "setting", l: Vue.t("monitor.NOTIFICATION_SETTING") }
      ],
      currentTab: this.$route.matched[2].name,
      roleType: Vue.roleType + "",
      centerId: this.$route.query.centerId
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
  components: {},
  mounted() {},
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
.event-monitor {
  overflow: hidden;
}
</style>