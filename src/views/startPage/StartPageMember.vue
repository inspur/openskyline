<template>
  <div style="display: inline-table;width: 100%;">
    <div style="display: table-cell;width:1%;max-width: 10px;">&nbsp;</div>
    <div class="startpage_layout">
      <div style="height: 100%;padding:20px 16px;">
        <div :style="style0">{{$t('base.orderAppList')}}&nbsp;&nbsp;
          <a @click="viewOrderFun" class="startpage_more">{{$t('base.lookMore')}}</a>
        </div>
        <div style="margin-top:10px;">
          <el-table ref="deTable" :data="tableData" slot="empty" max-height='500' row-key="id" @sort-change="sortChange">
            <el-table-column prop="name" :label="$t('opt.orderNumber')" min-width="100" sortable="custom">
            </el-table-column>
            <el-table-column prop="projectName" :label="$t('opt.project')" min-width="100">
            </el-table-column>
            <el-table-column prop="resType" align="center" :label="$t('opt.businessType')" min-width="100">
              <template slot-scope="scope">
                <span v-html="resTypeRender(scope.row.resType)"></span>
              </template>
            </el-table-column>
            <el-table-column prop="desc" :label="$t('opt.description')" min-width="100">
              <template slot-scope="scope">
                <span>{{scope.row.desc?scope.row.desc:'-'}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" :label="$t('opt.applicationTime')" min-width="100" sortable="custom">
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="5">
                <el-button type="text" icon="fa-refresh" @click="getOrderData">
                </el-button>
              </el-col>
              <el-col :span="19">
                <page :totalData="totalData"  @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
              </el-col>
            </el-row>
          </div>
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
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      logs:[],
      tableData:[],
      totalData: [],
      colors:["#fe2524", "#fe8625", "#ffe826", "#42c44a", "#99999d"],
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
    this.getOrderData();
    if (this.hasRecordLog) {
      this.getRecord();
    }
    if (this.service.pluto) {
      this.getChartData();
    }
  },
  methods: {
    getRecord() {
      let me = this;
      var param = {
        limit:8,
        page:1,
        language:Vue.language,
        user_name:Vue.userName,
        user_name_accurate:"0",
        field:"create_time",
        dir:"desc",
        project_id:this.$cookie.get('pid'),
        region_id:this.$cookie.get("region_id")
      };
      this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/logs?"+ $.param(param),
        successFun(data) {
          me.logs = data.logs;
        },
        errFun() {
        }
      })
    },
    getOrderData() {
      let me = this;
      this.$ajax({
        type: 'PUT',
        data: JSON.stringify({
          "applicant_id": Vue.userId,
          "order_type": "FLOWORDER",
          "order_state": "0"
        }),
        url: "api/leo/v1/order/get_applicant_order_list",
        successFun(result) {
          let arr = [];
          for (let i=0; i<result.data.length; i++) {
            let item = result.data[i];
            arr.push({
              id:item.order_id,
              name:item.order_name,
              projectName:item.project_name,
              resType:item.resource_type,
              desc:item.op_desc,
              createTime:item.applicant_time
            });
          }
          me.totalData = arr;
        }
      });
    },
    async getChartData() {
      let me = this;
      this.$ajax({
        type: 'post',
        url: "api/pluto/v1/monitor/resource_used/top",
        data:JSON.stringify({
          projectId:this.$cookie.get('pid'),
          userId:Vue.userId,
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
          userId:Vue.userId,
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
          userId:Vue.userId,
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
    getCurrentData(data) {
      this.tableData = data;
    },
    viewLogsFun() {
      this.$router.push({
        path: '/systemManagement/record',
        query: {
          __: +new Date()
        }
      });
    },
    viewOrderFun() {
      this.$router.push({
        path: '/operations/flowUser/userFlow',
        query: {
          __: +new Date()
        }
      });
    },
    applyProject() {
      this.cardFlg = true;
      this.$nextTick(() => {
      });
    },
    resTypeRender(value) {
      let self = this
      let resourceName = "";
      switch (value) {
        case "VM.CREATE":
          resourceName = self.$t('opt.createCloudHost');
          break;
        case "VM.UPDATE":
          resourceName = self.$t('opt.updateCloudHost');
          break;
        case "VOLUME.CREATE":
          resourceName = self.$t('opt.createCloudHardDisk');
          break;
        case "VOLUME.UPDATE":
          resourceName = self.$t('opt.updateCloudHardDisk');
          break;
        case "PROJECT.CREATE":
          resourceName = self.$t('opt.createProject');
          break;
        case "HOST.CREATE":
          resourceName = self.$t('opt.cloudPhysicalHost');
          break;
        default:
          resourceName = "-"
      };
      return resourceName;
    },
    sortChange(column) {
      if (!column.prop) { return; }
      this.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      }
    }
  },
  computed: {
    hasRecordLog() {
      return Vue.AuthList['m.systemmanage.opreatelog'];
    }
  }
}
</script>
