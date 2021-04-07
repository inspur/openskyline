<template>
  <el-dialog  :title="$t('network.addRule')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.rule')" class="is-required">
        <el-select v-model="modelrules" @change="ruleChange" filterable>
          <el-option :label="$t('network.tcprule')" value="0"></el-option>
          <el-option :label="$t('network.udprule')" value="1"></el-option>
          <el-option :label="$t('network.icmprule')" value="2"></el-option>
          <el-option :label="$t('network.otherprotocol')" value="3"></el-option>
          <el-option :label="$t('network.allicmp')" value="4"></el-option>
          <el-option :label="$t('network.alltcp')" value="5"></el-option>
          <el-option :label="$t('network.alludp')" value="6"></el-option>
          <el-option label="DNS" value="53"></el-option>
          <el-option label="HTTP" value="80"></el-option>
          <el-option label="HTTPS" value="443"></el-option>
          <el-option label="IMAP" value="143"></el-option>
          <el-option label="IMAPS" value="993"></el-option>
          <el-option label="LDAP" value="389"></el-option>
          <el-option label="MS SQL" value="1433"></el-option>
          <el-option label="MYSQL" value="3306"></el-option>
          <el-option label="POP3" value="110"></el-option>
          <el-option label="POP3S" value="995"></el-option>
          <el-option label="RDP" value="3389"></el-option>
          <el-option label="SMTP" value="25"></el-option>
          <el-option label="SMTPS" value="465"></el-option>
          <el-option label="SSH" value="22"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.direction')" v-if="direct">
        <el-select v-model="direction" >
          <el-option :label="$t('network.entrance')" value="0"></el-option>
          <el-option :label="$t('network.chukou')" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.type')" class="is-required" v-if="icmp_type_if" prop="icmptype">
        <el-input class="col-8" v-model="form.icmp_type" ></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.safeteamNote2')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div style="margin-top:-5px;"><span id="icmp_type_span" class="sgrClass"></span></div>
      </el-form-item>
      <el-form-item :label="$t('network.coding')" class="is-required" v-if="icmp_code_if" prop="icmp_code">
        <el-input class="col-8" v-model="form.icmp_code"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.safeteamNote3')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div style="margin-top:-5px;"><span id="icmp_code_span" class="sgrClass"></span></div>
      </el-form-item>
      <el-form-item :label="$t('network.openport')" v-if="open_port">
        <el-select v-model="openport" @change="handlePortChange">
          <el-option :label="$t('base.all') + $t('network.port')" value=""></el-option>
          <el-option :label="$t('network.port')" value="0"></el-option>
          <el-option :label="$t('network.portRange2')" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.port')" class="is-required" v-if="port1" prop="port">
        <el-input class="col-8" v-model="form.port" @change="removePortErrMessage"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.safeteamNote4')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div style="margin-top:-5px;"><span id="port_span" class="sgrClass"></span></div>
      </el-form-item>
      <el-form-item :label="$t('network.startport')" class="is-required" v-if="port2" prop="port_range_min">
        <el-input class="col-8" v-model="form.port_range_min"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.safeteamNote4')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div style="margin-top:-5px;"><span id="port_range_min_span" class="sgrClass"></span></div>
      </el-form-item>
      <el-form-item :label="$t('network.endport')" class="is-required" v-if="port2" prop="port_range_max">
        <el-input class="col-8" v-model="form.port_range_max"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.safeteamNote4')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div style="margin-top:-5px;"><span id="port_range_max_span" class="sgrClass"></span></div>
      </el-form-item>
      <el-form-item :label="$t('network.ipprotocol')" v-if="ip_protocol_if">
        <el-input class="col-8" v-model="form.ip_protocol"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.safeteamNote5')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div style="margin-bottom:5px;"><span id="ip_protocol_span" class="sgrClass"></span></div>
      </el-form-item>
      <el-form-item :label="$t('network.faraway')" class="is-required">
        <el-select v-model="faraway" @change="handleFarawayChange">
          <el-option label="CIDR" value="0"></el-option>
          <el-option :label="$t('network.securityTeam')" value="1"></el-option>
        </el-select>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.safeteamNote6')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="CIDR" class="is-required" v-if="far1">
        <el-input v-model="cidr" class="col-8" @change="removeErrMessage"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.safeteamNote7')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div style="margin-bottom:5px;"><span id="cidr_span" class="sgrClass"></span></div>
      </el-form-item>
      <el-form-item :label="$t('network.securityTeam')" v-if="far2" class="is-required">
        <el-select class="col-8" v-model="security_groups_id" filterable>
          <el-option v-for="item in security_groups"
          :key="item.id"
          :label="item.name"
          :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.ethertype')" v-if="far2">
        <el-select v-model="ipversion">
          <el-option label="IPv4" value="0"></el-option>
          <el-option label="IPv6" value="1"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="confirm" :disabled="isDiasbled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<style type="text/css">
 .sgrClass {
  font-size: 12px;
  color:#ff0000;
  position: absolute;
}
</style>
<script type="text/javascript">
import uuid from 'uuid';
export default {
  name: 'AddIPAddress',
  props: ["editName", "editId", "editprojectId"],
  data() {
    return {
      dialogVisible: false,
      form: {
        port: null,
        port_range_min: null,
        port_range_max: null,
        ip_protocol: null,
        icmptype: "",
        icmp_code: null
      },
      modelrules: "0",
      direction: "0",
      openport: "0",
      faraway: "0",
      port1: true,
      port2: false,
      far1: true,
      far2: false,
      safeteam: "0",
      ipversion: "0",
      direct: true,
      open_port: true,
      icmp_type_if: false,
      icmp_code_if: false,
      ip_protocol_if: false,
      isDiasbled: false,
      loading: false,
      security_groups: [],
      security_groups_id: "",
      cidr:"0.0.0.0/0",
      rules: {
      },
      ruleMap: ""
    }
  },
  mounted() {
    this.initDialog();
    this.ruleMap = new Map();
    this.ruleMap.set("0", Vue.t('network.tcprule'));
    this.ruleMap.set("1", Vue.t('network.udprule'));
    this.ruleMap.set("2", Vue.t('network.icmprule'));
    this.ruleMap.set("3", Vue.t('network.otherprotocol'));
    this.ruleMap.set("4", Vue.t('network.allicmp'));
    this.ruleMap.set("5", Vue.t('network.alltcp'));
    this.ruleMap.set("6", Vue.t('network.alludp'));
    this.ruleMap.set("53", 'DNS')
    this.ruleMap.set("80", 'HTTP')
    this.ruleMap.set("443", 'HTTPS')
    this.ruleMap.set("143", 'IMAP')
    this.ruleMap.set("993", 'IMAPS')
    this.ruleMap.set("389", 'LDAP');
    this.ruleMap.set("1433", 'MS SQL')
    this.ruleMap.set("3306", 'MYSQL')
    this.ruleMap.set("110", 'POP3');
    this.ruleMap.set("995", 'POP3S');
    this.ruleMap.set("3389", 'RDP');
    this.ruleMap.set("25", 'SMTP');
    this.ruleMap.set("465", 'SMTPS');
    this.ruleMap.set("22", 'SSH');
  },
  methods: {
    removeErrMessage () {
      $('#cidr_span').text("");
    },
    removePortErrMessage() {
      $('#port_span').text("");
    },
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleAddShow", {});
    },
    handlePortChange(val) {
      if (val === "1") {
        this.port1 = false;
        this.port2 = true;
        // this.rules.port = [];
        // this.rules.port_range_min = [{type: 'required'},
        //   {type: 'integer'},
        //   {type: 'min', value: 0},
        //   {type: 'max', value: 65535}];
        // this.rules.port_range_max = [{type: 'required'},
        //   {type: 'integer'},
        //   {type: 'min', value: 0},
        //   {type: 'max', value: 65535}];
      } else if (val === "0") {
        this.port1 = true;
        this.port2 = false;
        // this.rules.port = [{type: 'required'},
        //   {type: 'integer'},
        //   {type: 'min', value: 0},
        //   {type: 'max', value: 65535}];
        // this.rules.port_range_min = [];
        // this.rules.port_range_max = [];
      } else {
        this.port1 = false;
        this.port2 = false;
      }
    },
    handleFarawayChange(val) {
      if (val === "0") {
        this.far1 = true;
        this.far2 = false;
      } else {
        this.far2 = true;
        this.far1 = false;
      }
      try {
        this.getGroupList();
      } catch (res) {
        console.log("Failed");
      }
    },
    async getGroupList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/security-groups"
        });
        self.security_groups = result["security_groups"];
        this.security_groups_id = self.security_groups[0].id;
      } catch (res) {
      }
    },
    ruleChange(arg) {
      this.direct=false;
      this.open_port=false;
      this.port1=false;
      this.port2=false;
      this.icmp_type_if=false;
      this.icmp_code_if=false;
      this.ip_protocol_if=false;
      this.clearAllSpan();
        switch (arg) {
          case '0':
          case '1':
            this.direct=true;
            this.open_port=true;
            this.openport= '0';
            this.port1=true;
            break;
          case '2':
            this.direct=true;
            this.icmp_type_if=true;
            this.icmp_code_if=true;
            break;
          case '3':
            this.direct=true;
            this.ip_protocol_if=true;
            break;
          case '4':
          case '5':
          case '6':
            this.direct=true;
            break;
        }
    },
    confirm() {
      let self = this;
      let reqdata = {"security_group_rule":{
        //"remote_group_id": null,
        "direction": "ingress",
        "protocol": self.getProtocol(self.modelrules),
        "tenant_id": self.editprojectId,
        //"ethertype": null,
        //"port_range_min": 1,
        //"port_range_max": 65535,
        "security_group_id": self.editId
        //"remote_ip_prefix":"0.0.0.0/0"
        //"description":""
        }
      };
      let openport = this.openport;
      let port1 = this.port1;
      let port2 = this.port2;
      let remote = this.faraway;
      let protocol = this.form.ip_protocol;
      let cidr = this.cidr;
      let securityGroup = this.security_groups_id;
      let ipVer = this.ipversion=="0"?"IPv4":"IPv6";
      let remoteGroupId = this.security_groups_id;
      let pass = true;
      this.clearAllSpan();
      switch (this.modelrules) {
          case '0':
          case '1':
            reqdata.security_group_rule.direction = this.direction==0?"ingress":"egress";
            switch (openport) {
                case '0' :
                  if (!this.is_valid_port($.trim(this.form.port), 'port')) {
                    pass = false;
                  }
                  reqdata.security_group_rule.port_range_min = this.form.port;
                  reqdata.security_group_rule.port_range_max = this.form.port;
                  break;
                case '1' :
                  if (!this.is_valid_port($.trim(this.form.port_range_min), 'port_range_min')) {
                    pass = false;
                  }
                  if (!this.is_valid_port($.trim(this.form.port_range_max), 'port_range_max')) {
                    pass = false;
                  }
                  reqdata.security_group_rule.port_range_min = this.form.port_range_min;
                  reqdata.security_group_rule.port_range_max = this.form.port_range_max;
                  break;
                case '' :
                  reqdata.security_group_rule.port_range_min = null;
                  reqdata.security_group_rule.port_range_max = null;
                  break;
              }
            break;
          case '2':
            if (!this.is_valid_icmpType($.trim(this.form.icmp_type), Vue.t('network.type'), "icmp_type")) {
                  pass = false;
              }
            if (!this.is_valid_icmpType($.trim(this.form.icmp_code), Vue.t('network.coding'), "icmp_code")) {
                    pass = false;
              }
            if ($.trim(this.form.icmp_type) == '-1' && $.trim(this.form.icmp_code) !='-1') {
                $('#icmp_type_span').text(Vue.t('network.seferulenote1'));
                pass = false;
              }
            let icmpTypeNum= parseInt($.trim(this.form.icmp_type));
            if (icmpTypeNum>=0) {
              reqdata.security_group_rule.port_range_min = this.form.icmp_type;
            }
            let icmpCodeNum= parseInt($.trim(this.form.icmp_code));
            if (icmpCodeNum>=0) {
              reqdata.security_group_rule.port_range_max = this.form.icmp_code;
            }
            reqdata.security_group_rule.direction = this.direction==0?"ingress":"egress";
            break;
          case '3':
            console.log("portocol:"+$.trim(protocol))
            if ($.trim(protocol)!= "") {
              if (!this.is_valid_ipType($.trim(protocol), 'ip_protocol')) {
                    pass = false;
              }
            }
            reqdata.security_group_rule.direction = this.direction==0?"ingress":"egress";
            reqdata.security_group_rule.protocol = protocol;
            break;
          case '4':
          case '5':
          case '6':
            reqdata.security_group_rule.direction = this.direction==0?"ingress":"egress";
            break;
          default:
            reqdata.security_group_rule.port_range_min = this.modelrules;
            reqdata.security_group_rule.port_range_max = this.modelrules;
            break;
        }
        switch (remote) {
        case '0' :
          if (this.is_empty_cidr($.trim(this.cidr), 'cidr')) {
            pass = false;
          } else {
              ipVer = 'IPv4';
              if (this.is_valid_cidr6($.trim(this.cidr))) {
                    ipVer = 'IPv6';
              }
              if ($.trim(this.cidr) != '0.0.0.0/0') {
                  if (ipVer!='IPv6' && !this.is_valid_cidr4($.trim(this.cidr))) {
                    $('#cidr_span').text(Vue.t('network.formaterror'));
                    pass = false;
                  }
              }
          }
          reqdata.security_group_rule.remote_ip_prefix = this.cidr;
          reqdata.security_group_rule.ethertype = ipVer;
          break;
        case '1' :
          reqdata.security_group_rule.remote_group_id = securityGroup;
          reqdata.security_group_rule.ethertype = ipVer;
          break;
      }
      if (pass == false) {
        return;
      }
        let traceId = 'req-'+uuid.v1();
        try {
          // console.log("request data === "+JSON.stringify(reqdata));
          self.loading = true;
          self.isDiasbled = true;
          let result = self.$ajax({
            type: "POST",
            url: "api/neutron/v2.0/security-group-rules",
            data: JSON.stringify(reqdata),
            headers: {
              'X-Openstack-Request-Id': traceId
            },
            success: function(ret) {
              self.$message.success(Vue.t('network.saveSuccess'));
              self.loading = false;
              self.isDiasbled = false;
              self.cancel();
              let sgrid=ret["security_group_rule"].id;
              self.$recordLog({
                target:Vue.logTarget.securityGroup,
                level:{
                  en:"info",
                  zh_cn:"信息"
                },
                description:{
                  en:"Create Security Group Rule:"+sgrid+ "success",
                  zh_cn:`安全组: ${self.editName}添加规则:${self.ruleMap.get(self.modelrules)}`
                },
                trace_id: traceId
              });
            },
            error: function(ret) {
              self.loading = false;
              self.isDiasbled = false;
              let err = JSON.parse(ret.responseText);
              self.cancel();
              self.$recordLog({
                target:Vue.logTarget.securityGroup,
                level:{
                  en:"error",
                  zh_cn:"错误"
                },
                description:{
                  en:"Create Security Group Rule failed."+err.NeutronError.message,
                  zh_cn:"创建安全组规则失败。"+err.NeutronError.message
                },
                trace_id: traceId
              });
            },
            errorKey: "NeutronError"
          });
        } catch (res) {
          console.log("exception==="+res);
          self.$recordLog({
            target:Vue.logTarget.securityGroup,
            level:{
              en:"error",
              zh_cn:"错误"
            },
            description:{
              en:"Create Security Group Rule failed",
              zh_cn:"创建安全组规则失败"
            },
            trace_id: traceId
          });
        }
    },
    getProtocol(arg) {
      switch (arg) {
          case '0':
            return 'TCP';
          case '1':
            return 'UDP';
          case '2':
            return 'ICMP';
          case '3':
            return '';
          case '4':
            return 'ICMP';
          case '5':
            return 'TCP';
          case '6':
            return 'UDP';
          default:
            return 'TCP';
        }
    },
    is_valid_port(port, component) {
      /**
      *   是否整数，并且 1~65535之间
      */
      if (port.length == 0) {
        $('#'+component+'_span').text(Vue.t('network.cannotempty'));
        return false;
      }
      let numberPat = /^[0-9]{1,5}$/g;
      let regNum=new RegExp(numberPat);
      if (!regNum.test(port)) {
        $('#'+component+'_span').text(Vue.t('network.portValidtoolong'));
        return false;
      }
      let portNum= parseInt(port);
        if (portNum<0||portNum>65535) {
        $('#'+component+'_span').text(Vue.t('network.portValidrange'));
        return false;
      }
      return true;
    },
    is_valid_icmpType(arg, name, component) {
      /**
      *   是否整数，并且 -1,255之间
      */
      if (arg==='' || arg===null) {
        $('#'+component+'_span').text(name+Vue.t('network.cannotkong'));
        return false;
      }
      let numberPat = /^[+-]{0,1}[0-9]{1,3}$/g;
      let regNum=new RegExp(numberPat);
      if (!regNum.test(arg)) {
      $('#'+component+'_span').text(name+Vue.t('network.portValidtoolong'));
        return false;
      }
      let portNum= parseInt(arg);
        if (portNum<-1||portNum>255) {
        $('#'+component+'_span').text(name+Vue.t('network.addruleNote1'));
        return false;
      }
      return true;
    },
    is_valid_ipType(arg, component) {
      /**
      *   是否整数，并且 0~255之间
      */
      if (arg==='' || arg===null) {
        $('#'+component+'_span').text(Vue.t('network.cannotkong'));
        return false;
      }
      let numberPat = /^[0-9]{1,3}$/g;
      let regNum=new RegExp(numberPat);
      if (!regNum.test(arg)) {
        $('#'+component+'_span').text(Vue.t('network.portValidtoolong'));
        return false;
      }
      let portNum= parseInt(arg);
        if (portNum<0||portNum>255) {
        $('#'+component+'_span').text(Vue.t('network.addruleNote2'));
        return false;
      }
      return true;
    },
    is_empty_cidr(arg, component) {
      // console.log("===="+arg+"@");
      if (arg==='' || arg===null) {
        $('#'+component+'_span').text(Vue.t('network.cannotkong'));
        return true;
      }
      return false;
    },
    is_valid_cidr4(arg) {
      let cidr4 = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
      if (cidr4.test(arg)) {
        return true;
      }
      return false;
    },
    is_valid_cidr6(arg) {
      if (arg === "::/0") return true;
      if (arg === "0::0/0") return true;
      let reg = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
      //let reg = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
      let fields = arg.split("/");
      if (fields.length === 2) {
        let subNet = fields[1];
        let ipv6 = fields[0];
        if (reg.test(ipv6) && Number(subNet)>=1 && Number(subNet)<=128 ) {
          return true;
        }
        return false;
      }
    },
    clearAllSpan() {
      $('span.sgrClass').text('');
    }
  }
}
</script>
