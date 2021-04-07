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

        <el-form-item class="nova-disk">{{ $t('operationAnalysis.PREDICT_DISK_TOTAL_CAPACITY') }} {{ novaDisk }} GB</el-form-item>
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
import moment from 'moment';
import { utils } from "../../intelligentMonitoring/public/utils";
import IcosDashboard from "../../intelligentMonitoring/public/components/IcosDashboard";
export default {
  name: 'DiskTrend',
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
      novaDisk: '', //总磁盘容量
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
            name: `${Vue.t('operationAnalysis.PREDICT_DISK_USAGE')} (GB)`
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
  created() {
    this.chart.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.chart.option
    );
  },
  mounted() {
    this.changePredictionModels();

    this.chart.loading = true;
    this.loadInfo().then(v => {
      this.loadData();
    });
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
        url: `api/earth/ntd/tp/cluster_trend?return_type=json&type=disk&revolution=${$this.duration}&model=${this.predictionModel.toLowerCase()}`
      })
      this.smape = res.smape ? res.smape + ' %' : '-';
      $this.chart.option.series = [];
      $this.chart.option.xAxis.data = [];
      if ($this.$refs.chart && $this.$refs.chart.clear) {
        $this.$refs.chart.clear();
      }
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
        $this.chart.option.xAxis.axisLabel.interval = Math.ceil(xData.length / 30);
        trendArr.forEach((item, index) => {
          const t = moment.utc(item.time).local();
          item.time = t.format('YYYY-MM-DD HH:mm');
          if (item.value&&item.value!=null) {
            trendData.push([new Date(item.time).getTime(), item.value]);
          } else {
            trendData.push(null);
          }
        });
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
            url: `api/earth/ntd/tp/cluster_predict?return_type=json&type=disk&revolution=${$this.duration}&threshold=${$this.dashboardOption.percent}&model=${this.predictionModel.toLowerCase()}`
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
    async loadInfo() {
      const $this = this;
      const res = await $this.$ajax({
        type: 'get',
        url: `api/pluto/v1/monitor/trend/system/status`
      }) || {};
      // $this.duration = res.revolution_disk || '24h';
      $this.novaDisk = res.nova_disk || '0';
    },
    async saveDuration() {
      const $this = this;
      const res = await $this.$ajax({
        type: 'post',
        url: `api/pluto/v1/monitor/system/status`,
        data: JSON.stringify({
          'name': 'revolution_disk',
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
.margin-top-5 {
  margin-top: 5px;
}
.nova-disk {
  float: right;
  margin-right: 45px;
}
</style>
