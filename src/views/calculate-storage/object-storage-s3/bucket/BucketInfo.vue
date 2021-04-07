<template>
  <el-dialog :title="$t('calcStorLang.detail')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <ul class="kv_list">
      <li class="kv" v-for="item in KVList" v-bind:key="item.label">
        <span class="k">{{item.label}}</span>
        <span class="v">{{item.value}}</span>
      </li>
    </ul>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('lang.close')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
import AWS from 'aws-sdk';
const Base64 = require('js-base64').Base64;
export default {
  name:"BucketInfo",
  props: ['bucketName'],
  data() {
    return {
      KVList:[],
      loading: false,
      visible:true,
      ipport:"",
      pid:  this.$cookie.get("pid")
    }
  },
  mounted() {
    this.headBucketFun();
  },
  methods:{
    handleClose() {
      this.$emit("handleBucketInfoShow", {});
    },
    headBucketFun(result) {
      let self = this;
      self.loading = true;
      let params = {
        Bucket: self.bucketName
      };
      let request = Vue.s3.headBucket(params);
      request.on('complete', function(reponse) {
        let {error, httpResponse} = reponse;
        if (error) {
          if (error.code === "NotFound") {
            self.$message.error(self.$t("storage.S3_BUCKET_NOTEXISTED"));
          } else {
            self.$message.error(self.$t("storage.S3_BUCKETINFO_QUERYFAILED"));
          }
        } else {
          if (httpResponse) {
            let header = httpResponse.headers;
            self.KVList = [
              {label: self.$t('lang.usedStor'), value: self.sizeRender(header["x-rgw-bytes-used"])}
            ];
            self.getBucketsQuota();
            self.getAclState();
          }
        }
      });
      request.send();
    },
    async getBucketsQuota() {
      let utcDate = new Date();
      utcDate = utcDate.toUTCString().replace("GMT", "+0000");
      let stringToSign = `GET\n\napplication/json\n\nx-amz-date:${utcDate}\n/admin/bucket`;
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
        url: `api/S3/admin/bucket?quota=true&uid=${uid}&bucket=${this.bucketName}`,
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
      let bucketquota = s3result["bucket_quota"];
      let usage = s3result["usage"];
      let bucketNums = 0;
      if (usage["rgw.main"]) {
        if (usage["rgw.multimeta"]) {
          bucketNums = parseInt(usage["rgw.main"]["num_objects"]) + parseInt(usage["rgw.multimeta"]["num_objects"]);
        } else {
          bucketNums = parseInt(usage["rgw.main"]["num_objects"]);
        }
      }
      if (usage["rgw.multimeta"]) {
        if (usage["rgw.main"]) {
        } else {
          bucketNums = parseInt(usage["rgw.multimeta"]["num_objects"]);
        }
      }
      this.KVList.push(
        {label: this.$t('lang.objNum'), value: bucketNums}
      )
      if (bucketquota["enabled"] == true) {
        this.KVList.push(
          {label: this.$t('storage.bucketsPeie'), value: Vue.t('container.open')}
        )
        if (bucketquota["max_objects"] == -1) {
          this.KVList.push(
            {label: Vue.t('storage.objectNums'), value: Vue.t('base.unlimited'), key: Vue.t('storage.objectNums')}
          )
        } else {
          this.KVList.push(
            {label: Vue.t('storage.objectNums'), value: bucketquota["max_objects"] + ''}
          )
        }
        if (bucketquota["max_size_kb"] == -1) {
          this.KVList.push(
            {label: this.$t('storage.objectCapacity'), value:Vue.t('base.unlimited'), key: Vue.t('storage.objectCapacity')}
          )
        } else {
          let size = 0;
          if (String(bucketquota["max_size_kb"]/1024/1024).indexOf(".") > -1) {
            size = parseInt(bucketquota["max_size_kb"]/1024) + "MB";
          } else {
            size = parseInt(bucketquota["max_size_kb"]/1024/1024) + "GB";
          }
          this.KVList.push(
            {label: this.$t('storage.objectCapacity'), value:size}
          )
        }
      } else {
        this.KVList.push(
          {label: this.$t('storage.bucketsPeie'), value: Vue.t('container.close')}
        )
      }
    },
    getAclState() {
      let self = this;
      let params = {
        Bucket: self.bucketName
      };
      Vue.s3.getBucketAcl(params, function(err, data) {
        if (err) {
           console.log(err, err.stack);
        } else {
          let grants = data["Grants"];
          let alluserFlag = false;
          let permission = "";
          for (let k in grants) {
            let acl = grants[k];
            if (acl["Grantee"].hasOwnProperty("URI") && acl["Grantee"]["URI"].indexOf("global/AllUsers") > -1) {
              permission += acl["Permission"];
              alluserFlag = true;
            }
          }
          let perm = "";
          if (!alluserFlag) {
             perm = "私有读写";
          } else {
            if (permission == "READWRITE" || permission == "WRITEREAD") {
              perm = "公有读写";
            } else {
              perm = "公有读";
            }
          }
          self.KVList.push(
            {label: "ACL", value: perm}
          )
          if (alluserFlag) {
            self.getIpandPort();
          }
        }
      });
    },
    async getIpandPort() {
      this.ipport = Vue.service['S3'];
      this.KVList.push(
        {label: "公共URL", value: this.ipport+"/"+this.pid+":"+this.bucketName}
      )
    },
    sizeRender(value) {
      if (!value) {
        return "-";
      }
      value = value * 1;
      let sizes = ["Bytes", "KB", "MB", "GB", "TB", "YB"];
      let num = 0;
      while (value >= 1024) {
        value = value / 1024;
        num++;
      }
      return value.toFixed(2) + " " + sizes[num];
    }
  }
}
</script>
<style scoped>
.kv_list{
  display: flex;
  flex-direction: column;
}
.kv {
  display: flex;
  flex-direction: row;
  margin: 10px;
}
.k {
  font-size: 14px;
  line-height: 1;
  width: 120px;
  font-weight: 600;
}
.v {
  font-size: 14px;
  line-height: 1;
}
</style>

