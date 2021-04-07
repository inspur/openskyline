<template>
  <div>
    <el-form ref="editInstanceForm" label-width="100px">
      <el-table ref="umTable" :data="tableData" highlight-current-row stripe border style="width: 100%">
        <el-table-column v-if="columnsChecked.indexOf('uuid') >= 0" prop="request_id" :label="$t('calcStorLang.instLogReqId')">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('operate') >= 0" prop="action" :label="$t('calcStorLang.instOperate')">
          <template slot-scope="scope">
            <span v-html="operateRender(scope.row.action, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('beginTime') >= 0" prop="start_time" :label="$t('calcStorLang.instLogBeginTime')">
          <template slot-scope="scope">
            <span v-html="dateRender(scope.row.created, scope.row)"></span>
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
          <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
export default {
  name: 'LoadDisk',
  props: ['InstanceId', 'userMaps'],
  data() {
    return {
      currentPage: 1,
      totalData: [],
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
      multipleSelection: []
    }
  },
  mounted() {
    this.getData(this.currentPage);
  },
  watch: {
    InstanceId: {
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
            url: "api/nova/v2.1/servers/" + self.InstanceId + "/os-instance-actions",
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
      var operateMsg = "-";
      if ("create" == value) {
         operateMsg = this.$t('calcStorLang.instLogCreated');
      } else if ("delete" == value) {
         operateMsg = this.$t('calcStorLang.deleted');
      } else if ("evacuate" == value) {
         operateMsg = this.$t('calcStorLang.instLogEvacuation');
      } else if ("stop" == value) {
         operateMsg = this.$t('calcStorLang.closed');
      } else if ("start" == value) {
         operateMsg = this.$t('calcStorLang.open');
      } else if ("reboot" == value) {
         operateMsg = this.$t('calcStorLang.instLogReboot');
      } else if ("rebuild" == value) {
         operateMsg = this.$t('calcStorLang.instReconstruction');
      } else if ("revertResize" == value) {
         operateMsg = this.$t('calcStorLang.instLogRevertResize');
      } else if ("confirmResize" == value) {
         operateMsg = this.$t('calcStorLang.instLogConfirmResize');
      } else if ("resize" == value) {
         operateMsg = this.$t('calcStorLang.instAlterConfig');
      } else if ("migrate" == value) {
         operateMsg = this.$t('calcStorLang.instMigrate');
      } else if ("pause" == value) {
         operateMsg = this.$t('calcStorLang.paused');
      } else if ("unpause" == value) {
         operateMsg = this.$t('calcStorLang.instUnpaused');
      } else if ("suspend" == value) {
         operateMsg = this.$t('calcStorLang.suspended');
      } else if ("resume" == value) {
         operateMsg = this.$t('calcStorLang.instRestore');
      } else if ("rescue" == value) {
         operateMsg = this.$t('calcStorLang.rescue');
      } else if ("unrescue" == value) {
         operateMsg = this.$t('calcStorLang.instUnRescue');
      } else if ("shelve" == value) {
         operateMsg = this.$t('calcStorLang.instShelving');
      } else if ("unshelve" == value) {
         operateMsg = this.$t('calcStorLang.instUnShelving');
      } else if ("live-migration" == value) {
         operateMsg = this.$t('calcStorLang.instOnlineMigrate');
      } else if ("live-migration_cancel" == value) {
         operateMsg = this.$t('calcStorLang.instLogLiveMigrationCancel');
      } else if ("live-migration_force_complete" == value) {
         operateMsg = this.$t('calcStorLang.instLogLiveMigrationForceComplete');
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
      var userName = this.userMaps.get(value) || value || "-";
      return userName;
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
    }
  }
}

</script>
<style scoped>
</style>
