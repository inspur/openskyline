<template>
  <vm-log :instanceId="data.instanceID" :instanceStatus="data.InstanceStatus"></vm-log>
</template>
<script>
import VmLog from "views/calculate-storage/instance/VmLog.vue";
export default {
  name: "Log",
  components: { VmLog },
  props: ["data"],
  data() {
    return {};
  },
  mounted() {},
  watch: {},
  methods: {}
};
</script>
<style scoped>
</style>
