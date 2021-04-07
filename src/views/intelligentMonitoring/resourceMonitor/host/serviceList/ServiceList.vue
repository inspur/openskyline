<template>
  <div class="service-list">
    <div v-if="!dockerName">
      <el-table :data="tableData" border style="width:100%" @cell-click="cellClick">
        <el-table-column prop="name" :label="$t('base.name')+'：'"></el-table-column>
        <el-table-column prop="host" :label="$t('base.ON_HOST')"></el-table-column>
        <el-table-column prop="status" :label="$t('base.status')">
          <template slot-scope="scope">
            <span
              class="circle"
              :class="scope.row.status==='1'?'green':'red'"
            >{{scope.row.status==='1'?$t("base.normal") : $t("base.abnormal")}}</span>
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

    <docker v-if="dockerName" :dockerId="dockerName" :resourceId="resourceId" :hostName="hostName"></docker>

    <div
      v-if="!tableData.length"
      style="line-height:230px;height:230px;text-align:center;"
    >{{$t('monitor.nonServiceList')}}</div>
  </div>
</template>
<script>
import Docker from "../docker/Docker";

export default {
  components: {
    Docker
  },
  props: ["hostName", "resourceId"],
  data() {
    return {
      pageSize: 10,
      currentPage: 1,
      total: 0,
      tableData: [],
      eternity: [],
      dockerName: ""
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    cellClick(row, column, cell, event) {
      if (column.property === "name") {
        this.dockerName = row.name;
      }
    },
    initStatus(v) {
      this.dockerName = "";
    },
    getData() {
      let isCN = String(Vue.config.lang) === 'zh-cn';
      let me = this;
      this.$ajax({
        type: "get",
        url: "api/pluto/v1/monitor/openstackservice/" + this.hostName + "/info",
        successFun(v) {
          let data = v || {};
          let content = data.content || [];
          me.total = data.total || content.length;

          me.eternity = [];
          content.forEach((item, index) => {
            me.eternity.push({
              name: item[0],
              host: me.hostName,
              status: item[1],
              mem: isCN ? "接口暂未给数据" : 'no data'
            });
          });
          me.sliceData();
        }
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
.service-list {
  overflow: hidden;
}
.service-list >>> .el-table {
  margin-top: unset;
}
.service-list >>> table tbody tr td:first-child:hover {
  text-decoration: underline;
}
.service-list >>> table tbody tr td:first-child {
  cursor: pointer;
  color: #1991eb;
}
</style>
