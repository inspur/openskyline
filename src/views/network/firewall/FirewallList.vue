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
    ref="firewallTable"
    :data="firewallData"
    highlight-current-row
    stripe
    border
    v-loading="loading"
    :element-loading-text="$t('lang.loading')"
    style="width: 100%"
    row-key="id"
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
      prop="name" sortable="custom"
      min-width="100">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('project') >= 0"
      :label="$t('lang.project')"
      prop="project"
      align="left"
      min-width="100">
      <template slot-scope="scope">
          <span v-html="projectToName(scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('strategy') >= 0"
      prop="strategy"
      align="left"
      :label="$t('network.strategy')"
      min-width="100">
      <template slot-scope="scope">
          <span v-html="getPolicyName(scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('router') >= 0"
      prop="router"
      align="left"
      :label="$t('network.routerConnected')"
      min-width="100">
      <template slot-scope="scope" v-if="scope.row['router_ids'].length">
          <el-popover placement="top" ref="pop"  trigger="hover" class="cover-pop">
            <div class="cover-pop">
              <p v-for="(item,i) in routerRender(scope.row).split(';')" :key="i">{{item}}</p>
            </div>
          </el-popover>
          <el-button v-popover:pop type="text" slot="reference" class="cover-button" >{{routerRender(scope.row)}}</el-button>
        <!--<span v-html="routerRender(scope.row)"></span>-->
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('status') >= 0"
      prop="status"
      :label="$t('lang.status')"
      align="left"
      min-width="50">
      <template slot-scope="scope">
        <el-tag :type="statusTagRender(scope.row.status)">
          <span v-html="statusToCn(scope.row)"></span>
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('managestatus') >= 0"
      prop="admin_state_up"
      :label="$t('network.manageStatus')"
      align="left"
      min-width="50">
      <template slot-scope="scope">
        <span v-html="managestatusRender(scope.row.admin_state_up)"></span>
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
    <add-firewall ref="addFirewall" v-if="addFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow"></add-firewall>
    <edit-firewall ref="editFirewall" v-if="editFlag" @handleEditShow="handleEditShow" @handleCancelShow="handleCancelShow" :editId="editId" :editName="editName" :editStrategy="editStrategy" :editDesc="editDesc" :editAdminstatus="editAdminstatus" :editprojectid="editprojectid"></edit-firewall>
    <add-firewallrouter ref="addRouter" :editId="editId" :editName="editName" :editprojectid="editprojectid" v-if="addRouterFlag" @handleAddRouterShow="handleAddRouterShow" @handleAddRouterConfirm="handleAddRouterConfirm" @handleAddRouterCancel="handleAddRouterCancel" style="text-align:center"></add-firewallrouter>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import AddFirewall from './AddFirewall';
