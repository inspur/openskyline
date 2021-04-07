<template>
<el-dialog
  :title="$t('network.creareHealth')"
  :visible.sync="dialogVisible"
  :before-close="handleClose"
  v-dialogDrag>
  <el-row>
    <el-col :span="20">
    <el-form class="me-required-form" :model="stepfiveForm" :rules=rules ref="stepfiveForm" label-width="140px" v-loading="loading5">
        <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
          <el-input class="col-20" v-model="stepfiveForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('network.healthType')" class="is-required" prop="healthyType">
          <el-select v-model="stepfiveForm.healthyType" @change="healthyTypeChange" class="col-20">
            <el-option label="HTTP" value="HTTP" v-if="showHTTPFlag"></el-option>
            <el-option label="HTTPS" value="HTTPS" v-if="showHTTPSFlag"></el-option>
            <el-option label="PING" value="PING" v-if="showPINGFlag"></el-option>
            <el-option label="TCP" value="TCP" v-if="showTCPFlag"></el-option>
            <el-option label="TLS-HELLO" value="TLS-HELLO" v-if="showTLSFlag"></el-option>
            <el-option label="UDP-CONNECT" value="UDP-CONNECT" v-if="showUDPFlag"></el-option>
          </el-select>
        </el-form-item>
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
      <!--超时时限-->
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
  <span slot="footer" class="dialog-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="finishStep" type="primary" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
  </span>
</el-dialog>
</template>
<script>
export default {
  name: 'AddHealthMonitor',
  props: ["poolsId", "poolsName", "projectId", "protocol"],
  data() {
    return {
      showHTTPFlag: this.protocol!='UDP' && this.protocol!='TCP' && this.protocol!='HTTPS',
      showHTTPSFlag: this.protocol!='UDP' && this.protocol!='TCP' && this.protocol!='HTTP',
      showPINGFlag: this.protocol!='UDP',
      showTCPFlag: this.protocol!='UDP',
      showTLSFlag: this.protocol!='UDP' && this.protocol!='TCP' && this.protocol!='HTTP',
      showUDPFlag: this.protocol==='UDP',
      dialogVisible: false,
      httpview: false,
      loading5: false,
      warninnote1: false,
      warninnote2: false,
      finishStatus: false,
      isDisabled: false,
      stepfiveForm: {
        name:'',
        healthyType: '',
        timedivide: '5',
        trytimes: '3',
        failtrytimes:'3',
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
          {type: 'max', value: 86400},
          {type: 'min', value: 0}
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
          {type: 'max', value: 86400},
          {type: 'min', value: 0}
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
        if (val === "UDP") {
          this.stepfiveForm.healthyType = "UDP-CONNECT";
        } else {
          this.stepfiveForm.healthyType = "PING";
        }
      }
    }
  },
  mounted() {
    this.dialogVisible = true;
    if (this.protocol === "UDP") {
      this.stepfiveForm.healthyType = "UDP-CONNECT";
    } else {
      this.stepfiveForm.healthyType = "PING";
    }
  },
  methods: {
    finishStep() {
      let self = this;
      self.$refs.stepfiveForm.validate((valid) => {
        let overtime = self.stepfiveForm.overtime;
        let timedivide = self.stepfiveForm.timedivide;
        if (self.protocol !== 'UDP') {
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
            self.isDisabled = true;
            //创建健康监听器
            let healthmonitor = {"healthmonitor":{
              "name":self.stepfiveForm.name,
              "delay": self.stepfiveForm.timedivide,
              "max_retries": self.stepfiveForm.trytimes,
              "max_retries_down": self.stepfiveForm.failtrytimes,
              "timeout": self.stepfiveForm.overtime,
              "type":  self.stepfiveForm.healthyType,
              "pool_id": self.poolsId,
              "project_id": self.projectId,
              "tenant_id": self.projectId
              }
            };
            if (self.stepfiveForm.healthyType === "HTTP" || self.stepfiveForm.healthyType === "HTTPS") {
              healthmonitor = {"healthmonitor":{
                "name":self.stepfiveForm.name,
                "delay": self.stepfiveForm.timedivide,
                "max_retries": self.stepfiveForm.trytimes,
                "max_retries_down": self.stepfiveForm.failtrytimes,
                "timeout": self.stepfiveForm.overtime,
                "type":  self.stepfiveForm.healthyType,
                "http_method": self.stepfiveForm.httpmethod,
                "expected_codes": self.stepfiveForm.statuscode,
                "url_path": self.stepfiveForm.urlpath,
                "pool_id": self.poolsId,
                "project_id": self.projectId,
                "tenant_id": self.projectId
                }
              };
            }
            let result = self.$ajax({
              type: "POST",
              url: "api/octavia/v2.0/lbaas/healthmonitors",
              data: JSON.stringify(healthmonitor),
              successMsg: Vue.t('network.createSuccess'),
              errorKey: "NeutronError",
              success: function(result) {
                self.loading5 = false;
                self.isDisabled = false;
                self.$emit("handleAddHealthShow", {});
              },
              errFun() {
                self.loading5 = false;
                self.isDisabled = false;
              },
              log:{
                description:{
                  en: "Resource Pool:"+self.poolsName+" Create Health Monitor",
                  zh_cn: "资源池:"+self.poolsName+"创建健康检查器"
                },
                target:Vue.logTarget.balance
              }
            });
          }
        } else {
          return false;
        }
      });
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow");
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
        this.finishStatus = true;
      } else {
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
        this.finishStatus = true;
      } else {
        this.finishStatus = false;
      }
    }
  }
}
</script>
