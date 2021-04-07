<template>
<div>
  <el-dialog :title="$t('network.createStrategy')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-15"  v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
        <!--<el-select class="col-15" v-model="form.project_id" filterable clearable  @change="getRules">
          <el-option v-for="item in projectOption" 
          :key="item.id"
          :label="item.name"
          :value="item.id"
         ></el-option>
        </el-select>-->
        <el-input auto-complete="off" class="col-15" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="form.projectName"></el-input>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-15" type="textarea" v-model="form.description"></el-input>
      </el-form-item>
      </el-col></el-row>
      <el-form-item :label="$t('network.whetherAudit')">
        <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="form.audited"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('network.rule')" prop="">
        <el-switch on-text="" off-text="" v-model="hasrule" @change="handelRulechange"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('network.selectRule')" v-show="hasrule">
        <el-select class="col-15" v-model="form.rulevals" multiple filterable>
          <el-option v-for="item in firewallRules" :key="item.id" :title="item.title" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="createStratagy" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
  <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script type="text/javascript">
export default {
  name:"AddfirewallStrategy",
  data() {
    return {
      dialogVisible: false,
      hasrule:false,
      loading: false,
      isDisabled:false,
      roleType: Vue.roleType + "",
      selProjectFlg:false,
      close: "",
      form: {
        name: "",
        description: "",
        project_id: "",
        projectName:"",
        shared:false,
        audited:false,
        rules: [],
        value: "",
        rulevals: [],
        managestatus:true
      },
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'requiredNet'},
          {type: 'maxSize', value: 40}
        ],
        projectName: [
           {type: 'requiredNet'}
        ],
         description: [
          {type: 'maxSize', value: 255}
        ]
      },
      query_porject: [],
      projectOption: [],
      firewallRules:[]
    }
  },
  mounted() {
    let self = this;
    self.$parent.$parent.active = "firewallStrategy";
    let roleType = Vue.roleType + "";
    if (roleType == "0") {
      self.getProjectList();
    } else {
      self.form.project_id = Vue.cookie.get('pid');
      self.getRules(self.form.project_id);
    }
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.getRules(id);
      this.form.project_id = id;
      this.form.projectName = name;
      this.close = 'close';
    },
    onIconClick() {
      this.form.project_id = '';
      this.form.projectName = '';
      this.close = '';
    },
    async getProjectList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default"
        });
        Vue.projectListforNet = result["projects"];
        this.projectOption = Vue.projectListforNet;
      } catch (res) {
      }
    },
    async getRules(projectid="") {
      let self = this;
      self.firewallRules = [];
      self.form.rulevals = [];
      try {
          let result2 = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/fw/firewall_rules?project_id=" + projectid,
          complete: function(XMLHttpRequest, textStatus) {
          },
          errorKey: "NeutronError"
        });
          let tempArr2 = result2['firewall_rules'];
          for (let i = 0; i < tempArr2.length; i++) {
              if (tempArr2[i].firewall_policy_id === "" || tempArr2[i].firewall_policy_id === null) {
                if (tempArr2[i].name === "") {
                  tempArr2[i].name = tempArr2[i].id;
                }
                if (tempArr2[i].description!="") {
                  let des = tempArr2[i].description;
                  tempArr2[i].title = tempArr2[i].name+"("+des+")";
                  if (des.length>20) {
                    des = des.substr(0, 12)+"...";
                  }
                  tempArr2[i].name = tempArr2[i].name + "(" + des + ")";
                }
              self.firewallRules.push(tempArr2[i]);
            }
          }
      } catch (res) {
      }
    },
    createStratagy() {
      let self = this;
      let reqdata = {"firewall_policy":{
          "name": self.form.name,
          "project_id": self.form.project_id,
          "description": self.form.description,
          "shared": false,
          "audited": self.form.audited,
          "firewall_rules":self.hasrule?self.form.rulevals:[]
          }
        };
      try {
        this.$refs.form.validate(async(valid) => {
        if (valid) {
          self.loading = true;
          self.isDisabled = true;
          let result = self.$ajax({
            type: "POST",
            url: "api/neutron/v2.0/fw/firewall_policies",
            data: JSON.stringify(reqdata),
            success: function(result) {
              self.$message.success(Vue.t('network.saveSuccess'));
              self.loading = false;
              self.isDisabled = false;
              self.cancel();
            },
            errFun() {
              self.loading = false;
              self.isDisabled = false;
            },
            errorKey: "NeutronError",
            log:{
              description:{
                en:"Create Firewall Strategy:" + self.form.name,
                zh_cn:"创建防火墙策略:" + self.form.name
              },
              target:Vue.logTarget.firewallStrategy
            }
          });
          return true;
        } else {
          return false;
        }
      });
      } catch (res) {
        console.log("Failed");
    }
  },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleAddShow", {});
    },
    handelRulechange() {
    }
  }
}
</script>