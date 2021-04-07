<template>
<div>
  <div v-show="firewallStrategyVisable">
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel margin-tb5">
      <operation-panel
        :select-rows="multipleSelection"
        :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
  <el-table
    ref="umTable"
    :data="tableData"
    highlight-current-row
    stripe
    border
    style="width: 100%"
    row-key="id"
    v-loading="loading"
    :element-loading-text="$t('lang.loading')"
    :default-sort="{prop: 'name'}"
    @row-click="rowClick" @sort-change="sortChange"
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      type="selection"
      width="55" align="center">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('name') >= 0"
      :label="$t('lang.name')"
      align="left"
      prop="name" sortable="custom"
      min-width="100">
      <template slot-scope="scope">
        <el-button @click="showRuleDetail(scope.row)" type="text"  size="mini">{{scope.row.name}}</el-button>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('project_id') >= 0"
      :label="$t('lang.project')"
      prop="project_id"
      min-width="100">
      <template slot-scope="scope">
          <span v-html="projectToName(scope.row)"></span>
        </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('firewall_rules') >= 0"
      prop="firewall_rules"
      align="left"
      :label="$t('network.rule')"
      min-width="100">
      <template slot-scope="scope" v-if="scope.row.firewall_rules.length">
        <el-popover placement="top"  ref="pop" trigger="hover" class="cover-pop">
          <div class="cover-pop">
            <p v-for="(item,i) in showRuleNames(scope.row).split(',')">{{item}}</p>
          </div>
        </el-popover>
        <el-button @click="showRuleDetail(scope.row)" v-popover:pop type="text" slot="reference" >{{showRuleNames(scope.row)}}</el-button>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('audited') >= 0"
      prop="audited"
      :label="$t('network.whetherAudit')"
      align="left"
      min-width="50">
      <template slot-scope="scope">
          <span v-html="sharedRender(scope.row.audited, scope.row)"></span>
        </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('description') >= 0"
      prop="description"
      :label="$t('lang.desc')"
      min-width="100">
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
        <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" :objStorFlag="true"></page>
      </el-col>
    </el-row>
    <add-firewallstrategy ref="addfirewallStrategy" v-if="addFlag" @handleAddShow="handleAddShow"></add-firewallstrategy>
    <edit-firewallstrategy ref="editfirewallStrategy" v-if="editFlag" @handleEditShow="handleEditShow" @handleEditCancelShow="handleEditCancelShow" :editId="editId" :editName="editName" :editDesc="editDesc" :editaudited="editaudited" :editshared="editshared"></edit-firewallstrategy>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</div>
