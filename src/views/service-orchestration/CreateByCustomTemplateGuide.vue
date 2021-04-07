<template>
  <el-dialog
    :title="$t('heat.createCustomby')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
    size="large">
    <el-steps :active="activeIndex" process-status="process" finish-status="success">
      <el-step :title="$t('heat.chooseTemplate')"></el-step>
      <el-step :title="$t('base.baseInfo')"></el-step>
    </el-steps>
    <step-one @stepOneDone="stepOneDone" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne" :templateDetail="templateDetail"></step-one>
    <step-two @prevStep="prevStep" @stepTwoDone="stepTwoDone" @stepTwofinishFlag="stepTwofinishFlag" @cancel="cancel" v-show="activeIndex == 1" ref="stepTwo" v-if="flag" :templateDetail="templateDetail" :finishFlag="finishFlag"></step-two>
  </el-dialog>
</template>
<script>
  import StepOne from './CreateByCustomStepOne';
  import StepTwo from './CreateByCustomStepTwo';
  export default {
    name: "CreateByCustomTemplateGuide",
    components: {
      StepOne, StepTwo
    },
    data() {
      return {
        finishFlag: false,
        requestBody:{},
        templateDetail:{},
        activeIndex: 0,
        flag: false,
        dialogVisible: false
      }
    },
    mounted() {
      // this.$parent.$parent.active = "instances";
      this.initDialog();
    },
    methods: {
      stepTwofinishFlag() {
        this.finishFlag = true;
      },
      initDialog() {
        var self = this;
        self.dialogVisible = true;
      },
      prevStep(activeIndex) {
        this.flag = false;
        this.activeIndex = activeIndex;
        Vue.scrollToHeader();
      },
      stepOneDone(param) {
        var self = this;
        self.flag = true;
        this.activeIndex = 1;
        this.templateDetail = param;
        Vue.scrollToHeader();
      },
      stepTwoDone(param) {
        var self = this;
        param.template = self.templateDetail;
        param.source = 2;
        self.requestBody = Object.assign({}, param);
        try {
          this.$ajax({
            type: 'post',
            url: "api/heat/v1/" + this.$cookie.get("pid")+ "/template",
            data:JSON.stringify(self.requestBody),
            successMsg: self.$t("container.createSuccessMsg"),
            successFun:() => {
              self.finishFlag = false;
              self.$emit("handleAddShow", {});
              self.$router.push({
                path: '/service-orchestration/orchestrationTemplate'
              });
              self.$refs.stepTwo.hideFinishMask();
              self.$emit("handleAddShow", {});
              self.$emit("refreshData");
            },
            errFun:() => {
              self.$refs.stepTwo.hideFinishMask();
              self.$emit("handleAddShow", {})
            },
            log:{
              description:{
                en:"YAML file create template:" + self.requestBody.name,
                zh_cn:"YAML文件创建模板:" + self.requestBody.name
              },
              target:Vue.logTarget.heatTemplate
            }
          });
        } catch (data) {
          self.finishFlag = false;
        }
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      cancel() {
        this.$emit("handleAddShow", {});
      }
    }
  }
</script>
<style scoped>

</style>
