<template>
<div>
  <el-dialog :title="$t('network.createFirewall')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="fwName">
        <el-input class="col-12"  v-model="form.fwName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
      <!--<el-select class="col-12" v-model="form.project_id" filterable clearable @change="handleProjectChange">
          <el-option v-for="item in query_porject"
          :key="item.id"
          :label="item.name"
          :value="item.id"></el-option>
        </el-select>-->
        <el-input auto-complete="off" class="col-12" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="form.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.strategy')" class="is-required" prop="strategysvalue">
        <el-input auto-complete="off" v-model="form.strategy" class="col-12" :icon="stclose" :on-icon-click="onStrategyClick" :readonly="true" @focus="selectStrategy"></el-input>
        <!--<el-select class="col-12" v-model="form.strategysvalue" filterable>
          <el-option v-for="item in query_strategys"
          :key="item.id"
          :label="item.name"
          :value="item.id"
          :title="item.title"></el-option>
        </el-select>-->
      </el-form-item>
      <el-form-item :label="$t('network.manageStatus')">
        <el-switch :width="75" on-text="UP" off-text="DOWN" v-model="form.managestatus"></el-switch>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-12" type="textarea" v-model="form.description"></el-input>
      </el-form-item>
      </el-col></el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirm" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
   <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
   <select-strategy ref="selectStrategy" :queryStrategys="query_strategys" :multiple="false" v-if="selStrategyFlg" @getStrategy="getStrategy"></select-strategy>
  </div>
</template>
<script type="text/javascript">
  import SelectStrategy from './SelectStrategy';
export default {
  name:"AddFirewall",
  components: {
    SelectStrategy
  },
  data() {
    return {
      ruleList: [], //防火墙规则信息
      selStrategyFlg: false,
      dialogVisible: false,
      loading: false,
      isDisabled:false,
      roleType: Vue.roleType + "",
      selProjectFlg:false,
      close: "",
      stclose: "",
      form: {
        fwName: "",
        description: "",
        project_id: "",
        projectName:"",
        strategysvalue: "",
        strategy: "",
        managestatus: true
      },
      rules: {
        fwName: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'requiredNet'},
          {type: 'maxSize', value: 40}
        ],
        projectName: [
           {type: 'requiredNet'}
        ],
        strategysvalue: [
           {type: 'requiredNet'}
        ],
        strategy: [
          {type: 'requiredNet'}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ]
      },
      query_porject: [],
      query_strategys: []
    }
  },
  mounted() {
    let self = this;
    let roleType = Vue.roleType + "";
    if (roleType == "0") {
      self.getProjectList();
    } else {
      self.form.project_id = Vue.cookie.get('pid');
      self.handleProjectChange(this.form.project_id);
    }
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    async getProjectList() {
      var self = this;
      let result = await self.$ajax({
        type: "GET",
        url: "api/keystone/v3/projects?domain_id=default",
        errorKey: "NeutronError"
      });
      self.query_porject = result["projects"];
    },
    async handleProjectChange(val) {
      var self = this;
      let result = await this.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/fw/firewall_policies?project_id="+val,
        errorKey: "NeutronError"
      });
     /* let allpolices = [];
      allpolices = result["firewall_policies"];
      for (let i = 0; i < allpolices.length; i++) {
        if (allpolices[i].description != "") {
          let des = allpolices[i].description;
          allpolices[i].title = allpolices[i].name+"("+des+")";
          if (des.length>20) {
            des = des.substr(0, 20)+"...";
          }
          allpolices[i].name = allpolices[i].name+"("+des+")";
        }
      }*/
      self.query_strategys = result["firewall_policies"];
      self.form.strategysvalue = "";
      self.form.strategy = "";
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    selectStrategy() {
      this.selStrategyFlg = true;
      this.$nextTick(() => {
        this.$refs.selectStrategy.show();
      });
    },
    getSelProjects(id, name) {
      this.handleProjectChange(id);
      this.form.project_id = id;
      this.form.projectName = name;
      this.close = 'close';
    },
    getStrategy(policyId, policyName) {
      this.form.strategy = policyName;
      this.form.strategysvalue = policyId;
      this.stclose = 'close';
    },
    onIconClick() {
      this.form.project_id = '';
      this.form.projectName = '';
      this.close = '';
    },
    onStrategyClick() {
      this.form.strategy = '';
      this.form.strategysvalue = '';
      this.stclose = '';
    },
    confirm() {
      var self = this;
      let fwName = $.trim(self.form.fwName);
      let fwDesc = self.form.description;
      let reqdata = {"firewall":{
        "name": fwName,
        "project_id": self.form.project_id,
        "firewall_policy_id": self.form.strategysvalue,
        "admin_state_up": self.form.managestatus,
        "router_ids":[],
        "description": fwDesc
        }
      };
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          try {
            self.loading = true;
            self.isDisabled = true;
            let result = self.$ajax({
              type: "POST",
              url: "api/neutron/v2.0/fw/firewalls",
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$notify({
                  message: Vue.t('network.saveSuccess'),
                  type: "success"
                });
                self.$emit("handleAddShow", {});
                self.loading = false;
                self.isDisabled = false;
              },
              errFun() {
                self.loading = false;
                self.isDisabled = false;
              },
              log:{
                description:{
                  en:"Create Firewall:" + fwName,
                  zh_cn:"创建防火墙:" + fwName
                },
                target:Vue.logTarget.firewall
              },
              errorKey: "NeutronError"
            });
          } catch (res) {
          }
          return true;
        } else {
          return false;
        }
      });
    }
  }
}
</script>
