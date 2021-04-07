<template>
  <vm-performance :instanceId="data.instanceID"></vm-performance>
</template>
<script>
import VmPerformance from "views/calculate-storage/instance/VmPerformance.vue";
export default {
  name: "Performance",
  components: { VmPerformance },
  props: ["data"],
  watch: {},
  data() {
    return {};
  },
  mounted() {},
  beforeDestroy() {},
  methods: {}
};
</script>
