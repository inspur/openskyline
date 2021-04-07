<template>
  <div>
  <el-dialog :title="$t('task.createTask')" :visible.sync="dialogVisible"
    :before-close="handleClose" :close-on-click-modal="false" :size="dialogSize">
    <el-form v-loading="saving" ref="createTriggerForm" :model="createTriggerForm" :rules=rules label-width="150px" class="me-required-form">
      <el-form-item :label="$t('task.taskName')" prop="name" class="is-required">
        <el-input class="col-12" v-model="createTriggerForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.type')" prop="type" class="is-required">
        <el-select class="col-12" v-model="createTriggerForm.type" @change="typeChange" :disabled="typeChangeDisabled"> 
          <el-option v-for="item in flowOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <div class="el-form-item__error" id="type-clouddist-error" hidden>{{$t('task.clouddiskError')}}</div>
        <el-tooltip placement="top" trigger="hover" v-if="createTriggerForm.volumebak_flag=='std.create_volume_backups' || createTriggerForm.volumebak_flag=='std.create_volume_inc_backups'">
          <div slot="content" v-html="$t('task.clouddiskWarn')"></div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item v-if="createTriggerForm.instance_flag == true" :label="$t('task.cloudHost')" prop="resourceName" class="is-required">
        <el-input class="col-12" v-model="createTriggerForm.resourceName" auto-complete="off" readonly></el-input>
        <el-button type="primary" icon='fa-plus' size="small" @click="queryVmDialog">{{$t('task.selectCloudHost')}}</el-button>
      </el-form-item>
      <el-form-item v-if="createTriggerForm.volume_flag == true" :label="$t('task.cloudDisk')" prop="resourceVolumeName" class="is-required">
        <el-input class="col-12" v-model="createTriggerForm.resourceVolumeName" auto-complete="off" readonly></el-input>
        <el-button type="primary" icon='fa-plus' size="small" @click="queryVolumeDialog">{{$t('task.selectCloudDisk')}}</el-button>
      </el-form-item>
      <el-form-item v-if="createTriggerForm.instsnap_flag || createTriggerForm.volumesnap_flag || createTriggerForm.volumebak_flag=='std.create_volume_backups'" 
        :label="createTriggerForm.volumebak_flag=='std.create_volume_backups'?$t('task.backupmax'):$t('task.snapshotSaveCount')" prop="snapCount" class="is-required">
        <el-input class="col-12" v-model="createTriggerForm.snapCount"></el-input>
        <el-tooltip placement="top" trigger="hover" :content="$t('task.snapshotSaveCountDesc')" v-if="createTriggerForm.instsnap_flag">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <el-tooltip placement="top" trigger="hover" :content="$t('task.snapshotDiskDesc')" v-if="createTriggerForm.volumesnap_flag">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <!-- <el-form-item v-if="createTriggerForm.instsnap_flag" label="" prop="" class="">
        <span style="color: #bb2c2c;">{{$t('task.snapshotTaskTip')}}</span>
      </el-form-item> -->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="createTriggerTask" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
  <work-flow-create-trigger-task-vm ref="workFlowCreateTriggerTaskVm" v-if="createTriggerTaskVmFlag" @handleAddShow2="handleAddShow2" :taskType="taskType"></work-flow-create-trigger-task-vm>
  <work-flow-create-trigger-task-volume ref="workFlowCreateTriggerTaskVolume" v-if="createTriggerTaskVolumeFlag" @handleAddVolumeShotShow="handleAddVolumeShotShow"></work-flow-create-trigger-task-volume>
  </div>
