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

    <el-select v-model="nodeValue" size="small" filterable @change="getChart" class="chart-select">
      <template v-for="item in list">
        <el-option :label="item" :value="item" :key="item"></el-option>
      </template>
    </el-select>
  </div>
</template>
<script>
import { utils } from "../../../public/utils";

export default {
  props: [],
  data() {
    let legend = [
      Vue.t("monitor.availableAmount"),
      Vue.t("monitor.usedAmount"),
      Vue.t("monitor.utilization")
    ];
    return {
      loading: false,
      loadingOpts: utils.loadingOpts,
      title: Vue.t("monitor.osdInformation"),
      startTime: 0,
      endTime: 0,
      xAxisLabelFormatter: 0,
      isHistory: 0,
      timeTitle: "",
      name: "",
      nodeValue: "",
      list: [],
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
          },
          {
            type: "value",
            name: "%",
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
      me.startTime = v.startTime;
      me.endTime = v.endTime;
      me.xAxisLabelFormatter = v.xAxisLabelFormatter;
      me.isHistory = v.isHistory;
      me.timeTitle = v.timeTitle;
      me.name = v.name;
      me.$ajax({
        type: "post",
        url: "api/pluto/v1/monitor/search/resource/values",
        data: JSON.stringify({
          params: {
            fields: "osd_name,osd_utilization",
            filters: [
              {
                field: "ceph_name",
                operate: "=",
                value: me.name
              }
            ],
            table: "newceph_osd"
          }
        }),
        successFun(rtn) {
          me.list = rtn.values;
          if (me.list.length > 0) {
            if (!me.nodeValue) {
              me.nodeValue = me.list[0];
            }
            me.getChart();
          } else {
            me.nodeValue = "";
          }
        }
      });
    },
    getChart() {
      let me = this;
      me.loading = true;
      me.$ajax({
        type: "post",
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            alias_fields: ["osd_avail", "osd_used", "osd_utilization"],
            fields: [
              "mean(osd_kb_avail)/1024/1024",
              "mean(osd_kb_used)/1024/1024",
              "mean(osd_utilization)"
            ],
            filters: [
              {
                field: "ceph_name",
                operate: "=",
                value: me.name
              },
              {
                field: "osd_name",
                operate: "=",
                value: me.nodeValue
              },
              {
                field: "start_time",
                operate: ">=",
                value: me.startTime
              },
              {
                field: "end_time",
                operate: "<",
                value: me.endTime
              }
            ],
            is_history: me.isHistory,
            is_list: "1",
            name: "icfs",
            table: "newceph_osd"
          }
        }),
        successFun(rtn) {
          rtn.icfs.map(icf => {
            icf.osd_used =
              icf.osd_used == null ? null : icf.osd_used.toFixed(2);
            icf.osd_avail =
              icf.osd_avail == null ? null : icf.osd_avail.toFixed(2);
            icf.osd_utilization =
              icf.osd_utilization == null
                ? null
                : icf.osd_utilization.toFixed(2);
          });
          me.loading = false;
          me.clear();
          let countArr = rtn.icfs || [];
          let xArr = [];
          let yArr = [[], [], []];
          let nameArr = [
            Vue.t("monitor.availableAmount"),
            Vue.t("monitor.usedAmount"),
            Vue.t("monitor.utilization")
          ];
          let enArr = ["osd_avail", "osd_used", "osd_utilization"];
          countArr.forEach(item => {
            xArr.push(utils.xAxisDataFormatter(item.time));
            enArr.forEach((key, index) => {
              yArr[index].push(item[key]);
            });
          });
          me.option.series = [];
          me.option.xAxis.axisLabel.formatter = me.xAxisLabelFormatter;
          me.option.title.text = `${me.title}(${me.timeTitle})`;
          me.option.xAxis.data = xArr;
          yArr.forEach((item, index) => {
            let yAxisIndex = 0;
            if (index == 2) {
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
