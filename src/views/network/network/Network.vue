<template>
  <div>
    <icos-page-header :title="$t('network.networks')" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
      <div class="divider clearfix"></div>
      <div class="operation-panel margin-b5">
        <operation-panel
          :select-rows="multipleSelection"
          :operation-menus="operationMenus">
        </operation-panel>
      </div>
      <div class="divider clearfix"></div>
      <el-table
        ref="networkTable"
        :data="networkData"
        highlight-current-row
        stripe
        border
        style="width: 100%;"
        row-key="id"
        v-loading="loading"
        :default-sort="{prop: 'name'}"
        @sort-change="sortChange"
        :element-loading-text="$t('lang.loading')"
        @row-click="rowClick"
        @selection-change="handleSelectionChange">
        <el-table-column
          reserve-selection
          type="selection"
          width="55" align="center">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('name') >= 0"
          :label="$t('network.networkName')"
          prop="name" sortable="custom"
          min-width="100">
          <template slot-scope="scope">
            <el-button @click="showDetail(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
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
          v-if="columnsChecked.indexOf('zone') >= 0"
          :label="$t('network.domainuse')"
          prop="availability_zones"
          min-width="100">
          <template slot-scope="scope">
            <span v-html="zoneRender(scope.row.availability_zones)"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('status') >= 0"
          prop="status"
          :label="$t('lang.status')"
          min-width="50"
          align="left">
          <template slot-scope="scope">
            <el-tag :type="statusTagRender(scope.row.status)">
              <span v-html="statusRender(scope.row)"></span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('provider:network_type') >= 0"
          prop="provider:network_type"
          :label="$t('network.networkType')"
          min-width="50"
          align="left">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('provider:segmentation_id') >= 0"
          prop="provider:segmentation_id"
          :label="$t('network.secgement')"
          align="left"
          min-width="50">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('subnet') >= 0"
          prop="subnet"
          :label="$t('network.subnet')"
          min-width="200">
          <template slot-scope="scope">
            <span v-html="subnetsRender(scope.row.subnets, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('shared') >= 0"
          prop="shared"
          :label="$t('network.networkshared')"
          align="left"
          min-width="50">
          <template slot-scope="scope">
            <span v-html="sharedRender(scope.row.shared, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('router:external') >= 0"
          prop="router:external"
          :label="$t('network.externalNet')"
          align="left"
          min-width="50">
          <template slot-scope="scope">
            <span v-html="externalRouterRender(scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('admin_state_up') >= 0"
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
          :label="$t('lang.desc')"
          prop="description"
          min-width="50">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('created_at') >= 0"
          :label="$t('network.UPDATEDAT')"
          prop="created_at"
          sortable="custom"
          min-width="100">
          <template slot-scope="scope">
            <span v-html="timeFormat(scope.row.created_at)"></span>
          </template>
        </el-table-column>
      </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
          <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('network.columnSelected')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" :objStorFlag="pageCount"></page>
        </el-col>
      </el-row>
    </div>
    </icos-page>
    <add-network ref="addNetwork" v-if="addFlag" @handleAddShow="handleAddShow"  @handleCancelShow="handleCancelShow"></add-network>
    <edit-network ref="editNetwork" v-if="editFlag" @handleEditShow="handleEditShow" @handleCancelShow="handleCancelShow" :physicalMachineNetworkType="physicalMachineNetworkType" 
      :networkName="networkName" :networkManageStatus="networkManageStatus" :networkShareStatus="networkShareStatus" :networkExternalStatus="networkExternalStatus" :networkEditId="networkEditId" :description="description"></edit-network>
  </div>
