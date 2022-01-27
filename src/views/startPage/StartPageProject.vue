<template>
  <div style="display: inline-table;width: 100%;">
    <div style="display: table-cell;width:1%;max-width: 10px;">&nbsp;</div>
    <div class="startpage_layout">
      <div style="height: 100%;padding:20px 16px;">
        <div :style="style0">{{$t('base.utilizationReQuo')}}</div>
        <div class="startpage_divider"></div>
        <div style="margin-top:10px;">
          <el-row :gutter="10">
            <el-col :span="12">
              <span :style="style1" v-if="service.nova">{{$t('base.computer')}}</span>
              <template v-if="service.nova" v-for="(item,key) in comret.quota_set">
                <el-row style="height:30px;">
                  <el-col :span="12"><span>{{labels.nova[key]}}</span></el-col>
                  <el-col :span="12">
                    <el-progress v-if="item.limit!=-1&&key!='key_pairs'" :title="item.in_use+'/'+item.limit" :text-inside="true" :stroke-width="18" :status="item.status" :percentage="item.percentage"></el-progress>
                    <span v-if="item.limit==-1&&key!='key_pairs'">{{$t('base.unlimited')}}({{item.in_use}})</span>
                    <span v-if="item.limit!=-1&&key=='key_pairs'">{{"-/"+item.limit}}</span>
                    <span v-if="item.limit==-1&&key=='key_pairs'">{{"-/"+$t('base.unlimited')}}</span>
                    <el-tooltip v-if="key=='key_pairs'" effect="dark" :content="$t('base.keypairPrompt')">
                      <i class="el-icon-fa-question-circle"></i>
                    </el-tooltip>
                  </el-col>
                </el-row>
              </template>

              <span :style="style1" v-if="service.cinderv2">{{$t('base.storage')}}</span>
              <template v-if="service.cinderv2" v-for="(item,key) in storeret.quota_set">
                <el-row style="height:30px;">
                  <el-col :span="12"><span>{{labels.cinderv2[key]}}</span></el-col>
                  <el-col :span="12">
                    <el-progress v-if="item.limit!=-1" :title="item.in_use+'/'+item.limit" :text-inside="true" :stroke-width="18" :status="item.status" :percentage="item.percentage"></el-progress>
                    <span v-if="item.limit==-1">{{$t('base.unlimited')}}({{item.in_use}})</span>
                  </el-col>
                </el-row>
              </template>

              <span :style="style1" v-if="service.manila">{{$t('base.fileStorage')}}</span>
              <template v-if="service.manila" v-for="(item,key) in filestoreret.quota_set">
                <el-row style="height:30px;">
                  <el-col :span="12"><span>{{labels.manila[key]}}</span></el-col>
                  <el-col :span="12">
                    <el-progress v-if="item.limit!=-1" :title="item.in_use+'/'+item.limit" :text-inside="true" :stroke-width="18" :status="item.status" :percentage="item.percentage"></el-progress>
                    <span v-if="item.limit==-1">{{$t('base.unlimited')}}({{item.in_use}})</span>
                  </el-col>
                </el-row>
              </template>
            </el-col>
            <el-col :span="12">
              <span :style="style1" v-if="service.neutron">{{$t('base.network')}}</span>
              <template v-if="service.neutron" v-for="(item,key) in netret.quota">
                <el-row v-if="item.flg" style="height:30px;">
                  <el-col :span="12"><span>{{labels.neutron[key]}}</span></el-col>
                  <el-col :span="12">
                    <el-progress v-if="item.limit!=-1" :title="item.used+'/'+item.limit" :text-inside="true" :stroke-width="18" :status="item.status" :percentage="item.percentage"></el-progress>
                    <span v-if="item.limit==-1">{{$t('base.unlimited')}}({{item.used}})</span>
                  </el-col>
                </el-row>
              </template>
            </el-col>
          </el-row>
        </div>

        <div v-if="service.pluto" :style="style0">{{$t('base.vmMacUti')}}TOP5</div>
        <el-row v-if="service.pluto" :gutter="80">
          <el-col :span="12">
            <IEcharts :option="option1" style="height:200px;"></IEcharts>
            <div :style="style2">{{$t('base.CPUUtilization')}}</div>
          </el-col>
          <el-col :span="12">
            <IEcharts :option="option2" style="height:200px;"></IEcharts>
            <div :style="style2">{{$t('base.memoryUtilization')}}</div>
          </el-col>
        </el-row>
        <el-row v-if="service.pluto" :gutter="15">
          <el-col :span="12">
            <IEcharts :option="option3" style="height:200px;"></IEcharts>
            <div :style="style2">{{$t('base.diskUti')}}</div>
          </el-col>
          <el-col :span="12">
          </el-col>
        </el-row>
      </div>
    </div>
    <div style="display: table-cell;width:1%;">&nbsp;</div>
    <div class="startpage_layout_right" v-if="hasRecordLog">
      <div style="height: 100%;padding:20px 16px;">
        <div :style="style0">{{$t('base.recentOperation')}}&nbsp;&nbsp;
          <a @click="viewLogsFun" class="startpage_more">{{$t('base.lookMore')}}</a>
        </div>
        <div style="position: relative;">
          <span v-if="logs.length==0">{{$t('base.nonOperRecord')}}</span>
          <div v-if="logs.length>0" class="startpage_timeline">&nbsp;</div>
          <div v-if="logs.length>0" style="padding-left: 30px;">
            <template v-for="(log,index) in logs">
              <div class="startpage_logs">
                <div>{{$t('base.operateObject')}}：{{log.target}}</div>
                <div>{{$t('base.operateDate')}}：{{log.create_time | tzTimeFormatter}}</div>
                <div>{{$t('base.project')}}：{{log.project_name?log.project_name:(log.project_id?log.project_id:"--")}}</div>
                <div>{{$t('base.level')}}：
                <el-button size="mini" type="info" v-if="log.log_level=='info'||log.log_level=='信息'">{{log.log_level}}</el-button>
                <el-button size="mini" type="warning" v-if="log.log_level=='error'||log.log_level=='错误'">{{log.log_level}}</el-button>
                </div>
                <div style="word-break: break-all;word-wrap: normal;">{{$t('base.detailInformation')}}：{{log.description}}</div>
                <img :src='timeLine' style="position: absolute;left:-38px;top:0px;" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import timeLine from 'assets/img/timeLine.png';
