<template>
  <div>
    <el-row>
      <el-col :span="24" style="margin-bottom: 10px;">
        <el-form class="margin-b20 me-required-form container-monitor-content" label-width="140px">
          <div class="wrapper">
            <div class="content" :style="{ 'background-color': rgb(monitorStatus) }">
              <div class="stripe">
                <div></div>
                <div></div>
             </div>
             <div class="title">
              <div class="title-tag">{{$t('container.monitorStatus')}}:<span class="title-count" v-html="statusRender(monitorStatus)" ></span></div>
              <i class="el-icon-loading" v-if="loading" />
             </div>
            </div>
          </div>
          <div class="configFile-button">
            <el-button type="default" @click="showConfigFile">Kubeconfig File</el-button>
          </div>
          <el-form-item class="deployStep" label-width="0" v-if="monitorStatus != '1' ">
              <el-alert type="info" style="float:left" :closable="true" title="" >
                <div class="deployStep-title"><i class="el-icon-fa-info-circle" aria-hidden="true"></i>{{$t('container.deployStep')}}</div>
                <div class="deployStep-step">{{$t('container.deployStep1')}}</div>
                <div class="deployStep-step">{{$t('container.deployStep2')}}{{$t('container.deployStep3')}}{{$t('container.deployStep4')}}</div>
              </el-alert>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="4">
        <el-card class="box-card container-monitor-echarts-box-header left-card">
          <div slot="header" class="clearfix">
            <span class="container-monitor-echarts-title">{{$t('container.cputotal')}}</span>：<span class="container-monitor-echarts-title">{{cputotal}} {{$t('container.showCPUCore')}}</span>
          </div>
          <IEcharts :option="optionCPU" :resizable="true" :loading="loading" :style="'height: 240px;'">
          </IEcharts>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="box-card container-monitor-echarts-box-header right-card">
          <div slot="header" class="clearfix">
            <span class="container-monitor-echarts-title">&nbsp;</span>
          </div>
          <div class="index-text-area">
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span middle-span">
                <div class="span-each"><i class="el-icon-fa-circle dot-style" style="color: #2fc25b;"></i>{{$t('container.cpuused')}}</div>
                <div class="span-each"><i class="el-icon-fa-circle dot-style" style="color: #0087ed;"></i>{{$t('container.cpuleft')}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span">
                <div class="span-each-center">{{cpureqRate}}</div>
                <div class="span-each-center">{{cpuleftRate}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span">
                <div class="span-each-center">{{cpureq}} {{$t('container.showCPUCore')}}</div>
                <div class="span-each-center">{{cpuleft}} {{$t('container.showCPUCore')}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4" style="padding-left:12px;">
        <el-card class="box-card container-monitor-echarts-box-header left-card">
          <div slot="header" class="clearfix">
            <span class="container-monitor-echarts-title">{{$t('container.memtotal')}}</span>：<span class="container-monitor-echarts-title">{{memtotal}}GB</span>
          </div>
          <IEcharts :option="optionMEM" :resizable="true" :loading="loading" :style="'height: 240px;'"></IEcharts>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="box-card container-monitor-echarts-box-header right-card">
          <div slot="header" class="clearfix">
            <span class="container-monitor-echarts-title">&nbsp;</span>
          </div>
          <div class="index-text-area">
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span middle-span">
                <div class="span-each"><i class="el-icon-fa-circle dot-style" style="color: #2fc25b;"></i>{{$t('container.cpuused')}}</div>
                <div class="span-each"><i class="el-icon-fa-circle dot-style" style="color: #0087ed;"></i>{{$t('container.cpuleft')}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span">
                <div class="span-each-center">{{memreqRate}}</div>
                <div class="span-each-center">{{memleftRate}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span">
                <div class="span-each-center">{{memreq}} GB</div>
                <div class="span-each-center">{{memleft}} GB</div>
              </div>
              <div class="text-area-span"></div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" style="padding-left:12px;">
        <el-card class="box-card container-monitor-echarts-box-header">
          <div slot="header" class="clearfix">
            <span>{{$t('container.compStatus')}}</span>
          </div>
          <div style="height: 210px;padding-top:30px;overflow: auto;">
            <div v-for="(item, index) in moduleStatusList" :key="index">
              <el-row type="flex" justify="space-between" style="padding-top:10px;">
                <el-col :span="12">
                  <div class="compClass" :title="item.name">{{item.name}}</div>
                </el-col>
                <el-col :span="12">
                  <div style="float:left" :class="item.class=='noClass'?'':item.class"></div><span style="float:left">{{item.status}}</span>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row style="padding-top:15px;">
      <el-col :span="4">
        <el-card class="box-card container-monitor-echarts-box-header left-card">
          <div slot="header" class="clearfix">
            <span>{{$t('container.deployment')}}</span>
          </div>
          <IEcharts :option="optionDeploy" :resizable="true" :loading="loading" :style="'height: 240px;'">
          </IEcharts>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="box-card container-monitor-echarts-box-header right-card">
          <div slot="header" class="clearfix">
            <span class="container-monitor-echarts-title">&nbsp;</span>
          </div>
          <div class="index-text-area">
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span middle-span">
                <div class="span-each"><i class="el-icon-fa-circle dot-style" style="color: #0087ed;"></i>{{$t('container.ok')}}</div>
                <div class="span-each"><i class="el-icon-fa-circle dot-style" style="color: #F04864;"></i>{{$t('container.abnormal')}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span">
                <div class="span-each-center">{{deployNorRate}}</div>
                <div class="span-each-center">{{deployAbnRate}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span">
                <div class="span-each-center">{{deploycom}}</div>
                <div class="span-each-center">{{deployabn}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4" style="padding-left:12px;">
        <el-card class="box-card container-monitor-echarts-box-header left-card">
          <div slot="header" class="clearfix">
            <span>{{$t('container.statefulSet')}}</span>
          </div>
          <IEcharts :option="optionSts" :resizable="true" :loading="loading" :style="'height: 240px;'">
          </IEcharts>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="box-card container-monitor-echarts-box-header right-card">
          <div slot="header" class="clearfix">
            <span class="container-monitor-echarts-title">&nbsp;</span>
          </div>
          <div class="index-text-area">
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span middle-span">
                <div class="span-each"><i class="el-icon-fa-circle dot-style" style="color: #0087ed;"></i>{{$t('container.ok')}}</div>
                <div class="span-each"><i class="el-icon-fa-circle dot-style" style="color: #F04864;"></i>{{$t('container.abnormal')}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span">
                <div class="span-each-center">{{stsNorRate}}</div>
                <div class="span-each-center">{{stsAbnRate}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span">
                <div class="span-each-center">{{stscom}}</div>
                <div class="span-each-center">{{stsabn}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4" style="padding-left:12px;">
        <el-card class="box-card container-monitor-echarts-box-header left-card">
          <div slot="header" class="clearfix">
            <span>{{$t('container.daemonSet')}}</span>
          </div>
          <IEcharts :option="optionDemo" :resizable="true" :loading="loading" :style="'height: 240px;'">
          </IEcharts>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="box-card container-monitor-echarts-box-header right-card">
          <div slot="header" class="clearfix">
            <span class="container-monitor-echarts-title">&nbsp;</span>
          </div>
          <div class="index-text-area">
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span middle-span">
                <div class="span-each"><i class="el-icon-fa-circle dot-style" style="color: #0087ed;"></i>{{$t('container.ok')}}</div>
                <div class="span-each"><i class="el-icon-fa-circle dot-style" style="color: #F04864;"></i>{{$t('container.abnormal')}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span">
                <div class="span-each-center">{{dsNorRate}}</div>
                <div class="span-each-center">{{dsAbnRate}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
            <div class="text-area-wrap">
              <div class="text-area-span"></div>
              <div class="text-area-span">
                <div class="span-each-center">{{dscom}}</div>
                <div class="span-each-center">{{dsabn}}</div>
              </div>
              <div class="text-area-span"></div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <config-file ref='configfile' :clusterId="clusterId" v-if="configFileFlag" @cancelShow="cancelShow"></config-file>
  </div>
</template>
<script>
  import moment from 'moment'
  import echarts from 'echarts';
  import ConfigFile from './ConfigFile';
  const sysColors = ["#2fc25b", '#0087ed', '#26A69A', "#faad14", "#f04864"];
  const clusterColors = ["#F04864", "#0087ed"];
  export default {
    name: 'ContainerMonitor',
    components: {
      ConfigFile
    },
    props: ["clusterUUID"],
    data() {
      return {
        loading: false,
        tzTimeFormatter: this.$tzTimeFormatter,
        clusterId: this.$route.params.rancherclusterId,
        roleType: Vue.roleType,
        configFileFlag: false,
        monitorStatus: "1",
        moduleStatusList: [],
        moduleTempList: [],
        cpureq: 0,
        cputotal: 0,
        cpuleft:0,
        memtotal: 0,
        memreq: 0,
        memleft:0,
        deploycom: 0,
        deployabn:0,
        deploytotal: 0,
        dscom: 0,
        dsabn:0,
        dstotal: 0,
        stscom: 0,
        stsabn:0,
        ststotal: 0,
        cpureqRate:0,
        cpuleftRate:0,
        memreqRate:0,
        memleftRate:0,
        deployNorRate:0,
        deployAbnRate:0,
        dsNorRate:0,
        dsAbnRate:0,
        stsNorRate:0,
        stsAbnRate:0,
        normalAmount:0,
        totalAmount:0,
        optionCPU: {series:[{type:'pie', data: []}]},
        optionMEM: {series:[{type:'pie', data: []}]},
        optionDeploy: {series:[{type:'pie', data: []}]},
        optionSts: {series:[{type:'pie', data: []}]},
        optionDemo: {series:[{type:'pie', data: []}]}
      };
    },
    mounted() {
      this.getClusterProm();
      this.getClusterMetric();
    },
    methods: {
      getOptionCircle(response, subject, legendName) {
        let self = this;
        let optionCircleLe1 = 0;
        let optionCircleLe2 = 0;
        let optionCircle = {series:[{type:'pie', data: []}]};
        if ("cpuused" == legendName) {
          optionCircleLe1 = parseFloat(response[subject + "_req"] || 0).toFixed(2);
          optionCircleLe2 = parseFloat(response[subject + "_total"] || 0).toFixed(2);
          optionCircle.series[0].data = [{ "name": Vue.t('container.cpuused'), "value": optionCircleLe1 }, { "name": Vue.t('container.cpuleft'), "value": (optionCircleLe2 - optionCircleLe1).toFixed(2) }];
          this[subject+ "req"] = optionCircleLe1;
          this[subject+ "left"] = parseFloat(optionCircleLe2-optionCircleLe1).toFixed(2);
          this[subject+ "total"] = optionCircleLe2;
          this[subject+ "reqRate"] = optionCircleLe2 == 0?0:parseFloat(this[subject+ "req"]/this[subject+ "total"]*100).toFixed(2)+"%";
          this[subject+ "leftRate"] = optionCircleLe2 == 0?0:parseFloat(100-parseFloat(this[subject+ "req"]/this[subject+ "total"]*100).toFixed(2)).toFixed(2)+"%";
        } else if ("ok" == legendName) {
          optionCircleLe1 = response[subject + "_com"] || 0;
          optionCircleLe2 = response[subject + "_total"] || 0;
          this[subject+ "com"] = optionCircleLe1;
          this[subject+ "abn"] = optionCircleLe2-optionCircleLe1;
          this[subject+ "total"] = optionCircleLe2;
          this[subject+ "NorRate"] = optionCircleLe2 == 0?0:parseFloat(this[subject+ "com"]/this[subject+ "total"]*100).toFixed(2)+"%";
          this[subject+ "AbnRate"] = optionCircleLe2 == 0?0:parseFloat(100-parseFloat(this[subject+ "com"]/this[subject+ "total"]*100).toFixed(2)).toFixed(2)+"%";
          optionCircle.series[0].data = [{ "name": Vue.t('container.abnormal'), "value": this[subject+ "abn"] }, { "name": Vue.t('container.ok'), "value": this[subject+ "com"] }];
        }
        optionCircle = {
          color: "cpuused" == legendName ? sysColors:clusterColors,
          tooltip: {
            show: true,
            formatter: function (params, ticket, callback) {
              return params.name + ":" + params.value + "(" + params.percent + '%)';
            }
          },
          legend: {
            show: false,
            type: 'plain',
            orient: "vertical",
            align: 'left',
            icon: 'circle',
            itemWidth: 6,
            itemHeight: 6,
            left: '60%',
            top: '35%',
            padding: [5, 5, 5, 5],
            textStyle: {
              color: self.$cookie.get("theme") == 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#999999',
              rich: {
                name: {
                  verticalAlign: 'right',
                  align: 'left',
                  fontSize: 14
                },
                rate: {
                  align: 'left',
                  fontSize: 14
                },
                value: {
                  align: 'left',
                  fontSize: 14
                }
              }
            },
            formatter: function (params) {
              for (var i = 0; i < optionCircle.series[0].data.length; i++) {
                return ('{name|' + params + '}{rate|' + (optionCircle.series[0].data[i].value / self.memtotal).toFixed(2) + '%}{value|' + optionCircle.series[0].data[i].value + 'GB}')
              }
            },
            tooltip: {
              show: true
            },
            data: []
          },
          calculable: false,
          series: [{
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['50%', '50%'],
            data: optionCircle.series[0].data,
            labelLine: {
              normal: {
                show: false
              }
            },
            label: {
              normal: {
                show: false,
                position: 'inside',
                formatter: '{b}:{d}%'
              }
            }
          }]
        }
        if ("cpuused" == legendName) {
          optionCircle.legend.data = [Vue.t('container.cpuused'), Vue.t('container.cpuleft')];
        } else if ("ok" == legendName) {
          optionCircle.legend.data = [Vue.t('container.ok'), Vue.t('container.abnormal')];
        }
        // let optiont = JSON.parse(JSON.stringify(self.optionCircle));
        return optionCircle;
    },
      async getClusterProm() {
        let self = this;
        let body = { "rancher_cluster_id": self.clusterId, "role_type": Vue.roleType };
        body = JSON.stringify(body);
        try {
          await self.$ajax({
            type: 'POST',
            url: 'api/cetus/v1/prom/cluster_prom',
            data: body,
            showErrMsg: true,
            successFun(response) {
              self.monitorStatus = response.stats;
            },
            errFun() {
            }
          });
        } catch (data) {
        }
      },
      async getClusterMetric() {
        let self = this;
        let body = { "rancher_cluster_id": self.clusterId, "role_type": Vue.roleType };
        body = JSON.stringify(body);
        self.loading = true;
        try {
          await self.$ajax({
            type: 'POST',
            url: 'api/cetus/v1/prom/cluster_metric',
            data: body,
            showErrMsg: true,
            successFun(response) {
              if (response) {
                self.cputotal = parseFloat(response["cpu_total"] || 0).toFixed(2);
                self.memtotal = parseFloat(response["mem_total"] || 0).toFixed(2);
                self.optionCPU = self.getOptionCircle(response, "cpu", "cpuused");
                self.optionMEM = self.getOptionCircle(response, "mem", "cpuused");
                self.optionDeploy = self.getOptionCircle(response, "deploy", "ok");
                self.optionSts = self.getOptionCircle(response, "sts", "ok");
                self.optionDemo = self.getOptionCircle(response, "ds", "ok");
                let cluster = response["cluster"];
                if (cluster && cluster.length > 0) {
                  for (let i = 0; i < cluster.length; i++) {
                    let clu = { "name": "", "status": "", "class": "" };
                    clu["name"] = cluster[i]["name"];
                    let conditions = cluster[i]["conditions"][0];
                    clu["status"] = conditions["status"] == 'True' ? Vue.t('container.ok') : Vue.t('container.abnormal');
                    clu["class"] = conditions["status"] == 'True' ? 'okStatus' : 'unnormalStatus'
                    self.moduleTempList.push(clu)
                  }
                } else {
                  self.moduleTempList = [];
                }
                self.getK8sNodeStatus();
              }
              self.loading = false;
            },
            errFun() {
              self.loading = false;
            }
          });
        } catch (data) {
          self.loading = false;
        }
      },
      async getK8sNodeStatus() {
        let self = this;
        let body = { "cluster_id": self.clusterUUID };
        body = JSON.stringify(body);
        self.totalAmount = 0;
        self.normalAmount = 0;
        try {
          await self.$ajax({
            type: 'POST',
            url: 'api/cetus/v1/cluster/get_k8s_node_status',
            data: body,
            showErrMsg: true,
            successFun(response) {
              if (response) {
                let cluster = response["result"];
                let clu = { "name": "", "status": "", "class": "" };
                if (cluster && cluster.length > 0) {
                  self.totalAmount = cluster.length;
                  for (let i = 0; i < cluster.length; i++) {
                    if (cluster[i][1]=="Ready") {
                      self.normalAmount++;
                    }
                  }
                  clu["name"] = Vue.t('container.kubeletInfo');
                  clu["status"] = self.normalAmount+"/"+self.totalAmount
                  clu["class"] = self.normalAmount == +self.totalAmount?"okStatus":"unnormalStatus"
                  self.moduleTempList.push(clu)
                  self.moduleStatusList = self.moduleTempList;
                } else {
                  if (self.moduleTempList && self.moduleTempList.length>0) {
                    clu["name"] = Vue.t('container.kubeletInfo');
                    clu["status"] = "0/0"
                    clu["class"] = "unnormalStatus"
                    self.moduleTempList.push(clu)
                    self.moduleStatusList = self.moduleTempList;
                  } else {
                    self.moduleStatusList = [];
                  }
                }
              }
              self.loading = false;
            },
            errFun() {
              self.loading = false;
            }
          });
        } catch (data) {
        }
      },
      statusTagRender(value) {
        let tagType = "";
        if (value == "1") {
          tagType = "success";
        } else {
          tagType = "gray";
        }
        return tagType;
      },
      statusRender(value) {
        if (value == "1") {
          return Vue.t('container.ok');
        } else {
          return Vue.t('container.abnormal');
        }
      },
      rgb(value) {
        if (value == "1") {
          return 'rgb(0, 126, 222)';
        } else {
          return 'rgb(240, 72, 100)';
        }
      },
      cancelShow() {
        this.configFileFlag = false;
      },
      showConfigFile() {
        this.configFileFlag = true;
      }
  }
}
</script>
<style>
  .okStatus {
    width: 12px;
    height: 12px;
    font-size: 12px;
    line-height: 12px;
    border-radius: 50%;
    color: #ffffff;
    background: #2fc25b;
    text-align: center;
    margin: 4px 4px 0px 6px
  }

  .unnormalStatus {
    width: 12px;
    height: 12px;
    font-size: 12px;
    line-height: 12px;
    border-radius: 50%;
    color: #ffffff;
    background: #f04864;
    text-align: center;
    margin: 4px 4px 0px 6px
  }

  .compClass {
    padding-left: 30px;
    font-size: 14px;
    font-weight: 500;
  }

  .container-monitor-echarts-title {
    font-size: 14px;
    font-family: pingfang SC;
    font-weight: 400;
    color: #333333;
    line-height: 20px;
  }
  .container-monitor-content .wrapper {
    height: 50px;
    width: 220px;
    flex: 1;
    background-color: #fff;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    float: left;
  }
  .container-monitor-content .wrapper:not(:last-child) {
    margin-right: 5px;
  }
  .container-monitor-content .content {
    position: relative;
    height: 100%;
    text-align: center;
  }
  .container-monitor-content .stripe {
    position: absolute;
    width: 120%;
    left: -60%;
    height: 150%;
    transform-origin: 50% 0%;
    /*transform: matrix(0.7071067811865476, -0.7071067811865475, 0.7071067811865475, 0.7071067811865476, 0, 0);  用矩阵旋转45度 */
    transform: rotate(-30deg);
}
.container-monitor-content .stripe div:nth-child(1) {
  height: 50%;
  background-color: rgba(255,255,255,0.2);
}
.container-monitor-content .stripe div:nth-child(2) {
  height: 50%;
  background-color: rgba(255,255,255,0.1);
}
.container-monitor-content .title {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  font-size: 18px;
  color: white;
  padding: 5 5 5 5;
}
.container-monitor-content .title .title-count {
  font-size: 18px;
  margin-left:30px;
  font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
  font-weight: 500;
  line-height: 25px;
}
.container-monitor-content .title .title-tag {
  font-size: 14px;
  margin:15px;
  font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
  font-weight: 500;
  line-height: 20px;
}
.container-monitor-content .title .el-icon-loading {
  position: absolute;
  margin-left: 45%;
}
.container-monitor-content .configFile-button {
  margin-left: 15px;
  width: 135px;
  height: 50px;
  float: left;
}
.container-monitor-content .configFile-button .el-button {
  height: 100%;
}
.container-monitor-content .deployStep {
  margin-left: 0px;
  padding-top: 66px;
}
.container-monitor-content .deployStep .el-alert__closebtn {
  color:#AAA;
}
.container-monitor-content .deployStep .el-alert--info {
  border: 1px solid #91D5FF;
  background-color: #E6F7FF;
  border-radius: 2px;
}
.container-monitor-content .deployStep .deployStep-title {
  margin: 10px 0px 8px 0px;
  font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
  font-weight: 500;
  line-height: 24px;
  font-size: 24px;
  color: rgba(0,0,0,0.85);
}
.container-monitor-content .deployStep .deployStep-title .el-icon-fa-info-circle {
  margin-right: 25px;
  font-size: 24px;
  color: #1890FF;
}
.container-monitor-content .deployStep .deployStep-step {
  margin: 5px 0px 5px 50px;
  font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
  font-weight: 400;
  line-height: 22px;
  font-size: 12px;
  color: rgba(0,0,0,0.65);
}
.container-monitor-echarts-box-header .el-card__header {
  background-color: #FFF;
  border-bottom: 0px;
}
.left-card {
  border-right:0px;
}
.right-card {
  border-left:0px;
}
.right-card .index-text-area {
  height: 240px;
}
.right-card .index-text-area .text-area-wrap{
  height: 240px;
  width: 31%;
  float: left;
}
.right-card .index-text-area .text-area-wrap .text-area-span{
  width: 100%;
  height:33%;
}
.right-card .index-text-area .text-area-wrap .middle-span{
  border-left:1px solid #EEE
}
.right-card .index-text-area .text-area-wrap .span-each{
  width: 100%;
  height:50%;
  padding: 5px 0;
  font-size: 12px;
  font-weight: 400;
  color:rgba(0,0,0,0.45);
  line-height: 17px;
  font-family:Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
}
.right-card .index-text-area .text-area-wrap .span-each .dot-style{
  margin:0 10px 0 3px;
}
.right-card .index-text-area .text-area-wrap .span-each-center{
  width: 100%;
  height:50%;
  padding: 5px 25px;
  font-size: 12px;
  font-weight: 400;
  color:rgba(0,0,0,0.45);
  line-height: 17px;
  text-align: left;
  font-family:Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
}
</style>