<template>
  <div>
    <icos-page-header :title="$t('base.systemStatus')" :show-bottom-border="false" />
    <el-tabs v-model="activeName" class="tab-pane-no-padding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="systemServer" :label="$t('base.server')" />
      <el-tab-pane name="computerServer" :label="$t('base.computerServer')" />
      <el-tab-pane name="storageServer" :label="$t('base.storageService')" />
      <el-tab-pane name="networkServer" :label="$t('base.networkAgent')" />
    </el-tabs>
    <icos-page>
      <router-view v-if="activeName=='systemServer'" name="systemServer"></router-view>
      <router-view v-if="activeName=='computerServer'" name="computerServer"></router-view>
      <router-view v-if="activeName=='storageServer'" name="storageServer"></router-view>
      <router-view v-if="activeName=='networkServer'" name="networkServer"></router-view>
    </icos-page>
  </div>
</template>
<script>
export default {
  name: "",
  data () {
    return {
      activeName: "systemServer"
    }
  },
  mounted () {
  },
  methods: {
    onTabClick (tab) {
      this.activeName = tab.name;
    }
  }
}
</script>
