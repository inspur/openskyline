<template>
  <div>
    <el-dialog :title="$t('network.selectVm')" :visible.sync="visible" class="custom-dialog">
      <el-table
        ref="deTable"
        :data="tableData"
        v-loading="tableLoading"
        :element-loading-text="$t('base.loadingData')"
        highlight-current-row
        max-height="400"
        style="width:100%;"
        row-key="id"
        @row-click="rowClick">
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('base.name')" min-width="100">
        </el-table-column>
        <el-table-column v-if="false" prop="id" label="ID">
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative;">
        <el-row>
          <el-col :span="14">
            <el-pagination
              class="right"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible=false">{{$t('base.cancel')}}</el-button>
      </div>
   </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'HostList',
  props:{
    vmTableData:{
      type:Array,
      default:[]
    }
  },
  data() {
    return {
      visible:false,
      tableData: [],
      desc:"asc",
      field:"name",
      currentPage:1,
      pageSize: 10,
      total: 0,
      tableLoading:false,
      columns: [{
        prop: "name",
        label: this.$t('base.name')
      }, {
          prop: "id",
          label: "ID"
        }],
      columnsChecked: ["name", "id"]
    };
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    show() {
      document.getElementsByTagName("body")[0].focus();
      this.visible = true;
      this.currentPage = 1;
      this.getTableData();
    },
    getTableData() {
      this.tableLoading = true;
      this.total = this.vmTableData.length;
      this.tableData = this.vmTableData.slice((this.currentPage - 1) * this.pageSize
        , (this.currentPage * this.pageSize));
      this.tableLoading = false;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData(false);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData();
    },
    rowClick(row) {
      this.$emit("showHostDetail", row.id);
    }
  }
}
</script>
<style>
  .custom-dialog .el-dialog{
    width:900px !important;
  }
</style>
