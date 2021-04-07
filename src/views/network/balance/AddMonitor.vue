<template>
<el-dialog
  :title="$t('network.createMonitor')"
  :visible.sync="dialogVisible"
  :before-close="handleClose">
  <el-steps :active="activeIndex" process-status="process" finish-status="success">
    <el-step :title="$t('network.monitorDetail')"></el-step>
    <el-step :title="$t('network.respoolDetail')"></el-step>
    <el-step :title="$t('network.respoolMember')"></el-step>
    <el-step :title="$t('network.healthMonitorDetail')"></el-step>
  </el-steps>
  <step-two @stepTwoDone="stepTwoDone" @cancel="cancel" :projectId="projectId" v-show="activeIndex == 0" ref="stepTwo" :prevStepFlag="false" @getProtocol=getProtocol :totallistenerData="totallistenerData"></step-two>
  <step-three @prevStep="prevStep" @stepThreeDone="stepThreeDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepThree" :protocol="protocol" :prevStepFlag="true"></step-three>
  <step-four @prevStep="prevStep" @stepFourDone="stepFourDone" @cancel="cancel" v-show="activeIndex == 2" ref="stepFour" :projectId="projectId"></step-four>
  <step-five @prevStep="prevStep" :projectId="projectId" @finishStep="finishStep" @cancel="cancel" v-show="activeIndex == 3" :protocol="protocol" ref="stepFive" :limitStatus="limitStatus"></step-five>
