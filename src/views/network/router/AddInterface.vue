<template>
  <el-dialog :title="$t('network.addInterface')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
    <el-form ref="portForm" :model="portForm" class="me-required-form" label-width="100px" :rules="rules"
             v-loading="loading">
      <el-form-item :label="$t('network.subnet')" class="is-required" prop="subnet">
        <el-select class="col-12" v-model="portForm.subnet" @change="subnetChange" filterable>
          <el-option v-for="item in subnetOption" :key="item.id" :label="item.name + '(' + item.cidr + ')'"
                     :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.ipaddresschoose')" prop="ipaddress">
        <el-input class="col-12" v-model="portForm.ipaddress" :disabled="inputDisabled"></el-input>
        <el-tooltip effect="dark" :content="$t('network.routerNote1')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.routerName')" class="is-required">
        <label>{{routerName}}</label>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="addInterfaceClick" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
  export default {
    name: 'AddRouter',
    props: ["routerId", "interfaceList"],
    data() {
      return {
        flag: false,
        dialogVisible: false,
        loading: false,
        isDisabled: false,
        inputDisabled: false,
        interfaceList2: self.interfaceList,
        portForm: {
          subnet: "",
          ipaddress: ""
        },
        subnetOption: [],
        routerName: "",
        projectId: "",
        networkIfrom: "",
        rules: {
          subnet: [
            {type: 'requiredNet'}
          ],
          ipaddress: [
            {type: 'ipv4oripv6'}
          ]
        }
      }
    },
    mounted() {
      let self = this;
      self.$parent.$parent.active = "routerNet";
      self.interfaceList2 = self.interfaceList;
      self.initDialog();
      Promise.all([self.getRouteraName(self.routerId), self.getInterfaceList(self.routerId)]).then(function (result) {
        self.getSubnets();
      });
    },
    methods: {
      initDialog() {
        var self = this;
        self.dialogVisible = true;
      },
      async getProjectNetworks(projectId) {
        const $this = this;
        try {
          const res = await $this.$ajax({
            type: 'get',
            url: `api/neutron/v2.0/networks?project_id=${projectId}&shared=false&status=ACTIVE&router:external=false&not-tags=bm_deploy`
          });
          return res.networks;
        } catch (e) {
          __DEV__ && console.error(e);
        }
      },
      async getSharedNetworks() {
        const $this = this;
        try {
          const res = await $this.$ajax({
            type: 'get',
            url: `api/neutron/v2.0/networks?shared=true&status=ACTIVE&not-tags=bm_deploy`
          });
          return res.networks;
        } catch (e) {
          __DEV__ && console.error(e);
        }
      },
      async getNetworks(projectId) {
        const $this = this;
        return new Promise((resolve, reject) => {
          Promise.all([$this.getProjectNetworks(projectId), $this.getSharedNetworks()]).then((res) => {
            let networks = res[0].concat(res[1]);
            resolve(networks);
          }).catch(e => {
            reject(e);
          });
        });
      },
      async getSubnets() {
        let self = this;
        try {
          self.subnetOption = [];
          let roleType = Vue.roleType + "";
          let routerAddInterface = true;
          if (roleType === "0") {
            routerAddInterface = false;
          }
          let networks = await self.getNetworks(self.projectId);
          let resultData = await self.$ajax({
            type: 'post',
            data: JSON.stringify({'project_id': self.projectId, 'router_add_interface': routerAddInterface}),
            url: "api/neutron/v2.0/inspur/networkextension/get_subnets_by_project_id"
          });
          let subNetlist = [];
          let fixedSubnetList = [];
          for (let j = 0; j < self.interfaceList2.length; j++) {
            let obj = self.interfaceList2[j];
            for (let fixedIps of obj['fixed_ips']) {
              fixedSubnetList.push(fixedIps['subnet_id']);
            }
          }
          for (let i = 0; i < resultData.length; i++) {
            let flag = true;
            if (!/^HA subnet tenant .*/.test(resultData[i].name)) {
              for (let fixedSubnet of fixedSubnetList) {
                if (fixedSubnet == resultData[i]['id'] && resultData[i]['ip_version'] == '6') {
                  flag = false;
                  break;
                }
              }
              let network = networks.find(item => item.id === resultData[i].net_id);
              if (!network || network.tags.includes('bm_deploy')) {
                flag = false;
              }
              if (flag) {
                subNetlist.push(resultData[i]);
              }
            }
          }
          self.subnetOption = [];
          let allSubnet = [].concat(subNetlist);
          allSubnet = allSubnet.filter(item => !fixedSubnetList.includes(item.id));
          // for (let i = allSubnet.length - 1; i >= 0; i--) {
          //   let subnet = allSubnet[i];
          //   let netID = subnet.net_id;
          //   for (let item of self.interfaceList2) {
          //     if (item['network_id'] === netID) {
          //       allSubnet.splice(i, 1);
          //       break;
          //     }
          //   }
          // }
          self.subnetOption = allSubnet;
        } catch (res) {
          console.log(res)
        }
      },
      async getRouteraName(routerId) {
        let self = this;
        await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/routers/" + routerId,
          success: function (result) {
            let router = result["router"];
            self.routerName = router["name"];
            self.projectId = router["project_id"];
          }
        });
      },
      async getInterfaceList() {
        let self = this;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/ports?device_id=" + self.routerId,
            errorKey: "NeutronError"
          });
          self.interfaceList2 = result['ports'];
        } catch (res) {
        }
      },
      handleClose(done) {
        this.$emit("handleEditPortsShow", {});
        done();
      },
      subnetChange(value) {
        let self = this;
        let subA = this.subnetOption;
        for (let i = subA.length - 1; i >= 0; i--) {
          let subnet = subA[i];
          if (subnet.id === value) {
            self.networkIfrom = subnet.net_id;
            if (subnet["ip_version"] == 4) {
              self.rules.ipaddress = [{type: 'ipv4'}];
            } else {
              self.rules.ipaddress = [{type: 'ipv6'}];
            }
            // let flag = false;
            // for (let item of this.interfaceList2) {
            //   if (item['network_id'] == self.networkIfrom) {
            //     flag = true;
            //   }
            // }
            // if (flag) {
            //   self.inputDisabled = true;
            // } else {
            //   self.inputDisabled = false;
            // }
            break;
          }
        }
        self.$refs.portForm.validate(async (valid) => {
          if (valid) {
            return true;
          } else {
            return false;
          }
        });
      },
      cancel() {
        this.$emit("handleEditPortsShow", {});
      },
      addInterfaceClick() {
        let self = this;
        self.$refs.portForm.validate(async (valid) => {
          if (valid) {
            if (self.portForm.ipaddress === "") {
              self.loading = true;
              self.isDisabled = true;
              let reqdata = {
                "subnet_id": self.portForm.subnet
              };
              let result = self.$ajax({
                type: "PUT",
                url: "api/neutron/v2.0/routers/" + this.routerId + "/add_router_interface",
                data: JSON.stringify(reqdata),
                successMsg: Vue.t('network.saveSuccess'),
                success: function (result) {
                  self.loading = false;
                  self.isDisabled = false;
                  self.$emit("handleAddPortShow", {});
                },
                errorKey: "NeutronError",
                errFun() {
                  self.loading = false;
                  self.isDisabled = false;
                  self.cancel();
                },
                log: {
                  description: {
                    en: self.routerName + ":Add Interface",
                    zh_cn: "路由" + self.routerName + ":新增接口"
                  },
                  target: Vue.logTarget.interface
                }
              });
            } else {
              self.loading = true;
              self.isDisabled = true;
              let reqdata2 = {};
              let port = {};
              let fixips = [];
              let ipsobj = {};
              ipsobj.subnet_id = self.portForm.subnet;
              ipsobj.ip_address = self.portForm.ipaddress;
              fixips.push(ipsobj);
              port.fixed_ips = fixips;
              port.network_id = self.networkIfrom;
              reqdata2.port = port;
              let result2 = self.$ajax({
                type: "POST",
                url: "api/neutron/v2.0/ports",
                data: JSON.stringify(reqdata2),
                success: function (portresult) {
                  let portobj = portresult["port"];
                  let reqdata3 = {
                    "port_id": portobj["id"]
                  };
                  self.$ajax({
                    type: "PUT",
                    url: "api/neutron/v2.0/routers/" + self.routerId + "/add_router_interface",
                    data: JSON.stringify(reqdata3),
                    successMsg: "保存成功",
                    errorKey: "NeutronError",
                    success: function (result) {
                      self.loading = false;
                      self.isDisabled = false;
                      self.$emit("handleAddPortShow", {});
                    },
                    errFun() {
                      self.loading = false;
                      self.isDisabled = false;
                      self.cancel();
                    },
                    log: {
                      description: {
                        en: self.routerName + " :Add Interface",
                        zh_cn: "路由" + self.routerName + ":新增接口"
                      },
                      target: Vue.logTarget.router
                    }
                  });
                },
                errorKey: "NeutronError",
                errFun() {
                  self.loading = false;
                  self.isDisabled = false;
                  self.cancel();
                }
              });
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
