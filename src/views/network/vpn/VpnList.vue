<template>
  <div>
    <icos-page-header title="VPN" :show-bottom-border="false" />
    <el-tabs :value="activeName" @tab-click="onTabClick" type="border-card" class="tab-pane-no-padding">
      <el-tab-pane name="vpnike" :label="$t('network.ikeStrategy')">
      </el-tab-pane>
      <el-tab-pane name="vpnsecstrategy" :label="$t('network.ipsecStrategy')">
      </el-tab-pane>
      <el-tab-pane name="vpnserver" :label="$t('network.vpnServer')">
      </el-tab-pane>
      <el-tab-pane name="endpointgroups" :label="$t('network.endpointgroups')">
      </el-tab-pane>
      <el-tab-pane name="vpnsecstation" :label="$t('network.ipsecstation')">
      </el-tab-pane>
    </el-tabs>
    <icos-page>
      <router-view />
    </icos-page>
  </div>
</template>
<script>
export default {
  name: "VpnList",
  data () {
    return {
      activeName: this.$route.matched[2].name
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
        case 'vpnike':
          this.$router.push({
            path: '/net/vpn/vpnike'
          });
          break
        case 'vpnsecstrategy':
          this.$router.push({
            path: '/net/vpn/vpnsecstrategy'
          });
          break
        case 'vpnserver':
          this.$router.push({
            path: '/net/vpn/vpnserver'
          });
          break
        case 'endpointgroups':
          this.$router.push({
            path: '/net/vpn/endpointgroups'
          });
          break
        case 'vpnsecstation':
          this.$router.push({
            path: '/net/vpn/vpnsecstation'
          });
          break
        default:
          this.$router.push({
              path: '/net/vpn/vpnike'
          });
      }
    }
  }
}
</script>
<style scoped>
</style>