<template>
  <div class="pool-chart">
    <IEcharts
      ref="rateChart"
      style="height:50%;"
      :option="rateOption"
      :loading="rateLoading"
      :loadingOpts="loadingOpts"
      :resizable="true"
      @legendselectchanged="onlegendselectchangedrate"
    ></IEcharts>
    <IEcharts
      ref="useChart"
      style="height:50%;"
      :option="useOption"
      :loading="useLoading"
      :loadingOpts="loadingOpts"
      :resizable="true"
      @legendselectchanged="onlegendselectchangeduse"
    ></IEcharts>

    <el-select v-model="nodeValue" size="small" filterable @change="getChart" class="chart-select">
      <template v-for="item in list">
        <el-option :label="item" :value="item" :key="item"></el-option>
      </template>
    </el-select>
  </div>
</template>
<script>
import { utils } from "../../../public/utils";

export default {
  props: [],
  data() {
    let legendrate = [
      Vue.t("monitor.readRate"),
      Vue.t("monitor.writeRate"),
      Vue.t("monitor.numberReadOperation"),
      Vue.t("monitor.numberWriteOperation")
    ];
    let legenduse = [Vue.t("monitor.usedAmount")];
    let isCN = String(Vue.config.lang) === 'zh-cn';

    return {
      rateLoading: false,
      useLoading: false,
      loadingOpts: utils.loadingOpts,
      title: Vue.t("monitor.storagePoolInformation"),
      startTime: 0,
      endTime: 0,
      xAxisLabelFormatter: 0,
      isHistory: 0,
      timeTitle: "",
      name: "",
      nodeValue: "",
      list: [],
      rateOption: {
        legend: {
          selected: (v => {
            let o = {};
            legendrate.forEach(v => {
              o[v] = true;
            });
            return o;
          })(),
          data: (function() {
            let arr = [...legendrate];
            return arr.map(item => {
              return {
                name: item,
                icon: utils.echartsOption.legend.icon
              };
            });
          })()
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [],
          axisLabel: {
            formatter: utils.formatterDate.bind(utils)
          }
        },
        yAxis: [
          {
            type: "value",
            name: "KB/S"
          },
          {
            type: "value",
            name: isCN ? "个/s" : 'individual/s',
            nameLocation: "end",
            inverse: false
          }
        ],
        series: []
      },
      useOption: {
        legend: {
          selected: (v => {
            let o = {};
            legenduse.forEach(v => {
              o[v] = true;
            });
            return o;
          })(),
          data: (function() {
            let arr = [...legenduse];
            return arr.map(item => {
              return {
                name: item,
                icon: utils.echartsOption.legend.icon
              };
            });
          })()
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [],
          axisLabel: {
            formatter: utils.formatterDate.bind(utils)
          }
        },
        yAxis: [
          {
            type: "value",
            name: "GB"
          }
        ],
        series: []
      }
    };
  },
  mounted() {
    this.rateOption = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.rateOption
    );
    this.useOption = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.useOption
    );
  },
  methods: {
    getData(v = {}) {
      let me = this;
      me.startTime = v.startTime;
      me.endTime = v.endTime;
      me.xAxisLabelFormatter = v.xAxisLabelFormatter;
      me.isHistory = v.isHistory;
      me.timeTitle = v.timeTitle;
      me.name = v.name;
      me.$ajax({
        type: "post",
        url: "api/pluto/v1/monitor/search/resource/values",
        data: JSON.stringify({
          params: {
            fields: "pool_name,kb_used",
            filters: [
              {
                field: "ceph_name",
                operate: "=",
                value: me.name
              }
            ],
            table: "newceph_pool_rate"
          }
        }),
        successFun(rtn) {
          me.list = rtn.values;
          if (me.list.length > 0) {
            if (!me.nodeValue) {
              me.nodeValue = me.list[0];
            }
            me.getChart();
          } else {
            me.nodeValue = "";
          }
        }
      });
    },
    getChart() {
      let me = this;
      me.rateLoading = true;
      me.useLoading = true;
      me.$ajax({
        type: "post",
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            alias_fields: [
              "used",
              "read_rate",
              "write_rate",
              "read_op_per_sec",
              "write_op_per_sec"
            ],
            fields: [
              "mean(kb_used)/1024/1024",
              "mean(read_bytes_sec)/1024",
              "mean(write_bytes_sec)/1024",
              "last(read_op_per_sec)/1024",
              "last(write_op_per_sec)/1024"
            ],
            filters: [
              {
                field: "ceph_name",
                operate: "=",
                value: me.name
              },
              {
                field: "pool_name",
                operate: "=",
                value: me.nodeValue
              },
              {
                field: "start_time",
                operate: ">=",
                value: me.startTime
              },
              {
                field: "end_time",
                operate: "<",
                value: me.endTime
              }
            ],
            is_history: me.isHistory,
            is_list: "1",
            name: "pool",
            table: "newceph_pool_rate"
          }
        }),
        successFun(rtn) {
          me.rateLoading = false;
          me.useLoading = false;
          me.clear();
          me.rateOption.series = [];
          me.useOption.series = [];
          let countArr = rtn.pool || [];
          let xArr = [];
          let yArr = [[], [], [], []];
          let useyArr = [];
          let nameArr = [
            Vue.t("monitor.readRate"),
            Vue.t("monitor.writeRate"),
            Vue.t("monitor.numberReadOperation"),
            Vue.t("monitor.numberWriteOperation")
          ];
          let useName = Vue.t("monitor.usedAmount");
          let enArr = [
            "read_rate",
            "write_rate",
            "read_op_per_sec",
            "write_op_per_sec"
          ];
          countArr.forEach(item => {
            xArr.push(utils.xAxisDataFormatter(item.time));
            enArr.forEach((key, index) => {
              yArr[index].push(item[key] == null ? null : item[key].toFixed(2));
            });
            useyArr.push(item["used"] == null ? null : item["used"].toFixed(2));
          });
          me.rateOption.xAxis.axisLabel.formatter = me.xAxisLabelFormatter;
          me.rateOption.title.text = `${me.title}(${me.timeTitle})`;
          me.rateOption.xAxis.data = xArr;

          me.useOption.xAxis.axisLabel.formatter = me.xAxisLabelFormatter;
          me.useOption.xAxis.data = xArr;
          yArr.forEach((item, index) => {
            let yAxisIndex = 0;
            if (index == 2 || index == 3) {
              yAxisIndex = 1;
            }
            me.rateOption.series.push({
              name: nameArr[index],
              yAxisIndex,
              data: item,
              smooth: true,
              type: "line",
              connectNulls: true
            });
          });
          me.useOption.series.push({
            name: Vue.t("monitor.usedAmount"),
            data: useyArr,
            smooth: true,
            type: "line",
            connectNulls: true
          });
        }
      });
    },
    clear() {
      this.$refs.rateChart.clear();
      this.$refs.useChart.clear();
    },
    onlegendselectchangedrate() {
      let name = arguments[0].name;
      let b = this.rateOption.legend.selected[name];
      this.rateOption.legend.selected[name] = !b;
    },
    onlegendselectchangeduse() {
      let name = arguments[0].name;
      let b = this.useOption.legend.selected[name];
      this.useOption.legend.selected[name] = !b;
    }
  }
};
</script>
<style  scoped>
</style>