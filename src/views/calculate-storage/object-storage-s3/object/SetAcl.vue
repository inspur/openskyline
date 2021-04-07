<template>
  <el-dialog :title="$t('storage.bucketACLSet')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
      <el-form ref="createCatalogForm" :model="aclForm" label-width="80px" v-loading="loading">
        <el-form-item :label="$t('storage.commonJust')">
          <el-radio-group v-model="aclForm.aclPermission" @change="aclChange">
            <el-radio label="FULL_CONTROL">私有读写</el-radio>
            <el-radio label="READ">公有读</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="公共URL" v-if="aclFlag">
          <span>{{aclForm.commonUrl}}</span>
        </el-form-item>
      </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="setAclFun" :loading="loading">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "SetAcl",
  props: ['bucketName', 'fileName', 'fullPath'],
  data() {
    return {
      aclForm: {
        aclPermission: "FULL_CONTROL",
        sid: "",
        commonUrl: ""
      },
      loading: false,
      pid:  this.$cookie.get("pid"),
      visible: true,
      aclFlag: false
    }
  },
  mounted() {
    this.getAclState();
  },
  methods: {
    getAclState() {
      let self = this;
      let params = {
        Bucket: self.bucketName,
        Key: self.fullPath+self.fileName
      };
      Vue.s3.getObjectAcl(params, function(err, data) {
        if (err) {
           console.log(err, err.stack);
        } else {
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
            self.aclForm.aclPermission = "READ";
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
        GrantFullControl: "id="+self.aclForm.sid,
        Key: self.fullPath+self.fileName
      };
      if (self.aclForm.aclPermission == "READ") { // 公有读
        params["GrantRead"] = grantStr;
      }
      Vue.s3.putObjectAcl(params, function(err, data) {
        if (err) {
          self.$recordLog({
            target: Vue.logTarget.storage_object_storage,
            level: {
              en: "error",
              zh_cn: "错误"
            },
            description: {
              en: `The bucket(${self.bucketName}) of the (${self.fileName}) Set`,
              zh_cn: `存储桶(${self.bucketName})的对象(${self.fileName})ACL权限设置`
            }
          });
          console.log(err, err.stack);
        } else {
          self.$message.success(self.$t('base.saveSuccess'));
          self.$recordLog({
            target: Vue.logTarget.storage_object_storage,
            level: {
              en: "info",
              zh_cn: "信息"
            },
            description: {
              en: `The bucket(${self.bucketName}) of the (${self.fileName}) Set to` + self.aclroleRender(self.aclForm.aclPermission),
              zh_cn: `存储桶(${self.bucketName})的对象(${self.fileName})ACL权限设置为` + self.aclroleRender(self.aclForm.aclPermission)
            }
          });
          self.$emit("onRefresh", {});
          self.$emit("handleAddCatalogShow", {});
        }
      });
    },
    async getIpandPort() {
      let ipport = Vue.service['S3'];
      this.aclForm.commonUrl = ipport+"/"+this.pid+":"+this.bucketName+"/"+this.fullPath+this.fileName;
    },
    aclChange(val) {
    //   if (val == "READ") {
    //     this.aclFlag = true;
    //   } else {
    //     this.aclFlag = false;
    //   }
    },
    handleClose() {
       this.$emit("handleAddCatalogShow", {});
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
