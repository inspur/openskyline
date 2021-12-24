<template>
 <div>
    <icos-page-header :title="$t('calcStorLang.RECYCLE_BIN')" :show-bottom-border="false" />
    <el-tabs :value="activeName" @tab-click="onTabClick" class="tab-pane-no-padding" type="border-card">
      <el-tab-pane name="hostRecycleBin" :label="$t('base.cloudHost')" />
      <el-tab-pane name="volumeRecycleBin" :label="$t('base.cloudDisk')" v-if="showVolTab"/>
    </el-tabs>
    <icos-page>
      <router-view />
    </icos-page>
 </div>
</template>
<script>
export default {
  name: "RecycleBin",
  data () {
    return {
      activeName: this.$route.matched[2].name,
      showVolTab: false
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
        case 'hostRecycleBin':
          this.$router.push({
            path: '/calculate-storage/recycle-bin/hostRecycleBin'
          });
          break;
        case 'volumeRecycleBin':
          this.$router.push({
            path: '/calculate-storage/recycle-bin/volumeRecycleBin'
          });
          break;
        default:
          this.$router.push({
            path: '/calculate-storage/recycle-bin/hostRecycleBin'
          });
      }
    }
  }
}
</script>
<style scoped>
</style>
