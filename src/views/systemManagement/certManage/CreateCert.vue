<template>
  <el-dialog  :title="$t('base.createCert')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="certForm" :model="certForm" class="me-required-form" label-width="140px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-15" v-model="certForm.name"></el-input>
      </el-form-item>
      <el-form-item
        :label="$t('base.certFile')"
        prop="certFile"
        class="is-required">
        <el-upload
          class="col-15"
          ref="uploadCertFile"
          action=""
          :on-change="handleFileSelectChange"
          :on-remove="handleFileRemove"
          :multiple="false"
          :auto-upload="false"
          :show-file-list="true"
        >
          <el-button slot="trigger" size="small" type="primary">{{$t('base.pleaseSelectFile')}}</el-button>
        </el-upload>
      </el-form-item>
      <el-row v-if="roleType == '0'">
        <span>{{$t('base.createCertNote')}}</span>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancelClick">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="addClick" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
const Base64 = require('js-base64').Base64;
export default {
  name: 'CreateCert',
  data() {
    let validCertFile = (rule, value, callback) => {
      let self = this;
      if (!self.certForm.certFile) {
        callback(new Error(self.$t('base.selectCertFile')));
      } else if (self.certForm.certFile.size <= 0) {
        callback(new Error(self.$t('base.errorEmptyCertFile')));
        self.errorCertFile = self.$t('base.errorEmptyCertFile');
      } else if (self.certForm.certFile.size > 7 * 1024) {
        callback(new Error(self.$t('base.errorExceedCertFileMaxSize')));
      } else {
        callback();
      }
    };
    return {
      dialogVisible: false,
      loading: false,
      saving: false,
      roleType: Vue.roleType + '',
      errorCertFile: "",
      certForm: {
        name: "",
        certFile: null
      },
      rules: {
        name: [
          {type: "required"},
          {type: 'onlyLetter_NumberChinese'},
          {type: 'forbiddenSpace'},
          {type: 'maxSize', value: 40}
        ],
        certFile: [
          {validator: validCertFile}
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
    if (!FileReader.prototype.readAsBinaryString) {
      FileReader.prototype.readAsBinaryString = function (fileData) {
        let binary = '';
        let self = this;
        let reader = new FileReader();
        reader.onload = function (e) {
          let bytes = new Uint8Array(reader.result);
          let length = bytes.byteLength;
          for (let i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          self.content = binary;
          self.onload(self);
        };
        reader.readAsArrayBuffer(fileData);
      };
    }
  },
  watch: {
    'certForm.certFile': {
      handler: function () {
        let self = this;
        self.$refs.certForm.validateField('certFile');
      }
    }
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
      let self = this;
    },
    handleFileSelectChange(file, fileList) {
      let self = this;
      self.certForm.certFile = file;
      if (fileList.length > 1) {
        fileList.splice(0, fileList.length - 1);
      }
    },
    handleFileRemove() {
      let self = this;
      self.certForm.certFile = null;
    },
    readFileContent() {
      let self = this;
      return new Promise((resolve, reject) => {
        let rawFile = self.certForm.certFile.raw;
        let reader = new FileReader();
        reader.onload = () => {
          let content = reader.content || reader.result;
          if (content) {
            resolve(content);
          }
        };
        reader.readAsBinaryString(rawFile);
      });
    },
    addClick() {
      let self = this;
      self.$refs.certForm.validate(async (valid) => {
        if (valid) {
          self.loading = true;
          self.saving = true;
          let certContent = await self.readFileContent();
          self.$ajax({
            type: "POST",
            url: "api/barbican/v1/secrets",
            data: JSON.stringify({
              name: self.certForm.name,
              payload: Base64.btoa(certContent),
              payload_content_type: 'application/octet-stream',
              payload_content_encoding: 'base64'
            }),
            successMsg:self.$t('base.createCertSuccess'),
            log:{
              description:{
                en:"Create Cert:" + self.certForm.name,
                zh_cn:"创建证书:" + self.certForm.name
              },
              target:Vue.logTarget.cert
            }
          }).then((data) => {
            self.loading = false;
            self.saving = false;
            self.$emit("handleAddPortShow", {});
          }).catch((error) => {
            self.loading = false;
            self.saving = false;
          });
          return true;
        } else {
          return false;
        }
      });
    },
    handleClose(done) {
      this.$emit("handelCancelShow", {});
    },
    cancelClick() {
      this.$emit("handelCancelShow", {});
    }
  }
}
</script>
