<template>
  <el2-dialog :title="$t('network.editQosstrategy')"
    :visible="true"
    :append-to-body="true"
    :close-on-click-modal="false"
    width="900px"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-12"  v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
         <el-input class="col-12" type="textarea"  v-model="form.description"></el-input>
      </el-form-item>
    </el-form>
    <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>{{$t('network.qosRule')}}</span>
    </div>
    <div class="operation-panel margin-tb5">
      <el-button size="small" type="primary" icon="fa-plus" style="float:left;margin-right:5px;" @click="addRuleClick" :disabled="addDisabled">{{$t('network.CREATE_BROADBAND_SPEED_LIMIT_RULES')}}</el-button>
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
      <el-table ref="ruleTable" :data="ruleTableData" highlight-current-row stripe border style="width: 100%" row-key="id" v-loading="loadingTop" :element-loading-text="$t('lang.loading')" @row-click="rowClick" @selection-change="handleSelectionChange">
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
    </div>
    <div class="divider clearfix"></div>
    <div class="operation-panel margin-tb5">
      <el-button size="small" type="primary" icon="fa-plus" style="float:left;margin-right:5px;" @click="dscpAddRuleClick" :disabled="addDscpDisabled">{{$t('network.CREATE_DSCP_RULES')}}</el-button>
      <operation-panel :select-rows="dscpMultipleSelection" :operation-menus="dscpOperationMenus" style="display:inline-block;">
      </operation-panel>
      <el-tooltip  effect="dark" :content="isCN?'浮动IP不支持此规则':'Floating IP does not support this rule'" placement="top">
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
      <el-table ref="dscpRuleTable" :data="dscpRuleTableData" highlight-current-row stripe border style="width: 100%" row-key="id" v-loading="loadingBottom" :element-loading-text="$t('lang.loading')" @row-click="dscpRowClick" @selection-change="dscpHandleSelectionChange">
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
                <el-checkbox class="item" v-for="item in dscpColumns" :label="item.prop" :key="item.prop">{{item.label}}
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
    </el-card>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmEdit" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
    <add-rule ref="addrule" v-if="addRuleFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow" :qosName="qosName" :qosId="qosId" :datas="totalData"></add-rule>
    <edit-rule ref="editrule" v-if="editRuleFlag" @handleEditShow="handleEditShow" @handleCancelShow="handleCancelShow" :editRow="editRow" :qosName="qosName" :qosId="qosId"></edit-rule>
    <add-dscp-rule ref="addDscprule" v-if="addDscpRuleFlag" @handleAddShow="dscpHandleAddShow" @handleCancelShow="dscpHandleCancelShow" :qosName="qosName" :qosId="qosId" :datas="dscpTotalData"></add-dscp-rule>
    <edit-dscp-rule ref="editDscprule" v-if="dscpEditRuleFlag" @handleEditShow="dscpHandleAddShow" @handleCancelShow="dscpHandleCancelShow" :editRow="dscpEditRow" :qosName="qosName" :qosId="qosId"></edit-dscp-rule>
  </el2-dialog>  
