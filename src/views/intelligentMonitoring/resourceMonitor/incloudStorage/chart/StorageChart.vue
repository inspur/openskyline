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
  props: [],
  data() {
    let legend = [
      Vue.t("monitor.totalStorage"),
      Vue.t("monitor.availableAmount"),
      Vue.t("monitor.usedAmount")
    ];
    return {
      loading: false,
      loadingOpts: utils.loadingOpts,
      title: Vue.t("monitor.storageStatistics"),
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
            name: "GB"
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
            alias_fields: ["total_space", "total_used", "total_avail"],
            fields: [
              "mean(total_space)/1024/1024/1024",
              "mean(total_used)/1024/1024/1024",
              "mean(total_avail)/1024/1024/1024"
            ],
            filters: [
              {
                field: "ceph_name",
                operate: "=",
                value: v.name
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
            name: "icfs",
            table: "newceph_cluster"
          }
        }),
        successFun(rtn) {
          me.loading = false;
          me.clear();
          let countArr = rtn.icfs || [];
          let xArr = [];
          let yArr = [[], [], [], []];
          let nameArr = [
            Vue.t("monitor.totalStorage"),
            Vue.t("monitor.availableAmount"),
            Vue.t("monitor.usedAmount")
          ];
          let enArr = ["total_space", "total_avail", "total_used"];
          countArr.forEach(item => {
            xArr.push(utils.xAxisDataFormatter(item.time));
            enArr.forEach((key, index) => {
              yArr[index].push(item[key] == null ? null : item[key].toFixed(2));
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
