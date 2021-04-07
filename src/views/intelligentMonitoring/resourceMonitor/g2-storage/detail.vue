<template>
  <div>
    <icos-page-header :title="$t('base.DETAIL_PAGE')" :show-back="true" @back="pageHeaderBackHandle" :show-bottom-border="false" />
    <el-collapse v-model="activeNames">
      <el-collapse-item :title="$t('monitor.STORAGE_OVERVIEW')" name="1" style="text-align: left;">
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
        <charts :vmId="vmId" :centerId="centerId" :resourceId="resourceId" :data='$route.params'></charts>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import Profile from "../common/Profile";
import DiskList from "./disk-list/index";
import Charts from "./chart/index";
import WarnList from "../common/WarnList";
import { mapGetters, mapMutations } from "vuex";
import { utils } from "../../public/utils";

export default {
  components: { Profile, DiskList, Charts, WarnList },
  data() {
    let isCN = Vue.config.lang === "zh-cn";
    return {
      isCN: isCN,
      activeNames: ["1", "2", "3", "4"],
      vmId: this.$route.params.vmId,
      centerId: this.$route.params.centerId || "",
      hostName: this.$route.params.hostName,
      resourceId: this.$route.params.resourceID,
      pResId: this.$route.params.pResId,
      poc: Vue.poc,
      profileData: [// 主机ip，G2存储名，存储总量（GB），已用容量（GB）
        //初始化先赋予这些值，是为了让vue先渲染出来一些内容，要不然等接口返回数据再渲染，就会出现元素在一开始的时候没有高度，影响用户体验
        // { name: isCN ? '主机ip' : 'host ip', value: "" },
        {
          name: isCN ? 'G2存储名' : 'G2 storage name',
          value: ""
        },
        { name: Vue.t("monitor.totalStorage"), value: "" },
        {
          name: isCN ? '已用容量' : 'used capacity',
          value: ""
        }
      ]
    };
  },
  mounted() {
    this.getProfileData();
    console.log(this.$route.params, '--0022');
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
      this.$ajax({
        type: "get",
        url: "api/pluto/v1/monitor/g2/info",
        data: {
          resource_id: this.$route.params.resourceID
        },
        successFun(data) {
          me.loading = false;
          let o = data || {};
          me.hostName2 = o["host_name"];

          let a = me.profileData;
          let i = 0;
          // a[i++].value = o["host_ip"];
          a[i++].value = o["g2_name"];
          a[i++].value = [o["total_mdisk_capacity"], "GB"];
          a[i++].value = [o["total_used_capacity"], "GB"];
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
