<template>
<div>
  <div class="divider"></div>
  <el-form :inline="true" :model="formInline" class="form-inline">
    <el-form-item :label="$t('monitor.notificationMethod')">
      <el-select v-model="formInline.noticType" size="small" clearable>
        <el-option v-for="(val, key, index) in noticTypeList" :key="key" :label="val" :value="key">{{val}}</el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('monitor.sendStatus')">
      <el-select v-model="formInline.sendStatus" size="small" clearable>
        <el-option v-for="(val, key, index) in sendStatusList" :key="key" :label="val" :value="key">{{val}}</el-option>
      </el-select>
    </el-form-item>
     <el-form-item :label="$t('monitor.noticeGenerTime')" v-show="timeShowFlg">
      </el-form-item>
      <el-form-item v-show="timeShowFlg">
        <el-date-picker style="width:150px;" v-model="formInline.noticStartTime" type="date" :editable="false" :placeholder="$t('lang.startDate')" :picker-options="spickerOption"></el-date-picker>
      </el-form-item>
      <el-form-item v-show="timeShowFlg">
        <span>-</span>
      </el-form-item>
      <el-form-item v-show="timeShowFlg">
        <el-date-picker style="width:150px;" v-model="formInline.noticEndTime" type="date" :editable="false" :placeholder="$t('lang.endDate')" :picker-options="epickerOption"></el-date-picker>
      </el-form-item>
    <!-- <el-form-item label="资源名称">
      <el-input v-model="formInline.resource_name"></el-input>
    </el-form-item> -->
    <el-form-item :label="$t('monitor.contacts')" v-show="hightFlag">
      <!-- <el-select v-model="formInline.noticMan" size="small" clearable>
        <el-option v-for="(val, key, index) in noticManList" :key="key" :label="val" :value="key">{{val}}</el-option>
      </el-select> -->
      <el-input v-model="formInline.noticMan"></el-input>
    </el-form-item>
    <!-- <el-form-item label="通知发送时间" v-show="hightFlag">
      </el-form-item>
      <el-form-item v-show="hightFlag">
        <el-date-picker style="width:150px;" v-model="formInline.sendStartTime" type="date" :editable="false" :placeholder="$t('lang.startDate')" :picker-options="spickerOption1"></el-date-picker>
      </el-form-item>
      <el-form-item v-show="hightFlag">
        <span>-</span>
      </el-form-item>
      <el-form-item v-show="hightFlag">
        <el-date-picker style="width:150px;" v-model="formInline.sendEndTime" type="date" :editable="false" :placeholder="$t('lang.endDate')" :picker-options="epickerOption1"></el-date-picker>
      </el-form-item> -->
    <el-form-item>
      <el-button type="primary" icon='fa-search' @click="onQuery" size="small">{{$t('base.query')}}</el-button>
      <!-- <el-button type="text" size="small" @click="hightSearch" v-show="!hightFlag">{{$t('calcStorLang.high')}}</el-button>
        <el-button type="text" size="small" @click="baseSearch" v-show="hightFlag">{{$t('calcStorLang.basic')}}</el-button> -->
    </el-form-item>
  </el-form>
   <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
  <el-table
    ref="deTable"
    :data="tableData" row-key="notice_id" @row-click="rowClick" :default-sort="sortObj"
    v-loading="loading" @sort-change="sortChange" @selection-change="handleSelectionChange"
    :element-loading-text="$t('base.loadingData')"
    highlight-current-row
    style="width: 100%">
    <el-table-column reserve-selection type="selection" width="55" align="center">
      </el-table-column>
    <!-- <el-table-column v-if="columnsChecked.indexOf('resource_name') >= 0"
      prop="resource_name"
      label="资源名称"
      align="left"
      min-width="60">
       <template slot-scope="scope">
        <el-button @click="sourceNameClick(scope.row)" type="text" size="small">{{scope.row.resource_name}}</el-button>
      </template>
    </el-table-column> -->
    <el-table-column v-if="columnsChecked.indexOf('notice_type') >= 0"
      prop="notice_type"
      :label="$t('monitor.notificationMethod')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <span v-html="noticTypeList[scope.row.notice_type]"></span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('notice_man') >= 0"
      prop="notice_man"
      :label="$t('monitor.contacts')"
      align="left"
      min-width="60">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('status') >= 0"
      prop="status"
      :label="$t('monitor.sendStatus')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <el-tag :type="scope.row.status == '1' ? 'success' : 'danger'">
          <span v-html="statusRender(scope.row.status)"></span>
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('alert_time_begin') >= 0"
      prop="alert_time"
      :label="$t('monitor.noticeGenerTime')"
      align="left" sortable="custom"
      min-width="60">
      <template slot-scope="scope">
        <span>{{scope.row.alert_time?scope.row.alert_time.replace('T', ' ').replace('.000000',''):'-'}}</span>
      </template>
    </el-table-column>
    <!-- <el-table-column v-if="columnsChecked.indexOf('send_time_begin') >= 0"
      prop="alert_time"
      label="通知发送时间"
      align="left" sortable="custom"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.alert_time?scope.row.alert_time.replace('T', ' ').replace('.000000',''):'-'}}</span>
      </template>
    </el-table-column> -->
    <el-table-column v-if="columnsChecked.indexOf('content') >= 0"
      prop="content"
      :label="$t('monitor.noticeContent')"
      align="left"
      min-width="60">
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
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="loadData">
          </el-button>
          <span> {{$t('lang.currentSelected') + multipleSelection.length + " " + $tc('lang.item', multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
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
export default {
  name: "alarmView",
  props: {
    resourceDetailId: String,
    centerId: String
  },
  data() {
    return {
      isCN: Vue.config.lang === "zh-cn",
      multipleSelection: [],
      noticManList: [],
      tableData: [],
      currentPage: 1,
      noticTypeList: {
        "1": Vue.t('base.shortMessage'),
        "2": Vue.t('base.mail')
      },
      sendStatusList: {
        "1": Vue.t('monitor.sended'),
        "0": Vue.t('monitor.unsent')
      },
      timeShowFlg: true,
      pageSize: 10,
      total: 0,
      loading: false,
      hightFlag: true,
      formInline: {
        noticType: "",
        sendStatus: "",
        noticStartTime: "",
        noticEndTime: "",
        resource_name: "",
        noticMan: "",
        sendStartTime: "",
        sendEndTime: "",
        level: ""
      },
      sortObj: {
        order: "descending",
        prop: "alert_time"
      },
      spickerOption: function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.formInline.noticEndTime) {
              return (
                time.getTime() > me.formInline.noticEndTime ||
                time.getTime() > Date.now()
              );
            } else {
              return time.getTime() > Date.now();
            }
          }
        };
      }.bind(this)(),
      epickerOption: function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.formInline.noticStartTime) {
              return (
                time.getTime() < me.formInline.noticStartTime ||
                time.getTime() > Date.now()
              );
            } else {
              return time.getTime() > Date.now();
            }
          }
        };
      }.bind(this)(),
      spickerOption1: function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.formInline.sendEndTime) {
              return (
                time.getTime() > me.formInline.sendEndTime ||
                time.getTime() > Date.now()
              );
            } else {
              return time.getTime() > Date.now();
            }
          }
        };
      }.bind(this)(),
      epickerOption1: function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.formInline.sendStartTime) {
              return (
                time.getTime() < me.formInline.sendStartTime ||
                time.getTime() > Date.now()
              );
            } else {
              return time.getTime() > Date.now();
            }
          }
        };
      }.bind(this)(),
      columns: [
        {
          prop: "notice_type",
          label: Vue.t('monitor.notificationMethod')
        },
        {
          prop: "notice_man",
          label: Vue.t('monitor.contacts')
        },
        {
          prop: "status",
          label: Vue.t('monitor.sendStatus')
        },
        {
          prop: "alert_time_begin",
          label: Vue.t('monitor.noticeGenerTime')
        },
        {
          prop:"content",
          label:Vue.t('monitor.noticeContent')
        }, {
          prop: "tips",
          label: Vue.t("monitor.TIPS")
        }
      ],
      columnsChecked: [
        "notice_type",
        "notice_man",
        "status",
        "alert_time_begin",
        "content",
        'tips'
      ],
      operationMenus: [
        {
          icon: "fa-times",
          name: Vue.t('monitor.deleteNotice'),
          showflg: true,
          multi: true,
          enable: function(obj) {
            return true;
          },
          handler: function(rows) {
            var self = this;
            self
              .$prompt(
                Vue.t("lang.inputYesToContinue"),
                Vue.t("lang.confirmDo"),
                {
                  confirmButtonText: Vue.t("lang.confirmDo"),
                  cancelButtonText: Vue.t("lang.cancel"),
                  inputPattern: /^YES$|^NO$/i,
                  inputValue: "NO",
                  customClass: "promptConfirmDel",
                  inputErrorMessage: Vue.t("lang.onlyAcceptYesOrNo")
                }
              )
              .then(async ({ value }) => {
                if ("yes" == value.toLowerCase()) {
                  self
                    .$sequence({
                      type: "delete",
                      url: "api/pluto/v1/notice/{notice_id} ",
                      params: rows,
                      headers: {
                        FORWARD_UNION: this.centerId
                      },
                      errFun: function() {
                        self.$refs.deTable.clearSelection();
                        self.loadData();
                      },
                      successMsg: Vue.t('base.deleteSuccess'),
                      log: {
                        description: {
                          en: "Delete notice,Resource:{resource_name_en}",
                          zh_cn: "删除通知，资源:{resource_name_cn}"
                        },
                        target: Vue.logTarget.monitor
                      }
                    })
                    .then(data => {
                      self.$refs.deTable.clearSelection();
                      self.currentPage = 1;
                      self.loadData();
                    })
                    .catch(err => {});
                }
              })
              .catch(() => {
                //取消
              });
          }.bind(this)
        }
      ]
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      let me = this;
      let n = me.node;
      let alertTimeStart = me.startTimeTransfer(me.formInline.noticStartTime);
      let alertTimeEnd = me.endTimeTransfer(me.formInline.noticEndTime);
      if (alertTimeStart != "") {
        alertTimeStart = Math.round(alertTimeStart / 1000);
      }
      if (alertTimeEnd != "") {
        alertTimeEnd = Math.round(alertTimeEnd / 1000);
      }
      let param = {
        resource_id:me.resourceDetailId,
        notice_type: me.formInline.noticType,
        status: me.formInline.sendStatus,
        resource_name: me.formInline.resource_name,
        notice_man: me.formInline.noticMan,
        send_time_begin: "",
        send_time_end: "",
        alert_time_begin:alertTimeStart,
        alert_time_end:alertTimeEnd,
        level: me.formInline.level,
        page_index: this.currentPage,
        field: this.sortObj.prop,
        sort: this.sortObj.order.replace("ending", ""),
        page_size: this.pageSize
      };
      me.loading = true;
      this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/notices?" + $.param(param),
        successFun(rtn) {
          me.loading = false;
          rtn.notices.forEach((item) => {
            item.content = Vue.config.lang == "zh-cn"?item.content_cn:item.content_en;
            item.all_info =
            Vue.config.lang == "zh-cn"
              ? item.all_info_cn
              : item.all_info_en;
          })
          me.tableData = rtn.notices;
          me.total = rtn.total;
        },
        errFun() {
          me.loading = false;
        }
      });
    },
    sourceNameClick(row) {
       this.$emit("showDetail", row.resource_id);
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) {
        return;
      }
      self.sortObj = {
        order: column.order,
        prop: column.prop
      };
      this.loadData();
    },
    startTimeTransfer(time) {
      if (time == "") {
        return "";
      } else {
        var date = new Date(time);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date.getTime();
      }
    },
    endTimeTransfer(time) {
      if (time == "") {
        return "";
      } else {
        var date = new Date(time);
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
        return date.getTime();
      }
    },
    hightSearch() {
      this.hightFlag = true;
    },
    baseSearch() {
      this.imageSource = "";
      this.ipaddressInstance = "";
      this.hightFlag = false;
    },
    statusRender(status) {
      return this.sendStatusList[status] || "-";
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadData();
    },
    onQuery() {
      this.loadData();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    }
  }
};
</script>
<style scoped>
  .resize-triggers{
    margin-top: 10px;
  }
</style>