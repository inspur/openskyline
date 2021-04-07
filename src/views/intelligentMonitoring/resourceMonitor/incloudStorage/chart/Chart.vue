<template>
  <div class="incloudstorage-chart">
    <icos-chart-time-select
      ref="timeSelect"
      :realTime="0"
      :last24Hour="1"
      :setTimeoutDelay="1000*60*5"
      @handler="timeSelectHandler"
    ></icos-chart-time-select>

    <storage-chart ref="storageChart" class="chart"></storage-chart>
    <system-delay ref="systemDelay" class="chart"></system-delay>
    <osd-chart ref="osdChart" class="chart"></osd-chart>
    <pool-chart ref="poolChart" class="chart pool-chart"></pool-chart>
  </div>
</template>
<script>
import IcosChartTimeSelect from "../../../public/components/IcosChartTimeSelect";
import StorageChart from "./StorageChart.vue";
import SystemDelay from "./SystemDelay.vue";
import OsdChart from "./OsdChart.vue";
import PoolChart from "./PoolChart.vue";
let vm = null;

export default {
  components: {
    IcosChartTimeSelect,
    StorageChart,
    SystemDelay,
    OsdChart,
    PoolChart
  },
  props: ["name"],
  data() {
    return {};
  },
  beforeDestroy() {},
  mounted() {
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
  methods: {
    timeSelectHandler(v) {
      let data = Object.assign({ name: vm.name }, v);
      vm.$refs.storageChart.getData(data);
      vm.$refs.systemDelay.getData(data);
      vm.$refs.osdChart.getData(data);
      vm.$refs.poolChart.getData(data);
    },
    clearChart() {
      vm.$refs.storageChart.clear();
      vm.$refs.systemDelay.clear();
      vm.$refs.osdChart.clear();
      vm.$refs.poolChart.clear();
    }
  }
};
</script>
<style scoped>
.incloudstorage-chart >>> .pool-chart {
  height: 500px;
}
</style>
