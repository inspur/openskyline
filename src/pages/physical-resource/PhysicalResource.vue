<template src="./physicalResource.html"></template>
<style src="./physicalResource.css"></style>
<script>
import * as utils from 'utils/index.js';
import vueLocal from "../../locale";
import IEcharts from 'vue-echarts-v3/src/full.js';
import calculateIco from 'assets/img/bigScreen/calculate_ico.png';
import storage from 'assets/img/bigScreen/storage.png';
import Page from '../../components/page/Page.vue'

import VmState from './parts/VmState.vue'
import ComputerNodes from './parts/ComputerNodes.vue'
import AlertMessage from './parts/AlertMessage.vue'
export default {
  data() {
    return {
      service:Vue.service,
      storage,
      calculateIco,
      clusterNum:"",
      cpuNum:"",
      cpuPer:"",
      memNum:"",
      memPer:"",
      storageNum:"",
      storagePer:"",
      option1:{
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:[],
          axisLabel:{
            color:"#fff",
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.utilization')+"(%)",
          nameTextStyle:{
            color:"#fff"
          },
          axisLabel:{
            color:"#fff"
          }
        },
        grid:{
          left:42,
          top:30,
          bottom:36,
          right:20
        },
        series:[{
          data:[],
          smooth:true,
          type:'line',
          areaStyle:{
            normal:{
              color:'#c3e6fc',
              opacity:0.2
            }
          },
          lineStyle:{
            normal:{
              color:"#a1d8f8"
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
            color:"#fff",
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.utilization')+"(%)",
          nameTextStyle:{
            color:"#fff"
          },
          axisLabel:{
            color:"#fff"
          }
        },
        grid:{
          left:42,
          top:30,
          bottom:36,
          right:20
        },
        series:[{
          data:[],
          smooth:true,
          type:'line',
          areaStyle:{
            normal:{
              color:'#c3e6fc',
              opacity:0.2
            }
          },
          lineStyle:{
            normal:{
              color:"#a1d8f8"
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
            color:"#fff",
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.utilization')+"(%)",
          nameTextStyle:{
            color:"#fff"
          },
          axisLabel:{
            color:"#fff"
          }
        },
        grid:{
          left:42,
          top:30,
          bottom:36,
          right:20
        },
        series:[{
          data:[],
          smooth:true,
          type:'line',
          areaStyle:{
            normal:{
              color:'#c3e6fc',
              opacity:0.2
            }
          },
          lineStyle:{
            normal:{
              color:"#a1d8f8"
            }
          }
        }]
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
            color:"#fff",
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          }
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.speed')+"(KB/s)",
          nameTextStyle:{
            color:"#fff"
          },
          axisLabel:{
            color:"#fff"
          }
        },
        grid:{
          left:70,
          top:30,
          bottom:36,
          right:20
        },
        series:[]
      }
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      this.getCpuAndMemAndStorage();
      if (this.service.pluto) {
        this.getCluterNum();
        this.getCPUStory();
        this.getMemStory();
        this.getDisk();
        this.getNetwork([this.getNetIn(), this.getNetOut()]);
      }
      setTimeout(() => {
        this.getData();
      }, 10000)
    },
    getCluterNum() {
      let me = this;
      this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/hosts",
        successFun(data) {
          me.clusterNum = data.host;
        }
      });
    },
    async getCpuAndMemAndStorage() {
      let me = this;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/nova/v2.1/os-hypervisors/detail"
      })
      let cpu = 0;
      let cpuused = 0;
      let memory = 0;
      let memoryused = 0;
      ret.hypervisors.forEach((item, index) => {
        if (item.state=="up"&&item.status=="enabled"&&item.hypervisor_type!="ironic") {
          cpu += item.vcpus;
          cpuused += item.vcpus_used;
          memory += item.memory_mb;
          memoryused += item.memory_mb_used;
        }
      });
      this.cpuNum = cpu;
      this.cpuPer = (cpuused/cpu*100).toFixed(2)+"%";
      this.memNum = (memory/1024).toFixed(0);
      this.memPer = (((memoryused/1024).toFixed(0))/(this.memNum)*100).toFixed(2)+"%";
      this.$ajax({
        type: 'get',
        url: "api/cinder/v3/"+this.$cookie.get("pid")+"/inspur-scheduler-stats/get_pools?detail=True",
        successFun(rtn) {
          let total = rtn.storage_summary.total_capacity;
          let free = rtn.storage_summary.total_free_capacity;
          // 330需求，pools循环计算改为直接获取
          // rtn.pools.forEach(pool => {
          //   if (pool.capabilities.inspur_total_capacity) {
          //     total += pool.capabilities.inspur_total_capacity;
          //     free += pool.capabilities.inspur_free_capacity;
          //   } else {
          //     total += pool.capabilities.total_capacity_gb;
          //     free += pool.capabilities.free_capacity_gb;
          //   }
          // })
          me.storageNum = total%1==0?total:total.toFixed(2);
          me.storagePer = ((total-free)/total*100).toFixed(2)+"%";
        }
      })
    },
    getCPUStory() {
      let me = this;
      this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/system/history?type=cpu",
        successFun(data) {
          let cpuArr = data.cpu;
          let x = [];
          let y = [];
          cpuArr.forEach((item, index) => {
            x.push(me.convertX(item[0]));
            if (item[1]) {
              y.push(item[1].toFixed(2));
            } else {
              y.push(item[1]);
            }
          })
          me.option1.xAxis.data = x;
          me.option1.series[0].data = y;
        }
      });
    },
    getMemStory() {
      let me = this;
      this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/system/history?type=mem",
        successFun(data) {
          let cpuArr = data.mem;
          let x = [];
          let y = [];
          cpuArr.forEach((item, index) => {
            x.push(me.convertX(item[0]));
            if (item[1]) {
              y.push(item[1].toFixed(2));
            } else {
              y.push(item[1]);
            }
          })
          me.option2.xAxis.data = x;
          me.option2.series[0].data = y;
        }
      });
    },
    getDisk() {
      let me = this;
      this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/system/history?type=disk",
        successFun(data) {
          me.option3.series[0].data = [];
          me.option3.xAxis.data = [];
          let x = [];
          let y = [];
          if (data&&data.disk) {
            data.disk.forEach((itemArr) => {
              x.push(me.convertX(itemArr[0]));
              if (itemArr[1]) {
                y.push(itemArr[1].toFixed(2));
              } else {
                y.push(itemArr[1]);
              }
            })
          }
          me.option3.series[0].data = y;
          me.option3.xAxis.data = x;
        }
      });
    },
    getNetwork(arr) {
      let me = this;
      Promise.all(arr).then((data) => {
        this.option4.series = [];
        this.option4.xAxis.data = [];
        setData(data[0], "#fd936c", "netin");
        setData(data[1], "#a1d8f8", "netout");
      })
      function setData(arr, color, name) {
        let x = [];
        let y = [];
        arr.forEach((itemArr) => {
          x.push(me.convertX(itemArr[0]));
          if (itemArr[1]) {
            y.push(itemArr[1].toFixed(2));
          } else {
            y.push(itemArr[1]);
          }
        })
        me.option4.series.push({
          name:name,
          data:y,
          smooth:true,
          type:'line',
          lineStyle:{normal:{
            color:color
          }}
        })
        if (me.option4.xAxis.data.length==0) {
          me.option4.xAxis.data = x;
        }
      }
    },
    getNetIn() {
      return new Promise((resolve, reject) => {
        this.$ajax({
          type: 'get',
          url: "api/pluto/v1/monitor/system/history?type=netin",
          successFun(data) {
            if (data&&data.netin) {
              resolve(data.netin)
            } else {
              resolve([])
            }
          },
          errFun() {
            resolve([])
          }
        })
      })
    },
    getNetOut() {
      return new Promise((resolve, reject) => {
        this.$ajax({
          type: 'get',
          url: "api/pluto/v1/monitor/system/history?type=netout",
          successFun(data) {
            if (data&&data.netout) {
              resolve(data.netout)
            } else {
              resolve([])
            }
          },
          errFun() {
            resolve([])
          }
        })
      })
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
      let hour = date.getHours()>9?date.getHours():"0"+date.getHours();
      let min = date.getMinutes()>9?date.getMinutes():"0"+date.getMinutes();
      return hour+":"+min;
    }
  },
  components:{
    IEcharts,
    Page,
    VmState,
    ComputerNodes,
    AlertMessage
  }
};
</script>



