<template>
  <el-dialog :title="$t('network.insertRule')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.insertRule')" class="is-required" prop="toAddRuleId">
        <el-select class="col-15" v-model="form.toAddRuleId" filterable>
          <el-option v-for="item in toAddRules" :key="item.id" :label="item.name" :title="item.title" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.beforeyu')">
        <el-select class="col-15" v-model="form.ruleIdBefore" filterable>
          <el-option v-for="item in currentRulesbefore" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.afteryu')">
        <el-select class="col-15" v-model="form.ruleIdAfter" filterable>
          <el-option v-for="item in currentRulesafter" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="editConfirm">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>  
</template>
<script type="text/javascript">
export default {
  name:"InsertRule",
  props: ["editId", "editName", "editProjectId", "ruleList", "editruleIds"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      toAddRules: [],
      toAddRuleId: "",
      ruleIdBefore: "",
      ruleIdAfter: "",
      currentRulesbefore: [],
      currentRulesafter: [],
      form: {
        toAddRuleId: "",
        ruleIdBefore: "",
        ruleIdAfter: ""

      },
      rules: {
        toAddRuleId: [
           {type: 'required'}
        ]
      }
    }
  },
  mounted() {
    this.$parent.$parent.active = "firewallStrategy";
    this.initDialog();
    //this.getData();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
      self.currentRulesafter = [];
      self.currentRulesbefore = [];
      self.getToAddRule(self.editProjectId);
      self.getOldRule();
    },
    async getToAddRule(projectid) {
      let result = await this.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/fw/firewall_rules?project_id=" + projectid,
        errorKey: "NeutronError"
      });
      let rules = result['firewall_rules'];
      for (let i = rules.length - 1; i >= 0; i--) {
        if (rules[i].firewall_policy_id === null) {
          if (rules[i].name === "") {
            rules[i].name = rules[i].id;
          }
          if (rules[i].description!="") {
            let des = rules[i].description;
            rules[i].title = rules[i].name+"("+des+")";
            if (des.length>20) {
              des = des.substr(0, 20)+"...";
            }
            rules[i].name = rules[i].name + "(" + des + ")";
          }
          this.toAddRules.push(rules[i]);
        }
      }
    },
    async getOldRule() {
      let self = this;
      self.currentRulesbefore = [];
      self.currentRulesafter = [];
      let result = await self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/fw/firewall_rules?firewall_policy_id="+self.editId,
        errorKey: "NeutronError"
      });
      let rules = result['firewall_rules'];
      for (let i = 0; i < rules.length; i++) {
        let rule = rules[i];
        if (rule.name === "") {
          rule.name =rule.id;
        }
        if (rule.description!="") {
          if (rule.description.length>20) {
            rule.description = rule.description.substr(0, 20)+"...";
          }
          rule.name = rule.name + "(" + rule.description + ")";
        }
        self.currentRulesbefore.push(rule);
        self.currentRulesafter.push(rule);
      }
    },
    handleClose(done) {
      this.$emit("handleInsertRuleCancel", {});
      done();
    },
    cancel() {
      this.$emit("handleInsertRuleCancel", {});
    },
    confirm() {
      this.$emit("handleInsertRuleShow", {});
    },
    editConfirm() {
      var self = this;
      let insertrulename = "";
      for (let i = 0; i < self.toAddRules.length; i++) {
        if (self.toAddRules[i].id === self.form.toAddRuleId) {
          insertrulename = self.toAddRules[i].name;
        }
      }
      let beforename = "";
      for (let i = 0; i < self.currentRulesbefore.length; i++) {
        if (self.currentRulesbefore[i].id === self.form.ruleIdBefore) {
          beforename = self.currentRulesbefore[i].name;
        }
      }
      let aftername = "";
      for (let i = 0; i < self.currentRulesafter.length; i++) {
        if (self.currentRulesafter[i].id === self.form.ruleIdAfter) {
          aftername = self.currentRulesafter[i].name;
        }
      }
      let reqdata = {
        "firewall_rule_id": self.form.toAddRuleId,
        "insert_before": self.form.ruleIdBefore,
        "insert_after" : self.form.ruleIdAfter
      };
      try {
        this.$refs.form.validate(async(valid) => {
          if (valid) {
            self.loading = true;
            let result = await self.$ajax({
              type: 'PUT',
              url: "api/neutron/v2.0/fw/firewall_policies/"+self.editId + "/insert_rule",
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$notify({
                  message: Vue.t('network.saveSuccess'),
                  type: "success"
                });
                self.loading = false;
                self.confirm();
              },
              errFun(xhr) {
                self.loading = false;
                if (xhr.status == "404") {
                  self.$emit("handleInsertRuleShow", {});
                }
              },
              log:{
               description:{
                  en:"Strategy "+self.editName + "Insert Rule:"+insertrulename,
                  zh_cn: "策略" + self.editName + "插入规则:"+insertrulename
                },
                target:Vue.logTarget.firewallStrategy
              },
              errorKey: "NeutronError"
            });
            return true;
          } else {
            return false;
          }
        });
      } catch (res) {
        console.log("error");
      }
    }
  }
}
</script>