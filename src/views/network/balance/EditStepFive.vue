<template>
  <el-dialog :title="$t('network.modifyHealth')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-row>
      <el-col :span="20">
        <el-form class="me-required-form margin-tb20" :model="stepfiveForm" :rules=rules ref="stepfiveForm" label-width="140px" v-loading="loading5">
          <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
            <el-input class="col-20" v-model="stepfiveForm.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item :label="$t('network.healthType')" class="is-required" prop="healthyType">
            <el-input v-model="stepfiveForm.healthyType" :disabled="true" class="col-20"></el-input>
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
              <el-input class="col-20" v-model="stepfiveForm.statuscode" :disabled="true"></el-input>
              <el-tooltip  effect="dark" placement="top">
                <div slot="content">{{$t('network.healthNote11')}}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('network.urlPath')" class="is-required" prop="urlpath">
              <el-input class="col-20" v-model="stepfiveForm.urlpath" auto-complete="off"></el-input>
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
      <el-button @click="finishStep" type="primary" :disabled="isDisabled">{{$t('lang.finish')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "EditStepThree",
  props: ["healthmonitorInfo"],
  data() {
    return {
      dialogVisible: false,
      httpview: false,
      loading5: false,
      warninnote1: false,
      warninnote2: false,
      finishStatus: false,
      isDisabled: false,
      stepfiveForm: {
        name: "",
        healthyType: "",
        timedivide: "5",
        trytimes: "3",
        failtrytimes: "3",
        overtime: "5",
        httpmethod: "GET",
        statuscode: "200",
        urlpath: "/"
      },
      rules: {
        name: [
          { type: "onlyLetterNumber_Chinese" },
          { type: "requiredNet" },
          { type: "maxSize", value: 40 }
        ],
        timedivide: [
          { type: "requiredNet" },
          { type: "integer" },
          { type: "min", value: 0 },
          { type: "max", value: 86400 }
        ],
        trytimes: [{ type: "requiredNet" }, { type: "integer" }],
        failtrytimes: [{ type: "requiredNet" }, { type: "integer" }],
        overtime: [
          { type: "requiredNet" },
          { type: "integer" },
          { type: "min", value: 0 },
          { type: "max", value: 86400 }
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
      },
      log: {
        name: "名称",
        healthyType: "健康检查类型",
        timedivide: "时间间隔(秒)",
        trytimes: "失败重试次数",
        failtrytimes: "重试次数",
        overtime: "超时时限(秒)",
        httpmethod: "HTTP方法",
        statuscode: "期望的状态码",
        urlpath: "URL路径"
      },
      editBefore: {
        name: "",
        healthyType: "",
        timedivide: "",
        trytimes: "",
        failtrytimes: "",
        overtime: "",
        httpmethod: "",
        statuscode: "",
        urlpath: ""
      }
    };
  },
  mounted() {
    this.dialogVisible = true;
    this.editBefore.healthyType = this.stepfiveForm.healthyType = this.healthmonitorInfo["type"];
    this.editBefore.timedivide = this.stepfiveForm.timedivide = this.healthmonitorInfo["delay"];
    this.editBefore.trytimes = this.stepfiveForm.trytimes = this.healthmonitorInfo["max_retries"];
    this.editBefore.failtrytimes = this.stepfiveForm.failtrytimes = this.healthmonitorInfo["max_retries_down"];
    this.editBefore.overtime = this.stepfiveForm.overtime = this.healthmonitorInfo["timeout"];
    this.editBefore.name = this.stepfiveForm.name = this.healthmonitorInfo["name"];
    if (this.healthmonitorInfo["type"] === "HTTP" || this.healthmonitorInfo["type"] === "HTTPS") {
      this.httpview = true;
      this.editBefore.httpmethod = this.stepfiveForm.httpmethod = this.healthmonitorInfo["http_method"];
      this.editBefore.statuscode = this.stepfiveForm.statuscode = this.healthmonitorInfo["expected_codes"];
      this.editBefore.urlpath = this.stepfiveForm.urlpath = this.healthmonitorInfo["url_path"];
    }
  },
  methods: {
    finishStep() {
      let self = this;
      self.$refs.stepfiveForm.validate(valid => {
        let overtime = self.stepfiveForm.overtime;
        let timedivide = self.stepfiveForm.timedivide;
        if (self.healthmonitorInfo["type"] !== "UDP-CONNECT") {
          if (parseInt(timedivide) - parseInt(overtime) < 0) {
            self.$notify({
              message: Vue.t("network.timeNote1"),
              type: "error"
            });
            valid = false;
          }
        }
        if (valid) {
          self.loading5 = true;
          self.isDisabled = true;
          let afterData = Object.assign({}, self.stepfiveForm);
          //创建健康监听器
          let healthmonitor = {
            healthmonitor: {
              name: self.stepfiveForm.name,
              delay: self.stepfiveForm.timedivide,
              max_retries: self.stepfiveForm.trytimes,
              max_retries_down: self.stepfiveForm.failtrytimes,
              timeout: self.stepfiveForm.overtime
            }
          };
          if (self.stepfiveForm.healthyType === "HTTP" || self.stepfiveForm.healthyType === "HTTPS") {
            healthmonitor = {
              healthmonitor: {
                name: self.stepfiveForm.name,
                delay: self.stepfiveForm.timedivide,
                max_retries: self.stepfiveForm.trytimes,
                max_retries_down: self.stepfiveForm.failtrytimes,
                timeout: self.stepfiveForm.overtime,
                http_method: self.stepfiveForm.httpmethod,
                expected_codes: self.stepfiveForm.statuscode,
                url_path: self.stepfiveForm.urlpath
              }
            };
          } else {
            afterData.httpmethod = "";
            afterData.statuscode = "";
            afterData.urlpath = "";
          }
          let editBefore = "";
          let editAfter = "";
          for (let [k, v] of Object.entries(self.log)) {
            let before = `${v}: ${self.editBefore[k]} `;
            let after = `${v}: ${afterData[k]} `;
            editBefore += before;
            editAfter += after;
          }
          let result = self.$ajax({
            type: "PUT",
            url:
              "api/octavia/v2.0/lbaas/healthmonitors/" +
              self.healthmonitorInfo["id"],
            data: JSON.stringify(healthmonitor),
            successMsg: Vue.t("network.saveSuccess"),
            errorKey: "NeutronError",
            success: function(result) {
              self.loading5 = false;
              self.isDisabled = false;
              self.$emit("handleEditShow", {});
            },
            errFun() {
              self.loading5 = false;
              self.isDisabled = false;
            },
            log: {
              description: {
                en:"Before edit health monitor name:"+self.healthmonitorInfo["name"]+", After health monitor  name:" + self.stepfiveForm.name,
                zh_cn:"健康检查器名称修改前: "+editBefore+"，健康检查器名称修改后: " + editAfter
              },
              target: Vue.logTarget.balance
            }
          });
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
    checktimedivide(value) {
      let overtime = this.stepfiveForm.overtime;
      if (value < overtime) {
        this.$notify({
          message: Vue.t("network.timeNote1"),
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
          message: Vue.t("network.timeNote2"),
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
};
</script>
