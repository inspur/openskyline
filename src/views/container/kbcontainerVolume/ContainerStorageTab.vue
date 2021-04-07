<template>
  <div>
    <icos-page-header :title="$t('container.containerVolume')"  :show-bottom-border="false" />
    <div class="divider clearfix"></div>
    <el-tabs :value="activeName" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="containerVolume" :label="$t('container.storageVolume')">
        <router-view  v-if="activeName=='containerVolume'"></router-view>
      </el-tab-pane>
      <el-tab-pane name="storageProvider" :label="$t('container.storageProvider')" v-if="roleType != '3'">
        <router-view  v-if="activeName=='storageProvider'"></router-view>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
export default {
  name: "ContainerStorageTab",
  data () {
    return {
      activeName: this.$route.matched[2].name,
      roleType: Vue.roleType
    };
  },
  watch: {
    '$route' (to, from) {
      this.activeName = this.$route.matched[2].name;
    }
  },
  mounted() {
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'containerVolume':
          this.$router.push({
            path: '/container/containerStorage/containerVolume'
          });
          break
        case 'storageProvider':
          this.$router.push({
            path: '/container/containerStorage/storageProvider'
          });
          break
        default:
          this.$router.push({
            path: '/container/containerStorage/containerVolume'
          });
      }
    }
  }
}
</script>