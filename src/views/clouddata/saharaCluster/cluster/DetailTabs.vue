<template>
  <div>
    <icos-page-header title="集群详情" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
    <icos-page>  
      <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick">
        <el-tab-pane name="detail-info"  :label="$t('base.baseInfo')"></el-tab-pane>
        <el-tab-pane name="detail-nodegroup" :label="$t('base.cloudHost')"></el-tab-pane>
        <el-tab-pane name="cluster-events" label="事件详情"></el-tab-pane>
      </el-tabs>
      <detail-info v-if="detailFlag" :clusterId="clusterId"></detail-info>
      <detail-node-list v-if="secondFlag" :clusterId="clusterId"></detail-node-list>
      <cluster-events v-if="thirdFlag" :clusterId="clusterId"></cluster-events>
    </icos-page>  
  </div>
</template>
<script>
import DetailInfo from './DetailInfo';
import DetailNodeList from './DetailNodeList';
import ClusterEvents from './ClusterEvents';
export default {
  name: 'DetailTabs',
  components: {
    DetailInfo, DetailNodeList, ClusterEvents
  },
  data() {
    return {
      service:Vue.service,
      activeName: 'detail-info',
      detailFlag: true,
      secondFlag: false,
      thirdFlag: false,
      clusterId: this.$route.params.clusterId
    }
  },
  mounted() {
  },
  methods: {
    onTabClick (tab) {
      this.detailFlag = false;
      this.secondFlag = false;
      this.thirdFlag = false;
      switch (tab.name) {
        case 'detail-info':
          this.detailFlag = true;
          break
        case 'detail-nodegroup':
          this.secondFlag = true;
          break
        case 'cluster-events':
          this.thirdFlag = true;
          break
        default:
          this.detailFlag = false;
          this.secondFlag = false;
          this.thirdFlag = false;
          break
      }
    },
    handlePageHeaderBack() {
      this.$router.push({
        path:'/clouddata/cluster'
      });
    }
  }
}
</script>