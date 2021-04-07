<template>
  <div>
    <icos-page-header :title="$t('base.deptManagement')" />
    <icos-page>
      <el-row :gutter="10">
        <el-col :span="5">
          <el-card>
            <ztree
              ref="deZtree"
              :data="treeData"
              :setting="setting"
              style="position: relative; min-height: 500px;"
              v-loading="treeLoading"
              :element-loading-text="$t('base.loadingData')"
            ></ztree>
            <h2
              style="text-align: center; min-height: 600px;"
              v-if="!treeData || treeData.length<0"
            >{{emptyText}}</h2>
          </el-card>
        </el-col>

        <el-col :span="19" :offset="0">
          <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="handleSearch" />
          <div class="divider clearfix"></div>
          <operation-panel
            class="margin-tb5"
            :select-rows="multipleSelection"
            :operation-menus="operationMenus"
          ></operation-panel>
          <el-table
            ref="deTable"
            :data="tableData"
            v-loading="tableLoading"
            :element-loading-text="$t('base.loadingData')"
            highlight-current-row
            stripe
            style="width: 100%"
            row-key="id"
            @row-click="rowClick"
            @selection-change="handleSelectionChange"
          >
            <el-table-column reserve-selection type="selection" align="center" width="55"></el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('name') >= 0"
              prop="name"
              :label="$t('base.name')"
              min-width="100"
            ></el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('parentName') >= 0"
              prop="parent_name"
              :label="$t('base.superiorDepartment')"
              min-width="100"
            ></el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="5">
                <el-button type="text" icon="fa-refresh" @click="getTableData"></el-button>
                <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
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
              <el-col :span="19">
                <page ref="page" :totalData="allData" @getCurrentData="getCurrentData"></page>
              </el-col>
            </el-row>
          </div>

          <new-depart
            ref="newDepart"
            v-if="newDepartFlg"
            :node="selectNode"
            @refreshData="refreshData"
          ></new-depart>

          <edit-depart ref="editDepart" :id="editId" v-if="editDepartFlg" @refreshData="refreshData"></edit-depart>
        </el-col>
      </el-row>
    </icos-page>
  </div>
</template>
<script>
import NewDepart from "./NewDepart";
import EditDepart from "./EditDepart";
export default {
  name: "DepartmentManage",
  watch: {
    multipleSelection: function(arr) {
      this.editId = arr.length == 0 ? "" : arr[0].id;
    }
  },
  data() {
    return {
      setting: {
        check: {
          enable: false
        },
        data: {
          simpleData: {
            enable: true
          },
          key: {
            name: "name"
          }
        },
        callback: {
          onClick: this.onTreeNodeClick
        }
      },
      treeData: [],
      allData: [],
      tableData: [],
      editId: "",
      selectNode: null,
      treeLoading: false,
      tableLoading: false,
      emptyText: Vue.t("base.noData"),
      newDepartFlg: false,
      editDepartFlg: false,
      multipleSelection: [],
      columns: [
        {
          prop: "name",
          label: this.$t("base.name")
        },
        {
          prop: "parentName",
          label: this.$t("base.superiorDepartment")
        }
      ],
      columnsChecked: ["name", "parentName"],
      operationMenus: [
        {
          icon: "fa-plus-circle",
          name: this.$t("base.newDepartment"),
          showflg: true,
          readOnly: true,
          handler: function() {
            this.newDepartFlg = true;
            this.$nextTick(() => {
              this.$refs.newDepart.show();
            });
          }.bind(this)
        },
        {
          icon: "fa-edit",
          name: this.$t("base.edit"),
          showflg: true,
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function(selectedRows) {
            let me = this;
            me.editDepartFlg = true;
            me.$nextTick(() => {
              me.$refs.editDepart.show(selectedRows[0].name);
            });
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: this.$t("base.delete"),
          showflg: true,
          multi: true,
          enable(obj) {
            return true;
          },
          handler: async function(selectedRows) {
            let me = this;
            let ret = await this.$sequence({
              type: "DELETE",
              url: "api/keystone/v3/inspur/departments/{id}",
              confirmMsg: Vue.t("base.deleteDepartmentWarn"),
              params: selectedRows,
              log: {
                description: {
                  en: "delete department",
                  zh_cn: "删除部门"
                },
                target: Vue.logTarget.department,
                key: "name"
              }
            }).then(
              () => {
                me.$message.success(Vue.t("base.deleteSuccess"));
                me.refreshData();
              },
              () => {
                me.refreshData();
              }
            );
          }.bind(this)
        }
      ],
      searchBar: {
        conditions: {
          name: {
            label: this.$t('base.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          }
        },
        validatedParams: {}
      }
    };
  },
  async mounted() {
    await this.getTreeData();
    this.$nextTick(() => {
      this.getTableData();
    });
  },
  methods: {
    onTreeNodeClick() {
      this.selectNode = arguments[2];
      this.getTableData();
    },
    getCurrentData(data) {
      this.tableData = data;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onQuery() {
      this.getTableData();
    },
    async getTreeData(id) {
      this.treeLoading = true;
      let ret = await this.$ajax({
        type: "get",
        url: "api/keystone/v3/inspur/departments"
      });
      var arr = ret.departments;
      arr.forEach(function(item, key) {
        item.pId = item.parent_id ? item.parent_id : "default";
        item.icon = "./static/img/ztree/department.png";
      });
      arr.unshift({
        id: "default",
        name: Vue.t("base.all"),
        icon: "./static/img/ztree/department.png"
      });
      this.treeData = arr;

      this.$nextTick(() => {
        let node = null;
        if (!id) {
          node = this.$refs.deZtree.action("getNodesByParam", "level", 0)[0];
        } else {
          node = this.$refs.deZtree.action("getNodesByParam", "id", id)[0];
        }
        this.selectNode = node;
        this.$refs.deZtree.action("selectNode", node);
        this.$refs.deZtree.action("expandNode", node);
      });
      this.treeTable = false;
    },
    async refreshData() {
      await this.getTableData();
      this.getTreeData(this.$refs.deZtree.action("getSelectedNodes")[0].id);
    },
    async getTableData(pid) {
      if (!pid) {
        let node = this.$refs.deZtree.action("getSelectedNodes")[0];
        pid = node.id;
      } else {
        pid = "default";
      }
      let name = '';
      if (this.searchBar.validatedParams.name) {
        name = this.searchBar.validatedParams.name;
      }
      let ret = await this.$ajax({
        type: "get",
        url:
          "api/keystone/v3/inspur/departments/" +
          pid +
          "/list?" +
          $.param({ department_name: name })
      });
      this.allData = ret.departments;
      this.$nextTick(() => {
        this.$refs.deTable.clearSelection();
      });
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.getTableData();
    }
  },
  components: {
    NewDepart,
    EditDepart
  }
};
</script>
