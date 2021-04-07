<template>
  <el-dialog
    :title="$t('calcStorLang.BMC')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    size="tiny"
  >
    <el-form
      ref="BmcIp"
      class="me-required-form"
      label-position="left"
      :model="BmcIp"
      label-width="100px"
      :rules="rules"
    >
      <el-form-item :label="$t('calcStorLang.bmcIP')" class="is-required" prop="ip">
        <el-input v-model="BmcIp.ip" class="col-18"></el-input>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.bmcUserName')" class="is-required" prop="UserName">
        <el-input v-model="BmcIp.UserName" class="col-18"></el-input>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.bmcPassword')" class="is-required" prop="Password">
        <el-input v-model="BmcIp.Password" type="password" class="col-18"></el-input>
      </el-form-item>
      <el-form-item>{{ $t('calcStorLang.BMC_TIPS2') }}</el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddHost" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
class FieldInvalidError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = "FieldInvalidError";
  }
}
export default {
  name: "BmcIp",
  props: ["selectedRow"],
  data() {
    return {
      BmcIp: {
        ip: "",
        UserName: "",
        Password: ""
      },
      dialogVisible: false,
      rules: {
        ip: [{ type: "required", trigger: "blur change" }, { type: "bmcip" }],
        UserName: [{ type: "required", trigger: "blur change" }],
        Password: [{ type: "required", trigger: "blur change" }]
      },
      saving: false
    };
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    async initDialog() {
      var self = this;
      self.dialogVisible = true;
      try {
        let result = await self.$ajax({
          url:
            "api/nova/v2.1/os-hypervisor-ipmis/" +
            self.selectedRow.hypervisor_hostname,
          type: "get"
        });
        self.BmcIp.ip = result.ipmi_detail.ipmi_ip || "";
        self.BmcIp.UserName = result.ipmi_detail.ipmi_user || "";
      } catch (data) {}
    },
    handleCancel() {
      this.$emit("handlebmcFlag", {});
      this.$emit("onRefresh", {});
    },
    handleClose(done) {
      this.$emit("handlebmcFlag", {});
      this.$emit("onRefresh", {});
      done();
    },
    async validateOne(host) {
      const $this = this;
      let res = await $this.$ajax({
        type: "post",
        url: "api/nova/v2.1/os-hypervisor-ipmis/validate",
        data: JSON.stringify({
          ipmi_infos: [
            {
              hostname: host.hypervisor_hostname,
              ipmi_ip: host.ipmi_ip,
              ipmi_user: host.ipmi_user,
              ipmi_passwd: host.ipmi_passwd
            }
          ]
        })
      });
      if (res.results[0].result === "failed") {
        let reason = res.results[0].reason;
        if (reason.startsWith("get ipmi addr failed")) {
          reason = $this.$t(
            "calcStorLang.BATCH_BMC_SET_VALIDATE_IPMI_ADDR_FAILED"
          );
        }
        if (reason.startsWith("BMC IP Address not match")) {
          reason = $this.$t("calcStorLang.BATCH_BMC_SET_VALIDATE_IP_NOT_MATCH");
        }
        if (reason.startsWith("ipmi_user or ipmi_passwd incorrect")) {
          reason = $this.$t(
            "calcStorLang.BATCH_BMC_SET_VALIDATE_USER_PASSWD_WRONG"
          );
        }
        throw new FieldInvalidError(
          `${$this.$t("calcStorLang.BATCH_BMC_SET_HOST")}${
            host.hypervisor_hostname
          }：${reason}`
        );
      }
      return true;
    },
    confirmAddHost() {
      let $this = this;
      $this.$refs.BmcIp.validate(async valid => {
        if (valid) {
          let ip = $this.BmcIp.ip;
          let UserName = $this.BmcIp.UserName;
          let Password = $this.BmcIp.Password;
          try {
            $this.saving = true;
            await $this.validateOne({
              hypervisor_hostname: $this.selectedRow.hypervisor_hostname,
              ipmi_ip: ip,
              ipmi_user: UserName,
              ipmi_passwd: Password
            });
            let result = await $this.$ajax({
              url: 'api/nova/v2.1/os-hypervisor-ipmis',
              data: JSON.stringify({
                hypervisor_ipmi: {
                  hostname: $this.selectedRow.hypervisor_hostname,
                  ipmi_ip: ip,
                  ipmi_user: UserName,
                  ipmi_passwd: Password
                }
              }),
              type: 'post',
              successMsg: Vue.t("calcStorLang.successBMC"),
              log: {
                description: {
                  en: "Deploy BMC of" + $this.selectedRow.hypervisor_hostname,
                  zh_cn: $this.selectedRow.hypervisor_hostname + "配置BMC"
                },
                key: "hypervisor_hostname",
                target: Vue.logTarget.hostmanage
              }
            });
            $this.saving = false;
            this.$emit("handlebmcFlag", {});
            this.$emit("onRefresh", {});
          } catch (e) {
            __DEV__ && console.error(e);
            if (e.name === "FieldInvalidError") {
              $this.$message.error(e.message);
            }
            $this.saving = false;
            return false;
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>
