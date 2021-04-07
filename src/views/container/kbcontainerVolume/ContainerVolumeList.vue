<template>
  <div>
    <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('lang.project')" v-show="roleType=='0'">
        <el-input auto-complete="off" size="small" :readonly="true" @focus="selectProject" v-model="formInline.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('container.cluster') ">
        <el-select v-model="formInline.clusterId" size="small" @change="clusterChange">
          <el-option v-for="item in allClusters" :key="item.uuid" :label="item.name" :value="item.uuid">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('container.creator')" v-show="roleType!='3'">
        <el-select v-model="formInline.creator" filterable clearable>
          <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('lang.name')">
        <el-input v-model="formInline.name" size="small"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' @click="onQuery" size="small">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix" v-if="roleType!=='0'"></div>
    <operation-panel v-if="roleType!=='0'"
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
    <div class="divider clearfix"></div>
    <el-table ref="table" :data="tableData" v-loading="loading" :element-loading-text="$t('lang.loading')"
      highlight-current-row stripe border
      :default-sort="{prop: 'creationTimestamp', order: 'descending'}"
      row-key="uuid"
      @row-click="rowClick" @sort-change="sortChange"  @selection-change="handleSelectionChange">
      <el-table-column reserve-selection type="selection" align="center" width="55" v-if="roleType!=='0'">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" show-overflow-tooltip sortable min-width="100" align="left">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status"
        :label="$t('lang.status')" show-overflow-tooltip sortable="custom" min-width="100" align="left">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status, scope.row)">
            <span>{{statusToCH(scope.row.status, scope.row)}}</span>
          </el-tag>
          <el-tooltip placement="top" trigger="hover" :content="eventsRender(scope.row.events)" v-if="JSON.stringify(scope.row.events) != '{}' && scope.row.status != 'Bound'">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('project_name') >= 0 && roleType=='0'"
        prop="project_name"
        :label="$t('lang.project')"
        show-overflow-tooltip
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('size') >= 0"
        prop="size"
        :label="$t('container.volumeSizeGB')"
        show-overflow-tooltip
        sortable="custom"
        align="left"
        min-width="80">
        <template slot-scope="scope">
          <span>{{scope.row.size}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('mountstatus') >= 0"
        prop="mountstatus"
        :label="$t('container.mountstatus')"
        show-overflow-tooltip
        align="left"
        min-width="80">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.mountstatus, scope.row)">
            <span>{{mountstatusToCH(scope.row.mountstatus, scope.row)}}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('app_name') >= 0"
        prop="app_name"
        :label="$t('container.attachedApp')"
        show-overflow-tooltip
        min-width="80" align="left">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('mountPath') >= 0"
        prop="mountPath"
        :label="$t('monitor.mountPath')"
        show-overflow-tooltip
        min-width="100" align="left">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('storageProvider') >= 0"
        prop="storageProvider"
        :label="$t('container.storageProvider')"
        show-overflow-tooltip
        min-width="100" align="left">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('volumetype') >= 0"
        prop="volumetype"
        :label="$t('storage.volumetype')"
        show-overflow-tooltip
        align="left"
        min-width="60">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('namespace') >= 0"
        prop="namespace"
        :label="$t('container.creator')"
        show-overflow-tooltip
        align="left"
        min-width="60">
        <template slot-scope="scope">
          <span>{{creatorRender(scope.row.namespace)}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('creationTimestamp') >= 0"
        prop="creationTimestamp"
        :label="$t('storage.createdTime')"
        min-width="100" sortable align="left">
        <template slot-scope="scope">
          <span v-html="dateRender(scope.row.creationTimestamp, scope.row)"></span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="refreshData">
          </el-button>
          <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
      </el-row>
    </div>
    <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    <create-volume ref="CreateVolume" v-if="createVolumeFlag" @handleAddShow="handleAddShow" @refreshData="refreshData"></create-volume>
    <mount-volume ref="MountVolume" v-if="mountVolumeFlag" @handleAddShow="handleAddShow" :selectedRowData="selectedRowData" @refreshData="refreshData"></mount-volume>
    <expand-volume ref="expandVolume" v-if="expandVolumeFlag" @handleAddShow="handleAddShow" :selectedRowData="selectedRowData" @refreshData="refreshData"></expand-volume>
  </div>
</template>
<script>
  import CreateVolume from "./CreateContainerVolume";
  import MountVolume from "./MountContainerVolume";
  import ExpandVolume from "./VolumeExpansion";
  import uuid from 'uuid';
  export default {
    name: 'ContainerVolumeList',
    components: {
      CreateVolume, MountVolume, ExpandVolume
    },
    data () {
      return {
        formInline: {
          projectId:"",
          projectName:"",
          creator: "",
          rancher_cluster_id:"",
          clusterId:"",
          name:""
        },
        sortObj: {
          sortOrder: "desc",
          sortField: "creationTimestamp"
        },
        roleType:Vue.roleType,
        projectOption: [],
        projectMap:{},
        userList:[],
        userMap:new Map(),
        allClusters:[],
        selProjectFlg:false,
        selUserFlg:false,
        createVolumeFlag:false,
        mountVolumeFlag:false,
        expandVolumeFlag:false,
        selectedRowData:{},
        clusterIp:"",
        rcDetail:{},
        total: 0,
        columns: [],
        columnsChecked:["name", "size", "status", "mountstatus", "app_name", "mountPath", "storageProvider", "volumetype", "namespace", "creationTimestamp", "uuid", "project_name"],
        tableData: [],
        totalData:[],
        multipleSelection: [],
        loading: false,
        operationMenus: [{
          icon: "fa-plus",
          name: this.$t('container.create'),
          showflg: true,
          readOnly: true,
          handler: function() {
            this.createVolumeFlag = true;
            this.$nextTick(() => {
              this.$refs.CreateVolume.show();
            });
          }.bind(this)
        }, {
          icon: "fa-plus",
          name: this.$t('container.attach'),
          showflg: true,
          readOnly: false,
          enable(rowData) {
            if (rowData["mountstatus"]=="unmounted" && rowData["app_name"]=="-") {
              return true;
            } else {
              return false;
            }
          },
          handler: function(rowDatas) {
            this.selectedRowData = rowDatas[0];
            this.mountVolumeFlag = true;
          }.bind(this)
        }, {
          icon: "fa-minus",
          name: this.$t('container.detach'),
          showflg: true,
          readOnly: false,
          enable(rowData) {
            if (rowData["mountstatus"]=="mounted" || rowData["app_name"]!="-") {
              return true;
            } else {
              return false;
            }
          },
          handler: function(rowDatas) {
            this.selectedRowData = rowDatas[0];
            this.$confirm(this.$t('container.detachVolumeConfirmMsg'), this.$t('lang.confirm'), {
              confirmButtonText: this.$t('lang.confirm'),
              cancelButtonText: this.$t('lang.cancel'),
              type: 'warning'
            }).then(() => {
              let self = this;
              let attachParams = {
                "app_name": self.selectedRowData["app_name"],
                "app_type": self.selectedRowData["app_type"],
                "rancher_cluster_id": self.formInline.rancher_cluster_id,
                "user_id": self.selectedRowData['namespace'],
                "volume_name": self.selectedRowData["name"]
              };
              let traceId = 'req-'+uuid.v1();
              let reponse = this.$ajax({
                type: 'post',
                url: "api/cetus/v1/storage/detach_volume",
                data: JSON.stringify(attachParams),
                headers: {
                  'X-Openstack-Request-Id': traceId
                },
                successFun:(response) => {
                  if (response.result == "success") {
                    self.$recordLog({
                      target: Vue.logTarget.containerVolume,
                      level: {
                        en: "info",
                        zh_cn: "信息"
                      },
                      description: {
                        en: "Mount container volume:" + self.selectedRowData.name,
                        zh_cn: "容器卷:" + self.selectedRowData["name"] + "从应用:"+self.selectedRowData["app_name"]+"卸载"
                      },
                      trace_id: traceId
                    });
                    self.$notify({
                      message: self.$t('container.detachSuccessMsg'),
                      type: "success"
                    });
                    self.refreshData();
                  } else {
                    self.$recordLog({
                      target: Vue.logTarget.containerVolume,
                      level: {
                        en:"error",
                        zh_cn:"错误"
                      },
                      description: {
                        en: response.result,
                        zh_cn: "容器卷:" + self.selectedRowData["name"] + "从应用"+self.selectedRowData["app_name"]+"卸载错误："+response.result
                      },
                      trace_id: traceId
                    });
                    self.$notify({
                      message: response.result,
                      type: "error"
                    });
                  }
                }
              });
            }).catch(() => {});
          }.bind(this)
        }, {
          icon: "fa-remove",
          name: this.$t('lang.delete'),
          showflg: true,
          readOnly: false,
          multi:true,
          enable(rowData) {
            if (rowData["mountstatus"]=="mounted") {
              return false;
            } else {
              return true;
            }
          },
          handler: function(selectedRows) {
            let self = this;
            self.$prompt(this.$t('lang.ifDeleteData'), this.$t('lang.confirm'), {
              confirmButtonText: this.$t('lang.confirm'),
              cancelButtonText: this.$t('lang.cancel'),
              inputPattern:/^YES$|^NO$/i,
              inputValue: "NO",
              customClass: "promptConfirmDel",
              inputErrorMessage:this.$t('lang.onlyAcceptYesOrNo')
            }).then(async({ value }) => {
              if ("yes" == value.toLowerCase()) {
                for (let i = 0; i < selectedRows.length; i++) {
                  let row = selectedRows[i];
                  let data = {
                    rancher_cluster_id: this.formInline.rancher_cluster_id,
                    user_id: row['namespace'],
                    volume_name: row["name"]
                  }
                  self.$ajax({
                    type: "POST",
                    url: 'api/cetus/v1/storage/delete_volume',
                    data: JSON.stringify(data),
                    success: function(response) {
                      if (response.result == "success") {
                        self.$notify({
                          message: Vue.t('container.deleting') + row["name"],
                          type: "success"
                        });
                        self.refreshData();
                      } else {
                        self.$notify({
                          message: response.result,
                          type: "error"
                        });
                      }
                    },
                    errFun() {
                    },
                    log:{
                      description:{
                        en:"Delete container volume:"+row["name"],
                        zh_cn:"删除容器卷:"+row["name"]
                      },
                      target:Vue.logTarget.containerVolume
                    }
                  });
                }
              }
            }).catch(() => {
            });
          }.bind(this)
        }
        // , {
        //   icon: "fa-plus",
        //   name: this.$t('storage.extending'),
        //   showflg: Vue.roleType != "0",
        //   readOnly: false,
        //   multi: false,
        //   enable: function(rowData) {
        //     if (rowData["status"] == "Bound" && rowData["mountstatus"]!="operating") {
        //       return true;
        //     } else {
        //       return false;
        //     }
        //   },
        //   handler: function(selectedRows) {
        //     this.selectedRowData = selectedRows[0];
        //     this.expandVolumeFlag = true;
        //   }.bind(this)
        // }
        ]
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
          if (dataList.length > 0) {
            for (let i=0; i<dataList.length; i++) {
              let rowData = dataList[i];
              if (rowData["status"] != "Bound" || rowData["mountstatus"]=="operating") {
                self.reloadTblFlag = true;
              }
            }
          }
          clearInterval(self.reloadTabelInterval);

          if (self.reloadTblFlag && !self._isDestroyed) {
            self.reloadTabelInterval = setInterval(() => {
              this.getData(false, true);
            }, 10000);
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
          self.getData(true);
        });
      }
    },
    methods: {
      async getClusterByProject() {
        try {
          let projectId = this.$cookie.get('pid');
          if (this.roleType == "0") {
            projectId = this.formInline.projectId;
          } else {
            projectId = this.$cookie.get('pid');
          }
          this.allClusters = [];
          this.formInline.clusterId = "";
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
          let clusters = ret.result;
          for (let i = 0; i < clusters.length; i++) {
            if (clusters[i].status == 'active' || clusters[i].status == 'UPDATE_IN_PROGRESS') {
              this.allClusters.push(clusters[i]);
            }
          }
          if (this.allClusters.length > 0) {
            this.formInline.clusterId = this.allClusters[0].uuid;
            this.formInline.rancher_cluster_id = this.allClusters[0].rancher_cluster_id;
            if (this.roleType == "0") {
              this.getData(true);
            }
          } else {
            this.formInline.clusterId = "";
            this.totalData = [];
          }
        } catch (e) {
          this.allClusters = [];
        }
      },
      clusterChange(val) {
        for (let i=0; i<this.allClusters.length; i++) {
          if (val == this.allClusters[i]['uuid']) {
            this.formInline.rancher_cluster_id = this.allClusters[i]['rancher_cluster_id'];
          }
        }
      },
      async getUserList() {
        let self = this;
        self.userList = [];
        let roleType = Vue.roleType + "";
        let projectId = self.formInline.projectId;
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
                this.formInline.projectId = s.id;
                this.formInline.projectName = s.name;
                break;
              }
            }
            if (flg) {
              this.formInline.projectId = projectOption[0].id;
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
        this.formInline.projectId = id;
        this.formInline.projectName = name;
        this.getClusterByProject();
        this.getUserList();
      },
      onIconClick() {
        this.formInline.projectId = '';
        this.formInline.projectName = '';
        this.getClusterByProject();
        this.getUserList();
      },
      async getData(isClear = true, isInterval = false) {
        let self = this;
        let queryObj = {};
        queryObj["role_type"] = parseInt(self.roleType);
        queryObj["user_id"] = Vue.userId;
        queryObj["rancher_cluster_id"] = self.formInline.rancher_cluster_id;
        if (self.formInline.rancher_cluster_id == "") {
          return;
        }
        if (isClear) {
          self.$nextTick(() => {
            self.$refs.table.clearSelection();
          });
        }
        if (!isInterval) {
          self.loading = true;
        }
        try {
          let ajaxParam = {
            type: 'post',
            url: "api/cetus/v1/storage/list_volumes",
            data:JSON.stringify(queryObj)
          };
          let rcList = await this.$ajax(ajaxParam);
          self.loading = false;
          let volumes = rcList["volumes"];
          if (volumes.length == 0) {
            self.totalData = [];
            return;
          }
          let tableList = [];
          for (let i=0; i<volumes.length; i++) {
            let appObj = volumes[i];
            let size = appObj["metadata"] && appObj["metadata"]["volumeSize"];
            if (!size) {
              size = (appObj["spec"] && appObj["spec"]["resources"] && appObj["spec"]["resources"]["requests"] && appObj["spec"]["resources"]["requests"]["storage"]) || "";
            }
            let tableObject = {
              "name":appObj["metadata"]["name"],
              "status":appObj["status"]["phase"],
              "mountstatus":appObj["metadata"]["mountStatus"],
              "size": self.sizeRender(size) || "",
              "storageProvider":appObj["metadata"]["annotations"]["volume.beta.kubernetes.io/storage-provisioner"],
              "volumetype":appObj["metadata"]["voluemtype"] || "-",
              "namespace": appObj["metadata"]["namespace"] || "",
              "uuid":appObj["metadata"]["uid"] || "",
              "rancher_cluster_id":self.formInline.rancher_cluster_id,
              "clusterId":self.formInline.clusterId,
              "creationTimestamp":appObj["metadata"]["creationTimestamp"],
              "events":appObj["event"],
              "project_name":this.formInline.projectName,
              "mountPath":"-",
              "app_name":"-",
              "app_type":"-"
            };
            if (appObj["metadata"].hasOwnProperty("mountInfo")) {
              tableObject.app_name = appObj["metadata"]["mountInfo"]["app_name"];
              tableObject.app_type = appObj["metadata"]["mountInfo"]["app_type"];
              if (appObj["metadata"]["mountInfo"]["app_type"] == null || appObj["metadata"]["mountInfo"]["app_type"] == "null") {
                delete tableObject.app_type;
              }
              tableObject.mountPath = appObj["metadata"]["mountInfo"]["mountPath"];
            }
            tableList.push(tableObject);
          }
          self.totalData = this.filterList(tableList);
        } catch (data) {
          self.loading = false;
        }
      },
      filterList(allData) {
        let self = this;
        let nameFilteredData = [];
        if (self.formInline.name == '') {
          nameFilteredData = allData;
        } else {
          allData.forEach(function(obj) {
            if (obj.name.indexOf(self.formInline.name) > -1) {
              nameFilteredData.push(obj);
            }
          });
        }
        let userFilterData = [];
        if (self.formInline.creator == '') {
          userFilterData = nameFilteredData;
        } else {
          nameFilteredData.forEach(function(obj) {
            if (obj.namespace.indexOf(self.formInline.creator) > -1) {
              userFilterData.push(obj);
            }
          });
        }
        return userFilterData;
      },
      projectIdtoName(value) {
        return this.projectMap[value];
      },
      creatorRender(value) {
        let name = this.userMap.get(value);
        if (null == name || "" == name) {
          return '-';
        } else {
          return name;
        }
      },
      statusToCH(status, row) {
        if (status == "Bound") {
          return this.$t('opt.usable');
        } else {
          return this.$t('container.processing');
        }
      },
      mountstatusToCH(status, row) {
        if (status == "unmounted") {
          return this.$t('container.unmounted');
        } else if (status == "mounted") {
          return this.$t('container.attached');
        } else if (status=="operating") {
          return this.$t('container.processing');
        } else {
          return status;
        }
      },
      statusTagRender(status, row) {
        if (status == "unmounted" || status=="Bound") {
          return 'info';
        } else if (status == "mounted") {
          return 'success';
        } else {
          return 'info';
        }
      },
      sizeRender(size) {
        if (!size) {
          return "";
        }
        let realsize = parseInt(size.substring(0, size.length -2 ));
        let sizeunit = size.substring(size.length -2, size.length);
        if (sizeunit == "Ti") {
          realsize = realsize*1024;
        }
        return realsize;
      },
      getCurrentData(param) {
        this.tableData = param;
      },
      //多选
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //排序
      sortChange(column) {
        let self = this;
        let key = column.prop;
        let keyOrder = column.order;
        self.sortObj = {
          sortOrder: keyOrder,
          sortField: column.prop
        };
        if (keyOrder != null && self.totalData != null && (key === "size")) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder, "int"));
          self.sortObj.sortType = "Int";
          return;
        }
        if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(self.$sortFormatter(key, keyOrder));
          self.sortObj.sortType = undefined;
        }
      },
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      //刷新
      refreshData() {
        setTimeout(() => { this.getData(true); }, 3000);
      },
      onQuery() {
        if (this.formInline.name.length > 40) {
          this.$message.error(this.$t('heat.fortyCharacterMaximum'));
          return;
        }
        this.getData(true);
      },
      handleAddShow() {
        this.createVolumeFlag = false;
        this.mountVolumeFlag = false;
        this.expandVolumeFlag = false;
      },
      dateRender(value, rowData) {
        var self = this;
        if (value.lastIndexOf("Z") < 0 && value.lastIndexOf(".") >= 0) {
          value = value.substring(0, value.lastIndexOf(".")) + "Z";
        }
        var time = Date.parse(new Date(value));
        return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
      },
      /**
       * 将时间戳格式化的方法
       * @param timeStamp时间戳值
       * @param fmt 要生成的格式，如yyyy-MM-dd HH:mm:ss
       * @returns
       */
      formatTimeStamp(timeStamp, fmt) {
        if (!timeStamp) {
          return "";
        }
        var date = new Date();
        date.setTime(timeStamp);
        var o = {
          "M+": date.getMonth() + 1, //月份
          "d+": date.getDate(), //日
          "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
          "H+": date.getHours(), //小时
          "m+": date.getMinutes(), //分
          "s+": date.getSeconds(), //秒
          "q+": Math.floor((date.getMonth() + 3) / 3), //季度
          "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
          fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : ""));
        }
        for (var k in o) {
          if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
          }
        }
        return fmt;
      },
      eventsRender(events) {
        let eventNotes = "";
        if (JSON.stringify(events) != "{}") {
          let reasion = events["reason"];
          let message = events["message"];
          eventNotes += reasion+":"+message;
        }
        return eventNotes;
      }
    }
  };
</script>

