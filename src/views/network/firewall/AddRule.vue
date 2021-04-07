<template>
<div>
  <el-dialog :title="$t('network.createRule')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="submitForm" :model="form" class="me-required-form" label-width="140px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-12"  v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.project')" prop="projectName" class="is-required" v-if="roleType == '0'">
        <!--<el-select v-model="form.projectId" filterable clearable>
          <el-option v-for="item in query_porject"
          :key="item.id"
          :label="item.name"
          :value="item.id"></el-option>
        </el-select>-->
        <el-input auto-complete="off" class="col-12" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="form.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.protocol')" class="is-required">
        <el-select v-model="form.protocol" @change="protocolChange">
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
        <el-select v-model="form.action">
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
        <el-select v-model="form.ipversion" @change="ipversionChange">
          <el-option label="IPv4" value="4"></el-option>
          <el-option label="IPv6" value="6"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.sourceIPaddress')" prop="originIP">
        <el-input class="col-12"  v-model="form.originIP"></el-input>
        <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.firewallNote3')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.targetIPaddress')" prop="targetIP">
        <el-input class="col-12"  v-model="form.targetIP"></el-input>
        <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.firewallNote4')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.sourcePort')" prop="originPort" v-if="portshow">
        <el-input class="col-12"  v-model="form.originPort"></el-input>
        <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.firewallNote5')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.targetPort')" prop="destinationPort" v-if="portshow">
        <el-input class="col-12"  v-model="form.destinationPort"></el-input>
        <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.firewallNote6')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" class="col-12"  v-model="form.description"></el-input>
      </el-form-item>
      </el-col></el-row>
      <el-form-item :label="$t('network.active')">
        <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="form.actived"></el-switch>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="addRuleClick" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
  <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script type="text/javascript">
export default {
  name:"AddFirewall",
  data() {
    return {
      dialogVisible: false,
      roleType: Vue.roleType + "",
      selProjectFlg:false,
      loading:false,
      isDisabled:false,
      close: "",
      form: {
        name: "",
        description: "",
        projectId: "",
        projectName:"",
        protocol: "tcp",
        action: "allow",
        strategy: "",
        originIP: '',
        targetIP: '',
        originPort: '',
        destinationPort: '',
        ipversion: "4",
        shared:false,
        actived:true
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
        projectName: [
          {type: 'requiredNet'}
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
      },
      query_porject: []
    }
  },
  updated() {
    let self = this;
    if (self.form.ipversion === "4") {
      self.rules.originIP = [{type: 'ipv4orcidr'}];
      self.rules.targetIP = [{type: 'ipv4orcidr'}];
    } else {
      self.rules.originIP = [{type: 'ipv6orcidr'}];
      self.rules.targetIP = [{type: 'ipv6orcidr'}];
    }
  },
  mounted() {
    let self = this;
    self.$parent.$parent.active = "firewallRule";
    let roleType = Vue.roleType + "";
    if (roleType == "0") {
      self.getProjectList();
    } else {
      self.form.projectId = Vue.cookie.get('pid');
    }
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.form.projectId = id;
      this.form.projectName = name;
      this.close = 'close';
    },
    onIconClick() {
      this.form.projectId = '';
      this.form.projectName = '';
      this.close = '';
    },
    async getProjectList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default"
        });
        self.query_porject = result["projects"];
      } catch (res) {
      }
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
      this.$refs.submitForm.validate(async(valid) => {
        if (valid) {
          return true;
        } else {
          return false;
        }
      });
    },
    addRuleClick() {
      let self = this;
      let fixips = [];
      this.$refs.submitForm.validate(async(valid) => {
        if (valid) {
          self.loading = true;
          self.isDisabled = true;
          let reqdata = {"firewall_rule":{
            "name": self.form.name,
            "project_id": self.form.projectId,
            "description": self.form.description,
            "action": self.form.action,
            "ip_version": self.form.ipversion,
            "shared": false,
            "enabled": self.form.actived
            }
          };
          if (self.form.protocol == "icmp") {
            reqdata['firewall_rule']['protocol'] = self.form.protocol;
          } else if (self.form.protocol == "tcp" || self.form.protocol == "udp") {
            reqdata['firewall_rule']['protocol'] = self.form.protocol;
            if (self.form.originPort != "") {
              reqdata['firewall_rule']['source_port'] = self.form.originPort;
            }
            if (self.form.destinationPort != "") {
              reqdata['firewall_rule']['destination_port'] = self.form.destinationPort;
            }
          }
          if (self.form.originIP != "") {
            reqdata['firewall_rule']['source_ip_address'] = self.form.originIP;
          }
          if (self.form.targetIP != "") {
            reqdata['firewall_rule']['destination_ip_address'] = self.form.targetIP;
          }
          try {
            let result = self.$ajax({
              type: "POST",
              url: "api/neutron/v2.0/fw/firewall_rules",
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$message.success(Vue.t('network.saveSuccess'));
                self.cancel();
              },
              complete: function(XMLHttpRequest, textStatus) {
                self.loading = false;
                self.isDisabled = false;
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Create Firewall Rule:" + self.form.name,
                  zh_cn:"创建防火墙规则:" + self.form.name
                },
                target:Vue.logTarget.firewallRule
              }
            });
          } catch (res) {
            console.log("Failed");
          }
          return true;
         } else {
           return false;
         }
      });
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleAddShow", {});
    }
  }
}
</script>