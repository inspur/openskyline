<template>
<div>
    <div class="operation-panel margin-tb5">
      <operation-panel
        :select-rows="multipleSelection"
        :operation-menus="operationMenus">
      </operation-panel>
      <!-- <el-button type="text" icon="fa-arrow-right" @click="onBack">返回</el-button> -->
    </div>
  <el-table
    ref="umTable"
    :data="tableData"
    highlight-current-row
    stripe
    border
    style="width: 100%"
    row-key="id"
    :default-sort="{prop: 'position'}"
    @sort-change="sortChange"
    v-loading="loading"
    :element-loading-text="$t('lang.loading')"
    @row-click="rowClick"
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      type="index"
      width="30">
    </el-table-column>
    <el-table-column
      reserve-selection
      type="selection"
      width="55">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('name') >= 0"
      :label="$t('lang.name')"
      prop="name"
      min-width="50">
    </el-table-column>
    <el-table-column
      v-if="false"
      :label="$t('storage.postion')" sortable="custom"
      prop="position"
      min-width="50">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('project_id') >= 0"
      :label="$t('lang.project')"
      prop="project_id"
      min-width="50">
      <template slot-scope="scope">
          <span v-html="projectToName(scope.row)"></span>
        </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('protocol') >= 0"
      prop="protocol"
      :label="$t('network.protocol')"
      min-width="50">
      <template slot-scope="scope">
        <span v-html="protocolRender(scope.row.protocol, scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('source_ip_address') >= 0"
      prop="source_ip_address"
      :label="$t('network.sourceIP')"
      min-width="50">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('source_port') >= 0"
      prop="source_port"
      :label="$t('network.sourcePorts')"
      min-width="50">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('destination_ip_address') >= 0"
      prop="destination_ip_address"
      :label="$t('network.targetIP')"
      min-width="50">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('destination_port') >= 0"
      prop="destination_port"
      :label="$t('network.destinationPort')"
      min-width="50">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('action') >= 0"
      prop="action"
      :label="$t('network.movement')"
      min-width="50">
      <template slot-scope="scope">
          <span v-html="allowRender(scope.row.action, scope.row)"></span>
        </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('shared') >= 0"
      prop="shared"
      :label="$t('network.share')"
      min-width="50">
      <template slot-scope="scope">
          <span v-html="sharedRender(scope.row.shared, scope.row)"></span>
        </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('enabled') >= 0"
      prop="enabled"
     :label="$t('network.active')"
      min-width="50">
      <template slot-scope="scope">
          <span v-html="sharedRender(scope.row.enabled, scope.row)"></span>
        </template>
    </el-table-column>
     <el-table-column
      v-if="columnsChecked.indexOf('description') >= 0"
      prop="description"
      :label="$t('lang.desc')"
      min-width="50">
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh">
        </el-button>
          <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('network.columnSelected')}}</el-tag>
            </div>
          </el-popover>
      </el-col>
      <el-col :span="19">
        <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
      </el-col>
    </el-row>
  </div>
  <insert-rule ref="insertRule" v-if="insertRuleFlag" @handleInsertRuleCancel="handleInsertRuleCancel" @handleInsertRuleShow="handleInsertRuleShow" :editId="editId" :editName="editName" :editProjectId="editProjectId" :ruleList="ruleList" :editruleIds="editruleIds"></insert-rule>
  <change-order v-if="changeOrderFlag" :tableData="totalData" :editId="editId" :editName="editName" @handleChangeOrderCancel="handleChangeOrderCancel "@handleChangeOrderShow="handleChangeOrderShow"></change-order>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import InsertRule from './InsertRule';
