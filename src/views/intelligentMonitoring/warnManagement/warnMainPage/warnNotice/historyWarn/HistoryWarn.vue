<template>
<div>
  <div class="divider"></div>
  <el-form :inline="true" :model="formInline" class="form-inline">
    <el-form-item :label="$t('monitor.alarmLevel')">
      <el-select v-model="formInline.level" size="small" clearable>
        <el-option v-for="(val, key, index) in alarmLevelListButOK" :key="key" :label="val" :value="key">{{val}}</el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('monitor.alarmTime')">
    </el-form-item>
    <el-form-item>
      <el-date-picker style="width:150px;" v-model="formInline.startTime" type="date" :editable="false" :placeholder="$t('lang.startDate')" :picker-options="spickerOption"></el-date-picker>
    </el-form-item>
    <el-form-item>
      <span>-</span>
    </el-form-item>
    <el-form-item>
      <el-date-picker style="width:150px;" v-model="formInline.endTime" type="date" :editable="false" :placeholder="$t('lang.endDate')" :picker-options="epickerOption"></el-date-picker>
    </el-form-item>
    <el-form-item :label="$t('monitor.confirmStatus')">
      <el-select v-model="formInline.confirm" size="small">
        <el-option :label="$t('base.all')" value=""></el-option>
        <el-option :label="$t('monitor.unconfirmed')" value="0"></el-option>
        <el-option :label="$t('monitor.confirmed')" value="1"></el-option>
      </el-select>
    </el-form-item>
    <!-- <el-form-item :label="$t('monitor.publicStatus')">
      <el-select v-model="formInline.public" size="small">
        <el-option :label="$t('base.all')" value=""></el-option>
        <el-option :label="$t('monitor.notRecognized')" value="0"></el-option>
        <el-option :label="$t('monitor.alreadyRecognized')" value="1"></el-option>
      </el-select>
    </el-form-item> -->
    <el-form-item>
      <el-button type="primary" icon='fa-search' @click="onQuery" size="small">{{$t('base.query')}}</el-button>
    </el-form-item>
  </el-form>
  <div class="divider clearfix"></div>
  <operation-panel
    class="margin-tb5"
    :select-rows="multipleSelection"
    :operation-menus="operationMenus">
  </operation-panel>
  <el-table
    ref="deTable"
    :data="tableData"
    v-loading="loading"
    row-key="alert_id"
    @row-click="rowClick"
    @selection-change="handleSelectionChange"
    :element-loading-text="$t('base.loadingData')"
    highlight-current-row
    style="width: 100%">
    <el-table-column reserve-selection type="selection" align="center" width="55">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('update_time') >= 0"
      prop="update_time"
      :label="$t('monitor.alarmTime')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <span>{{scope.row.insert_time?scope.row.insert_time.replace('T', ' ').replace('.000000',''):'-'}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('duration') >= 0"
      prop="duration"
      :label="$t('monitor.alarmDuration')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <span>{{renderKeepTimeFun(scope.row.insert_time, scope.row.update_time)}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('alert_content') >= 0"
      prop="alert_content"
      :show-overflow-tooltip="false"
      :label="$t('monitor.alarmDetail')"
      align="left"
      min-width="100">
      <template slot-scope="scope">
        <div style="max-height: 120px; overflow-y: auto;" v-html="scope.row.alert_content ? scope.row.alert_content.replace(/;/g, '&lt;br&gt;') : '-'"></div>
      </template>
    </el-table-column>

    <el-table-column
      v-if="columnsChecked.indexOf('tips') >= 0"
      :show-overflow-tooltip="false"
      :label="$t('monitor.TIPS')"
      min-width="100"
    >
      <template slot-scope="scope">
        <div
          style="max-height: 120px; overflow-y: auto;"
          v-html="scope.row.all_info ? scope.row.all_info.replace(/;/g, '&lt;br&gt;') : '-'"
        ></div>
      </template>
    </el-table-column>

    <el-table-column v-if="columnsChecked.indexOf('level') >= 0"
      prop="level"
      :label="$t('monitor.alarmLevel')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <el-tag :type="alarmLevelTag(scope.row.level)">
          <span v-html="alarmLevelList[scope.row.level]"></span>
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('confirm') >= 0"
      prop="confirm"
      :label="$t('monitor.confirmStatus')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <el-tag v-if="scope.row.confirm==='1'" type="success">{{$t('monitor.confirmed')}}</el-tag>
        <el-tag v-if="scope.row.confirm==='0'" type="danger">{{$t('monitor.unconfirmed')}}</el-tag>
      </template>
    </el-table-column>
    <!-- <el-table-column v-if="columnsChecked.indexOf('public') >= 0"
      prop="public"
      :label="$t('monitor.publicStatus')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <el-tag v-if="scope.row.public==='1'" type="success">{{$t('monitor.alreadyRecognized')}}</el-tag>
        <el-tag v-if="scope.row.public==='0'" type="danger">{{$t('monitor.notRecognized')}}</el-tag>
        <span v-if="scope.row.public!=='1'&&scope.row.public!=='0'">-</span>
      </template>
    </el-table-column> -->
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="getTableData(true)"></el-button>
        <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
      </el-col>
      <el-col :span="19">
        <el-pagination
          class="right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-col>
    </el-row>
  </div>
