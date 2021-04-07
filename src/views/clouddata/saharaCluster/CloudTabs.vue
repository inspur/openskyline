<template>
  <div>
    <div class="divider clearfix"></div>
    <el-tabs :value="activeName" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="clusterList" :label="$t('base.cluster')">
        <router-view v-if="activeName=='clusterList'"></router-view>
      </el-tab-pane>
      <el-tab-pane name="clusterTemplate" :label="$t('container.clusterTemplate')">
        <router-view v-if="activeName=='clusterTemplate'"></router-view>
      </el-tab-pane>
      <el-tab-pane name="nodeGroup" :label="$t('cloudData.nodegroup')">
        <router-view v-if="activeName=='nodeGroup'"></router-view>
      </el-tab-pane>
      <el-tab-pane name="image" :label="$t('cloudData.imageRegister')">
        <router-view v-if="activeName=='image'"></router-view>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
export default {
  name: "CloudDataTabs",
  data () {
    return {
      activeName: this.$route.matched[2].name
    };
  },
  watch: {
    '$route' (to, from) {
      this.activeName = this.$route.matched[2].name;
    }
  },
  mounted() {
    console.log("activeName-------" + this.activeName)
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'clusterList':
          this.$router.push({
            path: '/clouddata/cluster/clusterList'
          });
          break
        case 'clusterTemplate':
          this.$router.push({
            path: '/clouddata/cluster/clusterTemplate'
          });
          break
        case 'nodeGroup':
          this.$router.push({
            path: '/clouddata/cluster/nodeGroup'
          });
          break
        case 'image':
          this.$router.push({
            path: '/clouddata/cluster/image'
          });
          break
        default:
          this.$router.push({
            path: '/clouddata/cluster/clusterList'
          });
      }
    }
  }
}
</script>
<style scoped>
  .tabContentWhite {
    background-color:#ffffff;
    padding-left:10px;
  }
</style>