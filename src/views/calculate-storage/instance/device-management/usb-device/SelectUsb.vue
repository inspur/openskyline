<template>
  <div>
    <el2-dialog
      width="600px"
      :title="$t('calcStorLang.selectUsb')"
      :visible.sync="visible"
      :append-to-body="true"
      :close-on-click-modal="false"
      :before-close="handleBeforeClose">
      <operation-panel :select-rows="selectedUsbDevices" :operation-menus="operationMenus" />
      <el-table ref="table" :data="tableData" v-loading="loading" style="width:100%; margin-top: 5px;" @selection-change="handleSelectionChange">
        <el-table-column reserve-selection type="selection" width="55" />
        <el-table-column v-if="columnsChecked.indexOf('display_name') >= 0" prop="display_name" :label="$t('base.name')" min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.display_name}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('vendor') >= 0" prop="vendor" :label="$t('base.vendor') + 'ID'" min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.vendor}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('product') >= 0" prop="product" :label="$t('base.product') + 'ID'" min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.product}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('bus') >= 0" prop="bus" :label="$t('base.bus') + 'ID'" min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.bus | textOrMinus}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('device') >= 0" prop="device" :label="$t('base.device') + 'ID'" min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.device | textOrMinus}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative;">
        <el-row>
          <el-col :span="24">
            <el-button type="text" icon="fa-refresh" @click="refreshData">
            </el-button>
            <span>{{$t('lang.currentSelected')}} {{selectedUsbDevices.length}}{{$tc('lang.item', selectedUsbDevices.length)}}</span>
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
        </el-row>
      </div>
      <el-checkbox v-model="isUKey">{{ $t('calcStorLang.thisIsUkeyDevice') }}</el-checkbox>
      <el-tooltip placement="right" trigger="hover">
        <div slot="content" v-html="$t('calcStorLang.ukeyDeviceTips')" />
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close()">{{$t('base.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
      </div>
    </el2-dialog>
    <rename
      v-if="renameDialog.visible"
      :device="renameDialog.device"
      :hostname="renameDialog.hostname"
      @close="renameDialog.visible = false"
      @refresh="refreshData()" />
  </div>
</template>
<script>
import Rename from './Rename';
export default {
  name: 'SelectUSBDevice',
  props: ['usbEntity'],
  components: { Rename },
  data() {
    return {
      visible: false,
      selectedUsbDevices: [],
      isUKey: false,
      tableData: [],
      loading: false,
      columns: [{
        prop: 'display_name',
        label: this.$t('base.name')
      }, {
        prop: 'vendor',
        label: this.$t('base.vendor') + 'ID'
      }, {
        prop: 'product',
        label: this.$t('base.product') + 'ID'
      }, {
        prop: 'bus',
        label: this.$t('base.bus') + 'ID'
      }, {
        prop: 'device',
        label: this.$t('base.device') + 'ID'
      }],
      columnsChecked: ['display_name', 'vendor', 'product', 'bus', 'device'],
      renameDialog: {
        visible: false,
        device: {},
        hostname: ''
      },
      operationMenus: [{
        icon: 'fa-pencil-square-o',
        name: Vue.t('calcStorLang.rename'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.renameDialog.device = selectRows[0];
          this.renameDialog.hostname = this.usbEntity["OS-EXT-SRV-ATTR:host"];
          this.renameDialog.visible = true;
        }.bind(this)
      }]
    };
  },
  methods: {
    show() {
      this.visible = true;
      this.getTableData();
    },
    async getTableData() {
      var self = this;
      self.loading = true;
      var url = "api/nova/v2.1/os-hypervisors-inspur/" + this.usbEntity["OS-EXT-SRV-ATTR:host"] + "/get_host_usblist";
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var list = result['host_usbs'];
        list.forEach(item => {
          if (!('display_name' in item) || item.display_name === null || item.display_name === '') {
            item.display_name = '-';
          }
        });
        self.tableData = list;
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    refreshData() {
      this.$refs.table.clearSelection();
      this.getTableData();
    },
    handleSelectionChange(rows) {
      this.selectedUsbDevices = rows;
    },
    close() {
      this.$emit('close');
    },
    handleBeforeClose(done) {
      done();
      this.close();
    },
    confirmFun() {
      if (this.selectedUsbDevices.length === 0) {
        this.$message({
          message: Vue.t('calcStorLang.selectUsbTip'),
          type: "warning"
        });
      } else if (this.selectedUsbDevices.length > 1) {
        this.$message({
          message: Vue.t('calcStorLang.USB_DEVICE_AT_MOST_1'),
          type: "warning"
        });
      } else {
        this.$emit('getSelectUsbs', this.selectedUsbDevices[0], this.isUKey);
        this.close();
      }
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

<style>
</style>
