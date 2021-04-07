<template>
<el-dialog
  :title="$t('network.modify')"
  :visible.sync="dialogVisible"
  :before-close="handleClose">
  <el-steps :active="activeIndex" process-status="process" finish-status="success">
    <el-step :title="$t('network.monitorDetail')"></el-step>
    <el-step :title="$t('network.respoolDetail')"></el-step>
    <el-step :title="$t('network.respoolMember')"></el-step>
    <el-step :title="$t('network.healthMonitorDetail')"></el-step>
  </el-steps>
  <step-two @stepTwoDone="stepTwoDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepTwo" :listener="listener"></step-two>
  <step-three @prevStep="prevStep" @stepThreeDone="stepThreeDone" @cancel="cancel" v-show="activeIndex == 2" ref="stepThree" :poolInfo="poolInfo"></step-three>
  <step-four @prevStep="prevStep" @stepFourDone="stepFourDone" @cancel="cancel" v-show="activeIndex == 3" ref="stepFour" :memberInfo="memberInfo"></step-four>
  <step-five @prevStep="prevStep" @finishStep="finishStep" @cancel="cancel" v-show="activeIndex == 4" ref="stepFive" :healthmonitorInfo="healthmonitorInfo"></step-five>
</el-dialog>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import StepTwo from './EditStepTwo';
import StepThree from './EditStepThree';
import StepFour from './EditStepFour';
import StepFive from './EditStepFive';
export default {
  name: 'EditMonitor',
  props: ["listener", "poolInfo", "memberInfo", "healthmonitorInfo"],
  components: {
    StepTwo, StepThree, StepFour, StepFive
  },
  data() {
    return {
      activeIndex: 1,
      flag: false,
      dialogVisible: false
    }
  },
  mounted() {
    this.$parent.$parent.active = "BalanceList";
    this.dialogVisible = true;
  },
  methods: {
    prevStep(activeIndex) {
      this.flag = false;
      this.activeIndex = activeIndex;
      Vue.scrollToHeader();
    },
    stepTwoDone(param) {
      let self = this;
      self.flag = true;
      this.activeIndex = 2;
      Vue.scrollToHeader();
    },
    stepThreeDone() {
      let self = this;
      self.flag = false;
      this.activeIndex = 3;
      Vue.scrollToHeader();
    },
    stepFourDone() {
      let self = this;
      self.flag = false;
      this.activeIndex = 4;
      Vue.scrollToHeader();
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    finishStep() {
      let self = this;
      //修改监听器的参数
      let listener = {"listener":{
        "name": self.$refs.stepTwo.steptwoForm.name,
        "description": self.$refs.stepTwo.steptwoForm.description
        }
      };
      //修改资源池的参数
      let pool = {"pool":{
        "name": self.$refs.stepThree.stepthreeForm.name,
        "description": self.$refs.stepThree.stepthreeForm.description
        }
      };
      //修改member
      let memberData = self.$refs.stepFour.memberTableData;
      for (let i = 0; i < memberData.length; i++) {
        let memberobj = memberData[i];
        memberobj["project_id"] = self.listener["tenant_id"];
        memberobj["tenant_id"] = self.listener["tenant_id"];
      }
      //修改健康监听器
      let healthmonitor = {"healthmonitor":{
        "delay": self.$refs.stepFive.stepfiveForm.timedivide,
        "max_retries": self.$refs.stepFive.stepfiveForm.trytimes,
        "timeout": self.$refs.stepFive.stepfiveForm.overtime
        }
      };
      if (self.$refs.stepFive.stepfiveForm.healthyType === "HTTP") {
        healthmonitor = {"healthmonitor":{
          "delay": self.$refs.stepFive.stepfiveForm.timedivide,
          "max_retries": self.$refs.stepFive.stepfiveForm.trytimes,
          "timeout": self.$refs.stepFive.stepfiveForm.overtime,
          "http_method": self.$refs.stepFive.stepfiveForm.httpmethod,
          "expected_codes": self.$refs.stepFive.stepfiveForm.statuscode,
          "url_path": self.$refs.stepFive.stepfiveForm.urlpath
          }
        };
      }
      // self.editListeners(listener);
      // self.editpools(pool);
      // self.editpoolmembers(memberData);
      // self.edithealthmonitors(healthmonitor);
      Promise.all([self.editListeners(listener), self.editpools(pool), self.editpoolmembers(memberData), self.edithealthmonitors(healthmonitor)]).then(function(result) {
        self.$notify.success({
          message: vue.t('network.modifymonitor')
        });
        self.$emit("handleAddShow", {});
      });
      // self.$emit("createListeners", listener, pool, memberData, healthmonitor);
      // self.$notify.success({
      //   message: "修改监听器请求发送成功"
      // });
      // self.$emit("handleAddShow", {});
    },
    editListeners(listener) {
      let self = this;
      let listenerId = self.listener["id"];
      self.$ajax({
        type: "PUT",
        url: "api/octavia/v2.0/lbaas/listeners/"+listenerId,
        data: JSON.stringify(listener),
        errorKey: "NeutronError",
        success: function(result) {
        }
      });
    },
    editpools(pool) {
      let self = this;
      let poolId = self.poolInfo["id"];
      self.$ajax({
        type: "PUT",
        url: "api/neutron/v2.0/lbaas/pools/"+poolId,
        data: JSON.stringify(pool),
        errorKey: "NeutronError",
        success: function(result) {
        }
      });
    },
    editpoolmembers(memberData) {
      let self = this;
      let poolId = self.poolInfo["id"];
      for (let i = 0; i < memberData.length; i++) {
        let memberobj = memberData[i];
        let reqdata = {"member":{
          "address": memberobj["address"],
          "subnet_id": memberobj["subnet_id"],
          "protocol_port": memberobj["port"],
          "weight": memberobj["weight"],
          "project_id": memberobj["tenant_id"],
          "tenant_id": memberobj["tenant_id"]
          }
        };
        let result = self.$ajax({
          type: "POST",
          url: "api/neutron/v2.0/lbaas/pools/"+poolId+"/members",
          data: JSON.stringify(reqdata),
          errorKey: "NeutronError"
        });
      }
    },
    edithealthmonitors(healthmonitor) {
      let self = this;
      let healthmonitorId = self.healthmonitorInfo["id"];
      let result = self.$ajax({
        type: "PUT",
        url: "api/neutron/v2.0/lbaas/healthmonitors/"+healthmonitorId,
        data: JSON.stringify(healthmonitor),
        errorKey: "NeutronError",
        success: function(result) {
        }
      });
    }
  }
}
</script>