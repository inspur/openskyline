<template>
  <div class="virtual-machine-chart">
    <icos-chart-time-select
      ref="timeSelect"
      :lastHalfHour="1"
      :last24Hour="1"
      :realTimeInterval="30*60*1000"
      :setTimeoutDelay="1000*60"
      @handler="timeSelectHandler"
    ></icos-chart-time-select>

    <el-row :gutter="0" class="chart">
      <el-col :span="6">
        <icos-dashboard :option="option1"></icos-dashboard>
      </el-col>
      <el-col :span="18">
        <cpu-his-chart ref="cpuChart" :vmId="vmId" :centerId="centerId" class="height100" />
      </el-col>
    </el-row>
    <el-row :gutter="0" class="chart">
      <el-col :span="6">
        <icos-dashboard :option="option2"></icos-dashboard>
      </el-col>
      <el-col :span="18">
        <mem-his-chart ref="memChart" :vmId="vmId" :centerId="centerId" class="height100" />
      </el-col>
    </el-row>

    <net-chart :vmId="vmId" ref="diskChart" :centerId="centerId" class="chart"></net-chart>
    <disk-chart :vmId="vmId" ref="netChart" :centerId="centerId" class="chart"></disk-chart>
    <disk-info-chart :vmId="vmId" ref="diskInfoChart" class="chart"></disk-info-chart>
  </div>
</template>
<script>
import { utils } from "../../../public/utils";
import IcosChartTimeSelect from "../../../public/components/IcosChartTimeSelect";
import IcosDashboard from "../../../public/components/IcosDashboard";
import CpuHisChart from "./CpuHisChart";
import MemHisChart from "./MemHisChart";
import DiskChart from "./DiskChart";
import NetChart from "./NetChart";
import DiskInfoChart from "./DiskInfoChart";
let vm = null;
export default {
  components: {
    IcosChartTimeSelect,
    IcosDashboard,
    CpuHisChart,
    MemHisChart,
    DiskChart,
    NetChart,
    DiskInfoChart
  },
  props: ["centerId", "vmId"],
  data() {
    let o1 = {
      percent: 0,
      title: {
        text: Vue.t("monitor.cpuUnNow")
      }
    };
    let o2 = {
      percent: 0,
      title: {
        text: Vue.t("monitor.memUnNow")
      },
      progressBar: {
        backgroundColor: "#1991eb",
        backgroundInnerColor: "#fa8c16"
      }
    };
    return {
      option1: $.extend(
        true,
        JSON.parse(JSON.stringify(utils.echartsOption)),
        o1
      ),
      option2: $.extend(
        true,
        JSON.parse(JSON.stringify(utils.echartsOption)),
        o2
      ),
      timeTitle: "",
      timeout: 0
    };
  },
  watch: {},
  mounted() {
    this.getData();
    vm.$refs.timeSelect.query({ type: Vue.t("base.lastHalfHour") });
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

      vm.$refs.cpuChart.getData(data);
      vm.$refs.memChart.getData(data);
      vm.$refs.netChart.getData(data);
      vm.$refs.diskChart.getData(data);
      vm.$refs.diskInfoChart.getData(data);
    },
    async getData() {
      let me = this;
      clearTimeout(this.timeout);
      let obj = await this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/monitor/vms/" + this.vmId
      });
      let p = obj.cpu_utilzation;
      if (!p || isNaN(p)) {
        p = 0;
      }
      me.option1.percent = p.toFixed(2);

      p = obj.mem_utilzation;
      if (!p || isNaN(p)) {
        p = 0;
      }
      me.option2.percent = p.toFixed(2);

      this.timeout = setTimeout(() => {
        me.getData();
      }, 1000 * 60);
    },
    clearChart() {
      this.$refs.cpuChart.clear();
      this.$refs.memChart.clear();
      this.$refs.netChart.clear();
      this.$refs.diskChart.clear();
      this.$refs.diskInfoChart.clear();
    }
  }
};
</script>
<style scoped>
</style>
