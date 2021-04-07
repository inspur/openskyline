<template>
  <div class="rabbit-mq">
    <icos-chart-time-select
      ref="timeSelect"
      :realTime="0"
      :last24Hour="1"
      :setTimeoutDelay="1000*60*5"
      @handler="timeSelectHandler"
    ></icos-chart-time-select>

    <global-count ref="globalCount" class="chart"></global-count>
    <mes-rate ref="mesRate" class="chart"></mes-rate>
    <node-resource ref="nodeResource" class="chart"></node-resource>
    <queue-message ref="queueMessage" class="chart"></queue-message>
  </div>
</template>
<script>
import IcosChartTimeSelect from "../../../public/components/IcosChartTimeSelect";
import GlobalCount from "./GlobalCount.vue";
import MesRate from "./MesRate";
import NodeResource from "./NodeResource";
import QueueMessage from "./QueueMessage.vue";
import { utils } from "../../../public/utils";
let vm = null;
export default {
  components: {
    IcosChartTimeSelect,
    GlobalCount,
    MesRate,
    NodeResource,
    QueueMessage
  },
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
      vm.$refs.globalCount.getData(data);
      vm.$refs.mesRate.getData(data);
      vm.$refs.nodeResource.getData(data);
      vm.$refs.queueMessage.getData(data);
    },
    loadData(v = {}) {
      if (v.collectHost) {
        vm.collectHost = v.collectHost;
      }
      vm.$refs.timeSelect.query({ type: Vue.t("base.last24Hour") });
    },
    clearChart() {
      this.$refs.globalCount.clear();
      this.$refs.mesRate.clear();
      this.$refs.nodeResource.clear();
      this.$refs.queueMessage.clear();
    }
  }
};
</script>
<style scoped>
</style>
