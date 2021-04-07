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
import { utils } from "../../../../public/utils";

export default {
  props: ["hostName", "dockerId"],
  data() {
    let legend = [Vue.t("base.memUtilization")];
    return {
      title: Vue.t("base.memUtilization"),
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
  methods: {
    getData(v = {}) {
      let me = this;
      me.loading = true;
      this.$ajax({
        type: "post",
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            alias_fields: ["usage_percent"],
            fields: ["last(usage_percent)"],
            filters: [
              {
                field: "host",
                operate: "=",
                value: me.hostName
              },
              {
                field: "container_name",
                operate: "=",
                value: me.dockerId
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
            name: "docker",
            table: "docker_container_mem"
          }
        }),
        successFun(rtn) {
          me.loading = false;
          me.clear();
          me.option.series = [];
          me.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${v.timeTitle})`;
          let arr = rtn.docker || [];
          let xArr = [];
          let yArr = [];
          arr.forEach(item => {
            xArr.push(utils.xAxisDataFormatter(item.time));
            yArr.push(
              item.usage_percent == null ? null : item.usage_percent.toFixed(2)
            );
          });
          me.option.xAxis.data = xArr;
          me.option.series.push({
            name: me.option.legend.data[me.option.series.length].name,
            data: yArr,
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