export default {
  name: "",
  data () {
    return {
      service:Vue.service,
      timeLine:timeLine,
      cardFlg:false,
      colors:["#fe2524", "#fe8625", "#ffe826", "#42c44a", "#99999d"],
      style0:{
        height:'60px',
        lineHeight: '60px',
        fontSize: '18px',
        fontWeight: '600'
      },
      style1:{
        fontSize:"14px",
        fontWeight:"600",
        display:"inline-block",
        height:"50px",
        lineHeight:"50px"
      },
      style2:{
        fontSize:"14px",
        display:"inline-block",
        height:"50px",
        lineHeight:"50px",
        textAlign:"center",
        width:"100%"
      },
      labels:{
        nova:{
          cores:this.$t('base.VCPUQuantityNum'),
          injected_file_content_bytes:this.$t('base.injectedFileContentNum'),
          injected_file_path_bytes:this.$t('base.injectedFilePathLengthNum'),
          injected_files:this.$t('base.injectedFileNum'),
          instances:this.$t('base.cloudHostNum'),
          key_pairs:this.$t('base.keyPairNum'),
          metadata_items:this.$t('base.metadataEntryNum'),
          ram:this.$t('base.memorymbNum'),
          server_groups:this.$t('base.serverGroupNum'),
          server_group_members:this.$t('base.serverGroupMemberNum')
        },
        neutron:{
          floatingip:this.$t('base.floatIPNum'),
          security_group:this.$t('base.securityGroupNum'),
          security_group_rule:this.$t('base.securityGroupRuleNum'),
          network:this.$t('base.networkNum'),
          port:this.$t('base.portNum'),
          router:this.$t('base.routeNum'),
          subnet:this.$t('base.subnetNum'),
          firewall:this.$t('base.firewallNum'),
          firewall_rule:this.$t('base.firewallRuleNum'),
          firewall_policy:this.$t('base.firewallStrategy'),
          loadbalancer:this.$t('base.loadBalancingNum'),
          pool:this.$t('base.resoucePoolNum'),
          listener:this.$t('base.monitorNum'),
          healthmonitor:this.$t('base.healthInspectorNum')
        },
        cinderv2:{
          volumes:this.$t('base.cloudHardDiskNum'),
          snapshots:this.$t('base.cloudHardDiskSnapshotNum'),
          gigabytes:this.$t('base.cloudDiskAndSnapshotSizeNum'),
          backups:this.$t('base.cloudHardDiskBakNum'),
          backup_gigabytes:this.$t('base.cloudDiskAndBakSizeNum')
        },
        manila:{
          shares:this.$t('base.fileStoreNum'),
          gigabytes:this.$t('base.fileStoreSizeNum'),
          snapshots:this.$t('base.fileStorageSnapshotNum'),
          snapshot_gigabytes:this.$t('base.fileStoreSnapshotSizeNum')
        }
      },
      storeret:{
        quota_set:{
          volumes:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          snapshots:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          gigabytes:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          backups:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          backup_gigabytes:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          }
        }
      },
      comret:{
        quota_set:{
          cores:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          injected_file_content_bytes:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          injected_file_path_bytes:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          injected_files:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          instances:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          key_pairs:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          metadata_items:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          ram:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          server_groups:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          server_group_members:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          }
        }
      },
      netret:{
        quota:{
          floatingip:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          security_group:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          security_group_rule:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          network:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          port:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          router:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          subnet:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          firewall:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          firewall_rule:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          firewall_policy:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          loadbalancer:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          pool:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          listener:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          },
          healthmonitor:{
            limit:"",
            used:"",
            percentage:0,
            status:"",
            flg:false
          }
        }
      },
      filestoreret:{
        quota_set:{
          shares:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          gigabytes:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          snapshots:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          },
          snapshot_gigabytes:{
            in_use:"",
            limit:"",
            percentage:0,
            status:""
          }
        }
      },
      logs:[],
      option1:{
        tooltip : {
          show:true,
          formatter:function(params) {
            return params.name+":"+params.value;
          }
        },
        grid:{
          left:"10%",
          right:"10%",
          bottom:"5%",
          top:'15%',
          containLabel:true
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
        xAxis:{
          type:'category',
          data:[],
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return val.length>6?val.substring(0, 5)+"..":val;
            }.bind(this)
          }
        },
        series : [{
          type: 'bar',
          data:[]
        }]
      },
      option2:{
        tooltip : {
          show:true,
          formatter:function(params) {
            return params.name+":"+params.value;
          }
        },
        grid:{
          left:"5%",
          right:"10%",
          bottom:"5%",
          top:'15%',
          containLabel:true
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
        xAxis:{
          type:'category',
          data:[],
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return val.length>6?val.substring(0, 5)+"..":val;
            }.bind(this)
          }
        },
        series : [{
          type: 'bar',
          data:[]
        }]
      },
      option3:{
        tooltip : {
          show:true,
          formatter:function(params) {
            return params.name+":"+params.value;
          }
        },
        grid:{
          left:"10%",
          right:"10%",
          bottom:"5%",
          top:'15%',
          containLabel:true
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
        xAxis:{
          type:'category',
          data:[],
          axisLabel:{
            color:this.$cookie.get("theme")=="dark"?'#fff':'#333',
            formatter:function(val) {
              return val.length>6?val.substring(0, 5)+"..":val;
            }.bind(this)
          }
        },
        series : [{
          type: 'bar',
          data:[]
        }]
      }
    }
  },
  mounted () {
    this.getData();
    if (this.hasRecordLog) {
      this.getRecord();
    }
    if (this.service.pluto) {
      this.getChartData();
    }
  },
  methods: {
    async getData() {
      let pid = this.$cookie.get("pid");
      if (this.service.nova) {
        let comret = await this.$ajax({
          type: 'get',
          url: "api/nova/v2/os-quota-sets/"+pid+"/detail"
        })
        for (var key2 in comret.quota_set) {
          if (this.comret.quota_set[key2]) {
            let o = {};
            o = $.extend(this.comret.quota_set[key2], comret.quota_set[key2]);
            o.percentage = parseInt(((o.in_use/o.limit)*100).toFixed(2));
            if (o.percentage<=50) {
              o.status = "success";
            } else {
              o.status = "exception";
            }
            this.comret.quota_set[key2] = o;
          }
        }
      }
      if (this.service.neutron) {
        let netret = await this.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/quotas/"+pid+"/details.json"
        })
        if (Vue.service.octavia) {
          netret.quota.loadbalancer = {};
          let loadbalancerRtn = await this.$ajax({
            type: 'get',
            url: "api/octavia/v2/lbaas/quotas/"+pid
          })
          let loadbalancerURtn = await this.$ajax({
            type: 'get',
            url: "api/octavia/v2.0/lbaas/loadbalancers?project_id="+pid
          })
          netret.quota.loadbalancer = {
            limit:loadbalancerRtn.quota.load_balancer,
            used:loadbalancerURtn.loadbalancers.length
          };
        }
        for (var key in netret.quota) {
          if (this.netret.quota[key]) {
            let o = {};
            o = $.extend(this.netret.quota[key], netret.quota[key], {flg:true});
            o.percentage = parseInt(((o.used/o.limit)*100).toFixed(0));
            //debugger
            if (o.percentage<=50) {
              o.status = "success";
            } else {
              o.status = "exception";
            }
            this.netret.quota[key] = o;
          }
        }
      }
      if (this.service.cinderv2) {
        let storeret = await this.$ajax({
          type: 'get',
          url: "api/cinderv2/v3/"+pid+"/os-quota-sets/"+pid+"?usage=true"
        })
        for (var key1 in storeret.quota_set) {
          if (this.storeret.quota_set[key1]) {
            let o = {};
            o = $.extend(this.storeret.quota_set[key1], storeret.quota_set[key1]);
            o.percentage = parseInt(((o.in_use/o.limit)*100).toFixed(0));
            if (o.percentage<=50) {
              o.status = "success";
            } else {
              o.status = "exception";
            }
            this.storeret.quota_set[key1] = o;
          }
        }
      }
      if (this.service.manila) {
        let filestoreret = await this.$ajax({
          type: 'get',
          url: "api/manila/v2/"+pid+"/quota-sets/"+pid+"/detail"
        })
        for (var key3 in filestoreret.quota_set) {
          if (this.filestoreret.quota_set[key3]) {
            let o = {};
            o = $.extend(this.filestoreret.quota_set[key3], filestoreret.quota_set[key3]);
            o.percentage = parseInt(((o.in_use/o.limit)*100).toFixed(0));
            if (o.percentage<=50) {
              o.status = "success";
            } else {
              o.status = "exception";
            }
            this.filestoreret.quota_set[key3] = o;
          }
        }
      }
    },
    async getRecord() {
      let me = this;
      var param = {
        limit:10,
        page:1,
        language:Vue.language,
        user_name:Vue.userName,
        user_name_accurate:"0",
        field:"create_time",
        dir:"desc",
        project_id:this.$cookie.get('pid'),
        region_id:this.$cookie.get("region_id")
      };
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/logs?"+ $.param(param),
        successFun(data) {
          me.logs = data.logs;
        },
        errFun() {
        }
      })
    },
    async getChartData() {
      let me = this;
      this.$ajax({
        type: 'post',
        url: "api/pluto/v1/monitor/resource_used/top",
        data:JSON.stringify({
          projectId:this.$cookie.get('pid'),
          type:"cpu"
        }),
        successFun(data) {
          let xarr = [];
          let yarr = [];
          data.resource_used_top.forEach((item, index) => {
            for (let key in item) {
              yarr.push({
                value:item[key].toFixed(2),
                itemStyle:{
                  normal:{
                    color:me.colors[index]
                  }
                }
              });
              xarr.push(key);
            }
          })
          me.option1.series[0].data = yarr;
          me.option1.xAxis.data = xarr;
        }
      });
      this.$ajax({
        type: 'post',
        url: "api/pluto/v1/monitor/resource_used/top",
        data:JSON.stringify({
          projectId:this.$cookie.get('pid'),
          type:"mem"
        }),
        successFun(data) {
          let xarr = [];
          let yarr = [];
          data.resource_used_top.forEach((item, index) => {
            for (let key in item) {
              yarr.push({
                value:item[key].toFixed(2),
                itemStyle:{
                  normal:{
                    color:me.colors[index]
                  }
                }
              });
              xarr.push(key);
            }
          })
          me.option2.series[0].data = yarr;
          me.option2.xAxis.data = xarr;
        }
      });
      this.$ajax({
        type: 'post',
        url: "api/pluto/v1/monitor/resource_used/top",
        data:JSON.stringify({
          projectId:this.$cookie.get('pid'),
          type:"disk"
        }),
        successFun(data) {
          let xarr = [];
          let yarr = [];
          data.resource_used_top.forEach((item, index) => {
            for (let key in item) {
              yarr.push({
                value:item[key].toFixed(2),
                itemStyle:{
                  normal:{
                    color:me.colors[index]
                  }
                }
              });
              xarr.push(key);
            }
          })
          me.option3.series[0].data = yarr;
          me.option3.xAxis.data = xarr;
        }
      });
    },
    viewLogsFun() {
      this.$router.push({
        path: '/systemManagement/record',
        query: {
          __: +new Date()
        }
      });
    }
  },
  computed: {
    hasRecordLog() {
      return Vue.AuthList['m.systemmanage.opreatelog'];
    }
  }
}
</script>
