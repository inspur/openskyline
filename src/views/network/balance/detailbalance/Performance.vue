<template>
  <div>
    <icos-chart-time-select
      ref="timeSelect"
      :lastHalfHour="0"
      :last24Hour="1"
      :realTimeInterval="30*60*1000"
      :setTimeoutDelay="1000*60"
      @handler="timeSelectHandler"
    ></icos-chart-time-select>
    <el-select
      v-model="amphoraID"
      @change="getChartData"
    >
      <el-option
        v-for="(v, i) in amphoraList"
        :key="i"
        :value="v.id"
        :label="v.compute_id"
      />
    </el-select>
    <el-row>
      <el-col :span="12">
        <div style="height: 200px;">
          <IEcharts style="height: 200px;" ref="chart0" :option="chartDatas[0].option" :resizable="true"></IEcharts>
        </div>
        <div style="text-align: center;line-height: 36px;">{{chartDatas[0].title}}</div>
      </el-col>
      <el-col :span="12">
        <div style="height: 200px;">
          <IEcharts style="height: 200px;" ref="chart1" :option="chartDatas[1].option" :resizable="true"></IEcharts>
        </div>
        <div style="text-align: center;line-height: 36px;">{{chartDatas[1].title}}</div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <div style="height: 200px;">
          <IEcharts style="height: 200px;" ref="chart2" :option="chartDatas[2].option" :resizable="true"></IEcharts>
        </div>
        <div style="text-align: center;line-height: 36px;">{{chartDatas[2].title}}</div>
      </el-col>
      <el-col :span="12">
        <div style="height: 200px;">
          <IEcharts style="height: 200px;" ref="chart3" :option="chartDatas[3].option" :resizable="true"></IEcharts>
        </div>
        <div style="text-align: center;line-height: 36px;">{{chartDatas[3].title}}</div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
        <div style="height: 200px;">
          <IEcharts style="height: 200px;" ref="chart4" :option="chartDatas[4].option" :resizable="true"></IEcharts>
        </div>
        <div style="text-align: center;line-height: 36px;">{{chartDatas[4].title}}</div>
      </el-col>
      <el-col :span="12">
      </el-col>
    </el-row>
  </div>
</template>
<script>
import IcosChartTimeSelect from "../../../intelligentMonitoring/public/components/IcosChartTimeSelect.vue";
import { utils } from "../../../intelligentMonitoring/public/utils";

