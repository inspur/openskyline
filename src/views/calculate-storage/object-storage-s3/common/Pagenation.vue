<template>
  <div>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[5, 10, 20, 30, 40, 60, 80, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>
<script>
export default {
  name: 'Pagenation',
  props: ["totalData", "pageCount", "sortObj"],
  data() {
    return {
      currentPage: 1,
      pageSize: this.pageCount == null?10:this.pageCount,
      total: 0,
      data1: [],
      data2: [],
      finalData: []
    };
  },
  watch: {
    totalData() {
      this.data1 = [...this.totalData[0]];// 加[]防止watch无限循环
      this.data2 = [...this.totalData[1]];// 加[]防止watch无限循环
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
    console.log(this.totalData);
  },
  methods: {
    tablePageInation(data) {
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
      if (this.data1 && this.data1.length > 0) {
        this.data1.sort(this.$sortFormatter(this.sortObj.sortField, this.sortObj.sortOrder, this.sortObj.sortType));
      }
      if (this.data2 && this.data2.length > 0) {
        this.data2.sort(this.$sortFormatter(this.sortObj.sortField, this.sortObj.sortOrder, this.sortObj.sortType));
      }
      if (this.sortObj.sortOrder === "ascending") {
        this.finalData = [];
        if (this.data1 && this.data1.length > 0) {
          this.finalData = [...this.finalData, ...this.data1];
        }
        if (this.data2 && this.data2.length > 0) {
          this.finalData = [...this.finalData, ...this.data2];
        }
      } else {
        this.finalData = [];
        if (this.data2 && this.data2.length > 0) {
          this.finalData = [...this.finalData, ...this.data2];
        }
        if (this.data1 && this.data1.length > 0) {
          this.finalData = [...this.finalData, ...this.data1];
        }
      }
    },
    refreshData() {
      let list = this.tablePageInation(this.finalData);
      this.$emit("getCurrentData", list);
    }
  }
}
</script>
<style scoped>
.el-pagination {
  float: right;
}
</style>
