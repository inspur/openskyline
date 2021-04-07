<template>
  <div>
    <div class="chart">
      <IEcharts
        ref="chart0"
        :option="option0"
        :loading="loading"
        :loadingOpts="loadingOpts"
        :resizable="true"
        @legendselectchanged="onlegendselectchanged0"
      />
    </div>
    <div class="chart">
      <IEcharts
        ref="chart1"
        :option="option1"
        :loading="loading"
        :loadingOpts="loadingOpts"
        :resizable="true"
        @legendselectchanged="onlegendselectchanged1"
      />
    </div>
    <div class="chart">
      <IEcharts
        ref="chart2"
        :option="option2"
        :loading="loading"
        :loadingOpts="loadingOpts"
        :resizable="true"
        @legendselectchanged="onlegendselectchanged2"
      />
    </div>
  </div>
</template>

<script>
import { utils } from "../../../public/utils";
import moment from "moment";
export default {
  name: "Chart",
  data() {
    let legend = [];
    return {
      name: "",
      loading: false,
      loadingOpts: utils.loadingOpts,
      option0: {
        title: { text: Vue.t("monitor.OPENSTACK_API_STATUS_FRONTEND") },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          }
        },
        legend: {
          selected: (v => {
            let o = {};
            legend.forEach(v => {
              o[v] = true;
            });
            return o;
          })(),
          top: 0
        },
        xAxis: {
          type: "time",
          boundaryGap: false,
          axisLabel: {
            rotate: 30,
            formatter(v) {
              return `${moment(v).format("MM-DD HH:mm")}`;
            }
          },
          axisPointer: {
            label: {
              formatter(params) {
                return `${moment(params.value).format("YYYY-MM-DD HH:mm")}`;
              }
            }
          },
          splitLine: {
            show: false
          },
          splitNumber: 30,
          minInterval: 60 * 1000,
          maxInterval: 3600 * 24 * 1000
        },
        yAxis: [
          {
            type: "value",
            name: Vue.t("monitor.OPENSTACK_API_STATUS_PCS")
          }
        ],
        series: [],
        grid: { bottom: 20 }
      },
      option1: {},
      option2: {}
    };
  },
  mounted() {
    this.option0 = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option0
    );
    this.option1 = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option0,
      { title: { text: Vue.t("monitor.OPENSTACK_API_STATUS_BACKEND") } }
    );
    this.option2 = $.extend(
      true,
      JSON.parse(JSON.stringify(utils.echartsOption)),
      this.option0,
      {
        title: { text: Vue.t("monitor.OPENSTACK_API_STATUS_BACKEND_RTIME") },
        yAxis: [{ name: "ms" }]
      }
    );
  },
  methods: {
    init(v) {
      this.name = v.name;
      [this.option0, this.option1, this.option2].forEach((v_, i) => {
        v_.title.text = `${this.name} ${v_.title.text}`;
      });
    },
    async loadData(v) {
      const vm = this;

      vm.loading = true;
      const res = await vm.$ajax({
        type: "post",
        url: `api/pluto/v1/monitor/openstackapi/detail`,
        data: JSON.stringify({
          name: vm.name || v.name,
          start_time: v.startTime,
          end_time: v.endTime
        })
      });

      [this.option0, this.option1, this.option2].forEach((v_, i) => {
        let data = [res["front_data"], res["back_data"], res["back_data"]][i];

        v_.series = [];
        let iso1 = v_ === this.option1;
        let iso2 = v_ === this.option2;
        for (let key in data) {
          if ((iso1 && key === "rtime") || (iso2 && key !== "rtime")) {
            continue;
          }

          let sd = [];
          data[key].forEach(item => {
            sd.push([moment.utc(item.time).valueOf(), item.value.toFixed(2)]);
          });
          v_.series.push({
            name: Vue.t(`monitor.OPENSTACK_API_STATUS_${key}`),
            data: sd,
            smooth: true,
            type: "line",
            connectNulls: false,
            showSymbol: false
          });
        }

        this.$refs["chart" + i] && this.$refs["chart" + i]["clear"]();
        // v_.xAxis.min = v.startTime * 1000;
        // v_.xAxis.max = v.endTime * 1000;
        v_.xAxis.axisLabel.formatter = v.xAxisLabelFormatter;
        v_.legend.data = Array.from(v_.series, item => {
          if (!v_.legend.selected.hasOwnProperty(item.name)) {
            v_.legend.selected[item.name] = true;
          }
          return {
            name: item.name
          };
        });
      });

      vm.loading = false;
    },
    onlegendselectchanged0() {
      let name = arguments[0].name;
      this.option0.legend.selected[name] = !this.option0.legend.selected[name];
    },
    onlegendselectchanged1() {
      let name = arguments[0].name;
      this.option1.legend.selected[name] = !this.option1.legend.selected[name];
    },
    onlegendselectchanged2() {
      let name = arguments[0].name;
      this.option2.legend.selected[name] = !this.option2.legend.selected[name];
    }
  }
};
</script>
<style scoped>
</style>
