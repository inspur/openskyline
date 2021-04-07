<template>
  <el-dialog :title="$t('network.MODIFY_DSCP_RULES')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="130px" :rules="rules" v-loading="loading">
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
    	<el-button type="primary" @click="confirmEdit" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"EditDscpRule",
  props: ["editRow", "qosName", "qosId"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      isDisabled: false,
      dscpMarkOptions: [0, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 46, 48, 56],
      form: {
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
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
      this.form.dscp_mark = parseInt(this.editRow["dscp_mark"]);
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
      let reqdata = {"dscp_marking_rule":{
        "dscp_mark": parseInt(self.form.dscp_mark)
        }
      };
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          self.isDisabled = true;
          self.loading = true;
          self.$ajax({
            type: "PUT",
            url: "api/neutron/v2.0/qos/policies/"+self.qosId+"/dscp_marking_rules/"+self.editRow["id"],
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
                zh_cn:"QoS策略"+self.qosName +":修改DSCP规则"
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
