<template>
  <div>
    <icos-page-header :title="$t('container.appManage')" :show-bottom-border="true" />
    <icos-page>
      <!-- <div class="divider clearfix"></div> -->
      <el-form :inline="true" :model="formInline" class="form-inline">
        <el-form-item :label="$t('lang.project')" v-show="roleType=='0'">
          <el-input auto-complete="off" size="small" :readonly="true" @focus="selectProject" v-model="formInline.projectName"></el-input>
        </el-form-item>
        <el-form-item :label="$t('container.cluster') ">
          <el-select v-model="formInline.clusterId" size="small" @change="clusterChange">
            <el-option v-for="item in allClusters" :key="item.rancher_cluster_id" :label="item.name" :value="item.rancher_cluster_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('container.appName')">
          <el-input v-model="formInline.appName" size="small"></el-input>
        </el-form-item>
        <el-form-item :label="$t('container.runstate')">
          <el-select v-model="formInline.query_status" filterable clearable>
            <el-option v-for="item in statusOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('container.creator')" v-show="roleType!='3'">
          <el-select v-model="formInline.creator" filterable clearable>
            <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon='fa-search' @click="onQuery" size="small">{{$t('lang.query')}}</el-button>
        </el-form-item>
      </el-form>
      <div class="divider clearfix" v-if="roleType!='0'"></div>
      <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
      <div class="divider clearfix"></div>
      <el-table ref="table" :data="tableData" v-loading="loading" :element-loading-text="$t('lang.loading')" 
        highlight-current-row border stripe 
        :default-sort="{prop: 'name', order: 'ascending'}" row-key="uuid" 
        @row-click="rowClick" @sort-change="sortChange" @selection-change="handleSelectionChange">
        <el-table-column reserve-selection type="selection" align="center" width="55" v-if="roleType !='0'">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('container.appName')" show-overflow-tooltip sortable="custom" align="left" min-width="100">
          <template slot-scope="scope">
            <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('uuid') >= 0" label="ID" prop="id" align="left" min-width="80">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" :label="$t('container.runstate')" show-overflow-tooltip align="left" min-width="80">
          <template slot-scope="scope">
            <el-tag :type="statusTagRender(scope.row.status)">
              <span>{{statusToCH(scope.row.status)}}</span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('projectName') >= 0 && roleType=='0'" :label="$t('lang.project')" prop="projectName" align="left" min-width="80">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('type') >= 0" prop="type" :label="$t('container.applicationType')" show-overflow-tooltip align="left" min-width="100">
          <template slot-scope="scope">
            <span>{{typeRender(scope.row.type)}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('replicas') >= 0" prop="replicas" :label="$t('container.copyNumber')" show-overflow-tooltip align="left" min-width="80">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('creationTimestamp') >= 0" prop="creationTimestamp" :label="$t('lang.createTime')" show-overflow-tooltip align="left" sortable="custom" min-width="100">
          <template slot-scope="scope">
            <span>{{tzTimeFormatter(scope.row.creationTimestamp)}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('namespace') >= 0" prop="namespace" :label="$t('container.creator')" show-overflow-tooltip align="left" min-width="100">
          <template slot-scope="scope">
            <span>{{creatorRender(scope.row.namespace)}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('loadbalance') >= 0" prop="loadbalance" :label="$t('container.hpa')" show-overflow-tooltip align="left" min-width="80">
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc('lang.item', multipleSelection.length)}}</span>
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
          <el-col :span="19">
            <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
          </el-col>
        </el-row>
      </div>
      <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
      <create-instance ref="createInstance" v-if="createInstanceFlag" @handleAddShow="handleAddShow" @refreshData="getData"></create-instance>
      <mount-volume ref="mountVolume" v-if="mountVolumeFlag" @handleAddShow="handleAddShow" :selectedRowData="selectedRowData" @refreshData="getData"></mount-volume>
      <set-balance ref="setBalance" v-if="setbalanceFlag" @handleAddShow="handleAddShow" :selectedRowData="selectedRowData" @refreshData="getData"></set-balance>
    </icos-page>
  </div>
</template>
<script>
import CreateInstance from "./CreateInstanceGuide"
import MountVolume from "./MountVolume"
import SetBalance from "./SetBalance"
export default {
  name: 'ApplicationManage',
  components: {
    CreateInstance, MountVolume, SetBalance
  },
  data() {
    return {
      formInline: {
        project_id: "",
        projectName:"",
        clusterId: "",
        appName:"",
        query_status: "",
        creator: ""
      },
      sortObj:{
        sortOrder:"descending",
        sortField:"creationTimestamp"
      },
      statusOption: [{
        id: "0",
        name: Vue.t('container.running')
      }, {
        id: "1",
        name: Vue.t('container.closed')
      }, {
        id: "2",
        name: Vue.t('container.processing')
      }],
      queryParam: {},
      selProjectFlg:false,
      projectDisabled:false,
      roleType: Vue.roleType,
      userMap:new Map(),
      totalData: [],
      tableData: [],
      columnsChecked: ["name", "status", "type", "replicas", "creationTimestamp", "namespace", "loadbalance", "projectName"],
      columns: [],
      tzTimeFormatter: this.$tzTimeFormatter,
      multipleSelection: [],
      loading: false,
      allClusters: [],
      userList: [],
      selectedRowData:{},
      modifyInstanceFlag: false,
      createInstanceFlag: false,
      mountVolumeFlag:false,
      setbalanceFlag: false,
      cnidriver:"",
      operationMenus: [{
        icon: "fa-plus",
        name: this.$t('container.create'),
        showflg: Vue.roleType != '0',
        readOnly: true,
        handler: function() {
          this.createInstanceFlag = true;
        }.bind(this)
      }, {
        icon: "fa-play",
        name: this.$t('container.open'),
        showflg: Vue.roleType != "0",
        readOnly: false,
        enable(rowData) {
          return rowData.status == 1;
        },
        handler: function(selectedRows) {
          let me = this;
          me.$confirm(this.$t('container.openAppConfirmMsg'), this.$t('lang.confirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            type: 'warning'
          }).then(() => {
            me.$message.success(this.$t('container.openAppMsg'));
            for (let i = 0; i < selectedRows.length; i++) {
              let rcName = selectedRows[i].name;
              let deleteData = {
                app_name:selectedRows[i].name,
                app_type:selectedRows[i].type,
                user_id:selectedRows[i].namespace,
                rancher_cluster_id:me.formInline.clusterId
              };
              this.$ajax({
                url: "api/cetus/v1/app/start_app",
                type: 'post',
                data: JSON.stringify(deleteData),
                successFun: () => {},
                log: {
                  description: {
                    en: "open replicationcontroller:"+rcName,
                    zh_cn: "开启应用:"+rcName
                  },
                  target: Vue.logTarget.applicationManage
                }
              });
            };
            setTimeout(() => { this.getData(this.queryParam, true); }, 2000);
          }).catch(() => {});
        }.bind(this)
      }, {
        icon: "fa-stop",
        name: this.$t('container.close'),
        showflg: Vue.roleType != "0",
        readOnly: false,
        enable(rowData) {
          return rowData.status == 0;
        },
        handler: function(selectedRows) {
          let me = this;
          me.$confirm(this.$t('container.closeApppConfirmMsg'), this.$t('lang.confirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            type: 'warning'
          }).then(() => {
            me.$message.success(this.$t('container.closeAppMsg'));
            for (let i = 0; i < selectedRows.length; i++) {
              let rcName = selectedRows[i].name;
              let deleteData = {
                app_name:selectedRows[i].name,
                app_type:selectedRows[i].type,
                user_id:selectedRows[i].namespace,
                rancher_cluster_id:me.formInline.clusterId
              };
              this.$ajax({
                url: "api/cetus/v1/app/stop_app",
                type: 'post',
                data: JSON.stringify(deleteData),
                successFun: () => {
                },
                log: {
                  description: {
                    en: "stop replicationcontroller:" + rcName,
                    zh_cn: "停止应用:" + rcName
                  },
                  target: Vue.logTarget.applicationManage
                }
              });
            };
            setTimeout(() => { this.getData(this.queryParam, true); }, 2000);
          }).catch(() => {});
        }.bind(this)
      }, {
        icon: "fa-remove",
        name: this.$t('lang.delete'),
        showflg: Vue.roleType != "0",
        readOnly: false,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let me = this;
          me.$prompt(this.$t('container.deleteAppConfirmMsg'), this.$t('lang.confirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            inputPattern:/^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage:this.$t('lang.onlyAcceptYesOrNo')
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
            me.$message.success(this.$t('container.deleting'));
            for (let i = 0; i < selectedRows.length; i++) {
              let rcName = selectedRows[i].name;
              let url = "api/cetus/v1/app/delete_app";
              let deleteData = {
                app_name:selectedRows[i].name,
                app_type:selectedRows[i].type,
                user_id:selectedRows[i].namespace,
                rancher_cluster_id:me.formInline.clusterId
              };
              this.$ajax({
                type: 'post',
                url: url,
                data: JSON.stringify(deleteData),
                successFun: (response) => {
                },
                log: {
                  description: {
                    en: "delete replicationcontroller:" + rcName,
                    zh_cn: "删除应用:" + rcName
                  },
                  target: Vue.logTarget.applicationManage
                }
              });
            };
            setTimeout(() => { this.getData(this.queryParam, true); }, 2000);
          }
          }).catch(() => {
          });
        }.bind(this)
      }, {
        icon:"fa-plus",
        name:this.$t('container.deviceConnect'),
        showflg:Vue.roleType != "0",
        readOnly:false,
        enable(rowData) {
          if (rowData['status'] == "0" && rowData["loadbalance"]!= Vue.t('base.open')) {
            return true;
          }
          return false;
        },
        handler: function(selectedRows) {
          this.mountVolumeFlag = true;
          this.selectedRowData = selectedRows[0];
        }.bind(this)
      }, {
        icon:"fa-circle",
        name:this.$t('container.startHpa'),
        showflg:Vue.roleType != "0",
        readOnly:false,
        enable(rowData) {
          if (rowData['type'] == "deployment" && rowData['status'] == "0" && rowData['loadbalance'] == Vue.t('base.close') && rowData['volumes'] == false) {
              return true;
          }
          return false;
        },
        handler: function(selectedRows) {
          this.setbalanceFlag = true;
          this.selectedRowData = selectedRows[0];
        }.bind(this)
      }, {
        icon:"fa-circle-o",
        name:this.$t('container.stopHpa'),
        showflg:Vue.roleType != "0",
        readOnly:false,
        enable(rowData) {
          if (rowData['type'] == "deployment" && rowData['status'] == "0" && rowData['loadbalance'] == Vue.t('base.open')) {
              return true;
          }
          return false;
        },
        handler: function(selectedRows) {
          this.setbalanceFlag = true;
          this.selectedRowData = selectedRows[0];
        }.bind(this)
      }]
    };
  },
  beforeDestroy() {
    if (this.reloadTabelInterval != null) {
      clearInterval(this.reloadTabelInterval);
    }
  },
  watch: {
    columnsChecked: {
      handler: function (rows, oldVal) {
       this.columnsChecked = rows;
      },
      deep: true
    },
    tableData: {
      immediate: false,
      handler: function(dataList) {
        let self = this;
        self.reloadTblFlag = false;
        if (dataList != null) {
          for (let t = 0; t < dataList.length; t++) {
            let data = dataList[t];
            if (data['status'] == "2") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.reloadTabelInterval);

        if (self.reloadTblFlag && !self._isDestroyed) {
          self.reloadTabelInterval = setInterval(() => {
            this.getData(this.queryParam, false, true);
          }, 8000);
        }
      }
    }
  },
  mounted() {
    let table = this.$refs.table;
    table.$children.forEach((item, index) => {
      if (item.label && item.prop) {
        this.columns.push({
          prop: item.prop,
          label: item.label
        });
      }
    });
    let self = this;
    if (Vue.roleType == "0") {
      self.getProjectList();
    } else {
      Promise.all([self.getClusterByProject(), self.getUserList()]).then(function(result) {
        self.getData({}, true);
      });
    }
  },
  methods: {
    async getClusterByProject() {
      try {
        let projectId = this.$cookie.get('pid');
        if (this.roleType == "0") {
          projectId = this.formInline.project_id;
        } else {
          projectId = this.$cookie.get('pid');
        }
        let ajaxParam = {
          type: 'POST',
          url: "api/cetus/v1/cluster/index",
          data:JSON.stringify({
            "key":"name",
            "keyOrder":"ascending",
            "project_id":projectId
          }),
          showErrMsg: false
        };
        let ret = await this.$ajax(ajaxParam);
        this.allClusters = [];
        let clusters = ret.result;
        for (let i = 0; i < clusters.length; i++) {
          if (clusters[i].status == 'active' || clusters[i].status == 'UPDATE_IN_PROGRESS') {
            this.allClusters.push(clusters[i]);
          }
        }
        if (this.allClusters.length > 0) {
          this.formInline.clusterId = this.allClusters[0].rancher_cluster_id;
          this.cnidriver = this.allClusters[0]["network_driver"];
          if (this.roleType == "0") {
            this.getData(this.queryParam, true);
          }
        } else {
          this.formInline.clusterId = "";
        }
      } catch (e) {
        this.allClusters = [];
      }
    },
    async getUserList() {
      let self = this;
      self.userList = [];
      let roleType = Vue.roleType + "";
      let projectId = self.formInline.project_id;
      let url = "api/keystone/v3/inspur/users";
      if ("2" == roleType || "3" == roleType) {
        url = "api/keystone/v3/inspur/users?project_id=" + self.$cookie.get('pid');
      } else {
        url = "api/keystone/v3/inspur/users";
        if ("" != projectId && "0" != projectId) {
          url += "?project_id=" + projectId;
        }
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        let users = result['users'];
        for (let q = 0; q < users.length; q++) {
          self.userMap.set(users[q].id, users[q].name);
        }
        self.userList = self.userList.concat(result['users']);
      } catch (res) {
      }
    },
    async getProjectList() {
      try {
        let url = 'api/keystone/v3/users/' + Vue.userId + '/projects?domain_id=default';
        if (Vue.roleType == '0') {
          url = 'api/keystone/v3/inspur/projects?dir=&field=name&limit=9999&page=1&domain_id=default';
        }
        let result = await this.$ajax({
          type: "GET",
          url: url
        });
        let projectOption = result["projects"];
        if (Vue.roleType == '0') {
          let flg = true;
          for (let i = 0; i < projectOption.length; i++) {
            let s = projectOption[i];
            if (s.name == "admin") {
              flg = false;
              this.formInline.project_id = s.id;
              this.formInline.projectName = s.name;
              break;
            }
          }
          if (flg) {
            this.formInline.project_id = projectOption[0].id;
            this.formInline.projectName = projectOption[0].name;
          }
          this.getClusterByProject();
          this.getUserList();
        }
      } catch (res) {
      }
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.formInline.project_id = id;
      this.formInline.projectName = name;
      this.getClusterByProject();
      this.getUserList();
    },
    onIconClick() {
      this.formInline.project_id = '';
      this.formInline.projectName = '';
      this.getClusterByProject();
      this.getUserList();
    },
    async getData(param={}, isClear = true, isInterval = false) {
      let self = this;
      let queryObj = {};
      queryObj["role_type"] = parseInt(self.roleType);
      queryObj["user_id"] = Vue.userId;
      queryObj["rancher_cluster_id"] = self.formInline.clusterId;
      if (self.formInline.clusterId == "") {
        return;
      }
      if (!isInterval) {
        self.loading = true;
      }
      if (isClear) {
        self.$nextTick(() => {
          self.$refs.table.clearSelection();
        });
      }
      try {
        let rcList = await this.$ajax({
          type:'post',
          url:"api/cetus/v1/app/index_app",
          data:JSON.stringify(queryObj)
        });
        self.loading = false;
        let tableList = [];
        if (rcList.hasOwnProperty('deployment')) {
          let resList = rcList["deployment"];
          for (let i=0; i<resList.length; i++) {
            let appObj = resList[i];
            let tableObject = {
              "name":"",
              "status":"",
              "type":"",
              "replicas":"",
              "creationTimestamp":"",
              "namespace":"",
              "loadbalance":"-",
              "uuid":"",
              "rancher_cluster_id":"",
              "projectName": this.formInline.projectName,
              "volumes":false,
              "cnidriver":this.cnidriver
            };
            tableObject.name = appObj["metadata"]["name"];
            tableObject.uuid = appObj["metadata"]["uid"];
            tableObject.creationTimestamp = appObj["metadata"]["creationTimestamp"];
            tableObject.namespace = appObj["metadata"]["namespace"];
            tableObject.rancher_cluster_id = self.formInline.clusterId;
            tableObject.type = "deployment";
            let replicas = appObj.spec.replicas;
            let readyReplicas = appObj.status.readyReplicas;
            let status = "";
            if (replicas == 0) {
              status = "1";
            } else if (replicas == readyReplicas) {
              status = "0";
            } else {
              status = "2";
            }
            if (appObj.status.hasOwnProperty("unavailableReplicas")) {
              status = "2";
            }
            tableObject.status = status;
            tableObject.replicas = replicas;
            if (appObj["spec"]["template"]["spec"]["volumes"]) {
              tableObject.volumes = true;
            }
            tableList.push(tableObject);
          }
        }
        if (rcList.hasOwnProperty('statefulset')) {
          let resList = rcList["statefulset"];
          for (let i=0; i<resList.length; i++) {
            let appObj = resList[i];
            let tableObject = {
              "name":"", "status":"", "type":"", "replicas":"", "creationTimestamp":"", "namespace":"", "loadbalance":"-", "uuid":"", "projectName": this.formInline.projectName, "volumes":false
            };
            tableObject.name = appObj["metadata"]["name"];
            tableObject.uuid = appObj["metadata"]["uid"];
            tableObject.creationTimestamp = appObj["metadata"]["creationTimestamp"];
            tableObject.namespace = appObj["metadata"]["namespace"];
            tableObject.type = "statefulset";
            tableObject.rancher_cluster_id = self.formInline.clusterId;
            let replicas = appObj.status.replicas;
            let readyReplicas = appObj.status.readyReplicas;
            let status = "";
            if (replicas == 0 || replicas == undefined) {
              status = "1";
            } else if (replicas!=0 && replicas == readyReplicas) {
              status = "0";
            } else {
              status = "2";
            }
            if (appObj.status.hasOwnProperty("unavailableReplicas")) {
              status = "2";
            }
            tableObject.status = status;
            tableObject.replicas = replicas;
            if (appObj["spec"]["template"]["spec"]["volumes"]) {
              tableObject.volumes = true;
            }
            tableList.push(tableObject);
          }
        }
        self.totalData = this.filterList(tableList, param);
        self.getSaclingList();
      } catch (data) {
        self.loading = false;
        self.totalData = [];
      }
    },
    filterList(allData, param) {
      if (JSON.stringify(param) == "{}") {
        return allData;
      }
      let nameFilteredData = [];
      if (param.name == '') {
        nameFilteredData = allData;
      } else {
        allData.forEach(function(obj) {
          if (obj.name.indexOf(param.name) > -1) {
            nameFilteredData.push(obj);
          }
        });
      }
      let statusFilteredData = [];
      if (param.status == '') {
        statusFilteredData = nameFilteredData;
      } else {
        nameFilteredData.forEach(function(obj) {
          if (obj.status == param.status) {
            statusFilteredData.push(obj);
          }
        });
      }
      let userFilterData = [];
      if (param.creator == '') {
        userFilterData = statusFilteredData;
      } else {
        statusFilteredData.forEach(function(obj) {
          if (obj.namespace == param.creator) {
            userFilterData.push(obj);
          }
        });
      }
      return userFilterData;
    },
    async getSaclingList() {
      let self = this;
      let result = await self.$ajax({
        type: 'post',
        url: "api/cetus/v1/hpa/list_hpa",
        data:JSON.stringify({
          "rancher_cluster_id": self.formInline.clusterId,
          "user_id":  Vue.userId,
          "role_type": Vue.roleType
        }),
        successFun:(response) => {
          let result = response["result"];
          for (let j=0; j<self.totalData.length; j++) {
            let appdata = self.totalData[j];
            let flg = true;
            if (appdata.type == "deployment") {
              for (let i=0; i<result.length; i++) {
                let scaling = result[i];
                if (appdata.name == scaling.metadata.name) {
                  appdata.loadbalance = Vue.t('base.open');
                  flg = false;
                  break;
                }
              }
              if (flg) {
                appdata.loadbalance = Vue.t('base.close');
              }
            } else {
              appdata.loadbalance = Vue.t('container.unsupport');
            }
          }
        },
        errorFun:(response) => {
        }
      });
    },
    creatorRender(value) {
      let name = this.userMap.get(value);
      if (null == name || "" == name) {
        return '-';
      } else {
        return name;
      }
    },
    statusToCH(value) {
      if (value == "0") {
        return this.$t('container.running');
      } else if (value == "1") {
        return this.$t('container.closed');
      } else if (value == "2") {
        return this.$t('container.processing');
      }
    },
    elasticStatusToCH(row) {
      let elasticStatus = row["elasticStatus"];
      if (elasticStatus == 1) {
        return this.$t('container.open');
      } else if (elasticStatus == 0) {
        return this.$t('container.stopped');
      } else {
        return this.$t('container.stopped');
      }
    },
    statusTagRender(value) {
      let tagType = "";
      if (value === "0") {
        tagType = "success";
      } else if (value === "1") {
        tagType = "gray";
      } else if (value === "2") {
        tagType = "info";
      }
      return tagType;
    },
    typeRender(value) {
      if (value == "deployment") {
        return this.$t('container.stateless');
      } else if (value == "statefulset") {
        return this.$t('container.stateful');
      }
    },
    elasticStatusTagRender(value) {
      let tagType = "";
      if (value === 1) {
        tagType = "success";
      } else {
        tagType = "gray";
      }
      return tagType;
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    sortChange(column) {
      let self = this;
      let key = column.prop;
      let keyOrder = column.order;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
      if (keyOrder != null && self.totalData != null) {
        self.totalData.sort(self.$sortFormatter(key, keyOrder));
      }
    },
    rowClick(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    onRefresh() {
      let param = {};
      param["name"] = this.formInline.appName;
      param["status"] = this.formInline.query_status;
      param["creator"] = this.formInline.creator;
      if (this.roleType == '3') {
        param["creator"] = Vue.userId;
      }
      this.queryParam = param;
      this.getData(this.queryParam, true);
    },
    rowNameClick(rowIndex, rowData) {
      let self = this;
      self.$router.push({
        path:"/container/applicationContainer/" + self.formInline.clusterId + "/" + rowData.type + "/" +
          rowData.namespace + "/" + rowData.name + "/appDetail/appInfo"
      });
    },
    onQuery() {
      let param = {};
      param["name"] = this.formInline.appName;
      param["status"] = this.formInline.query_status;
      param["creator"] = this.formInline.creator;
      if (this.roleType == '3') {
        param["creator"] = Vue.userId;
      }
      this.queryParam = param;
      this.getData(this.queryParam, true);
    },
    handleAddShow() {
      this.createInstanceFlag = false;
      this.modifyInstanceFlag = false;
      this.mountVolumeFlag = false;
      this.setbalanceFlag = false;
    },
    clusterChange(val) {
      for (let i = 0; i < this.allClusters.length; i++) {
        let cluster = this.allClusters[i];
        if (cluster.rancher_cluster_id == val) {
          this.cnidriver = cluster["network_driver"];
        }
      }
    }
  }
};

</script>
<style scoped>

</style>

