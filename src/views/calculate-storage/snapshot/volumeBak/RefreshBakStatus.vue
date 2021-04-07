<template>
  <el-dialog :title="$t('storage.refreshStatus')" :visible.sync="visible" :before-close="hide" v-dialogDrag>
    <el-form ref="refreshBakStatusForm" label-width="100px">
      <el-form-item :label="$t('storage.selectStatus')" prop="status">
       <el-select v-model="status">
       <el-option v-for="item in volumeBakStatusList" :key="item.id" :label="item.name" :value="item.id"></el-option>
       </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"refreshBakStatus",
  props: ["bakId", "backName"],
  data() {
    return {
      volumeBakStatusList:[],
      status:"",
      name:"",
      visible:true,
      saving:false
    }
  },
  mounted() {
    this.initVolumeBackStatus();
  },
  methods:{
    getname(value) {
      for (var i = 0; i < this.volumeBakStatusList.length; i++) {
        var it = this.volumeBakStatusList[i];
        if (it["id"] == value) {
          return it["name"];
        }
      }
    },
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$emit("handlRestore");
    },
    async confirmFun() {
      let self = this;
          try {
            self.loading = true;
            self.saving = true;
            var reqdata = {
              "os-reset_status":{
                "status":this.status
              }
            };
            let result = await self.$ajax({
              type: "POST",
              url: 'api/cinderv3/v3/' + this.$cookie.get('pid') + "/backups/" + this.bakId + "/action",
              data: JSON.stringify(reqdata),
              errFun() {
                self.loading = false;
                self.saving = false;
              },
              errorKey: "badRequest",
              log:{
                description:{
                  en:"Set volume backup status:" + this.backName + " to type:" + self.getname(this.status),
                  zh_cn:"更新云硬盘备份:" + this.backName + " 状态为:" + self.getname(this.status)
                },
                target:Vue.logTarget.storage_volume_backup
              },
              successFun: function(data) {
              self.$message({
                showClose: true,
                message: Vue.t('storage.sendUpdateStatusSuccess'),
                type: 'info'
              });
              setTimeout(function() {
                self.loading = false;
                self.saving = false;
                self.$emit("handlRestore");
                self.$emit("onRefresh");
              }, 0);
            }
            });
          } catch (res) {
            self.saving = false;
            self.loading = false;
          }
    },
    initVolumeBackStatus() {
      this.volumeBakStatusList = [
      {"id":"available", "name":this.$t('storage.available')},
      {"id":"error", "name":this.$t('storage.error')}]
    },
    changeFlagValue() {}
  }
}
</script>