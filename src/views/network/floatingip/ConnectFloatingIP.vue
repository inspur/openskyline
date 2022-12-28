<template>
  <el-dialog :title="$t('network.bangdingFloatingip')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form"  label-width="120px" :rules="rules" :loading="loading">
      <el-form-item :label="$t('network.ipaddress')" class="is-required">
        <!-- <span>{{bangdingIp}}</span> -->
        <el-input disabled v-model="bangdingIp" class="col-8"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.portConnecting')" class="is-required" prop="port_id">
        <el-select v-model="form.port_id" class="col-8" filterable>
          <el-option v-for="item in portoptions" :key="item.id" :label="portRender(item.id)" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="addFloatingIp()" :disabled="disabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"ConnectFloatingIP",
  props: ["bangdingId", "bangdingIp", "floating_network_id", "project_id", "floatingList"],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      disabled: false,
      networkList: Vue.networkList,
      internalNetwork:[],
      routersList:"",
      portoptions: [],
      value: "",
      form: {
        port_id:""
      },
      rules: {
        port_id: [
          {type: "requiredNet"}
        ]
      }
    }
  },
  mounted() {
    this.dialogVisible = true;
    // this.getRotuters(this.floating_network_id);
    this.getPorts();
  },
  methods: {
    handleClose(done) {
      this.$emit("handleEditShowCancel", {});
      done();
    },
    cancel() {
      this.$emit("handleEditShowCancel", {});
    },
    confirm() {
      this.$emit("handleEditShow", {});
    },
    async getPorts() {
      var self = this;
      self.loading = true;
      try {        
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/networks?router:external=false"
        });
        let nets = result["networks"];
        debugger
        let res=[];
        for (var j = 0; j < nets.length; j++) {          
          let result1 = await self.$ajax({
            type: 'GET',
            url: "api/neutron/v2.0/ports?network_id="+ nets[j].id
          });
          result1.ports.forEach(i => {
            res.push(i);
          })
        };
        self.loading = false;
        this.portoptions = res;
      } catch (res) {
        self.loading = false;
      }
    },
    //获取浮动ip所在外部网络所连接到的路由信息
    async getRotuters(externalNetworkId) {
      var self = this;
      let data = [];
      try {
        let resultRouter = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/routers?project_id="+this.project_id
        });
        let routers = resultRouter["routers"];
        for (var i = routers.length - 1; i >= 0; i--) {
          let router = routers[i];
          if (router !=null && router.external_gateway_info!=null && externalNetworkId === router.external_gateway_info.network_id) {
            //根据端口:连接到路由的,属于内部网络的,获取其所在的内部网络
            self.getinternalNetwork(router.id, "network:router_interface");
            self.getinternalNetwork(router.id, "network:ha_router_replicated_interface");
          };
        }
      } catch (res) {
      }
    },
    //获取端口所在的内部网络列表
    getinternalNetwork(routerId, deviceOwner) {
      var self = this;
      try {
        let resultPort = self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/ports?device_id="+routerId+"&device_owner="+deviceOwner,
          async:false,
          success: function(result) {
            let ports = result["ports"];
            if (ports !=null && ports.length !=0) {
              for (var i = ports.length - 1; i >= 0; i--) {
                  let port = ports[i];
                if (port !=null && port.network_id !=null) {
                  self.internalNetwork.push(port.network_id);
                }
              }
              if (self.internalNetwork !=null && self.internalNetwork.length !=0) {
                self.getPortsInfo(self.internalNetwork, '');
              }
            }
          }
        });
      } catch (res) {
      }
    },
    getPortsInfo(internalNetworkIds, deviceOwner) {
      var self = this;
      try {
        for (let i = internalNetworkIds.length - 1; i >= 0; i--) {
          //获取内部网络下云主机连接的端口
        if (internalNetworkIds[i] !=null) {
          let resultPortInfo = self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/ports?network_id="+internalNetworkIds[i],
            async:false,
            success: function(result) {
              let portsDta = result["ports"];
              if (portsDta != null && portsDta.length != 0) {
                for (let j = portsDta.length - 1; j >= 0; j--) {
                  if (portsDta[j].device_owner != "network:router_interface" &&
                      portsDta[j].device_owner != "network:ha_router_replicated_interface" &&
                      portsDta[j].device_owner != "network:dhcp") {
                    if (portsDta[j].project_id === self.project_id) {
                      let pushflag = true;
                      for (let k = 0; k < self.floatingList.length; k++) {
                        let floatingobj = self.floatingList[k];
                        if (floatingobj["port_id"]!=null && floatingobj["port_id"] == portsDta[j]["id"]) {
                          pushflag = false;
                        }
                      }
                      if (pushflag) {
                        self.portoptions.push(portsDta[j]);
                      }
                    }
                  }
                }
              }
            }
          });
        }
        }
        self.portoptions = self.uniqueIds(self.portoptions);
      } catch (res) {
      }
    },
    uniqueIds(arr) {
      let allArray = [];
      for (let i=0; i<arr.length; i++) {
        var flag = true;
        for (let j = 0; j < allArray.length; j++) {
          if (allArray[j].id === arr[i].id) {
            flag = false;
          }
        }
        if (flag) {
          allArray.push(arr[i]);
        }
      }
      return allArray;
    },
    portRender(portid) {
      for (let i=0; i<this.portoptions.length; i++) {
        let port = this.portoptions[i];
        if (portid === port.id) {
          return port.fixed_ips[0].ip_address;
        }
      }
    },
    async getVMName(vmid) {
      var self = this;
      let data = [];
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.0/servers/"+vmid,
          complete: function(XMLHttpRequest, textStatus) {
          }
        });
        let vm = result["server:name"];
      } catch (res) {
      }
    },
    async addFloatingIp() {
      var self = this;
      let reqdata = {
        "floatingip":{
           "port_id": self.form.port_id
        }
      };
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          self.$ajax({
            type: "GET",
            url: "api/neutron/v2.0/floatingips/"+self.bangdingId,
            success: function(result) {
              let floatingTemp = result["floatingip"];
              if (floatingTemp["fixed_ip_address"] != null) {
                self.$notify({
                  message: Vue.t('network.IP_IS_BOUND_TO_A_PORT'),
                  type: "error"
                });
                self.confirm();
              } else {
                self.loading = true;
                self.disabled = true;
                let result = self.$ajax({
                  type: 'PUT',
                  url: "api/neutron/v2.0/floatingips/"+self.bangdingId,
                   data: JSON.stringify(reqdata),
                  success: function(result) {
                    self.loading = false;
                    self.disabled = false;
                    self.$message.success(Vue.t('network.bindingsuccess') + "," + Vue.t('network.pleaseRefreshList'));
                    self.confirm();
                  },
                  errFun() {
                    self.loading = false;
                    self.disabled = false;
                  },
                  errorKey: "NeutronError",
                  log:{
                    description:{
                      en:"Binding floating ip:" + self.bangdingIp,
                      zh_cn:"绑定浮动IP:" + self.bangdingIp
                    },
                    target:Vue.logTarget.floatingIP
                  }
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
