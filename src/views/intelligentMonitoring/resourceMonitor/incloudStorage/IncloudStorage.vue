<template>
  <div v-loading="loading" class="monitor incloud-storage">
    <div v-if="!detailFlg" class="content">
      <el-table
        :data="tableData"
        border
        style="width:100%"
        @cell-click="cellClick"
        @sort-change="tableSortChange"
      >
        <el-table-column prop="name" :label="$t('base.name')"></el-table-column>
        <el-table-column prop="template_name" :label="$t('monitor.ALERT_TEMPLATE')"></el-table-column>
        <el-table-column prop="osdNumber" :label="$t('monitor.osdNumber')"></el-table-column>
        <el-table-column prop="numberOfInstance" :label="$t('monitor.numberOfInstance')"></el-table-column>
        <el-table-column prop="storagePools" :label="$t('monitor.storagePools')"></el-table-column>
        <el-table-column prop="totalStorage" :label="$t('monitor.totalStorage')"></el-table-column>
        <el-table-column prop="usedAmount" :label="$t('monitor.usedAmount')"></el-table-column>
        <el-table-column prop="level" :label="$t('monitor.alarmLevel')" sortable="custom">
          <template slot-scope="scope">
            <span class="circle" :class="scope.row.level.sign">{{scope.row.level.name}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operate" :label="$t('base.operating')" class="operate">
          <template slot-scope="scope">
            <span class="operate">{{scope.row.operate}}</span>
          </template>
        </el-table-column>
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
    </div>

    <router-view v-if="detailFlg"></router-view>
  </div>
</template>
<script>
import { utils } from "../../public/utils";
export default {
  components: {},
  name: "vmList",
  watch: {
    $route(to, from) {
      this.detailFlg = this.$route.path.indexOf("incloudStorageDetail") > -1;
    }
  },
  data() {
    return {
      isCN: Vue.config.lang === "zh-cn",
      pageSize: 10,
      currentPage: 1,
      total: 0,
      tableData: [],

      roleType: Vue.roleType + "",
      detailFlg: this.$route.path.indexOf("incloudStorageDetail") > -1,
      loading: false,
      noData: 0,
      tableOrderSortType: ""
    };
  },
  mounted() {
    if (Vue.roleType + "" === "2") {
      // 当前是项目管理员时，则使用当前项目
      this.projectId = this.$cookie.get("pid");
    }
    this.tableRefresh();
  },
  methods: {
    tableRefresh() {
      this.getTableData({ page: 1 });
    },
    tableSortChange(v) {
      let p = v.prop;
      if (p === "level") {
        p = "alert";
      }
      this.tableOrderSortType = p + "_" + v.order.replace("ending", ""); //ascending/descending
      this.getTableData({});
    },
    cellClick(row, column, cell, event) {
      if (column.property === "name") {
        this.gotoDetails(row);
      } else if (column.property === "operate") {
        utils.deleteResource(
          Object.assign(row, {
            vm: this,
            logDesc: "sds",
            logTarget: Vue.logTarget.resourceMonitor,
            callback: this.getTableData.bind(this)
          })
        );
      } else {
      }
    },
    async getTableData(v = {}) {
      let me = this;
      me.loading = true;
      let param = {};
      param.subclass_id = "incloudstorage";

      if (me.tableOrderSortType) {
        param.sort = me.tableOrderSortType;
      } else {
        param.sort = "default";
      }

      let url = "api/pluto/v1/monitor/sub_resources?" + $.param(param);
      let data = await me.$ajax({
        type: "get",
        url: url,
        headers: {
          FORWARD_UNION: me.centerId
        }
      });
      me.loading = false;
      if (!data) {
        return;
      }
      me.total = data.total;
      let rl = data.resource_list;
      if (!rl) {
        return;
      }
      me.tableData = [];
      rl.forEach((e, i, a) => {
        let ai = JSON.parse(e.resource_alert_info) || {};
        let cluster = ai.sds_cluster || {};

        let ts = cluster["last_total_space"];
        ts = parseFloat(ts / 1024 / 1024 / 1024).toFixed(2);
        let tu = cluster["last_total_used"];
        tu = parseFloat(tu / 1024 / 1024 / 1024).toFixed(2);
        me.tableData.push({
          name: me.$fillHyphen(e["resource_alias"]),
          template_name: me.$fillHyphen(e["template_name"]),
          osdNumber: me.$fillHyphen(ai["last_osd_number"]),
          numberOfInstance: me.$fillHyphen(cluster["last_number"]),
          storagePools: me.$fillHyphen(cluster["last_pools"]),
          totalStorage: me.$fillHyphen(ts, " GB"),
          usedAmount: me.$fillHyphen(tu, " GB"),
          collectHost: me.$fillHyphen(e["collect_host"]),
          resourceID: me.$fillHyphen(e["resource_id"]),
          level: {
            sign: e["alert_status"],
            name: utils.getLevel(e["alert_status"])
          },
          operate: Vue.t("monitor.REDISCOVER ")
        });
      });
    },
    paginationSizeChange(v) {
      this.pageSize = v;
      this.getTableData({ page: 1 });
    },
    paginationCurrentChange(v) {
      this.currentPage = v;
      this.getTableData({ page: this.currentPage });
    },
    gotoDetails(v) {
      let rid = v.resourceID;
      let mor = rid.substr(3);
      let path = `/intelligentMonitoring/resourceMonitor/incloudStorage/incloudStorageDetail/${v.collectHost}/${rid}`;
      this.$router.push({ path: path });
    }
  }
};
</script>

<style scoped>
.incloud-storage {
}
.incloud-storage >>> .content table tbody tr td:first-child:hover {
  text-decoration: underline;
}
.incloud-storage >>> .content table tbody tr td:first-child,
.incloud-storage >>> .content table tbody tr td:last-child {
  cursor: pointer;
  color: #1991eb;
}
.incloud-storage >>> .el-table {
  margin: 0 0 15px;
}
</style>