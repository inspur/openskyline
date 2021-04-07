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
  props: ["vmId", "centerId"],
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
    return {
      value: "",
      netList: [],
      mapping: {},
      port: "",
      title: Vue.t("monitor.nercardInAndOut"),
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
      let me = this;
      me.loading = true;
      Promise.all([
        this.getNetinData(v.search),
        this.getNetoutData(v.search)
      ]).then(function(data) {
        me.data = data;
        let selList = [];
        me.loading = false;
        me.clear();
        me.option.series = [];
        me.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
        me.option.title.text = `${me.title}(${v.timeTitle})`;
        me.option.xAxis.data = [];
        for (let key in data[0]) {
          if (key != "mapping") {
            selList.push({
              value: key,
              name: key
            });
          } else {
            me.mapping = data[0][key];
          }
        }
        selList.sort((a, b) => {
          return a.name > b.name;
        });
        if (selList.length != me.netList.length) {
          me.$refs.chart.clear();
        }
        me.netList = selList;
        if (me.netList.length == 0) {
          me.value = "";
          me.port = "";
          return;
        }
        if (!me.value) {
          me.value = me.netList[0].value;
        } else {
          let f = me.netList.some(item => {
            return item.value == me.value;
          });
          if (!f) {
            me.value = me.netList[0].value;
          }
        }
        me.loadData(me.value);
      });
    },
    loadData(netName) {
      let me = this;
      if (!netName) {
        return;
      }
      me.option.series = [];
      let inArr = this.data[0][netName];
      let outArr = this.data[1][netName];
      this.port = netName;
      let x = [];
      let yArr = [[], [], [], [], [], [], [], []];
      let nameArr = [
        Vue.t("monitor.inflowRate"),
        Vue.t("monitor.inflowPackage"),
        Vue.t("monitor.inflowErrorPack"),
        Vue.t("monitor.inflowLostPack"),
        Vue.t("monitor.outflowRate"),
        Vue.t("monitor.outflowPackage"),
        Vue.t("monitor.outflowErrorPack"),
        Vue.t("monitor.outflowLostPack")
      ];
      let xArr = [
        "rx_bytes",
        "rx_packets",
        "rx_errs",
        "rx_drop",
        "tx_bytes",
        "tx_packets",
        "tx_errs",
        "tx_drop"
      ];
      inArr.forEach((item, index) => {
        x.push(utils.xAxisDataFormatter(item[0].time));
        for (let i = 1; i <= 4; i++) {
          if (item[i] && item[i][xArr[i - 1]] != null) {
            yArr[i - 1].push(item[i][xArr[i - 1]].toFixed(2));
          } else {
            yArr[i - 1].push(null);
          }
        }
      });
      outArr.forEach((item, index) => {
        for (let i = 1; i <= 4; i++) {
          if (item[i] && item[i][xArr[i + 3]] != null) {
            yArr[i + 3].push(item[i][xArr[i + 3]].toFixed(2));
          } else {
            yArr[i + 3].push(null);
          }
        }
      });
      me.option.xAxis.data = x;
      yArr.forEach((item, index) => {
        let yAxisIndex = 0;
        if (index == 0 || index == 4) {
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
      //网络端口
      // me.port = me.mapping[netName].port;  // edited by 白子玉 2019.6.14 由于返回数据没有port，临时注释
    },
    clear() {
      this.$refs.chart && this.$refs.chart.clear();
    },
    async getNetinData(timeStr) {
      return new Promise((resolve, reject) => {
        this.$ajax({
          type: "get",
          headers: {
            FORWARD_UNION: this.centerId
          },
          url:
            "api/pluto/v1/monitor/vms/" +
            this.vmId +
            "/history?return_type=json&type=netin" +
            timeStr,
          successFun(data) {
            resolve(data);
          },
          errFun() {
            resolve({});
          }
        });
      });
    },
    async getNetoutData(timeStr) {
      return new Promise((resolve, reject) => {
        this.$ajax({
          type: "get",
          headers: {
            FORWARD_UNION: this.centerId
          },
          url:
            "api/pluto/v1/monitor/vms/" +
            this.vmId +
            "/history?return_type=json&type=netout" +
            timeStr,
          successFun(data) {
            resolve(data);
          },
          errFun() {
            resolve({});
          }
        });
      });
    },
    toNetWorkPort() {
      this.$router.push({
        path:
          "/net/networkview/porttab/" +
          this.mapping[this.value].network +
          "/" +
          this.mapping[this.value].port
      });
    },
    onlegendselectchanged() {
      let name = arguments[0].name;
      this.option.legend.selected[name] = !this.option.legend.selected[name];
    }
  }
};
</script>
