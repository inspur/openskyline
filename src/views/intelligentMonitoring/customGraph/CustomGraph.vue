<template>
  <div class="custom-graph">
    <icos-page-header :title="$t('monitor.CUSTOM_GRAPH')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <el-form inline ref="form" v-loading="loadingForm" :rules="rules" :model="formParam" class="module-background-color module-padding isolation-belt header">
      <el-form-item :label="$t('monitor.CUSTOM_GRAPH_RESOURCE_TYPE')" prop="resourceType">
        <el-select v-model="formParam.resourceType" @change="handleResourceTypeChange">
          <el-option
            v-for="resourceType in resourceTypes"
            :key="resourceType.id"
            :label="resourceType.name"
            :value="resourceType.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('monitor.CUSTOM_GRAPH_HOST')" prop="hostId">
        <el-select v-model="formParam.hostId" @change="handleHostChange" filterable>
          <el-option v-for="(host, index) in hosts" :key="index" :label="host" :value="host" />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('monitor.CUSTOM_GRAPH_INSTANCE')" prop="instanceId">
        <el-select v-model="formParam.instanceId" @change="handleInstanceChange" filterable>
          <el-option
            v-for="(instance, index) in instances"
            :key="index"
            :label="instance.name"
            :value="instance.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('monitor.CUSTOM_GRAPH_METRICS')" prop="metricId">
        <el-select v-model="formParam.metricId" @change="handleMetricChange" filterable>
          <el-option
            v-for="(metric, index) in metrics"
            :key="index"
            :label="metric.name"
            :value="metric.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        class="custom-graph-sub-metrics"
        :label="$t('monitor.CUSTOM_GRAPH_SUB_METRICS')"
        prop="subMetricId"
      >
        <el-select
          :no-data-text="$t('monitor.CUSTOM_GRAPH_NO_DATA')"
          :disabled="!hasSubMetrics"
          v-model="formParam.subMetricId"
          filterable
        >
          <el-option
            v-for="(subMetric, index) in subMetrics"
            :key="index"
            :label="subMetric"
            :value="subMetric"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('monitor.CUSTOM_GRAPH_TIME')" class="custom-graph-time" prop="time">
        <el-date-picker
          v-model="formParam.time"
          type="datetimerange"
          :picker-options="pickerOptions"
          :clearable="false"
          range-separator="  -  "
          popper-class="test"
        />
      </el-form-item>

      <el-form-item>
        <el-tooltip placement="top">
          <div slot="content" v-if="isCN">自定义查询包含24小时内删除的资源的相关数据，删除超过24小时的资源，其数据不被查询<br/>自定义查询不对数据进行处理，展示所有采集数据，与智能监控页面逻辑不同</div>
          <div slot="content"  v-else>This advanced custom query contains the relevant data of resources deleted within 24 hours. Resources deleted for more than 24 hours will not be queried<br/>The user-defined query does not process the data and displays all the collected data,which is different from the logic of only monitoring the page</div>
          <i class="el-tooltip el-icon-fa">&#xF059</i>
        </el-tooltip>
      </el-form-item>

      <el-form-item class="custom-graph-query">
        <el-button
          type="primary"
          size="small"
          :loading="loadingData"
          @click="loadData()"
        >{{ $t('monitor.CUSTOM_GRAPH_QUERY') }}</el-button>
      </el-form-item>
    </el-form>

    <div class="charts module-background-color module-padding body" style="height: 350px;">
        <IEcharts
        ref="chart"
        :option="option"
        :loading="loading"
        :loadingOpts="loadingOpts"
        :resizable="true"
      />
      <div v-if="metricInfo" class="metric-info">{{metricInfo}}</div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { utils } from "../public/utils";

