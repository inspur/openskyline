<template>
  <el-dialog :title="$t('base.modifyPassword')" :visible.sync="visible" :before-close="handleBeforeClose">
    <el-form ref="modifyPassword" label-width="130px" :model="modifyPassword" :rules="rules">
      <el-form-item :label="$t('base.orignPassword')" prop="oldPassword" class="is-required" >
        <el-input v-model="modifyPassword.oldPassword" type="password"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.newPassword')" prop="password" class="is-required" >
        <el-input v-model="modifyPassword.password" type="password"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.newPasswordConfirm')" prop="confirmPassword" class="is-required" >
        <el-input v-model="modifyPassword.confirmPassword" type="password"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"",
  data() {
    return {
      visible:false,
      saving: false,
      modifyPassword:{
        oldPassword: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        oldPassword: [{ type: 'required' }],
        password: [
          { type: 'required' },
          { type: 'passwordNotEquals', context: this, value: 'modifyPassword.oldPassword' },
          {
            validator: (rule, value, callback) => {
              let pattern = new RegExp(this.strategy.password_regex, 'g');
              let username = Vue.userName;
              let uusername = username.split('').reverse().join('');
              if (value.indexOf(username) > -1 || value.indexOf(uusername) > -1) {
                callback(this.$t('base.passwordWarn1'));
              } else if (!pattern.test(value)) {
                callback(this.strategy.password_regex_description);
              } else {
                callback();
              }
            }
          }
        ],
        confirmPassword: [
          { type: 'required' },
          { type: 'passwordEquals', context: this, value: 'modifyPassword.password' },
          {
            validator: (rule, value, callback) => {
              let pattern = new RegExp(this.strategy.password_regex, 'g');
              if (!pattern.test(value)) {
                callback(this.strategy.password_regex_description);
              } else {
                callback();
              }
            }
          }
        ]
      },
      strategy:{
        password_regex: '',
        password_regex_description: ''
      }
    }
  },
  mounted() {
  },
  methods:{
    getPassStrategy() {
      let me = this;
      this.$ajax({
        type: 'get',
        url: 'api/keystone/v3/inspur/system/config/file-conf',
        successFun(data) {
          me.strategy.password_regex = data.password_regex || '';
          if (Vue.language === 'en') {
            me.strategy.password_regex_description = data.password_regex_description || '';
          }
          if (Vue.language === 'zh_cn') {
            me.strategy.password_regex_description = data.password_regex_description_cn ? eval(`"${data.password_regex_description_cn}"`) : '';
          }
        }
      })
    },
    show() {
      this.visible = true;
      this.getPassStrategy();
      if (this.$refs.modifyPassword) {
        this.$refs.modifyPassword.resetFields();
      }
    },
    confirmFun() {
      let me = this;
      this.$refs.modifyPassword.validate(async (valid) => {
        if (!valid) {
          return;
        }
        me.saving = true;
        try {
          let ret = await this.$ajax({
            type: 'post',
            contentType: "application/json",
            url: 'node-api/keystone/resetPassword',
            data:JSON.stringify({
              user:{
                "password": this.modifyPassword.password,
                "original_password":this.modifyPassword.oldPassword,
                "user_name":Vue.userName,
                "project_id":Vue.roleType==0?"":(this.$cookie.get("pid")||""),
                "userId":Vue.userId
              }
            }),
            logout:false,
            successFun() {
              me.$alert(Vue.t('base.reloginWarn1'), Vue.t('base.signOut'), {
                confirmButtonText:Vue.t('base.confirm'),
                type:"warning",
                callback: action => {
                  document.location.href = "login.html";
                }
              })
            }
          })
          me.visible = false;
          me.saving = false;
          me.handleClose();
        } catch (e) {
          me.saving = false;
          __DEV__ && console.error(e);
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
      $this.$emit('close');
    }
  }
}
</script>