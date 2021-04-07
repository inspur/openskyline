<template>
  <el-dialog :title="$t('network.CREATE_DSCP_RULES')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="130px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.type')" class="is-required">
        <el-input class="col-12" value="DSCP" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.direction')" class="is-required">
        <el-select class="col-12" v-model="form.direction" disabled>
          <el-option v-for="item in directionOptions" :label="item.name" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
       <el-form-item :label="$t('network.dscpmark')" prop="dscp_mark">
         <el-select class="col-12" v-model="form.dscp_mark">
           <el-option v-for="item in dscpMarkOptions" :label="item" :value="item" :key="item"></el-option>
         </el-select>
         <el-tooltip  effect="dark" placement="top">
          <div slot='content' v-html="$t('network.DSCP_MARKING_TIP')"></div>
           <i class="el-icon-fa-question-circle"></i>
         </el-tooltip>
         <span>{{$t('network.DIFFERENTIATED_SERVICES_CODE_POINT')}}</span>
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
  name: 'AddDscpRule',
  props: ["qosName", "datas", "qosId"],
  data() {
    return {
      dialogVisible: false,
      isDiasbled: false,
      loading: false,
      directionOptions:[{value:"egress", name:Vue.t('network.chukou')}],
      dscpMarkOptions: [0, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 46, 48, 56],
      form: {
        direction: "egress",
        dscp_mark: "0"
      },
      rules: {
        dscp_mark: [
          {type: "QoSdscp"},
          {type: 'requiredNet'}
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
              let reqdata = {"dscp_marking_rule":{
                  "dscp_mark": self.form.dscp_mark
                }
              };
              self.$refs.form.validate(async(valid) => {
                if (valid) {
                  self.loading = true;
                  self.isDiasbled = true;
                  self.$ajax({
                    type: "POST",
                    url: "api/neutron/v2.0/qos/policies/"+self.qosId+"/dscp_marking_rules",
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
                        zh_cn:"QoS策略"+self.qosName +":创建DSCP规则"
                      },
                      target:Vue.logTarget.qosList
                    }
                  });
                } else {
                  return false;
                }
              });
          }
        });
      } catch (e) {
      }
    }
  }
}
</script>
