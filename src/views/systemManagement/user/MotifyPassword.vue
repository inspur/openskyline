<template>
  <div>
    <el-dialog :title="$t('base.resetPassword')" :visible.sync="visible" :before-close="handleClose" label-position="left">
      <el-form ref="passwordFom" label-width="100px" :model="passwordObj" :rules="rules">
        <el-form-item :label="$t('base.password')" class="is-required" prop="password">
          <el-input auto-complete="off" type="password" v-model="passwordObj.password"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.confirmPassword')" class="is-required" prop="confirmPassword">
          <el-input auto-complete="off" type="password" v-model="passwordObj.confirmPassword"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{$t('base.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('base.confirm')}}</el-button>
      </div>
    </el-dialog>
    <check-password ref="checkPassword" />
  </div>
</template>
<script>
import CheckPassword from '../../topDialog/CheckPassword';
export default {
  name:"modifypassword",
  props:["id", "userName"],
  components: {
    CheckPassword
  },
  data() {
    return {
      visible:false,
      saving: false,
      name:"",
      passwordObj: {
        password:"",
        confirmPassword:""
      },
      rules: {
        password: [
          { type: 'required' },
          {
            validator: (rule, value, callback) => {
              let pattern = new RegExp(this.strategy.password_regex, 'g');
              let username = this.name;
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
          { type: 'passwordEquals', context: this, value: 'passwordObj.password' },
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
    show(name) {
      this.visible = true;
      this.getPassStrategy();
      this.name = name;
      if (this.$refs.passwordFom) {
        this.$refs.passwordFom.resetFields();
      }
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      let me = this;
      this.$refs.passwordFom.validate(async (valid) => {
        if (!valid) {
          return;
        }
        me.saving = true;
        if (Vue.forceCheckCurrentUser) {
          me.$refs.checkPassword.show(() => {
            me.submit();
          }, () => {
            me.saving = false;
          });
        } else {
          me.submit();
        }
      });
    },
    async submit() {
      let me = this;
      try {
        let ret = await me.$ajax({
          type: 'patch',
          url: "api/keystone/v3/inspur/users/"+me.id,
          data:JSON.stringify({
            user:{
              "password": me.passwordObj.password
            }
          }),
          successMsg:Vue.t('base.saveSuccess'),
          successFun() {
            me.visible = false;
            me.handleClose();
          },
          log:{
            description:{
              en:"reset user("+me.name+") password",
              zh_cn:"重置用户("+me.name+")密码"
            },
            target:Vue.logTarget.user
          }
        });
      } catch (e) {
        me.saving = false;
        __DEV__ && console.error(e);
      }
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