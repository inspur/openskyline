<template>
  <div v-loading="loading">
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
    <el-table ref="table" max-height="300" :data="ports" row-key="id" @selection-change="handleSelectionChanged" @select="handleRowSelect" @select-all="handleRowSelectAll">
      <el-table-column reserve-selection type="selection" width="55" />
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_NAME')" prop="name" />
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_IP_ADDRESS')">
        <template slot-scope="scope">
          <div v-html="scope.row.fixed_ips_str" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_VNIC_TYPE')" width="150" align="left">
        <template slot-scope="scope">
          {{ scope.row | bindVnic }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_ADMIN_STATE')" width="100" align="left">
        <template slot-scope="scope">
          {{ scope.row.admin_state_up | adminState }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_STATUS')" width="75" align="left">
        <template slot-scope="scope">
          {{ scope.row.status | status }}
        </template>
      </el-table-column>
    </el-table>
    <div style="display: flex; flex-direction: row; justify-content: space-between; item-align: center;">
      <div>
        <el-button type="text" icon="fa-refresh" @click="loadData" />
        {{ $t('calcStorLang.NG_CREATE_INSTANCE_SELECTED', selectedPorts.length) }}
      </div>
      <div>
        {{ $t('calcStorLang.NG_CREATE_INSTANCE_TOTAL', ports.length) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    projectId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          }
        },
        validatedParams: {}
      },
      ports: [],
      selectedPorts: []
    };
  },
  methods: {
    async loadData() {
      const $this = this;
      if ($this.projectId !== '') {
        $this.loading = true;
        Promise.all([
          $this.loadProjectNetworks(),
          $this.loadSharedNetworks(),
          $this.loadSubNets(),
          $this.loadPorts()
        ]).then(res => {
          const resProjectNetworks = res[0];
          const resSharedNetworks = res[1];
          const resSubNets = res[2];
          const resPorts = res[3];
          let networks = resProjectNetworks.networks.concat(resSharedNetworks.networks);
          networks = networks.filter(item => item.admin_state_up === true);
          networks.forEach(item => {
            item.subnets = resSubNets.subnets.filter(subnet => subnet.network_id === item.id);
          });
          networks = networks.filter(item => item.subnets.length !== 0);
          const networkIds = networks.map(item => item.id);
          let ports = resPorts.ports;
          // 过滤掉device_owner为network:reserved的数据 -- 预留地址功能支持
          ports = ports.filter((port) => {
            return port['device_owner'] !== 'network:reserved';
          });
          ports = ports.filter(item => item.fixed_ips !== '' && item.fixed_ips !== null);
          ports = ports.filter(item => networkIds.includes(item.network_id));
          ports.forEach(item => {
            if (item.name === undefined || item.name === null || item.name === '') {
              item.name = item.id;
            }
            item.fixed_ips_str = item.fixed_ips.map(ip => {
              return ip.ip_address;
            }).join('<br>');
          });
          if ('name' in $this.searchBar.validatedParams) {
            ports = ports.filter(item => item.name.includes($this.searchBar.validatedParams.name));
          }
          $this.ports = ports;
          $this.$refs.table.clearSelection();
          $this.loading = false;
        }).catch(e => {
          $this.loading = false;
          __DEV__ && console.error(e);
        });
      }
    },
    async loadProjectNetworks() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/networks?project_id=${$this.projectId}&shared=false&status=ACTIVE&router:external=false&not-tags=bm_deploy`
        });
        return res;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadSharedNetworks() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/networks?shared=true&status=ACTIVE&not-tags=bm_deploy`
        });
        return res;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadSubNets() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/subnets`
        });
        return res;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadPorts() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/ports?project_id=${$this.projectId}&device_id=+&admin_state_up=true&status=DOWN`,
          showErrMsg: true
        });
        return res;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.loadData();
    },
    handleSelectionChanged(params) {
      this.selectedPorts = params;
      this.$emit('data-change', this.selectedPorts);
    },
    handleRowSelect(selection, row) {
      const vnicType = row['binding:vnic_type'];
      if (vnicType === 'direct-physical' || vnicType === 'macvtap') {
        this.$message.warning(this.$t('calcStorLang.SRIOV_TIPS'));
        this.$refs.table.toggleRowSelection(row, false);
      }
    },
    handleRowSelectAll(selection) {
      selection.forEach(item => {
        const vnicType = item['binding:vnic_type'];
        if (vnicType === 'direct-physical' || vnicType === 'macvtap') {
          this.$message.warning(this.$t('calcStorLang.SRIOV_TIPS'));
          this.$refs.table.toggleRowSelection(item, false);
        }
      });
    },
    doLayout() {
      this.$nextTick(() => {
        this.$refs.table.doLayout();
      });
    }
  },
  watch: {
    projectId: {
      immediate: true,
      handler(newValue) {
        this.$nextTick(() => {
          this.loadData();
        });
      }
    }
  },
  filters: {
    adminState(value) {
      return value === true ? 'UP' : 'DOWN';
    },
    status(value) {
      switch (value) {
        case 'ACTIVE':
          return Vue.t('calcStorLang.runningStatus');
        case 'DOWN':
          return Vue.t('lang.DOWN');
        case 'BUILD':
          return Vue.t('lang.BUILD');
        case 'ERROR':
          return Vue.t('lang.ERROR');
        default:
          return '-';
      }
    },
    bindVnic(value) {
      switch (value['binding:vnic_type']) {
        case 'normal':
          return Vue.t('network.normal');
        case 'direct':
          if ('binding:profile' in value && value['binding:profile'] instanceof Object) {
            if ('capabilities' in value['binding:profile'] && value['binding:profile']['capabilities'] instanceof Array) {
              if (value['binding:profile']['capabilities'].includes('switchdev')) {
                return Vue.t('network.streght') + '(' + Vue.t('network.switchdevon') + ')';
              }
            }
          }
          return Vue.t('network.streght');
        case 'macvtap':
          return 'MacVTap';
        default:
          return value;
      }
    }
  }
}
</script>

<style>

</style>