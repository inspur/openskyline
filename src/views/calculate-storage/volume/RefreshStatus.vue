<template>
  <el-dialog :title="$t('storage.refreshStatus')" :visible.sync="visible" v-dialogDrag>
    <el-form ref="refreshStatusForm" :model="refreshStatusForm" label-width="100px" :rules="rules">
      <el-form-item :label="$t('storage.selectStatus')" prop="status">
       <el-select v-model="refreshStatusForm.status">
       <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
       </el-select>
       <el-tooltip placement="top" trigger="hover" :content="$t('storage.VOLUME_REFRESH_STATUS_TIPS')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('storage.resetCloudDiskMigrateStatus')"  label-width="160px">
        <el-switch v-model ="migration_status" :on-text="$t('base.yes')" :off-text="$t('base.no')" @change="changeMigrationStatus"></el-switch>
        <el-tooltip placement="top" trigger="hover" :content="$t('storage.RESET_VOLUME_MIGRATE_STATUS_TIPS')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
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
  name:"refreshStatus",
  props: ["volumeTempId", "temp_volume_name"],
  data() {
    return {
      saving: false,
      migration_status:false,
      statusOptions:[{value:'available', label:this.$t('storage.available')}, {value:'error', label:this.$t('storage.error')}, {value:'error_deleting', label:this.$t('storage.errorDeleting')}, {value:'in-use', label:this.$t('storage.inUsing')}, {value:'creating', label:this.$t('storage.creating')}, {value:'attaching', label:this.$t('storage.installing')}, {value:'deleting', label:this.$t('storage.deleting')}, {value:'detaching', label:this.$t('storage.uninstaling')}],
      refreshStatusForm: {
        status:""
      },
      size:2,
      visible:false,
      rules: {
        status: [
          {type: 'required'}
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
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
    changeMigrationStatus(value) {
      this.migration_status = value;
    },
    confirmFun() {
      let self = this;
      self.$refs.refreshStatusForm.validate(async(valid) => {
        if (valid) {
          try {
            self.saving = true;
            var reqdata = {
              "os-reset_status":{
                "status":this.refreshStatusForm.status
              }
            };
            let enlog = "Set cloud disk:" + this.temp_volume_name + " to type:" + self.getname(this.refreshStatusForm.status);
            let cnlog = "更新云硬盘:" + this.temp_volume_name + " 状态为:" + self.getname(this.refreshStatusForm.status);
            if (this.migration_status) {
              reqdata = {
              "os-reset_status":{
                "status":this.refreshStatusForm.status,
                "migration_status":"none"
              }
            };
              enlog = "Set cloud disk:" + this.temp_volume_name + " to type:" + self.getname(this.refreshStatusForm.status) + ", and reset migration status. ";
              cnlog = "更新云硬盘:" + this.temp_volume_name + " 状态为:" + self.getname(this.refreshStatusForm.status) + ",并重置迁移状态";
            }
            let result = await self.$ajax({
              type: "POST",
              url: 'api/cinderv3/v3/' + this.$cookie.get('pid') + "/volumes/" + this.volumeTempId + "/action",
              data: JSON.stringify(reqdata),
              errFun() {
                self.saving = false;
                self.isDisabled = false;
              },
              errorKey: "badRequest",
              log:{
                description:{
                  en:enlog,
                  zh_cn:cnlog
                },
                target:Vue.logTarget.storage_volume
              }
            });
            self.$message({
              message: Vue.t('storage.updateSuccess'),
              type: "success"
            });
            self.saving = false;
            self.$emit("refreshStatusFun", {});
          } catch (res) {
            self.isDisabled = false;
            self.saving = false;
          }
          return true;
        } else {
          return false;
        }
      });
    },
    changeFlagValue() {}
  }
}
</script>