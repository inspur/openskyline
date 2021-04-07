<template>
  <div>
    <el-form :inline="true" :model="formInline" class="form-inline">
<!--       <el-form-item :label="$t('lang.project') " v-if="roleType == '0'" > 
        <el-select v-model="formInline.query_project" filterable clearable> 
          <el-option v-for="item in projectOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item :label="$t('lang.name')">
        <el-input v-model="formInline.name" size="small"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.status')">
        <el-select v-model="formInline.state" clearable>
          <el-option v-for="item in stateOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
          <!-- <el-input v-model="formInline.state" size="small"></el-input> -->
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' @click="onSubmit" size="small">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix" v-if="roleType==='2'"></div>
    <operation-panel v-if="roleType==='2'"
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
<!--       <el-table-column
        v-if="columnsChecked.indexOf('id') >= 0"
        prop="id"
        label="日志ID"
        show-overflow-tooltip
        align="left"
        min-width="100">
      </el-table-column> -->
      <el-table-column
        v-if="columnsChecked.indexOf('taskName') >= 0"
        prop="taskName"
        :label="$t('task.taskName')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <el-button @click="rowNameRender(scope.$index, scope.row)" type="text" size="small">{{scope.row.taskName}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('task.taskType')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="taskNameRender(scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
       v-if="columnsChecked.indexOf('projectId') >= 0"
       prop="projectId"
       :label="$t('lang.project')"
       show-overflow-tooltip
       min-width="100">
       <template slot-scope="scope">
            <span v-html="getProjectNameById2(scope.row)"></span>
       </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('createTime') >= 0"
        prop="createTime"
        :label="$t('task.startExeTime')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <span>{{(scope.row.createTime)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('endTime') >= 0"
        prop="endTime"
        :label="$t('task.endTime')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <span>{{(scope.row.endTime)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('state') >= 0"
        prop="state"
        :label="$t('lang.status')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <span>{{tzStateFormatter(scope.row.state)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('inputData') >= 0"
        prop="inputData"
        :label="$t('task.inputData')"
        show-overflow-tooltip
        align="left"
        min-width="80">
        <template slot-scope="scope">
          <el-button @click="showInputData(scope.row)" type="text" size="small">{{$t('task.view')}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('outputData') >= 0"
        prop="outputData"
        :label="$t('task.outputData')"
        show-overflow-tooltip
        align="left"
        min-width="80">
        <template slot-scope="scope">
          <el-button @click="showOutputData(scope.row)" type="text" size="small">{{$t('task.view')}}</el-button>
        </template>
      </el-table-column>
<!--       <el-table-column
        v-if="columnsChecked.indexOf('projectId') >= 0"
        prop="scope"
        label="项目名称"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{tzScopeFormatter(scope.row.scope)}}</span>
        </template>
      </el-table-column> -->
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
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
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
    <input-data ref="InputData" v-if="showInputDataFlag" @handleAddShow="handleAddShow" :selectedRowData="selectedRowData" @refreshData="getData"></input-data>
    <output-data ref="OutputData" v-if="showOutputDataFlag" @handleAddShow="handleAddShow" :selectedRowData="selectedRowData" @refreshData="getData"></output-data>
  </div>
</template>
<script>
import InputData from "./InputDataDetail";
import OutputData from "./OutputDataDetail"
  export default {
    name: 'WorkFlowExecutions',
    components: {
      InputData, OutputData
    },
    data () {
      return {
        formInline: {
          name:"",
          query_project: '',
          state: '',
          uuid:''
        },
        roleType: Vue.roleType,
        showInputDataFlag:false,
        showOutputDataFlag:false,
        urlId: this.$route.params.taskid,
        selectedRowData:{},
        projectOption: [],
        stateOption: [
          {id:"SUCCESS", name:Vue.t('task.success')},
          {id:"ERROR", name:Vue.t('task.error')},
          {id:"RUNNING", name:Vue.t('task.running')}
        ],
        allClusters: [],
        clusterByProject: [],
        operationMenus: [
        {
          icon: "fa-remove",
          name: Vue.t('lang.delete'),
          showflg: true,
          readOnly: false,
          multi:true,
          enable(rowData) {
            let state = rowData.state;
            if (state == '') {
              return false;
            } else if (state == 'ERROR') {
              return true;
            } else if (state == 'SUCCESS') {
              return true;
            } else {
              return false;
            }
          },
          handler: function(selectedRows) {
            this.$confirm(this.$t('lang.ifDeleteData'), this.$t('lang.confirm'), {
              confirmButtonText:this.$t('lang.confirm'),
              cancelButtonText:this.$t('lang.cancel'),
              type:'warning'
            }).then(() => {
              this.$sequence({
                type:'delete',
                url:'api/mistral/v2/executions/{id}',
                params:selectedRows,
                log:{
                  description:{
                    en:"Delete task log of {taskName}",
                    zh_cn:"删除 {taskName} 的任务日志"
                  },
                  target:Vue.logTarget.workflowtasklog
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
        total: 0,
        columns: [],
        taskNameFormatter: this.$taskNameFormatter,
        columnsChecked:["name", "state", "createTime", "endTime", "inputData", "outputData", "projectId", "taskName"],
        tableData: [],
        totalData: [],
        multipleSelection: [],
        loading: false,
        queryParam: {
          sort_keys: "",
          sort_dir: ""
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
      // getdata方法在getProjectList中调用
      // this.getData();
    },
    methods: {
      async getData(param, isClear = true) {
        //获取工作流信息
        let self = this;
        let serviceUrl = "";
        let projectIdTemp = '';
        //查询当前任务
        let nameList = [];
        try {
          let workFlowList = await this.$ajax({
            type: 'get',
            url: "api/mistral/v2/cron_tasks?cloud_task_id=" + this.urlId
          });
          let dataResult = workFlowList.cron_tasks;
          projectIdTemp = dataResult[0].project_id;
          let dataLength = dataResult.length;
          for (let i = 0; i < dataLength; i++) {
            nameList.push({
              name:dataResult[i].name,
              id:dataResult[i].id
            });
          }
        } catch (data) {
          // console.log('未获取到当前任务');
        }
        //查询日志
        //超级管理员
        if (this.roleType == '0') {
          if (projectIdTemp) {
            serviceUrl = "api/mistral/v2/executions?project_id=" + projectIdTemp;
          } else {
            return false;
          }
        } else if (this.roleType == '2') {
          //项目管理员查询自己项目
          projectIdTemp = this.$cookie.get("pid");
          serviceUrl = "api/mistral/v2/executions?project_id=" + projectIdTemp;
        }

        if (isClear) {
          // 是否清空选中
          self.$nextTick(() => {
            self.$refs.table.clearSelection();
          });
        }

        // 获取工作流
        try {
          self.loading = true;
          let workFlowList = await this.$ajax({
            type: 'get',
            url: serviceUrl
          });
          let dataResult = workFlowList.executions;
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
            // debugger;
            //let descriptionFr = '';
            let descriptionOb = null;
            if (dataResult[i].description) {
              descriptionOb = JSON.parse(dataResult[i].description);
            }
            var taskNameTo = '';
            let taskId = "";
            if (descriptionOb) {
              if (descriptionOb.triggered_by != null || descriptionOb.triggered_by != '') {
                taskNameTo = descriptionOb.triggered_by.name;
                taskId = descriptionOb.triggered_by.id;
              }
            }
            dataList.push({
              id:dataResult[i].id,
              name:nameTo,
              endTime:dataResult[i].updated_at,
              state:dataResult[i].state,
              input:dataResult[i].input,
              //state_info:dataResult[i].state,
              //project:dataResult[i].state,
              projectId:dataResult[i].project_id,
              createTime:dataResult[i].created_at,
              taskName:taskNameTo,
              taskId:taskId
            });
          }
          // debugger;
          //过滤数据
          dataList = this.filterList(dataList, this.formInline.name, this.formInline.state);
          //过滤第二次任务名称过滤
          dataList = this.filterList2(dataList, nameList);
          self.totalData = dataList;
          self.totalData.sort(this.$sortFormatter(self.queryParam.key, self.queryParam.keyOrder));
          self.loading = false;
        } catch (data) {
          self.loading = false;
          // console.log(data);
          console.log('获取任务日志列表失败');
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
      rowNameRender(rowIndex, rowData) {
        let taskId = this.$route.params.taskid;
        this.$router.push({
          path: "/workflow/workflowtriggertaskguide/workflowtasklogdetail/"+taskId+"/" + rowData.id + "/workflowexedetail"
        });
      },
      taskNameRender(row) {
        if (row['name'] == "std.create_instance_backup") {
          return Vue.t('calcStorLang.instSnapshotTask');
        } else if (row['name'] == "std.create_volume_snapshot") {
          return Vue.t('storage.createVolSnap');
        } else if (row['name'] == "std.create_volume_backups") {
          return Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.allBackUp')+")";
        } else if (row['name'] == "std.create_volume_inc_backups") {
          return Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.increaseBackUp')+")";
        } else if (row['name'] == "start_vm") {
          return Vue.t('task.startVm');
        } else if (row['name'] == "stop_vm") {
          return Vue.t('task.stopVm');
        }
          return row['name'];
      },
      onSubmit() {
        if (this.formInline.name.length > 40) {
          this.$message.error(this.$t('heat.fortyCharacterMaximum'));
          return;
        }
        this.getData();
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
          this.getData();
          //self.formInline.query_project = self.projectOption[0].id;
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
      getProjectNameById2(row) {
        let projectId = row["projectId"];
        for ( let i = 0; i < this.projectOption.length; i++) {
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
      filterList(allData, name, state) {
        //debugger;
        let nameFilteredData = [];
        if (name == '') {
          nameFilteredData = allData;
        } else {
          allData.forEach(function(obj) {
            if (obj.taskName.indexOf(name) > -1) {
              nameFilteredData.push(obj);
            }
          });
        }
        let stateFilteredData = [];
        if (state == '') {
          stateFilteredData = nameFilteredData;
        } else {
          // if (state=='成功' || state=='成' || state=='功') {
          //   state = 'SUCCESS';
          // }
          // if (state=='失败' || state=='失' || state=='败') {
          //   state = 'ERROR';
          // }
          // if (state=='执行中' || state=='执' || state=='执行' || state=='行' || state=='行中' || state=='中') {
          //   state = 'ERROR';
          // }
          nameFilteredData.forEach(function(obj) {
            if (obj.state.indexOf(state) > -1) {
              stateFilteredData.push(obj);
            }
          });
        }
        return stateFilteredData;
      },
      filterList2(allData, nameList) {
        //debugger;
        let nameFilteredData = [];
        if (nameList == null) {
          nameFilteredData = allData;
        } else {
          allData.forEach(function(obj) {
            nameList.forEach(function(obj2) {
              if (obj.taskId == obj2.id) {
              nameFilteredData.push(obj);
            }
            });
          });
        }
        return nameFilteredData;
      },
      tzScopeFormatter(scope) {
        if (scope == '') {
          return '';
        } else if (scope == 'public') {
          return Vue.$t('base.public');
        } else if (scope == 'private') {
          return Vue.$t('lang.private');
        } else {
          return '';
        }
      },
      tzStateFormatter(state) {
        if (state == '') {
          return '';
        } else if (state == 'ERROR') {
          return this.$t('task.error');
        } else if (state == 'SUCCESS') {
          return this.$t('task.success');
        } else if (state == 'RUNNING') {
          return this.$t('task.running');
        } else {
          return '';
        }
      },
      handleAddShow() {
        this.showInputDataFlag = false;
        this.showOutputDataFlag = false;
      },
      showInputData(rowData) {
        this.$refs.table.clearSelection();
        this.showInputDataFlag = true;
        this.selectedRowData = rowData;
        this.$nextTick(() => {
          this.$refs.InputData.show();
        });
      },
      showOutputData(rowData) {
        this.$refs.table.clearSelection();
        this.showOutputDataFlag = true;
        this.selectedRowData = rowData;
        this.$nextTick(() => {
          this.$refs.OutputData.show();
        });
      }
    }
  };
</script>
<style scoped>

</style>
