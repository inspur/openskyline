<template>
  <div class="host-chart">
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
        <cpu-chart ref="cpuChart" :hostName="hostName" :centerId="centerId" class="height100"></cpu-chart>
      </el-col>
    </el-row>

    <el-row :gutter="0" class="chart">
      <el-col :span="6">
        <icos-dashboard :option="option2"></icos-dashboard>
      </el-col>
      <el-col :span="18">
        <mem-chart ref="memChart" :hostName="hostName" :centerId="centerId" class="height100"></mem-chart>
      </el-col>
    </el-row>

    <el-row :gutter="0" class="chart">
      <el-col :span="6">
        <icos-dashboard :option="option3"></icos-dashboard>
      </el-col>
      <el-col :span="18">
        <swap-chart ref="swapChart" :hostName="hostName" :centerId="centerId" class="height100"></swap-chart>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :span="12">
        <net-chart ref="netChart" :hostName="hostName" :centerId="centerId" class="height100 chart"></net-chart>
      </el-col>
      <el-col :span="12">
        <disk-chart
          ref="diskChart"
          :hostName="hostName"
          :centerId="centerId"
          class="height100 chart"
        ></disk-chart>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { utils } from "../../../public/utils";
import IcosChartTimeSelect from "../../../public/components/IcosChartTimeSelect";
import IcosDashboard from "../../../public/components/IcosDashboard";
import CpuChart from "./CpuChart";
import MemChart from "./MemChart";
import SwapChart from "./SwapChart";
import NetChart from "./NetChart";
import DiskChart from "./DiskChart";
let vm = null;

export default {
  components: {
    IcosChartTimeSelect,
    IcosDashboard,
    CpuChart,
    MemChart,
    SwapChart,
    NetChart,
    DiskChart
  },
  props: ["hostName", "centerId"],
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
    let o3 = {
      percent: 0,
      title: {
        text: Vue.t("monitor.exchangeParUnNow")
      },
      progressBar: {
        backgroundColor: "#1991eb",
        backgroundInnerColor: "#f5222d"
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
      option3: $.extend(
        true,
        JSON.parse(JSON.stringify(utils.echartsOption)),
        o3
      ),
      timeoutID: 0
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
    clearTimeout(this.timeoutID);
  },
  methods: {
    timeSelectHandler(v) {
      let search = `&starttime=${v.startTime}&endtime=${v.endTime}&is_history=${v.isHistory}`;
      let data = Object.assign({ search }, v);

      vm.$refs.cpuChart.getData(data);
      vm.$refs.memChart.getData(data);
      vm.$refs.netChart.getData(data);
      vm.$refs.diskChart.getData(data);
      vm.$refs.swapChart.getData(data);
    },
    getData() {
      let me = this;
      clearTimeout(this.timeoutID);
      this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/monitor/hosts/" + this.hostName,
        successFun(obj) {
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
        }
      });
      this.$ajax({
        type: "post",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            fields: ["last(used_percent)"],
            alias_fields: ["used_percent"],
            table: "swap",
            is_list: "0",
            name: "swap",
            filters: [{ field: "host", operate: "=", value: this.hostName }]
          }
        }),
        successFun(rtn = {}) {
          let p = rtn.swap ? rtn.swap.used_percent : 0;
          if (!p || isNaN(p)) {
            p = 0;
          }
          me.option3.percent = p.toFixed(2);
        }
      });

      this.timeoutID = setTimeout(() => {
        me.getData();
      }, 1000 * 60);
    },
    clearChart() {
      this.$refs.cpuChart.clear();
      this.$refs.memChart.clear();
      this.$refs.swapChart.clear();
      this.$refs.netChart.clear();
      this.$refs.diskChart.clear();
    }
  }
};
</script>
<style scoped>
</style>
