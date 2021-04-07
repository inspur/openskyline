<template>
  <div ref="page4">
    <el-row :gutter="6">
      <el-col :span="18">
        <div class="health-status">
          <div class="summary-panel-wrapper" @click="JumptoHealthStatus">
            <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_HOST')" :okCount="host.okCount" :midCount="host.midCount" :errCount="host.errCount" :total="host.total" :loading="host.loading" :error="host.error" />
            <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_SDS')" :okCount="sds.okCount" :midCount="sds.midCount" :errCount="sds.errCount" :total="sds.total" :loading="sds.loading" :error="sds.error" />
            <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_DOCKER')" :okCount="docker.okCount" :midCount="docker.midCount" :errCount="docker.errCount" :total="docker.total" :loading="docker.loading" :error="docker.error" />
            <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_API')" :okCount="api.okCount" :midCount="api.midCount" :errCount="api.errCount" :total="api.total" :loading="api.loading" :error="api.error" />
            <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_OPENSTACK')" :okCount="openstack.okCount" :midCount="openstack.midCount" :errCount="openstack.errCount" :total="openstack.total" :loading="openstack.loading" :error="openstack.error" />
            <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_DB')" :okCount="db.okCount" :midCount="db.midCount" :errCount="db.errCount" :total="db.total" :loading="db.loading" :error="db.error" />
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <el-row :gutter="6">
        <el-col :span="12" class="clickStyle">
          <div :class="'start-page-four'+theme" @click="JumpToWarning('LOST')">
            <div :class="'start-page-four-t'+theme">
              <span>{{$t('base.lostAlarm')}}</span>
            </div>
            <div class="start-page-four-lost">
              <span>{{lostNum}}</span>
            </div>
          </div>  
        </el-col>
        <el-col :span="12" class="clickStyle">
          <div :class="'start-page-four'+theme" @click="JumpToWarning('CRITICAL')">
            <div :class="'start-page-four-t'+theme">
              <span>{{$t('base.critAlarm')}}</span>
            </div>
            <div class="start-page-four-cirt">
              <span>{{critNum}}</span>
            </div>
          </div>  
        </el-col>
        <el-col :span="12" style="padding-top:6px;" class="clickStyle">
          <div :class="'start-page-four'+theme" @click="JumpToWarning('WARNING')">
            <div :class="'start-page-four-t'+theme">
              <span>{{$t('base.slightAlarm')}}</span>
            </div>
            <div class="start-page-four-warn">
              <span>{{warnNum}}</span>
            </div>
          </div>  
        </el-col>
        <el-col :span="12" style="padding-top:6px;" class="clickStyle">
          <div :class="'start-page-four'+theme" @click="JumpToWarning('OK_RECOVERY')">
            <div :class="'start-page-four-t'+theme">
              <span>{{$t('network.backtonormal')}}</span>
            </div>
            <div class="start-page-four-recovery">
              <span>{{recoveryNum}}</span>
            </div>
          </div>
        </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row :gutter="6" :class="'unhealth-top'+theme">
      <el-col :span="4" v-loading="loadinghost">
        <div class="page-four-unhealth" style="height:400px;">
          <div :class="'page-four-unhealth-t'+theme">{{$t('container.unhealthyHost')}}</div>
          <div class="page-four-unhealth-b">
            <div v-for="(item, index) in hostData" :key="index">
              <div :class="item.class" @click="hostClickFun(item.resource_id, item)">
                <img :src='item.image'/>
                <el-tooltip trigger="hover" effect="dark" placement="right" :content="item.name">
                <div style="padding-left:15px;">{{item.nameshot}}</div>
                </el-tooltip>
              </div>
              <div class="transdiv" v-if="item.class=='unhealth-selected'"></div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="20" :class="'page-four-usage'+theme">
        <el-col :span="12">
          <div class="page-four-percent">
            <div :class="'page-four-percent-t'+theme">{{$t('monitor.cpuUtilization')}}(%)</div>
            <IEcharts 
              ref="option1" 
              :option="option1"
              :resizable="true" 
              :style="'height:'+chartHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="page-four-percent" >
            <div :class="'page-four-percent-t'+theme">{{$t('base.memUtilization')}}(%)</div>
            <IEcharts 
              ref="option2" 
              :option="option2"
              :resizable="true" 
              :style="'height:'+chartHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="page-four-percent">
            <div :class="'page-four-percent-t'+theme">{{$t('base.disk')}}I/O(MB/s)</div>
            <IEcharts 
              ref="option3" 
              :option="option3"
              :resizable="true" 
              :style="'height:'+chartHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="page-four-percent">
            <div :class="'page-four-percent-t'+theme">{{$t('base.network')}}I/O(KB/s)</div>
            <IEcharts 
              ref="option4" 
              :option="option4"
              :resizable="true" 
              :style="'height:'+chartHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
      </el-col>
    </el-row>
    <el-row :gutter="6" :class="'unhealth-top'+theme">
      <el-col :span="4" v-loading="loadingvm">
        <div class="page-four-unhealth" style="height:402px;">
          <div :class="'page-four-unhealth-t'+theme">{{$t('container.unhealthvm')}}</div>
          <div class="page-four-unhealth-b">
            <div v-for="(item, index) in vmData" :key="index">
              <div :class="item.class" @click="vmClickFun(item.resource_id, item)">
                <img :src='item.image'/>
                <el-tooltip trigger="hover" effect="dark" placement="right" :content="item.name">
                <div style="padding-left:15px;">{{item.nameshot}}</div>
                </el-tooltip>
              </div>
              <div class="transdiv" v-if="item.class=='unhealth-selected'"></div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="20" :class="'page-four-usage'+theme">
        <el-col :span="12">
          <div class="page-four-percent">
            <div :class="'page-four-percent-t'+theme">{{$t('monitor.cpuUtilization')}}(%)</div>
            <IEcharts 
              ref="option5" 
              :option="option5"
              :resizable="true" 
              :style="'height:'+chartHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="page-four-percent">
            <div :class="'page-four-percent-t'+theme">{{$t('base.memUtilization')}}(%)</div>
            <IEcharts 
              ref="option6" 
              :option="option6"
              :resizable="true" 
              :style="'height:'+chartHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="page-four-percent">
            <div :class="'page-four-percent-t'+theme">{{$t('base.disk')}}I/O(MB/s)</div>
            <IEcharts 
              ref="option7" 
              :option="option7"
              :resizable="true" 
              :style="'height:'+(chartHeight+2)+'px;'">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="page-four-percent">
            <div :class="'page-four-percent-t'+theme">{{$t('base.network')}}I/O(KB/s)</div>
            <IEcharts 
              ref="option8" 
              :option="option8"
              :resizable="true" 
              :style="'height:'+(chartHeight+2)+'px;'">
            </IEcharts>
          </div>
        </el-col>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import SummaryPanel from './SummaryPanel';
