<template>
  <el-dialog :title="$t('network.editvpnServer')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-20" v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" class="col-20" v-model="form.description"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.manageStatus')">
        <el-switch :width="75" on-text="UP" off-text="DOWN" v-model="form.managestatus"></el-switch>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="saveAdd" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"EditVPNServer",
  props: ["editrow"],
  data() {
    return {
      oldForm: new Map(),
      dialogVisible: false,
      loading: false,
      isDisabled: false,
      roleType: Vue.roleType + "",
      form: {
        name: "",
        description: "",
        managestatus: true
      },
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 40}
        ],
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
      this.form.name = this.editrow["name"];
      this.form.description = this.editrow["description"];
      this.form.managestatus = this.editrow["admin_state_up"];
      for (let [k, v] of Object.entries(this.form)) {
        this.oldForm.set(k, v);
      }
    },
    handleClose(done) {
      this.$emit("handlerCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handlerCancelShow", {});
    },
    saveAdd() {
      let self = this;
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          let formLabel = {
            name: Vue.t('lang.name'),
            description: Vue.t('lang.desc'),
            managestatus: Vue.t('network.manageStatus')
          };
          let logStr = '修改VPN服务';
          self.oldForm.set('managestatus', self.oldForm.get('managestatus') ? "UP" : "DOWN");
          for (let [k, v] of Object.entries(formLabel)) {
            if (k === 'managestatus') {
              logStr = logStr + `${v}修改前: ${self.oldForm.get(k)},${v}修改后: ${self.form[k] ? 'UP' : "DOWN"} `;
            } else {
              logStr = logStr + `${v}修改前: ${self.oldForm.get(k)},${v}修改后: ${self.form[k]} `;
            }
          }
          self.isDisabled = true;
          self.loading = true;
          let reqdata = {"vpnservice":{
              "name": self.form.name,
              "description": self.form.description,
              "admin_state_up": self.form.managestatus
            }
          };
          try {
            self.loading = true;
            let result = await self.$ajax({
              type: "PUT",
              url: "api/neutron/v2.0/vpn/vpnservices/"+self.editrow["id"],
              data: JSON.stringify(reqdata),
              errorKey: "NeutronError",
              successMsg: Vue.t('network.saveSuccess'),
              success: function(result) {
                self.loading = false;
                self.isDisabled = false;
                self.$emit("handleEditShow", {});
              },
              errFun(xhr, status) {
                if (xhr.status == "404") {
                  self.$emit("handleEditShow", {});
                }
                self.loading = false;
                self.isDisabled = false;
              },
              log:{
                description:{
                  en:"Before edit VPNServer:"+self.editrow["name"]+", After edit VPNServer:"+self.form.name,
                  zh_cn:logStr
                },
                target:Vue.logTarget.vpnServer
              }
            });
          } catch (res) {
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
