<template>
  <el-dialog  :title="$t('network.editSubnet')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="addResSpecForm" :model="addResSpecForm" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.subnetName')" class="is-required" prop="subnetname">
        <el-input class="col-10"  v-model="addResSpecForm.subnetname"></el-input>
      </el-form-item>
      <el-form-item label="CIDR" class="is-required" prop="netaddress">
        <span>{{addResSpecForm.netaddress}}</span>
      </el-form-item>
      <el-form-item :label="$t('network.enablegate')">
        <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="disableGateway" @change="getewayChange"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('network.gatewayip')" v-if="disableGateway" class="is-required" prop="gatewayip">
        <el-input class="col-10"  v-model="addResSpecForm.gatewayip"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.networkNote22')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-button type="text" style="padding-left:60px;" @click="showDetail()" href="advanceBtn"><span>{{advanceName}}</span></el-button>
      <div v-if="subnetdetailStatus">
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
        <el-col :span="6" style="padding-left:10px;">
        <el-form-item prop="endAddr">
          <el-input v-model="addResSpecForm.endAddr" :placeholder="$t('network.endaddress')"></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="3" style="padding-left:10px;">
        <el-button size="small" type="primary" @click="addNewPool">{{$t('lang.addTo')}}</el-button>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.networkNote33')}}</div>
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
    	<el-button type="primary" @click="editSubnetClick" :disabled="disabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name: 'EditSubnetwork',
  props: ["editSubid", "editSubmame", "editSubcidr", "editSubgateway", "editSubdhcpstatus", "editSubpool", "editSubdns", "editSubhost", "editipversion"],
  data() {
    return {
      dialogVisible: false,
      addResSpecForm: {
        subnetname: this.editSubmame,
        netaddress: "",
        gatewayip: "",
        startAddr: "",
        endAddr: "",
        dnsAddr: "",
        startHost: "",
        endHost: ""
      },
      loading: false,
      disabled: false,
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
      advanceName: Vue.t("network.advanceRight"),
      rules: {
        subnetname: [
          {type: 'requiredNet'},
          {type: 'maxSize', value: 40},
          {type: 'onlyLetterNumber_Chinese'}
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
    this.$parent.$parent.active = "network";
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
    // if (self.editipversion === 4) {
    //   if (self.disableGateway === false) {
    //     self.rules.gatewayip = [];
    //   } else {
    //     self.rules.gatewayip = [{type: 'ipv4'}];
    //   }
    // } else {
    //   if (self.disableGateway === false) {
    //     self.rules.gatewayip = [];
    //   } else {
    //     self.rules.gatewayip = [{type: 'required'}, {type: 'ipv6'}];
    //   }
    // }
  },
  methods: {
    initDialog() {
      var self = this;
      // 查询subnet begin
      try {
        self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/subnets/" + this.editSubid,
          data: {},
          success: function(res) {
            let editSubnet = res["subnet"];
            self.oldGatewayIp = editSubnet["gateway_ip"];
          },
          errorKey: "NeutronError"
        });
      } catch (res) {
            console.log("Failed");
      }
      // 查询subnet end
      self.dialogVisible = true;
      self.addResSpecForm.subnetname = this.editSubmame;
      self.addResSpecForm.netaddress = this.editSubcidr;
      if (this.editipversion === 4) {
        if (this.editSubgateway === "" || this.editSubgateway === null) {
          self.disableGateway = false;
          self.rules.gatewayip = [];
        } else {
          self.disableGateway = true;
          self.rules.gatewayip = [{type: 'requiredNet'}, {type: 'ipv4'}];
        }
        self.rules.startAddr = [{type: 'ipv4'}];
        self.rules.endAddr = [{type: 'ipv4'}];
        self.rules.dnsAddr = [{type: 'ipv4'}];
        self.rules.startHost = [{type: 'cidr'}];
        self.rules.endHost = [{type: 'ipv4'}];
      } else {
        if (this.editSubgateway === "" || this.editSubgateway === null) {
          self.disableGateway = false;
          self.rules.gatewayip = [];
        } else {
          self.disableGateway = true;
          self.rules.gatewayip = [{type: 'requiredNet'}, {type: 'ipv6'}];
        }
        self.rules.startAddr = [{type: 'ipv6'}];
        self.rules.endAddr = [{type: 'ipv6'}];
        self.rules.dnsAddr = [{type: 'ipv6'}];
        self.rules.startHost = [{type: 'cidripv6'}];
        self.rules.endHost = [{type: 'ipv6'}];
      }
      self.addResSpecForm.gatewayip = this.editSubgateway;
      self.activeDHCP = this.editSubdhcpstatus;
      self.addresspoll = this.editSubpool;
      self.dnsserver = this.editSubdns;
      self.hostrouter = this.editSubhost;
      if (self.addresspoll.length > 0) {
        for (let i = 0; i < self.addresspoll.length; i++) {
          let pool = self.addresspoll[i];
          self.addresspolltext.push(Vue.t('network.beginaddress')+":"+pool.start+','+Vue.t('network.endaddress')+':'+pool.end);
        }
      }
      if (self.hostrouter.length > 0) {
        for (let i = 0; i < self.hostrouter.length; i++) {
          let router = self.hostrouter[i];
          self.hostroutertext.push(Vue.t('network.targetCidr')+":"+router.destination+','+Vue.t('network.nextJump')+':'+router.nexthop);
        }
      }
    },
    getewayChange(value) {
      let self = this;
      if (self.editipversion === 4) {
        if (value === false) {
          self.rules.gatewayip = [];
        } else {
          self.addResSpecForm.gatewayip = "";
          self.rules.gatewayip = [
          {type: "requiredNet"},
          {type: 'ipv4'}];
        }
      } else {
        if (value === false) {
          self.rules.gatewayip = [];
        } else {
          self.addResSpecForm.gatewayip = "";
          self.rules.gatewayip = [{type: "requiredNet"}, {type: 'ipv6'}];
        }
      }
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
    handleClose(done) {
      this.$emit("handleEditCancleShow", {});
      done();
    },
    cancel() {
      this.$emit("handleEditCancleShow", {});
    },
    addNewPool() {
      let self = this;
      let startIP = self.addResSpecForm.startAddr;
      let endIP = self.addResSpecForm.endAddr;
      if (startIP=="") {
        self.$notify({
          message:  Vue.t('network.startAddressnotempty'),
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
      if (self.editipversion === 4) {
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
    handlePoolClose(tag) {
      let self = this;
      console.log("tag="+tag);
      let tagList = tag.split(",");
      if (self.editipversion === 4) {
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
      if (self.editipversion === 4) {
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
            if (self.editipversion === 4) {
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
    handleHostClose(tag) {
      let self = this;
      let tagarray = tag.split(",");
      if (self.editipversion === 4) {
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
    editSubnetClick() {
      let self = this;
      self.$refs.addResSpecForm.validate(async(valid) => {
        if (valid) {
          let netaddress = self.addResSpecForm.netaddress;
          let ipversion = self.editipversion;
          let gatewayip = self.addResSpecForm.gatewayip;
          let activeDHCP = self.activeDHCP;
          // 禁用网关，gateway_ip字段传null代表禁用网关
          let reqdata = {"subnet":{
              "name": self.addResSpecForm.subnetname,
              "enable_dhcp": activeDHCP,
              "dns_nameservers": self.dnsserver,
              "allocation_pools": self.addresspoll,
              "host_routes": self.hostrouter,
              "gateway_ip": null
            }
          };
          // 这里和创建子网不一样，如果页面不填ip，此处gatewayip=null，给后台发送""才行。
          // 不发送gateway_ip字段的话，底层会禁用网关
          if (self.disableGateway === true) {
            if (gatewayip === "" || gatewayip === null) {
              reqdata = {"subnet":{
                "name": self.addResSpecForm.subnetname,
                "enable_dhcp": activeDHCP,
                "dns_nameservers": self.dnsserver,
                "allocation_pools": self.addresspoll,
                "host_routes": self.hostrouter
                }
              }
            } else if (gatewayip === self.oldGatewayIp) {
              reqdata = {"subnet":{
                "name": self.addResSpecForm.subnetname,
                "enable_dhcp": activeDHCP,
                "dns_nameservers": self.dnsserver,
                "allocation_pools": self.addresspoll,
                "host_routes": self.hostrouter
                }
              }
            } else {
              reqdata = {"subnet":{
                "name": self.addResSpecForm.subnetname,
                "enable_dhcp": activeDHCP,
                "dns_nameservers": self.dnsserver,
                "allocation_pools": self.addresspoll,
                "host_routes": self.hostrouter,
                "gateway_ip": gatewayip
                }
              }
            }
          }
          try {
            //检验网关是否在CIDR内
            if (gatewayip=="" || gatewayip==null) {
            self.disabled = true;
            self.loading = true;
            let result = self.$ajax({
              type: "PUT",
              url: "api/neutron/v2.0/subnets/"+self.editSubid,
              data: JSON.stringify(reqdata),
              // successMsg: "保存成功",
              success: function(result) {
                self.$notify({
                  message: Vue.t("network.updateSuccess"),
                  type: "success"
                });
                self.loading = false;
                self.disabled = false;
                self.$emit("handleEditSubnetShow", {});
              },
              errFun() {
                self.loading = false;
                self.disabled = false;
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Before edit subnet name:" + self.editSubmame + ", After modify subnet name:" + self.addResSpecForm.subnetname,
                  zh_cn:"子网名称修改前" + self.editSubmame + "子网名称修改后:" + self.addResSpecForm.subnetname
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
                  self.disabled = true;
                  self.loading = true;
                  let result = self.$ajax({
                    type: "PUT",
                    url: "api/neutron/v2.0/subnets/"+self.editSubid,
                    data: JSON.stringify(reqdata),
                    // successMsg: "保存成功",
                    success: function(result) {
                      self.$notify({
                        message: Vue.t("network.updateSuccess"),
                        type: "success"
                      });
                      self.loading = false;
                      self.disabled = false;
                      self.$emit("handleEditSubnetShow", {});
                    },
                    errFun() {
                      self.loading = false;
                      self.disabled = false;
                    },
                    errorKey: "NeutronError",
                    log:{
                      description:{
                        en:"Before edit subnet name:" + self.editSubmame + ", After modify subnet name:" + self.addResSpecForm.subnetname,
                        zh_cn:"子网名称修改前:" + self.editSubmame + ",子网名称修改后:" + self.addResSpecForm.subnetname
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
          }
        } else {
          return false;
        }
      });
    }
  }
}
</script>
