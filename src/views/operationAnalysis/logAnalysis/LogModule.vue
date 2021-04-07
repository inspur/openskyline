<template>
<div class="log-module">

  <el-form :inline="true" v-model="formInline" class="form-inline isolation-belt module-background-color module-padding">
    <el-form-item :label="$t('lang.host')">
      <el-select v-model="query_host" style="width:150px;" filterable clearable>
        <el-option :label="$t('base.all')" value=""></el-option>
        <el-option v-for="item in hostList" :key="item" :value="item" :label="item"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('operationAnalysis.module')">
      <el-select v-model="query_module" style="width:150px;" filterable clearable>
        <el-option :label="$t('base.all')" value=""></el-option>
        <el-option v-for="item in moduleList" :key="item" :value="item" :label="item"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('operationAnalysis.level')">
      <el-select v-model="query_level"  style="width:150px;" filterable clearable>
        <el-option :label="$t('base.all')" value=""></el-option>
        <el-option v-for="item in levelList" :key="item" :value="item" :label="item"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('operationAnalysis.timerange')">
      <el-select v-model="time_quick" filterable @change="timequickChange">
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
      <el-button type="primary" icon="search" size="small" @click="queryLog()">{{$t('lang.query')}}</el-button>
    </el-form-item>
  </el-form>

  <div class="module-background-color module-padding">
    <div>
      <el-row :gutter="6">
        <el-col :span="24" v-loading="loading">
          <div class="charts-parent" style="height: 300px;">
            <div class="pull-right" style="position:relative;z-index:10">
              <el-button type="primary" icon="plus" size="small" @click="saveHistoryData()">{{$t('base.save')}}</el-button>
            </div>
            <IEcharts ref="" :option="option" :resizable="true"></IEcharts>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="6"  v-loading="loading2">
        <el-col :span="12" v-show="historyFlag4">
          <div class="charts-parent" style="height: 240px;margin-top:10px;">
            <div class="pull-right" style="position:relative;z-index:10">
              <el-button type="primary" icon="delete" size="small" @click="deleteChart('4')">{{$t('lang.delete')}}</el-button>
            </div>
            <IEcharts ref="" :option="option4" :resizable="true"></IEcharts>
          </div>
        </el-col>
        <el-col :span="12" v-show="historyFlag3">
          <div class="charts-parent" style="height: 240px;margin-top:10px;">
            <div class="pull-right" style="position:relative;z-index:10">
              <el-button type="primary" icon="delete" size="small" @click="deleteChart('3')">{{$t('lang.delete')}}</el-button>
            </div>
            <IEcharts ref="" :option="option3" :resizable="true"></IEcharts>
          </div>
        </el-col>
        <el-col :span="12" v-show="historyFlag2">
          <div class="charts-parent" style="height: 240px;margin-top:10px;">
            <div class="pull-right" style="position:relative;z-index:10">
              <el-button type="primary" icon="delete" size="small" @click="deleteChart('2')">{{$t('lang.delete')}}</el-button>
            </div>
            <IEcharts ref="" :option="option2" :resizable="true"></IEcharts>
          </div>
        </el-col>
        <el-col :span="12" v-show="historyFlag1">
          <div class="charts-parent" style="height: 240px;margin-top:10px;">
            <div class="pull-right" style="position:relative;z-index:10">
              <el-button type="primary" icon="delete" size="small" @click="deleteChart('1')">{{$t('lang.delete')}}</el-button>
            </div>
            <IEcharts ref="" :option="option1" :resizable="true"></IEcharts>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</div>
