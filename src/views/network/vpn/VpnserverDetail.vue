<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix" style="text-align:left;">
        <span>{{$t('network.vpnserverdatail')}}</span>
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
              <th class="idatath">{{$t('network.router')}}：</th>
              <td class="idatatd">{{router_name}}</td>
            </tr>
            <!-- <tr class="even">
              <th class="idatath">{{$t('network.subnet')}}：</th>
              <td class="idatatd">{{subnet_name}}</td>
            </tr> -->
            <tr class="odd">
              <th class="idatath">{{$t('network.manageStatus')}}：</th>
              <td class="idatatd">{{admin_state_up}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('lang.status')}}：</th>
              <td class="idatatd"><el-tag :type="statusTagRender(status)"><span v-html="statusRender(status)"></span></el-tag></td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.externalipv4')}}：</th>
              <td class="idatatd">
                <label>IPv4:</label><span>{{external_v4_ip}}</span><br/>
                <label>IPv6:</label><span>{{external_v6_ip}}</span>
              </td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.ipsecstation')}}：</th>
              <td class="idatatd">{{ipsec_site_connections}}</td>
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
  props: ["serviceId"],
  data() {
    return {
      name: "",
      description: "",
      id: "",
      project_name: "",
      external_v4_ip: "",
      external_v6_ip: "",
      router_name: "",
      subnet_name: "",
      lifetime_value: "",
      status: "",
      admin_state_up: "",
      ipsec_site_connections: ""
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
        url: "api/neutron/v2.0/vpn/vpnservices/"+this.serviceId,
        data: {},
        success: function(result) {
          let vpnservice = result["vpnservice"];
          self.name = vpnservice["name"];
          self.description = vpnservice["description"];
          self.id = vpnservice["id"];
          self.projectIdToName(vpnservice["project_id"]);
          if (vpnservice["external_v4_ip"]!=null) {
            self.external_v4_ip = vpnservice["external_v4_ip"];
          } else {
            self.external_v4_ip = Vue.t('network.nothing')
          }
          if (vpnservice["external_v6_ip"]!=null) {
            self.external_v6_ip = vpnservice["external_v6_ip"];
          } else {
            self.external_v6_ip = Vue.t('network.nothing')
          }
          self.getrouterName(vpnservice["router_id"]);
          if (vpnservice["subnet_id"] == null || vpnservice["subnet_id"] == "" || typeof vpnservice["subnet_id"] == "undefined") {
            self.subnet_name = "";
          } else {
            self.getsubnetName(vpnservice["subnet_id"]);
          }
          self.status = vpnservice["status"];
          self.admin_state_up = vpnservice["admin_state_up"];
          if (true == vpnservice["admin_state_up"]) {
            self.admin_state_up = "UP";
          } else {
            self.admin_state_up = "DOWN";
          }
          let connetcions = vpnservice["ipsec_site_connections"];
          if (connetcions.length === 0) {
             self.ipsec_site_connections = Vue.t('network.nothing');
          } else {
            self.ipsec_site_connections = '';
            for (let i = 0; i < connetcions.length; i++) {
              if (i+1 === connetcions.length) {
                self.ipsec_site_connections += connetcions[i].name;
              } else {
                self.ipsec_site_connections += connetcions[i].name + ",  ";
              }
            }
          }
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
        }
      });
    },
    async getrouterName(routerId) {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/routers/"+routerId,
          errorKey: "NeutronError"
        });
        let routerInfo = result['router'];
        self.router_name = routerInfo['name'];
      } catch (res) {
      }
    },

    async getsubnetName(subnetId) {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/subnets/"+subnetId,
          errorKey: "NeutronError"
        });
        let subnet = result["subnet"];
        self.subnet_name = subnet['name'];
      } catch (res) {
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
    }
  }
}
</script>
<style scoped>
  .idatath {
    width: 110px;
  }
</style>