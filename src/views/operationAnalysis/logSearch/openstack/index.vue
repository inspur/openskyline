<template>
<div class="openstack">
  <el-form :inline="true" class="module-background-color module-padding isolation-belt form-inline" :rules="rules"
      :model="data"
      ref="form">
    <el-form-item :label="$t('lang.host')">
      <el-select v-model="query_host" style="width:150px;" filterable clearable>
        <el-option :label="$t('base.all')" value=""></el-option>
        <el-option v-for="item in hostList" :key="item" :value="item" :label="item"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('operationAnalysis.module')">
      <el-select v-model="query_module" style="width:150px;" filterable clearable @change="moduleChange">
        <el-option :label="$t('base.all')" value=""></el-option>
        <el-option v-for="item in moduleList" :key="item" :value="item" :label="item"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('operationAnalysis.submodule')">
      <el-select v-model="query_zujian" style="width:150px;" filterable clearable>
        <el-option :label="$t('base.all')" value=""></el-option>
        <el-option v-for="item in zujianList" :key="item" :value="item" :label="item"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('operationAnalysis.level')">
      <el-select v-model="query_level"  style="width:150px;" filterable clearable>
        <el-option :label="$t('base.all')" value=""></el-option>
        <el-option v-for="item in levelList" :key="item" :value="item" :label="item"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('operationAnalysis.userId')">
      <el-input auto-complete="off" style="width:150px;" v-model="query_userId"></el-input>
    </el-form-item>
    <el-form-item :label="$t('operationAnalysis.projectId')">
      <el-input auto-complete="off" style="width:150px;" v-model="query_projectId"></el-input>
    </el-form-item>
    <br/>
    <el-form-item :label="$t('operationAnalysis.keyword')" prop="keyword">
      <el-input auto-complete="off" style="width:150px;" v-model="data.keyword"></el-input>
    </el-form-item>
    <el-form-item :label="$t('operationAnalysis.timerange')">
      <el-select v-model="time_quick" filterable @change="timequickChange" style="width:150px;">
        <el-option :label="$t('monitor.last1Hour')" value="1"></el-option>
        <el-option :label="$t('base.last12Hout')" value="2"></el-option>
        <el-option :label="$t('base.lastoneDay')" value="3"></el-option>
        <el-option :label="$t('base.lastWeek')" value="4"></el-option>
        <el-option :label="$t('network.selfDefine')" value="5"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-show="selfdefineShow">
      <el-date-picker v-model="startTime" type="date" :editable="false" :clearable="false" :placeholder="$t('base.startDate')" :picker-options="spickerOption"></el-date-picker>
    </el-form-item>
    <el-form-item v-show="selfdefineShow">
      <el-time-picker v-model="startHour" :editable="false" :clearable="false" :picker-options="starthourOption"></el-time-picker>
    </el-form-item>
    <el-form-item v-show="selfdefineShow">
      <span>-</span>
    </el-form-item>
    <el-form-item v-show="selfdefineShow">
      <el-date-picker v-model="endTime" type="date" :editable="false" :clearable="false" :placeholder="$t('base.endDate')" :picker-options="epickerOption"></el-date-picker>
    </el-form-item>
    <el-form-item v-show="selfdefineShow">
      <el-time-picker v-model="endHour" :editable="false" :clearable="false" :picker-options="endhourOption"></el-time-picker>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="search" size="small" @click="queryClick()">{{$t('lang.query')}}</el-button>
    </el-form-item>
  </el-form>
  <div class="module-background-color module-padding">
    <div v-loading="loading" :element-loading-text="$t('base.loadingData')" class="charts-parent isolation-belt">
      <div class="chart-title">{{$t('operationAnalysis.logbarchartHistory')}}</div>
      <IEcharts ref="echarts" :option="option" :resizable="true" style="height:360px;"></IEcharts>
    </div>
    <router-view></router-view>
  </div>
  <div class="module-background-color module-padding">
    <el-form inline class="isolation-belt">
      <el-form-item>
        <el-button icon="fa-download" type="primary" size="small" @click="exportExcel" :loading="exportingExcel">{{ $t('base.EXPORT_EXCEL') }}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="deTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('base.loadingData')"
      highlight-current-row
      border
      stripe
      style="width: 100%"
      row-key="id"
      :default-sort="{prop:'create_time',order:'descending'}"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column v-if="columnsChecked.indexOf('time') >= 0"
        prop="time"
        :label="$t('base.time')"
        align="left">
        <template slot-scope="scope">
          <span v-html="keywordRed(tzTimeFormatter(scope.row.time))"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('host_name') >= 0"
        prop="host_name"
        :label="$t('lang.host')"
        align="left">
        <template slot-scope="scope">
          <span v-html="keywordRed(scope.row.host_name)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('module_name') >= 0"
        prop="module_name"
        align="left"
        :label="$t('operationAnalysis.module')">
        <template slot-scope="scope">
          <span v-html="keywordRed(scope.row.module_name)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('program_name') >= 0"
        prop="program_name"
        align="left"
        :label="$t('operationAnalysis.submodule')">
        <template slot-scope="scope">
          <span v-html="keywordRed(scope.row.program_name)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('level') >= 0"
        prop="level"
        :label="$t('operationAnalysis.level')"
        align="left"
        min-width="50">
        <template slot-scope="scope">
          <span v-html="keywordRed(scope.row.level)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('project_id') >= 0"
        prop="project_id"
        align="left"
        :label="$t('operationAnalysis.projectId')">
        <template slot-scope="scope">
          <span v-html="keywordRed(scope.row.project_id)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('user_id') >= 0"
        prop="user_id"
        align="left"
        :label="$t('operationAnalysis.userId')">
        <template slot-scope="scope">
          <span v-html="keywordRed(scope.row.user_id)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('desc') >= 0"
        prop="desc"
        align="left"
        :label="$t('base.desc')"
        min-width="300">
        <template slot-scope="scope">
          <span v-text="keywordRed(scope.row.desc)"></span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="columns-checkbox name-wrapper">
              <el-tag>{{$t('network.columnSelected')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <el-pagination
            class="right"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-col>
      </el-row>
    </div>
  </div>
</div>
</template>
<script>
let Base64 = require('js-base64').Base64;
import { exportJsonToExcel } from '../../../../utils/Export2Excel'
import { utils } from "../../../intelligentMonitoring/public/utils";
import uuid from 'uuid';
export default {
  name:"openstack",
  components: {
  },
  data() {
    return {
      rules: {
        keyword: [{ type: "maxSize", value: 100 }, { type: "disableJY" }]
      },
      data: { keyword: "" },
      title: Vue.t("network.monitorNote2"),
      roleType: Vue.roleType,
      hostList: [],
      moduleList: [],
      zujianList: [],
      levelList: [],
      query_host: '',
      query_module: '',
      query_zujian: '',
      query_level: '',
      query_userId: '',
      query_projectId: '',
      time_quick: '1',
      selfdefineShow: false,
      exportingExcel: false,
      steptimes: [],
      startTime:(function(d) {
        let date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        date.setDate(date.getDate()-1);
        return date;
      })(new Date()),
      endTime:(function(d) {
        let date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        return date;
      })(new Date()),
      spickerOption:function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.endTime) {
              return time.getTime() > me.endTime;
            } else {
              return time.getTime() > Date.now();
            }
          }
        }
      }.bind(this)(),
      epickerOption:function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.startTime) {
              return time.getTime() < me.startTime||time.getTime() > Date.now();
            } else {
              return time.getTime() > Date.now();
            }
          }
        }
      }.bind(this)(),
      startHour: new Date(2019, 10, 10, 0, 0, 1),
      endHour: new Date(),
      starthourOption: {
        selectableRange: '00:00:00 - 23:59:59'
      },
      endhourOption: {
        selectableRange: '00:00:00 - 23:59:59'
      },
      tableData: [],
      chartData: [],
      loading:false,
      currentPage:1,
      pageSize: 10,
      total: 0,
      multipleSelection: [],
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      pageCount:false,
      tzTimeFormatter: this.$tzTimeFormatter,
      columns: [{
        prop: "desc",
        label: Vue.t('base.desc')
      }, {
        prop: "host_name",
        label: Vue.t('lang.host')
      }, {
        prop: "level",
        label: Vue.t('operationAnalysis.level')
      }, {
        prop: "module_name",
        label: Vue.t('operationAnalysis.module')
      }, {
        prop: "program_name",
        label: Vue.t('operationAnalysis.submodule')
      }, {
        prop: "project_id",
        label: Vue.t('operationAnalysis.projectId')
      }, {
        prop:"time",
        label: Vue.t('base.time')
      }, {
        prop: "user_id",
        label: Vue.t('operationAnalysis.userId')
      }],
      columnsChecked:["desc", "host_name", "level", "module_name", "program_name", "project_id", "time", "user_id"],
      option:{
        title: { bottom: 0, left: "center" },
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          type:'category',
          boundaryGap:true,
          data:[],
          axisLabel:{
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:[{
          type:'value',
          name: Vue.t('operationAnalysis.logNumber')
        }],
        grid:{
          bottom:40
        },
        series:[{
          data:[],
          type:'line'
        }]
      }
    }
  },
  mounted() {
     this.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option
    );
    this.timequickChange(this.time_quick);
    this.getHostList();
    this.getTableData();
  },
  methods: {
    async getTableData(v = {}) {
      let self = this;
      let starttime = '';
      let endtime = '';
      if (v.from !== "page") {
        self.timequickChange(self.time_quick);
      }
      if (self.time_quick == "5") {
        starttime = self.getRealTime(self.startTime, self.startHour);
        endtime = self.getRealTime(self.endTime, self.endHour);
        let nowtime = Math.floor(new Date().getTime());
        if (starttime > nowtime || endtime > nowtime) {
          self.$notify({
            message: Vue.t('operationAnalysis.queryNote1'),
            type: "error"
          });
          return;
        }
        if (starttime > endtime) {
          self.$notify({
            message: Vue.t('operationAnalysis.queryNote4'),
            type: "error"
          });
          return;
        }
      } else {
        starttime = Math.floor(self.steptimes[0].getTime());
        endtime = Math.floor(self.steptimes[1].getTime());
      }
      let reqBody = '';
      if (self.query_host != '') {
        reqBody += 'host_name='+ self.query_host + '&';
      }
      if (self.query_module != '') {
        reqBody += 'module_name=' + self.query_module + '&';
      }
      if (self.query_zujian != '') {
        reqBody += 'program_name=' + self.query_zujian + '&';
      }
      if (self.query_level != '') {
        reqBody += 'level=' + self.query_level + '&';
      }
      if (self.query_userId != '') {
        reqBody += 'user_id=' + self.query_userId + '&';
      }
      if (self.query_projectId != '') {
        reqBody += 'project_id=' + self.query_projectId + '&';
      }
      if (self.data.keyword != '') {
        reqBody += 'query=' + self.data.keyword + '&';
      }
      reqBody += 'start_time=' + Math.floor(starttime/1000) + '&';
      reqBody += 'end_time=' +Math.floor(endtime/1000) + '&';
      reqBody += 'page_num=' + self.currentPage + '&';
      reqBody += 'page_size=' + self.pageSize;
      if (parseInt(self.currentPage) * parseInt(self.pageSize) > 10000) {
        self.$notify({
          message: Vue.t('operationAnalysis.queryNote2'),
          type: "error"
        });
        self.tableData = [];
        return;
      }
      self.loading = true;
      let ret = await self.$ajax({
        type: 'get',
        url: "api/venus/v1/search/logs?" + reqBody,
        successFun(response = {}) {
          self.loading = false;
          if (response.code != "-1") {
            let data = response.data || {};
            let stats = response.data_stats || {};
            self.tableData = data.values;
            self.chartData = stats.count;
            self.option.title.text = self.title + stats.interval_cn;
            self.setlogData();
            self.total = data.total;
          } else {
            self.$notify({
              message: response.msg,
              type: "error"
            });
            self.tableData = [];
            self.chartData = [];
            self.option.title.text = '';
            self.setlogData();
          }
        },
        errFun() {
          self.loading = false;
        }
      });
    },
    sortChange(column) {
      let self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    onRefresh() {
      this.getTableData();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    queryClick() {
      let vm = this;
       vm.$refs["form"].validate(v => {
        if (!v) {
          return;
        }

        vm.$refs.deTable.clearSelection();
        vm.pageCount = true;
        vm.getTableData();
      });
    },
    //查询条件
    getHostList() {
      let self = this;
      let ret1 = self.$ajax({
        type: 'get',
        url: 'api/venus/v1/search/params?type='+'host_name',
        successFun(data) {
          if (data.code == '1') {
            self.hostList = data.values;
          } else if (data.code == '0') {
            self.hostList = [];
          } else {
            self.$notify({
              message: data.msg,
              type: "error"
            });
          }
        },
        errFun() {
        }
      });
      let ret2 = self.$ajax({
        type: 'get',
        url: 'api/venus/v1/search/params?type='+'module_name',
        successFun(data) {
          if (data.code == '1') {
            self.moduleList = data.values;
          } else if (data.code == '0') {
            self.moduleList = [];
          } else {
            self.$notify({
              message: data.msg,
              type: "error"
            });
          }
        },
        errFun() {
        }
      });
      let ret3 = self.$ajax({
        type: 'get',
        url: 'api/venus/v1/search/params?type='+'program_name',
        successFun(data) {
          if (data.code == '1') {
            self.zujianList = data.values;
          } else if (data.code == '0') {
            self.zujianList = [];
          } else {
            self.$notify({
              message: data.msg,
              type: "error"
            });
          }
        },
        errFun() {
        }
      });
      let ret4 = self.$ajax({
        type: 'get',
        url: 'api/venus/v1/search/params?type='+'level',
        successFun(data) {
          if (data.code == '1') {
            self.levelList = data.values;
          } else if (data.code == '0') {
            self.levelList = [];
          } else {
            self.$notify({
              message: data.msg,
              type: "error"
            });
          }
        },
        errFun() {
        }
      });
    },
    levelRender(level, row) {
      if (level == 'info') {
        return Vue.t('opt.slight');
      } else if (level == 'warning') {
        return Vue.t('opt.commonly');
      } else if (level == 'error') {
        return Vue.t('opt.serious');
      } else {
        return level;
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData({ from: "page" });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData({ from: "page" });
    },
    setlogData() {
      let self = this;
      self.$refs.echarts && self.$refs.echarts.clear();
      let cpuArr = self.chartData;
      let x = [];
      let y = [];
      cpuArr.forEach((item, index) => {
        x.push(self.convertX(item["key_as_string"]));
        y.push(item['doc_count']);
      });
      self.option.xAxis.data = x;
      self.option.series[0].data = y;
    },
    convertX(str) {
      let date = new Date(str);
      let month = date.getMonth()+1>9?date.getMonth()+1:"0"+(date.getMonth()+1);
      let day = date.getDate()>9?date.getDate():"0"+date.getDate();
      let hour = date.getHours()>9?date.getHours():"0"+date.getHours();
      let min = date.getMinutes()>9?date.getMinutes():"0"+date.getMinutes();
      let sec = date.getSeconds()>9?date.getSeconds():"0"+date.getSeconds();
      return date.getFullYear()+"-"+month+"-"+day+" "+hour+":"+min+":"+sec;
    },
    formatX(str) {
      let date = this.$stringToDate(str);
      let mon = date.getMonth()+1>9?date.getMonth()+1:"0"+(date.getMonth()+1);
      let day = date.getDate()>9?date.getDate():"0"+date.getDate();
      let hour = date.getHours()>9?date.getHours():"0"+date.getHours();
      let minute = date.getMinutes()>9?date.getMinutes():"0"+date.getMinutes();
      return mon+"-"+day+" "+hour+":"+minute;
    },
    timequickChange(value) {
      this.selfdefineShow = false;
      if (value == "1") {
        this.steptimes = [new Date(new Date().getTime() - 3600 * 1000), new Date()];
      } else if (value == "2") {
        this.steptimes = [new Date(new Date().getTime() - 3600 * 12 * 1000), new Date()];
      } else if (value == "3") {
        this.steptimes = [new Date(new Date().getTime() - 3600 * 24 * 1000), new Date()];
      } else if (value == "4") {
        this.steptimes = [new Date(new Date().getTime() - 3600 * 24 * 7 * 1000), new Date()];
      } else {
        this.steptimes = [];
        this.selfdefineShow = true;
      }
    },
    getRealTime(yearmonth, hourminute) {
      let date = new Date(yearmonth);
      let year = date.getFullYear();
      let month = date.getMonth();
      let day = date.getDate();
      let date2 = new Date(hourminute);
      let hour = date2.getHours();
      let minute = date2.getMinutes();
      let second = date2.getSeconds();
      let realdate = new Date(year, month, day, hour, minute, second);
      return Math.floor(realdate.getTime());
    },
    keywordRed(value) {
      if (value == "" || value == null) {
        return "-";
      }
      return value;
    },
    exportExcel() {
      let self = this;
      if (self.total > 10000) {
        this.$notify({
          message: Vue.t('operationAnalysis.queryNote3'),
          type: 'warning'
        });
        return;
      }
      self.exportingExcel = true;
      let reqBody = '';
      let logName = '';
      let logFilename = '运维分析_日志检索_';
      if (self.query_host != '') {
        reqBody += 'host_name='+ self.query_host + '&';
        logName += "主机：" + self.query_host + "，";
        logFilename += self.query_host + "_";
      }
      if (self.query_module != '') {
        reqBody += 'module_name=' + self.query_module + '&';
        logName += '模块:' + self.query_module + "，";
        logFilename += self.query_module + "_";
      }
      if (self.query_zujian != '') {
        reqBody += 'program_name=' + self.query_zujian + '&';
        logName += '组件:' + self.query_zujian + "，";
        logFilename += self.query_zujian + "_";
      }
      if (self.query_level != '') {
        reqBody += 'level=' + self.query_level + '&';
        logName += '级别:' + self.query_level + "，";
        logFilename += self.query_level + "_";
      }
      if (self.query_userId != '') {
        reqBody += 'user_id=' + self.query_userId + '&';
      }
      if (self.query_projectId != '') {
        reqBody += 'project_id=' + self.query_projectId + '&';
      }
      if (self.data.keyword != '') {
        reqBody += 'query=' + self.data.keyword + '&';
      }
      let starttime = '';
      let endtime = '';
      if (self.time_quick == "5") {
        starttime = self.getRealTime(self.startTime, self.startHour);
        endtime = self.getRealTime(self.endTime, self.endHour);
      } else {
        // self.timequickChange(self.time_quick);
        starttime = Math.floor(self.steptimes[0].getTime());
        endtime = Math.floor(self.steptimes[1].getTime());
      }
      logName += "开始时间：" + self.tzTimeFormatter(starttime) + "，结束时间：" + self.tzTimeFormatter(endtime);
      logFilename += self.tzTimeFormatter(new Date().getTime());
      reqBody += 'start_time=' + Math.floor(starttime/1000) + '&';
      reqBody += 'end_time=' + Math.floor(endtime/1000) + '&';
      reqBody += 'page_num=1&';
      reqBody += 'page_size=' + self.total;
      let traceId = 'req-'+uuid.v1();
      let ret = self.$ajax({
        type: 'get',
        url: "api/venus/v1/search/logs?" + reqBody,
        headers: {
          'X-Openstack-Request-Id': traceId
        },
        successFun(response) {
          if (response.code == "1") {
            let data = response.data.values;
            const headers = {
              time: {
                zh_cn: '时间',
                en: 'Time'
              },
              host_name: {
                zh_cn: '主机',
                en: 'HOST'
              },
              module_name: {
                zh_cn: '模块',
                en: 'Model'
              },
              program_name: {
                zh_cn: '组件',
                en: 'Program'
              },
              level: {
                zh_cn: '级别',
                en: 'Level'
              },
              project_id: {
                zh_cn: '项目ID',
                en: 'Project ID'
              },
              user_id: {
                zh_cn: '用户ID',
                en: 'User ID'
              },
              desc: {
                zh_cn: '描述',
                en: 'Description'
              }
            };
            const flattenData = data.map(log => Object.keys(headers).map(k => {
              if (k == "time") {
                log[k] = self.tzTimeFormatter(log[k]);
              }
              return log[k] || '-'
            }));
            self.$recordLog({
              target: Vue.logTarget.operationAnalysis,
                level: {
                  en: 'info',
                  zh_cn: '信息'
                },
                description: {
                  en: 'Export Operation Analysis Logs:'+logName,
                  zh_cn: '导出日志检索的日志，'+logName
                },
                trace_id: traceId
            });
            exportJsonToExcel({
              header: Object.keys(headers).map(k => headers[k][Vue.language]),
              data: flattenData,
              filename: logFilename
            });
            self.exportingExcel = false;
          } else {
            self.exportingExcel = false;
          }
        },
        errFun() {
          self.exportingExcel = false;
        }
      });
    },
    moduleChange(value) {
      let self = this;
      self.query_zujian = '';
      self.$ajax({
        type: 'get',
        url: 'api/venus/v1/search/params?type=program_name&module_name='+value,
        successFun(data) {
          if (data.code == '1') {
            self.zujianList = data.values;
          } else if (data.code == '0') {
            self.zujianList = [];
          } else {
            self.$notify({
              message: data.msg,
              type: "error"
            });
          }
        },
        errFun() {
        }
      });
    },
    advancedQuery() {

    }
  }
}
</script>
