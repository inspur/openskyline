<template>
  <el-dialog :title="portTitle" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny">
    <el-form ref="portgroup" :model="portgroup" label-width="120px" :rules="rules" label-position="right" v-loading="loading">
      <el-form-item :label="$t('calcStorLang.mac')" class="is-required" prop="mac">
        <el-input v-model="portgroup.mac" class="col-20"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input v-model="portgroup.name" class="col-20"></el-input>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.mode')" class="is-required" prop="mode">
        <el-select class="col-20" v-model="portgroup.mode">
          <el-option v-for="item in modeOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-tooltip placement="top">
          <div slot="content">{{ $t('calcStorLang.addPortGroupTips') }}</div>
          <i class="el-icon-fa-question-circle" />
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddPortGroup" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'floatIp',
  props: ['phyUuid', 'operateType', 'portEntity', 'phyStatus'],
  data() {
    return {
      saving: false,
      dialogVisible: false,
      portTitle: Vue.t('calcStorLang.addPortgroup'),
      modeOption:[
        {id:"balance-rr", name:"Mode 0(balance-rr)"},
        {id:"active-backup", name:"Mode 1(active-backup)"},
        {id:"balance-xor", name:"Mode 2(balance-xor)"},
        {id:"broadcast", name:"Mode 3(broadcast)"},
        {id:"802.3ad", name:"Mode 4(802.3ad)"},
        {id:"balance-tlb", name:"Mode 5(balance-tlb)"},
        {id:"balance-alb", name:"Mode 6(balance-alb)"}
        ],
      editable:true,
      loading:false,
      portgroup: {
        name: '',
        mac: '',
        mode: ''
      },
      rules: {
        mac: [
          { type: 'required', trigger: 'blur change' },
          { type: 'mac' }
        ],
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumber' }
        ],
        mode:[
          { type: 'required', trigger: 'blur change' }
        ]
      }
    }
  },
  mounted() {
    var self = this;
    self.initDialog();
    self.getPortGroups();
    if (self.operateType == "1") { //add
      self.isEditMode = false;
      self.portTitle = Vue.t('calcStorLang.addPortgroup');
      self.editable = false;
    } else {
      self.isEditMode = true;
      self.portTitle = Vue.t('calcStorLang.editPortgroup');
      self.portgroup.name = self.portEntity.name;
      self.portgroup.mac = self.portEntity.address;
      self.portgroup.mode = self.portEntity.mode;
    }
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
    confirmAddPortGroup() {
      var self = this;
      this.$refs.portgroup.validate(async(valid) => {
        if (valid) {
          self.loading = true;
          self.saving = true;
          var body = {};
          body["node_uuid"] = self.phyUuid;
          body["address"] = self.portgroup.mac;
          body["name"] = self.portgroup.name;
          body["mode"] = self.portgroup.mode;
          var url = "api/ironic/v1/portgroups";
          var method = "post";
          var message = Vue.t("calcStorLang.create") + Vue.t("calcStorLang.sendSuccess") + "！";
          var log = {
                description: {
                  en: "Physical" + self.$route.query.name + "Create portgroup, name is " + self.portgroup.name,
                  zh_cn: "裸机" + self.$route.query.name + "创建端口组，名称:" + self.portgroup.name
                },
                target: Vue.logTarget.bareMachine
              };
          if (self.operateType != "1") {
              url = "api/ironic/v1/portgroups/" + self.portEntity.uuid;
              method = "patch";
              body = [{
                  "path": "/address",
                  "value": self.portgroup.mac,
                  "op": "replace"
              }, {
                  "path": "/name",
                  "value": self.portgroup.name,
                  "op": "replace"
              }, {
                  "path": "/mode",
                  "value": self.portgroup.mode,
                  "op": "replace"
              }];
              log = {
                description: {
                  en: "Physical" + self.$route.query.name + "Edit portgroup, name is " + self.portgroup.name,
                  zh_cn: "裸机" + self.$route.query.name + "编辑端口组，名称:" + self.portgroup.name
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
                'x-openstack-ironic-api-version': 1.34
              },
              log: log,
              successFun:function () {
                self.$message(message);
              }
            });
            setTimeout(function() {
              self.loading = false;
              self.$emit("phyPort");
              self.$emit("onRefresh");
            }, 2000);
          } catch (data) {
            self.saving = false;
            self.loading = false;
            __DEV__ && console.error(data);
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
