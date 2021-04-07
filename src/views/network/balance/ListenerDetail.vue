<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-collapse v-model="activeNames" style="text-align:left">
          <el-collapse-item :title="$t('network.monitorDetail')" name="baseProperty">
            <el-col :span="24">
              <div class="table_panel">
                <table class="table table-content table-hover idatatable" border="1" v-loading="loading">
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
                    <tr class="even" v-if="listener_protocol=='TERMINATED_HTTPS'">
                      <th class="idatath">{{$t('network.DEFAULT_CERTIFICE_CONTAINER')}}：</th>
                      <td class="idatatd">{{default_tls_container_ref}}</td>
                    </tr>
                    <tr class="even" v-if="listener_protocol=='TERMINATED_HTTPS'">
                      <th class="idatath">{{$t('network.SNI_CERTIFICE_CONTAINER')}}：</th>
                      <td class="idatatd">
                        <ul>
                          <li v-if="sni_container_refs && sni_container_refs.length<1">-</li>
                          <li v-else v-for="(v,i) in (sni_container_refs||[])" :key="i">{{v}}</li>
                        </ul>
                      </td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('network.connectLimit')}}：</th>
                      <td class="idatatd">{{listener_connection_limit}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.manageStatus')}}：</th>
                      <td class="idatatd">{{listener_admin_state_up}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.DEFAULT_POOL_ID')}}：</th>
                      <td class="idatatd">{{listener_default_pool_id}}</td>
                    </tr>
                    <tr class="even" v-if="listener_protocol !== 'UDP'">
                      <th class="idatath">{{$t('network.timeoutData')}}：</th>
                      <td class="idatatd">{{timeoutClient}}</td>
                    </tr>
                    <tr class="even" v-if="listener_protocol !== 'UDP'">
                      <th class="idatath">{{$t('network.timeoutTcp')}}：</th>
                      <td class="idatatd">{{tcpInspect}}</td>
                    </tr>
                    <tr class="even" v-if="listener_protocol !== 'UDP'">
                      <th class="idatath">{{$t('network.timeoutMemConnect')}}：</th>
                      <td class="idatatd">{{timeoutMemconnect}}</td>
                    </tr>
                    <tr class="even" v-if="listener_protocol !== 'UDP'">
                      <th class="idatath">{{$t('network.timeoutMemData')}}：</th>
                      <td class="idatatd">{{timeoutMemData}}</td>
                    </tr>
                    <tr class="even" v-if="listener_protocol !== 'UDP' && listener_protocol !== 'TCP' && listener_protocol !== 'HTTPS'">
                      <th class="idatath">{{$t('network.insertHeaders')}}：</th>
                      <td class="idatatd">{{insertHeaders}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.BALANCER_ID')}}：</th>
                      <td class="idatatd">{{loadbalancersID}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.operateStatus')}}：</th>
                      <td class="idatatd">{{operatingStatus}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.configStatus')}}：</th>
                      <td class="idatatd">{{configStatus}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('lang.desc')}}：</th>
                      <td class="idatatd">{{description}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-col>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import AddRespool from './AddRespool';
export default {
  name: "ListenerDetail",
  components: {
    AddRespool
  },
  props: ["monitorId", "loadbalancerId"],
  data() {
    return {
      loading: false,
      activeNames: 'baseProperty',
      listener_protocol: "",
      default_tls_container_ref: '',
      sni_container_refs: [],
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
      insertHeaders:"",
      loadbalancersID: "",
      operatingStatus: "",
      configStatus: "",
      adminState: "",
      description: ""
    }
  },
  mounted() {
    this.getsubnetList();
    this.getListenerDetail();
  },
  watch: {
    monitorId: {
      handler (val, oldVal) {
        this.getsubnetList();
        this.getListenerDetail();
      }
    }
  },
  methods: {
    // 管理状态
    adminStateUpRender(status) {
      if (status + "" == "true") {
        return "UP";
      } else {
        return "Down";
      }
    },
    //操作状态转换
    operatingStatusRender(value) {
      if (value === "ONLINE") {
        return Vue.t("network.online");
      } else if (value === "DRAINIG") {
        return Vue.t("network.drainig");
      } else if (value === "NO_MONITOR") {
        return Vue.t("network.nomonitor");
      } else if (value === "OFFLINE") {
        return Vue.t("network.offline");
      } else if (value === "ERROR") {
        return Vue.t("lang.ERROR");
      } else if (value === "DEGRADED") {
        return Vue.t('network.degrded');
      } else {
        return value;
      }
    },
    //配置状态转换
    provisioningStatusRender(value) {
      if (value === "ACTIVE") {
        return Vue.t("lang.ACTIVE");
      } else if (value === "DELETD") {
        return Vue.t("network.deletd");
      } else if (value === "PENDING_CREATE") {
        return Vue.t("network.createing");
      } else if (value === "PENDING_UPDATE") {
        return Vue.t("network.pendingupdate");
      } else if (value === "PENDING_DELETE") {
        return Vue.t("network.pendingdelete");
      } else if (value === "deleting") {
        return Vue.t("network.operating");
      } else if (value === "ERROR") {
        return Vue.t("lang.ERROR");
      } else if (value === "INACTIVE") {
        return Vue.t("lang.DOWN");
      } else {
        return value;
      }
    },
    //获取监听器详情
    async getListenerDetail() {
      let self = this;
      this.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/octavia/v2.0/lbaas/listeners/"+self.monitorId,
          errorKey: "NeutronError",
          errFun() {
            this.loading = false;
            //self.backToPreStep();
          }
        });
        let listenerInfo = result['listener'];
        self.description = listenerInfo.description;
        self.adminState = self.adminStateUpRender(listenerInfo.admin_state_up);
        self.operatingStatus = self.operatingStatusRender(listenerInfo.operating_status);
        self.configStatus = self.provisioningStatusRender(listenerInfo.provisioning_status);
        self.loadbalancersID = listenerInfo.loadbalancers[0] && listenerInfo.loadbalancers[0].id;
        self.listener_name = listenerInfo["name"];
        self.listener_id = listenerInfo["id"];
        self.listener_protocol = listenerInfo['protocol'];
        self.sni_container_refs = listenerInfo['sni_container_refs'];
        self.default_tls_container_ref = listenerInfo['default_tls_container_ref'] || '-';
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
        this.loading = false;
      } catch (res) {
        this.loading = false;
      }
    },
    showPoolDetail() {
      let poolId = this.listener_default_pool_id;
      this.$router.push({
        path: '/net/balanceView/balanceMonitor/'+ this.loadbalancerId + "/balanceRespool/"+ this.monitorId + "/balanceHealth/"+poolId
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
      this.$router.push({
        path: '/net/balanceView/balanceMonitor/'+ this.loadbalancerId
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
