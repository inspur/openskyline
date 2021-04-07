<template>
  <div class="system">
    <el-form
      :inline="true"
      class="module-background-color module-padding isolation-belt form-inline"
      :rules="rules"
      :model="data"
      ref="form"
    >
      <el-form-item :label="$t('lang.host')">
        <el-select v-model="queryHost" style="width:150px;" filterable clearable>
          <el-option :label="$t('base.all')" value></el-option>
          <el-option v-for="item in hostList" :key="item" :value="item" :label="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('operationAnalysis.submodule')">
        <el-select v-model="programName" style="width:150px;" filterable clearable>
          <el-option :label="$t('base.all')" value></el-option>
          <el-option v-for="item in programList" :key="item" :value="item" :label="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('operationAnalysis.keyword')" prop="keyword">
        <el-input auto-complete="off" style="width:150px;" v-model="data.keyword"></el-input>
      </el-form-item>
      <el-form-item :label="$t('operationAnalysis.timerange')">
        <el-select v-model="timeQuick" filterable @change="timequickChange" style="width:150px;">
          <el-option :label="$t('monitor.last1Hour')" value="1"></el-option>
          <el-option :label="$t('base.last12Hout')" value="2"></el-option>
          <el-option :label="$t('base.lastoneDay')" value="3"></el-option>
          <el-option :label="$t('base.lastWeek')" value="4"></el-option>
          <el-option :label="$t('network.selfDefine')" value="5"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-show="selfdefineShow">
        <el-date-picker
          v-model="startTime"
          type="date"
          :editable="false"
          :clearable="false"
          :placeholder="$t('base.startDate')"
          :picker-options="spickerOption"
        ></el-date-picker>
      </el-form-item>
      <el-form-item v-show="selfdefineShow">
        <el-time-picker
          v-model="startHour"
          :editable="false"
          :clearable="false"
          :picker-options="starthourOption"
        ></el-time-picker>
      </el-form-item>
      <el-form-item v-show="selfdefineShow">
        <span>-</span>
      </el-form-item>
      <el-form-item v-show="selfdefineShow">
        <el-date-picker
          v-model="endTime"
          type="date"
          :editable="false"
          :clearable="false"
          :placeholder="$t('base.endDate')"
          :picker-options="epickerOption"
        ></el-date-picker>
      </el-form-item>
      <el-form-item v-show="selfdefineShow">
        <el-time-picker
          v-model="endHour"
          :editable="false"
          :clearable="false"
          :picker-options="endhourOption"
        ></el-time-picker>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="search"
          size="small"
          @click="queryClick()"
        >{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>

    <div class="module-background-color module-padding">
      <div
        class="charts-parent isolation-belt"
        v-loading="loading"
        :element-loading-text="$t('base.loadingData')"
      >
        <div class="chart-title">{{$t('operationAnalysis.logbarchartHistory')}}</div>
        <IEcharts ref="echarts" :option="option" :resizable="true" style="height:360px;"></IEcharts>
      </div>
    </div>

    <div class="module-background-color module-padding">
      <el-form inline class="isolation-belt">
        <el-form-item>
          <el-button
            icon="fa-download"
            type="primary"
            size="small"
            @click="exportExcel"
            :loading="exportingExcel"
          >{{ $t('base.EXPORT_EXCEL') }}</el-button>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="columnsChecked.indexOf('time') >= 0"
          prop="time"
          :label="$t('operationAnalysis.ACQUISITION_TIME')"
          align="left"
        ></el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('host_name') >= 0"
          prop="host_name"
          :label="$t('lang.host')"
          align="left"
        ></el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('program_name') >= 0"
          prop="program_name"
          align="left"
          :label="$t('operationAnalysis.submodule')"
        ></el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('desc') >= 0"
          prop="desc"
          align="left"
          :label="$t('base.desc')"
          min-width="300"
        ></el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox
                  class="item"
                  v-for="item in columns"
                  :label="item.prop"
                  :key="item.prop"
                >{{item.label}}</el-checkbox>
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
              :total="total"
            ></el-pagination>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
let Base64 = require("js-base64").Base64;
import { exportJsonToExcel } from "../../../../utils/Export2Excel";
import { utils } from "../../../intelligentMonitoring/public/utils";
import moment from "moment";
import uuid from 'uuid';
export default {
  name: "system",
  components: {},
  data() {
    return {
      rules: {
        keyword: [{ type: "maxSize", value: 100 }, { type: "disableJY" }]
      },
      title: Vue.t("network.monitorNote2"),
      roleType: Vue.roleType,
      queryHost: "",
      hostList: [],
      programList: [],
      programName: "",
      data: { keyword: "" },
      timeQuick: "1",
      selfdefineShow: false,
      exportingExcel: false,
      steptimes: [],
      startTime: (function(d) {
        let date = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          0,
          0,
          0
        );
        date.setDate(date.getDate() - 1);
        return date;
      })(new Date()),
      endTime: (function(d) {
        let date = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          0,
          0,
          0
        );
        return date;
      })(new Date()),
      spickerOption: function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.endTime) {
              return time.getTime() > me.endTime;
            } else {
              return time.getTime() > Date.now();
            }
          }
        };
      }.bind(this)(),
      epickerOption: function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.startTime) {
              return (
                time.getTime() < me.startTime || time.getTime() > Date.now()
              );
            } else {
              return time.getTime() > Date.now();
            }
          }
        };
      }.bind(this)(),
      startHour: new Date(2019, 10, 10, 0, 0, 1),
      endHour: new Date(),
      starthourOption: {
        selectableRange: "00:00:00 - 23:59:59"
      },
      endhourOption: {
        selectableRange: "00:00:00 - 23:59:59"
      },
      tableData: [],
      chartData: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      multipleSelection: [],
      sortObj: {
        sortOrder: "ascending",
        sortField: "name"
      },
      pageCount: false,
      columns: [
        {
          prop: "time",
          label: Vue.t("operationAnalysis.ACQUISITION_TIME")
        },
        {
          prop: "host_name",
          label: Vue.t("lang.host")
        },
        {
          prop: "program_name",
          label: Vue.t("operationAnalysis.submodule")
        },
        {
          prop: "desc",
          label: Vue.t("base.desc")
        }
      ],
      columnsChecked: ["desc", "host_name", "program_name", "time"],
      option: {
        title: { bottom: 0, left: "center" },
        tooltip: {
          trigger: "axis"
        },
        xAxis: {
          type: "category",
          boundaryGap: true,
          data: [],
          axisLabel: {
            formatter: function(val) {
              return moment(val).format("MM-DD HH:mm");
            }
          }
        },
        yAxis: [
          {
            type: "value",
            name: Vue.t("operationAnalysis.logNumber")
          }
        ],
        grid: {
          bottom: 40
        },
        series: [
          {
            data: [],
            type: "line"
          }
        ]
      }
    };
  },
  watch: {
    $route(to, from) {}
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {});
  },
  beforeRouteUpdate(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  beforeDestroy() {},
  mounted() {
    this.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option
    );
    this.timequickChange(this.timeQuick);
    this.getHostList();
    this.getTableData({ from: "mounted" });
  },
  methods: {
    async getTableData(v = {}) {
      let self = this;
      let starttime = "";
      let endtime = "";
      if (v.from !== "page") {
        self.timequickChange(self.timeQuick);
      }
      if (self.timeQuick == "5") {
        starttime = self.getRealTime(self.startTime, self.startHour);
        endtime = self.getRealTime(self.endTime, self.endHour);
        let nowtime = Math.floor(new Date().getTime());
        if (starttime > nowtime || endtime > nowtime) {
          self.$notify({
            message: Vue.t("operationAnalysis.queryNote1"),
            type: "error"
          });
          return;
        }
        if (starttime > endtime) {
          self.$notify({
            message: Vue.t("operationAnalysis.queryNote4"),
            type: "error"
          });
          return;
        }
      } else {
        starttime = Math.floor(self.steptimes[0].getTime());
        endtime = Math.floor(self.steptimes[1].getTime());
      }
      let search = "";
      if (self.queryHost != "") {
        search += "host_name=" + self.queryHost + "&";
      }
      if (self.programName != "") {
        search += "program_name=" + self.programName + "&";
      }
      if (self.data.keyword != "") {
        search += "query=" + self.data.keyword + "&";
      }
      search += "start_time=" + Math.floor(starttime / 1000) + "&";
      search += "end_time=" + Math.floor(endtime / 1000) + "&";
      search += "page_num=" + self.currentPage + "&";
      search += "page_size=" + self.pageSize + "&";
      search += "index_type=slog";
      if (parseInt(self.currentPage) * parseInt(self.pageSize) > 10000) {
        self.$notify({
          message: Vue.t("operationAnalysis.queryNote2"),
          type: "error"
        });
        self.tableData = [];
        return;
      }
      self.loading = true;
      await self.$ajax({
        type: "get",
        url: "api/venus/v1/search/logs?" + search,
        successFun(response = {}) {
          self.loading = false;
          if (response.code != "-1") {
            let data = response.data || {};
            let stats = response.data_stats || {};

            let d = JSON.parse(JSON.stringify(data.values || []));
            self.tableData = Array.from(d, v => {
              v.time = moment(v.time).format("YYYY-MM-DD HH:mm:ss") || "-";
              v.host_name = v.host_name || "-";
              v.program_name = v.program_name || "-";
              v.desc = v.desc || "-";
              return v;
            });

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
            self.option.title.text = "";
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
      if (!column.prop) {
        return;
      }
      self.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
      };
    },
    onRefresh() {
      this.getTableData({ from: "refresh" });
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
        vm.getTableData({ from: "query" });
      });
    },
    //查询条件
    getHostList() {
      let self = this;
      self.$ajax({
        type: "get",
        url: `api/venus/v1/search/params?type=host_name&index_type=slog`,
        successFun(data) {
          if (data.code == "1") {
            self.hostList = data.values;
          } else if (data.code == "0") {
            self.hostList = [];
          } else {
            self.$notify({
              message: data.msg,
              type: "error"
            });
          }
        },
        errFun() {}
      });
      self.$ajax({
        type: "get",
        url: `api/venus/v1/search/params?type=program_name&index_type=slog`,
        successFun(data) {
          if (data.code == "1") {
            self.programList = data.values;
          } else if (data.code == "0") {
            self.programList = [];
          } else {
            self.$notify({
              message: data.msg,
              type: "error"
            });
          }
        },
        errFun() {}
      });
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
        x.push(moment(item["key_as_string"]).format("YYYY-MM-DD HH:mm:ss"));
        y.push(item["doc_count"]);
      });
      self.option.xAxis.data = x;
      self.option.series[0].data = y;
    },
    timequickChange(value) {
      this.selfdefineShow = false;
      if (value == "1") {
        this.steptimes = [
          new Date(new Date().getTime() - 3600 * 1000),
          new Date()
        ];
      } else if (value == "2") {
        this.steptimes = [
          new Date(new Date().getTime() - 3600 * 12 * 1000),
          new Date()
        ];
      } else if (value == "3") {
        this.steptimes = [
          new Date(new Date().getTime() - 3600 * 24 * 1000),
          new Date()
        ];
      } else if (value == "4") {
        this.steptimes = [
          new Date(new Date().getTime() - 3600 * 24 * 7 * 1000),
          new Date()
        ];
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
    exportExcel() {
      let self = this;
      if (self.total > 10000) {
        this.$notify({
          message: Vue.t("operationAnalysis.queryNote3"),
          type: "warning"
        });
        return;
      }
      self.exportingExcel = true;
      let search = "";
      let logName = "";
      let logFilename = "运维分析_日志检索_系统日志检索_";
      if (self.queryHost != "") {
        search += "host_name=" + self.queryHost + "&";
        logName += "主机：" + self.queryHost + "，";
        logFilename += self.queryHost + "_";
      }
      if (self.programName != "") {
        search += "program_name=" + self.programName + "&";
        logName += "组件:" + self.programName + "，";
        logFilename += self.programName + "_";
      }
      if (self.data.keyword != "") {
        search += "query=" + self.data.keyword + "&";
      }
      let starttime = "";
      let endtime = "";
      if (self.timeQuick == "5") {
        starttime = self.getRealTime(self.startTime, self.startHour);
        endtime = self.getRealTime(self.endTime, self.endHour);
      } else {
        // self.timequickChange(self.timeQuick);
        starttime = Math.floor(self.steptimes[0].getTime());
        endtime = Math.floor(self.steptimes[1].getTime());
      }
      logName +=
        "开始时间：" +
        moment(starttime).format("YYYY-MM-DD HH:mm:ss") +
        "，结束时间：" +
        moment(endtime).format("YYYY-MM-DD HH:mm:ss");

      logFilename += moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss");
      search += "start_time=" + Math.floor(starttime / 1000) + "&";
      search += "end_time=" + Math.floor(endtime / 1000) + "&";
      search += "page_num=1&";
      search += "page_size=" + self.total + "&";
      search += "index_type=slog";
      let traceId = 'req-'+uuid.v1();
      self.$ajax({
        type: "get",
        url: "api/venus/v1/search/logs?" + search,
        headers: {
          'X-Openstack-Request-Id': traceId
        },
        successFun(response) {
          if (response.code == "1") {
            let data = response.data.values;
            const headers = {
              time: {
                zh_cn: Vue.t("operationAnalysis.ACQUISITION_TIME"),
                en: "Time"
              },
              host_name: {
                zh_cn: "主机",
                en: "HOST"
              },
              program_name: {
                zh_cn: "组件",
                en: "Program"
              },
              desc: {
                zh_cn: "描述",
                en: "Description"
              }
            };
            const flattenData = data.map(log =>
              Object.keys(headers).map(k => {
                if (k == "time") {
                  log[k] = moment(log[k]).format("YYYY-MM-DD HH:mm:ss");
                }
                return log[k] || "-";
              })
            );
            self.$recordLog({
              target: Vue.logTarget.operationAnalysis,
              level: {
                en: "info",
                zh_cn: "信息"
              },
              description: {
                en: "Export Operation Analysis Logs:" + logName,
                zh_cn: "导出日志检索的日志，" + logName
              },
              trace_id: traceId
            });
            exportJsonToExcel({
              header: Object.keys(headers).map(k => headers[k][Vue.language]),
              data: flattenData,
              filename: logFilename
            });
          }
          self.exportingExcel = false;
        },
        errFun() {
          self.exportingExcel = false;
        }
      });
    }
  }
};
</script>
<style scoped>
.system {
}
</style>