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
  props: ["data", "centerId"],
  data() {
    let legend = [
      Vue.t("monitor.TOTAL_ALLOCATED_EXTENT_CAPACITY")
    ];
    return {
      title: `${Vue.t("monitor.TOTAL_ALLOCATED_EXTENT_CAPACITY")}(GB)`,
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
            name: ''
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
        type: "post",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            alias_fields: ['total_allocated_extent_capacity'],
            fields: ['last(total_allocated_extent_capacity)'],
            filters: [
              {
                field: "g2name",
                operate: "=",
                value: this.data.resource_alias
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
            name: "total_allocated_extent_capacity",
            table: "inspur_g2_AS5500G2"
          }
        }),
        successFun(rtn) {
          let data = rtn.total_allocated_extent_capacity || [];
          let x = [];
          let y1 = [];
          me.loading = false;
          me.clear();
          me.option.series = [];
          me.option.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${v.timeTitle})`;
          data.forEach((item, index) => {
            x.push(utils.xAxisDataFormatter(item.time));
            y1.push(item["total_allocated_extent_capacity"] != null ? item["total_allocated_extent_capacity"].toFixed(2) : null);
          });
          me.option.xAxis.data = x;
          me.option.series.push({
            name: me.option.legend.data[me.option.series.length].name,
            data: y1,
            smooth: false,
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
