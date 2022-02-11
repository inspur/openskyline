<template>
  <div>
    <div style="margin: 15px; min-height: 400px;">
      <el-form ref="form" :rules="rules" :model="formData" label-position="right" label-width="100px">
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_TYPE')">
          <el-radio-group v-model="formData.networkType">
            <el-radio label="network">{{ $t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_TYPE_NETWORK') }}</el-radio>
            <el-radio :disabled="!canUsePort" label="port">{{ $t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_TYPE_PORT') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.networkType === 'network'">
          <network
            ref="network"
            :project-id="incomingData.projectId"
            :instance-amount="incomingData.amount"
            :source-type="incomingData.sourceType"
            :preset-network-ids="presetNetworkIds"
            @data-change="handleNetworksChanged"
          />
        </el-form-item>
        <el-form-item v-if="formData.networkType === 'port'">
          <port
            ref="port"
            :project-id="incomingData.projectId"
            @data-change="handlePortsChanged"
          />
        </el-form-item>
        <el-form-item v-if="formData.networkType === 'template'">
          <network-strategy-template
            ref="networkStrategyTemplate"
            :project-id="incomingData.projectId"
            @data-change="handleNetworkStrategyTemplateSelected"
          />
        </el-form-item>
        <el-form-item v-if="['network', 'port'].includes(formData.networkType)" :label="$t('calcStorLang.NG_CREATE_INSTANCE_NET_SAFE_GROUP')">
          <safe-group
            ref="safeGroup"
            :project-id="incomingData.projectId"
            :source-type="incomingData.sourceType"
            :preset-safe-group-ids="presetSafeGroupIds"
            @data-change="handleSafeGroupChanged"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="el-dialog__footer ng-create-instance-footer">
      <el-button @click="handleClose">{{ $t('calcStorLang.NG_CREATE_INSTANCE_CLOSE') }}</el-button>
      <el-button @click="handlePrev">{{ $t('calcStorLang.NG_CREATE_INSTANCE_PREV') }}</el-button>
      <el-button type="primary" :disabled="saving" @click="handleNext">{{ $t('calcStorLang.NG_CREATE_INSTANCE_NEXT') }}</el-button>
      <el-button v-if="!forceVNCPassword" type="primary" :loading="saving" @click="handleSubmit">{{ $t('calcStorLang.NG_CREATE_INSTANCE_SUBMIT') }}</el-button>
    </div>
  </div>
</template>

<script>
import Network from './network/Network';
import Port from './network/Port';
import NetworkStrategyTemplate from './network/NetworkStrategyTemplate'
import SafeGroup from './network/SafeGroup';
const ipaddr = require('ipaddr.js');
export default {
  name: 'StepNetwork',
  props: {
    incomingData: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    Network,
    Port,
    NetworkStrategyTemplate,
    SafeGroup
  },
  data() {
    return {
      init: false,
      saving: false,
      roleType: String(Vue.roleType),
      formData: {
        networkType: 'network',
        networks: [],
        ports: [],
        networkStrategyTemplate: {},
        safeGroups: []
      },
      presetNetworkIds: [],
      presetSafeGroupIds: [],
      rules: {
        networks: [{
          type: 'arrayNotEmpty',
          trigger: 'blur change'
        }],
        safeGroups: [{
          type: 'arrayNotEmpty',
          trigger: 'blur change'
        }]
      }
    };
  },
  methods: {
    handleClose() {
      const $this = this;
      $this.$emit('close');
    },
    handlePrev() {
      const $this = this;
      $this.$emit('prev');
    },
    async check() {
      const $this = this;
      if ($this.formData.networkType === 'network') {
        if ($this.formData.networks.length === 0) {
          $this.$message.error(this.$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_NO_NETWORK'));
          return false;
        } else if ($this.formData.safeGroups.length === 0) {
          $this.$message.error(this.$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_NO_SAFE_GROUP'));
          return false;
        } else {
          for (let i = 0; i < $this.formData.networks.length; i++) {
            const network = $this.formData.networks[i];
            if (network.fixedIP !== '') {
              if (network.fixedSubNetId !== '') {
                try {
                  const subnet = network.subnets.find(item => item.id === network.fixedSubNetId);
                  if (!$this.ipInSubnetAllocationPoolsRange(network.fixedIP, subnet.allocation_pools)) {
                    $this.$message.error(Vue.t('calcStorLang.NG_CREATE_INSTANCE_IP_NOT_IN_RANGE', network.fixedIP));
                    return false;
                  } else {
                    if (await $this.ipIsUsedInSubnet(network.fixedIP, subnet.id) === true) {
                      $this.$message.error($this.$t('calcStorLang.NG_CREATE_INSTANCE_IP_USED', network.fixedIP));
                      return false;
                    }
                  }
                } catch (e) {
                  __DEV__ && console.error(e);
                  $this.$message.error(Vue.t('calcStorLang.NG_CREATE_INSTANCE_IP_NOT_VALID', network.fixedIP));
                  return false;
                }
              } else {
                const regV4V6 = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
                if (!regV4V6.test(network.fixedIP)) {
                  $this.$message.error(Vue.t('calcStorLang.NG_CREATE_INSTANCE_IP_NOT_VALID', network.fixedIP));
                  return false;
                }
                const ipInRange = await $this.validIpInNetworkRange(network.fixedIP, network.id);
                if (!ipInRange) {
                  $this.$message.error(Vue.t('calcStorLang.NG_CREATE_INSTANCE_IP_NOT_IN_RANGE', network.fixedIP));
                  return false;
                }
              }
            }
            if (network.fixedMAC !== '') {
              let pattern = /^([a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2}$/;
              if (!pattern.test(network.fixedMAC)) {
                $this.$message.error(this.$t('calcStorLang.VM_MAC_NOT_VALID'));
                return false;
              } else if (network.fixedMAC.toLowerCase().startsWith('fe:')) {
                $this.$message.error(this.$t('calcStorLang.VM_MAC_NOT_VALID_LIBVIRT_RESERVED'));
                return false;
              } else if (!/^[0-9a-f][02468ace]$/.test(network.fixedMAC.toLowerCase().substr(0, 2))) {
                $this.$message.error(this.$t('calcStorLang.VM_MAC_NOT_VALID_MULTICAST'));
                return false;
              } else if (network.fixedMAC.toLowerCase() === 'ff:ff:ff:ff:ff:ff') {
                $this.$message.error(this.$t('calcStorLang.VM_MAC_NOT_VALID_BOARDCAST'));
                return false;
              }
            }
          }
        }
      } else if ($this.formData.networkType === 'port') {
        if ($this.formData.ports.length === 0) {
          $this.$message.error(this.$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_NO_PORT'));
          return false;
        } else if ($this.formData.safeGroups.length === 0) {
          $this.$message.error(this.$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_NO_SAFE_GROUP'));
          return false;
        }
      } else {
        if (JSON.stringify($this.formData.networkStrategyTemplate) === '{}') {
          $this.$message.error(this.$t('calcStorLang.NG_CREATE_INSTANCE_NETWORK_NO_TEMPLATE'));
          return false;
        }
      }
      return true;
    },
    async handleNext() {
      const $this = this;
      if (await $this.check()) {
        $this.$refs.form.validate((valid) => {
          if (valid) {
            $this.$emit('next', $this.formData);
          }
        });
      }
    },
    async handleSubmit() {
      const $this = this;
      if (await $this.check()) {
        $this.saving = true;
        $this.$refs.form.validate((valid) => {
          if (valid) {
            $this.$emit('submit', $this.formData);
          } else {
            $this.saving = false;
            return false;
          }
        });
      }
    },
    async validIpInNetworkRange(ip, netId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/neutron/v2.0/inspur/networkextension/validate_ip_in_net`,
          data: JSON.stringify({
            ip: ip,
            netId: netId
          }),
          showErrMsg: true
        });
        return res;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    handleNetworksChanged(networks) {
      this.formData.networks = networks;
    },
    handlePortsChanged(ports) {
      this.formData.ports = ports;
    },
    handleNetworkStrategyTemplateSelected(networkStrategyTemplate) {
      this.formData.networkStrategyTemplate = networkStrategyTemplate;
    },
    handleSafeGroupChanged(safeGroups) {
      this.formData.safeGroups = safeGroups;
    },
    ipV4OctetsToFullStr(octets) {
      return octets.map(n => {
        return n.toString().padStart(3, '0');
      }).join('.');
    },
    ipV6PartsToFullStr(parts) {
      return parts.map(n => {
        return n.toString(16).padStart(4, '0');
      }).join(':');
    },
    ipInSubnetAllocationPoolsRange(ip, allocationPools) {
      const $this = this;
      const addr = ipaddr.parse(ip);
      if (addr instanceof ipaddr.IPv4) { // IPv4
        let inRange = false;
        const ipStr = $this.ipV4OctetsToFullStr(addr.octets);
        allocationPools.forEach(pool => {
          const startIPStr = $this.ipV4OctetsToFullStr(ipaddr.parse(pool.start).octets);
          const endIPStr = $this.ipV4OctetsToFullStr(ipaddr.parse(pool.end).octets);
          if (startIPStr <= ipStr && endIPStr >= ipStr) {
            inRange = true;
          }
        });
        return inRange;
      } else { // IPv6
        let inRange = false;
        const ipStr = $this.ipV6PartsToFullStr(addr.parts);
        allocationPools.forEach(pool => {
          const startIPStr = $this.ipV6PartsToFullStr(ipaddr.parse(pool.start).parts);
          const endIPStr = $this.ipV6PartsToFullStr(ipaddr.parse(pool.end).parts);
          if (startIPStr <= ipStr && endIPStr >= ipStr) {
            inRange = true;
          }
        });
        return inRange;
      }
    },
    async ipIsUsedInSubnet(ip, subnetId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/neutron/v2.0/inspur/networkextension/ip_is_used_in_subnet`,
          data: JSON.stringify({
            ip: ip,
            subnet_id: subnetId
          }),
          showErrMsg: true
        });
        return res;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    }
  },
  mounted() {
    const $this = this;
    $this.$on('save-error', () => {
      $this.saving = false;
    });
    $this.$on('did-show', () => {
      if ($this.$refs.network) {
        $this.$refs.network.doLayout();
      }
      if ($this.$refs.port) {
        $this.$refs.port.doLayout();
      }
      if ($this.$refs.networkStrategyTemplate) {
        $this.$refs.networkStrategyTemplate.doLayout();
      }
      if ($this.$refs.safeGroup) {
        $this.$refs.safeGroup.doLayout();
      }
    });
  },
  computed: {
    canUsePort() {
      return this.incomingData.amount === 1 && this.incomingData.sourceType !== 'backup';
    },
    canUseTemplateStrategy() {
      return this.incomingData.sourceType !== 'backup';
    },
    forceVNCPassword() {
      return Vue.forceVNCPassword;
    }
  },
  watch: {
    'formData.networkType': {
      immediate: true,
      handler(newValue, oldValue) {
        this.formData.networks = [];
        this.formData.ports = [];
        this.formData.networkStrategyTemplate = {};
        if (newValue === 'template') {
          this.formData.safeGroups = [];
        }
        if (this.init === true) {
          this.presetNetworkIds = [];
          this.presetSafeGroupIds = [];
        }
      }
    },
    'incomingData.amount': {
      immediate: true,
      handler(newValue) {
        if (newValue > 1 && this.networkType === 'port') {
          this.formData.networkType = 'network';
        }
      }
    },
    'incomingData.sourceId': {
      immediate: true,
      deep: true,
      handler(newValue) {
        if (this.incomingData.sourceType === 'backup') {
          this.init = false;
          this.formData.networkType = '';
          let presetNetworkIds = new Set();
          let presetSafeGroupIds = new Set();
          this.incomingData.networks.forEach(item => {
            presetNetworkIds.add(item.network_id);
            item.security_groups.forEach(sg => {
              presetSafeGroupIds.add(sg);
            });
          });
          this.presetNetworkIds = Array.from(presetNetworkIds);
          this.presetSafeGroupIds = Array.from(presetSafeGroupIds);
          this.$nextTick(() => {
            this.formData.networkType = 'network';
            this.$nextTick(() => {
              this.init = true;
            });
          });
        } else {
          this.presetNetworkIds = [];
          this.presetSafeGroupIds = [];
        }
      }
    }
  }
}
</script>

<style>

</style>
