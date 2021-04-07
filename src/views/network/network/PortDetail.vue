<template>
<div>
  <el-collapse v-model="activePortNames">
    <el-collapse-item :title="$t('network.basicInfo')" name="basicinfo" style="text-align:left">
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath">{{$t('lang.name')}}：</th>
              <td class="idatatd">{{name}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">ID：</th>
              <td class="idatatd">{{portid}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.networkName')}}：</th>
              <td class="idatatd">{{netName}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.macAddress')}}：</th>
              <td class="idatatd">{{macaddress}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('lang.status')}}：</th>
              <td class="idatatd">{{statusRender(status)}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.manageStatus')}}：</th>
              <td class="idatatd">{{managestatusRender(adminstatusup)}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.portSafe')}}：</th>
              <td class="idatatd">{{portsecurityenabled}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.securityTeam')}}：</th>
              <td class="idatatd">{{portsecurityGroups}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.fixedipaddress')}}：</th>
              <td class="idatatd">{{fiexedIPlist}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-collapse-item>
    <el-collapse-item :title="$t('network.connectDevice')" name="connection" style="text-align:left">
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath">{{$t('network.deviceOwner')}}：</th>
              <td class="idatatd">{{deviceOwner}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.deviceId')}}：</th>
              <td class="idatatd">{{diviceId}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-collapse-item>
    <el-collapse-item :title="$t('network.bangding')" name="bangding" style="text-align:left">
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath">{{$t('network.vnicType')}}：</th>
              <td class="idatatd">{{vnictype}}</td>
            </tr>
            <tr class="even" v-show="havehost">
              <th class="idatath">{{$t('network.bangdingHost')}}：</th>
              <td class="idatatd">{{host}}</td>
            </tr>
            <tr class="odd" v-show="havevif">
              <th class="idatath">{{$t('network.vifType')}}：</th>
              <td class="idatatd">{{viftype}}</td>
            </tr>
            <tr class="odd" v-show="!vifhave">
              <th class="idatath">{{$t('network.vifDEtail')}}:ovs_hybrid_plug：</th>
              <td class="idatatd">
                {{ovs_hybrid_plug}}
                <span v-show="vifhave">{{$t('network.nothing')}}</span>
              </td>
            </tr>
            <tr class="even" v-show="!vifhave">
              <th class="idatath">{{$t('network.vifDEtail')}}:port_filter：</th>
              <td class="idatatd">
                {{port_filter}}
                <span v-show="vifhave">{{$t('network.nothing')}}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-collapse-item>
  </el-collapse>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: "PortDetail",
  props: ["portId"],
  data() {
    return {
      activePortNames:["basicinfo", "connection", "bangding"],
      name: "",
      portid: this.portId,
      netName: "",
      macaddress: "",
      status: "",
      adminstatusup: "",
      loading:false,
      deviceOwner: "",
      diviceId: "",
      vnictype: "",
      host: "",
      vnicgaiyao: "",
      viftype: "",
      port_filter: "",
      fiexedIPlist: "",
      vifhave: false,
      havevif: false,
      havehost: false,
      ovs_hybrid_plug: "",
      portsecurityenabled: "",
      portsecurityGroups:"-",
      securityGroupsMap:new Map()
    }
  },
  mounted() {
  },
  methods: {
    getInit() {
      let me = this;
      Promise.all([this.getSecurityGroupList()]).then(function(result) {
        me.initDetail();
      });
    },
    initDetail() {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/ports/"+this.portId,
        data: {},
        success: function(result) {
          let port = result["port"];
          self.name = port["name"] || "";
          /*if (port["name"] === "") {
            self.name = port["id"];
          }*/
          self.portid = port["id"];
          self.getNetworkname(port["network_id"]);
          self.macaddress = port["mac_address"];
          self.status = port["status"];
          self.adminstatusup = port["admin_state_up"];
          if (port["port_security_enabled"] != undefined) {
            self.portsecurityenabled = port["port_security_enabled"].toString();
          } else {
            self.portsecurityenabled = "true";
          }
          if (self.portsecurityenabled === "true") {
            let pgs = port["security_groups"];
            let arr = [];
            pgs.forEach(element => {
              arr.push(self.securityGroupsMap.get(element));
            });
            self.portsecurityGroups = arr.join(";");
          }
          if (port["device_owner"] === "") {
            self.deviceOwner = Vue.t('network.nothing');
          } else {
            self.deviceOwner = port["device_owner"];
          }
          if (port["device_id"] === "") {
            self.diviceId = Vue.t('network.nothing');
          } else {
            self.diviceId = port["device_id"];
          }
          self.vnictype = port["binding:vnic_type"];
          if (port["binding:vnic_type"] == "normal") {
            self.vnictype = Vue.t('network.normal');
          } else if (port["binding:vnic_type"] == "direct") {
            self.vnictype = Vue.t('network.streght');
            if ('binding:profile' in port && port['binding:profile'] instanceof Object) {
              if ('capabilities' in port['binding:profile'] && port['binding:profile']['capabilities'] instanceof Array) {
                if (port['binding:profile']['capabilities'].includes('switchdev')) {
                  self.vnictype = Vue.t('network.streght') + '(' + Vue.t('network.switchdevon') + ')';
                }
              }
            }
          } else if (port["binding:vnic_type"] == "macvtap") {
            self.vnictype = "MacVTap";
          }
          if (port["binding:host_id"]!=undefined && port["binding:host_id"]!="") {
            self.havehost = true;
            self.host= port["binding:host_id"];
          }
          if (port["binding:vif_type"]!=undefined && port["binding:vif_type"]!="") {
            self.havevif = true;
            self.viftype = port["binding:vif_type"];
            let vifDetails= port["binding:vif_details"];
            if (vifDetails!= undefined) {
              if (!vifDetails["port_filter"]) {
                self.vifhave = true;
              } else {
                self.vifhave = false;
                self.port_filter = vifDetails["port_filter"];
                self.ovs_hybrid_plug = vifDetails["ovs_hybrid_plug"];
              }
            }
          } else {
            self.havevif = false;
            self.vifhave = false;
          }
          self.fiexedIPlist = "";
          let fixedIps = port["fixed_ips"];
          if (fixedIps.length === 0) {
            self.fiexedIPlist = Vue.t('network.nothing');
          } else {
            for (let i = 0; i < fixedIps.length; i++) {
              let ips = fixedIps[i];
              if (i == fixedIps.length - 1) {
                self.fiexedIPlist += ips["ip_address"];
              } else {
                self.fiexedIPlist += ips["ip_address"] + ",";
              }
            }
          }
        },
        errorKey: "NeutronError"
      });
    },
    async getSecurityGroupList() {
      let self = this;
      let result = await self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/security-groups",
        success: function(result) {
          let sublist = result['security_groups'];
          for (let s of sublist) {
            self.securityGroupsMap.set(s.id, s.name)
          }
        }
      });
    },
    getNetworkname(networkID) {
      let self = this;
      self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/networks/"+networkID,
        success: function(result) {
          let network = result["network"];
          self.netName = network["name"];
        }
      });
    },
    managestatusRender(value) {
      if (value == true) {
        return "UP";
      } else {
        return "DOWN";
      }
    },
    statusRender(value) {
      if (value==="ACTIVE") {
        return this.$t('lang.ACTIVE')
      } else if (value==="DOWN") {
        return this.$t('lang.DOWN')
      } else if (value==="BUILD") {
        return this.$t('lang.BUILD')
      } else if (value==="ERROR") {
        return this.$t('lang.ERROR')
      } else {
        return value;
      }
    }
  }
}
</script>
<style type="text/css">
  .idatath{
    width: 180px;
  }
</style>
