<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>{{$t('network.qosRule')}}</span>
      <el-button style="float:right;padding:3px 0" size="small" type="text" @click="backToQoS()">{{$t('lang.back')}}</el-button>
    </div>
    <el-row>
      <el-col :span="24">
        <span>{{$t('network.qosStrategy')}}</span>:
        <label style="font-weight:bold">{{qosName}}</label>
      </el-col>
    </el-row>
    <div class="divider clearfix"></div>
    <div class="operation-panel margin-tb5">
      <el-button size="small" type="primary" icon="fa-plus" style="float:left;margin-right:5px;" @click="addRuleClick" :disabled="addDisabled">{{$t('network.CREATE_BROADBAND_SPEED_LIMIT_RULES')}}</el-button>
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
      <el-table ref="ruleTable" :data="ruleTableData" highlight-current-row stripe border style="width: 100%" row-key="id" v-loading="loading" :element-loading-text="$t('lang.loading')" @row-click="rowClick" @selection-change="handleSelectionChange">
        <el-table-column reserve-selection type="selection" width="55" align="center">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('type') >= 0" :label="$t('network.type')" prop="type" min-width="100">
          <template slot-scope="scope">
            <span>Bandwidth</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('direction') >= 0" :label="$t('network.direction')" prop="direction" min-width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.direction==='ingress'">{{$t('network.entrance')}}</span>
            <span v-if="scope.row.direction==='egress'">{{$t('network.chukou')}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('max_kbps') >= 0" prop="max_kbps" :label="$t('network.maxkbpx')" min-width="100">
          <template slot-scope="scope">
            <span v-html="KbToKB(scope.row.max_kbps)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('max_burst_kbps') >= 0" prop="max_burst_kbps" :label="$t('network.burstkbps')" min-width="100">
          <template slot-scope="scope">
            <span v-html="KbToKB(scope.row.max_burst_kbps)"></span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
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
    <div class="divider clearfix"></div>
    <div class="operation-panel margin-tb5">
      <el-button size="small" type="primary" icon="fa-plus" style="float:left;margin-right:5px;" @click="dscpAddRuleClick" :disabled="addDscpDisabled">{{$t('network.CREATE_DSCP_RULES')}}</el-button>
      <operation-panel :select-rows="dscpMultipleSelection" :operation-menus="dscpOperationMenus" style="display:inline-block;">
      </operation-panel>
      <el-tooltip  effect="dark" :content="isCN?'浮动IP不支持此规则':'Floating IP does not support this rule'" placement="top">
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
      <el-table ref="dscpRuleTable" :data="dscpRuleTableData" highlight-current-row stripe border style="width: 100%" row-key="id" v-loading="loading" :element-loading-text="$t('lang.loading')" @row-click="dscpRowClick" @selection-change="dscpHandleSelectionChange">
        <el-table-column reserve-selection type="selection" width="55" align="center">
        </el-table-column>
        <el-table-column v-if="dscpColumnsChecked.indexOf('type') >= 0" :label="$t('network.type')" prop="type" min-width="100">
          <template slot-scope="scope">
            <span>DSCP</span>
          </template>
        </el-table-column>
        <el-table-column v-if="dscpColumnsChecked.indexOf('direction') >= 0" :label="$t('network.direction')" prop="direction" min-width="100">
          <template slot-scope="scope">
            <span>{{$t('network.chukou')}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="dscpColumnsChecked.indexOf('dscp_mark') >= 0" prop="dscp_mark" :label="$t('network.dscpmark')" min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.dscp_mark}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="dscpOnRefresh"></el-button>
            <span>{{$t("lang.currentSelected")}} {{dscpMultipleSelection.length}}{{$tc('lang.item', dscpMultipleSelection.length)}}</span>
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="dscpColumnsChecked">
                <el-checkbox class="item" v-for="(item, index) in dscpColumns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" class="name-wrapper">
                <el-tag>{{$t('network.columnSelected')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="19">
            <page :totalData="dscpTotalData" @getCurrentData="getDscpCurrentData"></page>
          </el-col>
        </el-row>
      </div>
    </div>
    <add-rule ref="addrule" v-if="addRuleFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow" :qosName="qosName" :datas="totalData"></add-rule>
    <edit-rule ref="editrule" v-if="editRuleFlag" @handleEditShow="handleEditShow" @handleCancelShow="handleCancelShow" :editRow="editRow" :qosName="qosName"></edit-rule>
    <add-dscp-rule ref="addDscprule" v-if="addDscpRuleFlag" @handleAddShow="dscpHandleAddShow" @handleCancelShow="dscpHandleCancelShow" :qosName="qosName" :datas="dscpTotalData"></add-dscp-rule>
    <edit-dscp-rule ref="editDscprule" v-if="dscpEditRuleFlag" @handleEditShow="dscpHandleAddShow" @handleCancelShow="dscpHandleCancelShow" :editRow="dscpEditRow" :qosName="qosName"></edit-dscp-rule>
  </el-card>
</template>
<script type="text/javascript">
import AddRule from "./AddRule";
import AddDscpRule from "./AddDscpRule";
import EditRule from "./EditRule";
import EditDscpRule from "./EditDscpRule";
export default {
  name: "RuleList",
  components: {
    AddRule,
    EditRule,
    AddDscpRule,
    EditDscpRule
  },
  data() {
    return {
      isCN: Vue.config.lang == "zh-cn",
      loading: false,
      dialogVisible: false,
      addRuleFlag: false,
      addDscpRuleFlag: false,
      editRuleFlag: false,
      dscpEditRuleFlag: false,
      addDisabled: false,
      addDscpDisabled: false,
      editRow: "",
      dscpEditRow: "",
      columns: [
        {
          prop: "type",
          label: Vue.t("network.type")
        },
        {
          prop: "direction",
          label: Vue.t("network.direction")
        },
        {
          prop: "max_kbps",
          label: Vue.t("network.maxkbpx")
        },
        {
          prop: "max_burst_kbps",
          label: Vue.t("network.burstkbps")
        }
      ],
      dscpColumns: [
        {
          prop: "type",
          label: Vue.t("network.type")
        },
        {
          prop: "direction",
          label: Vue.t("network.direction")
        },
        {
          prop: "dscp_mark",
          label: Vue.t("network.dscpmark")
        }
      ],
      qosName: "",
      columnsChecked: ["direction", "type", "max_kbps", "max_burst_kbps"],
      dscpColumnsChecked: ["direction", "type", "dscp_mark"],
      ruleTableData: [],
      dscpRuleTableData: [],
      totalData: [],
      dscpTotalData: [],
      multipleSelection: [],
      dscpMultipleSelection: [],
      operationMenus: [
        {
          icon: "fa-edit",
          name: Vue.t("lang.modify"),
          showflg: true,
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            let self = this;
            self.editRuleFlag = true;
            self.editRow = selectRows[0];
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: Vue.t("lang.delete"),
          showflg: true,
          multi: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            let self = this;
            self.$confirm(
              Vue.t("network.confirmSimpleDelete"),
              Vue.t("network.attention"),
              {
                confirmButtonText: Vue.t("lang.confirm"),
                cancelButtonText: Vue.t("lang.cancel"),
                closeOnClickModal: false,
                type: "warning",
                callback: (action, instance) => {
                  if (action === "confirm") {
                    self.loading = true;
                    self.$refs.ruleTable.clearSelection();
                    self
                      .$sequence({
                        type: "DELETE",
                        url:
                          "api/neutron/v2.0/qos/policies/" +
                          self.$route.params.qosId +
                          "/bandwidth_limit_rules/{id}",
                        params: selectRows,
                        data: {},
                        errorKey: "NeutronError",
                        log: {
                          description: {
                            en:
                              "QoS Policy " + self.qosName + ":Delete QoS Rule",
                            zh_cn: "QoS策略" + self.qosName + ":删除带宽限速规则"
                          },
                          target: Vue.logTarget.qosList
                        },
                        successFun: function() {
                          self.addDisabled = false;
                          self.loading = false;
                          self.getData();
                        },
                        errFun: function() {
                          self.addDisabled = false;
                          self.loading = false;
                          self.getData();
                        }
                      })
                      .then(data => {
                        self.$message(Vue.t("network.deleteSuccess"));
                      })
                      .catch(err => {});
                  } else {
                  }
                }
              }
            );
          }.bind(this)
        }
      ],
      dscpOperationMenus: [
        {
          icon: "fa-edit",
          name: Vue.t("lang.modify"),
          showflg: true,
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            let self = this;
            self.dscpEditRuleFlag = true;
            self.dscpEditRow = selectRows[0];
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: Vue.t("lang.delete"),
          showflg: true,
          multi: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            let self = this;
            self.$confirm(
              Vue.t("network.confirmSimpleDelete"),
              Vue.t("network.attention"),
              {
                confirmButtonText: Vue.t("lang.confirm"),
                cancelButtonText: Vue.t("lang.cancel"),
                closeOnClickModal: false,
                type: "warning",
                callback: (action, instance) => {
                  if (action === "confirm") {
                    self.loading = true;
                    self.$refs.dscpRuleTable.clearSelection();
                    self
                      .$sequence({
                        type: "DELETE",
                        url:
                          "api/neutron/v2.0/qos/policies/" +
                          self.$route.params.qosId +
                          "/dscp_marking_rules/{id}",
                        params: selectRows,
                        data: {},
                        errorKey: "NeutronError",
                        log: {
                          description: {
                            en:
                              "QoS Policy " + self.qosName + ":Delete DSCP Rule",
                            zh_cn: "QoS策略" + self.qosName + ":删除DSCP规则"
                          },
                          target: Vue.logTarget.qosList
                        },
                        successFun: function() {
                          self.addDscpDisabled = false;
                          self.loading = false;
                          self.getDscpData();
                        },
                        errFun: function() {
                          self.addDscpDisabled = false;
                          self.loading = false;
                          self.getDscpData();
                        }
                      })
                      .then(data => {
                        self.$message(Vue.t("network.deleteSuccess"));
                      })
                      .catch(err => {});
                  } else {
                  }
                }
              }
            );
          }.bind(this)
        }
      ]
    };
  },
  mounted() {
    this.getData();
    this.getDscpData();
  },
  methods: {
    async getData() {
      let self = this;
      try {
        self.loading = true;
        self.totalData = [];
        let result = await self.$ajax({
          type: "GET",
          url:
            "api/neutron/v2.0/qos/policies/" +
            self.$route.params.qosId +
            "/bandwidth_limit_rules",
          errorKey: "NeutronError",
          showErrMsg: false,
          errFun() {
            self.$router.push({
              path: "/net/qosView"
            });
          }
        });
        self.totalData = result["bandwidth_limit_rules"];
        self.getQoSDetail();
        if (self.totalData.length > 1) {
          self.addDisabled = true;
        } else {
          self.addDisabled = false;
        }
        self.loading = false;
        self.$refs.ruleTable.clearSelection();
      } catch (res) {}
    },
    async getDscpData() {
      let self = this;
      try {
        self.loading = true;
        self.dscpTotalData = [];
        let result = await self.$ajax({
          type: "GET",
          url:
            "api/neutron/v2.0/qos/policies/" +
            self.$route.params.qosId +
            "/dscp_marking_rules",
          errorKey: "NeutronError",
          showErrMsg: false,
          errFun() {
            self.$router.push({
              path: "/net/qosView"
            });
          }
        });
        self.dscpTotalData = result["dscp_marking_rules"];
        self.getQoSDetail();
        if (self.dscpTotalData.length > 0) {
          self.addDscpDisabled = true;
        } else {
          self.addDscpDisabled = false;
        }
        self.loading = false;
        self.$refs.dscpRuleTable.clearSelection();
      } catch (res) {}
    },
    getCurrentData(param) {
      this.ruleTableData = param;
    },
    getDscpCurrentData(param) {
      this.dscpRuleTableData = param;
    },
    getQoSDetail() {
      let self = this;
      self.$ajax({
        type: "get",
        url: "api/neutron/v2.0/qos/policies/" + self.$route.params.qosId,
        showErrMsg: false,
        complete: function(XMLHttpRequest, textStatus) {},
        success: function(result) {
          let policyInfo = result["policy"];
          self.qosName = policyInfo["name"];
        },
        errorKey: "NeutronError"
      });
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    backToQoS() {
      this.$router.push({
        path: "/net/qosView"
      });
    },
    addRuleClick() {
      this.addRuleFlag = true;
    },
    dscpAddRuleClick() {
      this.addDscpRuleFlag = true;
    },
    handleAddShow() {
      this.addRuleFlag = false;
      this.getData();
    },
    dscpHandleAddShow() {
      this.addDscpRuleFlag = false;
      this.dscpEditRuleFlag = false;
      this.getDscpData();
    },
    handleEditShow() {
      this.editRuleFlag = false;
      this.getData();
    },
    handleCancelShow() {
      this.addRuleFlag = false;
      this.editRuleFlag = false;
    },
    dscpHandleCancelShow() {
      this.addDscpRuleFlag = false;
      this.dscpEditRuleFlag = false;
    },
    onRefresh() {
      this.getData();
    },
    dscpOnRefresh() {
      this.getDscpData();
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.ruleTable.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    dscpHandleSelectionChange(val) {
      this.dscpMultipleSelection = val;
    },
    rowClick(row) {
      this.$refs.ruleTable.toggleRowSelection(row);
    },
    dscpRowClick(row) {
      this.$refs.dscpRuleTable.toggleRowSelection(row);
    },
    KbToKB(value) {
      let KBValue = 0;
      KBValue = parseInt(parseInt(value)/8)
      return KBValue;
    }
  }
};
</script>
