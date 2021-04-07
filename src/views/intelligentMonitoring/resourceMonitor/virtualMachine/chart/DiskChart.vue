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
        <el-option :label="disk.name" :value="disk.value" :key="disk.value"></el-option>
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
      Vue.t("monitor.readRate"),
      Vue.t("monitor.writeRate"),
      Vue.t("monitor.numberRead"),
      Vue.t("monitor.numberWrite")
    ];
    return {
      loading: false,
      loadingOpts: utils.loadingOpts,
      value: "",
      diskList: [],
      title: Vue.t("monitor.diskRAndW"),
      chartObj: null,
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
          "/history?return_type=json&type=disk" +
          v.search,
        successFun(rtn) {
          me.loading = false;
          me.clear();
          me.option.series = [];
          me.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${v.timeTitle})`;
          me.option.xAxis.data = [];
          me.chartObj = rtn;
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
          if (selList.length != me.diskList.length) {
            me.$refs.chart.clear();
          }
          me.diskList = selList;
          if (me.diskList.length == 0) {
            me.value = "";
            return;
          }
          if (!me.value) {
            me.value = me.diskList[0].value;
          } else {
            let f = me.diskList.some(item => {
              return item.value == me.value;
            });
            if (!f) {
              me.value = me.diskList[0].value;
            }
          }
          me.loadData(me.value);
        }
      });
    },
    loadData(diskName) {
      if (!diskName) {
        return;
      }
      this.option.series = [];
      let me = this;
      let arr = this.chartObj[diskName];
      let x = [];
      let yArr = [[], [], [], []];
      let nameArr = [
        Vue.t("monitor.readRate"),
        Vue.t("monitor.writeRate"),
        Vue.t("monitor.numberRead"),
        Vue.t("monitor.numberWrite")
      ];
      let xArr = ["rd_bytes", "wr_bytes", "rd_req", "wr_req"];
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
      me.option.xAxis.data = x;
      yArr.forEach((item, index) => {
        let yAxisIndex = 0;
        if (index == 2 || index == 3) {
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
