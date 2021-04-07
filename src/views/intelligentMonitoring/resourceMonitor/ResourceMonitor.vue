<template>
  <div class="resource-monitor">
    <icos-page-header :title="$t('monitor.resMonitor')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <el-tabs v-model="currentTab" @tab-click="tabClick" type="border-card">
      <el-tab-pane v-for="i in tabs" :key="i.id" :name="i.name" :label="i.label"></el-tab-pane>
    </el-tabs>
    <router-view class="module-background-color module-padding"></router-view>
  </div>
</template>
<script>
export default {
  name: "ResourceMonitor",
  components: {},
  data() {
    // let tabs = [
    //   { v: "host", l: Vue.t("monitor.HOST_MONITOR") },
    //   {
    //     v: "virtualMachine",
    //     l: Vue.t("monitor.VIRTUAL_MACHINE_MONITOR"),
    //     admin: 1
    //   },
    //   {
    //     v: "cloudPhysicsMachine",
    //     l: Vue.t("monitor.CLOUD_PHYSICS_MACHINE"),
    //     admin: 1
    //   },
    //   { v: "rabbitMq", l: Vue.t("monitor.RABBIT_MQ_CLUSTER") },
    //   { v: "mySql", l: Vue.t("monitor.MY_SQL") },
    //   { v: "incloudStorage", l: Vue.t("monitor.INCLOUD_STORAGE") },
    //   { v: "openstackApi", l: Vue.t("monitor.OPENSTACK_API_STATUS") }
    // ];
    // if (Vue.roleType == "2") {
    //   tabs = tabs.filter(v => v.admin);
    // }
    return {
      isCN: String(Vue.config.lang) === 'zh-cn',
      tabs: [],
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
  mounted() {
    this.getTabData();
  },
  methods: {
    async getTabData() {
      let url = "api/pluto/v1/classes/rc/monitor";
      let r = await this.$ajax({
          type: 'get',
          url: `${url}`,
          data: {
            role_type: Vue.roleType
          }
        }).catch(v => { });
      let data = r.data || {};
      data = data.filter(v => { // 此页面过滤掉集中式路由，在网络-路由页面单独显示
        return v.id !== "router";
      });

      let n = {
        hs: 'host',
        vm: 'virtualMachine',
        cpm: 'cloudPhysicsMachine',
        rmq: 'rabbitMq',
        mysql: 'mySql',
        incloudstorage: 'incloudStorage',
        openstackAPI: 'openstackApi',
        g2: 'g2Storage',
        router: 'router'
      }
      this.tabs = data.map(v => {
        return {...v, name: n[v.id], label: this.isCN ? v.name_cn: v.name_en};
      });
    },
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
.resource-monitor {
}
.resource-monitor >>> .monitor .content {
  overflow: hidden;
}
</style> 