import lostImage from 'assets/img/startPage/lost.png';
import criticalImage from 'assets/img/startPage/critical.png';
import recoveryImage from 'assets/img/startPage/recovery.png';
import alarmImage from 'assets/img/startPage/alarm.png';
const chartColors = [
  'rgba(0,71,133,0.85)',
  'rgba(24,144,255,0.85)',
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
  name: 'HealthStatus',
  components: {
    [SummaryPanel.name]: SummaryPanel
  },
  data() {
    return {
      theme:this.$cookie.get("theme")=="dark"?'-dark':'',
      lostImage,
      criticalImage,
      recoveryImage,
      alarmImage,
      host: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      },
      sds: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      },
      docker: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      },
      api: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      },
      openstack: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      },
      db: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      },
      lostNum:0,
      warnNum:0,
      critNum:0,
      okNum:0,
      recoveryNum:0,
      loadinghost:false,
      loadingvm:false,
      hostData:[],
      startTime:"",
      endTime:"",
      loading1: false,
      option1:{
        title: {
          show: false,
          left: "center",
          bottom: '50%',
          text:Vue.t("base.noData"),
          textStyle: {
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            fontSize: 14,
            fontWeight:'normal'
          }
        },
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          show: true,
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            rotate: 30,
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis:{
          show: true,
          type:'value',
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        grid:{
          left:32,
          top:20,
          bottom:30,
          right:0
        },
        series:[{
          data:[],
          smooth:true,
          symbol: 'none',
          type:'line',
          areaStyle:{
            normal:{
              color:'rgba(24,144,255,0.2)'
            }
          },
          lineStyle:{
            normal:{
              color:'rgba(24,144,255,0.85)'
            }
          }
        }]
      },
      loading2:false,
      option2:{
        title: {
          show: false,
          left: "center",
          bottom: '50%',
          text:Vue.t("base.noData"),
          textStyle: {
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            fontSize: 14,
            fontWeight:'normal'
          }
        },
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            rotate: 30,
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis:{
          type:'value',
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        grid:{
          left:32,
          top:20,
          bottom:30,
          right:0
        },
        series:[{
          data:[],
          smooth:true,
          symbol: 'none',
          type:'line',
          areaStyle:{
            normal:{
              color:'rgba(24,144,255,0.2)'
            }
          },
          lineStyle:{
            normal:{
              color:'rgba(24,144,255,0.85)'
            }
          },
          splitLine: {
            show: false
          }
        }]
      },
      vmData: [],
      loading5: false,
      option5:{
        title: {
          show: false,
          left: "center",
          bottom: '50%',
          text:Vue.t("base.noData"),
          textStyle: {
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            fontSize: 14,
            fontWeight:'normal'
          }
        },
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          show: true,
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            rotate: 30,
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis:{
          show: true,
          type:'value',
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        grid:{
          left:32,
          top:20,
          bottom:30,
          right:0
        },
        series:[{
          data:[],
          smooth:true,
          symbol: 'none',
          type:'line',
          areaStyle:{
            normal:{
              color:'rgba(24,144,255,0.2)',
              opacity:0.4
            }
          },
          lineStyle:{
            normal:{
              color:'rgba(24,144,255,0.85)'
            }
          }
        }]
      },
      loading6:false,
      option6:{
        title: {
          show: false,
          left: "center",
          bottom: '50%',
          text:Vue.t("base.noData"),
          textStyle: {
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            fontSize: 14,
            fontWeight:'normal'
          }
        },
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            rotate: 30,
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis:{
          type:'value',
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        grid:{
          left:32,
          top:20,
          bottom:30,
          right:0
        },
        series:[{
          data:[],
          smooth:true,
          symbol: 'none',
          type:'line',
          areaStyle:{
            normal:{
              color:'rgba(24,144,255,0.2)',
              opacity:0.4
            }
          },
          lineStyle:{
            normal:{
              color:'rgba(24,144,255,0.85)'
            }
          },
          splitLine: {
            show: false
          }
        }]
      },
      loading3:false,
      legend3:[],
      option3:{
        color: chartColors,
        title: {
          show: false,
          left: "center",
          bottom: '50%',
          text:Vue.t("base.noData"),
          textStyle: {
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            fontSize: 14,
            fontWeight:'normal'
          }
        },
        tooltip:{
          trigger:'axis'
        },
        legend: {
          type: 'scroll',
          icon:"circle",
          itemWidth: 6,
          itemHeight: 6,
          top: 0,
          right: 20,
          textStyle: {
            color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999'
          },
          data: []
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            rotate: 30,
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis:{
          type:'value',
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        grid:{
          left:32,
          top:20,
          bottom:30,
          right:0
        },
        series:[]
      },
      loading4:false,
      legend4:[],
      option4:{
        color: chartColors,
        title: {
          show: false,
          left: "center",
          bottom: '50%',
          text:Vue.t("base.noData"),
          textStyle: {
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            fontSize: 14,
            fontWeight:'normal'
          }
        },
        tooltip:{
          trigger:'axis'
        },
        legend: {
          type: 'scroll',
          icon:"circle",
          itemWidth: 6,
          itemHeight: 6,
          top: 0,
          right: 20,
          textStyle: {
            color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999'
          },
          data: []
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            rotate: 30,
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis:{
          type:'value',
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        grid:{
          left:45,
          top:20,
          bottom:30,
          right:0
        },
        series:[]
      },
      loading7:false,
      legend7:[],
      option7:{
        color: chartColors,
        title: {
          show: false,
          left: "center",
          bottom: '50%',
          text:Vue.t("base.noData"),
          textStyle: {
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            fontSize: 14,
            fontWeight:'normal'
          }
        },
        tooltip:{
          trigger:'axis'
        },
        legend: {
          type: 'scroll',
          icon:"circle",
          itemWidth: 6,
          itemHeight: 6,
          top: 0,
          right: 20,
          textStyle: {
            color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999'
          },
          data: []
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            rotate: 30,
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis:{
          type:'value',
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        grid:{
          left:32,
          top:20,
          bottom:50,
          right:0
        },
        series:[]
      },
      loading8:false,
      legend8:[],
      option8:{
        color: chartColors,
        title: {
          show: false,
          left: "center",
          bottom: '50%',
          text:Vue.t("base.noData"),
          textStyle: {
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            fontSize: 14,
            fontWeight:'normal'
          }
        },
        tooltip:{
          trigger:'axis'
        },
        legend: {
          type: 'scroll',
          icon:"circle",
          itemWidth: 6,
          itemHeight: 6,
          top: 0,
          right: 20,
          textStyle: {
            color: this.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999'
          },
          data: []
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            rotate: 30,
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis:{
          type:'value',
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        grid:{
          left:45,
          top:20,
          bottom:50,
          right:0
        },
        series:[]
      },
      tempHeight: 1200,
      chartHeight: 208,
      moreHeight: 0
    }
  },
  mounted () {
  },
  methods: {
    initStartPage() {
      this.$nextTick(() => {
        this.tempHeight = this.$refs.page4.offsetHeight;
      });
      let bodyHeight = document.body.clientHeight;
      if (bodyHeight - 1309 > 0) {
        this.moreHeight = bodyHeight - 1309;
      }
      this.chartHeight+= this.moreHeight*0.25;
      const $this = this;
      $this.getHostData();
      $this.getSDSData();
      $this.getDockerData();
      $this.getAPIData();
      $this.getOpenStackData();
      $this.getDBData();
      $this.getAlartData();
      $this.getUnHealthList("hs");
      $this.getUnHealthList("vm");
    },
    async getAlartData() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: 'api/pluto/v1/alert/summary',
          showErrMsg:false
        });
        $this.critNum = res.alert_info.crit_num;
        $this.warnNum = res.alert_info.warn_num;
        $this.lostNum = res.alert_info.lost_num;
        $this.recoveryNum = res.alert_info.recovery_num;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async getHostData() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: 'api/pluto/v1/monitor/health/host',
          showErrMsg:false
        });
        $this.host.okCount = res.ok_count;
        $this.host.midCount = res.mid_count;
        $this.host.errCount = res.err_count;
        $this.host.total = res.total;
        $this.host.error = false;
        $this.host.loading = false;
        if (res.error == "error") {
          $this.host.error = true;
        }
      } catch (e) {
        $this.host.okCount = 0;
        $this.host.midCount = 0;
        $this.host.errCount = 0;
        $this.host.total = 0;
        $this.host.error = true;
        $this.host.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async getSDSData() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: 'api/pluto/v1/monitor/health/sds',
          showErrMsg:false
        });
        $this.sds.okCount = res.ok_count;
        $this.sds.midCount = res.mid_count;
        $this.sds.errCount = res.err_count;
        $this.sds.total = res.total;
        $this.sds.loading = false;
        $this.sds.error = false;
        if (res.error == "error") {
          $this.sds.error = true;
        }
      } catch (e) {
        $this.sds.error = true;
        $this.sds.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async getDockerData() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: 'api/pluto/v1/monitor/health/docker',
          showErrMsg:false
        });
        $this.docker.okCount = res.ok_count;
        $this.docker.errCount = res.err_count;
        $this.docker.total = res.total;
        $this.docker.loading = false;
        $this.docker.error = false;
        if (res.error == "error") {
          $this.docker.error = true;
        }
      } catch (e) {
        $this.docker.error = true;
        $this.docker.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async getAPIData() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: 'api/pluto/v1/monitor/health/api',
          showErrMsg:false
        });
        $this.api.okCount = res.ok_count;
        $this.api.midCount = res.mid_count;
        $this.api.errCount = res.err_count;
        $this.api.total = res.total;
        $this.api.loading = false;
        $this.api.error = false;
        if (res.error == "error") {
          $this.api.error = true;
        }
      } catch (e) {
        $this.api.error = true;
        $this.api.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async getOpenStackData() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: 'api/pluto/v1/monitor/health/openstack',
          showErrMsg:false
        });
        $this.openstack.okCount = res.ok_count;
        $this.openstack.midCount = res.mid_count;
        $this.openstack.errCount = res.err_count;
        $this.openstack.total = res.total;
        $this.openstack.loading = false;
        $this.openstack.error = false;
        if (res.error == "error") {
          $this.openstack.error = true;
        }
      } catch (e) {
        $this.openstack.error = true;
        $this.openstack.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async getDBData() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: 'api/pluto/v1/monitor/health/db',
          showErrMsg:false
        });
        $this.db.okCount = res.ok_count;
        $this.db.midCount = res.mid_count;
        $this.db.errCount = res.err_count;
        $this.db.total = res.total;
        $this.db.loading = false;
        $this.db.error = false;
        if (res.error == "error") {
          $this.db.error = true;
        }
      } catch (e) {
        $this.db.error = true;
        $this.db.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async getUnHealthList(type) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: 'api/pluto/v1/monitor/bigscreen/unhealth?type='+type+"&num=99",
          showErrMsg:false
        });
        let data = res.data;
        let dataList = [];
        for (let i = 0; i < data.length; i++) {
          let name = data[i]["name"];
          let realLength = this.toRealLength(name);
          if (realLength > 8) {
            data[i]["nameshot"] = name.substring(0, 8) + "...";
          } else {
            data[i]["nameshot"] = data[i]["name"];
          }
          data[i]["class"] = "unhealth-unselected"+this.theme;
          if (i == 0) {
            data[i]["class"] = "unhealth-selected"+this.theme;
          }
          if (data[i].status == "LOST") {
            data[i]["image"] = this.lostImage;
          } else if (data[i].status == "CRITICAL") {
            data[i]["image"] = this.criticalImage;
          } else if (data[i].status == "WRANING") {
            data[i]["image"] = this.alarmImage;
          } else {
            data[i]["image"] = this.recoveryImage;
          }
        }
        if (type=="hs") {
          $this.hostData = data;
          if (data.length > 0) {
            $this.hostClickFun(data[0]["resource_id"], data[0]);
          }
        } else if (type == "vm") {
          $this.vmData = data;
          if (data.length > 0) {
            $this.vmClickFun(data[0]["resource_id"], data[0]);
          }
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    toRealLength(str) {
      let realLength=0;
      for (let i=0; i<str.length; i++) {
        let codechar = str.charCodeAt(i);
        if (codechar >=19968 && codechar <= 40869) {
          realLength+=2;
        } else {
          realLength+=1;
        }
      }
      return realLength;
    },
    hostClickFun(id, item) {
      for (let i = 0; i < this.hostData.length; i++) {
        this.hostData[i]["class"] = "unhealth-unselected"+this.theme;
      }
      item["class"] = "unhealth-selected"+this.theme;
      let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
      this.endTime = parseInt(date.getTime()/1000);
      this.startTime = parseInt((date.setDate(date.getDate()-1))/1000);
      this.getUnHealthData(item, this.startTime, this.endTime, "hs");
    },
    vmClickFun(id, item) {
       for (let i = 0; i < this.vmData.length; i++) {
        this.vmData[i]["class"] = "unhealth-unselected"+this.theme;
      }
      item["class"] = "unhealth-selected"+this.theme;
      let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
      this.endTime = parseInt(date.getTime()/1000);
      this.startTime = parseInt((date.setDate(date.getDate()-1))/1000);
      this.getUnHealthData(item, this.startTime, this.endTime, "vm");
    },
    async getUnHealthData(item, startTime, endTime, type) {
      let self = this;
      if (type == "hs") {
        self.option1.series[0].data = [];
        self.option2.series[0].data = [];
        self.option3.series = [];
        self.option4.series = [];
        self.$refs.option1.clear();
        self.$refs.option2.clear();
        self.$refs.option3.clear();
        self.$refs.option4.clear();
        self.loading1 = true;
        self.loading2 = true;
        self.loading3 = true;
        self.loading4 = true;
        self.loadinghost = true;
        let param = {resource_id:item["resource_id"], starttime:startTime, endtime:endTime};
        let ret = await this.$ajax({
          type: 'get',
          url: "api/pluto/v1/monitor/bigscreen/unhealth/data?" + $.param(param),
          showErrMsg:false
        });
        self.loading1 = false;
        self.loading2 = false;
        self.loading3 = false;
        self.loading4 = false;
        self.loadinghost = false;
        if (ret.code == "-1") {
          return;
        }
        let cpudata = ret.data.cpu;
        let memdata = ret.data.mem;
        let diskindata = ret.data.diskin;
        let diskoutdata = ret.data.diskout;
        let netindata = ret.data.netin;
        let netoutdata = ret.data.netout;
        //CPU
        let xDatacpu = [];
        let yDatacpu = [];
        if (cpudata.length == 0) {
          self.option1.title.show = true;
        } else {
          for (let i=0; i<cpudata.length; i++) {
            xDatacpu.push(self.convertX(cpudata[i][0]));
            yDatacpu.push(cpudata[i][1]);
          }
          self.option1.title.show = false;
          self.option1.series[0].data = yDatacpu;
          self.option1.xAxis.data = xDatacpu;
        }
        //内存
        let xDatamem = [];
        let yDatamem = [];
        if (memdata.length == 0) {
          self.option2.title.show = true;
        } else {
          self.option2.title.show = false;
          for (let i=0; i<memdata.length; i++) {
            xDatamem.push(self.convertX(memdata[i][0]));
            yDatamem.push(memdata[i][1]);
          }
          self.option2.series[0].data = yDatamem;
          self.option2.xAxis.data = xDatamem;
        }
        //磁盘
        let xDatadisk = [];
        let yDatadiskin = [];
        let yDatadiskout = [];
        if (diskindata.length == 0 && diskoutdata.length == 0) {
          self.option3.title.show = true;
        } else {
          self.option3.title.show = false;
          for (let i=0; i<diskindata.length; i++) {
            xDatadisk.push(self.convertX(diskindata[i][0]));
            yDatadiskin.push(diskindata[i][1]);
          }
          for (let i=0; i<diskoutdata.length; i++) {
            yDatadiskout.push(diskoutdata[i][1]);
          }
          self.legend3 = [{
            name:Vue.t('container.diskin')
          }, {
            name:Vue.t('container.diskout')
          }];
          self.option3.series.push({
            name: Vue.t('container.diskin'),
            data: yDatadiskin,
            smooth: true,
            type: 'line',
            connectNulls: false,
            showSymbol: false,
            areaStyle:{
              normal:{
                color:'rgba(0,71,133,0.2)'
              }
            },
            lineStyle:{
              normal:{
                color:'rgba(0,71,133,0.85)'
              }
            }
          });
          self.option3.series.push({
            name: Vue.t('container.diskout'),
            data: yDatadiskout,
            smooth: true,
            type: 'line',
            showSymbol: false,
            areaStyle:{
              normal:{
                color:'rgba(24,144,255,0.2)'
              }
            },
            lineStyle:{
              normal:{
                color:'rgba(24,144,255,0.85)'
              }
            }
          })
          self.option3.xAxis.data = xDatadisk;
          self.option3.legend.data = self.legend3;
        }
        //网络
        let xDatanet = [];
        let yDatanetin = [];
        let yDatanetout = [];
        if (netindata.length == 0 && netoutdata.length == 0) {
          self.option4.title.show = true;
        } else {
          self.option4.title.show = false;
          for (let i=0; i<netindata.length; i++) {
            xDatanet.push(self.convertX(netindata[i][0]));
            yDatanetin.push(netindata[i][1]);
          }
          for (let i=0; i<netoutdata.length; i++) {
            yDatanetout.push(netoutdata[i][1]);
          }
          self.option4.series.push({
            name: Vue.t('base.START_PAGE_THREE_NET_IN_RATE'),
            data: yDatanetin,
            smooth: true,
            type: 'line',
            connectNulls: false,
            showSymbol: false,
            areaStyle:{
              normal:{
                color:'rgba(0,71,133,0.2)'
              }
            },
            lineStyle:{
              normal:{
                color:'rgba(0,71,133,0.85)'
              }
            }
          });
          self.option4.series.push({
            name: "Vue.t('base.START_PAGE_THREE_NET_OUT_RATE')",
            data: yDatanetout,
            smooth: true,
            type: 'line',
            connectNulls: false,
            showSymbol: false,
            areaStyle:{
              normal:{
                color:'rgba(24,144,255,0.2)'
              }
            },
            lineStyle:{
              normal:{
                color:'rgba(24,144,255,0.85)'
              }
            }
          })
          self.option4.xAxis.data = xDatanet;
          self.legend4 = [{
            name: Vue.t('base.START_PAGE_THREE_NET_IN_RATE'),
            textStyle: {
              color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
            }
          }, {
            name:  "Vue.t('base.START_PAGE_THREE_NET_OUT_RATE')",
            textStyle: {
              color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
            }
          }];
          self.option4.legend.data = self.legend4;
        }
      } else {
        self.option5.series[0].data = [];
        self.option6.series[0].data = [];
        self.option7.series = [];
        self.option8.series = [];
        self.$refs.option6.clear();
        self.$refs.option7.clear();
        self.$refs.option5.clear();
        self.$refs.option8.clear();
        self.loading5 = true;
        self.loading6 = true;
        self.loading7 = true;
        self.loading8 = true;
        self.loadingvm = true;
        let param = {resource_id:item["resource_id"], starttime:startTime, endtime:endTime};
        let ret = await this.$ajax({
          type: 'get',
          url: "api/pluto/v1/monitor/bigscreen/unhealth/data?" + $.param(param),
          showErrMsg:false
        });
        self.loading5 = false;
        self.loading6 = false;
        self.loading7 = false;
        self.loading8 = false;
        self.loadingvm = false;
        if (ret.code == "-1") {
          return;
        }
        let cpudata = ret.data.cpu;
        let memdata = ret.data.mem;
        let diskindata = ret.data.diskin;
        let diskoutdata = ret.data.diskout;
        let netindata = ret.data.netin;
        let netoutdata = ret.data.netout;
        //CPU
        let xDatacpu = [];
        let yDatacpu = [];
        if (cpudata.length == 0) {
          self.option5.title.show = true;
        } else {
          self.option5.title.show = false;
          for (let i=0; i<cpudata.length; i++) {
            xDatacpu.push(self.convertX(cpudata[i][0]));
            yDatacpu.push(cpudata[i][1]);
          }
          self.option5.series[0].data = yDatacpu;
          self.option5.xAxis.data = xDatacpu;
        }
        //内存
        let xDatamem = [];
        let yDatamem = [];
        if (cpudata.length == 0) {
          self.option6.title.show = true;
        } else {
          self.option6.title.show = false;
          for (let i=0; i<memdata.length; i++) {
            xDatamem.push(self.convertX(memdata[i][0]));
            yDatamem.push(memdata[i][1]);
          }
          self.option6.series[0].data = yDatamem;
          self.option6.xAxis.data = xDatamem;
        }
        //磁盘
        let xDatadisk = [];
        let yDatadiskin = [];
        let yDatadiskout = [];
        if (diskindata.length == 0 && diskindata.length == 0) {
          self.option7.title.show = true;
        } else {
          self.option7.title.show = false;
          for (let i=0; i<diskindata.length; i++) {
            xDatadisk.push(self.convertX(diskindata[i][0]));
            yDatadiskin.push(diskindata[i][1]);
          }
          for (let i=0; i<diskoutdata.length; i++) {
            yDatadiskout.push(diskoutdata[i][1]);
          }
          self.option7.series.push({
            name: Vue.t('container.diskin'),
            data: yDatadiskin,
            smooth: true,
            type: 'line',
            showSymbol: false,
            areaStyle:{
              normal:{
                color:'rgba(0,71,133,0.2)'
              }
            },
            lineStyle:{
              normal:{
                color:'rgba(0,71,133,0.85)'
              }
            }
          });
          self.option7.series.push({
            name: Vue.t('container.diskout'),
            data: yDatadiskout,
            smooth: true,
            type: 'line',
            showSymbol: false,
            areaStyle:{
              normal:{
                color:'rgba(24,144,255,0.2)'
              }
            },
            lineStyle:{
              normal:{
                color:'rgba(24,144,255,0.85)'
              }
            }
          })
          self.option7.xAxis.data = xDatadisk;
          self.legend7 = [{
            name: Vue.t('container.diskin')
          }, {
            name:  Vue.t('container.diskout')
          }];
          self.option7.legend.data = self.legend7;
        }
        //网络
        let xDatanet = [];
        let yDatanetin = [];
        let yDatanetout = [];
        if (netindata.length == 0 && netoutdata.length == 0) {
          self.option8.title.show = true;
        } else {
          self.option8.title.show = false;
          for (let i=0; i<netindata.length; i++) {
            xDatanet.push(self.convertX(netindata[i][0]));
            yDatanetin.push(netindata[i][1]);
          }
          for (let i=0; i<netoutdata.length; i++) {
            yDatanetout.push(netoutdata[i][1]);
          }
          self.option8.series.push({
            name: Vue.t('base.START_PAGE_THREE_NET_IN_RATE'),
            data: yDatanetin,
            smooth: true,
            type: 'line',
            showSymbol: false,
            areaStyle:{
              normal:{
                color:'rgba(0,71,133,0.2)'
              }
            },
            lineStyle:{
              normal:{
                color:'rgba(0,71,133,0.85)'
              }
            }
          });
          self.option8.series.push({
            name: "Vue.t('base.START_PAGE_THREE_NET_OUT_RATE')",
            data: yDatanetout,
            smooth: true,
            type: 'line',
            showSymbol: false,
            areaStyle:{
              normal:{
                color:'rgba(24,144,255,0.2)'
              }
            },
            lineStyle:{
              normal:{
                color:'rgba(24,144,255,0.85)'
              }
            }
          })
          self.option8.xAxis.data = xDatanet;
          self.legend8 = [{
            name: Vue.t('base.START_PAGE_THREE_NET_IN_RATE')
          }, {
            name: "Vue.t('base.START_PAGE_THREE_NET_OUT_RATE')"
          }];
          self.option8.legend.data = self.legend8;
        }
      }
    },
    convertX(str) {
      str = str.replace('T', ' ').replace('Z', '');
      //let time = new Date(str).getTime()-new Date().getTimezoneOffset()*60*1000;
      let time = this.$stringToDate(str).getTime()-new Date().getTimezoneOffset()*60*1000;
      let date = new Date(time);
      let month = date.getMonth()+1>9?date.getMonth()+1:"0"+(date.getMonth()+1);
      let day = date.getDate()>9?date.getDate():"0"+date.getDate();
      let hour = date.getHours()>9?date.getHours():"0"+date.getHours();
      let min = date.getMinutes()>9?date.getMinutes():"0"+date.getMinutes();
      let sec = date.getSeconds()>9?date.getSeconds():"0"+date.getSeconds();
      return date.getFullYear()+"-"+month+"-"+day+" "+hour+":"+min+":"+sec;
    },
    formatX(str) {
      let date = this.$stringToDate(str);
      let mon = date.getMonth()+1>9?date.getMonth()+1:"0"+(date.getMonth()+1);
      let day = date.getDate()>9?date.getDate():"0"+date.getDate();
      return mon+"-"+day;
    },
    JumptoHealthStatus() {
      this.$router.push({
        path: '/operationAnalysis/healthStatus'
      });
    },
    JumpToWarning(level) {
      this.$router.push({
        name: 'warnManagement',
        params: {
          level:level
        }
      });
    }
  }
}
</script>

