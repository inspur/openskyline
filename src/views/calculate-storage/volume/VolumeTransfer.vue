<template>
  <el-dialog :title="$t('storage.transferVol')" :visible.sync="visible" :before-close="cancelFun" v-dialogDrag>
    <el-form ref="transferVolumeForm" :model="transferVolume" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.name')" prop="name"  class="is-required">
        <el-input class="col-16" v-model="transferVolume.name" auto-complete="off" :disabled="!showConfir"></el-input>
      </el-form-item>
      <el-form-item label="ID" prop="id"  v-show="!showConfir">
        <el-input class="col-16" v-model="transferVolume.id" auto-complete="off" disabled ></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.identificationKey')" prop="authKey"  v-show="!showConfir">
        <el-input class="col-16" v-model="transferVolume.authKey" auto-complete="off" disabled></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFun" v-show="showConfir">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving" v-show="showConfir">{{$t('lang.confirm')}}</el-button>
      <el-button v-show="!showConfir" @click="downloadTransferCertFun"><i class="el-icon-fa-download"></i>{{$t('storage.downloadTransferCert')}}</el-button>
      <el-button @click="closeFun" v-show="!showConfir">{{$t('lang.close')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"transferVolume",
  props: ['vId'],
  data() {
    return {
      saving: false,
      transferVolume:{
        id:"",
        name:"",
        authKey:""
      },
      volumeName:"",
      showConfir:true,
      visible:false,
      rules:{
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 255},
          {type: 'onlyLetter_MinusNumberChinese'}
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    show() {
      this.visible = true;
      this.showConfir = true;
    },
    hide() {
      this.visible = false;
    },
    closeFun() {
      this.$emit("handleShow", {});
      this.$emit("onRefresh", {});
    },
    cancelFun() {
      this.$emit("handleShow");
      if (!this.showConfir) {
        this.$emit("onRefresh", {});
      }
    },
    //下载转让凭据-test一下能否提交代码3
    downloadTransferCertFun() {
        console.log(this.transferVolume);
        let fileContent = this.$t('lang.name') + " : " + this.transferVolume.name + '\r\n';
        fileContent = fileContent + "ID" + " : " + this.transferVolume.id + '\r\n';
        fileContent = fileContent + this.$t('storage.identificationKey') + " : " + this.transferVolume.authKey + '\r\n';
        const blob = new Blob([fileContent]);
        const fileId = this.transferVolume.id;
        const fileName = fileId + '.txt';
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
          const a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          a.style.display = 'none';
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
        }
        this.$recordLog({
          target: Vue.logTarget.storage_volume,
          level: {
            en:"info",
            zh_cn:"信息"
          },
          description: {
            en: "Download " + fileName,
            zh_cn: "下载转让凭证：" + fileName
          }
        });
    },
    confirmFun() {
      this.$refs.transferVolumeForm.validate(async(valid) => {
        if (valid) {
          this.saving = true;
          var name = this.transferVolume.name;
          if ("" == name || typeof (name) == "undefined" || null == name ) {
            this.$message({
              showClose: true,
              message: Vue.t('storage.inputTransferName'),
              type: 'warning'
            });
            this.saving = false;
            return;
          }
          var pUuid = this.$cookie.get("pid");
          let url = "api/cinderv3/v3/" + pUuid + "/os-volume-transfer";
          let type = "post";
          let msg = this.$t('storage.transferVolSuccess');
          let body = {"transfer": {"volume_id":this.vId, "name": name}};
          body = JSON.stringify(body);
          var logName = '';
          if ("" == this.volumeName || typeof (this.volumeName) == "undefined" || null == this.volumeName) {
            logName = this.vId + "(" + this.vId + ")";
          } else {
            logName = this.volumeName + "(" + this.vId + ")";
          }
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: type,
              successMsg: msg,
              log:{
                description:{
                  en:"Transfer volume:" + this.volumeName + "(" + this.vId + ")",
                  zh_cn:"转让云硬盘:" + this.volumeName + "(" + this.vId + ")"
                },
                target:Vue.logTarget.storage_volume
              }
            });
            var transfer = ret.transfer;
            this.transferVolume.id = transfer.id;
            this.transferVolume.authKey = transfer['auth_key']
            this.showConfir = false;
            this.saving = false;
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