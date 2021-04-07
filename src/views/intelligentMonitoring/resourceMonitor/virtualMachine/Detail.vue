<template>
  <div>
    <icos-page-header :title="$t('base.DETAIL_PAGE')" :show-back="true" @back="pageHeaderBackHandle" :show-bottom-border="false" />
    <el-collapse v-model="activeNames">
      <el-collapse-item :title="$t('monitor.vmPrompt')" name="1" style="text-align: left;">
        <profile :model="profileData">
          <template v-slot:slot="{data}">
            <el-button
              v-if="data.button"
              type="text"
              size="small"
              @click="profileHandler({name:data.name,value:data.value})"
            >{{data.value}}</el-button>
          </template>
        </profile>
      </el-collapse-item>
      <el-collapse-item
        :title="$t('monitor.diskDevice')"
        name="2"
        style="text-align: left;"
        v-if="poc"
      >
        <disk-list :vmId="vmId" :centerId="centerId"></disk-list>
      </el-collapse-item>
      <el-collapse-item :title="$t('monitor.alarmList')" name="3" style="text-align: left;">
        <warn-list :hostName="hostName" :centerId="centerId" :resourceId="resourceId"></warn-list>
      </el-collapse-item>
      <el-collapse-item :title="$t('monitor.sysRunStatus')" name="4" style="text-align: left;">
        <charts :vmId="vmId" :centerId="centerId"></charts>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import Profile from "../common/Profile";
import DiskList from "./diskList/DiskList";
import Charts from "./chart/Chart";
import WarnList from "../common/WarnList";
import { mapGetters, mapMutations } from "vuex";
import { utils } from "../../public/utils";

export default {
  components: { Profile, DiskList, Charts, WarnList },
  data() {
    return {
      activeNames: ["1", "2", "3", "4"],
      vmId: this.$route.params.vmId,
      centerId: this.$route.params.centerId || "",
      hostName: this.$route.params.hostName,
      resourceId: this.$route.params.resourceId,
      pResId: this.$route.params.pResId,
      poc: Vue.poc,
      profileData: [
        //初始化先赋予这些值，是为了让vue先渲染出来一些内容，要不然等接口返回数据再渲染，就会出现元素在一开始的时候没有高度，影响用户体验
        { name: Vue.t("base.name"), value: "" },
        {
          name: "IP",
          value: ""
        },
        { name: Vue.t("monitor.diskNumber"), value: "" },
        {
          name: Vue.t("monitor.onhost"),
          value: "",
          button: Vue.roleType == '0' ? 1 : 0
        },
        { name: Vue.t("monitor.CPUNumber"), value: "" },
        {
          name: Vue.t("monitor.diskSize"),
          value: ""
        },
        { name: "ID", value: "" },
        { name: Vue.t("base.memory"), value: "" },
        {
          name: Vue.t("monitor.numberOfNetCard"),
          value: ""
        },
        {
          name: Vue.t("base.status"),
          value: ""
        }
      ],
      hostId: "",
      hostName2: ""
    };
  },
  mounted() {
    this.getProfileData();
  },
  methods: {
    pageHeaderBackHandle(v) {
      // let route = this.$route || {};
      // let matched = route.matched || [];
      // let p = matched[matched.length - 1].parent || {};
      // this.$router.push({ path: p.path });

      if (this.$route.query.from === 'host') {
        let path = `/intelligentMonitoring/resourceMonitor/host/hostDetail/${this.$route.query.collectHost}/${this.$route.query.resourceID}`;
        this.$router.push({
          path: path,
          query: { from: 'vm' }
        });
      } else {
        this.$router.go(-1);
      }
    },
    getProfileData(v) {
      let me = this;
      me.loading = true;
      this.$ajax({
        type: "get",
        url: "api/pluto/v1/monitor/vms/" + this.vmId + "/info",
        successFun(data) {
          me.loading = false;
          let o = data || {};

          me.hostId = o["host_id"];
          me.hostName2 = o["host_name"];

          let a = me.profileData;
          let i = 0;
          a[i++].value = o["instance_name"];
          a[i++].value = o["ip"] && o["ip"].join(",");
          a[i++].value = o["disknum"];
          a[i++].value = o["host_name"];
          a[i++].value = o["cpunum"];
          a[i++].value = [o["totaldisk"], "GB"];
          a[i++].value = o["instance_id"];
          a[i++].value = [o["totalmem"], "GB"];
          a[i++].value = o["netnum"];
          a[i++].value = utils.getVirtualMachineStatusItem(o["status"]);
        }
      });
    },
    profileHandler(v) {
      let path = `/intelligentMonitoring/resourceMonitor/host/hostDetail/${this.hostName2}/${v.value}`;
      this.$router.push({
        path: path
      });
    }
  }
};
</script>
