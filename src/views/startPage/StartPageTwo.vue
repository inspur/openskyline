<template>
  <div ref="page2">
    <div style="display: flex; flex-direction: row;">
      <div style="width: 300px; margin-right: 12px;">
        <div :class="'start-page-two-percent ' + bgTheme">
          <div :class="'start-page-two-percent-t'+ theme2">{{$t('container.hostNum')}}:{{hostTotal}}</div>
          <div>
            <IEcharts ref="" :option="option1" style="height:240px;" :resizable="true"></IEcharts>
          </div>
        </div>
        <div :class="'start-page-two-percent ' + bgTheme" style="margin-top:12px;">
          <div :class="'start-page-two-percent-t'+ theme2">{{$t('container.top5Hostnum')}}</div>
          <div style="height: 240px">
            <div v-for="(item, index) in vmInHost" :key="index">
              <el-row type="flex" justify="space-between" style="padding-top:10px;" v-if="index<5">
                <el-col :span="4"><div :class="clsssRender(index)">{{index+1}}</div></el-col>
                <el-col :span="16"><div :class="'top-line-middle ' + fontTheme" :title="item.name">{{item.name}}</div></el-col>
                <el-col :span="4"><div :class="'top-line-right ' + fontTheme">{{item.value}}</div></el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>
      <div style="flex: 1;min-width: 0px">
        <el-row :gutter="12" type="flex">
          <el-col>
            <div :class="'start-page-percent ' + bgTheme">
              <div :class="'start-page-two-percent-t'+ theme2">{{$t('container.top5cpuusage')}}(%)</div>
              <div class="start-page-percent-chart">
                <IEcharts ref="cpuChart" :option="option2" :loading="loading2" :resizable="true"  :style="'height:'+chartHeight+'px;'"></IEcharts>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="12">  
          <el-col style="padding-top:12px;">
            <div :class="'start-page-percent ' + bgTheme">
              <div :class="'start-page-two-percent-t'+ theme2">{{$t('container.top5memusage')}}(%)</div>
              <div class="start-page-percent-chart">
                <IEcharts ref="memChart" :option="option3" :loading="loading3" :resizable="true"  :style="'height:'+chartHeight+'px;'"></IEcharts>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col style="padding-top:12px;">
            <div :class="'start-page-percent ' + bgTheme">
              <div :class="'start-page-two-percent-t'+ theme2">{{$t('container.top5netspeed')}}(KB/s)
                <el-radio-group v-model="netSpeedLine" style="margin-left: 10px;" size="small" @change="handleTabChange">
                  <el-radio-button label="netin">{{$t('base.START_PAGE_THREE_NET_IN_RATE')}}</el-radio-button>
                  <el-radio-button label="netout">{{$t('base.START_PAGE_THREE_NET_OUT_RATE')}}</el-radio-button>
                </el-radio-group>
              </div>
              <IEcharts ref="netchart" :option="option4" :loading="loading4" :resizable="true"  :style="'height:'+(chartHeight+1)+'px;'"></IEcharts>
            </div>
          </el-col>
        </el-row>
      </div>
      <div style="width: 300px; margin-left: 12px;">
        <div :class="'start-page-two-percent ' + bgTheme">
          <div :class="'start-page-two-percent-t'+ theme2">{{$t('base.START_PAGE_THREE_CPU_USAGE_REAL_TIME')}}</div>
          <div  :style="'height:'+chartHeight+'px;'">
            <div v-for="(item, index) in cpuInHost" :key="index">
              <el-row type="flex" justify="space-between" style="padding-top:10px;" v-if="index<5">
                <el-col :span="4"><div :class="clsssRender(index)">{{index+1}}</div></el-col>
                <el-col :span="16"><div :class="'top-line-middle ' + fontTheme" :title="item.name">{{item.name}}</div></el-col>
                <el-col :span="4"><div :class="'top-line-right ' + fontTheme">{{item.value.toFixed(2)}}%</div></el-col>
              </el-row>
            </div>
          </div>
        </div>
        <div :class="'start-page-two-percent ' + bgTheme" style="margin-top:12px;">
          <div :class="'start-page-two-percent-t'+ theme2">{{$t('base.START_PAGE_THREE_RAM_USAGE_REAL_TIME')}}</div>
          <div  :style="'height:'+chartHeight+'px;'">
            <div v-for="(item, index) in memInHost" :key="index">
              <el-row type="flex" justify="space-between" style="padding-top:10px;" v-if="index<5">
                <el-col :span="4"><div :class="clsssRender(index)">{{index+1}}</div></el-col>
                <el-col :span="16"><div :class="'top-line-middle ' + fontTheme" :title="item.name">{{item.name}}</div></el-col>
                <el-col :span="4"><div :class="'top-line-right ' + fontTheme">{{item.value.toFixed(2)}}%</div></el-col>
              </el-row>
            </div>
          </div>
        </div>
        <div :class="'start-page-two-percent ' + bgTheme" style="margin-top:12px;">
          <div :class="'start-page-two-percent-t'+ theme2">{{$t('base.START_PAGE_THREE_NET_USAGE_REAL_TIME')}}</div>
          <div  :style="'height:'+(chartHeight+1)+'px;'">
            <div v-for="(item, index) in netInHost" :key="index">
              <el-row type="flex" justify="space-between" style="padding-top:10px;" v-if="index<5">
                <el-col :span="4"><div :class="clsssRender(index)">{{index+1}}</div></el-col>
                <el-col :span="12"><div :class="'top-line-middle ' + fontTheme" :title="item.name">{{item.name}}</div></el-col>
                <el-col :span="8"><div :class="'top-line-right ' + fontTheme">{{item.value * 1000 | fileSize}}/s</div></el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
