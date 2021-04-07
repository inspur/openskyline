<template>
  <el-dialog :title="$t('network.EDIT_BROADBAND_SPEED_LIMIT_RULES')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="130px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.maxkbpx')" prop="max_kbps">
        <el-input class="col-12" v-model="form.max_kbps" placeholder="100000"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.burstkbps')" prop="max_burst_kbps">
        <el-input class="col-12" v-model="form.max_burst_kbps" placeholder="0"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="confirmEdit" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"EditRule",
  props: ["editRow", "qosName", "qosId"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      isDisabled: false,
      form: {
        direction: "egress",
        max_burst_kbps: "100000",
        max_kbps: "0",
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
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
      this.form.max_burst_kbps = parseInt(this.editRow["max_burst_kbps"]) / 8;
      this.form.max_kbps = parseInt(this.editRow["max_kbps"]) / 8;
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    confirmEdit() {
      let self = this;
      let reqdata = {"bandwidth_limit_rule":{
        "max_kbps": parseInt(self.form.max_kbps) * 8,
        "max_burst_kbps": parseInt(self.form.max_burst_kbps) * 8
        }
      };
      if (self.form.max_kbps == "" && self.form.max_burst_kbps == "") {
        reqdata = {"bandwidth_limit_rule":{
          "max_kbps": "800000",
          "max_burst_kbps": "0"
          }
        }
      } else if (self.form.max_kbps != "" && self.form.max_burst_kbps == "") {
        reqdata = {"bandwidth_limit_rule":{
          "max_kbps": parseInt(self.form.max_kbps) * 8,
          "max_burst_kbps": "0"
          }
        }
      } else if (self.form.max_kbps == "" && self.form.max_burst_kbps != "") {
        reqdata = {"bandwidth_limit_rule":{
          "max_kbps": "800000",
          "max_burst_kbps": parseInt(self.form.max_burst_kbps) * 8
          }
        }
      }
      reqdata.bandwidth_limit_rule.direction = self.editRow.direction;
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          self.isDisabled = true;
          self.loading = true;
          self.$ajax({
            type: "PUT",
            url: "api/neutron/v2.0/qos/policies/"+self.qosId+"/bandwidth_limit_rules/"+self.editRow["id"],
            data: JSON.stringify(reqdata),
            successMsg: Vue.t('network.saveSuccess'),
            complete: function(XMLHttpRequest, textStatus) {
              self.loading = false;
              self.isDisabled = false;
            },
            success: function(result) {
              self.$emit("handleEditShow", {});
            },
            errFun() {
            },
            errorKey: "NeutronError",
            log:{
              description:{
                en:"QoS Policy "+self.qosName +":Modify QoS Rule",
                zh_cn:"QoS策略"+self.qosName +":修改带宽限速规则"
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
}
</script>
