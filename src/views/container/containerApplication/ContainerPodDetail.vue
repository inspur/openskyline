<template>
  <div>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>Pod{{$t('container.detail')}}</span>
      <el-button style="float:right;padding: 3px 0;" type="text" size="small" @click="goBack()">{{$t('lang.back')}}</el-button>
    </div>
    <div style="padding-top:6px;padding-bottom:6px;">
      <el-form :inline="true" class="form-inline">
        <el-form-item :label="$t('container.container') ">
          <el-select v-model="containerName" size="small" filterable @change="containerChange">
            <el-option v-for="item in containers" :key="item.name" :label="item.name" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
    </div>
    <el-collapse v-model="activeName">
      <el-collapse-item :title="$t('container.basicInfo')" name="containerPodInfo">
        <el-form ref="podInfoForm" v-loading="loading" :model="podInfoForm" label-width="170px" label-position="left" class="me-form" style="text-align:left;">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="even">
                  <th class="idatath" style="width:20%">{{$t('lang.name')}}</th>
                  <td class="idatatd" style="width:80%">{{podInfoForm.name}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('lang.status')}}</th>
                  <td class="idatatd">
                    <span v-if="statusTagRender(podInfoForm.status) ===''">-</span>
                    <el-tag v-else :type="statusTagRender(podInfoForm.status)" >
                      <span>{{getStatus(podInfoForm.status)}}</span>
                    </el-tag>
                    <el-tooltip placement="top-start" v-if="reasonMessage != ''">
                      <div slot="content">{{reasonMessage}}</div>
                      <i class="el-icon-fa-question-circle"></i>
                    </el-tooltip>
                  </td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('container.tags')}}</th>
                  <td class="idatatd">{{podInfoForm.labels}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('container.image')}}</th>
                  <td class="idatatd">{{podInfoForm.image}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('container.environmentParam')}}</th>
                  <td class="idatatd">{{podInfoForm.environment}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('container.resConfig')}}</th>
                  <td class="idatatd">{{podInfoForm.resConfig}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('container.hostIP')}}</th>
                  <td class="idatatd">{{podInfoForm.hostIp}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('container.runCommand')}}</th>
                  <td class="idatatd">{{podInfoForm.command}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('container.runParameter')}}</th>
                  <td class="idatatd">{{podInfoForm.command_args}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('lang.createTime')}}</th>
                  <td class="idatatd">{{podInfoForm.creationTimestamp=='-'?"-":tzTimeFormatter(podInfoForm.creationTimestamp)}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-form>
      </el-collapse-item>
      <el-collapse-item :title="$t('container.log')" name="containerPodLog">
        <div>
          <el-input type="textarea" :autosize="{minRows:2, maxRows:20}" v-model="podLogContent" readonly></el-input>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-card>
  </div>
</template>
<script>
  export default {
    name: 'ContainerPodDetail',
    data () {
      return {
        activeName: "containerPodInfo",
        podName:this.$route.params.podName,
        nameSpace:this.$route.params.nameSpace,
        rancherClusterId:this.$route.params.rancherClusterId,
        type:this.$route.params.type,
        appName:this.$route.params.appName,
        podInfoForm: {
          name:'',
          status:'',
          volumeName:'',
          volumeMountPath:'',
          labels:'',
          image:"",
          environment:"",
          resConfig:"",
          hostIp:'',
          command:'',
          command_args:'',
          creationTimestamp:''
        },
        reasonMessage:"",
        tzTimeFormatter:this.$tzTimeFormatter,
        loading:false,
        containerName:"",
        containers:[],
        containerStatuses:[],
        podLogContent:""
      };
    },
    mounted () {
      this.getPodDetail();
    },
    methods: {
      goBack() {
        this.$router.push({
          path:"/container/applicationContainer/" + this.rancherClusterId + "/" + this.type + "/" +
            this.nameSpace + "/" + this.appName + "/appDetail/instanceList"
        });
      },
      async getPodDetail() {
        let self = this;
        self.loading = true;
        self.reasonMessage = "";
        try {
          let svcResponse = await this.$ajax({
            type: 'post',
            url: 'api/cetus/v1/app/get_pod_info',
            data:JSON.stringify({
              pod_name:self.podName,
              user_id:self.nameSpace,
              rancher_cluster_id:self.rancherClusterId
            }),
            successFun:(data) => {
              self.containers = data.spec.containers;
              self.containerStatuses = data.status["containerStatuses"] || [];
              self.containerName = self.containers[0].name;
              let labels = data.metadata.labels;
              let param = "";
              if (labels) {
                let keyList = Object.keys(labels);
                keyList.forEach(function(item, index) {
                  param += item + "=" + labels[item];
                  if (index < keyList.length-1) {
                    param += ", ";
                  }
                });
              }
              self.podInfoForm.labels = param;
              self.podInfoForm.hostIp = data.status.hostIP;
            }
          });
          self.loading = false;
        } catch (data) {
          self.loading = false;
        }
      },
      containerChange(val) {
        let self = this;
        this.getPodLog(val);
        for (let i=0; i<self.containers.length; i++) {
          let container = self.containers[i];
          if (val == container["name"]) {
            self.podInfoForm.name = container["name"];
            self.podInfoForm.volumeName = container.volumeMounts[0].name;
            self.podInfoForm.volumeMountPath = container.volumeMounts[0].mountPath;
            self.podInfoForm.image = container.image;
            let envData = "";
            if (container.env) {
              let env =container.env;
              if (env) {
                env.forEach(function(item, index) {
                  envData += item.name + "=" + item.value;
                  if (index < env.length-1) {
                    envData += ", ";
                  }
                });
              }
            }
            self.podInfoForm.environment = envData;
            self.podInfoForm.resConfig = container.resources.limits;
            self.podInfoForm.command = container.command;
            self.podInfoForm.command_args = container.args;
          }
          if (self.containerStatuses.length == 0) {
            self.podInfoForm.status = 'Pending';
            self.podInfoForm.creationTimestamp = "-";
          } else {
            for (let i=0; i<self.containerStatuses.length; i++) {
              let status = self.containerStatuses[i];
              if (val == status.name) {
                for (let key in status.state) {
                  self.podInfoForm.status = key;
                  if (key == "waiting") {
                    self.reasonMessage = status.state.waiting.reason + ":" + status.state.waiting.message;
                    self.podInfoForm.creationTimestamp = "-";
                  } else {
                    self.podInfoForm.creationTimestamp = status.state.running.startedAt;
                  }
                }
              }
            }
          }
        }
      },
      async getPodLog(val) {
        let self = this;
        try {
          self.podLogContent = "";
          let log = await this.$ajax({
            type: 'post',
            url: 'api/cetus/v1/app/get_pod_log',
            data:JSON.stringify({
              pod_name:self.podName,
              user_id:self.nameSpace,
              rancher_cluster_id:self.rancherClusterId,
              container_name:val
            })
          });
          self.podLogContent = log.result;
        } catch (data) {
        }
      },
      getStatus(status) {
        if (status == "running") {
          return this.$t('container.running');
        } else if (status == "Pending") {
          return this.$t('container.processing');
        } else if (status == "Succeeded") {
          return this.$t('container.closed');
        } else if (status == "Failed") {
          return this.$t('container.closed');
        } else if (status == "waiting") {
          return this.$t('container.abnormal');
        }
      },
      statusTagRender(value) {
        let tagType = "";
        if (value === "running") {
          tagType = "success";
        } else if (value === "Succeeded" || value === "Failed") {
          tagType = "gray";
        } else if (value === "Pending" || value === "processing") {
          tagType = "info";
        } else if (value === "waiting") {
          tagType = "danger";
        }
        return tagType;
      }
    }
  }
</script>
<style scoped>

</style>
