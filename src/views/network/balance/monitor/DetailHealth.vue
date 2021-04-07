<template>
  <div>
    <el-card class="box-card" v-loading="loading">
      <div slot="header" class="clearfix">
        <span>{{$t('network.healthMonitorDetail')}}</span>
        <el-button size="small" type="text" icon="fa-refresh" @click="onRefresh"></el-button>
        <el-button style="float:right;margin-top:-5px;" size="small" @click="backToPreStep"><span>{{$t('lang.back')}}</span></el-button>
      </div>
      <div style="padding-left:2px;padding-bottom:5px;">
        <el-button @click="editHealthAction" type="primary" size="small">{{$t("network.modifyHealth")}}</el-button>
        <el-button type="primary" size="small" @click="deleteHealthMonitorClick">{{$t("network.deleteHealth")}}</el-button>
      </div>
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath">{{$t("lang.name")}}：</th>
              <td class="idatatd">{{health_name}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{'ID'}}：</th>
              <td class="idatatd">{{health_id}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t("network.healthType")}}：</th>
              <td class="idatatd">{{health_type}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t("network.timeDevide")}}：</th>
              <td class="idatatd">{{health_delay}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t("network.trytimes")}}：</th>
              <td class="idatatd">{{health_max_retries}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t("network.failtrytimes")}}：</th>
              <td class="idatatd">{{health_max_failretries}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t("network.overtime")}}：</th>
              <td class="idatatd">{{health_timeout}}</td>
            </tr>
            <tr class="odd" v-if="httpview">
              <th class="idatath">{{$t("network.httpMethod")}}：</th>
              <td class="idatatd">{{httpmethod}}</td>
            </tr>
            <tr class="even" v-if="httpview">
              <th class="idatath">{{$t("network.statusCode")}}：</th>
              <td class="idatatd">{{statuscode}}</td>
            </tr>
            <tr class="odd" v-if="httpview">
              <th class="idatath">{{$t("network.urlPath")}}：</th>
              <td class="idatatd">{{urlpath}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-card>
    <edit-five v-if="editFlag" @handleEditShow="handleEditShow" @handleCancelShow="handleCancelShow" :healthmonitorInfo="healthmonitorInfo"></edit-five>
  </div>
</template>
<script type="text/javascript">
import EditFive from '../EditStepFive';
export default {
  components: {
    EditFive
  },
  props: ['healthId'],
  data() {
    return {
      health_name:"",
      health_type: "",
      health_delay: "",
      health_max_retries: "",
      health_max_failretries:"",
      health_timeout: "",
      health_admin_state_up: "",
      health_id: "",
      health_project_id: "",
      httpmethod: "",
      statuscode: "",
      urlpath: "",
      healthmonitorInfo: null,
      editFlag: false,
      httpview: false,
      loading: false
    }
  },
  mounted() {
    this.getHealthInfo();
  },
  methods: {
    async getHealthInfo() {
      let self = this;
      try {
        self.loading = true;
        let result = await self.$ajax({
          type: 'get',
          url: "api/octavia/v2.0/lbaas/healthmonitors/"+self.healthId,
          errorKey: "NeutronError",
          errFun() {
            self.loading = false;
            /*self.$router.push({
              path: '/net/balanceView/balanceMonitor/'+self.$route.params.balanceId+"/balanceRespool/"+self.$route.params.monitorId+"/balanceHealth/"+self.$route.params.poolId
            });*/
          }
        });
        let healthmonitor = result['healthmonitor'];
        self.health_name = healthmonitor["name"];
        self.healthmonitorInfo = healthmonitor;
        self.health_type = healthmonitor['type'];
        self.health_delay = healthmonitor['delay'];
        self.health_max_retries = healthmonitor['max_retries'];
        self.health_max_failretries = healthmonitor['max_retries_down'];
        self.health_timeout = healthmonitor['timeout'];
        self.health_admin_state_up = healthmonitor['admin_state_up'];
        self.health_id = healthmonitor['id'];
        self.health_project_id = healthmonitor['tenant_id'];
        if (healthmonitor['type'] === "HTTP") {
          self.httpview = true;
          self.httpmethod = healthmonitor["http_method"];
          self.statuscode = healthmonitor["expected_codes"];
          self.urlpath = healthmonitor["url_path"];
        } else {
          self.httpview = false;
        }
        self.loading = false;
      } catch (res) {
      }
    },
    onRefresh() {
      this.getHealthInfo();
    },
    deleteHealthMonitorClick() {
      let self = this;
      self.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText:  Vue.t('lang.cancel'),
        type: "warning",
        closeOnClickModal: false,
        callback: (action, instance) => {
          if (action === "confirm") {
            self.loadingUp = true;
            self.$ajax({
              type: "DELETE",
              url: "api/octavia/v2.0/lbaas/healthmonitors/"+self.health_id,
              data: {},
              successMsg: Vue.t('network.deleteSuccess'),
              success: function() {
                self.loadingUp = false;
                //self.$router.go(0);
                self.$router.push({
                  path: '/net/balanceView/balanceMonitor/'+self.$route.params.balanceId+"/balanceRespool/"+self.$route.params.monitorId + "?now=" + new Date().getTime()
                });
              },
              errorKey: "NeutronError",
              errFun() {
                self.loadingUp = false;
                //self.$router.go(0);
                self.$router.push({
                  path: '/net/balanceView/balanceMonitor/'+self.$route.params.balanceId+"/balanceRespool/"+self.$route.params.monitorId + "?now=" + new Date().getTime()
                });
              },
              log:{
                description:{
                  en:"Delete Health Monitor:"+self.health_name,
                  zh_cn:"删除健康检查器:"+self.health_name
                },
                target:Vue.logTarget.balance
              }
            });
          }
        }
      });
    },
    backToPreStep() {
      let self = this;
      let loadbalancerId = self.$route.params.balanceId;
      let monitorId = self.$route.params.monitorId;
      let poolId = self.$route.params.poolId;
      self.$router.push({
        path: '/net/balanceView/balanceMonitor/'+loadbalancerId+"/balanceRespool/"+monitorId+"/balanceHealth/"+poolId
      });
    },
    editHealthAction() {
      this.editFlag = true;
    },
    handleEditShow() {
      this.editFlag = false;
       this.getHealthInfo();
    },
    handleCancelShow() {
      this.editFlag = false;
    }
  }
}
</script>
<style scoped>
  .idatath {
    width: 100px;
  }
</style>
