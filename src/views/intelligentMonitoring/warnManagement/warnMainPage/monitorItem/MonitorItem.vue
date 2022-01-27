<template>
<div>
  <el-form :inline="true" :model="formInline" class="form-inline">
    <el-form-item :label="$t('monitor.alarmLevel')">
      <el-select v-model="formInline.alarmLevel" size="small" clearable>
        <el-option v-for="(val, key, index) in alarmLevelList" :key="key" :label="val" :value="key">{{val}}</el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('monitor.alarmItemName')">
      <el-input v-model="formInline.itemName"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon='fa-search' @click="onQuery" size="small">{{$t('base.query')}}</el-button>
    </el-form-item>
  </el-form>
    <div class="divider clearfix"></div>
  <el-table
    ref="deTable"
    :data="tableData" row-key="id"
    v-loading="loading"
    :element-loading-text="$t('base.loadingData')"
    highlight-current-row
    style="width: 100%">
    <el-table-column v-if="columnsChecked.indexOf('alert_display_name') >= 0"
      prop="alert_display_name"
      :label="$t('monitor.alarmItem')"
      align="left"
      min-width="60">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('alert_status') >= 0"
      prop="alert_status"
      :label="$t('monitor.alarmLevel')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <el-tag :type="alarmLevelTag(scope.row.alert_status)">
          <span v-html="alarmLevelList[scope.row.alert_status]"></span>
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('update_time') >= 0"
      prop="monitor_time"
      :label="$t('monitor.monitoringTime')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <span>{{scope.row.monitor_time?scope.row.monitor_time.replace('T', ' ').replace('.000000',''):'-'}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('alert_stat') >= 0"
      prop="alert_stat"
      :label="$t('monitor.monitoringValue')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <span>{{(scope.row.alert_stat == "" || scope.row.alert_stat == null)?"-":scope.row.alert_stat}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('warn_threshold') >= 0"
      prop="warn_threshold"
      :label="$t('base.minorThreshold')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <span>
          <span v-if="scope.row.threshold_display_type === '0'">{{ scope.row.warn_threshold | displayOrMinus }}{{ scope.row.threshold_unit | displayOrEmpty }}</span>
          <span v-if="scope.row.threshold_display_type === '1'">{{ scope.row.warn_threshold_alias | displayOrMinus }}{{ scope.row.threshold_unit | displayOrEmpty }}</span>
        </span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('crit_threshold') >= 0"
      prop="crit_threshold"
      :label="$t('base.moderateThreshold')"
      align="left"
      min-width="100">
      <template slot-scope="scope">
        <span v-if="scope.row.threshold_display_type === '0'">{{ scope.row.crit_threshold | displayOrMinus }}{{ scope.row.threshold_unit | displayOrEmpty }}</span>
        <span v-if="scope.row.threshold_display_type === '1'">{{ scope.row.crit_threshold_alias | displayOrMinus }}{{ scope.row.threshold_unit | displayOrEmpty }}</span>
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
          v-html="scope.row.information ? scope.row.information.replace(/;/g, '&lt;br&gt;') : '-'"
        ></div>
      </template>
    </el-table-column>

    <el-table-column v-if="columnsChecked.indexOf('alert_flag') >= 0"
      prop="alert_flag"
      :label="$t('monitor.alarmOpenStatus')"
      align="left"
      min-width="60">
      <template slot-scope="scope">
        <el-tag v-show="scope.row.alert_flag!='2'" :type="scope.row.alert_flag == '0'?'info':'success'">
          <span v-html="scope.row.alert_flag == '0'?$t('base.close'):$t('base.open') "></span>
        </el-tag>
        <span v-if="scope.row.alert_flag==2">-</span>
      </template>
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="loadData">
          </el-button>
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
         <page ref="page" :totalData="allData" @getCurrentData="getCurrentData"></page>
      </el-col>
    </el-row>
  </div>
</div>
</template>
<script>
import {alarmLevelList, alarmLevelTag} from '../../../public/public.js'
export default {
  name: "alarmView",
  props: {
    resourceDetailId: String,
    centerId: String
  },
  data() {
    return {
      isCN: Vue.config.lang === "zh-cn",
      alarmLevelList,
      alarmLevelTag,
      multipleSelection: [],
      noticManList: [],
      allData:[],
      tableData: [],
      noticTypeList: {
        "1": Vue.t('base.shortMessage'),
        "2": Vue.t('base.mail'),
        "3": Vue.t('monitor.noticePlatform')
      },
      sendStatusList: {
        "1": Vue.t('monitor.successed'),
        "2": Vue.t('monitor.failed')
      },
      timeShowFlg: true,
      loading: false,
      hightFlag: false,
      formInline: {
        alarmLevel: "",
        itemName: ""
      },
      columns: [
        {
          prop: "alert_display_name",
          label: Vue.t('monitor.alarmItem')
        },
        {
          prop: "alert_status",
          label: Vue.t('monitor.alarmLevel')
        },
        {
          prop: "update_time",
          label: Vue.t('monitor.monitoringTime')
        },
        {
          prop: "alert_stat",
          label: Vue.t('monitor.monitoringValue')
        },
        {
          prop: "warn_threshold",
          label: Vue.t('base.minorThreshold')
        },
        {
          prop: "crit_threshold",
          label: Vue.t('base.moderateThreshold')
        },
        {
          prop: "tips",
          label: Vue.t("monitor.TIPS")
        },
        {
          prop: "alert_flag",
          label: Vue.t('monitor.alarmOpenStatus')
        }
      ],
      columnsChecked: [
        "alert_display_name",
        "alert_status",
        "update_time",
        "alert_stat",
        "warn_threshold",
        "crit_threshold",
        'tips',
        "alert_flag"
      ]
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      let me = this;
      let param = {
        resource_id: me.resourceDetailId,
        alert_name: me.formInline.itemName,
        alert_status:me.formInline.alarmLevel,
        page_num: 1,
        page_size: 1000
      };
      me.loading = true;
      me.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: me.centerId
        },
        url:
          "api/pluto/v1/alert/" +
          me.resourceDetailId +
          "/real?" +
          $.param(param),
        successFun(rtn) {
          me.loading = false;
          rtn.alerts.forEach((item) => {
            item.alert_display_name = Vue.config.lang == "zh-cn"?item.alert_display_name_cn:item.alert_display_name_en;
            item.information =
            Vue.config.lang == "zh-cn"
              ? item.information_cn
              : item.information_en;
          })
          me.allData = rtn.alerts;
        },
        errFun() {
          me.loading = false;
        }
      });
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    onQuery() {
      this.loadData();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    }
  },
  filters: {
    displayOrMinus(value) {
      if (value === '' || value === null || value === undefined) {
        return '-';
      } else {
        return value;
      }
    },
    displayOrEmpty(value) {
      if (value === '' || value === null || value === undefined || value === '-') {
        return '';
      } else {
        return value;
      }
    }
  }
};
</script>
