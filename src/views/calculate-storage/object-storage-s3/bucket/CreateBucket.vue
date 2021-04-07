<template>
  <el-dialog :title="$t('lang.createContainer')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="createBucketForm" :model="createBucket" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="createBucket.name" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose" :disabled="isDisabled">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="isDisabled">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
import AWS from 'aws-sdk';
const Base64 = require('js-base64').Base64;
export default {
  name:"createBucket",
  data() {
    return {
      createBucket:{
        name:""
      },
      isDisabled: false,
      BucketsData: [],
      visible:true,
      hasSameBucketFlag: "",
      maxBuckets: 0,
      pid:  this.$cookie.get("pid"),
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'bucketNameRuleForS3'},
          {type: 'maxSize', value: 255},
          {type: 'minSize', value: 3}
        ]
      }
    }
  },
  mounted() {
    this.initData();
  },
  methods:{
    handleClose(done) {
      this.$emit("handleAddShow");
    },
    async initData() {
      let utcDate = new Date();
      utcDate = utcDate.toUTCString().replace("GMT", "+0000");
      let stringToSign = `GET\n\napplication/json\n\nx-amz-date:${utcDate}\n/admin/user`;
      if (!Vue.S3SuperUser || !Vue.S3SuperUser.ak || !Vue.S3SuperUser.sk) {
        throw new Error("please config the ak and sk of S3SuperUser");
      }
      let ak = Vue.S3SuperUser.ak.trim();
      let sk = Vue.S3SuperUser.sk.trim();
      sk = Base64.decode(sk);
      let singnature = AWS.util.crypto.hmac(sk, stringToSign, 'base64', 'sha1');
      let uid = this.pid + "$" + this.pid;
      let option = {
        type: 'GET',
        url: `api/S3/admin/user?quota=true&uid=${uid}&quota-type=user`,
        showErrMsg: false,
        headers: {
          "x-amz-date" : utcDate,
          "Authorization" : "AWS " + ak + ":" + singnature,
          'Content-Type': "application/json"
        },
        errFun() {
        }
      }
      let s3result = await this.$ajax(option);
      this.maxBuckets = s3result["max_buckets"];
    },
    createBucketFun() {
      let self = this;
      this.isDisabled = true;
      let name = self.createBucket.name;
      let log = {
        description:{
          en:"Create container:" + name,
          zh_cn:"创建存储桶:" + name
        },
        target:Vue.logTarget.storage_object_storage
      };
      // 创建桶 - S3
      Vue.s3.createBucket({
        Bucket: name
      }, function(err, data) {
        if (err) {
          self.isDisabled = false;
          self.$recordLog({
            target: log.target,
            level: {
              en:"error",
              zh_cn:"错误"
            },
            description: log.description
          })
          if (err.stack.indexOf('TooManyBuckets') > -1) {
            self.$message.error(Vue.t('storage.ExceedQuota'));
          } else {
            self.$message.error(Vue.t("lang.createBucketFailed"));
          }
        } else {
          self.$recordLog({
            target: log.target,
            level:{
              en:"info",
              zh_cn:"信息"
            },
            description: log.description
          });
          self.isDisabled = false;
          self.$message(Vue.t("storage.createContainerSuccess"));
          self.successFunction();
        }
      });
    },
    async confirmFun() {
      this.$refs.createBucketForm.validate(async(valid) => {
        if (valid) {
          let self = this;
          let name = self.createBucket.name;
          //查询是否存在重名桶
          Vue.s3.headBucket({
            Bucket: name
          }, function(err, data) {
            if (err) {
              self.createBucketFun();
            } else {
              self.$message.error(Vue.t("storage.thereHasSameNameContainer"));
            }
          });
        } else {
          return false;
        }
      });
    },
    successFunction() {
      let self = this;
      self.$emit("handleAddShow", {});
      self.$emit("onAddRefresh", {});
    },
    changeFlagValue() {}
  }
}
</script>