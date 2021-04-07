<template>
  <div class="predict-trend">
    <div class="chart">
      <el-form inline>
        <el-form-item :label="$t('operationAnalysis.PREDICT_SEASON_PERIOD')">
          <el-select v-model="duration" :placeholder="$t('operationAnalysis.PREDICT_PLEASE_CHOOSE_DURATION')" style="width: 150px;" @change="predictSeasonPeriodChange">
            <el-option :label="$t('operationAnalysis.PREDICT_12H')" value="12h" />
            <el-option :label="$t('operationAnalysis.PREDICT_24H')" value="24h" />
            <el-option :label="$t('operationAnalysis.PREDICT_1W')" value="1w" />
            <el-option :label="$t('operationAnalysis.PREDICT_UNLIMIT')" value="96h" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item>
          <el-tooltip placement="top">
            <div slot="content" v-if="isCN">
              预测采用三次指数平滑算法，监控数据采用0时或12时开始计算的周期，此周期更符合数据特征
            </div>
            <div slot="content" v-else>
              the prediction adopts the cubic exponential smoothing algorithm,and the monitoring data adopts the period from 0:00 or 12:00,which is more in line with the data characteristics
            </div>
            <i class="el-tooltip el-icon-fa">&#xF059</i>
          </el-tooltip>
        </el-form-item> -->

        <el-form-item :label="$t('operationAnalysis.PREDICTION_MODEL')">
          <el-select v-model="predictionModel" :placeholder="$t('operationAnalysis.PREDICT_PLEASE_CHOOSE_DURATION')" style="width: 150px;" @change="loadChartData()">
            <el-option v-for="v in predictionModels" :key="v" :label="v" :value="v" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button @click="loadChartData()" type="primary" size="small" :loading="chart.loading" icon="fa-refresh">{{ $t('operationAnalysis.PREDICT') }}</el-button>
        </el-form-item>
        <el-form-item>
          <span>smape{{$t('operationAnalysis.MARK')+'：'+smape}}</span>
        </el-form-item>
      </el-form>
      <IEcharts
        ref="chart"
        :option="chart.option"
        :loading="chart.loading"
        :loadingOpts="loadingOpts"
        :resizable="true"
        style="height: 270px;"
      />
    </div>


    <div class="rest-time-wrapper">
      <el-form inline onsubmit="return false;">
        <el-form-item :label="$t('operationAnalysis.PREDICT_THRESHOLD')+'(%)'">
          <el-input v-model="dashboardOption.percent" style="width: 75px;" />
        </el-form-item>
        <el-form-item>
          <el-button @click="loadRestTime()" type="primary" size="small" :disabled="duration === ''" :loading="restTimeLoading" icon="fa-calculator" native-type="submit">{{ $t('operationAnalysis.PREDICT_CALC') }}</el-button>
        </el-form-item>
      </el-form>
      <icos-dashboard ref="dashboard" :option="dashboardOption" style="height: 246px;"></icos-dashboard>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { utils } from "../../intelligentMonitoring/public/utils";
import IcosDashboard from "../../intelligentMonitoring/public/components/IcosDashboard";

