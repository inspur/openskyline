<template>
  <el-dialog :title="$t('lang.edit')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="editImageForm" :model="Image" class="me-required-form" label-width="160px" :rules="rules" label-position="left">
      <el-form-item  :label="$t('lang.name')" class="is-required" prop="name">
        <el-input v-model="Image.name" class="col-10" :disabled="isEditFlag"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-10" v-model="Image.description" auto-complete="off" type="textarea"></el-input>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.minDisk')" prop="min_disk">
        <el-col :span="10">
          <el-input-number v-model="Image.min_disk" :min="0" :max="2147483647" size="small" ></el-input-number>
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.minMemory')" prop="min_ram">
        <el-col :span="10">
          <el-input-number v-model="Image.min_ram" :min="0" :max="1048576" size="small" ></el-input-number>
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.os')" prop="operSystem" class="is-required">
        <el-cascader
          class="col-10"
          :options="operSystemOptions"
          :show-all-levels="false"
          v-model="Image.operSystem"
          />
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.protected')" prop="protected">
        <el-switch :on-text="$t('lang.yes')" on-value="true" :off-text="$t('lang.no')" off-value="false" v-model="Image.protected" style="float:;left;"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.visibility')" prop="imageVisibility" class="is-required">
        <el-col :span="10">
          <el-select v-model="Image.imageVisibility" class="col-10">
            <el-option :label="$t('lang.public')" value="public" v-show="(imageInfo.visibility == 'public' && size != '0') || (roleType=='0' && size != '0')"></el-option>
            <el-option :label="$t('calcStorLang.imagePrivate')" value="private"></el-option>
            <el-option :label="$t('calcStorLang.shared')" value="shared" v-show="!(imageInfo.image_type == 'snapshot' || imageInfo.image_type == 'backup')"></el-option>
          </el-select>
        </el-col>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirm" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import osJson from './OsJson.json';
