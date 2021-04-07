<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{$t('network.monitorDetail')}}</span>
        <el-button size="small" type="text" icon="fa-refresh" @click="onRefresh"></el-button>
        <el-button style="float:right;" size="small" @click="backToPreStep"><span style="font-weight:bold;">{{$t('lang.back')}}</span></el-button>
      </div>
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath">{{$t('network.monitorName')}}：</th>
              <td class="idatatd">{{listener_name}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.monitorId')}}：</th>
              <td class="idatatd">{{listener_id}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.protocol')}}：</th>
              <td class="idatatd">{{listener_protocol}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.port')}}：</th>
              <td class="idatatd">{{listener_protocol_port}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.connectLimit')}}：</th>
              <td class="idatatd">{{listener_connection_limit}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.manageStatus')}}：</th>
              <td class="idatatd">{{listener_admin_state_up}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.respoolmo')}}：</th>
              <td class="idatatd">
                <span v-if="!iscreatePool">{{listener_default_pool_name}}</span>
                <el-button @click="showPoolDetail()" type="text" size="small" v-if="!iscreatePool">{{$t('network.VIEW_RESOURCE_POOL_DETAILS')}}>></el-button>
                <span v-if="iscreatePool">{{$t('network.nothing')}}</span>
                <el-button type="primary" size="small" v-if="iscreatePool" @click="addRespool">{{$t('network.createRespool')}}</el-button>
                <span v-if="limitStatus" style="color:#dd4b39;font-size:12px;">{{$t('network.respoolused')}}</span>
              </td>
            </tr>

            <tr class="even">
              <th class="idatath">{{$t('network.timeoutData')}}：</th>
              <td class="idatatd">{{timeoutClient}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.timeoutTcp')}}：</th>
              <td class="idatatd">{{tcpInspect}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.timeoutMemConnect')}}：</th>
              <td class="idatatd">{{timeoutMemconnect}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.timeoutMemData')}}：</th>
              <td class="idatatd">{{timeoutMemData}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.insertHeaders')}}：</th>
              <td class="idatatd">{{insertHeaders}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-card>
    <add-respool v-if="addFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow" :listenerId="listener_id" :projectId="listener_projectId" :listenerprotocol="listener_protocol"></add-respool>
  </div>
</template>
<script type="text/javascript">
import AddRespool from './AddRespool';
export default {
  components: {
    AddRespool
  },
  data() {
    return {
      listener_protocol: "",
      listener_protocol_port: "",
      listener_connection_limit: "",
      listener_admin_state_up: "",
      listener_default_pool_id: "",
      listener_default_pool_name: "",
      listener_name: "",
      listener_id: "",
      listener_projectId: "",
      lb_algorithm: "",
      pools_status_description: "",
      pools_admin_state_up: "",
      addFlag: false,
      isDisabled: false,
      iscreatePool: false,
      limitStatus: false,
      timeoutClient: "",
      tcpInspect: "",
      timeoutMemconnect: "",
      timeoutMemData: "",
      insertHeaders:""
    }
  },
  mounted() {
    this.getsubnetList();
    this.getListenerDetail();
  },
  methods: {
    //获取监听器详情
    async getListenerDetail() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/octavia/v2.0/lbaas/listeners/"+self.$route.params.monitorId,
          errorKey: "NeutronError",
          errFun() {
            self.backToPreStep();
          }
        });
        let listenerInfo = result['listener'];
        self.listener_name = listenerInfo["name"];
        self.listener_id = listenerInfo["id"];
        self.listener_protocol = listenerInfo['protocol'];
        self.listener_protocol_port = listenerInfo['protocol_port'];
        self.listener_projectId = listenerInfo["tenant_id"];
        self.listener_connection_limit = listenerInfo['connection_limit'];
        if (listenerInfo['connection_limit'] == "-1") {
          self.listener_connection_limit = Vue.t('network.Unlimited')
        }
        self.listener_admin_state_up = self.managestatusRender(listenerInfo["admin_state_up"]);
        if (listenerInfo['default_pool_id'] == null) {
           self.listener_default_pool_id = "";
           self.listener_default_pool_name = "";
           self.iscreatePool = true;
        } else {
          self.listener_default_pool_id = listenerInfo['default_pool_id'];
          self.poolnameRender(listenerInfo['default_pool_id']);
          self.iscreatePool = false;
        }
        self.timeoutClient = listenerInfo["timeout_client_data"];
        self.tcpInspect = listenerInfo["timeout_tcp_inspect"];
        self.timeoutMemconnect = listenerInfo["timeout_member_connect"];
        self.timeoutMemData = listenerInfo["timeout_member_data"];
        let insertH = [];
        if (listenerInfo["insert_headers"] && listenerInfo["insert_headers"]["X-Forwarded-For"] == "true") {
          insertH.push("X-Forwarded-For");
        }
        if (listenerInfo["insert_headers"] && listenerInfo["insert_headers"]["X-Forwarded-Port"] == "true") {
          insertH.push("X-Forwarded-Port");
        }
        self.insertHeaders = insertH.length == 0?"-":insertH.join(",");
      } catch (res) {
      }
    },
    showPoolDetail() {
      let loadbalancerId = this.$route.params.balanceId;
      let monitorId = this.$route.params.monitorId;
      let poolId = this.listener_default_pool_id;
      this.$router.push({
        path: '/net/balanceView/balanceMonitor/'+loadbalancerId+"/balanceRespool/"+monitorId+"/balanceHealth/"+poolId
      });
    },
    onRefresh() {
      this.getListenerDetail();
    },
    managestatusRender(value) {
      if (value == true) {
        return "UP";
      } else {
        return "DOWN";
      }
    },
    async poolnameRender(poolId) {
      if (poolId == "" || poolId == null) {
        // 创建资源池按钮
      } else {
        let self = this;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/octavia/v2.0/lbaas/pools/"+poolId,
            errorKey: "NeutronError"
          });
          let pool = result['pool'];
          self.listener_default_pool_name = pool["name"];
        } catch (res) {
        }
      }
    },
    handleAddShow() {
      this.addFlag = false;
      this.getListenerDetail();
    },
    handleCancelShow() {
      this.addFlag = false;
      this.isDisabled = false;
    },
    addRespool() {
      this.addFlag = true;
      this.isDisabled = true;
    },
    backToPreStep() {
      let loadbalancerId = this.$route.params.balanceId;
      this.$router.push({
        path: '/net/balanceView/balanceMonitor/'+loadbalancerId
      });
    },
    async getsubnetList() {
      try {
        let resultData = await this.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/subnets"
        });
       let sublist1 = [];
        let sublist = resultData["subnets"];
        for (let i = 0; i < sublist.length; i++) {
          let subname = sublist[i];
          subname["name"] = subname["cidr"] + "(" + subname["name"] + ")";
          if (subname["ip_version"] == 4) {
            sublist1.push(subname);
          }
        }
        Vue.subnetsList = sublist1;
      } catch (res) {
        console.log('获取子网失败!');
      }
    }
  }
}
</script>
<style scoped>
  .idatath {
    width: 120px;
  }
</style>
