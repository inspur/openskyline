<template>
  <div>
    <el-collapse v-model="activeNames">
      <el-collapse-item :title="$t('base.performanceIndex')" name="1" style="text-align: left;">
        <el-row :gutter="10">
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr>
                  <th class="idatath">{{$t('base.CPUUtilization')}}：</th>
                  <td class="idatatd">{{realTimeData.cpu_utilzation}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('base.diskReadRate')}}(MB/s)：</th>
                  <td class="idatatd">{{realTimeData.diskout}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('base.networkInflowSpeed')}}(KB/s)：</th>
                  <td class="idatatd">{{realTimeData.netin}}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr>
                  <th class="idatath">{{$t('base.memUtilization')}}：</th>
                  <td class="idatatd">{{realTimeData.mem_utilzation}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('base.diskWriteRate')}}(MB/s)：</th>
                  <td class="idatatd">{{realTimeData.diskin}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('base.networkOutflowSpeed')}}(KB/s)：</th>
                  <td class="idatatd">{{realTimeData.netout}}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item :title="$t('base.performanceCurve')+'('+timeTitle+')'" name="2" style="text-align: left;">
        <el-form :inline="true" class="form-inline">
          <el-form-item>
            <el-date-picker style="width:150px;" v-model="startTime" type="date" :editable="false" :placeholder="$t('lang.startDate')" :picker-options="spickerOption"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <span>-</span>
          </el-form-item>
          <el-form-item>
            <el-date-picker style="width:150px;" v-model="endTime" type="date" :editable="false" :placeholder="$t('lang.endDate')" :picker-options="epickerOption"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon='fa-search' size="small" @click="queryFun">{{$t('base.query')}}</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="queryHourFun">{{$t('base.realTime')}}</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="query24HourFun">{{$t('base.last24Hour')}}</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="queryWeekFun">{{$t('base.lastWeek')}}</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="queryMonthFun">{{$t('base.lastMonth')}}</el-button>
          </el-form-item>
        </el-form>
        <div class="divider clearfix"></div>
        <el-row>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts ref="" :option="option1"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{$t('base.cpuUsHisCur')}}</div>
          </el-col>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts ref="" :option="option2"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{$t('base.memUsHisCur')}}</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts ref="" :option="option3"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{$t('base.diskRWHisCur')}}</div>
          </el-col>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts ref="" :option="option4"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{$t('base.networkIOHisCur')}}</div>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
