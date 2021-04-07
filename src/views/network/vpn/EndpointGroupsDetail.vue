<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix" style="text-align:left;">
        <span>{{$t('network.endpointGroupsDetail')}}</span>
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
              <th class="idatath">{{$t('network.type')}}：</th>
              <td class="idatatd">{{type}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{'Endpoints'}}：</th>
              <td class="idatatd">{{serverAddr}}</td>
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
  props: ["serviceId", "subnetList"],
  data() {
    return {
      name: "",
      description: "",
      id: "",
      project_name: "",
      type: "",
      serverAddr:""
    }
  },
  mounted() {
  },
  methods: {
    async initDetail() {
      let self = this;
      await self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/vpn/endpoint-groups/" + this.serviceId,
        data: {},
        success: function(result) {
          let vpnservice = result["endpoint_group"];
          self.name = vpnservice["name"];
          self.description = vpnservice["description"];
          self.id = vpnservice["id"];
          self.projectIdToName(vpnservice["project_id"]);
          self.type = vpnservice["type"];
          self.serverAddr = vpnservice["type"]=="cidr"?vpnservice["endpoints"].join(","):self.subnetToName(vpnservice["endpoints"]);
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
        errFun: function() {
          self.project_name = "";
        }
      });
    },
    subnetToName(subnetIds) {
      let names = [];
      for (let a = 0; a < subnetIds.length; a++) {
        for (let i = 0; i < this.subnetList.length; i++) {
          let row = this.subnetList[i];
          if (row["id"] === subnetIds[a]) {
            names.push(row["name"]);
          }
        }
      }
      return names.join(",");
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
