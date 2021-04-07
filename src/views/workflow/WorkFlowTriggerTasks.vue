<template>
  <div>
    <el-form :inline="true" :model="formInline" class="form-inline">
    </el-form>
    <!-- 只有项目管理员有权限 -->
    <div class="divider clearfix" v-if="roleType=='2'"></div>
    <operation-panel
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      border
      stripe
      :default-sort = "{prop: 'name', order: 'ascending'}"
      row-key="id"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column reserve-selection type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('task.taskName')"
        show-overflow-tooltip
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('type') >= 0"
        prop="type"
        :label="$t('task.taskType')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{tzTypeFormatter(scope.row.type)}}</span>
        </template>
      </el-table-column>
       <el-table-column
        v-if="columnsChecked.indexOf('workflowInput') >= 0"
        prop="workflowInput"
        :label="$t('task.resource')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <el-button @click="showResourceData(scope.row)" type="text" size="small">{{$t('task.view')}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('createTime') >= 0"
        prop="createTime"
        :label="$t('lang.createTime')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{scope.row.createTime}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('nextTime') >= 0"
        prop="nextTime"
        :label="$t('task.nextExeTime')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{(scope.row.nextTime)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('firstTime') >= 0"
        prop="firstTime"
        :label="$t('task.firstExeTime')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{(scope.row.firstTime)}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
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
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>
    <create-trigger-task ref="createTriggerTask" v-if="createTriggerTaskFlag" @handleAddShow="handleAddShow" :cloudTaskId="this.id" @refreshData="getData" :triggerTaskName="triggerTaskName"></create-trigger-task>
    <resource-data ref="ResourceData" v-if="showResourceFlag" @handleAddShow="handleAddShow2" :selectedRowData="selectedRowData" @refreshData="getData"></resource-data>
  </div>
