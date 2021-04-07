<template>
<div>
  <el-dialog :title="$t('base.edit')" :visible.sync="visible">
    <el-form ref="editUserForm" label-width="100px" :rules="rules" :model="userData" class="me-required-form" v-loading="loading"
          :element-loading-text="loadText">
      <el-form-item :label="$t('base.accountNumber')">
        <!-- <el-input auto-complete="off" v-model="userData.name" :readonly="true"></el-input> -->
        <span>{{userData.name}}</span>
      </el-form-item>
      <el-form-item :label="$t('base.department')" prop="department_name">
        <el-input auto-complete="off" v-model="userData.department_name" :readonly="true" @focus="openDepartDialog"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.fullName')" class="is-required" prop="alias">
        <el-input v-model="userData.alias"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.email')" class="is-required" prop="email">
        <el-input auto-complete="off" v-model="userData.email"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.telephone')" class="is-required" prop="phone">
        <el-input auto-complete="off" v-model="userData.phone"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.desc')" prop="description">
        <el-input auto-complete="off" type="textarea" v-model="userData.description"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.FORBID_TIME')" prop="forbid_time">
        <el-time-picker
          @change="handleForbidTimeChange"
          v-model="userData.forbidTime1"
          format="HH:mm"
          :editable="false"
          :disabled="userData.name === 'admin'"
          :placeholder="$t('base.FORBID_TIME_START')" />
        <el-time-picker
          @change="handleForbidTimeChange"
          v-model="userData.forbidTime2"
          format="HH:mm"
          :editable="false"
          :disabled="userData.name === 'admin'"
          :placeholder="$t('base.FORBID_TIME_END')" />
      </el-form-item>
      <el-form-item :label="$t('base.EXPIRED_DATE')" prop="expired_date">
        <el-date-picker
          v-model="userData.expired_date"
          :disabled="userData.name === 'admin'"
          :picker-options="datePickerOptions"
          :editable="false" />
          <el-tooltip placement="right">
            <div slot="content" v-html="$t('base.EXPIRED_DATE_TIPS')"></div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('base.cancel')}}</el-button>
      <el-button :loading="saving" type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
  <el-dialog :title="$t('base.selectDepartment')" :visible.sync="getDeptFlg">
    <el-card>
      <ztree
        ref="deZtree"
        :data="treeData"
        :setting="setting"
        style="position: relative; min-height: 400px;"
        ></ztree>
      <h2 style="text-align: center; min-height: 400px;" v-if="!treeData || treeData.length<0">{{emptyText}}</h2>
    </el-card>
    <div slot="footer" class="dialog-footer">
      <el-button @click="getDeptFlg=false">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="confirmDept">{{$t('base.confirm')}}</el-button>
    </div>
  </el-dialog>
