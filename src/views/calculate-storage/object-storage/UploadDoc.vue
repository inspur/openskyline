<template>
  <el-dialog :title="$t('storage.uploadDocument')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="uploadDocForm" :model="uploadDoc" label-width="100px" :rules="rules" label-position="left" v-loading="loading">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="uploadDoc.name" auto-complete="off" @change="onNameChange"></el-input>
      </el-form-item>
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
  name: "uploadDoc",
  props: ['containerTempName', 'path'],
  data() {
    return {
      uploadDoc: {
        name: ""
      },
      objectsData: [],
      uploadData: {
        "containerName": '',
        "fileName": '',
        "projectId": ''
      },
      loading: false,
      fList: [],
      fileDisabled: false,
      fileFlag: true,
      visible: true,
      enableFlag: true,
      editflag:true,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_MinusPointBracketNumberChinese' },
          { type: 'maxByte', value: 255 }
        ]
      }
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    handleClose(done) {
      this.$emit("handleUploadShow", {});
      done();
    },
    onNameChange () {
      console.log("changed:" + this.uploadDoc.name);
      if (!this.uploadDoc.name) {
        this.editflag=true;
      } else {
        this.editflag=false;
      }
    },
    async initData() {
      var self = this;
      self.uploadData.containerName = self.containerTempName;
      self.objectsData = [];
      var containerTempName = self.containerTempName;
      var roleType = Vue.roleType + "";
      var projectId = this.$cookie.get('pid');
      self.uploadData.projectId = projectId;
      var url = "api/swift/v1/" + projectId + "/" + containerTempName + "?path=&format=json";
      if ("2" == roleType || "3" == roleType) { //超级
        url = "api/swift/v1/" + projectId + "/" + containerTempName + "?path=&format=json";
      }
      if (self.path) {
        url = "api/swift/v1/" + projectId + "/" + containerTempName + "?path=" + self.path + "&format=json";
      }
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        let objects = result;
        for (var i = 0; i < objects.length; i++) {
          let objectTemp = objects[i];
          if (objectTemp.hasOwnProperty('name')) {
            self.objectsData.push(objectTemp.name);
          }
        }
      } catch (res) {
      }
    },
    handleBefore(file) {
      var self = this;
    },
    handleSuccess(res, file, fileList) {
      var self = this;
      if (res["flag"]) {
        self.loading = false;
        self.$message(this.$t('storage.uploadObjSuccess'));
        self.$recordLog({
          target: Vue.logTarget.storage_object_storage,
          level: {
            en: "info",
            zh_cn: "信息"
          },
          description: {
            en: "Upload file:" + self.uploadDoc.name + "success",
            zh_cn: "成功上传文件:" + self.uploadDoc.name
          }
        });
        self.$emit("handleUploadShow", {});
        self.$emit("onRefresh");
        return;
      } else {
        self.loading = false;
        self.enableFlag = true;
        self.$refs.uploadEl.clearFiles();
        self.$errMsg(res.resData, res.errCode);
        self.$recordLog({
          target: Vue.logTarget.storage_object_storage,
          level: {
            en: "error",
            zh_cn: "错误"
          },
          description: {
            en: "Upload file:" + self.uploadDoc.name + " error(" + res.resData + ")",
            zh_cn: "上传文件:" + self.uploadDoc.name + "失败(" + res.resData + ")"
          }
        });
      }
    },
    handleError(err, file, fileList) {
      self.enableFlag = false;
    },
    handleChange(file, fileList) {
      console.log(0);
      var self = this;
      var size = file.size;
      var num = fileList.length;
      let repeatFlag = false;
      if (fileList.length > 1) {
        if (fileList[0].name == file.name) {
          repeatFlag = true;
        }
        fileList.splice(0, 1);
      }
      if (self.editflag == true) {
        this.uploadDoc.name=file.name;
      }
      var isIE = self.isIE();
      if (num == 0) {
        self.enableFlag = true;
      } else if (num > 1) {
        if (repeatFlag == false) {
          self.$message({
            showClose: true,
            message: this.$t('storage.notAllowUploadMorethanOneObj'),
            type: 'warning'
          });
        }
        self.enableFlag = true;
        if (fileList.length == 1) {
          self.enableFlag = false;
        }
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
      if (self.editflag == true) {
        this.uploadDoc.name ="";
      }
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
        var size = fileList[0].size;
        var isIE = self.isIE();
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
    },
    handlePreview(file) {
      console.log(file);
    },
    submitUpload() {
      this.$refs.uploadDocForm.validate(async (valid) => {
        if (valid) {
          var self = this;
          self.loading = true;
          self.enableFlag = true;
          var objectsData = self.objectsData;
          var nameTemp = self.uploadDoc.name;
          if (self.path) {
            nameTemp = self.path + nameTemp;
            //self.uploadData.containerName = self.uploadData.containerName +'/'+self.path;
          }
          self.uploadData.fileName = nameTemp;
          var projectId = this.$cookie.get('pid');
          self.uploadData.projectId = projectId;
          var flag = false;
          for (var i = 0; i < objectsData.length; i++) {
            let objectTemp = objectsData[i];
            if (objectTemp == nameTemp) {
              if (self.path) {
                self.$message({
                  showClose: true,
                  message: this.$t('storage.thereHasSameNameObj'),
                  type: 'warning'
                });
              } else {
                self.$message({
                  showClose: true,
                  message: this.$t('storage.thereHasSameNameObjInContainer'),
                  type: 'warning'
                });
              }
              // self.$message('该存储桶内存在重名文件！');
              flag = true;
            }
          }
          if (!flag) {
            this.$refs.uploadEl.submit();
          } else {
            self.loading = false;
            self.enableFlag = false;
            return;
          }
        } else {
          return false;
        }
      });
    },
    changeFlagValue() { }
    /*submitUpload() {
        this.$refs.uploadEl.submit();
    },*/
  }
}
</script>