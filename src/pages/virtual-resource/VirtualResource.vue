<template src="./virtualResource.html"></template>
<style src="../physical-resource/physicalResource.css"></style>
<script>
import * as utils from 'utils/index.js';
import vueLocal from "../../locale";
import IEcharts from 'vue-echarts-v3/src/full.vue';
import ResourceStatistics from './parts/ResourceStatistics.vue'

import VmState from './parts/VmState'
import NetworkIp from './parts/NetworkIp'
import VmApp from './parts/VmApp'
import TopoView from './parts/TopoView'
export default {
  data() {
    return {
    }
  },
  methods: {
  },
  components:{
    IEcharts,
    ResourceStatistics,
    VmState,
    NetworkIp,
    VmApp,
    TopoView
  }
};
</script>



