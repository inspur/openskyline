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
    <el-select v-model="value" size="small" @change="loadData" class="chart-select">
      <template v-for="net in netList">
        <el-option :label="net.name" :value="net.value" :key="net.value"></el-option>
      </template>
    </el-select>
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
      Vue.t("monitor.inflowRate"),
      Vue.t("monitor.inflowPackage"),
      Vue.t("monitor.inflowErrorPack"),
      Vue.t("monitor.inflowLostPack"),
      Vue.t("monitor.outflowRate"),
      Vue.t("monitor.outflowPackage"),
      Vue.t("monitor.outflowErrorPack"),
      Vue.t("monitor.outflowLostPack")
    ];
    let seriesItemNamesEN = [
      "bytes_recv",
      "packets_recv",
      "err_in",
      "drop_in",
      "bytes_sent",
      "packets_sent",
      "err_out",
      "drop_out"
    ];
    return {
      value: "",
      netList: [],
      loading: false,
      loadingOpts: utils.loadingOpts,
      legend: legend,
      seriesItemNamesEN: seriesItemNamesEN,
      option: {
        legend: {
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
            name: Vue.t("monitor.packages")
          },
          {
            type: "value",
            name: Vue.t("monitor.rate") + "(KB/s)",
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
      Promise.all([vm.getNetinData(v), vm.getNetoutData(v)]).then(function(
        data
      ) {
        vm.data = data;
        vm.loading = false;
        vm.option.series = [];
        vm.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
        vm.option.title.text = `${vm.chartData.titleText}(${v.timeTitle})`;
        vm.option.xAxis.data = [];
        var selList = [];
        for (let key in data[0]) {
          selList.push({
            value: key,
            name: key
          });
        }
        selList.sort((a, b) => {
          return a.name > b.name;
        });
        if (selList.length != vm.netList.length) {
          vm.clear();
        }
        vm.netList = selList;
        if (vm.netList.length == 0) {
          vm.value = "";
          vm.option.title.text = Vue.t("base.noData");
          vm.option.title.left = "center";
          vm.option.title.top = "middle";
          return;
        }
        vm.option.title.left = utils.echartsOption.title.left;
        vm.option.title.top = utils.echartsOption.title.top;

        if (!vm.value) {
          vm.value = vm.netList[0].value;
        } else {
          let f = vm.netList.some(item => {
            return item.value == vm.value;
          });
          if (!f) {
            vm.value = vm.netList[0].value;
          }
        }
        vm.loadData(vm.value);
      });
    },
    loadData(netName) {
      let vm = this;
      if (!netName) {
        return;
      }
      vm.clear();
      let inArr = vm.data[0][netName];
      let outArr = vm.data[1][netName];
      vm.option.series = [];
      let x = [];
      let yArr = [[], [], [], [], [], [], [], []];
      inArr.forEach((item, index) => {
        x.push(utils.xAxisDataFormatter(item[0].time));
        for (let i = 1; i <= 4; i++) {
          if (item[i] && item[i][vm.seriesItemNamesEN[i - 1]] != null) {
            yArr[i - 1].push(item[i][vm.seriesItemNamesEN[i - 1]].toFixed(2));
          } else {
            yArr[i - 1].push(null);
          }
        }
      });
      outArr.forEach((item, index) => {
        for (let i = 1; i <= 4; i++) {
          if (item[i] && item[i][vm.seriesItemNamesEN[i + 3]] != null) {
            yArr[i + 3].push(item[i][vm.seriesItemNamesEN[i + 3]].toFixed(2));
          } else {
            yArr[i + 3].push(null);
          }
        }
      });
      vm.option.xAxis.data = x;
      yArr.forEach((item, index) => {
        let yAxisIndex = 0;
        if (index == 0 || index == 4) {
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
    },
    async getNetinData(v) {
      let vm = this;
      let url = `api/pluto/v1/monitor/cpms/${vm.chartData.uuid}/history?return_type=json&type=netin${v.search}`;
      return new Promise((resolve, reject) => {
        vm.$ajax({
          type: "get",
          headers: {
            FORWARD_UNION: vm.chartData.centerId
          },
          url: url,
          successFun(data) {
            resolve(data);
          },
          errFun() {
            resolve({});
          }
        });
      });
    },
    async getNetoutData(v) {
      let vm = this;
      let url = `api/pluto/v1/monitor/cpms/${vm.chartData.uuid}/history?return_type=json&type=netout${v.search}`;
      return new Promise((resolve, reject) => {
        vm.$ajax({
          type: "get",
          headers: {
            FORWARD_UNION: vm.centerId
          },
          url: url,
          successFun(data) {
            resolve(data);
          },
          errFun() {
            resolve({});
          }
        });
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
