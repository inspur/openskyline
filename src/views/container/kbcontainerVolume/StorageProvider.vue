<template>
  <div>
    <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('lang.project')" v-show="roleType=='0'">
        <el-input auto-complete="off" size="small" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="formInline.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('container.cluster') ">
        <el-select v-model="formInline.clusterId" size="small"  @change="clusterChange">
          <el-option v-for="item in allClusters" :key="item.uuid" :label="item.name" :value="item.uuid">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('lang.name')">
        <el-input v-model="formInline.query_name" size="small"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.status')">
        <el-select v-model="formInline.query_status" filterable clearable>
          <el-option v-for="item in statusOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
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
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      stripe
      :default-sort = "{prop: 'name', order: 'ascending'}"
      row-key="id"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55"
        v-if="roleType!=='0'">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('lang.name')"
        show-overflow-tooltip
        sortable="custom"
        min-width="100" align="left">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('cluster') >= 0"
        prop="cluster"
        :label="$t('container.belongCluster')"
        show-overflow-tooltip
        align="left"
        min-width="100">
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
        v-if="columnsChecked.indexOf('csi_type') >= 0"
        prop="csi_type"
        :label="$t('base.type')"
        show-overflow-tooltip
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('status') >= 0"
        prop="status"
        :label="$t('lang.status')"
        show-overflow-tooltip
        sortable="custom"
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status)">
            <span>{{statusToCH(scope.row.status)}}</span>
          </el-tag>
          <el-tooltip placement="top" trigger="hover" :content="eventsRender(scope.row.events)" v-if="scope.row.status=='2' && eventsRender(scope.row.events)!=''">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
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
        <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
      </el-row>
    </div>
    <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    <create-provider ref="CreateProvider" v-if="createFlag" @handleAddShow="handleAddShow" @refreshData="refreshData"></create-provider>
    <edit-provider ref="EditProvider" v-if="editFlag" @handleAddShow="handleAddShow" :selectedRowData="selectedRowData" @refreshData="onRefresh"></edit-provider>
  </div>
