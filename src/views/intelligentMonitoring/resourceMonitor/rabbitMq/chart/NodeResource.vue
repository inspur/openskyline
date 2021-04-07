<template>
  <div>
    <IEcharts
      ref="chart"
      :option="option"
      :loading="loading"
      :loadingOpts="loadingOpts"
      :resizable="true"
      @legendselectchanged="onlegendselectchanged"
    ></IEcharts>

    <el-select v-model="nodeValue" filterable size="small" @change="getChart" class="chart-select">
      <template v-for="item in list">
        <el-option :label="item" :value="item" :key="item"></el-option>
      </template>
    </el-select>
  </div>
</template>
<script>
import { utils } from "../../../public/utils";

export default {
  props: ["name"],
  data() {
    let legend = [
      Vue.t("monitor.memUsage"),
      Vue.t("monitor.fileHandleUsage"),
      Vue.t("monitor.processesNum"),
      Vue.t("monitor.socketConnetions")
    ];
    return {
      title: Vue.t("monitor.nodeResourceUse"),
      loading: false,
      loadingOpts: utils.loadingOpts,
      nodeValue: "",
      collectHost: "",
      startTime: 0,
      endTime: 0,
      xAxisLabelFormatter: 0,
      isHistory: 0,
      timeTitle: "",
      list: [],
      option: {
        legend: {
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
            name: Vue.t("monitor.num")
          },
          {
            type: "value",
            name: "MB",
            nameLocation: "end",
            inverse: false
          }
        ],
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
  },
  methods: {
    getData(v = {}) {
      let me = this;
      me.collectHost = v.collectHost;
      me.startTime = v.startTime;
      me.endTime = v.endTime;
      me.xAxisLabelFormatter = v.xAxisLabelFormatter;
      me.isHistory = v.isHistory;
      me.timeTitle = v.timeTitle;
      me.$ajax({
        type: "post",
        url: "api/pluto/v1/monitor/search/resource/values",
        data: JSON.stringify({
          params: {
            fields: "node,running",
            filters: [
              {
                field: "rabbitmq_name",
                operate: "=",
                value: me.collectHost
              }
            ],
            table: "rabbitmq_node"
          }
        }),
        successFun(rtn = {}) {
          me.list = rtn.values;
          if (me.list.length > 0) {
            if (!me.nodeValue) {
              me.nodeValue = me.list[0];
            }
            me.getChart(v);
          } else {
            me.nodeValue = "";
          }
        }
      });
    },
    getChart(v) {
      let me = this;
      me.loading = true;
      me.$ajax({
        type: "post",
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            alias_fields: ["fd_used", "proc_used", "sockets_used", "mem_used"],
            fields: [
              "last(fd_used)",
              "last(proc_used)",
              "last(sockets_used)",
              "mean(mem_used)/1024/1024"
            ],
            filters: [
              {
                field: "rabbitmq_name",
                operate: "=",
                value: me.collectHost
              },
              {
                field: "node",
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
            name: "rmq",
            table: "rabbitmq_node"
          }
        }),
        successFun(rtn = {}) {
          me.loading = false;
          me.clear();
          let countArr = rtn.rmq || [];
          let xArr = [];
          let yArr = [[], [], [], [], []];
          let nameArr = [
            Vue.t("monitor.memUsage"),
            Vue.t("monitor.fileHandleUsage"),
            Vue.t("monitor.processesNum"),
            Vue.t("monitor.socketConnetions")
          ];
          let enArr = ["mem_used", "fd_used", "proc_used", "sockets_used"];
          countArr.forEach(item => {
            xArr.push(utils.xAxisDataFormatter(item.time));
            enArr.forEach((key, index) => {
              if (key == "mem_used" && item[key]) {
                yArr[index].push(item[key].toFixed(2) || 0);
              } else {
                yArr[index].push(item[key] || 0);
              }
            });
          });
          me.option.series = [];
          me.option.xAxis.axisLabel.formatter = me.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${me.timeTitle})`;
          me.option.xAxis.data = xArr;
          yArr.forEach((item, index) => {
            me.option.series.push({
              name: nameArr[index],
              yAxisIndex: index == 0 ? 1 : 0,
              data: item,
              smooth: true,
              type: "line",
              connectNulls: true
            });
          });
        }
      });
    },
    clear() {
      this.$refs.chart && this.$refs.chart.clear();
    },
    onlegendselectchanged() {
      let name = arguments[0].name;
      this.option.legend.selected[name] = !this.option.legend.selected[name];
    }
  }
};
</script>
