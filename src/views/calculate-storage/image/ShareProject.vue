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
          <el-button type="primary" size="small" icon='fa-search' @click="searchTableData">{{$t('base.query')}}</el-button>
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
        @row-click="rowClick"
        @sort-change="sortChange"
        @current-change="handleCurrentSelectionChange"
        @selection-change="handleSelectionChange">
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('base.name')" sortable="custom" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('desc') >= 0" prop="description" :label="$t('base.desc')" min-width="100">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('projectid') >= 0" prop="id" :label="$t('base.projectID')" min-width="100">
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative;">
        <el-row>
          <el-col :span="10">
            <el-button type="text" icon="fa-refresh" @click="refreshData">
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
            <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
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
  props:['selImageId', 'selProjectList', 'currentProId'],
  data() {
    return {
      visible:false,
      desc:"asc",
      field:"name",
      sortObj:{
      },
      formInline: {
        name: "",
        project_id:""
      },
      multiple: false,
      multipleSelection: [],
      shareImageProList: [],
      currentPage:1,
      pageSize: 10,
      total: 0,
      tableData:[],
      totalData:[],
      tableLoading:false,
      columns: [{
        prop: "name",
        label: this.$t('base.name')
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
      var self = this;
      document.getElementsByTagName("body")[0].focus();
      this.visible = true;
      this.currentPage = 1;
      this.formInline = {
        name: "",
        project_id:""
      }
      self.initData();
    },
    async initData() {
      var self = this;
      self.tableLoading = true;
      try {
        let result = await self.$ajax({
          type: "get",
          url: "api/glance/v2/images/" + this.selImageId + "/members",
          showErrMsg: true,
          successFun: function() {}
        });
        var list = result.members;
        var dataResult = [];
        var currentProject = self.selProjectList.get(self.currentProId);
        var currentObj = {"name": currentProject.name, "desc":currentProject.description, "id":self.currentProId};
        dataResult.push(currentObj);
        for (let t = 0; t < list.length; t++) {
          var obj = list[t];
          var entity = {};
          var project = self.selProjectList.get(obj['member_id']);
          entity.name = project.name;
          entity.desc = project.description;
          entity.id = obj['member_id'];
          dataResult.push(entity);
        }
        self.totalData = dataResult;
        self.shareImageProList = dataResult;
        self.tableLoading = false;
      } catch (res) {
        self.tableLoading = false;
        self.$message.error(Vue.t("calcStorLang.getError"));
      }
    },
    searchTableData() {
      var self = this;
      var name = self.formInline.name.toLowerCase();
      var id = self.formInline.project_id.toLowerCase();
      var searchResult = [];
      for (let p = 0; p < self.shareImageProList.length; p++) {
        var obj = self.shareImageProList[p];
        if (name != null && (obj.name.toLowerCase()).indexOf(name) < 0) {
          continue;
        }
        if (id != null && (obj.id.toLowerCase()).indexOf(id) < 0) {
          continue;
        }
          searchResult.push(obj);
      }
        self.totalData = searchResult;
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    refreshData() {
      this.searchTableData();
    },
    sortChange(column) {
       var self = this;
       if (!column.prop) { return; }
       self.sortObj = {
           sortOrder:column.order,
           sortField:column.prop
       };
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
