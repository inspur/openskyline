<template>
  <div>
    <el-dialog :title="$t('network.CREATE_NETWORK_STRATEGY')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag directive="true">
      <el-form ref="addStrstegyForm" :model="addStrstegyForm" label-width="140px" :rules="rules" class="me-required-form margin-tb20" v-loading="loading">
        <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
          <el-input class="col-15" v-model="addStrstegyForm.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.project')" class="is-required" prop="project_id" v-if="roleType == '0'">
          <el-input auto-complete="off" class="col-15" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="projectName"></el-input>
        </el-form-item>
        <el-form-item :label="$t('network.network')" class="is-required" prop="network_id">
          <el-select v-model="addStrstegyForm.network_id" class="col-15" filterable @change="getSubnet()">
            <el-option v-for="item in netList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.STRATEGY_DOWN_TOOLTIP')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('network.subnet')" prop="subnet_id">
          <el-select v-model="addStrstegyForm.subnet_id" class="col-15" :disabled="subnetDisable" clearable filterable>
            <el-option v-for="item in subnets" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.STRATEGY_SUBNET')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.netConfigQosPloy')" prop="qos_policy_id">
          <el-select v-model="addStrstegyForm.qos_policy_id" class="col-15" clearable filterable>
            <el-option v-for="item in qosData" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
       <el-form-item :label="$t('network.securityTeam')" prop="security_groups">
          <el-select class="col-15" multiple v-model="addStrstegyForm.security_groups" clearable filterable>
            <el-option v-for="item in safeData" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('lang.desc')" prop="description">
              <el-input type="textarea" class="col-15" v-model="addStrstegyForm.description"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="me-form-footer">
          <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
          <el-button @click="addStrategy" type="primary" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
        </div>
      </el-form>
    </el-dialog>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script type="text/javascript">
