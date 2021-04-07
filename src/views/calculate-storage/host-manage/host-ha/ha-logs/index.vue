<template>
  <div>
    <div>
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
      <div class="divider clearfix"></div>
      <el-row type="flex" align="middle">
        <el-radio-group v-model="logType" size="small">
          <el-radio-button label="">{{ $t('calcStorLang.HA_NOTIFACATION_ALL') }}({{ totalData.length }})</el-radio-button>
          <el-tooltip v-if="greenLogCount !== 0" trigger="hover" effect="dark" :content="$t('calcStorLang.HA_NOTIFACATION_UNHANDLED_GREEN_TIPS')" placement="top">
            <el-radio-button label="green">{{ $t('calcStorLang.HA_NOTIFACATION_UNHANDLED_GREEN') }}({{ greenLogCount }})</el-radio-button>
          </el-tooltip>
          <el-tooltip v-if="greenLogCount !== 0" trigger="hover" effect="dark" :content="$t('calcStorLang.HA_NOTIFACATION_UNHANDLED_YELLOW_TIPS')" placement="top">
            <el-radio-button label="yellow">{{ $t('calcStorLang.HA_NOTIFACATION_UNHANDLED_YELLOW') }}({{ yellowLogCount }})</el-radio-button>
          </el-tooltip>
          <el-tooltip v-if="greenLogCount !== 0" trigger="hover" effect="dark" :content="$t('calcStorLang.HA_NOTIFACATION_UNHANDLED_RED_TIPS')" placement="top">
            <el-radio-button label="red">{{ $t('calcStorLang.HA_NOTIFACATION_UNHANDLED_RED') }}({{ redLogCount }})</el-radio-button>
          </el-tooltip>
        </el-radio-group>
      </el-row>
      <div class="divider clearfix"></div>
      <div>
        <el-button
          v-if="['', 'green', 'yellow', 'red'].includes(logType)"
          size="small"
          type="primary"
          icon="fa-envelope-open"
          @click="read(false)"
          :disabled="multipleSelection.length === 0 || multipleSelection.find(item => item.acked === true)">
          {{ $t('calcStorLang.HA_NOTIFACATION_READ') }}
        </el-button>
        <el-button
          v-if="['red'].includes(logType)"
          size="small"
          type="primary"
          icon="fa-play-circle"
          @click="read(true)"
          :disabled="multipleSelection.length === 0">
          {{ $t('calcStorLang.HA_NOTIFACATION_EVACUATION_CONTINUE') }}
        </el-button>
      </div>
      <div class="divider clearfix"></div>
      <el-table ref="umTable" :data="tableData" v-loading="loading" highlight-current-row stripe border row-key="id" :default-sort="{prop: 'name'}" @selection-change="handleSelectionChange" @sort-change="sortChange">
        <el-table-column reserve-selection type="selection" width="55" align="center"></el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('notification_uuid') >= 0" :label="$t('calcStorLang.notificationsUUID')" prop="notification_uuid">
          <template slot-scope="scope">
            <el-button @click="haLogDetail(scope.row)" type="text" size="small">{{scope.row.notification_uuid}}</el-button>
          </template>
        </el-table-column>
        <el-table-column sortable v-if="columnsChecked.indexOf('failover_segment_name') >= 0" :label="$t('calcStorLang.failoverSegmentName')" prop="failover_segment_name">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('source_host_name') >= 0" :label="$t('calcStorLang.sourceHostName')" prop="source_host_name">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('type') >= 0" :label="$t('calcStorLang.type')" prop="type">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('status') >= 0" :label="$t('calcStorLang.status')" prop="status">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('updated_at') >= 0" :fit=true :label="$t('lang.updatedTime')" prop="updated_at">
          <template slot-scope="scope">
            <span v-html="dataFormatter(scope.row.updated_at)"></span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <span width="20px">
            <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            </span>
            <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc("lang.item", multipleSelection.length)}}</span>
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" class="name-wrapper">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="19">
            <page :totalData="filteredTotalData" @getCurrentData="getCurrentData"></page>
          </el-col>
        </el-row>
      </div>
    </div>
    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="haLogDetailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
           <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
          </div>
          <div>
            <ha-log-detail :info="info" :notificationUUID="notificationUUID"></ha-log-detail>
          </div>
        </panel>
      </div>
    </transition>
  </div>    
