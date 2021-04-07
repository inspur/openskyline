<template>
  <div>
    <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('report.resource')">
        <el-select v-model="formInline.resource" @change="getIndicatorList" clearable>
          <el-option v-for="item in resourceOption" :key="item.id" :label="item.name" :value="item.id"></el-option> 
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('report.indicator')" v-if="formInline.resource != 'system_overview'">
        <el-select v-model="formInline.indicator" clearable @change="indicatorChange">
          <el-option v-for="item in indicatorOption" :key="item.id" :label="item.name" :value="item.id"></el-option> 
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('lang.project') "  v-if="roleType == '0' && formInline.resource != 'system_overview'">
        <el-input auto-complete="off" size="small" :icon="close1" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="formInline.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('report.user')">
        <el-input auto-complete="off" size="small" :icon="close2" :on-icon-click="onIconClick2" :readonly="true" @focus="selectUser" v-model="formInline.userName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.status')">
        <el-select v-model="formInline.status" clearable>
          <el-option :label="$t('report.exporting')" value="0"></el-option>
          <el-option :label="$t('report.exportSuccess')" value="1"></el-option>
          <el-option :label="$t('report.exportError')" value="2"></el-option>
        </el-select>
      </el-form-item>

      <!-- <el-form-item :label="$t('opt.name')">
        <el-input :placeholder="$t('opt.name')" size="small" v-model="formInline.name" @blur="blurFun('name')"></el-input>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon='fa-search' size="small" @click="onQueryData">{{$t('opt.doQuery')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
    <operation-panel ref="opertionPanel" class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus" >
    </operation-panel>
    <el-table ref="table" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" @selection-change="handleSelectionChange" :default-sort="{prop: 'created_at', order: 'descending'}"  @sort-change="sortChange" @row-click="rowClick" v-loading="loading" :element-loading-text="$t('opt.dataLoading')">
      <el-table-column reserve-selection type="selection" align="center" width="55"></el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('opt.name')" prop="name" min-width="100" align="left">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('status') >= 0" :label="$t('lang.status')" prop="status" min-width="100" align="left">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status)">
            <span v-html="statusRender(scope.row.status, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('resource_name') >= 0" :label="$t('report.resource')" prop="resource_name" align="left" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('indicator_name') >= 0" prop="indicator_name" :label="$t('report.indicator')" min-width="100" align="left">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('project_name') >= 0" prop="project_name" :label="$t('lang.project')" min-width="100" align="left">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('user_name') >= 0" prop="user_name" :label="$t('report.user')" min-width="100" align="left">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0" prop="created_at" :label="$t('report.createTime')" min-width="100" sortable="custom" align="left">
        <template slot-scope="scope">
          <span>{{tzTimeFormatter(scope.row.created_at)}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('opt.selectColumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>

    <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    <select-user ref="selectUser" v-if="selUserFlg" @getSelUser="getSelUser" :instProjectId="formInline.query_project"></select-user>
    <clear-history ref="clearHistory" v-if="clearHistoryFlag" @hideDialog="hideDialog" @refreshData="onQueryData"></clear-history>
  </div>
</template>
<script>
import ClearHistory from './ReportHistoryClear'
export default {
  name: 'ReportDownloadCenter',
  components: {
    ClearHistory
  },
  data() {
    return {
      close1:"",
      close2:"",
      formInline: {
        resource:"",
        indicator:"",
        query_project:"",
        projectName:"",
        userId:"",
        userName:"",
        status:"",
        name:""
      },
      clearHistoryFlag:false,
      resourceOption:[],
      resourceMap:{},
      indicatorOption:[],
      indicatorMap:{},
      tableData: [],
      totalData: [],
      roleType:Vue.roleType,
      selProjectFlg:false,
      selUserFlg:false,
      projectOption:[],
      projectMap:{},
      userMap:{},
      currentPage: 1,
      showBorder: true,
      columns: [],
      loading: false,
      reloadTblFlag: false,
      tzTimeFormatter: this.$tzTimeFormatter,
      columnsChecked: ['name', 'status', 'resource_name', 'indicator_name', 'project_name', 'user_name', 'created_at'],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-download",
        name: this.$t('report.download'),
        showflg: true,
        readOnly: false,
        enable (rowData) {
          return rowData.status == "1";
        },
        handler: function(selectedRows) {
          var param = {
            taskId:selectedRows[0].id,
            taskName:selectedRows[0].name
          };
          document.location = 'node-api/downloadReport?' + $.param(param);
        }.bind(this)
      }, {
        icon: "fa-remove",
        name: this.$t('lang.delete'),
        showflg: true,
        readOnly: false,
        multi:true,
        enable (rowData) {
          return rowData.status != "0";
        },
        handler: function(selectedRows) {
          this.$confirm(this.$t('lang.ifDeleteData'), this.$t('lang.confirm'), {
            confirmButtonText:this.$t('lang.confirm'),
            cancelButtonText:this.$t('lang.cancel'),
            type:'warning'
          }).then(() => {
            selectedRows.forEach(row => {
              this.$ajax({
                type:'delete',
                url:'api/leo/v1/report/delete_task?id=' + row.id,
                log:{
                  description:{
                    en:"Delete report: " + row.name,
                    zh_cn:"删除报表: " + row.name
                  },
                  target:Vue.logTarget.Report
                },
                // successMsg:this.$t('container.deleteSuccessMsg'),
                successFun:(response) => {
                  if (response.body.code == '0') {
                    this.$notify({
                      message: Vue.t('report.noDatatoDelele'),
                      type:'error'
                    });
                  } else {
                    this.$notify({
                      message: Vue.t('container.deleteSuccessMsg'),
                      type:'success'
                    });
                  }
                  this.$refs.table.clearSelection();
                  this.loadReportList();
                },
                errFun:() => {
                  this.$refs.table.clearSelection();
                  this.loadReportList();
                }
              });
            });
          }).catch(() => {
          });
        }.bind(this)
      }, {
        icon: "fa-trash",
        name: this.$t('report.clearReportHistory'),
        showflg: Vue.roleType == "0",
        readOnly: true,
        handler: function(selectedRows) {
          this.clearHistoryFlag = true;
        }.bind(this)
      }]
    }
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
              if (data['status'] == "0") {
                self.reloadTblFlag = true;
                break;
              }
            }
          }
          clearInterval(self.reloadTabelInterval);

          if (self.reloadTblFlag && !self._isDestroyed) {
            self.reloadTabelInterval = setInterval(() => {
              this.onRefresh();
            }, 5000);
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
    this.getResourceList();
    this.getDataList();
  },
  methods: {
    async getResourceList() {
      let self = this;
      self.loading = true;
      await this.$ajax({
        url:"api/leo/v1/report/get_resource",
        type:"get",
        data:{
          roleType:self.roleType
        },
        successFun:(response) => {
          self.resourceOption = [];
          self.resourceMap = {};
          let resourceList = response.resources;
          if (resourceList && resourceList.length > 0) {
            for (let i = 0; i < resourceList.length; i++) {
              let resource = resourceList[i];
              let name = resource.name;
              if (Vue.language == "en") {
                name = resource.name_en;
              }
              self.resourceOption.push({
                id:resource.id,
                name:name
              });
              self.resourceMap[resource.id] = name;
            }
          }
        }
      });
      self.loading = false;
    },
    async getAllIndicatorList() {
      let self = this;
      self.loading = true;
      await this.$ajax({
        url:"api/leo/v1/report/get_all_indicators",
        type:"get",
        data:{
          roleType:self.roleType
        },
        successFun:(response) => {
          self.indicatorMap = {};
          let indicatorList = response.indicators;
          if (indicatorList && indicatorList.length > 0) {
            for (let i = 0; i < indicatorList.length; i++) {
              let indicator = indicatorList[i];
              let name = indicator.name;
              if (Vue.language == "en") {
                name = indicator.name_en;
              }
              self.indicatorMap[indicator.id] = name;
            }
          }
        }
      });
      self.loading = false;
    },
    async getIndicatorList(resourceId) {
      let self = this;
      self.formInline.indicator = "";
      self.indicatorOption = [];
      if (!resourceId) {
        self.formInline.resource = "";
        return false;
      }
      await this.$ajax({
        url:"api/leo/v1/report/get_indicator",
        type:"get",
        data:{
          resource_id:resourceId,
          role_type:self.roleType
        },
        successFun:(response) => {
          let indicatorList = response.indicators;
          if (indicatorList && indicatorList.length > 0) {
            for (let i = 0; i < indicatorList.length; i++) {
              let indicator = indicatorList[i];
              if (!Vue.service[indicator.module]) continue;
              let name = indicator.name;
              if (Vue.language == "en") {
                name = indicator.name_en;
              }
              self.indicatorOption.push({
                id:indicator.id,
                name:name
              });
            }
          }
        }
      });
      this.onQueryData();
      self.loading = false;
    },
    indicatorChange() {
      this.onQueryData();
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.formInline.query_project = id;
      this.formInline.projectName = name;
      this.projectListChange(id);
      this.close1 = 'close';
    },
    onIconClick() {
      this.formInline.query_project = '';
      this.formInline.projectName = '';
      this.projectListChange(this.formInline.query_project);
      this.close1 = '';
    },
    async getProjectList() {
      try {
        let url = 'api/keystone/v3/users/' + Vue.userId + '/projects?domain_id=default';
        if (Vue.roleType == '0') {
          url = 'api/keystone/v3/projects?domain_id=default';
        }
        let result = await this.$ajax({
          type: "GET",
          url: url
        });
        let projectList = result["projects"];
        let self = this;
        projectList.forEach(function(d) {
          self.projectMap[d.id] = d.name;
        });
        //this.projectOption = projectList;
      } catch (res) {
        console.log("获取项目列表失败");
      }
    },
    async getUserList() {
      try {
        let url = 'api/keystone/v3/inspur/users?domain_id=default';
        let result = await this.$ajax({
          type: "GET",
          url: url
        });
        let userList = result["users"];
        let me = this;
        userList.forEach(function(u) {
          me.userMap[u.id] = u.name;
        });
      } catch (err) {
        console.log("获取用户列表失败");
      }
    },
    projectListChange(value) {
      if (value) {
        this.formInline.userId = "";
        this.onIconClick2();
      }
    },
    getProjectNameById(row) {
      let projectId = row["tenant"];
      for ( let i = 0; i < this.projectOption.length; i++) {
        if (projectId == this.projectOption[i].id) {
          return this.projectOption[i].name
        }
      }
    },
    selectUser() {
      this.selUserFlg = true;
      this.$nextTick(() => {
        this.$refs.selectUser.show();
      });
    },
    getSelUser(id, name) {
      this.formInline.userId = id;
      this.formInline.userName = name;
      this.close2 = 'close';
    },
    onIconClick2() {
      this.formInline.userId = '';
      this.formInline.userName = '';
      this.close2 = '';
    },
    sortChange(column) {
      var self = this;
      var key = column.prop;
      var keyOrder = column.order;
      if (keyOrder != null && self.totalData != null) {
        self.totalData.sort(this.$sortFormatter(key, keyOrder));
      }
    },
    rowClick(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    getDataList() {
      var self = this;
      Promise.all([self.getAllIndicatorList(), self.getProjectList(), self.getUserList()]).then(function(result) {
        self.loadReportList();
      });
    },
    async loadReportList() {
       var self = this;
      try {
        let params = {
          resource_id: self.formInline.resource,
          indicator_id: self.formInline.indicator,
          project_id: self.formInline.query_project,
          user_id: self.formInline.userId,
          status: self.formInline.status,
          role_type: Vue.roleType
        };
        if (Vue.roleType == 2) {
          params['project_id'] = this.$cookie.get("pid");
        }
        let result = await self.$ajax({
          type: 'post',
          url: 'api/leo/v1/report/list_export_tasks',
          data:JSON.stringify(params)
        });
        //resourceOption
        result.forEach(function(d) {
          d.resource_name = self.resourceMap[d.resource_id];
          d.indicator_name = self.indicatorMap[d.indicator_id];
          d.project_name = self.projectMap[d.project_id];
          d.user_name = self.userMap[d.user_id];
        });
        let dataList = result;
        self.totalData = dataList;
      } catch (res) {
      }
    },
    statusRender(value, rowData) {
      var status = rowData['status'];
      if (0 == status) {
        return this.$t('report.exporting');
      } else if (1 == status) {
        return this.$t('report.exportSuccess');
      } else if (2 == status) {
        return this.$t('report.exportError');
      } else if (null == status || "" == status) {
        return '-';
      } else {
        return status;
      }
    },
    statusTagRender(status) {
      if (0 == status) {
        return "info";
      } else if (1 == status) {
        return "success";
      } else if (2 == status) {
        return "danger";
      } else {
        return "gray";
      }
    },
    getCurrentData(param) {
      this.tableData = param;
      this.$nextTick( () => {
        this.$refs.opertionPanel.reset(this.multipleSelection);
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    blurFun(key) {
      let num = (key=="name"?40:50);
      if (this.formInline[key].length>num) {
        this.formInline[key] = '';
        this.$notify({
          message:Vue.t('opt.overLength'),
          type:'warning'
        });
      }
    },
    onQueryData() {
      this.$refs.table.clearSelection();
      this.loadReportList();
    },
    onRefresh() {
      this.$refs.table.clearSelection();
      this.loadReportList();
    },
    hideDialog() {
      this.clearHistoryFlag = false;
    }
  }
}
</script>
<style scoped>

</style>
