<template>
  <el-dialog :title="$t('calcStorLang.detail')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <ul class="kv_list">
      <li class="kv" v-for="item in KVList" v-bind:key="item.value">
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
export default {
  name:"ObjectInfo",
  props: ['bucketName', "fileName", 'fullPath'],
  data() {
    return {
      KVList:[],
      loading: false,
      visible:true,
      pid:  this.$cookie.get("pid")
    }
  },
  mounted() {
    this.headObjectFun();
  },
  methods:{
    handleClose() {
      this.$emit("handleObjectInfoShow", {});
    },
    headObjectFun(result) {
      let self = this;
      self.loading = true;
      let params = {
        Bucket: self.bucketName,
        Key: self.fullPath + self.fileName
      };
      Vue.s3.headObject(params, function(err, data) {
        if (err) {
          self.loading = false;
          console.log(err, err.stack); // an error occurred
        } else {
          self.loading = false;
          self.KVList = [
            {label: self.$t('storage.size'), value: self.sizeRender(data["ContentLength"])},
            {label: "ETag", value: self.removeMask(data["ETag"])},
            {label: self.$t('lang.type'), value: data["ContentType"]},
            {label: self.$t('lang.modifyTime'), value: self.$tzTimeFormatter(data["LastModified"])}
          ];
          self.getAclState();
        }
      });
    },
    async getIpandPort() {
      this.ipport = Vue.service['S3'];
      this.KVList.push(
        {label: "公共URL", value: this.ipport+"/"+this.pid+":"+this.bucketName+"/" + this.fullPath +this.fileName}
      );
    },
    getAclState() {
      let self = this;
      let params = {
        Bucket: self.bucketName,
        Key: self.fullPath + self.fileName
      };
      Vue.s3.getObjectAcl(params, function(err, data) {
        if (err) {
           console.log(err, err.stack);
        } else {
          let grants = data["Grants"];
          let owner = data["Owner"];
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
            perm = "公有读";
            self.getIpandPort();
          }
          self.KVList.push(
            {label: "ACL", value:perm}
          )
        }
      });
    },
    sizeRender(value) {
      if (!value || value === 0) {
        return "0 Bytes";
      }
      let sizes = ["Bytes", "KB", "MB", "GB", "TB", "YB"];
      let num = 0;
      while (value >= 1024) {
        value = value / 1024;
        num++;
      }
      return value.toFixed(2) + " " + sizes[num];
    },
    removeMask(val) {
      return val.replace(/^\"|\"$/g, '');
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
  width: 80px;
  font-weight: 600;
}
.v {
  font-size: 14px;
  line-height: 1;
}
</style>

