<template>
  <div>
    <el-dialog :title="$t('base.selectProjectTitle')" :visible.sync="visible" class="custom-dialog">
      <el-form :inline="true" :model="formInline" class="form-inline">
        <el-form-item :label="$t('base.projectName')">
          <el-input v-model="formInline.name" @blur="blurFun('name')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('base.projectID')">
          <el-input v-model="formInline.project_id" @blur="blurFun('project_id')"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" icon='fa-search' @click="getTableData">{{$t('base.query')}}</el-button>
        </el-form-item>
      </el-form>
      <el-table
        ref="deTable"
        :data="tableData"
        v-loading="tableLoading"
        :element-loading-text="$t('base.loadingData')"
        highlight-current-row
        max-height="400"
        style="width:100%;"
        row-key="id"
        @sort-change="sortChange"
        @row-click="rowClick"
        @row-dblclick="confirmFun"
        @current-change="handleCurrentSelectionChange"
        @selection-change="handleSelectionChange">
        <el-table-column reserve-selection type="selection" align="center" width="55" v-if="this.multiple">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('base.projectName')" min-width="100" sortable="custom">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('desc') >= 0" prop="description" :label="$t('base.desc')" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('projectid') >= 0" prop="id" :label="$t('base.projectID')" min-width="100">
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative;">
        <el-row>
          <el-col :span="10">
            <el-button type="text" icon="fa-refresh" @click="getTableData">
            </el-button>
              <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
              <el-popover
                placement="right"
                trigger="click">
                <el-checkbox-group class="vertical"
                  v-model="columnsChecked">
                  <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
                <div slot="reference" style="display: inline-block;">
                  <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
                </div>
              </el-popover>
          </el-col>
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
        <el-button type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
      </div>
   </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'SelectProject',
  props:{
    multiple:{
      type:Boolean,
      default:false
    }
  },
  data() {
    return {
      visible:false,
      desc:"asc",
      field:"name",
      formInline: {
        name: "",
        project_id:""
      },
      multipleSelection: [],
      currentPage:1,
      pageSize: 10,
      total: 0,
      tableData:[],
      tableLoading:false,
      columns: [{
        prop: "name",
        label: this.$t('base.projectName')
      }, {
        prop: "desc",
        label: this.$t('base.desc')
      }, {
        prop: "projectid",
        label: this.$t('base.projectID')
      }],
      columnsChecked: ["name", "desc", "projectid"]
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
      this.formInline = {
        name: '',
        project_id: ''
      }
      this.getTableData();
    },
    async getTableData(flg=true) {
      var params = {
        dir: this.order,
        field: this.field,
        limit: this.pageSize,
        page: this.currentPage,
        domain_id: 'default'
      };
      if (this.formInline.name !== '') {
        if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(this.formInline.name)) {
          this.$message.error(this.$t('validation.onlyLetter_MinusNumberChinese'));
          return;
        }
        params.name = this.formInline.name;
      }
      if (this.formInline.project_id !== '') {
        params.id = this.formInline.project_id;
      }
      this.tableLoading = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/projects?" + $.param(params)
      });
      this.tableData = ret.projects;
      this.total = ret.total;
      if (flg) {
        this.$nextTick(() => {
          this.$refs.deTable.clearSelection();
          this.multipleSelection = [];
        });
      }
      this.tableLoading = false;
    },
    sortChange(obj) {
      if (!obj.prop) { return; }
      this.order = obj.order=="ascending"?"asc":"desc";
      this.field = obj.prop;
      this.getTableData();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData(false);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData(false);
    },
    handleCurrentSelectionChange(val) {
      if (!this.multiple) {
        this.multipleSelection = [val];
      }
    },
    handleSelectionChange(val) {
      if (this.multiple) {
        this.multipleSelection = val;
      }
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    confirmFun() {
      if (this.multipleSelection.length==0) {
        this.$message({
          message: Vue.t('base.selectProject'),
          type: "warning"
        });
        return;
      }
      if (this.multiple) {
        let projectIdList = [];
        let projectNameList = [];
        this.multipleSelection.forEach((item) => {
          projectIdList.push(item.id);
          projectNameList.push(item.name);
        })
        this.$emit('getSelectProjects', projectIdList, projectNameList);
      } else {
        this.$emit('getSelectProjects', this.multipleSelection[0].id, this.multipleSelection[0].name);
      }
      this.visible = false;
    },
    blurFun(key) {
      let num = (key=="name"?40:50);
      if (this.formInline[key].length>num) {
        this.formInline[key] = '';
        this.$notify({
          message:Vue.t('base.ultraLong'),
          type:'warning'
        });
      }
    }
  }
}
</script>
<style>
  .custom-dialog .el-dialog{
    width:900px !important;
  }
</style>
