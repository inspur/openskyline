<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.hostManage')" :show-bottom-border="false" />
    <el-tabs :value="activeName" class="tab-pane-no-padding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="calculate-host" :label="$t('calcStorLang.hostList')" />
      <el-tab-pane name="index" :label="$t('calcStorLang.hostAggregation')" />
      <el-tab-pane name="host-ha" :label="$t('calcStorLang.hostha')" v-if="hasMasakari" />
    </el-tabs>
    <icos-page>
      <router-view />
    </icos-page>
  </div>
</template>
<script>
export default {
  name: "HostManage",
  data () {
    return {
      activeName: this.$route.matched[2].name,
      hasMasakari: Vue.service['masakari']
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
            path: '/calculate-storage/host-management/az-management'
          });
          break
        case 'index':
          this.$router.push({
            path: '/calculate-storage/host-management/index'
          });
          break
        case 'calculate-host':
          this.$router.push({
            path: '/calculate-storage/host-management/calculate-host'
          });
          break
        case 'host-ha':
          this.$router.push({
            path: '/calculate-storage/host-management/host-ha'
          });
          break
        default:
          this.$router.push({
              path: '/calculate-storage/host-management/calculate-host'
          });
      }
    }
  }
}
</script>
<style scoped>
</style>
