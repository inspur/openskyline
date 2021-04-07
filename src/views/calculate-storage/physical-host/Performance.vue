<template>
  <div>
    <span>CPU性能</span>
    <div style="height:190px;width:100%">
      <IEcharts :option="line"></IEcharts>
    </div>
    <span>内存性能</span>
    <div style="height:190px;width:100%">
      <IEcharts :option="bar"></IEcharts>
    </div>
    <span>硬盘性能</span>
    <div style="height:190px;width:100%">
      <IEcharts :option="diskPer"></IEcharts>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      line: {
        series: []
      },
      diskPer: {
        series: []
      },
      bar: {
        series: [{
          name: "",
          type: 'gauge',
          radius: "100%",
          axisLine: {
            show: true,
            lineStyle: {
              color: [
                [0.2, 'red'],
                [0.4, '#84A5EB'],
                [0.8, '#A1E48B'],
                [1, 'green']
              ]
            }
          },
          data: [{ value: 0 }]
        }]
      }
    }
  },
  methods: {},
  mounted() {
    var self = this;
    var todayAlarmNum = [3, 5, 6, 7, 8, 9];
    var clock = [4, 4, 6, 7, 8, 12];
    self.line = {
      title: {
        text: ""
      },
      tooltip: {
        trigger: "axis"
      },
      legend: {
        data: ['gao1', 'gao2']
      },
      toolbox: {
        show: false
      },
      xAxis: [{
        type: "category",
        boundaryGap: false,
        data: clock
      }],
      yAxis: [{
        type: "value",
        axisLabel: {
          formatter: "{value} "
        },
        splitArea: { show: true }
      }],
      series: [{
        name: 'ffddd',
        type: "line",
        data: todayAlarmNum
      }]
    };
    self.diskPer = {
      title: {
        text: ""
      },
      tooltip: {
        trigger: "axis"
      },
      legend: {
        data: ['gao1', 'gao2']
      },
      toolbox: {
        show: false
      },
      xAxis: [{
        type: "category",
        boundaryGap: false,
        data: clock
      }],
      yAxis: [{
        type: "value",
        axisLabel: {
          formatter: "{value} "
        },
        splitArea: { show: true }
      }],
      series: [{
        name: 'ffddd',
        type: "line",
        data: [10, 5, 2, 9, 3, 5]
      }]
    };
  }
}
</script>
