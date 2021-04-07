  <template>
  <div><!-- 概要 -->
     <el-col :span="24" style="text-align:left">
     <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath">{{$t('lang.name')}}：</th>
                    <td class="idatatd">{{clusterName}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">ID：</th>
                    <td class="idatatd">{{uuid}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('lang.status')}}：</th>
                    <td class="idatatd">
                      <span v-if="statusRender(clusterStatus) === '-'">-</span>
                      <el-tag v-else :type="statusTagRender(clusterStatus)">
                       <span v-html="statusRender(clusterStatus)"></span>
                      </el-tag>
                    </td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('scalingService.statusReason')}}：</th>
                    <td class="idatatd">{{clusterStatusReason}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('scalingService.maxCapabilitySize')}}：</th>
                    <td class="idatatd">{{clusterMaxSize}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('scalingService.minCapabilitySize')}}：</th>
                    <td class="idatatd">{{clusterMinSize}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath">{{$t('scalingService.desiredCapacity')}}：</th>
                    <td class="idatatd">{{clusterDesiredSize}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('scalingService.overtimeLimit')}}：</th>
                    <td class="idatatd">{{clusterTimeout}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('lang.createTime')}}：</th>
                    <td class="idatatd">
                      <span v-html="dateRender(clustercreatedAt)"></span>
                    </td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('lang.updatedTime')}}：</th>
                    <td class="idatatd">
                      <span v-html="dateRender(clusterupdatedAt)"></span>
                    </td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('scalingService.lbPolicy')}}：</th>
                    <td class="idatatd">
                      <!-- <el-tag :type="balanceStatusTagRender(loadblanceState)"> -->
                        <el-button @click="nameClick(balanceId)" type="primary" :disabled="!balanceName" size="mini">{{balanceName?balanceName:$t('scalingService.unSet')}}</el-button>
                      <!-- </el-tag> -->
                    </td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('scalingService.vipAddress')}}：</th>
                    <td class="idatatd">
                      <span v-html="balanceVipRender(loadblanceVip)"></span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>           
        </el-col>
  </div>
