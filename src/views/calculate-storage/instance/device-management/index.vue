<template>
  <div>
    <el2-dialog
      :title="title"
      :visible="visible"
      :modal-append-to-body="false"
      :before-close="handleBeforeClose"
      :close-on-click-modal="false"
      width="1000px">
      <el-alert v-if="$archIs('mips')" :title="$t('calcStorLang.DEVICE_MANAGEMENT_MIPS_TIPS')" :closable="false" style="margin-bottom: 5px; background-color: #d2dbe2; color: #666666;" />
      <el-tabs>
        <el-tab-pane :label="$t('calcStorLang.DEVICE_MANAGEMENT_VOLUME')" v-if="hasVolumeTab">
          <volume-management :hostEntity="instances[0]" />
        </el-tab-pane>
        <el-tab-pane :label="$t('calcStorLang.DEVICE_MANAGEMENT_NETCARD')" v-if="hasNetcardTab">
          <netcard-management :hostEntity="instances[0]" />
        </el-tab-pane>
        <el-tab-pane :label="$t('calcStorLang.DEVICE_MANAGEMENT_FLOATING_IP')" v-if="hasFloatingIPTab">
          <floating-ip :instance="instances[0]" />
        </el-tab-pane>
        <el-tab-pane :label="$t('calcStorLang.DEVICE_MANAGEMENT_ISO_IMAGE')" v-if="hasISOImageTab">
          <iso-image :instanceId="instances[0].id" />
        </el-tab-pane>
        <el-tab-pane :label="$t('calcStorLang.DEVICE_MANAGEMENT_USB_DEVICE')" v-if="hasUSBDeviceTab">
          <usb-device :usbEntity="instances[0]" />
        </el-tab-pane>
        <el-tab-pane :label="$t('calcStorLang.DEVICE_MANAGEMENT_NET_USB_DEVICE')" v-if="hasUSBDeviceTab">
          <net-usb :instance="instances[0]" />
        </el-tab-pane>
        <el-tab-pane :label="$t('calcStorLang.DIRECT_CONNECT_DISK')" v-if="hasDirectConnectDiskTab">
          <direct-connection :instance="instances[0]" />
        </el-tab-pane>
        <el-tab-pane :label="$t('calcStorLang.GPU')" v-if="hasGPUTab">
          <gpu-management :instance="instances[0]" />
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close" :loading="saving">{{ $t('lang.close') }}</el-button>
      </div>
    </el2-dialog>
  </div>
</template>

<script>
import VolumeManagement from './volume-management';
import NetcardManagement from './netcard-management';
import FloatingIP from './floating-ip';
import ISOImage from './iso-image';
import USBDevice from './usb-device';
import NetUSB from './net-usb';
import DirectConnection from './direct-connection';
import GPUManagement from './gpu-management'
export default {
  props: {
    instances: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  components: {
    VolumeManagement,
    'netcard-management': NetcardManagement,
    'floating-ip': FloatingIP,
    'iso-image': ISOImage,
    'usb-device': USBDevice,
    'net-usb': NetUSB,
    DirectConnection,
    'gpu-management': GPUManagement
  },
  data() {
    return {
      roleType: String(Vue.roleType),
      title: '',
      visible: false,
      saving: false,
      hasBootVolume: null
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    handleBeforeClose(done) {
      done();
      this.close();
    },
    async refreshHasBootVolume() {
      const $this = this;
      let instance = $this.instances[0];
      if ($this.hasBootVolume !== null) { // 非第一次获取，需要重新获取instance对象
        instance = await $this.getInstance($this.instances[0].id);
      }
      if (instance['metadata']['source_type'] === 'volume' && instance['os-extended-volumes-inspur:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        $this.hasBootVolume = false;
      } else {
        $this.hasBootVolume = true;
      }
    },
    async getInstance(id) {
      const $this = this;
      let result = await $this.$ajax({
        type: 'get',
        url: `api/nova/v2.1/servers-inspur/${id}`,
        headers: {
          'X-OpenStack-Nova-API-Version': 2.41
        }
      });
      return result.server;
    }
  },
  beforeDestory() {
    this.visible = false;
  },
  mounted() {
    this.visible = true;
    if (this.instances.length === 1) {
      this.title = `${this.$t('calcStorLang.DEVICE_MANAGEMENT')} - ${this.instances[0].name}`;
      this.refreshHasBootVolume();
    } else {
      this.title = `${this.$t('calcStorLang.DEVICE_MANAGEMENT')}`;
    }
  },
  computed: {
    hasCyborg() { // 是否部署了cyborg
      return 'cyborg' in Vue.service;
    },
    hasVolumeTab() {
      if (this.instances.length > 1) {
        return false;
      } else {
        return true;
      }
    },
    hasNetcardTab() {
      if (this.instances.length > 1) {
        return false;
      }
      if (!this.hasBootVolume) {
        return false;
      }
      return this.roleType === '0' || this.roleType === '2';
    },
    hasFloatingIPTab() {
      if (this.instances.length > 1) {
        return false;
      }
      if (!this.hasBootVolume) {
        return false;
      }
      return this.roleType === '0' || this.roleType === '2';
    },
    hasISOImageTab() {
      return false;
    },
    hasUSBDeviceTab() {
      return false;
    },
    hasNetUSBTab() {
      return false;
    },
    hasDirectConnectDiskTab() {
      return false;
    },
    hasGPUTab() {
      return false;
    }
  }
}
</script>

<style>

</style>
