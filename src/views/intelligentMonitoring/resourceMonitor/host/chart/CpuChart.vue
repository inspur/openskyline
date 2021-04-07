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
  props: ["hostName", "centerId"],
  data() {
    return {
      title: Vue.t("base.utilization"),
      loading: false,
      loadingOpts: utils.loadingOpts,
      option: {
        legend: {
          selected: {
            used: true,
            guest: false,
            guest_nice: false,
            idle: true,
            iowait: true,
            irq: false,
            nice: false,
            softirq: false,
            steal: false,
            system: false,
            user: false
          },
          data: (function() {
            let arr = [
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
          "api/pluto/v1/monitor/hosts/" +
          this.hostName +
          "/history?return_type=json&type=cpu" +
          v.search,
        successFun(rtn) {
          me.loading = false;
          me.clear();
          me.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${v.timeTitle})`;
          me.option.series = [];
          let x = [];
          let yArr = [[], [], [], [], [], [], [], [], [], [], []];
          let nameArr = [
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
          let cpuArr = rtn.cpu || [];
          cpuArr.forEach((item, index) => {
            item.splice(4, 1);
            for (let i = 0; i <= nameArr.length; i++) {
              let item_ = item[i];
              if (i === 0) {
                x.push(utils.xAxisDataFormatter(item_.time));
                continue;
              }
              let value = item_[nameArr[i - 1]];
              if (item_ && value !== null) {
                yArr[i - 1].push(value.toFixed(2));
              } else {
                yArr[i - 1].push(null);
              }
            }
          });
          me.option.xAxis.data = x;
          yArr.forEach((item, index) => {
            me.option.series.push({
              name: nameArr[index],
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
