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
      Vue.t("base.utilization")
      // "guest",
      // "guest_nice",
      // "idle",
      // "iowait",
      // "irq",
      // "nice",
      // "softirq",
      // "steal",
      // "system",
      // "user"
    ];
    return {
      title: Vue.t("monitor.cpuUtilization"),
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
            name: Vue.t("base.utilization") + "(%)"
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
  beforeCreate() {},
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  beforeDestroy() {},
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
          "/history?return_type=json&type=cpu" +
          v.search,
        successFun(rtn) {
          let cpuArr = rtn.cpu || [];
          let x = [];
          let y = [];
          me.loading = false;
          me.clear();
          me.option.series = [];
          me.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${v.timeTitle})`;
          cpuArr.forEach((item, index) => {
            x.push(utils.xAxisDataFormatter(item[0].time));
            if (item[1] && item[1]["value"] != null) {
              y.push(item[1]["value"].toFixed(2));
            } else {
              y.push(null);
            }
          });
          me.option.xAxis.data = x;
          me.option.series.push({
            name: me.option.legend.data[me.option.series.length].name,
            data: y,
            smooth: true,
            type: "line",
            connectNulls: true
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
