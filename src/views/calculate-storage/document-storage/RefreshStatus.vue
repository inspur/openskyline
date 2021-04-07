<template>
  <el-dialog :title="$t('storage.refreshStatus')" :visible.sync="visible">
    <el-form ref="refreshStatusForm" :model="refreshStatusForm" label-width="100px" :rules="rules">
      <el-form-item :label="$t('storage.selectStatus')" prop="status" class="is-required">
       <el-select v-model="refreshStatusForm.status">
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
  name:"refreshStatus",
  props: ["volumeTempId", "temp_volume_name"],
  data() {
    return {
      statusOptions:[{value:'available', label:this.$t('storage.available')}, {value:'error', label:this.$t('storage.error')}, {value:'error_deleting', label:this.$t('storage.errorDeleting')}, {value:'creating', label:this.$t('storage.creating')}, {value:'deleting', label:this.$t('storage.deleting')}],
      refreshStatusForm:{
        status:""
      },
      visible:false,
      saving: false,
      rules: {}
    }
  },
  mounted() {
  },
  methods:{
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    getName(value) {
      for (var i = 0; i < this.statusOptions.length; i++) {
        var it = this.statusOptions[i];
        if (it["value"] == value) {
          return it["label"];
        }
      }
    },
    async confirmFun() {
      let self = this;
      try {
        self.saving = true;
        var reqdata = {
          "reset_status":{
            "status":this.refreshStatusForm.status
          }
        };
        let result = await self.$ajax({
          type: "POST",
          url: 'api/manila/v2/' + this.$cookie.get('pid') + "/shares/" + this.volumeTempId + "/action",
          data: JSON.stringify(reqdata),
          errFun() {
            self.saving = false;
          },
          errorKey: "badRequest",
          log:{
            description:{
              en:"Set doc storage:" + this.temp_volume_name + " to status:" + self.getName(this.refreshStatusForm.status),
              zh_cn:"更新文件存储:" + this.temp_volume_name + " 状态为:" + self.getName(this.refreshStatusForm.status)
            },
            target:Vue.logTarget.storage_share
          }
        });
        self.$message({
          message: Vue.t('storage.updateSuccess'),
          type: "success"
        });
        self.saving = false;
        self.$emit("refreshStatusFun", {});
      } catch (result) {
        self.saving = false;
        self.$emit("refreshStatusFun", {});
      }
    }
  }
}
</script>