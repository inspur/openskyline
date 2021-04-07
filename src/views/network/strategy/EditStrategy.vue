<template>
  <el-dialog :title="$t('lang.modify')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form label-width="80px" :rules="rules" v-loading="loading" ref="editform" :model="editform" class="me-required-form">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input v-model="editform.name" class="col-15"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.network')" class="is-required" prop="network_id">
        <el-select v-model="editform.network_id" class="col-15" filterable @change="getSubnet()">
          <el-option v-for="item in netList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.STRATEGY_DOWN_TOOLTIP')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.subnet')">
        <el-select v-model="editform.subnet_id" class="col-15" :disabled="subnetDisable" clearable filterable>
          <el-option v-for="item in subnets" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.STRATEGY_SUBNET')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.netConfigQosPloy')" prop="provider_segmentation_id">
        <el-select v-model="editform.qos_policy_id" class="col-15" clearable filterable>
          <el-option v-for="item in qosData" :key="item.name" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.securityTeam')" prop="security_groups">
        <el-select class="col-15" multiple v-model="editform.security_groups" clearable filterable>
          <el-option v-for="item in safeData" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" v-model="editform.description" class="col-15"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="handleEditConfirm" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: "EditStrategy",
  props: {
    row: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      subnetMaps: new Map(),
      subnets: [],
      qosData: [],
      netList: [],
      safeData: [],
      subnetDisable: false,
      dialogVisible: false,
      editform: {
        name: "",
        description: "",
        network_id: "",
        subnet_id: "",
        qos_policy_id: "",
        security_groups: []
      },
      loading: false,
      isDisabled: false,
      roleType: Vue.roleType + "",
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        network_id: [{ type: "requiredNet" }],
        description: [
          {type: 'maxSize', value: 255}
        ]
      }
    }
  },
  mounted() {
    this.init();
  },
   methods: {
    getNameById(id, list) {
      if (!Array.isArray(list)) return;
      for (let i = 0; i < list.length; i++) {
        if (id === list[i].id) {
          return list[i].name;
        }
      }
    },
     init() {
       const self = this;
       self.dialogVisible = true;
       let nets = [];
       let netsList = [];
       self.editform.name = self.row.name;
       self.editform.description = self.row.description;
       Promise.all([self.loadProjectNetList(), self.loadSharedNetList()]).then( async (result) => {
         await self.loadNetwork();
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
         // 网络回显
         for (let v of netsList) {
           if (self.row.network_id === v.id) {
             self.editform.network_id = self.row.network_id;
             //self.subnetRender(v, "backFlag");
             break;
           }
         }
       });
       this.getQosData();
       this.getSafeData();
     },
     getSubnet() {
       for (let i = 0; i < this.netList.length; i++) {
         if (this.netList[i]['id'] === this.editform.network_id) {
           let network = this.netList[i];
           if (network.project_id === this.row.project_id) {
             this.subnetDisable = false;
             this.subnetRender(network);
           } else {
             this.editform.subnet_id = "";
             this.subnetDisable = true;
           }
           break;
         }
       }
     },
     subnetRender(network) {
       const self = this;
       if (this.subnetDisable) return;
       this.editform.subnet_id = "";
       let list = network['subnets'];
       this.subnets = [];
       if (list != null && list.length > 0) {
         for (let sb = 0; sb < list.length; sb++) {
           let subName = self.subnetMaps.get(list[sb]) || "";
           self.subnets.push(subName);
         }
       }
       // 子网回显
       for (let v of self.subnets) {
         if (self.row.subnet_id === v.id) {
           self.editform.subnet_id = v.id;
           break;
         }
       }
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
           showErrMsg: true
         });
         self.loading = false;
         return result['subnets'];
       } catch (res) {
         self.loading = false;
       }
     },
     async getSafeData() {
       let self = this;
       self.loading = true;
       try {
         let url = "api/neutron/v2.0/security-groups?project_id=" + self.row.project_id;
         let result = await self.$ajax({
           type: "GET",
           url: url,
           errorKey: "NeutronError"
         });
         self.loading = false;
         self.safeData = result["security_groups"];
         // 安全组回显
         for (let v of this.safeData) {
           if (self.row.security_groups.includes(v.id)) {
             self.editform.security_groups.push(v.id);
           }
         }
       } catch (res) {
         self.loading = false;
       }
     },
     async getQosData() {
       let self = this;
       let projectId = self.row.project_id;
       self.loading = true;
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
         self.loading = false;
         this.qosData = result["policies"];
         // Qos回显
         for (let v of this.qosData) {
           if (self.row.qos_policy_id === v.id) {
             self.editform.qos_policy_id = v.id;
             break;
           }
         }
       } catch (res) {
         self.loading = false;
       }
     },
     async loadProjectNetList() {
       const self = this;
       let url = 'api/neutron/v2.0/networks?project_id='+ self.row.project_id + "&shared=false";
       self.loading = true;
       try {
         let result = await self.$ajax({
           type: 'get',
           url: url,
           showErrMsg: true
         });
         self.loading = false;
         return result['networks'];
       } catch (res) {
         self.loading = false;
       }
     },
     async loadSharedNetList() {
       let self = this;
       self.loading = true;
       try {
         let result = await self.$ajax({
           type: 'get',
           url: 'api/neutron/v2.0/networks?shared=true',
           showErrMsg: true
         });
         self.loading = false;
         return result['networks'];
       } catch (res) {
         self.loading = false;
       }
     },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    handleEditConfirm() {
      let self = this;
      let networkPolicyTemplate = {};
      for (let [k, v] of Object.entries(self.editform)) {
        if (v) {
          networkPolicyTemplate[k] = v;
        } else {
          networkPolicyTemplate[k] = null;
        }
        if (k === "description" && (!v)) {
          networkPolicyTemplate[k] = "";
        }
      }
      let reqdata = {network_policy_template:networkPolicyTemplate};
      try {
        self.$refs.editform.validate(async(valid) => {
          if (valid) {
            self.isDisabled = true;
            self.loading = true;
            let networkName = self.getNameById(self.editform.network_id, self.netList);
            let subnetName = self.getNameById(self.editform.subnet_id, self.subnets);
            let QosName = self.getNameById(self.editform.qos_policy_id, self.qosData);
            let safeArr = [];
            for (let i = 0; i < self.editform.security_groups.length; i++) {
              safeArr.push(self.getNameById(self.editform.security_groups[i], self.safeData));
            }
            let safeName = safeArr.join(",");
            let safeArrBefore = [];
            for (let j = 0; j < self.row.security_groups.length; j++) {
              safeArrBefore.push(self.getNameById(self.row.security_groups[j], self.safeData));
            }
            let safeNameBefore = safeArrBefore.join(",");
            let subnetNameBefore = self.row.subnet_name ? `${self.row.subnet_name || ""}(${self.row.cidr || ""})` : "";
            self.$ajax({
              type: 'PUT',
              url: "api/neutron/v2.0/inspur/network_policy_templates/" + self.row.id,
              data: JSON.stringify(reqdata),
              complete:function(XMLHttpRequest, textStatus) {
                self.loading = false;
                self.isDisabled = false;
                self.$notify({
                  message:
                    self.row.name + Vue.t("network.EDIT_STRATEGY_SUCCESS"),
                  type: "success"
                });
                self.$emit("handleEditShow", {});
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Network strategy:"+ self.row.name +"edit",
                  zh_cn: `网络策略模板: ${self.row.name || ""} 修改前信息: 名称:${self.row.name || ""} 网络:${self.row.network_name || ""} 子网:${subnetNameBefore || ""} QoS策略:${self.row.qos_policy_name || ""} 安全组:${safeNameBefore || ""} 描述:${self.row.description || ""}
                   修改后信息: 名称:${self.editform.name || ""} 网络:${networkName || ""} 子网:${subnetName || ""} QoS策略:${QosName || ""} 安全组:${safeName || ""} 描述:${self.editform.description || ""}`
                },
                target:Vue.logTarget.strategy
              }
            });
            return true;
          } else {
            return false;
          }
        });
      } catch (res) {
        self.loading = false;
      }
    }
  }
}
</script>
