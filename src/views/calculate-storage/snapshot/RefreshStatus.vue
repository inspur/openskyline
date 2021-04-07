<template>
  <el-dialog
  :title="$t('storage.refreshStatus')" :visible.sync="visible">
    <el-form ref="editStatusForm" :model="editStatusForm" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.status')" prop="status">
       <el-select v-model="editStatusForm.status">
       <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
       </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'RefreshStatus',
  props: ["volumSoltId", "volumSoltName"],
  data() {
    return {
      saving: false,
      editStatusForm: {
        status:""
      },
      visible: false,
      statusOptions:[{value:'available', label:this.$t('storage.available')}, {value:'creating', label:this.$t('storage.creating')}, {value:'deleting', label:this.$t('storage.deleting')}, {value:'error', label:this.$t('storage.error')}, {value:'error_deleting', label:this.$t('storage.errorDeleting')}],
      rules: {
        status: [
          {type: 'required'}
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.editStatusForm);
  },
  methods: {
    getname(value) {
      for (var i = 0; i < this.statusOptions.length; i++) {
        var it = this.statusOptions[i];
        if (it["value"] == value) {
          return it["label"];
        }
      }
    },
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      let self = this;
      self.$refs.editStatusForm.validate(async(valid) => {
        if (valid) {
          try {
            self.saving = true;
            var reqdata = {
              "os-reset_status":{
                "status":this.editStatusForm.status
              }
            };
            let result = await self.$ajax({
              type: "POST",
              url: 'api/cinderv3/v3/' + this.$cookie.get('pid') + "/snapshots/" + this.volumSoltId + "/action",
              data: JSON.stringify(reqdata),
              errFun() {
                self.saving = false;
                self.isDisabled = false;
              },
              errorKey: "badRequest",
              log:{
                description:{
                  en:"Set cloud disk snapshot:" + this.volumSoltName + " to type:" + self.getname(this.editStatusForm.status),
                  zh_cn:"更新云硬盘快照:" + this.volumSoltName + " 状态为:" + self.getname(this.editStatusForm.status)
                },
                target:Vue.logTarget.storage_volume_snapshot
              }
            });
            self.$message({
              message: Vue.t('storage.updateSuccess'),
              type: "success"
            });
            self.saving = false;
            self.$emit("handleShow", {});
            self.$emit("onRefresh", {});
          } catch (res) {
            self.isDisabled = false;
            self.saving = false;
          }
          return true;
        } else {
          return false;
        }
      });
    }
  }
}
</script> 