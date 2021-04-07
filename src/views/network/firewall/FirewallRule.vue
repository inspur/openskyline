<template>
  <div>
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
      width="55"
      align="center">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('name') >= 0"
      :label="$t('lang.name')"
      prop="name" sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('project_id') >= 0"
      :label="$t('lang.project')"
      prop="project_id"
      min-width="100">
      <template slot-scope="scope">
          <span v-html="projectToName(scope.row.project_id)"></span>
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
      min-width="100">
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
      min-width="100">
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
    <!-- <el-table-column
      v-if="columnsChecked.indexOf('shared') >= 0"
      prop="shared"
      :label="$t('network.share')"
      align="left"
      min-width="50">
      <template slot-scope="scope">
          <span v-html="sharedRender(scope.row.shared, scope.row)"></span>
        </template>
    </el-table-column> -->
    <el-table-column
      v-if="columnsChecked.indexOf('enabled') >= 0"
      prop="enabled"
      :label="$t('network.active')"
      align="left"
      min-width="50">
      <template slot-scope="scope">
          <span v-html="sharedRender(scope.row.enabled, scope.row)"></span>
        </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('firewall_policy_id') >= 0"
      prop="firewall_policy_id"
      :label="$t('network.strategy')"
      min-width="50">
      <template slot-scope="scope" v-if="strategyRender(scope.row.firewall_policy_id, scope.row)">
        <el-popover placement="top" ref="pop"  trigger="hover" class="cover-pop">
          <div class="cover-pop">
            <p>{{strategyRender(scope.row.firewall_policy_id, scope.row)}}</p>
          </div>
        </el-popover>
        <el-button v-popover:pop type="text" slot="reference" class="cover-button">{{strategyRender(scope.row.firewall_policy_id, scope.row)}}</el-button>
      </template>
      <!--<template slot-scope="scope">
          <span v-html="strategyRender(scope.row.firewall_policy_id, scope.row)"></span>
      </template>-->
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
        <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" :objStorFlag="true"></page>
      </el-col>
    </el-row>
    <add-rule ref="addRule" v-if="addFlag" @handleAddShow="handleAddShow"></add-rule>
    <edit-rule ref="editRule" v-if="editFlag" @handleEditShow="handleEditShow" @handleEditCancleShow="handleEditCancleShow" :editId="editId" :editName="editName" :editDesc="editDesc" :editprotocol="editprotocol" :editsourceip="editsourceip" :editsourceport="editsourceport" :editdestip="editdestip" :editdestport="editdestport" :editaction="editaction" :editenabled="editenabled" :editipversion="editipversion" :editshared="editshared"></edit-rule>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import AddRule from './AddRule';
