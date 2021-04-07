<template>
  <el-dialog :title="$t('storage.acceptTransfer')" :visible.sync="visible" :before-close="cancelFun" v-dialogDrag>
    <el-form ref="acceptTransferForm" :model="acceptTransfer" label-width="100px" label-position="left" :rules="rules">
      <el-form-item :label="$t('storage.transferID')" prop="trId"  class="is-required">
        <el-input class="col-8" v-model="acceptTransfer.trId" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.attestationkey')" prop="trkey"  class="is-required">
        <el-input class="col-8" v-model="acceptTransfer.trkey" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFun">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"acceptTransfer",
  data() {
    return {
      saving: false,
      acceptTransfer:{
        trId:"",
        trkey:""
      },
      visible:true,
      rules:{
        trId: [
          {type: 'required', trigger: 'blur change'},
          {type: 'equalTo', value: 36}
        ],
        trkey: [
          {type: 'required', trigger: 'blur change'},
          {type: 'equalTo', value: 16}
        ]
      }
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
    cancelFun() {
      this.$emit("handleShow");
    },
    confirmFun() {
      this.$refs.acceptTransferForm.validate(async(valid) => {
        if (valid) {
          this.saving = true;
          var pUuid = this.$cookie.get("pid");
          let url = "api/cinderv3/v3/" + pUuid + "/os-volume-transfer/" + this.acceptTransfer.trId + "/accept";
          let type = "post";
          let msg = this.$t('storage.acceptDiskSuccess');
          let body = {"accept": {"auth_key":this.acceptTransfer.trkey}};
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: type,
              log:{
                description:{
                  en:"accept Transfer: " + this.acceptTransfer.trId,
                  zh_cn:"接受转让:" + this.acceptTransfer.trId
                },
                target:Vue.logTarget.storage_volume
              }
              //successMsg: msg
            });
            var transfer = ret.transfer;
            var volumeId = transfer.volume_id;
            this.$message({
              showClose: true,
              message: msg,
              type: 'info'
            });
            this.$emit("handleShow", {});
            this.$emit("onRefresh", {});
          } catch (data) {
            this.saving = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    }
  }
}
</script>