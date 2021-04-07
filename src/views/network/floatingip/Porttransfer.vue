<template>
  <div>
    <el-dialog :title="$t('network.floatingIP')+$t('network.portTransfer')" :visible.sync="visible" :before-close="handleClose">
      <div>
        <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
        </operation-panel>
        <el-table ref="specTable" :data="tableData" v-loading="loading" :element-loading-text="$t('calcStorLang.dataLoading')" highlight-current-row border stripe style="width: 100%;" slot="empty" max-height='500' row-key="key" @selection-change="handleSelectionChange">
          <el-table-column reserve-selection type="selection" align="center" width="55">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('protocol') >= 0" prop="protocol" :label="$t('network.protocol')" align="left" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('internal_port_id') >= 0" prop="internal_ip_address" :label="$t('network.portConnectedIP')" align="left" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('internal_port') >= 0" prop="internal_port" :label="$t('network.innerPort')" align="left" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('external_port') >= 0" prop="external_port" align="left" :label="$t('network.extPort')" min-width="100">
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="loadData">
              </el-button>
              <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc('lang.item', multipleSelection.length)}}</span>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
                <div slot="reference" style="display: inline-block;">
                  <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
                </div>
              </el-popover>
            </el-col>
            </el-col>
            <el-col :span="19">
              <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
            </el-col>
          </el-row>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose">{{$t('lang.close')}}</el-button>
      </div>
    </el-dialog>
    <add-porttransfer v-if="addFlag" @refresh="onRefresh" :netId="entity.floating_network_id" :floatip="entity.floating_ip_address" :floatipId="entity.id" :proId="entity.project_id" @hide="addFlag=false" :type='porttransferType' :entity='entity_'></add-porttransfer>
  </div>
</template>
<script>
import AddPorttransfer from './AddPorttransfer';
export default {
  props: ["entity"],
  components: {
    AddPorttransfer
  },
  watch: {
  },
  data() {
    return {
      entity_: {},
      porttransferType: 'add',
      multipleSelection: [],
      visible: true,
      isDisabled: false,
      addFlag: false,
      operationMenus: [
        {
          icon: "fa-plus",
          name: Vue.t('calcStorLang.create'),
          showflg: true,
          readOnly: true,
          handler: function (selectRows) {
            let me = this;
            me.addFlag = true;
            me.porttransferType = 'add';
          }.bind(this)
        }, {
          icon: "fa-edit",
          name: Vue.t('network.modify'),
          showflg: true,
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function (selectRows) {
            this.entity_ = selectRows[0];
            this.addFlag = true;
            this.porttransferType = 'modify';
          }.bind(this)
        }, {
          icon: "fa-times",
          name: Vue.t('lang.delete'),
          showflg: true,
          multi: true,
          enable(rowData) {
            return true;
          },
          handler: function (selectRows) {
            this.deletePort(selectRows);
          }.bind(this)
        }],
      tableData: [],
      totalData: [],
      loading: false,
      columnsChecked: ["protocol", "internal_port_id", "internal_port", "external_port"],
      columns: [{
        prop: "protocol",
        label: Vue.t('network.protocol')
      }, {
        prop: "internal_port_id",
        label: Vue.t('network.portConnectedIP')
      }, {
        prop: "internal_port",
        label: Vue.t('network.innerPort')
      }, {
        prop: "external_port",
        label: Vue.t('network.extPort')
      }]
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      var self = this;
      var url = "api/neutron/v2.0/floatingips/" + this.entity.id + "/port_forwardings";
      let result = await self.$ajax({
        type: 'get',
        url: url
      });
      self.totalData = [];
      self.totalData = result['port_forwardings'];
    },
    deletePort(selectRows) {
      let self = this;
      self.$confirm(Vue.t('network.confirmDelPortTransfer'), Vue.t('network.attention'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        type: "warning",
        closeOnClickModal: false,
        callback: (action, instance) => {
          if (action === "confirm") {
            self.loading = true;
            self.$refs.specTable.clearSelection();
            self.$sequence({
              type: 'delete',
              url: "api/neutron/v2.0/floatingips/" + self.entity.id + "/port_forwardings/{id}",
              params: selectRows,
              errorKey: "NeutronError",
              log: {
                description: {
                  en: "Delete FloatingIP:" + self.entity.floating_ip_address + "port transfer",
                  zh_cn: "删除浮动IP:" + self.entity.floating_ip_address + "的端口转发"
                },
                key: "name",
                target: Vue.logTarget.floatingIP
              }
            }).then((data) => {
              self.$message(Vue.t('lang.sendDeleteSuccess'));
              setTimeout(function () {
                self.loadData();
                self.$emit("refresh");
                self.loading = false;
              }, 1000);
            }).catch((err) => {
              self.loading = false;
            });
          }
        }
      }).then((data) => {
      }).catch((err) => {
      });
    },
    handleClose() {
      this.$emit("hide");
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh(v) {
      this.loadData();
      this.$refs.specTable.clearSelection();
      this.$emit("refresh");
    },
    getCurrentData(param) {
      this.tableData = param;
    }
  }
}
</script>
