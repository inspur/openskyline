<template>
<div>
  <icos-page-header :title="$t('calcStorLang.snapshot')" :show-bottom-border="false" />
  <el-tabs v-model="activeName" class="tab-pane-no-padding" @tab-click="onTabClick" type="border-card">
    <el-tab-pane :label="$t('storage.instanceSolt')" name="instancesolt" />
    <el-tab-pane :label="$t('calcStorLang.instanceBackup')" name="instanceBackup" v-if="roleType === '2'" />
    <el-tab-pane :label="$t('storage.volSnapshot')" name="volumesolt" />
    <el-tab-pane :label="$t('storage.volumeBak')" name="volumebak" v-if="isUser" />
    <el-tab-pane :label="$t('storage.shareStorageSnapshot')" name="dsSnapShot" v-if="serviceActive" />
  </el-tabs>
  <icos-page>
    <router-view />
  </icos-page>
</div>
</template>
<script>
export default {
  name: 'Snapshot',
  data () {
    return {
      activeName: this.$route.matched[2].name,
      serviceActive: Vue.service.manila != null,
      roleType: Vue.roleType + '',
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
      case 'instancesolt':
        this.$router.push({
          path: '/calculate-storage/snapshot/instancesolt'
        });
        break;
      case 'volumesolt':
        this.$router.push({
          path: '/calculate-storage/snapshot/volumesolt'
        });
        break;
      case 'dsSnapShot':
        this.$router.push({
          path: '/calculate-storage/snapshot/dsSnapShot'
        });
        break;
      case 'instanceBackup':
        this.$router.push({
          path: '/calculate-storage/snapshot/instanceBackup'
        });
        break;
      case 'volumebak':
        this.$router.push({
          path: '/calculate-storage/snapshot/volumeBak'
        });
        break;
      default:
        this.$router.push({
          path: '/calculate-storage/snapshot/instancesolt'
        })
      }
    }
  }
}
</script>
