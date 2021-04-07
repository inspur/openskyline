<template>
  <div style="margin: 10px 0px; position: relative">
    <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
    </operation-panel>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="defaultPageSizes" :page-size="pageSize" :layout="layout" :total="total">
    </el-pagination>
  </div>
</template>
<script>
export default {
  name: 'TableAttachment',
  props: ["totalData", "pageCount", "sortObj", "multipleSelection", "operationMenus", "pageSizes", "pageLayout"],
  data() {
    return {
      currentPage: 1,
      pageSize: this.pageCount == null?10:this.pageCount,
      defaultPageSizes: [5, 10, 20, 30, 40, 60, 80, 100, 200],
      total: 0,
      layout: "total, sizes, prev, pager, next, jumper",
      data:[...this.totalData]
    };
  },
  watch: {
    totalData() {
      this.data = [...this.totalData];
      if (this.sortObj&&this.sortObj.sortOrder&&this.sortObj.sortField) {
        this.sortData();
      }
      this.refreshData();
    },
    sortObj() {
      if (this.sortObj&&this.sortObj.sortOrder&&this.sortObj.sortField) {
        this.sortData();
      }
      this.refreshData();
    }
  },
  mounted() {
    if (!this.pageSizes && this.pageSizes.slength != 0) {
      this.defaultPageSizes = this.pageSizes;
    }
    if (this.pageLayout) {
      this.layout = this.pageLayout;
    }
  },
  methods: {
    tablePageInation(data) {
      var self = this;
      let array = [];
      this.total = data.length;
      let startNum = 0;
      let endNum = 0;
      startNum = (this.currentPage - 1) * this.pageSize;
      if (this.currentPage * this.pageSize < this.total) {
        endNum = this.currentPage * this.pageSize;
      } else {
        endNum = this.total;
      }
      array = data.slice(startNum, endNum);
      return array;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.refreshData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.refreshData();
    },
    sortData() {
      this.data.sort(this.$sortFormatter(this.sortObj.sortField, this.sortObj.sortOrder, this.sortObj.sortType));
    },
    refreshData() {
      var self = this;
      let list = self.tablePageInation(self.data);
      self.$emit("getCurrentData", list);
    }
  }
}
</script>
<style scoped>
.el-pagination {
  position: absolute;
  top: 0px;
  right: 10px;
}
</style>
