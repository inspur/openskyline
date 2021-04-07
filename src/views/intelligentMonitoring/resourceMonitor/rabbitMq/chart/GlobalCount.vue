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
      Vue.t("monitor.channels"),
      Vue.t("monitor.connections"),
      Vue.t("monitor.consumers"),
      Vue.t("monitor.exchange"),
      Vue.t("monitor.queues")
    ];
    return {
      title: Vue.t("monitor.globalCount"),
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
            name: this.$t("monitor.num")
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
              "channels",
              "connections",
              "consumers",
              "exchanges",
              "queues"
            ],
            fields: [
              "last(channels)",
              "last(connections)",
              "last(consumers)",
              "last(exchanges)",
              "last(queues)"
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
            Vue.t("monitor.channels"),
            Vue.t("monitor.connections"),
            Vue.t("monitor.consumers"),
            Vue.t("monitor.exchange"),
            Vue.t("monitor.queues")
          ];
          let enXArr = [
            "channels",
            "connections",
            "consumers",
            "exchanges",
            "queues"
          ];
          countArr.forEach(item => {
            xArr.push(utils.xAxisDataFormatter(item.time));
            enXArr.forEach((key, index) => {
              let d = item[key] || 0;
              yArr[index].push(d);
            });
          });
          me.option.series = [];
          me.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${v.timeTitle})`;
          me.option.xAxis.data = xArr;
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