</template>
<script type="text/javascript">
import AddRule from "./AddRule";
import AddDscpRule from "./AddDscpRule";
import EditRule from "./EditRule";
import EditDscpRule from "./EditDscpRule";
export default {
  name:"QoSRuleManage",
  props: ["qosRow"],
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
      loadingTop: false,
      loadingBottom: false,
      dialogVisible: false,
      addRuleFlag: false,
      addDscpRuleFlag: false,
      editRuleFlag: false,
      dscpEditRuleFlag: false,
      addDisabled: false,
      addDscpDisabled: false,
      isDisabled: false,
      qosId: "",
      form: {
        name: "",
        description: ""
      },
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'requiredNet'},
          {type: 'maxSize', value: 40}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ]
      },
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
                    self.loadingTop = true;
                    self.$refs.ruleTable.clearSelection();
                    self.$sequence({
                        type: "DELETE",
                        url:"api/neutron/v2.0/qos/policies/" +self.qosRow["id"] +"/bandwidth_limit_rules/{id}",
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
                          self.loadingTop = false;
                          self.getData();
                        },
                        errFun: function() {
                          self.addDisabled = false;
                          self.loadingTop = false;
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
                    self.loadingBottom = true;
                    self.$refs.dscpRuleTable.clearSelection();
                    self
                      .$sequence({
                        type: "DELETE",
                        url:"api/neutron/v2.0/qos/policies/"+self.qosRow["id"]+"/dscp_marking_rules/{id}",
                        params: selectRows,
                        data: {},
                        errorKey: "NeutronError",
                        log: {
                          description: {
                            en:"QoS Policy " + self.qosName + ":Delete DSCP Rule",
                            zh_cn: "QoS策略" + self.qosName + ":删除DSCP规则"
                          },
                          target: Vue.logTarget.qosList
                        },
                        successFun: function() {
                          self.addDscpDisabled = false;
                          self.loadingBottom = false;
                          self.getDscpData();
                        },
                        errFun: function() {
                          self.addDscpDisabled = false;
                          self.loadingBottom = false;
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
    this.initDialog();
    this.getData();
    this.getDscpData();
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
      this.form.name = this.qosRow["name"];
      this.form.description = this.qosRow["description"];
      this.qosId = this.qosRow["id"];
    },
    async getData() {
      let self = this;
      try {
        self.loadingTop = true;
        self.totalData = [];
        let result = await self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/qos/policies/" + self.qosRow["id"] + "/bandwidth_limit_rules",
          errorKey: "NeutronError",
          showErrMsg: false,
          errFun() {
          }
        });
        self.totalData = result["bandwidth_limit_rules"];
        self.getQoSDetail();
        if (self.totalData.length > 1) {
          self.addDisabled = true;
        } else {
          self.addDisabled = false;
        }
        self.loadingTop = false;
        self.$refs.ruleTable.clearSelection();
      } catch (res) {}
    },
    async getDscpData() {
      let self = this;
      try {
        self.loadingBottom = true;
        self.dscpTotalData = [];
        let result = await self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/qos/policies/" + self.qosRow["id"] + "/dscp_marking_rules",
          errorKey: "NeutronError",
          showErrMsg: false,
          errFun() {
          }
        });
        self.dscpTotalData = result["dscp_marking_rules"];
        self.getQoSDetail();
        if (self.dscpTotalData.length > 0) {
          self.addDscpDisabled = true;
        } else {
          self.addDscpDisabled = false;
        }
        self.loadingBottom = false;
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
        url: "api/neutron/v2.0/qos/policies/" + self.qosRow["id"],
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
      this.$emit("handleQosShow", {});
      done();
    },
    handleCancelShow() {
      this.addRuleFlag = false;
      this.editRuleFlag = false;
    },
    cancel() {
      this.$emit("handleQosShow", {});
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
    },
    confirmEdit() {
      let self = this;
      let name = self.form.name;
      let desc = self.form.description;
      let reqdata = {"policy":{"name": name, "description": desc}};
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          try {
            self.isDisabled = true;
            self.loading = true;
            let ajaxReq = {
              type: "PUT",
              url: "api/neutron/v2.0/qos/policies/"+self.qosRow["id"],
              data: JSON.stringify(reqdata),
              successMsg: Vue.t('network.saveSuccess'),
              complete: function(XMLHttpRequest, textStatus) {
                self.loading = false;
                self.isDisabled = false;
                self.$emit("handleQosShow", {});
              },
              success: function(result) {
                self.$emit("handleQosShow", {});
              },
              errorKey: "NeutronError"
            };

            if (self.qosRow["name"] != name) {
              ajaxReq.log = {
                description:{
                  en:"Before edit QoS:"+self.qosRow["name"]+", After edit QoS:" + name,
                  zh_cn:"QoS策略名称修改前："+self.qosRow["name"]+"，QoS策略名称修改后:" + name
                },
                target:Vue.logTarget.qosList
              };
            }
            let result = self.$ajax(ajaxReq);
          } catch (res) {
          }
        } else {
          return false;
        }
     });
    }
  }
};
</script>
