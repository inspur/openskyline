<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.highConfig')" :show-bottom-border="false" />
    <!-- <icos-page-header :title="'高级配置'" :show-bottom-border="false" /> -->
      <el-tabs :value="activeName" @tab-click="onTabClick" type="border-card" class="tab-pane-no-padding">
        <el-tab-pane name="key-pair" :label="$t('calcStorLang.keypair')" />
        <el-tab-pane name="server-group" v-if="roleType !== '3'" :label="$t('calcStorLang.serverGroup')" />
        <el-tab-pane name="gpu" v-if="$archIs('x86') && roleType === '0' && hasCyborg" :label="$t('calcStorLang.GPU')" />
        <el-tab-pane name="net-usb" v-if="$archIs('x86') && roleType === '0' && hasCyborg" :label="$t('calcStorLang.NET_USB')" />
      </el-tabs>
      <icos-page>
        <keep-alive>
          <router-view />
        </keep-alive>
      </icos-page>
  </div>
</template>
<script>
export default {
  name: 'AdvancedConfig',
  data () {
    return {
      roleType: Vue.roleType + '',
      activeName: this.$route.matched[2].name,
      hasCyborg: 'cyborg' in Vue.service // 是否部署了cyborg，如果没部署，则不显示加速器
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
        case 'key-pair':
          this.$router.push({
            path: '/calculate-storage/high-config/key-pair'
          });
          break
        case 'server-group':
          this.$router.push({
            path: '/calculate-storage/high-config/server-group'
          });
          break
        case 'gpu':
          this.$router.push({
            path: '/calculate-storage/high-config/gpu'
          });
          break
        case 'net-usb':
          this.$router.push({
            path: '/calculate-storage/high-config/net-usb'
          });
          break
        default:
          this.$router.push({
            path: '/calculate-storage/high-config/key-pair'
          });
      }
    }
  }
}
</script>

<style scoped>
</style>