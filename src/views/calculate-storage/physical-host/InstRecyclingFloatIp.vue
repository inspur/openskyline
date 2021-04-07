<template>
<div>
  <el-dialog :title="$t('calcStorLang.instRecyclingFloatIp')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="form" :model="form" label-width="100px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('network.floatingIP')" class="is-required" prop="floatIp">
        <el-select v-model="form.floatIp" filterable>
          <el-option v-for="item in totalFloatingIPs" :key="item.id" :label="item.floating_ip_address" :value="item.port_id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="addFloatingIp" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
 </div>
</template>
<script>
export default {
  name: 'floatIp',
  props: ["instUuid", "projectId", "FIrow"],
  data() {
    return {
      dialogVisible: false,
      isDisabled: false,
      ips: new Map(),
      floatipmaps: new Map(),
      loading: false,
      totalFloatingIPs: [],
      form: {
        floatIp:""
      },
      rules: {
        floatIp: [
          {type: "required"}
        ]
      }
    }
  },
  mounted() {
    this.initDialog();
    this.getData();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    handleCancel() {
      this.$emit("handleIRFloatIpFlag", {});
    },
    handleClose(done) {
      this.$emit("handleIRFloatIpFlag", {});
      done();
    },
    async getData() {
      var self = this;
      let data = [];
      let statusTransfer = {"ACTIVE":this.$t('calcStorLang.running'), "DOWN":this.$t('lang.DOWN'), "ERROR":this.$t('lang.ERROR')};
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/floatingips?project_id="+self.projectId,
          complete: function(XMLHttpRequest, textStatus) {
          }
        });
        let tempArr = result["floatingips"];
        self.totalFloatingIPs = [];
        var address = self.FIrow['addresses'];
        var list = Object.keys(address).map(function(el) {
            return address[el];
        });
        if (list != null) {
          if (list.length > 1) {
            for (let addr in address) {
              var ipList = address[addr];
              for (let n = 0; n < ipList.length; n++) {
                var net = ipList[n];
                var type = net['OS-EXT-IPS:type'];
                if (type == "floating") {
                  self.ips.set(net.addr, net.addr);
                }
              }
            }
          } else if (list.length == 0) {
          } else {
            for (let addr in address) {
              var ipList2 = address[addr];
              for (let n = 0; n < ipList2.length; n++) {
                var net2 = ipList2[n];
                var type2 = net2['OS-EXT-IPS:type'];
                if (type2 == "floating") {
                  self.ips.set(net2.addr, net2.addr);
                }
              }
            }
          }
        }
        for (let i =0; i< tempArr.length; i++) {
          let floatingip = tempArr[i];
          if (floatingip.fixed_ip_address !== null) {
            if (self.ips.get(floatingip.floating_ip_address)) {
              floatingip.status = statusTransfer[floatingip.status];
              self.totalFloatingIPs.push(floatingip);
              self.floatipmaps.set(floatingip.floating_ip_address, floatingip);
            }
          }
        }
      } catch (res) {
      }
    },
    addFloatingIp() {
      let self = this;
      let showips = "";
      let floatingId;
      var tenantId = self.FIrow.tenant_id;
      var addresses = self.FIrow.addresses;
      let havefloating = false;
      var portid = self.form.floatIp;
      var body = { "floatingip": {"port_id": null} };
      body = JSON.stringify(body);
      self.$refs.form.validate(async(valid) => {
      if (valid) {
        self.$confirm(Vue.t('calcStorLang.unBingFloatIpConfirm'), Vue.t('network.attention'), {
          confirmButtonText: Vue.t('lang.confirm'),
          cancelButtonText: Vue.t('lang.cancel'),
          type: "warning",
          callback: (action, instance) => {
            if (action === "confirm") {
              //获取详情，看看浮动IP还在不在
              self.$ajax({
                type: 'get',
                url: "api/nova/v2.1/servers-inspur/" + self.FIrow["id"],
                success: function(vmdatails) {
                  let vmdatail = vmdatails['server'];
                  let address = vmdatail['addresses'];
                  let status = vmdatail['status'];
                  if (status == "SHELVED_OFFLOADED" || status == "SHELVED") {
                    self.$notify.error({
                      message: Vue.t('network.cloudvmstatusdelete')
                    });
                    setTimeout( function() {
                        self.$emit("getData", {page: 1});
                        self.loading = false;
                      }, 1000);
                    self.$emit("handleIRFloatIpFlag", {});
                  } else {
                    for (let a in address) {
                    for ( let i in address[a]) {
                      if (address[a][i]['OS-EXT-IPS:type'] === 'floating') {
                        havefloating = true;
                        for (var key in addresses) {
                          var net = addresses[key];
                          for (var i = net.length - 1; i >= 0; i--) {
                            var ip = net[i];
                            if (ip != null && ip['OS-EXT-IPS:type'] === 'floating') {
                              var floatingIP = ip['addr'];
                              if (self.floatipmaps.get(floatingIP).port_id === self.form.floatIp && showips !== floatingIP) {
                                showips = floatingIP;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  if (!havefloating) {
                    self.$notify.error({
                      message: Vue.t('calcStorLang.instBindingFloatIpTip1')
                    });
                    setTimeout( function() {
                        self.$emit("getData", {page: 1});
                        self.loading = false;
                      }, 1000);
                    self.$emit("handleIRFloatIpFlag", {});
                  } else {
                    instance.confirmButtonLoading = true;
                    self.$ajax({
                      type: "get",
                      url: "api/neutron/v2.0/floatingips?floating_ip_address="+showips+"&project_id="+tenantId,
                      data: body,
                      success: function(result) {
                        floatingId= result["floatingips"][0].id;
                        self.$ajax({
                          type: "PUT",
                          url: "api/neutron/v2.0/floatingips/"+floatingId,
                          data: body,
                          complete: function(XMLHttpRequest, textStatus) {
                            instance.confirmButtonLoading = false;
                            self.loading = true;
                            setTimeout( function() {
                              self.$emit("getData", {page: 1});
                              self.loading = false;
                            }, 2000);
                            setTimeout(function() {
                              self.$emit("getData", {page: 1});
                            }, 5000);
                            setTimeout(function() {
                              self.$emit("getData", {page: 1});
                            }, 8000);
                          },
                          success: function(result) {
                            self.$message.success(Vue.t('calcStorLang.instRecyFloatIpSucess'));
                            self.$emit("handleIRFloatIpFlag", {});
                          },
                          errorKey: "NeutronError",
                          log:{
                            description:{
                              en:self.FIrow["name"]+" Remove floating IP:" + showips,
                              zh_cn:self.FIrow["name"]+" 解除绑定浮动IP:" + showips
                            },
                            target:Vue.logTarget.computeInstance
                          }
                        });
                      },
                      errorKey: "NeutronError"
                    });
                  }
                  }
                }
              });
            }
          }
        });
      }
      });
    }
  }
}
</script>
<style scoped>
</style>
