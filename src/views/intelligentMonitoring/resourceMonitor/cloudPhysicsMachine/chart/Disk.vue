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
      <template v-for="disk in diskList">
        <el-option :label="disk.name" :value="disk.value" :key="disk.name"></el-option>
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
      Vue.t("monitor.readRate"),
      Vue.t("monitor.writeRate"),
      Vue.t("monitor.numberRead"),
      Vue.t("monitor.numberWrite")
    ];
    return {
      value: "",
      diskList: [],
      chartObj: null,
      loading: false,
      loadingOpts: utils.loadingOpts,
      legend: legend,
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
            name: Vue.t("monitor.rate") + "(MB/s)"
          },
          {
            type: "value",
            name: "IOPS(" + Vue.t("monitor.times") + ")",
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
      let url = `api/pluto/v1/monitor/cpms/${vm.chartData.uuid}/history?return_type=json&type=disk${v.search}`;
      vm.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: vm.chartData.centerId
        },
        url: url,
        successFun(rtn) {
          vm.loading = false;
          vm.clear();
          vm.option.series = [];
          vm.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          vm.option.title.text = `${vm.chartData.titleText}(${v.timeTitle})`;
          vm.option.xAxis.data = [];
          vm.chartObj = rtn;
          let selList = [];
          for (let key in rtn) {
            selList.push({
              value: key,
              name: key
            });
          }
          selList.sort((a, b) => {
            return a.name > b.name;
          });
          if (selList.length != vm.diskList.length) {
            vm.$refs.chart.clear();
          }
          vm.diskList = selList;
          if (vm.diskList.length == 0) {
            vm.value = "";
            vm.option.title.text = Vue.t("base.noData");
            vm.option.title.left = "center";
            vm.option.title.top = "middle";
            return;
          }
          vm.option.title.left = utils.echartsOption.title.left;
          vm.option.title.top = utils.echartsOption.title.top;

          if (!vm.value) {
            vm.value = vm.diskList[0].value;
          } else {
            let f = vm.diskList.some(item => {
              return item.value == vm.value;
            });
            if (!f) {
              vm.value = vm.diskList[0].value;
            }
          }
          vm.loadData(vm.value);
        }
      });
    },
    loadData(diskName) {
      if (!diskName) {
        return;
      }
      let vm = this;
      let arr = vm.chartObj[diskName];
      vm.option.series = [];
      let x = [];
      let yArr = [[], [], [], []];
      let xArr = ["read_bytes", "write_bytes", "reads_iops", "writes_iops"];
      arr.forEach((item, index) => {
        x.push(utils.xAxisDataFormatter(item[0].time));
        for (let i = 1; i <= 4; i++) {
          if (item[i] && item[i][xArr[i - 1]] != null) {
            yArr[i - 1].push(item[i][xArr[i - 1]].toFixed(2));
          } else {
            yArr[i - 1].push(null);
          }
        }
      });
      vm.option.xAxis.data = x;
      yArr.forEach((item, index) => {
        let yAxisIndex = 0;
        if (index == 2 || index == 3) {
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
