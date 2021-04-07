<template>
  <div>
    <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('task.taskName')">
        <el-input v-model="formInline.name" size="small"></el-input>
      </el-form-item>
      <el-form-item :label="$t('task.excuteFrequency')" >
        <el-select v-model="formInline.type" clearable>
          <el-option :label="$t('lang.all')" value=""></el-option>
          <el-option v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('lang.status')" >
        <el-select v-model="formInline.state" clearable> 
          <el-option :label="$t('lang.all')" value=""></el-option>
          <el-option :label="$t('report.startReport')" value="activated"></el-option>
          <el-option :label="$t('report.stopReport')" value="paused"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('report.resource')">
        <el-select v-model="formInline.resource" @change="getIndicatorList">
          <el-option v-for="item in resourceOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('report.indicator')" v-if="formInline.resource != 'system_overview'">
        <el-select v-model="formInline.indicator">
          <el-option v-for="item in indicatorOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' @click="onSubmit" size="small">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
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
        sortable="custom"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('state') >= 0"
        prop="state"
        :label="$t('lang.status')"
        show-overflow-tooltip
        align="left"
        min-width="50">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.state)">
            <span>{{statusFormatter(scope.row.state)}}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('resource') >= 0"
        prop="resource"
        :label="$t('report.resource')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{resourceNameFormatter(scope.row.resource)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('indicator') >= 0"
        prop="indicator"
        :label="$t('report.indicator')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{indicatorFormatter(scope.row.indicator)}}</span>
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
        min-width="50">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('exeTime') >= 0"
        prop="exeTime"
        :label="$t('task.exeTime')"
        show-overflow-tooltip
        align="left"
        min-width="50">
        <template slot-scope="scope">
          <span>{{scope.row.exeTime}}</span>
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
        <!-- <template slot-scope="scope">
          <span>{{tzTimeFormatter(scope.row.createTime)}}</span>
        </template> -->
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('firstexecutiontime') >= 0"
        prop="firstexecutiontime"
        :label="$t('task.firstExeTime')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <!-- <template slot-scope="scope">
          <span>{{tzTimeFormatter(scope.row.firstexecutiontime)}}</span>
        </template> -->
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('nextexecutiontime') >= 0"
        prop="nextexecutiontime"
        :label="$t('task.nextExeTime')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <!-- <template slot-scope="scope">
          <span>{{tzTimeFormatter(scope.row.nextexecutiontime)}}</span>
        </template> -->
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
              <el-checkbox class="item" v-for="(item) in columns" :label="item.prop" :key="item.prop">{{item.label}}
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
    <create-trigger ref="createTrigger" v-if="createTriggerFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow"></create-trigger>
  </div>
