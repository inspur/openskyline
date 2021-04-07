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
  props: ["vmId", "centerId"],
  data() {
    let legend = [
      Vue.t("base.utilization"),
      Vue.t("monitor.used") + Vue.t("monitor.amount1"),
      Vue.t("monitor.total") + Vue.t("monitor.amount1"),
      Vue.t("monitor.cache") + Vue.t("monitor.amount1")
    ];
    return {
      title: Vue.t("base.memUtilization"),
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
            name: Vue.t("monitor.amount") + "(MB)"
          },
          {
            type: "value",
            name: Vue.t("base.utilization") + "(%)",
            max: 100,
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
      me.loading = true;
      this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url:
          "api/pluto/v1/monitor/vms/" +
          this.vmId +
          "/history?return_type=json&type=mem" +
          v.search,
        successFun(rtn = {}) {
          me.loading = false;
          me.clear();
          me.option.series = [];
          me.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${v.timeTitle})`;
          let cpuArr = rtn.mem || [];
          let x = [];
          let yArr = [[], [], [], []];
          let nameArr = [
            Vue.t("base.utilization"),
            Vue.t("monitor.used") + Vue.t("monitor.amount1"),
            Vue.t("monitor.total") + Vue.t("monitor.amount1"),
            Vue.t("monitor.cache") + Vue.t("monitor.amount1")
          ];
          let xArr = ["value", "used_mem", "total_mem", "cache_mem"];
          cpuArr.forEach((item, index) => {
            x.push(utils.xAxisDataFormatter(item[0].time));
            for (let i = 1; i <= 4; i++) {
              if (item[i] && item[i][xArr[i - 1]] != null) {
                yArr[i - 1].push(item[i][xArr[i - 1]].toFixed(2));
              } else {
                yArr[i - 1].push(null);
              }
            }
          });
          me.option.xAxis.data = x;
          yArr.forEach((item, index) => {
            let yAxisIndex = 0;
            if (index == 0) {
              yAxisIndex = 1;
            }
            me.option.series.push({
              name: nameArr[index],
              yAxisIndex,
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
