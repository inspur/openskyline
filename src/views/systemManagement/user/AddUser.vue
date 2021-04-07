<template>
  <div>
    <icos-page-header :title="$t('base.addUser')" :show-back="true" @back="handlePageHeaderBack" />
    <icos-page>
      <el-form v-loading="loading" class="me-required-form"
        :element-loading-text="$t('base.sendingData')" ref="addUserForm" label-width="150px" style="overflow:auto;" :model="userData" :rules="rules" label-position="left">
        <el-form-item :label="$t('base.accountNumber')" class="is-required" prop="name">
          <el-input auto-complete="off" style="width:500px;" v-model="userData.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.password')" class="is-required" prop="password">
          <el-input auto-complete="off" type="password" v-model="userData.password" style="width:500px;"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.confirmPassword')" class="is-required" prop="confirmPassword">
          <el-input auto-complete="off" type="password" v-model="userData.confirmPassword" style="width:500px;"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.enable')">
          <el-checkbox v-model="userData.enabled"></el-checkbox>
        </el-form-item>
        <el-form-item :label="$t('base.fullName')" class="is-required" prop="alias">
          <el-input auto-complete="off" style="width:500px;" v-model="userData.alias"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.department')" prop="department">
          <el-input auto-complete="off" style="width:500px;" :readonly="true" @focus="openDepartDialog" v-model="userData.department"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.email')" class="is-required" prop="email">
          <el-input auto-complete="off" style="width:500px;" v-model="userData.email"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.telephone')" class="is-required" prop="phone">
          <el-input auto-complete="off" style="width:500px;" v-model="userData.phone"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.desc')" prop="description">
          <el-input auto-complete="off" type="textarea" v-model="userData.description" style="width:500px;"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.EXPIRED_DATE')" prop="expired_date">
          <el-date-picker
            v-model="userData.expired_date"
            :picker-options="datePickerOptions"
            :editable="false" />
            <el-tooltip placement="right">
              <div slot="content" v-html="$t('base.EXPIRED_DATE_TIPS')"></div>
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('base.sendEamilNotifications')">
          <el-checkbox v-model="userData.sendEmail"></el-checkbox>
        </el-form-item>
        <el-form-item :label="$t('base.userEmpowerment')" v-if="powerFlg">
          <el-checkbox v-model="ifPower" @change="powerFun"></el-checkbox>
        </el-form-item>
        <el-form-item :label="$t('base.roleType')" v-if="ifPower">
          <el-select v-model="roleType" @change="roleChangeFun" style="width:310px;">
            <el-option :label="$t('base.superAdmin')" value="0"></el-option>
            <el-option :label="$t('base.projectAdmin')" value="2"></el-option>
            <el-option :label="$t('base.projectUser')" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('base.project')" class="is-required" prop="projectName" v-if="ifPower&&roleType!=0">
          <!-- <el-select v-model="userData.projects" :multiple="true" filterable style="width:310px;">
            <el-option v-for="item in proList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select> -->
          <el-input auto-complete="off" style="width:310px;" :title="userData.projectName" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="userData.projectName"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.role')" class="is-required" prop="role" v-show="ifPower">
          <el-select v-model="userData.role" style="width:310px;">
            <el-option v-for="item in roleList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="cancel">{{$t('base.cancel')}}</el-button>
          <el-button :loading="btnFlg" type="primary" @click="confirmBtn">{{$t('base.confirm')}}</el-button>
        </el-form-item>
      </el-form>

      <get-department ref="getDepartment" v-if="departmentFlg" @setDepartment="setDepartment"></get-department>
      <select-project ref="selectProject" :multiple="true" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
      <check-password ref="checkPassword" />
    </icos-page>
  </div>
