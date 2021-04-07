<template>
  <div class="mysql-chart">
    <icos-chart-time-select
      ref="timeSelect"
      :realTime="0"
      :last24Hour="1"
      :setTimeoutDelay="1000*60*5"
      @handler="timeSelectHandler"
    ></icos-chart-time-select>

    <rate-chart ref="rateChart" class="chart"></rate-chart>
    <mem-chart ref="memChart" class="chart"></mem-chart>
    <number-chart ref="numberChart" class="chart"></number-chart>
  </div>
</template>
<script>
import IcosChartTimeSelect from "../../../public/components/IcosChartTimeSelect";
import RateChart from "./RateChart";
import MemChart from "./MemChart";
import NumberChart from "./NumberChart";
import { utils } from "../../../public/utils";
let vm = null;
export default {
  components: { IcosChartTimeSelect, RateChart, MemChart, NumberChart },
  props: [],
  data() {
    return {
      collectHost: ""
    };
  },
  beforeDestroy() {},
  mounted() {},
  beforeCreate() {
    vm = this;
  },
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  methods: {
    timeSelectHandler(v) {
      let data = Object.assign({ collectHost: vm.collectHost }, v);
      vm.$refs.rateChart.getData(data);
      vm.$refs.memChart.getData(data);
      vm.$refs.numberChart.getData(data);
    },
    loadData(v = {}) {
      if (v.collectHost) {
        vm.collectHost = v.collectHost;
      }
      vm.$refs.timeSelect.query({ type: Vue.t("base.last24Hour") });
    },
    clearChart() {
      vm.$refs.rateChart.clear();
      vm.$refs.memChart.clear();
      vm.$refs.numberChart.clear();
    }
  }
};
</script>
<style scoped>
</style>
