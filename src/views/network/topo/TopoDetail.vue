<template>
  <el-dialog ref="dialogref" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag size="small">
  <span slot="title" class="el-dialog__title">
    {{dialogTitle}}
  </span>
  <div v-loading="loadinggl">  
    <el-button type="primary" size="small" icon="fa-play" @click="vmStartAction" :disabled="startDsiabled" v-if="vmView" style="margin-bottom:5px;">{{$t('calcStorLang.open')}}</el-button>
    <el-button type="primary" size="small" icon="fa-stop" @click="vmStopAction" :disabled="stopDsiabled" v-if="vmView" style="margin-bottom:5px;">{{$t('calcStorLang.closed')}}</el-button>
    <el-button type="primary" size="small" icon="fa-times" @click="handleNetworkdeleteAction" :disabled="IsDsiabled" v-if="showAddDiv" style="margin-bottom:5px;">{{$t('network.delete')}}</el-button>
    <div class="table_panel">
      <table class="table table-content table-hover idatatable" border="1">
        <tbody>
          <tr class="even">
            <th class="idatath">{{$t('lang.name')}}:</th>
            <td class="idatatd">
              {{name}}
            </td>
          </tr>
          <tr class="odd">
            <th class="idatath">{{$t('lang.status')}}:</th>
            <td class="idatatd">
              <span>{{resStatusRender(status)}}</span>
            </td>
          </tr>
          <tr class="even" v-if="vmView">
            <th class="idatath">{{$t('network.ipaddress')}}:</th>
            <td class="idatatd"><p v-html="ipaddress"></p></td>
          </tr>
          <tr class="even" v-if="subnetView">
            <th class="idatath">{{$t('network.networkshared')}}:</th>
            <td class="idatatd"><p v-html="networkexternal"></p></td>
          </tr>
        </tbody>
      </table>
    </div>
    <el-card class="box-card" v-if="subnetView">
      <div slot="header" class="clearfix">
        <span>{{$t('network.subnet')}}</span>
      </div>
      <div>
        <div class="operation-panel margin-tb5" v-if="showAddDiv">
          <operation-panel
            :select-rows="multipleSelection"
            :operation-menus="subnetOperation">
          </operation-panel>
        </div>
        <el-table
          ref="subnetTable"
          :data="subnettableData"
          highlight-current-row
          stripe
          border
          v-loading="subnetloading"
          style="width: 100%"
          row-key="id">
          <el-table-column
           :label="$t('lang.name')"
            prop="name"
            min-width="100">
          </el-table-column>  
          <el-table-column
            prop="cidr"
            label="CIDR"
            min-width="100">
          </el-table-column>
          <el-table-column
            prop="id"
            :label="$t('network.operation')"
            v-if="showAddDiv"
            min-width="100">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleSubnetDelete(scope.row)">{{$t('lang.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onSubnetRefresh"></el-button>
          </el-col>
          <el-col :span="19">
            <page :totalData="subnettotalData" @getCurrentData="getSubnetCurrentData"></page>
          </el-col>
        </el-row>
        </div>
      </div>
    </el-card>
    <el-card class="box-card" v-if="interfaceView">
      <div slot="header" class="clearfix">
        <span>{{$t('network.interface')}}</span>
      </div>
      <div>
        <div class="operation-panel margin-tb5" v-if="showAddDiv">
          <operation-panel
            :select-rows="multipleSelection"
            :operation-menus="interfaceOperation">
          </operation-panel>
        </div>
        <el-table
          ref="portsTable"
          :data="portstableData"
          highlight-current-row
          stripe
          border
          v-loading="interfaceloading"
          style="width: 100%;"
          row-key="id">
          <el-table-column
            :label="$t('lang.name')"
            prop="name"
            min-width="120">
            <template slot-scope="scope">
              <span>{{scope.row.name || scope.row.id}}</span>
            </template>
          </el-table-column>  
          <el-table-column
            prop="fixed_ip"
            :label="$t('network.fixedipaddress')"
            min-width="100">
            <template slot-scope="scope">
              <span v-html="fixedIPRender(scope.row.fixed_ips, scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column
            prop="device_owner"
            :label="$t('network.connectDevice')"
            min-width="100">
            <template slot-scope="scope">
              <span v-html="deviceownerRender(scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            :label="$t('lang.status')"
            min-width="50">
            <template slot-scope="scope">
              <span v-html="statusRender(scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column
            prop="id"
            :label="$t('network.operation')"
            v-if="showAddDiv"
            min-width="100">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleInterfaceDelete(scope.row)">{{$t('network.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
          </el-col>
          <el-col :span="19">
            <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
          </el-col>
        </el-row>
        </div>
      </div>
    </el-card>
   </div> 
  </el-dialog> 
