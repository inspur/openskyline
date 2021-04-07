<template>
  <el-dialog
    :title="this.$t('heat.createSystemTemplate')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :size="dialogSize">
    <el-steps :active="activeIndex" process-status="process" finish-status="success">
      <el-step :title="this.$t('heat.chooseTemplate')"></el-step>
      <el-step :title="this.$t('heat.basicInfo')"></el-step>
    </el-steps>
    <step-one @templateTypeChange="dialogSizeChange" @stepOneDone="stepOneDone" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne"></step-one>
    <step-two @prevStep="prevStep" @stepTwoDone="stepTwoDone" @cancel="cancel"  @stepTwofinishFlag="stepTwofinishFlag" v-show="activeIndex == 1" ref="stepTwo" :finishFlag="finishFlag" v-if="flag" :templateDetail="templateDetail"></step-two>
  </el-dialog>
</template>
<script>
  import StepOne from './CreateBySystemStepOne';
  import StepTwo from './CreateBySystemStepTwo';
  export default {
    name: "CreateBySystemTemplateGuide",
    components: {
      StepOne, StepTwo
    },
    data() {
      return {
        finishFlag: false,
        requestBody:{},
        template_yaml:"",
        templateDetail:{},
        dialogSize:"large",
        activeIndex: 0,
        flag: false,
        dialogVisible: false
      }
    },
    mounted() {
      this.initDialog();
    },
    methods: {
      stepTwofinishFlag() {
        this.finishFlag = true;
      },
      dialogSizeChange(val) {
        if (val === "system") {
          this.dialogSize = "large";
        } else {
          this.dialogSize = "small";
        }
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
        this.flag = true;
        this.activeIndex = 1;
        this.template_yaml = param.template_yaml;
        this.templateDetail = param.templateContent;
        Vue.scrollToHeader();
      },
      stepTwoDone(param) {
        var self = this;
        param.template_yaml = self.template_yaml;
        param.template = self.templateDetail;
        param.source = 0;
        self.requestBody = Object.assign({}, param);
        try {
          let response = this.$ajax({
            type: 'post',
            url: "api/heat/v1/" + this.$cookie.get("pid")+ "/template",
            data:JSON.stringify(self.requestBody),
            successMsg:Vue.t("heat.createSuccessMsg"),
            log:{
              description:{
                en:"Create system template:" + self.requestBody.name,
                zh_cn:"创建系统模板:" + self.requestBody.name
              },
              target:Vue.logTarget.heatTemplate
            },
            successFun:() => {
              self.finishFlag = false;
              this.$emit("handleAddShow", {});
              this.$emit("refreshData");
              // this.$router.push({
              //   path: '/service-orchestration/orchestrationTemplate'
              // });
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
