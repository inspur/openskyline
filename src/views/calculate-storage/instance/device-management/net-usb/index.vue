<template>
<div>
  <div>
    <el-form ref="editInstanceForm" label-width="120px" label-position="right" v-loading="loading" :element-loading-text="loadingText">
      <el-form-item :label="$t('calcStorLang.DEVICE_MANAGEMENT_USB_DEVICE_MOUNT_DEVICE')" prop="name">
        <el-button type="primary" icon="fa-plus" size="small" @click="selectUsb">{{$t('calcStorLang.volumeMount')}}</el-button>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.usbMountDisk')" class="">
        <el-table ref="umTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" @selection-change="handleSelectionChange">
          <el-table-column reserve-selection type="selection" width="55" />
          <el-table-column v-if="columnsChecked.indexOf('hostname') >= 0" prop="hostname" :label="$t('base.host')">
            <template slot-scope="scope">
              <span>{{scope.row.hostname}}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('vendor') >= 0" prop="vendor" :label="$t('base.vendor') + 'ID'">
            <template slot-scope="scope">
              <span>{{scope.row.vendor}}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('product') >= 0" prop="product" :label="$t('base.product') + 'ID'">
            <template slot-scope="scope">
              <span>{{scope.row.product}}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('port') >= 0" prop="port" :label="$t('base.port')">
            <template slot-scope="scope">
              <span>{{scope.row.port}}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('operate') >= 0" prop="operate" :label="$t('base.action')">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleClick(scope.row)">{{$t('calcStorLang.voluemUnmount')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh">
              </el-button>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
                <div slot="reference" class="name-wrapper">
                  <el-tag>{{$t('network.columnSelected')}}</el-tag>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="19">
              <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
            </el-col>
          </el-row>
        </div>
      </el-form-item>
    </el-form>
  </div>
  <select-net-usb
    ref="selectUsb"
    v-if="selectNetUSBDialog.visible"
    @getSelectUsbs="mountUsb"
    @close="selectNetUSBDialog.visible = false"
    :instance="instance"
  />
</div>
</template>
<script>
import SelectNetUSB from './SelectNetUSB';
export default {
  name: 'NetUSB',
  components: {
    'select-net-usb': SelectNetUSB
  },
  props: ['instance'],
  data() {
    return {
      loading: false,
      loadingText: Vue.t('calcStorLang.dataLoading'),
      reloadTblFlag: false,
      vendor: '',
      product:'',
      usbLabel: '',
      usbMap: new Map(),
      columns: [{
        prop: 'hostname',
        label: this.$t('base.host')
      }, {
        prop: 'vendor',
        label: this.$t('base.vendor') + 'ID'
      }, {
        prop: 'product',
        label: this.$t('base.product') + 'ID'
      }, {
        prop: 'port',
        label: this.$t('base.port')
      }, {
        prop: 'operate',
        label: Vue.t('calcStorLang.instOperate')
      }],
      columnsChecked: ['hostname', 'vendor', 'product', 'port', 'operate'],
      tableData: [],
      totalData: [],
      multipleSelection: [],
      dialogVisible: false,
      selectNetUSBDialog: {
        visible: false
      }
    }
  },
  watch: {
     tableData: {
      immediate: false,
      handler: function(list) {
        var self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (var t = 0; t < list.length; t++) {
            var obj = list[t];
            let usbId = obj.usbId;
            var entity = self.usbMap.get(usbId);
            if (entity != null && entity['status'] != null && (entity['status'] == 'available' || entity['status'] == 'attaching' || entity['status'] == 'mounting' || entity['status'] == 'uninstall')) {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interUsbValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interUsbValid = setInterval(() => {
              this.onRefresh()
            }, 8000);
        }
      }
     }
  },
  beforeDestroy() {
    if (this.interUsbValid != null) {
      clearInterval(this.interUsbValid);
    }
  },
  mounted() {
    var self = this;
    self.initDialog();
    self.getData();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    selectUsb() {
      this.handleUsbShow();
    },
    async getData() {
      var self = this;
      var url = "api/nova/v2.1/servers-inspur/" + self.instance.id + "/redirdev_attachment";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var rList = result['usbAttachments'];
        self.totalData = rList;
      } catch (res) {
        self.loading = false;
      }
    },
    async mountUsb({hostname, vendor, product, port}, isUKey=false) {
      var self = this;
      self.vendor = vendor;
      self.product = product;
      self.usbLabel = this.$t('base.vendor') + "ID:" + vendor + "," + this.$t('base.product') + "ID:" + product;
      if (self.usbLabel == "") {
        self.$message({
          showClose: true,
          message: Vue.t('calcStorLang.usbMountTip'),
          type: 'warning'
        });
        return;
      } else {
        self.loading = true;
        let body = {
          redirdev: {
            host_name: hostname,
            port: port,
            vendor: self.vendor,
            product: self.product
          }
        };
        body = JSON.stringify(body);
        try {
          let result = await self.$ajax({
            type: 'post',
            url: "api/nova/v2.1/servers-inspur/" + self.instance.id + "/redirdev_attachment",
            data: body,
            showErrMsg: true,
            log: {
              description: {
                en: `Instance (ID ${self.instance.id} Name ${self.instance.name}) Mount Net USB Device: ${self.usbLabel}`,
                zh_cn: `云主机 (ID ${self.instance.id} 名称 ${self.instance.name}) 挂载网络USB设备: ${self.usbLabel}`
              },
              target: Vue.logTarget.computeInstance
            },
            successFun: function(data) {
              self.$message({
                showClose: true,
                message: Vue.t('calcStorLang.volumeMountSendSuccess'),
                type: 'info'
              });
              var mountEntity = self.usbMap.get(self.usb);
              if (mountEntity != null) {
                mountEntity.status = "mounting";
              };
              setTimeout(function() {
                self.getData();
                self.loading = false;
              }, 2000);
            },
            errFun: function() {
              self.loading = false;
            }
          });
          self.usbLabel = "";
        } catch (res) {
          self.loading = false;
        }
      }
    },
    handleUsbShow() {
      this.selectNetUSBDialog.visible = true;
      this.$nextTick(() => {
        this.$refs.selectUsb.show();
      });
    },
    handleCancel() {
      this.$emit("handleusbFlag");
    },
    handleClose(done) {
      this.$emit("handleusbFlag");
      done();
    },
    async handleClick(device) {
      var self = this;
      let usbLabel = this.$t('base.vendor') + "ID:" + device.vendor + "," + this.$t('base.product') + "ID:" + device.product;
      var url = `api/nova/v2.1/servers-inspur/${self.instance.id}/redirdev_attachment/${device.hostname}/${device.port}`;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'delete',
          url: url,
          showErrMsg: true,
          log: {
              description: {
                en: `Instance (ID ${self.instance.id} Name ${self.instance.name}) Unmount Net USB Device: ${usbLabel}`,
                zh_cn: `云主机 (ID ${self.instance.id} 名称 ${self.instance.name}) 卸载网络USB设备: ${usbLabel}`
              },
              target: Vue.logTarget.computeInstance
          },
          successFun: function(data) {
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.volumeUnMountSuccess'),
              type: 'info'
            });
            setTimeout(function() {
              self.getData();
              self.loading = false;
            }, 2000);
          },
          errFun: function() {
            self.loading = false;
          }
        });
      } catch (res) {}
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      var self = this;
      self.getData();
    }
  },
  filters: {
    textOrMinus(value) {
      if (value === '' || value === undefined || value === null) {
        return '-';
      }
      return value;
    }
  }
}

</script>
<style scoped>


</style>
