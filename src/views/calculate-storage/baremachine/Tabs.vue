<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.baremetal')" :show-bottom-border="false" />
    <el-tabs :value="activeName" class="tab-pane-no-padding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="baremachineList" :label="$t('calcStorLang.bareMachine')" />
      <el-tab-pane name="baremachineSpec" :label="$t('calcStorLang.bareSpec')" />
      <el-tab-pane name="baremachineImage" :label="$t('calcStorLang.bareImage')" />
      <el-tab-pane name="externalPhysicalServer" :label="$t('baremachine.EXTERNAL_PHYSICAL_SERVER')" />
    </el-tabs>
    <icos-page>
      <router-view />
    </icos-page>
 </div>
</template>
<script>
export default {
  name: "BaremetalManage",
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
        case 'baremachineSpec':
          this.$router.push({
            path: '/calculate-storage/baremachine-management/baremachineSpec'
          });
          break
        case 'baremachineImage':
          this.$router.push({
            path: '/calculate-storage/baremachine-management/baremachineImage'
          });
          break
        case 'baremachineList':
          this.$router.push({
            path: '/calculate-storage/baremachine-management/baremachineList/list'
          });
          break
        case 'externalPhysicalServer':
          this.$router.push({
            path: '/calculate-storage/baremachine-management/externalPhysicalServer'
          });
          break
        default:
          this.$router.push({
            path: '/calculate-storage/baremachine-management/baremachineList'
          });
      }
    }
  }
}
</script>
<style scoped>
</style>
