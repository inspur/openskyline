<template>
  <div v-loading="loading">
    <el-tabs
      v-if="tabs.length>1"
      class="type2"
      v-model="currentTab"
      @tab-click="tabClick"
      type="border-card"
    >
      <el-tab-pane v-for="i in tabs" :key="i.id" :name="i.name" :label="i.name"></el-tab-pane>
    </el-tabs>

    <div class="details" style="margin-top:0;">
      <el-collapse v-model="activeNames">
        <el-collapse-item :title="$t('monitor.clusterOverview')" name="1" style="text-align: left;">
          <profile :model="profileData"></profile>
        </el-collapse-item>
        <el-collapse-item :title="$t('monitor.alarmList')" name="2" style="text-align: left;">
          <warn-list ref="warnList" :resourceId="resourceID" :getTableDataAsync="true"></warn-list>
        </el-collapse-item>
        <el-collapse-item :title="$t('monitor.sysRunStatus')" name="3" style="text-align: left;">
          <charts ref="charts"></charts>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script>
import Profile from "../common/Profile";
import WarnList from "../common/WarnList";
import Charts from "./chart/Chart";
// import rabbitMq from "./test.json"; //test

export default {
  components: { Profile, WarnList, Charts },
  name: "",
  watch: {
    $route(to, from) {}
  },
  data() {
    return {
      loading: 0,
      tabs: [],
      currentTab: "",
      activeNames: ["1", "2", "3"],
      collectHost: "",
      resourceID: "",
      profileData: [
        //初始化先赋予这些值，是为了让vue先渲染出来一些内容，要不然等接口返回数据再渲染，就会出现元素在一开始的时候没有高度，影响用户体验
        { name: Vue.t("base.name"), value: "" },
        { name: Vue.t("monitor.nodes"), value: "" },
        { name: Vue.t("base.address"), value: "" },
        { name: Vue.t("monitor.channels"), value: "" },
        { name: Vue.t("monitor.exchange"), value: "" },
        {
          name: Vue.t("monitor.connections"),
          value: ""
        },
        { name: Vue.t("monitor.consumers"), value: "" },
        { name: Vue.t("monitor.queues"), value: "" }
      ]
    };
  },
  mounted() {
    this.getTabsData();
  },
  methods: {
    getTabsData() {
      let me = this;
      let param = {
        subclass_id: "rmq",
        order_params: "desc::host_name:asc",
        delete_flag: "all"
      };
      me.$ajax({
        type: "get",
        url: "api/pluto/v1/monitor/resources?" + $.param(param),
        successFun(data) {
          // data = rabbitMq; //test
          let r = data.resources || {};
          let rl = r.resource_list || [];
          me.tabs = [];
          rl.forEach((v, i) => {
            me.tabs.push({
              id: v.resource_id,
              name: v.resource_alias,
              collectHost: v.collect_host,
              resourceID: v.resource_id
            });
          });

          let i = me.tabs[0];
          me.currentTab = i.name;
          if (i) {
            me.gotoTab(i);
          }
        },
        errFun() {}
      });
    },
    tabClick(v) {
      let i = this.tabs.filter(v_ => {
        return v_.name === v.name;
      })[0];
      if (i) {
        this.gotoTab(i);
      }
    },
    gotoTab(v = {}) {
      this.collectHost = v.collectHost;
      this.resourceID = v.resourceID;

      if (this.$refs["warnList"].getTableData) {
        this.$refs["warnList"].getTableData({ resourceID: v.resourceID });
      }
      if (this.$refs["charts"].loadData) {
        this.$refs["charts"].loadData({ collectHost: v.collectHost });
      }
      this.getProfileData(v);
    },
    getProfileData(v) {
      let me = this;
      this.$ajax({
        type: "get",
        url: "api/pluto/v1/monitor/rabbitmq/" + me.collectHost + "/info",
        successFun(data) {
          let o = data || {};

          let a = me.profileData;
          let i = 0;
          a[i++].value = o["rabbitmq_name"];
          a[i++].value = o["node_num"];
          a[i++].value = o["url"];
          a[i++].value = o["channels"];
          a[i++].value = o["exchanges"];
          a[i++].value = o["connections"];
          a[i++].value = o["consumers"];
          a[i++].value = o["queues"];
        },
        errFun() {}
      });
    }
  }
};
</script>

<style scoped>
</style>