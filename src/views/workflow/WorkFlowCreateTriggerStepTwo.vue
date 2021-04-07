<template>
  <div>
    <el-form ref="createTriggerForm" :model="createTriggerForm" :rules=rules label-width="150px" 
        class="margin-tb20 me-required-form" v-loading="loading">
      <el-form-item :label="$t('task.taskName')" prop="name" class="is-required">
        <el-input class="col-12" v-model="createTriggerForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('task.taskType')" prop="type" class="is-required">
        <el-select class="col-12" v-model="createTriggerForm.type" @change="typeChange"> 
          <el-option v-for="item in flowOptions" :key="item.id" :label="flowOptionLabel(item)" :value="item.id"></el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" v-if="createTriggerForm.volumebak_flag=='std.create_volume_backups' || createTriggerForm.volumebak_flag=='std.create_volume_inc_backups'">
          <div slot="content" v-html="$t('task.clouddiskWarn')"></div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div class="el-form-item__error" id="type-clouddist-error" hidden>{{$t('task.clouddiskError')}}</div>
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
    </el-form>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary" :loading="finishDisabled">{{$t('lang.finish')}}</el-button>
    </div>
  </div>
</template>
<script>
  export default {
    name: "WorkFlowCreateTriggerStepTwo",
    props:{
      cloudTaskId:{
        type:String
      },
      triggerTaskName:{
        type:String
      },
      subDialogForm:{
        type:Object,
        default: function() {
          return {};
        }
      }
    },
    data() {
      return {
        requestBody:{},
        loading: false,
        flowOptions:[],
        roleType:Vue.roleType,
        finishDisabled: false,
        createTriggerForm:{
          name:'',
          type:'',
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
        rules: {
          name: [
            {type: 'required'},
            {type: 'startwithLetter_NoChineseDot'},
            {type: 'maxSize', value:40}
          ],
          type: [
            {type: 'required'}
          ],
          resourceName: [
            {type: 'required'}
          ],
          snapCount: [
            {type: 'required'},
            {type: 'integer'},
            {type: 'max', value:5},
            {type: 'min', value:1}
          ],
          resourceVolumeName: [
            {type: 'required'}
          ]
        }
      }
    },
    mounted() {
      this.getFlowList();
    },
    methods: {
      nextStep() {
        let self = this;
        self.$refs.createTriggerForm.validate((valid) => {
          if (valid) {
            let type = self.createTriggerForm.type; //任务类型的id
            let typeNameEn = ''; //任务类型名称英文
            let typeList = this.flowOptions;
            for (let i = 0; i < typeList.length; i++) {
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
              commitForm.workflow_input = {"server_id": this.createTriggerForm.resourceId + '', "backup_name": self.createTriggerForm.name, "rotation": self.createTriggerForm.snapCount};
            } else if (typeNameEn == "std.create_volume_backups") {
              commitForm.workflow_input = {"volume_id":this.createTriggerForm.resourceId + '', "name":this.createTriggerForm.name + '', "rotation": self.createTriggerForm.snapCount}; // 云硬盘id
            } else if (typeNameEn == "std.create_volume_inc_backups") {
              commitForm.workflow_input = {"volume_id":this.createTriggerForm.resourceId + '', "name":this.createTriggerForm.name + ''}; // 云硬盘id
            }
            commitForm.workflow_params = {};
            commitForm.name = this.createTriggerForm.name + ''; // 任务名称
            self.requestBody = Object.assign({}, commitForm);
            self.finishDisabled = true;
            self.$emit("stepTwoDone", self.requestBody);
          } else {
            return false;
          }
        });
      },
      flowOptionLabel(val) {
        if (val.name == "std.create_instance_backup") {
           return Vue.t('calcStorLang.instSnapshotTask');
        } else if (val.name == "std.create_volume_snapshot") {
          return Vue.t('task.createDiskSnapshot');
        } else if (val.name == "std.create_volume_backups") {
          return Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.allBackUp')+")";
        } else if (val.name == "std.create_volume_inc_backups") {
          return Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.increaseBackUp')+")";
        }
        return val.name;
      },
      changeSubDialogValue() {
       this.createTriggerForm.resourceId = this.subDialogForm.resourceId;
       this.createTriggerForm.resourceName = this.subDialogForm.resourceName;
       this.createTriggerForm.resourceVolumeName = this.subDialogForm.resourceVolumeName;
       if (this.createTriggerForm.instance_flag) {
         this.$refs.createTriggerForm.validateField("resourceName");
       }
      },
      queryVmDialog() {
        this.$emit("showVmDialog");
      },
      queryVolumeDialog() {
        let self = this;
        let opt = this.flowOptions.find(function(item) {
          return item.id == self.createTriggerForm.type;
        });
        this.$emit("showVolumeDialog", opt.nameEn);
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
          this.loading = true;
          let result = await this.$ajax({
            type: "GET",
            url: url
          });
          this.loading = false;
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
                  flagId = dataResult[i].id;
              } else if (nameFr == 'std.create_volume_snapshot') {
                  nameTo = Vue.t('task.createDiskSnapshot');
              } else if (nameFr == "std.create_volume_backups") {
                nameTo = Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.allBackUp')+")";
              } else if (nameFr == "std.create_volume_inc_backups") {
                nameTo = Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.increaseBackUp')+")";
              } else if (nameFr == 'std.create_instance_backup') {
                nameTo = Vue.t('calcStorLang.instSnapshotTask');
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
            self.createTriggerForm.volume_flag = false;
            self.createTriggerForm.instance_flag = false;
            self.createTriggerForm.instsnap_flag = false;
            self.createTriggerForm.volumesnap_flag = false;
            self.createTriggerForm.volumebak_flag = "";
            $("#type-clouddist-error").hide();
            if (nameEnTemp == 'start_vm' || nameEnTemp == 'stop_vm') {
              self.createTriggerForm.resourceId = "";
              self.createTriggerForm.resourceName = "";
              self.$emit("clearResourceValue");
              self.createTriggerForm.instance_flag = true;
            } else if (nameEnTemp == 'std.create_instance_backup') {
              self.createTriggerForm.resourceId = "";
              self.createTriggerForm.resourceName = "";
              self.$emit("clearResourceValue");
              self.createTriggerForm.instance_flag = true;
              self.createTriggerForm.instsnap_flag = true;
              self.rules.snapCount = [
                                      {type: 'required'},
                                      {type: 'integer'},
                                      {type: 'max', value:5},
                                      {type: 'min', value:1}
                                    ];
            } else if (nameEnTemp == 'std.create_volume_snapshot') {
              self.createTriggerForm.volume_flag = true;
              self.createTriggerForm.volumesnap_flag = true;
              $("#type-clouddist-error").show();
            } else if (nameEnTemp == 'std.create_volume_backups' || nameEnTemp == 'std.create_volume_inc_backups') {
              self.createTriggerForm.volume_flag = true;
              self.createTriggerForm.volumebak_flag = nameEnTemp;
              $("#type-clouddist-error").show();
              self.rules.snapCount = [
                                      {type: 'required'},
                                      {type: 'integer'},
                                      {type: 'max', value:5},
                                      {type: 'min', value:1}
                                    ];
            } else {
              self.createTriggerForm.instance_flag = false;
            }
          }
        });
        this.$emit("setTaskType", nameEnTemp);
      },
      prevStep() {
        this.$emit("prevStep", 0);
      },
      cancel() {
        this.$emit("cancel");
      }
    }
  }
</script>
<style scoped>

</style>