</template>
<script>
import CreateProvider from "./CreateStorageProvider";
import EditProvider from "./EditStorageProvider";
import uuid from 'uuid';
export default {
  name: 'StorageProvider',
  components: {
    CreateProvider, EditProvider
  },
  data () {
    return {
      formInline: {
        projectId:"",
        projectName:"",
        clusterId:"",
        clusterName:"",
        rancher_cluster_id:"",
        query_name:"",
        query_status:""
      },
      roleType:Vue.roleType,
      projectOption: [],
      projectMap:{},
      allClusters:[],
      statusOption:[{
        id: "0",
        name: Vue.t('container.running')
      }, {
        id: "2",
        name: Vue.t('container.processing')
      }],
      selProjectFlg:false,
      createFlag:false,
      editFlag:false,
      selectedRowData:{},
      columns: [],
      columnsChecked:["project_name", "name", "cluster", "status", "csi_type"],
      tableData: [],
      totalData:[],
      multipleSelection: [],
      queryParam: {
        query_name:"",
        query_status:""
      },
      loading: false,
      operationMenus: [{
        icon: "fa-plus",
        name: this.$t('container.create'),
        showflg: true,
        readOnly: true,
        handler: function() {
          this.createFlag = true;
        }.bind(this)
      }, {
        icon: "fa-remove",
        name: this.$t('lang.delete'),
        showflg: true,
        readOnly: false,
        multi:true,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let self = this;
          self.$confirm(this.$t('lang.ifDeleteData'), this.$t('lang.deleteConfirm'), {
            confirmButtonText:this.$t('lang.confirm'),
            cancelButtonText:this.$t('lang.cancel'),
            type:'warning'
          }).then(() => {
            for (let i = 0; i < selectedRows.length; i++) {
              let row = selectedRows[i];
              let data = {
                csi_type: "cinder",
                project_id: self.$cookie.get("pid"),
                rancher_cluster_id: self.formInline.rancher_cluster_id,
                cluster_id: self.formInline.clusterId
              };
              let traceId = 'req-'+uuid.v1();
              self.$ajax({
                type: "POST",
                url: 'api/cetus/v1/csi/unregister_provider',
                data: JSON.stringify(data),
                headers: {
                  'X-Openstack-Request-Id': traceId
                },
                success: function(result) {
                  if (result.code == "200") {
                    self.$notify({
                      message: row["name"] + Vue.t('container.deleteSuccessMsg'),
                      type: "success"
                    });
                    self.$recordLog({
                      target: Vue.logTarget.containerVolume,
                      level: {
                        en: "info",
                        zh_cn: "信息"
                      },
                      description: {
                        en:"Delete container storage provider:"+row["name"],
                        zh_cn:"删除存储提供者:"+row["name"]
                      },
                      trace_id: traceId
                    });
                    self.refreshData();
                  } else {
                    self.$notify({
                      message:result.result,
                      type: "error"
                    });
                    self.$recordLog({
                      target: Vue.logTarget.containerVolume,
                      level: {
                        en:"error",
                        zh_cn:"错误"
                      },
                      description: {
                        en:"Delete container storage provider:"+row["name"],
                        zh_cn:"删除存储提供者:"+row["name"]
                      },
                      trace_id: traceId
                    });
                  }
                },
                errFun() {
                  self.refreshData();
                }
              });
            }
          }).catch(() => {
          });
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('lang.edit'),
        showflg: false,
        readOnly: false,
        multi: false,
        enable: function(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          this.selectedRowData = selectedRows[0];
          this.editFlag = true;
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
          self.reloadTblFlag = true;
          // for (let t = 0; t < dataList.length; t++) {
          //   let data = dataList[t];
          //   if (data['status'] == "2") {
          //     self.reloadTblFlag = true;
          //     break;
          //   }
          // }
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
      self.getClusterByProject();
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
          this.formInline.clusterId = this.allClusters[0].uuid;
          this.formInline.rancher_cluster_id = this.allClusters[0].rancher_cluster_id;
          this.formInline.clusterName = this.allClusters[0].name;
          this.getData(this.queryParam, true);
        } else {
          this.formInline.clusterId = "";
          this.totalData = [];
        }
      } catch (e) {
        this.allClusters = [];
      }
    },
    clusterChange(value) {
      for (let i=0; i<this.allClusters.length; i++) {
        if (value == this.allClusters[i]['uuid']) {
          this.formInline.rancher_cluster_id = this.allClusters[i]['rancher_cluster_id'];
          this.formInline.clusterName = this.allClusters[i].name;
        }
      }
    },
    async getData(param, isClear = true, isInterval = false) {
      let self = this;
      let data = {
        csi_type: "cinder",
        project_id: self.$cookie.get("pid"),
        rancher_cluster_id: this.formInline.rancher_cluster_id,
        cluster_id: this.formInline.clusterId
      };
      if (this.roleType === "0") {
        data.project_id = self.formInline.projectId;
      } else {
        data.project_id = self.$cookie.get("pid");
      }
      if (isClear) {
        self.$nextTick(() => {
          self.$refs.table.clearSelection();
        });
      }
      if (!isInterval) {
        self.loading = true;
      }
      if (this.formInline.rancher_cluster_id == "" || this.formInline.clusterId=="") {
        return;
      }
      try {
        let ajaxParam = {
          type: 'post',
          url: "api/cetus/v1/csi/list_provider",
          data:JSON.stringify(data)
        };
        let ret = await this.$ajax(ajaxParam);
        self.loading = false;
        let tableList = [];
        if (ret.code == "200") {
          let dataList = ret.result;
          for (let key in dataList) {
            let replicas = dataList[key];
            let status = "1";
            if (replicas["readyReplicas"] == replicas["replicas"]) {
              status = "0"
            } else if (replicas["replicas"] == "0") {
              status = "1"
            } else {
              status = "2";
            }
            let tableObject = {
              "name":replicas["name"],
              "status":status,
              "cluster":this.formInline.clusterName,
              "cluster_id":this.formInline.clusterId,
              "rancher_cluster_id":this.formInline.rancher_cluster_id,
              "project_name":this.formInline.projectName,
              "csi_type":"cinder",
              "id":key,
              "events":replicas["event"]
            };
            tableList.push(tableObject);
          }
        } else {
          self.$notify.error({
            message: ret.result
          })
        }
        self.totalData = this.filterList(tableList, param);
      } catch (data) {
        self.loading = false;
      }
    },
    filterList(allData, param) {
      if (JSON.stringify(param) == "{}") {
        return allData;
      }
      let nameFilteredData = [];
      if (param.query_name == '') {
        nameFilteredData = allData;
      } else {
        allData.forEach(function(obj) {
          if (obj.name.indexOf(param.query_name) > -1) {
            nameFilteredData.push(obj);
          }
        });
      }
      let statusFilterData = [];
      if (param.query_status == '') {
        statusFilterData = nameFilteredData;
      } else {
        nameFilteredData.forEach(function(obj) {
          if (obj.status == param.query_status) {
            statusFilterData.push(obj);
          }
        });
      }
      return statusFilterData;
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
    },
    onIconClick() {
      this.formInline.projectId = '';
      this.formInline.projectName = '';
      this.getClusterByProject();
    },
    async getProjectList() {
      let self = this;
      try {
        let url = 'api/keystone/v3/users/' + Vue.userId + '/projects?domain_id=default';
        if (Vue.roleType == '0') {
          url = 'api/keystone/v3/projects?domain_id=default';
        }
        let result = await self.$ajax({
          type: "GET",
          url: url
        });
        let projectOption = result["projects"];
        let flg = true;
        for (let i = 0; i < projectOption.length; i++) {
          let s = projectOption[i];
          if (s.name == "admin") {
            flg = false;
            self.formInline.projectId = s.id;
            self.formInline.projectName = s.name;
            break;
          }
        }
        if (flg) {
          this.formInline.projectId = projectOption[0].id;
          this.formInline.projectName = projectOption[0].name;
        }
        self.projectOption = projectOption;
        projectOption.forEach(function(project, index) {
          self.projectMap[project.id] = project.name;
        });
        this.getClusterByProject();
      } catch (res) {
      }
    },
    statusToCH(value, row) {
      if (value == "0") {
        return this.$t('container.running');
      } else if (value == "1") {
        return this.$t('container.closed');
      } else if (value == "2") {
        return this.$t('container.processing');
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
        self.queryParam.key = column.prop;
        self.queryParam.keyOrder = column.order;
        if (keyOrder != null && self.totalData != null) {
          if (key === "rbd_size") {
            self.totalData.sort(this.$sortFormatter(key, keyOrder, "number"));
          } else {
            self.totalData.sort(this.$sortFormatter(key, keyOrder));
          }
        }
      },
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      refreshData() {
        let param = {};
        param["query_name"] = this.formInline.query_name;
        param["query_status"] = this.formInline.query_status;
        this.queryParam = param;
        this.getData(this.queryParam, true);
      },
      onRefresh() {
        let param = {};
        param["query_name"] = this.formInline.query_name;
        param["query_status"] = this.formInline.query_status;
        this.queryParam = param;
        setTimeout(() => { this.getData(this.queryParam, true, true); }, 5000);
        setTimeout(() => { this.getData(this.queryParam, true, true); }, 10000);
        setTimeout(() => { this.getData(this.queryParam, true, true); }, 15000);
      },
      onQuery() {
        if (this.formInline.query_name.length > 40) {
          this.$message.error(this.$t('heat.fortyCharacterMaximum'));
          return;
        }
        let queryParam = {};
        queryParam.query_name = this.formInline.query_name;
        queryParam.query_status = this.formInline.query_status;
        this.queryParam = queryParam;
        this.getData(this.queryParam, true);
      },
      handleAddShow() {
        this.createFlag = false;
        this.editFlag = false;
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

