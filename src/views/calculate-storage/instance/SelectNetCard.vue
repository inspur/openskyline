<template>
  <div>
    <div>
      <el-dialog
        :title="$t('calcStorLang.instEditSecurityGroup')"
        size="middle"
        :before-close="handleClose"
        :visible="true">
        <div>
          <el-table ref="umTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="port_id" @current-change="handleCurrentChange" @row-click="rowClick" @sort-change="sortChange" v-loading="loading">
            <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="net_id" :label="$t('calcStorLang.net')" min-width="90" align="left">
              <template slot-scope="scope">
                <span v-html="netNameRender(scope.row.name, scope.row)"></span>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('port') >= 0" prop="port_id" :label="$t('lang.port')" min-width="90" align="left">
              <template slot-scope="scope">
                <span v-html="portNameRender(scope.row.name, scope.row)"></span>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('ip') >= 0" prop="fixed_ips" :label="$t('calcStorLang.IP')" align="left">
              <template slot-scope="scope">
                <span v-html="cardIpRender(scope.row.fixed_ips, scope.row)"></span>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="port_state" :label="$t('calcStorLang.status')" min-width="50" align="left">
              <template slot-scope="scope">
                <span v-html="statusRender(scope.row)"></span>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="5">
                <el-button type="text" icon="fa-refresh" @click="onRefresh">
                </el-button>
                <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
                <el-popover placement="right" trigger="click">
                  <el-checkbox-group class="vertical" v-model="columnsChecked">
                    <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
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
        </div>
        <span slot="footer">
          <el-button @click="handleCancel">{{ $t('lang.cancel') }}</el-button>
          <el-button type="primary" @click="next">{{$t('calcStorLang.instEditSecurityGroup')}}</el-button>
        </span>
      </el-dialog>

    </div>
  </div>
