<template>
  <el-dialog
  :title="$t('calcStorLang.rename')"
  :visible.sync="dialogVisible"
  :before-close="handleClose"
  size="tiny">
    <el-form ref="editInstanceForm" :model="Instance" label-width="50px" :rules="rules">
      <el-form-item  :label="$t('lang.name')" class="is-required" prop="name">
       <el-input v-model="Instance.name"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddIppool" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'EditInstance',
  props: ['instName', 'instUuid'],
  data() {
    return {
      Instance: {
        name: ""
      },
      dialogVisible: false,
      saving: false,
      rules: {
        name: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 40},
          { type: 'onlyLetter_MinusNumberChinese' }
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.editInstanceForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.Instance.name = this.instName.replace("Bare@", "");
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    },
    confirmAddIppool() {
      var self = this;
      this.$refs.editInstanceForm.validate(async (valid) => {
        if (valid) {
          self.saving = true;
          var body = { "server": {"name": this.Instance.name} };
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: "api/nova/v2.1/servers/" + this.instUuid,
              data: body,
              type: 'put',
              log: {
                description: {
                  en: "Rename Instance" + self.instName + "to" + self.Instance.name,
                  zh_cn: "重命名云物理机" + self.instName + "为" + self.Instance.name
                },
                key: "name",
                target: Vue.logTarget.computePhysical
              },
              successMsg: "成功重命名！"
            });
            self.saving = true;
            self.$emit("handleShow", {});
            self.$emit("onRefresh");
          } catch (data) {
            self.saving = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    }
  }
}
</script>
