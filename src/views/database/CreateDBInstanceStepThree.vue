<template>
  <div v-loading="finishMask">
    <el-form v-if="stepOneData.databaseType!='redis'" class="margin-tb20 me-required-form" ref="createDBInstanceForm" :model="createDBInstanceForm" :rules=rules label-width="120px">
      <el-form-item :label="$t('db.databaseName')" prop="databases" class="is-required">
        <el-input class="col-12" v-model="createDBInstanceForm.databases" @change="databaseNameChange"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.userName')" prop="user" class="is-required">
        <el-input class="col-12" v-model="createDBInstanceForm.user" ></el-input>
        <el-tooltip placement="right-start">
          <div slot="content" v-html="$t('db.userNameDesc')"></div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('lang.password')" prop="password" class="is-required">
        <el-input type="password" class="col-12" v-model="createDBInstanceForm.password" ></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.confirmPassword')" prop="confirmPassword" class="is-required">
        <el-input type="password" class="col-12" v-model="createDBInstanceForm.confirmPassword" ></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.host')" v-if="stepOneData.databaseType=='mongodb'">
        <el-input class="col-12" v-model="createDBInstanceForm.allowedHost" disabled></el-input>
        <el-tooltip placement="right-start">
          <div slot="content" v-html="$t('db.mongodbHostDesc')"></div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('lang.host')" prop="allowedHost" v-if="stepOneData.databaseType!='mongodb'">
        <el-input class="col-12" v-model="createDBInstanceForm.allowedHost" >
          <el-select slot="prepend" v-model="createDBInstanceForm.hostIPType" @change="hostIPTypeChange" style="width:80px;">
            <el-option label="IP" value="1">IP</el-option>
            <el-option :label="$t('db.ipRange')" value="2">{{$t('db.ipRange')}}</el-option>
          </el-select>
          <template slot="append" v-if="createDBInstanceForm.hostIPType=='2'">.*</template>
        </el-input>
        <el-tooltip placement="right-start">
          <div slot="content" v-html="$t('db.hostDesc')"></div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div style="height:300px;padding:20px 10px;" v-if="stepOneData.databaseType=='redis'">{{$t('db.redisInitDesc')}}</div>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary">{{$t('lang.finish')}}</el-button>
    </div>
  </div>
</template>
<script>
  export default {
    name: "CreateDBInstanceStepThree",
    props:{
      stepOneData:{
        type:Object,
        default:() => {
          return {};
        }
      }
    },
    data() {
      return {
        createDBInstanceForm: {
          databases:"",
          user:"",
          password:"",
          confirmPassword:"",
          allowedHost:"",
          hostIPType:"1"
        },
        finishMask:false,
        rules: {
          databases: [
            {type: 'required', trigger: 'blur change'},
            {type:'minSize', value:2},
            {type:'maxSize', value:40},
            {type:'onlyLetterNumber'}
          ],
          user: [
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
            {type:'passwordEquals', context: this, value: "createDBInstanceForm.password"}
          ],
          allowedHost: [
            {type:'ipv4'}
          ]
        }
      }
    },
    mounted() {
       this.initForm = Object.assign({}, this.createDBInstanceForm);
    },
    methods: {
      changeUserRule() {
        if (this.stepOneData.databaseType == "mongodb") {
          this.rules.databases = [
            {type: 'required', trigger: 'blur change'},
            {type:'minSize', value:2},
            {type:'maxSize', value:10},
            {type:'onlyLetterNumber'}
          ];
          this.rules.user = [
            {type: 'required', trigger: 'blur change'},
            {type:'onlyLetterNumberDot'},
            {type:'notEquals', value:'root'},
            {type:'maxSize', value:16}
          ];
          this.createDBInstanceForm.allowedHost = "*";
        } else {
          this.rules.databases = [
            {type: 'required', trigger: 'blur change'},
            {type:'minSize', value:2},
            {type:'maxSize', value:40},
            {type:'onlyLetterNumber'}
          ];
          this.rules.user = [
            {type: 'required', trigger: 'blur change'},
            {type:'onlyLetterNumber'},
            {type:'notEquals', value:'root'},
            {type:'maxSize', value:16}
          ];
        }
      },
      databaseNameChange(value) {
        if (this.stepOneData.databaseType == "mongodb") {
          this.createDBInstanceForm.user = value + ".";
        }
      },
      hostIPTypeChange(value) {
        if (value == "1") {
          this.rules.allowedHost = [{type:'ipv4'}];
        } else {
          this.rules.allowedHost = [{type:'ipv4Pre3'}];
        }
        this.$refs.createDBInstanceForm.validateField('allowedHost', (valid) => {
          // console.log(valid);
        });
      },
      prevStep() {
        this.$emit("prevStep", 0);
      },
      nextStep() {
        if (this.stepOneData.databaseType=='redis') {
          //此乃假数据，后台不需要，但是仍然必填
          this.$emit("stepThreeDone", {
            databases:"inspur",
            user:"inspur",
            password:"inspur"
          });
          return;
        }
        this.$refs.createDBInstanceForm.validate((valid) => {
          if (!valid) {
            return false;
          }
          // mongodb特殊处理
          if (this.stepOneData.databaseType == "mongodb") {
            let userFormatError = false;
            if (this.createDBInstanceForm.user.indexOf(".") > 0) {
              let userTemp = this.createDBInstanceForm.user;
              if (userTemp.split(".")[0] == this.createDBInstanceForm.databases &&
                userTemp.split(".")[1] !== "") {
                userFormatError = false;
              } else {
                userFormatError = true;
              }
            } else {
              userFormatError = true;
            }
            if (userFormatError) {
              this.$message.warning(this.$t('db.userNameErrorMsg'));
              return false;
            }
          }
          if (this.createDBInstanceForm.hostIPType === "2") {
            if (this.createDBInstanceForm.allowedHost == "") {
              this.createDBInstanceForm.userHost = this.createDBInstanceForm.allowedHost;
            } else {
              this.createDBInstanceForm.userHost = this.createDBInstanceForm.allowedHost + ".%";
            }
          } else {
            this.createDBInstanceForm.userHost = this.createDBInstanceForm.allowedHost;
          }
          if (this.stepOneData.databaseType == "mongodb") {
            this.createDBInstanceForm.userHost = "";
          }
          this.$emit("stepThreeDone", this.createDBInstanceForm);
        });
      },
      cancel() {
        this.$emit("cancel");
      },
      showFinishMask() {
        this.finishMask = true;
      },
      hideFinishMask() {
        this.finishMask = false;
      }
    }
  }
</script>
<style scoped>

</style>