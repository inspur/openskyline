<template src="./login.html"></template>
<style src="./login.css"></style>
<script>
import * as utils from 'utils/index.js';
import { genReqIdentifier } from '../../utils/reqIdentifier';
import vueLocal from "../../locale";
import brandLogoImage from '../../assets/img/login/logo-inspur.png';
import productLogoImage from '../../assets/img/login/logo.png';
import moment from 'moment';
import uuid from 'uuid';
import { loginAnimation } from './animation.js';
export default {
  data() {
    var validateVerifyCode = (rule, value, callback) => {
      if (!this.verifyCodePass) {
        callback(new Error(this.$t('base.verifyCodeError')));
      }
      callback();
    }
    return {
      show: true,
      loading: false,
      loginFormVisible: true,
      resetPasswordFormVisible: false,
      smsFormVisible: false,
      formInline: {
        user: '',
        password: '',
        verifyCode: ''
      },
      smsForm: {
        validCode: '',
        phoneNumber: '',
        countDown: 0
      },
      verifyCodePass:true,
      ruleInline: {
        user: [
          { required: true, message: this.$t('base.userNameWarn'), trigger: 'blur' }
        ],
        password: [
          { required: true, message: this.$t('base.passwordWarn'), trigger: 'blur' }
        ],
        verifyCode: [
          { required: true, message: this.$t('base.verifyCodeWarn'), trigger: 'blur' },
          {type: 'maxSize', value: 4},
          {validator:validateVerifyCode, trigger: 'blur'}
        ]
      },
      smsFormRules: {
        validCode: [
          { type: 'required' },
          { type: 'maxSize', value: 4 }
        ]
      },
      resetPasswordRules: {
        oriPassword: [{
          type: 'required'
        }],
        password: [{
          type: 'required'
        }, {
          type: 'passwordNotEquals',
          context: this,
          value: 'resetPasswordFormData.oriPassword'
        }, {
          validator: (rule, value, callback) => {
            let pattern = new RegExp(this.strategy.password_regex, 'g');
            if (!pattern.test(value)) {
              callback(this.strategy.password_regex_description);
            } else {
              callback();
            }
          }
        }],
        confirmPassword: [{
          type: 'required'
        }, {
          type: 'passwordEquals',
          context: this,
          value: 'resetPasswordFormData.password'
        }, {
          validator: (rule, value, callback) => {
            let pattern = new RegExp(this.strategy.password_regex, 'g');
            if (!pattern.test(value)) {
              callback(this.strategy.password_regex_description);
            } else {
              callback();
            }
          }
        }]
      },
      showVerifycode:false,
      language: Vue.cookie.get('defaultLanguage') || 'zh_cn',
      adminDomain:'',
      verifyCodeSrc:"node-api/keystone/getVerifyCode?type=verifyCode&timestamp=" + new Date().getTime() + "&reqIdentifier=" + encodeURIComponent(genReqIdentifier()),
      brandLogoImage: Vue.oemSwitch ? Vue.oemBrandLogo : brandLogoImage,
      productLogoImage: Vue.oemSwitch ? Vue.oemProductLogo : productLogoImage,
      resetPasswordFormData: {
        userId: '',
        userName: '',
        oriPassword: '',
        password: '',
        confirmPassword: ''
      },
      strategy:{
        password_regex: '',
        password_regex_description: ''
      },
      systemConfig: {}
    }
  },
  beforeDestroy() {
    loginAnimation.destroy(this);
  },
  async mounted() {
    //获取是否需要显示验证码及是否是ldap登录标识位
    const $this = this;
    loginAnimation.init({ vm: $this, maxHeight: 0.45 });
    // await $this.getSystemConfig();
    let ret = this.$ajax({
      type: 'get',
      contentType: "application/json",
      url: 'node-api/keystone/getVerifyCodeConfig',
      successFun(data) {
        $this.showVerifycode = data.verification_code.config_value==1;
        if (!$this.showVerifycode) { //如果是不显示，那么判断下cookie中是否要显示验证码
          $this.showVerifycode = $this.$cookie.get('showVerifycode')=='Y';
          if (!$this.showVerifycode) {
            // 如果不显示，则判断是否是IP连续登陆失败，“是”则显示验证码
            $this.showVerifycode = data.isIPContinuousWrong;
          }
        }
        $this.adminDomain = data.admin_domain||'default';
      }
    });
    this.$cookie.set('pid', "");
    this.$cookie.set('roleType', "");
    this.$cookie.set('roleId', "");
  },
  methods: {
    changeLanguage(language) {
      this.language = language;
      vueLocal.init(this.language);
      this.$cookie.set('defaultLanguage', language);
      window.location.reload();
    },
    handleSubmit() {
      const self = this;
      let traceId = 'req-'+uuid.v1();
      self.$refs.form.validate( async(valid) => {
        if (!valid) { return; }
        self.loading = true;
        let params = self.formInline;
        let obj = {
          "auth": {
            "identity": {
              "methods": [
                "password"
              ],
              "password": {
                "user": {
                  "name": params.user,
                  "domain": {
                    "name": self.adminDomain
                  },
                  "password": params.password
                }
              }
            }
          }
        };
        // 校验验证码
        if (self.showVerifycode) {
          obj.verifyCode = self.formInline.verifyCode;
        }
        let result = await self.$ajax({
          type: 'post',
          data: JSON.stringify(obj),
          contentType: "application/json",
          url: 'node-api/keystone/login',
          showErrMsg: false,
          logout: false,
          headers: {
            'X-Openstack-Request-Id': traceId
          },
          errFun(xhr) {
            const res = xhr.responseJSON;
            if (res.error.message && /^The password is expired and needs to be changed for user: (.*).$/.test(res.error.message)) {
              self.$errMsg(self.$t('lang.LOGIN_ERR_MESSAGE_PASSWORD_EXPIRED'), xhr.status, false);
              let matches = res.error.message.match(/^The password is expired and needs to be changed for user: (.*).$/);
              self.loginFormVisible = false;
              self.resetPasswordFormVisible = true;
              self.resetPasswordFormData.userId = matches[1];
              self.resetPasswordFormData.userName = self.formInline.user;
              self.resetPasswordFormData.oriPassword = '';
              self.resetPasswordFormData.password = '';
              self.resetPasswordFormData.confirmPassword = '';
              self.loading = false;
            } else if (res.error.message && /^The account is locked for user: (.*).$/.test(res.error.message)) {
              self.$errMsg(self.$t('lang.LOGIN_ERR_MESSAGE_RETRY_MAX', [self.systemConfig.lockout_failure_attempts, self.systemConfig.lockout_duration]), xhr.status, false);
            } else if (res.error.message && /^verifyCode fail$/.test(res.error.message)) {
              self.$errMsg(self.$t('lang.LOGIN_ERR_MESSAGE_VCODE_ERROR'), xhr.status, false);
            } else if (res.error.message && /^The request you have made requires authentication.$/.test(res.error.message)) {
              if (self.systemConfig.lockout_failure_attempts !== null) {
                self.$errMsg(self.$t('lang.LOGIN_ERR_MESSAGE_RETRY_MAX', [self.systemConfig.lockout_failure_attempts, self.systemConfig.lockout_duration]), xhr.status, false);
              } else {
                self.$errMsg(self.$t('lang.LOGIN_ERR_MESSAGE_CRDENTIAL_ERROR'), xhr.status, false);
              }
            } else if (res.error.message && /^the ip '(.*)' is forbidden to login$/.test(res.error.message)) {
              self.$errMsg(self.$t('lang.LOGIN_ERR_MESSAGE_IP_FORBID'), xhr.status, false);
            } else if (res.error.message && /^the user is forbidden to login in this time$/.test(res.error.message)) {
              self.$errMsg(self.$t('lang.LOGIN_ERR_MESSAGE_TIME_FORBID'), xhr.status, false);
            } else if (res.error.message && /^the user is expired and forbidden to login$/.test(res.error.message)) {
              self.$errMsg(self.$t('lang.LOGIN_ERR_MESSAGE_USER_FORBID'), xhr.status, false);
            } else if (res.error.message && /^Fail: max session reached.$/.test(res.error.message)) {
              self.$errMsg(self.$t('lang.LOGIN_ERR_MESSAGE_MAX_SESSION'), xhr.status, false);
            } else {
              if (res.error.message) {
                self.$errMsg(res.error.message, xhr.status, false);
              } else {
                self.$errMsg(res, xhr.status, false);
              }
            }
            self.showVerifycode = true;
            self.$cookie.set('showVerifycode', 'Y');
            self.reloadVerifyCode();
            self.loading = false;
          }
        });
        if (result.error) {
          self.verifyCodePass = false;
          self.showVerifycode = true;
          self.$nextTick(() => {
            self.$refs.form.validateField('verifyCode');
            self.reloadVerifyCode();
            self.loading = false;
          });
          return;
        }
        self.verifyCodePass = true;
        if (self.systemConfig.sms_valid && self.systemConfig.sms_valid === '1') {
          self.smsForm.phoneNumber = result.phoneNumber;
          self.smsFormVisible = true;
          self.loginFormVisible = false;
          self.loading = false;
          self.countDown();
        } else {
          self.$cookie.set('showVerifycode', '');
          self.saveLoginInfo(result, params, self.language, traceId);
        }
      });
    },
    async handleSendSmsValidCodeAgain() {
      const $this = this;
      let traceId = 'req-'+uuid.v1();
      try {
        $this.loading = true;
        let result = await $this.$ajax({
          type: 'post',
          data: JSON.stringify({
            "auth": {
              "identity": {
                "methods": [
                  "password"
                ],
                "password": {
                  "user": {
                    "name": $this.formInline.user,
                    "domain": {
                      "name": $this.adminDomain
                    },
                    "password": $this.formInline.password
                  }
                }
              }
            }
          }),
          contentType: "application/json",
          url: 'node-api/keystone/login',
          logout: false,
          headers: {
            'X-Openstack-Request-Id': traceId
          }
        });
        $this.loading = false;
        $this.countDown();
      } catch (e) {
        __DEV__ && console.error(e);
        $this.loading = false;
      }
    },
    async handleLoginWithSmsValidCode() {
      const $this = this;
      $this.$refs.smsForm.validate(async (valid) => {
        if (valid) {
          try {
            $this.loading = true;
            let traceId = 'req-'+uuid.v1();
            let result = await $this.$ajax({
              type: 'post',
              data: JSON.stringify({
                "auth": {
                  "identity": {
                    "methods": [
                      "password"
                    ],
                    "password": {
                      "user": {
                        "name": $this.formInline.user,
                        "domain": {
                          "name": $this.adminDomain
                        },
                        "password": $this.formInline.password
                      }
                    }
                  }
                }
              }),
              contentType: "application/json",
              url: 'node-api/keystone/login',
              logout: false,
              headers: {
                'X-Openstack-Request-Id': traceId,
                'validcode': $this.smsForm.validCode
              },
              showErrMsg: false
            });
            $this.$cookie.set('showVerifycode', '');
            $this.saveLoginInfo(result, $this.formInline, $this.language, traceId);
          } catch (e) {
            __DEV__ && console.error(e);
            if ('message' in e) {
              if (e.message === 'sms valid code not matched') {
                $this.$errMsg($this.$t('lang.LOGIN_ERR_MESSAGE_SMS_VALID_CODE_NOT_MATCHED'), 401, false);
              }
            }
            $this.loading = false;
          }
        }
      });
    },
    saveLoginInfo: async function(result, params, language, traceId) {
      let token = result.token;
      let data = {
        token: result.tokenId,
        sessionTimeout:result.sessionTimeout,
        ip:result.ip,
        userId: token.user.id || "",
        userName: token.user.name,
        password: params.password,
        language: language,
        domainId: token.user.domain.id || "",
        domainName: token.user.domain.name || "",
        traceId: traceId
      };
      try {
        let result = await this.$ajax({
          type: 'post',
          dataType: "jsonp",
          contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
          data: data,
          url: "node-api/login?timestamp=" + (new Date()).getTime()
        });
        document.location.href = "index.html";
      } catch (res) {
        __DEV__ && console.warn(res);
      }
    },
    getQueStr: function(url, ref) {
      var str = url.substr(url.indexOf('?') + 1);
      if (str.indexOf('&') != -1) {
        var arr = str.split('&');
        for (i in arr) {
          if (arr[i].split('=')[0] == ref) {
            return arr[i].split('=')[1];
          }
        }
      } else {
        if (url.indexOf('=') != -1) {
          return url.substr(url.indexOf('=') + 1);
        } else {
          return "";
        }
      }
    },
    reloadVerifyCode() {
      this.verifyCodeSrc = "node-api/keystone/getVerifyCode?type=verifyCode&timestamp=" + new Date().getTime() + "&reqIdentifier=" + encodeURIComponent(genReqIdentifier())
      this.verifyCodePass = true;
    },
    async handleResetPassword() {
      const $this = this;
      $this.$refs.resetPasswordForm.validate(async (valid) => {
        if (valid) {
          try {
            $this.loading = true;
            const res = await $this.$ajax({
              type: 'post',
              url: `node-api/keystone/password`,
              contentType: 'application/json',
              logout: false,
              data: JSON.stringify({
                userId: $this.resetPasswordFormData.userId,
                user: {
                  project_id: '',
                  create_time: moment().add(moment().utcOffset()).valueOf(),
                  user_name: $this.resetPasswordFormData.userName,
                  password: $this.resetPasswordFormData.password,
                  original_password: $this.resetPasswordFormData.oriPassword
                }
              })
            });
            $this.$message.success($this.$t('base.LOGIN_PASSWORD_EXPIRED_CHANGE_SUCCESS'));
            setTimeout(location.reload.bind(location), 500);
          } catch (e) {
            $this.loading = false;
            __DEV__ && console.error(e);
          }
        } else {

        }
      });
    },
    async getSystemConfig() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          showErrMsg: true,
          url: `node-api/keystone/config-before-auth`
        });
        const systemConfig = {};
        res.forEach(item => {
          systemConfig[item[0]] = item[1];
        });
        $this.systemConfig = systemConfig;
        $this.strategy.password_regex = systemConfig.password_regex || '';
        if ($this.language === 'en') {
          $this.strategy.password_regex_description = systemConfig.password_regex_description || '';
        }
        if ($this.language === 'zh_cn') {
          $this.strategy.password_regex_description = systemConfig.password_regex_description_cn ? eval(`"${systemConfig.password_regex_description_cn}"`) : '';
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    countDown() {
      const $this = this;
      $this.smsForm.countDown = 30;
      let interval = setInterval(() => {
        if ($this.smsForm.countDown > 0) {
          $this.smsForm.countDown --;
        } else {
          $this.smsForm.countDown = 0;
          clearInterval(interval);
        }
      }, 1100);
    }
  },
  filters: {
    phoneNumberMask(phoneNumber) {
      let exp = /^(\d{3})(\d{4})(\d{4})$/;
      if (exp.test(phoneNumber)) {
        let strs = phoneNumber.match(exp);
        return `${strs[1]}****${strs[3]}`;
      } else {
        return '';
      }
    }
  }
}
</script>

<style scoped>
.sms-valid-input >>> .el-input-group__append {
  background-color: #ffffff;
  border-radius: 0;
  border: none;
  color: #666666;
}
</style>

