<template>
  <el-dialog :title="$t('calcStorLang.detail')" :visible.sync="visible" :before-close="handleClose"  style="text-align:left" v-dialogDrag>
    <el-form ref="mulpartInfo" :model="mulpartInfo" label-width="100px">
      <el-form-item :label="$t('storage.objectPath')" style="font-weight:600;">
        <span class="col-20" style="word-wrap:break-word;font-weight:400;">{{mulpartInfo.objectPath}}</span>
      </el-form-item>
      <el-form-item :label="$t('storage.objectUploadSize')" style="font-weight:600;">
        <span style="word-wrap:break-word;font-weight:400;">{{mulpartInfo.objectUploadSize}}</span>
      </el-form-item>
      <el-form-item :label="$t('storage.objectPartnum')" style="font-weight:600;">
        <span style="word-wrap:break-word;font-weight:400;">{{mulpartInfo.objectPartnum}}</span>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('lang.close')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"MultipartInfo",
  props: ['bucketName', "selectedRow"],
  data() {
    return {
      KVList:[],
      loading: false,
      visible:true,
      mulpartInfo: {
        objectPath: "",
        objectUploadSize: "",
        objectPartnum: ""
      }
    }
  },
  mounted() {
    this.getParts();
  },
  methods:{
    handleClose() {
      this.$emit("handleBucketInfoShow", {});
    },
    getParts() {
      let self = this;
      self.tableData = [];
      let params = {
        Bucket: self.bucketName,
        Key: self.selectedRow["Key"],
        UploadId:self.selectedRow["uploadId"]
      };
      Vue.s3.listParts(params, function(err, data) {
        if (err) {
           console.log(err, err.stack);
        } else {
          let parts = data["Parts"] || [];
          let index = 0;
          let totalSize = 0;
          for (let i=0; i<parts.length; i++) {
            let p = parts[i];
            totalSize+=p["Size"];
          }
          self.mulpartInfo.objectPath = Vue.t('storage.rootPath')+"/"+self.selectedRow["Key"];
          self.mulpartInfo.objectUploadSize = self.sizeRender(totalSize);
          self.mulpartInfo.objectPartnum = parts.length;
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

