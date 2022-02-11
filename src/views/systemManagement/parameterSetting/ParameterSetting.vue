<template>
  <div>
    <icos-page-header :title="$t('base.parameterSetting')" :show-bottom-border="false" />
    <el-tabs v-model="activeName" class="tab-pane-no-padding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="metaData" :label="$t('base.metadata')" v-if="metaDataFlg" />
    </el-tabs>
    <icos-page>
      <router-view v-if="activeName=='metaData'" name="metaData"></router-view>
    </icos-page>
  </div>
</template>
<script>
export default {
  name: "",
  data () {
    return {
      activeName: "",
      metaDataFlg:Vue.AuthList["m.systemmanage.paramsetting.metadata"]
    }
  },
  mounted () {
    this.activeName = "metaData";
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'metaData':
          this.activeName = "metaData";
          break
        default:
          this.activeName = "metaData";
      }
    }
  }
}
</script>
