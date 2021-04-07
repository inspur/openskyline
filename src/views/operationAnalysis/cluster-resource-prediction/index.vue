<template>
  <div class="trend-predict">
    <icos-page-header :title="$t('operationAnalysis.CLUSTER_RESOURCE_PREDICTION')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <el-collapse :value="['1', '2', '3']">
      <el-collapse-item :title="$t('operationAnalysis.PREDICT_CPU')" name="1" class="isolation-belt">
        <cpu-trend ref="cpu"/>
      </el-collapse-item>
      <el-collapse-item :title="$t('operationAnalysis.PREDICT_MEM')" name="2" class="isolation-belt">
        <mem-trend ref="mem"/>
      </el-collapse-item>
      <el-collapse-item :title="$t('operationAnalysis.PREDICT_DISK')" name="3" class="isolation-belt">
        <disk-trend ref="disk"/>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import CPUTrend from './cpu-trend'
import MemTrend from './mem-trend'
import DiskTrend from './disk-trend'
export default {
  name: 'trend',
  components: { 'cpu-trend': CPUTrend, MemTrend, DiskTrend },
  data() {
    return {
      foo: 'bar'
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {});
  },
  beforeRouteUpdate(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  }
}
</script>

<style scoped>
.trend-predict >>> .el-collapse-item__header {
  background-color: white;
}
.icos-dark >>> .el-collapse-item__header {
  background-color: unset;
}

.trend-predict >>> .predict-trend {
  display: flex;
}
.trend-predict >>> .predict-trend .chart {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
  overflow: hidden;
}
.trend-predict >>> .predict-trend .rest-time-wrapper {
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 280px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
.trend-predict >>> .predict-trend .rest-time-wrapper .title {
  text-align: center;
  font-size: 18px;
}
.trend-predict >>> .predict-trend .rest-time-wrapper .value {
  margin: 75px 0 0 0;
  text-align: center;
  font-size: 44px;
}
</style>>
