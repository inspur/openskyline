<template>
  <el-dialog :title="$t('storage.uploadDocument')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-row>
      <el-col :span="10">
        <el-form ref="uploadDocForm" :model="uploadDoc" label-width="80px" :rules="rules" label-position="left">
          <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
            <el-input class="col-22" v-model="uploadDoc.name" auto-complete="off" :disabled="loading"></el-input>
          </el-form-item>
          <el-form-item :label="$t('storage.partsUpload')" prop="partsUpload" style="margin-top: 30px;">
            <el-switch v-model="partsUpload" :on-text="$t('base.on')" :off-text="$t('base.off')"></el-switch>
          </el-form-item>
        </el-form>
        <div class="divider clearfix"></div>
        <div class="upload_main">
          <div class="upload_text">
            <i class="el-icon-upload upload_logo"></i>
            <div>{{$t('storage.S3_UPLOADMSG')}}</div>
          </div>
          <input type="file" id="upload" name="upload" :disabled="loading" @change="onFileChange"/>
        </div>
      </el-col>
      <el-col :span="14">
        <div v-if="showProgressFlag" style="height: 250px; margin: 0px 10px 0px 15px;">
          <p  v-if="originfileName != ''">{{$t('storage.currSelectFile')}}</p>
          <div v-if="originfileName != ''" class="tag">{{originfileName}}</div>
          <div v-if="originfileName == ''">{{$t('storage.currNoSelectFile')}}</div>
          <el-progress v-if="percentage != 0" :text-inside="true" :stroke-width="14" :percentage="percentage" :status="'success'" v-bind:style="{top:'10px'}"></el-progress>
        </div>
      </el-col>
   </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="!enableFlag" :loading="loading" @click="submitFun">{{$t('lang.uploadDoc')}}</el-button>
      <el-button type="primary" :disabled="loading" @click="handleClose">{{$t('lang.close')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import SparkMD5 from 'spark-md5';
export default {
  name: "UploadDoc",
  props: ['bucketName', 'path'],
  data() {
    return {
      uploadDoc: {
        name: ""
      },
      partsUpload: true,
      loading: false,
      prefix: "",
      uploadId:"",
      partSize: 20 * 1024 * 1024, //限制分片大小为20m
      quenuSize: 1, //同时上传的队列数
      mulitPartsList: [], // 碎片列表
      maxParts: 1, // 最大分片数
      maxpartIndex: 0, // 最大分片下标
      originfileName: "",
      fileList: [],
      loadedArry: [],
      percentage: 0,
      totalUploaded: 0,
      multiPartUploadEtagList: [],
      uploadFailFlg: false,
      enableFlag: false,
      showProgressFlag: true,
      visible: true,
      useMultiPartUploadFlag: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_NumberChinese_Pointer' },
          { type: 'maxByte', value: 255 }
        ]
      }
    }
  },
  watch: {
    loadedArry: {
      deep: true,
      handler: function (newVal, oldVal) {
        let tempUpload = 0;
        for (let i = 0; i < newVal.length; i++) {
          //存在newVal[i]为null的情况
          if (Number.isSafeInteger(newVal[i])) {
            tempUpload = tempUpload + newVal[i];
          }
        }
        let totalUpload = this.totalUploaded + tempUpload;
        let fileSize = this.fileList[0].size;
        this.percentage = ((totalUpload / fileSize) * 100).toFixed(2) * 1;
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
  methods: {
    onFileChange(event) {
      let self = this;
      self.fileList = event.target.files;
      self.uploadDoc.name = this.fileList[0].name;
      self.originfileName = this.fileList[0].name;
      let maxSize = 5 * 1024 * 1024 * 1024; //5GB 单个文件不得大于5GB
      let file = self.fileList[0];
      if (file.size > maxSize) {
        self.$message.error(self.$t("storage.S3_UPLOADMSG"));
        return false;
      }
      if (this.fileList && this.fileList.length != 0) {
        this.enableFlag = true;
      }
    },
    submitFun() {
      let self = this;
      self.$refs.uploadDocForm.validate(async (valid) => {
        if (valid) {
          //初始化所有的上传标志位和临时变量
          self.percentage = 0;
          self.totalUploaded = 0;
          self.multiPartUploadEtagList = [];
          self.loading = true;
          self.uploadFailFlg = false;
          if (self.fileList && self.fileList.length == 0) {
            return false;
          }
          self.headObjectFun();
        }
      });
    },
    headObjectFun(result) {
      let self = this;
      let params = {
        Bucket: self.bucketName,
        Key: self.prefix + self.uploadDoc.name
      };
      Vue.s3.headObject(params, function(err, data) {
        if (err) {
          self.uploadFun();
        } else {
          //增加确认框，提示继续上传将会覆盖原对象
          self.$confirm(self.$t('storage.carefulOperation1'), self.$t('base.prompt'), {
            confirmButtonText: self.$t('base.confirm'),
            cancelButtonText: self.$t('base.cancel'),
            type: 'warning'
          }).then(async() => {
            self.uploadFun();
          }).catch(async() => {
            self.loading = false;
          });
        }
      });
    },
    uploadFun() {
      this.getFragmentList(this.uploadDoc.name)
    },
    /**
     * @description 单个文件上传入口
     */
    uploadObjectFun() {
      let self = this;
      let params = {
        Bucket: self.bucketName,
        Key: self.prefix + self.uploadDoc.name,
        ContentType:self.fileList[0].type,
        Body: self.fileList[0]
      };
      let upload = Vue.s3.putObject(params);
      upload.on("httpUploadProgress", function(progress) {
        let percentage = progress["loaded"] / progress["total"] * 100;
        self.percentage = percentage.toFixed(2) * 1;
      });
      upload.send(function(err, data) {
        if (err) {
          console.log(err.stack)
          self.loading = false;
          if (err.stack.indexOf("QuotaExceeded") > -1 || err.stack.indexOf("NetworkingError") > -1) {
            self.$message({
              showClose: true,
              message:  self.$t("storage.ExceedQuota"),
              type: 'error'
            });
            return;
          } else {
            self.$message.error(self.$t("storage.S3_OBJECT_UPLOAD_FAILED"));
          }
          self.recordLogFun(false);
        } else {
          self.recordLogFun(true);
          self.successFun();
        }
      });
    },
    // 获取所有的文件碎片
    getFragmentList(fileName) {
      let self = this;
      let params = {
        Bucket: self.bucketName,
        Prefix: self.prefix + self.uploadDoc.name
      };
      Vue.s3.listMultipartUploads(params, function(err, data) {
        if (err) {
          self.createMultipartUploadFun();
        } else {
          let multiList = [];
          let fragmentName = "";
          let uploads = data["Uploads"] || [];
          let hasObject = false;
          if (uploads.length > 0 && self.partsUpload) {
            for (let i=0; i<uploads.length; i++) {
              let ups = uploads[i];
              let multiObject = {};
              let names = ups["Key"].split("/");
              multiObject["name"] = names[names.length-1];
              multiObject["uploadId"] = ups["UploadId"];
              multiObject["Key"] = ups["Key"];
              if (multiObject["name"] == fileName) {
                // 如果碎片列表中有和待上传对象名称一致的，则启用续传
                hasObject = true;
                self.uploadId = ups["UploadId"];
                multiList.push(multiObject);
              }
            }
            if (hasObject) {
              // 断点续传，先找到从哪个碎片续传
              self.listAllPartFun(multiList);
            } else {
              self.createMultipartUploadFun();
            }
          } else {
            self.createMultipartUploadFun();
          }
        }
      });
    },
    //列出所有的分片，选一个最大的，然后取详情信息里的part里的Etag
    listAllPartFun(multiList) {
      let self = this;
      let maxSize = 0;
      let maxIndex = 0;
      for (let i=0; i<multiList.length; i++) {
        let part = multiList[i]
        let params = {
          Bucket: self.bucketName,
          Key: part["Key"],
          UploadId: part["uploadId"]
        };
        Vue.s3.listParts(params, function(err, data) {
          if (err) {
            console.log(err, err.stack)
          } else {
            maxIndex++;
            let parts = data["Parts"] || [];
            let index = 0;
            let totalSize = 0;
            for (let i=0; i<parts.length; i++) {
              let p = parts[i];
              totalSize+=p["Size"];
            }
            if (totalSize > maxSize) {
              maxSize = totalSize;
              self.maxpartIndex = maxIndex;
              self.mulitPartsList = parts;
              self.uploadId = part["uploadId"];
            }
            // 遍历完后，执行上传
            if (maxIndex == multiList.length) {
              if (maxSize == 0 ) {
               self.uploadId = part["uploadId"];
              }
              // 如果文件比最大的碎片还小，那么启用重新上传
              if (self.fileList[0].size <= maxSize) {
                self.createMultipartUploadFun();
              } else {
                console.log("找到要上传的碎片位置：" + self.maxpartIndex+",  id=" + self.uploadId)
                console.log("碎片个数：" + self.mulitPartsList.length)
                self.calculateFileMd5(1);
              }
            }
          }
        });
      }
    },
    calculateFileMd5(partNumber) {
      let self = this;
      let file = self.fileList[0];
      self.maxParts = Math.ceil(file.size/self.partSize);
      let filePart = self.calcFilePart(partNumber, file);
      let spark = new SparkMD5();
      let fileReader = new FileReader();
      fileReader.readAsBinaryString(filePart);
      fileReader.onload = function(e) {
        spark.appendBinary(e.target.result);
        let currentMd5 = spark.end();
        let uploadPicesFlag = false;
        console.log("Md5---" + currentMd5 + ", partNumber="+partNumber)
        for (let i=0; i<self.mulitPartsList.length; i++) {
          let p = self.mulitPartsList[i];
          if (p["ETag"] == ('"'+currentMd5+'"')) {
            uploadPicesFlag = true;
            let nextPartNumber = partNumber + 1;
            if (nextPartNumber <= self.maxParts && partNumber <= self.mulitPartsList.length) {
              self.multiPartUploadEtagList.push({
                PartNumber: partNumber,
                ETag: p["ETag"]
              });
              console.log("nextPartNumber---" + nextPartNumber)
              self.$set(self.loadedArry, partNumber, filePart.size);
              self.calculateFileMd5(nextPartNumber);
            } else {
              uploadPicesFlag = false;
            }
            break;
          }
        }
        console.log("上传标志:" + !uploadPicesFlag)
        if (!uploadPicesFlag) {
          self.uploadPartFun(partNumber, file);
        }
      }
    },
    /**
     * @description 计算文件的分片
     * @param partNumber 分片序列号
     */
    calcFilePart(partNumber, file) {
      let self = this;
      let start = (partNumber - 1) * self.partSize;
      let end = start + self.partSize;
      if (partNumber == self.maxParts) {
        end = file.size;
      }
      return file.slice(start, end);
    },
    /**
     * @description 分片上传入口
     */
    createMultipartUploadFun() {
      let self = this;
      let file = this.fileList[0];
      //如果文件大小大于100mb 则使用分片上传，否则使用单个文件上传
      let multiPartLimit = 20 * 1024 * 1024; //100mb
      if (file.size < multiPartLimit) {
        this.uploadObjectFun();
      } else {
      let params = {
        Bucket: self.bucketName,
        ContentType:self.fileList[0].type,
        Key: self.prefix + self.uploadDoc.name
      };
      Vue.s3.createMultipartUpload(params, function(err, data) {
        if (err) {
          self.loading = false;
          console.log(err.stack)
          if (err.stack.indexOf("QuotaExceeded") > -1 || err.stack.indexOf("NetworkingError") > -1) {
            self.$message({
              showClose: true,
              message:  self.$t("storage.ExceedQuota"),
              type: 'error'
            });
            return;
          } else {
            self.$message.error(self.$t("storage.S3_OBJECT_UPLOAD_FAILED"));
          }
        } else {
          let file = self.fileList[0];
          self.uploadId = data["UploadId"];
          self.maxParts = Math.ceil(file.size/self.partSize);
          // 上传分片
          for (let i = 1; i <= self.quenuSize; i++) {
            self.uploadPartFun(i, file);
          }
        }
      });
      }
    },
    /**
     * @description 上传分片
     * @param partNumber 分片的序列号
    */
    uploadPartFun(partNumber, file) {
      let self = this;
      let filePart = self.calcFilePart(partNumber, file);
      let params = {
        Bucket: self.bucketName,
        Key: self.prefix + self.uploadDoc.name,
        PartNumber: partNumber,
        UploadId: self.uploadId,
        Body: filePart
      };
      console.log("开始分片上传：序号"+partNumber+",大小："+filePart.size)
      let uploadPart = Vue.s3.uploadPart(params);
      let index = (partNumber - 1) % self.quenuSize;
      uploadPart.on("httpUploadProgress", function(progress) {
        self.$set(self.loadedArry, index, progress["loaded"]);
      });
      uploadPart.send(function(err, data) {
        if (err) {
          self.uploadFailFlg = true;
          self.loading = false;
          if (err.stack.indexOf("QuotaExceeded") > -1) {
            self.$message({
              showClose: true,
              message: self.$t("storage.ExceedQuota"),
              type: 'error'
            });
            return;
          } else {
            self.$message.error(self.$t("storage.S3_OBJECT_UPLOAD_FAILED"));
          }
        } else {
          console.log("开始上传---" + partNumber+":" + filePart.size)
          // self.loadedArry[index] = 0;
          self.multiPartUploadEtagList.push({
            PartNumber: partNumber,
            ETag: data["ETag"]
          });
          if (partNumber == self.maxParts) {
              let lastPartSize = file.size - (partNumber - 1) * self.partSize;
              self.totalUploaded = self.totalUploaded + lastPartSize;
            } else {
              self.totalUploaded = self.totalUploaded + self.partSize;
          }
          console.log("上传中--multiPartUploadEtagList---" + self.multiPartUploadEtagList.length+"?="+self.maxParts)
          if (self.multiPartUploadEtagList.length == self.maxParts) {
            console.log("上传完成标志------------")
            self.completeMultiPartUploadFun();
          }
          let nextPartNumber = (partNumber + self.quenuSize) * 1;
          if (nextPartNumber <= self.maxParts && !self.uploadFailFlg) {
            self.uploadPartFun(nextPartNumber, file);
          }
        }
      });
    },
    /**
     * @description 调用完成分片上传接口，通知s3上传完成，远端合并分片
     */
    completeMultiPartUploadFun() {
      let self = this;
      let EtagList = [...self.multiPartUploadEtagList]
      EtagList.sort(function (item, item1) {
        return item["PartNumber"] - item1["PartNumber"];
      });
      let multimd5 = "";
      let params = {
        Bucket: self.bucketName,
        Key: self.prefix + self.uploadDoc.name,
        UploadId: self.uploadId,
        MultipartUpload: {
          Parts: EtagList
        }
      };
      Vue.s3.completeMultipartUpload(params, function(err, data) {
        if (err) {
          self.$message.error(self.$t("storage.S3_OBJECT_UPLOAD_FAILED"));
          self.loading = false;
          self.recordLogFun(false);
        } else {
          self.loading = false;
          self.recordLogFun(true);
          self.successFun();
        }
      });
    },
    recordLogFun(isSuccessed) {
      let self = this;
      let isRoot = false;
      let logEn = `In the Bucket(${self.bucketName}) ${self.$t('storage.rootPath')}/${self.prefix} Upload the file: ${self.uploadDoc.name}`;
      let logZhCn =`在存储桶(${self.bucketName})的目录：${self.$t('storage.rootPath')}/${self.prefix} 上传了文件: ${self.uploadDoc.name}`;
      if (isSuccessed) {
        self.$recordLog({
          target: Vue.logTarget.storage_object_storage,
          level: {
            en: "info",
            zh_cn: "信息"
          },
          description: {
            en: logEn,
            zh_cn: logZhCn
          }
        });
      } else {
        self.$recordLog({
          target: Vue.logTarget.storage_object_storage,
          level: {
            en: "error",
            zh_cn: "错误"
          },
          description: {
            en: logEn,
            zh_cn: logZhCn
          }
        });
      }
    },
    successFun() {
      let self = this;
      self.loading = false;
      self.fileList = [];
      self.$message.info(self.$t("storage.S3_OBJECT_UPLOAD_SUCCESS"));
      self.$emit("handleUploadShow", {});
      self.$emit("onRefresh", {});
    },
    handleClose() {
      this.$emit("handleUploadShow", {});
    }
  }
}
</script>
<style scoped>
.upload_main {
  border: 1px dashed #d9d9d9;
  height: 187px;
  border-radius: 5px;
  margin: 10px 5px 0px 5px;
  text-align: center;
}
.upload_main:hover {
  border-color: #0087ed;
}
.upload_main:hover .upload_logo {
  color: #0087ed;
}
.upload_main input{
  border: solid 1px #ccc;
  height: 100%;
  width: 100%;
  opacity: 0;
  position: relative;
  top: -187px;
}
.upload_text {
  position: relative;
  top: 15%;
  margin: auto;
  height: 187px;
  width: 60%;
  color: red;
  font-size: 12px;
}
.upload_logo {
  font-size: 70px;
  color: #b7c4d7;
  position: relative;
  top: 24%;
}
.upload_logo:hover{
  color: #aaaaaa;
  font-size: 70px;
}
.tag {
  word-wrap:break-word;
  word-break:break-all;
  overflow: hidden;
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
  padding: 5px;
  border-radius: 5px;
}
</style>
