<template>
  <div ref="page1">
    <div>
    <!--第一行start-->
      <div class="one-box">
        <!--项目数-->
        <div class="one-item" v-loading="loading.row1.projectNum">
          <div :class="'start-page-one'+ theme2">
            <el-col :span="12">
              <div :class="'start-page-one-t'+theme2">
                <span>{{$t('base.project')}}</span>
              </div>
              <div :class="'start-page-one-b'+theme2">
                <span>{{projectNum}}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="start-page-one-right">
                <img :src='projectImage'/>
              </div>
            </el-col>
          </div>
        </div>
        <!--az数-->
        <div class="one-item" v-loading="loading.row1.azNum" style="margin-left: 10px;">
          <div :class="'start-page-one'+ theme2">
            <el-col :span="12">
              <div :class="'start-page-one-t'+theme2">
                <span>AZ</span>
              </div>
              <div :class="'start-page-one-b'+theme2">
                <span>{{azNum}}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="start-page-one-right">
                <img :src='azImage'/>
              </div>
            </el-col>
          </div>
        </div>
        <!--网络数-->
        <div class="one-item" v-loading="loading.row1.networkNum" style="margin-left: 10px;">
          <div :class="'start-page-one'+ theme2">
            <el-col :span="12">
              <div :class="'start-page-one-t'+theme2">
                <span>{{$t('base.network')}}</span>
              </div>
              <div :class="'start-page-one-b'+theme2">
                <span>{{netWorkNum}}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="start-page-one-right">
                <img :src='networkImage'/>
              </div>
            </el-col>
          </div>
        </div>
        <!--用户数-->
        <div class="one-item" v-loading="loading.row1.userNum" style="margin-left: 10px;">
          <div :class="'start-page-one'+ theme2">
            <el-col :span="12">
              <div :class="'start-page-one-t'+theme2">
                <span>{{$t('base.user')}}</span>
              </div>
              <div :class="'start-page-one-b'+theme2">
                <span>{{userNum}}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="start-page-one-right">
                <img :src='userImage'/>
              </div>
            </el-col>
           </div>
        </div>
        <!-- 负载均衡数 -->
        <div class="one-item" v-if="loadblanceFlag" style="margin-left: 10px;">
          <div :class="'start-page-one'+ theme2">
            <el-col :span="12">
              <div :class="'start-page-one-t'+theme2">
                <span>{{$t('base.loadBalancing')}}</span>
              </div>
              <div :class="'start-page-one-b'+theme2">
                <span>{{loadbalanceNum}}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="start-page-one-right">
                <img :src='loadbalanceImage'/>
              </div>
            </el-col>
           </div>
        </div>
        <!-- 数据库数 -->
        <div class="one-item" v-if="databaseFlag" style="margin-left: 10px;">
          <div :class="'start-page-one'+ theme2">
            <el-col :span="12">
              <div :class="'start-page-one-t'+theme2">
                <span>{{$t('base.databaseInstance')}}</span>
              </div>
              <div :class="'start-page-one-b'+theme2">
                <span>{{databaseNum}}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="start-page-one-right">
                <img :src='databaseImage'/>
              </div>
            </el-col>
           </div>
        </div>
         <!-- 容器集群 -->
        <div class="one-item" v-if="kbclusterFlag" style="margin-left: 10px;">
          <div :class="'start-page-one'+ theme2">
            <el-col :span="12">
              <div :class="'start-page-one-t'+theme2">
                <span>{{$t('container.containerCluster')}}</span>
              </div>
              <div :class="'start-page-one-b'+theme2">
                <span>{{kbcontainerNum}}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="start-page-one-right">
                <img :src='kbclusterImage'/>
              </div>
            </el-col>
           </div>
        </div>
      </div>
    <!--第一行end-->
    <!--第二行start-->
      <el-row :gutter="11" style="margin-top:8px;">
        <el-col :span="4">
          <div class="start-page-one-percent2" :class="theme" :style="'height:'+secondDivHeight+'px;'">
            <div :class="'start-page-one-percent2-t' + theme2">{{$t('container.vmaz')}}</div>
            <IEcharts :option="optionPieVMAZ"
                      :resizable="true"
                      :loading="loading.row2.vmAZ"
                      :style="'height:'+secondHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="start-page-one-percent2" :class="theme" :style="'height:'+secondDivHeight+'px;'">
            <div :class="'start-page-one-percent2-t' + theme2">{{$t('container.vmproject')}}</div>
            <IEcharts :option="optionPieVMProject"
                      :resizable="true"
                      :loading="loading.row2.vmProject"
                      :style="'height:'+secondHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="start-page-one-percent2" :class="theme" :style="'height:'+secondDivHeight+'px;'">
            <div :class="'start-page-one-percent2-t' + theme2">CPU{{$t('container.byProject')}}</div>
            <IEcharts :option="optionPieCPU"
                      :resizable="true"
                      :loading="loading.row2.cpu"
                      :style="'height:'+secondHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="start-page-one-percent2" :class="theme" :style="'height:'+secondDivHeight+'px;'">
            <div :class="'start-page-one-percent2-t' + theme2">{{$t('base.memory')+$t('container.byProject')}}</div>
            <IEcharts :option="optionPieMem"
                      :resizable="true"
                      :loading="loading.row2.mem"
                      :style="'height:'+secondHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="start-page-one-percent2" :class="theme" :style="'height:'+secondDivHeight+'px;'">
            <div :class="'start-page-one-percent2-t' + theme2">{{$t('container.blockStorage')+$t('container.byProject')}}</div>
            <IEcharts :option="optionPieStorage"
                      :resizable="true"
                      :loading="loading.row2.storage"
                      :style="'height:'+secondHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="start-page-one-percent2" :class="theme" :style="'height:'+secondDivHeight+'px;'">
            <div :class="'start-page-one-percent2-t' + theme2">{{$t('base.network')+$t('container.byProject')}}</div>
            <IEcharts :option="optionPieNetIp"
                      :resizable="true"
                      :loading="loading.row2.net"
                      :style="'height:'+secondHeight+'px;'">
            </IEcharts>
          </div>
        </el-col>
      </el-row>
    <!--第二行end-->
    <!--第三行start-->
      <el-row :gutter="11" style="margin-top:8px;">
        <!--CPU-->
        <el-col :span="clientWidth>1400?6:12" v-loading="loading.row3.cpu">
          <div class="start-page-one-percent3" :class="theme">
            <div :class="'start-page-one-toleft' + theme2">
              <span>{{$t('container.cpuallocate')}}</span>
            </div>
            <div :class="'start-page-one-toright' + theme2">{{cpuAllocate}}%</div>
            <div class="start-page-one-percent3-progress">
              <div class="start-page-one-percent3-progress-label">
                <div class="start-page-one-percent3-progress-labelL">{{$t('container.vmcputotal')}}</div>
                <div :class="'start-page-one-percent3-progress-labelR'+theme2">{{cpuVMCores}}</div>
              </div>
              <div :class="'progress-outter' + theme2">
                <div class="progress-inner" v-bind:style="{ width : (cpuAllocate < 100 ? cpuAllocate + '%':'100%'), backgroundColor: '#0087ed'}"></div>
              </div>
            </div>
            <div class="start-page-one-percent3-progress">
              <div class="start-page-one-percent3-progress-label">
                <div class="start-page-one-percent3-progress-labelL">{{$t('container.hostcputotal')}}</div>
                <div :class="'start-page-one-percent3-progress-labelR'+theme2">{{cpuCores}}</div>
              </div>
              <div :class="'progress-outter' + theme2">
                <div class="progress-inner" v-bind:style="{ width : (cpuAllocate < 100 ? '100%' : 10000/cpuAllocate +'%'), backgroundColor: '#0087ed'}"></div>
              </div>
            </div>
          </div>
        </el-col>
        <!--内存-->
        <el-col :span="clientWidth>1400?6:12" v-loading="loading.row3.mem">
          <div class="start-page-one-percent3" :class="theme">
            <div :class="'start-page-one-toleft' + theme2">
              <span>{{$t('container.memallocate')}}</span>
            </div>
            <div :class="'start-page-one-toright' + theme2">{{memAllocate}}%</div>
            <div class="start-page-one-percent3-progress">
              <div class="start-page-one-percent3-progress-label">
                <div class="start-page-one-percent3-progress-labelL">{{$t('container.vmhosttotal')}}</div>
                <div :class="'start-page-one-percent3-progress-labelR'+theme2">{{memVMTotal | fileSize}}</div>
              </div>
              <div :class="'progress-outter' + theme2">
                <div class="progress-inner" v-bind:style="{ width : (memAllocate < 100 ? memAllocate + '%':'100%'), backgroundColor: '#0087ed'}"></div>
              </div>
            </div>
            <div class="start-page-one-percent3-progress">
              <div class="start-page-one-percent3-progress-label">
                <div class="start-page-one-percent3-progress-labelL">{{$t('container.hostmemtotal')}}</div>
                <div :class="'start-page-one-percent3-progress-labelR'+theme2">{{memHostTotal | fileSize}}</div>
              </div>
              <div :class="'progress-outter' + theme2">
                <div class="progress-inner" v-bind:style="{ width : (memAllocate < 100 ? '100%' : 10000/memAllocate +'%'), backgroundColor: '#0087ed'}"></div>
              </div>
            </div>
          </div>
        </el-col>
        <!--存储-->
        <el-col :span="clientWidth>1400?6:12" v-loading="loading.row3.storage">
          <div class="start-page-one-percent3" :class="theme">
            <div :class="'start-page-one-toleft' + theme2">
              <span>{{$t('container.storageallocate')}}</span>
              <el-tooltip :effect="theme" :content="$t('storage.startpage_blockstorage')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
              <el-tooltip :effect="theme" :content="storageName">
              <el-select v-model="storageName" filterable size="small" @change="setStorageChart" class="storege-short-select">
                <el-option v-for="name in storageNameList" :key="name" :value="name" :label="name"></el-option>
              </el-select>
              </el-tooltip>
            </div>
            <div :class="'start-page-one-toright' + theme2">{{storageAllocate}}%</div>
            <div class="start-page-one-percent3-progress">
              <div class="start-page-one-percent3-progress-label">
                <div class="start-page-one-percent3-progress-labelL">{{$t('container.storageblocktotal')}}</div>
                <div :class="'start-page-one-percent3-progress-labelR'+theme2">{{storageBlockTotal | fileSize}}</div>
              </div>
              <div :class="'progress-outter' + theme2">
                <div class="progress-inner" v-bind:style="{ width : (storageAllocate < 100 ? storageAllocate + '%':'100%'), backgroundColor: '#0087ed'}"></div>
              </div>
            </div>
            <div class="start-page-one-percent3-progress">
              <div class="start-page-one-percent3-progress-label">
                <div class="start-page-one-percent3-progress-labelL">{{$t('container.realstoragetotal')}}</div>
                <div :class="'start-page-one-percent3-progress-labelR'+theme2">{{storageTotal | fileSize}}</div>
              </div>
              <div :class="'progress-outter' + theme2">
                <div class="progress-inner" v-bind:style="{ width : (userPercent < 100 ? userPercent +'%' : '100%'), backgroundColor: '#0087ed'}"></div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="clientWidth>1400?6:12" v-loading="loading.row3.network">
          <div class="start-page-one-percent3" :class="theme">
            <div :class="'start-page-one-toleft' + theme2">
              <span>{{$t('network.IP_EXTERNAL_USAGE')}}</span>
              <el-tooltip :effect="theme" :content="networkName">
                <el-select v-model="networkName" filterable size="small" @change="setNetworkChart" class="storege-short-select">
                  <el-option v-for="item in networkList" :key="item.id" :value="item.name" :label="item.name"></el-option>
                </el-select>
              </el-tooltip>
              <i v-if="parseFloat(ipusage) >= 80" class="el-icon-fa-exclamation-circle" style="color: #fa1914"></i>
            </div>
            <div :class="'start-page-one-toright' + theme2">{{ipusage}}%</div>
            <div class="start-page-one-percent3-progress">
              <div class="start-page-one-percent3-progress-label">
                <div class="start-page-one-percent3-progress-labelL">{{$t('network.IP_EXTERNAL_USED')}}</div>
                <div :class="'start-page-one-percent3-progress-labelR'+theme2">{{ipusedNum}}</div>
              </div>
              <div :class="'progress-outter' + theme2">
                <div class="progress-inner" v-bind:style="{ width : ipusage + '%', backgroundColor: '#0087ed'}"></div>
              </div>
            </div>
            <div class="start-page-one-percent3-progress">
              <div class="start-page-one-percent3-progress-label">
                <div class="start-page-one-percent3-progress-labelL">{{$t('network.IP_EXTERNAL_TOTAL')}}</div>
                <div :class="'start-page-one-percent3-progress-labelR'+theme2">{{iptotalNum}}</div>
              </div>
              <div :class="'progress-outter' + theme2">
                <div class="progress-inner" v-bind:style="{ width : '100%', backgroundColor: '#0087ed'}"></div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    <!--第三行end-->
    <!--第四行start-->
      <el-row :gutter="11" style="margin-top:8px;margin-bottom: 16px;" v-if="service.pluto">
        <el-col :span="8">
          <div class="start-page-one-percent4" :class="theme" :style="'height:'+chartHeight+'px;'">
            <IEcharts :option="optionCpuHistory"
                      :resizable="true"
                      :loading="loading.row4.cpu">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="start-page-one-percent4" :class="theme" :style="'height:'+chartHeight+'px;'">
            <IEcharts :option="optionMemHistory"
                      :resizable="true"
                      :loading="loading.row4.mem">
            </IEcharts>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="start-page-one-percent3" :class="theme" :style="'height:'+chartHeight+'px;'">
            <div :class="'start-page-one-toleft' + theme2" style="margin-bottom:0px;">
              <span>{{$t('container.blockStorageUsage')}}</span>
            </div>
          <dashboard
          class="left"
          :option="{percent:storageUsage,content:{text: this.$t('container.realstoragetotal')}, progressBar: {backgroundInnerColor:'#2fc25b'}}"/>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="start-page-one-percent4" :class="theme" :style="'height:'+chartHeight+'px;'">
            <el-row :gutter="6">
              <el-col :span="24">
                <div :class="'start-page-one-t'+theme2">
                  <span>{{$t('container.storageused')}}</span>
                </div>
                <div :class="'start-page-one-b'+theme2" style="padding-top:15px;">
                  <span>{{storageUsedTotal | fileSize}}</span>
                </div>
              </el-col>
              <el-col :span="24" v-if="filestorageFlag">
                <el-row>
                  <el-col :class="'start-page-one-horizontal-line' + theme2"></el-col>
                </el-row>
                <div :class="'start-page-one-t'+theme2">
                  <span>{{$t('container.filestorageused')}}</span>
                </div>
                <div :class="'start-page-one-b'+theme2" style="padding-top:15px;">
                  <span>{{fileStorageUsed}}</span>
                </div>
              </el-col>
              <el-col :span="24" v-if="objstorgeFlag">
                <el-row>
                  <el-col :class="'start-page-one-horizontal-line' + theme2"></el-col>
                </el-row>
                <div :class="'start-page-one-t'+theme2">
                  <span>{{$t('container.objectstorageused')}}</span>
                </div>
                <div :class="'start-page-one-b'+theme2" style="padding-top:15px;">
                  <span>{{objectStorageUsed}}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
    <!--第四行end-->
    </div>
     <router-view></router-view>
  </div>
