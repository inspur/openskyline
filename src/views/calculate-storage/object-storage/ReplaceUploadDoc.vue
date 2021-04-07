<template>
  <el-dialog :title="$t('storage.replaceObj')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-form label-width="100px" label-position="left" v-loading="loading">
      <el-upload class="col-10" drag ref="uploadEl" action="../node-api/uploadObjStorDoc" :data="uploadData" :on-success="handleSuccess" :on-error="handleError" :on-preview="handlePreview" :on-change="handleChange" :on-remove="handleRemove" :before-upload="handleBefore" :disabled="fileDisabled" :multiple="false" :auto-upload="false" :show-file-list="true">
        <i class="el-icon-upload"></i>
        <div class="el-upload_text">{{$t('storage.draftObjOr')}}
          <em>{{$t('storage.clickUpload')}}</em>
        </div>
        <div slot="tip" class="el-upload__tip" style="color:red">{{$t('storage.onlyUploadOneAndSizeLessthanFiveG')}}</div>
      </el-upload>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="success" :disabled="enableFlag" @click="submitUpload">{{$t('lang.uploadDoc')}}</el-button>
      <el-button type="primary" @click="handleClose">{{$t('lang.close')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "replaceUploadDoc",
  props: ['containerTempName', 'fileName'],
  data() {
    return {
      uploadData: {
        "containerName": '',
        "fileName": '',
        "projectId": ''
      },
      fList: [],
      loading: false,
      fileDisabled: false,
      fileFlag: true,
      visible: true,
      enableFlag: true
    }
  },
  mounted() {
  },
  methods: {
    handleClose(done) {
      this.$emit("handleReplaceUploadShow", {});
      done();
    },
    handleBefore(file) {
      var self = this;
    },
    handleSuccess(res, file, fileList) {
      var self = this;
      if (res["flag"]) {
        self.loading = true;
        self.$recordLog({
          target: Vue.logTarget.storage_object_storage,
          level: {
            en: "info",
            zh_cn: "信息"
          },
          description: {
            en: "Replace file:" + self.fileName + "success",
            zh_cn: "成功替换文件:" + self.fileName
          }
        });
        self.$message(this.$t('storage.replaceObjSuccess'));
        self.$emit("handleReplaceUploadShow", {});
        self.$emit("onRefresh");
        return;
      } else {
        self.loading = false;
        self.enableFlag = true;
        self.$refs.uploadEl.clearFiles();
        self.$errMsg(res.resData, res.errCode);
      }
    },
    handleError(err, file, fileList) {
      self.enableFlag = false;
      self.$recordLog({
        target: Vue.logTarget.storage_object_storage,
        level: {
          en: "info",
          zh_cn: "信息"
        },
        description: {
          en: "Replace file:" + self.fileName + " failed",
          zh_cn: "替换文件:" + self.fileName + "失败"
        }
      });
    },
    handleChange(file, fileList) {
      var self = this;
      var size = file.size;
      var num = fileList.length;
      var isIE = self.isIE();
      if (num == 0) {
        self.enableFlag = true;
      } else if (num > 1) {
        self.$message({
          showClose: true,
          message: this.$t('storage.notAllowUploadMorethanOneObj'),
          type: 'warning'
        });
        self.enableFlag = true;
      } else {
        //size =size/1024/1024/1024;
        if (isIE) {
          if (size > (4 * 1024 * 1024 * 1024)) {
            self.$message({
              showClose: true,
              message: Vue.t("lang.ie4GTip"),
              type: 'warning'
            });
            self.enableFlag = true;
          } else {
            self.enableFlag = false;
          }
        } else if (size > (5 * 1024 * 1024 * 1024)) {
          self.$message({
            showClose: true,
            message: this.$t('storage.sizeMorethanFiveG'),
            type: 'warning'
          });
          self.enableFlag = true;
        } else {
          self.enableFlag = false;
        }
      }
      fileList = [];
      fileList.push(file);
      self.fList = fileList;
    },
    isIE() {
      if (!!window.ActiveXObject || "ActiveXObject" in window) {
        return true;
      } else {
        return false;
      }
    },
    handleRemove(file, fileList) {
      var self = this;
      self.fList = fileList;
      var num = fileList.length;
      if (num == 0) {
        self.enableFlag = true;
      } else if (num > 1) {
        self.$message({
          showClose: true,
          message: this.$t('storage.notAllowUploadMorethanOneObj'),
          type: 'warning'
        });
        self.enableFlag = true;
      } else {
        self.enableFlag = false;
      }
    },
    handlePreview(file) {
      console.log(file);
    },
    submitUpload() {
      var self = this;
      self.loading = true;
      self.enableFlag = true;
      self.uploadData.containerName = self.containerTempName;
      var projectId = this.$cookie.get('pid');
      self.uploadData.projectId = projectId;
      var nameTemp = self.fileName;
      self.uploadData.fileName = nameTemp;
      this.$refs.uploadEl.submit();
    },
    changeFlagValue() { }
    /*submitUpload() {
        this.$refs.uploadEl.submit();
    },*/
  }
}
</script>