<template>
  <div>
    <el-form label-position="right" label-width="120px">
      <el-form-item :label="$t('calcStorLang.GPU')">
        <el-select v-model="formData.address" clearable>
          <el-option-group v-for="(group, index) in devices" :key="index" :label="group.name">
            <el-option v-for="(item, itemIndex) in group.devices" :key="itemIndex" :value="item.address" :label="item.name+'('+item.address+')'" />
          </el-option-group>
        </el-select>
        <el-button type="primary" icon="fa-plus" size="small" @click="attach" :disabled="formData.address === ''" :loading="attaching">{{ $t('calcStorLang.GPU_ATTACH') }}</el-button>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.GPU_ATTACHED_GPU')">
        <el-table :data="attachedDevices" v-loading="loading">
          <el-table-column v-if="checkedColumns.includes('name')" :label="$t('calcStorLang.GPU_PRODUCT_NAME')" prop="accel_name" />
          <el-table-column v-if="checkedColumns.includes('type')" :label="$t('calcStorLang.GPU_TYPE')" prop="type" />
          <el-table-column v-if="checkedColumns.includes('address')" :label="$t('calcStorLang.GPU_ADDRESS')" prop="address" />
          <el-table-column v-if="checkedColumns.includes('vendor')" :label="$t('calcStorLang.GPU_VENDOR')" prop="vendor_value" />
          <el-table-column v-if="checkedColumns.includes('product_id')" :label="$t('calcStorLang.GPU_PRODUCT_ID')" prop="product_id" />
          <el-table-column v-if="checkedColumns.includes('action')" :label="$t('calcStorLang.GPU_ACTION')">
            <template slot-scope="scope">
              <detach-button :instance="instance" :device="scope.row" @refresh="loadData" />
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 10px;">
          <icos-column-selector @refresh="loadData" @column-checked="handleColumnChecked" :columns="[{
            prop: 'name',
            label: $t('calcStorLang.GPU_PRODUCT_NAME'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'type',
            label: $t('calcStorLang.GPU_TYPE'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'address',
            label: $t('calcStorLang.GPU_ADDRESS'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'vendor',
            label: $t('calcStorLang.GPU_VENDOR'),
            visible: true,
            defaultChecked: true
          }, {
            prop: 'product_id',
            label: $t('calcStorLang.GPU_PRODUCT_ID'),
            visible: true,
            defaultChecked: false
          }, {
            prop: 'action',
            label: $t('calcStorLang.GPU_ACTION'),
            visible: true,
            defaultChecked: true
          }]" />
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import DetachButton from './DetachButton';
export default {
  name: 'DirectConnection',
  props: {
    instance: {
      type: Object,
      default: {}
    }
  },
  components: {
    DetachButton
  },
  data() {
    return {
      loading: false,
      devices: [],
      attachedDevices: [],
      attaching: false,
      formData: {
        address: ''
      },
      checkedColumns: []
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    async loadData() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/cyborg/v2/devices?hostname=${$this.instance['OS-EXT-SRV-ATTR:hypervisor_hostname']}`,
          showErrMsg: true,
          errorKey: 'error_message'
        });
        const devices = [];
        res.devices.forEach(item => {
          item.vendor_value = item.vendor_value.toUpperCase();
          item.product_id = item.product_id.toUpperCase();
          let group = devices.find(g => g.name === item.type);
          if (!group) {
            group = {
              name: item.type,
              devices: []
            };
            devices.push(group);
          }
          if (item.in_use === false) {
            group.devices.push(item);
          }
        });
        $this.devices = devices;
        $this.formData.address = '';
        $this.loadBoundGPUDevices();
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadBoundGPUDevices() {
      const $this = this;
      try {
        $this.loading = true;
        const res = await $this.$ajax({
          type: 'get',
          url: `api/cyborg/v2/accelerator_requests?instance=${$this.instance.id}&bind_state=resolved`
        });
        const attachedDevices = res.arqs;
        attachedDevices.forEach(item => {
          item.vendor_value = item.vendor_value.toUpperCase();
          item.product_id = item.product_id.toUpperCase();
        })
        $this.attachedDevices = attachedDevices;
        $this.loading = false;
      } catch (e) {
        $this.loading = false;
        __DEV__ && console.log(e);
      }
    },
    async attach() {
      const $this = this;
      let devices = [];
      $this.devices.forEach(group => {
        devices = devices.concat(group.devices);
      });
      const device = devices.find(item => item.address === $this.formData.address);
      if (device) {
        $this.attaching = true;
        try {
          const res = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers-inspur/${$this.instance.id}/action`,
            data: JSON.stringify({
              accelBind: {
                accelerators: [{
                  device_rp_uuid: device.rp_uuid,
                  addr: device.address,
                  device_type: device.attribute_type
                }]
              }
            }),
            log: {
              description: {
                en: `Bind Accelerator (Insntace: ${$this.instance.name} UUID: ${$this.instance.id} Address: ${device.address} Name: ${device.name})`,
                zh_cn: `绑定加速器（云主机：${$this.instance.name} UUID：${$this.instance.id} 地址：${device.address} 加速器名：${device.name}）`
              },
              target: Vue.logTarget.computeInstance
            }
          });
          $this.$message.success($this.$t('calcStorLang.GPU_ATTACH_SUCCESS'));
          $this.loadData();
          $this.attaching = false;
        } catch (e) {
          __DEV__ && console.error(e);
          $this.attaching = false;
        }
      }
    }
  }
}
</script>

<style>

</style>