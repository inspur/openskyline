<template>
  <el-dialog :title="$t('storage.makeTempUrl')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
      <el-form ref="createCatalogForm" :model="generateForm" label-width="120px" v-loading="loading">
        <el-form-item :label="$t('storage.tempUrlValidPeriod')">
          <el-select v-model="generateForm.days" placeholder="$t('storage.validDay')" size="5" @change="validTimeStamp">
            <el-option v-for=" (d,index) in 366"
              :key = "index"
              :label = "index"
              :value = "index"></el-option>
          </el-select>
          <span>{{$t('storage.validDay')}}</span>
          <el-select v-model="generateForm.hours" placeholder="$t('storage.validHour')" size="5" @change="validTimeStamp">
            <el-option v-for=" (d,index) in 24"
              :key = "index"
              :label = "index"
              :value = "index"></el-option>
          </el-select>
          <span>{{$t('storage.validHour')}}</span>
          <el-select v-model="generateForm.minutes" placeholder="$t('storage.validMinute')" size="5" @change="validTimeStamp">
            <el-option v-for=" (d,index) in 60"
              :key = "index"
              :label = "index"
              :value = "index"></el-option>
          </el-select>
          <span>{{$t('storage.validMinute')}}</span>
          <el-select v-model="generateForm.secondes" placeholder="$t('storage.validSecond')" size="5" @change="validTimeStamp">
            <el-option v-for=" (d,index) in 60"
              :key = "index"
              :label = "index"
              :value = "index"></el-option>
          </el-select>
          <span>{{$t('storage.validSecond')}}</span>
          <!-- <el-time-picker v-model="generateForm.time" placeholder="有效期时分秒" @change="validTimeStamp"></el-time-picker> -->
        </el-form-item>
        <el-form-item :label="$t('storage.tempUrl')">
          <span class="tempUrl">{{generateForm.tempUrl}}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="genFun" :loading="loading" :disabled="confirmFlag">{{$t('storage.generateUrl')}}</el-button>
        <el-button :disabled="copyFlag" type="primary" v-clipboard:copy="generateForm.tempUrl" v-clipboard:success="onCopy" v-clipboard:error="onError">{{$t('calcStorLang.pasteContent')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import VueClipboard from 'vue-clipboard2';
  import AWS from 'aws-sdk';
  Vue.use(VueClipboard);
  const Base64 = require('js-base64').Base64;
export default {
  name: "GenerateUrl",
  props: ['bucketName', 'fileName', 'fullPath'],
  data() {
    return {
      generateForm: {
        days: 0,
        hours: 0,
        minutes: 0,
        secondes: 0,
        time: new Date( 0, 0, 0),
        timeStamp: "",
        secondesTotal: "",
        tempUrl: ""
      },
      ak: "",
      sk: "",
      confirmFlag: false,
      copyFlag: true,
      loading: false,
      pid:  this.$cookie.get("pid"),
      visible: true,
      aclFlag: false
    }
  },
  mounted() {
    this.getAkSk();
    this.validTimeStamp();
  },
  methods: {
    validTimeStamp() {
      let self = this;
      if (self.generateForm.days == 0 && self.generateForm.hours == 0 &&
      self.generateForm.minutes == 0 && self.generateForm.secondes == 0 ) {
        self.confirmFlag = true;
      } else {
        self.confirmFlag = false;
      }
    },
    genFun() {
      let self = this;
      let utcDate = new Date();
      utcDate = utcDate.toUTCString().replace("GMT", "+0000");
      let mills = new Date().getTime()/1000
      let current = self.generateForm.days*24*3600+self.generateForm.hours*3600+self.generateForm.minutes*60+self.generateForm.secondes;
      let timeStamp = (mills+current).toFixed(0)
      let resource = encodeURI("/"+self.bucketName+"/"+self.fullPath+self.fileName);
      let stringToSign = `GET\n\n\n${timeStamp}\n${resource}`;
      let signnature = AWS.util.crypto.hmac(self.sk, stringToSign, 'base64', 'sha1');
      let encodeFileName = encodeURIComponent(self.fileName)
      let encodesignnature = encodeURIComponent(signnature)
      self.getIpandPort(timeStamp, encodesignnature, resource);
      self.copyFlag = false;
      self.$recordLog({
          target:Vue.logTarget.storage_object_storage,
          level:{
            en:"info",
            zh_cn:"信息"
          },
          description:{
            en:"In the bucket of " + self.bucketName + "'s catalog: root/"+self.fullPath+",generate the"+self.fileName+"'s temporary url:"+this.generateForm.tempUrl,
            zh_cn:"在存储桶(" + self.bucketName + ")的目录： 根目录/"+self.fullPath+"  生成文件:"+self.fileName+"的临时url链接:"+this.generateForm.tempUrl
          }
        });
    },
    async getIpandPort(timeStamp, signnature, resource) {
      let ipport = Vue.service['S3'];
      this.generateForm.tempUrl = ipport+resource+"?AWSAccessKeyId="+this.ak+"&Expires="+timeStamp+"&Signature="+signnature;
    },
    async getAkSk() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: `api/keystone/v3/users/${Vue.userId}/credentials/OS-EC2`,
          showErrMsg: true
        });
        let credentials = result["credentials"];
        let noAkSK = true;
        for (let i = 0; i < credentials.length; i++) {
          let credential = credentials[i];
          if (Vue.userId === credential["user_id"] && this.$cookie.get("pid") === credential["tenant_id"]) {
            noAkSK = false;
            this.ak = credential["access"];
            this.sk = credential["secret"];
            break;
          }
        };
      } catch (res) {
        self.loading = false;
      }
    },
    onCopy() {
      var self = this;
      self.$message({
        showClose: true,
        message: Vue.t('calcStorLang.copySuccess'),
        type: 'info'
      });
    },
    onError() {
      var self = this;
      self.$message.error( Vue.t('calcStorLang.copyFailed'));
    },
    copyKey() {
      self.$message({
        showClose: true,
        message: Vue.t('calcStorLang.copySuccess'),
        type: 'info'
      });
    },
    handleClose() {
       this.$emit("handleGenerateUrlShow", {});
    },
    aclroleRender(val) {
      if (val == "READ") {
        return Vue.t('storage.commonRead');
      } else if (val == "FULL_CONTROL") {
        return Vue.t('storage.FULL_CONTROL');
      } else {
        return val;
      }
    }
  }
}
</script>
<style>
 .tempUrl{
  word-wrap: break-word;
 }
</style>