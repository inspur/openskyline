<template>
  <div>
    <el-form ref="editInstanceForm" label-width="100px">
      <el-table ref="umTable" :data="tableData" highlight-current-row stripe border @sort-change="handleSortChanged" :default-sort="{prop: 'start_time', order: 'descending'}" style="width: 100%">
        <el-table-column v-if="columnsChecked.indexOf('uuid') >= 0" prop="request_id" :label="$t('calcStorLang.instLogReqId')">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('operate') >= 0" prop="action" :label="$t('calcStorLang.instOperate')">
          <template slot-scope="scope">
            <span v-html="operateRender(scope.row.action, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('beginTime') >= 0" prop="start_time" :label="$t('calcStorLang.instLogBeginTime')" sortable="custom">
          <template slot-scope="scope">
            <span v-html="dateRender(scope.row.start_time, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('userId') >= 0" prop="user_id" :label="$t('calcStorLang.user')">
          <template slot-scope="scope">
            <span v-html="usersRender(scope.row.user_id, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('result') >= 0" prop="message" :label="$t('calcStorLang.instLogExeResult')">
          <template slot-scope="scope">
            <span v-html="resultRender(scope.row.message, scope.row)"></span>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <!-- <el-col :span="5">
          <el-button type="text" icon="fa-refresh">
          </el-button>
          <span>当前选中 {{multipleSelection.length}}条</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>请选择列</el-tag>
            </div>
          </el-popover>
        </el-col> -->
        <el-col :span="24">
          <page :totalData="totalData" :sortObj="sortObj" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
