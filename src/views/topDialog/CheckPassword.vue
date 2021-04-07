<template>
  <el-dialog :title="$t('base.CHECK_CURRENT_USER')" :visible.sync="visible" :before-close="handleBeforeClose" class="check-password">
    <el-form ref="form" label-width="100px" :model="formData" :rules="rules">
      <el-form-item :label="$t('base.userName')" prop="username" class="is-required" >
        <el-input v-model="formData.username" type="username"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.password')" prop="password" class="is-required" >
        <el-input v-model="formData.password" type="password"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="submit" :loading="saving">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name: 'CheckPassword',
  data() {
    return {
      visible: false,
      saving: false,
      formData: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { type: 'required' }
        ],
        password: [
          { type: 'required' }
        ]
      },
      resolve: null,
      reject: null
    }
  },
  methods: {
    show(resolve=null, reject=null) {
      this.resolve = resolve;
      this.reject = reject;
      this.formData.username = '';
      this.formData.password = '';
      this.saving = false;
      this.visible = true;
    },
    async submit() {
      const $this = this;
      $this.$refs.form.validate(async (valid) => {
        if (valid) {
          $this.saving = true;
          try {
            let res = await $this.$ajax({
              contentType: 'application/json',
              url: 'node-api/checkPassword',
              method: 'post',
              data: JSON.stringify($this.formData),
              showErrMsg: true
            });
            if ($this.resolve !== null) {
              $this.resolve();
            }
            $this.visible = false;
          } catch (e) {
            $this.saving = false;
            __DEV__ && console.error(e);
          }
        }
      });
    },
    handleBeforeClose(done) {
      const $this = this;
      done();
      $this.handleClose();
    },
    handleClose() {
      const $this = this;
      $this.visible = false;
      if ($this.reject !== null) {
        $this.reject();
      }
    }
  }
}
</script>

<style scoped>
.check-password >>> .el-dialog {
  width: 500px;
}
</style>