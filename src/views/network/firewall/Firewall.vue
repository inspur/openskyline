<template>
  <div>
    <icos-page-header :title="$t('network.firewall')" :show-bottom-border="false" />
    <el-tabs :value="activeName" class="tab-pane-no-padding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="firewallList" :label="$t('network.firewall')">
      </el-tab-pane>
      <el-tab-pane name="firewallStrategy" :label="$t('network.firewallStrategy')">
      </el-tab-pane>
      <el-tab-pane name="firewallRule" :label="$t('network.firewallRule')">
      </el-tab-pane>
    </el-tabs>
    <icos-page>
      <router-view />
    </icos-page>
  </div>
</template>
<script>
export default {
  name: "Firewall",
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
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'firewallList':
          this.$router.push({
            path: '/net/firewall/firewallList'
          });
          break
        case 'firewallStrategy':
          this.$router.push({
            path: '/net/firewall/firewallStrategy'
          });
          break
        case 'firewallRule':
          this.$router.push({
            path: '/net/firewall/firewallRule'
          });
          break
        default:
          this.$router.push({
            path: '/net/firewall/firewallList'
          });
      }
    }
  }
}
</script>