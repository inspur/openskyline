<template>
  <div>
    <icos-page-header :title="$t('base.ipSetting')" :show-bottom-border="false" />
    <el-tabs v-model="activeName" class="tab-pane-no-padding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="ipBlackList" :label="$t('base.blackList')" />
      <el-tab-pane name="ipWhiteList" :label="$t('base.whiteList')" />
    </el-tabs>
    <icos-page>
      <router-view name="ipBlackList" v-if="activeName === 'ipBlackList'" />
      <router-view name="ipWhiteList" v-if="activeName === 'ipWhiteList'" />
    </icos-page>
  </div>
</template>
<script>
export default {
  name: "ipSetting",
  data () {
    return {
      activeName: "ipBlackList"
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
