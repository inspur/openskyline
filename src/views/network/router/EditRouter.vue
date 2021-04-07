<template>
  <el-dialog :title="$t('network.editRouter')" :visible.sync="dialogVisible" :before-close="handleClose" size="tiny" v-dialogDrag>
    <el-form ref="routerForm" :model="routerForm" label-width="100px" class="me-required-form" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.routerName')" class="is-required" prop="name">
        <el-input  v-model="routerForm.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.manageStatus')">
        <el-switch :width="75" on-text="UP" off-text="DOWN" v-model="routerForm.admin_state_up"></el-switch>
      </el-form-item>
      <el-row><el-col :span="24">
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea"  v-model="routerForm.description"></el-input>
      </el-form-item>
      </el-col></el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="editRouterClick" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'EditInstance',
  props: ["editname", "editdesc", "editrouterid", "editadminstateup"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      isDisabled:false,
      routerForm:{
        name: "",
        description: "",
        admin_state_up: ""
      },
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'requiredNet'},
          {type: 'maxSize', value: 40}
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
      self.routerForm.name = this.editname;
      self.routerForm.description = this.editdesc;
      self.routerForm.admin_state_up = this.editadminstateup;
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    handleClose() {
      this.$emit("handleCancelShow", {});
    },
    editRouterClick() {
      var self = this;
      self.$refs.routerForm.validate(async(valid) => {
        if (valid) {
          let reqdata = {
            "router": {
              "name": self.routerForm.name,
              "description": self.routerForm.description,
              "admin_state_up": self.routerForm.admin_state_up
            }
          };
          try {
            self.loading = true;
            self.isDisabled = true;
            let result = self.$ajax({
              type: "PUT",
              url: "api/neutron/v2.0/routers/" + this.editrouterid,
              data: JSON.stringify(reqdata),
              success: function(result) {
                self.$message.success(Vue.t('network.saveSuccess'));
                self.loading = false;
                self.isDisabled = false;
                self.$emit("handleShow", {});
              },
              errorKey: "NeutronError",
              errFun(xhr) {
                if (xhr.status == "404") {
                  self.$emit("handleShow", {});
                }
                self.loading = false;
                self.isDisabled = false;
              },
              log:{
              description:{
                en:"Before edit router name:"+self.editname+", After edit router name:" + self.routerForm.name,
                zh_cn:"路由名称修改前："+self.editname+"，路由名称修改后:" + self.routerForm.name + `管理状态修改前:${self.editadminstateup ? "UP" : "DOWN"}
                管理状态修改后:${self.routerForm.admin_state_up ? "UP" : "DOWN"}描述修改前:${self.editdesc}描述修改后:${self.routerForm.description}`
              },
              target:Vue.logTarget.router
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
    }
  }
}
</script>
