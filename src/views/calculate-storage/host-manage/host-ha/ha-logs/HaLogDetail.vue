<template>
  <div>
    <el-form :inline="true" class="form-inline">
      <el-form-item  class="left">
        <span style="font-size:large">{{this.notificationUUID}}</span>
      </el-form-item>
      <div class="divider clearfix"></div>
      <!------------------------------------------------------------>
      <el-form-item  class="left">
        <span>{{$t('calcStorLang.notificationsDetial')}}</span>
      </el-form-item>
      <div class="divider clearfix"></div>
    </el-form>
      <!------------------------------------------------------------>
    <div class="table_panel">
      <table class="table table-content table-hover idatatable" border="1">
        <tbody>
          <tr>
            <th class="idatath">{{$t('calcStorLang.notificationsUUID')}}</th>
            <td class="idatatd">{{this.notificationUUID}}</td>
          </tr>
          <tr>
            <th class="idatath">{{$t('calcStorLang.sourceHostUUID')}}</th>
            <td class="idatatd">{{this.sourceHostUUID}}</td>
          </tr>
          <tr>
            <th class="idatath">{{$t('calcStorLang.sourceHostName')}}</th>
            <td class="idatatd">{{this.source_host_name}}</td>
          </tr>
          <tr>
            <th class="idatath">{{$t('calcStorLang.failoverSegmentUUID')}}</th>
            <td class="idatatd">{{this.failover_segment_id}}</td>
          </tr>
          <tr>
            <th class="idatath">{{$t('calcStorLang.failoverSegmentName')}}</th>
            <td class="idatatd">{{this.failover_segment_name}}</td>
          </tr>
          <tr>
            <th class="idatath">{{$t('calcStorLang.type')}}</th>
            <td class="idatatd">{{this.type}}</td>
          </tr> 
          <tr>
            <th class="idatath">{{$t('calcStorLang.status')}}</th>
            <td class="idatatd">{{this.status}}</td>
          </tr>
          <tr>
            <th class="idatath">{{$t('calcStorLang.generatedTime')}}</th>
            <td class="idatatd">{{this.generatedTime}}</td>
          </tr>
          <tr>
            <th class="idatath">{{$t('calcStorLang.createdAt')}}</th>
            <td class="idatatd">{{this.createdAt}}</td>
          </tr>
          <tr>
            <th class="idatath">{{$t('calcStorLang.updatedAt')}}</th>
            <td class="idatatd">{{this.updatedAt}}</td>
          </tr>
          <tr>
            <th class="idatath">{{$t('calcStorLang.reason')}}</th>
            <td class="idatatd">{{this.reason}}</td>
          </tr>
          <tr>
            <th class="idatath">{{$t('calcStorLang.notificationsDetial')}}</th>
            <td>
              <div class="table_panel_syk">
                <table class="table table-content table-hover idatatable" border="1">
                  <tbody>
                    <tr v-for="item in payload" :key="item.key">
                      <th class="idatath">{{item.key}}：</th>
                      <td class="idatath" style="padding-right:7px;min-width:100px">{{item.value}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  name: 'HaLogDetail',
  props: {
    info: {
      type: Object,
      default: function () {
        return {}
      }
    },
    notificationUUID: {
      type: String
    }
  },
  data() {
    return {
      sourceHostUUID: "",
      generatedTime: "",
      createdAt: "",
      deleted: "",
      id: "",
      payload: "",
      status: "",
      type: "",
      updatedAt: "",
      source_host_name: "",
      failover_segment_id: "",
      failover_segment_name: "",
      reason: ""
    }
  },
  computed: {},
  mounted() {
    this.initial();
  },
  beforeRouteLeave(to, from, next) {
    next()
  },
  beforeRouteEnter(to, from, next) {
    next()
  },
  watch: {
    notificationUUID: {
      //immediate: false,
      handler: function() {
        this.initial()
      }
    }
  },
  methods: {
    initial() {
      console.log("..............");
      this.generatedTime = this.dataFormatter(this.info.generated_time);
      this.createdAt = this.dataFormatter(this.info.created_at);
      this.deleted = this.info.deleted;
      this.id = this.info.id;
      this.notificationUUID = this.info.notification_uuid;
      this.payload = this.info.payload;
      this.sourceHostUUID = this.info.source_host_uuid;
      this.status = this.info.status;
      this.type = this.info.type;
      this.updatedAt = this.dataFormatter(this.info.updated_at);
      this.source_host_name = this.info.source_host_name;
      this.failover_segment_id = this.info.failover_segment_id;
      this.failover_segment_name = this.info.failover_segment_name;
      this.reason = this.info.reason;
    },
    dataFormatter(value) {
      if (!value) {
          return "--";
      }
      var time =new Date(value);
      time = new Date(time.getTime() - time.getTimezoneOffset()*60000);
      let year=time.getFullYear();
      let month=time.getMonth()+ 1 < 10 ? "0"+(time.getMonth() + 1) : time.getMonth() + 1;
      let date=time.getDate()<10?"0"+(time.getDate()):time.getDate();
      let hours=time.getHours()<10?"0"+(time.getHours()):time.getHours();
      let minutes=time.getMinutes()<10?"0"+(time.getMinutes()):time.getMinutes();
      let seconds=time.getSeconds()<10?"0"+(time.getSeconds()):time.getSeconds();
      return year+"-"+month+"-"+date+" "+hours+":"+minutes+":"+seconds;
    }
  }
}
</script>
<style scoped>
  .left{
    width:100%;
    text-align:left;
  }
  .right{
    width:100%;
    text-align:left;
  }
  .table_panel_syk{
    margin: 5px 7px;
    border:1px solid #dedede;
    width:fit-content;
  }
</style>
