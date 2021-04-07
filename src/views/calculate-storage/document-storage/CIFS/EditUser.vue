<template>
  <el-dialog :title="$t('storage.editCIFSUser')" :visible.sync="visible" :before-close="hide" v-dialogDrag>
    <el-row>
      <el-col :span="12">
        <el-form ref="editUserForm" :model="editUserForm" label-width="100px" :rules="rules" label-position="left">
          <el-form-item :label="$t('storage.userName')" prop="name" class="is-required">
            <el-input class="width90" v-model="editUserForm.name" auto-complete="off" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item :label="$t('storage.userGroup')" prop="group" class="is-required">
            <el-select v-model="editUserForm.group" class="width90">
              <el-option v-for="item in groupOptions" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('storage.password')" prop="password" class="is-required">
            <el-input class="width90" v-model="editUserForm.password" auto-complete="off" type="password"></el-input>  
          </el-form-item>
        </el-form>
      </el-col>
      <!-- <el-col :span="12" style="border-left:1px #dfdfdf solid;">
        <div style="padding-left: 7%;">
          <div style="font-size: 16px; font-weight: 600;">描述:</div>
          <ul>
            <li><b>用户名：</b>由默认前缀和自定义名称两部分组成。</li>
            <li>默认前缀为'icos_'，后台自动添加。</li>
            <li>自定义部分规则为1-16位字符，可包含英文字母和数字。</li>
          </ul>
        </div>
      </el-col> -->
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide" :disabled="loading">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="loading">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "EditUser",
  props: ["userInfo"],
  data() {
    return {
      editUserForm: {
        name: "",
        group: "",
        password: ""
      },
      visible: true,
      loading: false,
      groupOptions: [],
      rules: {
        name: [
          { type: "required", trigger: "blur change" }
        ],
        group: [
          { type: "required", trigger: "blur change" }
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
    if (this.userInfo) {
      this.editUserForm = {
        name: this.userInfo.name,
        group: this.userInfo.group,
        password: ""
      }
    }
  },
  methods: {
    hide () {
      this.$emit("handleShow", {});
      this.$emit("onRefresh", {});
    },
    async confirmFun() {
      let self = this;
      this.$refs.editUserForm.validate(async valid => {
        if (valid) {
          self.loading = true;
          let projectId = self.$cookie.get('pid');
          let url = `api/manila/v2/${projectId}/os-user-manage/edit_user`;
          let body = {
            "name": self.editUserForm.name,
            "mainGroup": self.editUserForm.group,
            "password": self.editUserForm.password
          };
          body = JSON.stringify(body);
          let logZH = "编辑CIFS文件存储用户:" + self.editUserForm.name;
          let logEN = "Edit CIFS uesr: " + self.editUserForm.name;
          if (self.userInfo.group != self.editUserForm.group) {
            logZH = logZH + ",用户组修改为" + self.editUserForm.group;
            logEN = logEN + ",the group changed to:" + self.editUserForm.group;
          }
          if (self.userInfo.password != self.editUserForm.password) {
            logZH = logZH + "，用户密码被修改";
            logEN = logEN + ",the password has been changed";
          }
          try {
            let result = await self.$ajax({
              type: "post",
              data: body,
              url: url,
              showErrMsg: true,
              log: {
                description: {
                  en: logEN,
                  zh_cn: logZH
                },
                target: Vue.logTarget.storage_share_CIFS
              },
              successFun: function () {
                self.$message.info(Vue.t("storage.editCIFSUserSuccess"));
                self.loading = false;
                self.hide();
              },
              errFun: function(xhr, status, msg) {
                self.$message.error(Vue.t("storage.editCIFSUserFailed"));
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
          if (!result.includes(item["mainGroup"])) {
            result.push(item["mainGroup"]);
          }
        }
        self.groupOptions = result;
      } catch (data) {
        this.loading = false;
      }
    }
  }
};
</script>
<style scoped>
.width90 {
  width: 90%;
}
</style>