<firewallrule-detail ref="FirewallruleDetail" v-if="ruleDetailFlag" @onBack="onBack" @handleAddShow="handleAddShow"
:editId="editId" :editName="editName" :editProjectId="editProjectId" :ruleList="ruleList" :editruleIds="editruleIds"
:detailId="detailId"></firewallrule-detail>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import AddFirewallstrategy from './AddStrategy';
import EditFirewallstrategy from './EditStrategy';
import FirewallruleDetail from './FirewallruleDetail';
import {onlyLetterNumberChinese} from '../validator/validator';
export default {
  name: "firewallStrategy",
  components: {
    AddFirewallstrategy, EditFirewallstrategy, FirewallruleDetail
  },
  data() {
    return {
      searchBar: {
        conditions: {
          query_name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: onlyLetterNumberChinese
          },
          query_porject: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          },
          query_shenji: {
            label: this.$t('network.shenji'),
            type: 'select',
            options: [{
              label: this.$t('lang.yes'),
              value: 'true'
            }, {
              label: this.$t('lang.no'),
              value: 'false'
            }]
          }
        }
      },
      searchBarValidatedParams: {},
      formInline: '',
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      loading: false,
      showBorder: true,
      firewallStrategyVisable: true,
      addFlag: false,
      insertRuleFlag: false,
      removeRuleFlag: false,
      editFlag: false,
      ruleDetailFlag: false,
      roleType: Vue.roleType + "",
      query_name: "",
      query_share: "",
      query_shenji: "",
      query_porject: "",
      projectName:"",
      selProjectFlg:false,
      close: "",
      rulenames: "",
      detailId: "",
      ruleNames: "",
      editruleIds: [],
      editName: "",
      editDesc: "",
      editId: "",
      editaudited: "",
      editshared: false,
      editProjectId: "",
      projectOption: [],
      ruleList:[],
      totalData: [],
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "project_id",
        label: Vue.t('lang.project')
      }, {
        prop: "firewall_rules",
        label: Vue.t('network.rule')
      }, {
        prop: "audited",
        label: Vue.t('network.whetherAudit')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }],
      columnsChecked: ['name', 'description', 'firewall_rules', 'audited', 'project_id'],
      tableData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.createStrategy'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.addFlag = true;
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: Vue.t('network.modify'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          this.editFlag = true;
          var row = selectRows[0];
          self.editId = row["id"];
          self.editName = row["name"];
          self.editDesc = row["description"];
          self.editaudited = row["audited"];
          self.editshared = row["shared"];
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          let self = this;
          self.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            closeOnClickModal: false,
            callback: (action, instance) => {
              if (action === "confirm") {
                self.loading = true;
                self.$refs.umTable.clearSelection();
                self.$sequence({
                  type: 'delete',
                  url: "api/neutron/v2.0/fw/firewall_policies/{id}",
                  params: selectRows,
                  errorKey: "NeutronError",
                  log:{
                    description:{
                      en:"Delete Firewall Strategy",
                      zh_cn:"删除防火墙策略"
                    },
                    key: "name",
                    target:Vue.logTarget.firewallStrategy
                  }
                }).then((data) => {
                  self.$message(Vue.t('lang.sendDeleteSuccess'));
                  setTimeout(function() {
                    self.getCallback();
                    self.loading = false;
                  }, 1000);
                }).catch((err) => {
                  self.getCallback();
                  self.loading = false;
                });
              }
            }
          }).then((data) => {
          }).catch((err) => {
          });
        }.bind(this)
      }]
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
    self.firewallStrategyVisable = true;
    this.getCallback();
  },
  methods: {
    handleSearch(params) {
      let self = this;
      this.searchBarValidatedParams = params;
      self.$refs.umTable.clearSelection();
      self.getData();
    },
    async getData() {
      let self = this;
      let name = self.searchBarValidatedParams.query_name || "";
      let projectid = self.searchBarValidatedParams.query_porject || "";
      let audited = self.searchBarValidatedParams.query_shenji || "";
      let shared = self.query_share;
      let data = [];
      try {
        let roleType = Vue.roleType + "";
        if (roleType == "0") {
        } else {
          projectid = Vue.cookie.get('pid');
        }
        this.loading = true;
        let p = {};
        if (projectid != null && projectid != "") {
          p.project_id = projectid;
        }
        if (audited != null && audited != "") {
          p.audited = audited;
        }
        if (shared != null && shared != "") {
          p.shared = shared;
        }
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/fw/firewall_policies?" + $.param(p),
          errorKey: "NeutronError"
        });
        let tempArr = result['firewall_policies'];
        self.totalData = [];
        for (let i =0; i< tempArr.length; i++) {
          let fpolicy = tempArr[i];
          if (fpolicy.name.indexOf(name) >=0) {
            self.totalData.push(fpolicy);
          }
        }
        self.loading = false;
      } catch (res) {
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    getCallback() {
      let self = this;
      let roleType = Vue.roleType + "";
      if (roleType == "0") {
        Promise.all([self.getProjectList(), self.getRules()]).then(function(result) {
          self.getData();
        });
      } else {
        Promise.all([self.getProjectInUser(), self.getRules()]).then(function(result) {
          self.getData();
        });
      }
    },
    handleAddShow() {
      this.addFlag = false;
      this.getCallback();
    },
    handleEditShow() {
      this.editFlag = false;
      this.$refs.umTable.clearSelection();
      this.getData();
    },
    handleEditCancelShow() {
      this.editFlag = false;
    },
    handleInsertRuleCancel() {
      this.insertRuleFlag = false;
    },
    handleInsertRuleShow() {
      this.insertRuleFlag = false;
      this.$refs.umTable.clearSelection();
      this.getData();
    },
    handleRemoveRuleCancel() {
      this.removeRuleFlag = false;
    },
    handleRemoveRuleShow() {
      this.removeRuleFlag = false;
      this.$refs.umTable.clearSelection();
      this.getData();
      /*setTimeout( function() {
        self.getData();
      }, 1000);*/
    },
    showRuleNames(row) {
      let rowList = row["firewall_rules"];
      let ruleNames = "";
      for (var i = 0; i <= rowList.length - 1; i++) {
        for (var j = this.ruleList.length - 1; j >= 0; j--) {
            if (rowList[i] === this.ruleList[j].id) {
              if (this.ruleList[j].name === "") {
                this.ruleList[j].name = this.ruleList[j].id;
              }
              if (i === rowList.length - 1) {
                ruleNames += this.ruleList[j].name;
              } else {
                ruleNames += this.ruleList[j].name + ",";
              }
              continue;
            }
        }
      }
      return ruleNames;
    },
    showRuleDetail(row) {
      let rowList = row["firewall_rules"];
      this.firewallStrategyVisable = false;
      this.ruleDetailFlag = true;
      let ids = "";
      for (var i = 0; i <= rowList.length - 1; i++) {
        ids += rowList[i]+",";
      }
      this.editId = row["id"];
      this.editName = row["name"];
      this.editProjectId = row["project_id"];
      this.editruleIds = row["firewall_rules"];
      this.detailId = ids;
      this.$refs.umTable.toggleRowSelection(row);
      this.getData();
    },
    async getRules() {
        try {
          let resultData = await this.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/fw/firewall_rules"
        });
        this.ruleList = resultData['firewall_rules'];
        } catch (res) {
      }
    },
    onBack() {
      this.ruleDetailFlag = false;
      this.firewallStrategyVisable = true;
      this.getData();
    },
    async getProjectList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default"
        });
        Vue.projectListforNet = result["projects"];
        this.projectOption = Vue.projectListforNet;
        this.searchBar.conditions.query_porject.options = result.projects.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (res) {
      }
    },
    getProjectInUser() {
      let self = this;
      self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/fw/firewall_policies?project_id="+Vue.cookie.get('pid'),
        errorKey: "NeutronError",
        success: function(result) {
          let firewalls = result['firewall_policies'];
          for (let i = 0; i < firewalls.length; i++) {
            let fw = firewalls[i];
            self.$ajax({
              type: "GET",
              url: "api/keystone/v3/projects/"+fw["project_id"],
              showErrMsg: false,
              success: function(project) {
                Vue.projectListforNet.push(project["project"]);
              }
            });
          }
        }
      });
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
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.umTable.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    queryClick() {
      var self = this;
      self.$refs.umTable.clearSelection();
      self.getData();
    },
     sharedRender(value, row) {
      if (value + "" == "true") {
        return Vue.t('lang.yes');
      } else {
        return Vue.t('lang.no');
      }
    },
    onRefresh() {
      this.$refs.umTable.clearSelection();
      this.queryClick();
    },
    rowClick(row) {
      this.$refs.umTable.toggleRowSelection(row);
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.query_porject = id;
      this.projectName = name;
      this.close = 'close';
    },
    onIconClick() {
      this.query_porject = '';
      this.projectName = '';
      this.close = '';
    }
  }
}
</script>
<style scoped type="text/css">
  .cover-pop{
    overflow-y: auto;
    max-height: 400px;
  }
</style>
