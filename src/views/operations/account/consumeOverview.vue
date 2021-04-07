<template>
  <div>
    <!--
    <el-form :inline="true" :model="formInline" class="form-inline" v-if="hostTypeFlag">
      <el-form-item :label="$t('opt.projectname')">
        <el-input auto-complete="off" style="width:160px;" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="formInline.projectName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" size="small" @click="queryClick">{{$t('opt.doQuery')}}</el-button>
      </el-form-item>
    </el-form>
    -->

    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="searchHandle" />

    <div class="divider clearfix" v-if="hostTypeFlag"></div>
    <el-table
      ref="consumeTable"
      :data="consumeData"
      v-loading="loading"
      :element-loading-text="$t('opt.dataLoading')"
      highlight-current-row
      stripe
      border
      style="width: 100%"
      row-key="id"
      :default-sort="{prop:'projectName', order:'ascending'}"
      @sort-change="sortChange"
      @row-click="rowClick"
      @selection-change="handleSelectionChange">
      <el-table-column
        v-if="columnsChecked.indexOf('projectName') >= 0"
        :label="$t('opt.projectname')"
        align="left"
        sortable="custom"
        prop="projectName"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="projectToName(scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('projectConsume') >= 0"
        :label="$t('opt.projectConsume')"
        align="left"
        prop="projectConsume"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="consumeRender(scope.row.projectConsume, scope.row)"></span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
            <el-popover
              placement="right"
              trigger="click">
              <el-checkbox-group class="vertical"
                v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" class="name-wrapper">
                <el-tag>{{$t('opt.selectColumn')}}</el-tag>
              </div>
            </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
      <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    </div>
  </div>
</template>
<script>
import {loadProject} from 'utils/xmlHttpRequestCommon';
export default {
  name: "consumeOverview",
  data() {
    return {
      searchBar: {
        conditions: {
          project: {
            label: this.$t("opt.projectname"),
            type: "select",
            visible: String(Vue.roleType) === "0",
            options: []
          }
        }
      },
      sortObj:{
        sortOrder:"ascending",
        sortField:"projectName"
      },
      formInline: {
        query_project:"",
        projectName: ""
      },
      selProjectFlg: false,
      close: "",
      totalData: [],
      loading: false,
      roleType: Vue.roleType + "",
      hostTypeFlag: Vue.roleType == 0,
      projectOption: [],
      projectData: [],
      columns: [{
        prop: "projectName",
        label: this.$t('opt.projectname')
      }, {
        prop: "projectConsume",
        label: this.$t('opt.projectConsume')
      }],
      columnsChecked: ['projectName', 'projectConsume'],
      consumeData: [],
      multipleSelection: []
    }
  },
  watch: {
    columnsChecked: {
      handler: function (rows, oldVal) {
       this.columnsChecked = rows;
      },
      deep: true
    }
  },
  mounted() {
    var self = this;
    var roleType = Vue.roleType + "";
    Promise.all([self.getProjectList()]).then(function(result) {
      self.getData();
    });

    if (String(Vue.roleType) === "0") {
      loadProject()
        .then(v => {
          this.searchBar.conditions.project.options = Array.from(v, v => {
            return { label: v.name, value: v.id };
          });
        })
        .catch(v => {});
    }
  },
  methods: {
    searchHandle(v = {}) {
      if (Vue.roleType == "0") {
        this.formInline.query_project = v.project ? v.project : '';
      }

      this.queryClick();
    },
    async getData(page = 1, projectid="") {
      var self = this;
      self.loading = true;
      try {
        var queryStr="";
        let url = "";
        let roleType = Vue.roleType + "";
        if (roleType == "0") {
          if (projectid != "") {
            queryStr += "?tenant_id="+projectid;
          }
        } else {
          queryStr += "?tenant_id="+Vue.cookie.get('pid');
        }
        if (queryStr == "") {
          url = "api/cloudkitty/v1/cost/get_tenant_cost"+queryStr+"?time="+new Date().getTime();
        } else {
          url = "api/cloudkitty/v1/cost/get_tenant_cost"+queryStr+"&time="+new Date().getTime();
        }
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.loading = false;
        self.totalData = [];
        let fws = result['cost_list'];
        for (let i=0; i<fws.length; i++) {
          var obj = {
            projectName: "",
            projectConsume: ""
          };
          obj.projectName = fws[i].tenant_id;
          obj.projectConsume = fws[i].rate;
          self.totalData.push(obj);
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
        console.log(self.$t('opt.getProjectConsumeListFailed'));
      }
    },
    getCurrentData(param) {
      this.consumeData = param;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.$refs.consumeTable.clearSelection();
      this.getData();
    },
    rowClick(row) {
      this.$refs.consumeTable.toggleRowSelection(row);
    },
    async getProjectList() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/projects?domain_id=default";
      if ("2" == roleType) {
        //非超级管理员，查询一个项目信息
        url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        if ("2" == roleType) {
          self.projectData = result['project'];
        } else {
          var projects = result['projects'];
          self.projectOption = projects;
        }
      } catch (res) {
        console.log(self.$t('opt.getProjectListFailed'));
      }
    },
    projectToName(row) {
      var result = "";
      let proId = row["projectName"];
      if ("0" == roleType) {
        let proList = this.projectOption;
        for (let i=0; i<proList.length; i++) {
          if (proId === proList[i]["id"]) {
            result = proList[i]["name"];
          }
        }
      } else {
        if (proId === this.projectData.id) {
          result = this.projectData.name;
        }
      }
      return result;
    },
    consumeRender(value, rowData) {
      let self = this
      let consume = rowData['projectConsume'];
      let consumeNumber = Number(consume);
      consume = consumeNumber.toFixed(2) || 0;
      return consume;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    onIconClick() {
      this.formInline.query_project = '';
      this.formInline.projectName = '';
      this.close = '';
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.formInline.query_project = id;
      this.formInline.projectName = name;
      this.close = 'circle-close';
    },
    queryClick() {
      var self = this;
      self.getData(1, self.formInline.query_project);
      this.$refs.consumeTable.clearSelection();
    }
  }
}
</script>