export default {
  name: 'VmOperateLog',
  props: ['instanceId', 'userMaps'],
  data() {
    return {
      currentPage: 1,
      totalData: [],
      operateUserMap: new Map(),
      columns: [{
        prop: "uuid",
        label: Vue.t('calcStorLang.instLogReqId')
      }, {
        prop: "operate",
        label: Vue.t('calcStorLang.instOperate')
      }, {
        prop: "beginTime",
        label: Vue.t('calcStorLang.instLogBeginTime')
      }, {
        prop: "userId",
        label: Vue.t('calcStorLang.user')
      }, {
        prop: "result",
        label: Vue.t('calcStorLang.instLogExeResult')
      }],
      columnsChecked: ['uuid', 'operate', 'beginTime', 'userId', 'result'],
      tableData: [],
      multipleSelection: [],
      sortObj: {
        sortOrder: 'descending',
        sortField: 'start_time',
        sortType: 'string'
      }
    }
  },
  mounted() {
    var self = this;
    Promise.all([self.loadUserDetail()]).then(function(result) {
      self.getData(self.currentPage);
    });
  },
  watch: {
    instanceId: {
      handler: function(rows, oldVal) {
        this.getData();
      }
    }
  },
  methods: {
    async getData() {
      var self = this;
      self.loading = true;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/nova/v2.1/servers/" + self.instanceId + "/os-instance-actions",
            showErrMsg: true
          });
          self.loading = false;
          var data = result['instanceActions'];
          self.totalData = data;
        } catch (res) {
          self.loading = false;
        }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    resultRender(message, row) {
      if (null == message || "" == message) {
         return this.$t('calcStorLang.success');
      } else if ("Error" == message) {
        return this.$t('calcStorLang.fail');
      } else {
        return '-';
      }
    },
    operateRender(value, rowData) {
      var self = this;
      var operateMsg = '-';
      if (value === 'create') {
        operateMsg = this.$t('calcStorLang.instLogCreated');
      } else if (value === 'detach_usb') {
        operateMsg = this.$t('calcStorLang.detach_usb');
      } else if (value === 'attach_usb') {
        operateMsg = this.$t('calcStorLang.attach_usb');
      } else if (value === 'createImage') {
        operateMsg = this.$t('calcStorLang.instCreateSnapshot');
      } else if (value === 'delete') {
        operateMsg = this.$t('calcStorLang.deleted');
      } else if (value === 'evacuate') {
        operateMsg = this.$t('calcStorLang.instLogEvacuation');
      } else if (value === 'detach_volume') {
        operateMsg = this.$t('calcStorLang.detach_volume');
      } else if (value === 'attach_volume') {
        operateMsg = this.$t('calcStorLang.attach_volume');
      } else if (value === 'attach_interface') {
        operateMsg = this.$t('calcStorLang.attach_interface');
      } else if (value === 'detach_interface') {
        operateMsg = this.$t('calcStorLang.detach_interface');
      } else if (value === 'stop') {
        operateMsg = this.$t('calcStorLang.closed');
      } else if (value === 'start') {
        operateMsg = this.$t('calcStorLang.open');
      } else if (value === 'reboot') {
        operateMsg = this.$t('calcStorLang.instLogReboot');
      } else if (value === 'rebuild') {
        operateMsg = this.$t('calcStorLang.instReconstruction');
      } else if (value === 'revertResize') {
        operateMsg = this.$t('calcStorLang.instLogRevertResize');
      } else if (value === 'confirmResize') {
        operateMsg = this.$t('calcStorLang.instLogConfirmResize');
      } else if (value === 'resize') {
        operateMsg = this.$t('calcStorLang.instAlterConfig');
      } else if (value === 'liveResize') {
        operateMsg = this.$t('calcStorLang.instOnlineExpansion');
      } else if (value === 'migrate') {
        operateMsg = this.$t('calcStorLang.instMigrate');
      } else if (value === 'pause') {
        operateMsg = this.$t('calcStorLang.paused');
      } else if (value === 'unpause') {
        operateMsg = this.$t('calcStorLang.instUnpaused');
      } else if (value === 'suspend') {
        operateMsg = this.$t('calcStorLang.suspended');
      } else if (value === 'resume') {
        operateMsg = this.$t('calcStorLang.instRestore');
      } else if (value === 'rescue') {
        operateMsg = this.$t('calcStorLang.rescue');
      } else if (value === 'unrescue') {
        operateMsg = this.$t('calcStorLang.instUnRescue');
      } else if (value === 'shelve') {
        operateMsg = this.$t('calcStorLang.instShelving');
      } else if (value === 'unshelve') {
        operateMsg = this.$t('calcStorLang.instUnShelving');
      } else if (value === 'live-migration') {
        operateMsg = this.$t('calcStorLang.instOnlineMigrate');
      } else if (value === 'live-migration_cancel') {
        operateMsg = this.$t('calcStorLang.instLogLiveMigrationCancel');
      } else if (value === 'live-migration_force_complete') {
        operateMsg = this.$t('calcStorLang.instLogLiveMigrationForceComplete');
      } else if (value === 'lock') {
        operateMsg = this.$t('calcStorLang.lock');
      } else if (value === 'unlock') {
        operateMsg = this.$t('calcStorLang.unlock');
      } else if (value === 'createBackup') {
        operateMsg = this.$t('calcStorLang.createBackup');
      } else if (value === 'enable_optical_drive') {
        operateMsg = this.$t('calcStorLang.INSTANCE_ISO_ENABLE');
      } else if (value === 'disable_optical_drive') {
        operateMsg = this.$t('calcStorLang.INSTANCE_ISO_DISABLE');
      } else if (value === 'inject_cdrom') {
        operateMsg = this.$t('calcStorLang.INSTANCE_ISO_INJECT_IMAGE');
      } else if (value === 'eject_cdrom') {
        operateMsg = this.$t('calcStorLang.INSTANCE_ISO_EJECT_IMAGE');
      } else if (value === 'changePassword') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_CHANGE_PASSWORD');
      } else if (value === 'extend_volume') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_EXTEND_VOLUME');
      } else if (value === 'restore') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_RESTORE');
      } else if (value === 'shelveOffload') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_SHELVE_OFFLOAD');
      } else if (value === 'swap_volume') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_SWAP_VOLUME');
      } else if (value === 'trigger_crash_dump') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_TRIGGER_CRASH_DUMP');
      } else if (value === 'reset_state') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_RESET_STATE');
      } else if (value === 'passthruAttach') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_PASSTHRU_ATTACH');
      } else if (value === 'passthruDetach') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_PASSTHRU_DETACH');
      } else if (value === 'set_cpu_pin') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_SET_CPU_PIN');
      } else if (value === 'unset_cpu_pin') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_UNSET_CPU_PIN');
      } else if (value === 'bind_accel') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_ATTACH_GPU');
      } else if (value === 'unbind_accel') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_DETACH_GPU');
      } else if (value === 'set_auto_boot') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_SET_AUTO_BOOT');
      } else if (value === 'mutationDiskBus') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_MUTATION_DISK_BUS');
      } else if (value === 'hard_stop') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_HARD_STOP');
      } else if (value === 'restore_backup') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_RESTORE_BACKUP');
      } else if (value === 'set_block_qos') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_SET_BLOCK_QOS');
      } else if (value === 'attach_redirdev') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_ATTACH_REDIRDEV');
      } else if (value === 'detach_redirdev') {
        operateMsg = this.$t('calcStorLang.OPERATE_LOG_DETACH_REDIRDEV');
      }
      return operateMsg;
    },
    dateRender(value, rowData) {
      var self = this;
      var createTime = rowData['start_time'];
      if (createTime.lastIndexOf("Z") < 0 && createTime.lastIndexOf(".") >= 0) {
        createTime = createTime.substring(0, createTime.lastIndexOf(".")) + "Z";
      }
      var time = Date.parse(new Date(createTime));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    usersRender(value, rowData) {
      var self = this;
      var userName = this.operateUserMap.get(value) || value || "-";
      return userName;
    },
    async loadUserDetail() {
      var self = this;
       self.loading = true;
       try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/keystone/v3/inspur/users?domain_id=default',
          showErrMsg: true
        });
        self.loading = false;
        var uList = result['users'];
        for (let u = 0; u < uList.length; u++) {
           var uObj = uList[u];
           self.operateUserMap.set(uObj.id, uObj.name);
        }
      } catch (res) {
        self.loading = false;
      }
    },
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
    },
    handleSortChanged(column) {
      this.sortObj = {
        sortOrder: column.order,
        sortField: column.prop,
        sortType: 'string'
      };
      console.log(this.sortObj);
    }
  }
}

</script>
<style scoped>
</style>
