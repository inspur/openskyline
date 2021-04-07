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
  </div>
</template>
<script>
import { utils } from "../../../public/utils";

export default {
  props: [],
  data() {
    let isCN = String(Vue.config.lang) === 'zh-cn';
    let legend = [
      Vue.t("monitor.connections"),
      Vue.t("monitor.openFiles"),
      Vue.t("monitor.openDataTables"),
      Vue.t("monitor.runningThreads")
    ];
    return {
      title: Vue.t("monitor.numberStaistics"),
      loading: false,
      loadingOpts: utils.loadingOpts,
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
            name: isCN ? "个" : 'individual'
          }
        ],
        grid: utils.echartsOption.grid,
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
      me.loading = true;
      this.$ajax({
        type: "post",
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            alias_fields: [
              "open_files",
              "open_tables",
              "threads_running",
              "connections"
            ],
            fields: [
              "last(open_files)",
              "last(open_tables)",
              "last(threads_running)",
              "last(threads_connected)"
            ],
            filters: [
              {
                field: "host",
                operate: "=",
                value: v.collectHost
              },
              {
                field: "start_time",
                operate: ">=",
                value: v.startTime
              },
              {
                field: "end_time",
                operate: "<",
                value: v.endTime
              }
            ],
            is_history: v.isHistory,
            is_list: "1",
            name: "mysql",
            table: "mysql"
          }
        }),
        successFun(rtn) {
          me.loading = false;
          me.clear();
          let countArr = rtn.mysql || [];
          let xArr = [];
          let yArr = [[], [], [], []];
          let nameArr = [
            Vue.t("monitor.connections"),
            Vue.t("monitor.openFiles"),
            Vue.t("monitor.openDataTables"),
            Vue.t("monitor.runningThreads")
          ];
          let enArr = [
            "connections",
            "open_files",
            "open_tables",
            "threads_running"
          ];
          countArr.forEach(item => {
            xArr.push(utils.xAxisDataFormatter(item.time));
            enArr.forEach((key, index) => {
              yArr[index].push(item[key]);
            });
          });
          me.option.series = [];
          me.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${v.timeTitle})`;
          me.option.xAxis.data = xArr;
          yArr.forEach((item, index) => {
            me.option.series.push({
              name: nameArr[index],
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
