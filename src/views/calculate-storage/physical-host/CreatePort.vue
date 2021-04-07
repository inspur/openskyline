<template>
  <el-dialog :title="portTitle" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny">
    <el-form ref="physicalHost" :model="physicalHost" label-width="120px" :rules="rules" label-position="right" v-loading="loading" >
      <el-form-item :label="$t('calcStorLang.mac')" class="is-required" prop="name">
        <el-input v-model="physicalHost.name" class="col-20"></el-input>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.addPortTip1')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <!-- <el-form-item label="PXE enabled" class="is-required">
        <el-switch v-model="isPXEEnabled" on-text="是" off-text="否"></el-switch>
      </el-form-item> -->
      <el-form-item :label="$t('lang.port') + '_id'">
        <el-input v-model="physicalHost.portId" class="col-20" :disabled="isEditMode"></el-input>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.addPortTip2')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.switch') + '_id'" prop="switchId">
        <el-input v-model="physicalHost.switchId" class="col-20" :disabled="isEditMode"></el-input>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.addPortTip3')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.switch')+'_info'">
        <el-input v-model="physicalHost.switchInfo" class="col-20" :disabled="isEditMode"></el-input>
        <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.addPortTip4')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.isPxe')">
        <el-switch :on-text="$t('base.yes')" :off-text="$t('base.no')" v-model="physicalHost.pxe_enabled" :disabled="editable"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.portgroup')">
        <el-select class="col-20" v-model="physicalHost.portgroup_uuid" clearable :disabled="editable">
          <el-option v-for="item in portGroupOption" :key="item.uuid" :label="item.name" :value="item.uuid"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.portNetworkType')">
        <el-select class="col-20" v-model="physicalHost.net_type" clearable :disabled="editable">
          <el-option :label="$t('calcStorLang.bmService')" value="bm_service"></el-option>
          <el-option :label="$t('calcStorLang.bmManage')" value="bm_manage"></el-option>
          <el-option :label="$t('calcStorLang.bmStorage')" value="bm_storage"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddDisk" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'floatIp',
  props: ['phyUuid', 'operateType', 'portEntity', 'phyStatus'],
  data() {
    return {
      loading: false,
      portNetworkTypeGroup:[{name:'裸机业务网', net_type:'bm_service'}, {name:'裸机管理网', net_type:'bm_manage'}, {name:'裸机存储网', net_type:'bm_storage'}],
      way: "",
      switchIdInit: '',
      dialogVisible: false,
      isPXEEnabled: false,
      saving: false,
      isEditMode: false,
      portTitle: Vue.t('calcStorLang.addPort'),
      portGroupOption:[],
      editable:true,
      physicalHost: {
        name: '',
        address: '',
        portId: '',
        switchId: '',
        switchInfo: '',
        pxe_enabled:true,
        portgroup_uuid:"",
        net_type:""
      },
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'mac' }
        ],
        switchId: [
          { trigger: 'blur change' },
          { type: 'mac' }
        ]
      }
    }
  },
  mounted() {
    let self = this;
    self.initDialog();
    self.getPortGroups();
    if (self.operateType == "1") { //add
      self.isEditMode = false;
      self.portTitle = Vue.t('calcStorLang.addPort');
      self.editable = false;
    } else if ((self.operateType === 2) && (self.phyStatus ==="enroll" || self.phyStatus === "manageable") &&
      Vue.roleType === "0") {
      self.isEditMode = false;
      self.portTitle = Vue.t('calcStorLang.editPort');
      self.physicalHost.name = self.portEntity.address;
      self.physicalHost.portId = self.portEntity['local_link_connection'].port_id || "";
      self.physicalHost.switchId = self.switchIdInit = self.portEntity['local_link_connection'].switch_id || "";
      self.physicalHost.switchInfo = self.portEntity['local_link_connection'].switch_info || "";
      self.physicalHost.pxe_enabled = self.portEntity['pxe_enabled'];
      self.physicalHost.portgroup_uuid = self.portEntity['portgroup_uuid'];
      self.physicalHost.net_type = self.portEntity.extra.net_type || "";
      self.way = self.physicalHost.net_type? "replace" : "add";
      self.editable = false;
    } /*else {
      self.isEditMode = true;
      self.portTitle = Vue.t('calcStorLang.editPort');
      self.physicalHost.name = self.portEntity.address;
      self.physicalHost.portId = self.portEntity['local_link_connection'].port_id || "";
      self.physicalHost.switchId = self.portEntity['local_link_connection'].switch_id || "";
      self.physicalHost.switchInfo = self.portEntity['local_link_connection'].switch_info || "";
      self.physicalHost.pxe_enabled = self.portEntity['pxe_enabled'];
      self.physicalHost.portgroup_uuid = self.portEntity['portgroup_uuid'];
      let s = self.phyStatus;
      if (s == "enroll" || s == "manageable") {
        self.editable = false;
      }
    }*/
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("phyPort");
    },
    handleClose(done) {
      this.$emit("phyPort");
      done();
    },
    async getPortGroups() {
      let self = this;
      let result = await this.$ajax({
        type: "GET",
        headers: {
          'x-openstack-ironic-api-version': 1.34
        },
        url: "api/ironic/v1/portgroups?node=" + self.phyUuid,
        success: function(result) {
        }
      });
      this.portGroupOption = result["portgroups"];
    },
    confirmAddDisk() {
      var self = this;
      this.$refs.physicalHost.validate(async(valid) => {
        if (valid) {
          var phyPortId = self.physicalHost.portId;
          var phySwitchId = self.physicalHost.switchId;
          if ((phyPortId != "" && phySwitchId == "") || (phyPortId == "" && phySwitchId != "")) {
            self.$message({
              showClose: true,
              message: Vue.t("calcStorLang.addPortTip5"),
              type: 'warning'
            });
            return false;
          } else if (self.physicalHost.switchInfo != "" && (self.physicalHost.switchId == "" || self.physicalHost.portId == "")) {
            self.$message({
              showClose: true,
              message: Vue.t("calcStorLang.addPortTip6"),
              type: 'warning'
            });
            return false;
          } else {
            self.loading = true;
            self.saving = true;
            var body = {};
            if (self.physicalHost.switchId == "" && self.physicalHost.switchInfo != "") {
              body = {
                "node_uuid": self.phyUuid,
                "address": self.physicalHost.name,
                "pxe_enabled": self.physicalHost.pxe_enabled,
                "portgroup_uuid":self.physicalHost.portgroup_uuid,
                "local_link_connection": {
                  "switch_info": self.physicalHost.switchInfo
                }
              };
            } else if (self.physicalHost.switchId == "" && self.physicalHost.switchInfo == "") {
              body = {
                "node_uuid": self.phyUuid,
                "address": self.physicalHost.name,
                "portgroup_uuid":self.physicalHost.portgroup_uuid,
                "pxe_enabled": self.physicalHost.pxe_enabled
              };
            } else {
              body = {
                "node_uuid": self.phyUuid,
                "address": self.physicalHost.name,
                "pxe_enabled": self.physicalHost.pxe_enabled,
                "portgroup_uuid":self.physicalHost.portgroup_uuid,
                "local_link_connection": {
                  "switch_id": self.physicalHost.switchId,
                  "port_id": self.physicalHost.portId,
                  "switch_info": self.physicalHost.switchInfo
                }
              };
            }
            body.extra = {"net_type":self.physicalHost.net_type};
            if (self.physicalHost.portgroup_uuid === "" || self.physicalHost.portgroup_uuid === null) {
              delete body.portgroup_uuid;
            }
            var url = "api/ironic/v1/ports";
            var method = "post";
            var message = Vue.t("calcStorLang.create") + Vue.t("calcStorLang.sendSuccess") + "！";
            var log = {
                  description: {
                    en: "Physical" + self.$route.query.name + "Create port, mac is " + self.physicalHost.name,
                    zh_cn: "裸机" + self.$route.query.name + "创建端口，MAC地址:" + self.physicalHost.name
                  },
                  target: Vue.logTarget.bareMachine
               };
            if (self.operateType != "1") {
               url = "api/ironic/v1/ports/" + self.portEntity.uuid;
               method = "patch";
               body = [{
                   "path": "/address",
                   "value": self.physicalHost.name,
                   "op": "replace"
               }, {
                   "path": "/pxe_enabled",
                   "value": self.physicalHost.pxe_enabled,
                   "op": "replace"
               }, {
                   "path": "/portgroup_uuid",
                   "value": self.physicalHost.portgroup_uuid,
                   "op": self.physicalHost.portgroup_uuid==""?"remove":"replace"
               }];
               // 初始值和最终值不为空才可添加
               if (!("add" === self.way && !self.physicalHost.net_type)) {
                 body.push({
                   "path": "/extra/net_type",
                   "value": self.physicalHost.net_type,
                   "op": self.way
                 });
               }
               if ((self.operateType === 2) && (self.phyStatus ==="enroll" || self.phyStatus === "manageable") &&
                 Vue.roleType === "0") {
                 if (self.switchIdInit && !self.physicalHost.switchId) {
                   body.push(
                     {
                       "path":"/local_link_connection/switch_id",
                       "op":"remove"
                     },
                     {
                       "path":"/local_link_connection/port_id",
                       "op":"remove"
                     },
                     {
                       "path":"/local_link_connection/switch_info",
                       "op":"remove"
                     });
                 }
                 if (self.physicalHost.switchId) {
                   body.push(
                     {
                       "path":"/local_link_connection/switch_id",
                       "value": self.physicalHost.switchId,
                       "op":"add"
                     },
                     {
                       "path":"/local_link_connection/port_id",
                       "value":  self.physicalHost.portId,
                       "op":"add"
                     },
                     {
                       "path":"/local_link_connection/switch_info",
                       "value": self.physicalHost.switchInfo,
                       "op":"add"
                     });
                 }
                 /*if (!self.switchIdInit && !self.physicalHost.switchId) {
                   body.push(
                     {
                       "path":"/local_link_connection/switch_info",
                       "value": self.physicalHost.switchInfo,
                       "op":"add"
                     });
                 }*/
               }
                log = {
                  description: {
                    en: "Physical" + self.$route.query.name + "Create port, mac is " + self.physicalHost.name,
                    zh_cn: "裸机" + self.$route.query.name + "编辑端口，MAC地址:" + self.physicalHost.name
                  },
                  target: Vue.logTarget.bareMachine
               };
               message = Vue.t("lang.edit") + Vue.t("calcStorLang.sendSuccess") + "！";
            }
            body = JSON.stringify(body);
            try {
              let ret = await this.$ajax({
                url: url,
                type: method,
                data: body,
                errorKey: "error_message",
                headers: {
                  'x-openstack-ironic-api-version': 1.46
                },
                log: log,
                successFun:function () {
                  self.$message(message);
                  self.$emit("onRefresh");
                }
              });
              setTimeout(function() {
                self.loading = false;
                self.$emit("phyPort");
                self.$emit("onRefresh");
              }, 3000);
            } catch (data) {
              self.saving = false;
              self.loading = false;
              __DEV__ && console.error(data);
            }
          }
        } else {
          return false;
        }
      });
    }
  }
}

</script>
<style scoped>


</style>
