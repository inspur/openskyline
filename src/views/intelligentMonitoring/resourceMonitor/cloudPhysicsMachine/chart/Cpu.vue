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
      "used",
      "guest",
      "guest_nice",
      "iowait",
      "irq",
      "nice",
      "softirq",
      "steal",
      "system",
      "user"
    ];

    return {
      loading: false,
      loadingOpts: utils.loadingOpts,
      legend: legend,
      option: {
        legend: {
          selected: Object.assign.apply(
            null,
            Array.from(legend, v => {
              let o = {};
              o[v] = v === "used" || v === "iowait";
              return o;
            })
          ),
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
            name: Vue.t("base.utilization") + "(%)"
          }
        ],
        series: Array.from(legend, v => {
          return {
            name: v,
            data: [],
            smooth: true,
            type: "line",
            connectNulls: true
          };
        })
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
      let url = `api/pluto/v1/monitor/cpms/${vm.chartData.uuid}/history?return_type=json&type=cpu${v.search}`;
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
          vm.option.series.map(v => {
            v.data = [];
          });
          let data = rtn.cpu || [];
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
          vm.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          vm.option.title.text = `${vm.chartData.titleText}(${v.timeTitle})`;

          data.forEach((item, index) => {
            item.splice(4, 1);
            for (let i = 0; i <= vm.legend.length; i++) {
              let item_ = item[i];
              if (i === 0) {
                vm.option.xAxis.data.push(utils.xAxisDataFormatter(item_.time));
                continue;
              }
              let value = item_[vm.legend[i - 1]];
              if (item_ && value !== null) {
                vm.option.series[i - 1].data.push(value.toFixed(2));
              } else {
                vm.option.series[i - 1].data.push(null);
              }
            }
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
