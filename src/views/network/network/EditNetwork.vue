<template>
  <el-dialog :title="$t('network.editNetwork')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="editform" :model="editform" class="me-required-form" label-width="100px" :rules="rule" v-loading="loading">
      <el-form-item :label="$t('network.networkName')" class="is-required" prop="name">
        <el-input  v-model="editform.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.manageStatus')">
        <el-switch :width="75" on-text="UP" off-text="DOWN" v-model="managestatus"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('network.externalNet')" v-show="roleType == '0'">
        <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="outnetstatus"  @change="externalNetChange"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('network.networkshared')" v-show="roleType == '0'">
        <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="sharestatus"></el-switch>
        <el-tooltip effect="dark" :content="$t('network.networksharedTooltip')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('lang.desc')"  prop="description">
        <el-input type="textarea" v-model="editform.description"></el-input>
      </el-form-item>
      </el-col></el-row>
      <el-collapse class="col-24" v-model="activeName">
        <el-collapse-item :title="$t('network.advanceOptions')" name="11">
          <el-form-item :label="$t('network.physicalMachineNetworkType')" label-width="160px">
            <el-select v-model="editform.physicalMachineNetworkType" clearable>
              <el-option :label="$t('network.bmService')" value="bm_service"></el-option>
              <el-option :label="$t('network.bmManage')" value="bm_manage"></el-option>
              <el-option :label="$t('network.bmStorage')" value="bm_storage"></el-option>
              <el-option v-if="roleType === '0' && !outnetstatus" :label="$t('network.bmDeploy')" value="bm_deploy"></el-option>
            </el-select>
            <el-tooltip effect="dark" :content="$t('network.networkTogTIp')" placement="top">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="handleEditConfirm" :disabled="disabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"EditNetwork",
  props: ["networkName", "networkManageStatus", "networkShareStatus", "networkExternalStatus", "networkEditId", "description", "physicalMachineNetworkType"],
  data() {
    return {
      dialogVisible: false,
      editform: {
        name: '',
        description: '',
        physicalMachineNetworkType: ''
      },
      managestatus: true,
      sharestatus: false,
      sharedDisabled: false,
      outnetstatus: false,
      loading: false,
      disabled: false,
      roleType: Vue.roleType + "",
      activeName:"11",
      rule: {
        name: [
          {type: "requiredNet"},
          {type: 'maxSize', value: 40},
          {type: 'onlyLetterNumber_Chinese'}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
      self.editform.name = this.networkName;
      self.managestatus = this.networkManageStatus;
      self.sharestatus = this.networkShareStatus;
      self.outnetstatus = this.networkExternalStatus;
      if (this.networkExternalStatus === true) {
        self.sharedDisabled = true;
      }
      self.editform.description = this.description;
      self.editform.physicalMachineNetworkType = this.physicalMachineNetworkType;
    },
    externalChange(value) {
      if (value === true) {
        this.sharestatus = true;
        this.sharedDisabled = true;
      } else {
        this.sharedDisabled = false;
      }
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    getPhysicalMachineNetworkTypeName (v) {
      let name = "";
      switch (v) {
        case 'bm_service':
          name = Vue.t('network.bmService');
          break;
        case 'bm_manage' :
          name = Vue.t('network.bmManage');
          break;
        case 'bm_storage':
          name = Vue.t('network.bmStorage');
          break;
        case 'bm_deploy':
          name = Vue.t('network.bmDeploy');
          break;
      }
      return name;
    },
    handleEditConfirm() {
      let self = this;
      let reqdata = {
        "network":{
          "name": self.editform.name,
          "shared": self.sharestatus,
          "router:external": self.outnetstatus,
          "admin_state_up": self.managestatus,
          "description": self.editform.description
        }
      };
      if (self.roleType != "0") {
        reqdata = {
          "network":{
            "name": self.editform.name,
            "admin_state_up": self.managestatus,
            "description": self.editform.description
          }
        };
      }
      try {
        self.$refs.editform.validate(async(valid) => {
          if (valid) {
            self.disabled = true;
            self.loading = true;
            await self.$ajax({
              type: 'PUT',
              url: "api/neutron/v2.0/networks/"+self.networkEditId,
              data: JSON.stringify(reqdata),
              success: function(result) {
                let parm = {tags:[self.editform.physicalMachineNetworkType]};
                self.$ajax({
                  type: "PUT",
                  url: "api/neutron/v2.0/networks/" + self.networkEditId + '/tags',
                  data: JSON.stringify(parm),
                  showErrMsg: false,
                  success: function(result) {
                    self.$notify({
                      message: Vue.t('network.saveSuccess'),
                      type: "success"
                    });
                    self.disabled = false;
                    self.loading = false;
                    self.$emit("handleEditShow", {});
                  }
                });
              },
              errorKey: "NeutronError",
              errFun: function() {
                self.loading = false;
                self.disabled = false;
                self.$emit("handleEditShow", {});
              },
              log:{
                description:{
                  en:"Before edit network name:"+self.networkName+", After modify network name:" + self.editform.name,
                  zh_cn:"网络名称修改前："+self.networkName+"，网络名称修改后:" + self.editform.name +
                    `管理状态修改前:${self.networkManageStatus ? "UP" : "DOWN"} 管理状态修改后:${self.managestatus ? "UP" : "DOWN"}
                    外部网络修改前:${self.networkExternalStatus ? "是" : "否"}  外部网络修改后:${self.outnetstatus ? "是" : "否"}
                    是否共享修改前: ${self.networkShareStatus ? "是" : "否"} 是否共享修改后:${self.sharestatus ? "是" : "否"}
                    描述修改前:${self.description} 描述修改后:${self.editform.description} 云物理机网络类型标签修改前: ${self.getPhysicalMachineNetworkTypeName(self.physicalMachineNetworkType)}
                    云物理机网络类型标签修改后:${self.getPhysicalMachineNetworkTypeName(self.editform.physicalMachineNetworkType)}`
                },
                target:Vue.logTarget.networkList
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
    },
    externalNetChange(val) {
      if (val) {
        if (this.editform.physicalMachineNetworkType == "bm_deploy") {
          this.editform.physicalMachineNetworkType = "";
        }
      }
    }
  }
}
</script>
