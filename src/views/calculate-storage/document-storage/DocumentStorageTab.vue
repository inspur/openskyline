<template>
 <div>
  <icos-page-header :title="$t('calcStorLang.fileStorage')" :show-bottom-border="false" />
  <el-tabs :value="activeName" class="tab-pane-no-padding" @tab-click="onTabClick" type="border-card">
    <el-tab-pane name="shareStorage" :label="$t('storage.shareStorage')" />
    <el-tab-pane name="shareType" :label="$t('storage.shareStorageType')" v-if="isShow" />
    <el-tab-pane name="CIFS" :label="$t('storage.CIFS')" v-if="!isUser" />
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
      isUser: Vue.roleType == "3"
    };
  },
  watch: {
    '$route' (to, from) {
      this.activeName = this.$route.matched[2].name;
    }
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'shareStorage':
          this.$router.push({
            path: '/calculate-storage/document-storage/shareStorage'
          });
          break
        case 'CIFS':
          this.$router.push({
            path: '/calculate-storage/document-storage/CIFS'
          });
          break
        case 'docstorNet':
          this.$router.push({
            path: '/calculate-storage/document-storage/dsNet'
          });
          break
        case 'safeStrategy':
          this.$router.push({
            path: '/calculate-storage/document-storage/dsSafeStrategy'
          });
          break
        case 'shareType':
          this.$router.push({
            path: '/calculate-storage/document-storage/shareType'
          });
          break
        case 'snapShot':
          this.$router.push({
            path: '/calculate-storage/document-storage/dsSnapShot'
          });
          break
        default:
          this.$router.push({
              path: '/calculate-storage/document-storage/shareStorage'
          });
      }
    }
  }
}
</script>
