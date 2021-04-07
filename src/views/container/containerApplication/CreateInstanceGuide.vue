<template>
  <el-dialog
    :title="$t('container.createContainerApp')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-steps :active="activeIndex" process-status="process" finish-status="success" align-center>
      <el-step :title="$t('container.basicInfo')"></el-step>
      <el-step :title="$t('container.containerTeam')"></el-step>
      <el-step :title="$t('container.serviceSet')"></el-step>
      <el-step :title="$t('container.containerVolume')"  v-if="blanceflag"></el-step>
    </el-steps>
    <step-one @stepDone="stepDone" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne"></step-one>
    <step-two @prevStep="prevStep" @stepDone="stepDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepTwo"
              :k8sClusterId="k8sClusterId" :insecure_registry="insecure_registry" :insecure_registry_id="insecure_registry_id"></step-two>
    <step-three @prevStep="prevStep" @stepDone="stepDone" @cancel="cancel" v-show="activeIndex == 2" ref="stepThree" :hasBalance="blanceflag"></step-three>
    <step-four @prevStep="prevStep" @stepDone="stepDone" @cancel="cancel" v-show="activeIndex == 3" ref="stepFour" v-if="blanceflag" 
              :rancher_cluster_id="rancher_cluster_id" :user_id="user_id"></step-four>          
  </el-dialog>
</template>
<script>
  import StepOne from './CreateStepOne';
  import StepTwo from './CreateStepTwo';
  import StepThree from './CreateStepThree';
  import StepFour from './CreateStepFour';
  export default {
    name: "CreateInstanceGuide",
    components: {
      StepOne, StepTwo, StepThree, StepFour
    },
    data() {
      return {
        activeIndex: 0,
        blanceflag: true,
        dialogVisible: false,
        loading:false,
        createInstanceForm:{},
        envDatas:[],
        portDatas:[],
        dosConfig:[],
        k8sClusterId:"",
        insecure_registry:"",
        insecure_registry_id:"",
        rancher_cluster_id:"",
        user_id:"",
        serviceSet: true
      }
    },
    mounted() {
      this.initDialog();
    },
    methods: {
      initDialog() {
        this.dialogVisible = true;
      },
      prevStep(activeIndex, formData) {
        this.activeIndex = activeIndex;
        if (formData) {
          this.createInstanceForm = Object.assign({}, this.createInstanceForm, formData);
        }
        Vue.scrollToHeader();
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      cancel() {
        this.$emit("handleAddShow", {});
      },
      stepDone(step, formData) {
        let self = this;
        self.createInstanceForm = Object.assign({}, self.createInstanceForm, formData);
        Vue.scrollToHeader();
        if (step == 1) {
          self.k8sClusterId = self.$refs.stepOne.createInstanceForm.k8sClusterId;
          self.insecure_registry = self.$refs.stepOne.insecure_registry;
          self.insecure_registry_id = self.$refs.stepOne.insecure_registry_id;
          self.rancher_cluster_id = self.$refs.stepOne.createInstanceForm.rancher_cluster_id;
          self.user_id = self.$refs.stepOne.user_id;
          self.blanceflag = self.$refs.stepOne.createInstanceForm.hpaState == '0';
          self.$nextTick(() => {
            self.$refs.stepTwo.initLabelTable();
          });
        }
        if (step == 2) {
          self.portDatas = self.$refs.stepTwo.portDatas;
          self.$nextTick(() => {
            self.$refs.stepThree.initPortTable(self.portDatas);
          });
        }
        if (step == 3) {
          self.serviceSet = self.$refs.stepThree.serviceSet;
          self.$nextTick(() => {
            self.$refs.stepFour.getVolumtList();
          });
        }
        if (step == 4) {
          self.serviceSet = self.$refs.stepThree.serviceSet;
          this.allStepDone();
        } else {
          this.activeIndex = step;
        }
      },
      allStepDone() {
        let wholeForm = Object.assign({}, this.createInstanceForm);
        this.createContainerInstance();
      },
      // 创建应用
      async createContainerInstance() {
        let me = this;
        let wholeForm = Object.assign({}, this.createInstanceForm);
        let env = [];
        for (let i=0; i<me.createInstanceForm.pods.length; i++) {
          let obj = me.createInstanceForm.pods[i];
          delete obj.id;
          delete obj.oldcreateInstanceForm;
        }
        let labels = {};
        $(this.createInstanceForm.labels).each(function(i, obj) {
          labels[obj.key] = obj.value;
        });
        let dataForm = {
            "cluster_id":wholeForm.k8sClusterId,
            "rancher_cluster_id": wholeForm.rancher_cluster_id,
            "user_id": Vue.userId,
            "replicas": wholeForm.replicas,
            "app_name": wholeForm.app_name,
            "app_type":wholeForm.app_type,
            "describe":wholeForm.describe,
            "labels": labels,
            "pods":wholeForm.pods
        };
        if (this.serviceSet) {
          dataForm["ports"] = wholeForm.ports;
          dataForm["service_name"] = wholeForm.service_name;
          dataForm["service_type"] = wholeForm.service_type;
        }
        if (wholeForm.threeStop == false) {
          dataForm["volume_name"] = wholeForm.volume_name;
          dataForm["mount_path"] = wholeForm.mount_path;
        }
        await me.$ajax({
          url: "api/cetus/v1/app/create_app",
          type: 'post',
          data: JSON.stringify(dataForm),
          log: {
              description: {
                  en: "Create Container Application:" + wholeForm.app_name,
                  zh_cn: "发送创建容器应用:" + wholeForm.app_name + "的请求"
              },
              target: Vue.logTarget.applicationManage
          },
          // successMsg:this.$t('container.startCreating'),
          success: function(res) {
            me.$refs.stepThree.loading = false;
            if (me.blanceflag) {
              me.$refs.stepFour.loading = false;
            }
            if (res.result == "success") {
              me.$notify({
                message: me.$t('container.startCreating'),
                type: "success"
              });
              if (wholeForm.app_type == "deployment" && wholeForm.hpaState == "1") {
                me.createScaling();
              }
            } else {
              me.$notify({
                message: res.result,
                type: "error"
              });
            }
            me.$emit("handleAddShow", {});
            me.$emit("refreshData");
          },
          errFun:(xhr, status, msg) => {
            me.$refs.stepThree.loading = false;
            if (me.blanceflag) {
              me.$refs.stepFour.loading = false;
            }
          }
        });
      },
      createScaling() {
        let self = this;
        let wholeForm = Object.assign({}, this.createInstanceForm);
        let attachParams = {
          "app_name": wholeForm.app_name,
          "rancher_cluster_id": wholeForm.rancher_cluster_id,
          "user_id": Vue.userId,
          "min_replicas": wholeForm.min_replicas,
          "max_replicas": wholeForm.max_replicas,
          "cpu_average": wholeForm.cpu_average,
          "mem_average": wholeForm.mem_average
        };
        let reponse = this.$ajax({
          type: 'post',
          url: "api/cetus/v1/hpa/create_hpa",
          data: JSON.stringify(attachParams),
          // successMsg:this.$t('container.setScalingSuccess'),
          log: {
            description: {
              en: `app :${wholeForm.app_name} open scaling service`,
              zh_cn: `应用${wholeForm.app_name}开启弹性伸缩`
            },
            target: Vue.logTarget.applicationManage
          },
          successFun:(response) => {
          }
        });
      }
    }
  }
</script>
<style scoped>

</style>

