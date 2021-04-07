<template>
  <div>
    <el-dialog :title="$t('base.confirm')" :visible.sync="visible" :before-close="cancel" v-dialogDrag size="tiny">
      <el-row>
        <el-col :span="24"><span>{{$t('lang.ifDeleteData')}}</span></el-col>
        <el-col :span="24">
          <el-form ref="confirmForm" :model="confirmForm" :rules="rules" class="margin-tb20 me-required-form"  label-width="200px">
            <el-form-item label="" prop="confirmInput" style="margin-left:-200px;">
              <el-input class="col-18" v-model="confirmForm.confirmInput" auto-complete="off" @change="inputChange"></el-input>
            </el-form-item>
            <el-form-item :label="$t('container.deleteContainerDisk')" prop="deleteDisk" style="margin-bottom:-20px;">
              <el-checkbox v-model="confirmForm.deleteDisk"></el-checkbox>
              <el-tooltip placement="right-start">
                <div slot="content">{{$t('container.deleteDiskNote')}}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button @click="submitForm" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "ConfirmDialog",
  props: ["selectedRows"],
  data() {
    var validateInput = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(Vue.t('validation.required')));
      }
      let reg = /^YES$|^NO$/i;
      if (reg.test(value)) {
        callback();
      } else {
         return callback(new Error(Vue.t('lang.onlyAcceptYesOrNo')));
      }
    };
    return {
      saving: false,
      confirmForm: {
        confirmInput: 'NO',
        deleteDisk: false
      },
      visible: true,
      rules: {
        confirmInput: [
          { type: 'required', trigger: 'blur change' },
          { validator: validateInput, trigger: 'blur change' }
        ]
      }
    };
  },
  mounted() {
  },
  methods: {
    submitForm() {
      this.$refs.confirmForm.validate(async valid => {
        if (valid) {
          try {
            let self = this;
            let value = self.confirmForm.confirmInput;
            if ("yes" == value.toLowerCase()) {
              self.saving = true;
              let url = 'api/cetus/v1/cluster/{uuid}'
              if (self.confirmForm.deleteDisk) {
                url += '?delete_volume=true'
              }
              self.$sequence({
                type: 'delete',
                url: url,
                params: self.selectedRows,
                log:{
                  description:{
                    en:"Delete Kubernetes cluster:{name}",
                    zh_cn:"删除Kubernetes集群:{name}"
                  },
                  target:Vue.logTarget.containerCluster
                },
                successFun: function() {
                  self.saving = false;
                  self.$message.success(self.$t('container.deleteRequest'));
                  setTimeout(() => { self.$emit("refreshData", true); }, 8000);
                  self.$emit("handleAddShow", {});
                },
                error: function() {
                  self.saving = false;
                  self.$emit("refreshData", {});
                }
              })
            }
            this.$emit("refreshData", {});
          } catch (data) {
            __DEV__ && console.error(data);
          }
        }
      });
    },
    cancel() {
      this.$emit("handleAddShow", {});
    },
    inputChange() {
      this.confirmForm.confirmInput = this.confirmForm.confirmInput.toUpperCase();
    }
  }
};
</script>