</template>
<script>
  export default {
    name: 'netcard',
    props: ['hostEntity'],
    data() {
      return {
        currentPage: 1,
        addFlag: false,
        reloadTblFlag: false,
        qosConfigFlag: false,
        createQosFlg: false,
        roleType: Vue.roleType + "",
        columns: [{
          prop: "name",
          label: Vue.t('calcStorLang.net')
        }, {
          prop: "port",
          label: Vue.t('lang.port')
        }, {
          prop: "ip",
          label: Vue.t('calcStorLang.IP')
        }, {
          prop: "status",
          label: Vue.t('calcStorLang.status')
        }],
        columns2: [],
        columnsChecked: ['name', 'port', 'ip', 'status'],
        tableData: [],
        tableData2: [],
        tableData3: [],
        netCardMaps: new Map(),
        portCardMaps: new Map(),
        multipleSelection: [],
        multipleSelection2: [],
        dialogVisible: false,
        totalData: [],
        loading: false,
        ipversion:4
      }
    },
    beforeDestroy() {
      if (this.interNetcardValid != null) {
        clearInterval(this.interNetcardValid);
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
              if (obj['port_state'] == "BUILD" || obj['port_state'] == "DOWN") {
                self.reloadTblFlag = true;
                break;
              }
            }
          }
          clearInterval(self.interNetcardValid);
          if (self.reloadTblFlag && !self._isDestroyed) {
            self.interNetcardValid = setInterval(() => {
              this.reloadTableData()
            }, 5000);
          }
        }
      }
    },
    mounted() {
      var self = this;
      self.initDialog();
      Promise.all([self.loadSharedNetList(), self.loadAllPortList()]).then(function() {
        self.getData();
      });
    },
    methods: {
      initDialog() {
        var self = this;
        self.dialogVisible = true;
      },
      async getData() {
        var self = this;
        var hostUuid = self.hostEntity.id;
        var url = "api/nova/v2.1/servers/" + hostUuid + "/os-interface";
        self.loading = true;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url,
            showErrMsg: true
          });
          self.totalData = result['interfaceAttachments'];
          self.loading = false;
        } catch (res) {
          self.loading = false;
        }
      },
      async reloadTableData() {
        var self = this;
        var hostUuid = self.hostEntity.id;
        var url = "api/nova/v2.1/servers/" + hostUuid + "/os-interface";
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url,
            showErrMsg: true
          });
          self.totalData = result['interfaceAttachments'];
        } catch (res) {}
      },
      async loadRegularList(id) { //规则列表
        var self = this;
        var url = 'api/neutron/v2.0/qos/policies/' + id + "/bandwidth_limit_rules";
        self.loading = true;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url,
            showErrMsg: true
          });
          self.loading = false;
          var pList = result['bandwidth_limit_rules'];
        } catch (res) {
          self.loading = false;
        }
      },
      next() {
        if (this.multipleSelection.length !== 1) {
          this.$message.error(Vue.t('network.SELECT_ONE'));
          return;
        }
        let name = this.netNameRender('', this.multipleSelection[0]);
        this.$emit('next', { portID: this.multipleSelection[0]['port_id'], name });
      },
      rowClick(row) {
        this.$refs.umTable.toggleRowSelection(row);
      },
      handleCancel() {
        this.$emit("handleSecurityGroupFlag", {});
      },
      handleClose(done) {
        this.$emit("handleSecurityGroupFlag", {});
        done();
      },
      getCurrentData(param) {
        this.tableData = param;
      },
      netNameRender(value, row) {
        var self = this;
        var uuId = row['net_id'];
        return self.netCardMaps.get(uuId) || row['net_id'] || "-";
      },
      portNameRender(value, row) {
        var self = this;
        var uuId = row['port_id'];
        var portEntity = self.portCardMaps.get(uuId);
        var portShow = "";
        if (portEntity != null) {
          portShow = portEntity.name || portEntity.id;
        } else {
          portShow = uuId;
        }
        return portShow || "-";
      },
      cardIpRender(value, row) {
        var list = row['fixed_ips'];
        if (list != null && list.length > 0) {
          var results = "";
          for (let n = 0; n < list.length; n++) {
            var obj = list[n];
            results += obj['ip_address'] + "<br>";
          }
          return results;
        } else {
          return '-';
        }
      },
      sortChange(column) {
        var self = this;
        var key = "created_at";
        var columnOrder = column.order;
        var keyOrder = "desc";
        if ("descending" == columnOrder) {
          keyOrder = "desc";
        } else {
          keyOrder = "asc";
        }
        if (column.prop != "created") {
          key = column.prop;
        }
        if (key == "name") {
          key = "display_name";
        }
        if (key == "status") {
          key = "vm_state";
        }
        self.sortObj.sortOrder = keyOrder;
        self.sortObj.sortField = key;
        self.currentPage = 1;
        if (self.totalData != null && self.totalData.length > 0) {
          self.getData(1, key, keyOrder);
        }
        /*if (!column.prop) { return; }
        self.sortObj = {
          sortOrder:column.order,
          sortField:column.prop
        };*/
        /*var key = column.prop;
        var keyOrder = column.order;
        if (keyOrder != null && self.totalData != null) {
           self.totalData.sort(this.$sortFormatter(key, keyOrder));
        }*/
      },
      statusRender(row) {
        var status = row['port_state'];
        if (status === "ACTIVE") {
          return this.$t('lang.ACTIVE')
        } else if (status === "DOWN") {
          return this.$t('lang.DOWN')
        } else if (status === "BUILD") {
          return this.$t('lang.BUILD')
        } else if (status === "ERROR") {
          return this.$t('lang.ERROR')
        } else {
          return '-';
        }
      },
      onRefresh() {
        var self = this;
        self.$refs.umTable.clearSelection();
        self.reloadTableData();
      },
      confirmAddDisk() {
        var self = this;
        if (self.multipleSelection.length === 0) {
          self.$message({
            showClose: true,
            message: Vue.t('calcStorLang.netConfigChooseNet'),
            type: 'warning'
          });
        } else {
          self.$emit("handleFlag", {});
          self.$message(Vue.t('calcStorLang.netConfigSuccess'));
        }
      },
      handleCurrentChange(row) {
        let arg = row?[row]:[];
        this.multipleSelection = arg;
      },
      async loadSharedNetList() {
        var self = this;
        self.loading = true;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: 'api/neutron/v2.0/networks', //shared=true
            showErrMsg: true
          });
          self.loading = false;
          var list = result['networks'];
          var sharedList = [];
          for (let n = 0; n < list.length; n++) {
            var obj = list[n];
            if ("true" == (obj.shared + "")) {
              sharedList.push(obj);
            }
            self.netCardMaps.set(obj.id, obj.name);
          }
          return sharedList;
        } catch (res) {
          self.loading = false;
        }
      },
      async loadAllPortList() {
        var self = this;
        var url = 'api/neutron/v2.0/ports';
        self.loading = true;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url,
            showErrMsg: true
          });
          self.loading = false;
          var pList = result['ports'];
          // 过滤掉device_owner为network:reserved的数据 -- 预留地址功能支持
          pList = pList.filter((port) => {
            return port['device_owner'] !== 'network:reserved';
          });
          for (let p = 0; p < pList.length; p++) {
            var entity = pList[p];
            var portShow = entity.name || entity.id;
            self.portCardMaps.set(entity.id, entity);
          }
        } catch (res) {
          self.loading = false;
        }
      }
    }
  }

</script>
<style scoped>


</style>
