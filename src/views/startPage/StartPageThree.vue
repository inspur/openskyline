<template>
  <div ref="page3">
    <div style="display: flex; flex-direction: row;">
      <div style="width: 300px; margin-right: 12px;">
        <div class="start-page-three-percent" :class="theme">
          <div :class="'start-page-three-percent-t'+theme2">{{ $t('base.START_PAGE_THREE_VM_AMOUNT') }}{{vmTotal}}</div>
          <IEcharts
            :option="optionVM"
            :resizable="true"
            :style="'height:'+chartHeight+'px;'"
          />
          <div class="start-page-three-percent-b"></div>
        </div>
        <div class="start-page-three-percent start-page-three physical-host" v-if="physicalhostFlag">
          <el-col :span="12">
            <div class="start-page-three-t">
              <span>{{ $t('base.START_PAGE_THREE_VP_AMOUNT') }}</span>
            </div>
            <div class="start-page-three-b">
              <span>{{physicalhostNum}}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="start-page-three-right">
              <img :src='networkImage'/>
            </div>
          </el-col>
        </div>
        <div class="start-page-three-percent start-page-three bare-machine" v-if="baremachineFlag">
          <el-col :span="12">
            <div class="start-page-three-t">
              <span>{{ $t('base.START_PAGE_THREE_BARE_METAL_AMOUNT') }}</span>
            </div>
            <div class="start-page-three-b">
              <span>{{baremachineNum}}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="start-page-three-right">
              <img :src='userImage'/>
            </div>
          </el-col>
        </div>
      </div>
      <div style="flex: 1; min-width: 0; margin-right: 12px;">
        <div class="start-page-three-percent" :class="theme">
          <div :class="'start-page-three-percent-t'+theme2">{{ $t('base.START_PAGE_THREE_CPU_USAGE_HISTORY') }}</div>
          <IEcharts
            :option="optionCPUHistory"
            :resizable="true"
            :style="'height:'+chartHeight+'px;'"
          />
        </div>
        <div class="start-page-three-percent" :class="theme">
          <div :class="'start-page-three-percent-t'+theme2">{{ $t('base.START_PAGE_THREE_RAM_USAGE_HISTORY') }}</div>
          <IEcharts
            :option="optionRamHistory"
            :resizable="true"
            :style="'height:'+chartHeight+'px;'"
          />
        </div>
        <div class="start-page-three-percent" :class="theme">
          <div :class="'start-page-three-percent-t'+theme2">{{ $t('base.START_PAGE_THREE_NET_USAGE_HISTORY') }}
            <el-radio-group style="margin-left: 10px;" size="small" v-model="neName" @change="handleTabChange">
              <el-radio-button label="netin">{{ $t('base.START_PAGE_THREE_NET_IN_RATE') }}</el-radio-button>
              <el-radio-button label="netout">{{ $t('base.START_PAGE_THREE_NET_OUT_RATE') }}</el-radio-button>
            </el-radio-group>
          </div>
          <IEcharts
            ref="netchart"
            :option="optionNetHistory"
            :resizable="true"
            :style="'height:'+(chartHeight+1)+'px;'"
          />
        </div>
      </div>
      <div style="width: 300px;">
        <div :class="'start-page-three-percent ' + theme">
          <div :class="'start-page-three-percent-t'+ theme2">{{ $t('base.START_PAGE_THREE_CPU_USAGE_REAL_TIME') }}</div>
          <div :style="'height:'+chartHeight+'px;'">
            <div v-for="(item, index) in cpuInHost" :key="index">
              <el-row type="flex" justify="space-between" style="padding-top:10px;" v-if="index<5">
                <el-col :span="4"><div :class="clsssRender(index)">{{index+1}}</div></el-col>
                <el-col :span="16"><div :class="'top-line-middle ' + fontTheme" :title="item.name">{{item.name}}</div></el-col>
                <el-col :span="4"><div :class="'top-line-right ' + fontTheme">{{item.value.toFixed(2)}}%</div></el-col>
              </el-row>
            </div>
          </div>
        </div>
        <div :class="'start-page-three-percent ' + theme" style="margin-top:12px;">
          <div :class="'start-page-three-percent-t'+ theme2">{{ $t('base.START_PAGE_THREE_RAM_USAGE_REAL_TIME') }}</div>
          <div :style="'height:'+chartHeight+'px;'">
            <div v-for="(item, index) in memInHost" :key="index">
              <el-row type="flex" justify="space-between" style="padding-top:10px;" v-if="index<5">
                <el-col :span="4"><div :class="clsssRender(index)">{{index+1}}</div></el-col>
                <el-col :span="16"><div :class="'top-line-middle ' + fontTheme" :title="item.name">{{item.name}}</div></el-col>
                <el-col :span="4"><div :class="'top-line-right ' + fontTheme">{{item.value.toFixed(2)}}%</div></el-col>
              </el-row>
            </div>
          </div>
        </div>
        <div :class="'start-page-three-percent ' + theme" style="margin-top:12px;">
          <div :class="'start-page-three-percent-t'+ theme2">{{ $t('base.START_PAGE_THREE_NET_USAGE_REAL_TIME') }}</div>
          <div :style="'height:'+chartHeight+'px;'">
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
import networkImage from 'assets/img/startPageOne/network.png';
import userImage from 'assets/img/startPageOne/user.png';
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
      theme: this.$cookie.get("theme") == 'dark' ? 'dark' : 'light',
      theme2: this.$cookie.get("theme") == 'dark' ? '-dark' : '',
      fontTheme: this.$cookie.get("theme") == 'dark' ? 'fontDark' : 'fontLight',
      networkImage,
      userImage,
      vmTotal: 0,
      physicalhostNum: 0,
      baremachineNum: 0,
      neName:"netin",
      neNameBar: "netin",
      vmStatus: [{
        name:Vue.t('calcStorLang.running'), value:0
      }, {
         name:Vue.t('calcStorLang.error'), value:0
      }, {
         name:Vue.t('base.other'), value:0
      }],
      cpuInHost:[],
      memInHost:[],
      netInHost:[],
      startTime:"",
      endTime:"",
      physicalhostFlag: false,
      baremachineFlag: false,
      optionVM: { // 云主机总数
        color: ['#2fc25b', '#ef5350', '#ffa726'],
        tooltip : {
          show:true,
          formatter:function(params, ticket, callback) {
            return params.name+":"+params.value+'('+params.percent+'%)';
          }
        },
        legend: {
          show: true,
          orient:"horizontal",
          icon: 'circle',
          itemWidth: 6,
          itemHeight: 6,
          top: 'bottom',
          padding: [15, 10, 5, 10],
          textStyle: {
            color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999'
          },
          formatter: function(name) {
            return echarts.format.truncateText(name, 70);
          },
          tooltip: {
            show: true
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
      loadingCPUHistory:false,
      optionCPUHistory: { // TOP5-CPU历史使用率
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
            rotate: 20,
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
      loadingRamHistory:false,
      optionRamHistory: {  // TOP5-内存历史使用率
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
            rotate: 25,
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
      loadingNetHistory:false,
      optionNetHistory: { // TOP5-网络速率
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
            rotate: 25,
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
      loadingCPURealTime: false,
      optionCPURealTime: {  // TOP5-CPU实时速率
        color: ['#0087ed'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        yAxis: {
          type: 'category',
          inverse: true,
          data: [],
          axisLabel: {
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333',
            formatter: function (value, index) {
              return echarts.format.truncateText(value, 80);
            }
          },
          axisLine: {
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaaaaa'
            }
          },
          triggerEvent: true
        },
        xAxis: {
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
            }
          },
          max: 100,
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
          left: "100px",
          top: 28,
          bottom: 60,
          right: "10%"
        },
        series: []
      },
      loadingRamRealTime: false,
      optionRamRealTime: {  // TOP5-内存实时速率
        color: ['#0087ed'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        yAxis: {
          type: 'category',
          inverse: true,
          data: [],
          axisLabel: {
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333',
            formatter: function (value, index) {
              return echarts.format.truncateText(value, 80);
            }
          },
          axisLine: {
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaaaaa'
            }
          },
          triggerEvent: true
        },
        xAxis: {
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
            }
          },
          max: 100,
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
          left: "100px",
          top: 28,
          bottom: 60,
          right: "10%"
        },
        series: []
      },
      loadingNetRealTime: false,
      optionNetRealTime: {  // TOP5-网络实时速率
        color: ['#0087ed'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        yAxis: {
          type: 'category',
          inverse: true,
          data: [],
          axisLabel: {
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333',
            formatter: function (value, index) {
              return echarts.format.truncateText(value, 80);
            }
          },
          axisLine: {
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaaaaa'
            }
          },
          triggerEvent: true
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: true,
            lineStyle: {
              color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
            }
          },
          axisLabel:{
            rotate: 15,
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333'
          },
          axisLine: {
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaaaaa'
            }
          }
        },
        grid: {
          left: "100px",
          top: 28,
          bottom: 60,
          right: "10%"
        },
        series: []
      },
      tempHeight: 900,
      moreHeight: 0,
      chartHeight: 233
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
        this.tempHeight = this.$refs.page3.offsetHeight;
      });
      let self = this;
      self.getVMData();
      self.getCPUandMemHistory();
      self.getCustomPage();
    },
    getCustomPage() {
      let startcookie = this.$cookie.get('startpage');
      if (startcookie == null) {
        this.baremachineFlag = false;
        this.physicalhostFlag = false;
      } else {
        let ckList = startcookie.split(",")
        for (let i=0; i<ckList.length; i++) {
          if (ckList[i] == "physicalhost") {
            this.physicalhostFlag = true;
            this.getPhysicalHostData();
          } else if (ckList[i] == "baremachine") {
            this.baremachineFlag = true;
            this.getBareMachineData();
          }
        }
      }
    },
    async getVMData() {
      let self = this;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/nova/v2.1/servers-inspur/detail?all_tenants=1&limit=99999&not-tags=%40",
        headers: {
          'X-OpenStack-Nova-API-Version': 2.67
        }
      });
      this.vmTotal = ret.all_instances_info.total_instances;
      let vmStateNames = [];
      for (let i=0; i<self.vmStatus.length; i++) {
        self.vmStatus[i].value = 0;
        vmStateNames.push(self.vmStatus[i].name);
      }
      for (let i=0; i<ret.servers.length; i++) {
        let status = ret.servers[i]['status'];
        if (status === 'ACTIVE') {
          self.vmStatus[0].value++;
        } else if (status === 'ERROR') {
          self.vmStatus[1].value++;
        } else {
          self.vmStatus[2].value++;
        }
      }
      this.optionVM.series[0].data = self.vmStatus;
      this.optionVM.legend.data = vmStateNames;
    },
    async getPhysicalHostData() {
      let self = this;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/nova/v2.1/servers-inspur/detail?all_tenants=1" + "&tags=@",
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: false
        });
        self.physicalhostNum = ret["all_instances_info"]["total_instances"];
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async getBareMachineData() {
      let self = this;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: 'api/ironic/v1/nodes_inspur?is_adopt=no&detail=True',
          headers: {
            "X-Openstack-Ironic-Api-Version": "latest"
          },
          showErrMsg: false
        });
        self.baremachineNum = ret['nodes'].length;
      } catch (e) {
        __DEV__ && console.error(e);
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
    async getCPUHistory(startTime, endTime) {
      let self = this;
      self.optionCPUHistory.series = [];
      self.loadingCPUHistory = true;
      self.loadingCPURealTime = true;
      self.optionCPUHistory.legend.data = [];
      let param = {type:'vm_cpu', num:'5', history:'1', starttime:startTime, endtime:endTime};
      let ret = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/bigscreen/topN?" + $.param(param),
        showErrMsg:false
      });
      self.loadingCPUHistory = false;
      self.loadingCPURealTime = false;
      if (ret.code == "-1") {
        return;
      }
      let history = ret.data.history;
      let realtime = ret.data.realtime;
      let xData = [];
      let legentData = [];
      let xflag = 0;
      for (let key in history) {
        let realData = realtime.find(item => item.id === key);
        let name = realData.name;
        legentData.push({name:name});
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
        self.optionCPUHistory.series.push({
          name: name,
          data: yData,
          smooth: true,
          type: 'line',
          connectNulls: false,
          showSymbol: false
        });
      }
      self.optionCPUHistory.xAxis.data = xData;
      self.optionCPUHistory.legend.data = legentData;
      //实时
      let currentData = ret.data.realtime;
      self.optionCPURealTime.yAxis.data = currentData.map(item => item.name);
      self.optionCPURealTime.series = [{
        type: 'bar',
        barWidth: '10px',
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'right',
              formatter: '{c}%',
              color: '#666666'
            }
          }
        },
        data: currentData.map(item => item.value)
      }];
      self.cpuInHost = currentData;
      self.cpuInHost.sort(self.compare("value"));
    },
    async getMemoryHistory(startTime, endTime) {
      let self = this;
      self.optionRamHistory.series = [];
      self.loadingRamHistory = true;
      self.loadingRamRealTime = true;
      self.optionRamHistory.legend.data = [];
      let param = {type:'vm_mem', num:'5', history:'1', starttime:startTime, endtime:endTime};
      let ret = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/bigscreen/topN?" + $.param(param),
        showErrMsg:false
      });
      self.loadingRamHistory = false;
      self.loadingRamRealTime = false;
      if (ret.code == "-1") {
        return;
      }
      let history = ret.data.history;
      let realtime = ret.data.realtime;
      let xData = [];
      let legentData = [];
      let xflag = 0;
      for (let key in history) {
        let realData = realtime.find(item => item.id === key);
        let name = realData.name;
        legentData.push({name:name});
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
        self.optionRamHistory.series.push({
          name: name,
          data: yData,
          smooth: true,
          type: 'line',
          connectNulls: false,
          showSymbol: false
        })
      }
      self.optionRamHistory.xAxis.data = xData;
      self.optionRamHistory.legend.data = legentData;
      //实时
      let currentData = ret.data.realtime;
      self.optionRamRealTime.yAxis.data = currentData.map(item => item.name);
      self.optionRamRealTime.series = [{
        type: 'bar',
        barWidth: '10px',
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: 'right',
              formatter: '{c}%',
              color: '#666666'
            }
          }
        },
        data: currentData.map(item => item.value)
      }];
      self.memInHost = currentData;
      self.memInHost.sort(self.compare("value"));
    },
    async getNetInHistory(startTime, endTime, val, time) {
      let self = this;
      self.loadingNetHistory = true;
      self.loadingNetRealTime = true;
      let param = {type:'vm_'+val, num:'5', history:'1', starttime:startTime, endtime:endTime};
      let ret = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/bigscreen/topN?" + $.param(param),
        showErrMsg:false
      });
      self.loadingNetHistory = false;
      self.loadingNetRealTime = false;
      if (ret.code == "-1") {
        return;
      }
      if (time == "history" || time == "all") {
        self.optionNetHistory.series = [];
        self.optionNetHistory.legend.data = [];
        self.$refs.netchart.clear();
        let history = ret.data.history;
        let realtime = ret.data.realtime;
        let xData = [];
        let legentData = [];
        let xflag = 0;
        for (let key in history) {
          let realData = realtime.find(item => item.id === key);
          let name = realData.name;
          legentData.push({name:name});
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
          self.optionNetHistory.series.push({
            name: name,
            data: yData,
            smooth: true,
            type: 'line',
            connectNulls: false,
            showSymbol: false
          });
        }
      }
      let currentData = ret.data.realtime;
      self.netInHost = currentData;
      self.netInHost.sort(self.compare("value"));
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
  width: 160px;
}
.top-line-right {
  font-size: 14px;
  font-weight: 400;
  position: absolute;
  right: 10px;
}
.start-page-three {
  height: 131px;
}
.start-page-three-percent {
  padding: 3px;
  border-radius: 4px;
  border: none;
  margin-bottom: 12px;
}
.start-page-three-percent-t {
  margin: 10px 20px 0px 10px;
  font-weight: 600;
  font-size: 14px;
  color: #333333;
  height: 30px;
}
.start-page-three-percent-t-dark {
  margin: 10px 20px 0px 10px;
  font-weight: 600;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  height: 32px;
}
.start-page-three-percent.physical-host {
  background-color:#0087ed;
  margin-top:12px;
  overflow: hidden;
}
.start-page-three-percent.bare-machine {
  background-color:#2fc25b;
  margin-top:12px;
  overflow: hidden;
}
.start-page-three-t {
  font-size: 14px;
  color:#fff;
  padding-top:36px;
  padding-left:25px;
}
.start-page-three-b {
  height: 43px;
  font-size: 20px;
  color:#fff;
  padding-left:25px;
}
.start-page-three-right {
  overflow: hidden;
  float: right;
  margin-right: -15px;
  margin-top: 5px;
}
.start-page-three-right img{
  display: block;
  margin:auto;
  padding-top:36px;
  float: right;
  width: 45px;
  height: 43px;
}
</style>
