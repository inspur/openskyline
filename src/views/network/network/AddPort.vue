<template>
  <el-dialog  :title="$t('network.createPort')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="portForm" :model="portForm" class="me-required-form" label-width="140px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-15" v-model="portForm.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.iporport')">
        <el-select v-model="setipsubnet" @change="setipsubnetChange" class="col-15">
          <el-option :label="$t('network.unpointe')" value="1"></el-option>
          <el-option :label="$t('network.subnet')" value="2"></el-option>
          <el-option :label="$t('network.fixedipaddress')" value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.subnet')" class="is-required" v-show="showsubnet" prop="subnet">
        <el-select v-model="portForm.subnet" class="col-15">
          <el-option v-for="item in subnetOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.fixedipaddress')" class="is-required" v-show="showip" prop="fixedip">
        <el-input class="col-15" v-model="portForm.fixedip"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.manageStatus')">
        <el-switch :width="75" on-text="UP" off-text="DOWN" v-model="portForm.managestatus"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('network.portSafe')">
        <el-switch :width="75" :on-text="$t('base.open')" :off-text="$t('base.close')" v-model="portForm.portSafe"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('network.securityTeam')" v-show="portForm.portSafe">
        <el-select v-model="portForm.securityGroups" class="col-15" multiple>
          <el-option v-for="item in securityGroupOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-button v-show="roleType == '0'" type="text" style="padding-left:60px;" @click="showDetail()" href="advanceBtn"><span>{{advanceName}}</span></el-button>
      <div v-show="portForm.advance">
      <el-form-item :label="$t('network.bindVnic')">
        <el-select v-model="portForm.vnictype" >
          <el-option :label="$t('network.normal')" value="normal"></el-option>
          <el-option :label="$t('network.streght')" value="direct"></el-option>
          <el-option label="MacVTap" value="macvtap"></el-option>
        </el-select>
        <el-popover trigger="hover" placement="top">
          <i class="el-icon-fa-question-circle" slot="reference"></i>
          <div>
            <p>{{$t('network.vnicNormal')}}</p>
            <p>{{$t('network.vnicStright')}}</p>
            <p>{{$t('network.vnicMacVTap')}}</p>
          </div>
        </el-popover>
      </el-form-item>
      <el-form-item v-if="portForm.vnictype === 'direct'" :label="$t('network.switchdev')" prop="switchdev">
        <el-switch :width="75" :on-text="$t('base.open')" :off-text="$t('base.close')" v-model="portForm.switchdev" />
      </el-form-item>
      <el-form-item :label="$t('network.macAddress')" prop="macAddress">
        <el-input class="col-15" v-model="portForm.macAddress"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.macNote1')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="addPortClick" :disabled="disabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name: 'EditPort',
  props: ["networkId"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      portForm: {
        name: "",
        managestatus: true,
        deviceId: "",
        deviceOwner: "",
        host: "",
        subnet: "",
        fixedip: "",
        vnictype: "normal",
        switchdev: false,
        macAddress: "",
        advance: false,
        portSafe:true,
        securityGroups:[]
      },
      roleType: Vue.roleType + "",
      subnetOption: [],
      securityGroupOptions:[],
      setipsubnet: "1",
      advanceName: Vue.t('network.advanceRight'),
      managestatus: true,
      showsubnet: false,
      showip: false,
      disabled: false,
      rules: {
        name: [
          {type: "requiredNet"},
          {type: 'onlyLetter_NumberChinese'},
          {type: 'forbiddenSpace'},
          {type: 'maxSize', value: 40}
        ],
        fixedip: [
          {type: 'ipv4oripv6'}
        ],
        // deviceId: [
        //   {type: 'onlyLetterMinusNumber'},
        //   {type: 'maxSize', value: 100}
        // ],
        // deviceOwner: [
        //   {type: 'maxSize', value: 100}
        // ],
        // host: [
        //   {type: 'maxSize', value: 100}
        // ],
        macAddress: [
          {type: 'mac'}
        ]
      }
    }
  },
  mounted() {
    let me = this;
    Promise.all([this.initDialog(), this.getSubnetList()]).then(function(result) {
      me.getSecurityGroupList();
    });
  },
  methods: {
    async initDialog() {
      this.dialogVisible = true;
      let self = this;
      let roleType = Vue.roleType + "";
      if (roleType!= "0") {
        self.portForm.advance = true;
      }
      await self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/networks/"+this.networkId,
        success: function(result) {
          let networkInfo = result['network'];
          self.projectid = networkInfo.project_id;
        }
      });
    },
    handleClose(done) {
      this.$emit("handelCancelShow", {});
    },
    cancel() {
      this.$emit("handelCancelShow", {});
    },
    showDetail() {
      if (this.portForm.advance == false) {
        this.portForm.advance = true;
        this.advanceName = Vue.t('network.advanceLeft');
      } else {
        this.portForm.advance = false;
        this.advanceName = Vue.t('network.advanceRight');
      }
    },
    setipsubnetChange(val) {
      if (val === "2") {
        this.showsubnet = true;
        this.showip = false;
        this.rules.subnet = [{type: 'requiredNet'}];
        this.rules.fixedip = [];
      } else if (val === "3") {
        this.showsubnet = false;
        this.showip = true;
        this.rules.subnet = [];
        this.rules.fixedip = [{type: 'requiredNet'}, {type: 'ipv4oripv6'}];
      } else {
        this.showsubnet = false;
        this.showip = false;
        this.rules.subnet = [];
        this.rules.fixedip = [];
      }
    },
    getSecurityGroupList() {
      let self = this;
      self.portForm.securityGroups = [];
      let result = self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/security-groups?project_id=" + self.projectid,
        success: function(result) {
          let sublist = result['security_groups'];
          self.securityGroupOptions = sublist;
          for (let s=0; s<sublist.length; s++) {
            if (sublist[s].name == "default") {
              self.portForm.securityGroups.push(sublist[s].id);
              break;
            }
          }
        }
      });
    },
    async getSubnetList() {
      let self = this;
      let result = self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/subnets?network_id="+self.networkId,
        success: function(result) {
          let sublist = [];
          sublist = result['subnets'];
          for (let i = 0; i < sublist.length; i++) {
            let subname = sublist[i];
            subname["name"] = subname["cidr"]+"("+subname["name"] +")";
          }
          self.subnetOption = sublist;
        }
      });
    },
    addPortClick() {
      let self = this;
      let fixips = [];
      if (self.setipsubnet === "2") {
        fixips.push({"subnet_id":self.portForm.subnet});
      } else if (self.setipsubnet === "3") {
        fixips.push({"ip_address":self.portForm.fixedip});
      } else {
        fixips = []
      }
      this.$refs.portForm.validate(async(valid) => {
        if (valid) {
          let reqdata = {"port":{
            "admin_state_up": self.portForm.managestatus,
            "name": self.portForm.name,
            "network_id": self.networkId,
            // "binding:host_id": self.portForm.host,
            "binding:vnic_type": self.portForm.vnictype,
            // "device_id": self.portForm.deviceId,
            // "device_owner": self.portForm.deviceOwner,
            // "fixed_ips": fixips,
            "port_security_enabled":self.portForm.portSafe,
            "project_id": self.projectid
            }
          };
          if (self.roleType == "0") {
            reqdata = {"port":{
              "admin_state_up": self.portForm.managestatus,
              "name": self.portForm.name,
              "network_id": self.networkId,
              "binding:host_id": self.portForm.host,
              "binding:vnic_type": self.portForm.vnictype,
              "device_id": self.portForm.deviceId,
              "port_security_enabled":self.portForm.portSafe,
              "device_owner": self.portForm.deviceOwner,
              // "fixed_ips": fixips,
              "project_id": self.projectid
              }
            };
          }
          if (self.portForm.vnictype === 'direct' && self.portForm.switchdev) {
            reqdata.port['binding:profile'] = {
              capabilities: ['switchdev']
            };
          }
          // “未分配”时不发送fixips字段，后台会自动分配IP
          if (self.setipsubnet === "2" || self.setipsubnet === "3") {
            reqdata["port"]["fixed_ips"] = fixips
          }
          if (self.portForm.macAddress != "") {
            reqdata["port"]["mac_address"] = self.portForm.macAddress
          }
          if (self.portForm.portSafe) {
            reqdata["port"]["security_groups"] = self.portForm.securityGroups;
          }
          self.disabled = true;
          self.loading = true;
          try {
            let result = self.$ajax({
              type: "POST",
              url: "api/neutron/v2.0/ports",
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$notify({
                  message: Vue.t('network.saveSuccess'),
                  type: "success"
                });
                self.loading = false;
                self.disabled = false;
                self.$emit("handleAddPortShow", {});
              },
              errorKey: "NeutronError",
              errFun() {
                self.loading = false;
                self.disabled = false;
              },
              log:{
                description:{
                  en:"Create Port:" + self.portForm.name,
                  zh_cn:"创建端口:" + self.portForm.name
                },
                target:Vue.logTarget.port
              }
            });
          } catch (res) {
            self.loading = false;
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
