<template>
  <div>
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
                <span v-if="statusTagRender(podInfoForm.status) === ''">-</span>
                <el-tag v-else :type="statusTagRender(podInfoForm.status)">
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
              <td class="idatatd">{{tzTimeFormatter(podInfoForm.creationTimestamp)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-form>
  </div>
</template>
<script>
  export default {
    name: 'ContainerPodInfo',
    data () {
      return {
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
        rancherClusterId:this.$route.params.rancherClusterId,
        nameSpace:this.$route.params.nameSpace,
        podName:this.$route.params.podName,
        loading:false
      };
    },
    mounted () {
      this.getPodDetail();
    },
    methods: {
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
              self.podInfoForm.name = data.metadata.name;
              if (data.status.containerStatuses) {
                if (data.status.containerStatuses[0].state) {
                  if (data.status.containerStatuses[0].state.waiting) {
                    data.status.phase = "Pending";
                  }
                }
              }
              self.podInfoForm.status = data.status.phase;

              // 容器卷信息
              if (data.spec.volumes) {
                if (data.spec.containers && data.spec.containers.length > 0) {
                  self.podInfoForm.volumeName = data.spec.containers[0].volumeMounts[0].name;
                  self.podInfoForm.volumeMountPath = data.spec.containers[0].volumeMounts[0].mountPath;
                }
              }

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

              self.podInfoForm.image = data.spec.containers[0].image;

              let envData = "";
              if (data.spec.containers[0].env) {
                let env = data.spec.containers[0].env;
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

              self.podInfoForm.resConfig = data.spec.containers[0].resources.limits;

              self.podInfoForm.hostIp = data.status.hostIP;
              self.podInfoForm.command = data.spec.containers[0].command;
              self.podInfoForm.command_args = data.spec.containers[0].args;
              self.podInfoForm.creationTimestamp = data.metadata.creationTimestamp;

              // 状态原因
              if (data.status.conditions[0].reason) {
                self.reasonMessage = data.status.conditions[0].reason + ":" + data.status.conditions[0].message;
              }
              if (data.status.containerStatuses) {
                if (data.status.containerStatuses[0].state) {
                  if (data.status.containerStatuses[0].state.waiting) {
                    self.reasonMessage = data.status.containerStatuses[0].state.waiting.reason + ":" + data.status.containerStatuses[0].state.waiting.message;
                  }
                }
              }
            }
          });
          self.loading = false;
        } catch (data) {
          self.loading = false;
        }
      },
      getStatus(status) {
        if (status == "Running") {
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
        if (value === "Running") {
          tagType = "success";
        } else if (value === "Succeeded" || value === "Failed") {
          tagType = "gray";
        } else if (value === "Pending") {
          tagType = "info";
        } else if (value === "waiting") {
          tagType = "danger";
        }
        return tagType;
      }
    }
  }
</script>