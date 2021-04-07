<template>
  <div>
    <el-dialog :title="$t('calcStorLang.checkQuota')" :visible.sync="dialogVisible" :show-close="closable" :before-close="onBeforeClose" size="tiny">
      <el-table :data="tableData">
        <el-table-column :label="$t('calcStorLang.resourceName')" prop="info.name">
          <template slot-scope="scope">
            <span>{{ scope.row.info.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('calcStorLang.remainQuota')" prop="remain">
          <template slot-scope="scope">
            <i class="el-icon-loading" v-if="scope.row.info.limit === ''"></i>
            <span v-else-if="scope.row.info.limit === -1">{{ $t('base.unlimited') }}</span>
            <span v-else>{{ scope.row.info.remain }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('calcStorLang.requireQuota')" prop="value">
        </el-table-column>
        <el-table-column :label="$t('calcStorLang.quotaMatch')" prop="value">
          <template slot-scope="scope">
            <el-tag v-show="scope.row.pass === true" type="success">{{ $t('calcStorLang.quotaPass') }}</el-tag>
            <el-tag v-show="scope.row.pass === false" type="danger">{{ $t('calcStorLang.quotaNotPass') }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <span v-if="status == 'error'">{{ $t('calcStorLang.quotaNotEnough') }}</span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array
    },
    projectId: {
      type: String
    }
  },
  data() {
    return {
      dialogVisible: false,
      closable: false,
      status: 'checking', //success error
      quotas: {
        'nova': {
          'cores': { name: this.$t('base.VCPUQuantityNum'), remain: '', limit: '' },
          'injected_file_content_bytes': { name: this.$t('base.injectedFileContentNum'), remain: '', limit: '' },
          'injected_file_path_bytes': { name: this.$t('base.injectedFilePathLengthNum'), remain: '', limit: '' },
          'injected_files': { name: this.$t('base.injectedFileNum'), remain: '', limit: '' },
          'instances': { name: this.$t('base.cloudHostNum'), remain: '', limit: '' },
          'metadata_items': { name: this.$t('base.metadataEntryNum'), remain: '', limit: '' },
          'ram': { name: this.$t('base.memorymbNum'), remain: '', limit: '' }
        },
        'cinderV2': {
          'backup_gigabytes': { name: this.$t('base.cloudDiskAndBakSizeNum'), remain: '', limit: '' },
          'backups': { name: this.$t('base.cloudHardDiskBakNum'), remain: '', limit: '' },
          'gigabytes': { name: this.$t('base.cloudDiskAndSnapshotSizeNum'), remain: '', limit: '' },
          'snapshots': { name: this.$t('base.cloudHardDiskSnapshotNum'), remain: '', limit: '' },
          'volumes': { name: this.$t('base.cloudHardDiskNum'), remain: '', limit: '' }
        },
        'neutron': {
          'firewall': { name: this.$t('base.firewallNum'), remain: '', limit: '' },
          'port': { name: this.$t('base.portNum'), remain: '', limit: '' },
          'subnet': { name: this.$t('base.subnetNum'), remain: '', limit: '' },
          'firewall_rule': { name: this.$t('base.firewallRuleNum'), remain: '', limit: '' },
          'network': { name: this.$t('base.networkNum'), remain: '', limit: '' },
          'floatingip': { name: this.$t('base.floatIPNum'), remain: '', limit: '' },
          'security_group_rule': { name: this.$t('base.securityGroupRuleNum'), remain: '', limit: '' },
          'pool': { name: this.$t('base.resoucePoolNum'), remain: '', limit: '' },
          'firewall_policy': { name: this.$t('base.firewallStrategy'), remain: '', limit: '' },
          'healthmonitor': { name: this.$t('base.healthInspectorNum'), remain: '', limit: '' },
          'security_group': { name: this.$t('base.securityGroupNum'), remain: '', limit: '' },
          'router': { name: this.$t('base.routeNum'), remain: '', limit: '' },
          'loadbalancer': { name: this.$t('base.loadBalancingNum'), remain: '', limit: '' }
        }
      },
      tableData: []
    }
  },
  methods: {
    initDialog() {
      const $this = this;
      let tableData = [];
      $this.items.forEach(item => {
        tableData.push({
          serviceName: item.serviceName,
          itemName: item.itemName,
          value: item.value,
          info: $this.quotas[item.serviceName][item.itemName],
          pass: ''
        });
      })
      $this.$set($this, 'tableData', tableData);
      $this.loadAndCheck();
    },
    onBeforeClose(done) {
      const $this = this;
      $this.close();
      done();
    },
    close() {
      const $this = this;
      $this.dialogVisible = false;
      $this.$emit("close");
    },
    async loadAndCheck() {
      const $this = this;
      await $this.loadAndCheckNovaQuotas();
      await $this.loadAndCheckCinderV2Quotas();
      await $this.loadAndCheckNeutronQuotas();
      $this.check('nova');
      $this.check('cinderV2');
      $this.check('neutron');
      $this.closable = true;
      let pass = $this.tableData.findIndex(item => item.pass == false) == -1;
      if (pass) {
        $this.status = 'success';
        $this.$emit('success');
        $this.close();
      } else {
        $this.status = 'error';
        $this.dialogVisible = true;
        $this.$emit('error');
      }
    },
    async loadAndCheckNovaQuotas() {
      const $this = this;
      const result = await $this.$ajax({
        type: 'get',
        url: `api/nova/v2/os-quota-sets/${$this.projectId}/detail`
      });
      Object.keys($this.quotas.nova).forEach(key => {
        $this.quotas.nova[key].limit = result.quota_set[key].limit;
        $this.quotas.nova[key].remain = result.quota_set[key].limit - result.quota_set[key].in_use;
      });
    },
    async loadAndCheckCinderV2Quotas() {
      const $this = this;
      const result = await $this.$ajax({
        type: 'get',
        url: `api/cinderv2/v3/${$this.projectId}/os-quota-sets/${$this.projectId}?usage=true`
      });
      Object.keys($this.quotas.cinderV2).forEach(key => {
        $this.quotas.cinderV2[key].limit = result.quota_set[key].limit;
        $this.quotas.cinderV2[key].remain = result.quota_set[key].limit - result.quota_set[key].in_use;
      });
    },
    async loadAndCheckNeutronQuotas() {
      const $this = this;
      const result = await $this.$ajax({
        type: 'get',
        url: `api/neutron/v2.0/quotas/${$this.projectId}/details.json`
      });
      Object.keys($this.quotas.neutron).forEach(key => {
        if (key in result.quota) {
          $this.quotas.neutron[key].limit = result.quota[key].limit;
          $this.quotas.neutron[key].remain = result.quota[key].limit - result.quota[key].used;
        }
      });
    },
    check(serviceName) {
      const $this = this;
      $this.tableData.forEach(item => {
        if (item.serviceName == serviceName) {
          if (item.info.limit != -1 && item.value > item.info.remain) {
            item.pass = false;
          } else {
            item.pass = true;
          }
        }
      })
    }
  },
  mounted() {
    const $this = this;
    $this.initDialog();
  }
}
</script>

<style>

</style>
