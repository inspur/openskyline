<template>
  <el-dialog
  :title="$t('calcStorLang.changePassword')"
  :visible.sync="dialogVisible"
  :before-close="handleClose"
  size="tiny">
    <el-form ref="changePasswordForm" :model="changePassword" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.password')" prop="userPass" class="is-required">
        <el-input class="col-12" v-model="changePassword.userPass" auto-complete="off" type="password"></el-input>
        <el-tooltip placement="top" trigger="hover" :content="$t('network.createInstLoginTip2')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('lang.confirmPassword')" prop="userConfirmPass" class="is-required">
        <el-input class="col-12" v-model="changePassword.userConfirmPass" auto-complete="off" type="password"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirm" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'ChangePassword',
  props: ['instName', 'instUuid'],
  data() {
    return {
      saving: false,
      changePassword: {
        userPass: "",
        userConfirmPass: ""
      },
      dialogVisible: false,
      rules: {
        userPass: [
          { type: 'required', trigger: 'blur change' },
          { type: 'passwordLegal' }
        ],
        userConfirmPass: [
          { type: 'required', trigger: 'blur change' },
          { type: 'passwordEquals', context: this, value: "changePassword.userPass" }
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
  },
  updated() {
    this.rules.userPass = [{ type: 'required', trigger: 'blur change' }, { type: 'passwordLegal' }];
    this.rules.userConfirmPass = [{ type: 'required', trigger: 'blur change' }, { type: 'passwordEquals', context: this, value: "changePassword.userPass" }];
  },
  methods: {
    initDialog() {
      let self = this;
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("handleChangePassword", {});
    },
    handleClose(done) {
      this.$emit("handleChangePassword", {});
      done();
    },
    confirm() {
      let self = this;
      this.$refs.changePasswordForm.validate(async (valid) => {
        if (valid) {
          let body;
          self.saving = true;
          body = {"metadata": {"update_passwd_flag": new Date().getTime().toString(), "admin_pass": self.changePassword.userPass}};
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: "api/nova/v2.1/servers/" + this.instUuid + "/metadata",
              data: body,
              type: 'put',
              confirmMsg: Vue.t("calcStorLang.changePasswordConfirm"),
              log: {
                description: {
                  en: "Instance Change Password" + self.instName,
                  zh_cn: "云物理机修改密码" + self.instName
                },
                target: Vue.logTarget.computePhysical
              },
              successMsg: this.$t('calcStorLang.passwordResetComplete')
            });
            this.$emit("handleChangePassword", {});
            this.$emit("onRefresh");
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
