<template>
  <el-dialog :title="$t('storage.editDocStoreSnapShot')" :visible.sync="visible" :before-close="cancelFun">
    <el-form ref="editShareSoltForm" class="me-required-form" :model="editShareSoltForm" label-width="100px" :rules="rules"
    label-position="left">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="editShareSoltForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="editShareSoltForm.description" auto-complete="off" type="textarea"></el-input>
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
  name:"editShareSolt",
  props: ["shareSoltName", "shareSoltId", "shareSoltDesc"],
  data() {
    return {
      saving: false,
      editShareSoltForm:{
        name:"",
        description:"",
        oldName:""
      },
      visible:false,
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 255},
          {type: 'onlyLetter_MinusNumber'}
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
      self.editShareSoltForm.name = self.shareSoltName;
      self.editShareSoltForm.oldName = self.shareSoltName;
      self.editShareSoltForm.description = decodeURI(self.shareSoltDesc);
    },
    confirmFun() {
      let self = this;
      self.$refs.editShareSoltForm.validate(async(valid) => {
      if (valid) {
        self.saving = true;
        var Pid = this.$cookie.get('pid');
        let name = self.editShareSoltForm.name;
        let desc = encodeURI(self.editShareSoltForm.description);

        let url = "api/manila/v2/" + Pid+ "/snapshots/"+self.shareSoltId;
        let body = {
          "snapshot": {
            "display_name": name,
            "display_description": desc
          }
        };
        body = JSON.stringify(body);
        try {
          let logMsg = {
            en:"Before the name is edited:"+self.editShareSoltForm.oldName+",after editing:"+name,
            zh:"名称编辑前:"+self.editShareSoltForm.oldName+",编辑后:"+name
          }
          let ret = await this.$ajax({
            url: url,
            data: body,
            type: 'put',
            successMsg: this.$t('storage.editDocStoreSnapShotSuccess'),
            errorKey: "message",
            log:{
              description:{
                en:"Edit Share snapshot:" + name + "(" + self.shareSoltId + ")"+"["+logMsg.en+"]",
                zh_cn:"编辑文件存储快照:" + name + "(" + self.shareSoltId + ")"+"["+logMsg.zh+"]"
              },
              target:Vue.logTarget.storage_share_snapshot
            }
          });
          this.$emit("handlEditShow", {});
          this.$emit("onRefresh", {});
        } catch (data) {
          self.saving = false;
          __DEV__ && console.error(data);
        }
      } else {
          return false;
        }
      });
    },
    cancelFun() {
      var self = this;
      self.visible = true;
      self.editShareSoltForm.name = "";
      self.editShareSoltForm.description = "";
      this.$emit("handlEditShow");
    }
  }
}
</script>