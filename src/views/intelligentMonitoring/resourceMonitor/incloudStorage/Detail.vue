<template>
  <div>
    <icos-page-header :title="$t('base.DETAIL_PAGE')" :show-back="true" @back="pageHeaderBackHandle" :show-bottom-border="false" />
    <el-collapse v-model="activeNames">
      <el-collapse-item :title="$t('monitor.clusterOverview')" name="1" style="text-align: left;">
        <profile :model="profileData"></profile>
      </el-collapse-item>
      <el-collapse-item :title="$t('monitor.alarmList')" name="2" style="text-align: left;">
        <warn-list :resourceId="id"></warn-list>
      </el-collapse-item>
      <el-collapse-item :title="$t('monitor.sysRunStatus')" name="3" style="text-align: left;">
        <charts :name="name"></charts>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import Profile from "../common/Profile";
import WarnList from "../common/WarnList";
import Charts from "./chart/Chart";
export default {
  components: { Profile, WarnList, Charts },
  data() {
    return {
      activeNames: ["1", "2", "3"],
      name: this.$route.params.name,
      id: this.$route.params.id,
      profileData: [
        //初始化先赋予这些值，是为了让vue先渲染出来一些内容，要不然等接口返回数据再渲染，就会出现元素在一开始的时候没有高度，影响用户体验
        { name: Vue.t("base.name"), value: "" },
        {
          name: Vue.t("monitor.osdNumber"),
          value: ""
        },
        {
          name: Vue.t("monitor.numberOfInstance"),
          value: ""
        },
        {
          name: Vue.t("monitor.storagePools"),
          value: ""
        },
        {
          name: Vue.t("monitor.totalStorage"),
          value: ""
        },
        {
          name: Vue.t("monitor.usedAmount"),
          value: ""
        },
        {
          name: Vue.t("monitor.averageDelay"),
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
      this.$ajax({
        type: "get",
        url: "api/pluto/v1/monitor/sds/" + me.name + "/info",
        successFun(data) {
          me.loading = false;
          let o = data || {};

          function tf2(v) {
            if (v != undefined && v != null) {
              return parseFloat(v).toFixed(2);
            }
            return v;
          }

          let a = me.profileData;
          let i = 0;

          a[i++].value = o["ceph_name"];
          a[i++].value = o["osd_num"];
          a[i++].value = o["number"];
          a[i++].value = o["pools"];
          a[i++].value = [tf2(o["total_space"]), "GB"];
          a[i++].value = [tf2(o["total_used"]), "GB"];
          a[i++].value = [tf2(o["avg_latency"]), "ms"];
        }
      });
    }
  }
};
</script>
