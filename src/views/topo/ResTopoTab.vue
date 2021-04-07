<template>
 <div>
  <el-tabs :value="activeName" class="tabs-nopadding" @tab-click="onTabClick">
      <el-tab-pane name="topoDomainView" label="资源域视图"></el-tab-pane>
      <el-tab-pane name="topoRegionView" label="可用域视图"></el-tab-pane>
  </el-tabs>
  <router-view></router-view>
 </div>
</template>
<script>
export default {
  name: "Volume",
  data () {
    return {
      activeName: this.$route.matched[2].name
    };
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'topoDomainView':
          this.$router.push({
            path: '/calculate-storage/resTopo/resDomainTopo'
          });
          break
        case 'topoRegionView':
          this.$router.push({
            path: '/calculate-storage/resTopo/resRegionTopo'
          });
          break
        default:
          this.$router.push({
              path: '/calculate-storage/resTopo/resDomainTopo'
          });
      }
    }
  }
}
</script>
