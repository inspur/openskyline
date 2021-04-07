<template>
  <div class="host-details" style="margin-top:0;">
    <icos-page-header :title="$t('base.DETAIL_PAGE')" :show-back="true" @back="pageHeaderBackHandle" :show-bottom-border="false" />
    <el-tabs class="type2" v-model="currentTab" @tab-click="tabClick" type="border-card">
      <el-tab-pane v-for="i in tabs" :key="i.v" :name="i.v" :label="i.l"></el-tab-pane>
    </el-tabs>

    <div class="host-details-content">
      <div v-if="currentTab==tabs[0].v">
        <profile :model="profileData"></profile>
        <file-system
          style="margin-top: 15px;"
          :hostName="hostName"
          :resourceId="resourceId"
          :centerId="centerId"
          type="cpms"
        ></file-system>
      </div>

      <warn-list
        v-if="currentTab==tabs[1].v"
        :hostName="hostName"
        :resourceId="resourceId"
        :centerId="centerId"
        machineType="cpms"
      ></warn-list>

      <charts
        v-if="currentTab==tabs[2].v"
        :hostName="hostName"
        :resourceId="resourceId"
        :uuid="uuid"
        :centerId="centerId"
      ></charts>
    </div>
  </div>
</template>
<script>
import Profile from "../common/Profile";
import FileSystem from "../common/FileSystem";
import WarnList from "../common/WarnList";
import Charts from "./chart/Chart";
export default {
  components: {
    Profile,
    FileSystem,
    WarnList,
    Charts
  },
  watch: {
    $route(to, from) {}
  },
  data() {
    let tabs = [
      { v: "profile", l: Vue.t("monitor.hostProfileAndFileSys") },
      { v: "alarmList", l: Vue.t("monitor.alarmList") },
      { v: "sysRunStatus", l: Vue.t("monitor.sysRunStatus") }
    ];
    let uuid = this.$route.params.resourceId || "";
    uuid = uuid.replace("cpm_", "");
    return {
      tabs: tabs,
      currentTab: tabs[0]["v"],
      dark: Vue.cookie.get("theme") + "" == "dark",
      name: this.$route.params.name,
      hostName: this.$route.params.hostName,
      centerId: this.$route.params.centerId || "",
      resourceId: this.$route.params.resourceId,
      uuid: uuid,
      profileData: [
        //初始化先赋予这些值，是为了让vue先渲染出来一些内容，要不然等接口返回数据再渲染，就会出现元素在一开始的时候没有高度，影响用户体验
        { name: Vue.t("base.name"), value: "" },
        { name: Vue.t("base.startMacTime"), value: "" },
        {
          name: Vue.t("base.ipAddress"),
          value: ""
        }
      ]
    };
  },
  mounted() {
    this.getProfileData();
  },
  methods: {
    pageHeaderBackHandle(v) {
      let route = this.$route || {};
      let matched = route.matched || [];
      let p = matched[matched.length - 1].parent || {};
      this.$router.push({ path: p.path });
    },
    getProfileData(v) {
      let me = this;
      me.loading = true;
      me.resourceId = me.resourceId || "";
      let uuid = me.resourceId.replace("cpm_", "");

      me.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: me.centerId
        },
        url: "api/pluto/v1/monitor/cpms/" + uuid + "/info",
        successFun(data) {
          me.loading = false;
          let o = data || {};

          function f(v) {
            if (v === undefined || v === null || Number.isNaN(v) || v === "") {
              return null;
            }
            let time = v;
            let s = "";
            if (time > 24 * 3600) {
              let n = parseInt(time / (24 * 3600));
              s += n + Vue.t("monitor.days");
              time = time - n * 24 * 3600;
            }
            if (time > 60 * 60) {
              let m = parseInt(time / (60 * 60));
              s += m + Vue.t("monitor.hours");
              time = time - m * 60 * 60;
            }
            if (time > 60) {
              let k = parseInt(time / 60);
              s += k + Vue.t("monitor.minutes");
              time = time - k * 60;
            }
            return (s += time + Vue.t("monitor.seconds"));
          }

          let a = me.profileData;
          let i = 0;
          a[i++].value = me.name;
          a[i++].value = f(parseInt(o["uptime"]));
          a[i++].value = o["ip"] ? o["ip"].join(" ") : null;
        }
      });
    },
    tabClick(v) {}
  }
};
</script>
<style scoped>
.sys-run-monitor .el-collapse-item__wrap {
  overflow: visible;
}
.host-details-content {
  padding: 15px 0;
}
</style>
