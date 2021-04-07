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
  props: ["name"],
  data() {
    let legend = [
      Vue.t("monitor.confirmMsg"),
      Vue.t("monitor.publicMsg"),
      Vue.t("monitor.mesTotal"),
      Vue.t("monitor.readyMsg"),
      Vue.t("monitor.unconfirmedMsg")
    ];
    return {
      title: Vue.t("monitor.messageFlowRate"),
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
            name: Vue.t("monitor.numPerSecond")
          },
          {
            type: "value",
            name: Vue.t("monitor.num"),
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
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            alias_fields: [
              "messages_rate",
              "messages_acked_rate",
              "messages_published_rate",
              "messages_ready_rate",
              "messages_unacked"
            ],
            fields: [
              "non_negative_derivative(mean(messages), 1s)",
              "non_negative_derivative(mean(messages_acked),1s)",
              "non_negative_derivative(mean(messages_published),1s)",
              "non_negative_derivative(mean(messages_ready),1s)",
              "last(messages_unacked)"
            ],
            filters: [
              {
                field: "rabbitmq_name",
                operate: "=",
                value: v.collectHost
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
            ],
            is_history: v.isHistory,
            is_list: "1",
            name: "rmq",
            table: "rabbitmq_overview"
          }
        }),
        successFun(rtn = {}) {
          me.loading = false;
          me.clear();
          let countArr = rtn.rmq || [];
          let xArr = [];
          let yArr = [[], [], [], [], []];
          let nameArr = [
            Vue.t("monitor.confirmMsg"),
            Vue.t("monitor.publicMsg"),
            Vue.t("monitor.mesTotal"),
            Vue.t("monitor.readyMsg"),
            Vue.t("monitor.unconfirmedMsg")
          ];
          let enArr = [
            "messages_acked_rate",
            "messages_published_rate",
            "messages_rate",
            "messages_ready_rate",
            "messages_unacked"
          ];
          countArr.forEach(item => {
            xArr.push(utils.xAxisDataFormatter(item.time));
            enArr.forEach((key, index) => {
              if (key == "messages_unacked") {
                yArr[index].push(item[key] || 0);
              } else {
                yArr[index].push(
                  item[key] == null ? null : item[key].toFixed(2)
                );
              }
            });
          });
          me.option.series = [];
          me.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${v.timeTitle})`;
          me.option.xAxis.data = xArr;
          yArr.forEach((item, index) => {
            me.option.series.push({
              name: nameArr[index],
              yAxisIndex: index == 4 ? 1 : 0,
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