export default {
  name: "AddStrategy",
  props: ["projectId"],
  data() {
    return {
      subnetDisable: false,
      isDisabled: false,
      subnets: [],
      subnetMaps: new Map(),
      safeData: [],
      qosData: [],
      selectProjectId: "",
      netList: [],
      dialogVisible: false,
      createSubnetStatus: false,
      activeName: "first",
      projectOption: Vue.projectListforNet,
      roleType: Vue.roleType + "",
      admin_state_up: true,
      loading: false,
      selProjectFlg: false,
      close: "",
      projectName: "",
      addStrstegyForm: {
        name: "",
        description: "",
        network_id: "",
        subnet_id: "",
        project_id: "",
        security_groups: [],
        qos_policy_id: ""
      },
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        description: [{ type: 'maxSize', value: 255 }],
        network_id: [{ type: "requiredNet" }],
        project_id: [{ type: "requiredNet" }]
      }
    };
  },
  mounted() {
    this.addStrstegyForm.project_id = this.selectProjectId = this.projectId;
    this.loadNetwork();
    this.init();
  },
  methods: {
    init() {
      const self = this;
      self.dialogVisible = true;
      let nets = [];
      let netsList = [];
      if (this.selectProjectId) {
        Promise.all([self.loadProjectNetList(), self.loadSharedNetList()]).then(function(result) {
          let data1 = result[0];
          let data2 = result[1];
          nets = data1.concat(data2);
          for (let t = 0; t < nets.length; t++) {
            let netObj = nets[t];
            if ((netObj['admin_state_up'] + "") == "true" && netObj.subnets.length && !(netObj['router:external'] === true && netObj.shared === false)) {
              netsList.push(netObj);
            }
          }
          self.netList = netsList;
          //self.addStrstegyForm.network_id = netsList[0] && netsList[0].id;
          //self.subnetRender(netsList[0]);
          self.addStrstegyForm.network_id = "";
          self.addStrstegyForm.subnet_id = "";
          self.subnetDisable = false;
        });
        this.getQosData();
        this.getSafeData();
      }
    },
    async getSubnet() {
      await this.loadNetwork();
      for (let i = 0; i < this.netList.length; i++) {
        if (this.netList[i]['id'] === this.addStrstegyForm.network_id) {
          let network = this.netList[i];
          if (network.project_id === this.selectProjectId) {
            this.subnetDisable = false;
            this.subnetRender(network);
          } else {
            this.addStrstegyForm.subnet_id = "";
            this.subnetDisable = true;
          }
          break;
        }
      }
    },
    subnetRender(network) {
      const self = this;
      let list = network['subnets'];
      this.subnets = [];
      if (list != null && list.length > 0) {
        for (let sb = 0; sb < list.length; sb++) {
          let subName = self.subnetMaps.get(list[sb]) || "";
          self.subnets.push(subName);
        }
      }
      self.addStrstegyForm.subnet_id = "";
      //self.addStrstegyForm.subnet_id = self.subnets && self.subnets[0].id;
    },
    // 获取子网
    async loadNetwork() {
      const $this = this;
      const subNets = await $this.loadSubNetList();
      if (subNets != null) {
        $this.subnetMaps.clear();
        for (let s = 0; s < subNets.length; s++) {
          let obj = subNets[s];
          let subValue = {};
          subValue.id = obj.id;
          subValue.name = obj.name + "(" + obj.cidr + ")";
          $this.subnetMaps.set(obj.id, subValue);
        }
      }
    },
    async loadSubNetList() {
      const self = this;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/neutron/v2.0/subnets',
          showErrMsg: false
        });
        self.loading = false;
        return result['subnets'];
      } catch (res) {
        self.loading = false;
      }
    },
    async getSafeData() {
      let self = this;
      let projectId = self.selectProjectId;
      try {
        let url = "";
        if (projectId == "" || projectId == null) {
          url = "api/neutron/v2.0/security-groups";
        } else {
          url = "api/neutron/v2.0/security-groups?project_id=" + projectId;
        }
        let result = await self.$ajax({
          type: "GET",
          url: url,
          errorKey: "NeutronError"
        });
        self.safeData = result["security_groups"];
        this.addStrstegyForm.security_groups = [];
        if (self.safeData.length) {
          let defaultSafe;
          for (let v of self.safeData) {
            if (v.name === "default") {
              defaultSafe = v.id;
              break;
            }
          }
          this.addStrstegyForm.security_groups.push(defaultSafe);
        }
      } catch (res) {
      }
    },
    async getQosData() {
      let self = this;
      let projectId = self.selectProjectId;
      try {
        let p = "";
        if (projectId != null && projectId != "") {
          p = '?project_id=' + projectId;
        }
        let result = await self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/qos/policies" + p,
          errorKey: "NeutronError"
        });
        this.qosData = result["policies"];
        //this.addStrstegyForm.qos_policy_id = this.qosData[0] && this.qosData[0].id;
        this.addStrstegyForm.qos_policy_id = "";
      } catch (res) {
      }
    },
    async loadProjectNetList() {
      const self = this;
      let url = 'api/neutron/v2.0/networks?project_id='+ self.selectProjectId + "&shared=false&not-tags=bm_deploy";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        return result['networks'];
      } catch (res) {
      }
    },
    async loadSharedNetList() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/neutron/v2.0/networks?shared=true&not-tags=bm_deploy',
          showErrMsg: true
        });
        return result['networks'];
      } catch (res) {
      }
    },
    handleClose() {
      this.$emit("handleCancelShow", {});
    },
    addStrategy() {
      let self = this;
      self.$refs.addStrstegyForm.validate(async(valid) => {
        if (valid) {
          self.isDisabled = true;
          self.loading = true;
          let networkNolicyTemplate = {};
          for (let [k, v] of Object.entries(self.addStrstegyForm)) {
            if (v) {
              networkNolicyTemplate[k] = v;
            }
          }
          let parm = {"network_policy_template": networkNolicyTemplate};
          self.$ajax({
            type: "POST",
            url: "api/neutron/v2.0/inspur/network_policy_templates",
            data: JSON.stringify(parm),
            success: function(result) {
              self.$notify({
                message:
                  self.addStrstegyForm.name + Vue.t("network.createSuccess"),
                type: "success"
              });
              self.$emit("handleAddShow", {});
              self.loading = false;
            },
            errFun() {
              self.loading = false;
              self.isDisabled = false;
            },
            errorKey: "NeutronError",
            log:{
              description:{
                en:"Add Network Strategy:"+self.addStrstegyForm.name,
                zh_cn:"新增网络策略模板:"+self.addStrstegyForm.name
              },
              target:Vue.logTarget.strategy
            }
          });
          return true;
        } else {
          return false;
        }
      });
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    showDetail() {
      if (this.subnetdetailStatus == false) {
        this.subnetdetailStatus = true;
        this.advanceName = Vue.t("network.advanceLeft");
      } else {
        this.subnetdetailStatus = false;
        this.advanceName = Vue.t("network.advanceRight");
      }
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.selectProjectId = id;
      this.projectName = name;
      this.addStrstegyForm.project_id = id;
      this.init();
      this.close = "close";
    },
    onIconClick() {
      this.projectName = "";
      this.clearForm();
      this.close = "";
    },
    clearForm() {
      for (let [k, v] of Object.entries(this.addStrstegyForm)) {
        if (Object.prototype.toString.call(v) == "[object String]") {
          if (k === "name") {
            continue;
          }
          this.addStrstegyForm[k] = "";
        } else if (Object.prototype.toString.call(v) == "[object Array]") {
          this.addStrstegyForm[k] = [];
        }
      }
      this.safeData = [];
      this.qosData = [];
      this.selectProjectId = "";
      this.netList = [];
      this.subnets = [];
    }
  }
};
</script>