</template>
<script>
import AddNetwork from './AddNetwork';
import EditNetwork from './EditNetwork';
import moment from 'moment';
export default {
  name: "network",
  components: {
    AddNetwork, EditNetwork
  },
  data() {
    return {
      searchBar: {
        conditions: {
          query_name: {
            label: this.$t('network.networkName'),
            type: 'input',
            validator: (value) => {
              if (!/^[_0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetterNumber_Chinese'));
              }
            }
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
              label: this.$t('lang.DOWN'),
              value: 'DOWN'
            }, {
              label: this.$t('lang.BUILD'),
              value: 'BUILD'
            }, {
              label: this.$t('lang.ERROR'),
              value: 'ERROR'
            }]
          },
          query_sharestatus: {
            label: this.$t('network.networkshared'),
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
      physicalMachineNetworkType: '',
      addFlag: false,
      editFlag: false,
      loading: false,
      networkName: "",
      description: "",
      networkManageStatus: true,
      networkShareStatus: false,
      networkExternalStatus: false,
      pageCount:true,
      networkEditId:"",
      networkId: "",
      query_name: "",
      projectName:"",
      selProjectFlg:false,
      close: "",
      projectOption: [],
      subnetList: [],
      roleType: Vue.roleType + "",
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      columns: [],
      columnsChecked: [],
      networkData: [],
      totalData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.createNetwork'),
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
          let roleType = Vue.roleType + "";
          if (roleType!="0") {
            if (rowData["project_id"] == Vue.cookie.get('pid')) {
              return true;
            } else {
              return false;
            }
          }
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          this.editFlag = true;
          var row = selectRows[0];
          this.networkName = row["name"];
          this.networkManageStatus = row["admin_state_up"];
          this.networkShareStatus = row["shared"];
          this.networkExternalStatus = row["router:external"];
          this.networkEditId = row["id"];
          this.description = row["description"];
          this.physicalMachineNetworkType = row["tags"][0] || "";
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('network.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          if (rowData['tags'].includes('bm_deploy')) {
            return false;
          }
          let roleType = Vue.roleType + "";
          if (roleType!="0") {
            if (rowData["project_id"] == Vue.cookie.get('pid')) {
              return true;
            } else {
              return false;
            }
          }
          return true;
        },
        handler: function(selectRows) {
          let self = this;
          self.$prompt(Vue.t('network.confirmDelete'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            inputPattern:/^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage:Vue.t('lang.onlyAcceptYesOrNo'),
            closeOnClickModal: false
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
              for (let i = 0; i < selectRows.length; i++) {
                let row = selectRows[i];
                self.$ajax({
                  type: "DELETE",
                  url: "api/neutron/v2.0/networks/"+row["id"],
                  data: {},
                  success: function() {
                    self.$notify({
                      message: row["name"]+Vue.t('network.deleteSendSuccess'),
                      type: "success"
                    });
                    self.getData();
                  },
                  errFun() {
                    self.getData();
                  },
                  log:{
                    description:{
                      en:"Delete Network:"+row["name"],
                      zh_cn:"删除网络:"+row["name"]
                    },
                    target:Vue.logTarget.networkList
                  },
                  errorKey: "NeutronError"
                });
              }
            }
          }).catch(() => {
            //取消
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
    },
    '$route'(to, from) {
      let self = this;
      let roleType = Vue.roleType + "";
      this.pageCount = true;
      if (roleType == "0") {
        Promise.all([self.getProjectList(), self.getSubnetList()]).then(function(result) {
          self.getData();
        });
      } else {
        Promise.all([self.getSubnetList(), self.getNetworklist()]).then(function(result) {
          self.getData();
        });
      }
    }
  },
  mounted() {
    let self = this;
    let roleType = Vue.roleType + "";
    if (roleType == "0") {
      Promise.all([self.getProjectList(), self.getSubnetList()]).then(function(result) {
        self.getData();
      });
      self.columns = [{
        prop: "name",
        label: Vue.t('network.networkName')
      }, {
        prop: "project_id",
        label: Vue.t('lang.project')
      }, {
        prop: "zone",
        label: Vue.t('network.domainuse')
      }, {
        prop: "status",
        label: Vue.t('lang.status')
      }, {
        prop: "provider:network_type",
        label: Vue.t('network.networkType')
      }, {
        prop: "provider:segmentation_id",
        label: Vue.t('network.secgement')
      }, {
        prop: "subnet",
        label: Vue.t('network.subnet')
      }, {
        prop: "shared",
        label: Vue.t('network.networkshared')
      }, {
        prop: "router:external",
        label: Vue.t('network.externalNet')
      }, {
        prop: "admin_state_up",
        label: Vue.t('network.manageStatus')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }, {
          prop: "created_at",
          label: Vue.t('network.UPDATEDAT')
      }];
      self.columnsChecked = ['name', 'project_id', 'created_at', 'zone', 'status', 'provider:network_type', 'provider:segmentation_id', 'subnet', 'shared', 'router:external', 'admin_state_up', 'description'];
    } else {
      Promise.all([self.getSubnetList(), self.getNetworklist()]).then(function(result) {
        self.getData();
      });
      self.columns = [{
        prop: "name",
        label: Vue.t('network.networkName')
      }, {
        prop: "project_id",
        label: Vue.t('lang.project')
      },
      {
        prop: "zone",
        label: Vue.t('network.domainuse')
      }, {
        prop: "provider:network_type",
        label: Vue.t('network.networkType')
      }, {
        prop: "status",
        label: Vue.t('lang.status')
      }, {
        prop: "subnet",
        label: Vue.t('network.subnet')
      }, {
        prop: "shared",
        label: Vue.t('network.networkshared')
      }, {
        prop: "router:external",
         label: Vue.t('network.externalNet')
      }, {
        prop: "admin_state_up",
        label: Vue.t('network.manageStatus')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      },
      {
        prop: "created_at",
        label: Vue.t('network.UPDATEDAT')
      }];
      self.columnsChecked = ['name', 'project_id', 'created_at', 'zone', 'status', 'provider:network_type', 'subnet', 'shared', 'router:external', 'admin_state_up', 'description'];
    }
  },
  methods: {
    handleSearch(params) {
      let self = this;
      this.searchBarValidatedParams = params;
      if (self.roleType == "0") {
        Promise.all([self.getProjectList(), self.getSubnetList()]).then(function(result) {
          self.getData();
        });
      } else {
        Promise.all([self.getSubnetList(), self.getNetworklist()]).then(function(result) {
          self.getData();
        });
      }
    },
    timeFormat(utc) {
      return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
    },
    async getData() {
      let self = this;
      let name = self.searchBarValidatedParams.query_name || "";
      let projectid = self.searchBarValidatedParams.query_porject || "";
      let status = self.searchBarValidatedParams.query_status || "";
      let shared = self.searchBarValidatedParams.query_sharestatus || "";
      self.loading = true;
      try {
        let roleType = Vue.roleType + "";
        if (roleType == "0") {
          let p = {};
          if (projectid != null && projectid != "") {
            p.project_id = projectid;
          }
          if (status != null && status != "") {
            p.status = status;
          }
          if (shared != null && shared != "") {
            p.shared = shared;
          }
          let result = await self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks"+"?" + $.param(p),
            complete: function(XMLHttpRequest, textStatus) {
              self.loading = false;
            },
            errorKey: "NeutronError"
          });
          let nets = result['networks'];
          self.totalData = [];
          if (name === "") {
            self.totalData = nets;
          } else {
            for (let i = nets.length - 1; i >= 0; i--) {
              if ((nets[i].name || '').toLowerCase().indexOf(name.toLowerCase()) >= 0) {
                self.totalData.push(nets[i]);
              }
            }
          }
        } else {
          let result1 = await self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks?project_id="+Vue.cookie.get('pid')+"&shared=false&not-tags=bm_deploy", // 本项目的
            errorKey: "NeutronError"
          });
          let result2 = await self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks?shared=true&not-tags=bm_deploy", // 非本项目共享的
            complete: function(XMLHttpRequest, textStatus) {
              self.loading = false;
            },
            errorKey: "NeutronError"
          });
          let nets = [];
          for (let i = 0; i < result1['networks'].length; i++) {
            let network = result1['networks'][i];
            nets.push(network);
          }
          for (let i = 0; i < result2['networks'].length; i++) {
            let network = result2['networks'][i];
            nets.push(network);
          }
          self.totalData = [];
          if (shared==="") {
            if (name === "" && status==="") {
              self.totalData = nets;
            } else {
              for (let i = 0; i < nets.length; i++) {
                if (nets[i].name.indexOf(name) >= 0 && nets[i].status.indexOf(status) >= 0) {
                  self.totalData.push(nets[i]);
                }
              }
            }
          } else {
            for (let i = 0; i < nets.length; i++) {
              if (nets[i].name.indexOf(name) >= 0 && nets[i].status.indexOf(status) >= 0) {
                if (nets[i].shared.toString() == shared) {
                  self.totalData.push(nets[i]);
                }
              }
            }
          }
        }
        self.$refs.networkTable.clearSelection();
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
    async getNetworklist() {
      let self = this;
      let url = "api/neutron/v2.0/networks";
      if (String(Vue.roleType) !== '0') {
        url = "api/neutron/v2.0/networks?not-tags=bm_deploy"
      }
      await self.$ajax({
        type: 'get',
        url: url,
        errorKey: "NeutronError",
        success: function(result1) {
          let data = [];
          data = result1["networks"];
          let projectIds = [];
          for (let i = 0; i < data.length; i++) {
             let net = data[i];
             projectIds.push(net["project_id"]);
          }
          projectIds = self.uniqueIds(projectIds);
          for (let i = 0; i < projectIds.length; i++) {
            if (projectIds[i] != "") {
              self.$ajax({
                type: "GET",
                url: "api/keystone/v3/projects/"+projectIds[i],
                showErrMsg: false,
                success: function(project) {
                  Vue.projectListforNet.push(project["project"]);
                }
              });
            }
          }
        }
      });
    },
    uniqueIds(arr) {
      let result = [];
      for (let i=0; i<arr.length; i++) {
        if (result.indexOf(arr[i]) == -1) {
          result.push(arr[i]);
        }
      }
      return result;
    },
    getCurrentData(param) {
      this.networkData = param;
    },
    async getSubnetList() {
      let self = this;
      await self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/subnets",
        errorKey: "NeutronError",
        success: function(resultData) {
          self.subnetList = [];
          self.subnetList = resultData['subnets'];
        }
      });
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
    handleAddShow() {
      let self = this;
      self.addFlag = false;
      setTimeout( function() {
        if (self.roleType == "0") {
          Promise.all([self.getProjectList(), self.getSubnetList()]).then(function(result) {
            self.getData();
          });
        } else {
          Promise.all([self.getSubnetList(), self.getNetworklist()]).then(function(result) {
            self.getData();
          });
        }
      }, 1000);
    },
    handleEditShow() {
      this.editFlag = false;
      this.getData();
    },
    handleCancelShow() {
      this.addFlag = false;
      this.editFlag = false;
    },
    onRefresh() {
      let self = this;
      if (self.roleType == "0") {
        Promise.all([self.getProjectList(), self.getSubnetList()]).then(function(result) {
          self.getData();
        });
      } else {
        Promise.all([self.getSubnetList(), self.getNetworklist()]).then(function(result) {
          self.getData();
        });
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    queryClick() {
      let self = this;
      self.$refs.networkTable.clearSelection();
      self.pageCount = true;
      self.getData();
    },
    rowClick(row) {
      this.$refs.networkTable.toggleRowSelection(row);
    },
    sharedRender(value, row) {
      if (value + "" == "true") {
        return Vue.t("lang.yes");
      } else {
        return Vue.t("lang.no");
      }
    },
    externalRouterRender(row) {
      if (row["router:external"] + "" == "true") {
        return Vue.t("lang.yes");
      } else {
        return Vue.t("lang.no");
      }
    },
    nameRender(value, row) {
      return value;
    },
    managestatusRender(value) {
      if (value == true) {
        return "UP";
      } else {
        return "DOWN";
      }
    },
    subnetsRender(value, row) {
      let nets = value;
      let showsub = "";
      if (nets.length===1) {
        for (let j = this.subnetList.length - 1; j >= 0; j--) {
          if (this.subnetList[j].id === nets[0]) {
            if (this.subnetList[j].name != "") {
              showsub+= this.subnetList[j].name;
            } else {
              showsub+= this.subnetList[j].id.substring(0, 12);
            }
            let subnetCidr = '(' + this.subnetList[j].cidr + ')';
            showsub+= subnetCidr;
            break;
          }
        }
      } else {
        for (let i=0; i< nets.length; i++) {
          let subnetId = nets[i];
          for (let j = this.subnetList.length - 1; j >= 0; j--) {
            if (this.subnetList[j].id === subnetId) {
              let subnetCidr = '(' + this.subnetList[j].cidr + ')';
              if (this.subnetList[j].name != "") {
                if (i === nets.length-1) {
                  showsub+= (this.subnetList[j].name + subnetCidr)
                } else {
                  showsub+= (this.subnetList[j].name + subnetCidr + ",<br/> ");
                }
              } else {
                if (i === nets.length-1) {
                  showsub+= (this.subnetList[j].id + subnetCidr)
                } else {
                  showsub+= (this.subnetList[j].id + subnetCidr + ",<br/> ");
                }
              }
            }
          }
        }
      }
      return showsub;
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
    statusRender(row) {
      if (row["status"]==="ACTIVE") {
        return this.$t('lang.ACTIVE')
      } else if (row["status"]==="DOWN") {
        return this.$t('lang.DOWN')
      } else if (row["status"]==="BUILD") {
        return this.$t('lang.BUILD')
      } else if (row["status"]==="ERROR") {
        return this.$t('lang.ERROR')
      }
    },
    statusTagRender(status) {
      if (status==="ACTIVE") {
        return "success";
      } else if (status==="DOWN") {
        return "info";
      } else if (status==="BUILD") {
        return "info";
      } else if (status==="ERROR") {
        return "danger";
      }
    },
    showDetail(index, row) {
      let networkId = row["id"];
      this.$router.push({
        path: '/net/networkview/networktab/'+networkId+"/networksubnet"
      });
    },
    zoneRender(zones) {
      if (zones) {
        return zones.join(",");
      } else {
        return "-";
      }
    }
  }
}
</script>
