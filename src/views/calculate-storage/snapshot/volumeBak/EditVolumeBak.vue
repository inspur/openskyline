<template>
  <el-dialog :title="$t('storage.editVolBak')" :visible.sync="visible" :before-close="cancelFun" v-dialogDrag>
    <el-form ref="editVolumeBakForm" class="me-required-form" :model="editVolumeBakForm" label-position="left" label-width="80px" :rules="rules" v-loading="saving">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-8" v-model="editVolumeBakForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-8" v-model="editVolumeBakForm.description" @keydown.native="noEnter($event)" auto-complete="off" type="textarea"></el-input>
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
  name: "editVolume",
  props: ["volumeBakId", "volumeBakEntity"],
  data() {
    return {
      editVolumeBakForm: {
        name: "",
        description: ""
      },
      visible: false,
      saving: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 255 },
          { type: 'onlyLetter_NumberChinese' }
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
  methods: {
    noEnter(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        return false;
      }
    },
    initDialog() {
      var self = this;
      self.visible = true;
      self.editVolumeBakForm.name = this.volumeBakEntity.name;
      self.editVolumeBakForm.description = this.volumeBakEntity.description || "";
    },
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      let self = this;
      self.$refs.editVolumeBakForm.validate(async (valid) => {
        if (valid) {
          self.saving = true;
          var Pid = this.$cookie.get("pid");
          let name = self.editVolumeBakForm.name;
          let desc = self.editVolumeBakForm.description;
          let url = "api/cinderv3/v3/" + Pid + "/backups/" + self.volumeBakId;
          let body = {
            "backup": {
              "name": name,
              "description": desc
            }
          };
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: 'PUT',
              errorKey: "message",
              headers: {
                "OpenStack-API-Version": "volume 3.52"
              },
              log: {
                description: {
                  en: "Edit volume " + "(" + self.volumeBakId + ")[Before the name is edited:" + (self.volumeBakEntity.name || self.volumeBakEntity.id) + ",after editing:" + name + "]",
                  zh_cn: "编辑云硬盘备份" + "(" + self.volumeBakId + ")[名称编辑前:" + (self.volumeBakEntity.name || self.volumeBakEntity.id) + ",编辑后:" + name + "]"
                },
                target: Vue.logTarget.storage_volume_backup
              },
              successMsg: Vue.t("calcStorLang.updateSuccess"),
              successFun: () => {
                self.$emit("handlerEditShow", {});
                self.$emit("onRefresh", {});
              },
              errFun: () => {
                self.saving = false;
              }
            });
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
      this.$emit("handlerEditShow");
    },
    changeFlagValue() { }
  }
}
</script>