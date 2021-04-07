<template>
  <el-dialog
    :title="$t('db.createUser')"
    :visible.sync="dialogVisible"
    :before-close="handleCancel"
    v-dialogDrag>
    <el-form
      ref="createDatabaseUserForm" 
      class="me-required-form"
      :model="createDatabaseUserForm" 
      :rules=rules 
      label-width="100px"
      v-loading="loading">
      <el-form-item :label="$t('db.database')" prop="databases">
        <el-select class="col-12" v-model="createDatabaseUserForm.databases" filterable clearable @change="databaseChange">
          <el-option v-for="item in databaseOptions" :key="item.name" :label="item.name" :value="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-12" v-model="createDatabaseUserForm.name"></el-input>
        <el-tooltip placement="right-start">
          <div slot="content" v-html="$t('db.userNameDesc')"></div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('lang.password')" prop="password" class="is-required">
        <el-input type="password" class="col-12" v-model="createDatabaseUserForm.password"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.confirmPassword')" prop="confirmPassword" class="is-required">
        <el-input type="password" class="col-12" v-model="createDatabaseUserForm.confirmPassword"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.host')" v-if="databaseType=='mongodb'">
        <el-input class="col-12" v-model="createDatabaseUserForm.allowedHost" disabled></el-input>
        <el-tooltip placement="right-start">
          <div slot="content" v-html="$t('db.mongodbHostDesc')"></div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('lang.host')" prop="allowedHost" v-if="databaseType!='mongodb'">
        <el-input class="col-12" v-model="createDatabaseUserForm.allowedHost" >
          <el-select slot="prepend" v-model="createDatabaseUserForm.hostIPType" @change="hostIPTypeChange" style="width:80px;">
            <el-option label="IP" value="1">IP</el-option>
            <el-option :label="$t('db.ipRange')" value="2">{{$t('db.ipRange')}}</el-option>
          </el-select>
          <template slot="append" v-if="createDatabaseUserForm.hostIPType=='2'">.*</template>
        </el-input>
        <el-tooltip placement="right-start">
          <div slot="content" v-html="$t('db.hostDesc')"></div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="confirm" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "CreateDatabaseUser",
    data() {
      return {
        createDatabaseUserForm: {
          name: '',
          password: '',
          confirmPassword: '',
          databases:'',
          allowedHost:"",
          hostIPType:"1"
        },
        databaseType:"",
        dialogVisible: false,
        loading:false,
        saving: false,
        databaseOptions:[],
        rules: {
          name: [
            {type: 'required', trigger: 'blur change'},
            {type:'onlyLetterNumber'},
            {type:'notEquals', value:'root'},
            {type:'maxSize', value:16}
          ],
          password: [
            {type: 'required', trigger: 'blur change'},
            {type:'maxSize', value:10}
          ],
          confirmPassword: [
            {type: 'required', trigger: 'blur change'},
            {type:'maxSize', value:10},
            {type:'passwordEquals', context: this, value: "createDatabaseUserForm.password"}
          ],
          allowedHost: [
            {type:'ipv4'}
          ]
        }
      }
    },
    mounted() {
       this.initDialog();
    },
    methods: {
      initDialog() {
        this.dialogVisible = true;
        this.getDatabaseInstanceDetail();
        this.getDatabaseList();
      },
      // 获取数据库实例详情
      async getDatabaseInstanceDetail() {
        let self = this;
        self.loading = true;
        let instanceId = this.$route.params.instanceId;
        await this.$ajax({
          type: 'get',
          url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + instanceId,
          successFun:(ret) => {
            self.databaseType = ret.instance.datastore.type;
            self.changeUserRule(self.databaseType);
            if (self.databaseType=='mongodb') {
              self.createDatabaseUserForm.allowedHost = '*';
            }
          }
        });
        self.loading = false;
      },
      changeUserRule(databaseType) {
        if (databaseType == "mongodb") {
          this.rules.name = [
            {type: 'required', trigger: 'blur change'},
            {type:'onlyLetterNumberDot'},
            {type:'notEquals', value:'root'},
            {type:'maxSize', value:16}
          ];
        } else {
          this.rules.name = [
            {type: 'required', trigger: 'blur change'},
            {type:'onlyLetterNumber'},
            {type:'notEquals', value:'root'},
            {type:'maxSize', value:16}
          ];
        }
      },
      databaseChange(value) {
        if (this.databaseType == "mongodb") {
          if (value) {
            this.createDatabaseUserForm.name = value + ".";
          } else {
            this.createDatabaseUserForm.name = "";
          }
        }
      },
      // 获取数据库列表
      async getDatabaseList() {
        let self = this;
        self.loading = true;
        let instanceId = this.$route.params.instanceId;
        await this.$ajax({
          type: 'get',
          url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + instanceId + "/databases",
          successFun:(ret) => {
            self.databaseOptions = ret.databases;
          }
        });
        self.loading = false;
      },
      handleCancel() {
        this.$emit("handleAddShow", {});
      },
      hostIPTypeChange(value) {
        if (value == "1") {
          this.rules.allowedHost = [{type:'ipv4'}];
        } else {
          this.rules.allowedHost = [{type:'ipv4Pre3'}];
        }
        this.$refs.createDatabaseUserForm.validateField('allowedHost', (valid) => {
          // console.log(valid);
        });
      },
      confirm() {
        let self = this;
        this.$refs.createDatabaseUserForm.validate(async (valid) => {
          if (valid) {
            if (self.databaseType == "mongodb") {
              let userFormatError = false;
              if (self.createDatabaseUserForm.name.indexOf(".") > 0) {
                let userTemp = self.createDatabaseUserForm.name;
                if (self.createDatabaseUserForm.databases !== "") {
                  if (userTemp.split(".")[0] == self.createDatabaseUserForm.databases &&
                    userTemp.split(".")[1] !== "") {
                    userFormatError = false;
                  } else {
                    userFormatError = true;
                  }
                } else {
                  if (userTemp.split(".")[0] !== "" &&
                    userTemp.split(".")[1] !== "") {
                    userFormatError = false;
                  } else {
                    userFormatError = true;
                  }
                }
              } else {
                userFormatError = true;
              }
              if (userFormatError) {
                this.$message.warning(this.$t('db.userNameErrorMsg'));
                return false;
              }
            }

            self.saving = true;
            let userName = self.createDatabaseUserForm.name;
            let allowedHost = self.createDatabaseUserForm.allowedHost;
            let hostIPType = self.createDatabaseUserForm.hostIPType;
            let dataBody = {
              name:userName,
              password:self.createDatabaseUserForm.password,
              host:self.databaseType=='mongodb'?'%'
                :(hostIPType==1?(allowedHost||'%'):(allowedHost?(allowedHost+".%"):'%'))
            };

            // 判断用户是否存在
            // let userExist = self.checkUserExist(userName);
            let isExist = false;
            let dbInstanceId = self.$route.params.instanceId;
            let response = await this.$ajax({
                type: 'get',
                url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + dbInstanceId + "/users"
              });
            let dataList = response.users;
            for (var i = 0; i < dataList.length; i++) {
              if (dataList[i].name == userName) {
                isExist = true;
                break;
              }
            }

            if (isExist) {
              self.$recordLog({
                target:Vue.logTarget.databaseService,
                level:{
                  en:"error",
                  zh_cn:"错误"
                },
                description:{
                  en:"User:" + userName + "is already exist.",
                  zh_cn:"用户:" + userName + "已存在。"
                }
              });
              self.$message.error(this.$t('db.userExistError'));
              self.saving = false;
              return false;
            }

            // 选择了数据库
            if (self.createDatabaseUserForm.databases != "") {
              dataBody.databses = [{
                name:self.createDatabaseUserForm.databases
              }];
            }
            // 数据库实例ID
            let instanceId = self.$route.params.instanceId;
            self.$ajax({
              type:"post",
              url:"api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + instanceId + "/users",
              data:JSON.stringify({
                users:[dataBody]
              }),
              successMsg:this.$t('db.createSuccess'),
              log:{
                description:{
                  en:"Create database user:" + self.createDatabaseUserForm.name,
                  zh_cn:"创建数据库用户:" + self.createDatabaseUserForm.name
                },
                target:Vue.logTarget.databaseService
              },
              successFun:() => {
                if (self.createDatabaseUserForm.databases != "") {
                  self.authDatabaseUser();
                } else {
                  self.saving = false;
                  self.$emit("handleAddShow", {});
                  self.$emit("refreshData");
                }
              },
              errFun:() => {
                self.saving = false;
              }
            });
          } else {
            return false;
          }
        });
      },
      async authDatabaseUser() {
        let self = this;
        let selectedDBs = [];

        let userName = self.createDatabaseUserForm.name;
        // 数据库实例ID
        let dbInstanceId = self.$route.params.instanceId;
        // 选择了数据库
        if (self.createDatabaseUserForm.databases != "") {
          selectedDBs = [{
            name:self.createDatabaseUserForm.databases
          }];
        }
        let host = "";
        if (self.databaseType=='mongodb') {
          host = "%";
        } else {
          let allowedHost = self.createDatabaseUserForm.allowedHost;
          let hostIPType = self.createDatabaseUserForm.hostIPType;
          if (allowedHost) {
            if (hostIPType==1) {
              host = allowedHost;
            } else {
              host = allowedHost+".%";
            }
          } else {
            host = "%";
          }
        }
        await this.$ajax({
          type: 'put',
          url: "api/trove/v1.0/" + this.$cookie.get("pid") +
              "/instances/" + dbInstanceId + "/users/" + userName + encodeURIComponent("@"+host)+"/databases",
          data:JSON.stringify({
            databases:selectedDBs
          }),
          log:{
            description:{
              en:"Authorize database user:" + userName,
              zh_cn:"授权数据库用户:" + userName
            },
            target:Vue.logTarget.databaseService
          },
          // successMsg:"授权成功",
          successFun: () => {
            self.saving = false;
            self.$emit("handleAddShow");
            self.$emit("refreshData");
          },
          errFun: () => {
            self.saving = false;
          }
        });
      },
      async checkUserExist(userName) {
        let self = this;
        self.loading = true;
        let isExist = false;
        let dbInstanceId = self.$route.params.instanceId;
        let response = await this.$ajax({
            type: 'get',
            url: "api/trove/v1.0/" + this.$cookie.get("pid") + "/instances/" + dbInstanceId + "/users"
          });
        self.loading = false;
        let dataList = response.users;
        for (var i = 0; i < dataList.length; i++) {
          if (dataList[i].name == userName) {
            isExist = true;
            break;
          }
        }
        return isExist;
      }
    }
  }
</script>
<style scoped>

</style>