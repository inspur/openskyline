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
      <template v-for="net in netList">
        <el-option :label="net.name" :value="net.value" :key="net.value"></el-option>
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
      netList: [],
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
            name: Vue.t("base.speed") + "(KB/s)"
          }
        ],
        series: [
          {
            data: [],
            name: Vue.t("monitor.inflowRate"),
            smooth: true,
            type: "line",
            connectNulls: true
          },
          {
            data: [],
            name: Vue.t("monitor.outflowRate"),
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
      Promise.all([vm.getNetinData(v), vm.getNetoutData(v)]).then(data => {
        vm.data = data;
        vm.loading = false;
        vm.clear();
        vm.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
        vm.option.title.text = `${vm.chartData.titleText}(${v.timeTitle})`;

        let inData = data[0] || data[1] || {};
        let list = Array.from(Object.keys(inData), v => {
          return { value: v, name: v };
        });

        list.sort((a, b) => {
          return a.name > b.name;
        });
        if (list.length != vm.netList.length) {
          vm.clear();
        }
        vm.netList = list;
        if (vm.netList.length == 0) {
          vm.value = "";
          vm.option.title.text = Vue.t("base.noData");
          vm.option.title.left = "center";
          vm.option.title.top = "middle";
          return;
        }
        vm.option.title.left = utils.echartsOption.title.left;
        vm.option.title.top = utils.echartsOption.title.top;
        if (vm.netList.length < 1) {
          vm.value = "";
          return;
        }
        if (!vm.value) {
          vm.value = vm.netList[0].value;
        }
        let f = vm.netList.filter(v => vm.value === v.value);
        vm.value = f[0].value;
        vm.loadData(vm.value);
      });
    },
    loadData(netName) {
      if (!netName) {
        return;
      }
      let vm = this;
      vm.option.xAxis.data = [];
      vm.option.series[0].data = [];
      vm.option.series[1].data = [];
      let inData = vm.data[0][netName];
      let outData = vm.data[1][netName];
      inData.forEach((item, index) => {
        let item_ = item[0];
        vm.option.xAxis.data.push(
          moment(item_.time).format("YYYY-MM-DD HH:mm:ss")
        );
        item_ = item[1];
        let value = item_["bytes_recv"];
        if (value !== null) {
          vm.option.series[0].data.push(value.toFixed(2));
        } else {
          vm.option.series[0].data.push(null);
        }
      });
      outData.forEach((item, index) => {
        let item_ = item[0];
        item_ = item[1];
        let value = item_["bytes_sent"];
        if (value !== null) {
          vm.option.series[1].data.push(value.toFixed(2));
        } else {
          vm.option.series[1].data.push(null);
        }
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
    }
  }
};
</script>
