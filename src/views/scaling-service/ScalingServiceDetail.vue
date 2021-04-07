<template>
  <div>
    <el-tabs v-model="activeName" type="border-card" @tab-click="onTabClick">
      <el-tab-pane name="scalingDetail" :label="$t('scalingService.resume')">
        <router-view v-if="activeName=='scalingDetail'" name="scalingDetail" :clusterId="clusterId" :projectId="projectId" :statusTem="statusTem"></router-view>
      </el-tab-pane>
      <el-tab-pane name="scalingNodelist" :label="$t('scalingService.nodeDetail')">
        <router-view v-if="activeName=='scalingNodelist'" name="scalingNodelist" :clusterId="clusterId" :projectId="projectId"></router-view>
      </el-tab-pane>
      <el-tab-pane name="scalingOperatelog" :label="$t('scalingService.logDetail')">
        <router-view v-if="activeName=='scalingOperatelog'" name="scalingOperatelog" :clusterId="clusterId" :projectId="projectId"></router-view>
      </el-tab-pane>      
    </el-tabs >
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'ScalingServiceDetail',
  components: {
  },
  data() {
    return {
      activeName: '',
      clusterId: "",
      projectId: "",
      statusTem: ""
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
      switch (tab) {
      case 'scalingDetail':
        this.activeName = "scalingDetail";
        break
      case 'scalingNodelist':
        this.activeName = "scalingNodelist";
        break
      case 'scalingOperatelog':
        this.activeName = "scalingOperatelog";
        break
      default:
        break
      }
    },
    initScalServiceDetail(id, chechproject, status) {
      this.clusterId = id;
      this.projectId = chechproject;
      this.statusTem = status;
      this.onTabClick("scalingDetail");
    }
  }
}
</script>