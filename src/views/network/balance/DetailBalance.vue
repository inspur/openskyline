<template>
  <div>
    <icos-page-header :title="$t('network.balanceDetail')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
    <div class="network-detail">
    <el-tabs class="tabs-nopadding" @tab-click="onTabClick" v-model="activeName" type="border-card">
      <el-tab-pane :label="$t('network.balancer')" name="balanceDetail">
        <detail-balance ref="detail-balance"></detail-balance>
      </el-tab-pane>
      <el-tab-pane :label="$t('network.monitor')" name="monitor">
        <monitor @goToPool="goToPool" :refresh-count="refreshCount" :monitorIdFromPool="monitorId" :poolJumpFlag="poolJumpFlag"></monitor>
      </el-tab-pane>
      <el-tab-pane :label="$t('network.respool')" name="respool">
        <pool :poolId="poolId" :refresh-count="refreshCount" :jumpflag="jumpflag" @goToMonitor="goToMonitor"></pool>
      </el-tab-pane>
    </el-tabs>
    </div>
  </div>
</template>
<script type="text/javascript">
import DetailBalance from "./detailbalance/DetailBalance";
import Monitor from "./detailbalance/Monitor";
import Pool from "./detailbalance/Pool";
export default {
  data() {
    return {
      activeName: "balanceDetail",
      balanceInfo: null,
      poolId: "",
      monitorId: "",
      refreshCount: 0,
      jumpflag: false,
      poolJumpFlag: false
    }
  },
  components: {
    DetailBalance,
    Monitor,
    Pool
  },
  methods: {
    onTabClick (tab) {
      this.jumpflag = false;
      this.poolJumpFlag = false;
      this.refreshCount ++;

      this.$refs['detail-balance'].detailFlag = false;
    },
    goToMonitor(parm) {
      let [val, poolJumpFlag] = parm;
      this.activeName = "monitor";
      this.monitorId = val;
      this.refreshCount ++;
      this.poolJumpFlag = poolJumpFlag
    },
    goToPool(parm) {
      let [val, jumpflag] = parm;
      this.activeName = "respool";
      this.poolId = val;
      this.refreshCount ++;
      this.jumpflag = jumpflag;
    },
    handlePageHeaderBack() {
      this.$router.push({
        path: "/net/balanceView"
      });
    }
  }
};
</script>
<style type="text/css">
.network-detail {
  padding: 16px;
}
</style>
