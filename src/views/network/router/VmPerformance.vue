<template>
  <div>
    <el-collapse v-model="activeNames">
      <el-collapse-item :title="$t('base.performanceIndex')" name="1" style="text-align: left;">
        <profile :model="profileData"/>
      </el-collapse-item>
      <el-collapse-item :title="$t('base.performanceCurve')+'('+timeSelectData.timeTitle+')'" name="2" style="text-align: left;">
        <icos-chart-time-select
            ref="timeSelect"
            :lastHalfHour="0"
            :last24Hour="1"
            :realTimeInterval="30*60*1000"
            :setTimeoutDelay="1000*60"
            @handler="timeSelectHandler"
          ></icos-chart-time-select>
        <el-row>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts style="width:418px;height: 200px;" ref="chart0" :option="chartDatas[0].option"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{chartDatas[0].title}}</div>
          </el-col>
           <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts style="width:418px;height: 200px;" ref="chart1" :option="chartDatas[1].option"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{chartDatas[1].title}}</div>
          </el-col>
        </el-row>
       <el-row>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts style="width:418px;height: 200px;" ref="chart2" :option="chartDatas[2].option"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{chartDatas[2].title}}</div>
          </el-col>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts style="width:418px;height: 200px;" ref="chart3" :option="chartDatas[3].option"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{chartDatas[3].title}}</div>
          </el-col>
        </el-row>
        
       <el-row>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts style="width:418px;height: 200px;" ref="chart4" :option="chartDatas[4].option"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{chartDatas[4].title}}</div>
          </el-col>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts style="width:418px;height: 200px;" ref="chart5" :option="chartDatas[5].option"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{chartDatas[5].title}}</div>
          </el-col>
        </el-row>
        
       <el-row>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts style="width:418px;height: 200px;" ref="chart6" :option="chartDatas[6].option"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{chartDatas[6].title}}</div>
          </el-col>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts style="width:418px;height: 200px;" ref="chart7" :option="chartDatas[7].option"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{chartDatas[7].title}}</div>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import profile from '../../intelligentMonitoring/resourceMonitor/common/Profile.vue';
import IcosChartTimeSelect from "../../intelligentMonitoring/public/components/IcosChartTimeSelect.vue";
import { utils } from "../../intelligentMonitoring/public/utils";

