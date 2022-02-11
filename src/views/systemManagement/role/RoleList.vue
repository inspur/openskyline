<template>
  <div>
    <icos-page-header :title="$t('base.roleManagement')" />
    <icos-page>
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
        v-loading="loading"
        :element-loading-text="$t('base.loadingData')"
        highlight-current-row
        stripe
        style="width: 100%; margin-top: 16px;"
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
          v-if="columnsChecked.indexOf('isDefault') >= 0"
          prop="is_default"
          align="left"
          :label="$t('base.buildInRole')"
          min-width="100"
        >
          <template slot-scope="scope">
            <span>{{scope.row.is_default?$t('base.yes'):$t('base.no')}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('roleType') >= 0"
          prop="type"
          align="left"
          :label="$t('base.roleType')"
          min-width="100"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.type==0">{{$t('base.superAdmin')}}</span>
            <span v-if="scope.row.type==2">{{$t('base.projectAdmin')}}</span>
            <span v-if="scope.row.type==3">{{$t('base.projectUser')}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('desc') >= 0"
          prop="description"
          :label="$t('base.desc')"
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

      <transition name="slide-right" mode="out-in">
        <div style="width: 700px;" class="slide-panel" v-if="viewRoleFlg">
          <panel style="height: 100%">
            <div slot="title" class="clearfix">
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('base.back')}}</el-button>
            </div>
            <view-role ref="viewRole" :roleId="editId"></view-role>
          </panel>
        </div>
      </transition>
    </icos-page>
  </div>
</template>
<script>
import ViewRole from "./ViewRole";
export default {
  name: "project",
  watch: {
    multipleSelection: function(arr) {
      this.editId = arr.length == 0 ? "" : arr[0].id;
    }
  },
  data() {
    return {
      viewRoleFlg: false,
      allData: [],
      tableData: [],
      editId: "",
      loading: false,
      emptyText: Vue.t("base.noData"),
      multipleSelection: [],
      columns: [
        {
          prop: "name",
          label: this.$t("base.name")
        },
        {
          prop: "isDefault",
          label: this.$t("base.buildInRole")
        },
        {
          prop: "roleType",
          label: this.$t("base.roleType")
        },
        {
          prop: "desc",
          label: this.$t("base.desc")
        }
      ],
      columnsChecked: ["name", "isDefault", "roleType", "desc"],
      operationMenus: [
        {
          icon: "fa-plus-circle",
          name: this.$t("base.addRole"),
          showflg: Vue.AuthList["m.systemmanage.rolemanage.add"],
          readOnly: true,
          handler: function() {
            this.$router.push({
              path: "/systemManagement/role/addRole"
            });
          }.bind(this)
        },
        {
          icon: "fa-edit",
          name: this.$t("base.edit"),
          showflg: Vue.AuthList["m.systemmanage.rolemanage.edit"],
          multi: false,
          enable(obj) {
            return !obj.is_default;
          },
          handler: function(selectedRows) {
            this.$router.push({
              path: "/systemManagement/role/editRole/" + selectedRows[0].id
            });
          }.bind(this)
        },
        {
          icon: "fa-eye",
          name: this.$t("base.view"),
          showflg: Vue.AuthList["m.systemmanage.rolemanage.detail"],
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function(selectedRows) {
            this.viewRoleFlg = true;
            this.$nextTick(() => {
              this.$refs.viewRole.getData();
            });
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: this.$t("base.delete"),
          showflg: Vue.AuthList["m.systemmanage.rolemanage.delete"],
          multi: true,
          enable(obj) {
            return !obj.is_default;
          },
          handler: async function(selectedRows) {
            let me = this;
            let ret = await this.$sequence({
              type: "DELETE",
              url: "api/keystone/v3/roles/{id}",
              params: selectedRows,
              confirmMsg: Vue.t("base.deleteDataWarn"),
              log: {
                description: {
                  en: "delete role",
                  zh_cn: "删除角色"
                },
                target: Vue.logTarget.role,
                key: "name"
              }
            })
              .then(() => {
                me.$message.success(Vue.t("base.deleteSuccess"));
                me.getTableData();
              })
              .catch(() => {
                me.getTableData();
              });
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
  mounted() {
    this.getTableData();
  },
  methods: {
    async getTableData() {
      this.loading = true;
      let obj = {};
      if (this.searchBar.validatedParams.name) {
        obj.name = this.searchBar.validatedParams.name;
      }
      let ret = await this.$ajax({
        type: "get",
        url: "api/keystone/v3/roles?" + $.param(obj)
      });
      this.$convertRoleLanguage(ret.roles, "description");
      this.allData = this.$convertRoleLanguage(ret.roles);
      this.$nextTick(() => {
        this.$refs.deTable.clearSelection();
      });
      this.loading = false;
    },
    getCurrentData(data) {
      this.tableData = data;
    },
    onQuery() {
      this.getTableData();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      if (val.length != 1) {
        this.viewRoleFlg = false;
      }
    },
    onBack() {
      this.viewRoleFlg = false;
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
    ViewRole
  }
};
</script>
