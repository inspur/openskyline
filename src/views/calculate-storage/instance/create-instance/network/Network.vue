<template>
  <div v-loading="loading">
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="width: 100%; margin-bottom: 5px;">
      <div style="width: 100%;">
        <el-checkbox v-if="roleType !== '3'" v-model="customMAC" style="float: right;">{{ $t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_CUSTOM_MAC') }}</el-checkbox>
      </div>
    </icos-search-bar>
    <el-table ref="table" max-height="300" :data="networks" row-key="id" @selection-change="handleSelectionChanged">
      <el-table-column reserve-selection type="selection" width="55" />
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_NAME')" prop="name" />
      <el-table-column :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_SUB_NET')" :show-overflow-tooltip="false">
        <template slot-scope="scope">
          <el-select v-model="scope.row.fixedSubNetId" @change="handleFixedSubNetIdChanged" clearable>
            <el-option v-for="(item, index) in scope.row.subnets" :key="index" :label="item.name+'('+item.cidr+')'" :value="item.id" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="IP" :show-overflow-tooltip="false">
        <template slot-scope="scope">
          <el-input :disabled="instanceAmount !== 1 || disableFixedIP(scope.row)" v-model="scope.row.fixedIP" style="width: 200px;" :placeholder="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_IP_PLACEHOLDER')" />
          <el-tooltip v-if="disableFixedIP(scope.row)" placement="top" trigger="hover" content="只有子网的ipv6_ra_mode和ipv6_address_mode同时为null，才可以手动分配IPv6地址。">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column v-if="customMAC" :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_MAC')" :show-overflow-tooltip="false">
        <template slot-scope="scope">
          <el-input :disabled="instanceAmount !== 1" v-model="scope.row.fixedMAC" :placeholder="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_MAC_PLACEHOLDER')" />
        </template>
      </el-table-column>
    </el-table>
    <div style="display: flex; flex-direction: row; justify-content: space-between; item-align: center;">
      <div>
        <el-button type="text" icon="fa-refresh" @click="loadNetworks" />
        {{ $t('calcStorLang.NG_CREATE_INSTANCE_SELECTED', selectedNetworks.length) }}
      </div>
      <div>
        {{ $t('calcStorLang.NG_CREATE_INSTANCE_TOTAL', networks.length) }}
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
    },
    instanceAmount: {
      type: Number,
      default: 1
    },
    presetNetworkIds: { // 预设的网络ID值，用于来源为备份的情况
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      roleType: String(Vue.roleType),
      init: false,
      loading: false,
      customMAC: false,
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
      networks: [],
      selectedNetworks: []
    };
  },
  methods: {
    async loadNetworks() {
      const $this = this;
      if ($this.projectId !== '') {
        $this.loading = true;
        Promise.all([
          $this.loadProjectNetworks(),
          $this.loadSharedNetworks(),
          $this.loadSubNets()
        ]).then(res => {
          const resProjectNetworks = res[0];
          const resSharedNetworks = res[1];
          const resSubNets = res[2];
          let networks = resProjectNetworks.networks.concat(resSharedNetworks.networks);
          networks = networks.filter(item => item.admin_state_up === true);
          networks.forEach(item => {
            item.subnets = resSubNets.subnets.filter(subnet => subnet.network_id === item.id);
            item.fixedSubNetId = '';
            item.fixedIP = '';
            item.fixedMAC = '';
          });
          networks = networks.filter(item => item.subnets.length !== 0);
          if ('name' in $this.searchBar.validatedParams) {
            networks = networks.filter(item => item.name.includes($this.searchBar.validatedParams.name));
          }
          $this.networks = networks;
          if (!$this.init && $this.presetNetworkIds.length > 0) {
            $this.networks.forEach(item => {
              if ($this.presetNetworkIds.includes(item.id)) {
                $this.$refs.table.toggleRowSelection(item, true);
              }
            });
            $this.init = true;
          } else {
            $this.$refs.table.clearSelection();
            $this.init = true;
          }
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
    disableFixedIP(net) {
      if (net.fixedSubNetId !== '') {
        let subnet = net.subnets.find(item => item.id === net.fixedSubNetId);
        return subnet.ipv6_ra_mode !== null || subnet.ipv6_address_mode !== null;
      } else {
        let subnets = net.subnets;
        let result = subnets.findIndex(subnet => subnet.ipv6_ra_mode !== null || subnet.ipv6_address_mode !== null);
        return result !== -1;
      }
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.loadNetworks();
    },
    handleSelectionChanged(params) {
      this.selectedNetworks = params;
      this.$emit('data-change', this.selectedNetworks);
    },
    handleFixedSubNetIdChanged() {
      const $this = this;
      $this.networks.forEach(network => {
        if ($this.disableFixedIP(network)) {
          network.fixedIP = '';
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
          this.loadNetworks();
        });
      }
    },
    customMAC: {
      immediate: true,
      handler(newValue) {
        if (newValue === false) {
          this.networks.forEach(item => {
            item.fixedMAC = '';
          });
        }
      }
    },
    instanceAmount: {
      immediate: true,
      handler(newValue) {
        if (newValue !== 1) {
          this.networks.forEach(item => {
            item.fixedIP = '';
            item.fixedMAC = '';
          });
        }
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
    }
  }
}
</script>

<style>

</style>