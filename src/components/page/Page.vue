<template>
  <div>
    <el-pagination
      layout="total, sizes, prev, pager, next, jumper"
      :current-page="currentPage"
      :page-sizes="[5, 10, 20, 30, 40, 60, 80, 100]"
      :page-size="pageSize"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
<script>
export default {
  name: 'Page',
  props: {
    totalData: {
      type: Array,
      default: () => []
    },
    pageCount: {
      type: Number,
      default: 10
    },
    sortObj: {
      type: Object,
      default: () => {
        return {
          sortOrder: '',
          sortField: ''
        }
      }
    },
    objStorFlag: {  // 为true时，每次totalData变化页码都会自动回第1页
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentPage: 1,
      pageSize: this.pageCount,
      total: 0,
      data: [...this.totalData]
    };
  },
  watch: {
    totalData() {
      this.data = [...this.totalData];
      if (this.sortObj && this.sortObj.sortOrder && this.sortObj.sortField) {
        this.sortData();
      }
      if (this.objStorFlag) {
        this.currentPage = 1;
      }
      this.refreshData();
    },
    sortObj: {
      deep: true,
      handler() {
        if (this.sortObj && this.sortObj.sortOrder && this.sortObj.sortField) {
          this.sortData();
        }
        this.refreshData();
      }
    }
  },
  mounted() {
  },
  methods: {
    tablePageInation(data) {
      const $this = this;
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
      const $this = this;
      let list = $this.tablePageInation($this.data);
      $this.$emit('getCurrentData', list);
    },
    setCurrentPage(page=1) {
      const $this = this;
      if (page < 0 || page > Math.floor($this.total / $this.pageSize)) {
        page = 1;
      }
      $this.currentPage = page;
    }
  }
}
</script>
<style scoped>
.el-pagination {
  float: right;
}
</style>
