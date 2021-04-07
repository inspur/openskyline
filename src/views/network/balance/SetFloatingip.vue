<template>
  <el-dialog :title="$t('network.bangdingFloatingip')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" label-width="100px" class="me-required-form" v-loading="loading"
    :rules="rules">
      <el-form-item :label="$t('network.floatingIP')" class="is-required" prop="floatIp">
        <el-select v-model="form.floatIp" filterable clearable>
          <el-option v-for="item in totalFloatingIPs" :key="item.id" :label="item.floating_ip_address" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="addFloatingIp">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"AddFloatingIP",
  props: ["lbPortId", "projectId", "balanceName"],
  data() {
    return {
      dialogVisible: false,
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
      this.$emit("handleFloatingipShow", {});
      done();
    },
    cancel() {
      this.$emit("handleFloatingipShow", {});
    },
    async getData(projectid="") {
      var self = this;
      this.loading = true;
      let data = [];
       let statusTransfer = {"ACTIVE":Vue.t('lang.ACTIVE'), "DOWN":Vue.t('lang.DOWN'), "ERROR":Vue.t('lang.ERROR')};
      let roleType = Vue.roleType + "";
        if (roleType == "0") {
          projectid = self.projectId;
        } else {
          projectid = Vue.cookie.get('pid');
        }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/floatingips?project_id="+projectid,
          complete: function(XMLHttpRequest, textStatus) {
            self.loading = false;
          }
        });
        let tempArr = result["floatingips"];
        self.totalFloatingIPs = [];
        let length = 0;
        for (var i =0; i< tempArr.length; i++) {
          let floatingip = tempArr[i];
          if (floatingip != null && floatingip.fixed_ip_address === null && !(floatingip.port_forwardings.length)) {
              //未绑定的浮动ip
              floatingip.status = statusTransfer[floatingip.status];
              self.totalFloatingIPs.push(floatingip);
              length++;
            }
        }
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      } catch (res) {
        self.loading = false;
      }
    },
    async addFloatingIp() {
      var self = this;
      let reqdata = {"floatingip":{
                    "port_id": self.lbPortId
                  }
                  };
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          try {
            self.loading = true;
            //绑定之前先判断是否代绑定的浮动ip是否已经绑定了
            await self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/floatingips/"+self.form.floatIp,
            success: function(result) {
              if (result != null) {
                  let floatingip = result["floatingip"];
                  if (floatingip.fixed_ip_address != null) {
                    self.$message.error(Vue.t('network.floatingbinded'));
                  } else {
                    let ipaddress = "";
                    for (let i = 0; i < self.totalFloatingIPs.length; i++) {
                      let ips = self.totalFloatingIPs[i];
                      if (ips["id"] === self.form.floatIp) {
                        ipaddress = ips["floating_ip_address"];
                      }
                    }
                    self.$ajax({
                        type: 'PUT',
                        url: "api/neutron/v2.0/floatingips/"+self.form.floatIp,
                         data: JSON.stringify(reqdata),
                        success: function(result) {
                            self.loading = false;
                            self.$message.success(Vue.t('network.bindingsuccess'));
                            self.cancel();
                        },
                        errorKey: "NeutronError",
                        errFun: function() {
                          self.loading=false;
                        },
                        log:{
                          description:{
                            en:"Banding floating IP:"+ipaddress,
                            zh_cn:`为负载均衡器${self.balanceName}绑定浮动IP${ipaddress}`
                          },
                          target:Vue.logTarget.balance
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
        return true;
        } else {
        return false;
        }
      });
    }
  }
}
</script>