</div>
</template>
<script>
import moment from 'moment';
export default {
  name:"editUser",
  props:["id"],
  data() {
    return {
      datePickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      },
      loading:false,
      loadText:Vue.t('base.loadingData'),
      visible:false,
      getDeptFlg:false,
      saving:false,
      treeData:[],
      userData: {
        alias: '',
        department: '',
        department_name:"",
        name:"",
        email: '',
        phone: '',
        description: '',
        oldAlias:'',
        oldEmail:'',
        forbidTime1: '',
        forbidTime2: '',
        old_forbid_time: null,
        forbid_time: null,
        old_expired_date: null,
        expired_date: null
      },
      setting: {
        check : {
          enable : false
        },
        data : {
          simpleData : {
            enable : true
          },
          key:{
            name:"name"
          }
        }
      },
      rules: {
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
        forbid_time: [
          { validator(rule, value, callback) {
              if (!/^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$/.test(value) && value != null) {
                callback(new Error(Vue.t('base.SETING_DISABLE_TIME')));
              } else {
                callback();
              }
            },
            trigger: 'change, blur, click'
          }
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    async show() {
      let me = this;
      this.visible = true;
      if (this.$refs.editUserForm) {
        this.$refs.editUserForm.resetFields();
      }
      this.loading = true;
      this.loadText = Vue.t('base.loadingData');
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/users?"+$.param({id:this.id}),
        errFun() {
          me.loading = false;
        }
      })
      if (ret.users[0].expired_date !== null && ret.users[0].expired_date !== '' && ret.users[0].expired_date !== undefined) {
        ret.users[0].expired_date = moment(ret.users[0].expired_date - new Date().getTimezoneOffset() * 60 * 1000).toDate();
      } else {
        ret.users[0].expired_date = null;
      }
      this.userData = Object.assign({}, this.userData, ret.users[0]);
      Object.keys(this.rules).forEach((key) => {
        if (this.userData[key]===null) this.userData[key] = "";
      })
      this.userData.oldAlias = this.userData.alias;
      this.userData.oldEmail = this.userData.email;
      this.userData.old_forbid_time = this.userData.forbid_time;
      this.userData.old_expired_date = this.userData.expired_date;
      if (/^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$/.test(this.userData.forbid_time) ) {
        const forbidTimeArr = this.userData.forbid_time.split('-');
        const forbidTime1 = new Date();
        forbidTime1.setHours(forbidTimeArr[0].split(':')[0]);
        forbidTime1.setMinutes(forbidTimeArr[0].split(':')[1]);
        this.userData.forbidTime1 = forbidTime1;
        const forbidTime2 = new Date();
        forbidTime2.setHours(forbidTimeArr[1].split(':')[0]);
        forbidTime2.setMinutes(forbidTimeArr[1].split(':')[1]);
        this.userData.forbidTime2 = forbidTime2;
      } else {
        this.userData.forbidTime1 = '';
        this.userData.forbidTime2 = '';
        this.userData.forbid_time = null;
      }
      this.loading = false;
    },
    async openDepartDialog() {
      this.getDeptFlg = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/departments"
      })
      var arr = ret.departments;
      arr.forEach(function(item, key) {
        item.pId = item.parent_id?item.parent_id:"default";
        item.icon = './static/img/ztree/department.png';
      });
      arr.unshift({id:"default", name:Vue.t('base.all'), icon:"./static/img/ztree/department.png"});
      this.treeData = arr;

      this.$nextTick(() => {
        let node = node = this.$refs.deZtree.action('getNodesByParam', "level", 0)[0];
        this.$refs.deZtree.action("selectNode", node);
        this.$refs.deZtree.action("expandNode", node);
      });
    },
    confirmDept() {
      var nodes = this.$refs.deZtree.action("getSelectedNodes");
      if (nodes.length==0) {
        this.$message({
          message: Vue.t('base.selectDepartmentWarn'),
          type: "warning"
        });
        return;
      }
      this.getDeptFlg = false;
      let id = nodes[0].id;
      this.userData.department_name = id=="default"?"":nodes[0].name;
      this.userData.department = id=="default"?"":id;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      let me = this;
      this.$refs.editUserForm.validate((valid) => {
        if (!valid) {
          return;
        }
        this.saving = true;
        this.loading = true;
        this.loadText = Vue.t('base.sendingData');

        if (this.userData.expired_date !== '' && this.userData.expired_date !== null && this.userData.expired_date !== undefined) {
          this.userData.expired_date.setHours(23);
          this.userData.expired_date.setMinutes(59);
          this.userData.expired_date.setSeconds(59);
          this.userData.expired_date.setMilliseconds(0);
        } else {
          this.userData.expired_date = null;
        }

        let oldForbidTime = this.userData.old_forbid_time === null ? '' : this.userData.old_forbid_time;
        let forbidTime = this.userData.forbid_time === null ? '' : this.userData.forbid_time;
        let oldExpiredTime = this.userData.old_expired_date === null ? '' : moment(this.userData.old_expired_date).format('YYYY-MM-DD');
        let expiredTime = this.userData.expired_date === null ? '' : moment(this.userData.expired_date).format('YYYY-MM-DD');
        let logMsg = {
          en: `Before the name is edited:${this.userData.oldAlias},after editing:${this.userData.alias};Before the email is edited:${this.userData.oldEmail},after editing:${this.userData.email};Before the forbid time edited: ${oldForbidTime}, after editing: ${forbidTime}, Before expired date edited: ${oldExpiredTime}, after editing: ${expiredTime}`,
          zh: `姓名编辑前:${this.userData.oldAlias},编辑后:${this.userData.alias};邮箱编辑前:${this.userData.oldEmail},编辑后:${this.userData.email}禁用时间编辑前：${oldForbidTime},编辑后：${forbidTime}，有效期编辑前: ${oldExpiredTime}，编辑后：${expiredTime}`
        }
        if (this.userData.forbid_time === '') {
          this.userData.forbid_time = null;
        }
        let ret = this.$ajax({
          type: 'patch',
          url: "api/keystone/v3/inspur/users/"+this.id,
          data:JSON.stringify({
            user:{
              "description": this.userData.description,
              "email":this.userData.email,
              "phone":this.userData.phone,
              alias:this.userData.alias,
              department:this.userData.department,
              forbid_time: this.userData.forbid_time,
              expired_date: moment(this.userData.expired_date).valueOf() + (new Date().getTimezoneOffset()) * 60 * 1000
            }
          }),
          successMsg:Vue.t('base.saveSuccess'),
          errFun() {
            me.saving = false;
            me.loading = false;
          },
          successFun() {
            me.saving = false;
            me.loading = false;
            me.visible = false;
            me.$emit("refreshData");
          },
          log:{
            description:{
              en:"edit user"+"("+me.userData.name+")["+logMsg.en+"]",
              zh_cn:"编辑用户"+"("+me.userData.name+")["+logMsg.zh+"]"
            },
            target:Vue.logTarget.user
          }
        })
      });
    },
    handleForbidTimeChange() {
      let forbidTime1 = this.userData.forbidTime1 || '';
      let forbidTime2 = this.userData.forbidTime2 || '';
      if (forbidTime1 instanceof Date && forbidTime2 instanceof Date) {
        this.userData.forbid_time = `${moment(forbidTime1).format('HH:mm')}-${moment(forbidTime2).format('HH:mm')}`;
      } else if (forbidTime1 === '' && forbidTime2 === '') {
        this.userData.forbid_time = null;
      } else {
        this.userData.forbid_time = '';
      }
      this.$nextTick(() => {
        this.$refs.editUserForm.validateField('forbid_time');
      });
    }
  }
}
</script>