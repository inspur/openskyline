<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.blockStorage')" :show-bottom-border="false" />
    <el-tabs :value="activeName" class="tab-pane-no-padding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="volumelist" :label="$t('base.cloudDisk')" />
      <el-tab-pane name="volumetype" :label="$t('storage.volumeType')" v-if="isShow" />
    </el-tabs>
    <icos-page>
      <router-view />
    </icos-page>
  </div>
</template>
<script>
export default {
  name: "Volume",
  data () {
    return {
      activeName: this.$route.matched[2].name,
      isShow: Vue.roleType == "0",
      isUser: Vue.roleType != "3"
    };
  },
  watch: {
      // 切换页面
      '$route' (to, from) {
        this.activeName = this.$route.matched[2].name;
      }
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'volumelist':
          this.$router.push({
            path: '/calculate-storage/volume/volumelist'
          });
          break
        case 'volumetype':
          this.$router.push({
            path: '/calculate-storage/volume/volumetype'
          });
          break
        default:
          this.$router.push({
              path: '/calculate-storage/volume/volumelist'
          });
      }
    }
  }
}
</script>