export default {
  name: "CustomGraph",
  data() {
    return {
      isCN: Vue.config.lang == "zh-cn",
      loading: false,
      loadingOpts: utils.loadingOpts,
      resourceTypes: [],
      hosts: [],
      instances: [],
      metrics: [],
      subMetrics: [],
      hasSubMetrics: false,
      metricUnit: "",
      metricName: "",
      formParam: {
        resourceType: "",
        hostId: "",
        instanceId: "",
        metricId: "",
        subMetricId: "",
        time: [new Date(), new Date()],
        onPickDates: []
      },
      option: {
        title: {
          text: "",
          left: "center",
          top: "30%"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          }
        },
        legend: {
          type: "scroll",
          left: 0,
          right: 0,
          top: 0,
          data: [
            {
              name: Vue.t("monitor.CUSTOM_GRAPH_VALUE"),
              icon: "none"
            }
          ]
        },
        xAxis: {
          type: "time",
          boundaryGap: false,
          data: [],
          axisLabel: {
            rotate: 30,
            formatter: function(val) {
              if (val) {
                return this.formatX(val);
              }
            }.bind(this)
          },
          axisPointer: {
            label: {
              formatter(params) {
                return `${moment(params.value).format("YYYY-MM-DD HH:mm")}`;
              }
            }
          },
          splitLine: {
            show: false,
            lineStyle: {
              type: "dashed"
            }
          },
          splitNumber: 30,
          minInterval: 60 * 1000,
          maxInterval: 3600 * 24 * 1000
        },
        yAxis: [{
          type: "value",
          name: ""
        }],
        grid: {
          bottom: 50,
          left: 70,
          containLabel: true
        },
        series: [],
        dataZoom: [
          {
            type: "slider",
            show: false,
            start: 0,
            end: 100,
            handleSize: 8,
            xAxisIndex: [0],
            height: "20px",
            filterMode: "filter",
            maxSpan: 100,
            minSpan: 20,
            bottom: "0%"
          },
          {
            type: "slider",
            show: false,
            filterMode: "empty",
            width: 12,
            height: "70%",
            start: 0,
            end: 100,
            showDataShadow: false,
            left: "93%",
            handleSize: 8,
            yAxisIndex: 0
          },
          {
            type: "inside",
            start: 0,
            end: 100
          }
        ]
      },
      pickerOptions: {
        onPick: t => {
          //使用箭頭函數，爲了能引用到this
          let min = t.minDate && t.minDate.getTime();
          let max = t.maxDate && t.maxDate.getTime();
          this.formParam.onPickDates[0] = min;
          this.formParam.onPickDates[1] = max;
        },
        disabledDate: time => {
          let pt = this.formParam.onPickDates[0];
          let r = 30 * 24 * 60 * 60 * 1000;
          let t = time.getTime();
          if (pt + r < t) {
            return true;
          }
          return false;
        },
        shortcuts: [
          {
            text: Vue.t("monitor.CUSTOM_GRAPH_TIME_LATEST_HOUR"),
            onClick(picker) {
              const start = new Date();
              const end = new Date();
              start.setTime(start.getTime() - 3600 * 1000);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: Vue.t("monitor.CUSTOM_GRAPH_TIME_LATEST_DAY"),
            onClick(picker) {
              const start = new Date();
              const end = new Date();
              start.setTime(start.getTime() - 3600 * 24 * 1000);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: Vue.t("monitor.CUSTOM_GRAPH_TIME_LATEST_WEEK"),
            onClick(picker) {
              const start = new Date();
              const end = new Date();
              start.setTime(start.getTime() - 3600 * 24 * 7 * 1000);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: Vue.t("monitor.CUSTOM_GRAPH_TIME_LATEST_MONTH"),
            onClick(picker) {
              const start = new Date();
              const end = new Date();
              start.setTime(start.getTime() - 3600 * 24 * 30 * 1000);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      rules: {
        resourceType: [
          {
            required: true,
            message: Vue.t(
              "monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_RESOURCE_TYPE"
            )
          }
        ],
        hostId: [
          {
            required: true,
            message: Vue.t("monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_HOST")
          }
        ],
        instanceId: [
          {
            required: true,
            message: Vue.t("monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_INSTANCE")
          }
        ],
        metricId: [
          {
            required: true,
            message: Vue.t("monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_METRICS")
          }
        ],
        subMetricId: [
          {
            validator: (rule, value, callback) => {
              if (this.hasSubMetrics && value === "") {
                callback(
                  new Error(
                    Vue.t("monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_SUB_METRICS")
                  )
                );
              } else {
                callback();
              }
            },
            trigger: "change"
          }
        ],
        time: [
          {
            required: true,
            message: Vue.t("monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_TIME")
          },
          {
            validator: (rule, value, callback) => {
              const startTime = moment(value[0])
                .utc()
                .unix();
              const endTime = moment(value[1])
                .utc()
                .unix();
              const now = moment()
                .utc()
                .unix();
              if (startTime > now || endTime > now) {
                callback(
                  new Error(
                    Vue.t(
                      "monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_NO_TIME_FUTURE"
                    )
                  )
                );
              } else {
                callback();
              }
            }
          },
          {
            validator: (rule, value, callback) => {
              if (value[0] === null || value[1] === null) {
                callback(
                  new Error(Vue.t("monitor.CUSTOM_GRAPH_VALIDATE_MESSAGE_TIME"))
                );
              } else {
                callback();
              }
            }
          }
        ]
      },
      loadingData: false,
      loadingForm: false
    };
  },
  watch: {
    metrics(to, from) {
      if (to.length < 1) {
        this.metricInfo = '';
      }
    }
  },
  created() {
    this.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option
    );
  },
  methods: {
    async loadResourceTypes() {
      this.loadingForm = true;
      const res = await this.$ajax({
        type: "get",
        url: `api/pluto/v1/collect/class`
      });
      this.resourceTypes = res.classes;
      this.resourceTypes.forEach(item => {
        item.name = Vue.config.lang == "zh-cn" ? item.name_cn : item.name_en;
      });
      this.hosts = [];
      this.instances = [];
      this.metrics = [];
      this.subMetrics = [];
      this.formParam.resourceType = "";
      this.formParam.hostId = "";
      this.formParam.instanceId = "";
      this.formParam.metricId = "";
      this.formParam.subMetricId = "";
      this.loadingForm = false;
    },
    async loadHosts() {
      this.loadingForm = true;
      const res = await this.$ajax({
        type: "get",
        url: `api/pluto/v1/collect/host?class_id=${this.formParam.resourceType}`
      });
      this.hosts = res.hosts;

      this.instances = [];
      this.metrics = [];
      this.subMetrics = [];
      this.formParam.hostId = "";
      this.formParam.instanceId = "";
      this.formParam.metricId = "";
      this.formParam.subMetricId = "";
      this.loadingForm = false;
    },
    async loadInstances() {
      this.loadingForm = true;
      const res = await this.$ajax({
        type: "get",
        url: `api/pluto/v1/collect/instance?class_id=${this.formParam.resourceType}&host_id=${this.formParam.hostId}`
      });
      this.instances = res.instances;

      this.metrics = [];
      this.subMetrics = [];
      this.formParam.instanceId = "";
      this.formParam.metricId = "";
      this.formParam.subMetricId = "";
      this.loadingForm = false;
    },
    async loadMetrics() {
      this.loadingForm = true;
      const res = await this.$ajax({
        type: "get",
        url: `api/pluto/v1/collect/metrics?class_id=${this.formParam.resourceType}&host_id=${this.formParam.hostId}&instance_id=${this.formParam.instanceId}`
      });
      this.metrics = res.metrics;
      this.metrics.forEach(item => {
        item.name = Vue.config.lang == "zh-cn" ? item.name_cn : item.name_en;
      });
      this.subMetrics = [];
      this.formParam.metricId = "";
      this.formParam.subMetricId = "";
      this.loadingForm = false;
    },
    async loadSubMetrics() {
      this.loadingForm = true;
      const res = await this.$ajax({
        type: "get",
        url: `api/pluto/v1/collect/metrics/subs?class_id=${this.formParam.resourceType}&host_id=${this.formParam.hostId}&instance_id=${this.formParam.instanceId}&metrics_id=${this.formParam.metricId}`
      });
      this.subMetrics = res.subs;

      this.formParam.subMetricId = "";
      this.loadingForm = false;
    },
    async loadData() {
      await this.$refs.form.validate(async valid => {
        if (!valid) {
          return false;
        }
        try {
          this.loadingData = true;
          const startTime = moment(this.formParam.time[0])
            .utc()
            .unix();
          const endTime = moment(this.formParam.time[1])
            .utc()
            .unix();
          let data = {
            class_id: this.formParam.resourceType,
            host_id: this.formParam.hostId,
            instance_id: this.formParam.instanceId,
            metrics_id: this.formParam.metricId,
            subs: this.formParam.subMetricId,
            start_time: startTime,
            end_time: endTime
          };
          const res = await this.$ajax({
            type: "post",
            url: `api/pluto/v1/collect/metrics/data`,
            data: JSON.stringify(data)
          });
          this.option.xAxis.data = [];
          this.option.xAxis.min = this.formParam.time[0].getTime();
          this.option.xAxis.max = this.formParam.time[1].getTime();
          this.option.yAxis[0].name = this.metricUnit;

          this.option.legend.data[0].name = this.metricName;
          this.$refs.chart && this.$refs.chart.clear();

          let numberData = [];
          res.data.forEach((item, index) => {
            if (typeof item.res === "boolean") {
              item.res = item.res === false ? 0 : 1;
            }
            numberData.push([
              moment.utc(item.time).valueOf(),
              item.res.toFixed(2)
            ]);
            if (index === 0) {
              this.option.xAxis.min = moment.utc(item.time).toDate();
            }
            if (index === res.data.length - 1) {
              this.option.xAxis.max = moment.utc(item.time).toDate();
            }
          });

          let series = {
            name: this.metricName,
            data: numberData,
            smooth: false,
            type: "line",
            connectNulls: false,
            showSymbol: false
          };
          let type = res.type; //0是浮点，1是整型，2是布尔，3是0和1

          if (type == "2" || type == "3") {
            //两种状态不要中间值
            // this.option.yAxis[0].data = [0, 1];
            // this.option.yAxis[0].min = 0;
            // this.option.yAxis[0].max = 2;
            // this.option.splitNumber = 2;
            this.option.minInterval = 1;
          } else {
            this.option.minInterval = 0;
          }
          if (type == "1" || type === "2" || type === "3") {
            //整型和布尔型使用梯形图
            series.step = "middle";
          } else {
            series.step = false;
          }
          this.option.series = [series];
        } catch (e) {
          __DEV__ && console.log(e);
        }
        this.loadingData = false;
      });
    },
    handleResourceTypeChange() {
      this.loadHosts();
    },
    handleHostChange(hostId) {
      if (hostId !== "") {
        this.loadInstances();
      }
    },
    handleInstanceChange(instanceId) {
      if (instanceId !== "") {
        this.loadMetrics();
      }
    },
    handleMetricChange(metricId) {
      const metric = this.metrics.find(item => item.id === metricId);
      if (metric) {
        this.hasSubMetrics = metric.has_sub === "1";
        this.metricUnit = metric.unit || "";
        this.metricName = metric.name || "";
      } else {
        this.hasSubMetrics = false;
        this.metricUnit = "";
      }
      this.metricInfo = this.isCN ? metric.info_cn : metric.info_en;
      this.subMetrics = [];
      this.formParam.subMetricId = "";
      if (this.hasSubMetrics) {
        this.loadSubMetrics();
      }
      this.$nextTick(() => {
        this.$refs.form.validate();
      });
    },
    formatX(timestamp) {
      return moment
        .utc(timestamp)
        .local()
        .format("MM-DD HH:mm");
    }
  },
  mounted() {
    this.loadResourceTypes();
    const start = new Date();
    const end = new Date();
    start.setTime(start.getTime() - 3600 * 24 * 1000);
    this.formParam.time = [start, end];
    this.option.xAxis.data = [];
    this.option.xAxis.min = this.formParam.time[0].getTime();
    this.option.xAxis.max = this.formParam.time[1].getTime();
    this.$refs.chart && this.$refs.chart.clear();
  }
};
</script>

<style scoped>
.custom-graph {
}
.custom-graph >>> .el-form {
  position: relative;
}
.custom-graph >>> .el-col {
  padding-right: 20px;
  box-sizing: border-box;
}
.custom-graph >>> .el-form-item {
  padding: 10px 0;
}
.custom-graph >>> .el-select {
  width: 100%;
}
.custom-graph >>> .el-icon-caret-top::before {
  content: "\E603";
}
.custom-graph >>> .charts {
  padding-bottom: 30px;
}
.charts {
  position: relative;
}
.metric-info {
  position: absolute;
  top: 20px;
  right: 20px;
}
</style>
