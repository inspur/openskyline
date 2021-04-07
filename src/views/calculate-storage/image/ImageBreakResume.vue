<template>
  <div>
    <el-dialog
      class="break-resume"
      :title="$t('calcStorLang.IMAGE_UPLOAD_IMAGE')"
      :visible="true"
      :before-close="handleBeforeClose"
      :show-close="cancelable"
      size="tiny">
      <el-form label-width="100px" label-position="right">
        <el-form-item :label="$t('calcStorLang.IMAGE_UPLOAD_FILE')">
          <el-upload
            action=""
            :disabled="saving"
            :on-change="handleFileChanged"
            :multiple="false"
            :auto-upload="false"
            :show-file-list="false"
          >
            <el-button v-if="file === null && saving === false" slot="trigger" size="small" type="primary">{{$t('calcStorLang.selectFile')}}</el-button>
            <el-tooltip v-if="file === null && saving === false" placement="top" trigger="hover" :content="$t('calcStorLang.IMAGE_RESUME_SAME_FILE_TIPS')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
            {{ name }}
          </el-upload>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.IMAGE_UPLOAD_PROGRESS')">
          <el-row type="flex" align="middle" style="margin-top: 6px;">
            <el-progress
              :text-inside="true"
              :stroke-width="18"
              :percentage="Math.ceil(loaded / total * 100)"
              style="width: 300px; margin-right: 5px;" />
            <el-tooltip placement="right" trigger="hover" :content="$t('calcStorLang.IMAGE_RESUME_UPLOAD_TIPS')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-row>
            
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close" v-if="cancelable">{{ $t('lang.cancel') }}</el-button>
        <el-button @click="save" type="primary" :loading="saving">{{ $t('calcStorLang.IMAGE_UPLOAD') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ImageBreakResume',
  props: {
    file: {
      type: File,
      default: null
    },
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      _file: null,
      s3ManagedUpload: null,
      loaded: 0,
      total: 1,
      name: '',
      saving: false,
      timeoutHandler: null,
      cancelable: true
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    handleBeforeClose(done) {
      done();
      this.close();
    },
    handleFileChanged(e) {
      this._file = e.raw;
      this.name = e.raw.name;
    },
    save() {
      const $this = this;
      if ($this._file === null || $this._file === undefined) {
        $this.$message.error($this.$t('calcStorLang.needImage'));
      } else {
        const file = $this._file;
        const partSize = 50 * 1024 * 1024;
        const bucketName = 'upload_images';
        const fileName = `${$this.id}_${file.name}_${file.size}`;
        $this.saving = true;

        let s3 = new AWS.S3({
          accessKeyId: 'ak',
          secretAccessKey: 'sk',
          endpoint: `${window.location.protocol}//${window.location.host}/node-api/fake-s3`,
          s3ForcePathStyle: true,
          maxRetries: 2, // 重试次数
          retryDelayOptions: {
            base: 3000 // 重试间隔ms
          },
          computeChecksums: false,
          signatureVersion: 'v2'
        });
        let uploadConfig = {
          partSize: partSize,
          queueSize: 1, // 分片并发上传数
          service: s3,
          params: {
            Bucket: bucketName,
            Key: fileName,
            Body: file,
            UploadId: null
          },
          leavePartsOnError: true
        };
        let upload = new AWS.S3.ManagedUpload(uploadConfig);
        upload.uploadStatus = 'uploading';
        upload.preUploadedBytes = 0;
        upload.startTime = (new Date()).getTime();
        upload.completeInfo = [];
        upload.doneParts = 0;

        s3.listMultipartUploads({
          Bucket: bucketName
        }).promise()
        .then(listMultipartUploadsData => {
          let existedUploadInfo = null;
          let existedPreUploadInfo = null; // 存在前次上次文件名不一致的断点
          if (listMultipartUploadsData && listMultipartUploadsData.Uploads.length > 0) {
            listMultipartUploadsData.Uploads.forEach((uploadInfo) => {
              if (uploadInfo.Key == fileName) {
                existedUploadInfo = uploadInfo;
              } else {
                if (uploadInfo.Key.indexOf($this.id) >= 0) {
                  existedPreUploadInfo = uploadInfo;
                }
              }
            });
          }
          if (existedUploadInfo) {
            let existedUploadId = existedUploadInfo.UploadId;
            // 查询上传任务已完成分片
            s3.listParts({
              Bucket: bucketName,
              Key: fileName,
              MaxParts: 10000,
              UploadId: existedUploadId
            }).promise()
              .then(listPartsData => {
                let completeInfo = [];
                let doneParts = 0;
                let preUploadedBytes = 0;
                // 过滤掉分片大小与本次请求不一致的分片
                listPartsData.Parts
                  .filter(partInfo => (partInfo.Size == partSize))
                  .forEach(partInfo => {
                    completeInfo[partInfo.PartNumber] = {
                      ETag: partInfo.ETag,
                      PartNumber: partInfo.PartNumber
                    }
                    doneParts++;
                    preUploadedBytes += partInfo.Size;
                });
                ////////////////////重点 - 修改 AWS.S3.ManagedUpload私有字段, 实现断点续传////////////
                upload.completeInfo = completeInfo;
                upload.doneParts = doneParts;
                ////////////////////重点 - 修改 AWS.S3.ManagedUpload私有字段, 实现断点续传////////////
                upload.preUploadedBytes = preUploadedBytes;
                if (doneParts == 0) {
                  // 当前文件存在碎片信息，但是分片大小与本地不一致 - 丢弃
                  s3.abortMultipartUpload({
                    Bucket: bucketName,
                    Key: fileName,
                    UploadId: existedUploadId
                  }).promise()
                    .then(() => {
                      upload.send($this.doneCallback);
                    });
                } else if (doneParts < Math.ceil(file.size/partSize)) {
                  // 断点续传
                  uploadConfig.params.UploadId = existedUploadId;
                  upload.configure(uploadConfig);
                  upload.send($this.doneCallback);
                } else {
                  // 所有分片都在服务端已存在，前次调用finishMultiPart失败的场景
                  upload.callback = $this.doneCallback;
                  upload.finishMultiPart();
                }
              });
          } else {
            if (existedPreUploadInfo) {
              // 清除上次上次分片信息
              s3.abortMultipartUpload({
                Bucket: bucketName,
                Key: existedPreUploadInfo.Key,
                UploadId: existedPreUploadInfo.UploadId
              }).promise().then(() => {
                upload.send($this.doneCallback);
              });
            } else {
              // 不存在碎片信息
              upload.send($this.doneCallback);
            }
          }
        });
        $this.s3ManagedUpload = upload;
        upload.on('httpUploadProgress', (progress) => {
          $this.loaded = progress.loaded + upload.preUploadedBytes;
          $this.total = progress.total;
        });
      }
    },
    async waitConcatAndSave(bucketName, fileName, s3ManagedUpload) {
      const $this = this;
      const uploadId = s3ManagedUpload.service.config.params.UploadId;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `node-api/fake-s3/${bucketName}/${fileName}/concat-progress?uploadId=${uploadId}`
        });
        if (res.concat < res.total) {
          $this.timeoutHandler = setTimeout(() => {
            $this.waitConcatAndSave(bucketName, fileName, s3ManagedUpload);
          }, 1000);
        } else {
          $this.saveToGlance(bucketName, fileName, $this.id, uploadId);
        }
      } catch (e) {
        $this.timeoutHandler = setTimeout(() => {
          $this.waitConcatAndSave(bucketName, fileName, s3ManagedUpload);
        }, 1000);
        __DEV__ && console.error(e);
      }
    },
    async saveToGlance(bucketName, fileName, imageId, uploadId) {
      const $this = this;
      const res = await $this.$ajax({
        type: 'post',
        url: `node-api/fake-s3/save-to-glance/${imageId}`,
        contentType: 'application/json',
        data: JSON.stringify({
          uploadId: uploadId,
          bucketName: bucketName,
          fileName: fileName
        })
      });
      $this.$emit('refresh');
      $this.close();
    },
    doneCallback(err, data) {
      const $this = this;
      $this.cancelable = false;
      if (err) {
        $this.saving = false;
      } else {
        if ('Location' in data) { // 不需要合并的，直接保存到glance
          $this.saveToGlance(data.Bucket, data.Key, $this.id);
        } else { // 需要合并的，等合并
          $this.waitConcatAndSave(data.Bucket, data.Key, $this.s3ManagedUpload);
        }
      }
    }
  },
  mounted() {
    if (this.id === '') {
      throw new Error('Image Break Resume: id is required!');
    }
    if (this.file !== null) {
      this._file = this.file;
      this.name = this.file.name;
      this.save();
    }
  },
  beforeDestroy() {
    if (this.timeoutHandler !== null) {
      clearTimeout(this.timeoutHandler);
    }
    if (this.s3ManagedUpload !== null) {
      this.s3ManagedUpload.abort();
    }
  }
}
</script>

<style scoped>
.break-resume >>> .el-dialog {
  width: 600px;
}
</style>