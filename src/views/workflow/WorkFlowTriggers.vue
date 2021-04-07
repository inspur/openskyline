<template>
  <div>
    <icos-page-header :title="$t('task.cloudTask')" :show-bottom-border="true" />
    <!-- <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('report.planName')">
        <el-input v-model="formInline.name" size="small"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.project') " v-if="roleType == '0'" >
        <el-input auto-complete="off" size="small" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="formInline.projectName"></el-input>
      </el-form-item> 
      <el-form-item :label="$t('task.excuteFrequency')" >
        <el-select v-model="formInline.type" clearable> 
          <el-option v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' @click="onSubmit" size="small">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form> -->
    <icos-page>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" :advanced-disabled="roleType!=='2'"/>
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
        :label="$t('report.planName')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <el-button @click="rowNameRender(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
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
        v-if="columnsChecked.indexOf('type') >= 0"
        prop="type"
        :label="$t('task.excuteFrequency')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{tzTypeFormatter(scope.row.type)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('cycle') >= 0"
        prop="cycle"
        :label="$t('task.cycle')"
        show-overflow-tooltip
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('exeTime') >= 0"
        prop="exeTime"
        :label="$t('task.exeTime')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="exeTimeRender(scope.row.exeTime, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('createTime') >= 0"
        prop="createTime"
        :label="$t('lang.createTime')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <span>{{(scope.row.createTime)}}</span>
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
    <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>

    <create-trigger ref="createTrigger" v-if="createTriggerFlag" @handleAddShow="handleAddShow" @refreshData="getData"></create-trigger>
    </icos-page>
  </div>
</template>
<script>
  import createTrigger from "./WorkFlowCreateTrigger"
  import triggerTasks from "./WorkFlowTriggerTasks"
  export default {
    name: 'WorkFlowTriggers',
    components: {
      createTrigger,
      triggerTasks
    },
    props:['taksName'],
    data () {
      return {
        close:"",
        formInline: {
          name:"",
          queryProject: '',
          projectName:"",
          type:'',
          uuid:''
        },
        searchBar: {
          conditions: {
            name: {
              label: this.$t('report.planName'),
              type: 'input',
              validator: (value) => {
                if (!/^[_\-0-9a-zA-Z]+$/.test(value)) {
                  throw new Error(this.$t('validation.onlyLetter_MinusNumber'));
                }
              }
            },
            projectName: {
              label: this.$t('lang.project'),
              type: 'select',
              visible: String(Vue.roleType) === '0',
              options: []
            },
            type: {
              label: this.$t('task.excuteFrequency'),
              type: 'select',
              options: [
                {value:1, label : Vue.t('task.repeatExecution')},
                {value:2, label: Vue.t('task.performOnce')}
              ]
            }
          }
        },
        searchBarValidatedParams: {},
        parentName:this.taksName,
        definition:'',
        clusterIp : '',
        rowServiceName:"",
        rowNameSpace:"",
        roleType: String(Vue.roleType),
        projectOption: [],
        allClusters: [],
        clusterByProject: [],
        selProjectFlg:false,
        detailFlag: false,
        total: 0,
        columns: [],
        columnsChecked:["id", "name", "createTime", "exeTime", "endTime", "type", "cycle", "projectId"],
        // typeOptions:[{id:1, name : Vue.t('task.repeatExecution')}, {id:2, name: Vue.t('task.performOnce')}],
        tableData: [],
        totalData: [],
        multipleSelection: [],
        loading: false,
        createTriggerFlag:false,
        operationMenus: [{
          icon: "fa-plus",
          name: Vue.t('task.create'),
          showflg: Vue.roleType != "0",
          readOnly: true,
          handler: function() {
            let me = this;
            me.createTriggerFlag = true;
            this.$nextTick(() => {
              this.$refs.createTrigger.initDialog();
            });
          }.bind(this)
        }, {
          icon: "fa-remove",
          name: Vue.t('lang.delete'),
          showflg: Vue.roleType != "0",
          readOnly: false,
          multi:true,
          enable(rowData) {
            if (rowData["workflow_name"] != "tasks_reportforms" && Vue.roleType == "0") {
              return false;
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
                url:'api/mistral/v2/cloud_tasks/{id}',
                params:selectedRows,
                log:{
                  description:{
                    en:"Delete Cloud Task:{name}",
                    zh_cn:"删除云计划任务:{name}"
                  },
                  target:Vue.logTarget.workflowtask
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
        let projectIdTemp = this.$cookie.get("pid");
        //超级管理员
        if (this.roleType == '0') {
          let queryProject = self.searchBarValidatedParams.projectName;
          serviceUrl = "api/mistral/v2/cloud_tasks";
          if (queryProject != '' && queryProject != undefined) {
            serviceUrl = serviceUrl + "?project_id=" + queryProject;
          }
        } else if (this.roleType == '2') {
          //项目管理员查询自己项目
          serviceUrl = "api/mistral/v2/cloud_tasks?project_id=" + projectIdTemp;
        } else {
          //项目用户不能查询
          serviceUrl = "";
        }
        // 获取工作流
        try {
          self.loading = true;
          let workFlowList = await this.$ajax({
            type: 'get',
            url: serviceUrl
          });
          let dataResult = [];
          let tempResult = workFlowList.cloud_tasks;
          for (let temp of tempResult) {
            if (temp['workflow_name'] != 'tasks_reportforms') {
              dataResult.push(temp);
            }
          }
          let dataLength = dataResult.length;
          self.total = dataLength;
          let dataList = [];
          for (let i = 0; i < dataLength; i++) {
            let typeEn = dataResult[i].type;
            let cycleEn = dataResult[i].cycle;
            if (typeEn == '2') {
              cycleEn = '';
            }
            let number = dataResult[i].number;
            let cycleZh = this.tzCycleFormatter(cycleEn, number);
            let exeTimeFormat = dataResult[i].hour + ':' + dataResult[i].minute;
            if (cycleEn == '3' || cycleEn == '6') {
              exeTimeFormat = dataResult[i].minute;
            }
            dataList.push({
              id:dataResult[i].id,
              name:dataResult[i].name,
              type:dataResult[i].type,
              cycle:cycleZh,
              cycleEn:cycleEn,
              projectId:dataResult[i].project_id,
              exeTime:exeTimeFormat,
              createTime:dataResult[i].created_at
            });
          }
          dataList = this.filterList(dataList);
          self.totalData = dataList;
          self.totalData.sort(this.$sortFormatter(self.queryParam.key, self.queryParam.keyOrder));
          self.loading = false;
        } catch (data) {
          self.loading = false;
          console.log('获取云计划任务列表失败');
        }
        if (isClear) {
          self.$nextTick(() => {
            self.$refs.table.clearSelection();
          });
        }
      },
      handleSearch(params) {
        this.searchBarValidatedParams = params;
        this.getData();
      },
      tzTypeFormatter(type) {
        if (type == '') {
          return '';
        } else if (type == '1') {
          return this.$t('task.repeatExecution');
        } else if (type == '2') {
          return this.$t('task.performOnce');
        } else {
          return type;
        }
      },
      tzCycleFormatter(cycle, number) {
        if (cycle == '') {
          return '';
        } else if (cycle == '1') {
          return this.$t('task.everyDay');
        } else if (cycle == '2') {
          //return '每N天';
          return this.$t('task.every') + " " + number + " " + this.$t('task.day');
        } else if (cycle == '3') {
          return this.$t('task.every') + this.$t('task.hour');
        } else if (cycle == '4') {
          let weekStr = this.tzNumWeekFormatter(number);
          return this.$t('task.everyWeek') + ':' + weekStr;
        } else if (cycle == '5') {
          let monthStr = this.tzNumMonthFormatter(number);
          return this.$t('task.everyMonth') + ':' + monthStr;
        } else if (cycle == '6') {
          return this.$t('lang.minute');
        } else {
          return cycle;
        }
      },
      tzNumWeekFormatter(number) {
        if (number == '') {
          return '';
        } else {
          let numberArray = number.split(',');
          let weekStr = '';
          for (let na1=0; na1<numberArray.length; na1++) {
            let weekName = '';
            if (numberArray[na1] === '0') {
              weekName = this.$t('task.sunday');
            } else if (numberArray[na1] === '1') {
              weekName = this.$t('task.monday');
            } else if (numberArray[na1] === '2') {
              weekName = this.$t('task.tuesday');
            } else if (numberArray[na1] === '3') {
              weekName = this.$t('task.wednesday');
            } else if (numberArray[na1] === '4') {
              weekName = this.$t('task.thursday');
            } else if (numberArray[na1] === '5') {
              weekName = this.$t('task.friday');
            } else if (numberArray[na1] === '6') {
              weekName = this.$t('task.saturday');
            }
            if (na1==0) {
              weekStr = weekName;
            } else {
              weekStr = weekStr + ',' + weekName;
            }
          }
          return weekStr;
        }
      },
      tzNumMonthFormatter(number) {
        if (number == '') {
          return '';
        } else {
          let numberArray = number.split(',');
          let monthStr = '';
          for (let na1=0; na1<numberArray.length; na1++) {
            let monthName = numberArray[na1] + this.$t('task.hao');
            if (na1==0) {
              monthStr = monthName;
            } else {
              monthStr = monthStr + ',' + monthName;
            }
          }
          return monthStr;
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
        let self = this;
        let key = sortItem.prop;
        let keyOrder = sortItem.order;
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
      rowNameClick(rowIndex, rowData) {
        this.definition = rowData.definition;
        this.detailFlag = true;
        this.$refs.table.clearSelection();
        this.$nextTick(() => {
          this.$refs.triggerTasks;
        });
      },
      rowNameRender(rowIndex, rowData) {
        this.$router.push({
          path: "/workflow/workflowtriggertaskguide/workflowtriggertasktab/" + rowData.id
        });
        this.$emit("taskNameRender", rowData.name);
      },
      onSubmit() {
        if (this.formInline.name.length > 40) {
          this.$message.error(this.$t('heat.fortyCharacterMaximum'));
          return;
        }
        this.getData();
      },
      onDetailPanelBack() {
        this.detailFlag = false;
      },
      // selectProject() {
      //   this.selProjectFlg = true;
      //   this.$nextTick(() => {
      //     this.$refs.selectProject.show();
      //   });
      // },
      // getSelProjects(id, name) {
      //   this.formInline.queryProject = id;
      //   this.formInline.projectName = name;
      //   this.close = 'close';
      // },
      // onIconClick() {
      //   this.formInline.queryProject = '';
      //   this.formInline.projectName = '';
      //   this.close = '';
      // },
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
          this.searchBar.conditions.projectName.options = projectList.map(item => {
            return {
              label: item.name,
              value: item.id
            };
          });
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
      filterList(allData) {
        let self = this;
        let nameFilteredData = [];
        if (self.searchBarValidatedParams.name == undefined || self.searchBarValidatedParams.name == "") {
          nameFilteredData = allData;
        } else {
          allData.forEach(function(obj) {
            if (obj.name.indexOf(self.searchBarValidatedParams.name) > -1) {
              nameFilteredData.push(obj);
            }
          });
        }
        let typeFilteredData = [];
        if (self.searchBarValidatedParams.type == undefined || self.searchBarValidatedParams.type == "") {
          typeFilteredData = nameFilteredData;
        } else {
          nameFilteredData.forEach(function(obj) {
            if (obj.type == self.searchBarValidatedParams.type) {
              typeFilteredData.push(obj);
            }
          });
        }
        return typeFilteredData;
      },
      handleAddShow() {
        this.createTriggerFlag = false;
      },
      exeTimeRender(exetime, row) {
        if (row["cycleEn"] == "6") {
          exetime = this.$t('task.everyGe') + parseInt(exetime) + this.$t('lang.minute');
        }
        return exetime;
      }
    }
  };
</script>
<style scoped>

</style>
