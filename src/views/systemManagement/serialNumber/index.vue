<template>
  <div>
    <icos-page-header :title="$t('base.serialNumberManagement')" :show-bottom-border="false" />
    <el-tabs v-model="activeName" class="tab-pane-no-padding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="systemLicense" :label="$t('base.SERIAL_NUMBER_PRODUCT_SERIAL_NUMBER')" />
      <el-tab-pane name="maintenanceLicense" :label="$t('base.SERIAL_NUMBER_MAINTENANCE_SERIAL_NUMBER')" v-if="!trialEdition" />
    </el-tabs>
    <icos-page>
      <system-license v-if="activeName === 'systemLicense'" @trial-edition-changed="handleTrialEditionChanged" @node-amount-changed="handleNodeAmountChanged" />
      <maintenance-license v-if="activeName === 'maintenanceLicense'" :node-amount="nodeAmount" />
    </icos-page>
  </div>
</template>

<script>
import SystemLicense from './SystemLicense';
import MaintenanceLicense from './MaintenanceLicense';
export default {
  name: 'SerialNumber',
  components: {
    SystemLicense,
    MaintenanceLicense
  },
  data() {
    return {
      activeName: "systemLicense",
      trialEdition: true,
      nodeAmount: 0
    };
  },
  methods: {
    handleTrialEditionChanged(value) {
      this.trialEdition = value;
    },
    handleNodeAmountChanged(value) {
      this.nodeAmount = value;
    },
    onTabClick(tab) {
      switch (tab.name) {
        case 'systemLicense':
          this.activeName = "systemLicense";
          break;
        case 'maintenanceLicense':
          this.activeName = "maintenanceLicense";
          break;
        default:
          this.activeName = "systemLicense";
          break;
      }
    }
  }
}
</script>

<style>

</style>