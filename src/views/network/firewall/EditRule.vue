<template>
  <el-dialog :title="$t('network.editRule')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="editform" :model="editform" class="me-required-form" label-width="140px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-15"  v-model="editform.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.protocol')" class="is-required" prop="protocol">
        <el-select v-model="editform.protocol" @change="protocolChange">
          <el-option label="TCP" value="tcp"></el-option>
          <el-option label="UDP" value="udp"></el-option>
          <el-option label="ICMP" value="icmp"></el-option>
          <el-option :label="$t('network.anything')" value=""></el-option>
        </el-select>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.firewallNote1')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.movement')" class="is-required">
        <el-select v-model="editform.action">
          <el-option :label="$t('network.allow')" value="allow"></el-option>
          <el-option :label="$t('network.deny')" value="deny"></el-option>
          <el-option :label="$t('network.reject')" value="reject"></el-option>
        </el-select>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.firewallNote2')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.ipversion')">
        <el-select v-model="editform.ipversion" @change="ipversionChange">
          <el-option label="IPv4" value="4"></el-option>
          <el-option label="IPv6" value="6"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.sourceIPaddress')" prop="originIP">
        <el-input class="col-15"  v-model="editform.originIP"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.firewallNote3')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.targetIPaddress')" prop="targetIP">
        <el-input class="col-15"  v-model="editform.targetIP"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.firewallNote4')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.sourcePort')" prop="originPort" v-if="portshow">
        <el-input class="col-15"  v-model="editform.originPort"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.firewallNote5')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.targetPort')" prop="destinationPort" v-if="portshow">
        <el-input class="col-15"  v-model="editform.destinationPort"></el-input>
         <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.firewallNote6')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-15" type="textarea" v-model="editform.description"></el-input>
      </el-form-item>
      </el-col></el-row>
      <el-form-item :label="$t('network.active')">
        <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="editform.enabled"></el-switch>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="editConfirm" :disabled="isDiasbled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>  
</template>
<script type="text/javascript">
export default {
  name:"EditRule",
  props: ["editId", "editName", "editDesc", "editprotocol", "editsourceip", "editsourceport", "editdestip", "editdestport", "editaction", "editshared", "editenabled", "editipversion"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      isDiasbled:false,
      editform: {
        name: "",
        description: "",
        protocol: "",
        action: "",
        originIP: "",
        targetIP: "",
        originPort: "",
        destinationPort: "",
        ipversion: "4",
        shared: false,
        enabled: true
      },
      portshow: true,
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'requiredNet'},
          {type: 'maxSize', value: 40}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ],
        originPort: [
          {type: 'validatePort'}
        ],
        destinationPort: [
          {type: 'validatePort'}
        ],
        originIP:[
          {type: 'ipv4orcidr'}
        ],
        targetIP:[
          {type: 'ipv4orcidr'}
        ]
      }
    }
  },
  mounted() {
    let self = this;
    self.$parent.$parent.active = "firewallRule";
    self.initDialog();
    self.editform.name = this.editName;
    self.editform.description = this.editDesc;
    self.editform.protocol = this.editprotocol;
    self.protocolChange(self.editform.protocol);
    self.editform.action = this.editaction;
    self.editform.originIP = this.editsourceip;
    self.editform.originPort = this.editsourceport;
    self.editform.targetIP = this.editdestip;
    self.editform.destinationPort = this.editdestport;
    self.editform.enabled = this.editenabled;
    self.editform.ipversion = this.editipversion +"";
    if (this.editipversion === 4) {
      self.rules.originIP = [{type: 'ipv4orcidr'}];
      self.rules.targetIP = [{type: 'ipv4orcidr'}];
    } else {
      self.rules.originIP = [{type: 'ipv6orcidr'}];
      self.rules.targetIP = [{type: 'ipv6orcidr'}];
    }
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleClose(done) {
      this.$emit("handleEditCancleShow", {});
      done();
    },
    cancel() {
      this.$emit("handleEditCancleShow", {});
    },
    protocolChange(value) {
      if (value == "icmp" || value == "") {
        this.portshow = false;
      } else {
        this.portshow = true;
      }
    },
    ipversionChange(ipv) {
      if (ipv === '4') {
        this.rules.originIP = [{type: 'ipv4orcidr'}];
        this.rules.targetIP = [{type: 'ipv4orcidr'}];
      } else {
        this.rules.originIP = [{type: 'ipv6orcidr'}];
        this.rules.targetIP = [{type: 'ipv6orcidr'}];
      }
      this.$refs.editform.validate(async(valid) => {
        if (valid) {
          return true;
        } else {
          return false;
        }
      });
    },
    editConfirm() {
      let self = this;
      let reqdata = {};
      let firewallrule = {};
      firewallrule["name"] = self.editform.name;
      firewallrule["description"] = self.editform.description;
      firewallrule["action"] = self.editform.action;
      firewallrule["shared"] = self.editform.editshared;
      firewallrule["ip_version"] = self.editform.ipversion;
      firewallrule['enabled'] = self.editform.enabled;
      if (self.editform.protocol == "icmp") {
         firewallrule['protocol'] = self.editform.protocol;
         firewallrule['destination_port'] = null;
         firewallrule['source_port'] = null;
      } else if (self.editform.protocol == "tcp" || self.editform.protocol == "udp") {
        firewallrule['protocol'] = self.editform.protocol;
        if (self.editform.originPort != "" && self.editform.originPort != null) {
          firewallrule['source_port'] = self.editform.originPort;
        } else {
          firewallrule['source_port'] = null;
        }
        if (self.editform.destinationPort != "" && self.editform.destinationPort != null) {
          firewallrule['destination_port'] = self.editform.destinationPort;
        } else {
          firewallrule['destination_port'] = null;
        }
      } else {
        firewallrule['protocol'] = null;
        firewallrule['destination_port'] = null;
        firewallrule['source_port'] = null;
      }
      if (self.editform.originIP != "" && self.editform.originIP != null) {
        firewallrule['source_ip_address'] = self.editform.originIP;
      } else {
        firewallrule['source_ip_address'] = null;
      }
      if (self.editform.targetIP != "" && self.editform.targetIP != null) {
        firewallrule['destination_ip_address'] = self.editform.targetIP;
      } else {
        firewallrule['destination_ip_address'] = null;
      }
      reqdata["firewall_rule"] = firewallrule;
      try {
      self.$refs.editform.validate(async(valid) => {
        if (valid) {
          self.loading = true;
          self.isDiasbled = true;
          let result = await self.$ajax({
            type: 'PUT',
            url: "api/neutron/v2.0/fw/firewall_rules/"+self.editId,
            data: JSON.stringify(reqdata),
            successMsg: Vue.t('network.saveSuccess'),
            success: function(result) {
              self.loading = false;
              self.isDiasbled = false;
              self.$emit("handleEditShow", {});
            },
            errorKey: "NeutronError",
            errFun(xhr, status) {
              if (xhr.status == "404") {
                self.$emit("handleEditShow", {});
              }
              self.loading = false;
              self.isDiasbled = false;
            },
            log:{
              description:{
                en:"Before edit firewall rule name:" + self.editName + "After:" + self.editform.name,
                zh_cn:"防火墙规则修改前:" + self.editName + "修改后：" + self.editform.name
              },
              target:Vue.logTarget.firewallRule
            }
          });
          return true;
        } else {
          return false;
        }
      });
      } catch (res) {
      console.log("error");
      }
    }
  }
}
</script>