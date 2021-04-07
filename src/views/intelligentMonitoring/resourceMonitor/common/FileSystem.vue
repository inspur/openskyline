<template>
  <div class="file-system">
    <span>
      <span style="color:red;position:relative;top:2px;">*</span>
      {{$t('monitor.promp13')}}
    </span>
    <el-table
      ref="deTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('base.loadingData')"
      style="width: 100%"
    >
      <!-- <el-table-column
        v-if="columnsChecked.indexOf('sysName') >= 0"
        prop="device"
        :label="$t('monitor.fileName')"
        align="left"
        min-width="100"
      ></el-table-column> -->
      <el-table-column
        v-if="columnsChecked.indexOf('path') >= 0"
        prop="path"
        :label="$t('monitor.mountPath')"
        align="left"
        min-width="100"
      ></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('totalAmount') >= 0"
        prop="total"
        :label="$t('monitor.usedAndTotal')"
        align="left"
        min-width="80"
      >
        <template slot-scope="scope">
          <span>{{scope.row.used}}/{{scope.row.total}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('usedRate') >= 0"
        prop="percent"
        :label="$t('base.utilization')"
        align="left"
        min-width="100"
      >
        <template slot-scope="scope">
          <div class="icos-resource-monitor-percent">
            <el-progress
              :show-text="true"
              :percentage="scope.row.percent.value"
              :class="scope.row.percent.class"
              class="icos-resource-monitor-percent-progress"
            ></el-progress>

            <el-tooltip v-if="scope.row.percent.value>80" placement="top">
              <div slot="content">{{tooltipText}}</div>
              <i class="el-tooltip el-icon-fa">&#xF059</i>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <!-- <el-button type="text" icon="fa-refresh" @click="getTableData">
          </el-button>-->
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
        </el-col>
        <el-col :span="19">
          <page ref="page" :pageCount="5" :totalData="allData" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import { utils } from "../../public/utils";

export default {
  props: {
    hostName: String,
    resourceId: String,
    centerId: String,
    type: {
      type: String,
      default: "hosts"
    }
  },
  data() {
    let isCN = Vue.config.lang == "zh-cn";
    return {
      isCN: isCN,
      tooltipText: isCN ? "目录空间使用率过高，有可能导致系统宕机或云主机异常，请尽快清理" : 'if the directory space utilization rate is too high, it may cause system downtime or abnormal virtual machine, please handle it as soon as possible',
      tableData: [],
      allData: [],
      loading: false,
      columns: [
        // {
        //   prop: "sysName",
        //   label: Vue.t("monitor.fileName")
        // },
        {
          prop: "path",
          label: Vue.t("monitor.mountPath")
        },
        {
          prop: "totalAmount",
          label: Vue.t("monitor.usedAndTotal")
        },
        {
          prop: "usedRate",
          label: Vue.t("base.utilization")
        }
      ],
      columnsChecked: ["path", "totalAmount", "usedRate"]
    };
  },
  mounted() {
    this.getTableData();
  },
  methods: {
    getTableData() {
      let me = this;
      let url = `api/pluto/v1/monitor/hosts/${this.hostName}/filesystem`;
      if (me.type == "cpms") {
        let rid = me.resourceId || "";
        let uuid = rid.replace("cpm_", "");
        url = `api/pluto/v1/monitor/cpms/${uuid}/filesystem`;
      }
      this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: url,
        successFun(rtn) {
          rtn.data.forEach(item => {
            item.percent = utils.getProgressPercentageStatus(item.percent);
          });
          me.allData = rtn.data;
        }
      });
    },
    getCurrentData(data) {
      this.tableData = data;
    }
  }
};
</script>

<style scoped>
.icos-resource-monitor-percent {
  display: flex;
  flex-flow: row nowrap;
}
.icos-resource-monitor-percent-progress {
  flex: 1 0 auto;
}
</style>