</template>
<script>
import workFlowCreateTriggerTaskVm from './WorkFlowCreateTriggerTaskVm';
import workFlowCreateTriggerTaskVolume from './WorkFlowCreateTriggerTaskVolume';
  export default {
    name: "WorkFlowCreateTriggerTask",
    components: {
       workFlowCreateTriggerTaskVm, workFlowCreateTriggerTaskVolume
    },
    props:{
      cloudTaskId:{
        type:String
      },
      triggerTaskName:{
        type:String
      }
    },
    data() {
      return {
        requestBody:{},
        saving: false,
        typeChangeDisabled: false,
        flowOptions:[],
        roleType:Vue.roleType,
        taskType: "",
        createTriggerTaskVmFlag:false,
        createTriggerTaskVolumeFlag:false,
        project_id:"",
        createTriggerForm:{
          name:'',
          date:new Date(),
          type:'',
          cycle:1,
          number:'', //天数
          number2:'', //小时
          number3:[], //每周或者每月
          year:new Date().getFullYear(),
          month:new Date().getMonth()+1,
          day:new Date().getDate(),
          hour:new Date().getHours(),
          minute:new Date().getMinutes(),
          hourAndMin:new Date(),
          project_id:'',
          dateStr:'',
          first_execution_time:'',
          instance_flag:false,
          instsnap_flag: false,
          volume_flag:false,
          volumebak_flag: "",
          volumesnap_flag:false,
          resourceName:'',
          resourceVolumeName:'',
          snapCount: '5',
          resourceId:''
        },
        pickerOptions:{
          disableDate(time) {
            return time.getTime() < Date.now -8.64e7;
          }
        },
        rules: {
          snapCount: [
            {type: 'required'},
            {type: 'integer'},
            {type: 'max', value:5},
            {type: 'min', value:1}
          ],
          resourceName: [
            {type: 'required'}
          ],
          resourceVolumeName: [
            {type: 'required'}
          ],
          templateData: [
            {type: 'required'}
          ],
          name: [
            {type: 'required'},
            {type: 'startwithLetter_NoChineseDot'},
            {type: 'maxSize', value:40}
          ],
          type: [
            {type: 'required'}
          ],
          cycle: [
            {type: 'required', trigger: 'blur change'}
          ],
          hour: [
            {type: 'required'},
            {type: 'integer'},
            {type: 'max', value:23},
            {type: 'min', value:0}
          ],
          minute: [
            {type: 'required'},
            {type: 'integer'},
            {type: 'max', value:59},
            {type: 'min', value:0}
          ],
          number: [
            {type: 'required'},
            {type: 'integer'},
            {type: 'max', value:100},
            {type: 'min', value:1}
          ],
          number2: [
            {type: 'required'},
            {type: 'integer'},
            {type: 'max', value:24},
            {type: 'min', value:1}
          ]
        },
        dialogSize:"small",
        flag: false,
        dialogVisible: false
      }
    },
    mounted() {
      this.initDialog();
      this.getFlowList();
    },
    methods: {
      dialogSizeChange(val) {
        if (val === "system") {
          this.dialogSize = "large";
        } else {
          this.dialogSize = "small";
        }
      },
      initDialog() {
        this.dialogVisible = true;
      },
      createTriggerTask(param) {
        let self = this;
         this.$refs.createTriggerForm.validate((valid) => {
          if (valid) {
            let type = this.createTriggerForm.type;
            let typeNameEn = ''; //任务类型名称英文
            let typeList = this.flowOptions;
            for (let i=0; i<typeList.length; i++) {
              if (type == typeList[i].id) {
                typeNameEn = typeList[i].nameEn;
              }
            }
            let commitForm = {};
            commitForm.cloud_task_id = this.cloudTaskId; // 云计划任务id
            commitForm.workflow_id = type; // 任务类型的id
            commitForm.workflow_name = typeNameEn; // 任务类型名称
            if (typeNameEn == 'start_vm' || typeNameEn == 'stop_vm') {
              commitForm.workflow_input = {"instance_id":this.createTriggerForm.resourceId + ''}; // 云主机id
            } else if (typeNameEn == 'std.create_volume_snapshot') {
              commitForm.workflow_input = {"volume_id":this.createTriggerForm.resourceId + '', "name":this.createTriggerForm.name + '', "rotation": self.createTriggerForm.snapCount}; // 云硬盘id
            } else if (typeNameEn == "std.create_instance_backup") {
              commitForm.workflow_input = {"server_id": this.createTriggerForm.resourceId, "backup_name": this.createTriggerForm.name, "rotation": this.createTriggerForm.snapCount};
            } else if (typeNameEn == "std.create_volume_backups") {
              commitForm.workflow_input = {"volume_id":this.createTriggerForm.resourceId + '', "name":this.createTriggerForm.name + '', "rotation": self.createTriggerForm.snapCount}; // 云硬盘id
            } else if (typeNameEn == "std.create_volume_inc_backups") {
              commitForm.workflow_input = {"volume_id":this.createTriggerForm.resourceId + '', "name":this.createTriggerForm.name + ''};
            }
            commitForm.workflow_params = {};
            commitForm.name = this.createTriggerForm.name + ''; // 任务名称
            this.requestBody = Object.assign({}, commitForm);
            try {
              self.saving = true;
              let response = this.$ajax({
                type: 'post',
                url: "api/mistral/v2/cron_tasks",
                data:JSON.stringify(self.requestBody),
                successMsg:this.$t('task.createSuccessMsg'),
                log:{
                  description:{
                    en:"Create cloud child task:" + self.requestBody.name,
                    zh_cn:"创建云计划任务" + self.triggerTaskName + "下的任务:" + self.requestBody.name
                  },
                  target:Vue.logTarget.workflowtriggertask
                },
                successFun:() => {
                  self.saving = false;
                  this.$emit("handleAddShow", {});
                  this.$emit("refreshData");
                },
                showErrMsg: false,
                errFun:(res) => {
                  self.saving = false;
                  let resp = res["responseJSON"];
                  if (resp.faultstring.indexOf("Duplicate") > -1) {
                    self.$notify.error({
                      message: Vue.t('task.errorTaskNote1')
                    });
                  } else if (resp.faultstring.indexOf("Already") > -1 ) {
                    self.$notify.error({
                      message: Vue.t('task.errorTaskNote3')
                    });
                  } else {
                    self.$notify.error({
                      message: resp.faultstring
                    });
                  }
                }
              });
            } catch (data) {
              console.log("创建云计划任务子任务失败");
            }
          } else {
            return false;
          }
        });
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      handleAddShow() {
        this.createTriggerTaskVmFlag = false;
      },
      handleAddShow2(resultData) {
        this.createTriggerTaskVmFlag = false;
         this.createTriggerForm.resourceId = resultData.resourceId;
        this.createTriggerForm.resourceName = resultData.resourceName;
      },
      handleAddVolumeShotShow(resultData) {
        this.createTriggerTaskVolumeFlag = false;
        this.createTriggerForm.resourceId = resultData.resourceId;
        this.createTriggerForm.resourceVolumeName = resultData.resourceName;
      },
      queryVmDialog() {
        let me = this;
        me.createTriggerTaskVmFlag = true;
        this.$nextTick(() => {
          this.$refs.workFlowCreateTriggerTaskVm.initDialog();
        });
      },
      queryVolumeDialog() {
        let me = this;
        me.createTriggerTaskVolumeFlag = true;
        this.$nextTick(() => {
          this.$refs.workFlowCreateTriggerTaskVolume.opt = this.taskType;
          this.$refs.workFlowCreateTriggerTaskVolume.initDialog();
        });
      },
      async getFlowList() {
        try {
          let url = 'api/mistral/v2/workflows';
          //超级管理员或者项目管理员
          if (Vue.roleType == '0') {
            url = 'api/mistral/v2/workflows?all_projects=true';
          } else if (Vue.roleType == '2') {
            url = 'api/mistral/v2/workflows';
          } else {
            url = '';
          }
          let result = await this.$ajax({
            type: "GET",
            url: url
          });
          let dataResult = result.workflows;
          let dataLength = dataResult.length;
          this.flowOptions = [];
          let flagId = '';
          for (let i = 0; i < dataLength; i++) {
            let nameFr = dataResult[i].name;
            if (nameFr.indexOf("system_") != 0 && nameFr.indexOf("tasks_reportforms") != 0) { // 去除系统任务
              let nameTo = '';
              if (nameFr == 'start_vm') {
                  nameTo = Vue.t('task.startVm');
              } else if (nameFr == 'stop_vm') {
                  nameTo = Vue.t('task.stopVm');
                  if (Vue.roleType != "0") {
                    flagId = dataResult[i].id;
                  }
              } else if (nameFr == 'std.create_volume_snapshot') {
                  nameTo = Vue.t('task.createDiskSnapshot');
              } else if (nameFr == 'std.create_instance_backup') {
                nameTo = Vue.t('calcStorLang.instSnapshotTask');
              } else if (nameFr == 'tasks_reportforms') {
                  nameTo = Vue.t('task.periodreport');
                  if (Vue.roleType == "0") {
                    flagId = dataResult[i].id;
                  }
              } else if (nameFr == "std.create_volume_backups") {
                nameTo = Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.allBackUp')+")";
              } else if (nameFr == "std.create_volume_inc_backups") {
                nameTo = Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.increaseBackUp')+")";
              } else {
                nameTo = nameFr;
              }
              this.flowOptions.push({
                id:dataResult[i].id,
                name:nameTo,
                nameEn:nameFr
              });
            }
          }
          if (this.flowOptions.length > 0) {
            this.createTriggerForm.type = flagId;
            this.createTriggerForm.instance_flag = true;
            if (Vue.roleType == "0") {
              this.typeChangeDisabled = true;
            }
          }
        } catch (res) {
          console.log("获取类型列表失败");
        }
      },
      typeChange(val) {
        let self = this;
        let nameEnTemp;
        self.createTriggerForm.resourceVolumeName = "";
        this.flowOptions.forEach(function(obj, index) {
          if (obj['id'] == val) {
            nameEnTemp = obj['nameEn'];
            self.createTriggerForm.instance_flag = false;
            self.createTriggerForm.volume_flag = false;
            self.createTriggerForm.instsnap_flag = false;
            self.createTriggerForm.volumesnap_flag = false;
            self.createTriggerForm.volumebak_flag = "";
            $("#type-clouddist-error").hide();
            if (nameEnTemp == 'start_vm' || nameEnTemp == 'stop_vm') {
              self.createTriggerForm.resourceId = "";
              self.createTriggerForm.resourceName = "";
              self.createTriggerForm.instance_flag = true;
            } else if (nameEnTemp == 'std.create_instance_backup') {
              self.createTriggerForm.resourceId = "";
              self.createTriggerForm.resourceName = "";
              self.createTriggerForm.instance_flag = true;
              self.createTriggerForm.instsnap_flag = true;
              self.rules.snapCount = [
                                      {type: 'required'},
                                      {type: 'integer'},
                                      {type: 'max', value:5},
                                      {type: 'min', value:1}
                                    ];
            } else if (nameEnTemp == 'std.create_volume_snapshot') {
              self.createTriggerForm.resourceId = "";
              self.createTriggerForm.resourceName = "";
              self.createTriggerForm.volume_flag = true;
              self.createTriggerForm.volumesnap_flag = true;
              $("#type-clouddist-error").show();
            } else if (nameEnTemp == 'std.create_volume_backups' || nameEnTemp == "std.create_volume_inc_backups") {
              self.createTriggerForm.volume_flag = true;
              self.createTriggerForm.volumebak_flag = nameEnTemp;
              self.rules.snapCount = [
                                      {type: 'required'},
                                      {type: 'integer'},
                                      {type: 'max', value:5},
                                      {type: 'min', value:1}
                                    ];
              $("#type-clouddist-error").show();
            } else {
              self.createTriggerForm.instance_flag = false;
            }
            return;
          }
        });
        this.taskType = nameEnTemp;
      },
      cancel() {
        this.$emit("handleAddShow", {});
      }
    }
  }
</script>
<style scoped>

</style>