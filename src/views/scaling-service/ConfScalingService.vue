<template>
  <el-dialog
  :title="$t('scalingService.setAlarmThreshold')"
  :visible.sync="visible"
  :before-close="handleClose">
    <el-form ref="editConfigForm" label-position="left" class="me-required-form" :model="configParam" :rules='rules' label-width="100px" v-loading="loading">
      <div class="titlespan">
        <span>{{$t('scalingService.cpuUsed')}}</span>
        <el-tooltip effect="dark" placement="top">
          <div slot="content">{{$t('scalingService.setTheMaxAndMinOfInstanceCpuUsed')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </div>
      <div class="divider clearfix"></div>
      <el-form-item :label="$t('scalingService.maxSize')" class="is-required" prop="cpuMax">
        <el-input v-model="configParam.cpuMax" style="display:inline-block;width:260px;"></el-input>
        <span>%</span>
      </el-form-item>
      <el-form-item :label="$t('scalingService.minSize')" class="is-required" prop="cpuMin">
        <el-input v-model="configParam.cpuMin" style="display:inline-block;width:260px;">
        </el-input>
        <span>%</span>
      </el-form-item>
      <div class="titlespan">
        <span>{{$t('scalingService.memoryUsed')}}</span>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('scalingService.setTheMaxAndMinOfInstanceMemoryUsed')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </div>
      <div class="divider clearfix"></div>
      <el-form-item :label="$t('scalingService.maxSize')" class="is-required" prop="storeMax">
        <el-input v-model="configParam.storeMax" style="display:inline-block;width:260px;">
        </el-input>
        <span>%</span>
      </el-form-item>
      <el-form-item :label="$t('scalingService.minSize')" class="is-required" prop="storeMin">
        <el-input v-model="configParam.storeMin" style="display:inline-block;width:260px;">
        </el-input>
        <span>%</span>
      </el-form-item>
      <div class="warnspan">{{$t('scalingService.prompt')}}</div>
      <div class="divider clearfix"></div>
      <div class="contentspan">{{$t('scalingService.expansionCondition')}}</div>
      <div class="contentspan">{{$t('scalingService.reduceCondition')}}</div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="isDisabled" @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" :disabled="isDisabled" @click="confirm">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'ConfScalingService',
  props: ['scalingServiceName', 'clusterId', 'downAlertUrl', 'upAlertUrl'],
  data() {
    return {
      configParam: {
        cpuMax:"",
        cpuMin:"",
        storeMax:"",
        storeMin:""
      },
      visible: true,
      loading: false,
      isDisabled: false,
      rules: {
        cpuMax: [
           {type: 'required', trigger: 'blur change'},
           {type: 'integer'},
           {type:'min', value:1},
           {type:'max', value:99}
        ],
        cpuMin: [
           {type: 'required', trigger: 'blur change'},
           {type: 'integer'},
           {type:'min', value:1},
           {type:'max', value:99}
        ],
        storeMax: [
           {type: 'required', trigger: 'blur change'},
           {type: 'integer'},
           {type:'min', value:1},
           {type:'max', value:99}
        ],
        storeMin: [
           {type: 'required', trigger: 'blur change'},
           {type: 'integer'},
           {type:'min', value:1},
           {type:'max', value:99}
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.editConfigForm);
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.visible = true;
      this.$ajax({
        type: 'get',
        url: "api/pluto/v1/senlin/"+this.clusterId+"/alert",
        successFun: (rtn) => {
          if (rtn.cpu_up_threshold) {
            self.configParam.cpuMax = parseInt(rtn.cpu_up_threshold);
            self.configParam.cpuMin = parseInt(rtn.cpu_down_threshold);
            self.configParam.storeMax = parseInt(rtn.mem_up_threshold);
            self.configParam.storeMin = parseInt(rtn.mem_down_threshold);
          }
        }
      });
    },
    handleCancel() {
      this.$emit("handleConfigShow", {});
    },
    handleClose(done) {
      this.$emit("handleConfigShow", {});
      done();
    },
   checkCpuValue(min, max) {
    var minCpuNum = parseInt(min);
    var maxCpuNum = parseInt(max);
    if (minCpuNum < maxCpuNum) {
      return true;
    } else {
      return false;
    }
   },
   checkMemValue(min, max) {
    var minMemNum = parseInt(min);
    var maxMemNum = parseInt(max);
    if (minMemNum < maxMemNum) {
      return true;
    } else {
      return false;
    }
   },
   confirm() {
    var self = this;
    self.$refs.editConfigForm.validate((valid) => {
      if (!valid) return;
      var cpuFlag = self.checkCpuValue(self.configParam.cpuMin, self.configParam.cpuMax);
      var memFlag = self.checkMemValue(self.configParam.storeMin, self.configParam.storeMax);
      if (cpuFlag && memFlag) {
        if (self.downAlertUrl === "" || self.upAlertUrl === "") {
          self.$message({
            showClose: true,
            message: Vue.t('scalingService.operateTooFast'),
            type: 'warning'
            });
        } else {
          self.setAlarm();
        }
      } else {
        if (!cpuFlag && !memFlag) {
          self.$message({
            showClose: true,
            message: Vue.t('scalingService.cpuAndMemNotMeetTheRequirements'),
            type: 'warning'
          });
        } else if (!memFlag) {
          self.$message({
            showClose: true,
            message: Vue.t('scalingService.memNotMeetTheRequirements'),
            type: 'warning'
          });
        } else {
          self.$message({
            showClose: true,
            message: Vue.t('scalingService.cpuNotMeetTheRequirements'),
            type: 'warning'
          });
        }
      }
    })
   },
   async setAlarm() {
      var self = this;
      var cpuUpThreshold = self.configParam.cpuMax;
      var cpuDownThreshold = self.configParam.cpuMin;
      var memUpThreshold = self.configParam.storeMax;
      var memDownThreshold = self.configParam.storeMin;
      var downURL = self.downAlertUrl;
      var upURL = self.upAlertUrl;
      var confData = {
        "cpu_up_threshold": cpuUpThreshold,
        "cpu_down_threshold": cpuDownThreshold,
        "mem_up_threshold": memUpThreshold,
        "mem_down_threshold": memDownThreshold,
        "up_alert_url": upURL,
        "down_alert_url": downURL
      };
      try {
        self.$refs.editConfigForm.validate((valid) => {
          if (valid) {
            self.loading = true;
            self.isDisabled = true;
            self.$ajax({
              type: 'POST',
              url: "api/pluto/v1/senlin/" + self.clusterId +"/alert",
              data: JSON.stringify(confData),
              successMsg:this.$t('scalingService.sendApplySuccess'),
              log:{
                description:{
                  en:"config alarm scalingService:" + self.scalingServiceName,
                  zh_cn:"设置告警阀值-伸缩服务:" + self.scalingServiceName
                },
                target:Vue.logTarget.ScalingService
              },
              successFun: () => {
                self.loading = false;
                self.isDisabled = false;
                self.$emit("handleConfigShow", {});
                self.$emit("refreshData");
              },
              errFun: () => {
                self.loading = false;
                self.isDisabled = false;
              }
            });
            return true;
          } else {
            self.loading = false;
            self.isDisabled = false;
            return false;
          }
        });
      } catch (res) {
      }
    }
  }
}
</script>
<style scoped>
  .warnspan {
    font-size: 14px;
    font-weight: bold;
    text-align: left;
    color:red;
  }
  .contentspan {
    font-size: 13px;
    color:black;
  }
  .titlespan {
    font-size: 14px;
    font-weight: bold;
    text-align: left;
    color:black;
  }
</style>