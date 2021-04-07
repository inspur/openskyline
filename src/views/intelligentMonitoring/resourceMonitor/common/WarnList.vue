<template>
  <div>
    <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('monitor.alarmLevel')">
        <el-select v-model="formInline.level" size="small" clearable>
          <el-option
            v-for="(val, key) in alarmLevelListButOK"
            :key="key"
            :label="val"
            :value="key"
          >{{val}}</el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.alarmTime')"></el-form-item>
      <el-form-item>
        <el-date-picker
          style="width:150px;"
          v-model="formInline.startTime"
          type="date"
          :editable="false"
          :placeholder="$t('lang.startDate')"
          :picker-options="spickerOption"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <span>-</span>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          style="width:150px;"
          v-model="formInline.endTime"
          type="date"
          :editable="false"
          :placeholder="$t('lang.endDate')"
          :picker-options="epickerOption"
        ></el-date-picker>
      </el-form-item>
      <el-form-item :label="$t('monitor.confirmStatus')">
        <el-select v-model="formInline.confirm" size="small">
          <el-option :label="$t('base.all')" value></el-option>
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
      </el-form-item>-->
      <el-form-item>
        <el-button
          type="primary"
          icon="fa-search"
          @click="onQuery"
          size="small"
        >{{$t('base.query')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="deTable"
      :data="tableData"
      v-loading="loading"
      row-key="alert_id"
      :element-loading-text="$t('base.loadingData')"
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column
        v-if="columnsChecked.indexOf('insert_time') >= 0"
        prop="insert_time"
        :label="$t('monitor.alarmTime')"
        align="left"
        min-width="60"
      >
        <template slot-scope="scope">
          <span>{{scope.row.insert_time?scope.row.insert_time.replace('T', ' ').replace('.000000',''):'-'}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('duration') >= 0"
        prop="duration"
        :label="$t('monitor.alarmDuration')"
        align="left"
        min-width="60"
      >
        <template slot-scope="scope">
          <span>{{formatSecond(scope.row.duration)}}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="columnsChecked.indexOf('alert_content') >= 0"
        :label="$t('monitor.alarmDetail')"
        :show-overflow-tooltip="false"
        align="left"
        min-width="100"
      >
        <template slot-scope="scope">
          <div
            style="max-height: 120px; overflow-y: auto;"
            v-html="scope.row.alert_content ? scope.row.alert_content.replace(/;/g, '&lt;br&gt;') : '-'"
          ></div>
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

      <!-- <el-table-column
        v-if="columnsChecked.indexOf('scope') >= 0"
        :label="$t('monitor.SCOPE_OF_INFLUENCE')"
        :show-overflow-tooltip="false"
        align="left"
        min-width="100"
      >
        <template slot-scope="scope">
          <div>{{scope.row.scope}}</div>
        </template>
      </el-table-column>-->

      <el-table-column
        v-if="columnsChecked.indexOf('level') >= 0"
        prop="level"
        :label="$t('monitor.alarmLevel')"
        align="left"
        min-width="60"
      >
        <template slot-scope="scope">
          <span class="circle" :class="scope.row.level.sign">{{scope.row.level.name}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('confirm') >= 0"
        prop="confirm"
        :label="$t('monitor.confirmStatus')"
        align="left"
        min-width="60"
      >
        <template slot-scope="scope">
          <span
            class="circle"
            :class="scope.row.confirm==='1'?'green':'red'"
          >{{scope.row.confirm==='1'?$t('monitor.confirmed'):$t('monitor.unconfirmed')}}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column v-if="columnsChecked.indexOf('public') >= 0"
        prop="public"
        :label="$t('monitor.publicStatus')"
        align="left"
        min-width="60">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.public==='1'" type="success">{{$t('monitor.alreadyRecognized')}}</el-tag>
          <el-tag v-else-if="scope.row.public==='0'" type="danger">{{$t('monitor.notRecognized')}}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>-->
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <!-- <el-col :span="5">
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox
                class="item"
                v-for="item in columns"
                :label="item.prop"
                :key="item.prop"
              >{{item.label}}</el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col> -->
        <el-col :span="24">
          <el-pagination
            class="right"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import { utils } from "../../public/utils";
import {
  alarmLevelList,
  alarmLevelListButOK,
  alarmLevelTag,
  formatSecond
} from "../../public/public.js";
export default {
  props: {
    hostName: String,
    centerId: String,
    resourceId: String,
    getTableDataAsync: Boolean
  },
  data() {
    return {
      isCN: Vue.config.lang === "zh-cn",
      roleType: Vue.roleType + "",
      alarmLevelList,
      alarmLevelListButOK,
      alarmLevelTag,
      formatSecond,
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      formInline: {
        level: "",
        confirm: "",
        startTime: "",
        endTime: "",
        public: ""
      },
      spickerOption: function() {
        let me = this;
        return {
          disabledDate(time) {
            if (me.formInline.endTime) {
              return (
                time.getTime() > me.formInline.endTime ||
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
            if (me.formInline.startTime) {
              return (
                time.getTime() < me.formInline.startTime ||
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
          prop: "insert_time",
          label: Vue.t("monitor.alarmTime")
        },
        {
          prop: "duration",
          label: Vue.t("monitor.alarmDuration")
        },
        {
          prop: "alert_content",
          label: Vue.t("monitor.alarmDetail")
        },
        {
          prop: "tips",
          label: Vue.t("monitor.TIPS")
        },
        // {
        //   prop: "scope",
        //   label: Vue.t("monitor.SCOPE_OF_INFLUENCE")
        // },
        {
          prop: "level",
          label: Vue.t("monitor.alarmLevel")
        },
        {
          prop: "confirm",
          label: Vue.t("monitor.confirmStatus")
        } /* , {
        prop:"public",
        label:Vue.t('monitor.publicStatus')
      } */
      ],
      columnsChecked: [
        "level",
        "insert_time",
        "duration",
        "scope",
        "alert_content",
        'tips',
        "confirm",
        "public"
      ]
    };
  },
  mounted() {
    if (!this.getTableDataAsync) {
      this.getTableData();
    }
  },
  methods: {
    getTableData(v = {}) {
      if (v.page) {
        this.currentPage = v.page;
      }
      let me = this;
      me.loading = true;
      let param = {
        resource_id: v.resourceID || this.resourceId,
        level: this.formInline.level,
        confirm: this.formInline.confirm,
        start_time: this.formInline.startTime
          ? this.formInline.startTime.getTime() / 1000
          : "",
        end_time: this.formInline.endTime
          ? this.formInline.endTime.getTime() / 1000 + 24 * 60 * 60 - 1
          : "",
        page_num: this.currentPage,
        page_size: this.pageSize,
        public: this.formInline.public,
        time_type: 1
      };
      this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/alert/resources/alerts?" + $.param(param),
        successFun(rtn) {
          rtn.alerts.forEach(item => {
            item.alert_content =
              Vue.config.lang == "zh-cn"
                ? item.alert_content_cn
                : item.alert_content_en;

            item.all_info =
              Vue.config.lang == "zh-cn"
                ? item.all_info_cn
                : item.all_info_en;

            item.level = {
              sign: item["level"],
              name: utils.getLevel(item["level"])
            };
          });
          me.tableData = rtn.alerts;
          me.total = rtn.total;
          me.loading = false;
        },
        errFun() {
          me.loading = false;
        }
      });
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
      this.getTableData();
    }
  }
};
</script>
