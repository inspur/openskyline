<template>
  <div>
  <icos-page>  
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" :advanced-disabled="true"/>
    <div class="divider clearfix" v-if="roleType!='0'"></div>
    <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus" v-if="roleType!='0'"></operation-panel>
    <div class="divider clearfix"></div>
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      stripe
      :default-sort="{prop: 'name', order: 'ascending'}"
      row-key="id"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column reserve-selection type="selection" align="center" width="55"></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('lang.name')"
        show-overflow-tooltip
        sortable="custom"
        min-width="100">
         <template slot-scope="scope">
          <el-button @click="rowNameClick(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('node_processes') >= 0"
        prop="node_processes"
        :label="$t('cloudData.SERVICE_PROCESS')"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="processRender(scope.row.node_processes)"></span>
        </template>
      </el-table-column>
       <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0" prop="created_at" :label="$t('storage.createdTime')" min-width="100" sortable align="left">
        <template slot-scope="scope">
          <span v-html="dateRender(scope.row.created_at)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" :label="$t('lang.desc')" align="left" min-width="100">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
          <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox
                class="item"
                v-for="item in columns"
                :label="item.prop"
                :key="item.prop"
              >{{item.label}}</el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
      </el-row>
    </div>

    <create-template-guide
      ref="createStep"
      v-if="createFlag"
      :editTag="editTag"
      :rowData="rowData"
      @handleAddShow="handleAddShow"
      @refreshData="getData"
    ></create-template-guide>
  </icos-page>  
  </div>
</template>
<script>
import CreateTemplateGuide from "./CreateTemplateGuide";
import moment from "moment";
export default {
  name: "ImageList",
  components: {
    CreateTemplateGuide
  },
  data() {
    return {
      projectId: "",
      roleType: Vue.roleType,
      createFlag: false,
      editFlag: false,
      editTag: "add",
      rowData: {},
      columns: [],
      columnsChecked: ["name", "created_at", "description", "node_processes"],
      tableData: [],
      totalData: [],
      multipleSelection: [],
      loading: false,
      sortObj: {
        sortOrder: "desc",
        sortField: "name"
      },
      searchBar: {
        conditions: {
          name: {
            label: this.$t("lang.name"),
            type: "input",
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z]+$/.test(value)) {
                throw new Error(
                  this.$t("validation.onlyLetter_MinusNumber")
                );
              }
            }
          }
        }
      },
      searchBarValidatedParams: {},
      operationMenus: [
      {
        icon: "fa-plus",
        name: this.$t("network.create"),
        showflg: true,
        readOnly: true,
        handler: function () {
          this.editTag = "add";
          this.createFlag = true;
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: Vue.t('network.modify'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.editTag = "edit";
          this.rowData = selectRows[0];
          this.createFlag = true;
        }.bind(this)
      }, {
          icon: "fa-remove",
          name: this.$t("network.deleteText"),
          showflg: true,
          readOnly: false,
          multi: true,
          enable(rowData) {
            return true;
          },
          handler: function (selectedRows) {
            this.$confirm(
              "确认删除节点组模板吗？",
              this.$t("lang.confirm"),
              {
                confirmButtonText: this.$t("lang.confirm"),
                cancelButtonText: this.$t("lang.cancel"),
                type: "warning"
              }
            ).then(() => {
                this.$sequence({
                  type: "delete",
                  url: "api/sahara/v2/node-group-templates/{id}",
                  params: selectedRows,
                  log: {
                    description: {
                      en: "Delete Node Group Template:{name}",
                      zh_cn: "删除节点组模板:{name}"
                    },
                    target: Vue.logTarget.saharaNodeGroup
                  },
                  successMsg: this.$t("container.deleteSuccessMsg"),
                  successFun: () => {
                    this.getData();
                  },
                  errFun: () => {
                    this.getData();
                  }
                });
              })
              .catch(() => {});
          }.bind(this)
        }
      ]
    };
  },
  mounted() {
    let table = this.$refs.table;
    table.$children.forEach((item, index) => {
      if (item.label && item.prop) {
        this.columns.push({
          prop: item.prop,
          label: item.label
        });
      }
    });
    this.getData();
  },
  methods: {
    async getData(isClear = true) {
      let self = this;
      self.loading = false;
      if (isClear) {
        self.$nextTick(() => {
          self.$refs.table.clearSelection();
        });
      }
      try {
        self.projectId = this.$cookie.get("pid");
        let ajaxParam = {
          type: "GET",
          url: "api/sahara/v2/" + self.projectId + "/node-group-templates?sort_by=created_at"
        };
        let ret = await this.$ajax(ajaxParam);
        self.loading = false;
        let dataList = ret.node_group_templates;
        self.totalData = this.filterFun(dataList);
      } catch (data) {
        self.loading = false;
      }
    },
    filterFun(allData) {
      let self = this;
      let nameFilteredData = [];
      if (self.searchBarValidatedParams.name == undefined || self.searchBarValidatedParams.name == "") {
        nameFilteredData = allData;
      } else {
        allData.forEach(function(obj) {
          if (obj.name.indexOf(self.searchBarValidatedParams.name) > -1) {
            nameFilteredData.push(obj);
          }
        });
      }
      return nameFilteredData;
    },
    handleSearch(params) {
      this.searchBarValidatedParams = params;
      this.getData();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    sortChange(column) {
      let self = this;
      let key = column.prop;
      let keyOrder = column.order;
      self.sortObj = {
        sortOrder: keyOrder,
        sortField: key
      };
      if (keyOrder != null && self.totalData != null) {
        self.totalData.sort(self.$sortFormatter(key, keyOrder));
      }
    },
    rowClick(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    onRefresh() {
      this.getData(this.queryParam, true);
    },
    handleAddShow() {
      this.createFlag = false;
    },
    processRender(arr) {
      let str = "";
      for (let i=0; i<arr.length; i++) {
        str += arr[i] +"<br>";
      }
      return str;
    },
    dateRender(utc) {
      return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
    },
    rowNameClick(rowData) {
      let detailRowDataId = rowData["id"];
      this.$router.push({
        path:"/clouddata/nodeGroup/" + detailRowDataId +"/groupDetail"
      });
    }
  }
};
</script>