export default {
  name: 'CPUTrend',
  components: {
    IcosDashboard
  },
  data() {
    let predictionModels = ['Holt_Winters', 'ARIMA', 'STL'];
    return {
      smape: '',
      isCN: Vue.config.lang == "zh-cn",
      duration: '12h',
      predictionModel: predictionModels[0],
      predictionModels: predictionModels,
      predictionModels_: JSON.parse(JSON.stringify(predictionModels)),
      dashboardOption: $.extend(
        true,
        JSON.parse(JSON.stringify(utils.echartsOption)),
        {
          percent: 85,
          title: {
            text: ""
          },
          style: 2,
          content: {
            text: '-',
            subText: Vue.t('operationAnalysis.PREDICT_LEFT_TIME')
          }
        }
      ),
      loadingOpts: utils.loadingOpts,
      chart: {
        loading: false,
        option: {
          title: {
            left: "center",
            top: "middle"
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            type: 'scroll',
            top: 0,
            right: 20,
            data: [{
              name: Vue.t('operationAnalysis.PREDICT_TREND_VALUE')
            }, {
              name: Vue.t('operationAnalysis.PREDICT_RAW_VALUE')
            }]
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            data: [],
            axisLabel: {
              rotate: 30,
              formatter: function(val) {
                if (val) {
                  return this.formatX(val)
                }
              }.bind(this)
            }
          },
          yAxis: [{
            type: 'value',
            name: `${Vue.t('base.utilization')} (%)`
          }],
          grid: {
            left: 45,
            right: 0
          },
          series: []
        }
      },
      restTimeLoading: false
    }
  },
  watch: {
  },
  created() {
    this.chart.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.chart.option
    );
  },
  mounted() {
    this.chart.loading = true;
    this.changePredictionModels();
    this.loadData();
  },
  methods: {
    predictSeasonPeriodChange(v) {
      this.changePredictionModels(v);
      this.loadChartData();
    },
    changePredictionModels(v) {
      if (v !== '96h') {
        this.predictionModels = [this.predictionModels_[0], this.predictionModels_[2]]
      } else {
        this.predictionModels = this.predictionModels_;
      }
    },
    async loadChartData() {
      const $this = this;
      $this.chart.loading = true;
      const res = await $this.$ajax({
        type: 'get',
        url: `api/earth/ntd/tp/cluster_trend?return_type=json&type=cpu&revolution=${$this.duration}&model=${this.predictionModel.toLowerCase()}`
      });
      this.smape = res.smape ? res.smape + ' %' : '-';
      $this.chart.option.series = [];
      // $this.chart.option.xAxis.data = [];
      $this.$refs.chart.clear();
      if (res && !res.error) {
        $this.chart.option.title.text = '';
        let trendArr = res.trend || [];
        let rawArr = res.raw || [];
        let labelObj = res.label || {};
        let xData = [];
        let rawData = [];
        let trendData = [];
        $this.chart.option.series = [];
        const startTime = moment.utc(labelObj.start).local();
        const endTime = moment.utc(labelObj.end).local();
        const currentTime = moment(startTime);

        // do {
        //   xData.push(currentTime.format('YYYY-MM-DD HH:mm'));
        //   currentTime.add(labelObj.interval, 'm');
        // } while (currentTime.isBetween(startTime, endTime) || currentTime.isSame(startTime) || currentTime.isSame(endTime))
        // $this.chart.option.xAxis.axisLabel.interval = Math.ceil(xData.length / 30);
        trendArr.forEach((item, index) => {
          const t = moment.utc(item.time).local();
          item.time = t.format('YYYY-MM-DD HH:mm');
          if (item.value&&item.value!=null) {
            // trendData.push(item.value.toFixed(2));
            trendData.push([new Date(item.time).getTime(), item.value]);
          } else {
            trendData.push(null);
          }
        });
        // raw = raw.map((item, index) => {
        //   return [new Date(item.time).getTime(), item.value];
        // });
        rawArr.forEach((item, index) => {
          const t = moment.utc(item.time).local();
          item.time = t.format('YYYY-MM-DD HH:mm');
          rawData.push([new Date(item.time).getTime(), item.value]);
        });
        $this.chart.option.series.push({
          name: Vue.t('operationAnalysis.PREDICT_TREND_VALUE'),
          data: trendData,
          smooth: true,
          type: 'line',
          connectNulls: false,
          showSymbol: false
        });
        $this.chart.option.series.push({
          name: Vue.t('operationAnalysis.PREDICT_RAW_VALUE'),
          data: rawData,
          smooth: true,
          type: 'line',
          connectNulls: false,
          showSymbol: false
        });
        // $this.chart.option.xAxis.data = xData;
      } else {
        $this.chart.option.title.text = Vue.t('operationAnalysis.PREDICT_DATA_NOT_ENOUGH');
        // const xData = [];
        // const now = moment();
        // const durationNum = parseInt($this.duration);
        // const durationUnit = $this.duration.replace(durationNum+'', '');
        // const startTime = moment().subtract(durationNum, durationUnit);
        // const endTime = moment().add(durationNum, durationUnit);
        // let cursorTime = moment(startTime);
        // cursorTime.seconds(0);
        // do {
        //   if (cursorTime.minute() % 15 === 0) {
        //     xData.push(cursorTime.format('YYYY-MM-DD HH:mm:ss'));
        //   }
        //   cursorTime.add(1, 'minutes');
        // } while (cursorTime.isBefore(endTime) || cursorTime.isSame(endTime));
        // $this.chart.option.xAxis.axisLabel.interval = Math.ceil(xData.length / 30);
        // $this.chart.option.xAxis.data = xData;
      }
      $this.chart.loading = false;
      await $this.saveDuration();
    },
    async loadRestTime() {
      const $this = this;
      if (!/^[0-9]+$/.test($this.dashboardOption.percent + '')) {
        $this.$message.error(Vue.t('operationAnalysis.PREDICT_INVALID_VALUE'));
      } else {
        const threshold = parseInt($this.dashboardOption.percent);
        if (threshold > 100 || threshold < 1) {
          $this.$message.error(Vue.t('operationAnalysis.PREDICT_INVALID_VALUE'));
        } else {
          $this.restTimeLoading = true;
          const res = await $this.$ajax({
            type: 'get',
            url: `api/earth/ntd/tp/cluster_predict?return_type=json&type=cpu&revolution=${$this.duration}&threshold=${$this.dashboardOption.percent}&model=${this.predictionModel.toLowerCase()}`
          })
          $this.dashboardOption.content.text = '-'
          if (res && res.hasOwnProperty('avalible')) {
            $this.dashboardOption.content.text = res.avalible;
            if ($this.dashboardOption.content.text >= 180) {
              $this.dashboardOption.content.text = '180+';
            }
            $this.dashboardOption.content.text += Vue.t('operationAnalysis.PREDICT_DAYS');
          }
          $this.restTimeLoading = false;
        }
      }
    },
    async loadData() {
      const $this = this;
      await $this.loadChartData();
      await $this.loadRestTime();
    },
    async saveDuration() {
      const $this = this;
      const res = await $this.$ajax({
        type: 'post',
        url: `api/pluto/v1/monitor/system/status`,
        data: JSON.stringify({
          'name': 'revolution_cpu',
          'val': $this.duration
        })
      })
    },
    formatX(str) {
      return moment(str).format('MM-DD HH:mm');
    }
  }
}
</script>

<style scoped>
</style>