import EditRule from './EditRule';
import {onlyLetterNumberChinese} from '../validator/validator';
export default {
  name: "firewallRule",
  components: {
    AddRule, EditRule
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
          query_protocaol: {
            label: this.$t('network.protocol'),
            type: 'select',
            options: [{
              label: "TCP",
              value: 'tcp'
            }, {
              label: "UDP",
              value: 'udp'
            }, {
              label: "ICMP",
              value: 'icmp'
            }, {
              label: this.$t('network.anything'),
              value: 'any'
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
      currentPage: 1,
      showBorder: true,
      addFlag: false,
      editFlag: false,
      loading: false,
      roleType: Vue.roleType + "",
      query_protocaol: "",
      query_share: "",
      query_porject: "",
      projectName:"",
      selProjectFlg:false,
      close: "",
      query_name: "",
      editId: "",
      editName: "",
      editDesc: "",
      editprotocol: "",
      editsourceip: "",
      editsourceport: "",
      editdestip: "",
      editdestport: "",
      editaction: "",
      editshared: false,
      editenabled: true,
      editipversion: "",
      projectOption: Vue.projectListforNet,
      strategyList:[],
      totalData: [],
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
        prop: "enabled",
        label: Vue.t('network.active')
      }, {
        prop: "firewall_policy_id",
        label: Vue.t('network.strategy')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }],
      columnsChecked: ['name', 'description', 'protocol', 'source_ip_address', 'source_port', 'destination_ip_address', 'destination_port', 'action', 'enabled', 'firewall_policy_id', 'project_id'],
      tableData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.createRule'),
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
          if (row["protocol"] != null) {
            self.editprotocol = row["protocol"];
          } else {
            self.editprotocol = "";
          }
          if (row["source_ip_address"] != null) {
            self.editsourceip = row["source_ip_address"];
          } else {
            self.editsourceip = "";
          }
          if (row["source_port"] != null) {
            self.editsourceport = row["source_port"];
          } else {
            self.editsourceport = "";
          }
          if (row["destination_ip_address"] != null) {
            self.editdestip = row["destination_ip_address"];
          } else {
            self.editdestip = "";
          }
          if (row["destination_port"] != null) {
             self.editdestport = row["destination_port"];
          } else {
            self.editdestport = "";
          }
          self.editaction = row["action"];
          self.editshared = row["shared"];
          self.editenabled = row["enabled"];
          self.editipversion = row["ip_version"];
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
          self.$confirm(Vue.t('network.firewallNote7'), Vue.t('network.attention'), {
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
                  url: "api/neutron/v2.0/fw/firewall_rules/{id}",
                  params: selectRows,
                  errorKey: "NeutronError",
                  log:{
                    description:{
                      en:"Delete Firewall Rule",
                      zh_cn:"删除防火墙规则"
                    },
                    key: "name",
                    target:Vue.logTarget.firewallRule
                  }
                }).then((data) => {
                  self.$message(Vue.t('lang.sendDeleteSuccess'));
                  setTimeout(function() {
                    self.getData();
                    self.loading = false;
                  }, 1000);
                }).catch((err) => {
                  self.getData();
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
    this.getCallback();
  },
  methods: {
    handleSearch(params) {
      let self = this;
      this.searchBarValidatedParams = params;
      self.getData();
    },
    async getData() {
      var self = this;
      let name = self.searchBarValidatedParams.query_name || "";
      let projectid = self.searchBarValidatedParams.query_porject || "";
      let protocol = self.searchBarValidatedParams.query_protocaol || "";
      let shared = self.query_share;
      let data = [];
      try {
        this.loading = true;
        let proTemp = protocol;
        if (proTemp === "any") {
          protocol = "";
        }
        let roleType = Vue.roleType + "";
        if (roleType == "0") {
        } else {
          projectid = Vue.cookie.get('pid');
        }
        let p = {};
        if (projectid != null && projectid != "") {
          p.project_id = projectid;
        }
        if (protocol != null && protocol != "") {
          p.protocol = protocol;
        }
        if (shared != null && shared != "") {
          p.shared = shared;
        }
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/fw/firewall_rules?" + $.param(p),
          errorKey: "NeutronError"
        });
        let tempArr = result['firewall_rules'];
        self.totalData = [];
        for (let i =0; i< tempArr.length; i++) {
        let frule = tempArr[i];
        if (frule.name === "") {
          frule.name = frule.id;
        }
        if (frule.name.indexOf(name) >=0) {
            if (proTemp === "any" && frule.protocol === null) {
              self.totalData.push(frule);
            } else if (proTemp === "any" && frule.protocol != null) {
            } else {
              self.totalData.push(frule);
            }
          }
        }
        self.$refs.umTable.clearSelection();
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
        Promise.all([self.getProjectList(), self.getStrategys()]).then(function(result) {
          self.getData();
        });
      } else {
        Promise.all([self.getProjectInUser(), self.getStrategys()]).then(function(result) {
          self.getData();
        });
      }
    },
    async getProjectList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default",
          errorKey: "NeutronError"
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
        url: "api/neutron/v2.0/fw/firewall_rules?project_id="+Vue.cookie.get('pid'),
        errorKey: "NeutronError",
        success: function(result) {
          let firewalls = result['firewall_rules'];
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
    strategyRender(value, row) {
      let strategyid = value;
      let strategyname = "";
      for (var i = this.strategyList.length - 1; i >= 0; i--) {
        if (this.strategyList[i].id === strategyid) {
          return this.strategyList[i].name;
        }
      }
    },
    async getStrategys() {
        try {
          let resultData = await this.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/fw/firewall_policies"
        });
        this.strategyList = resultData['firewall_policies'];
        } catch (res) {
      }
    },
    handleAddShow() {
      let self = this;
      self.addFlag = false;
      self.getCallback();
    },
    handleEditShow() {
      this.editFlag = false;
      this.getCallback();
    },
    handleEditCancleShow() {
      this.editFlag = false;
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
      self.getData();
    },
    onRefresh() {
      this.$refs.umTable.clearSelection();
      this.getData();
    },
    sharedRender(value, row) {
      if (value + "" == "true") {
        return Vue.t('lang.yes');
      } else {
        return Vue.t('lang.no');
      }
    },
    projectToName(value) {
      let proList = Vue.projectListforNet;
      for (let i=0; i<proList.length; i++) {
        if (value === proList[i]["id"]) {
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
    protocolRender(value, row) {
      if (value === null || value === "") {
        return Vue.t('network.anything');
      }
      return value.toUpperCase();
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
<style type="text/css">
  .cover-pop{
    overflow-y: auto;
    max-height: 400px;
  }
  .cover-button{
    width: 100%;
    cursor: default;
  }
  .cover-button:hover{
    background: none;
  }
  .cover-button span{
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    line-height: 24px;
    font-size: 12px;
  }
</style>
