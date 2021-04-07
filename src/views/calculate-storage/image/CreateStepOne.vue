<template>
  <el-form class="margin-tb20 me-required-form" :model="newImage" :rules=rules ref="uploadImageForm" style="margin-top:0px" label-position="left" label-width="160px">
    <el-form-item :label="$t('calcStorLang.imageName')" prop="name" class="is-required">
      <el-input class="col-10" v-model="newImage.name" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.imageDesc')" prop="desc">
      <el-input class="col-10" v-model="newImage.desc" auto-complete="off" type="textarea"></el-input>
    </el-form-item>
    <el-form-item :label="$t('calcStorLang.imageFile')" class="is-required" v-if="fileFlag">
      <el-upload
        class="col-10"
        ref="uploadImageFile"
        action="../node-api/uploadTemplate"
        :data="uploadData"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-preview="handlePreview"
        :on-change="handleChange"
        :on-remove="handleRemove"
        :before-upload="handleBefore"
        :disabled="fileDisabled"
        :multiple="false"
        :auto-upload="false"
        :show-file-list="true">
        <el-button slot="trigger" size="small" type="primary">{{$t('calcStorLang.selectFile')}}</el-button>
        <!-- <el-button style="margin-left: 10px;" type="success" @click="submitUpload">上传到服务器
        </el-button> -->
        <!-- <div slot="tip" class="tip">只能上传qcow2和raw文件</div> -->
      </el-upload>
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
        <el-option :label="$t('calcStorLang.imagePrivate')" value="private"></el-option>
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
          <!-- <span>{{$t('calcStorLang.ramDisk')}}</span>
          <el-select class="col-9" v-model="newImage.ramdisk">
            <el-option v-for="item in ramdiskOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.ramDiskWarn')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip> -->
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
    <div class="me-form-footer">
      <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
        <div>
          <el-button type="text" @click="showCliTips">使用命令上传</el-button>
        </div>
        <div>
          <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
          <el-button @click="nextStep" type="primary">{{$t('calcStorLang.create')}}</el-button>
        </div>
      </div>
    </div>
  </el-form>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import osJson from './OsJson.json';
import isoOsJson from './OsIsoJson';
export default {
  name: 'StepOne',
  data() {
    return {
      activeIndex: 0,
      roleType: Vue.roleType + "",
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
        qga: true
      },
      uploadData: {
        "imageUuid": ''
      },
      projects: [],
      adminProjectId: '',
      fList: [],
      fileDisabled: false,
      fileFlag: true,
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
          { trigger: 'blur change' },
          { type: 'maxSize', value: 255 }
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
      widthStyle:{
        width:"80%"
      },
      diskpercentage:50,
      diskproStatus:"success",
      storepercentage:20,
      storeproStatus:"success",
      cliTipsDialog: {
        visible: false
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.newImageForm);
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
  },
  methods: {
    nextStep() {
      var self = this;
      self.$refs.uploadImageForm.validate((valid) => {
        if (valid) {
          if (self.fList == null || self.fList == "" || self.fList.length == 0) {
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
            var file = self.fList[0];
            var fileName = file.name;
            var fileType = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
           /* if (fileType == "qcow2" || fileType == "raw") {
               self.$emit("stepOneDone", {});
            } else {
               self.$message({
                showClose: true,
                message: "文件类型不符合！",
                type: 'warning'
              });
            }*/
            self.$emit("stepTwoDone", {});
          }
        } else {
          return false;
        }
      });
    },
    handleBefore(file) {
      var $this = this;
      $this.$message.warning(Vue.t('calcStorLang.IMAGE_UPLOAD_START'));
    },
    submitUpload() {
       this.$refs.uploadImageFile.submit();
    },
    imageFormatChange(value) {
      var self = this;
      self.newImage.operSystem = [];
      if (value == "iso") {
        self.loadIsoOsList();
      } else {
        self.loadOsList();
      }
    },
    handleSuccess(res, file, fileList) {
      var self = this;
      if (res["flag"]) {
        setTimeout(function() {
          self.$message(Vue.t('calcStorLang.addImageSuccessfully'));
          self.$emit("onRefreshData");
          self.$emit("cancel", {});
        }, 5000);
        return;
      }
      ( this.$message || {}).error(this.$t(res.errCode));
    },
    handleError(err, file, fileList) {
      var self = this;
      if ((file.percentage + "") != "100" && file.status == "fail") {
        /* self.$message({
          showClose: true,
          message: file.name + Vue.t("calcStorLang.imageUploadErrorTip"),
          type: 'error'
        }); */
        self.$notify.error({
          message: file.name + Vue.t("calcStorLang.imageUploadErrorTip"),
          duration:8000
        })
      }
    },
    handleChange(file, fileList) {
      var self = this;
      var isIE = self.isIE();
      if (isIE) {
        var size =file.size;
        // size =size/1024/1024/1024;
        if (size > (4 * 1024 * 1024 * 1024)) {
        self.$message({
                  showClose: true,
                  message: Vue.t("lang.ie4GTip"),
                  type: 'warning'
                });
        self.$refs.uploadImageFile.clearFiles();
        } else {
        self.fList = fileList;
        }
      } else {
        self.fList = fileList;
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
      var self = this;
      self.fList = fileList;
    },
    handlePreview(file) {
      console.log(file);
    },
    sizeChange(val) {
      var c = ((Number(val) + 1024)/2048).toFixed(2) * 100;
      this.diskproStatus = c > 100 ? "exception" : "success";
      this.diskpercentage = c > 100 ? 100 : c;
    },
    storesizeChange(val) {
      var p = (( Number(val) + 100)/500).toFixed(2) * 100;
      this.storeproStatus = p > 100 ? "exception" : "success";
      this.storepercentage = p > 100 ? 100 : p;
    },
    loadOsList() {
      let self = this;
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
      self.operSystemOptions = results;
    },
    loadIsoOsList() {
      let self = this;
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
       self.operSystemOptions = results;
    },
    async loadimgs() {
      let self = this;
      let result = await self.$ajax({
          type: 'get',
          url: "api/glance/v2/images?limit=9999999",
          complete: function(XMLHttpRequest, textStatus) {
          }
        });
      let images = result.images;
      self.coreOptions = [];
      self.ramdiskOptions = [];
      for (var i in images) {
        let image = images[i];
        if (image["image_type"] == 'image' && image["disk_format"] && image["disk_format"] == 'aki') {
          self.coreOptions.push({value:image["id"], label:image["name"]});
        }
        if (image["image_type"] == 'image' && image["disk_format"] && image["disk_format"] == 'ari') {
          self.ramdiskOptions.push({value:image["id"], label:image["name"]});
        }
      }
      // if (self.coreOptions.length > 0) {
      //   self.newImage.core = self.coreOptions[0].value;
      // }
      // if (self.ramdiskOptions.length > 0) {
      //   self.newImage.ramdisk = self.ramdiskOptions[0].value;
      // }
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
    cancel() {
      this.$emit("cancel");
    },
    showCliTips() {
      this.cliTipsDialog.visible = true;
    }
  }
}
</script>