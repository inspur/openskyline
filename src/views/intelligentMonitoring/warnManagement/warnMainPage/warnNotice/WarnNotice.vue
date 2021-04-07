<template>
  <div>
    <el-tabs :value="activeName" class="tabs-nopadding" @tab-click="onTabClick"  type="border-card">
      <el-tab-pane name="historyWarn" :label="$t('monitor.historyAlarm')">
        <history-warn :centerId="centerId" :resourceDetailId="resourceDetailId" :resourceDetailName="resourceDetailName" v-if="activeName=='historyWarn'"></history-warn>
      </el-tab-pane>
      <el-tab-pane name="historyNotice" :label="$t('monitor.historyNotice')">
        <history-notice :centerId="centerId" :resourceDetailId="resourceDetailId" v-if="activeName=='historyNotice'"></history-notice>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import HistoryWarn from './historyWarn/HistoryWarn'
import HistoryNotice from './historyNotice/HistoryNotice'
export default {
  props:["centerId", "resourceDetailId", "resourceDetailName"],
  data() {
    return {
      activeName: "historyWarn"
    }
  },
  mounted() {
  },
  methods: {
    onTabClick (tab) {
      this.activeName = tab.name;
    }
  },
  components: {
    HistoryWarn,
    HistoryNotice
  }
}
</script>
