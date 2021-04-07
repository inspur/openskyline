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
  props: {
    chartData: Object
  },
  data() {
    let legend = [
      Vue.t("monitor.used_percent"),
      Vue.t("monitor.used"),
      Vue.t("monitor.buffered"),
      Vue.t("monitor.cached"),
      Vue.t("monitor.active"),
      Vue.t("monitor.inactive"),
      Vue.t("monitor.total")
    ];
    let seriesItemNamesEN = [
      "used_percent",
      "used",
      "buffered",
      "cached",
      "active",
      "inactive",
      "total"
    ];
    return {
      loading: false,
      loadingOpts: utils.loadingOpts,
      legend: legend,
      seriesItemNamesEN: seriesItemNamesEN,
      option: {
        legend: {
          type: "scroll",
          selected: (v => {
            let o = {};
            legend.forEach(v => {
              o[v] = true;
            });
            return o;
          })(),
          data: Array.from(legend, v => {
            return {
              name: v,
              icon: utils.echartsOption.legend.icon
            };
          })
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
      let vm = this;
      vm.loading = true;
      let url = `api/pluto/v1/monitor/cpms/${vm.chartData.uuid}/history?return_type=json&type=mem${v.search}`;
      vm.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: vm.chartData.centerId
        },
        url: url,
        successFun(rtn) {
          vm.loading = false;
          vm.clear();
          vm.option.xAxis.data = [];
          vm.option.series = [];
          let data = rtn.mem || [];
          if (data.length < 1) {
            vm.option.title.text = Vue.t("base.noData");
            vm.option.title.left = "center";
            vm.option.title.top = "middle";
            vm.option.legend.show = false;
            return;
          }
          vm.option.legend.show = true;
          vm.option.title.left = utils.echartsOption.title.left;
          vm.option.title.top = utils.echartsOption.title.top;

          vm.option.title.text = `${vm.chartData.titleText}(${v.timeTitle})`;
          vm.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          let yArr = [[], [], [], [], [], [], []];

          data.forEach((item, index) => {
            vm.option.xAxis.data.push(utils.xAxisDataFormatter(item[0].time));
            for (let i = 1; i <= 7; i++) {
              if (item[i] && item[i][vm.seriesItemNamesEN[i - 1]] != null) {
                yArr[i - 1].push(
                  item[i][vm.seriesItemNamesEN[i - 1]].toFixed(2)
                );
              } else {
                yArr[i - 1].push(null);
              }
            }
          });
          yArr.forEach((item, index) => {
            let yAxisIndex = 0;
            if (index == 0) {
              yAxisIndex = 1;
            }
            vm.option.series.push({
              name: vm.legend[index],
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
