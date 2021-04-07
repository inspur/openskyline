<template>
  <div>
    <IEcharts
      ref="chart"
      :initOpts="echartsInitOpts"
      :option="option"
      :loading="loading"
      :loadingOpts="loadingOpts"
      :resizable="true"
    ></IEcharts>
  </div>
</template>
<script>
import { utils } from "../../../intelligentMonitoring/public/utils";
import moment from "moment";

export default {
  props: {
    chartData: Object
  },
  data() {
    return {
      loading: false,
      loadingOpts: utils.loadingOpts,
      echartsInitOpts: utils.echartsInitOpts,
      option: {
        title: {
          left: "center",
          bottom: 0
        },
        legend: {
          show: false
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
        series: [
          {
            data: [],
            name: Vue.t("base.utilization"),
            smooth: true,
            type: "line",
            connectNulls: true
          }
        ],
        grid: {
          left: 10,
          top: 60,
          bottom: 30,
          right: 0,
          containLabel: true
        }
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
          vm.option.series[0].data = [];
          vm.option.xAxis.data = [];
          let memArr = rtn.mem || [];
          if (memArr.length < 1) {
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

          memArr.forEach((item, index) => {
            let item_ = item[0];
            vm.option.xAxis.data.push(
              moment(item_.time).format("YYYY-MM-DD HH:mm:ss")
            );
            item_ = item[1];
            let value = item_["used_percent"];
            if (value !== null) {
              vm.option.series[0].data.push(value.toFixed(2));
            } else {
              vm.option.series[0].data.push(null);
            }
          });
        }
      });
    },
    clear() {
      this.$refs.chart && this.$refs.chart.clear();
    }
  }
};
</script>