</template>
<script>
import moment from "moment";
import JSBI from 'jsbi';
import projectImage from 'assets/img/startPageOne/project.png';
import azImage from 'assets/img/startPageOne/az.png';
import networkImage from 'assets/img/startPageOne/network.png';
import userImage from 'assets/img/startPageOne/user.png';
import loadbalanceImage from 'assets/img/startPageOne/balance.png';
import databaseImage from 'assets/img/startPageOne/database.png';
import kbclusterImage from 'assets/img/startPageOne/kbcluster.png';
import echarts from 'echarts';
import formatFileSize from 'utils/formatFileSize';
import Dashboard from './components/Dashboard';
import _ from 'underscore';
const chartColors = ['#0087ed', '#26A69A', "#2fc25b", "#faad14", "#f04864"];
export default {
  components: {
    Dashboard
  },
  name: "",
  data () {
    return {
      theme: this.$cookie.get("theme") == 'dark' ? 'dark' : 'light',
      theme2: this.$cookie.get("theme") == 'dark' ? '-dark' : '',
      loading: {
        row1: {
          projectNum: false,
          azNum: false,
          networkNum: false,
          userNum: false
        },
        row2: {
          vmAZ: false,
          vmProject: false,
          cpu: false,
          mem: false,
          storage: false,
          net: false
        },
        row3: {
          cpu: false,
          mem: false,
          storage: false,
          network: false
        },
        row4: {
          cpu: false,
          mem: false
        }
      },
      projectImage,
      azImage,
      networkImage,
      userImage,
      loadbalanceImage,
      databaseImage,
      kbclusterImage,
      azNum:"-", // AZ个数
      projectNum:"-", // 项目个数
      netWorkNum:"-", // 网络个数
      userNum:"-", // 用户个数
      loadbalanceNum:"-", // 负载均衡个数
      databaseNum:"-", // 数据库实例个数
      kbclusterNum:"-", // 容器集群个数
      kbcontainerNum:"-", // 容器实例个数
      loadblanceFlag: false,
      databaseFlag: false,
      kbclusterFlag: false,
      kbapplicationFlag: false,
      objstorgeFlag: false,
      filestorageFlag: false,
      projectList:[], // 项目列表
      azList:[], // AZ列表
      formatFileSize:formatFileSize,
      optionPieVMAZ:{ // 虚拟机-AZ
        color: chartColors,
        tooltip : {
          show:true,
          formatter:function(params, ticket, callback) {
            return params.name+":"+params.value+"("+params.percent+'%)';
          }
        },
        legend: {
          show: true,
          orient: "horizontal",
          align: 'left',
          icon: 'circle',
          itemWidth: 6,
          itemHeight: 6,
          left: 'left',
          bottom: 0,
          padding: [15, 10, 5, 12],
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
      optionPieVMProject:{ // 虚拟机-项目
        color: chartColors,
        tooltip : {
          show:true,
          formatter:function(params, ticket, callback) {
            return params.name+":"+params.value+"("+params.percent+'%)';
          }
        },
        legend: {
          show: true,
          orient:"horizontal",
          icon: 'circle',
          itemWidth: 6,
          itemHeight: 6,
          left: 'left',
          bottom: 0,
          padding: [15, 10, 5, 12],
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
      optionPieCPU:{
        color: chartColors,
        tooltip : {
          show:true,
          formatter:function(params, ticket, callback) {
            return params.name+":"+params.value+"("+params.percent+'%)';
          }
        },
        legend: {
          show: true,
          orient:"horizontal",
          icon: 'circle',
          itemWidth: 6,
          itemHeight: 6,
          left: 'left',
          bottom: 0,
          padding: [15, 10, 5, 12],
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
      optionPieMem:{
        color: chartColors,
        tooltip : {
          show:true,
          formatter:function(params, ticket, callback) {
            return params.name+":"+ formatFileSize(params.value, "MB")+"("+params.percent+'%)';
          }
        },
        legend: {
          show: true,
          orient:"horizontal",
          icon: 'circle',
          itemWidth: 6,
          itemHeight: 6,
          left: 'left',
          bottom: 0,
          padding: [15, 10, 5, 12],
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
      optionPieStorage:{
        color: chartColors,
        tooltip : {
          show:true,
          formatter:function(params, ticket, callback) {
            return params.name+":"+ formatFileSize(params.value, "GB")+"("+params.percent+'%)';
          }
        },
        legend: {
          show: true,
          orient:"horizontal",
          icon: 'circle',
          itemWidth: 6,
          itemHeight: 6,
          left: 'left',
          bottom: 0,
          padding: [15, 10, 5, 12],
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
      optionPieNetIp:{
        color: chartColors,
        tooltip : {
          show:true,
          formatter:function(params, ticket, callback) {
            return params.name+":"+params.value+"("+params.percent+'%)';
          }
        },
        legend: {
          show: true,
          orient:"horizontal",
          icon: 'circle',
          itemWidth: 6,
          itemHeight: 6,
          left: 'left',
          bottom: 0,
          padding: [15, 10, 5, 12],
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
      optionCpuHistory:{
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          type:'time',
          boundaryGap:false,
          data:[],
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel:{
            rotate: 30,
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
        yAxis:{
          type:'value',
          name:Vue.t('monitor.cpuUtilization')+"(%)",
          splitLine: {
            show: true,
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaa',
              type: 'dash'
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
        grid:{
          left: 60,
          top: 30,
          bottom: 50,
          right: 10
        },
        series:[{
          data:[],
          smooth:true,
          type:'line',
          symbol: 'none',
          lineStyle:{
            normal:{
              color:"#2297f0"
            }
          }
        }]
      },
      optionMemHistory:{
        tooltip:{
          trigger:'axis'
        },
        xAxis:{
          type:'time',
          boundaryGap:false,
          data:[],
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisPointer: {
            label: {
              formatter(params) {
                return `${moment(params.value).format("YYYY-MM-DD HH:mm")}`;
              }
            }
          },
          axisLabel:{
            rotate: 30,
            color:this.$cookie.get("theme")=="dark"?'#999999':'#333',
            formatter:function(val) {
              return this.formatX(val)
            }.bind(this)
          },
          axisLine: {
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaaaaa'
            }
          },
          splitNumber: 10
        },
        yAxis:{
          type:'value',
          name:Vue.t('base.memUtilization')+"(%)",
          splitLine: {
            show: true,
            lineStyle: {
              color: this.$cookie.get("theme")=="dark"?'rgba(255, 255, 255, 0.2)':'#aaa',
              type: 'dash'
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
        grid:{
          left: 60,
          top: 30,
          bottom: 50,
          right: 10
        },
        series:[{
          data:[],
          smooth:true,
          type:'line',
          symbol: 'none',
          lineStyle:{
            normal:{
              color:"#2297f0"
            }
          }
        }]
      },
      cpuAllocate:0,
      cpuCores:0,
      cpuVMCores:0,
      memAllocate: 0,
      memHostTotal:0,
      memVMTotal:0,
      memHostUsed:0,
      storageAllocate:0,
      storageTotal:0,
      storageUsed:0,
      storageUsage:0,
      storageBlockTotal:0,
      storageName:"",
      storageNameList:[],
      storageList:[],
      ipusage: 0,
      iptotalNum: '0',
      ipusedNum: '0',
      networkList: [],
      networkName: "",
      service:Vue.service,
      tempHeight: 900,
      chartHeight: 260,
      secondHeight: 220,
      secondDivHeight: 257,
      moreHeight:0,
      blockStorageUsed:0,
      fileStorageUsed:"-",
      objectStorageUsed:"-",
      storageUsedTotal:0,
      clientWidth: 0,
      userPercent: 0
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.tempHeight = this.$refs.page1.offsetHeight;
    });
    let bodyHeight = document.body.clientHeight;
    this.clientWidth = document.body.clientWidth;
    if (bodyHeight - 1009 > 0) {
      this.moreHeight = bodyHeight - 1009;
    }
    this.chartHeight+= this.moreHeight*0.6;
    this.secondHeight+= this.moreHeight*0.4;
    this.secondDivHeight+= this.moreHeight*0.4;
  },
  methods: {
    initStartPage() {
      let self = this;
      this.getCustomPage();
      this.getUserNum();
      Promise.all([self.getProjectNum(), self.getazNum()]).then(function(result) {
        self.getVMData();
        self.getNetWorkNum();
        self.getCPUMemPieData();
        self.getStoragePieChartData();
      });
      this.getNetworkIps();
      this.getStorageAllocChart();
      let date = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000);
      let endTime = parseInt(date.getTime()/1000);
      let startTime = parseInt((date.setDate(date.getDate()-7))/1000);
      if (this.service.pluto) {
        this.getCPUStory(startTime, endTime);
        this.getMemStory(startTime, endTime);
      }
    },
    async getProjectNum() {
      var param = {limit:999999, page:1, domain_id:"default"};
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/projects?" + $.param(param),
        showErrMsg:false
      });
      this.loading.row1.projectNum = false;
      this.projectNum = ret.projects.length;
      this.projectList = [];
      for (let i=0; i<ret.projects.length; i++) {
        let project = ret.projects[i];
        let obj = {id: project.id, name:project.name, value: 0, netvalue: 0, cpuvalue:0, memvalue: 0};
        this.projectList.push(obj)
      }
    },
    async getazNum() {
      let ret = await this.$ajax({
        type: 'get',
        url: 'api/nova/v2.1/os-availability-zone/detail',
        showErrMsg:false
      });
      this.loading.row1.azNum = false;
      this.azNum = ret['availabilityZoneInfo'].length;
      this.azList = [];
      this.azList.push({name: this.$t("base.other"), value:0});
      for (let i=0; i<ret['availabilityZoneInfo'].length; i++) {
        let az = ret['availabilityZoneInfo'][i];
        let obj = {name: az["zoneName"], value: 0};
        this.azList.push(obj);
      }
    },
    async getUserNum() {
      let param = {limit:1, page:1, domain_id:"default"};
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/users?"+ $.param(param),
        showErrMsg:false
      })
      this.loading.row1.userNum = false;
      this.userNum = ret.users.length;
    },
    async getNetWorkNum() {
      let self = this;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/networks",
        showErrMsg:false,
        errorKey: "NeutronError"
      });
      this.loading.row1.networkNum = false;
      this.netWorkNum = ret.networks.length;
      let netData = [];
      let ohternetnumber = 0;
      for (let i=0; i<ret["networks"].length; i++) {
        let item = ret["networks"][i];
        let netflag = false;
        for (let j=0; j<self.projectList.length; j++) {
          if (item["tenant_id"] == self.projectList[j]["id"]) {
            self.projectList[j]["netvalue"]++;
            netflag = true;
          }
        }
        if (item["tenant_id"] == "" || netflag == false) {
          ohternetnumber++;
        }
      }
      this.projectList.sort(self.compare("netvalue"));
      for (let i=0; i<self.projectList.length; i++) {
        if (i < 4) {
          let net = {name:self.projectList[i]["name"], value:self.projectList[i]["netvalue"]}
          netData.push(net);
        } else {
          ohternetnumber += self.projectList[i]["netvalue"];
        }
      }
      netData.push({name: Vue.t('base.other'), value: ohternetnumber})
      this.optionPieNetIp.series[0].data = netData;
      let projectLegend = [];
      for (let i=0; i<netData.length; i++) {
        if (netData[i]["value"] != 0) {
          let projectname = netData[i]["name"];
          projectLegend.push(projectname);
        }
      }
      this.optionPieNetIp.legend.data = projectLegend;
      this.loading.row2.net = false;
    },
    async getVMData() {
      let vmResult = await this.$ajax({
        type: 'get',
        url: "api/nova/v2.1/servers/detail?all_tenants=1&limit=1",
        headers: {
          'X-OpenStack-Nova-API-Version': 2.67
        }
      });
      let vmtotalNum = vmResult.all_instances_info.total_instances;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/nova/v2.1/servers-inspur/index",
        headers: {
          'X-OpenStack-Nova-API-Version': 2.67
        }
      });
      let instancenum = ret.instance_num;
      let azlist = instancenum["az_list"] || {};
      let plist = instancenum["project_list"] || {};
      let azLeft = 0;
      let projectLeft = 0;
      for (let az in azlist) {
        azLeft+=azlist[az];
        for (let i=1; i<this.azList.length; i++) {
          if (this.azList[i]['name'] == az) {
            this.azList[i]['value'] = azlist[az];
            break;
          }
        }
      }
      this.azList[0]["value"] = vmtotalNum - azLeft;
      for (let pj in plist) {
        projectLeft+=plist[pj];
        for (let i=0; i<this.projectList.length; i++) {
          if (this.projectList[i]['id'] == pj) {
            this.projectList[i]['value'] = plist[pj];
            break;
          }
        }
      }
      this.setVMChart();
      this.getResourceUtilization();
    },
    // async getVMData() {
    //   let self = this;
    //   let ret = await this.$ajax({
    //     type: 'get',
    //     url: "api/nova/v2.1/servers-inspur/detail?all_tenants=1&limit=99999",
    //     headers: {
    //       'X-OpenStack-Nova-API-Version': 2.67
    //     }
    //   });
    //   this.vmNum = ret.all_instances_info.total_instances;
    //   for (let i=0; i<ret.servers.length; i++) {
    //     let item = ret.servers[i];
    //     if (item["OS-EXT-AZ:availability_zone"] == "") {
    //       self.azList[0]["value"]++
    //     }
    //     for (let j=1; j<self.azList.length; j++) {
    //       if (item["OS-EXT-AZ:availability_zone"] == self.azList[j]["name"]) {
    //         self.azList[j]["value"]++;
    //       }
    //     }
    //     for (let j=0; j<self.projectList.length; j++) {
    //       if (item["tenant_id"] == self.projectList[j]["id"]) {
    //         self.projectList[j]["value"]++;
    //       }
    //     }
    //   }
    //   self.setVMChart();
    //   self.getResourceUtilization();
    // },
    setVMChart() {
      let self = this;
      // 第二行 虚拟机-AZ
      this.optionPieVMAZ.series[0].data = this.azList.sort(self.compare("value"));
      // 第二行 虚拟机-项目
      let projectData = [];
      this.projectList.sort(self.compare("value"));
      let otherprojectNumber = 0;
      for (let i=0; i<self.projectList.length; i++) {
        if (i < 4) {
          projectData.push(self.projectList[i]);
        } else {
          otherprojectNumber += self.projectList[i]["value"];
        }
      }
      projectData.push({name: Vue.t('base.other'), value: otherprojectNumber})
      this.optionPieVMProject.series[0].data = projectData;
      let azLegend = [];
      for (let i=0; i<this.azList.length; i++) {
        if (this.azList[i]["value"] != 0 && this.azList[i]["name"]!=this.$t("base.other")) {
          azLegend.push(this.azList[i]["name"]);
        }
      }
      for (let i=0; i<this.azList.length; i++) {
        if (this.azList[i]["value"] != 0 && this.azList[i]["name"]==this.$t("base.other")) {
          azLegend.push(this.azList[i]["name"]);
        }
      }
      this.optionPieVMAZ.legend.data = azLegend;
      this.loading.row2.vmAZ = false;
      let projectLegend = [];
      for (let i=0; i<projectData.length; i++) {
        if (projectData[i]["value"] != 0) {
          let projectname = projectData[i]["name"];
          projectLegend.push(projectname);
        }
      }
      this.optionPieVMProject.legend.data = projectLegend;
      this.loading.row2.vmProject = false;
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
    async getCPUMemPieData() {
      let self = this;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/nova/v2.1/os-quota-sets"
      });
      // 第二行 CPU
      let cpuData = [];
      let ohtercpunumber = 0;
      for (let i=0; i<ret["all_projects_quotas"].length; i++) {
        let item = ret["all_projects_quotas"][i];
        let quotaset = item["quota_set"];
        for (let j=0; j<self.projectList.length; j++) {
          if (quotaset["id"] == self.projectList[j]["id"]) {
            let cpuinuse = quotaset["cores"]["in_use"];
            let meminuse = quotaset["ram"]["in_use"];
            self.projectList[j]["cpuvalue"] += cpuinuse;
            self.projectList[j]["memvalue"] += meminuse;
          }
        }
      }
      this.projectList.sort(self.compare("cpuvalue"));
      for (let i=0; i<self.projectList.length; i++) {
        if (i < 4) {
          let cpu = {name:self.projectList[i]["name"], value:self.projectList[i]["cpuvalue"]}
          cpuData.push(cpu);
        } else {
          ohtercpunumber += self.projectList[i]["cpuvalue"];
        }
      }
      cpuData.push({name: Vue.t('base.other'), value: ohtercpunumber});
      this.optionPieCPU.series[0].data = cpuData;
      let cpuLegend = [];
      for (let i=0; i<cpuData.length; i++) {
        if (cpuData[i]["value"] != 0) {
          let projectname = cpuData[i]["name"];
          cpuLegend.push(projectname);
        }
      }
      this.optionPieCPU.legend.data = cpuLegend;
      this.loading.row2.cpu = false;
      // 第二行 内存
      let memData = [];
      let ohtermemnumber = 0;
      this.projectList.sort(self.compare("memvalue"));
      for (let i=0; i<self.projectList.length; i++) {
        if (i < 4) {
          let mem = {name:self.projectList[i]["name"], value:self.projectList[i]["memvalue"]}
          memData.push(mem);
        } else {
          ohtermemnumber += self.projectList[i]["memvalue"];
        }
      }
      memData.push({name: Vue.t('base.other'), value: ohtermemnumber});
      this.optionPieMem.series[0].data = memData;
      let memLegend = [];
      for (let i=0; i<memData.length; i++) {
        if (memData[i]["value"] != 0) {
          let projectname = memData[i]["name"];
          memLegend.push(projectname);
        }
      }
      this.optionPieMem.legend.data = memLegend;
      this.loading.row2.mem = false;
    },
    async getStoragePieChartData() {
      let self = this;
      let res = await self.$ajax({
        type: 'get',
        url: `api/cinder/v3/${self.$cookie.get('pid')}/volumes/detail?all_tenants=True`,
        showErrMsg:false
      });
      // 第二行 存储饼图
      const volumeSizeData = [];
      for (let volume of res.volumes) {
        const projectId = volume['os-vol-tenant-attr:tenant_id'];
        const data = volumeSizeData.find(item => item.projectId === projectId);
        if (!data) {
          const project = this.projectList.find(item => item.id === projectId);
          volumeSizeData.push({
            projectId: projectId,
            name: project.name,
            value: volume.size
          });
        } else {
          data.value += volume.size;
        }
      }
      _.sortBy(volumeSizeData, 'value');
      if (volumeSizeData.length > 4) {
        const otherSize = _.reduce(_.rest(volumeSizeData, 3), function(memo, num) { return memo + num; }, 0);
        volumeSizeData.splice(4);
        volumeSizeData.push({
            projectId: 'other',
            name: Vue.t('base.other'),
            value: otherSize
        });
      }

      // let ohterstorage = ret.other;
      // for (let i=0; i<ret["highest"].length; i++) {
      //   let item = ret["highest"][i];
      //   let allocate = item["allocate"];
      //   for (let j=0; j<self.projectList.length; j++) {
      //     if (item["os-vol-tenant-attr:tenant_id"] == self.projectList[j]["id"]) {
      //       let storage = {
      //         name: self.projectList[j]["name"],
      //         value:allocate
      //       };
      //       storageData.push(storage);
      //     }
      //   }
      // }
      // storageData.push({name: , value: ohterstorage});
      // this.optionPieStorage.series[0].data = storageData;
      // let storageLegend = [];
      // for (let i=0; i<storageData.length; i++) {
      //   if (storageData[i]["value"] != 0) {
      //     let projectname = storageData[i]["name"];
      //     storageLegend.push(projectname);
      //   }
      // }
      this.optionPieStorage.series[0].data = volumeSizeData;
      this.optionPieStorage.legend.data = volumeSizeData.map(item => item.name);
      this.loading.row2.storage = false;
    },
    async getResourceUtilization() {
      let me = this;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/nova/v2.1/os-hypervisors-inspur/detail"
      })
      let cputotal = 0;
      let cpuused = 0;
      let memorytotal = 0;
      let memoryused = 0;
      ret.hypervisors.forEach((item, index) => {
        if (item.hypervisor_type!="ironic") {
          cputotal += parseInt(item.vcpus) * parseFloat(item.cpu_allocation_ratio);
          cpuused += parseInt(item.vcpus_used);
          memorytotal += parseInt(item.memory_mb) * parseFloat(item.ram_allocation_ratio);
          memoryused += parseInt(item.memory_mb_used);
        }
      });
      this.cpuCores = cputotal;
      this.memHostTotal = memorytotal * 1024 * 1024;
      this.memHostUsed = memoryused * 1024 * 1024;
      this.cpuVMCores = cpuused;
      this.memVMTotal = this.memHostUsed;
      if (cputotal <= 0) {
        this.cpuAllocate = 0;
      } else {
        this.cpuAllocate = parseFloat((cpuused / cputotal * 100).toFixed(2));
      }
      if (this.memHostTotal <= 0) {
        this.memAllocate = 0;
      } else {
        this.memAllocate = parseFloat((this.memHostUsed / this.memHostTotal *100).toFixed(2));
      }
      this.loading.row3.cpu = false;
      this.loading.row3.mem = false;
    },
    async getStorageAllocChart() {
      // 存储分配图
      let me = this;
      await this.$ajax({
        type: 'get',
        url: "api/cinder/v3/"+this.$cookie.get("pid")+"/scheduler-stats/get_pools?detail=True",
        successFun(rtn) {
          me.storageNameList = [];
          me.storageList = [];
          me.storageUsedTotal = 0;
          let totalStorage = 0;
          rtn.pools.forEach(pool => {
            let used = 0;
            let total = 0;
            let free = 0;
            let blockAlloc = 0;
            // if (pool.capabilities.hasOwnProperty('inspur_total_capacity')) {
            //   total = pool.capabilities.inspur_total_capacity;
            //   free = pool.capabilities.inspur_free_capacity;
            //   used = total - free;
            //   blockAlloc = pool.capabilities.provisioned_capacity_gb;
            // } else {
              total = pool.capabilities.total_capacity_gb;
              free = pool.capabilities.free_capacity_gb;
              used = total - free;
              blockAlloc = pool.capabilities.provisioned_capacity_gb?pool.capabilities.provisioned_capacity_gb:pool.capabilities.allocated_capacity_gb;
            // }
            me.storageUsedTotal+= used * 1024 * 1024 * 1024;
            totalStorage+= total * 1024 * 1024 * 1024;
            me.storageList.push({
              name:pool.name,
              used:used,
              total:total,
              free:free,
              blockAlloc: blockAlloc
            })
            me.storageNameList.push(pool.name);
          })
          me.storageUsage =( me.storageUsedTotal / totalStorage ).toFixed(3);
          me.storageName = me.storageName == ""?me.storageNameList[0]:me.storageName;
          me.storageList.forEach((item) => {
            if (item.name==me.storageName) {
              if (item.total*100<=0) {
                me.storageAllocate = 0;
              } else {
                me.storageAllocate = parseFloat((item.blockAlloc / item.total *100).toFixed(0));
              }
              me.storageTotal = item.total * 1024 * 1024 * 1024;
              me.storageUsed = item.used * 1024 * 1024 * 1024;
              me.storageBlockTotal = item.blockAlloc * 1024 * 1024 * 1024;
            }
          });
        }
      })
    },
    setStorageChart(val) {
      let me = this;
      me.storageList.forEach((item) => {
        if (item.name==val) {
          if (item.total*100<=0) {
            me.storageAllocate = 0;
          } else {
            me.storageAllocate = parseFloat((item.blockAlloc / item.total *100).toFixed(2));
          }
          me.storageTotal = item.total * 1024 * 1024 * 1024;
          me.storageUsed = item.used * 1024 * 1024 * 1024;
          me.storageBlockTotal = item.blockAlloc * 1024 * 1024 * 1024;
          me.userPercent = parseFloat((item.used / item.total *100).toFixed(2));
        }
      });
      this.loading.row3.storage = false;
    },
    async getCPUStory(startTime, endTime) {
      let me = this;
      await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/system/history?type=cpu&starttime="+startTime+"&endtime="+endTime,
        successFun(data) {
          let cpuArr = data.cpu;
          let x = [];
          let y = [];
          cpuArr.forEach((item, index) => {
            if (item[1] != null && item[1] != "") {
              y.push([
                item[0],
                item[1].toFixed(2)
              ]);
            }
          })
          me.optionCpuHistory.xAxis.data = x;
          me.optionCpuHistory.series[0].data = y;
          me.loading.row4.cpu = false;
        }
      });
    },
    async getMemStory(startTime, endTime) {
      let me = this;
      await this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/system/history?type=mem&starttime="+startTime+"&endtime="+endTime,
        successFun(data) {
          let cpuArr = data.mem;
          let x = [];
          let y = [];
          cpuArr.forEach((item, index) => {
            if (item[1] != null && item[1] != "") {
              y.push([
                item[0],
                item[1].toFixed(2)
              ]);
            }
          })
          me.optionMemHistory.xAxis.data = x;
          me.optionMemHistory.series[0].data = y;
          me.loading.row4.mem = false;
        }
      });
    },
    async getLoadBalance() {
      let result = await this.$ajax({
        type: "get",
        url: "api/octavia/v2.0/lbaas/inspurloadbalancers",
        errorKey: "NeutronError",
        showErrMsg: false
      });
      this.loadbalanceNum = result["loadbalancers"].length;
    },
    async getDatabase() {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/all/instances"
      });
      this.databaseNum = ret.instances.length;
    },
    async getKbContainerCluster() {
      let param = {};
      if (Vue.roleType + ""!= "0") {
        param["project_id"] = this.$cookie.get('pid');
      }
      let data = Object.assign(param);
      let ajaxParam = {
        type: 'POST',
        url: "api/cetus/v1/cluster/index",
        data: JSON.stringify(data)
      };
      let ret = await this.$ajax(ajaxParam);
      let dataList = ret.result;
      this.kbcontainerNum = dataList.length;
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
      return moment
        .utc(str)
        .local()
        .format("MM-DD HH:mm");
    },
    getCustomPage() {
      let startcookie = this.$cookie.get('startpage');
      if (startcookie == null) {
        this.loadblanceFlag = false;
        this.databaseFlag = false;
        this.kbclusterFlag = false;
      } else {
        let ckList = startcookie.split(",")
        for (let i=0; i<ckList.length; i++) {
          if (ckList[i] == "loadbalance") {
            this.loadblanceFlag = true;
            this.getLoadBalance();
          } else if (ckList[i] == "database") {
            this.databaseFlag = true;
            this.getDatabase();
          } else if (ckList[i] == "kbcluster") {
            this.kbclusterFlag = true;
            this.getKbContainerCluster();
          } else if (ckList[i] == "objstorge") {
            this.objstorgeFlag = true;
            this.getObjectStorage();
          } else if (ckList[i] == "filestorage") {
            this.filestorageFlag = true;
            this.getFileStorage();
          }
        }
      }
    },
    // 文件存储总量、已使用
    async getFileStorage() {
      let vm = this;
      let pid = vm.$cookie.get("pid");
      await vm.$ajax({
        type: 'get',
        url: `api/manila/v2/${pid}/scheduler-stats/pools/detail`,
        successFun(data) {
          let d = data['pools'] || [];
          d.forEach(v => {
            let c = v['capabilities'];
            if (c['allocated_capacity_gb'] > 0) {
              vm.fileStorageUsed= vm.formatFileSize(c['allocated_capacity_gb'], "GB");
            } else {
              vm.fileStorageUsed= 0 + " MB";
            }
          });
        }
      });
    },
    // 对象存储总量，已使用
    async getObjectStorage() {
      let vm = this;
    },
    // 网络外网IP使用情况
    async getNetworkIps() {
      let self = this;
      let totalIps = JSBI.BigInt(0);
      let usedIps = JSBI.BigInt(0);
      self.ipusage = 0;
      self.loading.row3.network = true;
      self.networkList = [];
      await self.$ajax({
        type: 'get',
        url: `api/neutron/v2.0/inspur/inspur-network-ip-availabilities?router:external=true`,
        successFun(data) {
          self.loading.row3.network = false;
          let d = data['inspur_network_ip_availabilities'] || [];
          for (let i=0; i<d.length; i++) {
            let subnets = d[i]["subnets"];
            let totalipssubnet = JSBI.BigInt(0 + '');
            let usedipssubnet = JSBI.BigInt(0 + '');
            if (subnets.length > 0) {
              for (let j=0; j<subnets.length; j++) {
                let ips = subnets[j];
                let totalips_ = JSBI.BigInt(ips["total_ips"] + '');
                let usedips_ = JSBI.BigInt(ips["used_ips"] + '');
                totalIps = JSBI.add(totalIps, totalips_);
                totalipssubnet = JSBI.add(totalipssubnet, totalips_);
                usedIps = JSBI.add(usedIps, usedips_);
                usedipssubnet = JSBI.add(usedipssubnet, usedips_);
              }
              let realUsage = usedipssubnet/totalipssubnet * 100;
              if (realUsage < 0.01) {
                realUsage = 0;
              }
              let obj = {
                "name":d[i]["network_name"],
                "id": d[i]["network_id"],
                "totalIps": totalipssubnet + "",
                "usedIps": usedipssubnet + "",
                "ipusage": realUsage.toFixed(2)
              };
              self.networkList.push(obj);
            }
          }
          self.networkList.sort(compare('totalIps'));
          if (totalIps > 0) {
            self.iptotalNum = totalIps+"";
            self.ipusedNum = usedIps+"";
            let realNum = self.ipusedNum / self.iptotalNum * 100;
            if (realNum < 0.01) {
              realNum = 0;
            }
            self.ipusage = realNum.toFixed(2);
          }
          let obj = {
            'name':Vue.t('base.all'),
            'id':Vue.t('base.all'),
            'totalIps': self.iptotalNum,
            'usedIps': self.ipusedNum,
            'ipusage': self.ipusage
          }
          self.networkList.unshift(obj);
          self.networkName = self.networkList[0]["name"];
        },
        errFun() {
          self.loading.row3.network = false;
        }
      });
      function compare(p) {
        return function(a, b) {
          let val1 = a[p];
          let val2 = b[p];
          return val2 - val1;
        }
      }
    },
    setNetworkChart(val) {
      let me = this;
      me.networkList.forEach((item) => {
        if (item.name==val) {
          me.ipusage = item.ipusage;
          me.iptotalNum = item.totalIps;
          me.ipusedNum = item.usedIps;
        }
      });
    }
  }
}
</script>
<style>
.light {
  background-color: #FFFFFF;
}
.dark {
  background-color: #1b293d;
}
/*第一行*/
.one-box {
  display: flex;
  display: -webkit-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
}
.one-item {
 align-items: center;
 flex-grow: 0;
 width: 25%;
}
.project-color{
  background-color:#0087ed
}
.az-color{
  background-color:#faad14
}
.net-color{
  background-color:#f04864
}
.user-color{
  background-color:#2fc25b
}
.start-page-one{
  height: 83px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #FFFFFF;
}
.start-page-one-dark {
  height: 83px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #1b293d;
}
.start-page-one-t{
  font-size: 12px;
  height: 17px;
  line-height: 17px;
  font-weight: 400;
  color:#333333;
  padding-top:19px;
  padding-left:24px;
}
.start-page-one-t-dark{
  font-size: 12px;
  height: 17px;
  line-height: 17px;
  font-weight: 400;
  color:#ffffff;
  padding-top:19px;
  padding-left:24px;
}
.start-page-one-b{
  height: 24px;
  line-height: 25px;
  font-size: 20px;
  font-weight: 500;
  color:#333333;
  padding-left:24px;
}
.start-page-one-b-dark {
  height: 24px;
  line-height: 25px;
  font-size: 20px;
  font-weight: 500;
  color:#ffffff;
  padding-left:24px;
}
.start-page-one-right {
  float: right;
  margin-right: 15px;
  margin-top: 5px;
}
.start-page-one-right img{
  display: block;
  margin:auto;
  padding-top:12px;
  float: right;
  width: 45px;
  height: 43px;
}
/*第二行*/
.start-page-one-percent2 {
  padding: 0px 0px 4px 0px;
  border-radius: 4px;
}
.start-page-one-percent2-t {
  font-weight: 400;
  font-size: 14px;
  color: #333333;
  height: 32px;
  padding: 5px 0px 0px 12px;
}
.start-page-one-percent2-t-dark {
  font-weight: 400;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  height: 32px;
  padding: 5px 0px 0px 12px;
}
/*第三行*/
.start-page-one-percent3 {
  padding: 10px 24px 13px 24px;
  border-radius: 4px;
}
.start-page-one-percent3-progress {
  margin-bottom: 5px;
  height: 70px;
}
.start-page-one-percent3-progress-label {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 6px;
}
.start-page-one-percent3-progress-labelL {
  font-size: 12px;
  color: #999999;
  font-weight: 400;
  line-height: 17px;
}
.start-page-one-percent3-progress-labelR {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
  line-height: 17px;
}
.start-page-one-percent3-progress-labelR-dark {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  line-height: 17px;
}
.start-page-one-toleft {
  font-weight: 400;
  font-size: 14px;
  color: #000000;
  display: inline-block;
  height: 28px;
  margin-bottom: 21px;
}
.start-page-one-toleft-dark {
  font-weight: 400;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  display: inline-block;
  height: 28px;
  margin-bottom: 21px;
}
.start-page-one-toright {
  float: right;
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  display: inline-block;
  height: 28px;
  margin-bottom: 21px;
}
.start-page-one-toright-dark {
  float: right;
  font-weight: 500;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  display: inline-block;
  height: 28px;
  margin-bottom: 26px;
}
.progress-outter {
  background-color: rgba(0, 0, 0, 0.12);
  position: relative;
  vertical-align: middle;
  border-radius: 6px;
  overflow: hidden;
  height: 12px;
}
.progress-outter-dark {
  background-color: #253149;
  position: relative;
  vertical-align: middle;
  border-radius: 6px;
  overflow: hidden;
  height: 12px;
}
.progress-inner {
  position: absolute;
  left: 0px;
  top: 0px;
  height: 100%;
  background-color: #0087ed;
  text-align: right;
  line-height: 1;
  border-radius: 6px;
}
.start-page-one-horizontal-line {
  height: 1px;
  width: 100%;
  border-top: 1px solid #E8E8E8;
  margin-top: 9px;
}
.start-page-one-horizontal-line-dark {
  height: 1px;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  margin-top: 9px;
}
.start-page-one-vertical-line {
  height: 35px;
  width: 1px;
  border-left: 1px solid #E8E8E8;
  margin-top: 22px;
}
.start-page-one-vertical-line-dark {
  height: 35px;
  width: 1px;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  margin-top: 22px;
}
.page-one-ratio-t {
  font-size: 12px;
  color: #999999;
  font-weight: 400;
  line-height:17px;
  padding-top:15px;
}
.page-one-ratio-b {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
  line-height:17px;
  padding-top: 9px;
}
.page-one-ratio-b-dark {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  line-height:17px;
  padding-top: 9px;
}
.storege-short-select {
  margin-left: 12px;
  width: 100px;
  height: 28px;
}
/*第四行*/
.start-page-one-percent4 {
  height: 250px;
  padding: 12px 4px 12px 7px;
  border-radius: 4px;
}
</style>
