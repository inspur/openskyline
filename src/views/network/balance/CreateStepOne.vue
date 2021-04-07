<template>
<div>
  <el-row>
    <el-col :span="16">
      <el-form class="me-required-form margin-tb20" :model="steponeForm" :rules=rules ref="steponeForm" label-width="100px" v-loading="loading">
        <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
          <el-input class="col-20" v-model="steponeForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
          <el-input auto-complete="off" class="col-20" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="steponeForm.projectName"></el-input>
        </el-form-item>
        <el-form-item :label="$t('network.subnet')"  class="is-required" prop="subnet">
          <el-select  class="col-20" v-model="steponeForm.subnet" @change="ipversionChange" filterable>
            <el-option v-for="item in subnetList"
            :key="item.id"
            :label="item.name + '(' + item.cidr + ')'"
            :value="item.id"></el-option>
          </el-select>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.balanceNote1')}}<br/>{{$t('network.balanceNote3')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('network.ipaddress')" prop="ipaddress">
          <el-input class="col-20" v-model="steponeForm.ipaddress"></el-input>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.balanceNote22')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('lang.desc')" prop="description">
          <el-input type="textarea" class="col-20" v-model="steponeForm.description"></el-input>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
  <div class="me-form-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="nextStep" type="primary" :disabled="loading">{{$t('lang.nextStep')}}</el-button>
  </div>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'StepOne',
  props: ['projectId'],
  data() {
    return {
      activeIndex: 0,
      roleType: Vue.roleType + "",
      steponeForm: {
        name: '',
        description: '',
        ipaddress: '',
        subnet: '',
        project_id: "",
        projectName:"",
        managestatus:true
      },
      close: "",
      loading: false,
      query_porject: [],
      subnetList: [],
      checkQuota: "",
      checkQuotaMsg: "",
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 40}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ],
        ipaddress: [
          {type: 'ipv4'}
        ],
        subnet: [
          {type: "requiredNet"}
        ],
        projectName: [
          {type: "requiredNet"}
        ]
      }
    }
  },
  mounted() {
    let roletype = Vue.roleType + "";
    if (roletype == "0") {
      this.query_porject = Vue.projectListforNet;
    } else {
      this.steponeForm.project_id = Vue.cookie.get('pid');
      this.getsubnetList(this.steponeForm.project_id);
      this.checkQuotaLimit(Vue.cookie.get('pid'));
    }
  },
  methods: {
    async nextStep() {
      let self = this;
      if (self.checkQuota != "PASS") {
        let msg = "";
        if (self.checkQuotaMsg.indexOf("loadbalancers") > -1) {
          msg = Vue.t("network.QUOTA_LOADBALANCERS");
        } else if (self.checkQuotaMsg.indexOf("instances") > -1) {
          msg = Vue.t("network.QUOTA_INSTANCES");
        } else if (self.checkQuotaMsg.indexOf("cores") > -1) {
          msg = Vue.t("network.QUOTA_CORES");
        } else if (self.checkQuotaMsg.indexOf("ram") > -1) {
          msg = Vue.t("network.QUOTA_RAM");
        } else if (self.checkQuotaMsg.indexOf("server_group") > -1) {
          msg = Vue.t("network.QUOTA_SERVERGROUP");
        } else {
          msg = self.checkQuotaMsg;
        }
        self.$notify.error({
          message: msg
        });
        return false;
      }
      this.$refs.steponeForm.validate(async (valid) => {
        if (valid) {
          if (self.steponeForm.ipaddress != "") {
            let cidr = "";
            let subnetId = "";
            for (let i = 0; i < self.subnetList.length; i++) {
              let item = self.subnetList[i];
              if (item.id === self.steponeForm.subnet) {
                cidr = item["cidr"];
                subnetId = item.id;
              }
            }

            let ipAddr = self.steponeForm.ipaddress;

            if (await self.ipIsUsedInSubnet(ipAddr, subnetId) === true) {
              self.$message.error(self.$t('calcStorLang.NG_CREATE_INSTANCE_IP_USED', ipAddr));
              return false;
            }

            self.validateIpInCidr(ipAddr, cidr);
          } else {
            self.$emit("stepOneDone", {});
          }
        } else {
          return false;
        }
      });
    },

    async ipIsUsedInSubnet(ip, subnetId) {
      const self = this;
      try {
        const res = await self.$ajax({
          type: 'post',
          url: 'api/neutron/v2.0/inspur/networkextension/ip_is_used_in_subnet',
          data: JSON.stringify({
            ip: ip,
            subnet_id: subnetId
          }),
          showErrMsg: true
        });
        return res;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },

    validateIpInCidr(ip, cidr) {
      let self = this;
      let reqdata = {
        "ip": ip,
        "cidr": cidr
      };
      self.$ajax({
        type: 'post',
        url: "api/neutron/v2.0/inspur/networkextension/validate_ip_in_cidr",
        data: JSON.stringify(reqdata),
        showErrMsg: false,
        success: function(res) {
          if (res) {
            self.$emit("stepOneDone", {});
          } else {
            self.$notify.error({
              message: Vue.t('network.ipnotsubnet')
            });
          }
        },
        errFun() {
          self.$emit("stepOneDone", {});
        }
      });
    },

    cancel() {
      this.$emit("cancel");
    },
    async checkQuotaLimit(projectId) {
      try {
        let self = this;
        this.loading = true;
        let quota = await this.$ajax({
          type: 'get',
          url: "api/octavia/v2.0/lbaas/inspurloadbalancers/check_quotas?project_id="+projectId,
          errorKey: "NeutronError",
          errFun(error) {
            self.loading = false;
            self.checkQuota = "FAILED";
            self.checkQuotaMsg = error.responseJSON.faultstring
          },
          success: function(result) {
            self.loading = false;
            self.checkQuota = result["check_quotas"];
            if (self.checkQuota == "FAILED") {
              self.checkQuotaMsg = result["msg"];
            }
          }
        });
      } catch (res) {
      }
    },
    async getProjectNetworks(projectId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/networks?project_id=${projectId}&shared=false&status=ACTIVE&router:external=false&not-tags=bm_deploy`
        });
        return res.networks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async getSharedNetworks() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/networks?shared=true&status=ACTIVE&not-tags=bm_deploy`
        });
        return res.networks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async getNetworks(projectId) {
      const $this = this;
      return new Promise((resolve, reject) => {
        Promise.all([$this.getProjectNetworks(projectId), $this.getSharedNetworks()]).then((res) => {
          let networks = res[0].concat(res[1]);
          resolve(networks);
        }).catch(e => {
          reject(e);
        });
      });
    },
    async getsubnetList(projectid) {
      let self = this;
      self.steponeForm.subnet = "";
      try {
        let networks = await self.getNetworks(projectid);
        self.subnetList = [];
        let resultData = await self.$ajax({
          type: 'post',
          data:JSON.stringify({'project_id':projectid}),
          url: "api/neutron/v2.0/inspur/networkextension/get_subnets_by_project_id"
        });
        let sublist = [];
        for (let i=0; i<resultData.length; i++) { //后台要求只显示IPV4的子网
          let subnet = resultData[i];
          if (subnet.ip_version == 4) {
            let network = networks.find(item => item.id === subnet.net_id);
            if (network && !network.tags.includes('bm_deploy')) {
              sublist.push(resultData[i]);
            }
          }
        }
        self.subnetList = sublist;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    uniqueIds(arr) {
      let allArray = [];
      for (let i=0; i<arr.length; i++) {
        var flag = true;
        for (let j = 0; j < allArray.length; j++) {
          if (allArray[j].id === arr[i].id) {
            flag = false;
          }
        }
        if (flag) {
          allArray.push(arr[i]);
        }
      }
      return allArray;
    },
    ipversionChange(value) {
      let ipversion = "";
      for (let i = 0; i < this.subnetList.length; i++) {
        let subnet = this.subnetList[i];
        if (subnet["id"] === value) {
          ipversion = subnet["ip_version"];
          break;
        }
      }
      if (ipversion == "6") {
        this.rules.ipaddress = [{type: 'ipv6'}];
      } else {
        this.rules.ipaddress = [{type: 'ipv4'}];
      }
    },
    selectProject() {
      this.$emit("handleProjectShow");
    },
    onIconClick() {
      this.steponeForm.project_id = '';
      this.steponeForm.projectName = '';
      this.close = "";
    }
  }
}
</script>