import moment from "moment";
import echarts from 'echarts';
const chartColors = [
  '#42a5f5',
  '#9ccc65',
  '#ffa726',
  '#ef5350',
  '#26a69a',
  '#26c6da',
  '#78909c',
  '#5c75c0',
  '#0070c4',
  '#7e57c2',
  '#8d6e63',
  '#a76711',
  '#ff7043',
  '#ec407a'
];
export default {
  name: "",
  data () {
    return {
      hostTotal:0,
      hostStatus: [{
        name:Vue.t('lang.activation'), value:0
      }, {
         name:Vue.t('calcStorLang.unActivation'), value:0
      }],
      vmInHost:[],
      cpuInHost:[],
      memInHost:[],
      netInHost:[],
      startTime:"",
      endTime: "",
      netSpeedLine:"netin",
      netSpeedBar:"netin",
      bgTheme: this.$cookie.get("theme") == 'dark' ? 'dark' : 'light',
      theme2: this.$cookie.get("theme") == 'dark' ? '-dark' : '',
      fontTheme: this.$cookie.get("theme") == 'dark' ? 'fontDark' : 'fontLight',
      dark: Vue.cookie.get('theme') === 'dark',
      lineStyleColor: this.dark ? 'rgba(255,255,255,0.25)' : '#aaaaaa',
      lineColorArray: ['#42a5f5', '#9ccc65', '#ffa726', '#ef5350', '#26a69a', '#26c6da', '#78909c', '#5c75c0', '#0070c4', '#7e57c2', '#8d6e63', '#a76711', '#ff7043', '#ec407a'],
      option1:{ // 物理机总数
        color:['#0087ed', '#faad14', '#2fc25b'],
        tooltip : {
          show:true,
          formatter:function(params, ticket, callback) {
            return params.name+":"+params.value+'('+params.percent+'%)';
          }
        },
        legend: {
          type: 'scroll',
          icon:"circle",
          itemWidth: 6,
          itemHeight: 6,
          top: 'bottom',
          padding: [15, 10, 5, 10],
          textStyle: {
            color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.65)'
          },
          data: []
        },
        calculable : false,
        series : [{
          type: 'pie',
          radius : ['50%', '70%'],
          center: ['50%', '40%'],
          data:[],
          labelLine: {
            normal: {
              show: false
            }
          },
          label: {
            normal: {
              show: false
            }
          }
        }]
      },
      loading2:false,
      option2:{ // TOP5-CPU历史使用率
        color: chartColors,
        tooltip: {
          trigger:'axis'
        },
        legend: {
          type: 'scroll',
          top: 0,
          right: "10%",
          itemWidth: 6,
          itemHeight: 6,
          icon:"circle",
          data: [],
          textStyle: {
            color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999'
          },
          formatter: function(name) {
            return echarts.format.truncateText(name, 70);
          }
        },
        xAxis: {
          type: 'time',
          boundaryGap: false,
          data: [],
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            rotate: 15,
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisPointer: {
            label: {
              formatter(params) {
                return `${moment(params.value).format("YYYY-MM-DD HH:mm")}`;
              }
            }
          },
          axisLine: {
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaaaaa'
            }
          },
          splitNumber: 10
        },
        yAxis: {
          type:'value',
          splitLine: {
            show: true,
            lineStyle: {
              color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999',
              type: 'dashed'
            }
          },
          axisTick: {
            show: false
          },
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333'
          },
          axisLine: {
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaaaaa'
            }
          }
        },
        grid: {
          left: 80,
          top:28,
          bottom:40,
          right: 80
        },
        series:[]
      },
      loading3:false,
      option3:{  // TOP5-内存历史使用率
        color: chartColors,
        tooltip: {
          trigger:'axis'
        },
        legend: {
          type: 'scroll',
          top: 0,
          right: "10%",
          itemWidth: 6,
          itemHeight: 6,
          icon:"circle",
          data: [],
          textStyle: {
            color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999'
          },
          formatter: function(name) {
            return echarts.format.truncateText(name, 70);
          }
        },
        xAxis: {
          type: 'time',
          boundaryGap: false,
          data: [],
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            rotate: 15,
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisPointer: {
            label: {
              formatter(params) {
                return `${moment(params.value).format("YYYY-MM-DD HH:mm")}`;
              }
            }
          },
          axisLine: {
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaaaaa'
            }
          },
          splitNumber: 10
        },
        yAxis: {
          type:'value',
          splitLine: {
            show: true,
            lineStyle: {
              color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999',
              type: 'dashed'
            }
          },
          axisTick: {
            show: false
          },
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333'
          },
          axisLine: {
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaaaaa'
            }
          }
        },
        grid: {
          left: 80,
          top:28,
          bottom:40,
          right: 80
        },
        series:[]
      },
      loading4:false,
      option4:{ // TOP5-网络速率
        color: chartColors,
        tooltip: {
          trigger:'axis'
        },
        legend: {
          type: 'scroll',
          top: 0,
          right: "10%",
          itemWidth: 6,
          itemHeight: 6,
          icon:"circle",
          data: [],
          textStyle: {
            color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999'
          },
          formatter: function(name) {
            return echarts.format.truncateText(name, 70);
          }
        },
        xAxis: {
          type: 'time',
          boundaryGap: false,
          data: [],
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            rotate: 15,
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisPointer: {
            label: {
              formatter(params) {
                return `${moment(params.value).format("YYYY-MM-DD HH:mm")}`;
              }
            }
          },
          axisLine: {
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaaaaa'
            }
          },
          splitNumber: 10
        },
        yAxis: {
          type:'value',
          splitLine: {
            show: true,
            lineStyle: {
              color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999',
              type: 'dashed'
            }
          },
          axisTick: {
            show: false
          },
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333'
          },
          axisLine: {
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaaaaa'
            }
          }
        },
        grid: {
          left: 80,
          top:28,
          bottom:40,
          right: 80
        },
        series:[]
      },
      loading5:false, // TOP5-CPU使用率(实时)
      loading6:false, // TOP5-内存使用率(实时)
      loading7:false, // TOP5-网络速率(实时)(KB/s)
      tempHeight: 900,
      moreHeight: 0,
      chartHeight: 231
    }
  },
  mounted () {
    let bodyHeight = document.body.clientHeight;
    if (bodyHeight - 1009 > 0) {
      this.moreHeight = bodyHeight - 1009;
    }
    this.chartHeight+= this.moreHeight*0.33;
  },
  methods: {
    initStartPage() {
      this.$nextTick(() => {
        this.tempHeight = this.$refs.page2.offsetHeight;
      });
      let self = this;
      self.getHostList();
      self.getCPUandMemHistory();
    },
    async getHostList() {
      let self = this;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/nova/v2.1/os-hypervisors/detail"
      });
      let enableNum = 0;
      let disabledNum = 0;
      self.vmInHost = [];
      ret.hypervisors.forEach((item, index) => {
        if (item.hypervisor_type!="ironic") {
          self.vmInHost.push({"name": item.hypervisor_hostname, "value": item.running_vms})
          if (item.status == "enabled") {
            enableNum++;
          } else {
            disabledNum++
          }
        }
      });
      self.hostTotal = enableNum + disabledNum;
      self.hostStatus = [{
        name:Vue.t('container.serviceNormal'), value:enableNum
      }, {
         name:Vue.t('container.serviceUnnormal'), value:disabledNum
      }];
      let hostLegend = [Vue.t('container.serviceNormal'), Vue.t('container.serviceUnnormal')];
      this.option1.series[0].data = self.hostStatus;
      this.option1.legend.data = hostLegend;
      this.vmInHost.sort(self.compare("value"));
    },
    compare(property) {
      return function (obj1, obj2) {
        let val1 = obj1[property];
        let val2 = obj2[property];
        if (val1 < val2) {
          return 1;
        } else if (val1 > val2) {
          return -1;
        } else {
          return 0;
        }
      }
    },
    getCPUandMemHistory() {
      let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
      this.endTime = parseInt(date.getTime()/1000);
      this.startTime = parseInt((date.setDate(date.getDate()-7))/1000);
      this.getCPUHistory(this.startTime, this.endTime);
      this.getMemoryHistory(this.startTime, this.endTime);
      this.getNetInHistory(this.startTime, this.endTime, "netin", "all");
    },
    async getCPUHistory(startTime, endTime) {
      let self = this;
      self.option2.series = [];
      self.loading2 = true;
      self.option2.legend.data = [];
      let param = {type:'hs_cpu', num:'5', history:'1', starttime:startTime, endtime:endTime};
      let ret = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/bigscreen/topN?" + $.param(param),
        showErrMsg:false
      });
      self.loading2 = false;
      if (ret.code == "-1") {
        return;
      }
      let history = ret.data.history;
      let realtime = ret.data.realtime;
      let xData = [];
      let legentData = [];
      let xflag = 0;
      for (let key in history) {
        legentData.push({name:key});
        let dataList = history[key];
        let yData = [];
        for (let i=0; i<dataList.length; i++) {
          let data = dataList[i];
          yData.push([
            moment.utc(data[0]).valueOf(),
            data[1]
          ]);
        }
        xflag++;
        self.option2.series.push({
          name: key,
          data: yData,
          smooth: true,
          type: 'line',
          connectNulls: false,
          showSymbol: false,
          itemStyle: {
            normal: {
              color: self.lineColorArray[legentData.length-1],
              lineStyle: {
                color: self.lineColorArray[legentData.length-1]
              }
            }
          }
        })
      }
      self.option2.xAxis.data = xData;
      self.option2.legend.data = legentData;
      //实时
      let currentData = ret.data.realtime;
      self.cpuInHost = currentData;
      self.cpuInHost.sort(self.compare("value"));
    },
    async getMemoryHistory(startTime, endTime) {
      let self = this;
      self.option3.series = [];
      self.loading3 = true;
      self.option3.legend.data = [];
      let param = {type:'hs_mem', num:'5', history:'1', starttime:startTime, endtime:endTime};
      let ret = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/bigscreen/topN?" + $.param(param),
        showErrMsg:false
      });
      self.loading3 = false;
      if (ret.code == "-1") {
        return;
      }
      let history = ret.data.history;
      let realtime = ret.data.realtime;
      let xData = [];
      let legentData = [];
      let xflag = 0;
      for (let key in history) {
        legentData.push({name:key});
        let dataList = history[key];
        let yData = [];
        for (let i=0; i<dataList.length; i++) {
          let data = dataList[i];
          yData.push([
            moment.utc(data[0]).valueOf(),
            data[1]
          ]);
        }
        xflag++;
        self.option3.series.push({
          name: key,
          data: yData,
          smooth: true,
          type: 'line',
          connectNulls: false,
          showSymbol: false,
          itemStyle: {
            normal: {
              color: self.lineColorArray[legentData.length-1],
              lineStyle: {
                color: self.lineColorArray[legentData.length-1]
              }
            }
          }
        })
      }
      self.option3.xAxis.data = xData;
      self.option3.legend.data = legentData;
      //实时
      let currentData = ret.data.realtime;
      self.memInHost = currentData;
      self.memInHost.sort(self.compare("value"));
    },
    async getNetInHistory(startTime, endTime, val, time) {
      let self = this;
      let param = {type:'hs_'+val, num:'5', history:'1', starttime:startTime, endtime:endTime};
      let ret = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/bigscreen/topN?" + $.param(param),
        showErrMsg:false
      });
      self.loading4 = false;
      if (ret.code == "-1") {
        return;
      }
      if (time == "history" || time == "all") {
        self.option4.series = [];
        self.option4.legend.data = [];
        self.$refs.netchart.clear();
        let history = ret.data.history;
        let realtime = ret.data.realtime;
        let xData = [];
        let legentData = [];
        let xflag = 0;
        for (let key in history) {
          legentData.push({name:key});
          let dataList = history[key];
          let yData = [];
          for (let i=0; i<dataList.length; i++) {
            let data = dataList[i];
            yData.push([
              moment.utc(data[0]).valueOf(),
              data[1]
            ]);
          }
          xflag++;
          self.option4.series.push({
            name: key,
            data: yData,
            smooth: true,
            type: 'line',
            connectNulls: false,
            showSymbol: false,
            itemStyle: {
              normal: {
                color: self.lineColorArray[legentData.length-1],
                lineStyle: {
                  color: self.lineColorArray[legentData.length-1]
                }
              }
            }
          })
        }
        self.option4.xAxis.data = xData;
        self.option4.legend.data = legentData;
        let currentData = ret.data.realtime;
        self.netInHost = currentData;
        self.netInHost.sort(self.compare("value"));
      }
    },
    handleTabChange(val) {
      this.getNetInHistory(this.startTime, this.endTime, val, "history");
    },
    handleCurrentNetChange(val) {
      this.getNetInHistory(this.startTime, this.endTime, val, "current");
    },
    clsssRender(index) {
      if (index < 3) {
        return "top-line-left";
      } else {
        return "top-line-left top-line-left_last";
      }
    },
    formatX(str) {
      return moment
        .utc(str)
        .local()
        .format("MM-DD HH:mm");
    }
  }
}
</script>
<style scoped>
.light {
  background-color: #FFFFFF;
}
.dark {
  background-color: #1b293d;
}
.fontLight {
  color:rgba(0, 0, 0, 0.65);
}
.fontDark {
  color:rgba(255, 255, 255, 0.65);
}
.top-line-left {
  width: 20px;
  height: 20px;
  font-size: 12px;
  line-height: 20px;
  border-radius: 50%;
  margin-left: 6px;
  color: #ffffff;
  background: #1890ff;
  text-align: center;
}
.top-line-left_last {
  background: #f0f2f5;
  color: #000000;
}
.top-line-middle {
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.top-line-right {
  font-size: 14px;
  font-weight: 400;
  position: absolute;
  right: 10px;
  }
.start-page-percent-t {
  display: inline-block;
  margin: 10px 20px 0px 10px;
}
.start-page-percent {
  padding: 4px;
  border: 0;
  border-radius: 4px;
}
.start-page-two-percent {
  padding: 3px;
  border-radius: 4px;
  border: none;
  margin-bottom: 12px;
}
.start-page-two-percent-t {
  margin: 10px 20px 0px 10px;
  font-weight: 600;
  font-size: 14px;
  color: #333333;
  height: 32px;
}
.start-page-two-percent-t-dark {
  margin: 10px 20px 0px 10px;
  font-weight: 600;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  height: 32px;
}
</style>
