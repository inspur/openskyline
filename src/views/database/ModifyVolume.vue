<template>
  <el-dialog
    :title="$t('db.modifyHardDisk')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    v-dialogDrag>
    <el-form
      ref="modifyVolumeForm"
      class="me-required-form"
      :model="modifyVolumeForm"
      :rules=rules 
      label-width="150px"
      v-loading="saving">
      <el-form-item :label="$t('db.currentDiskSize')" prop="currentSize">
        <span>{{modifyVolumeForm.currentSize}}</span>
      </el-form-item>
      <el-form-item :label="$t('db.diskSizeGB')" prop="volumeSize" class="is-required">
        <el-input-number class="col-12" v-model="modifyVolumeForm.volumeSize" :min="modifyVolumeForm.currentSize" :max="2000"></el-input-number>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="confirm" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "ModifyVolume",
    props:{
      dbInstanceDetail:{
        type:Object,
        default:() => {
          return {};
        }
      }
    },
    data() {
      return {
        modifyVolumeForm: {
          currentSize: 1,
          volumeSize: ''
        },
        saving:false,
        dialogVisible: false,
        rules: {
          volumeSize: [
            {type: 'required', trigger: 'blur change'},
            {type: 'integerNO000'}
          ]
        }
      }
    },
    mounted() {
       this.initDialog();
    },
    methods: {
      initDialog() {
        this.dialogVisible = true;
        this.modifyVolumeForm.currentSize = this.dbInstanceDetail.volume.size;
      },
      handleCancel() {
        this.$emit("handleAddShow", {});
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      confirm() {
        let self = this;
        this.$refs.modifyVolumeForm.validate((valid) => {
          if (valid) {
            self.saving = true;
            self.$ajax({
              type:"post",
              url:"api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + self.dbInstanceDetail.id + "/action",
              data:JSON.stringify({
                resize:{
                  volume:{
                    size:self.modifyVolumeForm.volumeSize
                  }
                }
              }),
              successMsg:this.$t('db.modifyRequestSuccessMsg'),
              log:{
                description:{
                  en:"Modify database instance:" + self.dbInstanceDetail.name + ", change volume size from " +
                    self.modifyVolumeForm.currentSize + " to " + self.modifyVolumeForm.volumeSize,
                  zh_cn:"修改数据库实例 " + self.dbInstanceDetail.name + " 的云硬盘大小，修改前:" +
                    self.modifyVolumeForm.currentSize + " 修改后:" + self.modifyVolumeForm.volumeSize
                },
                target:Vue.logTarget.databaseService
              },
              successFun:() => {
                self.saving = false;
                self.$emit("handleAddShow", {});
                self.$emit("refreshData");
              },
              errFun:() => {
                self.saving = false;
              }
            });
          } else {
            return false;
          }
        });
      }
    }
  }
</script>
<style scoped>

</style>