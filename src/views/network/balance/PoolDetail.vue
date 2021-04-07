<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-collapse v-model="activeNames" style="text-align:left">
          <el-collapse-item :title="$t('network.respoolDetail')" name="baseProperty">
            <el-col :span="24">
              <div class="table_panel">
                <table class="table table-content table-hover idatatable" border="1" v-loading="loading">
                  <tbody>
                    <tr class="odd">
                      <th class="idatath">{{$t('network.respoolName')}}：</th>
                      <td class="idatatd">{{poolData.name}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.respoolId')}}：</th>
                      <td class="idatatd">{{poolData.id}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('network.protocol')}}：</th>
                      <td class="idatatd">{{poolData.protocol}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.method')}}：</th>
                      <td class="idatatd" v-text="methodRender(poolData.lb_algorithm)"></td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('network.sessionpersi')}}：</th>
                      <td class="idatatd">{{poolData.session_persistence || 'None'}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.monitorId')}}：</th>
                      <td class="idatatd" v-text="getListenerId()"></td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.BALANCER_ID')}}：</th>
                      <td class="idatatd" v-text="getBalanceId()"></td>
                    </tr>
                   <!-- <tr class="odd">
                      <th class="idatath">{{$t('network.respoolmo')}}：</th>
                      <td class="idatatd">
                        <span v-if="!iscreatePool">{{listener_default_pool_name}}</span>
                        <span v-if="iscreatePool">{{$t('network.nothing')}}</span>
                        <span v-if="limitStatus" style="color:#dd4b39;font-size:12px;">{{$t('network.respoolused')}}</span>
                      </td>
                    </tr>-->
                    <tr class="even">
                      <th class="idatath">{{$t('network.healthTypeId')}}：</th>
                      <td class="idatatd">{{poolData.healthmonitor_id}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.operateStatus')}}：</th>
                      <td class="idatatd" v-text="operatingStatusRender()"></td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.configStatus')}}：</th>
                      <td class="idatatd" v-text="provisioningStatusRender()"></td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.manageStatus')}}：</th>
                      <td class="idatatd" v-text="adminStateUpRender()"></td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('lang.desc')}}：</th>
                      <td class="idatatd">{{poolData.description}}</td>
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
export default {
  name: "PoolDetail",
  props: {
    poolData: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      loading: false,
      activeNames: 'baseProperty'
    }
  },
  mounted() {
  },
  methods: {
    methodRender(method) {
      if (method === "LEAST_CONNECTIONS") {
        return Vue.t(('network.leastconnect'))
      }
      if (method === "ROUND_ROBIN") {
        return Vue.t(('network.roundRobin'))
      }
      if (method === "SOURCE_IP") {
        return Vue.t(('network.sourceIP'))
      }
    },
    adminStateUpRender() {
      let status = this.poolData.admin_state_up;
      if (status + "" == "true") {
        return "UP";
      } else {
        return "Down";
      }
    },
    //配置状态转换
    provisioningStatusRender() {
      let value = this.poolData.provisioning_status;
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
    //操作状态转换
    operatingStatusRender() {
      let value = this.poolData.operating_status;
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
    getListenerId() {
      let listeners = this.poolData.listeners || [];
      return listeners[0] && listeners[0].id;
    },
    getBalanceId() {
      let loadbalancers = this.poolData.loadbalancers || [];
      return loadbalancers[0] && loadbalancers[0].id;
    }
  }
}
</script>