import AddFirewallrouter from './AddRouter';
import EditFirewall from './EditFirewall';
import {onlyLetterNumberChinese} from '../validator/validator';
export default {
  name: "firewallList",
  components: {
    AddFirewall, AddFirewallrouter, EditFirewall
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
          query_status: {
            label: this.$t('lang.status'),
            type: 'select',
            options: [{
              label: this.$t('lang.ACTIVE'),
              value: 'ACTIVE'
            }, {
              label: this.$t('network.inactive'),
              value: 'INACTIVE'
            }, {
              label: this.$t('lang.ERROR'),
              value: 'ERROR'
            }, {
              label: this.$t('lang.DOWN'),
              value: 'DOWN'
            }, {
              label: this.$t('network.creating'),
              value: 'PENDING_CREATE'
            }, {
              label: this.$t('network.editing'),
              value: 'PENDING_UPDATE'
            }, {
              label: this.$t('network.deleteing'),
              value: 'PENDING_DELETE'
            }]
          },
          query_managestatus: {
            label: this.$t('network.manageStatus'),
            type: 'select',
            options: [{
              label: "UP",
              value: 'true'
            }, {
              label: "DOWN",
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
      totalData: [],
      loading: false,
      showBorder: true,
      addFlag: false,
      addRouterFlag: false,
      editFlag: false,
      roleType: Vue.roleType + "",
      query_status: "",
      query_adminStateUp: "",
      query_porject: "",
      projectName:"",
      selProjectFlg:false,
      close: "",
      query_fwName: "",
      editName: "",
      editDesc: "",
      editStrategy: "",
      editprojectid: "",
      editAdminstatus: true,
      editId: "",
      projectOption: [],
      routerList: [],
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "project",
        label: Vue.t('lang.project')
      }, {
        prop: "strategy",
        label: Vue.t('network.strategy')
      }, {
        prop: "router",
        label: Vue.t('network.routerConnected')
      }, {
        prop: "status",
        label: Vue.t('lang.status')
      }, {
        prop: "managestatus",
        label: Vue.t('network.manageStatus')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }],
      columnsChecked: ['name', 'project', 'description', 'strategy', 'router', 'status', 'managestatus', 'project'],
      firewallData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.createFirewall'),
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
          if (rowData['status'] == 'PENDING_UPDATE' || rowData['status'] == "PENDING_CREATE" || rowData['status'] == "PENDING_DELETE") {
            return false;
          }
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          this.editFlag = true;
          var row = selectRows[0];
          self.editId = row["id"];
          self.editName = row["name"];
          self.editDesc = row["description"];
          self.editStrategy = row["firewall_policy_id"];
          self.editAdminstatus = row["admin_state_up"];
          self.editprojectid = row["project_id"];
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          if (rowData['status'] == "PENDING_CREATE" || rowData['status'] == "PENDING_DELETE") {
            return false;
          }
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
                self.$refs.firewallTable.clearSelection();
                self.$sequence({
                  type: 'delete',
                  url: "api/neutron/v2.0/fw/firewalls/{id}",
                  params: selectRows,
                  errorKey: "NeutronError",
                  log:{
                    description:{
                      en:"Delete Firewall",
                      zh_cn:"删除防火墙"
                    },
                    key: "name",
                    target:Vue.logTarget.firewall
                  }
                }).then((data) => {
                  self.$message(Vue.t('lang.sendDeleteSuccess'));
                  setTimeout(function() {
                    self.getData();
                    self.loading = false;
                  }, 1000);
                }).catch((err) => {
                  self.loading = false;
                });
              }
            }
          }).then(() => {
          }).catch(() => {
          });
        }.bind(this)
      }, {
        icon: "fa-plus-square",
        name: Vue.t('network.editRouter'),
        showflg: true,
        multi: false,
        enable(rowData) {
          if (rowData['status'] == 'PENDING_UPDATE' || rowData['status'] == "PENDING_CREATE" || rowData['status'] == "PENDING_DELETE") {
            return false;
          }
          return true;
        },
        handler: function(selectRows) {
          this.addRouterFlag = true;
          let row = selectRows[0];
          this.editprojectid = row["project_id"];
          this.editId = row["id"];
          this.editName = row["name"];
        }.bind(this)
      }]
    }
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
  },
  watch: {
    columnsChecked: {
      handler: function (rows, oldVal) {
       this.columnsChecked = rows;
      },
      deep: true
    },
    firewallData: {
      immediate: false,
      handler: function(list) {
        let self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (let t = 0; t < list.length; t++) {
            let obj = list[t];
            if (obj['status'] == 'PENDING_UPDATE' || obj['status'] == "PENDING_CREATE" || obj['status'] == "PENDING_DELETE") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag) {
          self.interVmValid = setInterval(() => {
              this.getData()
            }, 5000);
        }
      }
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
      this.$refs.firewallTable.clearSelection();
    },
    async getData() {
      var self = this;
      let projectid = self.searchBarValidatedParams.query_porject || "";
      let name = self.searchBarValidatedParams.query_name || "";
      let status = self.searchBarValidatedParams.query_status || "";
      let adminStateUp = self.searchBarValidatedParams.query_managestatus || "";
      // this.loading = true;
      let data = [];
      try {
        let queryStr="?";
        let roleType = Vue.roleType + "";
        if (roleType == "0") {
          if (projectid != "") {
            queryStr += "project_id="+projectid;
          }
        } else {
          queryStr += "project_id="+Vue.cookie.get('pid');
        }
        if (status != "") {
          if (queryStr.length>1) {
              queryStr += "&status="+status;
          } else {
              queryStr += "status="+status;
          }
        }
        if (adminStateUp != "") {
          if (queryStr.length>1) {
              queryStr += "&admin_state_up="+adminStateUp;
          } else {
              queryStr += "admin_state_up="+adminStateUp;
          }
        }
        if (queryStr == "?") {
          queryStr = "";
        }
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/fw/firewalls"+queryStr,
          complete: function(XMLHttpRequest, textStatus) {
            self.loading = false;
          },
          errorKey: "NeutronError"
        });
        let fws = result['firewalls'];
        //根据防火墙名称进行过滤
        self.totalData = [];
        if (name === "") {
          self.totalData = fws;
        } else {
          for (let i = fws.length - 1; i >= 0; i--) {
            if (fws[i].name.indexOf(name) >= 0) {
              self.totalData.push(fws[i]);
            }
          }
        }
      } catch (res) {
        self.loading = false;
        console.log(res);
      }
    },
    getCurrentData(param) {
      this.firewallData = param;
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
        Promise.all([self.getProjectList(), self.getPolicyList(), self.getrouterList()]).then(function(result) {
          self.getData();
        });
      } else {
        Promise.all([self.getProjectInUser(), self.getPolicyList(), self.getrouterList()]).then(function(result) {
          self.getData();
        });
      }
    },
    async getrouterList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/routers"
        });
        self.routerList = result['routers'];
      } catch (res) {
      }
    },
    handleAddShow() {
      this.addFlag = false;
      this.getCallback();
    },
    handleCancelShow() {
      this.addFlag = false;
      this.editFlag = false;
    },
    handleAddRouterCancel() {
      this.addRouterFlag = false;
      this.getCallback();
    },
    handleAddRouterConfirm() {
      this.getCallback();
    },
    handleEditShow() {
      this.editFlag = false;
      this.$refs.firewallTable.clearSelection();
      this.getCallback();
    },
    handleAddRouterShow() {
      let self = this;
      self.addRouterFlag = false;
      self.getCallback();
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.firewallTable.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    onRefresh() {
      let self = this;
      self.query_porject = "";
      self.projectName = "";
      self.query_fwName = "";
      self.query_status = "";
      self.query_adminStateUp = "";
      self.$refs.firewallTable.clearSelection();
      self.getData();
    },
    rowClick(row) {
      this.$refs.firewallTable.toggleRowSelection(row);
    },
    queryFunction() {
      var self = this;
      self.getData();
    },
    managestatusRender(value) {
      if (value === true) {
        return "UP";
      } else {
        return "DOWN";
      }
    },
    routerRender(row) {
      let self = this;
      let showname = "";
      let routers = row["router_ids"];
      for (let i = routers.length - 1; i >= 0; i--) {
        for (let j = self.routerList.length - 1; j >= 0; j--) {
          let router = self.routerList[j];
          if (routers[i] === router.id && i!=0) {
            showname += router.name + ";";
          } else if (routers[i] === router.id && i===0) {
            showname += router.name;
          }
        }
      }
      return showname;
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
        url: "api/neutron/v2.0/fw/firewalls?project_id="+Vue.cookie.get('pid'),
        errorKey: "NeutronError",
        success: function(result) {
          let firewalls = result['firewalls'];
          for (let i = 0; i < firewalls.length; i++) {
            let fw = firewalls[i];
            self.$ajax({
              type: "GET",
              url: "api/keystone/v3/projects/"+fw["project_id"],
              errorKey: "NeutronError",
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
     async getPolicyList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/fw/firewall_policies"
        });
        Vue.firewallPolicies = result["firewall_policies"];
      } catch (res) {
        console.log(res);
      }
     },
    getPolicyName(row) {
      let proId = row["firewall_policy_id"];
      // console.log("====proId==="+proId);
      let pList = Vue.firewallPolicies;
      for (let i=0; i < pList.length; i++) {
        if (proId === pList[i]["id"]) {
          return pList[i]["name"];
        }
      }
    },
    statusToCn(row) {
      let status = row["status"];
      if (status === "ACTIVE") {
        return Vue.t('lang.ACTIVE');
      } else if (status === "INACTIVE") {
        return Vue.t('network.inactive');
      } else if (status === "ERROR") {
        return Vue.t('lang.ERROR');
      } else if (status === "DOWN") {
        return Vue.t('lang.DOWN');
      } else if (status === "PENDING_CREATE") {
        return Vue.t('network.creating');
      } else if (status === "PENDING_UPDATE") {
        return Vue.t('network.editing');
      } else if (status === "PENDING_DELETE") {
        return Vue.t('network.deleteing');
      }
    },
    statusTagRender(status) {
      if (status==="ACTIVE") {
        return "success";
      } else if (status === "INACTIVE") {
      return "danger";
      } else if (status === "ERROR") {
        return "danger";
      } else if (status === "DOWN") {
        return "info";
      } else if (status === "PENDING_CREATE") {
        return "warning";
      } else if (status === "PENDING_UPDATE") {
        return "warning";
      } else if (status === "PENDING_DELETE") {
        return "warning";
      }
    },
    queryClick() {
      var self = this;
      self.getData();
      this.$refs.firewallTable.clearSelection();
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