</template>
<script>
export default {
  name: 'AddIPare',
  props: ["toponode"],
  data() {
    return {
      dialogVisible: false,
      subnetloading: false,
      interfaceloading: false,
      startDsiabled:false,
      stopDsiabled:false,
      name: "",
      status: "",
      ipaddress: "",
      type: "",
      networkId: "",
      networkexternal:"",
      routerId: "",
      serverId: "",
      dialogTitle: Vue.t('network.balanceDetailTab'),
      resTypeRender: Vue.resourceTypeFormatter,
      subnetView: false,
      interfaceView: false,
      vmView: false,
      IsDsiabled: false,
      loadinggl: false,
      showAddDiv: true,
      subnettableData: [],
      portstableData: [],
      totalData: [],
      subnettotalData: [],
      multipleSelection: [],
      subnetOperation: [{
        icon: "fa-plus",
        name: Vue.t('network.createSubnet'),
        showflg: true,
        readOnly: true,
        handler: function() {
           this.$emit("createSubnet", {networkId: this.networkId});
        }.bind(this)
      }],
      interfaceOperation: [{
        icon: "fa-plus",
        name: Vue.t('network.addInterface'),
        showflg: true,
        readOnly: true,
        handler: function() {
           this.$emit("createInterface", {routerId: this.routerId});
        }.bind(this)
      }]
    }
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    initDialog() {
      let self = this;
      self.dialogVisible = true;
      let roleType = Vue.roleType + "";
      self.name = self.toponode["name"];
      self.status = self.toponode["status"];
      self.type = self.toponode["type"];
      if (self.toponode["type"] == "OS::Neutron::Net" || self.toponode["type"] == "OS::Neutron::Netinside") {
        self.dialogTitle = Vue.t('network.networkdetail');
        self.subnetView = true;
        self.networkId = self.toponode["id"];
        self.networkexternal = self.toponode["shared"]?Vue.t('base.yes'):Vue.t('base.no')
        if (roleType!="0") {
          self.getNetworkDetail(self.networkId);
        }
        self.getSubnetList();
      } else if (self.toponode["type"] == "OS::Neutron::Router") {
        self.dialogTitle = Vue.t('network.routerdetail');
        self.interfaceView = true;
        self.routerId = self.toponode["id"];
        // if (roleType!="0") {
        //   self.getRouterDetail(self.routerId);
        // }
        self.getInterfaceList();
      } else {
        self.dialogTitle = Vue.t('network.cloudvmdetail');
        if (self.toponode["phyFlag"]) {
          self.dialogTitle = Vue.t('network.CLOUD_PHYSICAL_MACHINE_DETAIL');
        }
        self.vmView = true;
        self.subnetView = false;
        self.interfaceView = false;
        if ((Vue.roleType + "") != "0") {
          if (self.toponode["locked"]) {
            self.IsDsiabled = true;
          }
        }
        if (((Vue.roleType + "") != "0" && self.toponode['locked'] === true) || !(self.toponode['status'] == "SHUTOFF" && self.toponode['taskStatus'] == null)) {
           self.startDsiabled = true;
        }
        if (((Vue.roleType + "") != "0" && self.toponode['locked'] === true) || !(self.toponode['status'] == "ACTIVE" && self.toponode['taskStatus'] == null)) {
           self.stopDsiabled = true;
        }
        self.serverId = self.toponode["id"];
        let addresses = self.toponode["ipaddress"];
        self.ipaddress = self.ipAddressRender(addresses);
      }
    },
    getNetworkDetail(id) {
      let self = this;
      self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/networks/"+id,
        success: function(result) {
          let networkInfo = result['network'];
          if (networkInfo["project_id"] == Vue.cookie.get('pid')) {
            self.showAddDiv = true;
          } else {
            self.showAddDiv = false;
          }
        },
        errFun() {
          self.$emit("handleDetailShow", {});
          self.$emit("handleAddShow", {});
        }
      });
    },
    getRouterDetail(id) {
      let self = this;
      self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/routers/"+id,
        success: function(result) {
          let routerInfo = result['router'];
          if (routerInfo["project_id"] == Vue.cookie.get('pid')) {
            self.showAddDiv = true;
          } else {
            self.showAddDiv = false;
          }
        },
        errFun() {
          self.$emit("handleDetailShow", {});
          self.$emit("handleAddShow", {});
        }
      });
    },
    handleClose(done) {
      if (this.loadinggl == false) {
        this.$emit("handleDetailShow", {});
        done();
      }
    },
    cancel() {
      this.$emit("handleDetailShow", {});
    },
    async getSubnetList() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/subnets?network_id="+self.networkId
        });
        self.subnettotalData = result['subnets'];
      } catch (res) {
      }
    },
    getSubnetCurrentData(param) {
      this.subnettableData = param;
    },
    onSubnetRefresh() {
      this.getSubnetList();
    },
    handleSubnetDelete(row) {
      let self = this;
      self.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        type: "warning",
        closeOnClickModal: false,
        callback: (action, instance) => {
          if (action === "confirm") {
            self.subnetloading = true;
            self.$ajax({
              type: "DELETE",
              url: "api/neutron/v2.0/subnets/"+row["id"],
              data: {},
              success: function() {
                self.$notify({
                  message: row["name"]+Vue.t('network.deleteSendSuccess'),
                  type: "success"
                });
                self.subnetloading = false;
                self.getSubnetList();
              },
              errorKey: "NeutronError",
              errFun() {
                self.subnetloading = false;
                self.getSubnetList();
              },
              log:{
                description:{
                  en:"Delete Subnet:"+row["name"],
                  zh_cn:"删除子网:"+row["name"]
                },
                target:Vue.logTarget.subnetwork
              }
            });
          }
        }
      });
    },
    vmStartAction() {
        var self = this;
        var body = { "os-start": null };
        body = JSON.stringify(body);
        let confirmMsg = Vue.t('calcStorLang.openInstConfirm');
        let startLog = '开启云主机:';
        let target = Vue.logTarget.computeInstance;
        if (self.toponode["phyFlag"]) {
          confirmMsg = Vue.t('network.ARE_YOU_SURE_TO_TURN_ON_THE_CLOUD_PHYSICAL_MACHINE');
          startLog = '开启云物理机:';
          target = Vue.logTarget.computePhysical;
        }
        self.$ajax({
          type: 'post',
          data: body,
          url: 'api/nova/v2.1/servers/' + self.serverId + '/action',
          confirmMsg,
          log: {
            description: {
              en: "Start Instance:" + self.name,
              zh_cn: startLog + self.name
            },
            key: "name",
            target
          },
          successFun:() => {
            self.$notify({
              message: Vue.t('calcStorLang.openSendSuccess'),
              type: "success"
            });
            self.$emit("handleDetailShow", {});
            self.$emit("handleAddShow", {});
          }
        }).then((data) => {
        }).catch((err) => {});
    },
    vmStopAction() {
      var self = this;
      var body = { "os-stop": null };
      let confirmMsg = Vue.t('calcStorLang.closeInstConfirm');
      let startLog = '关闭云主机:';
      let target = Vue.logTarget.computeInstance;
      if (self.toponode["phyFlag"]) {
        confirmMsg = Vue.t('network.ARE_YOU_SURE_TO_TURN_OFF_THE_CLOUD_PHYSICAL_MACHINE');
        startLog = '关闭云物理机:';
        target = Vue.logTarget.computePhysical;
      }
        body = JSON.stringify(body);
        self.$ajax({
          type: 'post',
          data: body,
          url: 'api/nova/v2.1/servers/' + self.serverId + '/action',
          confirmMsg,
          log: {
            description: {
              en: "Shutdown Instance:" + self.name,
              zh_cn: startLog + self.name
            },
            target
          },
          successFun:() => {
            self.$notify({
              message: Vue.t('calcStorLang.closeSendSuccess'),
              type: "success"
            });
            self.$emit("handleDetailShow", {});
            self.$emit("handleAddShow", {});
          }
        }).then((data) => {
        }).catch((err) => {});
    },
    handleNetworkdeleteAction() {
      let self = this;
      if (self.toponode["type"] == "OS::Neutron::Net" || self.toponode["type"] == "OS::Neutron::Netinside") {
        self.$prompt(Vue.t('network.confirmDelete'), Vue.t('network.attention'), {
          confirmButtonText: Vue.t('lang.confirm'),
          cancelButtonText: Vue.t('lang.cancel'),
          inputPattern:/^YES$|^NO$/i,
          inputValue: "NO",
          customClass: "promptConfirmDel",
          inputErrorMessage:Vue.t('lang.onlyAcceptYesOrNo'),
          closeOnClickModal: false
        }).then(async({ value }) => {
          if ("yes" == value.toLowerCase()) {
            self.IsDsiabled = true;
            self.loadinggl = true;
            self.$ajax({
              type: "DELETE",
              url: "api/neutron/v2.0/networks/"+self.networkId,
              data: {},
              complete: function(XMLHttpRequest, textStatus) {
                self.IsDsiabled = false;
                self.loadinggl = false;
              },
              errFun() {
                self.$emit("handleDetailShow", {});
                self.$emit("handleAddShow", {});
              },
              success: function() {
                self.$notify({
                  message: self.name+Vue.t('network.deleteSendSuccess'),
                  type: "success"
                });
                self.$emit("handleDetailShow", {});
                self.$emit("handleAddShow", {});
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Delete Network:"+self.name,
                  zh_cn:"删除网络:"+self.name
                },
                target:Vue.logTarget.networkList
              }
            });
          }
        });
      } else if (self.toponode["type"] == "OS::Neutron::Router") {
        self.$prompt(Vue.t('network.confirmDelete'), Vue.t('network.attention'), {
          confirmButtonText: Vue.t('lang.confirm'),
          cancelButtonText: Vue.t('lang.cancel'),
          inputPattern:/^YES$|^NO$/i,
          inputValue: "NO",
          customClass: "promptConfirmDel",
          inputErrorMessage:Vue.t('lang.onlyAcceptYesOrNo'),
          closeOnClickModal: false
        }).then(async({ value }) => {
          if ("yes" == value.toLowerCase()) {
            self.IsDsiabled = true;
            self.loadinggl = true;
            self.$ajax({
              type: "DELETE",
              url: "api/neutron/v2.0/routers/"+self.routerId,
              data: {},
              complete: function(XMLHttpRequest, textStatus) {
                self.IsDsiabled = false;
                self.loadinggl = false;
              },
              errFun() {
                self.$emit("handleDetailShow", {});
                self.$emit("handleAddShow", {});
              },
              success: function() {
                self.$notify({
                  message: self.name+Vue.t('network.deleteSendSuccess'),
                  type: "success"
                });
                self.$emit("handleDetailShow", {});
                self.$emit("handleAddShow", {});
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:"Delete Router:"+self.name,
                  zh_cn:"删除路由:"+self.name
                },
                target:Vue.logTarget.router
              }
            });
          }
        });
      } else {
        let logZhCn = '删除云主机:';
        let logEn = 'Delete Instance: ';
        if (self.toponode["phyFlag"]) {
          logZhCn = '删除云物理机:';
          logEn = 'Delete Physical Instance'
        }
        self.$prompt(Vue.t('network.confirmDelete'), Vue.t('network.attention'), {
          confirmButtonText: Vue.t('lang.confirm'),
          cancelButtonText: Vue.t('lang.cancel'),
          inputPattern:/^YES$|^NO$/i,
          inputValue: "NO",
          customClass: "promptConfirmDel",
          inputErrorMessage:Vue.t('lang.onlyAcceptYesOrNo'),
          closeOnClickModal: false
        }).then(async({ value }) => {
          if ("yes" == value.toLowerCase()) {
            self.IsDsiabled = true;
            self.loadinggl = true;
            self.$ajax({
              type: "DELETE",
              url: "api/nova/v2.1/servers/"+self.serverId,
              data: {},
              complete: function(XMLHttpRequest, textStatus) {
                self.IsDsiabled = false;
                self.loadinggl = false;
              },
              errFun() {
                self.$emit("handleDetailShow", {});
                self.$emit("handleAddShow", {});
              },
              success: function() {
                self.$notify({
                  message: self.name+Vue.t('network.deleterequsetsuccess'),
                  type: "success"
                });
                self.$emit("handleDetailShow", {});
                self.$emit("handleAddShow", {});
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en: logEn+self.name,
                  zh_cn: logZhCn+self.name
                },
                target:Vue.logTarget.computeInstance
              }
            });
          }
        });
      }
    },
    handleInterfaceDelete(row) {
      let self = this;
      self.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        type: "warning",
        closeOnClickModal: false,
        callback: (action, instance) => {
          if (action === "confirm") {
            self.interfaceloading = true;
            let reqdata = {
              "port_id": row["id"]
            };
            let removeUrl = "api/neutron/v2.0/routers/"+self.routerId+"/remove_router_interface";
            if (row["device_owner"] == "network:router_gateway") {
              removeUrl = "api/neutron/v2.0/routers/" + self.routerId;
               reqdata = {
                      "router": {
                        "external_gateway_info": {
                        }
                      }
                    };
            }
            self.$ajax({
              type: "PUT",
              url: removeUrl,
              data: JSON.stringify(reqdata),
              complete: function(XMLHttpRequest, textStatus) {
                self.interfaceloading = false;
                self.getInterfaceList();
                self.$emit("handleAddShow", {});
              },
              success: function() {
                self.$notify({
                  message: row["id"]+Vue.t('network.deleteSuccess'),
                  type: "success"
                });
              },
              errorKey: "NeutronError",
              log:{
                description:{
                  en:self.name+" Delete Interface:" + row["id"],
                  zh_cn:"路由"+self.name+"删除接口:" + row["id"]
                },
                target:Vue.logTarget.router
              }
            });
          }
        }
      });
    },
    async getInterfaceList() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/ports?device_id="+self.routerId,
          errorKey: "NeutronError"
        });
        self.totalData = result['ports'];
      } catch (res) {
      }
    },
    getCurrentData(param) {
      this.portstableData = param;
    },
    onRefresh() {
      this.getInterfaceList();
    },
    fixedIPRender(value, row) {
      let showip = "";
      for (let i=0; i< value.length; i++) {
        let ips = value[i];
        if (i=== value.length-1) {
          showip += ips.ip_address
        } else {
          showip += ips.ip_address + ",  ";
        }
      }
      return showip;
    },
    deviceownerRender(row) {
      if (row["device_owner"]==="" && row["device_id"]==="") {
        return Vue.t('network.deviceDepart');
      } else if (row["device_owner"]==="" && row["device_id"]!="") {
        return Vue.t('network.connect');
      } else {
        return row["device_owner"];
      }
    },
    statusRender(row) {
      if (row["status"]==="ACTIVE") {
        return this.$t('lang.ACTIVE')
      } else if (row["status"]==="DOWN") {
        return this.$t('lang.DOWN')
      } else if (row["status"]==="BUILD") {
        return this.$t('lang.BUILD')
      } else if (row["status"]==="ERROR") {
        return this.$t('lang.ERROR')
      }
    },
    resStatusRender(value) {
      if (value == "BUSY") { //自定义状态,删除“软删除”和“已删除”状态
        return "<i class='el-icon-loading'></i>";
      } else if (value == "ACTIVE") {
        return this.$t('calcStorLang.running');
      } else if (value == "BUILD") {
        return this.$t('calcStorLang.build');
      } else if (value == "ERROR") {
        return this.$t('calcStorLang.error');
      } else if (value == "REBOOT") {
        return this.$t('calcStorLang.reboot');
      } else if (value == "HARD_REBOOT") {
        return this.$t('calcStorLang.hard_reboot');
      } else if (value == "PAUSED") {
        return this.$t('calcStorLang.paused');
      } else if (value == "MIGRATING") {
        return this.$t('calcStorLang.migrating');
      } else if (value == "PASSWORD") {
        return this.$t('calcStorLang.password');
      } else if (value == "REBUILD") {
        return this.$t('calcStorLang.rebuild');
      } else if (value == "RESCUE") {
        return this.$t('calcStorLang.rescue');
      } else if (value == "REVERT_RESIZE") {
        return this.$t('calcStorLang.revert_resize');
      } else if (value == "SHELVED") {
        return this.$t('calcStorLang.shelved_offloaded');
      } else if (value == "SHELVED_OFFLOADED") {
        return this.$t('calcStorLang.shelved_offloaded');
      } else if (value == "SHUTOFF") {
        return this.$t('calcStorLang.closed');
      } else if (value == "SUSPENDED") {
        return this.$t('calcStorLang.suspended');
      } else if (value == "UNKNOW") {
        return this.$t('calcStorLang.unknow');
      } else if (value == "VERIFY_RESIZE") {
        return this.$t('calcStorLang.verify_resize');
      } else {
        return "-";
      }
    },
    statusTagRender(value) {
      let tagType = "";
      if (value === "CREATE_COMPLETE" || value === "CHECK_COMPLETE" ||
        value === "ADOPT_COMPLETE" || value === "DELETE_COMPLETE" || value === "INIT_COMPLETE" ||
        value === "RESUME_COMPLETE" || value === "ROLLBACK_COMPLETE" || value === "SUSPEND_COMPLETE") {
        tagType = "success";
      } else if (value === "CREATE_IN_PROGRESS" || value === "DELETE_IN_PROGRESS" ||
        value === "CHECK_IN_PROGRESS" || value === "ADOPT_IN_PROGRESS" ||
        value === "DELETE_IN_PROGRESS" || value === "INIT_IN_PROGRESS" || value === "RESUME_IN_PROGRESS" ||
        value === "ROLLBACK_IN_PROGRESS" || value === "SUSPEND_IN_PROGRESS") {
        tagType = "primary";
      } else if (value === "CREATE_FAILED" || value === "DELETE_FAILED" ||
        value === "CHECK_FAILED" || value === "ADOPT_FAILED" || value === "DELETE_FAILED" ||
        value === "INIT_FAILED" || value === "RESUME_FAILED" || value === "ROLLBACK_FAILED" ||
        value === "SUSPEND_FAILED") {
        tagType = "danger";
      }
      return tagType;
    },
    ipAddressRender(address) {
      var list = Object.keys(address).map(function(el) {
          return address[el];
      });
      if (list != null) {
         if (list.length > 1) {
           var ipShow = "";
           for (let addr in address) {
             var ipList = address[addr];
             var ips = "";
             for (let n = 0; n < ipList.length; n++) {
               var net = ipList[n];
               var type = net['OS-EXT-IPS:type'];
               if (type == "floating") {
                 ips += net.addr + "(浮动IP)" + "<br>";
               } else {
                 ips += net.addr + "<br>";
               }
             }
             ipShow += ips;
           }
           return ipShow;
         } else if (list.length == 0) {
            return "-";
         } else {
           var ipShow2 = "";
           for (let addr in address) {
             var ipList2 = address[addr];
             var ips2 = "";
             for (let n = 0; n < ipList2.length; n++) {
               var net2 = ipList2[n];
               var type2 = net2['OS-EXT-IPS:type'];
               if (type2 == "floating") {
                 ips2 += net2.addr + "(浮动IP)" + "<br>";
               } else {
                 ips2 += net2.addr + "<br>";
               }
             }
             ipShow2 += ips2;
           }
           return ipShow2;
         }
      } else {
         return "-";
      }
    }
  }
}
</script>
<style type="text/css">
  .idatath {
    width: 50px;
  }
  .idatatd {
    text-align: left;
  }
</style>
