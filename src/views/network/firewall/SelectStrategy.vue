<template>
  <div>
    <el-dialog :title="$t('network.selectStrategy')" :visible.sync="visible" class="custom-dialog">
      <el-table
        ref="deTable"
        :data="tableData"
        v-loading="tableLoading"
        :element-loading-text="$t('base.loadingData')"
        highlight-current-row
        max-height="400"
        style="width:100%;"
        row-key="id"
        @row-click="rowClick"
        >
        <el-table-column v-if="false" prop="id" :label="id" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('network.strategy')" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" :label="$t('lang.desc')" min-width="100">
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible=false">{{$t('base.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
      </div>
   </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'SelectStrategy',
  props:{
    queryStrategys:{
      type:Array,
      default:[]
    }
  },
  data() {
    return {
      visible:false,
      tableData:[],
      policyId: "",
      policyName: "",
      tableLoading:false,
      columns: [
        {
          prop: "id",
          label: "id"
        }, {
          prop: "name",
          label: this.$t('network.strategy')
        }, {
          prop: "description",
          label: this.$t('lang.desc')
       }],
      columnsChecked: ["id", "name", "description"]
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
      this.getTableData();
    },
    getTableData() {
      this.tableLoading = true;
      this.tableData = this.queryStrategys;
      this.tableLoading = false;
    },
    rowClick(row) {
      this.policyId = row.id;
      this.policyName = row.name;
    },
    confirmFun() {
      this.$emit('getStrategy', this.policyId, this.policyName);
      this.visible = false;
    }
  }
}
</script>
<style>
  .custom-dialog .el-dialog{
    width:900px !important;
  }
</style>
