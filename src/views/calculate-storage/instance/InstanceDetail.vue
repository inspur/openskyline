<template>
  <div>
    <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick">
      <el-tab-pane name="vm-detail"  :label="$t('base.outline')"></el-tab-pane>
      <el-tab-pane name="vm-per" v-if="service.pluto" :label="$t('base.performanceMonitoring')"></el-tab-pane>
      <el-tab-pane name="vm-log"  :label="$t('base.systemLog')"></el-tab-pane>
      <el-tab-pane v-if="from!=='balanceList'" name="vm-operatelog" :label="$t('base.operateRecord')"></el-tab-pane>
      <el-tab-pane name="vm-migrationhistory" v-if="roleType === '0'&&from!=='balanceList'" :label="$t('calcStorLang.VM_MIGRATION_HISTORY')"></el-tab-pane>
    </el-tabs>
    <vm-detail v-if="detailFlag" @refresh="onRefresh" :from='from' :instanceId="instanceId" :projectMaps="projectMaps" :userMaps="userMaps" :networkMaps="networkMaps"></vm-detail>
    <vm-performance v-if="perFlag" :instanceId="instanceId"></vm-performance>
    <vm-log v-if="logFlag" :instanceId="instanceId" :instanceStatus="instanceStatus"></vm-log>
    <vm-operate-log v-if="operateLog" :instanceId="instanceId" :userMaps="userMaps"></vm-operate-log>
    <vm-migration-history v-if="migrationHistory" :instanceId="instanceId"></vm-migration-history>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import VmDetail from './VmDetail';
import VmPerformance from './VmPerformance';
import VmLog from './VmLog';
import VmOperateLog from './VmOperateLog';
import VmMigrationHistory from './VmMigrationHistory';
export default {
  name: 'InstanceDetail',
  props: [
    'from',
    'instanceId',
    'projectMaps',
    'userMaps',
    'networkMaps',
    'instanceStatus'
  ],
  components: {
    VmDetail, VmLog, VmPerformance, VmOperateLog, VmMigrationHistory
  },
  data() {
    return {
      service:Vue.service,
      activeName: 'vm-detail',
      detailFlag: true,
      perFlag: false,
      logFlag: false,
      operateLog: false,
      migrationHistory: false,
      roleType: Vue.roleType + ''
    }
  },
  watch: {
  },
  computed: {
    },
  mounted() {
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'vm-detail':
          this.detailFlag = true;
          this.perFlag = false;
          this.logFlag = false;
          this.operateLog = false;
          this.migrationHistory = false;
          break
        case 'vm-per':
          this.detailFlag = false;
          this.perFlag = true;
          this.logFlag = false;
          this.operateLog = false;
          this.migrationHistory = false;
          break
        case 'vm-log':
          this.detailFlag = false;
          this.perFlag = false;
          this.logFlag = true;
          this.operateLog = false;
          this.migrationHistory = false;
          break
        case 'vm-operatelog':
          this.detailFlag = false;
          this.perFlag = false;
          this.logFlag = false;
          this.operateLog = true;
          this.migrationHistory = false;
          break
        case 'vm-migrationhistory':
          this.detailFlag = false;
          this.perFlag = false;
          this.logFlag = false;
          this.operateLog = false;
          this.migrationHistory = true;
          break
      }
    },
    onRefresh() {
      this.$emit('refresh');
    }
  }
}
</script>