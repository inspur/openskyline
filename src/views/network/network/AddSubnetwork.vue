<template>
  <el-dialog  :title="$t('network.createSubnet')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="addResSpecForm" :model="addResSpecForm" class="me-required-form" label-width="130px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.subnetName')" class="is-required" prop="subnetname">
        <el-input class="col-10"  v-model="addResSpecForm.subnetname"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.ipversion')" class="is-required" prop="ipversion">
        <el-select class="col-10" v-model="addResSpecForm.ipversion" @change="ipversionChange">
          <el-option label="IPv4" value="4"></el-option>
          <el-option label="IPv6" value="6"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.ipv6addressconfig')" v-if="addResSpecForm.ipversion == 6"> <!-- subnetForm.ipversion == 6 -->
        <el-select v-model="addResSpecForm.ipv6mode">
          <el-option :label="$t('network.nothing')" value=""></el-option>
          <el-option :label="$t('network.ipv6config1')" value="slaac/slaac"></el-option>
          <el-option :label="$t('network.ipv6config2')" value="none/slaac"></el-option>
          <el-option :label="$t('network.ipv6config4')" value="dhcpv6-stateless/dhcpv6-stateless"></el-option>
        </el-select>
        <el-tooltip  effect="dark" :content="$t('network.ipv6configNote')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="CIDR" class="is-required" prop="netaddress">
        <el-input class="col-10"  v-model="addResSpecForm.netaddress" @blur="cidrChange"></el-input>
        <el-tooltip  effect="dark" :content="$t('network.networkNote1')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.enablegate')">
        <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="disableGateway"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('network.gatewayip')" v-if="disableGateway" prop="gatewayip">
        <el-input class="col-10"  v-model="addResSpecForm.gatewayip"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.networkNote2')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-button type="text" style="padding-left:60px;" @click="showDetail()" href="advanceBtn"><span>{{advanceName}}</span></el-button>
      <div v-show="subnetdetailStatus">
      <el-form-item :label="$t('network.enableDHCP')">
        <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="activeDHCP"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('network.addresspool')">
        <el-row>
        <el-col :span="6">
        <el-form-item prop="startAddr">
          <el-input v-model="addResSpecForm.startAddr" :placeholder="$t('network.beginaddress')"></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="1" style="text-align:center;">-</el-col>
        <el-col :span="6">
        <el-form-item prop="endAddr">
          <el-input v-model="addResSpecForm.endAddr" :placeholder="$t('network.endaddress')"></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="3" style="padding-left:10px;">
          <el-button size="small" type="primary" @click="addNewPool">{{$t('lang.addTo')}}</el-button>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.networkNote3')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-col>
        <el-col :span="24" style="padding-top:5px;">
        <el-form-item>
          <span>{{$t('network.addedAddresses')}}</span>
          <span v-if="haverespool">{{$t('network.nothing')}}</span>
          <el-tag v-for="tag in addresspolltext" :key="tag" closable @close="handlePoolClose(tag)">{{tag}}</el-tag>
        </el-form-item>
        </el-col>
        </el-row>
      </el-form-item>
      <el-form-item :label="$t('network.dnsserver')">
        <el-form-item  prop="dnsAddr">
          <el-input class="col-6"  v-model="addResSpecForm.dnsAddr"></el-input>
          <el-button type="primary" size="small" @click="addNewDNS">{{$t('lang.addTo')}}</el-button>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.networkNote4')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <span>{{$t('network.dnsAdded')}}</span><span v-if="havednsserver">{{$t('network.nothing')}}</span>
        <el-tag v-for="tag in dnsserver" :key="tag" closable @close="handleDNSClose(tag)">{{tag}}</el-tag>
      </el-form-item>
      <el-form-item :label="$t('network.hostrouter')">
        <el-row>
        <el-col :span="6">
        <el-form-item prop="startHost">
          <el-input v-model="addResSpecForm.startHost" :placeholder="$t('network.targetCidr')"></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="6" style="padding-left:10px;">
        <el-form-item prop="endHost">
          <el-input v-model="addResSpecForm.endHost" :placeholder="$t('network.nextJump')"></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="3" style="padding-left:10px;">
        <el-button size="small" type="primary" @click="addNewHost">{{$t('lang.addTo')}}</el-button>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.networkNote5')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-col>
        </el-row>
        <el-form-item style="padding-top:5px;">
          <span>{{$t('network.hostAdded')}}</span>
          <span v-if="havehostrouter">{{$t('network.nothing')}}</span>
          <el-tag v-for="tag in hostroutertext" :key="tag" closable @close="handleHostClose(tag)">{{tag}}</el-tag>
        </el-form-item>
      </el-form-item>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" :disabled="isDisabled" @click="addSubnetClick">{{$t('lang.finish')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name: 'AddSubnetwork',
  props: ["networkId"],
  data() {
    return {
      dialogVisible: false,
      addResSpecForm: {
        subnetname: "",
        netaddress: "",
        ipversion: '4',
        gatewayip: "",
        startAddr: "",
        endAddr: "",
        dnsAddr: "",
        startHost: "",
        endHost: "",
        ipv6mode: ""
      },
      loading: false,
      addresspoll: [],
      addresspolltext: [],
      dnsserver: [],
      hostrouter: [],
      hostroutertext: [],
      disableGateway: true,
      activeDHCP: true,
      subnetdetailStatus: false,
      haverespool: true,
      havednsserver: true,
      havehostrouter: true,
      isDisabled: false,
      projectid: "",
      startAddrholder: "",
      endAddrholder: "",
      advanceName: Vue.t('network.advanceRight'),
      rules: {
        subnetname: [
          {type: "requiredNet"},
          {type: 'maxSize', value: 40},
          {type: 'onlyLetterNumber_Chinese'}
        ],
        netaddress: [
          {type: 'requiredNet'},
          {type: 'cidr'}
        ],
        ipversion: [
          {type: 'requiredNet'}
        ],
        gatewayip: [
          {type: 'ipv4'}
        ],
        startAddr: [
          {type: 'ipv4'}
        ],
        endAddr: [
          {type: 'ipv4'}
        ],
        dnsAddr: [
          {type: 'ipv4'}
        ],
        startHost: [
          {type: 'cidr'}
        ],
        endHost: [
          {type: 'ipv4'}
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
  },
  updated() {
    var self = this;
    if (self.addresspolltext.length === 0) {
      self.haverespool = true;
    } else {
      self.haverespool = false;
    }
    if (self.dnsserver.length === 0) {
      self.havednsserver = true;
    } else {
      self.havednsserver = false;
    }
    if (self.hostroutertext.length === 0) {
      self.havehostrouter = true;
    } else {
      self.havehostrouter = false;
    }
    // if (self.addResSpecForm.ipversion === "4") {
    //   self.rules.netaddress = [{type: 'required'}, {type: 'cidr'}];
    //   if (self.disableGateway===false) {
    //     self.rules.gatewayip = [];
    //   } else {
    //     self.rules.gatewayip = [{type: 'ipv4'}];
    //   }
    //   self.rules.startAddr = [{type: 'ipv4'}];
    //   self.rules.endAddr = [{type: 'ipv4'}];
    //   self.rules.dnsAddr = [{type: 'ipv4'}];
    //   self.rules.startHost = [{type: 'cidr'}];
    //   self.rules.endHost = [{type: 'ipv4'}];
    // } else {
    //   self.rules.netaddress = [{type: 'required'}, {type: 'cidripv6'}];
    //   if (self.disableGateway===false) {
    //     self.rules.gatewayip = [];
    //   } else {
    //     self.rules.gatewayip = [{type: 'ipv6'}];
    //   }
    //   self.rules.startAddr = [{type: 'ipv6'}];
    //   self.rules.endAddr = [{type: 'ipv6'}];
    //   self.rules.dnsAddr = [{type: 'ipv6'}];
    //   self.rules.startHost = [{type: 'cidripv6'}];
    //   self.rules.endHost = [{type: 'ipv6'}];
    // }
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
      self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/networks/"+this.networkId,
        success: function(result) {
          let networkInfo = result['network'];
          self.projectid = networkInfo.project_id;
        },
        errFun() {
           self.$emit("handleAddSubnetShow", {nonet:"true"});
        }
      });
    },
    handleClose(done) {
      this.$emit("handleEditCancleShow", {});
    },
    cancel() {
      this.$emit("handleEditCancleShow", {});
    },
    ipversionChange(value) {
      let self = this;
      if (self.addResSpecForm.ipversion === "4") {
        self.rules.netaddress = [{type: 'requiredNet'}, {type: 'cidr'}];
        if (self.disableGateway===false) {
          self.rules.gatewayip = [];
        } else {
          self.rules.gatewayip = [{type: 'ipv4'}];
        }
        self.rules.startAddr = [{type: 'ipv4'}];
        self.rules.endAddr = [{type: 'ipv4'}];
        self.rules.dnsAddr = [{type: 'ipv4'}];
        self.rules.startHost = [{type: 'cidr'}];
        self.rules.endHost = [{type: 'ipv4'}];
      } else {
        self.rules.netaddress = [{type: 'requiredNet'}, {type: 'cidrIPV6Include0'}];
        if (self.disableGateway===false) {
          self.rules.gatewayip = [];
        } else {
          self.rules.gatewayip = [{type: 'ipv6'}];
        }
        self.rules.startAddr = [{type: 'ipv6'}];
        self.rules.endAddr = [{type: 'ipv6'}];
        self.rules.dnsAddr = [{type: 'ipv6'}];
        self.rules.startHost = [{type: 'cidripv6'}];
        self.rules.endHost = [{type: 'ipv6'}];
      }
      if (self.addResSpecForm.netaddress!="") {
        self.cidrChange();
      }
      self.$refs.addResSpecForm.validate(async(valid) => {
        if (valid) {
          return true;
        } else {
          return false;
        }
      });
    },
    cidrChange(event=null) {
      let reg4 = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
      let reg6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
      if (this.addResSpecForm.ipversion == "4") {
        if (reg4.test(this.addResSpecForm.netaddress)) {
          this.genernateaddrpool(this.addResSpecForm.netaddress);
        } else {
          this.addResSpecForm.startAddr = "";
          this.addResSpecForm.endAddr = "";
        }
      } else {
        let fields = this.addResSpecForm.netaddress.split("/");
        if (fields.length === 2) {
          let subNet = fields[1];
          let ipv6 = fields[0];
          if ((reg6.test(ipv6) || ipv6 === "::") && Number(subNet)>=1 && Number(subNet)<=128 ) {
            this.genernateaddrpool(this.addResSpecForm.netaddress);
          } else {
            this.addResSpecForm.startAddr = "";
            this.addResSpecForm.endAddr = "";
          }
        } else {
          this.addResSpecForm.startAddr = "";
          this.addResSpecForm.endAddr = "";
        }
      }
    },
    async genernateaddrpool(cidr) {
      let reqdata = {"cidr": cidr};
      let result = await this.$ajax({
        type: 'post',
        url: "api/neutron/v2.0/inspur/networkextension/query_cidr_addressscope",
        data: JSON.stringify(reqdata)
      });
      this.addResSpecForm.startAddr = result["firstIp"];
      this.addResSpecForm.endAddr = result["endIp"];
    },
    addNewPool() {
      let self = this;
      let startIP = self.addResSpecForm.startAddr;
      let endIP = self.addResSpecForm.endAddr;
      if (startIP=="") {
        self.$notify({
          message: Vue.t('network.startAddressnotempty'),
          type: "warning"
        });
      } else if (endIP == "") {
        self.$notify({
          message: Vue.t('network.endAddressnotempty'),
          type: "warning"
        });
      }
      let reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
      let regIPv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
      if (self.addResSpecForm.ipversion === "4") {
        if (startIP!='' && endIP!='' && reg.test(startIP) && reg.test(endIP)) {
          startIP = self.removeZerofromip(startIP);
          endIP = self.removeZerofromip(endIP);
          self.addresspolltext.push(Vue.t('network.beginaddress')+":"+startIP+','+Vue.t('network.endaddress')+':'+endIP);
          self.addresspoll.push({'start': startIP, 'end': endIP});
          self.addResSpecForm.startAddr = '';
          self.addResSpecForm.endAddr = '';
        }
      } else {
        if (startIP!='' && endIP!='' && regIPv6.test(startIP) && regIPv6.test(endIP)) {
          startIP = self.removeZerofromipv6(startIP);
          endIP = self.removeZerofromipv6(endIP);
          self.addresspolltext.push(Vue.t('network.beginaddress')+":"+startIP+','+Vue.t('network.endaddress')+':'+endIP);
          self.addresspoll.push({'start': startIP, 'end': endIP});
          self.addResSpecForm.startAddr = '';
          self.addResSpecForm.endAddr = '';
        }
      }
    },
    handlePoolClose(tag) {
      let self = this;
      let tagList = tag.split(",");
      if (self.addResSpecForm.ipversion === "4") {
        let tag0 = tagList[0].split(":");
        let tag1 = tagList[1].split(":");
        for (let i = 0; i < self.addresspoll.length; i++) {
          let pool = self.addresspoll[i];
          if (pool.start == tag0[1] && pool.end == tag1[1]) {
            self.addresspoll.splice(i, 1);
          }
        }
      } else {
        let tag0 = tagList[0].toString();
        let tag1 = tagList[1].toString();
        let tag0head = tag0.split(":")[0].length+1;
        let tag1head = tag1.split(":")[0].length+1;
        tag0 = tag0.substring(tag0head);
        tag1 = tag1.substring(tag1head);
        for (let i = 0; i < self.addresspoll.length; i++) {
          let pool = self.addresspoll[i];
          if (pool.start == tag0 && pool.end == tag1) {
            self.addresspoll.splice(i, 1);
          }
        }
      }
      self.addresspolltext.splice(self.addresspolltext.indexOf(tag), 1);
    },
    addNewDNS() {
      let self = this;
      let dnsIP = self.addResSpecForm.dnsAddr;
      if (dnsIP=="") {
        self.$notify({
          message: Vue.t('network.dnsServerNotEmpty'),
          type: "warning"
        });
      }
      let reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
      let regIPv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
      if (self.addResSpecForm.ipversion === "4") {
        if (dnsIP!='' && reg.test(dnsIP)) {
          dnsIP = self.removeZerofromip(dnsIP);
          self.dnsserver.push(dnsIP);
          self.addResSpecForm.dnsAddr = "";
        }
      } else {
        if (dnsIP!='' && regIPv6.test(dnsIP)) {
          dnsIP = self.removeZerofromipv6(dnsIP);
          self.dnsserver.push(dnsIP);
          self.addResSpecForm.dnsAddr = "";
        }
      }
    },
    handleDNSClose(tag) {
      let self = this;
      self.dnsserver.splice(self.dnsserver.indexOf(tag), 1);
    },
    addNewHost() {
      let self = this;
      let startIP = self.addResSpecForm.startHost;
      let endIP = self.addResSpecForm.endHost;
      if (startIP=="") {
        self.$notify({
          message: Vue.t('network.targetCidrNotEmpty'),
          type: "warning"
        });
        return;
      } else if (endIP == "") {
        self.$notify({
          message: Vue.t('network.nextJumpNoEmpty'),
          type: "warning"
        });
        return;
      }
      self.$refs.addResSpecForm.validate(async(valid) => {
        if (valid) {
          Promise.all([self.validateNextJump(endIP)]).then(function(result) {
            if (!result[0]) {
              self.$notify({
                message: Vue.t('network.networkNote11'),
                type: "warning"
              });
              return;
            }
            let regCIDR = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
            let regIP = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
            let regIPv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
            if (self.addResSpecForm.ipversion === "4") {
              if (startIP!='' && endIP!="" && regCIDR.test(startIP) && regIP.test(endIP)) {
                startIP = self.removeZerofromCidr(startIP);
                endIP = self.removeZerofromip(endIP);
                self.hostroutertext.push(Vue.t('network.targetCidr')+":"+startIP+','+Vue.t('network.nextJump')+':'+endIP);
                self.hostrouter.push({'destination': startIP, 'nexthop': endIP});
                self.addResSpecForm.startHost = '';
                self.addResSpecForm.endHost = '';
              }
            } else {
              if (startIP!='' && endIP!="" && regIPv6.test(endIP)) {
                endIP = self.removeZerofromipv6(endIP);
                let fields = startIP.split("/");
                if (fields.length === 2) {
                  let subNet = fields[1];
                  let ipv6 = fields[0];
                  ipv6 = self.removeZerofromipv6(ipv6);
                  startIP = ipv6 + "/" + subNet;
                  if (regIPv6.test(ipv6) && Number(subNet)>=1 && Number(subNet)<=128 ) {
                    self.hostroutertext.push(Vue.t('network.targetCidr')+":"+startIP+','+Vue.t('network.nextJump')+':'+endIP);
                    self.hostrouter.push({'destination': startIP, 'nexthop': endIP});
                    self.addResSpecForm.startHost = '';
                    self.addResSpecForm.endHost = '';
                  }
                }
              }
            }
          });
        }
      });
    },
    async validateNextJump(endIP) {
      let self = this;
      let cidr = this.addResSpecForm.netaddress;
      let data = {"ip":endIP, "cidr":cidr};
      self.loading = true;
      let re = await self.$ajax({
        data: JSON.stringify(data),
        type: 'post',
        url: "api/neutron/v2.0/inspur/networkextension/validate_ip_in_cidr",
        successFun:function() {
          self.loading = false;
        },
        errFun:function() {
          self.loading = false;
        }
      });
      return re;
    },
    handleHostClose(tag) {
      let self = this;
      let tagarray = tag.split(",");
      if (self.addResSpecForm.ipversion === "4") {
        let destination = (tagarray[0].split(":"))[1];
        let nexthop = (tagarray[1].split(":"))[1];
        for (let i = self.hostrouter.length - 1; i >= 0; i--) {
          let pool = self.hostrouter[i];
          if (pool.destination === destination && pool.nexthop === nexthop) {
             self.hostrouter.splice(i, 1);
          }
        }
      } else {
        let tag0 = tagarray[0].toString();
        let tag1 = tagarray[1].toString();
        let tag0head = tag0.split(":")[0].length+1;
        let tag1head = tag1.split(":")[0].length+1;
        tag0 = tag0.substring(tag0head);
        tag1 = tag1.substring(tag1head);
        for (let i = 0; i < self.hostrouter.length; i++) {
          let pool = self.hostrouter[i];
          if (pool.destination == tag0 && pool.nexthop == tag1) {
            self.hostrouter.splice(i, 1);
          }
        }
      }
      self.hostroutertext.splice(self.hostroutertext.indexOf(tag), 1);
    },
    showDetail() {
      if (this.subnetdetailStatus == false) {
        this.subnetdetailStatus = true;
        this.advanceName = Vue.t('network.advanceLeft');
      } else {
        this.subnetdetailStatus = false;
        this.advanceName = Vue.t('network.advanceRight');
      }
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
    },
    removeZerofromCidr(ip) {
      let self = this;
      let newaddress = "";
      let address0 = ip.split("/");
      let address1 = address0[0];
      newaddress = self.removeZerofromip(address1) + "/" + address0[1];
      return newaddress;
    },
    removeZerofromipv6(ip) {
      let newaddress = "";
      let address = ip.split(":");
      for (let i = 0; i < address.length; i++) {
        if (address[i].length == 2) {
          if (address[i].substr(0, 1) == "0") {
            address[i] = address[i].substr(1);
          }
        } else if (address[i].length == 3) {
          if (address[i].substr(0, 1) == "0" && address[i].substr(1, 1) == "0") {
            address[i] = address[i].substr(2);
          } else if (address[i].substr(0, 1) == "0" && address[i].substr(1, 1) != "0") {
            address[i] = address[i].substr(1);
          }
        } else if (address[i].length == 4) {
          if (address[i].substr(0, 1) == "0" && address[i].substr(1, 1) == "0" && address[i].substr(2, 1) == "0") {
            address[i] = address[i].substr(3);
          } else if (address[i].substr(0, 1) == "0" && address[i].substr(1, 1) == "0" && address[i].substr(2, 1) != "0") {
            address[i] = address[i].substr(2);
          } else if (address[i].substr(0, 1) == "0" && address[i].substr(1, 1) != "0") {
            address[i] = address[i].substr(1);
          }
        }
        if (i != address.length-1) {
          newaddress += address[i] + ":";
        } else {
          newaddress += address[i];
        }
      }
      return newaddress;
    },
    addSubnetClick() {
      let self = this;
      self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/networks/"+self.networkId,
        errFun: function() {
          self.$emit("handleAddSubnetShow", {nonet:"true"});
        },
        success: function() {
      self.$refs.addResSpecForm.validate(async(valid) => {
        if (valid) {
          self.isDisabled = true;
          let ipversion = self.addResSpecForm.ipversion;
          let netaddress = self.addResSpecForm.netaddress;
          //处理CIDR中的0
          if (ipversion == "4") {
            netaddress = self.removeZerofromCidr(netaddress);
          }
          let gatewayip = self.addResSpecForm.gatewayip;
          let activeDHCP = self.activeDHCP;
          // 禁用网关，gateway_ip字段传null代表禁用网关
          let reqdata = {"subnet":{
              "network_id": self.networkId,
              "ip_version": ipversion,
              "cidr": netaddress,
              "name": self.addResSpecForm.subnetname,
              "enable_dhcp": activeDHCP,
              "dns_nameservers": self.dnsserver,
              "allocation_pools": self.addresspoll,
              "host_routes": self.hostrouter,
              "project_id": self.projectid,
              "gateway_ip": null
            }
          };
          // 启用网关，页面不填gatewayip时，不发送gateway_ip字段；填了，则发送所填
          if (self.disableGateway === true) {
            if (gatewayip === "") {
              reqdata = {"subnet":{
                "network_id": self.networkId,
                "ip_version": ipversion,
                "cidr": netaddress,
                "name": self.addResSpecForm.subnetname,
                "enable_dhcp": activeDHCP,
                "dns_nameservers": self.dnsserver,
                "allocation_pools": self.addresspoll,
                "project_id": self.projectid,
                "host_routes": self.hostrouter
                }
              }
            } else {
              // 处理网关ip中的0
              if (ipversion == "4") {
                gatewayip = self.removeZerofromip(gatewayip);
              } else {
                gatewayip = self.removeZerofromipv6(gatewayip);
              }
              reqdata = {"subnet":{
                "network_id": self.networkId,
                "ip_version": ipversion,
                "cidr": netaddress,
                "name": self.addResSpecForm.subnetname,
                "enable_dhcp": activeDHCP,
                "dns_nameservers": self.dnsserver,
                "allocation_pools": self.addresspoll,
                "host_routes": self.hostrouter,
                "project_id": self.projectid,
                "gateway_ip": gatewayip
                }
              }
            }
          }
          if (ipversion == "6") {
            if (self.addResSpecForm.ipv6mode == "") {
            } else if (self.addResSpecForm.ipv6mode == "slaac/slaac") {
              reqdata.subnet["ipv6_address_mode"] = "slaac";
              reqdata.subnet["ipv6_ra_mode"] = "slaac";
            } else if (self.addResSpecForm.ipv6mode == "none/slaac") {
              reqdata.subnet["ipv6_address_mode"] = "slaac";
            } else if (self.addResSpecForm.ipv6mode == "dhcpv6-stateless/dhcpv6-stateless") {
              reqdata.subnet["ipv6_address_mode"] = "dhcpv6-stateless";
              reqdata.subnet["ipv6_ra_mode"] = "dhcpv6-stateless";
            }
          }
          try {
            //检验网关是否在CIDR内
            if (gatewayip=="" || gatewayip==null) {
                self.loading = true;
                self.isDisabled = true;
                self.$ajax({
                  type: "POST",
                  url: "api/neutron/v2.0/subnets",
                  data: JSON.stringify(reqdata),
                  // successMsg: "保存成功",
                  success: function(result) {
                    self.$notify({
                      message: Vue.t("network.createSuccess"),
                      type: "success"
                    });
                    self.loading = false;
                    self.isDisabled = false;
                    self.$emit("handleAddSubnetShow", {});
                  },
                  errFun() {
                    self.loading = false;
                    self.isDisabled = false;
                  },
                  errorKey: "NeutronError",
                  log:{
                    description:{
                      en:"Create Subnet:" + self.addResSpecForm.subnetname,
                      zh_cn:"创建子网:" + self.addResSpecForm.subnetname
                    },
                    target:Vue.logTarget.subnetwork
                  }
                });
              } else {
              let gatewayObj = {
                ip:gatewayip,
                cidr:netaddress
              };
              self.$ajax({
                type: "POST",
                url: "api/neutron/v2.0/inspur/networkextension/validate_ip_in_cidr",
                data: JSON.stringify(gatewayObj),
                showErrMsg:false,
                success: function(resultcheck) {
                  if (resultcheck == true) {
                    self.loading = true;
                    self.isDisabled = true;
                    self.$ajax({
                      type: "POST",
                      url: "api/neutron/v2.0/subnets",
                      data: JSON.stringify(reqdata),
                      // successMsg: "保存成功",
                      success: function(result) {
                        self.$notify({
                          message: Vue.t("network.createSuccess"),
                          type: "success"
                        });
                        self.loading = false;
                        self.isDisabled = false;
                        self.$emit("handleAddSubnetShow", {});
                      },
                      errFun() {
                        self.loading = false;
                        self.isDisabled = false;
                      },
                      errorKey: "NeutronError",
                      log:{
                        description:{
                          en:"Create Subnet:" + self.addResSpecForm.subnetname,
                          zh_cn:"创建子网:" + self.addResSpecForm.subnetname
                        },
                        target:Vue.logTarget.subnetwork
                      }
                    });
                    } else {
                      self.$notify({
                        message: Vue.t("network.networkNote12"),
                        type: "error"
                      });
                      self.isDisabled = false;
                      self.loading = false;
                    }
                  }
                });
              }
          } catch (res) {
            self.isDisabled = false;
            self.loading = false;
          }
        } else {
          return false;
        }
      });
    }
      });
    }
  }
}
</script>
