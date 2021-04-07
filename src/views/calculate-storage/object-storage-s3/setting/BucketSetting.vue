<template>
  <div class="tableCSS">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{$t('storage.bucketsPeie')}}</span>
      </div>
      <el-form ref="createCatalogForm" :model="createCatalog" label-width="140px" :rules="rules" v-loading="loading1">
        <el-form-item :label="$t('storage.currentState')">
          <el-switch v-model="createCatalog.enabled" :on-text="$t('container.open')" :off-text="$t('container.close')" @change="quotaEnableChange"></el-switch>
        </el-form-item>
        <el-form-item :label="$t('storage.objectNums')" prop="max_objects" class="is-required" v-if="createCatalog.enabled">
          <el-input-number v-model="createCatalog.max_objects" :min="1" :max="99999999" class="col-4"></el-input-number>
          <el-tooltip effect="dark">
            <div slot="content">{{$t('base.optionalRange')+':'+"1~99999999"}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
          <!-- <el-checkbox v-model="flag1" v-if="flag1Flg">{{$t('base.unlimited')}}</el-checkbox> -->
        </el-form-item>
        <el-form-item :label="$t('storage.objectCapacity')" prop="max_size_kb" class="is-required" v-if="createCatalog.enabled">
          <el-input-number v-model="createCatalog.max_size_kb" :min="1" :max="maxsizekb" class="col-4"></el-input-number>
          <el-select v-model="sizeunit" @change="unitChange" style="width:80px;">
            <el-option label="GB" value="GB"></el-option>
            <el-option label="MB" value="MB"></el-option>
          </el-select>
          <el-tooltip effect="dark">
            <div slot="content">{{$t('base.optionalRange')+':'+"1~99999GB"}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
          <!-- <el-checkbox v-model="flag2" v-if="flag2Flg">{{$t('base.unlimited')}}</el-checkbox> -->
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{$t('storage.bucketACLSet')}}</span>
      </div>
      <el-form ref="aclForm" :model="aclForm" label-width="140px" v-loading="loading2">
        <el-form-item :label="$t('storage.commonJust')">
          <el-radio-group v-model="aclForm.aclPermission" @change="aclChange">
            <el-radio label="FULL_CONTROL">{{$t('storage.FULL_CONTROL')}}</el-radio>
            <el-radio label="READ">{{$t('storage.commonRead')}}</el-radio>
            <el-radio label="READWRITE">{{$t('storage.READWRITE')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('storage.publicUrl')" v-if="aclFlag">
          <span>{{aclForm.commonUrl}}</span>
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="setAclFun">{{$t('lang.confirm')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import AWS from 'aws-sdk';
const Base64 = require('js-base64').Base64;
export default {
  name:"BucketSet",
  data() {
    return {
      createCatalog: {
        max_objects: 1,
        max_size_kb: 1,
        quota_objects: 0,
        quota_size_kb: 0,
        enabled: true
      },
      s3objStore: {
        max_objects: 0,
        max_size_kb: 0
      },
      aclForm: {
        aclPermission: "FULL_CONTROL",
        sid: "",
        commonUrl: ""
      },
      sizeunit:"MB",
      flag1: false,
      flag2: false,
      flag1Flg: true,
      flag2Flg: true,
      loading1: false,
      loading2: false,
      aclFlag: false,
      bucketName:"",
      pid:  this.$cookie.get("pid"),
      rules: {
        max_objects: [
          {type: 'integer'}
        ],
        max_size_kb: [
          {type: 'integer'}
        ]
      },
      maxsizekb: 99999*1024
    }
  },
  mounted() {
    this.bucketName = this.$route.params.bucketName;
    this.getObjectStorageQuota();
    this.getAclState();
  },
  methods:{
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
      this.loading1 = true;
      let s3result = await this.$ajax(option);
      this.loading1 = false;
      let bucketquota = s3result["bucket_quota"] || {};
      this.createCatalog.enabled = bucketquota["enabled"];
      // this.flag1Flg = this.s3objStore.max_objects <= 0;
      if (bucketquota["max_objects"] == -1) {
        // this.flag1 = this.s3objStore.max_objects <= 0;
        this.createCatalog.max_objects = this.s3objStore.max_objects > -1?this.s3objStore.max_objects:99999999;
      } else {
        this.createCatalog.max_objects = bucketquota["max_objects"];
      }
      // this.flag2Flg = this.s3objStore.max_size_kb <= 0;
      if (bucketquota["max_size_kb"] == -1) {
        this.flag2 = this.s3objStore.max_size_kb <= 0;
        if (String(bucketquota["max_size_kb"]/1024/1024).indexOf(".") > -1) {
          this.createCatalog.max_size_kb = this.s3objStore.max_size_kb > -1?parseInt(this.s3objStore.max_size_kb/1024):99999*1024;
          this.sizeunit = "MB";
          this.maxsizekb = 99999*1024;
        } else {
          this.createCatalog.max_size_kb = this.s3objStore.max_size_kb > -1?parseInt(this.s3objStore.max_size_kb/1024/1024):99999;
          this.sizeunit = "GB";
          this.maxsizekb = 99999;
        }
      } else {
        if (String(bucketquota["max_size_kb"]/1024/1024).indexOf(".") > -1) {
          this.createCatalog.max_size_kb = parseInt(bucketquota["max_size_kb"]/1024);
          this.sizeunit = "MB";
          this.maxsizekb = 99999*1024;
        } else {
          this.createCatalog.max_size_kb = parseInt(bucketquota["max_size_kb"]/1024/1024);
          this.sizeunit = "GB";
          this.maxsizekb = 99999;
        }
      }
    },
    async getObjectStorageQuota() {
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
      this.s3objStore.max_objects = s3result["max_objects"];
      this.s3objStore.max_size_kb = s3result["max_size_kb"];
      this.getBucketsQuota();
    },
    quotaEnableChange(val) {
    },
    confirmFun() {
      // if (this.flag1) {
      //   this.createCatalog.max_objects = 1; // 防止校验出错
      // }
      // if (this.flag2) {
      //   this.createCatalog.max_size_kb = 1; // 防止校验出错
      // }
      this.$refs.createCatalogForm.validate(async(valid) => {
        if (valid) {
          let self = this;
          let maxobject = -1;
          let maxsizekb = -1;
          let utcDate = new Date();
          utcDate = utcDate.toUTCString().replace("GMT", "+0000");
          let stringToSign = `PUT\n\napplication/json\n\nx-amz-date:${utcDate}\n/admin/bucket`;
          if (!Vue.S3SuperUser || !Vue.S3SuperUser.ak || !Vue.S3SuperUser.sk) {
            throw new Error("please config the ak and sk of S3SuperUser");
          }
          let ak = Vue.S3SuperUser.ak.trim();
          let sk = Vue.S3SuperUser.sk.trim();
          sk = Base64.decode(sk);
          let singnature = AWS.util.crypto.hmac(sk, stringToSign, 'base64', 'sha1');
          let uid = this.pid + "$" + this.pid;
          if (self.createCatalog.enabled) {
            maxsizekb = self.createCatalog.max_size_kb;
            maxobject = self.createCatalog.max_objects;
            if (self.s3objStore.max_objects > -1) {
              if (maxobject > self.s3objStore.max_objects) {
                this.$message.error({
                  message: Vue.t('storage.bucketquotaTip1')
                });
                return;
              }
            }
            if (self.sizeunit == "MB") {
              maxsizekb = maxsizekb*1024;
            } else {
              maxsizekb = maxsizekb*1024*1024;
            }
            if (self.s3objStore.max_size_kb > -1) {
              if (maxsizekb > self.s3objStore.max_size_kb) {
                self.$message.error({
                  message: Vue.t('storage.bucketquotaTip2')
                });
                return;
              }
            }
            // if (this.flag1) {
            //   maxobject = -1;
            // }
            // if (this.flag2) {
            //   maxsizekb = -1;
            // }
          } else {
            maxobject = -1;
            maxsizekb = -1;
          }
          self.loading1 = true;
          let option = {
            type: 'PUT',
            url: `api/S3/admin/bucket?quota=true&uid=${uid}&bucket=${this.bucketName}&max-objects=${maxobject}&max-size-kb=${maxsizekb}&enabled=${this.createCatalog.enabled}`,
            regionId: "",
            showErrMsg: false,
            headers: {
              "x-amz-date" : utcDate,
              "Authorization" : "AWS " + ak + ":" + singnature,
              'Content-Type': "application/json"
            },
            log: {
              target: Vue.logTarget.storage_object_storage,
              description: {
                en: `In the bucket(${self.bucketName}),set quota`,
                zh_cn: `存储桶(${self.bucketName})设置配额`
              }
            },
            successMsg: self.$t('base.saveSuccess'),
            successFun: function() {
              self.loading1 = false;
            },
            errFun: function() {
              self.loading1 = false;
            }
          }
          Vue.regionList.forEach(async (region) => {
            if (Vue.regionServices[region.region_id]["S3"]) {
              option.regionId = region.region_id;
              await self.$ajax(option);
            }
          })
        }
      });
    },
    unitChange(val) {
      if (val == "MB") {
        this.maxsizekb = 99999*1024;
      } else {
        this.maxsizekb = 99999;
        if (this.createCatalog.max_size_kb > this.maxsizekb) {
          this.createCatalog.max_size_kb = this.maxsizekb
        }
      }
    },
    getAclState() {
      let self = this;
      let params = {
        Bucket: self.bucketName
      };
      self.loading2 = true;
      Vue.s3.getBucketAcl(params, function(err, data) {
        if (err) {
          self.loading2 = false;
           console.log(err, err.stack);
        } else {
          self.loading2 = false;
          let grants = data["Grants"];
          let owner = data["Owner"];
          self.aclForm.sid = owner["ID"];
          let alluserFlag = false;
          let permission = "";
          for (let k in grants) {
            let acl = grants[k];
            if (acl["Grantee"].hasOwnProperty("URI") && acl["Grantee"]["URI"].indexOf("global/AllUsers") > -1) {
              permission += acl["Permission"];
              alluserFlag = true;
            }
          }
          if (!alluserFlag) {
             self.aclForm.aclPermission = "FULL_CONTROL";
             self.aclFlag = false;
          } else {
            if (permission == "READWRITE" || permission == "WRITEREAD") {
              self.aclForm.aclPermission = "READWRITE";
            } else {
              self.aclForm.aclPermission = "READ";
            }
            self.aclFlag = true;
            self.getIpandPort();
          }
        }
      });
    },
    setAclFun() {
      let self = this;
      let grantStr = "uri=http://acs.amazonaws.com/groups/global/AllUsers";
      let params = {
        Bucket: self.bucketName,
        GrantFullControl: "id="+self.aclForm.sid
      };
      if (self.aclForm.aclPermission == "READ") { // 公有读
        params["GrantRead"] = grantStr;
        self.$confirm(self.$t('storage.ALC_NOTE1'), self.$t('base.prompt'), {
          confirmButtonText: self.$t('base.confirm'),
          cancelButtonText: self.$t('base.cancel'),
          type: 'warning'
        }).then(async() => {
          self.setAclRealFun(params);
        }).catch(async() => {
        });
      } else if (self.aclForm.aclPermission == "READWRITE") { // 公有读写
        params["GrantWrite"] = grantStr;
        params["GrantRead"] = grantStr;
        self.$confirm(self.$t('storage.ALC_NOTE2'), self.$t('base.prompt'), {
          confirmButtonText: self.$t('base.confirm'),
          cancelButtonText: self.$t('base.cancel'),
          type: 'warning'
        }).then(async() => {
          self.setAclRealFun(params);
        }).catch(async() => {
        });
      } else if (self.aclForm.aclPermission == "FULL_CONTROL") {
         self.setAclRealFun(params);
      }
    },
    setAclRealFun(params) {
      let self = this;
      self.loading2 = true;
      Vue.s3.putBucketAcl(params, function(err, data) {
        if (err) {
          self.loading2 = false;
          self.$recordLog({
            target: Vue.logTarget.storage_object_storage,
            level: {
              en: "error",
              zh_cn: "错误"
            },
            description: {
              en: `The bucket(${self.bucketName}) Set `+self.aclroleRender(self.aclForm.aclPermission),
              zh_cn: `存储桶(${self.bucketName})的ACL权限设置为`+self.aclroleRender(self.aclForm.aclPermission)
            }
          });
          console.log(err, err.stack);
          self.getAclState();
        } else {
          self.loading2 = false;
          self.$recordLog({
            target: Vue.logTarget.storage_object_storage,
            level: {
              en: "info",
              zh_cn: "信息"
            },
            description: {
              en: `The bucket(${self.bucketName}) Set `+self.aclroleRender(self.aclForm.aclPermission),
              zh_cn: `存储桶(${self.bucketName})的ACL权限设置为`+self.aclroleRender(self.aclForm.aclPermission)
            }
          });
          self.$message.success(self.$t('base.saveSuccess'));
          self.getAclState();
        }
      });
    },
    async getIpandPort() {
      let ipport = Vue.service['S3'];
      this.aclForm.commonUrl = ipport+"/"+this.pid+":"+this.bucketName;
    },
    aclChange(val) {
      // if (val == "READ" || val == "READWRITE") {
      //   this.aclFlag = true;
      // } else {
      //   this.aclFlag = false;
      // }
    },
    aclroleRender(val) {
      if (val == "READ") {
        return Vue.t('storage.commonRead');
      } else if (val == "READWRITE") {
        return Vue.t('storage.READWRITE');
      } else if (val == "FULL_CONTROL") {
        return Vue.t('storage.FULL_CONTROL');
      } else {
        return val;
      }
    }
  }
}
</script>