</template>
<script>
import moment from 'moment';
import { utils } from "../../intelligentMonitoring/public/utils";
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: "LogModule",
  components: {
  },
  data() {
    return {
      formInline: '',
      loading: false,
      loading2: false,
      historyFlag1: false,
      historyFlag2: false,
      historyFlag3: false,
      historyFlag4: false,
      hostList: [],
      moduleList: [],
      levelList: [],
      query_host: '',
      query_module: '',
      query_level: '',
      time_quick: '1',
      chartList: [],
      selfdefineShow: false,
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
      endHour: new Date(2019, 10, 10, 23, 59, 59),
      starthourOption: {
        selectableRange: '00:00:00 - 23:59:59'
      },
      endhourOption: {
        selectableRange: '00:00:00 - 23:59:59'
      },
      selectStarttime: '',
      selectEndtime: '',
      chartData: [],
      chartTitle: '',
      pickerOptions: {
        shortcuts: [{
          text: Vue.t('monitor.CUSTOM_GRAPH_TIME_LATEST_HOUR'),
          onClick(picker) {
            const start = new Date();
            const end = new Date();
            start.setTime(start.getTime() - 3600 * 1000);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: Vue.t('monitor.CUSTOM_GRAPH_TIME_LATEST_DAY'),
          onClick(picker) {
            const start = new Date();
            const end = new Date();
            start.setTime(start.getTime() - 3600 * 24 * 1000);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: Vue.t('monitor.CUSTOM_GRAPH_TIME_LATEST_WEEK'),
          onClick(picker) {
            const start = new Date();
            const end = new Date();
            start.setTime(start.getTime() - 3600 * 24 * 7 * 1000);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: Vue.t('monitor.CUSTOM_GRAPH_TIME_LATEST_MONTH'),
          onClick(picker) {
            const start = new Date();
            const end = new Date();
            start.setTime(start.getTime() - 3600 * 24 * 30 * 1000);
            picker.$emit('pick', [start, end]);
          }
        }],
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: "line", axis: "y" }
        },
        xAxis:{
          // name:Vue.t('operationAnalysis.logNumber'),
          type:'value',
          boundaryGap:[0, 0]
        },
        yAxis: [{
          type:'category',
          boundaryGap:true,
          data:[]
        }],
        series: [{
          data:[],
          type:'bar',
          barWidth: '10'
        }]
      },
      option1: {
        xAxis: {
         axisLabel: {
            rotate: 25
          }
        },
        series: [{
          barWidth: '5'
        }],
        grid: {
          bottom: 30
        }
      },
      option2: {},
      option3: {},
      option4: {}
    }
  },
  created() {
    this.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option
    );
    this.option1 = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option,
      this.option1
    );
    this.option2 = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option,
      this.option1
    );
    this.option3 = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option,
      this.option1
    );
    this.option4 = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option,
      this.option1
    );
  },
  mounted() {
    this.getHostList();
    this.queryLog();
  },
  methods: {
    queryLog() {
      let self = this;
      let starttime = '';
      let endtime = '';
      self.timequickChange(self.time_quick);
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
      self.selectStarttime = starttime;
      self.selectEndtime = endtime;
      this.getData();
      this.getHistoryData();
    },
    async getData() {
      let self = this;
      let reqBody = '';
      if (self.query_host != '') {
        reqBody += 'host_name='+ self.query_host + '&';
      }
      if (self.query_module != '') {
        reqBody += 'module_name=' + self.query_module + '&';
      }
      if (self.query_level != '') {
        reqBody += 'level=' + self.query_level + '&';
      }
      reqBody += 'start_time=' + Math.floor(self.selectStarttime/1000) + '&';
      reqBody += 'end_time=' +Math.floor(self.selectEndtime/1000) + '&';
      reqBody += 'group_name=' + 'program_name';
      self.loading = true;
      let ret = await self.$ajax({
        type: 'get',
        url: "api/venus/v1/search/analyse/logs?" + reqBody,
        successFun(response) {
          self.loading = false;
          if (response.code != "-1") {
            self.chartTitle = response.data.title_cn;
            let dataList = response.data.count;
            self.option.yAxis[0].data = [];
            self.option.series[0].data = [];
            dataList.forEach((item, index) => {
              self.option.yAxis[0].data.push(item["key"]);
              self.option.series[0].data.push(item['doc_count']);
            });
            self.option.title.text = self.chartTitle;
          }
        },
        errFun() {
          self.loading = false;
        }
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
    getHistoryData() {
      let self = this;
      let ret = this.$ajax({
        type: 'get',
        url: "api/venus/v1/custom_config?id=module",
        successFun(data) {
          let hfs = [1, 2, 3, 4];
          if (!data.value) {
            hfs.forEach((v, i) => {
              self[`historyFlag${v}`] = false;
            })
            return;
          }
          let dataList = JSON.parse(data.value);
          hfs.forEach((v, i) => {
            self[`historyFlag${v}`] = i < dataList.length;
          })
          self.chartList = [];
          let options = [self.option1, self.option2, self.option3, self.option4];
          for (let i = 0; i < dataList.length; i++) {
            let dataObj = dataList[i];
            self.chartList.push({title: dataObj.title, value: dataObj.value});
            self.getHistoryChartData(options[i], dataObj.value);
          }
        }
      })
    },
    async getHistoryChartData(option, value) {
      let self = this;
      let reqBody = '';
      let queryData = value;
      if (queryData["module_name"] != '' && queryData["module_name"] != undefined) {
        reqBody += 'module_name=' + queryData["module_name"] + '&';
      }
      if (queryData["host_name"] != '' && queryData["host_name"] != undefined) {
        reqBody += 'host_name=' + queryData["host_name"] + '&';
      }
      if (queryData["level"] != '' && queryData["level"] != undefined) {
        reqBody += 'level=' + queryData["level"] + '&';
      }
      reqBody += 'start_time=' + Math.floor(self.selectStarttime/1000) + '&';
      reqBody += 'end_time=' +Math.floor(self.selectEndtime/1000) + '&';
      reqBody += 'group_name=' + 'program_name';
      self.loading2 = true;
      let ret = await self.$ajax({
        type: 'get',
        url: "api/venus/v1/search/analyse/logs?" + reqBody,
        successFun(response) {
          self.loading2 = false;
          if (response.code == "-1") {
            return;
          }

          option.title.text = response.data.title_cn;
          let dataList = response.data.count;
          option.yAxis[0].data = [];
          option.series[0].data = [];
          dataList.forEach((item, index) => {
            option.yAxis[0].data.push(item["key"]);
            option.series[0].data.push(item['doc_count']);
          });
        },
        errFun() {
          self.loading2 = false;
        }
      });
    },
    saveHistoryData() {
      let self = this;
      let queryData = {};
      queryData["module_name"] = self.query_module;
      queryData["host_name"] = self.query_host;
      queryData["level"] = self.query_level;
      if (self.chartList.length < 4) {
        self.chartList.push({title: self.chartTitle, value:queryData});
      } else {
        self.chartList.shift();
        self.chartList.push({title: self.chartTitle, value:queryData});
      }

      let cn = `${Vue.t("operationAnalysis.zujianLogAnalysis")}柱状图TOP5`;
      let en = `${Vue.t("operationAnalysis.zujianLogAnalysis")} Log Analysis TOP5`;
      let a = [self.query_host, self.query_module, self.query_level];
      if (a[0] || a[1] || a[2]) {
        cn += " (";
        en += " (";
        if (a[0]) { cn += ` ${Vue.t('lang.host')}=${a[0]} `; en += ` host=${a[0]} ` };
        if (a[1]) { cn += ` ${Vue.t('operationAnalysis.module')}=${a[1]} `; en += ` module=${a[1]} ` };
        if (a[2]) { cn += ` ${Vue.t('operationAnalysis.level')}=${a[2]} `; en += ` level=${a[2]} ` };
        cn += " )";
        en += " )";
      }

      let ret = self.$ajax({
        type: 'POST',
        url: "api/venus/v1/custom_config",
        data:JSON.stringify({
          id:"module",
          value:JSON.stringify(self.chartList)
        }),
        successMsg:Vue.t('base.saveSuccess'),
        successFun(data) {
          self.getHistoryData();
        },
        errFun() {
        },
        log:{
          description:{
            en:"Save:" + en,
            zh_cn:"保存:" + cn
          },
          target:Vue.logTarget.operationAnalysis
        }
      })
    },
    deleteChart(j) {
      let self = this;
      self.$confirm(Vue.t('operationAnalysis.CONFIRM_TO_DELETE'), Vue.t('network.attention'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        type: "warning",
        closeOnClickModal: false,
        callback: (action, instance) => {
          if (action === "confirm") {
            if (self.chartList.length > 0) {
              let chart = self.chartList.splice(j-1, 1);
              let option = [self.option1, self.option2, self.option3, self.option4][j - 1];

              let ret = self.$ajax({
                type: 'POST',
                url: "api/venus/v1/custom_config",
                data:JSON.stringify({
                  id:"module",
                  value:JSON.stringify(self.chartList)
                }),
                successMsg:Vue.t('network.deleteSuccess'),
                successFun(data) {
                  self.getHistoryData();
                },
                log:{
                  description:{
                    en:"Delete:"+ option['title']['text'],
                    zh_cn:"删除:"+ option['title']['text']
                  },
                  target:Vue.logTarget.operationAnalysis
                }
              })
            }
          }
        }
      });
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
    }
  }
}
</script>
