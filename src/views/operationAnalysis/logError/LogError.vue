<template>
  <div class="log-error">
    <icos-page-header :title="$t('operationAnalysis.logerrorTypical')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <el-form :inline="true" class="form-inline isolation-belt module-background-color module-padding">
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
          @click="queryLog()"
        >{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>

    <div class="module-background-color module-padding">
      <div class="charts-parent isolation-belt">
        <div class="chart-title">
          <span>{{isCN?'主要组件调用错误':'main component call error'}}</span>
          <el-select
            v-model="chart1.selectModel"
            style="width:150px;"
            filterable
            :clearable="chart1.clearable"
            @change="chart1.componentChange"
            @clear="chart1.componentClear"
          >
            <el-option v-for="item in chart1.componentList" :key="item" :value="item" :label="item"></el-option>
          </el-select>
        </div>
        <IEcharts
          ref="chart1"
          :option="chart1.option"
          :loading="chart1.loading"
          :loadingOpts="loadingOpts"
          :resizable="true"
          style="height:360px;"
        ></IEcharts>
      </div>

      <div class="charts-parent isolation-belt">
        <div class="chart-title">
          <span>{{isCN?'主要组件RabbitMQ调用错误':'main component rabbitmq call error'}}</span>
          <el-select
            v-model="chart2.selectModel"
            style="width:150px;"
            filterable
            :clearable="chart2.clearable"
            @change="chart2.componentChange"
            @clear="chart2.componentClear"
          >
            <el-option v-for="item in chart2.componentList" :key="item" :value="item" :label="item"></el-option>
          </el-select>
        </div>
        <IEcharts
          ref="chart2"
          :option="chart2.option"
          :loading="chart2.loading"
          :loadingOpts="loadingOpts"
          :resizable="true"
          style="height:360px;"
        ></IEcharts>
      </div>

      <div class="charts-parent isolation-belt">
        <div class="chart-title">
          <span>{{isCN?'主要组件mysql调用错误':'main component mysql call error'}}</span>
          <el-select
            v-model="chart3.selectModel"
            style="width:150px;"
            filterable
            :clearable="chart3.clearable"
            @change="chart3.componentChange"
            @clear="chart3.componentClear"
          >
            <el-option v-for="item in chart3.componentList" :key="item" :value="item" :label="item"></el-option>
          </el-select>
        </div>
        <IEcharts
          ref="chart3"
          :option="chart3.option"
          :loading="chart3.loading"
          :loadingOpts="loadingOpts"
          :resizable="true"
          style="height:360px;"
        ></IEcharts>
      </div>
    </div>
  </div>
</template>
<script>
import moment from "moment";
import { utils } from "../../intelligentMonitoring/public/utils";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "LogHost",
  components: {},
  data() {
    function Chart(v = {}) {
      const $this = this;
      const vm = v.vm;
      this.id = v.id;
      this.stats = [];
      this.clearable = true;
      this.componentChange = v => {
        this.clearable = this.selectModel !== Vue.t("base.all");
        let stats = $this.stats;
        let all = Vue.t("base.all");
        if (v !== all) {
          stats = stats.filter(v_ => v_["key"] === v);
        }
        $this.setChartData({ stats: stats, showAll: v === all });
      };
      this.componentClear = v => {
        this.selectModel = Vue.t("base.all");
      };
      this.getData = (v = {}) => {
        $this.el = $this.el || v.chart;
        let p = "start_time=" + Math.floor(vm.selectStarttime / 1000) + "&";
        p += "end_time=" + Math.floor(vm.selectEndtime / 1000) + "&";
        p += `type=${$this.id}`;

        $this.loading = true;

        vm.$ajax({
          type: "get",
          url: "api/venus/v1/search/typical/logs?" + p,
          successFun(response = {}) {
            $this.loading = false;

            let data = response.data || {};
            let stats = data.stats || [];
            $this.stats = stats;

            if (response.code == "1" && stats.length > 0) {
              let componentList = Array.from(stats, v => v.key);
              componentList.unshift(Vue.t("base.all"));
              $this.componentList = componentList;
              $this.selectModel = componentList[0];
              $this.option.title.text = vm.title + data.interval_cn;
            } else {
              $this.selectModel = "";
              $this.componentList = [];
              $this.option.title.text = vm.noData;
            }

            $this.setChartData({ stats: stats, showAll: true });
          },
          errFun() {
            $this.loading = false;
          }
        });
      };
      this.setChartData = v => {
        $this.el.clear();

        let stats = v.stats;
        $this.option.legend.data = Array.from(stats, v => v.key);
        $this.option.tooltip.trigger = v.showAll ? "item" : "axis";
        let reducer = (v, vv) => (v.count.length > vv.count.length ? v : vv);
        let maxCount = stats.reduce(reducer, { count: [] })["count"];
        $this.option.xAxis.data = Array.from(
          maxCount,
          v => `${moment(v["key_as_string"]).format("YYYY-MM-DD HH:mm:ss")}`
        );
        $this.option.series = Array.from(stats, v => {
          return {
            name: v.key,
            type: "line",
            data: Array.from(v.count, v => {
              return v["doc_count"];
            })
          };
        });
      };
      this.loading = false;
      this.option = {
        title: { bottom: 0, left: "center" },
        tooltip: {
          trigger: "item"
        },
        legend: {
          top: 0,
          data: []
        },
        xAxis: {
          type: "category",
          boundaryGap: true,
          show: true,
          data: [],
          axisLabel: {
            show: true,
            interval: 0,
            formatter: (value, index) => (index % 10 == 0 ? value : "")
          }
        },
        yAxis: [
          {
            type: "value",
            show: true
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
      };
      this.componentList = [];
      this.selectModel = "";
    }
    return {
      isCN: String(Vue.config.lang) === "zh-cn",
      dark: Vue.cookie.get("theme") + "" == "dark",
      title: Vue.t("network.monitorNote2"),
      noData: Vue.t("base.noData"),
      loadingOpts: utils.loadingOpts,
      timeQuick: "1",
      selfdefineShow: false,
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
      endHour: new Date(2019, 10, 10, 23, 59, 59),
      starthourOption: {
        selectableRange: "00:00:00 - 23:59:59"
      },
      endhourOption: {
        selectableRange: "00:00:00 - 23:59:59"
      },
      selectStarttime: "",
      selectEndtime: "",
      chart1: new Chart({ id: "error_stats", vm: this }),
      chart2: new Chart({
        id: "rabbitmq_error_stats",
        vm: this
      }),
      chart3: new Chart({
        id: "mysql_error_stats",
        vm: this
      })
    };
  },
  created() {
    this.chart1.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.chart1.option
    );
    this.chart2.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.chart2.option
    );
    this.chart3.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.chart3.option
    );
  },
  mounted() {
    this.queryLog();
  },
  methods: {
    queryLog() {
      let self = this;
      let starttime = "";
      let endtime = "";
      self.timequickChange(self.timeQuick);
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
      self.selectStarttime = starttime;
      self.selectEndtime = endtime;

      self.chart1.getData({ chart: self.$refs.chart1 });
      self.chart2.getData({ chart: self.$refs.chart2 });
      self.chart3.getData({ chart: self.$refs.chart3 });
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
    }
  }
};
</script>
<style scoped>
.log-error >>> .el-form {
}
</style>