</el-dialog>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import StepTwo from './CreateStepTwo';
import StepThree from './CreateStepThree';
import StepFour from './CreateStepFour';
import StepFive from './CreateStepFive';
export default {
  name: 'AddBalance',
  props: ["balanceId", "projectId", "totallistenerData"],
  components: {
    StepTwo, StepThree, StepFour, StepFive
  },
  data() {
    return {
      protocol: "",
      activeIndex: 0,
      flag: false,
      dialogVisible: false,
      dialogCloseble: true,
      temppool: null,
      tempmember: null,
      temphealthmonitor: null,
      balanceStatus: "",
      stepStatus: "",
      serverTotalList: [],
      loading: false,
      limitStatus: false
    }
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
            self.checkbalancerStatus(self.stepStatus)
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
    getProtocol(val) {
      this.protocol = val;
    },
    initDialog() {
      let self = this;
      self.checkNetworkLimit(self.projectId);
      self.getServerList(self.projectId);
      self.dialogVisible = true;
      self.dialogCloseble = true;
    },
    prevStep(activeIndex) {
      this.flag = false;
      this.activeIndex = activeIndex-1;
      Vue.scrollToHeader();
    },
    stepTwoDone(param) {
      let self = this;
      self.flag = true;
      this.activeIndex = 1;
      Vue.scrollToHeader();
    },
    stepThreeDone() {
      let self = this;
      self.flag = false;
      this.activeIndex = 2;
      Vue.scrollToHeader();
    },
    stepFourDone() {
      let self = this;
      self.flag = false;
      this.activeIndex = 3;
      Vue.scrollToHeader();
    },
    handleClose(done) {
      if (this.dialogCloseble) {
        this.$emit("handleCancelShow", {});
        done();
      } else {
        this.$notify.info({
          message: Vue.t('network.creatingmonitor')
        });
      }
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    async checkNetworkLimit(projectId) {
      try {
        let pools = await this.$ajax({
          type: 'get',
          url: "api/octavia/v2.0/lbaas/pools?project_id="+projectId,
          errorKey: "NeutronError"
        });
        let quota = await this.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/quotas/"+projectId+"/details.json",
          errorKey: "NeutronError"
        });
        let limitList = quota["quota"];
        let pool = limitList["pool"];
        let limit = pool["limit"];
        let poolNumber = pools["pools"].length;
        if (poolNumber >= limit) {
          // this.$notify.error({
          //   message: "资源池配额已用尽"
          // });
          this.limitStatus = true;
        } else {
          this.limitStatus = false;
        }
      } catch (res) {
      }
    },
    async getServerList(projectId) {
      let self = this;
      try {
        let roleType = Vue.roleType + "";
        let url = "";
        if (roleType == "0") {
          url = "api/nova/v2.1/servers-inspur/detail?limit=99999&all_tenants=1&project_id="+projectId;
        } else if (roleType === '3') {
          url =`api/nova/v2.1/servers-inspur/detail?limit=99999&project_id=${projectId}&user_id=${Vue.userId}`;
        } else {
          url = "api/nova/v2.1/servers-inspur/detail?limit=99999&project_id="+projectId
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
          if (server["status"]==="ACTIVE" || server["status"]==="SHUTOFF") {
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
          self.getSubnetInfo(vm["id"]);//根据云主机ID获取子网详情
        }
      } catch (res) {
      }
    },
    async getSubnetInfo(vmId) {
      let self = this;
      try {
        let result = await self.$ajax({
          type: "GET",
          url: "api/nova/v2.1/servers/"+vmId+"/os-interface"
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
                  console.log("0-------"+tempips["ip_address"])
                  for (let j = 0; j < Vue.subnetsList.length; j++) {
                    let subnet = Vue.subnetsList[j];
                    if (subnet["id"] === tempips["subnet_id"]) {
                      console.log("1------"+tempips["ip_address"]+"----"+subnet.name);
                      subnetmore.push({"ipaddress": tempips["ip_address"], "subnet":subnet});
                    }
                  }
                }
                tempobj.subnetmore = subnetmore;
              }
            }
          }
        }
      } catch (res) {
      }
    },
    finishStep() {
      let self = this;
      self.dialogCloseble = false;
      //创建监听器的参数
      let listener = {"listener":{
        "name": self.$refs.stepTwo.steptwoForm.name,
        "description": self.$refs.stepTwo.steptwoForm.description,
        "project_id": self.projectId,
        "tenant_id": self.projectId,
        "loadbalancer_id": self.balanceId,
        "protocol": self.$refs.stepTwo.steptwoForm.protocol,
        "protocol_port": self.$refs.stepTwo.steptwoForm.port,
        "admin_state_up":self.$refs.stepTwo.steptwoForm.managestatus,
        "connection_limit":self.$refs.stepTwo.steptwoForm.connectLimit,
        "timeout_client_data":self.$refs.stepTwo.steptwoForm.timeoutClient,
        "timeout_member_connect":self.$refs.stepTwo.steptwoForm.timeoutMemconnect,
        "timeout_member_data":self.$refs.stepTwo.steptwoForm.timeoutMemData,
        "timeout_tcp_inspect":self.$refs.stepTwo.steptwoForm.tcpInspect
        /*"insert_headers":{
          "X-Forwarded-For":self.$refs.stepTwo.steptwoForm.xforwardedfor?"true":"false",
          "X-Forwarded-Port":self.$refs.stepTwo.steptwoForm.xforwardedport?"true":"false"
        }*/
        }
      };
      if (self.$refs.stepTwo.steptwoForm.protocol !== "UDP" && self.$refs.stepTwo.steptwoForm.protocol !== "TCP" && self.$refs.stepTwo.steptwoForm.protocol !== "HTTPS") {
        listener.listener.insert_headers = {
          "X-Forwarded-For":self.$refs.stepTwo.steptwoForm.xforwardedfor?"true":"false",
          "X-Forwarded-Port":self.$refs.stepTwo.steptwoForm.xforwardedport?"true":"false"
        }
      }
      if (self.$refs.stepTwo.steptwoForm.protocol === "TERMINATED_HTTPS") {
        listener.listener['default_tls_container_ref'] = self.$refs.stepTwo.steptwoForm.secretsDefault;
        listener.listener['sni_container_refs'] = self.$refs.stepTwo.steptwoForm.secretsSNI;
      }
      let sessionPersistence = {};
      if (self.$refs.stepThree.stepthreeForm.sessionType == "") {
        sessionPersistence = null;
      } else if (self.$refs.stepThree.stepthreeForm.sessionType == "SOURCE_IP" && self.$refs.stepTwo.steptwoForm.protocol === "UDP") {
        sessionPersistence = {
          "type":self.$refs.stepThree.stepthreeForm.sessionType,
          "persistence_timeout": self.$refs.stepThree.stepthreeForm.persistence_timeout,
          "persistence_granularity" : self.$refs.stepThree.stepthreeForm.persistence_granularity
        };
      } else if (self.$refs.stepThree.stepthreeForm.sessionType == "APP_COOKIE") {
        sessionPersistence = {
          "type":self.$refs.stepThree.stepthreeForm.sessionType,
          "cookie_name":self.$refs.stepThree.stepthreeForm.cookieName
        };
      } else {
        sessionPersistence = {
          "type":self.$refs.stepThree.stepthreeForm.sessionType,
          "cookie_name":null
        };
      }
      //创建资源池的参数
      let pool = {"pool":{
        "name": self.$refs.stepThree.stepthreeForm.name,
        "description": self.$refs.stepThree.stepthreeForm.description,
        "project_id": self.projectId,
        "tenant_id": self.projectId,
        "lb_algorithm": self.$refs.stepThree.stepthreeForm.protocol,
        "protocol": self.$refs.stepTwo.steptwoForm.protocol === 'TERMINATED_HTTPS' ? 'HTTP' : self.$refs.stepTwo.steptwoForm.protocol,
        "admin_state_up":self.$refs.stepThree.stepthreeForm.managestatus,
        "session_persistence":sessionPersistence
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
      let healthmonitor = {"healthmonitor":{
        "name":self.$refs.stepFive.stepfiveForm.name,
        "delay": self.$refs.stepFive.stepfiveForm.timedivide,
        "max_retries": self.$refs.stepFive.stepfiveForm.trytimes,
        "max_retries_down": self.$refs.stepFive.stepfiveForm.failtrytimes,
        "timeout": self.$refs.stepFive.stepfiveForm.overtime,
        "type":  self.$refs.stepFive.stepfiveForm.healthyType,
        "project_id": self.projectId,
        "tenant_id": self.projectId
        // "pool_id": poolId
        }
      };
      if (self.$refs.stepFive.stepfiveForm.healthyType === "HTTP" || self.$refs.stepFive.stepfiveForm.healthyType === "HTTPS") {
        healthmonitor = {"healthmonitor":{
          "name":self.$refs.stepFive.stepfiveForm.name,
          "delay": self.$refs.stepFive.stepfiveForm.timedivide,
          "max_retries": self.$refs.stepFive.stepfiveForm.trytimes,
          "max_retries_down": self.$refs.stepFive.stepfiveForm.failtrytimes,
          "timeout": self.$refs.stepFive.stepfiveForm.overtime,
          "type":  self.$refs.stepFive.stepfiveForm.healthyType,
          "project_id": self.projectId,
          "tenant_id": self.projectId,
          // "pool_id": poolId,
          "http_method": self.$refs.stepFive.stepfiveForm.httpmethod,
          "expected_codes": self.$refs.stepFive.stepfiveForm.statuscode,
          "url_path": self.$refs.stepFive.stepfiveForm.urlpath
          }
        };
      }
      self.createListeners(listener, pool, memberData, healthmonitor);
      self.$notify.success({
        message: Vue.t('network.createmonitorsuccess')
      });
    },
    //创建监听器
    createListeners(listener, pool, member, healthmonitor) {
      let self = this;
      self.temppool = pool;
      self.tempmember = member;
      self.temphealthmonitor = healthmonitor;
      let result = self.$ajax({
        type: "POST",
        url: "api/octavia/v2.0/lbaas/listeners",
        data: JSON.stringify(listener),
        errorKey: "NeutronError",
        success: function(result) {
          let listener = result["listener"];
          let listenerId = listener["id"];
          pool["pool"]["listener_id"] = listenerId;
          self.stepStatus = "pool";
          self.checkbalancerStatus(self.stepStatus);
        },
        errFun() {
           self.$emit("handleAddShow", {});
        },
        log:{
          description:{
            en:"Create Monitor:" + self.$refs.stepTwo.steptwoForm.name,
            zh_cn:"创建监听器:" + self.$refs.stepTwo.steptwoForm.name
          },
          target:Vue.logTarget.balance
        }
      });
    },
    //判断正在创建的负载均衡是否暂挂更新
    async checkbalancerStatus(step) {
      let self = this;
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/octavia/v2.0/lbaas/loadbalancers/"+self.$route.params.balanceId+"/statuses"
        });
        let statuses = result["statuses"];
        self.balanceStatus = statuses["loadbalancer"]["provisioning_status"];
        if (self.balanceStatus==="ACTIVE" && step==="pool") {
          self.createpools(self.temppool, self.tempmember, self.temphealthmonitor);
        } else if (self.balanceStatus==="ACTIVE" && step==="health") {
          self.createhealthmonitors(self.temphealthmonitor);
        } else if (self.balanceStatus==="ACTIVE" && step==="member") {
          self.createpoolmembers(self.tempmember, self.temphealthmonitor["healthmonitor"]["pool_id"]);
          //最后一步的时候，关闭弹窗
          // self.$emit("handleAddShow", {});
        }
      } catch (res) {
      }
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
      let reqdata = {"member":{
        "address": memberobj["address"],
        "subnet_id": memberobj["subnetid"],
        "protocol_port": memberobj["port"],
        "weight": memberobj["weight"],
        "project_id": memberobj["project_id"],
        "tenant_id": memberobj["project_id"],
        compute_id: memberobj.compute_id || null,
        external: memberobj.external
        }
      };
      let result = self.$ajax({
        type: "POST",
        url: "api/octavia/v2.0/lbaas/pools/"+poolId+"/members",
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
        type: 'get',
        url: "api/octavia/v2.0/lbaas/loadbalancers/" + self.$route.params.balanceId,
        errorKey: "NeutronError",
        success: function(result) {
          let loadbalancer = result["loadbalancer"];
          if (loadbalancer["provisioning_status"] != "ERROR") {
            if (loadbalancer["provisioning_status"] == "ACTIVE") {
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
}
</script>
