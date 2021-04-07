<template>
  <el-dialog  :title="$t('lang.modify')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form class="me-required-form" :model="stepthreeForm" :rules="rules" ref="stepthreeForm" label-width="100px" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-20" v-model="stepthreeForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" class="col-20" v-model="stepthreeForm.description" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.method')" class="is-required" prop="protocol">
        <el-select class="col-20" v-model="stepthreeForm.protocol">
          <el-option :label="$t('network.leastconnect')" value="LEAST_CONNECTIONS"></el-option>
          <el-option :label="$t('network.roundRobin')" value="ROUND_ROBIN"></el-option>
          <el-option :label="$t('network.sourceIP')" value="SOURCE_IP"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.sessionpersi')" prop="sessionType">
          <el-select class="col-20" v-model="stepthreeForm.sessionType">
            <el-option label="None" value=""></el-option>
            <el-option label="SOURCE_IP" value="SOURCE_IP"></el-option>
            <el-option label="HTTP_COOKIE" value="HTTP_COOKIE" v-if="poolInfo.protocol!='UDP'"></el-option>
            <el-option label="APP_COOKIE" value="APP_COOKIE" v-if="poolInfo.protocol!='UDP'"></el-option>
          </el-select>
        </el-form-item>
      <el-form-item :label="$t('network.PERSISTENCE_TIMEOUT')" class="is-required" prop="persistence_timeout" v-if="poolInfo.protocol=='UDP' && stepthreeForm.sessionType =='SOURCE_IP'">
        <el-input-number v-model="stepthreeForm.persistence_timeout" controls-position="right" :min="0" :max="86400" class="col-20"></el-input-number>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.PERSISTENCE_TIMEOUT_TOOLTIP')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.PERSISTENCE_GRANULARITY')" class="is-required" prop="persistence_granularity" v-if="poolInfo.protocol=='UDP' && stepthreeForm.sessionType =='SOURCE_IP'">
        <el-input class="col-20" v-model="stepthreeForm.persistence_granularity" auto-complete="off"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.PERSISTENCE_GRANULARITY_TOOLTIP')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.manageStatus')" class="is-required" prop="manageStatus">
        <el-select class="col-20" v-model="stepthreeForm.manageStatus">
          <el-option label="UP" :value=true :key="true"></el-option>
          <el-option label="DOWN" :value=false :key="false"></el-option>
        </el-select>
      </el-form-item>
        <el-form-item :label="'Cookie'+$t('lang.name')" class="is-required" prop="cookieName" v-if="stepthreeForm.sessionType=='APP_COOKIE'">
          <el-input class="col-20" v-model="stepthreeForm.cookieName" auto-complete="off"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="handleEditConfirm" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'EditStepThree',
  props: ["poolInfo"],
  data() {
    return {
      stepthreeForm: {
        name: '',
        description: '',
        protocol: '',
        sessionType:'',
        cookieName:'',
        manageStatus: '',
        persistence_timeout: '360',
        persistence_granularity: '255.255.255.255'
      },
      dialogVisible: false,
      isDisabled: false,
      loading: false,
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 40}
        ],
        cookieName: [
          {type: 'onlyLetterNumber'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 255}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ],
        manageStatus: [{ type: "requiredNet" }],
        persistence_timeout: [
          { type: "requiredNet" }, { type: "integer" }
        ],
        persistence_granularity: [
          {type: "requiredNet"},
          {type: "isValidMask"}
        ]
      }
    }
  },
  mounted() {
    this.dialogVisible = true;
    this.stepthreeForm.name = this.poolInfo["name"];
    this.stepthreeForm.protocol = this.poolInfo["lb_algorithm"];
    this.stepthreeForm.manageStatus = this.poolInfo["admin_state_up"];
    this.stepthreeForm.description = this.poolInfo["description"];
    this.stepthreeForm.sessionType = this.poolInfo["session_persistence"]?this.poolInfo["session_persistence"]["type"]:"";
    this.stepthreeForm.cookieName = this.poolInfo["session_persistence"]?(this.poolInfo["session_persistence"]["cookie_name"] || ""):"";
    this.stepthreeForm.persistence_timeout = this.poolInfo["session_persistence"]?(this.poolInfo["session_persistence"]["persistence_timeout"] || ""):"360";
    this.stepthreeForm.persistence_granularity = this.poolInfo["session_persistence"]?(this.poolInfo["session_persistence"]["persistence_granularity"] || ""):"255.255.255.255";
  },
  methods: {
    cancel() {
      this.$emit("handleCancelShow");
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    handleEditConfirm() {
      let self = this;
      let sessionPersistence = {};
      if (self.stepthreeForm.sessionType == "") {
        sessionPersistence = null;
      } else if (self.stepthreeForm.sessionType === "SOURCE_IP" && self.poolInfo.protocol === "UDP") {
        sessionPersistence = {
          "type":self.stepthreeForm.sessionType,
          "persistence_timeout": self.stepthreeForm.persistence_timeout,
          "persistence_granularity" : self.stepthreeForm.persistence_granularity
        };
      } else if (self.stepthreeForm.sessionType == "APP_COOKIE") {
        sessionPersistence = {
          "type":self.stepthreeForm.sessionType,
          "cookie_name":self.stepthreeForm.cookieName
        };
      } else {
        sessionPersistence = {
          "type":self.stepthreeForm.sessionType,
          "cookie_name":null
        };
      }
      // let sessionT = {type:self.stepthreeForm.sessionType};
      // if (self.stepthreeForm.sessionType == "APP_COOKIE" && self.stepthreeForm.cookieName != "") {
      //   sessionT.cookie_name = self.stepthreeForm.cookieName;
      // }
      let pool = {"pool":{
        "name": self.stepthreeForm.name,
        "description": self.stepthreeForm.description,
        "lb_algorithm": self.stepthreeForm.protocol,
        "session_persistence":sessionPersistence,
        "admin_state_up": self.stepthreeForm.manageStatus
        }
      };
      let poolId = self.poolInfo["id"];
      self.$refs.stepthreeForm.validate(async(valid) => {
        if (valid) {
          self.isDisabled = true;
          self.loading = true;
          let methodBefore = self.getMethodName(self.poolInfo["lb_algorithm"]);
          let methodAfter = self.getMethodName(self.stepthreeForm.protocol);
          let sessionTypeBefore = self.getsessionType(self.poolInfo["session_persistence"]?self.poolInfo["session_persistence"]["type"]:"");
          let sessionTypeAfter = self.getsessionType(self.stepthreeForm.sessionType);
          let adminStateBefore = (self.poolInfo["admin_state_up"] === true) ? "UP" : "DOWN";
          let adminStateAfter = (self.stepthreeForm.manageStatus === true) ? "UP" : "DOWN";
          let timeoutBefore = "";
          let timeoutAfter = "";
          let granularityBefore = "";
          let granularityAfter = "";
          if (self.poolInfo.protocol=='UDP' && self.stepthreeForm.sessionType =='SOURCE_IP') {
            timeoutBefore = self.poolInfo["session_persistence"]?(self.poolInfo["session_persistence"]["persistence_timeout"] || ""):"360";
            timeoutAfter = self.stepthreeForm.persistence_timeout;
            granularityBefore = self.poolInfo["session_persistence"]?(self.poolInfo["session_persistence"]["persistence_granularity"] || ""):"255.255.255.255";
            granularityAfter = self.stepthreeForm.persistence_granularity;
          }
          let cookieNameBefore = "";
          let cookieNameAfter = "";
          if (self.stepthreeForm.sessionType==='APP_COOKIE') {
            cookieNameBefore = self.poolInfo["session_persistence"]?(self.poolInfo["session_persistence"]["cookie_name"] || ""):"";
            cookieNameAfter = self.stepthreeForm.cookieName;
          }
          self.$ajax({
            type: "PUT",
            url: "api/octavia/v2.0/lbaas/pools/"+poolId,
            data: JSON.stringify(pool),
            errorKey: "NeutronError",
            successMsg: Vue.t('network.saveSuccess'),
            success: function(result) {
              self.loading = false;
              self.isDisabled = false;
              self.$emit("handleEditPoolShow", {});
            },
            errFun() {
              self.loading = false;
              self.isDisabled = false;
            },
            log:{
              description:{
                en:"Before edit pool name:"+self.poolInfo.name+", After edit pool name:" + self.stepthreeForm.name,
                zh_cn:`资源池修改前: 名称:${self.poolInfo.name} 方法: ${methodBefore} 会话持久化: ${sessionTypeBefore} 时限: ${timeoutBefore || ""} 粒度:
                ${granularityBefore || ""} 管理状态: ${adminStateBefore}  Cookie名称: ${cookieNameBefore || ""}  描述: ${self.poolInfo["description"]} 资源池修改后: 名称
                :${self.stepthreeForm.name} 方法: ${methodAfter} 会话持久化: ${sessionTypeAfter}时限: ${timeoutAfter || ""} 粒度: ${granularityAfter || ""} 管理状态: ${adminStateAfter} Cookie名称: ${cookieNameAfter || ""} 描述: ${self.stepthreeForm.description} `
              },
              target:Vue.logTarget.balance
            }
          });
          return true;
        } else {
          return false;
        }
      });
    },
    getMethodName (value) {
      if (value === "LEAST_CONNECTIONS") {
        return Vue.t('network.leastconnect');
      }
      if (value === "ROUND_ROBIN") {
        return Vue.t('network.roundRobin');
      }
      if (value === "SOURCE_IP") {
        return Vue.t('network.sourceIP');
      }
    },
    getsessionType(value) {
      if (!value) {
        return "None";
      }
      return value;
    },
    getmanageStatus(value) {

    }
  }
}
</script>
