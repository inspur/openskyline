<template>
  <el-dialog  :title="$t('network.CREATE_BROADBAND_SPEED_LIMIT_RULES')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="130px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.type')" class="is-required">
        <el-input class="col-12" value="Bandwidth" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.direction')" class="is-required">
        <el-select class="col-12" v-model="form.direction">
          <el-option v-for="item in directionOptions" :label="item.name" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
       <el-form-item :label="$t('network.maxkbpx')" prop="max_kbps">
        <el-input class="col-12" v-model="form.max_kbps" placeholder="100000"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.burstkbps')" prop="max_burst_kbps">
        <el-input class="col-12" v-model="form.max_burst_kbps" placeholder="0"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="confirm" :disabled="isDiasbled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name: 'AddRule',
  props: ["qosName", "datas", "qosId"],
  data() {
    return {
      dialogVisible: false,
      isDiasbled: false,
      loading: false,
      directionOptions:[],
      form: {
        direction: "",
        max_burst_kbps: "0",
        max_kbps: "100000",
        description: ""
      },
      rules: {
        max_kbps: [
          {type: "unsignedPositiveIntegerNotRequire"},
          {type: "max", value: 268435455},
          {type: "min", value: 1}
        ],
        max_burst_kbps: [
          {type: "integerNO000"},
          {type: "max", value: Vue.archIs('x86') ? 268435455 : 524287},
          {type: "min", value: 0}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
    let str = "";
    this.datas.forEach(element => {
      str += element.direction;
    });
    if (str.indexOf("ingress") < 0) {
      this.directionOptions.push({value:"ingress", name:Vue.t('network.entrance')});
      this.form.direction = "ingress";
    }
    if (str.indexOf("egress") < 0) {
      this.directionOptions.push({value:"egress", name:Vue.t('network.chukou')});
      this.form.direction = "egress";
    }
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    confirm() {
      let self = this;
      try {
        self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/qos/policies/"+self.qosId+"/bandwidth_limit_rules",
          errorKey: "NeutronError",
          showErrMsg: false,
          errFun(xhr) {
            self.isDiasbled = false;
            if (xhr.status == "404") {
              self.$notify({
                message: Vue.t('network.QOS_RULE_NO_LONGER_EXISTS'),
                type: "error"
              });
            };
          },
          success: function(res) {
            let rulelength = res["bandwidth_limit_rules"].length;
            if (rulelength > 1) {
              self.$notify({
                message: Vue.t('network.onlycreateonerule'),
                type: "error"
              });
              self.$emit("handleAddShow", {});
            } else {
              let reqdata = {"bandwidth_limit_rule":{
                  "max_kbps": parseInt(self.form.max_kbps) * 8,
                  "max_burst_kbps": parseInt(self.form.max_burst_kbps) * 8,
                  "direction":self.form.direction
                }
              };
              if (self.form.max_kbps == "" && self.form.max_burst_kbps == "") {
                reqdata = {"bandwidth_limit_rule":{
                    "max_kbps": "800000",
                    "max_burst_kbps": "0",
                    "direction":self.form.direction
                  }
                }
              } else if (self.form.max_kbps != "" && self.form.max_burst_kbps == "") {
                reqdata = {"bandwidth_limit_rule":{
                    "max_kbps": parseInt(self.form.max_kbps) * 8,
                    "max_burst_kbps": "0",
                    "direction":self.form.direction
                  }
                }
              } else if (self.form.max_kbps == "" && self.form.max_burst_kbps != "") {
                reqdata = {"bandwidth_limit_rule":{
                    "max_kbps": "800000",
                    "max_burst_kbps": parseInt(self.form.max_burst_kbps) * 8,
                    "direction":self.form.direction
                  }
                }
              }
              self.$refs.form.validate(async(valid) => {
                if (valid) {
                  self.loading = true;
                  self.isDiasbled = true;
                  self.$ajax({
                    type: "POST",
                    url: "api/neutron/v2.0/qos/policies/"+self.qosId+"/bandwidth_limit_rules",
                    data: JSON.stringify(reqdata),
                    successMsg: Vue.t('network.saveSuccess'),
                    errFun(xhr) {
                      self.isDiasbled = false;
                    },
                    complete: function(XMLHttpRequest, textStatus) {
                      self.loading = false;
                      self.isDisabled = false;
                    },
                    success: function(ret) {
                      self.$emit("handleAddShow", {});
                    },
                    errorKey: "NeutronError",
                    log:{
                      description:{
                        en:"QoS Policy "+self.qosName + ":Create QoS rule",
                        zh_cn:"QoS策略"+self.qosName +":创建带宽限速规则"
                      },
                      target:Vue.logTarget.qosList
                    }
                  });
                } else {
                  return false;
                }
              });
            }
          }
        });
      } catch (e) {
      }
    }
  }
}
</script>
