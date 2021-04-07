<template>
<div>
  <el-dialog :title="$t('network.createRouter')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="routerForm" :model="routerForm" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.routerName')" class="is-required" prop="name">
        <el-input class="col-15"  v-model="routerForm.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.manageStatus')">
        <el-switch :width="75" on-text="UP" off-text="DOWN" v-model="routerForm.admin_state_up"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
        <el-input auto-complete="off" class="col-15" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="routerForm.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.domainuse')" prop="provider_network_zone">
        <el-select v-model="routerForm.zone" class="col-15" multiple>
          <el-option v-for="item in zoneOptions" :key="item.name" :label="item.name" :value="item.name"></el-option>
        </el-select>
        <el-tooltip  effect="dark" :content="$t('network.routerzoneNote')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.externalNet')">
        <el-select class="col-15" v-model="routerForm.query_net" filterable clearable>
          <el-option v-for="item in networkOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-tooltip  effect="dark" :content="$t('network.EXTERNAL_NET_TIP')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.enableSNAT')" v-show="routerForm.query_net!=''">
        <el-switch :width="75" :on-text="$t('base.enable')" :off-text="$t('base.disable')" v-model="routerForm.enable_snat"></el-switch>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input class="col-15" type="textarea"  v-model="routerForm.description"></el-input>
      </el-form-item>
      </el-col></el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="addRouterClick" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
  <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script>
export default {
  name: 'AddRouter',
  data() {
    return {
      dialogVisible: false,
      roleType: Vue.roleType + "",
      selProjectFlg:false,
      close: "",
      zoneOptions:[],
      routerForm: {
        name: "",
        description: "",
        admin_state_up: true,
        query_porject: "",
        projectName:"",
        query_net: "",
        zone:"",
        enable_snat:true
      },
      projectOption: Vue.projectListforNet,
      networkOption: [],
      loading: false,
      isDisabled: false,
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
        ]
      }
    }
  },
  mounted() {
    let self = this;
    self.$parent.$parent.active = "routerNet";
    self.dialogVisible = true;
    self.initZones();
    self.getSharenet();
  },
  methods: {
    async getSharenet() {
      let result = await this.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/networks?router:external=true&not-tags=bm_deploy",
        success: function(result) {
        }
      });
      this.networkOption = result["networks"];
      // let a = [];
      // a = result["networks"];
      // for (let i = 0; i < a.length; i++) {
      //   let names = a[i];
      //   names.name = names.name+"("+names.id+")";
      //   this.networkOption.push(a[i]);
      // }
    },
    async initZones() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/neutron/v2.0/availability_zones?resource=router'
        });
        self.loading = false;
        var list = result['availability_zones'];
        self.zoneOptions = list;
      } catch (res) {
        self.loading = false;
      }
    },
    handleProjectChange(val) {
      this.getSharenet();
      // this.getNet(val);
    },
    handleClose() {
      this.$emit("handleCancelShow", {});
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.routerForm.query_porject = id;
      this.routerForm.projectName = name;
      this.close = 'close';
    },
    onIconClick() {
      this.routerForm.query_porject = '';
      this.routerForm.projectName = '';
      this.close = '';
    },
    addRouterClick() {
      let self = this;
      self.$refs.routerForm.validate(async(valid) => {
        if (valid) {
          self.isDisabled = true;
          self.loading = true;
          let reqdata = {
            "router": {
              "name": self.routerForm.name,
              "description": self.routerForm.description,
              "project_id": self.routerForm.query_porject,
              "tenant_id": self.routerForm.query_porject,
              "admin_state_up": self.routerForm.admin_state_up,
              "external_gateway_info": {
                "enable_snat":self.routerForm.enable_snat,
                "network_id": self.routerForm.query_net
              }
            }
          };
          if (self.routerForm.query_net === "") {
            reqdata = {
              "router": {
                "name": self.routerForm.name,
                "description": self.routerForm.description,
                "project_id": self.routerForm.query_porject,
                "tenant_id": self.routerForm.query_porject,
                "admin_state_up": self.routerForm.admin_state_up
              }
            }
          }
          if (self.routerForm.zone.length) {
            reqdata.router.availability_zone_hints = self.routerForm.zone;
          }
          if (this.roleType != '0') {
            reqdata["router"].project_id = Vue.cookie.get('pid');
            reqdata["router"].tenant_id = Vue.cookie.get('pid');
          }
          self.$ajax({
            type: "POST",
            url: "api/neutron/v2.0/routers",
            data: JSON.stringify(reqdata),
            successMsg: Vue.t('network.saveSuccess'),
            complete: function(XMLHttpRequest, textStatus) {
              self.$emit("handleAddShow", {});
              self.$emit("handleAddRouterShow", {});
              self.loading = false;
              self.isDisabled = false;
            },
            success: function(result) {
            },
            errorKey: "NeutronError",
            log:{
              description:{
                en:"Create Router:" + self.routerForm.name,
                zh_cn:"创建路由:" + self.routerForm.name
              },
              target:Vue.logTarget.router
            }
          });
          return true;
        } else {
          return false;
        }
      });
    }
  }
}
</script>
