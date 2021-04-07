<template>
  <el-dialog
    :title="$t('calcStorLang.createImage')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form class="margin-tb20 me-required-form" :model="newImage" :rules=rules ref="uploadImageForm"  label-position="left" label-width="120px">
      <el-form-item :label="$t('calcStorLang.imageName')" prop="name" class="is-required">
        <el-input class="col-10" v-model="newImage.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.imageFile')" class="is-required">
        <el-upload
          class="col-10"
          ref="uploadImageFile"
          action=""
          :data="uploadData"
          :on-success="handleSuccess"
          :on-error="handleError"
          :on-preview="handlePreview"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :before-upload="handleBeforeUpload"
          :multiple="false"
          :auto-upload="false"
          :show-file-list="true"
          :http-request="upload">
          <el-button slot="trigger" size="small" type="primary">{{$t('calcStorLang.selectFile')}}</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item :label="$t('network.IMAGE_TYPE')" class="is-required">
        <el-radio-group v-model="newImage.imageType" @change="changeType">
          <el-radio class="radio" label="@">{{$t('network.USER_MIRRORING')}}</el-radio>
          <el-radio class="radio" label="$">{{$t('network.DEPLOYMENT_IMAGE')}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.diskFormat')" prop="imageFormat" class="is-required">
        <el-select v-model="newImage.imageFormat" class="col-10">
          <el-option v-for="item in diskFormatOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.imageTypeWarn')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.imageDesc')" prop="desc">
        <el-input class="col-10" v-model="newImage.desc" auto-complete="off" type="textarea"></el-input>
      </el-form-item>
      <el-collapse class="col-24">
        <el-collapse-item :title="$t('calcStorLang.advanceOptions')">
          <el-form-item :label="$t('calcStorLang.architecture')" prop="architecture">
            <el-input class="col-10" v-model="newImage.architecture" auto-complete="off"></el-input>
            <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.architectureWarn')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.kernel')">
            <el-select class="col-10" v-model="newImage.core" clearable>
              <el-option v-for="item in coreOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.kernelWarn')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('calcStorLang.ramDisk')">
            <el-select class="col-10" v-model="newImage.ramdisk" clearable>
              <el-option v-for="item in ramdiskOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.ramDiskWarn')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="checkAndSubmit" type="primary" :loading="saving">{{$t('calcStorLang.create')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'AddImage',
  data() {
    return {
      dialogVisible: false,
      saving: false,
      roleType: Vue.roleType + '',
      newImage: {
        name: '',
        desc: '',
        imageFormat: 'qcow2',
        architecture: '',
        core: '',
        ramdisk: '',
        imageType: '@'
      },
      uploadData: {
        imageUuid: ''
      },
      fList: [],
      diskFormatOptions: [{value:'qcow2', label:'qcow2'}, {value:'raw', label:'raw'}],
      coreOptions: [],
      ramdiskOptions: [],
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        desc: [
          { trigger: 'blur change' },
          { type: 'maxSize', value: 255 }
        ],
        imageFormat: [
          { type: 'required' }
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
    this.loadimgs();
  },
  methods: {
    initDialog() {
      let self = this;
      self.dialogVisible = true;
    },
    async submit() {
      this.saving = true;
      let imageType = this.newImage.imageType;
      let body = {
        container_format: 'bare',
        name: this.newImage.name,
        description: this.newImage.desc,
        disk_format: this.newImage.imageFormat,
        image_type: 'image',
        visibility: 'public',
        tags: [imageType, '*'],
        protected: false
      };
      if (this.newImage.core !== '') {
        body['kernel_id'] = this.newImage.core;
      }
      if (this.newImage.ramdisk !== '') {
        body['ramdisk_id'] = this.newImage.ramdisk;
      }
      if (this.newImage.architecture !== '') {
        body['architecture'] = this.newImage.architecture;
      }
      try {
        let ret = await this.$ajax({
          url: 'api/glance/v2/images',
          data: JSON.stringify(body),
          type: 'post',
          successMsg: Vue.t('calcStorLang.addImageSuccessfully'),
          log: {
            description: {
              en: `Add baremetal image: ${this.newImage.name}`,
              zh_cn: `添加裸机镜像: ${this.newImage.name}`
            },
            key: 'name',
            target: Vue.logTarget.bareMachineImage
          }
        });
        this.uploadData.imageUuid = ret.id;
        this.submitUpload();
        this.$emit('handleAddShow', {});
        this.$emit('onRefresh', {});
      } catch (data) {
        this.saving = false;
        __DEV__ && console.error(data);
      }
    },
    handleClose(done) {
      this.$emit('handleAddShow', {});
      done();
    },
    cancel() {
      this.$emit('handleAddShow', {});
    },
    onRefreshData() {
      this.$emit('onRefresh', {});
    },
    changeType(val) {
      this.newImage.imageFormat = '';
      switch (val) {
        case '@':
          this.newImage.imageFormat = 'qcow2';
          this.diskFormatOptions = [{value:'qcow2', label:'qcow2'}, {value:'raw', label:'raw'}];
          break;
        case '$':
          this.newImage.imageFormat = 'aki';
          this.diskFormatOptions = [{value:'aki', label:'aki'}, {value:'ari', label:'ari'}];
          break;
      }
    },
    checkAndSubmit() {
      let self = this;
      self.$refs.uploadImageForm.validate((valid) => {
        if (valid) {
          if (self.fList == null || self.fList == '' || self.fList.length == 0) {
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.needImage'),
              type: 'warning'
            });
          } else if (self.fList.length > 1) {
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.onlyOne'),
              type: 'warning'
            });
          } else {
            self.submit();
          }
        } else {
          return false;
        }
      });
    },
    handleBeforeUpload(file) {
      //
    },
    submitUpload() {
       this.$refs.uploadImageFile.submit();
    },
    handleSuccess(res, file, fileList) {
      let self = this;
      if (res['flag']) {
        self.$message(Vue.t('calcStorLang.addImageSuccessfully'));
        self.$emit('onRefreshData');
        self.$emit('handleAddShow', {});
        return;
      }
      ( this.$message || {}).error(this.$t(res.errCode));
    },
    handleError(err, file, fileList) {
      //
    },
    handleChange(file, fileList) {
      let self = this;
      let isIE = self.isIE();
      if (isIE) {
        let size = file.size;
        if (size > (4 * 1024 * 1024 * 1024)) {
          self.$message({
            showClose: true,
            message: Vue.t('lang.ie4GTip'),
            type: 'warning'
          });
          self.$refs.uploadImageFile.clearFiles();
        } else {
          if (fileList.length > 1) {
            fileList.splice(0, fileList.length - 1);
          }
          self.fList = fileList;
        }
      } else {
        if (fileList.length > 1) {
          fileList.splice(0, fileList.length - 1);
        }
        self.fList = fileList;
      }
    },
    isIE() {
      if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        return true;
      } else {
        return false;
      }
    },
    handleRemove(file, fileList) {
      let self = this;
      self.fList = fileList;
    },
    handlePreview(file) {
    },
    async loadimgs() {
      let self = this;
      let result = await self.$ajax({
        type: 'get',
        url: 'api/glance/v2/images?limit=9999999&tag=*'
      });
      let images = result.images;
      self.coreOptions = [];
      self.ramdiskOptions = [];
      for (let i in images) {
        let image = images[i];
        if (image['disk_format'] && image['disk_format'] == 'aki') {
          self.coreOptions.push({value:image['id'], label:image['name']});
        }
        if (image['disk_format'] && image['disk_format'] == 'ari') {
          self.ramdiskOptions.push({value:image['id'], label:image['name']});
        }
      }
    },
    upload(options) {
      const $this = this;
      $this.$emit('start-upload', $this.uploadData.imageUuid, options.file);
      $this.$emit('onRefresh');
      $this.cancel();
    }
  }
}
</script>
<style scoped>
</style>
