<template>
  <el-dialog
  :title="$t('scalingService.editScalingServiceName')"
  :visible.sync="visible"
  :before-close="handleClose" size="tiny">
    <el-form ref="editScalingServiceForm" :model="scalingService" :rules=rules label-width="100px" v-loading="loading">
      <el-form-item  :label="$t('lang.name')" class="is-required" prop="name">
        <el-input v-model="scalingService.name" class="col-16" auto-complete="off"></el-input>
      </el-form-item>
<!--       <el-form-item label="容量上限" prop="maxSize">
        <el-input v-model="scalingService.maxSize" auto-complete="off" class="col-16" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="容量下限" prop="minSize">
        <el-input v-model="scalingService.minSize" auto-complete="off" class="col-16" :disabled="true"></el-input>
      </el-form-item> -->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="isDisabled" @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" :disabled="isDisabled" @click="confirmUpdate">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'EditScalingService',
  props: ['scalingServiceName', 'maxSize', 'minSize', 'clusterId'],
  data() {
    return {
      scalingService: {
        name:"",
        maxSize: "",
        minSize: ""
      },
      visible: true,
      loading: false,
      isDisabled: false,
      updateNameFlag: false,
      rules: {
        name: [
          {type: 'requiredNet', trigger: 'blur change'},
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'maxSize', value: 20}
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.editScalingServiceForm);
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.visible = true;
      self.scalingService.name = this.scalingServiceName;
      self.scalingService.maxSize = this.maxSize;
      self.scalingService.minSize = this.minSize;
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    },
    confirmUpdate() {
      var self = this;
      var nameData = {
        "cluster":{
          "name": self.scalingService.name
        }
      };
      try {
        self.$refs.editScalingServiceForm.validate((valid) => {
          if (valid) {
            self.loading = true;
            self.isDisabled = true;
            self.$ajax({
              type: 'PATCH',
              url: "api/senlin/v1/clusters/"+self.clusterId,
              data: JSON.stringify(nameData),
              successMsg:this.$t('scalingService.sendApplySuccess'),
              log:{
                description:{
                  en:"rename scalingService'" + self.scalingServiceName + "' to'" + self.scalingService.name +"'",
                  zh_cn:"修改伸缩服务的名称'" + self.scalingServiceName + "' 为'" + self.scalingService.name+"'"
                },
                target:Vue.logTarget.ScalingService
              },
              successFun: () => {
                //self.loading = false;
                //self.updateNameFlag = true;
                //self.$emit("handleShow", {});
                //self.$emit("delayRefreshData");
                setTimeout( function() {
                  self.loading = false;
                  self.isDisabled = false;
                  self.$emit("handleShow", {});
                  self.$emit("refreshData");
                }, 5000);
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