export default {
  components: {},
  props:["InstanceId"],
  data() {
    return {
      activeNames:['1', '2'],
      baseinfoLoading:false,
      hisLoading:false,
      realTimeData:{
        cpu_utilzation:'',
        diskin:"",
        diskout:"",
        mem_utilzation:"",
        netin:"",
        netout:""
      },
      startTime:'',
      endTime:'',
      spickerOption:function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.endTime) {
              return time.getTime() > me.endTime||time.getTime() > Date.now();
            } else {
              return time.getTime() > Date.now();
            }
          }
        }
      }.bind(this)(),
      epickerOption:function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.startTime) {
              return time.getTime() < me.startTime||time.getTime() > Date.now();
            } else {
              return time.getTime() > Date.now();
            }
          }
        }
      }.bind(this)(),
      timeTitle:Vue.t('base.last24Hour'),
      option1:{
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.utilization') + "(%)"
        },
        grid:{
          left:40,
          top:30,
          bottom:20,
          right:40
        },
        series:[{
          data:[],
          smooth:true,
          type:'line',
          areaStyle:{
            normal:{
              color:'#ffbfa6'
            }
          },
          lineStyle:{
            normal:{
              color:"#fd936c"
            }
          }
        }]
      },
      option2:{
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.utilization')+"(%)"
        },
        grid:{
          left:40,
          top:30,
          bottom:20,
          right:40
        },
        series:[{
          data:[],
          smooth:true,
          type:'line',
          areaStyle:{
            normal:{
              color:'#ffbfa6'
            }
          },
          lineStyle:{
            normal:{
              color:"#fd936c"
            }
          }
        }]
      },
      option3:{
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.speed')+"(MB/s)"
        },
        grid:{
          left:50,
          top:30,
          bottom:20,
          right:40
        },
        series:[]
      },
      option4:{
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.speed')+"(KB/s)"
        },
        grid:{
          left:50,
          top:30,
          bottom:20,
          right:40
        },
        series:[]
      },
      showDate:false,
      interval:null
    }
  },
  mounted() {
    this.getRealTimeData();
    this.queryHourFun();
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    getData(timeStr) {
      this.getCpuHisData(timeStr);
      this.getMemHisData(timeStr);
      this.getDiskinData(timeStr);
      this.getDiskoutData(timeStr);
      this.getNetinData(timeStr);
      this.getNetoutData(timeStr);
    },
    async getRealTimeData() {
      //this.baseinfoLoading = true;
      let obj = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.InstanceId
      })
      this.realTimeData = {
        cpu_utilzation:(obj.cpu_utilzation===''||isNaN(obj.cpu_utilzation))?obj.cpu_utilzation:obj.cpu_utilzation.toFixed(2)+"%",
        diskin:(obj.diskin===""||isNaN(obj.diskin))?obj.diskin:obj.diskin.toFixed(2),
        diskout:(obj.diskout===""||isNaN(obj.diskout))?obj.diskout:obj.diskout.toFixed(2),
        mem_utilzation:(obj.mem_utilzation===''||isNaN(obj.mem_utilzation))?obj.mem_utilzation:obj.mem_utilzation.toFixed(2)+"%",
        netin:(obj.netin===""||isNaN(obj.netin))?obj.netin:obj.netin.toFixed(2),
        netout:(obj.netout===""||isNaN(obj.netout))?obj.netout:obj.netout.toFixed(2)
      }
    },
    async getCpuHisData(timeStr) {
      let cpu = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.InstanceId+"/history?type=cpu"+timeStr
      })
      let cpuArr = cpu.virt_cpu_utilzation;
      let x = [];
      let y = [];
      cpuArr.forEach((item) => {
        x.push(this.convertX(item[0]));
        if (item[1]) {
          y.push(item[1].toFixed(2));
        } else {
          y.push(item[1]);
        }
      })
      this.option1.xAxis.data = x;
      this.option1.series[0].data = y;
    },
    async getMemHisData(timeStr) {
      let cpu = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.InstanceId+"/history?type=mem"+timeStr
      })
      let memArr = cpu.virt_memory_utilzation;
      let x = [];
      let y = [];
      memArr.forEach((item) => {
        x.push(this.convertX(item[0]));
        if (item[1]) {
          y.push(item[1].toFixed(2));
        } else {
          y.push(item[1]);
        }
      })
      this.option2.xAxis.data = x;
      this.option2.series[0].data = y;
    },
    async getDiskinData(timeStr) {
      let diskin = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.InstanceId+"/history?type=diskin"+timeStr
      })
      let x = [];
      let flg = false;
      let me = this;
      for (var key in diskin) {
        let arr = diskin[key];
        let y = [];
        arr.forEach((item) => {
          if (!flg) {
            x.push(me.convertX(item[0]));
          }
          if (item[1]) {
            y.push(item[1].toFixed(2));
          } else {
            y.push(item[1]);
          }
        })
        me.option3.series.push({
          name:key+"(in)",
          data:y,
          smooth:true,
          type:'line',
          lineStyle:{}
        })
        flg = true;
      }
      this.option3.xAxis.data = x;
    },
    async getDiskoutData(timeStr) {
      let diskout = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.InstanceId+"/history?type=diskout"+timeStr
      })

      let x = [];
      let flg = false;
      let me = this;
      for (var key in diskout) {
        let arr = diskout[key];
        let y = [];
        arr.forEach((item) => {
          if (!flg) {
            x.push(me.convertX(item[0]));
          }
          if (item[1]) {
            y.push(item[1].toFixed(2));
          } else {
            y.push(item[1]);
          }
        })
        me.option3.series.push({
          name:key+"(out)",
          data:y,
          smooth:true,
          type:'line',
          lineStyle:{}
        })
        flg = true;
      }
    },
    async getNetinData(timeStr) {
      let netin = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.InstanceId+"/history?type=netin"+timeStr
      })
      let x = [];
      let flg = false;
      let me = this;
      for (var key in netin) {
        let arr = netin[key];
        let y = [];
        arr.forEach((item) => {
          if (!flg) {
            x.push(me.convertX(item[0]));
          }
          if (item[1]) {
            y.push(item[1].toFixed(2));
          } else {
            y.push(item[1]);
          }
        })
        me.option4.series.push({
          name:key+"(in)",
          data:y,
          smooth:true,
          type:'line',
          lineStyle:{}
        })
        flg = true;
      }
      me.option4.xAxis.data = x;
    },
    async getNetoutData(timeStr) {
      let netout = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.InstanceId+"/history?type=netout"+timeStr
      })
      let x = [];
      let flg = false;
      let me = this;
      for (var key in netout) {
        let arr = netout[key];
        let y = [];
        arr.forEach((item) => {
          if (!flg) {
            x.push(me.convertX(item[0]));
          }
          if (item[1]) {
            y.push(item[1].toFixed(2));
          } else {
            y.push(item[1]);
          }
        })
        me.option4.series.push({
          name:key+"(out)",
          data:y,
          smooth:true,
          type:'line',
          lineStyle:{}
        })
        flg = true;
      }
    },
    queryFun() {
      if (!this.startTime||!this.endTime) {
        this.$message({
          message: Vue.t('base.dataWarn'),
          type: "warning"
        });
        return;
      }
      clearInterval(this.interval);
      let start = this.startTime.getTime()/1000+new Date().getTimezoneOffset()*60*1000;
      let end = this.endTime.getTime()/1000+24*60*60+new Date().getTimezoneOffset()*60*1000;
      if (end>Date.now()) {
        end = Date.now();
      }
      this.showDate = end-start>3*24*60*60;
      this.option3.series = [];
      this.option4.series = [];
      this.getData('&starttime='+start+'&endtime='+end);
      let syear = this.startTime.getFullYear();
      let smonth = this.startTime.getMonth()+1>9?this.startTime.getMonth()+1:"0"+(this.startTime.getMonth()+1);
      let sdate = this.startTime.getDate()>9?this.startTime.getDate():"0"+this.startTime.getDate();
      let eyear = this.endTime.getFullYear();
      let emonth = this.endTime.getMonth()+1>9?this.endTime.getMonth()+1:"0"+(this.endTime.getMonth()+1);
      let edate = this.endTime.getDate()>9?this.endTime.getDate():"0"+this.endTime.getDate();
      this.timeTitle = syear+"-"+smonth+"-"+sdate+"~"+eyear+"-"+emonth+"-"+edate;
    },
    queryHourFun() {
      clearInterval(this.interval);
      function getTimeStr() {
        let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
        let endTime = parseInt(date.getTime()/1000);
        let startTime = parseInt(endTime-30*60);
        return '&starttime='+startTime+'&endtime='+endTime;
      }
      this.showDate = false;
      this.option3.series = [];
      this.option4.series = [];
      this.getData(getTimeStr());
      this.interval = setInterval(() => {
        this.option3.series = [];
        this.option4.series = [];
        this.getData(getTimeStr());
      }, 8000)
      this.timeTitle = Vue.t('base.realTime');
    },
    query24HourFun() {
      clearInterval(this.interval);
      let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
      let endTime = parseInt(date.getTime()/1000);
      let startTime = parseInt((date.setDate(date.getDate()-1))/1000);
      let timeStr = '&starttime='+startTime+'&endtime='+endTime;
      this.showDate = false;
      this.option3.series = [];
      this.option4.series = [];
      this.getData(timeStr);
      this.timeTitle = Vue.t('base.last24Hour');
    },
    queryWeekFun() {
      clearInterval(this.interval);
      let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
      let endTime = parseInt(date.getTime()/1000);
      let startTime = parseInt((date.setDate(date.getDate()-7))/1000);
      let timeStr = '&starttime='+startTime+'&endtime='+endTime;
      this.showDate = true;
      this.option3.series = [];
      this.option4.series = [];
      this.getData(timeStr);
      this.timeTitle = Vue.t('base.lastWeek');
    },
    queryMonthFun() {
      clearInterval(this.interval);
      let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
      let endTime = parseInt(date.getTime()/1000);
      let startTime = parseInt((date.setMonth(date.getMonth()-1))/1000);
      let timeStr = '&starttime='+startTime+'&endtime='+endTime;
      this.showDate = true;
      this.option3.series = [];
      this.option4.series = [];
      this.getData(timeStr);
      this.timeTitle = Vue.t('base.lastMonth');
    },
    convertX(str) {
      str = str.replace('T', ' ').replace('Z', '');
      let time = new Date(str).getTime()-new Date().getTimezoneOffset()*60*1000;
      let date = new Date(time);
      let month = date.getMonth()+1>9?date.getMonth()+1:"0"+(date.getMonth()+1);
      let day = date.getDate()>9?date.getDate():"0"+date.getDate();
      let hour = date.getHours()>9?date.getHours():"0"+date.getHours();
      let min = date.getMinutes()>9?date.getMinutes():"0"+date.getMinutes();
      let sec = date.getSeconds()>9?date.getSeconds():"0"+date.getSeconds();
      return date.getFullYear()+"-"+month+"-"+day+" "+hour+":"+min+":"+sec;
    },
    formatX(str) {
      let date = new Date(str);
      if (this.showDate) {
        let mon = date.getMonth()+1>9?date.getMonth()+1:"0"+(date.getMonth()+1);
        let day = date.getDate()>9?date.getDate():"0"+date.getDate();
        return mon+"-"+day;
      } else {
        let hour = date.getHours()>9?date.getHours():"0"+date.getHours();
        let min = date.getMinutes()>9?date.getMinutes():"0"+date.getMinutes();
        return hour+":"+min;
      }
    }
  }
}
</script>
