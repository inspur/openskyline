<template>
  <el-dialog :title="$t('network.setGateway')" :visible.sync="dialogVisible" :before-close="handleClose" width="30%" v-dialogDrag>
    <el-form ref="form" :model="form"  class="me-required-form" label-width="100px" v-loading="loading">
      <el-form-item :label="$t('network.externalNet')" class="is-required">
        <el-select class="col-15"  v-model="query_net" filterable>
          <el-option v-for="item in networkOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-tooltip  effect="dark" :content="$t('network.EXTERNAL_NET_TIP')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.routerName')" class="is-required">
        <el-input class="col-15"  v-model="name" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.enableSNAT')">
        <el-switch :width="75" :on-text="$t('base.enable')" :off-text="$t('base.disable')" v-model="enable_snat"></el-switch>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="addGatewayClick" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'AddGateway',
  props: ["editname", "editExternalgateway", "editrouterid", "editprojectid"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      form: {
      },
      name: this.editname,
      query_net: "",
      enable_snat:true,
      networkOption: [],
      isDisabled: false
    }
  },
  mounted() {
    this.dialogVisible = true;
    this.getNetworkList();
  },
  methods: {
    getNetworkList() {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/networks?router:external=true&not-tags=bm_deploy",
        success: function(result) {
          let a = [];
          a = result["networks"];
          self.networkOption = a;
        }
      });
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    addGatewayClick() {
      let self = this;
      self.isDisabled = true;
      self.loading = true;
      self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/routers/"+self.editrouterid,
        errorKey: "NeutronError",
        errFun: function(xhr, status) {
          self.$emit("handleAddGatewayShow", {});
        },
        success: function(result) {
          let routerInfo = result['router'];
          let externalGatewayTemp = routerInfo['external_gateway_info'];
          if (externalGatewayTemp!=null) {
            self.loading = false;
            self.isDisabled = false;
            self.$notify({
              message: Vue.t('network.gatewaywarinig'),
              type: "error"
            });
            self.$emit("handleAddGatewayShow", {});
            self.$recordLog({
              target:Vue.logTarget.router,
              level:{
                en:"error",
                zh_cn:"错误"
              },
              description:{
                en:"router " + self.name + " set gateway failed",
                zh_cn:"路由" + self.name + "设置网关失败"
              }
            });
            return false;
          } else {
            let networkId = self.query_net;
            let networkName = "";
            for (let i = 0; i < self.networkOption.length; i++) {
              if (self.networkOption[i].id === networkId) {
                networkName = self.networkOption[i].name;
              }
            }
            let reqdata = {
              "router": {
                "external_gateway_info": {
                  "network_id":networkId,
                  "enable_snat":self.enable_snat
                }
              }
            };
            try {
              let result = self.$ajax({
                type: "PUT",
                url: "api/neutron/v2.0/routers/" + self.editrouterid,
                data: JSON.stringify(reqdata),
                success: function(result) {
                  self.$notify({
                    message: Vue.t('network.saveSuccess'),
                    type: "success"
                  });
                  self.$emit("handleAddGatewayShow", {});
                  self.isDisabled = false;
                  self.loading = false;
                },
                errorKey: "NeutronError",
                errFun: function(xhr, status) {
                  self.isDisabled = false;
                  self.loading = false;
                  if (xhr.status == "404") {
                    self.$emit("handleAddGatewayShow", {});
                  }
                },
                log:{
                  description:{
                    en: self.name + "Set Gateway:" + networkName,
                    zh_cn: "路由" + self.name + "设置网关:" + networkName
                  },
                  target:Vue.logTarget.router
                }
              });
            } catch (res) {
              console.log("Failed");
            }
          }
        }
      });
    }
  }
}
</script>
