<template>
  <el-dialog
    :title="$t('db.createDatabaseInstance')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    v-dialogDrag>
    <el-steps :space="180" :active="activeIndex" process-status="process" finish-status="success">
      <el-step :title="$t('db.basicInfo')"></el-step>
      <el-step :title="$t('db.initDatabase')"></el-step>
    </el-steps>
    <step-one @stepOneDone="stepOneDone" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne"></step-one>
    <step-three :stepOneData="createDBInstanceForm" @prevStep="prevStep" @stepThreeDone="stepThreeDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepThree"></step-three>
  </el-dialog>
</template>
<script>
  import StepOne from './CreateDBInstanceStepOne';
  import StepThree from './CreateDBInstanceStepThree';
  export default {
    name: "CreateDBInstanceGuide",
    components: {
      StepOne, StepThree
    },
    data() {
      return {
        activeIndex: 0,
        flag: false,
        dialogVisible: false,
        createDBInstanceForm:{}
      }
    },
    mounted() {
      this.initDialog();
    },
    methods: {
      initDialog() {
        var self = this;
        self.dialogVisible = true;
      },
      prevStep(activeIndex) {
        this.flag = false;
        this.activeIndex = activeIndex;
        Vue.scrollToHeader();
      },
      stepOneDone(param) {
        var self = this;
        self.createDBInstanceForm = Object.assign({}, self.createDBInstanceForm, param);
        self.flag = true;
        this.activeIndex = 1;
        self.$nextTick(() => {
          self.$refs.stepThree.changeUserRule();
        });
        Vue.scrollToHeader();
      },
      stepThreeDone(param) {
        var self = this;
        self.createDBInstanceForm = Object.assign({}, self.createDBInstanceForm, param);

        let formData = {};
        formData.availability_zone = self.createDBInstanceForm.availabilityZone;
        formData.name = self.createDBInstanceForm.name;
        formData.volume = {
          type:self.createDBInstanceForm.volumeType||"no_type",
          size:self.createDBInstanceForm.diskSize
        };
        formData.flavorRef = self.createDBInstanceForm.flavor;
        // 网络
        formData.nics = [];
        let network = self.createDBInstanceForm.network;
        formData.nics.push({
          "net-id":network
        });
        // if (network.length > 0) {
        //   network.forEach(obj => {
        //     formData.nics.push({
        //       "net-id":obj
        //     })
        //   });
        // }
        formData.datastore = {
          type:self.createDBInstanceForm.databaseType,
          version:self.createDBInstanceForm.databaseVersion
        };
        formData.databases = [{
          name:self.createDBInstanceForm.databases
        }];
        // mongodb特殊处理
        let dbUser = "";
        // if (self.createDBInstanceForm.databaseType == "mongodb") {
        //     dbUser = self.createDBInstanceForm.databases + "." + self.createDBInstanceForm.user;
        // } else {
            dbUser = self.createDBInstanceForm.user;
        // }
        let allowedHost = self.createDBInstanceForm.userHost;
        if (allowedHost === "") {
          formData.users = [{
            name:dbUser,
            password:self.createDBInstanceForm.password
          }];
        } else {
          formData.users = [{
            name:dbUser,
            password:self.createDBInstanceForm.password,
            host:allowedHost
          }];
        }

        this.$refs.stepThree.showFinishMask();
        this.$ajax({
          type:"post",
          url:"api/trove/v1.0/" + this.$cookie.get("pid") + "/instances",
          data:JSON.stringify({instance:formData}),
          successMsg:this.$t('db.startCreateInstance'),
          log:{
            description:{
              en:"Create database instance:" + self.createDBInstanceForm.name,
              zh_cn:"创建数据库实例:" + self.createDBInstanceForm.name
            },
            target:Vue.logTarget.databaseService
          },
          successFun:(result) => {
            console.log(result);
            if (result["code"] == "reserved_database") {
              self.$message.error(Vue.t('db.reservedKeyMsg', self.createDBInstanceForm.databases));
            }
            this.$refs.stepThree.hideFinishMask();
            this.$emit("handleAddShow", {});
            this.$emit("refreshData");
          },
          errFun:() => {
            this.$refs.stepThree.hideFinishMask();
          }
        });
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      cancel() {
        this.$emit("handleAddShow", {});
      }
    }
  }
</script>
<style scoped>

</style>