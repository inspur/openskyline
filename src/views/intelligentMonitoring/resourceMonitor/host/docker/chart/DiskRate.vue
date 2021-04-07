<template>
  <div>
    <IEcharts
      ref="chart"
      style="height:240px;"
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
    let legend = [Vue.t("monitor.readRate"), Vue.t("monitor.writeRate")];
    return {
      title: Vue.t("monitor.diskIORate"),
      loading: false,
      loadingOpts: utils.loadingOpts,
      option: {
        legend: {
          type: "scroll",
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
            name: Vue.t("monitor.rate") + "(MB/s)"
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
            alias_fields: ["blk_input", "blk_output", "noused"],
            fields: [
              "non_negative_derivative(mean(io_service_bytes_recursive_read), 1s)/1024/1024",
              "non_negative_derivative(mean(io_service_bytes_recursive_write), 1s)/1024/1024",
              "last(io_service_bytes_recursive_write)"
            ],
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
            table: "docker_container_blkio"
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
          let yArr = [[], []];
          let nameArr = [Vue.t("monitor.readRate"), Vue.t("monitor.writeRate")];
          let enArr = ["blk_input", "blk_output"];
          arr.forEach(item => {
            xArr.push(utils.xAxisDataFormatter(item.time));
            enArr.forEach((key, index) => {
              yArr[index].push(item[key] == null ? null : item[key].toFixed(2));
            });
          });
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
