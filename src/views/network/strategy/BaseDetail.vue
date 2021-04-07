<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-collapse v-model="activeNamesBase" style="text-align:left">
          <el-collapse-item :title="$t('network.STRATEGY_DETAIL')" name="baseProperty">
            <el-col :span="24">
              <div class="table_panel">
                <table class="table table-content table-hover idatatable" border="1" v-loading="loading">
                  <tbody>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.name')}}：</th>
                      <td class="idatatd">{{strategyData.name}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('lang.project')}}：</th>
                      <td class="idatatd">{{strategyData.projectName}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('network.network')}}：</th>
                      <td class="idatatd">{{strategyData.network_name || "-"}}</td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.subnet')}}：</th>
                      <td class="idatatd">{{strategyData.subName}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.status')}}：</th>
                      <td class="idatatd" v-text="statusRender(strategyData)"></td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.REASON_FOR_FAILURE')}}：</th>
                      <td class="idatatd" v-text="statusReasonRender(strategyData.state_desc)"></td>
                    </tr>
                    <tr class="even">
                      <th class="idatath">{{$t('network.UPDATEDAT')}}：</th>
                      <td class="idatatd">{{strategyData.createTime}}</td>
                    </tr>
                    <tr class="odd">
                      <th class="idatath">{{$t('lang.desc')}}：</th>
                      <td class="idatatd">{{strategyData.description}}</td>
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
  name: "BaseDetail",
  props: {
    strategyData: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      loading: false,
      activeNamesBase: 'baseProperty'
    }
  },
  mounted() {
  },
  methods: {
    statusRender(row) {
      if (row["state"]==="valid") {
        return this.$t('network.VALID');
      } else if (row["state"]==="recoverable" || row["state"]==="invalid" || row["state"]==="damaged") {
        return this.$t('network.RECOVERABLE');
      }
    },
    statusReasonRender(des) {
      let reason = "-";
      if (des) {
        switch (des.type) {
          case "NetworkNoAccess":
            reason = Vue.t("network.NetworkNoAccess");
            break;
          case "NetworkNoSubnet":
            reason = Vue.t("network.NetworkNoSubnet");
            break;
          case "SubnetDeleted":
            reason = Vue.t("network.SubnetDeleted");
            break;
          case "QoSDeleted":
            reason = Vue.t("network.QoSDeleted");
            break;
          case "NetworkDeleted":
            reason = Vue.t("network.NetworkDeleted");
            break;
          case "SecurityGroupDeleted":
            reason = Vue.t("network.SecurityGroupDeleted");
            break;
          case "NetworkNotManageable":
            reason = Vue.t("network.NetworkNotManageable");
            break;
          case "ExternalNetworkNotShared":
            reason = Vue.t("network.ExternalNetworkNotShared");
            break;
          default:
            reason = "-";
        }
      }
      return reason;
    }
  }

}
</script>
