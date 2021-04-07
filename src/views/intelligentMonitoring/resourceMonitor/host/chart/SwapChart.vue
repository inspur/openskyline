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
    let legend = [
      Vue.t("base.utilization"),
      "total" + Vue.t("monitor.amount1"),
      "used" + Vue.t("monitor.amount1")
    ];
    return {
      title: Vue.t("monitor.exchangeParUn"),
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
            name: Vue.t("monitor.amount") + "(GB)"
          },
          {
            type: "value",
            name: Vue.t("base.utilization") + "(%)",
            max: 100,
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
        type: "post",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            is_history: v.isHistory + "",
            fields: [
              "mean(used_percent)",
              "mean(total)/1024/1024/1024",
              "mean(used)/1024/1024/1024"
            ],
            alias_fields: ["used_percent", "total", "used"],
            table: "swap",
            is_list: "1",
            name: "swap",
            filters: [
              {
                field: "host",
                operate: "=",
                value: this.hostName
              },
              {
                field: "start_time",
                operate: ">=",
                value: v.startTime
              },
              {
                field: "end_time",
                operate: "<",
                value: v.endTime
              }
            ]
          }
        }),
        successFun(rtn = {}) {
          me.loading = false;
          me.clear();
          me.option.series = [];
          me.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${v.timeTitle})`;
          me.option.xAxis.data = [];
          let swapArr = rtn.swap || [];
          let x = [];
          let yArr = [[], [], []];
          let nameArr = [
            Vue.t("base.utilization"),
            "total" + Vue.t("monitor.amount1"),
            "used" + Vue.t("monitor.amount1")
          ];
          let xArr = ["used_percent", "total", "used"];
          swapArr.forEach((item, index) => {
            x.push(utils.xAxisDataFormatter(item.time));
            for (let i = 1; i <= 3; i++) {
              if (item[xArr[i - 1]] != null) {
                yArr[i - 1].push(item[xArr[i - 1]].toFixed(2));
              } else {
                yArr[i - 1].push(null);
              }
            }
          });
          me.option.xAxis.data = x;
          yArr.forEach((item, index) => {
            let yAxisIndex = 0;
            if (index == 0) {
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
