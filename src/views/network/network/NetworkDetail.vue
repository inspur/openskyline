<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="netdetailreview" :label="$t('network.overview')">
        <el-row>
          <el-col :span="24">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('network.networkName')}}：</th>
                  <td class="idatatd">{{net_name}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">ID：</th>
                  <td class="idatatd">{{net_id}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('lang.status')}}：</th>
                  <td class="idatatd">{{net_status}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('network.sharedde')}}：</th>
                  <td class="idatatd">{{net_shared}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('network.externalNet')}}：</th>
                  <td class="idatatd">{{net_external}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('network.manageStatus')}}：</th>
                  <td class="idatatd">{{net_admin_state_up}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('network.netmtu')}}：</th>
                  <td class="idatatd">{{net_mtu}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('network.providernetType')}}：</th>
                  <td class="idatatd">{{provider_network_type}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('network.providerphynetwork')}}：</th>
                  <td class="idatatd">{{provider_physical_network}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('network.providersegId')}}：</th>
                  <td class="idatatd">{{provider_segmentation_id}}</td>
                </tr>
              </tbody>
            </table>
            </div> 
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane name="netdetailsubnet" :label="$t('network.subnet')">
        <router-view v-if="activeName=='netdetailsubnet'" name="netdetailsubnet" :network_Id="network_Id" :check_project="check_project"></router-view>
      </el-tab-pane>
      <el-tab-pane name="netdetailport" :label="$t('network.port')" v-if="showPort">
        <router-view v-if="activeName=='netdetailport'" name="netdetailport" :network_Id="network_Id" :check_project="check_project"></router-view>
      </el-tab-pane>
      <el-tab-pane name="netdetaildhcp" label="DHCP Agents" v-if="false">
        <router-view v-if="activeName=='netdetaildhcp'" name="netdetaildhcp" :network_Id="network_Id"></router-view>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script type="text/javascript">
export default {
  name: "NetworkDetail",
  data() {
    return {
      activeName: "",
      network_Id: "",
      check_project: "",
      showPort: true,
      net_name: "",
      net_id: "",
      net_status: "",
      net_admin_state_up: "",
      net_shared: "",
      net_mtu: "",
      net_created_at: "",
      net_updated_at: "",
      net_external: "",
      provider_network_type: "",
      provider_physical_network: "",
      provider_segmentation_id: "",
      providerShow: true
    }
  },
  mounted() {
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'netdetailreview':
          this.activeName = "netdetailreview";
          break
        case 'netdetailsubnet':
          this.activeName = "netdetailsubnet";
          break
        case 'netdetailport':
          this.activeName = "netdetailport";
          break
        case 'netdetaildhcp':
          this.activeName = "netdetaildhcp";
          break
        default:
         this.activeName = "netdetailreview";
      }
    },
    initNetworkDetail(id, chechproject) {
      this.network_Id = id;
      this.check_project = chechproject;
      if (chechproject == "true") {
        this.showPort = true;
      } else {
        this.showPort = false;
      }
      this.onTabClick("netdetailreview");
      this.getNetworkInfo();
    },
    async getNetworkInfo() {
        let self = this;
        let roleType = Vue.roleType + "";
        if (roleType=="0") {
          self.providerShow = true;
        } else {
          self.providerShow = false;
        }
        try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks/"+this.network_Id
          });
          let networkInfo = result['network'];
          self.net_name = networkInfo["name"];
          self.net_id = networkInfo["id"];
          self.net_status = self.statusRender(networkInfo["status"]);
          self.net_admin_state_up = networkInfo["admin_state_up"].toString();
          if (networkInfo["admin_state_up"].toString() == "true") {
            self.net_admin_state_up = "UP";
          } else {
            self.net_admin_state_up = "DOWN";
          }
          if (networkInfo["shared"].toString() == "true") {
            self.net_shared = Vue.t('lang.yes');
          } else {
            self.net_shared = Vue.t('lang.no');
          }
          // self.net_shared = networkInfo["shared"].toString();
          self.net_mtu = networkInfo["mtu"];
          if (networkInfo["mtu"] == 0) {
            self.net_mtu = Vue.t('network.unknown');
          }
          self.net_created_at = networkInfo["created_at"];
          self.net_updated_at = networkInfo["updated_at"];
          // self.net_external = networkInfo["router:external"].toString();
          if (networkInfo["router:external"].toString() == "true") {
            self.net_external = Vue.t('lang.yes');
          } else {
            self.net_external = Vue.t('lang.no');
          }
          self.provider_network_type = networkInfo["provider:network_type"];
          self.provider_physical_network = networkInfo["provider:physical_network"];
          self.provider_segmentation_id = networkInfo["provider:segmentation_id"].toString();
        } catch (res) {
          // self.$message.error('获取失败!');
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
        }
      }
  }
}
</script>
<style type="text/css">
  .idatath {
    width: 150px;
  }
</style>