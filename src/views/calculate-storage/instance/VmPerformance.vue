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
                  <th class="idatath">{{$t('base.CPUUtilization')}}(%)：</th>
                  <td class="idatatd">{{realTimeData.cpu_utilzation||"-"}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('base.diskReadRate')}}(MB/s)：</th>
                  <td class="idatatd">{{realTimeData.diskout||"-"}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('base.networkInflowSpeed')}}(KB/s)：</th>
                  <td class="idatatd">{{realTimeData.netin||"-"}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('monitor.diskUtilization')}}(%)：</th>
                  <td class="idatatd">{{realTimeData.disk_used||"-"}}</td>
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
                  <th class="idatath">{{$t('base.memUtilization')}}(%)：</th>
                  <td class="idatatd">{{realTimeData.mem_utilzation||"-"}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('base.diskWriteRate')}}(MB/s)：</th>
                  <td class="idatatd">{{realTimeData.diskin||"-"}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('base.networkOutflowSpeed')}}(KB/s)：</th>
                  <td class="idatatd">{{realTimeData.netout||"-"}}</td>
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
            <el-button type="primary" size="small" @click="queryHalfHourFun">{{$t('base.lastHalfHour')}}</el-button>
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
              <IEcharts ref="diskChart" :option="option3"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{$t('base.diskRWHisCur')}}</div>
          </el-col>
          <el-col :span="12">
            <div style="height: 200px;">
              <IEcharts ref="diskInfoChart" :option="option5"></IEcharts>
            </div>
            <div style="text-align: center;line-height: 36px;">{{$t('monitor.diskUsageHisCur')}}({{$t('monitor.systemNeedQga')}})</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div style="height: 200px;">
              <IEcharts ref="netChart" :option="option4"></IEcharts>
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
  name: 'VmPerformance',
  components: {},
  props:["instanceId"],
  watch: {
    instanceId: {
      handler: function() {
        this.getRealTimeData();
        this.queryHalfHourFun();
      }
    }
  },
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
        netout:"",
        disk_used:""
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
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.utilization')+"(%)",
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          }
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
          connectNulls: true,
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
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.utilization')+"(%)",
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          }
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
          connectNulls: true,
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
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.RATE')+"(MB/s)",
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          }
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
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.RATE')+"(KB/s)",
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          }
        },
        grid:{
          left:55,
          top:30,
          bottom:20,
          right:40
        },
        series:[]
      },
      option5:{
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.utilization')+"(%)",
          nameTextStyle:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          },
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333'
          }
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
    this.queryHalfHourFun();
  },
  beforeDestroy() {
    clearInterval(this.interval);
    clearTimeout(this.timeout)
  },
  methods: {
    getData(timeStr) {
      this.getCpuHisData(timeStr);
      this.getMemHisData(timeStr);
      this.getDiskHisData(timeStr);
      this.getNetwork([this.getNetinData(timeStr), this.getNetoutData(timeStr)]);
      this.getDiskInfoHisData(timeStr);
    },
    getNetwork(arr) {
      let me = this;
      Promise.all(arr).then(function(data) {
        let num = 0;
        for (let key in data[0]) {
          if (key=="mapping") {
            continue;
          }
          num++;
        }
        if (num*2!=me.option4.series.length) {
          me.$refs.netChart.clear();
        }
        me["option4"].series = [];
        me["option4"].xAxis.data = [];
        me.setOption('option4', data[0], Vue.t('base.in'), "rx_bytes");
        me.setOption('option4', data[1], Vue.t('base.out'), "tx_bytes");
      })
    },
    setOption(option, obj, str, col) {
      if (obj.error === "error") {
        return;
      }
      let x = [];
      let me = this;
      let flg = true;
      for (var key in obj) {
        if (key=="mapping") {
          continue;
        }
        let arr = obj[key] || [];
        let y = [];
        arr.forEach((item, index) => {
          if (flg) {
            x.push(me.convertX(item[0].time));
          }
          if (item[1]&&item[1][col]!=null) {
            y.push(item[1][col].toFixed(2));
          } else {
            y.push(null);
          }
          if (index==arr.length-1) {
            flg = false;
          }
        })
        me[option].series.push({
          name:key+"("+str+")",
          data:y,
          smooth:true,
          type:'line',
          connectNulls: true,
          lineStyle:{}
        })
      }
      if (this[option].xAxis.data.length==0) {
        this[option].xAxis.data = x;
      }
    },
    async getRealTimeData() {
      //this.baseinfoLoading = true;
      clearTimeout(this.timeout);
      let obj = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.instanceId
      })
      this.realTimeData = {
        cpu_utilzation:String((obj.cpu_utilzation===''||isNaN(obj.cpu_utilzation))?obj.cpu_utilzation:obj.cpu_utilzation.toFixed(2)),
        diskin:String((obj.diskin===""||isNaN(obj.diskin))?obj.diskin:obj.diskin.toFixed(2)),
        diskout:String((obj.diskout===""||isNaN(obj.diskout))?obj.diskout:obj.diskout.toFixed(2)),
        mem_utilzation:String((obj.mem_utilzation===''||isNaN(obj.mem_utilzation))?obj.mem_utilzation:obj.mem_utilzation.toFixed(2)),
        netin:String((obj.netin===""||isNaN(obj.netin))?obj.netin:obj.netin.toFixed(2)),
        netout:String((obj.netout===""||isNaN(obj.netout))?obj.netout:obj.netout.toFixed(2)),
        disk_used:String((obj.disk_used===""||isNaN(obj.disk_used))?obj.disk_used:obj.disk_used.toFixed(2))
      }
      Object.keys(this.realTimeData).forEach(v => {
        if (this.realTimeData[v] === 'undefined') {
          this.realTimeData[v] = '';
        }
      })
      this.timeout = setTimeout(() => {
        this.getRealTimeData();
      }, 8000)
    },
    async getCpuHisData(timeStr) {
      let cpu = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.instanceId+"/history?return_type=json&type=cpu"+timeStr
      })
      let cpuArr = cpu.cpu||[];
      let x = [];
      let y = [];
      cpuArr.forEach((item) => {
        x.push(this.convertX(item[0].time));
        if (item[1]&&item[1].value!=null) {
          y.push(item[1].value.toFixed(2));
        } else {
          y.push(null);
        }
      })
      this.option1.xAxis.data = x;
      this.option1.series[0].data = y;
    },
    async getMemHisData(timeStr) {
      let cpu = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.instanceId+"/history?return_type=json&type=mem"+timeStr
      })
      let memArr = cpu.mem||[];
      let x = [];
      let y = [];
      memArr.forEach((item) => {
        x.push(this.convertX(item[0].time));
        if (item[1]&&item[1].value!=null) {
          y.push(item[1].value.toFixed(2));
        } else {
          y.push(null);
        }
      })
      this.option2.xAxis.data = x;
      this.option2.series[0].data = y;
    },
    async getDiskHisData(timeStr) {
      let disk = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.instanceId+"/history?return_type=json&type=disk"+timeStr
      })
      if (disk.error === "error") {
        return;
      }
      let x = [];
      let me = this;
      let flg = true;
      let num = 0;
      for (let key in disk) {
        num++;
      }
      if (num*2!=me["option3"].series.length) {
        me.$refs.diskChart.clear();
      }
      me["option3"].series = [];
      me["option3"].xAxis.data = [];
      for (let key in disk) {
        let arr = disk[key] || [];
        let yread = [];
        let ywrite = [];
        arr.forEach((item, index) => {
          if (flg) {
            x.push(me.convertX(item[0].time));
          }
          if (item[1]&&item[1].rd_bytes!=null) {
            yread.push(item[1].rd_bytes.toFixed(2));
          } else {
            yread.push(null);
          }
          if (item[2]&&item[2].wr_bytes!=null) {
            ywrite.push(item[2].wr_bytes.toFixed(2));
          } else {
            ywrite.push(null);
          }
          if (index==arr.length-1) {
            flg = false;
          }
        })
        me["option3"].series.push({
          name:key+"("+Vue.t('base.read')+")",
          data:yread,
          smooth:true,
          type:'line',
          connectNulls: true,
          lineStyle:{}
        })
        me["option3"].series.push({
          name:key+"("+Vue.t('base.write')+")",
          data:ywrite,
          smooth:true,
          type:'line',
          connectNulls: true,
          lineStyle:{}
        })
      }
      if (me["option3"].xAxis.data.length==0) {
        me["option3"].xAxis.data = x;
      }
    },
    async getDiskInfoHisData(timeStr) {
      let disk = await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/vms/"+this.instanceId+"/history?return_type=json&type=disk_info"+timeStr
      })
      if (disk.error === "error") {
        return;
      }
      let x = [];
      let me = this;
      let flg = true;
      let num = 0;
      for (let key in disk) {
        num++;
      }
      if (num*2!=me["option5"].series.length) {
        me.$refs.diskInfoChart.clear();
      }
      me["option5"].series = [];
      me["option5"].xAxis.data = [];
      for (let key in disk) {
        let arr = disk[key] || [];
        let unArr = [];
        arr.forEach((item, index) => {
          if (flg) {
            x.push(me.convertX(item[0].time));
          }
          if (item[1]&&item[1].used_pert!=null) {
            unArr.push(item[1].used_pert.toFixed(2));
          } else {
            unArr.push(null);
          }
          if (index==arr.length-1) {
            flg = false;
          }
        })
        me["option5"].series.push({
          name:key,
          data:unArr,
          smooth:true,
          type:'line',
          connectNulls: true,
          lineStyle:{}
        })
      }
      if (me["option5"].xAxis.data.length==0) {
        me["option5"].xAxis.data = x;
      }
    },
    async getNetinData(timeStr) {
      return new Promise((resolve, reject) => {
        this.$ajax({
          type: 'get',
          polling:true,
          url: "api/pluto/v1/monitor/vms/"+this.instanceId+"/history?return_type=json&type=netin"+timeStr,
          successFun(data) {
            resolve(data)
          },
          errFun() {
            resolve({})
          }
        })
      })
    },
    async getNetoutData(timeStr) {
      return new Promise((resolve, reject) => {
        this.$ajax({
          type: 'get',
          polling:true,
          url: "api/pluto/v1/monitor/vms/"+this.instanceId+"/history?return_type=json&type=netout"+timeStr,
          successFun(data) {
            resolve(data)
          },
          errFun() {
            resolve({})
          }
        })
      })
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
      let start = this.startTime.getTime()/1000+new Date().getTimezoneOffset()*60;
      let end = this.endTime.getTime()/1000+24*60*60-1;
      if (end>Date.now()/1000) {
        end = parseInt(Date.now()/1000+new Date().getTimezoneOffset()*60);
      } else {
        end = end + new Date().getTimezoneOffset()*60;
      }
      this.showDate = end-start>3*24*60*60;
      // this.option3.series = [];
      // this.option4.series = [];
      this.getData('&starttime='+start+'&endtime='+end+"&is_history=1");
      let syear = this.startTime.getFullYear();
      let smonth = this.startTime.getMonth()+1>9?this.startTime.getMonth()+1:"0"+(this.startTime.getMonth()+1);
      let sdate = this.startTime.getDate()>9?this.startTime.getDate():"0"+this.startTime.getDate();
      let eyear = this.endTime.getFullYear();
      let emonth = this.endTime.getMonth()+1>9?this.endTime.getMonth()+1:"0"+(this.endTime.getMonth()+1);
      let edate = this.endTime.getDate()>9?this.endTime.getDate():"0"+this.endTime.getDate();
      this.timeTitle = syear+"-"+smonth+"-"+sdate+"~"+eyear+"-"+emonth+"-"+edate;
    },
    queryHalfHourFun() {
      this.startTime = '';
      this.endTime = '';
      clearInterval(this.interval);
      function getTimeStr() {
        let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
        let endTime = parseInt(date.getTime()/1000);
        let startTime = parseInt(endTime-30*60);
        return '&starttime='+startTime+'&endtime='+endTime+"&is_history=0";
      }
      this.showDate = false;
      // this.option3.series = [];
      // this.option4.series = [];
      this.getData(getTimeStr());
      this.interval = setInterval(() => {
        this.getData(getTimeStr());
      }, 8000)
      this.timeTitle = Vue.t('base.lastHalfHour');
    },
    query24HourFun() {
      this.startTime = '';
      this.endTime = '';
      clearInterval(this.interval);
      let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
      let endTime = parseInt(date.getTime()/1000);
      let startTime = parseInt((date.setDate(date.getDate()-1))/1000);
      let timeStr = '&starttime='+startTime+'&endtime='+endTime+"&is_history=0";
      this.showDate = false;
      // this.option3.series = [];
      // this.option4.series = [];
      this.getData(timeStr);
      this.timeTitle = Vue.t('base.last24Hour');
    },
    queryWeekFun() {
      this.startTime = '';
      this.endTime = '';
      clearInterval(this.interval);
      let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
      let endTime = parseInt(date.getTime()/1000);
      let startTime = parseInt((date.setDate(date.getDate()-7))/1000);
      let timeStr = '&starttime='+startTime+'&endtime='+endTime+"&is_history=0";
      this.showDate = true;
      // this.option3.series = [];
      // this.option4.series = [];
      this.getData(timeStr);
      this.timeTitle = Vue.t('base.lastWeek');
    },
    queryMonthFun() {
      this.startTime = '';
      this.endTime = '';
      clearInterval(this.interval);
      let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
      let endTime = parseInt(date.getTime()/1000);
      let startTime = parseInt((date.setMonth(date.getMonth()-1))/1000);
      let timeStr = '&starttime='+startTime+'&endtime='+endTime+"&is_history=0";
      this.showDate = true;
      // this.option3.series = [];
      // this.option4.series = [];
      this.getData(timeStr);
      this.timeTitle = Vue.t('base.lastMonth');
    },
    convertX(str) {
      str = str.replace('T', ' ').replace('Z', '');
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
