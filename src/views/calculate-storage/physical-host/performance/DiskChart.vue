<template>
  <div class="chart">
    <IEcharts
      ref="chart"
      :initOpts="echartsInitOpts"
      :option="option"
      :loading="loading"
      :loadingOpts="loadingOpts"
      :resizable="true"
    ></IEcharts>
    <el-select v-model="value" size="small" @change="loadData" class="chart-select">
      <template v-for="disk in diskList">
        <el-option :label="disk.name" :value="disk.value" :key="disk.name"></el-option>
      </template>
    </el-select>
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
      value: "",
      diskList: [],
      chartObj: null,
      loading: false,
      echartsInitOpts: utils.echartsInitOpts,
      loadingOpts: utils.loadingOpts,
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
            name: Vue.t("base.speed") + "(MB/s)"
          }
        ],
        series: [
          {
            data: [],
            name: Vue.t("monitor.readRate"),
            smooth: true,
            type: "line",
            connectNulls: true
          },
          {
            data: [],
            name: Vue.t("monitor.writeRate"),
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
          vm.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          vm.option.title.text = `${vm.chartData.titleText}(${v.timeTitle})`;
          vm.chartObj = rtn;

          let list = Array.from(Object.keys(rtn), v => {
            return { value: v, name: v };
          });
          list.sort((a, b) => {
            return a.name > b.name;
          });
          if (list.length !== vm.diskList.length) {
            vm.clear();
          }
          vm.diskList = list;
          if (vm.diskList.length == 0) {
          vm.value = "";
          vm.option.title.text = Vue.t("base.noData");
          vm.option.title.left = "center";
          vm.option.title.top = "middle";
          return;
        }
        vm.option.title.left = utils.echartsOption.title.left;
        vm.option.title.top = utils.echartsOption.title.top;
          if (vm.diskList.length < 1) {
            vm.value = "";
            return;
          }
          if (!vm.value) {
            vm.value = vm.diskList[0].value;
          }
          let f = vm.diskList.filter(v => vm.value === v.value);
          vm.value = f[0].value;
          vm.loadData(vm.value);
        }
      });
    },
    loadData(diskName) {
      if (!diskName) {
        return;
      }
      let vm = this;
      vm.option.xAxis.data = [];
      vm.option.series[0].data = [];
      vm.option.series[1].data = [];
      let arr = vm.chartObj[diskName] || [];
      arr.forEach((item, index) => {
        let item_ = item[0];
        vm.option.xAxis.data.push(
          moment(item_.time).format("YYYY-MM-DD HH:mm:ss")
        );
        item_ = item[1];
        let value = item_["read_bytes"];
        if (value !== null) {
          vm.option.series[0].data.push(value.toFixed(2));
        } else {
          vm.option.series[0].data.push(null);
        }
        item_ = item[2];
        value = item_["write_bytes"];
        if (value !== null) {
          vm.option.series[1].data.push(value.toFixed(2));
        } else {
          vm.option.series[1].data.push(null);
        }
      });
    },
    clear() {
      this.$refs.chart && this.$refs.chart.clear();
    }
  }
};
</script>