</template>
<script>
  export default {
    name: 'scalingDetail',
    props:["clusterId", "projectId", "statusTem"],
    data () {
      return {
        balanceId: "",
        balanceName: "",
        uuid:"",
        clusterName:"",
        clusterStatus:"",
        clusterStatusReason:"",
        clusterMaxSize:"",
        clusterMinSize:"",
        clusterDesiredSize:"",
        clusterTimeout:"",
        clustercreatedAt:"",
        clusterupdatedAt:"",
        loadblanceState:"",
        loadblanceVip:""
      }
    },
    computed: {
    },
    watch: {
      clusterId: {
        immediate: true,
        handler: function(value) {
          this.initBaseDetail();
        }
      }
      // statusTem: {
      //   immediate: true,
      //   handler: function(value) {
      //     this.initBaseDetail();
      //   }
      // }
    },
    mounted () {
      this.initForm = Object.assign({}, this.autoScalingGrpForm);
      //this.initBaseDetail();
    },
    beforeRouteLeave (to, from, next) {
      next()
    },
    beforeRouteEnter (to, from, next) {
      next()
    },
    methods: {
     async initBaseDetail() {
      var self = this;
      self.uuid = "-";
      self.clusterName = "-";
      self.clusterStatus = "-";
      self.clusterStatusReason = "-";
      self.clusterMaxSize = "-";
      self.clusterMinSize = "-";
      self.clusterDesiredSize = "-";
      self.clusterTimeout = "-";
      self.clustercreatedAt = "-";
      self.clusterupdatedAt = "-";
      self.loadblanceState = "-";
      self.loadblanceVip = "-";
      self.balanceName = ""
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/senlin/v1/clusters/'+ self.clusterId
        });
        if (result['cluster']) {
          let cluster = result['cluster'];
          self.uuid = cluster['id'];
          self.clusterName = cluster['name'];
          self.clusterStatus = cluster['status'];
          self.clusterStatusReason = cluster['status_reason'];
          self.clusterMaxSize = cluster['max_size'];
          self.clusterMinSize = cluster['min_size'];
          self.clusterDesiredSize = cluster['desired_capacity'];
          self.clusterTimeout = cluster['timeout'];
          self.clustercreatedAt = cluster['init_at'];
          self.clusterupdatedAt = cluster['updated_at'];
          self.loadblanceState = cluster['policies'];
          self.loadblanceVip = cluster['data'];
          for (var k in cluster['data']['loadbalancers']) {
            for (var s in cluster['data']['loadbalancers'][k]) {
              self.balanceId = cluster['data']['loadbalancers'][k]['lb_id'];
              if (self.balanceId) {
                this.$ajax({
                  type: 'get',
                  url: "api/octavia/v2.0/lbaas/loadbalancers/" + self.balanceId,
                  successFun(data) {
                    self.balanceName = data.loadbalancer.name;
                  }
                });
              }
            }
          }
        } else {
          return;
        }
      } catch (res) {
      }
    },
    statusTagRender(status) {
        if ("ACTIVE" == status) {
           return "success";
        } else if ("DELETING" == status || "PREDELETING" == status) {
           return "gray";
        } else if ("WARNING" == status || "CRITICAL" == status || "ERROR" == status) {
           return "danger";
        } else if ("INIT" == status || "RECOVERING" == status || "OPERATING" == status) {
           return "info";
        } else if ("CREATING" == status || "RESIZING" == status || "UPDATING" == status || "CHECKING" == status) {
           return "info";
        } else {
          return "";
        }
    },
    statusRender(value, rowData) {
       if (value == "INIT") {
           return this.$t('scalingService.init');
       } else if (value == "ACTIVE") {
           return this.$t('scalingService.available');
       } else if (value == "ERROR") {
           return this.$t('scalingService.error');
       } else if (value == "CRITICAL") {
           return this.$t('scalingService.critical');
       } else if (value == "WARNING") {
           return this.$t('scalingService.warning');
       } else if (value == "CREATING") {
           return this.$t('scalingService.creating');
       } else if (value == "UPDATING") {
           return this.$t('scalingService.updating');
       } else if (value == "RESIZING") {
           return this.$t('scalingService.resizing');
       } else if (value == "DELETING" || value == "PREDELETING") {
           return this.$t('scalingService.deleting');
       } else if (value == "CHECKING") {
           return this.$t('scalingService.checking');
       } else if (value == "RECOVERING") {
           return this.$t('scalingService.recovering');
       } else if (value == "OPERATING") {
           return this.$t('scalingService.operating');
       } else {
           return "-";
       }
    },
    balanceStatusTagRender(value) {
      var size = parseInt(value.length);
      if (size > 2) {
        return "success";
      } else {
        return "";
      }
    },
    balanceStatusRender(value) {
      var size = parseInt(value.length);
      if (size > 2) {
        return this.$t('scalingService.hasSet');
      } else {
        return this.$t('scalingService.unSet');
      }
    },
    balanceVipRender(value) {
      let loadbalances = value['loadbalancers'];
      if (loadbalances) {
        var vip = "";
        for (var k in loadbalances) {
          for (var s in loadbalances[k]) {
            vip = loadbalances[k]['vip_address'];
            break;
          }
        }
        return vip;
      } else {
        return "-";
      }
    },
    nameClick(val) {
      this.$router.push({
        path: "/net/balanceView/balanceMonitor/" + val + "/" + this.projectId
      });
    },
    balanceNameRender(value) {
      if (value) {
        for (var k in value) {
          for (var s in value[k]) {
            let name = value[k]['lb_id'];
            this.$ajax({
              type: 'get',
              url: "api/octavia/v2.0/lbaas/loadbalancers/" + name,
              successFun(data) {
                return data.loadbalancer.name;
              }
            });
          }
        }
      } else {
        return "-";
      }
    },
    dateRender(value) {
      var self = this;
      var time = Date.parse(new Date(value));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    /**
     * 将时间戳格式化的方法
     * @param timeStamp时间戳值
     * @param fmt 要生成的格式，如yyyy-MM-dd HH:mm:ss
     * @returns
     */
    formatTimeStamp(timeStamp, fmt) {
      if (!timeStamp) {
        return "";
      }
      var date = new Date();
      date.setTime(timeStamp);
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : ""));
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    }
    }
  }
</script>
<style scoped>
  .formspan {
    font-weight:bold;
    float:right;
  }
  .titlespan {
    font-size: 20px;
    text-align: left;
  }
  .contentspan {
    text-align: left;
  }
</style>
