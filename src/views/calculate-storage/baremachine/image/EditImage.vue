<template>
  <el-dialog :title="$t('lang.edit')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="editImageForm" :model="Image" class="me-required-form" label-width="160px" :rules="rules" label-position="left">
      <el-form-item  :label="$t('lang.name')" class="is-required" prop="name">
        <el-input v-model="Image.name" class="col-10"></el-input>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.protected')" prop="protected">
        <el-switch :on-text="$t('lang.yes')" on-value="true" :off-text="$t('lang.no')" off-value="false" v-model="Image.protected" style="float:;left;"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-10" v-model="Image.description" auto-complete="off" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirm" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import osJson from '../../image/OsJson.json';
export default {
  name: 'EditImage',
  props: ['imageInfo'],
  data() {
    return {
      saving: false,
      Image: {
        name: "",
        description: "",
        protected: false,
        operSystem:""
      },
      operSystemOptions:[],
      dialogVisible: false,
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'onlyLetter_MinusNumberChinese'},
          {type: 'maxSize', value: 40}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ]
      }
    }
  },
  mounted() {
    // this.loadOsList();
    //this.initForm = Object.assign({}, this.editImageForm);
    //this.ruleStore = Object.assign({}, this.rules);
    //this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.Image.name = this.imageInfo.name;
      if (typeof this.imageInfo.description == "undefined") {
        self.Image.description = "";
      } else {
        self.Image.description = this.imageInfo.description;
      }
      if (true == this.imageInfo.protected) {
        self.Image.protected = "true";
      } else {
        self.Image.protected = "false";
      }
      if (typeof this.imageInfo.os_distro != "undefined") {
        self.Image.operSystem = this.imageInfo.os_distro;
      }
      // self.Image.min_ram = this.imageInfo.min_ram;
      // self.Image.min_disk = this.imageInfo.min_disk;
      self.dialogVisible = true;
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
      var body = [
        {"op":'replace', "path":"/name", "value": self.Image.name}
        ];
      if ("true" == self.Image.protected) {
        body.push({"op":'replace', "path":"/protected", "value":true});
      } else {
        body.push({"op":'replace', "path":"/protected", "value":false});
      }
      if (typeof self.imageInfo.description == "undefined") {
        if ("" != self.Image.description && (typeof self.Image.description != "undefined")) {
          body.push({"op":'add', "path":"/description", "value":self.Image.description});
        }
      } else {
        if ('' == self.Image.description) {
          body.push({"op":'remove', "path":"/description", "value":self.imageInfo.description});
        } else {
          body.push({"op":'replace', "path":"/description", "value":self.Image.description});
        }
      }
      let url = "api/glance/v2/images/" + self.imageInfo.id;
      body = JSON.stringify(body);
      try {
        self.saving = true;
        let ret = await this.$ajax({
          url: url,
          data: body,
          contentType: "application/openstack-images-v2.1-json-patch",
          type: 'patch',
          successMsg: this.$t('calcStorLang.BAREMETAL_IMAGE_EDIT_SUCCESSFULLY'),
          log: {
              description: {
                en: "Edit image(" + self.imageInfo.id + ")" + "[Before the name is edited:" + self.imageInfo.name + ",after editing:" + self.Image.name + "]",
                zh_cn: "编辑裸机镜像(" + self.imageInfo.id + ")[名称编辑前:" + self.imageInfo.name + ",编辑后:" + self.Image.name + "]"
              },
              target: Vue.logTarget.bareMachineImage
           },
          errorKey: "message"
        });
        this.$emit("onRefresh", {});
        this.$emit("handleEditShow", {});
      } catch (data) {
        self.saving = false;
        __DEV__ && console.error(data);
      }
    },
    loadOsList() {
       var self = this;
       var results = [];
       var list = osJson;
       for (let o = 0; o < list.length; o++) {
          var obj = {"value": list[o], "label": list[o]};
          if ("fedora-atomic" == list[o]) {
             obj = {"value": list[o], "label": "Fedora-atomic"};
          }
          results.push(obj);
       }
       self.operSystemOptions = results;
       return results;
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
