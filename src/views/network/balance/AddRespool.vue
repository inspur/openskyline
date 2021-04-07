<template>
  <el-dialog :title="$t('network.createPool')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-steps :active="activeIndex" process-status="process" finish-status="success">
      <el-step :title="$t('network.respoolDetail')"></el-step>
      <el-step :title="$t('network.respoolMember')"></el-step>
      <el-step :title="$t('network.healthMonitorDetail')"></el-step>
    </el-steps>
    <step-three-pool @stepThreeDone="stepThreeDone" @cancel="cancel" @IsUDP="IsUDP" @setMonitorProtocol="setMonitorProtocol" v-show="activeIndex == 0" ref="stepThree" :prevStepFlag="false"></step-three-pool>
    <step-four @prevStep="prevStep" @stepFourDone="stepFourDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepFour" :projectId="projectId"></step-four>
    <step-five @prevStep="prevStep" @finishStep="finishStep" :IsUDPFlag="IsUDPFlag" @cancel="cancel" :protocol="protocol" v-show="activeIndex == 2" ref="stepFive"></step-five>
  </el-dialog>
</template>
<script>
import StepThreePool from "./CreateStepThreePool";
import StepFour from "./CreateStepFour";
import StepFive from "./CreateStepFive";
export default {
  name: "AddResPool",
  props: ["balancerId", "projectId"],
  components: {
    StepThreePool,
    StepFour,
    StepFive
  },
  data() {
    return {
      protocol: "",
      IsUDPFlag: false,
      activeIndex: 0,
      flag: false,
      dialogVisible: false,
      dialogCloseble: true,
      tempmember: null,
      temphealthmonitor: null,
      balanceStatus: "",
      stepStatus: ""
    };
  },
  beforeDestroy() {
    if (this.balancerstatusValid != null) {
      clearInterval(this.balancerstatusValid);
    }
    if (this.intervalMem) {
      clearInterval(this.intervalMem);
    }
  },
  watch: {
    balanceStatus: {
      immediate: false,
      handler: function(value) {
        let self = this;
        clearInterval(self.balancerstatusValid);
        if (value == "PENDING_UPDATE" && !self._isDestroyed) {
          self.balancerstatusValid = setInterval(() => {
            self.checkbalancerStatus(self.stepStatus);
          }, 2000);
        }
      }
    }
  },
  mounted() {
    //this.$parent.$parent.active = "BalanceList";
    this.initDialog();
  },
  methods: {
    setMonitorProtocol(val) {
      this.protocol = val;
    },
    IsUDP(val) {
      this.IsUDPFlag = val;
    },
    initDialog() {
      let self = this;
      self.dialogVisible = true;
      self.dialogCloseble = true;
      self.getServerList(self.projectId);
    },
    prevStep(activeIndex) {
      this.flag = false;
      this.activeIndex = activeIndex - 2;
      Vue.scrollToHeader();
    },
    stepThreeDone() {
      let self = this;
      self.flag = false;
      self.activeIndex = 1;
      Vue.scrollToHeader();
    },
    stepFourDone() {
      let self = this;
      self.flag = false;
      self.activeIndex = 2;
      Vue.scrollToHeader();
    },
    handleClose(done) {
      if (this.dialogCloseble) {
        this.$emit("handleCancelShow", {});
        done();
      } else {
        this.$notify.info({
          message: Vue.t('network.CREATING_RESOURCE_POOL_PLEASE_WAIT') + "..."
        });
      }
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    async getServerList(projectId) {
      let self = this;
      try {
        let roleType = Vue.roleType + "";
        let url = "";
        // url = "api/nova/v2.1/servers-inspur/detail?limit=99999&project_id="+projectId;
        if (roleType == "0") {
          url =
            "api/nova/v2.1/servers-inspur/detail?limit=99999&all_tenants=1&project_id=" +
            projectId;
        } else if (roleType === '3') {
          url =`api/nova/v2.1/servers-inspur/detail?limit=99999&project_id=${projectId}&user_id=${Vue.userId}`;
        } else {
          url =
            "api/nova/v2.1/servers-inspur/detail?limit=99999&project_id=" +
            projectId;
        }
        url += `&not-tags-any=${encodeURIComponent('#,@,~')}`;
        let result = await self.$ajax({
          type: "GET",
          url: url,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          }
        });
        let servers = result["servers"];
        let tempList = [];
        for (let i = 0; i < servers.length; i++) {
          let server = servers[i];
          if (server["status"] === "ACTIVE" || server["status"] === "SHUTOFF") {
            tempList.push(server);
          }
        }
        self.serverTotalList = [];
        for (let i = 0; i < tempList.length; i++) {
          let vm = tempList[i];
          let tempobj = {};
          tempobj.id = vm["id"];
          tempobj.name = vm["name"];
          let addresses = vm["addresses"];
          let ips = [];
          let addressesSize = 0;
          let f = false;
          for ( let key in addresses) {
            addressesSize++;
            let a = addresses[key];
            tempobj.address = a[0]["addr"];
            for (let j = 0; j < a.length; j++) {
              if ((a[j]["version"] + "") === "4") {
                f = true;
                ips.push(a[j]["addr"]);
              }
            }
          }
          if (!f) {
            continue;
          }
          if (addressesSize > 0) {
            tempobj.addresses = ips;
            tempobj.port = "";
            tempobj.weight = "1";
            tempobj.addressFlag = false;
            tempobj.weightFlag = false;
            tempobj.portFlag = false;
            tempobj.subnetFlag = false;
            self.serverTotalList.push(tempobj);
          }
        }
        self.$refs.stepFour.serverTotalData = self.serverTotalList;
        for (let i = 0; i < tempList.length; i++) {
          let vm = tempList[i];
          self.getSubnetInfo(vm["id"]); //根据云主机ID获取子网详情
        }
      } catch (res) {}
    },
    async getSubnetInfo(vmId) {
      let self = this;
      try {
        let result = await self.$ajax({
          type: "GET",
          url: "api/nova/v2.1/servers/" + vmId + "/os-interface"
        });
        let tempList = result["interfaceAttachments"];
        //获取子网ID和名称
        if (tempList.length > 0) {
          for (let i = 0; i < self.serverTotalList.length; i++) {
            let tempobj = self.serverTotalList[i];
            if (tempobj["id"] === vmId) {
              let subnetmore = [];
              for (let t = 0; t < tempList.length; t++) {
                let fixedips = tempList[t]["fixed_ips"];
                for (let k = 0; k < fixedips.length; k++) {
                  let tempips = fixedips[k];
                  for (let j = 0; j < Vue.subnetsList.length; j++) {
                    let subnet = Vue.subnetsList[j];
                    if (subnet["id"] === tempips["subnet_id"]) {
                      subnetmore.push({
                        ipaddress: tempips["ip_address"],
                        subnet: subnet
                      });
                    }
                  }
                }
                tempobj.subnetmore = subnetmore;
              }
            }
          }
        }
      } catch (res) {}
    },
    async checkNetworkLimit(projectId) {
      let self = this;
      try {
        let quota = await self.$ajax({
          type: "get",
          url: "api/neutron/v2.0/quotas/" + projectId + "/details.json",
          errorKey: "NeutronError"
        });
        let limitList = quota["quota"];
        let pool = limitList["subnetpool"];
        let limit = pool["limit"];
        let pools = await self.$ajax({
          type: "get",
          url: "api/octavia/v2.0/lbaas/pools?project_id=" + projectId,
          errorKey: "NeutronError"
        });
        let poolNumber = pools["pools"].length;
        if (limit != -1 && poolNumber >= limit) {
          self.$refs.stepFive.loading5 = false;
          self.$notify.error({
            message: Vue.t("network.respoolused")
          });
        } else {
          let sessionPersistence = {};
          if (self.$refs.stepThree.stepthreeForm.sessionType == "") {
            sessionPersistence = null;
          } else if (self.$refs.stepThree.stepthreeForm.sessionType == "SOURCE_IP" && self.IsUDPFlag) {
            sessionPersistence = {
              "type":self.$refs.stepThree.stepthreeForm.sessionType,
              "persistence_timeout": self.$refs.stepThree.stepthreeForm.persistence_timeout,
              "persistence_granularity" : self.$refs.stepThree.stepthreeForm.persistence_granularity
            };
          } else if (
            self.$refs.stepThree.stepthreeForm.sessionType == "APP_COOKIE"
          ) {
            sessionPersistence = {
              type: self.$refs.stepThree.stepthreeForm.sessionType,
              cookie_name: self.$refs.stepThree.stepthreeForm.cookieName
            };
          } else {
            sessionPersistence = {
              type: self.$refs.stepThree.stepthreeForm.sessionType,
              cookie_name: null
            };
          }
          //创建资源池的参数
          let pool = {
            pool: {
              name: self.$refs.stepThree.stepthreeForm.name,
              description: self.$refs.stepThree.stepthreeForm.description,
              project_id: self.projectId,
              tenant_id: self.projectId,
              lb_algorithm: self.$refs.stepThree.stepthreeForm.protocol,
              protocol: self.$refs.stepThree.stepthreeForm.listenerprotocol === 'TERMINATED_HTTPS' ? 'HTTP' : self.$refs.stepThree.stepthreeForm.listenerprotocol,
              listener_id: self.$refs.stepThree.stepthreeForm.listenerID,
              admin_state_up: self.$refs.stepThree.stepthreeForm.managestatus,
              session_persistence: sessionPersistence
            }
          };
          //创建member
          let memberData = self.$refs.stepFour.memberTableData;
          for (let i = 0; i < memberData.length; i++) {
            let memberobj = memberData[i];
            memberobj["project_id"] = self.projectId;
            memberobj["tenant_id"] = self.projectId;
          }
          //创建健康监听器
          let healthmonitor = {
            healthmonitor: {
              name: self.$refs.stepFive.stepfiveForm.name,
              delay: self.$refs.stepFive.stepfiveForm.timedivide,
              max_retries: self.$refs.stepFive.stepfiveForm.trytimes,
              max_retries_down: self.$refs.stepFive.stepfiveForm.failtrytimes,
              timeout: self.$refs.stepFive.stepfiveForm.overtime,
              type: self.$refs.stepFive.stepfiveForm.healthyType,
              project_id: self.projectId,
              tenant_id: self.projectId
              // "pool_id": poolId
            }
          };
          if (self.$refs.stepFive.stepfiveForm.healthyType === "HTTP" || self.$refs.stepFive.stepfiveForm.healthyType === "HTTPS") {
            healthmonitor = {
              healthmonitor: {
                name: self.$refs.stepFive.stepfiveForm.name,
                delay: self.$refs.stepFive.stepfiveForm.timedivide,
                max_retries: self.$refs.stepFive.stepfiveForm.trytimes,
                max_retries_down: self.$refs.stepFive.stepfiveForm.failtrytimes,
                timeout: self.$refs.stepFive.stepfiveForm.overtime,
                type: self.$refs.stepFive.stepfiveForm.healthyType,
                project_id: self.projectId,
                tenant_id: self.projectId,
                // "pool_id": poolId,
                http_method: self.$refs.stepFive.stepfiveForm.httpmethod,
                expected_codes: self.$refs.stepFive.stepfiveForm.statuscode,
                url_path: self.$refs.stepFive.stepfiveForm.urlpath
              }
            };
          }
          self.tempmember = memberData;
          self.createpools(pool, memberData, healthmonitor);
          self.$notify.success({
            message: Vue.t("network.createrespoolsuccess")
          });
        }
      } catch (res) {}
    },
    finishStep() {
      let self = this;
      //检查是否超配
      self.checkNetworkLimit(self.projectId);
    },
    //判断正在创建的负载均衡是否暂挂更新
    async checkbalancerStatus(step) {
      let self = this;
      try {
        let result = await this.$ajax({
          type: "GET",
          url:
            "api/octavia/v2.0/lbaas/loadbalancers/" +
            self.$route.params.balanceId +
            "/statuses"
        });
        let statuses = result["statuses"];
        self.balanceStatus = statuses["loadbalancer"]["provisioning_status"];
        if (self.balanceStatus === "ACTIVE" && step === "health") {
          self.createhealthmonitors(self.temphealthmonitor);
        } else if (self.balanceStatus === "ACTIVE" && step === "member") {
          self.createpoolmembers(
            self.tempmember,
            self.temphealthmonitor["healthmonitor"]["pool_id"]
          );
          self.$emit("handleAddShow", {});
        }
      } catch (res) {}
    },
    //创建资源池
    createpools(pool, member, healthmonitor) {
      let self = this;
      let result = self.$ajax({
        type: "POST",
        url: "api/octavia/v2.0/lbaas/pools",
        data: JSON.stringify(pool),
        errorKey: "NeutronError",
        success: function(result) {
          let pool = result["pool"];
          let poolId = pool["id"];
          healthmonitor["healthmonitor"]["pool_id"] = poolId;
          self.temphealthmonitor = healthmonitor;
          self.stepStatus = "health";
          self.checkbalancerStatus(self.stepStatus);
        },
        errFun() {
          self.$emit("handleAddShow", {});
        },
        log: {
          description: {
            en: "Create Pool:" + self.$refs.stepThree.stepthreeForm.name,
            zh_cn: "创建资源池:" + self.$refs.stepThree.stepthreeForm.name
          },
          target: Vue.logTarget.balance
        }
      });
    },
    //资源池成员
    createpoolmembers(memberData, poolId) {
      let self = this;
      if (memberData.length == 0) {
        self.$emit("handleAddShow", {});
        return;
      }
      let memberobj = memberData.shift();
      let reqdata = {
        member: {
          address: memberobj["address"],
          subnet_id: memberobj["subnetid"],
          protocol_port: memberobj["port"],
          weight: memberobj["weight"],
          project_id: memberobj["project_id"],
          tenant_id: memberobj["project_id"],
          compute_id: memberobj.compute_id || null,
          external: memberobj.external
        }
      };
      let result = self.$ajax({
        type: "POST",
        url: "api/octavia/v2.0/lbaas/pools/" + poolId + "/members",
        data: JSON.stringify(reqdata),
        errorKey: "NeutronError",
        successFun:function() {
          if (memberData.length == 0) {
            self.$emit("handleAddShow", {});
          } else {
            clearInterval(self.intervalMem);
            self.intervalMem = setInterval(() => {
              self.searchBalanceStatusForMem(memberData, poolId);
            }, 5000);
          }
        }
      });
    },
    searchBalanceStatusForMem(memberData, poolId) {
      let self = this;
      let result = self.$ajax({
        type: "get",
        url:
          "api/octavia/v2.0/lbaas/loadbalancers/" +
          self.$route.params.balanceId,
        errorKey: "NeutronError",
        success: function(result) {
          let loadbalancer = result["loadbalancer"];
          if (
            loadbalancer["provisioning_status"] != "ERROR"
          ) {
            if (
              loadbalancer["provisioning_status"] == "ACTIVE"
            ) {
              clearInterval(self.intervalMem);
              self.createpoolmembers(memberData, poolId);
            }
          } else {
            clearInterval(self.intervalMem);
            self.$emit("handleAddShow", {});
          }
        }
      });
    },
    //创建健康监听器
    createhealthmonitors(healthmonitor) {
      let self = this;
      let result = self.$ajax({
        type: "POST",
        url: "api/octavia/v2.0/lbaas/healthmonitors",
        data: JSON.stringify(healthmonitor),
        errorKey: "NeutronError",
        success: function(result) {
          self.stepStatus = "member";
          self.checkbalancerStatus(self.stepStatus);
        },
        errFun() {
          self.$emit("handleAddShow", {});
        }
      });
    }
  }
};
</script>
