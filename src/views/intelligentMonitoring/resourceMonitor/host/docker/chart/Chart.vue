<template>
  <div class="docker-chart">
    <icos-chart-time-select
      ref="timeSelect"
      @handler="timeSelectHandler"
      :realTime="0"
      :last24Hour="1"
      :setTimeoutDelay="1000*60"
    ></icos-chart-time-select>

    <el-row :gutter="0" class="chart">
      <el-col :span="6">
        <cpu-now-chart :dockerId="dockerId" :hostName="hostName" class="height100"></cpu-now-chart>
      </el-col>
      <el-col :span="18">
        <cpu-chart ref="cpuChart" :hostName="hostName" :dockerId="dockerId" class="height100"></cpu-chart>
      </el-col>
    </el-row>

    <el-row :gutter="0" class="chart">
      <el-col :span="6">
        <mem-now-chart :dockerId="dockerId" :hostName="hostName" class="height100"></mem-now-chart>
      </el-col>
      <el-col :span="18">
        <mem-chart ref="memChart" :hostName="hostName" :dockerId="dockerId" class="height100"></mem-chart>
      </el-col>
    </el-row>

    <disk-rate ref="diskRate" v-if="$archIs('x86')" :hostName="hostName" :dockerId="dockerId" class="chart"></disk-rate>
  </div>
</template>
<script>
import { utils } from "../../../../public/utils";
import IcosChartTimeSelect from "../../../../public/components/IcosChartTimeSelect";
import CpuNowChart from "./CpuNowChart.vue";
import MemNowChart from "./MemNowChart.vue";
import CpuChart from "./CpuChart.vue";
import MemChart from "./MemChart.vue";
import DiskRate from "./DiskRate.vue";
export default {
  components: {
    IcosChartTimeSelect,
    CpuNowChart,
    MemNowChart,
    CpuChart,
    MemChart,
    DiskRate
  },
  props: ["hostName", "dockerId"],
  data() {
    return {};
  },
  watch: {},
  mounted() {
    this.$refs.timeSelect.query({ type: Vue.t("base.last24Hour") });
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  beforeDestroy() {},
  methods: {
    timeSelectHandler(v) {
      let data = Object.assign({}, v);

      this.$refs.cpuChart.getData(data);
      this.$refs.memChart.getData(data);
      this.$refs.diskRate.getData(data);
    },
    clearChart() {
      this.$refs.cpuChart.clear();
      this.$refs.memChart.clear();
      this.$refs.diskRate.clear();
    }
  }
};
</script>
<style scoped>
</style>