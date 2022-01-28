<template>
  <div>
    <el-dialog
      :title="$t('calcStorLang.MODIFY_PASSWORD')"
      :before-close="handleBeforeClose"
      :visible="true"
      size="tiny">
      <el-form ref="form" :rules="rules" :model="formParam" label-width="80px" label-position="right">
        <el-form-item :label="$t('calcStorLang.MODIFY_PASSWORD_USERNAME')" prop="userName">
          <el-input v-model="formParam.userName" />
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.MODIFY_PASSWORD_PASSWORD')" prop="password">
          <el-input v-model="formParam.password" type="password" />
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.MODIFY_PASSWORD_CONFIRM_PASSWORD')" prop="confirmPassword">
          <el-input v-model="formParam.confirmPassword" type="password" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="close">{{ $t('base.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="submit">{{ $t('base.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ModifyPassword',
  props: ["instanceId"],
  data() {
    return {
      saving: false,
      formParam: {
        userName: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        userName: [
          { required: true, message: Vue.t('calcStorLang.MODIFY_PASSWORD_VALIDATE_USERNAME_REQUIRED') }
        ],
        password: [
          { required: true, message: Vue.t('calcStorLang.MODIFY_PASSWORD_VALIDATE_PASSWORD_REQUIRED') },
          { type: 'passwordLegal' }
        ],
        confirmPassword: [
          { required: true, message: Vue.t('calcStorLang.MODIFY_PASSWORD_VALIDATE_CONFIRM_PASSWORD_REQUIRED') },
          { type: 'passwordEquals', context: this, value: "formParam.password" }
        ]
      }
    };
  },
  methods: {
    handleBeforeClose(done) {
      done();
      this.close();
    },
    close() {
      this.$emit('close');
    },
    async submit() {
      const $this = this;
      await $this.$refs.form.validate(async (valid) => {
        if (valid) {
          $this.saving = true;
          try {
            const res = await $this.$ajax({
              url: `api/nova/v2.1/servers/${$this.instanceId}/action`,
              headers: {
                'OpenStack-API-Version': 'compute 2.41',
                'X-OpenStack-Nova-API-Version': 2.41
              },
              type: 'POST',
              data: JSON.stringify({
                changePassword: {
                  adminPass: $this.formParam.password,
                  userName: $this.formParam.userName
                }
              }),
              log: {
                description: {
                  en: `Modify Instance Password: uuid ${$this.instanceId}`,
                  zh_cn: `修改云主机密码: uuid ${$this.instanceId}`
                },
                key: "name",
                target: Vue.logTarget.computeInstance
              }
            })
            $this.$message.success(Vue.t('calcStorLang.MODIFY_PASSWORD_SUCCESS'));
            $this.saving = false;
            $this.close();
          } catch (e) {
            __DEV__ && console.error(e);
          }
          $this.saving = false;
          return true;
        } else {
          return false;
        }
      })
    }
  },
  mounted() {

  }
}
</script>

<style>

</style>
