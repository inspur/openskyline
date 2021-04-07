<template>
<div>
  <el-dialog :title="$t('network.bangdingFloatingip')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="form" :model="form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.floatingIP')" class="is-required" prop="floatIp">
        <el-select v-model="form.floatIp" filterable>
          <el-option v-for="item in totalFloatingIPs" :key="item.id" :label="item.floating_ip_address" :value="item.id"></el-option>
        </el-select>
        <el-button type="text" @click="addIPFun"><i>{{$t('lang.addTo')}}</i></el-button>
      </el-form-item>
      <el-form-item :label="$t('network.fixedipaddress')" class="is-required" prop="fixedIp">
        <el-select v-model="form.fixedIp">
          <el-option v-for="item in totalfixedIPs" :key="item.portId" :label="item.fixip" :value="item.portId"></el-option>
        </el-select>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.floatIpInstTip')" v-if="this.originFlag == 'sky'">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="addFloatingIp" :loading="isDisabled">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
  <el-dialog :title="$t('calcStorLang.instAddFloatingIp')" :visible.sync="addIpFlag" v-if="addIpFlag" :before-close="handleAddIpClose">
    <el-form ref="addIp" :model="addIp" label-width="100px" :rules="rules1" v-loading="loading">
      <!--<el-form-item :label="$t('network.externalNet')" class="is-required" prop="extNet">
        <el-select v-model="addIp.extNet" class="col-12" filterable @change="getIPlist">
          <el-option v-for="item in extNetOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="IP" class="is-required">
        &lt;!&ndash; <el-select v-model="addIp.ip" class="col-12" filterable>
          <el-option v-for="item in ipOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select> &ndash;&gt;
        <select id="addIpList" class="col-12" style="height:31px;"></select>
      </el-form-item>-->

      <el-form-item :label="$t('network.externalNet')" class="is-required" prop="externalnet_id">
        <el-select class="col-10" v-model="addIp.externalnet_id" filterable clearable @change="getIPAvailabilities">
          <el-option v-for="item in extNetOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="IP" prop="ip" class="is-required">
        <el-input class="col-10 ipclass" @change="checkUsed(addIp.ip)" v-model="addIp.ip"></el-input>
        <span class="ip-waring" v-if="checkIP" v-html="$t('network.used')"></span>
        <span class="ip-waring" v-if="!checkIPRange" v-html="$t('network.IPCheck')"></span>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleAddIpClose">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmIpFun" :loading="isDisabled">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
 </div>
