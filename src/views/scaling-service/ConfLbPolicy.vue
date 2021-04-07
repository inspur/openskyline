<template>
<el-dialog
  :title="LbTitle"
  :visible.sync="dialogVisible"
  :before-close="handleClose">
  <el-form label-position="left" class="me-required-form" :model="LBPolicyForm" :rules=rules ref="LBPolicyForm" 
  label-width="120px" v-loading="loading">
    <el-form-item :label="$t('scalingService.subnet')" prop="subnet" class="is-required">
      <el-select v-model="LBPolicyForm.subnet" class="col-12" filterable>
        <el-option v-for="item in subnetOptions" :key="item.id" :label="item.name + '(' + item.cidr + ')'" :value="item.id"></el-option>
      </el-select>
      <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.balanceNote1')}}</div>
          <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('network.ipaddress')" prop="ipaddress">
      <el-input class="col-12" v-model="LBPolicyForm.ipaddress"></el-input>
      <el-tooltip  effect="dark" placement="top">
        <div slot="content">{{$t('network.balanceNote22')}}</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('scalingService.method')" prop="method" class="is-required">
      <el-select v-model="LBPolicyForm.method">
        <el-option :label="$t('scalingService.leastConnections')" value="LEAST_CONNECTIONS"></el-option>
        <el-option :label="$t('scalingService.roundRobin')" value="ROUND_ROBIN"></el-option>
        <el-option :label="$t('scalingService.sourceIp')" value="SOURCE_IP"></el-option>
      </el-select>
      <el-tooltip  effect="dark" placement="top">
        <div slot="content">{{$t('scalingService.leastConnectionsInfo')}}</div>
        <div slot="content">{{$t('scalingService.roundRobinInfo')}}</div>
        <div slot="content">{{$t('scalingService.sourceIpInfo')}}</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('scalingService.protocol')" prop="protocol" class="is-required">
      <el-select v-model="LBPolicyForm.protocol">
        <el-option label="HTTP" value="HTTP"></el-option>
        <el-option label="HTTPS" value="HTTPS"></el-option>
        <el-option label="TCP" value="TCP"></el-option>
      </el-select>
      <el-tooltip  effect="dark" placement="top">
        <div slot="content">{{$t('scalingService.selectProtocol')}}</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item :label="$t('scalingService.port')" prop="port" class="is-required">
      <el-input-number v-model="LBPolicyForm.port" :min="1" :max="65535">
      </el-input-number>
      <el-tooltip  effect="dark" placement="top">
        <div slot="content">{{$t('scalingService.portInfo')}}</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
      <el-button :disabled="isDisabled" @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" :disabled="isDisabled" @click="confirm">{{$t('lang.confirm')}}</el-button>
    </div>
