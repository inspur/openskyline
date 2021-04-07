<template>
<div v-loading="loading5">
  <el-row>
    <el-col :span="20">
    <el-form class="me-required-form margin-tb20" :model="stepfiveForm" :rules=rules ref="stepfiveForm" label-width="150px">
        <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
          <el-input class="col-20" v-model="stepfiveForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('network.healthType')" class="is-required" prop="healthyType">
          <el-select v-model="stepfiveForm.healthyType" @change="healthyTypeChange" class="col-20">
            <el-option label="HTTP" value="HTTP" v-if="showHTTPFlag"></el-option>
            <el-option label="HTTPS" value="HTTPS" v-if="showHTTPSFlag&&!isTERMINATED_HTTPS"></el-option>
            <el-option label="PING" value="PING" v-if="showPINGFlag"></el-option>
            <el-option label="TCP" value="TCP" v-if="showTCPFlag"></el-option>
            <el-option label="TLS-HELLO" value="TLS-HELLO" v-if="showTLSFlag&&!isTERMINATED_HTTPS"></el-option>
            <el-option label="UDP-CONNECT" value="UDP-CONNECT" v-if="showUDPFlag&&!isTERMINATED_HTTPS"></el-option>
          </el-select>
        </el-form-item>
        <!--时间间隔-->
        <el-form-item :label="$t('network.timeDevide')" class="is-required" prop="timedivide">
          <el-input v-model="stepfiveForm.timedivide" :min="0" :max="86400" class="col-20"></el-input>
          <el-tooltip  effect="dark" placement="top">
            <span slot="content" v-show="stepfiveForm.healthyType!=='UDP-CONNECT'">{{$t('network.healthNote3')}}</span><span slot="content" v-show="stepfiveForm.healthyType=='UDP-CONNECT'">{{$t('network.UDP_TIME_POINT')}}</span>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      <!--失败重试次数-->
        <el-form-item :label="$t('network.failtrytimes')" class="is-required" prop="failtrytimes">
          <el-input-number v-model="stepfiveForm.failtrytimes" controls-position="right" :min="1" :max="10" class="col-20"></el-input-number>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.healthNote14')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      <!--重试次数-->
        <el-form-item :label="$t('network.trytimes')" class="is-required" prop="trytimes">
          <el-input-number v-model="stepfiveForm.trytimes" controls-position="right" :min="1" :max="10" class="col-20"></el-input-number>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.healthNote5')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      <!--超时时限(秒)-->
        <el-form-item :label="$t('network.overtime')" class="is-required" prop="overtime">
          <el-input v-model="stepfiveForm.overtime" :min="0" :max="86400" class="col-20"></el-input>
          <el-tooltip  effect="dark" placement="top">
            <span slot="content" v-show="stepfiveForm.healthyType!=='UDP-CONNECT'">{{$t('network.healthNote7')}}</span><span slot="content" v-show="stepfiveForm.healthyType=='UDP-CONNECT'">{{$t('network.UDP_TIMEOUT_POINT')}}</span>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <div v-if="httpview">
          <el-form-item :label="$t('network.httpMethod')">
            <el-select class="col-20" v-model="stepfiveForm.httpmethod">
              <el-option label="GET" value="GET"></el-option>
              <el-option label="HEAD" value="HEAD"></el-option>
            </el-select>
            <el-tooltip  effect="dark" placement="top">
              <div slot="content">{{$t('network.healthNote9')}}</div>
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('network.statusCode')" class="is-required" prop="statuscode">
            <el-input class="col-20" v-model="stepfiveForm.statuscode"></el-input>
            <el-tooltip  effect="dark" placement="top">
              <div slot="content">{{$t('network.healthNote11')}}</div>
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('network.urlPath')" class="is-required" prop="urlpath">
            <el-input class="col-20" v-model="stepfiveForm.urlpath"></el-input>
            <el-tooltip  effect="dark" placement="top">
              <div slot="content">{{$t('network.healthNote13')}}</div>
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
        </div>
      </el-form>
    </el-col>
  </el-row>
  <div class="me-form-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="prevStep" type="primary" >{{$t('lang.preStep')}}</el-button>
    <el-button @click="finishStep" type="primary" :disabled="limitStatus">{{$t('lang.finish')}}</el-button>
    <span v-if="limitStatus" style="color:#dd4b39;font-size:12px;">{{$t('network.respoolused')}}</span>
  </div>
 </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'CreateStepFive',
  props: ["limitStatus", "protocol", "IsUDPFlag"],
  data() {
    return {
      isTERMINATED_HTTPS: this.protocol === 'TERMINATED_HTTPS',
      showHTTPFlag: this.protocol!='UDP' && (!this.IsUDPFlag) && this.protocol!='TCP' && this.protocol!='HTTPS',
      showHTTPSFlag: this.protocol!='UDP' && (!this.IsUDPFlag) && this.protocol!='TCP' && this.protocol!='HTTP',
      showPINGFlag: this.protocol!='UDP' && (!this.IsUDPFlag),
      showTLSFlag: this.protocol!='UDP' && (!this.IsUDPFlag) && this.protocol!='TCP' && this.protocol!='HTTP',
      showTCPFlag: this.protocol!='UDP' && (!this.IsUDPFlag),
      showUDPFlag: this.protocol=='UDP' || this.IsUDPFlag,
      activeIndex: 4,
      dialogVisible: false,
      httpview: false,
      loading5: false,
      warninnote1: false,
      warninnote2: false,
      finishStatus: false,
      stepfiveForm: {
        name:'',
        healthyType: "",
        timedivide: '5',
        failtrytimes:'3',
        trytimes: '3',
        overtime: '5',
        httpmethod: "GET",
        statuscode: "200",
        urlpath: "/"
      },
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 40}
        ],
        timedivide: [
          {type: 'requiredNet'},
          {type: 'integer'},
          {type: 'min', value: 0},
          {type: 'max', value: 86400}
        ],
        healthyType: [
          {type: 'requiredNet'}
        ],
        failtrytimes: [
          {type: 'requiredNet'},
          {type: 'integer'}
        ],
        trytimes: [
          {type: 'requiredNet'},
          {type: 'integer'}
        ],
        overtime: [
          {type: 'requiredNet'},
          {type: 'integer'},
          {type: 'min', value: 0},
          {type: 'max', value: 86400}
        ],
        statuscode: [
          {type: 'requiredNet'},
          {type: 'balancerStatusCode'},
          {type: 'maxSize', value: 60}
        ],
        urlpath: [
          {type: 'requiredNet'},
          {type: 'balancerurlpath'}
        ]
      }
    }
  },
  watch: {
    protocol: {
      handler: function(val, oldVal) {
        this.showHTTPFlag = this.protocol!='UDP' && (!this.IsUDPFlag) && this.protocol!='TCP' && this.protocol!='HTTPS';
        this.showHTTPSFlag = this.protocol!='UDP' && (!this.IsUDPFlag) && this.protocol!='TCP' && this.protocol!='HTTP';
        this.showPINGFlag = this.protocol!='UDP' && (!this.IsUDPFlag);
        this.showTLSFlag = this.protocol!='UDP' && (!this.IsUDPFlag) && this.protocol!='TCP' && this.protocol!='HTTP';
        this.showTCPFlag = this.protocol!='UDP' && (!this.IsUDPFlag);
        this.showUDPFlag = this.protocol=='UDP' || this.IsUDPFlag;
        if (val === "UDP" || this.IsUDPFlag) {
          this.stepfiveForm.healthyType = "UDP-CONNECT";
        } else {
          this.stepfiveForm.healthyType = "PING";
        }
        this.isTERMINATED_HTTPS = this.protocol === 'TERMINATED_HTTPS';
      }
    },
    IsUDPFlag: {
      handler: function(val, oldVal) {
        if (this.protocol === "UDP" || val) {
          this.stepfiveForm.healthyType = "UDP-CONNECT";
        } else {
          this.stepfiveForm.healthyType = "PING";
        }
      }
    }
  },
  mounted() {
    this.loading5 = false;
  },
  methods: {
    finishStep() {
      let self = this;
      self.$refs.stepfiveForm.validate((valid) => {
        let overtime = self.stepfiveForm.overtime;
        let timedivide = self.stepfiveForm.timedivide;
        if (!self.IsUDPFlag && self.protocol !== "UDP") {
          if (parseInt(timedivide) - parseInt(overtime) < 0) {
            self.$notify({
              message: Vue.t('network.timeNote1'),
              type: "error"
            });
            valid = false;
          }
        }
        if (valid) {
          if (!self.finishStatus) {
            self.loading5 = true;
            self.$emit("finishStep", {});
          }
        } else {
          return false;
        }
      });
    },
    prevStep() {
      this.$emit("prevStep", 3);
    },
    cancel() {
      this.$emit("cancel");
    },
    healthyTypeChange(value) {
      if (value === "HTTP" || value === "HTTPS") {
        this.httpview = true;
      } else {
        this.httpview = false;
      }
    },
    checktimedivide(value) {
      let overtime = this.stepfiveForm.overtime;
      if (value < overtime) {
        this.$notify({
          message: Vue.t('network.timeNote1'),
          type: "error"
        });
        // this.warninnote1 = true;
        this.finishStatus = true;
      } else {
        // this.warninnote1 = false;
        // this.warninnote2 = false;
        this.finishStatus = false;
      }
    },
    checkovertime(value) {
      let timedivide = this.stepfiveForm.timedivide;
      if (value > timedivide) {
        this.$notify({
          message: Vue.t('network.timeNote2'),
          type: "error"
        });
        // this.warninnote2 = true;
        this.finishStatus = true;
      } else {
        // this.warninnote1 = false;
        // this.warninnote2 = false;
        this.finishStatus = false;
      }
    }
  }
}
</script>
