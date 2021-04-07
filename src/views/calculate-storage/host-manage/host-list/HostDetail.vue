<template>
  <div>
    <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick">
        <el-tab-pane name="host-outline"  :label="$t('base.outline')"></el-tab-pane>
        <el-tab-pane name="instance-list"  :label="$t('calcStorLang.instance')"></el-tab-pane>
        <el-tab-pane name="performance-monitoring" v-if="service.pluto" :label="$t('base.performanceMonitoring')"></el-tab-pane>
        <!-- <el-tab-pane name="host-warning" label="告警"></el-tab-pane> -->
    </el-tabs >
    <host-outline v-if="outlineFlag" :hostname="hostname" :info="info"></host-outline>
    <instance-list v-if="vmFlag" :hostname="hostname"></instance-list>
    <performance-monitoring v-if="monitoringFlag" :hostname="hostname"></performance-monitoring>
    <host-warning v-if="warningFlag"></host-warning>
  </div>
</template>
<script>
import HostOutline from './HostOutline';
import InstanceList from './InstanceList';
import PerformanceMonitoring from './PerformanceMonitoring';
import HostWarning from './HostWarning';
export default {
  name: 'hostDetail',
  props:{
    info: {
      type: Object,
      default: function () {
        return {}
      }
    },
    hostname:{
      type:String
    }
  },
  components: {
    HostOutline,
    InstanceList,
    PerformanceMonitoring,
    HostWarning
  },
  data() {
    return {
      service:Vue.service,
      activeName: 'host-outline',
      outlineFlag: true,
      vmFlag: false,
      monitoringFlag: false,
      warningFlag: false
    }
  },
  mounted() {
  },
  methods: {
      onTabClick (tab) {
      switch (tab.name) {
        case 'host-outline':
          this.outlineFlag = true;
          this.vmFlag = false;
          this.monitoringFlag = false;
          this.warningFlag = false;
          break
        case 'instance-list':
          this.outlineFlag = false;
          this.vmFlag = true;
          this.monitoringFlag = false;
          this.warningFlag = false;
          break
        case 'performance-monitoring':
          this.outlineFlag = false;
          this.vmFlag = false;
          this.monitoringFlag = true;
          this.warningFlag = false;
          break
        case 'host-warning':
          this.outlineFlag = false;
          this.vmFlag = false;
          this.monitoringFlag = false;
          this.warningFlag = true;
          break
        default:
      }
    }
  }
}
</script>