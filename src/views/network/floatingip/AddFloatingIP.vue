<template>
<div>
  <el-dialog :title="$t('network.allocatefloatingip')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="120px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
        <el-input auto-complete="off" class="col-10" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="form.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.externalNet')" class="is-required" prop="externalnet_id">
        <el-select class="col-10" v-model="form.externalnet_id" filterable clearable @change="getIPAvailabilities">
          <el-option v-for="item in externalnetOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-tooltip placement="top">
          <div slot="content" v-if="isCN">不显示无可用IP的外部网络</div>
          <div slot="content" v-else>Not list external networks with no available IP</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <!--<el-form-item :label="$t('network.subnet')" class="is-required" prop="subnet">
        <el-select class="col-10" v-model="form.externalnet_id" filterable clearable @change="clearIp">
          <el-option v-for="item in externalnetOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>-->
      <el-form-item :label="$t('network.allocatedNumber')" class="is-required">
        <el-select class="col-10" v-model="allocateNum">
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
          <el-option label="3" value="3"></el-option>
          <el-option label="4" value="4"></el-option>
          <el-option label="5" value="5"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="IP1" prop="floatingip1">
        <el-input class="col-10 ipclass" id="floatingip1" v-model="form.floatingip1"></el-input>
        <span class="ip-waring" v-if="!checkIPRange[0]" v-html="$t('network.IPCheck')"></span>
        <span class="ip-waring" v-if="typeof(form.floatingip1) === 'undefined'"  v-html="$t('network.noIP')"></span>
        <span class="ip-waring" v-if="IpRepetitionCheck('floatingip1', form.floatingip1)" v-html="$t('network.iprepeat')"></span>
      </el-form-item>
      <el-form-item label="IP2" v-if="allocateNum >= 2" prop="floatingip2">
        <el-input class="col-10 ipclass" id="floatingip2" v-model="form.floatingip2"></el-input>
        <span class="ip-waring" v-if="!checkIPRange[1]" v-html="$t('network.IPCheck')"></span>
        <span class="ip-waring" v-if="typeof(form.floatingip2) === 'undefined'"  v-html="$t('network.noIP')"></span>
        <span class="ip-waring" v-if="IpRepetitionCheck('floatingip2', form.floatingip2)" v-html="$t('network.iprepeat')"></span>
      </el-form-item>
      <el-form-item label="IP3" v-if="allocateNum >= 3" prop="floatingip3">
        <el-input class="col-10 ipclass" id="floatingip3" v-model="form.floatingip3"></el-input>
        <span class="ip-waring" v-if="!checkIPRange[2]" v-html="$t('network.IPCheck')"></span>
        <span class="ip-waring" v-if="typeof(form.floatingip3) === 'undefined'"  v-html="$t('network.noIP')"></span>
        <span class="ip-waring" v-if="IpRepetitionCheck('floatingip3', form.floatingip3)" v-html="$t('network.iprepeat')"></span>
      </el-form-item>
      <el-form-item label="IP4" v-if="allocateNum >= 4" prop="floatingip4">
        <el-input class="col-10 ipclass" id="floatingip4" v-model="form.floatingip4" ></el-input>
        <span class="ip-waring" v-if="!checkIPRange[3]" v-html="$t('network.IPCheck')"></span>
        <span class="ip-waring" v-if="typeof(form.floatingip4) === 'undefined'"  v-html="$t('network.noIP')"></span>
        <span class="ip-waring" v-if="IpRepetitionCheck('floatingip4', form.floatingip4)" v-html="$t('network.iprepeat')"></span>
      </el-form-item>
      <el-form-item label="IP5" v-if="allocateNum >= 5" prop="floatingip5">
        <el-input class="col-10 ipclass" id="floatingip5" v-model="form.floatingip5"></el-input>
        <span class="ip-waring" v-if="!checkIPRange[4]" v-html="$t('network.IPCheck')"></span>
        <span class="ip-waring" v-if="typeof(form.floatingip5) === 'undefined'"  v-html="$t('network.noIP')"></span>
        <span class="ip-waring" v-if="IpRepetitionCheck('floatingip5', form.floatingip5)" v-html="$t('network.iprepeat')"></span>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="operate" type="primary" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
  <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script type="text/javascript">