export default {
  name: 'EditImage',
  props: ['imageInfo', 'size'],
  data() {
    return {
      Image: {
        name: "",
        description: "",
        protected: false,
        operSystem: [],
        min_disk: 0,
        min_ram: 0,
        imageVisibility: (this.size != "0")?(this.imageInfo.visibility):""
      },
      isEditFlag: false,
      operSystemOptions:[],
      dialogVisible: false,
      roleType: Vue.roleType + "",
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'onlyLetter_MinusNumberChinese'},
          {type: 'maxSize', value: 40}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ],
        min_disk: [
          { type: 'integer' },
          {type: 'min', value:  0},
          {type: 'max', value:  2147483647}
        ],
        min_ram: [
          { type: 'integer' },
          {type: 'min', value:  0},
          {type: 'max', value:  1048576}
        ],
        operSystem: [
          {type: 'required', trigger: 'blur change'}
        ],
        imageVisibility: [
          {type: 'required', trigger: 'blur change'}
        ]
      },
      saving: false
    }
  },
  updated() {
    var self = this;
    if (self.imageInfo['image_type'] == "backup") {
      self.rules.name = [];
    } else {
      self.rules.name = [
                          {type: 'required', trigger: 'blur change'},
                          {type: 'onlyLetter_MinusNumberChinese'},
                          {type: 'maxSize', value: 40}
                        ];
    }
  },
  mounted() {
    if (this.imageInfo['image_type'] == "backup") {
      this.isEditFlag = true;
    } else {
      this.isEditFlag = false;
    }
    this.loadOsList();
    //this.initForm = Object.assign({}, this.editImageForm);
    //this.ruleStore = Object.assign({}, this.rules);
    //this.initDialog();
  },
  methods: {
    initDialog() {
      var $this = this;
      $this.Image.name = this.imageInfo.name;
      if (typeof $this.imageInfo.description == "undefined") {
        $this.Image.description = "";
      } else {
        $this.Image.description = $this.imageInfo.description;
      }
      if (true == $this.imageInfo.protected) {
        $this.Image.protected = "true";
      } else {
        $this.Image.protected = "false";
      }
      if (typeof $this.imageInfo.os_distro != "undefined") {
        // 此处需要遍历查找operSystemOptions中的数据
        $this.operSystemOptions.forEach(item => {
          const systems = item.children;
          const os = systems.find(system => system.value.system === $this.imageInfo.os_distro);
          if (os) {
            $this.Image.operSystem = [os.distro, os.value];
          }
        })
      }
      $this.Image.min_ram = $this.imageInfo.min_ram;
      $this.Image.min_disk = $this.imageInfo.min_disk;
      $this.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("handleEditShow", {});
    },
    handleClose(done) {
      this.$emit("handleEditShow", {});
      done();
    },
    confirm() {
     this.$refs.editImageForm.validate(async (valid) => {
        if (valid) {
         this.confirmEditImage();
        } else {
          return false;
        }
      });
    },
    async confirmEditImage() {
      var self = this;
      self.saving = true;
      var body = [
        {"op":'add', "path":"/name", "value":self.Image.name},
        {"op":'add', "path":"/min_disk", "value":self.Image.min_disk},
        {"op":'add', "path":"/min_ram", "value":self.Image.min_ram},
        {"op":'add', "path":"/os_type", "value":self.Image.operSystem[1].osType}
        ];
      if (self.Image.imageVisibility != self.imageInfo.visibility) {
        body = [
        {"op":'add', "path":"/name", "value":self.Image.name},
        {"op":'add', "path":"/min_disk", "value":self.Image.min_disk},
        {"op":'add', "path":"/min_ram", "value":self.Image.min_ram},
        {"op":'add', "path":"/visibility", "value":self.Image.imageVisibility},
        {"op":'add', "path":"/os_type", "value":self.Image.operSystem[1].osType}
        ];
      }
      if (typeof this.imageInfo.os_distro !== []) {
         body.push({"op":'add', "path":"/os_distro", "value":self.Image.operSystem[1].system});
      } else {
        body.push({"op":'add', "path":"/os_distro", "value":self.Image.operSystem[1].system});
      }
      if ("true" == self.Image.protected) {
        body.push({"op":'add', "path":"/protected", "value":true});
      } else {
        body.push({"op":'add', "path":"/protected", "value":false});
      }
      if (typeof self.imageInfo.description == "undefined") {
        if ("" != self.Image.description && (typeof self.Image.description != "undefined")) {
          body.push({"op":'add', "path":"/description", "value":self.Image.description});
        }
      } else {
        if ('' == self.Image.description) {
          body.push({"op":'remove', "path":"/description", "value":self.imageInfo.description});
        } else {
          body.push({"op":'add', "path":"/description", "value":self.Image.description});
        }
      }
      let url = "api/glance/v2/images/" + self.imageInfo.id;
      body = JSON.stringify(body);
      var logImageType = self.imageInfo['image_type'];
      var logMsgDesc = {"zh_cn":"编辑镜像(" + self.imageInfo.id + ")[名称编辑前:" + self.imageInfo.name + ",编辑后:" + self.Image.name + "]", "en":"Edit image(" + self.imageInfo.id + ")[Before the name is edited:" + self.imageInfo.name + ",after editing:" + self.Image.name + "]"};
      var logTarget = Vue.logTarget.computeMirror;
      var successMsgTip = Vue.t('calcStorLang.editSuccessfully');
      if ("snapshot" == logImageType || "backup" == logImageType) {
        logMsgDesc = {
          zh_cn: `编辑快照(${self.imageInfo.id})[名称编辑前:${self.imageInfo.name},编辑后:${self.Image.name}][最小内存编辑前：${self.imageInfo.min_ram}MB，编辑后：${self.Image.min_ram}MB]`,
          en: `Edit snapshot(${self.imageInfo.id})[Before the name is edited:${self.imageInfo.name},after editing:${self.Image.name}][Before the min ram is edited: ${self.imageInfo.min_ram}MB, after editing: ${self.Image.min_ram}MB]`
        };
        logTarget = Vue.logTarget.computeInstanceSnapshot;
        successMsgTip = Vue.t('calcStorLang.editSnapshotSuccessfully');
      }
      try {
        let ret = await this.$ajax({
          url: url,
          data: body,
          contentType: "application/openstack-images-v2.1-json-patch",
          type: 'patch',
          successMsg: successMsgTip,
          log: {
              description: logMsgDesc,
              target: logTarget
           },
          errorKey: "message"
        });
        this.$emit("onRefresh", {});
        this.$emit("handleEditShow", {});
      } catch (data) {
        self.loading = false;
        __DEV__ && console.error(data);
      }
      self.saving = false;
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
    getDescObject(oldValue, newValue) {
      if (oldValue == newValue) {
        return '';
      }
      if ('' == oldValue) {
        //新增的
        return {"op":'add', "path":"/description", "value":newValue}
      }
      if ('' == newValue) {
        return {"op":'remove', "path":"/description", "value":newValue}
      }
    }
  }
}
</script> 