export default {
  name: "Performance",
  components: { IcosChartTimeSelect },
  props: ["loadbalancerID", 'amphoraList'],
  watch: {
    loadbalancerID: {
      handler: function () {
        this.getListeners();
      }
    },
    amphoraList: {
      handler: function () {
        if (!this.amphoraID) {
          // this.amphoraID = (this.amphoraList.filter(v => v.role === "MASTER")[0] || {}).id || '';
          this.amphoraID = this.amphoraList[0].id || '';
        }
        this.getListeners();
      }
    }
  },
  data() {
    let chartDatas = [
      {
        request: {
          alias_fields: ["bytes_in"],
          fields: ["non_negative_derivative(mean(bytes_in), 1s)/1024/1024 as bytes_in"]
        },
        response: {},
        option: {},
        unit: 'MB/S',
        title: Vue.t("network.changeRateOfBytesReceived")
      },
      {
        request: {
          alias_fields: ["bytes_out"],
          fields: ["non_negative_derivative(mean(bytes_out), 1s)/1024/1024 as bytes_out"]
        },
        response: {},
        option: {},
        unit: 'MB/S',
        title: Vue.t("network.changeRateOfBytesSent")
      },
      {
        request: {
          alias_fields: ["total_connections"],
          fields: ["non_negative_derivative(mean(total_connections), 1s) as total_connections"]
        },
        response: {},
        option: {},
        unit: Vue.t("network.unitPerSec"),
        title: Vue.t("network.changeRateOfConnections")
      },
      {
        request: {
          alias_fields: ["request_errors"],
          fields: ["non_negative_derivative(mean(request_errors), 1s) as request_errors"]
        },
        response: {},
        option: {},
        unit: Vue.t("network.unitPerSec"),
        title: Vue.t("network.changeRateOfRequestErrors")
      },
      {
        request: {
          alias_fields: ["active_connections"],
          fields: ["last(active_connections) as active_connections"]
        },
        response: {},
        option: {},
        unit: Vue.t("network.unitNum"),
        title: Vue.t("network.numberOfConnections")
      }
    ];

    return {
      amphoraID: '',
      listeners: [],
      chartDatas,
      activeNames: ["1", "2"],
      timeSelectData: {
        endTime: "",
        isHistory: "",
        startTime: "",
        timeTitle: ""
      },
      echarts: [],
      option: {
        // legend: {
        //   selected: (v => {
        //     let o = {};
        //     legend.forEach(v => {
        //       o[v] = true;
        //     });
        //     return o;
        //   })(),
        //   data: (function() {
        //     let arr = [...legend];
        //     return arr.map(item => {
        //       return {
        //         name: item,
        //         icon: utils.echartsOption.legend.icon
        //       };
        //     });
        //   })()
        // },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [],
          axisLabel: {
            formatter: utils.formatterDate.bind(utils)
          }
        },
        yAxis: [],
        series: []
      }
    };
  },
  mounted() {
    this.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option
    );
    this.chartDatas.forEach((v) => {
      v.option = $.extend(
        true,
        JSON.parse(JSON.stringify(utils.echartsOption)),
        this.option,
        {}
      );
    });

    this.$refs.timeSelect.query({ type: Vue.t("base.last24Hour") });

    this.getListeners();
  },
  beforeDestroy() {
    clearTimeout(this.setTimeoutID);
  },
  methods: {
    getData() {
      this.getChartData();

      // clearTimeout(this.setTimeoutID);
      // this.setTimeoutID = setTimeout(() => {
      //   this.getData();
      // }, 8000);
    },
    timeSelectHandler(v) {
      this.timeSelectData = { ...v };
      this.$emit("refershPerformance", "true");
      this.getChartData();
    },
    async getListeners(v) {
      if (!this.loadbalancerID) {
        return;
      }
      let r = await this.$ajax({
        type: "get",
        url: "api/octavia/v2.0/lbaas/listeners?loadbalancer_id=" + this.loadbalancerID
      });
      this.listeners = r.listeners || [];
      this.getData();
    },
    async getChartData() {
      // this.clear();
      this.chartDatas.forEach((v) => {
        this.getChartData_(v);
      });
    },
    // clear() {
    //   this.$refs.chart0 && this.$refs.chart0.clear();
    //   this.$refs.chart1 && this.$refs.chart1.clear();
    //   this.$refs.chart2 && this.$refs.chart2.clear();
    //   this.$refs.chart3 && this.$refs.chart3.clear();
    //   this.$refs.chart4 && this.$refs.chart4.clear();
    // },
    async getChartData_(v) {
      if (this.amphoraList.length > 1 && !this.amphoraID) {
        // this.amphoraID = (this.amphoraList.filter(v => v.role === "MASTER")[0] || {}).id || '';
        this.amphoraID = this.amphoraList[0].id || '';
      }

      if (!this.amphoraID || !this.loadbalancerID) {
        return;
      }

      let request = v.request || {};
      let response = v.response || {};
      let option = v.option || {};
      let unit = v.unit || '';
      let d = await this.$ajax({
        type: "post",
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            alias_fields: request.alias_fields,
            fields: request.fields,
            filters: [
              {
                field: "start_time",
                operate: ">=",
                value: this.timeSelectData.startTime
              },
              {
                field: "end_time",
                operate: "<",
                value: this.timeSelectData.endTime
              },
              {
                field: "loadbalancer_id",
                operate: "=",
                value: this.loadbalancerID
              },
              {
                field: "amphora_id",
                operate: "=",
                value: this.amphoraID
              }
            ],
            group: "listener_id",
            is_history: this.timeSelectData.isHistory,
            is_list: "1",
            name: "openstack_loadbalance",
            table: "openstack_loadbalance"
          }
        })
      });
      let data = d.openstack_loadbalance || {};

      option.xAxis.data = [];
      option.series = [];
      option.xAxis.axisLabel.formatter = this.timeSelectData.xAxisLabelFormatter;
      let legend = [];
      let keys = Object.keys(data);
      keys.forEach(v => {
        let a = data[v];
        let l = this.listeners.filter(v_ => v_.id === v)[0] || {};
        legend.push(l.name);
        let seriesData = [];
        a.forEach((v, i) => {
         if (!option.xAxis.data.locked) {
            option.xAxis.data.push(utils.xAxisDataFormatter(v.time));
          }
          let value = v[request.alias_fields[0]];
          seriesData.push((+value).toFixed(2));
        });
        option.xAxis.data.locked = true;
        option.series.push({
          name: l.name,
          data: seriesData,
          smooth: false,
          type: "line",
          // areaStyle:{
          //   normal:{
          //     color:'#ffbfa6'
          //   }
          // }
          connectNulls: true
        });
      });

      if (keys.length < 1) {
        option.title.show = true;
        option.title.text = this.$t('opt.noData');
        option.title.top = 'middle';
        option.title.left = 'center';
      } else {
        option.title.show = false;
      }
      option.yAxis[0] = {
        type: "value",
        name: unit
      };

      option.legend = {
        selected: ((v) => {
          let o = {};
          legend.forEach((v) => {
            o[v] = true;
          });
          return o;
        })(),
        data: (function () {
          let arr = [...legend];
          return arr.map((item) => {
            return {
              name: item,
              icon: utils.echartsOption.legend.icon
            };
          });
        })()
      };
    }
  }
};
</script>