import uuid from 'uuid';
export default {
  name:"AddFloatingIP",
  data() {
    let checkIPUsed = (rule, value, callback) => {
      let self = this;
      let index = rule.rule;
      let ip = value;
      self.checkIP[index] = false;
      self.checkIPRange[index] = true;
      if (this.isIP(ip) && this.form.externalnet_id) {
        let networkId = self.getNetworkId(self.form.externalnet_id);
        self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/ports?fixed_ips=ip_address=" + ip + "&network_id=" + networkId,
          successFun: function (res) {
            if (res && res.ports.length) {
              self.checkIP.splice(index, 1, true);
              callback(new Error(self.$t('network.used')));
            } else {
              self.checkIP.splice(index, 1, false);
              callback();
            }
            // 验证是否在子网范围内
            self.loadValidIpInLegal(ip, self.form.externalnet_id, index);
          },
          errorKey: "NeutronError"
        });
      }
    };
    return {
      isCN: Vue.config.lang == "zh-cn",
      allocation_pools: [], // 子网范围
      validInputIpFlg: true, //ip已使用和ip不在子网范围内标记
      IpRepetitionFlg: false, // ip重复标记
      checkIP: (new Array(5)).fill(false),
      checkIPRange: [true, true, true, true, true],
      dialogVisible: false,
      roleType: Vue.roleType + "",
      projectOption: Vue.projectListforNet,
      externalnetOptions: [],
      externalSubnetMap: {},
      loading: false,
      isDisabled: false,
      totalData: [],
      selProjectFlg:false,
      close: "",
      allocateNum: 1,
      form: {
        project_id: "",
        projectName:"",
        externalnet_id: "",
        floatingip1: "",
        floatingip2: "",
        floatingip3: "",
        floatingip4: "",
        floatingip5: ""
      },
      rules: {
        projectName: [
          {type: 'required'}
        ],
        externalnet_id: [
          {type: 'required'}
        ],
        floatingip1: [
          { type: 'ipv4' },
          { type: 'required', trigger: 'blur change' },
          { validator: checkIPUsed, rule: 0 }
        ],
        floatingip2: [
          { type: 'required', trigger: 'blur change' },
          { type: 'ipv4' },
          { validator: checkIPUsed, rule: 1 }
        ],
        floatingip3: [
          { type: 'required', trigger: 'blur change' },
          { type: 'ipv4' },
          { validator: checkIPUsed, rule: 2 }
        ],
        floatingip4: [
          { type: 'required', trigger: 'blur change' },
          { type: 'ipv4' },
          { validator: checkIPUsed, rule: 3 }
        ],
        floatingip5: [
          { type: 'required', trigger: 'blur change' },
          { type: 'ipv4' },
          { validator: checkIPUsed, rule: 4 }
        ]
      },
      times: 0
    }
  },
  mounted() {
    let self = this;
    self.$parent.$parent.active = "floatingIP";
    if (roleType == "0") {
      this.initDialog();
    } else {
      self.form.project_id = Vue.cookie.get('pid');
      this.dialogVisible = true;
      self.getExternalnetList(self.form.project_id);
    };
  },
  watch: {
    /*allocateNum(val) {
      for (let i = 0; i < this.checkIP.length; i++) {
        if (i > (val-1)) {
          let key = "floatingip" + (i + 1);
          this.checkIP.splice(i, 1, false);
          this.form[key] = "";
        }
      }
    }*/
  },
  methods: {
    /**
     * 判断IP是否重复
     * @param ipKey
     * @param index
     * @returns {boolean}
     * @constructor
     */
    IpRepetitionCheck(ipKey, ip) {
      if (this.isIP(ip)) {
        this.IpRepetitionFlg = false;
        const formInput = "floatingip";
        for (let i=1; i <= this.allocateNum; i++) {
          let key = formInput + i;
          let value = this.form[formInput + i];
          if ((key != ipKey) && (this.form[ipKey] === value)) {
            this.IpRepetitionFlg = true;
            return true;
          }
        }
      }
    },
    // 获取子网的信息 一坨返回值都拼里边了还要各种处理
    getIPAvailabilities(id) {
      let self = this;
      this.checkIP.fill(false);
      this.checkIPRange.fill(true);
      let networkId = self.getNetworkId(id);
      this.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/inspur/inspur-network-ip-availabilities/" + networkId + '?ip_version=4',
        successFun: function (res) {
          let subnets = res.inspur_network_ip_availability.subnets;
          for (let i = 0; i < subnets.length; i++) {
            if (id == subnets[i].id) {
              [self.form.floatingip1, self.form.floatingip2, self.form.floatingip3, self.form.floatingip4,
                self.form.floatingip5 ] = subnets[i].ips;
              self.allocation_pools = subnets[i].allocation_pools;
            }
          }
        },
        errorKey: "NeutronError"
        });
    },
    isIP(ipstr) {
      if (ipstr) {
        let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/g;
        return ipstr.match(reg);
      }
    },
    initDialog() {
      this.dialogVisible = true;
      this.getExternalnetList();
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.form.project_id = id;
      this.form.projectName = name;
      this.close = 'close';
    },
    onIconClick() {
      this.form.project_id = '';
      this.form.projectName = '';
      this.close = '';
    },
    //校验：ip是否在合法的范围内
   loadValidIpInLegal(ip, netId, index) {
     let self = this;
     self.checkIPRange[index] = true;
     let check = self.checkIpInLegal(ip);
     if (!check) {
       self.checkIPRange.splice(index, 1, false);
     } else {
       self.checkIPRange.splice(index, 1, true);
     }
    },
    getExternalnetList() {
      let self = this;
      let allSubnetList = Vue.subnetsList;
      let allExternalNetList = Vue.networkList;
      let externalNetMap = new Map();
      let externalNet = [];
      self.externalnetOptions = [];
    /*  for (let j = 0; j < allExternalNetList.length; j++) {
        externalNet = allExternalNetList[j];
        externalNetMap.set(externalNet.id, externalNet);
      }
      for (let i =0; i< allSubnetList.length; i++) {
        let subnet = allSubnetList[i];
        if (subnet["ip_version"] === 4) {
          externalNet = externalNetMap.get(subnet.network_id);
          if (externalNet!= null && externalNet!= undefined && externalNet["router:external"] === true) {
            subnet.name = externalNet["name"] + "("+ subnet.cidr+")";
            subnet.network_name = externalNet["name"];
            // subnet.id = externalNet["id"]; 此处使用networkid会出现重复问题
            self.externalnetOptions.push(subnet);
          }
        }
      }*/

      this.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/inspur/inspur-network-ip-availabilities?router:external=true&ip_version=4",
        successFun: function (res) {
          let availability = res.inspur_network_ip_availabilities;
          let externalnetOptionsArr = [];
          for (let i = 0; i < availability.length; i++) {
            if (availability[i].subnets.length) {
              const subnets = availability[i].subnets;
              for (let j = 0; j < subnets.length; j++) {
                if (subnets[j].ips.length) {
                  externalnetOptionsArr.push({
                    id: subnets[j].id,
                    networkId: availability[i].network_id,
                    name: availability[i].network_name + "("+ subnets[j].cidr+")"
                  })
                }
              }
            }
          }
          self.externalnetOptions = externalnetOptionsArr;
        },
        errorKey: "NeutronError"
      });
    },
    // 获取networkid
    getNetworkId (subnetId) {
      let self = this;
      for (let i = 0; i < self.externalnetOptions.length; i++) {
        if (subnetId === self.externalnetOptions[i].id) {
          return self.externalnetOptions[i].networkId;
        }
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
    getfloatingIPList(value) {
      let self = this;
      self.getIpsAvailable(value);
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleAddShow", {});
    },
    getIpsAvailable(networkID, name="", isassigned="") {
      let self = this;
      try {
        self.loading = true;
        self.isDisabled = true;
        self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/network-ip-availabilities/" + networkID,
          success: function(result) {
            let data = [];
            self.totalData = [];
            let networkipvailability = result["network_ip_availability"];
            let subnetIpvailableList = networkipvailability["subnet_ip_availability"];
            let availableips = [];
            for (let j = 0; j < subnetIpvailableList.length; j++) {
              let subnetips = subnetIpvailableList[j];
              if (subnetips["ip_version"]=="4") {
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
                  availableips = availableips.concat(totalipetails);
                }
              }
            }
            self.totalData = availableips;
            let listView1 = $("#floatingip1");
            let listView2 = $("#floatingip2");
            let listView3 = $("#floatingip3");
            let listView4 = $("#floatingip4");
            let listView5 = $("#floatingip5");
            listView1.html("");
            listView2.html("");
            listView3.html("");
            listView4.html("");
            listView5.html("");
            let listItem1;
            let listItem2;
            let listItem3;
            let listItem4;
            let listItem5;
            listItem1 = $("<option value=''>"+Vue.t("network.autoSelect")+"</option>");
            listItem2 = $("<option value=''>"+Vue.t("network.autoSelect")+"</option>");
            listItem3 = $("<option value=''>"+Vue.t("network.autoSelect")+"</option>");
            listItem4 = $("<option value=''>"+Vue.t("network.autoSelect")+"</option>");
            listItem5 = $("<option value=''>"+Vue.t("network.autoSelect")+"</option>");
            listView1.append(listItem1);
            listView2.append(listItem2);
            listView3.append(listItem3);
            listView4.append(listItem4);
            listView5.append(listItem5);
            for (let i = 0; i<availableips.length; i++) {
              listItem1 = $("<option>" + availableips[i] + "</option>");
              listItem1.attr("value", availableips[i]);
              listView1.append(listItem1);
            }
            for (let i = 0; i<availableips.length; i++) {
              listItem2 = $("<option>" + availableips[i] + "</option>");
              listItem2.attr("value", availableips[i]);
              listView2.append(listItem2);
            }
            for (let i = 0; i<availableips.length; i++) {
              listItem3 = $("<option>" + availableips[i] + "</option>");
              listItem3.attr("value", availableips[i]);
              listView3.append(listItem3);
            }
            for (let i = 0; i<availableips.length; i++) {
              listItem4 = $("<option>" + availableips[i] + "</option>");
              listItem4.attr("value", availableips[i]);
              listView4.append(listItem4);
            }
            for (let i = 0; i<availableips.length; i++) {
              listItem5 = $("<option>" + availableips[i] + "</option>");
              listItem5.attr("value", availableips[i]);
              listView5.append(listItem5);
            }
            self.loading = false;
            self.isDisabled = false;
          },
          errFun() {
            self.loading = false;
            self.isDisabled = false;
          },
          errorKey: "NeutronError"
        });
      } catch (res) {
      }
    },
    rowClick(row) {
      this.$refs.umTable.toggleRowSelection(row);
    },
    repeatTest(ary) {
      return /(\x0f[^\x0f]+)\x0f[\s\S]*\1/.test("\x0f"+ary.join("\x0f\x0f")+"\x0f");
    },
    // 验证ip是否在子网范围内 ip是否重复 判断flg
    validInputIp() {
      let self = this;
      self.validInputIpFlg = true;
      for (let i = 0; i < this.allocateNum; i++) {
        if (self.checkIP[i] == true || self.checkIPRange[i] == false) {
          self.validInputIpFlg = false;
          break;
        }
      }
    },
    operate() {
      let self = this;
      let projectId = self.form.project_id;
      let floatingNetworkId = self.getNetworkId(self.form.externalnet_id);
      self.validInputIp();
      self.$refs.form.validate(async(valid) => {
        if (valid && self.validInputIpFlg && !self.IpRepetitionFlg) {
          try {
            let multyIPList = [];
            for (let i = 1; i <= self.allocateNum; i++) {
              if (i == 1 && this.form.floatingip1!="") {
                multyIPList.push(this.form.floatingip1);
              } else if (i == 2 && this.form.floatingip2!="") {
                multyIPList.push(this.form.floatingip2);
              } else if (i == 3 && this.form.floatingip3!="") {
                multyIPList.push(this.form.floatingip3);
              } else if (i == 4 && this.form.floatingip4!="") {
                multyIPList.push(this.form.floatingip4);
              } else if (i == 5 && this.form.floatingip5!="") {
                multyIPList.push(this.form.floatingip5);
              }
            }
           /* if (self.totalData.length == 0) {
              self.$notify({
                message: Vue.t('network.nofloatingip'),
                type: "error"
              });
              return;
            }*/
            if (self.repeatTest(multyIPList)) {
              self.$notify({
                message: Vue.t('network.iprepeat'),
                type: "error"
              });
              return;
            }
            self.loading = true;
            self.isDisabled = true;
            for (let i = 1; i <= self.allocateNum; i++) {
              let floatingIpAddress = "";
              if (i == 1) {
                floatingIpAddress = this.form.floatingip1;
              } else if (i == 2) {
                floatingIpAddress = this.form.floatingip2;
              } else if (i == 3) {
                floatingIpAddress = this.form.floatingip3;
              } else if (i == 4) {
                floatingIpAddress = this.form.floatingip4;
              } else if (i == 5) {
                floatingIpAddress = this.form.floatingip5;
              }
              if (floatingIpAddress!= "") {
                let reqdata = {"floatingip":{
                  "project_id": projectId,
                  "floating_network_id": floatingNetworkId,
                  "floating_ip_address": floatingIpAddress}
                };
                let traceId = 'req-'+uuid.v1();
                await self.$ajax({
                  type: "POST",
                  url: "api/neutron/v2.0/floatingips",
                  data: JSON.stringify(reqdata),
                  headers: {
                    'X-Openstack-Request-Id': traceId
                  },
                  success: function(result) {
                    let logfloating = result["floatingip"]["floating_ip_address"];
                    self.$recordLog({
                      target:Vue.logTarget.floatingIP,
                      level:{
                        en:"info",
                        zh_cn:"信息"
                      },
                      description:{
                        en:"Allocate floatingip:"+logfloating,
                        zh_cn:"分配浮动IP:"+logfloating
                      },
                      trace_id: traceId
                    });
                  },
                  errFun() {
                    self.loading = false;
                    self.isDisabled = false;
                  },
                  errorKey: "NeutronError"
                });
              }
            }
            // 下边这个是什么意思咱也没搞懂，咱也不敢删 只是和上边ajax参数有一个不同
            for (let i = 1; i <= self.allocateNum; i++) {
              let floatingIpAddress = "";
              if (i == 1) {
                floatingIpAddress = this.form.floatingip1;
              } else if (i == 2) {
                floatingIpAddress = this.form.floatingip2;
              } else if (i == 3) {
                floatingIpAddress = this.form.floatingip3;
              } else if (i == 4) {
                floatingIpAddress = this.form.floatingip4;
              } else if (i == 5) {
                floatingIpAddress = this.form.floatingip5;
              }
              if (floatingIpAddress== "") {
                let reqdata = {"floatingip":{
                  "project_id": projectId,
                  "floating_network_id": floatingNetworkId}
                };
                let traceId = 'req-'+uuid.v1();
                await self.$ajax({
                  type: "POST",
                  url: "api/neutron/v2.0/floatingips",
                  data: JSON.stringify(reqdata),
                  headers: {
                    'X-Openstack-Request-Id': traceId
                  },
                  success: function(result) {
                    let logfloating = result["floatingip"]["floating_ip_address"];
                    self.$recordLog({
                      target:Vue.logTarget.floatingIP,
                      level:{
                        en:"info",
                        zh_cn:"信息"
                      },
                      description:{
                        en:"Allocate floatingip:"+logfloating,
                        zh_cn:"分配浮动IP:"+logfloating
                      },
                      trace_id: traceId
                    });
                  },
                  errFun() {
                    self.loading = false;
                    self.isDisabled = false;
                  },
                  errorKey: "NeutronError"
                });
              }
            }
            for (let i = 1; i <= self.allocateNum; i++) {
              if (i == self.allocateNum) {
                self.$message.success(Vue.t('network.allocateSuccess'));
                self.loading = false;
                self.isDisabled = false;
                self.cancel();
              }
            }
          } catch (res) {
            console.log(res);
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
<style type="text/css">
  .ipclass{
    height: 31px;
  }
  .ip-waring{
    display: inline-block;
    color: #ff0000;
  }
</style>