<style scoped>
.margin-top-5 {
  margin-top: 5px;
}
.summary-panel-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.health-status >>> .el-collapse-item__header {
  color: #0087ed;
}
.unhealth-selected {
  background-color: #0087ed;
  height:30px;
  color:#ffffff;
  cursor: pointer;
  padding-left: 10px;
  display: flex;
  align-items: center;
  line-height: 30px;
}
.unhealth-unselected {
  background-color: #ffffff;
  height:30px;
  color:#666666;
  cursor: pointer;
  padding-left: 10px;
  display: flex;
  align-items: center;
  line-height: 30px;
}
.unhealth-selected-dark {
  background-color: #0087ed;
  height:30px;
  color:#ffffff;
  cursor: pointer;
  padding-left: 10px;
  display: flex;
  align-items: center;
  line-height: 30px;
}
.unhealth-unselected-dark {
  background-color: #1b293d;;
  height:30px;
  color:rgba(255, 255, 255, 0.85);
  cursor: pointer;
  padding-left: 10px;
  display: flex;
  align-items: center;
  line-height: 30px;
}
.start-page-four {
  height: 70px;
  border: 1px solid #dde6f3;
  border-radius: 8px;
  text-align: center;
  background-color: #ffffff;
}
.start-page-four-dark {
  height: 70px;
  border: 1px solid #263a5b;
  border-radius: 8px;
  text-align: center;
  background-color: #1b293d;
}
.start-page-four-t {
  color:#666666;
  font-size: 12px;
  font-weight: 500;
  padding-top: 12px;
}
.start-page-four-t-dark {
  color:rgba(255, 255, 255, 0.65);
  font-size: 12px;
  font-weight: 500;
  padding-top: 12px;
}
.start-page-four-lost {
  color: #f04864;
  padding-top:6px;
  font-weight: 500;
  font-size:18px;
}
.start-page-four-cirt {
  color: #faad14;
  padding-top:6px;
  font-weight: 500;
   font-size:18px;
}
.start-page-four-warn {
  color: #0087ed;
  padding-top:6px;
  font-weight: 500;
   font-size:18px;
}
.start-page-four-recovery {
  color: #2fc25b;
  padding-top:6px;
  font-weight: 500;
  font-size:18px;
}
.start-page-four-b {
  height: 220px;
  font-size: 14px;
  padding-left:25px;
}
.page-four-unhealth {
  height: 220px;
  border-radius: 8px;
  text-align: left;
  margin: 10px 0px 10px 10px;
}
.page-four-unhealth-t {
  font-size: 14px;
  color:#333333;
  padding-top:12px;
  padding-left:24px;
  padding-bottom: 12px;
  font-weight: 700;
}
.page-four-unhealth-t-dark {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  padding-top:12px;
  padding-left:24px;
  padding-bottom: 12px;
  font-weight: 700;
}
.page-four-unhealth-b {
  font-size: 14px;
  padding-left:24px;
  overflow-y: auto;
  padding-right:24px;
  height:340px;
}
.page-four-unhealth-b::-webkit-scrollbar {
  width: 8px;
}
.page-four-unhealth-b::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.12)
}
.page-four-unhealth-b::-webkit-scrollbar-track {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.04)
}
.transdiv {
  float: right;
  width: 0;
  height: 0;
  border-width: 5px 0px 5px 5px;
  border-style: solid;
  border-color: transparent transparent transparent #0087ed;
  margin-right: -5px;
  margin-top:-20px;
}
.unhealth-top {
  margin-top:15px;
  background-color:#ffffff;
}
.unhealth-top-dark {
  margin-top:15px;
  background-color: #1b293d;
}
.page-four-percent{
  padding: 4px;
}
.page-four-percent-t{
  font-weight: 400;
  font-size: 14px;
  color: #333333;
  height: 31px;
}
.page-four-percent-t-dark{
  font-weight: 600;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  height: 32px;
}
.page-four-percent-b{
  text-align:center;
  font-size: 14px;
}
.page-four-usage {
  border: 1px solid #dde6f3;
  border-radius: 8px;
}
.page-four-usage-dark {
  border: 1px solid #263a5b;
  border-radius: 8px;
}
.clickStyle {
  cursor: pointer;
}
</style>
