<template>
<div>
  <el-tabs v-model="activeName" @tab-click="onTabClick" type="border-card">
    <el-tab-pane name="portdetail" :label="$t('network.overview')">
      <port-detail ref="portdetail" :portId="portId" v-if="detailFlag"></port-detail>
    </el-tab-pane>
    <el-tab-pane name="portpair" :label="$t('network.ippairs')" style="text-align:left">
      <port-pair ref="portpair" :portId="portId" :check_project="check_project" v-if="pairFlag"></port-pair>
    </el-tab-pane>
  </el-tabs>
</div>
</template>
<script>
import PortDetail from "./PortDetail";
import PortPair from "./PortPair";
export default {
  name: "PortTab",
  props: ['portId', 'networkId'],
  components: {
    PortDetail, PortPair
  },
  data() {
    return {
      activeName: "portdetail",
      check_project: "",
      detailFlag: true,
      pairFlag: false
    }
  },
  mounted() {
    // this.getNetworkInfo();
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'portdetail':
          this.detailFlag = true;
          this.pairFlag = false;
          this.$nextTick(() => {
            this.$refs.portdetail.getInit();
          });
          break
        case 'portpair':
          this.detailFlag = false;
          this.pairFlag = true;
          break
        default:
          this.detailFlag = true;
          this.pairFlag = false;
       }
    },
    async getNetworkInfo() {
      let self = this;
      this.activeName = "portdetail";
      this.detailFlag = true;
      this.pairFlag = false;
      this.$nextTick(() => {
        this.$refs.portdetail.getInit();
      });
      let roleType = Vue.roleType + "";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/networks/"+this.networkId
        });
        let networkInfo = result['network'];
        if (roleType!="0") {
          if (networkInfo["project_id"] == Vue.cookie.get('pid')) {
            self.check_project = true;
          } else {
            self.check_project = false;
          }
        } else {
          self.check_project = true;
        }
      } catch (res) {
      }
    }
  }
}
</script>
