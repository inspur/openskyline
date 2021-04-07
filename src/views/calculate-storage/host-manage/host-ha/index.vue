<template>
 <div>
  <el-tabs :value="activeName" @tab-click="onTabClick">
    <el-tab-pane name="ha-segments" :label="$t('calcStorLang.hosthadomain')">
      <router-view v-if="activeName=='ha-segments'"></router-view>
    </el-tab-pane>
    <el-tab-pane name="ha-log" :label="$t('calcStorLang.hosthaNote')">
      <router-view v-if="activeName=='ha-log'"></router-view>
    </el-tab-pane>
  </el-tabs>
 </div>
</template>
<script>
export default {
  name: "HaHostManage",
  data () {
    return {
      activeName: this.$route.matched[3].name
    }
  },
  watch: {
    '$route' (to, from) {
      this.activeName = this.$route.matched[3].name;
    }
  },
  mounted () {
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'ha-segments':
          this.$router.push({
            path: '/calculate-storage/host-management/host-ha/ha-segments'
          });
          break
        case 'ha-log':
          this.$router.push({
            path: '/calculate-storage/host-management/host-ha/ha-log'
          });
          break
        default:
          this.$router.push({
              path: '/calculate-storage/host-management/host-ha/ha-segments'
          });
      }
    }
  }
}
</script>
<style scoped>
</style>
