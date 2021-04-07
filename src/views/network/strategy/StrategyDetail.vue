<template>
  <div>
    <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick">
      <el-tab-pane name="detail" :label="$t('base.outline')"></el-tab-pane>
      <el-tab-pane name="qos" :label="$t('network.netConfigQosPloy')"></el-tab-pane>
      <el-tab-pane name="safe" :label="$t('network.securityTeam')"></el-tab-pane>
    </el-tabs >
    <base-detail :strategyData="strategyData" v-if="detail"></base-detail>
    <qos-detail v-if="qos" :strategyData="strategyData"></qos-detail>
    <safe-group v-if="safe" :strategyData="strategyData"></safe-group>
  </div>
</template>
<script>
import BaseDetail from './BaseDetail';
import QosDetail from './QosDetail';
import SafeGroup from './SafeGroup';
export default {
  name: "StrategyDetail",
  props: {
    strategyData: {
      type: Object,
      default: {}
    }/*,
    tabName: {
      type: String,
      default: "detail"
    }*/
  },
  components: {
    QosDetail,
    SafeGroup,
    BaseDetail
  },
  data() {
    return {
      loading: false,
      detail: true,
      qos: false,
      safe: false,
      activeName: "detail"
    }
  },
  mounted() {
  },
/*  watch: {
    tabName () {
      this.tabChange();
    }
  },*/
  methods: {
    tabChange() {
      this.activeName = this.tabName;
      this.changeTab(this.tabName);
    },
    onTabClick (tab) {
      this.changeTab(tab.name);
    },
    changeTab(tabName) {
      this.detail = this.qos = this.safe = false;
      this[tabName] = true;
    },
    statusRender(status) {
      if (status === "VALID") {
        return this.$t('network.VALID');
      } else if (status === "RECOVERABLE") {
        return this.$t('network.RECOVERABLE');
      } else if (status === "DAMAGED") {
        return this.$t('network.DAMAGED');
      }
    }
  }
}
</script>