</template>
<script>
  import createTrigger from "./PeriodReportCreate"
  export default {
    name: 'WorkFlowTriggers',
    components: {
      createTrigger
    },
    data () {
      return {
        close:"",
        formInline: {
          name:"",
          queryProject: '',
          projectName:"",
          type:'',
          state:'',
          uuid:'',
          resource: '',
          indicator: ''
        },
        definition:'',
        clusterIp : '',
        rowServiceName:"",
        rowNameSpace:"",
        roleType: Vue.roleType,
        projectOption: [],
        allClusters: [],
        clusterByProject: [],
        selProjectFlg:false,
        detailFlag: false,
        total: 0,
        columns: [],
        tzTimeFormatter: this.$dateFormatter,
        columnsChecked:["id", "name", "createTime", "exeTime", "endTime", "type", "cycle", "projectId", "state", "resource", "indicator", "firstexecutiontime", "nextexecutiontime"],
        typeOptions:[{id:1, name : Vue.t('task.repeatExecution')}, {id:2, name: Vue.t('task.performOnce')}],
        tableData: [],
        totalData: [],
        multipleSelection: [],
        loading: false,
        createTriggerFlag:false,
        resourceOption:[
          {id:"", name: Vue.t('lang.all')},
          {id:"host", name: Vue.t("lang.host")},
          {id:"operation_log", name: Vue.t("lang.operateRecord")},
          {id:"system_overview", name: Vue.t("report.systemoverview")},
          {id:"vm", name: Vue.t("task.cloudHost")}
        ],
        indicatorOption:[{id: "", name: Vue.t("lang.all")}],
        operationMenus: [{
          icon: "fa-plus",
          name: Vue.t('task.create'),
          showflg: true,
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
          showflg: true,
          readOnly: false,
          multi:true,
          enable(rowData) {
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
                    en:"Delete Period Report Task:{name}",
                    zh_cn:"删除周期报表任务：{name}"
                  },
                  target:Vue.logTarget.Report
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
        }, {
          icon: "fa-play",
          name: Vue.t('base.enable'),
          showflg: true,
          readOnly: false,
          multi:true,
          enable(rowData) {
            if (rowData["state"] == "paused") {
              return true;
            }
            return false;
          },
          handler: function(selectRows) {
            let self = this;
            let reportList = [];
            let logName = '';
            for (let i = 0; i < selectRows.length; i++) {
              let row = selectRows[i];
              reportList.push({id: row["id"], state:'activated'});
              logName += row["name"]+";"
            }
            let requestBody = {};
            requestBody.cloud_tasks = reportList;
            self.$ajax({
              type: 'POST',
              url: 'api/mistral/v2/cloud_tasks/update_report_cloud_tasks',
              data:JSON.stringify(requestBody),
              confirmMsg: Vue.t('report.confirmStart'),
              successMsg: Vue.t('lang.enableSuccess'),
              log:{
                description:{
                  en:"Start period report:" + logName,
                  zh_cn:"启用周期报表:" + logName
                },
                target:Vue.logTarget.Report
              },
              successFun:() => {
                self.loading = false;
                self.$refs.table.clearSelection();
                setTimeout( function() {
                  self.getData();
                  self.loading = false;
                }, 3000);
              },
              errFun:() => {
                self.loading = false;
                self.$refs.table.clearSelection();
                setTimeout( function() {
                  self.getData();
                  self.loading = false;
                }, 3000);
              }
            });
          }.bind(this)
        }, {
          icon: "fa-stop",
          name: Vue.t('report.stopReport'),
          showflg: true,
          readOnly: false,
          multi:true,
          enable(rowData) {
            if (rowData["state"] == "activated" || rowData["state"] == null) {
              return true;
            }
            return false;
          },
          handler: function(selectRows) {
            let self = this;
            let reportList = [];
            let logName = '';
            for (let i = 0; i < selectRows.length; i++) {
              let row = selectRows[i];
              reportList.push({id: row["id"], state:'paused'});
              logName += row["name"]+";"
            }
            let requestBody = {};
            requestBody.cloud_tasks = reportList;
            try {
              self.$ajax({
                type: 'POST',
                url: 'api/mistral/v2/cloud_tasks/update_report_cloud_tasks',
                data: JSON.stringify(requestBody),
                confirmMsg: Vue.t('report.confirmStop'),
                successMsg: Vue.t('lang.disableSuccess'),
                log:{
                  description:{
                    en:"Stop period report:" + logName,
                    zh_cn:"禁用周期报表:" + logName
                  },
                  target:Vue.logTarget.Report
                },
                successFun:() => {
                  self.$refs.table.clearSelection();
                  self.getData();
                },
                errFun:() => {
                  self.$refs.table.clearSelection();
                  self.getData();
                }
              });
            } catch (data) {
            }
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
      if (this.roleType == "0") {
        this.resourceOption = [
          {id:"", name: Vue.t('lang.all')},
          {id:"host", name: Vue.t("lang.host")},
          {id:"operation_log", name: Vue.t("lang.operateRecord")},
          {id:"system_overview", name: Vue.t("report.systemoverview")},
          {id:"vm", name: Vue.t("task.cloudHost")}
        ];
      } else {
        this.resourceOption = [
          {id:"", name: Vue.t('lang.all')},
          {id:"operation_log", name: Vue.t("lang.operateRecord")},
          {id:"vm", name: Vue.t("task.cloudHost")}
        ];
      }
      this.getData();
    },
    methods: {
      async getData(param, isClear = true) {
        let self = this;
        let serviceUrl = "";
        let projectIdTemp = this.$cookie.get("pid");
        if (this.roleType == '0') {
          serviceUrl = "api/mistral/v2/cloud_tasks";
        } else if (this.roleType == '2') {
          serviceUrl = "api/mistral/v2/cloud_tasks?project_id=" + projectIdTemp;
        } else {
          serviceUrl = "";
        }
        try {
          self.loading = true;
          let workFlowList = await this.$ajax({
            type: 'get',
            url: serviceUrl
          });
          let dataResult = [];
          let tempResult = workFlowList.cloud_tasks;
          if (Vue.roleType == "0") {
            for (let temp of tempResult) {
              if (temp['workflow_name'] == 'tasks_reportforms' && temp["all_tenants"] == "1") {
                dataResult.push(temp);
              }
            }
          } else {
            for (let temp of tempResult) {
              if (temp['workflow_name'] == 'tasks_reportforms' && temp["all_tenants"] == "0") {
                dataResult.push(temp);
              }
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
            if (cycleEn == '3') {
              exeTimeFormat = dataResult[i].minute;
            }
            dataList.push({
              id:dataResult[i].id,
              name:dataResult[i].name,
              type:dataResult[i].type,
              cycle:cycleZh,
              projectId:dataResult[i].project_id,
              exeTime:exeTimeFormat,
              createTime:dataResult[i].created_at,
              resource:dataResult[i].indicator_id,
              indicator:dataResult[i].indicator_id,
              state:dataResult[i].state,
              firstexecutiontime:dataResult[i].first_execution_time,
              nextexecutiontime:dataResult[i].next_execution_time,
              all_tenants:dataResult[i].all_tenants
            });
          }
          dataList = this.filterList(dataList, this.formInline.name, this.formInline.type, this.formInline.state, this.formInline.resource, this.formInline.indicator);
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
           filterList(allData, name, type, state, resource, indicator) {
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
          nameFilteredData.forEach(function(obj) {
            if (obj.type == type) {
              typeFilteredData.push(obj);
            }
          });
        }
        let indicatorFilteredData = [];
        if (resource == "system_overview") {
          typeFilteredData.forEach(function(obj) {
            if (obj.indicator == resource) {
              indicatorFilteredData.push(obj);
            }
          });
        } else {
          if (indicator === '') {
            indicatorFilteredData = typeFilteredData;
          } else {
            typeFilteredData.forEach(function(obj) {
              if (obj.indicator == indicator) {
                indicatorFilteredData.push(obj);
              }
            });
          }
        }
        let stateFiterdData = [];
        if (state === '') {
          stateFiterdData = indicatorFilteredData;
        } else {
          indicatorFilteredData.forEach(function(obj) {
            if (obj.state == state) {
              stateFiterdData.push(obj);
            }
          });
        }
        return stateFiterdData;
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
          return '-';
        } else if (cycle == '1') {
          return this.$t('task.everyDay');
        } else if (cycle == '2') {
          //return '每N天';
          return this.$t('task.every') + " " + number + " " + this.$t('task.day');
        } else if (cycle == '3') {
          return this.$t('task.every') + this.$t('task.hour');
        } else if (cycle == '4') {
          var weekStr = this.tzNumWeekFormatter(number);
          return this.$t('task.everyWeek') + ':' + weekStr;
        } else if (cycle == '5') {
          var monthStr = this.tzNumMonthFormatter(number);
          return this.$t('task.everyMonth') + ':' + monthStr;
        } else {
          return cycle;
        }
      },
      tzNumWeekFormatter(number) {
        if (number == '') {
          return '';
        } else {
          var numberArray = number.split(',');
          var weekStr = '';
          for (var na1=0; na1<numberArray.length; na1++) {
            var weekName = '';
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
          var numberArray = number.split(',');
          var monthStr = '';
          for (var na1=0; na1<numberArray.length; na1++) {
            var monthName = numberArray[na1] + this.$t('task.hao');
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
      rowNameClick(rowIndex, rowData) {
        this.definition = rowData.definition;
        this.detailFlag = true;
        this.$refs.table.clearSelection();
        this.$nextTick(() => {
          this.$refs.triggerTasks;
        });
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
      handleAddShow() {
        this.createTriggerFlag = false;
        this.getData();
      },
      handleCancelShow() {
        this.createTriggerFlag = false;
      },
      statusFormatter(state) {
        if (state == "paused") {
          return Vue.t("report.stopReport");
        } else if (state == "activated") {
          return Vue.t("report.startReport");
        } else {
          return Vue.t("report.startReport");
        }
      },
      statusTagRender(state) {
        if ("activated" == state) {
           return "success";
        } else if ("paused" == state) {
           return "info";
        } else {
          return "success";
        }
      },
      resourceNameFormatter(indicatorId) {
        let resName = '';
        if (indicatorId == "vm_detail") {
          resName = Vue.t("task.cloudHost");
        } else if (indicatorId == "vm_alarm") {
          resName = Vue.t("task.cloudHost");
        } else if (indicatorId == "vm_performance_report") {
          resName = Vue.t("task.cloudHost");
        } else if (indicatorId == "host_alarm") {
          resName = Vue.t("lang.host");
        } else if (indicatorId == "host_detail") {
          resName = Vue.t("lang.host");
        } else if (indicatorId == "host_performance_report") {
          resName = Vue.t("lang.host");
        } else if (indicatorId == "operation_log_detail") {
          resName = Vue.t("lang.operateRecord");
        } else if (indicatorId == "system_overview") {
          resName = Vue.t("report.systemoverview");
        } else {
          resName = "";
        }
        return resName;
      },
      indicatorFormatter(indicatorId) {
        let indicator = '';
        if (indicatorId == "vm_detail") {
          indicator = Vue.t("base.detailInformation");
        } else if (indicatorId == "vm_alarm") {
          indicator = Vue.t("base.realTimeAlarm");
        } else if (indicatorId == "vm_performance_report") {
         indicator = Vue.t("report.performanceReport");
        } else if (indicatorId == "host_alarm") {
         indicator = Vue.t("base.realTimeAlarm");
        } else if (indicatorId == "host_detail") {
          indicator = Vue.t("base.detailInformation");
        } else if (indicatorId == "host_performance_report") {
          indicator = Vue.t("report.performanceReport");
        } else if (indicatorId == "operation_log_detail") {
          indicator = Vue.t("base.detailInformation");
        } else if (indicatorId == "system_overview") {
          indicator = "";
        } else {
          indicator = "";
        }
        return indicator;
      },
      async getIndicatorList(resourceId) {
        let self = this;
        if (resourceId != "system_overview" && resourceId!="") {
          await self.$ajax({
            url:"api/leo/v1/report/get_indicator",
            type:"get",
            data:{
              resource_id:resourceId,
              role_type:self.roleType
            },
            successFun:(response) => {
              self.indicatorOption = [];
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
                self.formInline.indicator = self.indicatorOption[0].id;
              }
            }
          });
        } else if (resourceId == "") {
          self.formInline.indicator = "";
          self.indicatorOption = [{id: "", name: Vue.t("lang.all")}];
        }
      }
    }
  };
</script>
<style scoped>

</style>
