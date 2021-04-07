<template>
  <div v-loading="loading" class="event-monitor-setting">
    <!-- 模块名称、告警开关、联系人姓名、告警方式、告警级别、操作 -->
    <el-table :data="tableData" @cell-click="cellClick" border style="width:100%">
      <el-table-column prop="modelName" :label="$t('monitor.MODULE_NAME')"></el-table-column>
      <el-table-column prop="alarmSwitch" :label="$t('monitor.alarmSwitch')">
        <template v-slot="scope">
          <span
            class="circle"
            :class="scope.row.alarmSwitch=='0'?'red':'green'"
          >{{scope.row.alarmSwitch=='0'?$t('base.close'):$t('base.open')}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="contactName" :label="$t('monitor.contactName')"></el-table-column>
      <el-table-column prop="alarmMode" :label="$t('monitor.ALARM_MODE')"></el-table-column>
      <el-table-column prop="alarmLevel" :label="$t('monitor.alarmLevel')" min-width="150"></el-table-column>
      <el-table-column prop="operating" :label="$t('base.operating')"></el-table-column>
    </el-table>

    <el-pagination
      @size-change="paginationSizeChange"
      @current-change="paginationCurrentChange"
      :current-page="currentPage"
      :page-sizes="[5, 10, 20, 30, 40, 60, 80, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    <setting-dialog ref="settingDialog" @success="getTableData" @callback="settingDialogCallback"></setting-dialog>
  </div>
</template>
<script>
import { utils } from "../../public/utils";
import SettingDialog from "./SettingDialog";
export default {
  components: { SettingDialog },
  watch: {
    $route(to, from) {}
  },
  data() {
    return {
      loading: 0,
      isCN: Vue.config.lang === "zh-cn",
      pageSize: 10,
      currentPage: 1,
      total: 0,
      tableData: [],
      eternity: [],
      dialogVisible: false
    };
  },
  created() {
    this.getTableData();
  },
  mounted() {},
  methods: {
    settingDialogCallback(v) {
      switch (v.type) {
        case "alarmSwitch":
          break;

        default:
          break;
      }
    },
    cellClick(row, column, cell, event) {
      if (column.property === "operating") {
        this.$refs.settingDialog.show(row["rawData"]);
      } else if (column.property === "tag") {
      }
    },
    async getTableData(v = {}) {
      let vm = this;
      if (v.page) {
        vm.currentPage = v.page;
      }
      vm.loading = true;
      let param = {
        // currentpage: vm.currentPage,
        // pagesize: vm.pageSize
      };
      let url = "api/pluto/v1/event_list?" + $.param(param);
      let data = await vm.$ajax({
        type: "get",
        url: url,
        headers: {
          FORWARD_UNION: vm.centerId
        },
        successFun: function(data = {}) {
          let d = data || {};
          let el = d.event_list || [];
          vm.total = data.total || el.length;
          vm.loading = 0;

          vm.eternity = [];
          el.forEach(v => {
            let me = Vue.t("base.shortMessage");
            let ma = Vue.t("base.mail");
            let am = [`${me}、${ma}`, ma, me];

            let nl = v["notice_level"] || "";
            nl = nl.split(",") || [];
            nl = nl.filter(v => v);
            nl = nl.map(v => utils.getLevel(v)).join("、");

            vm.eternity.push({
              rawData: JSON.parse(JSON.stringify(v)),
              modelName: v["model_name"] || "-",
              alarmSwitch: parseInt(v["notice_flag"] || 0),
              contactName: v["notice_username"] || "-",
              alarmMode: am[parseInt(v["notice_type"])] || "-",
              alarmLevel: nl || "-",
              operating: Vue.t("base.edit")
            });
          });
          vm.sliceData();
        },
        errFun() {}
      });
    },
    paginationSizeChange(v) {
      this.pageSize = v;
      this.sliceData();
    },
    paginationCurrentChange(v) {
      this.currentPage = v;
      this.sliceData();
    },
    sliceData(v = {}) {
      let s = this.pageSize * (this.currentPage - 1);
      let e = s + this.pageSize;
      this.tableData = this.eternity.slice(s, e);
    }
  }
};
</script>

<style scoped>
.event-monitor-setting {
  overflow: hidden;
}
.event-monitor-search >>> .el-table {
  margin: 0 0 15px 0;
}
.event-monitor-setting >>> table tbody tr td:last-child {
  cursor: pointer;
  color: #1991eb;
}
</style>