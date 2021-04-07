<template>
  <el-dialog
  :title="$t('scalingService.resizeScalingServiceCapability')"
  :visible.sync="visible"
  :before-close="handleClose" size="tiny">
    <el-form ref="resizeScalingServiceForm" class="me-required-form" :model="scalingService" :rules=rules label-width="100px" v-loading="loading">
      <el-form-item :label="$t('scalingService.desiredCapacity')" prop="desiredSize">
        <el-input v-model="scalingService.desiredSize" class="col-16" :disabled="true"></el-input>
      </el-form-item> 
      <el-form-item :label="$t('scalingService.maxCapabilitySize')" class="is-required" prop="maxSize">
        <el-input v-model="scalingService.maxSize" auto-complete="off" class="col-16"></el-input>
      </el-form-item>
      <el-form-item :label="$t('scalingService.minCapabilitySize')" class="is-required" prop="minSize">
        <el-input v-model="scalingService.minSize" auto-complete="off" class="col-16"></el-input>
      </el-form-item>
     </el-form>
     <div slot="footer" class="dialog-footer">
     <el-button :disabled="isDisabled" @click="handleCancel">{{$t('lang.cancel')}}</el-button>
     <el-button type="primary" :disabled="isDisabled" @click="confirmResize">{{$t('lang.confirm')}}</el-button>
   </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'ResizeScalingService',
  props: ['scalingServiceName', 'maxSize', 'minSize', 'desiredSize', 'clusterId'],
  data() {
    return {
      scalingService: {
        desiredSize:"",
        maxSize: "",
        minSize: ""
      },
      loading: false,
      isDisabled: false,
      visible: true,
      updateFlag: false,
      rules: {
        maxSize: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value: 100},
          {type: 'min', value: 1}
        ],
        minSize: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value: 100},
          {type: 'min', value: 1}
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.resizeScalingServiceForm);
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.visible = true;
      self.scalingService.desiredSize = this.desiredSize;
      self.scalingService.maxSize = this.maxSize;
      self.scalingService.minSize = this.minSize;
    },
    handleCancel() {
      this.$emit("handleResizeShow", {});
    },
    handleClose(done) {
      this.$emit("handleResizeShow", {});
      done();
    },
    checkNum(value) {
      var self = this;
      if (value.length > 1) {
        if (value.substr(0, 1) == "0") {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    },
    confirmResize() {
      var self = this;
      var sizeData = {
        "resize":{
          "max_size": self.scalingService.maxSize,
          "min_size": self.scalingService.minSize
        }
      };
      try {
        self.$refs.resizeScalingServiceForm.validate((valid) => {
          if (valid) {
            var flag1 = self.checkNum(self.scalingService.maxSize);
            var flag2 = self.checkNum(self.scalingService.minSize);
            if (flag1 && flag2) {
               var min = parseInt(self.scalingService.minSize);
               var desire = parseInt(self.scalingService.desiredSize);
               var max = parseInt(self.scalingService.maxSize);
                if (min <= desire && desire <= max) {
                  self.loading = true;
                  self.isDisabled = true;
                  self.$ajax({
                      type: 'POST',
                      url: "api/senlin/v1/clusters/"+self.clusterId+"/actions",
                      data: JSON.stringify(sizeData),
                      successMsg:this.$t('scalingService.sendApplySuccess'),
                      log:{
                        description:{
                         en:"resize scalingService:" + self.scalingServiceName,
                         zh_cn:"调整容量-伸缩服务:" + self.scalingServiceName
                        },
                        target:Vue.logTarget.ScalingService
                      },
                      successFun: () => {
                        // self.loading = false;
                        // self.updateFlag = true;
                        // self.$emit("handleResizeShow", {});
                        // self.$emit("delayRefreshData");
                        setTimeout( function() {
                          self.loading = false;
                          self.isDisabled = false;
                          self.$emit("handleResizeShow", {});
                          self.$emit("refreshData");
                        }, 2000);
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
                    self.$message({
                      showClose: true,
                      message: Vue.t('scalingService.capabilityNotMeetTheRequirements'),
                      type: 'warning'
                    });
                  }
                } else {
                  self.loading = false;
                  self.isDisabled = false;
                  self.$message({
                      showClose: true,
                      message: Vue.t('scalingService.cannotStartWithZero'),
                      type: 'warning'
                  });
                }
          } else {
            self.loading = false;
            self.isDisabled = false;
            return false;
          }
        });
      } catch (res) {
      }
       //this.$emit("handleShow", {});
    }
  }
}
</script> 