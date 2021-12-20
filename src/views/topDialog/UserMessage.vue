<template>
  <el-dialog :title="$t('base.userInfo')" :visible.sync="visible" :before-close="handleBeforeClose">
    <el-form ref="userMessageForm" :model="userMsg" :rules="rules" label-width="120px" class="me-required-form">
      <el-form-item :label="$t('base.accountNumber')">
        <!-- <el-input v-model="userMsg.name" :readonly="true"></el-input> -->
        <span>{{userMsg.name}}</span>
      </el-form-item>
      <el-form-item :label="$t('base.department')">
        <!-- <el-input v-model="userMsg.department_name" :readonly="true"></el-input> -->
        <span>{{userMsg.department_name}}</span>
      </el-form-item>
      <el-form-item :label="$t('base.fullName')" prop="alias" class="is-required">
        <el-input v-model="userMsg.alias"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.email')" prop="email" class="is-required">
        <el-input v-model="userMsg.email"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.telephone')" prop="phone" class="is-required">
        <el-input v-model="userMsg.phone"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.desc')" prop="description">
        <el-input v-model="userMsg.description" type='textarea'></el-input>
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
      userMsg:{
        department_name:"",
        alias: '',
        department: '',
        name:"",
        email: '',
        phone: '',
        description: '',
        oldAlias:'',
        oldEmail:'',
        oldPhone: '',
        oldDescription: ''
      },
      rules:{
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
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    async show() {
      this.visible = true;
      if (this.$refs.userMessageForm) {
        this.$refs.userMessageForm.resetFields();
      }
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/users?"+$.param({id:Vue.userId})
      });
      this.userMsg = Object.assign({}, this.userMsg, ret.users[0]);
      if (this.userMsg.alias !== null) {
        this.userMsg.oldAlias = this.userMsg.alias;
      } else {
        this.userMsg.oldAlias = this.userMsg.alias = '';
      }
      if (this.userMsg.email !== null) {
        this.userMsg.oldEmail = this.userMsg.email;
      } else {
        this.userMsg.oldEmail = this.userMsg.email = '';
      }
      if (this.userMsg.phone !== null) {
        this.userMsg.oldPhone = this.userMsg.phone;
      } else {
        this.userMsg.oldPhone = this.userMsg.phone = '';
      }
      if (this.userMsg.description !== null) {
        this.userMsg.oldDescription = this.userMsg.description;
      } else {
        this.userMsg.oldDescription = this.userMsg.description = '';
      }
    },
    confirmFun() {
      const $this = this;
      this.$refs.userMessageForm.validate(async (valid) => {
        if (!valid) {
          return;
        }
        $this.saving = true;
        let logMsg = {
          en: `Before the name is edited: "${this.userMsg.oldAlias}", after editing:"${this.userMsg.alias}";
            Before the email is edited: "${this.userMsg.oldEmail}", after editing: "${this.userMsg.email};
            Before the phone is edited: "${this.userMsg.oldPhone}", after editing: "${this.userMsg.phone};
            Before the description is edited: "${this.userMsg.oldDescription}", after editing: "${this.userMsg.description};`,
          zh: `姓名编辑前:"${this.userMsg.oldAlias}",编辑后:"${this.userMsg.alias}";
            邮箱编辑前"${this.userMsg.oldEmail}":,编辑后:"${this.userMsg.email};
            电话编辑前"${this.userMsg.oldPhone}":,编辑后:"${this.userMsg.phone}
            描述编辑前"${this.userMsg.oldDescription}":,编辑后:"${this.userMsg.description}`
        }
        try {
          let ret = await this.$ajax({
            type: 'patch',
            url: "api/keystone/v3/users/self",
            data:JSON.stringify({
              user:{
                "description": this.userMsg.description,
                "email":this.userMsg.email,
                "phone":this.userMsg.phone,
                "alias":this.userMsg.alias
              }
            }),
            successMsg:Vue.t('base.saveSuccess'),
            log:{
              description:{
                en:"modify user "+this.userMsg.name+" information["+logMsg.en+"]",
                zh_cn:"修改"+this.userMsg.name+"用户信息["+logMsg.zh+"]"
              },
              target:Vue.logTarget.user
            }
          })
          this.visible = false;
          $this.handleClose();
        } catch (e) {
          $this.saving = false;
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
