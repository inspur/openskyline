<template>
<div>
  <el-dialog :title="$t('network.createvpnServer')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
  <el-row>
    <el-col :span="12">  
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-20" v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
        <!--<el-select class="col-20" v-model="form.project_id" @change="projectChange" filterable clearable>
          <el-option v-for="item in query_porject" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>-->
        <el-input auto-complete="off" class="col-20" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="form.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" class="col-20" v-model="form.description"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.router')" class="is-required" prop="router">
        <el-select class="col-20" v-model="form.router" filterable @change="routerChange">
          <el-option v-for="item in routerOption"
          :key="item.id"
          :label="item.name"
          :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item :label="$t('network.subnet')" prop="subnet">
        <el-select class="col-20" v-model="form.subnet" filterable>
          <el-option v-for="item in subnetOption"
          :key="item.id"
          :label="item.name"
          :value="item.id"></el-option>
        </el-select>
        <el-tooltip  effect="dark" :content="$t('network.showroutersubnet')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item> -->
      <el-form-item :label="$t('network.manageStatus')">
        <el-switch :width="75" on-text="UP" off-text="DOWN" v-model="form.managestatus"></el-switch>
      </el-form-item>
    </el-form>
    </el-col>
    <el-col :span="12">
      <div>
        {{$t("network.vpnServerNote1")}}<br/>
        {{$t("network.vpnServerNote2")}}<br/>
      </div>
    </el-col>
  </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="saveAdd" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
  <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script type="text/javascript">
export default {
  name:"AddVPNServer",
  data() {
    return {
      dialogVisible: false,
      loading: false,
      selProjectFlg:false,
      close: "",
      form: {
        name: "",
        description: "",
        project_id: "",
        projectName:"",
        router: "",
        subnet: "",
        managestatus: true
      },
      roleType: Vue.roleType + "",
      query_porject: Vue.projectListforNet,
      routerOption: [],
      subnetOption: [],
      isDisabled: false,
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 40}
        ],
        projectName: [
          {type: "requiredNet"}
        ],
        router: [
          {type: "requiredNet"}
        ],
        // subnet: [
        //   {type: "requiredNet"}
        // ],
        description: [
          {type: 'maxSize', value: 255}
        ]
      }
    }
  },
  mounted() {
    this.$parent.$parent.active = "VpnList";
    this.initDialog();
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
      let roleType = Vue.roleType + "";
      if (roleType != "0") {
        this.form.project_id = Vue.cookie.get('pid');
        this.getrouterList(Vue.cookie.get('pid'));
      }
    },
    handleClose(done) {
      this.$emit("handlerCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handlerCancelShow", {});
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    projectChange(projectId) {
      this.getrouterList(projectId);
      this.form.router = "";
      this.form.subnet = "";
    },
    getSelProjects(id, name) {
      this.getrouterList(id);
      this.form.project_id = id;
      this.form.projectName = name;
      this.getrouterList(id);
      this.form.router = "";
      this.form.subnet = "";
      this.close = 'close';
    },
    async getrouterList(projectId) {
      this.routerOption = [];
      try {
        let result = await this.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/inspur/routers/vpn?project_id="+projectId,
          errorKey: "NeutronError"
        });
        this.routerOption = result["routers"];
      } catch (res) {
      }
    },
    onIconClick() {
      this.form.project_id = '';
      this.form.projectName = '';
      this.close = '';
    },
    async routerChange(routerId) {
      this.subnetOption = [];
      this.form.subnet = "";
      try {
        if (routerId != "") {
          let result = await this.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/ports?device_id="+routerId,
            errorKey: "NeutronError"
          });
          let ports = result["ports"];
          let subnetIdList = [];
          for (let i = 0; i < ports.length; i++) {
            let port = ports[i];
            let fixedips = port["fixed_ips"];
            if (fixedips.length >0) {
              // 高可用的端口过滤掉
              if (port["name"].indexOf("HA port tenant") < 0) {
                subnetIdList.push(fixedips[0]["subnet_id"]);
              }
            }
          }
          subnetIdList = this.uniqueIds(subnetIdList);
          this.getsubnetListById(subnetIdList);
        }
      } catch (res) {
      }
    },
    uniqueIds(arr) {
      let result = [];
      for (let i=0; i<arr.length; i++) {
        if (result.indexOf(arr[i]) == -1) {
          result.push(arr[i]);
        }
      }
      return result;
    },
    async getsubnetListById(list) {
      let self = this;
      try {
        for (let i = 0; i < list.length; i++) {
          await self.$ajax({
            type: "GET",
            url: "api/neutron/v2.0/subnets/"+list[i],
            data: {},
            success: function(result) {
              let subnet = result["subnet"];
              subnet["name"] = subnet["cidr"]+"("+subnet["name"] +")";
              self.subnetOption.push(subnet);
            }
          });
        }
      } catch (res) {
      }
    },
    saveAdd() {
      let self = this;
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          self.loading = true;
          self.isDisabled = true;
          self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/inspur/routers/vpn?project_id="+self.form.project_id,
            errorKey: "NeutronError",
            errFun: function() {
              self.loading = false;
              self.isDisabled = false;
            },
            success: function(router) {
              self.routerOption = router["routers"];
              let haveRouter = false;
              for (let i = 0; i < self.routerOption.length; i++) {
                let routerObj = self.routerOption[i];
                if (routerObj["id"] === self.form.router) {
                  haveRouter = true;
                }
              }
              if (haveRouter) {
                let reqdata = {"vpnservice":{
                  "name": self.form.name,
                  "description": self.form.description,
                  "project_id": self.form.project_id,
                  "router_id": self.form.router,
                  "subnet_id": self.form.subnet,
                  "admin_state_up": self.form.managestatus
                }};
                if (self.form.subnet == "") {
                  delete reqdata.vpnservice.subnet_id;
                }
                self.$ajax({
                  type: "POST",
                  url: "api/neutron/v2.0/vpn/vpnservices",
                  data: JSON.stringify(reqdata),
                  errorKey: "NeutronError",
                  successMsg: Vue.t('network.saveSuccess'),
                  success: function(result) {
                    self.loading = false;
                    self.isDisabled = false;
                    self.$emit("handleAddShow", {});
                  },
                  errFun() {
                    self.loading = false;
                    self.isDisabled = false;
                  },
                  log:{
                    description:{
                      en:"Add VPNServer:"+self.form.name,
                      zh_cn:"创建VPN服务:"+self.form.name
                    },
                    target:Vue.logTarget.vpnServer
                  }
                });
              } else {
                self.loading = false;
                self.isDisabled = false;
                self.$notify.error({
                  message: Vue.t("network.routerreselect")
                });
              }
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