</template>
<script>
import moment from 'moment';
import GetDepartment from './GetDepartment';
import CheckPassword from '../../topDialog/CheckPassword';
export default {
  name:"user",
  data() {
    var nameCheck = (rule, value, callback) => {
      if (this.userData.password!='') {
        this.$refs.addUserForm.validateField('password');
      }
      callback();
    }
    return {
      datePickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      },
      powerFlg:Vue.AuthList["m.systemmanage.usermanage.assignrole"],
      selProjectFlg:false,
      loading:false,
      btnFlg:false,
      departmentFlg:false,
      close:"",
      userData:{
        name:"",
        password:"",
        confirmPassword:"",
        alias:"",
        enabled:true,
        description:"",
        expired_date: null,
        department:"",
        departmentId:'',
        email:"",
        phone:"",
        sendEmail:true,
        projects:[],
        projectName:'',
        role:""
      },
      ifPower:false,
      roleType:"0",
      roleList: [],
      proList:[],
      rules: {
        name: [
          {type: 'required'},
          {type: 'maxSize', value: 40},
          {type: "onlyLetter_NumberChinese_Pointer"},
          {validator:nameCheck, trigger: 'blur'}
        ],
        password: [
          { type: 'required' },
          {
            validator: (rule, value, callback) => {
              let pattern = new RegExp(this.strategy.password_regex, 'g');
              let username = this.userData.name;
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
          { type: 'passwordEquals', context: this, value: 'userData.password' },
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
        ],
        alias:[
          {type: 'required'},
          {type: 'maxSize', value: 40},
          {type: "onlyLetter_NumberChinese_Pointer"}
        ],
        email: [
          {type: 'required'},
          {type: 'maxSize', value: 40},
          {type: "email"}
        ],
        phone: [
          {type: 'required'},
          {type: 'maxSize', value: 15},
          {type: 'phone'}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ],
        projectName: [{type: 'required'}],
        role:[{required:false, message:"", trigger:'change'}]
      },
      strategy:{
        password_regex: '',
        password_regex_description: ''
      }
    }
  },
  mounted() {
    this.loading = false;
    this.btnFlg = false;
    this.userData.department = this.$route.params.id=="default"?"":this.$route.params.name;
    this.userData.departmentId = this.$route.params.id=="default"?"":this.$route.params.id;
    this.getPassStrategy();
  },
  methods: {
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
    cancel() {
      this.$router.push({
        path: '/systemManagement/user'
      });
    },
    async confirmBtn() {
      let me = this;
      if (me.ifPower) { //有赋权
        me.rules.role = [{required:true, message:Vue.t('base.selectRole'), trigger:'change'}];
        if (me.roleType==0) { //超级管理员
          me.rules.projectName = [];
        } else {
          me.rules.projectName = [{type:"required"}];
        }
      } else {
        me.rules.projectName = [];
        me.rules.role = [];
      }
      me.$refs.addUserForm.validate((valid) => {
        if (!valid) {
          return;
        }
        me.loading = true;
        me.btnFlg = true;
        if (Vue.forceCheckCurrentUser) {
          me.$refs.checkPassword.show(() => {
            me.addUser();
          }, () => {
            me.loading = false;
            me.btnFlg = false;
          });
        } else {
          me.addUser();
        }
      });
    },
    async addUser() {
      let me = this;
      let expiredDate = null;
      if (this.userData.expired_date !== '' && this.userData.expired_date !== null && this.userData.expired_date !== undefined) {
        expiredDate = moment(this.userData.expired_date).hour(23).minute(59).second(59).millisecond(0).valueOf() + (new Date().getTimezoneOffset()) * 60 * 1000;
      }
      let ret = await this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/users",
        data: JSON.stringify({user:{
          name:this.userData.name,
          alias:this.userData.alias,
          department:this.userData.departmentId,
          description:this.userData.description,
          email:this.userData.email,
          enabled:this.userData.enabled,
          phone:this.userData.phone,
          password:this.userData.password,
          expired_date: expiredDate
        }}),
        errFun() {
          me.loading = false;
          me.btnFlg = false;
        },
        successFun() {
          if (me.userData.sendEmail) {
            me.$ajax({
              type: 'post',
              url: "api/keystone/v3/inspur/message/email/"+encodeURIComponent("system.user.create.template"),
              data:JSON.stringify({
                "email_info":{
                  "params":[
                    me.userData.alias,
                    me.userData.name,
                    me.userData.department,
                    me.userData.email,
                    me.userData.phone,
                    me.userData.password
                  ],
                  "email":me.userData.email
                }
              }),
              successMsg:Vue.t('base.mailDeliverySuccess'),
              showErrMsg:false,
              errFun() {
                me.$message.error(Vue.t('base.mailDeliveryFail'));
              }
            });
          }
        },
        log:{
          description:{
            en:"add user"+"("+me.userData.name+")",
            zh_cn:"新建用户"+"("+me.userData.name+")"
          },
          target:Vue.logTarget.user
        }
      })
      if (this.ifPower) {
        let obj = {role_id:this.userData.role};
        if (this.roleType!=0) {
          obj.projects = this.userData.projects;
        }
        await this.$ajax({
          type: 'post',
          url: "api/keystone/v3/inspur/assignments/users/"+ret.user.id+"/roles",
          data:JSON.stringify({assignments:obj}),
          errFun() {
            me.loading = false;
            me.btnFlg = false;
          }
        });
      }
      me.loading = false;
      me.btnFlg = false;
      this.$router.push({
        path: '/systemManagement/user'
      });
    },
    async powerFun() {
      if (this.ifPower) {
        //获取超级管理员的角色
        let ret = await this.$ajax({
          type: 'get',
          url: "api/keystone/v3/inspur/roles?"+ $.param({type:this.roleType})
        });
        this.roleList = this.$convertRoleLanguage(ret.roles);
        this.userData.role = '';
      }
    },
    async roleChangeFun() {
      this.powerFun();
    },
    openDepartDialog() {
      let me = this;
      me.departmentFlg = true;
      me.$nextTick(() => {
        me.$refs.getDepartment.show();
      });
    },
    setDepartment(id, dept) {
      this.userData.departmentId = id;
      this.userData.department = dept;
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(idList, nameList) {
      this.userData.projects = idList;
      this.userData.projectName = nameList.join(';');
      this.close = 'close'
    },
    onIconClick() {
      this.userData.projectName = '';
      this.userData.projects = [];
      this.close = '';
    },
    handlePageHeaderBack() {
      window.history.go(-1);
    }
  },
  components: {
    GetDepartment, CheckPassword
  }
}
</script>