</el-dialog>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'ConfLbPolicy',
  props: ['scalingServiceName', 'clusterId', 'profileId'],
  data() {
    return {
      activeNames: 'baseInfo',
      LbTitle: this.$t('scalingService.setServiceBanlance'),
      poolSubnet: "",
      currentlbNum: "",
      maxlbNum: "",
      currentPoolNum: "",
      maxPoolNum: "",
      dialogVisible: false,
      loading: false,
      isDisabled: false,
      setLbFlag: false,
      subnetOptions: [],
      LBPolicyForm: {
        subnet:'',
        method:'LEAST_CONNECTIONS',
        protocol:'HTTP',
        port: '8080',
        ipaddress: ''
      },
      rules: {
        subnet: [
           {type: 'required', trigger: 'blur change'}
        ],
        method: [
           {type: 'required', trigger: 'blur change'}
        ],
        protocol: [
           {type: 'required', trigger: 'blur change'}
        ],
        port: [
          {type: 'required'},
          {type: 'integer'},
          {type: 'min', value: 1},
          {type: 'max', value: 65535}
        ],
        ipaddress: [
          {type: 'ipv4'}
        ]
      }
    }
  },
  mounted() {
    let self = this;
    self.initForm = Object.assign({}, this.LBPolicyForm);
    self.ruleStore = Object.assign({}, this.rules);
    self.dialogVisible = true;
    self.loading = true;
    self.isDisabled = true;
    self.initSubnetList();
    self.getPoolSubnet();
    self.getNetworkQuotas();
  },
  methods: {
   async initSubnetList() {
     let self = this;
     let url = "api/neutron/v2.0/subnets"
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        let list = result['subnets'];
        let subnets = [];
        if (list != null) {
          for (let z = 0; z < list.length; z++) {
            let subnet = list[z];
            subnets.push(subnet);
          }
        }
        self.subnetOptions = subnets;
      } catch (res) {
      }
    },
   async getPoolSubnet() {
     let self = this;
     let url = "api/senlin/v1/profiles/" + self.profileId;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        if (result['profile']) {
          let networkId = "";
          let profile = result['profile'];
          let spec = profile['spec'];
          let properties = spec['properties'];
          let networks = properties['networks'];
          for (let z = 0; z < networks.length; z++) {
            for (let key in networks[z]) {
              networkId = networks[z][key];
              break;
            }
          }
          self.getSubnetByNetworkId(networkId);
        }
      } catch (res) {
      }
    },
   async getSubnetByNetworkId(value) {
     let self = this;
     let uuid = value;
     let url = "api/neutron/v2.0/subnets?network_id=" + uuid;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        if (result['subnets']) {
          let subnets = result['subnets'];
          for (let z = 0; z < subnets.length; z++) {
            self.poolSubnet = subnets[z]['id'];
            break;
          }
        }
      } catch (res) {
      }
    },
   async getNetworkQuotas() {
    let me = this;
    let pid = this.$cookie.get("pid");
    let arr = [];
    arr.push(new Promise((resolve, reject) => {
      me.$ajax({
        type: 'get',
        url: "api/octavia/v2/lbaas/quotas/"+ pid,
        successFun(rtn) {
          resolve(true);
          let quota = rtn.quota;
          if (quota) {
            me.maxlbNum = quota.load_balancer;
            me.maxPoolNum = quota.pool;
          }
        }
      })
    }))

    arr.push(new Promise((resolve, reject) => {
      me.$ajax({
        type: 'get',
        url: "api/octavia/v2/lbaas/loadbalancers?project_id="+ pid,
        successFun(rtn) {
          resolve(true);
          me.currentlbNum = rtn.loadbalancers.length;
        }
      })
    }))

    arr.push(new Promise((resolve, reject) => {
      me.$ajax({
        type: 'get',
        url: "api/octavia/v2/lbaas/pools?project_id="+ pid,
        successFun(rtn) {
          resolve(true);
          me.currentPoolNum = rtn.pools.length;
        }
      })
    }))

    Promise.all(arr).then(() => {
      me.loading = false;
      me.isDisabled = false;
    })
   },
   checkLoadbalancer(current, max) {
    let usedNum = parseInt(current);
    let maxNum = parseInt(max);
    if (maxNum == -1) {
      return true;
    } else {
      if (usedNum < maxNum) {
        return true;
      } else {
        return false;
      }
    }
   },
   checkPool(current, max) {
    let usedNum = parseInt(current);
    let maxNum = parseInt(max);
    if (maxNum == -1) {
      return true;
    } else {
      if (usedNum < maxNum) {
        return true;
      } else {
        return false;
      }
    }
   },
   confirm() {
    let self = this;
    if (self.currentlbNum === "" || self.maxlbNum === "" || self.currentPoolNum === "" || self.maxPoolNum === "") {
      self.$message({
        showClose: true,
        message: Vue.t('scalingService.operateTooFast'),
        type: 'warning'
      });
    } else {
      let lbQuotaFlag = self.checkLoadbalancer(self.currentlbNum, self.maxlbNum);
      let poolQuotaFlag = self.checkPool(self.currentPoolNum, self.maxPoolNum);
      if (lbQuotaFlag) {
        if (poolQuotaFlag) {
          self.setLoadbalance();
        } else {
          self.$message({
          showClose: true,
          message: Vue.t('scalingService.exceedSourceQuota'),
          type: 'warning'
          });
        }
      } else {
        self.$message({
        showClose: true,
        message: Vue.t('scalingService.exceedLbQuota'),
        type: 'warning'
        });
      }
    }
   },
   async setLoadbalance() {
     let self = this;
     let lbSubnet = self.LBPolicyForm.subnet;
     let lbMethod = self.LBPolicyForm.method;
     let lbProtocol = self.LBPolicyForm.protocol;
     let lbPort = self.LBPolicyForm.port;
     let lbPoolSubnet =self.poolSubnet;
     let lbData = {
      "lb_service": {
            "lb": {
            "policy": {
                "name": "sp001",
                "spec": {
                    "properties": {
                        "pool": {
                            "protocol": lbProtocol,
                            "protocol_port": lbPort,
                            "subnet": lbPoolSubnet,
                            "lb_method": lbMethod,
                            "admin_state_up": true,
                            "session_persistence": {
                                "type": "HTTP_COOKIE",
                                "cookie_name": "hello"
                            }
                        },
                        "vip": {
                            "protocol": lbProtocol,
                            "protocol_port": lbPort,
                            "connection_limit": -1,
                            "subnet": lbSubnet,
                            "admin_state_up": true,
                            "address": self.removeZerofromip(self.LBPolicyForm.ipaddress)
                        },
                        "health_monitor": {
                            "type": "PING",
                            "delay": 20,
                            "timeout": 20,
                            "max_retries": 3,
                            "http_method": "GET",
                            "url_path": "/health",
                            "expected_codes": 200,
                            "admin_state_up": true
                        },
                        "lb_status_timeout": 300
                    },
                    "type": "senlin.policy.loadbalance",
                    "version": "1.1"
                }
            }
          }
        }
      };
      if (self.LBPolicyForm.ipaddress != "") {
        let cidr = "";
        for (let i = 0; i < self.subnetOptions.length; i++) {
          let item = self.subnetOptions[i];
          if (item.id === self.LBPolicyForm.subnet) {
            cidr = item["cidr"];
          }
        }
        let reqdata = {
          "ip": self.removeZerofromip(self.LBPolicyForm.ipaddress),
          "cidr": cidr
        };
        self.$ajax({
          type: 'post',
          url: "api/neutron/v2.0/inspur/networkextension/validate_ip_in_cidr",
          data: JSON.stringify(reqdata),
          showErrMsg: false,
          success: function(res) {
            if (res) {
              let ipreqdata = {
                "ip": self.removeZerofromip(self.LBPolicyForm.ipaddress),
                "subnet_id": self.LBPolicyForm.subnet
              }
              self.$ajax({
                type: 'post',
                url: "api/neutron/v2.0/inspur/networkextension/ip_is_used_in_subnet",
                data: JSON.stringify(ipreqdata),
                showErrMsg: false,
                success: function(res) {
                  if (!res) {
                    self.submitParams(lbData)
                  } else {
                    self.$notify.error({
                      message: Vue.t('scalingService.ipisOccupy')
                    });
                    return;
                  }
                },
                errFun() {
                }
              });
            } else {
              self.$notify.error({
                message: Vue.t('network.ipnotsubnet')
              });
              return;
            }
          },
          errFun() {
          }
        });
      } else {
        delete lbData.lb_service.lb.policy.spec.properties.vip.address;
        self.submitParams(lbData)
      }
    },
    submitParams(lbData) {
      let self = this;
      try {
        self.$refs.LBPolicyForm.validate((valid) => {
          if (valid) {
            self.loading = true;
            self.isDisabled = true;
            self.$ajax({
              type: 'POST',
              url: "api/senlin/v1/clusters/" + self.clusterId +"/actions",
              data: JSON.stringify(lbData),
              successMsg:this.$t('scalingService.sendApplySuccess'),
              log:{
                description:{
                  en:"scalingService" + self.scalingServiceName + ":config loadbalance",
                  zh_cn:"伸缩服务" + self.scalingServiceName + ":设置负载均衡"
                },
                target:Vue.logTarget.ScalingService
              },
              successFun: () => {
                self.loading = false;
                self.$emit("handleLbShow", {});
                self.$emit("refreshData");
              },
              errFun: () => {
                self.loading = false;
                self.isDisabled = false;
              }
            });
            return true;
          } else {
            self.loading = false;
            self.isDisabled = false;
            return false;
          }
        });
      } catch (res) {
      }
    },
    handleClose(done) {
      this.$emit("handleLbShow", {});
      done();
    },
    cancel() {
      this.$emit("handleLbShow", {});
    },
    removeZerofromip(ip) {
      let newaddress = "";
      let address2 = ip.split(".");
      for (let i = 0; i < address2.length; i++) {
        if (address2[i].length == 2) {
          if (address2[i].substr(0, 1) == "0") {
            address2[i] = address2[i].substr(1);
          }
        } else if (address2[i].length == 3) {
          if (address2[i].substr(0, 1) == "0" && address2[i].substr(1, 1) == "0") {
            address2[i] = address2[i].substr(2);
          } else if (address2[i].substr(0, 1) == "0" && address2[i].substr(1, 1) != "0") {
            address2[i] = address2[i].substr(1);
          }
        }
        if (i != 3) {
          newaddress += address2[i] + ".";
        } else {
          newaddress += address2[i];
        }
      }
      return newaddress;
    }
  }
}
</script>
<style scoped>
.el-form-item__label {
  text-align: right;
}
</style>
