<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix" style="text-align:left;">
        <span>{{$t('network.ipsecconnecdetail')}}</span>
      </div>
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath">{{$t('lang.name')}}：</th>
              <td class="idatatd">{{name}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('lang.desc')}}：</th>
              <td class="idatatd">{{description}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">ID：</th>
              <td class="idatatd">{{id}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('lang.project')}}：</th>
              <td class="idatatd">{{project_name}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.vpnServer')}}：</th>
              <td class="idatatd">{{vpnServer}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.localendpointgroup')}}：</th>
              <td class="idatatd">{{localEndpointGroup}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.ikeStrategy')}}：</th>
              <td class="idatatd">{{ikeStrategy}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.ipsecStrategy')}}：</th>
              <td class="idatatd">{{ipsecStrategy}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.peeraddress')}}：</th>
              <td class="idatatd">{{peeraddress}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.parterId')}}：</th>
              <td class="idatatd">{{peerid}}</td>
            </tr>
            <!-- <tr class="even">
              <th class="idatath">{{$t('network.peercidrs')}}：</th>
              <td class="idatatd">{{peercidrs}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.peercidrs')}}：</th>
              <td class="idatatd">{{peercidrs}}</td>
            </tr> -->
            <tr class="odd">
              <th class="idatath">{{$t('network.peerendpointgroup')}}：</th>
              <td class="idatatd">{{peerEndpointGroup}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.mtumin')}}：</th>
              <td class="idatatd">{{mtu}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.dpdation')}}：</th>
              <td class="idatatd">{{dpdaction}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.dpdinterval')}}：</th>
              <td class="idatatd">{{dpdinterval}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.dpdtimeout')}}：</th>
              <td class="idatatd">{{dpdtimeout}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.authMode')}}：</th>
              <td class="idatatd">{{authorMode}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.routerMode')}}：</th>
              <td class="idatatd">{{routerMode}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.initiator')}}：</th>
              <td class="idatatd">{{initiator}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.manageStatus')}}：</th>
              <td class="idatatd">{{adminstateup}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('lang.status')}}：</th>
              <td class="idatatd">
                <el-tag :type="statusTagRender(status)">
                  <span v-html="statusRender(status)"></span>
                </el-tag>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-card>
  </div>
</template>
<script>
export default {
  name: "IkeDetail",
  props: ["stationId"],
  data() {
    return {
      name: "",
      description: "",
      id: "",
      project_id: "",
      project_name: "",
      vpnServer: "",
      localEndpointGroup:"",
      ikeStrategy: "",
      ipsecStrategy: "",
      peeraddress: "",
      peerid: "",
      peercidrs: "",
      peerEndpointGroup:"",
      psk: "",
      mtu: "",
      dpdaction: "",
      dpdinterval: "",
      dpdtimeout: "",
      initiator: "",
      authorMode: "",
      routerMode: "",
      status: "",
      adminstateup: true
    }
  },
  mounted() {
    // this.initDetail();
  },
  methods: {
    initDetail() {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/vpn/ipsec-site-connections/"+this.stationId,
        data: {},
        success: function(result) {
          let connection = result["ipsec_site_connection"];
          self.name = connection["name"];
          self.description = connection["description"];
          self.id = connection["id"];
          self.projectIdToName(connection["project_id"]);
          self.serverToName(connection["vpnservice_id"]);
          self.ikeToName(connection["ikepolicy_id"]);
          self.ipsecToName(connection["ipsecpolicy_id"]);
          self.peeraddress = connection["peer_address"];
          self.peerid = connection["peer_id"];
          self.peercidrs = connection["peer_cidrs"];
          self.psk = connection["psk"];
          self.mtu = connection["mtu"];
          self.dpdaction = self.convertDpdaction(connection["dpd"]["action"]);
          self.dpdinterval = connection["dpd"]["interval"];
          self.dpdtimeout = connection["dpd"]["timeout"];
          self.initiator = self.convertInitiator(connection["initiator"]);
          self.authorMode = connection["auth_mode"];
          self.routerMode = connection["route_mode"];
          self.status = connection["status"];
          self.adminstateup = self.adminstateupRender(connection["admin_state_up"]);
          self.localendpointGroupToName(connection["local_ep_group_id"]);
          self.peerendpointGroupToName(connection["peer_ep_group_id"]);
        },
        errorKey: "NeutronError",
        errFun() {
          self.$emit("onBackRefresh", {});
        }
      });
    },
    projectIdToName(projectId) {
      let self = this;
      this.$ajax({
        type: "GET",
        url: "api/keystone/v3/projects/" + projectId,
        success: function(result) {
          let project = result["project"];
          self.project_name = project.name;
        },
        errFun:function() {
          self.project_name = "";
        }
      });
    },
    ikeToName(id) {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/vpn/ikepolicies/"+id,
        data: {},
        success: function(result) {
          let ikepolicy = result["ikepolicy"];
          self.ikeStrategy = ikepolicy["name"]
        },
        errFun:function() {
          self.ikeStrategy = "";
        }
      });
    },
    ipsecToName(id) {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/vpn/ipsecpolicies/"+id,
        data: {},
        success: function(result) {
          let ipsecpolicy = result["ipsecpolicy"];
          self.ipsecStrategy = ipsecpolicy["name"]
        },
        errFun:function() {
          self.ipsecStrategy = "";
        }
      });
    },
    localendpointGroupToName(id) {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/vpn/endpoint-groups/" + id,
        data: {},
        success:function(result) {
          let endpointGroup = result["endpoint_group"];
          self.localEndpointGroup = endpointGroup["name"]
        },
        errFun:function() {
          self.localEndpointGroup = "";
        }
      });
    },
    peerendpointGroupToName(id) {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/vpn/endpoint-groups/" + id,
        data: {},
        success:function(result) {
          let endpointGroup = result["endpoint_group"];
          self.peerEndpointGroup = endpointGroup["name"];
        },
        errFun:function() {
          self.peerEndpointGroup = "";
        }
      });
    },
    serverToName(id) {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/vpn/vpnservices/"+id,
        data: {},
        success: function(result) {
          let vpnservice = result["vpnservice"];
          self.vpnServer = vpnservice["name"]
        },
        errFun:function() {
          self.vpnServer = "";
        }
      });
    },
    adminstateupRender(value) {
      if (value == true) {
        return "UP";
      } else if (value == false) {
        return "DOWN";
      } else {
        return value;
      }
    },
    statusRender(status) {
      if (status==="ACTIVE") {
        return Vue.t('lang.ACTIVE');
      } else if (status==="DOWN") {
        return Vue.t('network.close');
      } else if (status==="PENDING_UPDATE") {
        return Vue.t('network.UPDATE');
      } else if (status==="PENDING_CREATE") {
        return Vue.t('network.ready');
      } else if (status==="PENDING_DELETE") {
        return Vue.t('network.DELETING');
      } else if (status==="BUILD") {
        return Vue.t('network.BUILD');
      } else if (status==="ERROR") {
        return Vue.t('lang.ERROR');
      }
    },
    statusTagRender(status) {
      if (status==="ACTIVE") {
        return "success";
      } else if (status==="DOWN") {
        return "gray";
      } else if (status==="PENDING_UPDATE") {
        return "info";
      } else if (status==="PENDING_CREATE") {
        return "info";
      } else if (status==="PENDING_DELETE") {
        return "info";
      } else if (status==="BUILD") {
        return "success";
      } else if (status==="ERROR") {
        return "danger";
      }
    },
    convertDpdaction(status) {
      if (status==="hold") {
        return Vue.t('network.keep');
      } else if (status==="clear") {
        return Vue.t('network.clear');
      } else if (status==="disabled") {
        return Vue.t('network.disabled');
      } else if (status==="restart") {
        return Vue.t('network.restart');
      } else if (status==="restart-by-peer") {
        return Vue.t('network.restartbypeer');
      } else {
        return status;
      }
    },
    convertInitiator(status) {
      if (status==="bi-directional") {
        return Vue.t('network.bidirectional');
      } else if (status==="response-only") {
        return Vue.t('network.responseonly');
      } else {
        return status;
      }
    }
  }
}
</script>