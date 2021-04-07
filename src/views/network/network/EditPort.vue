<template>
  <el-dialog  :title="$t('network.editPort')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="portForm" :model="portForm" class="me-required-form" label-width="140px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-15" v-model="portForm.name"></el-input>
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
      <!-- <el-form-item :label="$t('network.deviceId')" prop="deviceId" v-show="roleType == '0'">
        <el-input class="col-15" v-model="portForm.deviceId"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.portNote3')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.deviceOwner')" prop="deviceOwner" v-show="roleType == '0'">
        <el-input class="col-15" v-model="portForm.deviceOwner"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.portConnectOwner')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.bangdingHost')" prop="host" v-show="roleType == '0'">
        <el-input class="col-15" v-model="portForm.host"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.portNote2')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item> -->
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
        <!--<el-tooltip  effect="dark" :content="$t('network.vnicNore1')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>-->
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="editPortClick" :disabled="disabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name: 'EditPort',
  props: ["editportId", "projectId", "secEnable", "secGroups", "editportName", "editportDeviceid", "editportDeviceowner", "editportvnic", "editporthost", "editmanagestatus"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      disabled: false,
      portForm: {
        name: "",
        managestatus: true,
        deviceId: "",
        deviceOwner: "",
        host: "",
        subnet: "",
        fixedip: "",
        vnictype: "normal",
        portSafe:false,
        securityGroups:""
      },
      securityGroupOptions:[],
      roleType: Vue.roleType + "",
      subnetOption: [],
      setipsubnet: "1",
      managestatus: true,
      showsubnet: false,
      showip: false,
      rules: {
        name: [
          {type: 'onlyLetter_NumberChinese'},
          {type: 'requiredNet'},
          {type: 'maxSize', value: 40}
        ]
        // deviceId: [
        //   {type: 'onlyLetterMinusNumber'},
        //   {type: 'maxSize', value: 100}
        // ],
        // deviceOwner: [
        //   {type: 'maxSize', value: 100}
        // ],
        // host: [
        //   {type: 'maxSize', value: 100}
        // ]
      }
    }
  },
  mounted() {
    let me = this;
    Promise.all([this.getSecurityGroupList()]).then(function(result) {
      me.initDialog();
    });
  },
  methods: {
    initDialog() {
      let self = this;
      self.dialogVisible = true;
      let roleType = Vue.roleType + "";
      if (roleType!="0") {
        self.rules.host = [];
        self.rules.deviceId = [];
        self.rules.deviceOwner = [];
      } else {
        self.portForm.deviceId = self.editportDeviceid;
        self.portForm.deviceOwner = self.editportDeviceowner;
        self.portForm.host = self.editporthost;
      }
      self.portForm.name = self.editportName;
      self.portForm.vnictype = self.editportvnic;
      self.portForm.managestatus = self.editmanagestatus;
      self.portForm.portSafe = self.secEnable;
      self.portForm.securityGroups = self.secGroups;
    },
    handleClose(done) {
      this.$emit("handelCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handelCancelShow", {});
    },
    async getSecurityGroupList() {
      let self = this;
      let result = await self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/security-groups?project_id=" + self.projectId,
        success: function(result) {
          let sublist = result['security_groups'];
          self.securityGroupOptions = sublist;
        }
      });
    },
    editPortClick() {
      let self = this;
      self.$refs.portForm.validate(async(valid) => {
        if (valid) {
          let reqdata = {};
          if (self.roleType != "0") {
            reqdata = {"port":{
              "admin_state_up": self.portForm.managestatus,
              "name": self.portForm.name,
              // "binding:host_id": self.portForm.host,
              "binding:vnic_type": self.portForm.vnictype,
              "port_security_enabled":self.portForm.portSafe
              // "device_id": self.portForm.deviceId,
              // "device_owner": self.portForm.deviceOwner
              }
            };
          } else {
            reqdata = {"port":{
              "admin_state_up": self.portForm.managestatus,
              "name": self.portForm.name,
              "binding:host_id": self.portForm.host,
              "binding:vnic_type": self.portForm.vnictype,
              "device_id": self.portForm.deviceId,
              "port_security_enabled":self.portForm.portSafe
              //"device_owner": self.portForm.deviceOwner
              }
            };
          }
          if (self.portForm.portSafe) {
            reqdata["port"]["security_groups"] = self.portForm.securityGroups;
          } else {
            reqdata["port"]["security_groups"] = [];
          }
          self.disabled = true;
          self.loading = true;
          try {
            let result = self.$ajax({
              type: "PUT",
              url: "api/neutron/v2.0/ports/"+self.editportId,
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.loading = false;
                self.disabled = false;
                self.$notify({
                  message: Vue.t('network.saveSuccess'),
                  type: "success"
                });
                self.$emit("handleEditPortsShow", {});
              },
              errFun() {
                self.loading = false;
                self.disabled = false;
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Modify Port:" + self.portForm.name,
                  zh_cn:"修改端口:" + self.portForm.name
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
