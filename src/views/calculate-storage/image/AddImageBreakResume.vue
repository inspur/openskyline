<template>
  <div>
    <el-dialog
      class="add-image"
      :title="$t('calcStorLang.createImage')"
      :visible.sync="dialogVisible"
      :before-close="handleClose">
      <el-form :model="newImage" :rules="rules" ref="uploadImageForm" label-position="left" label-width="160px">
        <el-form-item :label="$t('calcStorLang.imageName')" prop="name" class="is-required">
          <el-input class="col-10" v-model="newImage.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.imageDesc')" prop="desc">
          <el-input class="col-10" v-model="newImage.desc" auto-complete="off" type="textarea"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.CREATE_IMAGE_SOURCE')" class="is-required">
          <el-radio-group v-model="newImage.source">
            <el-radio label="upload">{{ $t('calcStorLang.CREATE_IMAGE_SOURCE_UPLOAD') }}</el-radio>
            <el-radio label="import">{{ $t('calcStorLang.CREATE_IMAGE_SOURCE_IMPORT') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item key="sourceUpload" v-if="newImage.source === 'upload'" :label="$t('calcStorLang.imageFile')" class="is-required">
          <el-upload
            class="col-10"
            ref="uploadImageFile"
            action=""
            :data="uploadData"
            :on-success="handleSuccess"
            :on-error="handleError"
            :on-change="handleChange"
            :on-remove="handleRemove"
            :before-upload="handleBefore"
            :multiple="false"
            :auto-upload="false"
            :show-file-list="true"
            :http-request="upload"
          >
            <el-button slot="trigger" size="small" type="primary">{{$t('calcStorLang.selectFile')}}</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item key="sourceImport" v-if="newImage.source === 'import'" :label="$t('calcStorLang.CREATE_IMAGE_URL')" prop="url" class="is-required">
          <el-input class="col-10" v-model="newImage.url" />
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.imageType')" prop="imageFormat" class="is-required">
          <el-select v-model="newImage.imageFormat" class="col-10" @change="imageFormatChange">
            <el-option v-for="(item, index) in netTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.imageTypeWarn')" v-show="newImage.imageFormat!='iso'">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
          <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.imageTypeWarn2')" v-show="newImage.imageFormat=='iso'">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.os')" prop="operSystem" class="is-required">
          <el-cascader
            class="col-10"
            :options="operSystemOptions"
            :show-all-levels="false"
            v-model="newImage.operSystem"
            filterable
          />
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.minDisk')" prop="minDisksize">
          <el-col :span="10">
            <el-input-number v-model="newImage.minDisksize" :min="0" :max="2147483647" size="small" ></el-input-number>
          </el-col>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.minMemory')" prop="minStoresize">
          <el-col :span="10">
            <el-input-number v-model="newImage.minStoresize" :min="0" :max="1048576" size="small" ></el-input-number>
        </el-col>
        </el-form-item>
        <el-form-item :label="$t('base.project')" prop="owner" class="is-required" v-if="roleType === '0'">
          <el-select v-model="newImage.owner" filterable class="col-10">
            <el-option v-for="(item, index) in projects" :key="index" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.visibility')">
          <el-select v-model="newImage.imageVisibility" class="col-10">
            <el-option :label="$t('lang.public')" value="public" v-show="roleType==='0'"></el-option>
            <el-option :label="$t('lang.private')" value="private"></el-option>
            <el-option :label="$t('calcStorLang.shared')" value="shared"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.imageProject')">
          <el-col :span="10">
              <el-switch v-model="newImage.imageProject" :on-text="$t('lang.yes')" :off-text="$t('lang.no')"></el-switch>
          </el-col>
        </el-form-item> 
        <el-collapse class="col-24">
          <el-collapse-item :title="$t('calcStorLang.advanceOptions')" name="11">
            <el-form-item :label="$t('calcStorLang.qga')" v-if="false">
              <el-col :span="10">
                <el-switch v-model="newImage.qga" :on-text="$t('lang.yes')" :off-text="$t('lang.no')"></el-switch>
              </el-col>
              <el-col :span="10">
                <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.qgaInfo')">
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-col>
            </el-form-item>
            <el-form-item :label="$t('calcStorLang.architecture')" prop="architecture">
              <el-input class="col-10" v-model="newImage.architecture" auto-complete="off"></el-input>
                <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.architectureWarn')">
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('calcStorLang.kernel')" prop="count">
              <el-select class="col-10" v-model="newImage.core">
                  <el-option v-for="(item, index) in coreOptions" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.kernelWarn')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('calcStorLang.ramDisk')" prop="ramDisk">
              <el-select class="col-10" v-model="newImage.ramdisk">
                <el-option v-for="(item, index) in ramdiskOptions" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.ramDiskWarn')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
          <div>
            <el-button type="text" @click="showCliTips">{{ $t('calcStorLang.ADD_IMAGE_USE_CLI_TIPS') }}</el-button>
          </div>
          <div>
            <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
            <el-button @click="save" type="primary" :loading="saving">{{$t('calcStorLang.create')}}</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      class="cli-tips"
      :title="$t('calcStorLang.ADD_IMAGE_USE_CLI_TIPS')"
      :visible.sync="cliTipsDialog.visible">
      <div v-html="$t('calcStorLang.ADD_IMAGE_USE_CLI_TIPS_CONTENT')" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="cliTipsDialog.visible = false">{{$t('lang.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
const AWS = require('aws-sdk');
import osJson from './OsJson.json';
import isoOsJson from './OsIsoJson';
export default {
  name: 'AddImage',
  data() {
    return {
      roleType: String(Vue.roleType),
      flag: false,
      dialogVisible: false,
      loading: false,
      saving: false,
      newImage: {
        name: '',
        desc: '',
        imageFormat: 'qcow2',
        operSystem: [],
        architecture: "",
        core:'',
        ramdisk:'',
        count: '',
        minDisksize: 0,
        minStoresize: 0,
        owner: '',
        imageVisibility:(Vue.roleType + '' === '0') ? 'public':'private',
        imageProject: false,
        qga: true,
        source: 'upload',
        url: ''
      },
      uploadData: {
        "imageUuid": ''
      },
      projects: [],
      adminProjectId: '',
      fileList: [],
      netTypeOptions:[{value:'qcow2', label:'qcow2'}, {value:'raw', label:'raw'}, {value:'aki', label:'aki'}, {value:'ari', label:'ari'}, {value:'iso', label:'iso'}],
      operSystemOptions:[],
      architectureOptions:[{value:'1', label:'架构1'}, {value:'2', label:'架构2'}, {value:'3', label:'架构3'}],
      coreOptions:[],
      ramdiskOptions:[],
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        desc: [
          { type: 'maxSize', value: 255 }
        ],
        url: [
          { type: 'required' },
          { type: 'imageURL' }
        ],
        minDisksize: [
          { type: 'integer' },
          { type: 'min', value: 0 },
          { type: 'max', value: 2147483647 }
        ],
        minStoresize: [
          { type: 'integer' },
          { type: 'min', value: 0 },
          { type: 'max', value: 1048576 }
        ],
        operSystem: [
          { type: 'required', trigger: 'blur change' }
        ],
        owner: [
          { type: 'required', trigger: 'blur change' }
        ]
      },
      cliTipsDialog: {
        visible: false
      },
      cliTipsContent: Vue.t('calcStorLang.ADD_IMAGE_USE_CLI_TIPS_CONTENT')
    }
  },
  methods: {
    initDialog() {
      var $this = this;
      $this.dialogVisible = true;
    },
    async submit() {
      var $this = this;
      $this.saving = true;

      let name = $this.newImage.name;
      let desc = $this.newImage.desc;
      let imageFormat = $this.newImage.imageFormat;
      let minDisksize = $this.newImage.minDisksize;
      let minStoresize = $this.newImage.minStoresize;
      //受保护性和可见性
      let owner = $this.newImage.owner;
      let imageVisibility = $this.newImage.imageVisibility;
      let imageProject = $this.newImage.imageProject;
      let qga = $this.newImage.qga==true?"yes":"no";

      let osDistro = $this.newImage.operSystem[1].system;
      let osType = $this.newImage.operSystem[1].osType;
      let imageType = $this.newImage.imageFormat;
      let kernelId = $this.newImage.core;
      let ramdiskId = $this.newImage.ramdisk;
      let architecture = $this.newImage.architecture;
      var tags = [];

      let url = "api/glance/v2/images";
      let body = {
          "container_format": "bare",
          "name": name,
          "description": desc,
          "disk_format": imageFormat,
          "os_distro": osDistro,
          "os_type": osType,
          "image_type": "image",
          "min_disk": minDisksize,
          "min_ram": minStoresize,
          "owner": owner,
          "visibility": imageVisibility,
          "protected": imageProject,
          "hw_qemu_guest_agent": qga
        };
        if (qga === 'no') {
          delete body.hw_qemu_guest_agent;
        }
      if (typeof kernelId !== "undefined" && kernelId !== "") {
        body["kernel_id"] = kernelId;
      }
      if (typeof ramdiskId !== "undefined" && ramdiskId !== "") {
        body["ramdisk_id"] = ramdiskId;
      }
      if (typeof architecture !== "undefined" && architecture !== "") {
        body["architecture"] = architecture;
      }
      //共享属性赋值
      let roleType = Vue.roleType + "";
      body = JSON.stringify(body);
      try {
        let ret = await this.$ajax({
          url: url,
          data: body,
          type: 'post',
          log: {
              description: {
                en: 'Add image:' + name,
                zh_cn: '添加镜像: ' + name
              },
              key: 'name',
              target: Vue.logTarget.computeMirror
           }
        });
        let uuid = ret.id;
        if ($this.newImage.source === 'upload') {
          $this.uploadData.imageUuid = uuid;
          $this.submitUpload();
        } else {
          $this.submitImport(uuid);
        }
      } catch (data) {
        $this.saving = false;
        __DEV__ && console.error(data);
      }
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleAddShow", {});
    },
    save() {
      var $this = this;
      $this.$refs.uploadImageForm.validate(async (valid) => {
        if (valid) {
          if ($this.newImage.source === 'upload') {
            if ($this.fileList === null || $this.fileList === "" || $this.fileList.length === 0) {
              $this.$message({
                showClose: true,
                message: Vue.t('calcStorLang.needImage'),
                type: 'warning'
              });
            } else if ($this.fileList.length > 1) {
              $this.$message({
                showClose: true,
                message: Vue.t('calcStorLang.onlyOne'),
                type: 'warning'
              });
            } else {
              var file = $this.fileList[0];
              var fileName = file.name;
              var fileType = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
              $this.submit();
            }
          } else if ($this.newImage.source === 'import') {
            $this.saving = true;
            if (!(await $this.checkURLExists($this.newImage.url))) {
              $this.$message.error($this.$t('calcStorLang.IMAGE_IMPORT_WRONG_URL'));
              $this.saving = false;
            } else {
              $this.submit();
            }
          }
        } else {
          return false;
        }
      });
    },
    async checkURLExists(url) {
      const $this = this;
      const res = await $this.$ajax({
        type: 'post',
        contentType: 'application/json',
        url: 'node-api/checkUrlExists',
        data: JSON.stringify({
          url: url
        })
      });
      const exists = res.errCode === 0;
      return exists;
    },
    handleBefore(file) {
      var $this = this;
    },
    submitUpload() {
       this.$refs.uploadImageFile.submit();
    },
    async submitImport(id) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'post',
          url: `api/glance/v2/images/${id}/import`,
          data: JSON.stringify({
            method: {
              name: 'web-download',
              uri: $this.newImage.url
            }
          }),
          showErrMsg: true
        });
        $this.$message(Vue.t('calcStorLang.addImageSuccessfully'));
        $this.$emit("handleAddShow", {});
        setTimeout(() => {
          $this.$emit("onRefresh", {});
        }, 500);
      } catch (e) {
        $this.saving = false;
        __DEV__ && console.error(e);
      }
    },
    imageFormatChange(value) {
      var $this = this;
      $this.newImage.operSystem = [];
      if (value == "iso") {
        $this.loadIsoOsList();
      } else {
        $this.loadOsList();
      }
    },
    handleSuccess(res, file, fileList) {
      const $this = this;
      $this.$message(Vue.t('calcStorLang.addImageSuccessfully'));
      $this.$emit("onRefresh");
      $this.cancel();
    },
    handleError(err, file, fileList) {
      var $this = this;
      if ((file.percentage + "") != "100" && file.status == "fail") {
        $this.$notify.error({
          message: file.name + Vue.t("calcStorLang.imageUploadErrorTip"),
          duration:8000
        })
      }
    },
    handleChange(file, fileList) {
      var $this = this;
      var isIE = $this.isIE();
      if (isIE) {
        var size = file.size;
        if (size > (4 * 1024 * 1024 * 1024)) {
          $this.$message({
            showClose: true,
            message: Vue.t("lang.ie4GTip"),
            type: 'warning'
          });
          $this.$refs.uploadImageFile.clearFiles();
        } else {
          if (fileList.length > 1) {
            fileList.splice(0, fileList.length - 1);
          }
          $this.fileList = fileList;
        }
      } else {
        if (fileList.length > 1) {
          fileList.splice(0, fileList.length - 1);
        }
        $this.fileList = fileList;
      }
    },
    isIE() {
      if (!!window.ActiveXObject || "ActiveXObject" in window) {
        return true;
      } else {
        return false;
      }
    },
    handleRemove(file, fileList) {
      var $this = this;
      $this.fileList = fileList;
    },
    loadOsList() {
      let $this = this;
      let results = [];
      let list = osJson;
      for (let o = 0; o < list.length; o++) {
        let obj = {"value": list[o], "label": list[o].system, "distro": list[o].distro, "osType": list[o].osType};
        if ("fedora-atomic" == list[o].system) {
            obj = {"value": list[o], "label": "Fedora-atomic", "distro": list[o].distro, "osType": list[o].osType};
        }
        let distro = results.find(item => item.value === obj.distro);
        if (!distro) {
          distro = {
            value: obj.distro,
            label: obj.distro,
            children: []
          };
          results.push(distro);
        }
        distro.children.push(obj);
      }
      $this.operSystemOptions = results;
    },
    loadIsoOsList() {
      let $this = this;
      let results = [];
      let list = isoOsJson;
      for (let o = 0; o < list.length; o++) {
        let obj = {"value": list[o], "label": list[o].system, "distro": list[o].distro, "osType": list[o].osType};
        if ("fedora-atomic" == list[o].system) {
            obj = {"value": list[o], "label": "Fedora-atomic", "distro": list[o].distro, "osType": list[o].osType};
        }
        let distro = results.find(item => item.value === obj.distro);
        if (!distro) {
          distro = {
            value: obj.distro,
            label: obj.distro,
            children: []
          };
          results.push(distro);
        }
        distro.children.push(obj);
       }
       $this.operSystemOptions = results;
    },
    async loadimgs() {
      let $this = this;
      let result = await $this.$ajax({
          type: 'get',
          url: "api/glance/v2/images?limit=9999999",
          complete: function(XMLHttpRequest, textStatus) {
          }
        });
      let images = result.images;
      $this.coreOptions = [];
      $this.ramdiskOptions = [];
      for (var i in images) {
        let image = images[i];
        if (image["image_type"] == 'image' && image["disk_format"] && image["disk_format"] == 'aki') {
          $this.coreOptions.push({value:image["id"], label:image["name"]});
        }
        if (image["image_type"] == 'image' && image["disk_format"] && image["disk_format"] == 'ari') {
          $this.ramdiskOptions.push({value:image["id"], label:image["name"]});
        }
      }
    },
    async loadProjects() {
      const $this = this;
      const url = 'api/keystone/v3/projects?domain_id=default';
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: url
        });
        res.projects.forEach(item => {
          if (item.name === 'admin') {
            this.adminProjectId = item.id;
            this.newImage.owner = item.id;
          }
        });
        $this.projects = res.projects;
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    showCliTips() {
      this.cliTipsDialog.visible = true;
    },
    upload(options) {
      const $this = this;
      $this.$emit('start-upload', $this.uploadData.imageUuid, options.file);
      $this.$emit('refresh');
      $this.cancel();
    }
  },
  mounted() {
    this.$parent.$parent.active = "instances";
    this.initDialog();
    if (this.roleType === '0') {
      this.loadProjects();
    } else {
      this.newImage.owner = this.$cookie.get('pid');
    }
    this.loadOsList();
    this.loadimgs();
  },
  watch: {
    'newImage.owner'(value) {
      if (value === this.adminProjectId) {
        this.newImage.imageVisibility = 'public';
      } else {
        this.newImage.imageVisibility = 'private';
      }
    }
  }
}
</script>

<style scoped>
.add-image >>> .el-dialog {
  width: 800px;
}

.cli-tips >>> .el-dialog {
  width: 700px;
}
</style>
