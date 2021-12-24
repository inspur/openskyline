<template>
  <el-dialog :title="$t('storage.editVol')" :visible.sync="visible" :before-close="cancelFun" v-dialogDrag>
    <el-form ref="editVolumeForm" class="me-required-form" :model="editVolumeForm" label-position="left" label-width="80px" :rules="rules">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="editVolumeForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="editVolumeForm.description" auto-complete="off" type="textarea"></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.bootable')"  class="is-required" prop="bootable">
        <el-switch v-model ="editVolumeForm.bootable" :on-text="$t('storage.yes')" :off-text="$t('storage.no')" @change="changeFlagValue" :disabled="editVolumeForm.multiattach"></el-switch>
        <el-tooltip v-show="editVolumeForm.multiattach" placement="top" trigger="hover" :content="$t('storage.shareDiskNoBootable')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFun">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"editVolume",
  props: ["volumeTempId", "volumeEntity"],
  data() {
    return {
      saving: false,
      editVolumeForm:{
        name:"",
        description:"",
        bootable:"",
        multiattach:""
      },
      size:2,
      visible:false,
      soltFlag:false,
      imageFlag:false,
      volumeFlag:false,
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 255},
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        description: [
          { trigger: 'blur change' },
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
  },
  methods:{
    initDialog() {
      var self = this;
      self.visible = true;
    },
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      let self = this;
      self.$refs.editVolumeForm.validate(async(valid) => {
      if (valid) {
      self.saving = true;
      var Pid = this.$cookie.get('pid');
      let name = self.editVolumeForm.name;
      let desc = self.editVolumeForm.description;

      let url = "api/cinderv3/v3/" + Pid+ "/volumes/" + self.volumeTempId;
      let body = {
        "volume": {
          "name": name,
          "description": desc
        }
      };
      body = JSON.stringify(body);
      try {
        let ret = await this.$ajax({
          url: url,
          data: body,
          type: 'put',
         // successMsg: "成功编辑云硬盘名称描述！",
          errorKey: "message",
          log:{
            description:{
              en:"Edit volume " + "(" + self.volumeTempId + ")[Before the name is edited:" + (self.volumeEntity.name || self.volumeEntity.id) + ",after editing:" + name + "]",
              zh_cn:"编辑云硬盘" + "(" + self.volumeTempId + ")[名称编辑前:" + (self.volumeEntity.name || self.volumeEntity.id) + ",编辑后:" + name + "]"
            },
            target:Vue.logTarget.storage_volume
          }
        });
        if (self.volumeEntity.multiattach) {
          self.$emit("handlerEditShow", {});
          self.$emit("onRefresh", {});
          self.$message.success(Vue.t('storage.editVolSuccess'));
        } else {
          await this.confirmBootableFun();
        }
      } catch (data) {
        self.saving = false;
        __DEV__ && console.error(data);
      }
/*        this.$emit("handlerEditShow", {});
        this.$emit("onRefresh", {});*/
      } else {
          return false;
        }
      });
    },
    async confirmBootableFun() {
      let self = this;
      var Pid = this.$cookie.get('pid');
      let bootable = self.editVolumeForm.bootable;
      let url = "api/cinderv3/v3/" + Pid+ "/volumes/"+self.volumeTempId+"/action";
        let body = {
          "os-set_bootable": {
            "bootable": bootable
          }
        };
        body = JSON.stringify(body);
        try {
          let retBootable = await this.$ajax({
            url: url,
            data: body,
            type: 'post',
            successMsg: this.$t('storage.editVolSuccess'),
            errorKey: this.$t('storage.editVolNameDescSuccess')+"message",
            successFun() {
            self.$emit("handlerEditShow", {});
            self.$emit("onRefresh", {});
          }
        });
        } catch (data) {
          __DEV__ && console.error(data);
        }
      },
    cancelFun() {
      this.$emit("handlerEditShow");
    },
    changeFlagValue() {}
  }
}
</script>