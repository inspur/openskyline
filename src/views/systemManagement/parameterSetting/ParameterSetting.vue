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
      systemSettingFlg:Vue.AuthList["m.systemmanage.paramsetting.systemsetting"],
      recordSettingFlg:Vue.AuthList["m.systemmanage.paramsetting.logsetting"],
      moduleSwitchFlg:Vue.AuthList["m.systemmanage.paramsetting.moduleswitch"],
      leaseParameterSettingFlg:Vue.AuthList["m.systemmanage.paramsetting.leaseterm"],
      metaDataFlg:Vue.AuthList["m.systemmanage.paramsetting.metadata"],
      templateSettingFlg:Vue.AuthList["m.systemmanage.paramsetting.businesstemplate"],
      copyRightSettingFlg:true, //Vue.AuthList["m.systemmanage.paramsetting.copyRightSetting"]
      pimSettingFlg: Vue.AuthList['m.systemmanage.paramsetting.pimsetting']
    }
  },
  mounted () {
    this.activeName = "metaData";
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'systemSetting':
          this.activeName = "systemSetting";
          break
        case 'recordSetting':
          this.activeName = "recordSetting";
          break
        case 'moduleSwitch':
          this.activeName = "moduleSwitch";
          break
        case 'leaseParameterSetting':
          this.activeName = "leaseParameterSetting";
          break
        case 'metaData':
          this.activeName = "metaData";
          break
        case 'templateSetting':
          this.activeName = "templateSetting";
          break
        case 'copyRightSetting':
          this.activeName = "copyRightSetting";
          break
        case 'pimSetting':
          this.activeName = "pimSetting";
          break
        default:
          this.activeName = "systemSetting";
      }
    }
  }
}
</script>