</template>
<script>
import HaLogDetail from './HaLogDetail';
export default {
  name: 'HALogs',
  components: {HaLogDetail},
  data() {
    return {
      loading: true,
      totalData:[],
      tableData: [],
      refreshTimes:1,
      notificationUUID:"",
      haLogDetailFlag:false,
      notificTypeList:[{value:'VM', label:Vue.t('calcStorLang.HA_LOG_TYPE_VM')}, {value:'PROCESS', label:Vue.t('calcStorLang.HA_LOG_TYPE_PROCESS')}, {value:'COMPUTE_HOST', label:Vue.t('calcStorLang.HA_LOG_TYPE_COMPUTE_HOST')}],
      columns: [{
        prop: "failover_segment_name",
        label: Vue.t('calcStorLang.failoverSegmentName')
      }, {
        prop: "source_host_name",
        label: Vue.t('calcStorLang.sourceHostName')
      }, {
        prop: "notification_uuid",
        label: Vue.t('calcStorLang.notificationsUUID')
      }, {
        prop: "type",
        label: Vue.t('calcStorLang.type')
      }, {
        prop: "status",
        label: Vue.t('calcStorLang.status')
      }, {
        prop: "updated_at",
        label: Vue.t('lang.updatedTime')
      }],
      columnsChecked: ['failover_segment_name', 'source_host_name', 'notification_uuid', 'type', 'status', 'updated_at'],
      multipleSelection: [],
      searchBar: {
        conditions: {
          source_host_name: {
            label: this.$t('calcStorLang.sourceHostName'),
            type: 'select',
            options: []
          },
          failover_segment_name: {
            label: this.$t('calcStorLang.failoverSegmentName'),
            type: 'select',
            options: []
          },
          type: {
            label: this.$t('calcStorLang.type'),
            type: 'select',
            options: [
              {value:'VM', label:Vue.t('calcStorLang.HA_LOG_TYPE_VM')},
              {value:'PROCESS', label:Vue.t('calcStorLang.HA_LOG_TYPE_PROCESS')},
              {value:'COMPUTE_HOST', label:Vue.t('calcStorLang.HA_LOG_TYPE_COMPUTE_HOST')}
            ]
          }
        },
        validatedParams: {}
      },
      logType: ''
    };
  },
  mounted() {
    this.getData();
    this.loadHosts();
    this.loadSegments();
  },
  beforeRouteLeave(to, from, next) {
    next()
  },
  beforeRouteEnter(to, from, next) {
    next()
  },
  methods: {
    async getData() {
      this.loading = true;
      let reqUrl = "api/masakari/v1/notifications?status=finished,failed,error,running,new";
      reqUrl += Object.keys(this.searchBar.validatedParams).map(key => {
        return `&${key}=${this.searchBar.validatedParams[key]}`;
      }).join('');
      try {
        let result = await this.$ajax({
          type: 'get',
          url: reqUrl
        });
        var restLength = result['notifications'].length;
        var rest = restLength > 0 ? result['notifications'] : [];
        this.total = restLength > 0 ? restLength : 0;
        let totalData = [];
        for (let i=0; i < rest.length; i++) {
          rest[i].payload = this.payroadFormater(rest[i].type, rest[i].payload);
          rest[i].type = this.notifiTypeDict(rest[i].type);
          rest[i].status = this.statusDict(rest[i].status);
          totalData.push(rest[i]);
        }
        this.totalData = totalData;
        this.loading = false;
      } catch (e) {
        this.loading = false;
        __DEV__ && console.error(e);
      }
    },
    async loadHosts() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          url: `api/nova/v2.1/os-hypervisors/detail`,
          type: 'get'
        });
        let hosts = res.hypervisors.filter(item => item.hypervisor_type !== 'ironic');
        $this.searchBar.conditions.source_host_name.options = hosts.map(item => {
          return {
            label: item.hypervisor_hostname,
            value: item.hypervisor_hostname
          };
        });
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadSegments() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          url: `api/masakari/v1/segments`,
          type: 'get'
        });
        let segments = res.segments;
        $this.searchBar.conditions.failover_segment_name.options = segments.map(item => {
          return {
            label: item.name,
            value: item.name
          };
        });
      } catch (e) {
        __DEV__ && console.error(e);
      }
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
    },
    sortChange(column) {
       var key = column.prop;
       var keyOrder = column.order;
       if (keyOrder != null && this.totalData != null) {
          this.totalData.sort(this.$sortFormatter(key, keyOrder));
       }
    },
    reaz() {
      this.$refs.az.getData();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    onRefresh() {
      this.getData();
      this.refreshTimes += 1;
    },
    haLogDetail(row) {
      this.haLogDetailFlag = true;
      this.info = row;
      this.notificationUUID = row['notification_uuid'];
    },
    onBack() {
      this.haLogDetailFlag = false;
    },
    //事件类型
    notifiTypeDict:function(value) {
      let temp = "";
      switch (value) {
        case "VM" : temp = Vue.t('calcStorLang.HA_LOG_TYPE_VM'); break;//云主机
        case "PROCESS" : temp = Vue.t('calcStorLang.HA_LOG_TYPE_PROCESS'); break;//主机进程
        case "COMPUTE_HOST" : temp = Vue.t('calcStorLang.HA_LOG_TYPE_COMPUTE_HOST'); break;//主机
        default : temp = value;
      }
      return temp;
    },
    //状态类型，涉及到下拉框和列表状态列
    statusDict:function(value) {
      let temp = "";
      switch (value) {
        case "ignored" : temp = Vue.t('calcStorLang.ignored'); break;//忽略
        case "finished" : temp = Vue.t('calcStorLang.finished'); break;//结束
        case "failed" : temp = Vue.t('calcStorLang.failed'); break;//失败
        case "error" : temp = Vue.t('calcStorLang.error'); break;//错误
        case "running" : temp = Vue.t('calcStorLang.running'); break;//运行
        case "new" : temp = Vue.t('calcStorLang.new'); break;//新建
        default : temp = value;
      }
      return temp;
    },
    /// payroad 事件信息格式化
    payroadFormater:function(type, val) {
      if (typeof val != "object") {
        console.warn("The input param 'val' of Function 'payroadFormater' is not an Object//-HaLog.Vue-//" );
        console.warn("val :" + JSON.stringify(val));
        return JSON.stringify(val);
      }
      let valArray = [];
      var Obj = {
        key:"",
        value:""
      };
      if (type === "COMPUTE_HOST") {
        if (val.event) {
          let obj = Object.assign({}, Obj);
          obj.key = Vue.t('calcStorLang.event');//事件
          switch (val.event) {
            case "STARTED" : obj.value = Vue.t('calcStorLang.STARTED'); break;//开启
            case "STOPPED" : obj.value = Vue.t('calcStorLang.STOPPED'); break;//关闭
            default : obj.value = val.event;
          }
          valArray.push(obj);
        }
        if (val.cluster_status) {
          let obj = Object.assign({}, Obj);
          obj.key = Vue.t('calcStorLang.cluster_status');//集群状态
          switch (val.cluster_status) {
            case "ONLINE" : obj.value = Vue.t('calcStorLang.ONLINE'); break;//在线
            case "OFFLINE" : obj.value = Vue.t('calcStorLang.OFFLINE'); break;//离线
            default : obj.value = val.cluster_status;
          }
          valArray.push(obj);
        }
        if (val.host_status) {
          let obj = Object.assign({}, Obj);
          obj.key = Vue.t('calcStorLang.host_status');//主机状态
          switch (val.host_status) {
            case "NORMAL" : obj.value = Vue.t('calcStorLang.NORMAL'); break;//正常
            case "UNKNOWN" : obj.value = Vue.t('calcStorLang.UNKNOWN'); break;//未知
            default : obj.value = val.host_status;
          }
          valArray.push(obj);
        }
      } else if (type === "PROCESS") {
        if (val.event) {
          let obj = Object.assign({}, Obj);
          obj.key = Vue.t('calcStorLang.event');//事件
          switch (val.event) {
            case "STARTED" : obj.value = Vue.t('calcStorLang.STARTED'); break;//开启
            case "STOPPED" : obj.value = Vue.t('calcStorLang.STOPPED'); break;//关闭
            default : obj.value = val.event;
          }
          valArray.push(obj);
        }
        if (val.process_name) {
          let obj = Object.assign({}, Obj);
          obj.key = Vue.t('calcStorLang.process_name');//进程名称
          obj.value = val.process_name;
          valArray.push(obj);
        }
      } else if (type === "VM") {
        if (val.event) {
          let obj = Object.assign({}, Obj);
          obj.key = Vue.t('calcStorLang.event');//事件
          switch (val.event) {
            case "LIFECYCLE" : obj.value = Vue.t('calcStorLang.LIFECYCLE'); break;//云主机操作
            case "REBOOT" : obj.value = Vue.t('calcStorLang.REBOOT'); break;//重启操作
            case "WATCHDOG" : obj.value = Vue.t('calcStorLang.WATCHDOG'); break;//看门狗事件
            case "IO_ERROR" : obj.value = Vue.t('calcStorLang.IO_ERROR'); break;//读写错误
            case "IO_ERROR_REASON" : obj.value = Vue.t('calcStorLang.IO_ERROR_REASON'); break;//读写错误
            case "CONTROL_ERROR" : obj.value = Vue.t('calcStorLang.CONTROL_ERROR'); break;//控制错误
            default : obj.value = val.event;
          }
          valArray.push(obj);
        }
        if (val.instance_uuid) {
          let obj = Object.assign({}, Obj);
          obj.key = Vue.t('calcStorLang.instance_uuid');//云主机UUID
          obj.value = val.instance_uuid;
          valArray.push(obj);
        }
        if (val.vir_domain_event) {
          let obj = Object.assign({}, Obj);
          obj.key = Vue.t('calcStorLang.vir_domain_event');//(操作)取值列表
          switch (val.vir_domain_event) {
            case "SUSPENDED_IOERROR" : obj.value = Vue.t('calcStorLang.SUSPENDED_IOERROR'); break;//暂停
            case "SUSPENDED_WATCHDOG" : obj.value = Vue.t('calcStorLang.SUSPENDED_WATCHDOG'); break;//暂停
            case "SUSPENDED_API_ERROR" : obj.value = Vue.t('calcStorLang.SUSPENDED_API_ERROR'); break;//暂停
            case "STOPPED_SHUTDOWN" : obj.value = Vue.t('calcStorLang.STOPPED_SHUTDOWN'); break;//关机
            case "STOPPED_DESTROYED" : obj.value = Vue.t('calcStorLang.STOPPED_DESTROYED'); break;//关机
            case "STOPPED_FAILED" : obj.value = Vue.t('calcStorLang.STOPPED_FAILED'); break;//异常操作
            case "SHUTDOWN_FINISHED" : obj.value = Vue.t('calcStorLang.SHUTDOWN_FINISHED'); break;//关机
            case "WATCHDOG_NONE" : obj.value = Vue.t('calcStorLang.WATCHDOG_NONE'); break;//看门狗操作
            case "WATCHDOG_PAUSE" : obj.value = Vue.t('calcStorLang.WATCHDOG_PAUSE'); break;//看门狗操作
            case "WATCHDOG_POWEROFF" : obj.value = Vue.t('calcStorLang.WATCHDOG_POWEROFF'); break;//看门狗操作
            case "WATCHDOG_RESET" : obj.value = Vue.t('calcStorLang.WATCHDOG_RESET'); break;//看门狗操作
            case "WATCHDOG_SHUTDOWN" : obj.value = Vue.t('calcStorLang.WATCHDOG_SHUTDOWN'); break;//看门狗操作
            case "WATCHDOG_DEBUG" : obj.value = Vue.t('calcStorLang.WATCHDOG_DEBUG'); break;//看门狗操作
            case "IO_ERROR_NONE" : obj.value = Vue.t('calcStorLang.IO_ERROR_NONE'); break;//读写错误
            case "IO_ERROR_PAUSE" : obj.value = Vue.t('calcStorLang.IO_ERROR_PAUSE'); break;//读写错误
            case "IO_ERROR_REPORT" : obj.value = Vue.t('calcStorLang.IO_ERROR_REPORT'); break;//读写错误
            case "UNKNOWN" : obj.value = Vue.t('calcStorLang.UNKNOWN_OPT'); break;//未知操作
            default : obj.value = val.vir_domain_event;
          }
          valArray.push(obj);
        }
      } else {
        let obj = Object.assign({}, Obj);
        obj.key= Vue.t('calcStorLang.event');//事件
        obj.value = JSON.stringify(val);
        valArray.push(obj);
      }
      return valArray;
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.logType = '';
      this.getData();
    },
    async read(setStatusToNew=false) {
      const $this = this;
      let confirmMessage = setStatusToNew
        ? $this.$t('calcStorLang.HA_NOTIFACATION_EVACUATION_CONTINUE_CONFIRM_MESSAGE')
        : $this.$t('calcStorLang.HA_NOTIFACATION_READ_CONFIRM_MESSAGE');
      $this.$confirm(confirmMessage, Vue.t('base.prompt'), {
        type: 'warning'
      }).then(async () => {
        let hasError = false;
        for (let i = 0; i < $this.multipleSelection.length; i++) {
          try {
            let item = $this.multipleSelection[i];
            let notificationData = {
              acked: 'True'
            };
            if (setStatusToNew) {
              notificationData['status'] = 'new';
            }
            let res = await $this.$ajax({
              type: 'put',
              url: `api/masakari/v1/notifications/${item.notification_uuid}`,
              data: JSON.stringify({
                notification: notificationData
              }),
              log: {
                description: {
                  en: `HA Notification ${item.notification_uuid} ${setStatusToNew?'Evacuation Continue':'Has Read'}`,
                  zh_cn: `高可用事件 ${item.notification_uuid} ${setStatusToNew?'继续疏散':'已读'}`
                },
                target: Vue.logTarget.hostHa
              }
            });
            item.acked = true;
          } catch (e) {
            hasError = true;
            __DEV__ && console.error(e);
          }
        }
        if (!hasError) {
          let successMessage = setStatusToNew
            ? $this.$t('calcStorLang.HA_NOTIFACATION_EVACUATION_CONTINUE_SUCCESS')
            : $this.$t('calcStorLang.HA_NOTIFACATION_READ_SUCCESS');
          $this.$message.success(successMessage);
        }
        $this.$refs.umTable.clearSelection();
        if ($this.filteredTotalData.length === 0 && $this.logType !== '') {
          $this.logType = '';
        }
      });
    }
  },
  watch: {
    filteredTotalData() {
      this.$refs.umTable.clearSelection();
    }
  },
  computed: {
    filteredTotalData() {
      switch (this.logType) {
        case 'green':
          return this.totalData.filter(item => item.acked === false && item.level === 'INFO');
        case 'yellow':
          return this.totalData.filter(item => item.acked === false && item.level === 'WARNING');
        case 'red':
          return this.totalData.filter(item => item.acked === false && item.level === 'CRITICAL');
        default:
          return this.totalData;
      }
    },
    greenLogCount() {
      return this.totalData.filter(item => item.acked === false && item.level === 'INFO').length;
    },
    yellowLogCount() {
      return this.totalData.filter(item => item.acked === false && item.level === 'WARNING').length;
    },
    redLogCount() {
      return this.totalData.filter(item => item.acked === false && item.level === 'CRITICAL').length;
    }
  }
}
</script>
<style scoped>
</style>