</div>
</template>
<script>
import {operateRows, formatSecond, alarmLevelTag, alarmLevelList, alarmLevelListButOK} from '../../../../public/public.js'

export default {
  name:"historyWarn",
  props:["centerId", "resourceDetailId", "resourceDetailName"],
  data() {
    return {
      isCN: Vue.config.lang === "zh-cn",
      operateRows,
      alarmLevelListButOK,
      alarmLevelTag,
      alarmLevelList,
      tableData:[],
      multipleSelection:[],
      currentPage:1,
      pageSize: 10,
      total: 0,
      loading:false,
      formInline:{
        level:"",
        confirm:"",
        public:"",
        startTime:'',
        endTime:''
      },
      spickerOption:function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.formInline.endTime) {
              return time.getTime() > me.formInline.endTime||time.getTime() > Date.now();
            } else {
              return time.getTime() > Date.now();
            }
          }
        }
      }.bind(this)(),
      epickerOption:function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.formInline.startTime) {
              return time.getTime() < me.formInline.startTime||time.getTime() > Date.now();
            } else {
              return time.getTime() > Date.now();
            }
          }
        }
      }.bind(this)(),
      columns: [{
        prop: "level",
        label: Vue.t('monitor.alarmLevel')
      }, {
        prop: "update_time",
        label: Vue.t('monitor.alarmTime')
      }, {
        prop: "duration",
        label: Vue.t('monitor.alarmDuration')
      }, {
        prop: "alert_content",
        label: Vue.t('monitor.alarmDetail')
      }, {
          prop: "tips",
          label: Vue.t("monitor.TIPS")
        }, {
        prop: "confirm",
        label: Vue.t('monitor.confirmStatus')
      }/*, {
        prop:"public",
        label: Vue.t('monitor.publicStatus')
      } */],
      columnsChecked:["level", "update_time", "duration", "alert_content", 'tips', "confirm", "public"],
      operationMenus:[{
        icon: "fa-check",
        name: Vue.t("monitor.confirmAlarm"),
        showflg: true,
        multi:true,
        enable:function (obj) {
          return obj.confirm==='0';
        },
        handler: function(rows) {
          let me = this;
          this.operateRows(rows, 0, function() {
            me.getTableData(true);
          }, this.centerId, null, this.resourceDetailName);
          //this.operateRows(rows, {confirm: "1"}, "确认告警成功", "是否要确认告警?");
        }.bind(this)
      }, {
        icon: "fa-check",
        name: Vue.t("monitor.allConfirm"),
        showflg: true,
        readOnly: true,
        handler: function(rows) {
          let conditions = {
            resource_id:this.resourceDetailId,
            level:this.formInline.level,
            confirm:this.formInline.confirm,
            start_time:this.formInline.startTime?this.formInline.startTime.getTime()/1000:"",
            end_time:this.formInline.endTime?(this.formInline.endTime.getTime()/1000+24*60*60-1):""
          }
          let me = this;
          this.operateRows([], 2, function() {
            me.getTableData(true);
          }, this.centerId, conditions, this.resourceDetailName);
          //this.operateRows(rows, {confirm: "1"}, "全部确认告警成功", "是否要全部确认告警?", conditions);
        }.bind(this)
      }, {
        icon: "fa-minus",
        name: Vue.t("monitor.cancelConfirmAlarm"),
        showflg: true,
        multi:true,
        enable:function (obj) {
          return obj.confirm==1;
        },
        handler: function(rows) {
          let me = this;
          this.operateRows(rows, 1, function() {
            me.getTableData(true);
          }, this.centerId, null, this.resourceDetailName);
          //this.operateRows(rows, {confirm: "0"}, "取消确认告警成功", "是否要取消确认告警?");
        }.bind(this)
      }, /* {
        icon: "fa-share",
        name: Vue.t("monitor.publicAlarm"),
        showflg: true,
        multi:true,
        enable:function (obj) {
          return obj.public==='0';
        },
        handler: function(rows) {
          let me = this;
          this.operateRows(rows, 3, function() {
            me.getTableData(true);
          }, this.centerId, null, this.resourceDetailName);
          //this.operateRows(rows, {public: "1"}, "公认告警成功", "是否要公认告警?");
        }.bind(this)
      }, {
        icon: "fa-minus",
        name: Vue.t("monitor.cancelPublicAlarm"),
        showflg: true,
        multi:true,
        enable:function (obj) {
          return obj.public==1;
        },
        handler: function(rows) {
          let me = this;
          this.operateRows(rows, 4, function() {
            me.getTableData(true);
          }, this.centerId, null, this.resourceDetailName);
          //this.operateRows(rows, {public: "0"}, "取消公认告警成功", "是否要取消公认告警?");
        }.bind(this)
      }, */ {
        icon: "fa-times",
        name: Vue.t("monitor.deleteAlarm"),
        showflg: true,
        multi:true,
        enable:function (obj) {
          return obj.public!=='1';
        },
        handler: function(rows) {
          let me = this;
          this.operateRows(rows, 5, function() {
            me.getTableData(true);
          }, this.centerId, null, this.resourceDetailName);
          //this.operateRows(rows, {deleted: "1"}, "删除成功", "是否要删除告警?");
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t("monitor.clearAlarm"),
        showflg: true,
        readOnly: true,
        handler: function(rows) {
          let me = this;
          let conditions = {
            resource_id:this.resourceDetailId,
            level:this.formInline.level,
            confirm:this.formInline.confirm,
            start_time:this.formInline.startTime?this.formInline.startTime.getTime()/1000:"",
            end_time:this.formInline.endTime?(this.formInline.endTime.getTime()/1000+24*60*60-1):""
          }
          this.operateRows([], 6, function() {
            me.getTableData(true);
          }, this.centerId, conditions, this.resourceDetailName);
          //this.operateRows(rows, {deleted: "1"}, "清空成功", "是否要清空告警?", conditions);
        }.bind(this)
      }]
    }
  },
  mounted() {
    this.getTableData();
  },
  methods: {
    getTableData(flg) {
      let me = this;
      let param = {
        resource_id:this.resourceDetailId,
        level:this.formInline.level,
        confirm:this.formInline.confirm,
        public:this.formInline.public,
        start_time:this.formInline.startTime?this.formInline.startTime.getTime()/1000:"",
        end_time:this.formInline.endTime?(this.formInline.endTime.getTime()/1000+24*60*60-1):"",
        time_type:"1",
        page_num:this.currentPage,
        page_size:this.pageSize
      }
      this.loading = true;
      this.$ajax({
        type: 'get',
        headers: {
          'FORWARD_UNION': this.centerId
        },
        url: "api/pluto/v1/alert/resources/alerts?"+$.param(param),
        successFun(rtn) {
          rtn.alerts.forEach((item) => {
            item.alert_content = Vue.config.lang == "zh-cn"?item.alert_content_cn:item.alert_content_en;
            item.all_info =
            Vue.config.lang == "zh-cn"
              ? item.all_info_cn
              : item.all_info_en;
          })
          me.tableData = rtn.alerts;
          me.total = rtn.total;
          me.loading = false;
          if (flg) {
            me.$nextTick(() => {
              me.$refs.deTable.clearSelection();
            });
          }
        },
        errFun() {
          me.loading = false;
        }
      })
    },
    renderKeepTimeFun(inserTime, updateTime) {
      if (inserTime && updateTime) {
        inserTime = convertTime(
          inserTime.replace("T", " ").replace(".000000", "")
        );
        updateTime = convertTime(
          updateTime.replace("T", " ").replace(".000000", "")
        );
        return formatSecond((updateTime - inserTime) / 1000);
      } else {
        return "-";
      }
      function convertTime(time) {
        let arr = time.split(" ");
        let darr = arr[0].split("-");
        let tarr = arr[1].split(":");
        return new Date(
          darr[0],
          darr[1],
          darr[2],
          tarr[0],
          tarr[1],
          tarr[2]
        ).getTime();
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData();
    },
    onQuery() {
      this.getTableData(true);
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // operateRows(rows, param, sucmsg, confirmMsg, conditions) {
    //   let me = this;
    //   var params = {
    //     params:param
    //   }
    //   if (conditions) {
    //     params.conditions = conditions;
    //   } else {
    //     let alertIds = [];
    //     rows.forEach(function(item, index) {
    //       alertIds.push(item.alert_id);
    //     })
    //     params.alert_ids = alertIds;
    //   }
    //   this.$ajax({
    //     type:"patch",
    //     headers: {
    //       'FORWARD_UNION': this.centerId
    //     },
    //     confirmMsg:confirmMsg,
    //     url: "api/pluto/v1/alert/resources/alerts",
    //     data:JSON.stringify(params),
    //     successMsg:sucmsg,
    //     successFun() {
    //       me.getTableData(true);
    //     },
    //     log: {
    //       description: {
    //         en: sucmsg,
    //         zh_cn: sucmsg
    //       },
    //       target: Vue.logTarget.monitor
    //     }
    //   })
    // },
    formatTime(time) {
      time = parseInt(time);
      let ftime = "";
      if (time>24*3600) {
        let n = parseInt(time/(24*3600));
        ftime += n + Vue.t("monitor.days");
        time = time - n * 24 * 3600;
      }
      if (time>60*60) {
        let m = parseInt(time/(60*60));
        ftime += m + Vue.t("monitor.hours");
        time = time - m * 60 * 60;
      }
      if (time>60) {
        let k = parseInt(time/60);
        ftime += k + Vue.t("monitor.minutes");
        time = time - k * 60;
      }
      ftime += time + Vue.t("monitor.seconds");
      return ftime;
    }
  }
}
</script>