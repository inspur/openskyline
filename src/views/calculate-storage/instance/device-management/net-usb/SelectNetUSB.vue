<template>
  <div>
    <el2-dialog
      width="600px"
      :title="$t('calcStorLang.selectUsb')"
      :visible.sync="visible"
      :append-to-body="true"
      :close-on-click-modal="false"
      :before-close="handleBeforeClose">
      <el-table ref="table" :data="tableData" v-loading="loading" style="width:100%; margin-top: 5px;" @selection-change="handleSelectionChange">
        <el-table-column reserve-selection type="selection" width="55" />
        <el-table-column v-if="columnsChecked.indexOf('hostname') >= 0" prop="hostname" :label="$t('base.host')" min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.hostname}}</span>
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
        <el-table-column v-if="columnsChecked.indexOf('port') >= 0" prop="port" :label="$t('base.port')" min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.port}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative;">
        <el-row>
          <el-col :span="24">
            <el-button type="text" icon="fa-refresh" @click="refreshData">
            </el-button>
            <span>{{$t('lang.currentSelected')}} {{ selectedRows.length }}{{$tc('lang.item',  selectedRows.length )}}</span>
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="close()">{{$t('base.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
      </div>
    </el2-dialog>
  </div>
</template>
<script>
export default {
  name: 'SelectNetUSB',
  props: ['instance'],
  data() {
    return {
      visible: false,
      selectedRows: [],
      tableData: [],
      loading: false,
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
      }],
      columnsChecked: ['hostname', 'vendor', 'product', 'port']
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
      var url = "api/nova/v2.1/os-hypervisors-inspur/avaiable_usbredir";
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var list = result['hosts_usb'];
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
      this.selectedRows = rows;
    },
    close() {
      this.$emit('close');
    },
    handleBeforeClose(done) {
      done();
      this.close();
    },
    confirmFun() {
      if (this.selectedRows.length === 0) {
        this.$message({
          message: Vue.t('calcStorLang.selectUsbTip'),
          type: "warning"
        });
      } else if (this.selectedRows.length > 1) {
        this.$message({
          message: Vue.t('calcStorLang.USB_DEVICE_AT_MOST_1'),
          type: "warning"
        });
      } else {
        this.$emit('getSelectUsbs', this.selectedRows[0]);
        this.close();
      }
    }
  },
  mounted() {
    this.visible = true;
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
