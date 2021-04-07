<template>
  <div>
    <el-collapse v-model="activeNames">
      <el-collapse-item :title="$t('monitor.dockerProfile')" name="1" style="text-align: left;">
        <profile :model="profileData"></profile>
      </el-collapse-item>
      <el-collapse-item :title="$t('monitor.sysRunStatus')" name="2" style="text-align: left;">
        <charts :dockerId="dockerId" :hostName="hostName"></charts>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import Profile from "../../common/Profile";
import Charts from "./chart/Chart";
export default {
  components: { Profile, Charts },
  mounted() {
    this.getProfileData();
    this.dockerName = "";
  },
  props: {
    dockerId: String,
    hostName: String
  },
  data() {
    return {
      activeNames: ["1", "2"],
      profileData: [
        //初始化先赋予这些值，是为了让vue先渲染出来一些内容，要不然等接口返回数据再渲染，就会出现元素在一开始的时候没有高度，影响用户体验
        { name: Vue.t("base.name"), value: "" },
        { name: Vue.t("base.status"), value: "" },
        {
          name: Vue.t("monitor.memUsage"),
          value: ""
        },
        {
          name: Vue.t("base.host"),
          value: ""
        }
      ]
    };
  },
  methods: {
    getProfileData(v) {
      let me = this;

      me.$ajax({
        type: "get",
        url: `api/pluto/v1/monitor/docker/${me.hostName}/${me.dockerId}/info`,
        successFun(data) {
          let o = data || {};

          function tf2(v) {
            if (v != undefined && v != null) {
              return parseFloat(v).toFixed(2);
            }
            return v;
          }

          let a = me.profileData;
          let i = 0;
          a[i++].value = o["name"];
          a[i++].value =
            o.status == 1 ? Vue.t("base.normal") : Vue.t("base.abnormal");
          a[i++].value = [tf2(o.mem_used), "MB"];
          a[i++].value = o["host"];
        }
      });
    }
  }
};
</script>
