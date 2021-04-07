<template>
<div>
  <icos-page-header :title="$t('network.networkdetail')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="true" />
  <div class="network-detail">
    <network-review ref="networkreview"></network-review>
    <el-tabs v-model="activeName" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="networksubnet" :label="$t('network.subnet')">
        <router-view v-if="activeName=='networksubnet'"></router-view>
      </el-tab-pane>
      <el-tab-pane name="networkport" :label="$t('network.port')" v-if="showPort">
        <router-view v-if="activeName=='networkport'" :check_project="check_project"></router-view>
      </el-tab-pane>
      <el-tab-pane name="reservedAddr" :label="$t('network.reservedAddr')" v-if="showReservedAddr">
        <router-view v-if="activeName=='reservedAddr'" :check_project="check_project"></router-view>
      </el-tab-pane>
    </el-tabs>
  </div>
</div>
</template>
<script type="text/javascript">
import NetworkReview from "./NetworkReview";
export default {
  name: "NetworkTab",
  components: {
    NetworkReview
  },
  data() {
    return {
      activeName: this.$route.matched[3].name,
      network_Id: "",
      check_project: "",
      showPort: false,
      showReservedAddr: false
    };
  },
  watch: {
    '$route' (to, from) {
      this.activeName = this.$route.matched[3].name;
    }
  },
  mounted() {
    this.getNetworkInfo();
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
       // case 'networkreview':
        //   this.$router.push({
        //     path: '/net/networkview/networktab/'+this.$route.params.networkId+"/networkreview"
        //   });
        //   break
        case 'networksubnet':
          this.$router.push({
            path: '/net/networkview/networktab/'+this.$route.params.networkId+"/networksubnet"
          });
          break
        case 'networkport':
          this.$router.push({
            path: '/net/networkview/networktab/'+this.$route.params.networkId+"/networkport"
          });
          break
        case 'reservedAddr':
          this.$router.push({
            path: '/net/networkview/networktab/'+this.$route.params.networkId+"/reservedAddr"
          });
          break
        // case 'netdetaildhcp':
        //   this.$router.push({
        //     path: '/net/networkview/networktab/'+this.$route.params.networkId+"/netdetaildhcp"
        //   });
        //   break
        default:
          this.$router.push({
            path: '/net/networkview/networktab/'+this.$route.params.networkId+"/networksubnet"
          });
      }
    },
    async getNetworkInfo() {
      let self = this;
      let roleType = Vue.roleType + "";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/networks/"+this.$route.params.networkId
        });
        let networkInfo = result['network'];
        this.$refs.networkreview.getNetworkInfo(networkInfo);
        if (roleType!="0") {
          if (networkInfo["project_id"] == Vue.cookie.get('pid')) {
            self.showPort = true;
            self.showReservedAddr = true;
            if (roleType == '3') { // 项目用户没有预留端口操作权限
              self.showReservedAddr = false;
            }
            self.check_project = true;
          } else {
            self.showPort = false;
            self.showReservedAddr = false;
            self.check_project = false;
          }
        } else {
          self.showPort = true;
          self.showReservedAddr = true;
          self.check_project = true;
        }
      } catch (res) {
      }
    },
    handlePageHeaderBack() {
      this.$router.push({
        path: '/net/networkview'
      });
    }
  }
}
</script>
<style type="text/css">
  .idatath {
    width: 150px;
  }
  .network-detail {
    padding: 16px;
  }
</style>