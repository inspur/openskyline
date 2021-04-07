<template>
  <el-dialog
    :title="$t('container.createkbCluster')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-steps :active="activeIndex" process-status="process" finish-status="success" align-center> 
      <el-step :title="$t('container.basicInfo')"></el-step>
      <el-step :title="$t('container.setNodeFlavor')"></el-step>
      <el-step :title="$t('container.network')"></el-step>
      <el-step :title="$t('container.imageLibray')"></el-step>
    </el-steps>
    <step-one @stepOneDone="stepOneDone" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne"></step-one>
    <step-two @prevStep="prevStep" @stepTwoDone="stepTwoDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepTwo"></step-two>
    <step-three @prevStep="prevStep" @stepThreeDone="stepThreeDone" @cancel="cancel" v-show="activeIndex == 2" ref="stepThree"></step-three>
    <step-four @prevStep="prevStep" @stepFourDone="stepFourDone" @cancel="cancel" v-show="activeIndex == 3" ref="stepFour"></step-four>
  </el-dialog>
</template>
<script>
  import StepOne from './CreateContainerClusterStepOne';
  import StepTwo from './CreateContainerClusterStepTwo';
  import StepThree from './CreateContainerClusterStepThree';
  import StepFour from './CreateContainerClusterStepFour';
  export default {
    name: "CreateContainerClusterGuide",
    components: {
      StepOne, StepTwo, StepThree, StepFour
    },
    data() {
      return {
        activeIndex: 0,
        dialogVisible: false,
        createTemplateForm:{}
      }
    },
    mounted() {
      this.initDialog();
    },
    methods: {
      initDialog() {
        let self = this;
        self.dialogVisible = true;
      },
      prevStep(activeIndex) {
        this.activeIndex = activeIndex;
        Vue.scrollToHeader();
      },
      stepOneDone(param) {
        let self = this;
        this.activeIndex = 1;
        Vue.scrollToHeader();
        self.createTemplateForm = Object.assign({}, self.createTemplateForm, param);
      },
      stepTwoDone(param) {
        let self = this;
        this.activeIndex = 2;
        Vue.scrollToHeader();
        self.createTemplateForm = Object.assign({}, self.createTemplateForm, param);
      },
      stepThreeDone(param) {
        let self = this;
        this.activeIndex = 3;
        Vue.scrollToHeader();
        self.createTemplateForm = Object.assign({}, self.createTemplateForm, param);
      },
      stepFourDone(param) {
        let self = this;
        Vue.scrollToHeader();
        self.createTemplateForm = Object.assign({}, self.createTemplateForm, param);
        // self.createTemplateForm.k8s_version = "k8s_version";
        // self.createTemplateForm.network_driver = "flannel";
        self.createTemplateForm.server_type = "vm";
        self.createTemplateForm.docker_storage_driver = "overlay";
        self.createTemplateForm.user_id = Vue.userId;
        self.createTemplateForm.project_id = self.$cookie.get('pid');
        if (self.createTemplateForm.docker_volume_size === '') {
          self.createTemplateForm.docker_volume_size = null;
        }
        this.$refs.stepFour.showFinishMask();
        this.$ajax({
          type:"post",
          url:"api/cetus/v1/cluster",
          data:JSON.stringify(self.createTemplateForm),
          successMsg:this.$t('container.createRequest'),
          log:{
            description:{
              en:"Create Kubernetes cluster:" + self.createTemplateForm.name,
              zh_cn:"创建Kubernetes集群:" + self.createTemplateForm.name
            },
            target:Vue.logTarget.containerCluster
          },
          successFun:() => {
            this.$refs.stepFour.hideFinishMask();
            this.$emit("handleAddShow", {});
            this.$emit("refreshData");
          },
          errFun:() => {
            this.$refs.stepFour.hideFinishMask();
            this.$emit("handleAddShow", {})
          }
        });
      },
      handleClose() {
        this.$emit("handleAddShow", {});
      },
      cancel() {
        this.$emit("handleAddShow", {});
      }
    }
  }
</script>
<style scoped>

</style>