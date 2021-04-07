<template>
  <el-dialog :title="$t('network.unbangdingfloating')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">    
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="unBindFloatingIp">{{$t('lang.confirm')}}</el-button>
  </el-dialog>  
</template>
<script type="text/javascript">
export default {
  name:"UnBindFloatingip",
  props: ["floatipId"],
  data() {
    return {
      dialogVisible: false,
      loading: false
    }
  },
  mounted() {
    this.$parent.$parent.active = "BalanceList";
    this.initDialog();
    this.getData();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleClose(done) {
      this.$emit("handleUnBindFloatingipShow", {});
      done();
    },
    cancel() {
      this.$emit("handleUnBindFloatingipShow", {});
    },
    async getData(projectid="") {
    },
    async unBindFloatingIp() {
      var self = this;
      let reqdata = {"floatingip":{}};
      try {
        self.loading = true;
        console.log('---self.floatipId---'+self.floatipId)
        self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/floatingips/"+self.floatipId,
        success: function(result) {
          if (result != null) {
              let floatingip = result["floatingip"];
              if (floatingip.fixed_ip_address == null) {
                self.$message.error(Vue.t("network.thisfloatingrelesas"));
              } else {
              self.$ajax({
                  type: 'PUT',
                  url: "api/neutron/v2.0/floatingips/"+self.floatipId,
                   data: JSON.stringify(reqdata),
                  success: function(result) {
                      self.loading = false;
                      self.$message.success(Vue.t("network.unbingsuccess"));
                      self.cancel();
                      //this.$emit("onRefresh");
                  },
                  errorKey: "NeutronError",
                  errFun: function() {
                    self.loading=false;
                  }
                });
              }
            }
          },
           errorKey: "NeutronError"
        });
      } catch (res) {
        self.loading = false;
        console.log(res);
      }
    }
  }
}
</script>