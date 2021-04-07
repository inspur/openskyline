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
        <cpu-chart
          ref="cpuChart"
          :chartData="{uuid:uuid,titleText:$t('base.utilization'),hostName:hostName,centerId:centerId}"
          class="height100"
        ></cpu-chart>
      </el-col>
    </el-row>

    <el-row :gutter="0" class="chart">
      <el-col :span="6">
        <icos-dashboard :option="option2"></icos-dashboard>
      </el-col>
      <el-col :span="18">
        <mem-chart
          ref="memChart"
          :chartData="{uuid:uuid,titleText:$t('base.memUtilization'),hostName:hostName,centerId:centerId}"
          class="height100"
        ></mem-chart>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :span="12">
        <net-chart
          ref="netChart"
          :chartData="{uuid:uuid,titleText:$t('monitor.nercardInAndOut'),hostName:hostName,centerId:centerId}"
          class="height100 chart"
        ></net-chart>
      </el-col>
      <el-col :span="12">
        <disk-chart
          ref="diskChart"
          :chartData="{uuid:uuid,titleText:$t('monitor.diskRAndW'),hostName:hostName,centerId:centerId}"
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
import CpuChart from "./Cpu";
import MemChart from "./Mem";
import NetChart from "./Net";
import DiskChart from "./Disk";

export default {
  components: {
    IcosChartTimeSelect,
    IcosDashboard,
    CpuChart,
    MemChart,
    NetChart,
    DiskChart
  },
  props: {
    hostName: String,
    resourceId: String,
    uuid: String,
    centerId: String
  },
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
      timeoutID: 0
    };
  },
  watch: {},
  mounted() {
    this.getData();
    this.$refs.timeSelect.query({ type: Vue.t("base.lastHalfHour") });
  },
  beforeCreate() {},
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
      let vm = this;
      let search = `&starttime=${v.startTime}&endtime=${v.endTime}&is_history=${v.isHistory}`;
      let data = Object.assign({ search }, v);

      vm.$refs.cpuChart.getData(data);
      vm.$refs.memChart.getData(data);
      vm.$refs.netChart.getData(data);
      vm.$refs.diskChart.getData(data);
    },
    getData() {
      let vm = this;
      clearTimeout(vm.timeoutID);
      vm.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: vm.centerId
        },
        url: "api/pluto/v1/monitor/cpms/" + vm.uuid,
        successFun(obj) {
          let p = obj.cpu_utilzation;
          if (!p || isNaN(p)) {
            p = 0;
          }
          vm.option1.percent = p.toFixed(2);

          p = obj.mem_utilzation;
          if (!p || isNaN(p)) {
            p = 0;
          }
          vm.option2.percent = p.toFixed(2);
        }
      });

      vm.timeoutID = setTimeout(() => {
        vm.getData();
      }, 1000 * 60);
    }
  }
};
</script>
<style scoped>
</style>
