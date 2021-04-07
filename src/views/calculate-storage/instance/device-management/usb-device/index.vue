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
          <el-table-column v-if="columnsChecked.indexOf('display_name') >= 0" prop="display_name" :label="$t('base.name')">
            <template slot-scope="scope">
              <span>{{scope.row.display_name}}</span>
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
  <select-usb
    ref="selectUsb"
    v-if="selUsbFlg"
    @getSelectUsbs="mountUsb"
    @close="selUsbFlg = false"
    :usbEntity="selUsbEntity"
  />
</div>
</template>
<script>
import SelectUsb from './SelectUsb';
export default {
  name: 'USBDevices',
  components: {
    SelectUsb
  },
  props: ['usbEntity', 'usbMaps'],
  data() {
    return {
      currentPage: 1,
      loading: false,
      loadingText: Vue.t('calcStorLang.dataLoading'),
      reloadTblFlag: false,
      usbOptions: '',
      vendor:"",
      product:"",
      usbLabel: '',
      usbMap: new Map(),
      close: "",
      selUsbEntity:this.usbEntity,
      columns: [{
        prop: 'display_name',
        label: this.$t('base.name')
      }, {
        prop: "vendor",
        label: this.$t('base.vendor') + 'ID'
      }, {
        prop: "product",
        label: this.$t('base.product') + 'ID'
      }, {
        prop: "operate",
        label: Vue.t('calcStorLang.instOperate')
      }],
      columnsChecked: ['display_name', 'vendor', 'product', 'operate'],
      tableData: [],
      totalData: [],
      multipleSelection: [],
      dialogVisible: false,
      selUsbFlg: false
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
            if (entity != null && entity['status'] != null && (entity['status'] == "available" || entity['status'] == "attaching" || entity['status'] == "mounting" || entity['status'] == "uninstall")) {
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
      var url = "api/nova/v2.1/servers-inspur/" + self.usbEntity.id + "/os-usb_attachment";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var rList = result['usbAttachments'];
        rList.forEach(item => {
          if (!('display_name' in item) || item.display_name === null || item.display_name === '') {
            item.display_name = '-';
          }
        });
        self.totalData = rList;
      } catch (res) {
        self.loading = false;
      }
    },
    async mountUsb({vendor, product, bus, device}, isUKey=false) {
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
          usbAttachment: {
            vendor: self.vendor,
            product: self.product,
            ukeyflag: false
          }
        };
        if (isUKey) {
          body.usbAttachment.bus = bus;
          body.usbAttachment.device = device;
          body.usbAttachment.ukeyflag = true;
        }
        body = JSON.stringify(body);
        try {
          let result = await self.$ajax({
            type: 'post',
            url: "api/nova/v2.1/servers-inspur/" + self.usbEntity.id + "/os-usb_attachment",
            data: body,
            showErrMsg: true,
            log: {
              description: {
                en: "Instance " + self.usbEntity['name'] + " mount USB:" + self.usbLabel,
                zh_cn: "云主机" + self.usbEntity['name'] + " 挂载USB:" + self.usbLabel
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
      this.selUsbFlg = true;
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
    async handleClick(entity) {
      var self = this;
      var url = "api/nova/v2.1/servers-inspur/" + self.usbEntity.id + "/os-usb_attachment/" + entity.vendor + "/" + entity.product;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'delete',
          url: url,
          showErrMsg: true,
          log: {
              description: {
                en: "Instance " + self.usbEntity['name'] + " unmount USB:" + self.usbLabel,
                zh_cn: "云主机" + self.usbEntity['name'] + " 卸载USB:" + self.usbLabel
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
