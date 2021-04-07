<template>
<div>
  <div class="profile">
    <div class="item">
      <span class="name">{{$t('network.networkName')}}</span>：
      <slot name="slot">
        <span class="value">{{net_name}}</span>
      </slot>
    </div>
    <div class="item">
      <span class="name">{{$t('network.networkshared')}}</span>：
      <slot name="slot">
        <span class="value">{{net_shared}}</span>
      </slot>
    </div>
    <div class="item" v-if="providerShow">
      <span class="name">{{$t('network.providernetType')}}</span>：
      <slot name="slot">
        <span class="value">{{provider_network_type}}</span>
      </slot>
    </div>
    <div class="item">
      <span class="name">ID</span>：
      <slot name="slot">
        <span class="value">{{net_id}}</span>
      </slot>
    </div>
     <div class="item">
      <span class="name">{{$t('network.externalNet')}}</span>：
      <slot name="slot">
        <span class="value">{{net_external}}</span>
      </slot>
    </div>
     <div class="item" v-if="providerShow">
      <span class="name">{{$t('network.providerphynetwork')}}</span>：
      <slot name="slot">
        <span class="value">{{provider_physical_network}}</span>
      </slot>
    </div>
    <div class="item">
      <span class="name">{{$t('lang.status')}}</span>：
      <slot name="slot">
        <span class="value">{{net_status}}</span>
      </slot>
    </div>
    <div class="item">
      <span class="name">{{$t('network.netmtu')}}</span>：
      <slot name="slot">
        <span class="value">{{net_mtu}}</span>
      </slot>
    </div>
     <div class="item">
      <span class="name">{{$t('network.physicalMachineNetworkType')}}</span>：
      <slot name="slot">
        <span class="value">{{physicalMachineNetworkType}}</span>
      </slot>
    </div>
    <div class="item">
      <span class="name">{{$t('network.manageStatus')}}</span>：
      <slot name="slot">
        <span class="value">{{net_admin_state_up}}</span>
      </slot>
    </div>
    <div class="item">
      <span class="name">{{$t('network.domainuse')}}</span>：
      <slot name="slot">
        <span class="value">{{domainuse}}</span>
      </slot>
    </div>
  </div>
</div>
</template>
<script type="text/javascript">
  export default {
    name: "NetworkReview",
    data() {
      return {
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
        providerShow: true,
        domainuse:"",
        physicalMachineNetworkType: ''
      }
    },
    mounted() {
    },
    methods: {
       async getNetworkInfo(networkInfo) {
        let self = this;
        let roleType = Vue.roleType + "";
        if (roleType=="0") {
          self.providerShow = true;
        } else {
          self.providerShow = false;
        }
        let netType = networkInfo["tags"][0];
        switch (netType) {
          case "bm_service":
            self.physicalMachineNetworkType = Vue.t("network.bmService");
            break;
          case "bm_manage":
            self.physicalMachineNetworkType = Vue.t("network.bmManage");
            break;
          case "bm_storage":
            self.physicalMachineNetworkType = Vue.t("network.bmStorage");
            break;
          case "bm_deploy":
            self.physicalMachineNetworkType = Vue.t("network.bmDeploy");
            break;
        }
        self.net_name = networkInfo["name"];
        self.net_id = networkInfo["id"];
        self.net_status = self.statusRender(networkInfo["status"]);
        console.log(networkInfo)
        self.net_admin_state_up = networkInfo["admin_state_up"]+'';
        self.domainuse = (networkInfo.availability_zones && networkInfo.availability_zones.length != 0) ? networkInfo.availability_zones.join(","):"-";
        if (networkInfo["admin_state_up"]+'' == "true") {
          self.net_admin_state_up = "UP";
        } else {
          self.net_admin_state_up = "DOWN";
        }
        if (networkInfo["shared"]+'' == "true") {
          self.net_shared = Vue.t('lang.yes');
        } else {
          self.net_shared = Vue.t('lang.no');
        }
        // self.net_shared = networkInfo["shared"]+'';
        self.net_mtu = networkInfo["mtu"];
        if (networkInfo["mtu"] == 0) {
          self.net_mtu = Vue.t('network.unknown');
        }
        self.net_created_at = networkInfo["created_at"];
        self.net_updated_at = networkInfo["updated_at"];
        // self.net_external = networkInfo["router:external"]+'';
        if (networkInfo["router:external"]+'' == "true") {
          self.net_external = Vue.t('lang.yes');
        } else {
          self.net_external = Vue.t('lang.no');
        }
        self.provider_network_type = networkInfo["provider:network_type"];
        self.provider_physical_network = networkInfo["provider:physical_network"];
        self.provider_segmentation_id = networkInfo["provider:segmentation_id"]+'';
        if (roleType!="0") {
          if (networkInfo["project_id"] == Vue.cookie.get('pid')) {
            self.showPort = true;
            self.check_project = true;
          } else {
            self.showPort = false;
            self.check_project = false;
          }
        } else {
          self.showPort = true;
          self.check_project = true;
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
.profile {
  overflow: hidden;
  background-color: #ffffff;
  font-size: 14px;
  margin-bottom: 10px;
  padding: 16px;
}
.profile .item >>> .el-button {
  padding: 0;
}
.profile .item {
  width: 33%;
  float: left;
}
.profile .name {
  opacity: 0.85;
}
.profile .value {
  opacity: 0.65;
}
</style>
