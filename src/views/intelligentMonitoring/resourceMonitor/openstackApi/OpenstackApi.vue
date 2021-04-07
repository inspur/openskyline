<template>
  <div class="monitor openstack-api" v-loading="loading">
    <div v-if="!detailFlg" class="content">
      <el-form :inline="true" label-position="left">
        <el-form-item :label="$t('base.name')+'：'">
          <el-input size="small" v-model="alias" @blur="aliasInputBlur(40)"></el-input>
        </el-form-item>
        <el-form-item class="form-item-query">
          <el-button type="primary" size="small" @click="query">{{$t('lang.query')}}</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border style="width:100%" @cell-click="cellClick">
        <el-table-column prop="name" :label="$t('base.name')"></el-table-column>
        <el-table-column prop="frontend" :label="'Frontend '+$t('monitor.STATUS')"></el-table-column>
        <el-table-column prop="backend" :label="'Backend '+$t('monitor.STATUS')"></el-table-column>
        <el-table-column prop="serverup" :label="'Serverup ' +$t('monitor.NUMBER')"></el-table-column>
        <el-table-column prop="serverdown" :label="'Serverdown ' +$t('monitor.NUMBER')"></el-table-column>
        <el-table-column prop="level" :label="$t('monitor.alarmLevel')">
          <template slot-scope="scope">
            <span class="circle" :class="scope.row.level.sign">{{scope.row.level.name}}</span>
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
let isCN = Vue.config.lang === "zh-cn";
import { utils } from "../../public/utils";

export default {
  components: {},
  name: "nodes",
  watch: {
    $route(to, from) {
      this.detailFlg = this.$route.path.indexOf("openstackApiDetail") > -1;
    }
  },
  data() {
    return {
      detailFlg: this.$route.path.indexOf("openstackApiDetail") > -1,
      loading: false,
      centerId: "",
      isCN: Vue.config.lang === "zh-cn",
      alias: "",
      pageSize: 10,
      currentPage: 1,
      total: 0,
      tableData: [],
      matchData: [],
      eternity: []
    };
  },
  mounted() {
    this.tableRefresh();
  },
  methods: {
    tableRefresh() {
      this.getTableData();
    },
    cellClick(row, column, cell, event) {
      if (column.property === "name") {
        this.gotoDetails(row);
      }
    },
    async getTableData(v = {}) {
      let me = this;
      me.loading = true;

      let url = `api/pluto/v1/monitor/openstackapi/status`;
      let data = await me.$ajax({
        type: "get",
        url: url,
        headers: {
          FORWARD_UNION: me.centerId
        }
      });
      if (!data) {
        return;
      }
      me.loading = false;
      let apilist = data.apilist;
      me.total = data.total || apilist.length;

      me.eternity = [];
      apilist.forEach((e, i, a) => {
        let detail = e["detail"];
        let d = { frontend: "", backend: "", serverup: 0, serverdown: 0 };
        detail.forEach(v_ => {
          if (v_.sv === "FRONTEND") {
            d.frontend = v_.status;
          } else if (v_.sv === "BACKEND") {
            d.backend = v_.status;
          } else {
            v_.status === "UP" && d.serverup++;
            v_.status === "DOWN" && d.serverdown++;
          }
        });

        me.eternity.push({
          name: e["api"],
          frontend: d["frontend"],
          backend: d["backend"],
          serverup: d["serverup"],
          serverdown: d["serverdown"],
          level: { sign: e["status"], name: utils.getLevel(e["status"]) },
          collectHost: e["collect_host"],
          resourceID: e["resource_id"]
        });
        this.matchData = this.eternity;
        this.sliceData();
      });
    },
    query() {
      let t = this.alias;
      if (t) {
        let a = [
          ".",
          "*",
          "?",
          "+",
          "$",
          "^",
          "[",
          "]",
          "{",
          "}",
          "(",
          ")",
          "|",
          "\\s",
          "\\S",
          "\\w",
          "\\W",
          "\\d",
          "\\D",
          "\\t",
          "\\r",
          "\\n",
          "\\v",
          "\\f",
          "\\b",
          "\\0"
        ];
        a.forEach(v => {
          t = t.replace(v, `\\${v}`);
        });

        let r = new RegExp(t, "gim");
        this.matchData = this.eternity.filter(v => r.test(v.name));
      } else {
        this.matchData = this.eternity;
      }
      this.total = this.matchData.length;
      this.sliceData();
    },
    gotoDetails(v) {
      let path = `/intelligentMonitoring/resourceMonitor/openstackApi/openstackApiDetail/${v.name}`;
      this.$router.push({ path: path });
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
      this.tableData = this.matchData.slice(s, e);
    },
    aliasInputBlur(v) {
      if (this.alias.length > v) {
        this.alias = "";
        this.$notify({
          message: Vue.t("base.ultraLong"),
          type: "warning"
        });
      }
    }
  }
};
</script>

<style scoped>
.openstack-api {
}
.openstack-api >>> .el-tag {
  color: #000;
  background-color: #ddd;
  padding: 3px 10px;
  height: auto;
}
.openstack-api >>> .el-tag:not(:last-child) {
  margin-right: 2px;
}
.openstack-api >>> .content table tbody tr td:first-child:hover {
  text-decoration: underline;
}
.openstack-api >>> .content table tbody tr td:first-child {
  cursor: pointer;
  color: #1991eb;
}
.openstack-api >>> .chart {
  height: 333px;
}
</style>