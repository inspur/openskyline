<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-collapse v-model="activeNames" style="text-align:left">
          <el-collapse-item :title="$t('network.healthMonitorDetail')" name="baseProperty">
            <el-col :span="24">
              <div class="table_panel">
                <table class="table table-content table-hover idatatable" border="1" v-loading="loading">
                  <tbody>
                    <tr class="odd">
                      <th class="idatath">{{$t('network.HEALTHMONITOR_NAME')}}：</th>
                      <td class="idatatd">{{healthmonitorInfo && healthmonitorInfo.name}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.healthTypeId')}}：</th>
                      <td class="idatatd">{{healthmonitorInfo && healthmonitorInfo.id}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('network.respoolId')}}：</th>
                      <td class="idatatd" v-text="getPoolID()"></td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.healthType')}}：</th>
                      <td class="idatatd">{{healthmonitorInfo && healthmonitorInfo.type}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('network.timeDevide')}}：</th>
                      <td class="idatatd">{{healthmonitorInfo && healthmonitorInfo.delay}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.trytimes')}}：</th>
                      <td class="idatatd">{{healthmonitorInfo && healthmonitorInfo.max_retries}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.failtrytimes')}}：</th>
                      <td class="idatatd">{{healthmonitorInfo && healthmonitorInfo.max_retries_down}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.overtime')}}：</th>
                      <td class="idatatd">{{healthmonitorInfo && healthmonitorInfo.timeout}}</td>
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
                    <tr class="even" v-if="healthmonitorInfo.http_method">
                      <th class="idatath">{{$t('network.httpMethod')}}：</th>
                      <td class="idatatd">{{healthmonitorInfo && healthmonitorInfo.http_method}}</td>
                    </tr>
                    <tr class="even" v-if="healthmonitorInfo.expected_codes">
                      <th class="idatath">{{$t('network.statusCode')}}：</th>
                      <td class="idatatd">{{healthmonitorInfo && healthmonitorInfo.expected_codes}}</td>
                    </tr>
                    <tr class="even" v-if="healthmonitorInfo.url_path">
                      <th class="idatath">{{$t('network.urlPath')}}：</th>
                      <td class="idatatd">{{healthmonitorInfo && healthmonitorInfo.url_path}}</td>
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
  name: "HealthmonitorDetail",
  props: ["healthmonitorInfo"],
  data() {
    return {
      loading: false,
      activeNames: 'baseProperty'
    }
  },
  mounted() {
  },
  methods: {
    adminStateUpRender() {
      let status = this.healthmonitorInfo && this.healthmonitorInfo.admin_state_up;
      if (status + "" == "true") {
        return "UP";
      } else {
        return "Down";
      }
    },
    //配置状态转换
    provisioningStatusRender() {
      let value = this.healthmonitorInfo && this.healthmonitorInfo.provisioning_status;
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
      let value = this.healthmonitorInfo && this.healthmonitorInfo.operating_status;
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
    getPoolID() {
      let pool = (this.healthmonitorInfo && this.healthmonitorInfo.pools) || [];
      return pool[0] && pool[0].id;
    },
    getListenerId() {
      let listeners = (this.healthmonitorInfo && this.healthmonitorInfo.listeners) || [];
      return listeners[0] && listeners[0].id;
    },
    getBalanceId() {
      let loadbalancers = (this.healthmonitorInfo && this.healthmonitorInfo.loadbalancers) || [];
      return loadbalancers[0] && loadbalancers[0].id;
    }
  }
}
</script>
