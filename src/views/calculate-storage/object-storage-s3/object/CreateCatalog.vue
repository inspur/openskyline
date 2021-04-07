<template>
  <el-dialog :title="$t('storage.createCatalog')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="createCatalogForm" :model="createCatalog" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="createCatalog.name" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="loading">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"createCatalog",
  props: ['bucketName', 'path'],
  data() {
    return {
      createCatalog:{
        name:""
      },
      fullPath: "",
      prefix: "",
      objectsData: [],
      loading: false,
      visible:true,
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'onlyLetterNumberChinese'},
          {type: 'maxByte', value: 72}
        ]
      }
    }
  },
  mounted() {
    if (!this.path) {
      this.prefix = "";
    } else {
      this.prefix = this.path;
    }
  },
  methods:{
    handleClose() {
      this.$emit("handleAddCatalogShow", {});
    },
    confirmFun() {
      this.$refs.createCatalogForm.validate(async(valid) => {
        if (valid) {
          let self = this;
          self.loading = true;
          self.fullPath = self.prefix + self.createCatalog.name + "/";
          self.headObjectFun();
        }
      });
    },
    headObjectFun(result) {
      let self = this;
      let params = {
        Bucket: self.bucketName,
        Key: self.fullPath
      };
      Vue.s3.headObject(params, function(err, data) {
        if (err) {
          self.putObjectFun();
        } else {
          self.loading = false;
          self.$message({
            showClose: true,
            message: Vue.t('storage.thereHasSameNameCatalog'),
            type: 'warning'
          });
        }
      });
    },
    putObjectFun() {
      let self = this;
      let params = {
        Bucket: self.bucketName,
        Key: self.fullPath,
        Body: ""
      };
      Vue.s3.putObject(params, function(err, data) {
        if (err) {
          self.loading = false;
          if (err.stack.indexOf("QuotaExceeded") > -1) {
            self.$message({
              showClose: true,
              message: self.$t("storage.ExceedQuota"),
              type: 'error'
            });
          }
          self.$recordLog({
            target: Vue.logTarget.storage_object_storage,
            level: {
              en: "error",
              zh_cn: "错误"
            },
            description: {
              en: `In the bucket(${self.bucketName}),created the catalog:${self.$t('storage.rootPath')}/${self.fullPath}`,
              zh_cn: `存储桶(${self.bucketName})内创建目录：${self.$t('storage.rootPath')}/${self.fullPath}`
            }
          });
        } else {
          self.loading = false;
          self.$recordLog({
            target: Vue.logTarget.storage_object_storage,
            level: {
              en: "info",
              zh_cn: "信息"
            },
            description: {
              en: `In the bucket(${self.bucketName}),created the catalog: ${self.$t('storage.rootPath')}/${self.fullPath} `,
              zh_cn: `存储桶(${self.bucketName})内创建目录：${self.$t('storage.rootPath')}/${self.fullPath}`
            }
          });
          self.successFun();
        }
      });
    },
    successFun() {
      let self = this;
      self.$emit("handleAddCatalogShow", {});
      self.$message.info(self.$t('storage.createCatalogSuccess'));
      self.$emit("onRefresh", {});
    }
  }
}
</script>