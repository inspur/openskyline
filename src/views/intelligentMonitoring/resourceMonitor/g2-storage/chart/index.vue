<template>
  <div class="virtual-machine-chart">
    <icos-chart-time-select
      ref="timeSelect"
      :lastHalfHour="0"
      :last24Hour="1"
      :realTimeInterval="30*60*1000"
      :setTimeoutDelay="1000*60"
      @handler="timeSelectHandler"
    ></icos-chart-time-select>

    <el-row :gutter="0" class="chart">
      <el-col :span="24">
        <storage ref="storage" :data="data" :centerId="centerId" class="height100" />
      </el-col>
    </el-row>

    <el-row :gutter="0" class="chart">
      <el-col :span="24">
        <total-allocated-extent-capacity ref="totalAllocatedExtentCapacity" :data="data" :centerId="centerId" class="height100" />
      </el-col>
    </el-row>

    <el-row :gutter="0" class="chart">
      <el-col :span="24">
        <vdisk-MB ref="vdiskMB" :data="data" :centerId="centerId" class="height100" />
      </el-col>
    </el-row>

    <el-row :gutter="0" class="chart">
      <el-col :span="24">
        <vdisk-IO ref="vdiskIO" :data="data" :centerId="centerId" class="height100" />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { utils } from "../../../public/utils";
import IcosChartTimeSelect from "../../../public/components/IcosChartTimeSelect";
import IcosDashboard from "../../../public/components/IcosDashboard";
import storage from "./storage";
import totalAllocatedExtentCapacity from "./total-allocated-extent-capacity";
import vdiskMB from "./vdisk-mb";
import vdiskIO from "./vdisk-io";

let vm = null;
export default {
  components: {
    IcosChartTimeSelect,
    IcosDashboard,
    storage,
    totalAllocatedExtentCapacity,
    vdiskMB,
    vdiskIO
  },
  props: ["centerId", "resourceId", 'data'],
  data() {
    // let o1 = {
    //   percent: 0,
    //   title: {
    //     text: Vue.t("monitor.cpuUnNow")
    //   }
    // };
    // let o2 = {
    //   percent: 0,
    //   title: {
    //     text: Vue.t("monitor.memUnNow")
    //   },
    //   progressBar: {
    //     backgroundColor: "#1991eb",
    //     backgroundInnerColor: "#fa8c16"
    //   }
    // };
    return {
      // option1: $.extend(
      //   true,
      //   JSON.parse(JSON.stringify(utils.echartsOption)),
      //   o1
      // ),
      // option2: $.extend(
      //   true,
      //   JSON.parse(JSON.stringify(utils.echartsOption)),
      //   o2
      // ),
      timeTitle: "",
      timeout: 0
    };
  },
  watch: {},
  mounted() {
    // this.getData();
    vm.$refs.timeSelect.query({ type: Vue.t("base.last24Hour") });
  },
  beforeCreate() {
    vm = this;
  },
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    timeSelectHandler(v) {
      let search = `&starttime=${v.startTime}&endtime=${v.endTime}&is_history=${v.isHistory}`;
      let data = Object.assign({ search }, v);

      vm.$refs.storage.getData(data);
      vm.$refs.totalAllocatedExtentCapacity.getData(data);
      vm.$refs.vdiskMB.getData(data);
      vm.$refs.vdiskIO.getData(data);
    },
    // async getData() {
    //   let me = this;
    //   clearTimeout(this.timeout);
    //   let obj = await this.$ajax({
    //     type: "get",
    //     headers: {
    //       FORWARD_UNION: this.centerId
    //     },
    //     url: "api/pluto/v1/monitor/vms/" + this.resourceId
    //   });
    //   let p = obj.cpu_utilzation;
    //   if (!p || isNaN(p)) {
    //     p = 0;
    //   }
    //   me.option1.percent = p.toFixed(2);

    //   p = obj.mem_utilzation;
    //   if (!p || isNaN(p)) {
    //     p = 0;
    //   }
    //   me.option2.percent = p.toFixed(2);

    //   this.timeout = setTimeout(() => {
    //     me.getData();
    //   }, 1000 * 60);
    // },
    clearChart() {
      this.$refs.storage.clear();
      this.$refs.totalAllocatedExtentCapacity.clear();
      this.$refs.vdiskMB.clear();
      this.$refs.vdiskIO.clear();
    }
  }
};
</script>
<style scoped>
</style>
