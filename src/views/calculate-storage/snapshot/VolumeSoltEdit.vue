<template>
  <el-dialog :title="$t('storage.editVolumeSnapShot')" :visible.sync="visible" :before-close="cancelFun">
    <el-form ref="editVolumeSoltForm" class="me-required-form" :model="editVolumeSoltForm" label-width="100px" :rules="rules"
    label-position="left">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="editVolumeSoltForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="editVolumeSoltForm.description" @keydown.native="noEnter($event)" auto-complete="off" type="textarea"></el-input>
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
  name:"editVolumeSolt",
  props: ["volumSoltName", "volumSoltId", "volumSoltDesc"],
  data() {
    return {
      saving: false,
      editVolumeSoltForm:{
        name:"",
        description:""
      },
      visible:false,
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 255},
          {type: 'onlyLetter_MinusNumberChineseSp'}
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
    noEnter(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        return false;
      }
    },
    initDialog() {
      var self = this;
      self.visible = true;
      self.editVolumeSoltForm.name = self.volumSoltName;
      self.editVolumeSoltForm.description = self.volumSoltDesc;
    },
    confirmFun() {
      let self = this;
      self.$refs.editVolumeSoltForm.validate(async(valid) => {
      if (valid) {
        self.saving = true;
        var Pid = this.$cookie.get('pid');
        let name = self.editVolumeSoltForm.name;
        let desc = self.editVolumeSoltForm.description;

        let url = "api/cinderv3/v3/" + Pid+ "/snapshots/"+self.volumSoltId;
        let body = {
          "snapshot": {
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
            successMsg: this.$t('storage.editVolSnapShotSuccess'),
            errorKey: "message",
            log:{
              description:{
                en:"Edit volume snapshot(" + self.volumSoltId + ")[Before the name is edited:" + self.volumSoltName + ",after editing:" + name + "]",
                zh_cn:"编辑云硬盘快照(" + self.volumSoltId + ")" + "[名称编辑前:" + self.volumSoltName + ",编辑后:" + name + "]"
              },
              target:Vue.logTarget.storage_volume_snapshot
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
      self.editVolumeSoltForm.name = "";
      self.editVolumeSoltForm.description = "";
      this.$emit("handlEditShow");
    }
  }
}
</script>