import ChangeOrder from './ChangeOrder'
export default {
  name: "firewallRule",
  components: {
    InsertRule,
    ChangeOrder
  },
  props: ["detailId", "editId", "editName", "editProjectId", "ruleList", "editruleIds"],
  data() {
    return {
      changeOrderFlag: false,
      loading: false,
      formInline: '',
      currentPage: 1,
      showBorder: true,
      addFlag: false,
      editFlag: false,
      insertRuleFlag: false,
      strategyList:[],
      totalData: [],
      idArray: [],
      sortObj:{
        sortOrder:"ascending",
        sortField:"position"
      },
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "project_id",
        label: Vue.t('lang.project')
      }, {
        prop: "protocol",
        label: Vue.t('network.protocol')
      }, {
        prop: "source_ip_address",
        label: Vue.t('network.sourceIP')
      }, {
        prop: "source_port",
        label: Vue.t('network.sourcePorts')
      }, {
        prop: "destination_ip_address",
        label: Vue.t('network.targetIP')
      }, {
        prop: "destination_port",
        label: Vue.t('network.destinationPort')
      }, {
        prop: "action",
        label: Vue.t('network.movement')
      }, {
        prop: "shared",
        label: Vue.t('network.share')
      }, {
        prop: "enabled",
        label: Vue.t('network.active')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }],
      columnsChecked: ['name', 'description', 'protocol', 'source_ip_address', 'source_port', 'destination_ip_address', 'destination_port', 'action', 'shared', 'enabled', 'project_id', 'position'],
      tableData: [],
      multipleSelection: [],
      operationMenus: [
        {
        icon: "fa-plus-square",
        name: Vue.t('network.addRule'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.insertRuleFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('network.removeRule'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          let self = this;
          self.$confirm(Vue.t('network.confirmremove'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            closeOnClickModal: false,
            callback: async (action, instance) => {
              if (action === "confirm") {
                self.loading = true;
                await self.removeRule(selectRows);
                await self.initialData();
                self.loading = false;
              }
            }
          }).then((data) => {
          }).catch((err) => {
          });
        }.bind(this)
      }, {
          icon: "fa-retweet",
          name: Vue.t('network.CHANGE_ORDER'),
          showflg: true,
          readOnly: true,
          multi: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            this.changeOrderFlag = true;
          }.bind(this)
        }, {
        icon: "fa-reply",
        name: Vue.t('lang.back'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.onBack();
        }.bind(this)
      }
      ]
    }
  },
  watch: {
    columnsChecked: {
      handler: function (rows, oldVal) {
       this.columnsChecked = rows;
      },
      deep: true
    }
  },
  mounted() {
      let ids = this.detailId;
      this.idArray = ids.split(",");
      this.getData(this.idArray);
  },
  methods: {
    protocolRender(value, row) {
      if (value === null || value === "") {
        return Vue.t('network.anything');
      }
      return value.toUpperCase();
    },
    handleChangeOrderCancel() {
      this.changeOrderFlag = false;
    },
    handleChangeOrderShow() {
      this.changeOrderFlag = false;
      this.initialData();
    },
    async removeRule(selectRows) {
      let self = this;
      if (selectRows.length) {
        let tableDatas = [].concat(self.totalData);
        let ruleName = "";
        let ruleID = [];
        try {
          for (let i = 0; i < selectRows.length; i++) {
            let rule = selectRows[i];
            let ruleId = rule.id;
            if (rule.name === "") {
              ruleName += rule.id + ',';
            } else {
              ruleName += rule.name + ',';
            }
            tableDatas.splice(tableDatas.findIndex( (v) => {
              return v.id === ruleId;
            }), 1);
          }
          for (let i = 0; i < tableDatas.length; i++) {
            ruleID.push(tableDatas[i].id);
          }
          ruleName = ruleName.substring(0, ruleName.length - 1);
          let reqdata = {
            "firewall_policy": {
              "firewall_rules": ruleID
            }
          };
          let message = Vue.t('network.firewallStrategy') + self.editName + Vue.t('network.successRemvoerule') + ruleName;
          self.loading = true;
          await self.$ajax({
            type: 'put',
            url: "api/neutron/v2.0/fw/firewall_policies/" + self.editId,
            data: JSON.stringify(reqdata),
            success: function(result) {
              self.$notify({
                message: message,
                type: "success"
              });
              self.loading = false;
            },
            errFun() {
              self.loading = false;
            },
            log:{
              description:{
                en:"Strategy "+self.editName + " remove rule: " + ruleName,
                zh_cn: "策略" + self.editName + "移除规则:" + ruleName
              },
              target:Vue.logTarget.firewallStrategy
            },
            errorKey: "NeutronError"
          })
        } catch (res) {
          self.loading = false;
        }
        return true;
      }
    },

    async getData(idArray) {
      var self = this;
      let data = [];
      this.totalData = [];
      try {
        for (let i = 0; i < idArray.length-1; i++) {
          let result = await self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/fw/firewall_rules/"+idArray[i],
            errorKey: "NeutronError"
          });
          if (result['firewall_rule'].name === "") {
            result['firewall_rule'].name =result['firewall_rule'].id;
          }
          this.totalData.push(result['firewall_rule']);
        }
      } catch (res) {
        self.loading = false;
      }
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleAddShow() {
      this.addFlag = false;
      this.getData();
    },
    handleEditShow() {
      this.editFlag = false;
    },
    handleEdit(index, row) {
    },
    handleDelete(index, row) {
    },
    handleInsertRuleShow() {
      this.insertRuleFlag = false;
      this.$refs.umTable.clearSelection();
      this.initialData();
    },
    handleInsertRuleCancel() {
      this.insertRuleFlag = false;
    },
    queryClick() {
      var self = this;
      self.initialData();
    },
    sharedRender(value, row) {
      if (value + "" == "true") {
        return Vue.t('lang.yes');
      } else {
        return Vue.t('lang.no');
      }
    },
     projectToName(row) {
      let proId = row["project_id"];
      let proList = Vue.projectListforNet;
      for (let i=0; i<proList.length; i++) {
        if (proId === proList[i]["id"]) {
          return proList[i]["name"];
        }
      }
    },
    allowRender(value, row) {
      if (value + "" == "allow") {
        return Vue.t('network.allow');
      } else if (value + "" == "reject") {
        return Vue.t('network.reject');
      } else {
        return Vue.t('network.deny');
      }
    },
    rowClick(row) {
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    async initialData() {
      const self = this;
      let dataMap = new Map();
      let data = [];
      //this.multipleSelection = [];
      this.$refs.umTable.clearSelection();
      try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/fw/firewall_rules?firewall_policy_id="+self.editId,
            errorKey: "NeutronError"
          });
          let rules = result["firewall_rules"];
          for (let i = 0; i < rules.length; i++) {
            dataMap.set(rules[i].position, rules[i]);
          }
          let temp = [];
          for (let i = 1; i < rules.length + 1; i++) {
            temp.push(dataMap.get(i));
          }
          self.totalData = temp;
      } catch (res) {
      }
    },
    onRefresh() {
      this.$refs.umTable.clearSelection();
      this.queryClick();
    },
    onBack() {
      this.$emit("onBack", {});
    }
  }
}
</script>