</template>
<script>
  import createTriggerTask from "./WorkFlowCreateTriggerTask"
  import ResourceData from "./ResourceDataDetail"
  export default {
    name: 'WorkFlowTriggerTasks',
    components: {
      createTriggerTask,
      ResourceData
    },
    props:['taksName'],
    data () {
      return {
        formInline: {
          name:"",
          query_project: '',
          type:'',
          uuid:''
        },
        triggerTaskName:this.taksName,
        definition:'',
        showResourceFlag:false,
        clusterIp : '',
        rowServiceName:"",
        rowNameSpace:"",
        roleType: Vue.roleType,
        projectOption: [],
        allClusters: [],
        clusterByProject: [],
        detailFlag: false,
        total: 0,
        columns: [],
        columnsChecked:["id", "name", "createTime", "nextTime", "firstTime", "type", "workflowInput"],
        tableData: [],
        totalData: [],
        multipleSelection: [],
        loading: false,
        createTriggerTaskFlag:false,
        id: this.$route.params.taskid,
        operationMenus: [{
          icon: "fa-plus",
          name: Vue.t('task.create'),
          showflg: Vue.roleType != "0",
          readOnly: true,
          handler: function() {
            this.createTriggerTaskFlag = true;
            this.$nextTick(() => {
              this.$refs.createTriggerTask.initDialog();
            });
          }.bind(this)
        }, {
          icon: "fa-remove",
          name: Vue.t('lang.delete'),
          showflg: Vue.roleType != "0",
          readOnly: false,
          multi:true,
          enable(rowData) {
            if ( Vue.roleType == "0") {
              if (rowData["taskType"] != "tasks_reportforms") {
                return false;
              }
            }
            return true;
          },
          handler: function(selectedRows) {
            this.$confirm(this.$t('lang.ifDeleteData'), this.$t('lang.confirm'), {
              confirmButtonText:this.$t('lang.confirm'),
              cancelButtonText:this.$t('lang.cancel'),
              type:'warning'
            }).then(() => {
              this.$sequence({
                type:'delete',
                url:'api/mistral/v2/cron_tasks/{id}',
                params:selectedRows,
                log:{
                  description:{
                    en:"Delete cloud child task:{name}",
                    zh_cn:"删除云计划任务" + this.taksName + "下的任务:{name}"
                  },
                  target:Vue.logTarget.workflowtriggertask
                },
                successMsg:this.$t('task.deleteSuccessMsg'),
                successFun:() => {
                  this.getData();
                },
                errFun:() => {
                  this.getData();
                }
              })
            }).catch(() => {
            });
          }.bind(this)
        }],
        queryParam: {
          sort_keys: "name",
          sort_dir: "ascending"
        }
      };
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
      let table = this.$refs.table;
      table.$children.forEach((item, index) => {
        if (item.label && item.prop) {
          this.columns.push({
            prop: item.prop,
            label: item.label
          });
        }
      });
      this.getProjectList();
    },
    methods: {
      async getData(param, isClear = true) {
        //获取工作流信息
        let self = this;
        let serviceUrl = "";
        //超级管理员
        if (this.roleType == '0') {
          serviceUrl = "api/mistral/v2/cron_tasks?cloud_task_id=" + this.id;
        } else if (this.roleType == '2') {
          //项目管理员查询自己项目
          serviceUrl = "api/mistral/v2/cron_tasks?cloud_task_id=" + this.id;
        } else {
          //项目用户不能查询
          serviceUrl = "";
        }
        try {
          self.loading = true;
          let workFlowList = await this.$ajax({
            type: 'get',
            url: serviceUrl
          });
          let dataResult = [];
          let tempResult = workFlowList.cron_tasks;
          for (let temp of tempResult) {
            if (temp['workflow_name'] != 'tasks_reportforms') {
              dataResult.push(temp);
            }
          }
          let dataLength = dataResult.length;
          self.total = dataLength;
          let dataList = [];
          for (let i = 0; i < dataLength; i++) {
            let nameFr = dataResult[i].workflow_name;
            let nameTo = '';
            if (nameFr == 'start_vm') {
                nameTo = this.$t('task.startVm');
            } else if (nameFr == 'stop_vm') {
                nameTo = this.$t('task.stopVm');
            } else {
              nameTo = nameFr;
            }
            dataList.push({
              id:dataResult[i].id,
              name:dataResult[i].name,
              createTime:dataResult[i].created_at,
              firstTime:dataResult[i].first_execution_time,
              nextTime:dataResult[i].next_execution_time,
              workflowInput:dataResult[i].workflow_input,
              type:nameTo,
              taskType:nameFr
            });
          }
          dataList = this.filterList(dataList, this.formInline.name, this.formInline.type, this.formInline.query_project);
          self.totalData = dataList;
          self.totalData.sort(this.$sortFormatter(self.queryParam.key, self.queryParam.keyOrder));
          self.loading = false;
        } catch (data) {
          self.loading = false;
          console.log('获取云计划任务列表失败');
        }
        if (isClear) {
          // 是否清空选中
          self.$nextTick(() => {
            self.$refs.table.clearSelection();
          });
        }
      },
      tzTypeFormatter(type) {
        if (type == '') {
          return '';
        } else if (type == '1') {
          return Vue.t('task.repeatExecution');
        } else if (type == '2') {
          return Vue.t('task.performOnce');
        } else if (type == "std.create_instance_backup") {
          return Vue.t('calcStorLang.instSnapshotTask');
        } else if (type == "std.create_volume_snapshot") {
          return Vue.t('task.createDiskSnapshot');
        } else if (type == "std.create_volume_backups") {
          return Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.allBackUp')+")";
        } else if (type == "std.create_volume_inc_backups") {
          return Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.increaseBackUp')+")";
        } else {
          return type;
        }
      },
      getCurrentData(param) {
        this.tableData = param;
      },
      //多选
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //排序
      sortChange(sortItem) {
        var self = this;
        var key = sortItem.prop;
        var keyOrder = sortItem.order;
        //alert(key);
        //alert(keyOrder);
        self.queryParam.key = sortItem.prop;
        self.queryParam.keyOrder = sortItem.order;
        if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
        }
      },
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      //刷新
      onRefresh() {
        this.getData();
      },
      onDetailPanelBack() {
        this.detailFlag = false;
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
          this.projectOption = projectList;
          //超级管理员赋值一个project
          // if (Vue.roleType == '0') {
          //   this.formInline.query_project = projectList[0].id;
          // }
          //self.formInline.query_project = self.projectOption[0].id;
          this.getData();
        } catch (res) {
          console.log("获取项目列表失败");
        }
      },
      getProjectNameById(row) {
        let projectId = this.$cookie.get("pid")
        if (roleType == 0) {
          projectId = row["project"];
        }
        for (let i = 0; i < this.projectOption.length; i++) {
          if (projectId == this.projectOption[i].id) {
            return this.projectOption[i].name
          }
        }
      },
      filterCluster(uuid) {
        // 首先根据项目过滤的集群设置为空
        this.clusterByProject = [];
        this.formInline.uuid = "";
        for (let i = 0; i < this.allClusters.length; i++) {
          if (uuid == this.allClusters[i].project_id) {
              this.clusterByProject.push(this.allClusters[i]);
          }
        }
        if (this.clusterByProject.length > 0) {
          this.formInline.uuid = this.clusterByProject[0].uuid;
        }
      },
      filterList(allData, name, type, projectId) {
        //debugger;
        let nameFilteredData = [];
        if (name == '') {
          nameFilteredData = allData;
        } else {
          allData.forEach(function(obj) {
            if (obj.name.indexOf(name) > -1) {
              nameFilteredData.push(obj);
            }
          });
        }
        let typeFilteredData = [];
        if (type === '') {
          typeFilteredData = nameFilteredData;
        } else {
          //alert(obj.type);
          nameFilteredData.forEach(function(obj) {
            //alert(obj);
            if (obj.type == type) {
              typeFilteredData.push(obj);
            }
          });
        }
        let projectFilteredData = [];
        if (projectId == '') {
          projectFilteredData = typeFilteredData;
        } else {
          typeFilteredData.forEach(function(obj) {
            if (obj.project_id == projectId) {
              projectFilteredData.push(obj);
            }
          });
        }
        return projectFilteredData;
      },
      handleAddShow() {
        this.createTriggerTaskFlag = false;
      },
      handleAddShow2() {
        this.showResourceFlag = false;
      },
      showResourceData(rowData) {
        this.$refs.table.clearSelection();
        this.showResourceFlag = true;
        this.selectedRowData = rowData;
        this.$nextTick(() => {
          this.$refs.ResourceData.show();
        });
      }
    }
  };
</script>
<style scoped>

</style>
