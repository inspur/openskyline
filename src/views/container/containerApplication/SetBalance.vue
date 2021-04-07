<template>
  <el-dialog
    :title="openFlag?$t('container.closeBalance'):$t('container.openBalance')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    v-dialogDrag>
      <el-form ref="setBalance" label-width="120px"  :model="setBalance" :rules=rules v-loading="loading" v-if="!openFlag">
        <el-form-item :label="$t('container.minCopyNumber')" prop="min_replicas" class="is-required">
          <el-input class="col-12" v-model="setBalance.min_replicas" auto-complete="off"></el-input>
          <el-tooltip placement="right-start">
            <div slot="content">{{$t('container.minReplicasTip')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('container.maxCopyNumber')" prop="max_replicas" class="is-required">
          <el-input class="col-12" v-model="setBalance.max_replicas" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('container.cpuThreshold')" prop="cpu_average" class="is-required">
          <el-input class="col-12" v-model="setBalance.cpu_average" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('container.memThreshold')" prop="mem_average" class="is-required">
          <el-input class="col-12" v-model="setBalance.mem_average" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <el-form ref="closeBalance" label-width="80px"  :model="closeBalance" :rules=rulesclose v-loading="loading" v-if="openFlag">
        <el-form-item :label="$t('container.copyNumber')" prop="copyNumber" class="is-required">
          <el-input class="col-12" v-model="closeBalance.copyNumber" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "SetBalance",
  props:["selectedRowData"],
  data() {
    return {
      roleType: Vue.roleType + '',
      loading: false,
      saving: false,
      loadingText: Vue.t('calcStorLang.dataLoading'),
      dialogVisible: false,
      openFlag: true,
      setBalance: {
        min_replicas: '',
        max_replicas: '',
        cpu_average: '',
        mem_average: ''
      },
      closeBalance: {
        copyNumber: ""
      },
      rules: {
        min_replicas: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value:10},
          {type: 'min', value:1}
        ],
        max_replicas: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value:10},
          {type: 'min', value:1}
        ],
        cpu_average: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value:100},
          {type: 'min', value:1}
        ],
        mem_average: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value:100},
          {type: 'min', value:1}
        ]
      },
      rulesclose: {
        copyNumber: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value:10},
          {type: 'min', value:1}
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
    this.getScalingState()
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
    },
    async getScalingState() {
      let self = this;
      try {
        self.loading = true;
        let result = await self.$ajax({
          type: 'post',
          url: "api/cetus/v1/hpa/get_hpa",
          data:JSON.stringify({
           "app_name": self.selectedRowData.name,
           "rancher_cluster_id": self.selectedRowData.rancher_cluster_id,
           "user_id":  self.selectedRowData.namespace
          }),
          successFun:(response) => {
            if (!response["result"].hasOwnProperty("code")) {
              self.openFlag = true;
              let spec = response["result"]["spec"];
              let minReplicas = spec["minReplicas"];
              let maxReplicas = spec["maxReplicas"];
              self.setBalance.min_replicas = minReplicas;
              self.setBalance.max_replicas = maxReplicas;
              let metrics = spec["metrics"];
              for (let i=0; i<metrics.length; i++) {
                let resource = metrics[i]["resource"];
                if (resource.name == "memory") {
                  self.setBalance.mem_average = resource.target.averageUtilization;
                } else if (resource.name == "cpu") {
                  self.setBalance.cpu_average = resource.target.averageUtilization;
                }
              }
            } else {
              self.openFlag = false;
            }
            self.loading = false;
          },
          errorFun:(response) => {
            self.loading = false;
          }
        });
      } catch (res) {
      }
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.dialogVisible = false;
      this.$emit("handleAddShow", {});
    },
    async confirmFun() {
      let self = this;
      if (self.openFlag) {
        self.$refs.closeBalance.validate(async valid => {
          if (valid) {
            let blanceData = {
              "app_name": self.selectedRowData.name,
              "rancher_cluster_id": self.selectedRowData.rancher_cluster_id,
              "user_id": self.selectedRowData.namespace,
              "resize_num": self.closeBalance.copyNumber,
              "app_type": "deployment"
            };
            self.saving = true;
            let reponse = this.$ajax({
              type: 'post',
              url: "api/cetus/v1/hpa/delete_hpa",
              data: JSON.stringify(blanceData),
              successMsg:this.$t('container.setScalingSuccess'),
              log: {
                description: {
                  en: `app :${self.selectedRowData.name} close scaling service`,
                  zh_cn: `应用${self.selectedRowData.name}关闭弹性伸缩`
                },
                target: Vue.logTarget.applicationManage
              },
              successFun:(response) => {
                self.saving = false;
                this.$ajax({
                  type: 'post',
                  url: "api/cetus/v1/app/resize_app",
                  data: JSON.stringify(blanceData),
                  // successMsg:this.$t('container.setScalingSuccess'),
                  successFun:(response) => {
                    self.$emit("refreshData", {})
                    self.$emit("handleAddShow", {});
                  }
                });
              }
            });
          }
        });
      } else {
        self.$refs.setBalance.validate(async valid => {
          if (valid) {
            if (parseInt(self.setBalance.max_replicas) <= parseInt(self.setBalance.min_replicas)) {
              self.$notify.warning({
                message: Vue.t("container.replicasCompare")
              })
              return;
            }
            let blanceData = {
              "app_name": self.selectedRowData.name,
              "rancher_cluster_id": self.selectedRowData.rancher_cluster_id,
              "user_id": self.selectedRowData.namespace,
              "min_replicas": self.setBalance.min_replicas,
              "max_replicas": self.setBalance.max_replicas,
              "cpu_average": self.setBalance.cpu_average,
              "mem_average": self.setBalance.mem_average
            };
            self.saving = true;
            let reponse = this.$ajax({
              type: 'post',
              url: "api/cetus/v1/hpa/create_hpa",
              data: JSON.stringify(blanceData),
              successMsg:this.$t('container.setScalingSuccess'),
              log: {
                description: {
                  en: `app :${self.selectedRowData.name} open scaling service`,
                  zh_cn: `应用${self.selectedRowData.name}开启弹性伸缩`
                },
                target: Vue.logTarget.applicationManage
              },
              successFun:(response) => {
                self.saving = false;
                self.$emit("refreshData", {})
                self.$emit("handleAddShow", {});
              }
            });
          }
        });
      }
    }
  }
}
</script>