</template>
<script>
export default {
  name: 'floatIp',
  props: ["instUuid", "projectId", "instanceName", "originFlag"],
  data() {
    return {
      validInputIpFlg: true, //ip已使用和ip不在子网范围内标记
      allocation_pools: [], // 子网范围
      checkIPRange: true,
      checkIP: false,
      dialogVisible: false,
      isDisabled: false,
      loading: false,
      addIpFlag: false,
      floatValue: '',
      totalFloatingIPs: [],
      fixedfloatIP:new Map(),
      extNetOption:[], // 子网列表
      ipOption:[],
      totalfixedIPs: [],
      addIp:{
        externalnet_id:"",
        ip:""
      },
      form: {
        floatIp:"",
        fixedIp:""
      },
      rules: {
        floatIp: [
          {type: "required"}
        ],
        fixedIp: [
          {type: "required"}
        ]
      },
       rules1: {
        externalnet_id: [
          {type: "required"}
        ],
        ip: [
          {type: "required"},
          {type: "ipv4"}
         ]
      }
    }
  },
  mounted() {
    this.initDialog();
    this.getData();
    this.getfixedIPs(this.instUuid);
  },
  methods: {
    /**
     * 验证输入的IP是否已使用 是否在子网内
     * @param id 此id为子网id
     */
    checkUsed(ip) {
      let self = this;
      if (!this.isIP(ip)) {
        self.checkIP = false;
        self.checkIPRange = true;
      }
      if (this.isIP(ip) && this.addIp.externalnet_id) {
        let body = {"ip": ip, "subnet_id": self.addIp.externalnet_id};
        body = JSON.stringify(body);
        self.$ajax({
          type: "POST",
          url: "api/neutron/v2.0/inspur/networkextension/ip_is_used_in_subnet", //一个端口只能对应一个网络 通过获取返回值的pors是否有值来判断是否在范围内
          data: body,
          successFun: function (res) {
            if (res) {
              self.checkIP = true;
            } else {
              self.checkIP = false;
            }
            // 验证是否在子网范围内
            self.loadValidIpInLegal(ip, self.addIp.externalnet_id);
          },
          errorKey: "NeutronError"
        });
        /*let networkId = self.getNetworkId(self.addIp.externalnet_id);
        self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/ports?fixed_ips=ip_address=" + ip + "&network_id=" + networkId, //一个端口只能对应一个网络 通过获取返回值的pors是否有值来判断是否在范围内
          successFun: function (res) {
            if (res && res.ports.length) {
              self.checkIP = true;
            } else {
              self.checkIP = false;
            }
            // 验证是否在子网范围内
            self.loadValidIpInLegal(ip, self.addIp.externalnet_id);
          },
          errorKey: "NeutronError"
        });*/
      }
    },
    // 验证ip是否在子网范围内 ip是否重复 判断flg
    validInputIp() {
      let self = this;
      self.validInputIpFlg = true;
      if (self.checkIP == true || self.checkIPRange == false) {
        self.validInputIpFlg = false;
      }
    },
    //校验：ip是否在合法的范围内
    loadValidIpInLegal(ip) {
      let self = this;
      let check = self.checkIpInLegal(ip);
      if (!check) {
        self.checkIPRange = false;
      } else {
        self.checkIPRange = true;
      }
    },
    // 判断是否在子网范围内
    checkIpInLegal(ip) {
      let self = this;
      let ipNum = self.ipToNumber(ip);
      for (let i = 0; i < self.allocation_pools.length; i++) {
        let startNum = self.ipToNumber(self.allocation_pools[i].start);
        let endNum = self.ipToNumber(self.allocation_pools[i].end);
        if (ipNum >= startNum && ipNum <= endNum) {
          return true;
        }
      }
      return false;
    },
    // ip转换成数字
    ipToNumber(ip) {
      let num = ip.split(".");
      return parseInt(num[0])*256*256*256 +
        parseInt(num[1])*256*256 +
        parseInt(num[2])*256 +
        parseInt(num[3]);
    },
    isIP(ipstr) {
      if (ipstr) {
        let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/g;
        return ipstr.match(reg);
      }
    },
    /**
     * 获取子网的信息 一坨返回值都拼里边了还要各种处理
     * @param id 此id为子网id
     */
    getIPAvailabilities(id) {
      if (!id) return
      let self = this;
      this.checkIP = false;
      this.checkIPRange = true;
      let networkId = self.getNetworkId(id); // 获取网络id
      this.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/inspur/inspur-network-ip-availabilities/" + networkId,
        successFun: function (res) {
          let subnets = res.inspur_network_ip_availability.subnets;
          for (let i = 0; i < subnets.length; i++) {
            if (id == subnets[i].id) {
              [self.addIp.ip] = subnets[i].ips;
              self.allocation_pools = subnets[i].allocation_pools;
            }
          }
        },
        errorKey: "NeutronError"
      });
    },
    /**
     * 获取网络id
     * @param subnetId 子网id
     * @returns {*}
     */
    getNetworkId (subnetId) {
      let self = this;
      for (let i = 0; i < self.extNetOption.length; i++) {
        if (subnetId === self.extNetOption[i].id) {
          return self.extNetOption[i].network_id;
        }
      }
    },
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("handleFloatIpFlag", {});
    },
    handleClose(done) {
      this.$emit("handleFloatIpFlag", {});
      done();
    },
    handleAddIpClose() {
      this.addIpFlag = false;
    },
    confirmAddDisk() {
      var self = this;
      self.$emit("handleFloatIpFlag", {});
      self.$message(self.$t('calcStorLang.configSuccess'));
    },
    async getData() {
      const self = this;
      this.addIp.externalnet_id = "";
      this.addIp.ip = "";
      let data = [];
      let statusTransfer = {"ACTIVE":this.$t('calcStorLang.running'), "DOWN":this.$t('lang.DOWN'), "ERROR":this.$t('lang.ERROR')};
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/floatingips?project_id="+self.projectId,
          complete: function(XMLHttpRequest, textStatus) {
          }
        });
        let tempArr = result["floatingips"];
        self.totalFloatingIPs = [];
        for (let i =0; i< tempArr.length; i++) {
          let floatingip = tempArr[i];
          if (floatingip.fixed_ip_address ===null && !(floatingip.port_forwardings.length)) {
            floatingip.status = statusTransfer[floatingip.status];
            self.totalFloatingIPs.push(floatingip);
          } else {
            if (self.originFlag == 'sky') {
              self.fixedfloatIP.set(floatingip.fixed_ip_address, floatingip.fixed_ip_address);
            }
          }
        }
      } catch (res) {
      }
    },
    async getfixedIPs(vmUUid) {
      var self = this;
      let data = [];
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/servers/"+vmUUid + "/os-interface",
          complete: function(XMLHttpRequest, textStatus) {
          }
        });
        let tempArr = result["interfaceAttachments"];
        for (var i =0; i< tempArr.length; i++) {
          let vminterface = tempArr[i];
          let fixedIps = tempArr[i].fixed_ips;
          if (fixedIps != null && fixedIps.length > 0) {
            for (var j = fixedIps.length - 1; j >= 0; j--) {
              let reqdata = {"portId":tempArr[i].port_id, "fixip":fixedIps[j].ip_address};
              if (self.originFlag == 'sky') {
                if (!(/^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/.test(fixedIps[j].ip_address))) {
                  if (!self.fixedfloatIP.get(fixedIps[j].ip_address)) {
                    self.totalfixedIPs.push(reqdata);
                  }
                }
              } else {
                self.totalfixedIPs.push(reqdata);
              }
            }
          }
        }
      } catch (res) {
        // self.$message.error('获取失败!');
      }
    },
    getIPlist(value) {
      let self = this;
      try {
        let extNet = "";
        for (let i = 0; i < self.extNetOption.length; i++) {
          if (self.extNetOption[i]["id"] == value) {
            extNet = self.extNetOption[i]["network_id"];
          }
        }
        self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/network-ip-availabilities/" + extNet,
          success: function(result) {
            let networkipvailability = result["network_ip_availability"];
            let subnetIpvailableList = networkipvailability["subnet_ip_availability"];
            self.ipOption = [];
            for (let j = subnetIpvailableList.length-1; j >= 0; j--) {
              let subnetips = subnetIpvailableList[j];
              if (subnetips.subnet_id != value) {
                continue;
              }
              let totalipetails = subnetips["total_ip_details"];
              let usedipdetails = subnetips["used_ip_details"];
              if (totalipetails.length != 0) {
                for (let i = totalipetails.length-1; i >= 0; i--) {
                  let a = totalipetails[i];
                  if (usedipdetails.length != 0) {
                    if (usedipdetails.indexOf(a) != -1) {
                      totalipetails.splice(i, 1);
                    }
                  }
                }
              }
              let listView1 = $("#addIpList");
              listView1.html("");
              let listItem1;
              for (let i = 0; i<totalipetails.length; i++) {
                listItem1 = $("<option>" + totalipetails[i] + "</option>");
                listItem1.attr("value", totalipetails[i]);
                listView1.append(listItem1);
              }
              // for (var i =0; i<= totalipetails.length - 1; i++) {
              //   let ip = totalipetails[i];
              //     let obj = {};
              //     obj.value = totalipetails[i];
              //     obj.label = totalipetails[i];
              //     self.ipOption.push(obj);
              // }
            }
            // self.addIp.ip = self.ipOption.length > 0 ? self.ipOption[0].value : "";
          },
          errorKey: "NeutronError"
        });
      } catch (res) {
      }
    },
    confirmIpFun() {
      let self = this;
      let projectId = self.projectId;
      let floatingIpAddress = this.addIp.ip;
      let floatingNetworkId = "";
      self.validInputIp();
      self.$refs.addIp.validate(async(valid) => {
        if (valid && self.validInputIpFlg) {
          try {
            for (let i = 0; i < self.extNetOption.length; i++) {
              if (self.extNetOption[i]["id"] == self.addIp.externalnet_id) {
                floatingNetworkId = self.extNetOption[i]["network_id"];
              }
            }
            let reqdata = {"floatingip":{
                "project_id": projectId,
                "floating_network_id": floatingNetworkId,
                "floating_ip_address": floatingIpAddress}
            };
            self.loading = true;
            self.isDisabled = true;
            let result = self.$ajax({
              type: "POST",
              url: "api/neutron/v2.0/floatingips",
              data: JSON.stringify(reqdata),
              complete: function(XMLHttpRequest, textStatus) {
                self.loading = false;
                self.isDisabled = false;
              },
              success: function(result) {
                self.$message.success(self.$t('network.allocateSuccess'));
                self.addIpFlag = false;
                self.getData();
                if (result["floatingip"]["id"] && result["floatingip"]["id"] != "") {
                  self.form.floatIp = result["floatingip"]["id"];
                }
              },
              errFun() {
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Host Allocate floatingip:" + floatingIpAddress,
                  zh_cn:"云主机分配浮动IP:" + floatingIpAddress
                },
                target:Vue.logTarget.floatingIP
              }
            });
          } catch (res) {
            console.log(res);
          }
        return true;
        } else {
        return false;
        }
      });
    },
    addFloatingIp() {
      let self = this;
      self.loading = true;
      self.isDisabled = true;
      self.$ajax({
        type: 'get',
        url: "api/nova/v2.1/servers-inspur/" + self.instUuid,
        complete: function(XMLHttpRequest, textStatus) {
          self.loading = false;
          self.isDisabled = false;
        },
        headers: {
          'X-OpenStack-Nova-API-Version': 2.41
        },
        errFun:function() {
          self.loading = false;
          self.isDisabled = false;
        },
        success:function(resVM) {
           let Instance = resVM['server'];
           let status = Instance['status'];
           if (status == "ACTIVE" || status == "SHUTOFF" || status == "PAUSED" || status == "SUSPENDED" ) {
            let ipaddress = "";
            for (let i = 0; i < self.totalFloatingIPs.length; i++) {
              let ips = self.totalFloatingIPs[i];
              if (ips.id === self.form.floatIp) {
                ipaddress = ips["floating_ip_address"];
              }
            }
            console.log("ip:"+ipaddress);
            let reqdata = {"floatingip":{
                "port_id": self.form.fixedIp
              }
            };
            self.$refs.form.validate(async(valid) => {
              if (valid) {
                  self.$ajax({
                  type: 'get',
                  url: "api/neutron/v2.0/floatingips/"+self.form.floatIp,
                  complete: function(XMLHttpRequest, textStatus) {
                    // self.loading = false;
                    // self.isDisabled = false;
                  },
                  success: function(result) {
                    if (result != null) {
                        let floatingip = result["floatingip"];
                        if (floatingip.fixed_ip_address != null) {
                          self.loading = false;
                          self.isDisabled = false;
                          self.$message.error(self.$t('calcStorLang.instFloatingTip1'));
                        } else {
                          var logtarget = Vue.logTarget.computeInstance;
                          if (self.originFlag != undefined && self.originFlag == 'phy') {
                            logtarget = Vue.logTarget.computePhysical;
                          }
                          self.$ajax({
                              type: 'PUT',
                              url: "api/neutron/v2.0/floatingips/"+self.form.floatIp,
                              data: JSON.stringify(reqdata),
                              complete: function(XMLHttpRequest, textStatus) {
                                self.loading = false;
                                self.isDisabled = false;
                              },
                              success: function(result2) {
                                self.$message.success(self.$t('calcStorLang.instFloatingSuccess'));
                                self.handleCancel();
                                  //this.$emit("onRefresh");
                              },
                              errFun:function() {
                              },
                              errorKey: "NeutronError",
                              log:{
                                description:{
                                  en:"Host" + self.instanceName+" Binding floating IP:" + ipaddress,
                                  zh_cn:"云物理机" + self.instanceName+" 绑定浮动IP:" + ipaddress
                                },
                                target:logtarget
                              }
                            });
                        }
                      } else {
                        self.loading = false;
                        self.isDisabled = false;
                        self.handleCancel();
                      }
                    },
                    errFun() {
                      self.loading = false;
                      self.isDisabled = false;
                    },
                    errorKey: "NeutronError"
                  });
                return true;
              } else {
              return false;
              }
            });
        } else {
          self.handleCancel();
        }
      }
    });
    },
    // 获取子网列表
    async addIPFun() {
      var self = this;
      self.addIpFlag = true;
      let data = [];
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/networks?router:external=true"
        });
        let nets = result["networks"];
        let result1 = await self.$ajax({
          type: 'GET',
          url: "api/neutron/v2.0/subnets",
          errorKey: "NeutronError"
        });
        let subnetsList = result1['subnets'];
        let externalNetDisk = new Map();
        for (var j = 0; j < nets.length; j++) {
          let externalNet = {};
          externalNet = nets[j];
          externalNetDisk.set(externalNet.id, externalNet);
        }
        self.extNetOption = [];
        for (let i =0; i< subnetsList.length; i++) {
          let subnet = subnetsList[i];
          if (subnet["ip_version"] === 4) {
            let externalNet = externalNetDisk.get(subnet.network_id);
            if (externalNet!= null && externalNet!= undefined) {
              subnet.name = externalNet["name"] + "("+ subnet.cidr+")";
              self.extNetOption.push(subnet);
            }
          }
        }
      } catch (res) {
      }
    }
  }
}
</script>
<style scoped>
  .ipclass{
    height: 31px;
  }
  .ip-waring{
    display: inline-block;
    color: #ff0000;
  }
</style>