export default {
  name: 'VmPerformance',
  components: { profile, IcosChartTimeSelect },
  props:['router_id', 'port_id'],
  watch: {
    router_id: {
      handler: function() {
        this.getData();
      }
    },
    port_id: {
      handler: function() {
        this.getData();
      }
    }
  },
  data() {
    const isCN = Vue.config.lang == "zh-cn";
    let inText = isCN ? '接收' : 'in';
    let outText = isCN ? '发送' : 'out';
    let countText = isCN ? '个' : 'count';
    let chartDatas = [
      {
        request: {
          alias_fields: ["ex_rx_bytes_rate", "ex_tx_bytes_rate"],
          fields: ["non_negative_derivative(mean(ex_rx_bytes), 1s)/1024/1024", "non_negative_derivative(mean(ex_tx_bytes),1s)/1024/1024"],
          name: "router_rt_bytes",
          table: "router_port_info"
        },
        response: {},
        option: {},
        legend: [inText, outText],
        title: isCN ? '接收/发送字节数速率（MB/s）' : 'in/out bytes rate(MB/s)'
      },
      {
        request: {
          alias_fields: ["ex_rx_dropped_rate", "ex_tx_dropped_rate"],
          fields: ["non_negative_derivative(mean(ex_rx_dropped), 1s)", "non_negative_derivative(mean(ex_tx_dropped),1s)"],
          name: "router_rt_dropped",
          table: "router_port_info"
        },
        response: {},
        option: {},
        legend: [inText, outText],
        title: isCN ? '接收/发送数据包系统丢弃个数速率（个/s）' : 'in/out dropped rate(' + countText +'/s)'
      },
      {
        request: {
          alias_fields: ["ex_rx_frame_rate"],
          fields: ["non_negative_derivative(mean(ex_rx_frame), 1s)"],
          name: "ex_rx_frame",
          table: "router_port_info"
        },
        response: {},
        option: {},
        legend: [inText],
        title: isCN ? '接收数据帧错误数速率（个/s）' : 'in frame rate(' + countText +'/s)'
      },
      {
        request: {
          alias_fields: ["ex_rx_overruns_rate", "ex_tx_overruns_rate"],
          fields: ["non_negative_derivative(mean(ex_rx_overruns), 1s)", "non_negative_derivative(mean(ex_tx_overruns),1s)"],
          name: "router_rt_overruns",
          table: "router_port_info"
        },
        response: {},
        option: {},
        legend: [inText, outText],
        title: isCN ? '接收/发送数据包网卡丢弃个数速率（个/s）' : 'in/out overruns rate(' + countText +'/s)'
      },
      {
        request: {
          alias_fields: ["ex_rx_packets_rate", "ex_tx_packets_rate"],
          fields: ["non_negative_derivative(mean(ex_rx_packets), 1s)", "non_negative_derivative(mean(ex_tx_packets),1s)"],
          name: "router_rt_packets",
          table: "router_port_info"
        },
        response: {},
        option: {},
        legend: [inText, outText],
        title: isCN ? '接收/发送数据包个数速率（个/s）' : 'in/out packets rate(' + countText +'/s)'
      },
      {
        request: {
          alias_fields: ["ex_tx_carrier_rate"],
          fields: ["non_negative_derivative(mean(ex_tx_carrier), 1s)"],
          name: "ex_tx_carrier",
          table: "router_port_info"
        },
        response: {},
        option: {},
        legend: [outText],
        title: isCN ? '发送数据包碰撞错误数速率（个/s）' : 'out carrier rate(' + countText +'/s)'
      },
      {
        request: {
          alias_fields: ["ex_tx_collisions_rate"],
          fields: ["non_negative_derivative(mean(ex_tx_collisions), 1s)"],
          name: "ex_tx_collisions",
          table: "router_port_info"
        },
        response: {},
        option: {},
        legend: [outText],
        title: isCN ? '发送数据包冲突个数速率（个/s）' : 'out collisions rate(' + countText +'/s)'
      },
      {
        request: {
          alias_fields: ["ex_rx_errors_rate", "ex_tx_errors_rate"],
          fields: ["non_negative_derivative(mean(ex_rx_errors), 1s)", "non_negative_derivative(mean(ex_tx_errors),1s)"],
          name: "router_rt_errors",
          table: "router_port_info"
        },
        response: {},
        option: {},
        legend: [inText, outText],
        title: isCN ? '接收/发送数据包错误个数速率（个/s）' : 'in/out errors rate'
      }
    ];

    return {
      isCN: isCN,
      countText: countText,
      profileData: [
        //初始化先赋予这些值，是为了让vue先渲染出来一些内容，要不然等接口返回数据再渲染，就会出现元素在一开始的时候没有高度，影响用户体验
        { name: isCN ? '接收数据字节速率' : 'received data byte rate', value: "" },
        { name: isCN ? '接收数据包系统丢弃个数速率' : 'the rate of the number of lost packets in the receiving packet system', value: "" },
        { name: isCN ? '接收数据包错误个数速率' : 'number of received packets error rate', value: "" },
        { name: isCN ? '接收数据帧错误数速率' : 'received data frame error rate', value: "" },
        { name: isCN ? '接收数据包网卡丢弃个数速率' : 'rate of network cards lost in received packets', value: "" },
        { name: isCN ? '接收数据包个数速率' : 'number rate of received packets', value: "" },
        { name: isCN ? '发送数据字节数速率' : 'rate of data bytes sent', value: "" },
        { name: isCN ? '发送数据包碰撞错误数速率' : 'number and rate of collision errors in sending packets', value: "" },
        { name: isCN ? '发送数据包冲突个数速率' : 'the rate of sending packet conflicts', value: "" },
        { name: isCN ? '发送数据包系统丢弃个数速率' : 'rate of lost packets in sending system', value: "" },
        { name: isCN ? '发送数据包错误个数速率' : 'rate of sending packet errors', value: "" },
        { name: isCN ? '发送数据包网卡丢弃个数速率' : 'rate of network cards lost in sending packets', value: "" },
        { name: isCN ? '发送数据包个数速率' : 'rate of sending packets', value: "" }
      ],
      chartDatas,
      activeNames:['1', '2'],
      timeSelectData: {
        endTime: '',
        isHistory: '',
        startTime: '',
        timeTitle: ''
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
    }
  },
  mounted() {
    this.option = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option
    );
    this.chartDatas.forEach(v => {
      v.option = $.extend(
        true,
        JSON.parse(JSON.stringify(utils.echartsOption)),
        this.option,
        {}
      );
    });

    this.$refs.timeSelect.query({ type: Vue.t("base.last24Hour") });

    this.getData();
  },
  beforeDestroy() {
    clearTimeout(this.setTimeoutID)
  },
  methods: {
    getData() {
      this.getProfileData();
      this.getChartData();

      clearTimeout(this.setTimeoutID);
      this.setTimeoutID = setTimeout(() => {
        this.getData();
      }, 8000);
    },
    timeSelectHandler(v) {
      this.timeSelectData = { ...v };
      this.getChartData();
    },
    async getProfileData() {
      clearTimeout(this.setTimeoutID);
      let r = await this.$ajax({
        type: 'post',
        url: "api/pluto/v1/monitor/router/info",
        data: JSON.stringify({
          routerid: this.router_id,
          portid: this.port_id
        })
      })
      let a = this.profileData;
      let i = 0;
      a[i++].value = [r.ex_rx_bytes_rate, 'MB/s'];
      a[i++].value = [r.ex_rx_droppped_rate, `${this.countText}/s`];
      a[i++].value = [r.ex_rx_errors_rate, `${this.countText}/s`];
      a[i++].value = [r.ex_rx_frame_rate, `${this.countText}/s`];
      a[i++].value = [r.ex_rx_overruns_rate, `${this.countText}/s`];
      a[i++].value = [r.ex_rx_packets_rate, `${this.countText}/s`];
      a[i++].value = [r.ex_tx_bytes_rate, 'MB/s'];
      a[i++].value = [r.ex_tx_carrier_rate, `${this.countText}/s`];
      a[i++].value = [r.ex_tx_collisions_rate, `${this.countText}/s`];
      a[i++].value = [r.ex_tx_dropped_rate, `${this.countText}/s`];
      a[i++].value = [r.ex_tx_errors_rate, `${this.countText}/s`];
      a[i++].value = [r.ex_tx_overruns_rate, `${this.countText}/s`];
      a[i++].value = [r.ex_tx_packets_rate, `${this.countText}/s`];
      // 接收数据字节速率（Mb/s），接收数据包系统丢弃个数速率（个/s），接收数据包错误个数速率（个/s），接收数据帧错误数速率（个/s），接收数据包网卡丢弃个数速率（个/s），接收数据包个数速率（个/s），发送数据字节数速率（MB/s），发送数据包碰撞错误数速率（个/s），发送数据包冲突个数速率（个/s），发送数据包系统丢弃个数速率（个/s），发送数据包错误个数速率（个/s），发送数据包网卡丢弃个数速率（个/s），发送数据包个数速率（个/s）
      // ex_rx_bytes_rate: 0.00013262430826822916
      // ex_rx_droppped_rate: 0
      // ex_rx_errors_rate: 0
      // ex_rx_frame_rate: 0
      // ex_rx_overruns_rate: 0
      // ex_rx_packets_rate: 3.4766666666666666
      // ex_tx_bytes_rate: 0
      // ex_tx_carrier_rate: 0
      // ex_tx_collisions_rate: 0
      // ex_tx_dropped_rate: 0
      // ex_tx_errors_rate: 0
      // ex_tx_overruns_rate: 0
      // ex_tx_packets_rate: 0
    },
    async getChartData() {
      // this.clear();
      this.chartDatas.forEach(v => {
        this.getChartData_(v);
      })
    },
    // clear() {
    //   this.$refs.chart0 && this.$refs.chart0.clear();
    //   this.$refs.chart1 && this.$refs.chart1.clear();
    //   this.$refs.chart2 && this.$refs.chart2.clear();
    //   this.$refs.chart3 && this.$refs.chart3.clear();
    //   this.$refs.chart4 && this.$refs.chart4.clear();
    //   this.$refs.chart5 && this.$refs.chart5.clear();
    //   this.$refs.chart6 && this.$refs.chart6.clear();
    //   this.$refs.chart7 && this.$refs.chart7.clear();
    // },
    async getChartData_(v) {
      let request = v.request || {};
      let response = v.response || {};
      let legend = v.legend || [];
      let option = v.option || {};
      let d = await this.$ajax({
        type: 'post',
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            alias_fields: request.alias_fields,
            fields: request.fields,
            filters: [
              {
                field: "routerid",
                operate: "=",
                value: this.router_id
              },
              {
                field: "portid",
                operate: "=",
                value: this.port_id
              },
              {
                field: "start_time",
                operate: ">=",
                value: this.timeSelectData.startTime
              },
              {
                field: "end_time",
                operate: "<",
                value: this.timeSelectData.endTime
              }
            ],
            is_history: this.timeSelectData.isHistory,
            is_list: "1",
            name: request.name,
            table: request.table
          }
        })
      });

      let data = d[request.name] || [];
      let x = [];
      let y1 = [];
      let y2 = [];
      option.series = [];
      option.xAxis.axisLabel.formatter = this.timeSelectData.xAxisLabelFormatter;
      // option.title.text = `${this.title}(${this.timeSelectData.timeTitle})`;
      data.forEach((v, i) => {
        x.push(utils.xAxisDataFormatter(v.time));
        y1.push(v[request.alias_fields[0]] != null ? v[request.alias_fields[0]].toFixed(2) : null);
        y2.push(v[request.alias_fields[1]] != null ? v[request.alias_fields[1]].toFixed(2) : null);
      });
      option.xAxis.data = x;
      option.series.push({
        name: legend[0],
        data: y1,
        smooth: false,
        type: "line",
        // areaStyle:{
        //   normal:{
        //     color:'#ffbfa6'
        //   }
        // }
        connectNulls: true
      });
      option.yAxis[0] = {
        type: "value",
        name: legend[0]
      };

      if (request.alias_fields[1]) {
        option.series.push({
          name: legend[1],
          data: y2,
          smooth: false,
          type: "line",
          connectNulls: true
        });
        option.yAxis[1] = {
          type: "value",
          name: legend[1]
        };
      }

      option.legend = {
        selected: (v => {
          let o = {};
          legend.forEach(v => {
            o[v] = true;
          });
          return o;
        })(),
        data: (function() {
          let arr = [...legend];
          return arr.map(item => {
            return {
              name: item,
              icon: utils.echartsOption.legend.icon
            };
          });
        })()
      }
    }
  }
}
</script>
