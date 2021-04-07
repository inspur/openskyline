<template>
  <el-dialog :title="$t('lang.edit') + $t('calcStorLang.hostAggregation')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="editHostForm" class="me-required-form" label-position="left" :model="editHostForm" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input v-model="editHostForm.name" class="col-8"></el-input>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.az')" class="" prop="domain">
        <el-input v-model="editHostForm.domain" class="col-8"></el-input>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.editHostaggregationTip')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmEditHost" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'AddHost',
  props: ['hostName', 'hostDomain', 'id'],
  data() {
    return {
      saving: false,
      editHostForm: {
        name: '',
        domain: ''
      },
      dialogVisible: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'onlyLetter_MinusNumberChinese' },
          { type: 'maxSize', value: 255 }
        ],
        domain: [
          { type: 'onlyLetter_MinusNumberChinese' },
          { type: 'maxSize', value: 255 }
        ]
      }
    }
  },
  mounted() {
    // this.initForm = Object.assign({}, this.editInstanceForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
      self.editHostForm.name = this.hostName;
      self.editHostForm.domain = this.hostDomain == null ? "" : this.hostDomain;
    },
    handleCancel() {
      this.$emit("editHandleShow", {});
    },
    handleClose(done) {
      this.$emit("editHandleShow", {});
      done();
    },
    confirmEditHost() {
      var self = this;
      self.$refs.editHostForm.validate(async (valid) => {
        if (valid) {
          self.saving = true;
          let name = self.editHostForm.name;
          let domain = self.editHostForm.domain;
          let url = "api/nova/v2.1/os-aggregates/" + this.id;
          let type = "put";
          let msg = Vue.t('calcStorLang.updateSuccess');
          let body = {};
          if (domain == "" || domain == null) {
            body = {"aggregate": {"name": name}};
            domain = self.hostDomain;
          } else {
            body = {"aggregate": {"name": name, "availability_zone": domain}};
          }
          body = JSON.stringify(body);
          try {
            let result = await self.$ajax({
              url: url,
              data: body,
              type: type,
              successMsg: msg,
              log: {
                description: {
                  en: "Edit Hoseaggregation[Before the name is edited:" + self.hostName + ",after editing:" + name + ";Before the domain is edited:" + (self.hostDomain || "") + ",after editing:" + domain,
                  zh_cn: "编辑主机聚合[名称编辑前:" + self.hostName + ",编辑后:" + name + ";可用域编辑前:" + (self.hostDomain || "") + ",编辑后:" + domain
                },
                target: Vue.logTarget.hostaggregation
              },
              successFun: function(response) {
                self.$emit("editHandleShow", {});
                self.$emit("getData", {});
                self.$emit("reaz", {});
              }
            });
          } catch (e) {
            self.saving = false;
            __DEV__ && console.error(e);
          }
        } else {
          return false;
        }
      });
    }
  }
}
</script>
