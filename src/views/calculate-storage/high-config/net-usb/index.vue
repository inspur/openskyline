<template>
  <div>
    <operation-panel-new :select-rows="selectedNetUSBDevices" :operation-menus="operationMenus" style="display:inline;" />
    <div class="divider clearfix"></div>
    <el-table row-key="_id" :data="tableData" ref="table" v-loading="loading" @selection-change="handleSelectedNetUSBDeviceChange">
      <el-table-column reserve-selection type="selection" width="55" align="center"/>
      <el-table-column v-if="checkedColumns.includes('hostname')" :label="$t('calcStorLang.NET_USB_HOSTNAME')" prop="hostname" />
      <el-table-column v-if="checkedColumns.includes('instance')" :label="$t('calcStorLang.NET_USB_INSTANCE')" prop="instance_uuid">
        <template slot-scope="scope">
          <instance-name :id="scope.row.instance_uuid" />
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('vendor')" :label="$t('calcStorLang.NET_USB_VENDOR')+'ID'" prop="vendor" />
      <el-table-column v-if="checkedColumns.includes('product')" :label="$t('calcStorLang.NET_USB_PRODUCT')+'ID'" prop="product" />
      <el-table-column v-if="checkedColumns.includes('port')" :label="$t('calcStorLang.NET_USB_PORT')" prop="port" />
      <el-table-column v-if="checkedColumns.includes('enable')" :label="$t('calcStorLang.NET_USB_ENABLE')" prop="enable">
        <template slot-scope="scope">
          {{ scope.row.enable | enable }}
        </template>
      </el-table-column>
    </el-table>
    <el-row style="margin-top: 10px;">
      <el-col :span="5">
        <icos-column-selector
          name="NetUSBList"
          @refresh="loadData"
          @column-checked="handleColumnChecked"
          :selected-length="selectedNetUSBDevices.length"
          :columns="[
        {
          prop: 'hostname',
          label: $t('calcStorLang.NET_USB_HOSTNAME'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'instance',
          label: $t('calcStorLang.NET_USB_INSTANCE'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'vendor',
          label: $t('calcStorLang.NET_USB_VENDOR')+'ID',
          visible: true,
          defaultChecked: true
        }, {
          prop: 'product',
          label: $t('calcStorLang.NET_USB_PRODUCT')+'ID',
          visible: true,
          defaultChecked: true
        }, {
          prop: 'port',
          label: $t('calcStorLang.NET_USB_PORT'),
          visible: true,
          defaultChecked: true
        }, {
          prop: 'enable',
          label: $t('calcStorLang.NET_USB_ENABLE'),
          visible: true,
          defaultChecked: true
        }]" />
      </el-col>
      <el-col :span="19">
        <page :totalData="hostUsbs" @getCurrentData="getCurrentData" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import uuid from 'uuid';
import InstanceName from './InstanceName';
export default {
  name: 'NetUSBList',
  components: {
    InstanceName
  },
  data() {
    return {
      loading: false,
      selectedNetUSBDevices: [],
      operationMenus: [{
        icon: 'fa-plus',
        name: Vue.t('calcStorLang.NET_USB_ENABLE_NET_ACCESS'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return rowData.enable === false;
        },
        handler: function(selectRows) {
          const $this = this;
          $this.$confirm($this.$t('calcStorLang.NET_USB_ENABLE_NET_ACCESS_CONFIRM'), $this.$t('base.prompt'), {
            type: 'warning'
          }).then(async () => {
            for (let i = 0; i < selectRows.length; i++) {
              let device = selectRows[i];
              try {
                const res = await $this.$ajax({
                  url: `api/nova/v2.1/os-hypervisors-inspur/set_usb_shared`,
                  headers: {
                    'OpenStack-API-Version': 'compute 2.41',
                    'X-OpenStack-Nova-API-Version': 2.41
                  },
                  type: 'POST',
                  data: JSON.stringify({
                    redirdev: {
                      vendor: device.vendor,
                      product: device.product,
                      host_name: device.hostname
                    }
                  }),
                  log: {
                    description: {
                      en: `Enable net USB device (vendor:${device.vendor} product:${device.product} hostname:${device.hostname}) remote access. `,
                      zh_cn: `启用网络USB设备(厂家:${device.vendor} 产品:${device.product} 所属节点:${device.hostname})的网络访问。`
                    },
                    target: Vue.logTarget.netUsb
                  }
                });
                $this.$message.success(Vue.t('calcStorLang.NET_USB_ENABLE_NET_ACCESS_SUCCESS', [device.vendor, device.product, device.hostname]));
              } catch (e) {
                __DEV__ && console.error(e);
              }
            }
            $this.loadData();
          });
        }.bind(this)
      }, {
        icon: 'fa-minus',
        name: Vue.t('calcStorLang.NET_USB_DISABLE_NET_ACCESS'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return rowData.enable === true && (rowData.instance_uuid === null || rowData.instance_uuid === undefined || rowData.instance_uuid === '');
        },
        handler: function(selectRows) {
          const $this = this;
          $this.$confirm($this.$t('calcStorLang.NET_USB_DISABLE_NET_ACCESS_CONFIRM'), $this.$t('base.prompt'), {
            type: 'warning'
          }).then(async () => {
            for (let i = 0; i < selectRows.length; i++) {
              let device = selectRows[i];
              try {
                const res = await $this.$ajax({
                  url: `api/nova/v2.1/os-hypervisors-inspur/unset_usb_shared`,
                  headers: {
                    'OpenStack-API-Version': 'compute 2.41',
                    'X-OpenStack-Nova-API-Version': 2.41
                  },
                  type: 'POST',
                  data: JSON.stringify({
                    redirdev: {
                      vendor: device.vendor,
                      product: device.product,
                      host_name: device.hostname
                    }
                  }),
                  log: {
                    description: {
                      en: `Disable net USB device (vendor:${device.vendor} product:${device.product} hostname:${device.hostname}) remote access. `,
                      zh_cn: `关闭网络USB设备(厂家:${device.vendor} 产品:${device.product} 所属节点:${device.hostname})的网络访问。`
                    },
                    target: Vue.logTarget.netUsb
                  }
                });
                $this.$message.success(Vue.t('calcStorLang.NET_USB_DISABLE_NET_ACCESS_SUCCESS', [device.vendor, device.product, device.hostname]));
              } catch (e) {
                __DEV__ && console.error(e);
              }
            }
            $this.loadData();
          });
        }.bind(this)
      }, {
        icon: 'fa-times',
        name: Vue.t('calcStorLang.voluemUnmount'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return rowData.instance_uuid !== '' && rowData.instance_uuid !== null && rowData.instance_uuid !== undefined;
        },
        handler: function(selectRows) {
          const $this = this;
          $this.$confirm($this.$t('calcStorLang.NET_USB_UNMOUNT_CONFIRM'), $this.$t('base.prompt'), {
            type: 'warning'
          }).then(async () => {
            $this.unmount(selectRows[0], selectRows[0].instance_uuid);
          });
        }.bind(this)
      }],
      hostUsbs: [],
      tableData: [],
      checkedColumns: []
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      const $this = this;
      $this.loading = true;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/os-hypervisors-inspur/all_usbredir`,
          showErrMsg: true
        });
        $this.$refs.table.clearSelection();
        let hostUsbs = res.hosts_usb
        hostUsbs.forEach(item => {
          item._id = uuid.v1();
        });
        $this.hostUsbs = hostUsbs;
        $this.$refs.table.clearSelection();
        $this.loading = false;
      } catch (e) {
        $this.loading = false;
        __DEV__ && console.error(e);
      }
    },
    handleSelectedNetUSBDeviceChange(params) {
      this.selectedNetUSBDevices = params;
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    getCurrentData(data) {
      this.tableData = data;
    },
    async unmount(device, instanceId) {
      const $this = this;
      let usbLabel = this.$t('base.vendor') + "ID:" + device.vendor + "," + this.$t('base.product') + "ID:" + device.product;
      let url = `api/nova/v2.1/servers-inspur/${instanceId}/redirdev_attachment/${device.hostname}/${device.port}`;
      try {
        let result = await $this.$ajax({
          type: 'delete',
          url: url,
          showErrMsg: true,
          log: {
            description: {
              en: `Instance (ID ${instanceId}) unmount Net USB Device: ${usbLabel}`,
              zh_cn: `云主机 (ID ${instanceId}) 卸载网络USB设备: ${usbLabel}`
            },
            target: Vue.logTarget.computeInstance
          },
          successFun: function(data) {
            $this.$message({
              showClose: true,
              message: Vue.t('calcStorLang.volumeUnMountSuccess'),
              type: 'info'
            });
            setTimeout(function() {
              $this.loadData();
            }, 2000);
          }
        });
      } catch (res) {}
    }
  },
  filters: {
    enable(value) {
      if (value) {
        return Vue.t('calcStorLang.NET_USB_ENABLE_TRUE');
      } else {
        return Vue.t('calcStorLang.NET_USB_ENABLE_FALSE');
      }
    }
  }
}
</script>

<style>

</style>