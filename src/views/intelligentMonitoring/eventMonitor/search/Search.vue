<template>
  <div v-loading="loading" class="event-monitor-search">
    <icos-search-bar
      :conditions="searchBar.conditions"
      @search="searchHandle"
      @condition-value-changed="conditionValueChanged"
    />

    <!-- 事件时间、事件类型、事件级别、事件内容 -->
    <el-table :data="tableData" @cell-click="cellClick" border style="width:100%">
      <el-table-column prop="time" :label="$t('monitor.OPENSTACK_API_STATUS_TIME')" min-width="80"></el-table-column>
      <el-table-column prop="model" :label="$t('base.ownedModule')"></el-table-column>
      <el-table-column prop="type" :label="$t('monitor.EVENT_TYPE')"></el-table-column>
      <el-table-column prop="level" :label="$t('monitor.EVENT_LEVEL')"></el-table-column>
      <el-table-column prop="content" :label="$t('monitor.EVENT_CONTENT')" min-width="177"></el-table-column>
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
</template>
<script>
import { utils } from "../../public/utils";
import moment from "moment";

export default {
  components: {},
  watch: {
    $route(to, from) {
      this.detailFlg = this.$route.path.indexOf("hostDetail") > -1;
    }
  },
  data() {
    return {
      loading: false,
      centerId: "",
      isCN: Vue.config.lang === "zh-cn",
      alias: "",
      module: "",
      eventType: "",
      eventLevel: "",
      time: "",
      searchBar: {
        conditions: {
          ownedModule: {
            label: this.$t("monitor.MODULE_EVENT"),
            type: "cascader",
            options: []
          },
          eventLevel: {
            label: this.$t("monitor.EVENT_LEVEL"),
            type: "select",
            options: [
              {
                value: "OK",
                label: utils.getLevel("OK")
              },
              { value: "WARNING", label: utils.getLevel("WARNING") },
              { value: "CRITICAL", label: utils.getLevel("CRITICAL") }
            ]
          },
          time: {
            label: this.$t("monitor.OPENSTACK_API_STATUS_TIME"),
            type: "select",
            options: [
              { value: "0", label: Vue.t("monitor.all") },
              { value: "1", label: Vue.t("monitor.WHITHIN_A_DAY") },
              { value: "7", label: Vue.t("monitor.WHITHIN_A_WEEK") },
              { value: "30", label: Vue.t("monitor.WHITHIN_A_MONTH") }
            ]
          }
        }
      },
      pageSize: 10,
      currentPage: 1,
      total: 0,
      tableData: []
    };
  },
  created() {
    this.getTableData();
    this.getEventListData();
  },
  mounted() {},
  methods: {
    searchHandle(v = {}) {
      let m = v["ownedModule"];
      if (m && m.length > 1) {
        this.module = m[0] || "";
        this.eventType = m[1] || "";
      } else {
        this.module = "";
        this.eventType = "";
      }

      this.eventLevel = v["eventLevel"];
      this.time = v["time"];

      this.getTableData({ page: 1, from: "query-click" });
    },
    conditionValueChanged(v) {},
    cellClick(row, column, cell, event) {
      if (column.property === "name") {
      } else if (column.property === "tag") {
      }
    },
    getEventListData(v) {
      let vm = this;
      vm.$ajax({
        type: "get",
        url: `api/pluto/v1/event_list`,
        successFun: function (data) {
          let d = data || {};
          let a = d.event_list || [];

          vm.searchBar.conditions.ownedModule.options = Array.from(a, (v) => {
            let mn = v["model_name"] || "";
            let el = v["event_list"];
            if (vm.isCN && v["event_list_cn"]) {
              el = v["event_list_cn"];
            }
            let children = Array.from(el, (v) => {
              return { label: v, value: v };
            });

            return { label: mn, value: mn, children: children };
          });
        },
        errFun() {}
      });
    },
    async getTableData(v = {}) {
      let vm = this;
      if (v.page) {
        vm.currentPage = v.page;
      }
      vm.loading = true;
      let param = {
        currentpage: vm.currentPage,
        pagesize: vm.pageSize
      };
      let days = parseInt(vm.time);
      if (days) {
        param.days = days;
      }
      if (vm.eventLevel) {
        param.event_level = vm.eventLevel;
      }

      if (v.from === "query-click" && this.module) {
        param[vm.isCN ? 'event_type_cn' : 'event_type'] = vm.eventType;
      }

      if (vm.module) {
        param.model_name = vm.module;
      }
      let url = "api/pluto/v1/event?" + $.param(param);
      let data = await vm.$ajax({
        type: "get",
        url: url,
        headers: {
          FORWARD_UNION: vm.centerId
        },
        successFun: function (data = {}) {
          let el = data.eventlist;
          vm.total = data.event_count;
          vm.tableData = [];
          el.forEach((v) => {
            let t = v.time || "";
            t = moment(t).format("YYYY-MM-DD HH:mm:ss");
            let type = v["event_type"];
            if (vm.isCN && v["event_type_cn"]) {
              type = v["event_type_cn"];
            }
            vm.tableData.push({
              time: t,
              type: type,
              level: utils.getLevel(v["event_level"]),
              content: v["payload"],
              model: v["model_name"]
            });
          });
          vm.loading = 0;
        },
        errFun() {}
      });
    },
    queryClick() {
      this.getTableData({ page: 1, from: "query-click" });
    },
    paginationSizeChange(v) {
      this.pageSize = v;
      this.getTableData({ page: 1 });
    },
    paginationCurrentChange(v) {
      this.currentPage = v;
      this.getTableData({ page: this.currentPage });
    }
  }
};
</script>

<style scoped>
.event-monitor-search {
  overflow: hidden;
}
.event-monitor-search >>> .el-table {
  margin: 15px 0;
}
</style>