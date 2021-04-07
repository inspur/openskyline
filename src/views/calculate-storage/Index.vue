<template>
 <div>
  <el-tabs :value="activeName" class="tabs-nopadding" @tab-click="onTabClick">
      <el-tab-pane name="az-management" label="可用域(AZ)"></el-tab-pane>
      <el-tab-pane name="domain-management" label="资源域"></el-tab-pane>
  </el-tabs>
  <router-view></router-view>
 </div>
</template>
<script>
export default {
  name: "Domain",
  data () {
    return {
      activeName: this.$route.matched[2].name
    }
  },
  watch: {
    '$route' (to, from) {
      this.activeName = this.$route.matched[2].name;
    }
  },
  mounted () {
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'az-management':
          this.$router.push({
            path: '/calculate-storage/domains/az-management'
          });
          break
        case 'domain-management':
          this.$router.push({
            path: '/calculate-storage/domains/domain-management'
          });
          break
        default:
          this.$router.push({
              path: '/calculate-storage/domains/az-management'
          });
      }
    }
  }
}
</script>
<style scoped>
</style>
