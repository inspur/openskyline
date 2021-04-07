<template>
  <el-dialog :title="$t('storage.createCIFSUser')" :visible.sync="visible" :before-close="hide" v-dialogDrag>
    <el-row>
      <el-col :span="12">
        <el-form ref="newUserForm" :model="newUserForm" label-width="100px" class="width92" :rules="rules" label-position="left">
          <el-form-item :label="$t('storage.userName')" prop="name" class="is-required">
            <span class="name_prefix">{{"icos_"}}</span><el-input v-model="newUserForm.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item :label="$t('storage.userGroup')" prop="group" class="is-required">
            <el-input  v-model="newUserForm.group" auto-complete="off"></el-input>  
          </el-form-item>
          <el-form-item :label="$t('storage.password')" prop="password" class="is-required">
            <el-input v-model="newUserForm.password" auto-complete="off" type="password"></el-input>  
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12" style="border-left:1px #dfdfdf solid;">
        <div style="padding-left: 7%">
          <div style="font-size: 16px; font-weight: 600;">{{ $t('storage.CIFS_NEW_USER_DESC') }}</div>
          <ul>
            <li><b>{{ $t('storage.CIFS_NEW_USER_USERNAME') }}</b>{{ $t('storage.CIFS_NEW_USER_USERNAME_DESC') }}</li>
            <li>{{ $t('storage.CIFS_NEW_USER_OTHER_DESC') }}</li>
          </ul>
        </div>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide" :disabled="loading">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="loading">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "NewUser",
  data() {
    return {
      newUserForm: {
        name: "",
        group: "",
        password: ""
      },
      visible: true,
      loading: false,
      userList: [],
      rules: {
        name: [
          { type: "required", trigger: "blur change" },
          { type: "onlyLetterNumber" },
          { type: "maxSize", value: 16 }
        ],
        group: [
          { type: "required", trigger: "blur change" },
          { type: "onlyLetter_Number_NoAllNUMBER" },
          { type: "minSize", value: 4 },
          { type: "maxSize", value: 32 }
        ],
        password: [
          { type: "required", trigger: "blur change" },
          { type: "passwordComplexLegal" }
        ]
      }
    };
  },
  mounted() {
    this.loadAllUser();
  },
  methods: {
    hide () {
      this.$emit("handleShow", {});
      this.$emit("onRefresh", {});
    },
    async confirmFun() {
      let self = this;
      this.$refs.newUserForm.validate(async valid => {
        if (valid) {
          let fullName = "icos_" + self.newUserForm.name;
          if (self.userList.includes(fullName)) {
            self.$message.error(Vue.t("storage.CIFSUserIsExisted"));
            return false;
          }
          self.loading = true;
          let projectId = self.$cookie.get('pid');
          let url = `api/manila/v2/${projectId}/os-user-manage/create_user`;
          let body = {
            "name" : fullName,
            "mainGroup": self.newUserForm.group,
            "password": self.newUserForm.password
          };
          body = JSON.stringify(body);
          try {
            let result = await self.$ajax({
              type: "post",
              data: body,
              url: url,
              showErrMsg: true,
              log: {
                description: {
                  en: "Create CIFS uesr: " + self.newUserForm.name + ", user group is: " + self.newUserForm.group,
                  zh_cn: "创建CIFS文件存储用户:" + self.newUserForm.name + ", 用户组为:" + self.newUserForm.group
                },
                target: Vue.logTarget.storage_share_CIFS
              },
              successFun: function () {
                self.$message.info(Vue.t("storage.createCIFSUserSuccess"));
                self.loading = false;
                self.hide();
              },
              errFun: function(xhr, status, msg) {
                self.$message.error(Vue.t("storage.createCIFSUserFailed"));
              }
            });
          } catch (res) {
            self.loading = false;
          }
        }
      });
    },
    async loadAllUser() {
      let self = this;
      let projectId = self.$cookie.get('pid');
      let url = `api/manila/v2/${projectId}/os-user-manage/query_user`;
      try {
        let ret = await self.$ajax({
          type: 'GET',
          url: url
        });
        let user = ret["users"]
        let result = [];
        for (let i = 0; i < user.length; i++) {
          const item = user[i];
          result.push(item["name"]);
        }
        self.userList = result;
      } catch (data) {
        this.loading = false;
      }
    }
  }
};
</script>
<style scoped>
.width92 {
  width: 92%;
}
.width92 >>> .el-form-item__content {
  display: flex;
}
.width92 >>> .el-form-item__content .name_prefix~.el-form-item__error {
  left: 40px;
}
.name_prefix {
  margin-right: 6px;
  color: #333333;
  font-size: 16px;
}
</style>
