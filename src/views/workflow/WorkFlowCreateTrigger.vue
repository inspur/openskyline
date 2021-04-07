<template>
  <div>
  <el-dialog
    :title="$t('task.createCloudTask')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
    size="small">
      <el-steps :space="180" :active="activeIndex" process-status="process" finish-status="success">
        <el-step :title="$t('task.createCloudTask')"></el-step>
        <el-step :title="$t('task.createTask')"></el-step>
      </el-steps>
      <step-one @stepOneDone="stepOneDone" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne"
      @handleClose='handleClose'></step-one>
      <step-two @prevStep="prevStep" @stepTwoDone="stepTwoDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepTwo"
      @showVmDialog='showVmDialog' @showVolumeDialog='showVolumeDialog' @clearResourceValue="clearResourceValue"
      @setTaskType="setTaskType" :subDialogForm='subDialogForm' @selectProject="selectProject" @selectUser="selectUser"></step-two>
  </el-dialog>
  <work-flow-create-trigger-task-vm ref="workFlowCreateTriggerTaskVm" v-if="createTriggerTaskVmFlag" @handleAddShow="closeSubDialog" @handleAddShow2="closeVmDialog" :taskType="taskType"></work-flow-create-trigger-task-vm>
  <work-flow-create-trigger-task-volume ref="workFlowCreateTriggerTaskVolume" v-if="createTriggerTaskVolumeFlag" @handleAddShow="closeSubDialog" @handleAddVolumeShotShow="closeVolumeShotShow"></work-flow-create-trigger-task-volume>
  <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  <select-user ref="selectUser" v-if="selUserFlg" @getSelUser="getSelUser" :instProjectId="project_id"></select-user>
  </div>
</template>
<script>
  import StepOne from './WorkFlowCreateTriggerStepOne';
  import StepTwo from './WorkFlowCreateTriggerStepTwo';
  import workFlowCreateTriggerTaskVm from './WorkFlowCreateTriggerTaskVm';
  import workFlowCreateTriggerTaskVolume from './WorkFlowCreateTriggerTaskVolume';
  export default {
    name: "WorkFlowCreateTrigger",
    components: {
      StepOne, StepTwo, workFlowCreateTriggerTaskVm, workFlowCreateTriggerTaskVolume
    },
    data() {
      return {
        activeIndex: 0,
        dialogVisible: false,
        createTriggerTaskVmFlag:false,
        createTriggerTaskVolumeFlag:false,
        createTriggerForm:{},
        subDialogForm:{
          resourceId:"",
          resourceName:"",
          resourceVolumeName:""
        },
        taskType:"",
        selProjectFlg:false,
        selUserFlg:false,
        project_id:""
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
        self.createTriggerForm = Object.assign({}, self.createTriggerForm, param);
        this.activeIndex = 1;
        // self.$nextTick(() => {
        //   self.$refs.stepTwo.getFlowList();
        // });
        Vue.scrollToHeader();
      },
      stepTwoDone(param) {
        let self = this;
        let cronTask = {};
        self.createTriggerForm.cron_task = Object.assign({}, cronTask, param);
        try {
          let response = this.$ajax({
            type: 'post',
            url: "api/mistral/v2/cloud_tasks",
            data:JSON.stringify(self.createTriggerForm),
            successMsg:this.$t('task.createSuccessMsg'),
            log:{
              description:{
                en:"Create cloud task:" + self.createTriggerForm.name,
                zh_cn:"创建云计划任务:" + self.createTriggerForm.name
              },
              target:Vue.logTarget.workflowtask
            },
            successFun:() => {
              self.$recordLog({
                target:Vue.logTarget.workflowtriggertask,
                level:{
                  en:"info",
                  zh_cn:"信息"
                },
                description:{
                  en:"Create cloud child task:" + self.createTriggerForm.cron_task.name,
                  zh_cn:"创建云计划任务" + self.createTriggerForm.name + "下的任务:" + self.createTriggerForm.cron_task.name
                }
              });
              self.$refs.stepTwo.finishDisabled = false;
              this.$emit("handleAddShow", {});
              this.$emit("refreshData");
            },
            showErrMsg: false,
            errFun:(res) => {
              self.$refs.stepTwo.finishDisabled = false;
              let resp = res["responseJSON"];
              if (resp.faultstring.indexOf("Duplicate entry for cron trigger") > -1) {
                self.$notify.error({
                  message: Vue.t('task.errorTaskNote1')
                });
              } else if (resp.faultstring.indexOf("Duplicate entry for cron cloud_task") > -1) {
                self.$notify.error({
                  message: Vue.t('task.errorTaskNote2')
                });
              } else if (resp.faultstring.indexOf("Already") > -1) {
                self.$notify.error({
                  message: Vue.t('task.errorTaskNote3')
                });
              } else if (resp.faultstring.indexOf("Duplicate entry for cloud_task") > -1) {
                self.$notify.error({
                  message: Vue.t('task.errorTaskNote2')
                });
              } else {
                self.$notify.error({
                  message: resp.faultstring
                });
              }
            }
          });
        } catch (data) {
          // self.loading = false;
          console.log("创建云计划任务失败");
        }
      },
      showVmDialog() {
        let me = this;
        me.createTriggerTaskVmFlag = true;
        this.$nextTick(() => {
          this.$refs.workFlowCreateTriggerTaskVm.initDialog();
        });
      },
      showVolumeDialog(param) {
        let me = this;
        me.createTriggerTaskVolumeFlag = true;
        this.$nextTick(() => {
          this.$refs.workFlowCreateTriggerTaskVolume.opt = param;
          this.$refs.workFlowCreateTriggerTaskVolume.initDialog();
        });
      },
      closeSubDialog() {
        this.createTriggerTaskVmFlag = false;
        this.createTriggerTaskVolumeFlag = false;
      },
      closeVmDialog(resultData) {
        this.createTriggerTaskVmFlag = false;
        let self = this;
        self.subDialogForm.resourceId = resultData.resourceId;
        self.subDialogForm.resourceName = resultData.resourceName;
        self.$refs.stepTwo.changeSubDialogValue();
      },
      clearResourceValue() {
        this.subDialogForm.resourceId = "";
        this.subDialogForm.resourceName = "";
      },
      closeVolumeShotShow(resultData) {
        this.createTriggerTaskVolumeFlag = false;
        let self = this;
        self.subDialogForm.resourceId = resultData.resourceId;
        self.subDialogForm.resourceVolumeName = resultData.resourceName;
        self.$refs.stepTwo.changeSubDialogValue();
      },
      handleClose(isRefresh) {
        this.$emit("handleAddShow", {});
        if (isRefresh) {
          this.$emit("refreshData");
        };
      },
      cancel() {
        this.$emit("handleAddShow", {});
      },
      setTaskType(type) {
        this.taskType = type;
      },
      getSelProjects(id, name) {
        this.$refs.stepTwo.formInline.query_project = id;
        this.$refs.stepTwo.formInline.projectName = name;
      },
      getSelUser(id, name) {
        this.$refs.stepTwo.formInline.userId = id;
        this.$refs.stepTwo.formInline.userName = name;
      },
      selectUser() {
        this.selUserFlg = true;
        this.$nextTick(() => {
          this.$refs.selectUser.show();
        });
      },
      selectProject() {
        this.selProjectFlg = true;
        this.$nextTick(() => {
          this.$refs.selectProject.show();
        });
      }
    }
  }
</script>
<style scoped>

</style>