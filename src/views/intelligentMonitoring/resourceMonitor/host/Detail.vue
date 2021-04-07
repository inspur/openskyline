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
        ></file-system>
      </div>

      <service-list
        v-if="currentTab==tabs[1].v"
        ref="serviceList"
        :hostName="hostName"
        :centerId="centerId"
        :resourceId="resourceId"
      ></service-list>

      <virtual-machine-list
        v-if="currentTab==tabs[2].v"
        :hostName="hostName"
        :centerId="centerId"
        :resourceId="resourceId"
      ></virtual-machine-list>

      <warn-list
        v-if="currentTab==tabs[3].v"
        :hostName="hostName"
        :centerId="centerId"
        :resourceId="resourceId"
      ></warn-list>

      <charts v-if="currentTab==tabs[4].v" :hostName="hostName" :centerId="centerId"></charts>
    </div>
  </div>
</template>
<script>
import Profile from "../common/Profile";
import FileSystem from "../common/FileSystem";
import ServiceList from "./serviceList/ServiceList";
import VirtualMachineList from "./virtualMachineList/VirtualMachineList";
import WarnList from "../common/WarnList";
import Charts from "./chart/Chart";
export default {
  components: {
    Profile,
    FileSystem,
    ServiceList,
    VirtualMachineList,
    WarnList,
    Charts
  },
  watch: {
    $route(to, from) {}
  },
  data() {
    let tabs = [
      { v: "profile", l: Vue.t("monitor.hostProfileAndFileSys") },
      {
        v: "serviceList",
        l: Vue.t("monitor.serviceList")
      },
      { v: "vmList", l: Vue.t("calcStorLang.instList") },
      { v: "alarmList", l: Vue.t("monitor.alarmList") },
      { v: "sysRunStatus", l: Vue.t("monitor.sysRunStatus") }
    ];
    return {
      tabs: tabs,
      currentTab: tabs[0]["v"],
      dark: Vue.cookie.get("theme") + "" == "dark",
      hostName: this.$route.params.hostName,
      centerId: this.$route.params.centerId || "",
      resourceId: this.$route.params.resourceId,
      profileData: [
        //初始化先赋予这些值，是为了让vue先渲染出来一些内容，要不然等接口返回数据再渲染，就会出现元素在一开始的时候没有高度，影响用户体验
        { name: Vue.t("base.name"), value: "" },
        { name: Vue.t("base.startMacTime"), value: "" },
        {
          name: Vue.t("monitor.diskNumber"),
          value: ""
        },
        {
          name: Vue.t("base.ipAddress"),
          value: ""
        },
        {
          name: Vue.t("monitor.CPUNumber"),
          value: ""
        },
        {
          name: Vue.t("monitor.diskTotalSize"),
          value: ""
        },
        {
          name: Vue.t("monitor.numberOfNetCard"),
          value: ""
        },
        {
          name: Vue.t("monitor.memorySize"),
          value: ""
        }
      ]
    };
  },
  mounted() {
    this.getProfileData();
    if (this.$route.query.from === 'vm') {
      this.currentTab = this.tabs[2]["v"];
    }
  },
  methods: {
    pageHeaderBackHandle(v) {
      if (this.$route.query.from === 'vm') {
        let route = this.$route || {};
        let matched = route.matched || [];
        let p = matched[matched.length - 1].parent || {};
        this.$router.push({ path: p.path });
      } else {
        this.$router.go(-1);
      }
    },
    getProfileData(v) {
      let me = this;
      me.loading = true;

      this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/monitor/hosts/" + this.hostName + "/info",
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
          a[i++].value = me.hostName;
          a[i++].value = f(parseInt(o["uptime"]));
          a[i++].value = o["disknum"];
          a[i++].value = o["ip"] ? o["ip"].join(" ") : null;
          a[i++].value = o["cpunum"];
          a[i++].value = [o["totaldisk"], "GB"];
          a[i++].value = o["netnum"];
          a[i++].value = [o["totalmem"], "GB"];
          if (+o["gpunum"] > 0) {
            a[i++] = {name: 'GPU个数', value: o["gpunum"]};
            a[i++] = {name: 'GPU内存', value: [o["gpumemory"], "GB"]};
          }
        }
      });
    },
    tabClick(v) {
      if (v.name === "serviceList") {
        let sl = this.$refs.serviceList;
        sl && sl["initStatus"] && sl["initStatus"]();
      }
    }
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
