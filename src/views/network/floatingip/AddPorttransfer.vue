<template>
  <div>
    <el-dialog :title="$t('network.portTransfer') + title_" :visible.sync="dialogVisible" :before-close="cancel">
      <el-form ref="form" :model="form" class="me-required-form" label-width="120px" :rules="rules" v-loading="loading">
        <el-form-item :label="$t('network.protocol')" class="is-required" prop="protocol">
          <el-select class="col-10" v-model="form.protocol">
            <el-option label="tcp" value="tcp"></el-option>
            <el-option label="udp" value="udp"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('network.extPort')" class="is-required" prop="extPort">
          <el-input class="col-10" v-model="form.extPort"></el-input>
          <el-tooltip placement="top" trigger="hover" :content="$t('network.INTERGER_RANGE',{numbers1:0,numbers2:65535})">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.instance')" class="is-required" prop="vm">
          <el-select v-model="form.vm" class="col-10" filterable @change="getPorts">
            <el-option v-for="item in vmOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('network.portConnecting')" class="is-required" prop="portConnecting">
          <el-select v-model="form.portConnecting" class="col-10" filterable :loading="selLoading">
            <el-option v-for="item in portConnectingOptions" :key="item.ipAddress" :label="item.ipAddress" :value="item.ipAddress"></el-option>
          </el-select>
          <el-tooltip placement="top" trigger="hover" :content="isCN?'仅显示已经通过路由器和外部网络连接的云主机IP':'only the virtual machine ip that has been connected through router and external network is displayed'">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('network.innerPort')" class="is-required" prop="innerPort">
          <el-input class="col-10" v-model="form.innerPort"></el-input>
          <el-tooltip placement="top" trigger="hover" :content="$t('network.INTERGER_RANGE',{numbers1:0,numbers2:65535})">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button @click="confirm" type="primary" :disabled="loading">{{$t('lang.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script type="text/javascript">
export default {
  props: ["proId", "netId", "floatipId", "floatip", 'type', 'entity'],
  name: "AddFloatingIP",
  data() {
    return {
      isCN: String(Vue.config.lang) === 'zh-cn',
      title_: this.type === 'modify' ? Vue.t('lang.modify') : Vue.t('lang.addTo'),
      dialogVisible: true,
      portConnectingOptions: [],
      vmOptions: [],
      loading: false,
      selLoading: false,
      getPortsCount: 0,
      form: {
        protocol: "tcp",
        extPort: "",
        vm: "",
        portConnecting: "",
        innerPort: ""
      },
      rules: {
        extPort: [
          { type: 'required' },
          { type: 'integer' },
          { type: 'min', value: 1 },
          { type: 'max', value: 65534 }
        ],
        // innerIP: [
        //   { type: 'required' }
        // ],
        vm: [
          { type: 'required' }
        ],
        portConnecting: [
          { type: 'required' }
        ],
        innerPort: [
          { type: 'required' },
          { type: 'integer' },
          { type: 'min', value: 1 },
          { type: 'max', value: 65534 }
        ]
      }
    }
  },
  mounted() {
    let self = this;
    Promise.all([self.getVms()]).then(function(result) {
        self.getPorts();
    });
    if (this.type === 'modify') {
      this.form.protocol = this.entity.protocol;
      this.form.extPort = this.entity.external_port;
      this.form.innerPort = this.entity.internal_port;

      this.portConnectingOptions = [
        {
          id: this.entity.internal_port_id,
          fixed_ips: [{ ip_address: this.entity.internal_ip_address }],
          ipAddress: this.entity.internal_ip_address
        }
      ];
      this.form.portConnecting = this.entity.internal_ip_address;
    }
  },
  methods: {
    async getPorts() {
      this.getPortsCount++;
      let self = this;
      if (this.getPortsCount > 1) {
        this.form.port = "";
        this.portConnectingOptions = [];
        if (this.type === 'add') {
          this.form.portConnecting = '';
        }
      }

      if (!this.form.vm) {
        return;
      }
      let body = {
        "project_id": self.proId,
        "floating_network_id": self.netId,
        "device_id":self.form.vm
      };
      self.selLoading = true;
      try {
        let res = await self.$ajax({
          type: 'post',
          data: JSON.stringify(body),
          url: "api/neutron/v2.0/inspur/networkextension/get_ports_for_floating_ip_to_bind"
        });
        self.selLoading = false;
        let portConnectingOptions = res;
        let hasFlag = false;
        for (let i=0; i<portConnectingOptions.length; i++) {
          let ports = portConnectingOptions[i];
          ports["ipAddress"] = ports.fixed_ips[0].ip_address || "";
          if (ports["ipAddress"] == self.form.portConnecting) {
            hasFlag = true;
          }
        }
        self.portConnectingOptions = portConnectingOptions;
        if (!hasFlag && res.length > 0) {
          self.form.portConnecting = res[0]["ipAddress"];
        }
      } catch (res) {
        self.selLoading = false;
      }
    },
    async getVms() {
      const self = this;
      self.loading = true;
      let url = "";
      if (Vue.roleType == "0") {
        url = "api/nova/v2.1/servers-inspur/detail?project_id=" + self.proId + "&limit=999&all_tenants=1&filter-vm-name=Bare@"
      } else if (Vue.roleType == "3") {
        var userId = this.$cookie.get('roleId');
        url = "api/nova/v2.1/servers-inspur/detail?project_id=" + self.proId + "&limit=999&user_id="+Vue.userId+"&filter-vm-name=Bare@"
      } else {
        url = "api/nova/v2.1/servers-inspur/detail?project_id=" + self.proId + "&limit=999&filter-vm-name=Bare@"
      }
      try {
        // 由于后台无法对可用的物理机进行过滤 需要再请求一边不传device_id参数用于主机过滤
        let filterVmBody = {
          "project_id": self.proId,
          "floatingip_id": self.floatipId
        };
        let filterVm = await self.$ajax({
          type: 'post',
          data: JSON.stringify(filterVmBody),
          url: "api/neutron/v2.0/inspur/networkextension/get_ports_for_floating_ip_to_bind"
        });
        let res = await self.$ajax({
          type: 'get',
          headers: {
            'X-OpenStack-Nova-API-Version': 2.9
          },
          url: url
        });
        let deviceID = '';
        let deviceIds = [];
        for (let v of filterVm) {
          deviceIds.push(v.device_id);
          if (v.fixed_ips && v.fixed_ips[0] && v.fixed_ips[0].ip_address == this.entity.internal_ip_address) {
            deviceID = v.device_id;
          }
        }
        self.vmOptions.length = 0;
        let servers = res['servers'];
        for (let i = 0; i < servers.length; i++) {
          if (deviceIds.includes(servers[i].id)) {
            self.vmOptions.push(servers[i]);
          }
          if (deviceID == servers[i].id) {
            self.form.vm = servers[i].id;
          }
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    portChange(val) {
      this.form.portConnecting = val;
    },
    cancel() {
      this.$emit("hide");
    },
    confirm() {
      this.type === 'add' ? this.add() : this.modify();
    },
    async modify() {
      let self = this;
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return false;
        }
        let portId = "";
        for (let i=0; i< self.portConnectingOptions.length; i++) {
          let ports = self.portConnectingOptions[i];
          ports["ipAddress"] = ports.fixed_ips[0].ip_address || "";
          if (ports["ipAddress"] == self.form.portConnecting) {
            portId = ports["id"];
          }
        }
        let data = {
          "port_forwarding": {
            "protocol": self.form.protocol,
            "internal_port": parseInt(self.form.innerPort),
            "internal_port_id": portId,
            "external_port": parseInt(self.form.extPort)
          }
        };
        // let port = this.portConnectingOptions.find((item) => {
        //   return item.id == this.form.portConnecting;
        // });
        // if (port) {
          data.port_forwarding.internal_ip_address = this.form.portConnecting;
        // }
        self.loading = true;

        await self.$ajax({
          type: "get",
          url: `api/neutron/v2.0/floatingips/${self.floatipId}/port_forwardings`
        }) || {};

        self.$ajax({
          type: "PUT",
          url: `api/neutron/v2.0/floatingips/${self.floatipId}/port_forwardings/${self.entity.id}`,
          data: JSON.stringify(data),
          errorKey: "NeutronError",
          showErrMsg: false,
          log: {
            description: {
              en: "Floating ip:" + self.floatip + "modify port transfer",
              zh_cn: "浮动IP:" + self.floatip + "修改端口转发"
            },
            target: Vue.logTarget.floatingIP
          },
          successFun: function (result) {
            self.loading = false;
            self.$message({
              type: "info",
              message: Vue.t('storage.updateSuccess')
            });
            self.$emit("hide");
            self.$emit("refresh", self.entity);
          },
          errFun: function (result) {
            self.loading = false;
            const responseText = result.responseText;
            if (responseText.indexOf("A duplicate port forwarding") != -1 && responseText.indexOf("internal_port_id") != -1) {
              self.$message.error(Vue.t('network.DUPLICATE_PORT_FORWARDING'));
            } else {
              self.$errMsg(result.responseJSON.NeutronError.message, result.status);
            }
          }
        });
        return valid;
      });
    },
    async add() {
      let self = this;
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let port = this.portConnectingOptions.find((item) => {
            return item.ipAddress == this.form.portConnecting;
          });
          let data = {
            "port_forwarding": {
              "protocol": self.form.protocol,
              "internal_port": parseInt(self.form.innerPort),
              "internal_port_id": port.id,
              "external_port": parseInt(self.form.extPort)
            }
          };
          data.port_forwarding.internal_ip_address = self.form.portConnecting;
          self.loading = true;
          self.$ajax({
            type: "POST",
            url: "api/neutron/v2.0/floatingips/" + self.floatipId + "/port_forwardings",
            data: JSON.stringify(data),
            errorKey: "NeutronError",
            showErrMsg: false,
            log: {
              description: {
                en: "Floating ip:" + self.floatip + "add port transfer",
                zh_cn: "浮动IP:" + self.floatip + "添加端口转发"
              },
              target: Vue.logTarget.floatingIP
            },
            successFun: function (result) {
              self.loading = false;
              self.$message({
                type: "info",
                message: Vue.t('network.ADD_SUCCESS')
              });
              self.$emit("hide");
              self.$emit("refresh");
            },
            errFun: function (result) {
              self.loading = false;
              const responseText = result.responseText;
              // 不给返回状态码以这种形式判断也是绝了
              if (responseText.indexOf("A duplicate port forwarding") != -1 && responseText.indexOf("internal_port_id") != -1) {
                self.$message.error(Vue.t('network.DUPLICATE_PORT_FORWARDING'));
              } else {
                self.$errMsg(result.responseJSON.NeutronError.message, result.status);
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
