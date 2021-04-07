<template>
  <div class="resource-profile">
    <span class="title">{{$t('base.profileInfo')}}</span>
    <el-row :gutter="10">
      <el-col :span="6">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr>
              <th>{{$t('base.resourceName')}}：</th>
              <td class="idatatd">{{obj.name}}</td>
            </tr>
            <tr>
              <th>{{$t('monitor.alarmStatus')}}：</th>
              <td class="idatatd">{{obj.alertStatus}}</td>
            </tr>
            <tr>
              <th>{{$t('monitor.monitorTime')}}：</th>
              <td class="idatatd">{{obj.monitorTime}}</td>
            </tr>
          </tbody>
        </table>
      </el-col>
      <el-col :span="6">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr>
              <th>{{$t('base.address')}}：</th>
              <td class="idatatd">{{obj.ipAddress}}</td>
            </tr>
            <tr>
              <th>{{$t('monitor.monitorStatus')}}：</th>
              <td class="idatatd">{{obj.monitorStatus}}</td>
            </tr>
            <tr>
              <th></th>
              <td class="idatatd"></td>
            </tr>
          </tbody>
        </table>
      </el-col>
      <el-col :span="6">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr>
              <th>{{$t("lang.resouceType")}}：</th>
              <td class="idatatd">{{obj.sourceType}}</td>
            </tr>
            <tr>
              <th>{{$t("base.notificationStatus")}}：</th>
              <td class="idatatd">{{obj.noticeFlag}}</td>
            </tr>
            <tr>
              <th></th>
              <td class="idatatd"></td>
            </tr>
          </tbody>
        </table>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import {
  operateRows,
  alarmLevelList,
  alarmLevelTag
} from "../../../public/public.js";
export default {
  props: ["resourceDetailId", "centerId"],
  data() {
    return {
      operateRows,
      alarmLevelList,
      alarmLevelTag,
      obj: {
        name: "",
        ipAddress: "",
        sourceType: "",
        alertStatus: "",
        monitorStatus: "",
        noticeFlag: "",
        monitorTime: ""
      }
    };
  },
  mounted() {
    let me = this;
    this.$ajax({
      type: "get",
      headers: {
        FORWARD_UNION: this.centerId
      },
      url: "api/pluto/v1/alert/" + this.resourceDetailId + "/general",
      successFun(data) {
        let o = data.alert_general.resource_info;
        me.obj.name =
          Vue.config.lang == "zh-cn" ? o.resource_name_cn : o.resource_name_en;
        me.obj.ipAddress = o['resource_address'] || '-';
        me.obj.sourceType =
          Vue.config.lang == "zh-cn"
            ? o.resource_sc_name_cn
            : o.resource_sc_name_en;
        me.obj.alertStatus = alarmLevelList[o.alert_status];
        me.obj.monitorStatus =
          o.monitor_status == 1
            ? Vue.t("monitor.monitoring")
            : Vue.t("monitor.unmonitored");
        me.obj.noticeFlag =
          o.notice_flag == 1
            ? Vue.t("monitor.noticed")
            : Vue.t("monitor.unnotice");
        me.obj.monitorTime = o.monitor_time
          ? o.monitor_time.replace("T", " ").replace(".000000", "")
          : "";
      }
    });
  },
  methods: {
  }
};
</script>
<style scoped>
.resource-profile {
  position: relative;
}
.resource-profile >>> .table tr th {
  opacity: 0.85;
  min-width: 70px;
}
.resource-profile >>> .table tr td {
  opacity: 0.65;
}
.resource-profile >>> .back {
  position: absolute;
  right: 0;
  margin-right: 32px;
}
</style>