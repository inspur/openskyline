<template>
  <div>
    <icos-page-header :title="$t('base.parameterSetting')" :show-bottom-border="false" />
    <el-tabs v-model="activeName" class="tab-pane-no-padding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="systemSetting" :label="$t('base.systemSetting')" v-if="systemSettingFlg" />
      <el-tab-pane name="recordSetting" :label="$t('base.recordSetting')" v-if="recordSettingFlg" />
      <el-tab-pane name="moduleSwitch" :label="$t('base.moduleSwitch')" v-if="moduleSwitchFlg" />
      <el-tab-pane name="leaseParameterSetting" :label="$t('base.leaseParameterSetting')" v-if="leaseParameterSettingFlg" />
      <el-tab-pane name="metaData" :label="$t('base.metadata')" v-if="metaDataFlg" />
      <el-tab-pane name="templateSetting" :label="$t('base.businessTemplateConf')" v-if="templateSettingFlg" />
      <el-tab-pane name="pimSetting" :label="$t('base.pimSetting')" v-if="pimSettingFlg" />
    </el-tabs>
    <icos-page>
      <router-view v-if="activeName=='systemSetting'" name="systemSetting"></router-view>
      <router-view v-if="activeName=='recordSetting'" name="recordSetting"></router-view>
      <router-view v-if="activeName=='moduleSwitch'" name="moduleSwitch"></router-view>
      <router-view v-if="activeName=='leaseParameterSetting'" name="leaseParameterSetting"></router-view>
      <router-view v-if="activeName=='metaData'" name="metaData"></router-view>
      <router-view v-if="activeName=='templateSetting'" name="templateSetting"></router-view>
      <router-view v-if="activeName=='pimSetting'" name="pimSetting"></router-view>
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
    this.activeName = this.systemSettingFlg?"systemSetting"
      :this.recordSettingFlg?"recordSetting"
      :this.moduleSwitchFlg?"moduleSwitch"
      :this.leaseParameterSettingFlg?"leaseParameterSetting"
      :this.metaDataFlg?"metaData"
      :this.templateSettingFlg?"templateSetting"
      :this.copyRightSettingFlg?"copyRightSetting"
      :this.pimSettingFlg?"pimSetting"
      :"";
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
