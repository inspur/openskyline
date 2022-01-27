<template>
  <div>
    <icos-page-header :title="$t('base.projectManagement')" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
      <el-row :gutter="10">
        <el-col :span="24" :offset="0">
          <div class="divider clearfix"></div>
          <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
          </operation-panel>
          <el-table ref="deTable" :data="tableData" v-loading="loading" highlight-current-row :element-loading-text="$t('base.loadingData')" stripe style="width: 100%" row-key="id" @sort-change="sortChange" @selection-change="handleSelectionChange">
            <el-table-column reserve-selection type="selection" align="center" width="55">
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('name') >= 0" sortable="custom" prop="name" :label="$t('base.name')" min-width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.name }}</span>
                  <el-button size="mini" type="danger" v-if="deletingProjects.hasOwnProperty(scope.row.id)" @click="deleteProject(scope.row.id)">
                    <i class="el-icon-loading" />
                    {{ deletingProjects[scope.row.id].status == 'deleting' ? $t('base.deleting') : $t('base.deleteError') }}
                  </el-button>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('desc') >= 0" prop="description" :label="$t('base.desc')" min-width="100">
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('projectid') >= 0" prop="id" :label="$t('base.projectID')" min-width="100">
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="5">
                <el-button type="text" icon="fa-refresh" @click="getTableData">
                </el-button>
                  <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
                  <el-popover
                    placement="right"
                    trigger="click">
                    <el-checkbox-group class="vertical"
                      v-model="columnsChecked">
                      <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                      </el-checkbox>
                    </el-checkbox-group>
                    <div slot="reference" style="display: inline-block;">
                      <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
                    </div>
                  </el-popover>
              </el-col>
              <el-col :span="19">
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
          <create-project ref="createProject" v-if="createProjectFlg" @refreshData="getTableData"></create-project>
        </el-col>
      </el-row>
      <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="viewUsageFlg">
          <panel style="height: 100%">
            <div slot="title" class="clearfix">
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('base.back')}}</el-button>
            </div>
            <view-usage ref="viewUsage" :id="editId"></view-usage>
          </panel>
        </div>
      </transition>
      <!-- <transition name="slide-right" mode="out-in">
        <div style="width: 750px;" class="slide-panel" v-if="viewPowerFlg">
          <panel style="height: 100%">
            <div slot="title" class="clearfix">
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('base.back')}}</el-button>
            </div>
          </panel>
        </div>
      </transition> -->
      <delete-project v-for="(deleteProject, key) in deletingProjects" :key="key" :show.sync="deleteProject.show" :id="deleteProject.id" :name="deleteProject.name" @refreshData="getTableData" @finish="getTableData" @error="setDeletingProjectError"></delete-project>
    </icos-page>
  </div>
</template>
<script>
import CreateProject from './CreateProject'
import ViewUsage from './ViewUsage'
import DeleteProject from './DeleteProject'
export default {
  name: "project",
  watch:{
    multipleSelection:function (arr) {
      this.editId = arr.length==0?"":arr[0].id;
    }
  },
  data() {
    return {
      createProjectFlg: false,
      viewUsageFlg: false,
      viewPowerFlg: false,
      allData: [],
      tableData: [],
      editId:"",
      desc:"asc",
      field:"name",
      loading: false,
      emptyText: Vue.t('base.noData'),
      value: "",
      multipleSelection: [],
      currentPage:1,
      pageSize: 10,
      total: 0,
      deletingProjects: {},
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
      columnsChecked: ["name", "desc", "projectid"],
      operationMenus: [{
        icon: "fa-plus-circle",
        name: this.$t('base.createProject'),
        showflg: Vue.AuthList["m.systemmanage.projectmanage.create"],
        readOnly: true,
        handler: function() {
          let me = this;
          me.createProjectFlg = true;
          me.$nextTick(() => {
            me.$refs.createProject.show();
          });
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('base.edit'),
        showflg: Vue.AuthList["m.systemmanage.projectmanage.edit"],
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let me = this;
          me.createProjectFlg = true;
          me.$nextTick(() => {
            me.$refs.createProject.show(selectedRows[0], "first");
          });
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: this.$t('base.modifyMembers'),
        showflg: Vue.AuthList["m.systemmanage.projectmanage.updateperson"],
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let me = this;
          me.createProjectFlg = true;
          me.$nextTick(() => {
            me.$refs.createProject.show(selectedRows[0], "second");
          });
        }.bind(this)
      },
      {
        icon: "fa-edit",
        name: this.$t('base.modifyGroup'),
        showflg: Vue.AuthList["m.systemmanage.projectmanage.updategroup"]&&!Vue.isLdap,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let me = this;
          me.createProjectFlg = true;
          me.$nextTick(() => {
            me.$refs.createProject.show(selectedRows[0], "third");
          });
        }.bind(this)
      },
      {
        icon: "fa-edit",
        name: this.$t('base.modifyQuota'),
        showflg: Vue.AuthList["m.systemmanage.projectmanage.updatequota"],
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let me = this;
          me.createProjectFlg = true;
          me.$nextTick(() => {
            me.$refs.createProject.show(selectedRows[0], "fourth");
          });
        }.bind(this)
      }, {
        icon: "fa-eye",
        name: this.$t('base.viewUsage'),
        showflg: Vue.AuthList["m.systemmanage.projectmanage.usage"],
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          this.viewPowerFlg = false;
          this.viewUsageFlg = true;
          this.$nextTick(() => {
            this.$refs.viewUsage.getData();
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('base.delete'),
        showflg: Vue.AuthList["m.systemmanage.projectmanage.delete"],
        multi: false,
        enable(obj) {
          return obj.name!="service"&&obj.name!="admin";
        },
        handler: function(selectedRows) {
          let me = this;
          let item = selectedRows[0];
          me.deleteProject(item.id, item.name)
        }.bind(this)
      }],
      searchBar: {
        conditions: {
          name: {
            label: this.$t('base.projectName'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          project_id: {
            label: this.$t('base.projectID'),
            type: 'input',
            validator: (value) => {
              if (!/^[0-9a-zA-Z]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetterNumber'));
              }
            }
          }
        },
        validatedParams: {}
      }
    }
  },
  mounted() {
    this.getTableData();
  },
  methods: {
    async getTableData(flg=true) {
      let me = this;
      this.loading = true;
      var param = {dir:this.order, field:this.field, limit:this.pageSize, page:this.currentPage, domain_id:"default"};
      if (this.searchBar.validatedParams.name) {
        param.name = this.searchBar.validatedParams.name;
      }
      if (this.searchBar.validatedParams.project_id) {
        param.id = this.searchBar.validatedParams.project_id;
      }
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/projects?" + $.param(param)
      });
      this.tableData = ret.projects;
      this.total = ret.total;
      if (flg) {
        this.$nextTick(() => {
          this.$refs.deTable.clearSelection();
        });
      }
      this.loading = false;
    },
    sortChange(obj) {
      if (!obj.prop) { return; }
      this.order = obj.order=="ascending"?"asc":"desc";
      this.field = obj.prop;
      this.getTableData();
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData(false);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData(false);
    },
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
      if (selection.length!=1) {
        this.viewUsageFlg = false;
        this.viewPowerFlg = false;
      }
    },
    onBack() {
      this.viewUsageFlg = false;
      this.viewPowerFlg = false;
    },
    deleteProject(id, name) {
      const $this = this;
      if ($this.deletingProjects.hasOwnProperty(id)) {
        $this.deletingProjects[id].show = true;
      } else {
        this.$prompt(Vue.t('base.deleteProjectWarn'), this.$t('base.deleteConfirm'), {
          confirmButtonText: this.$t("lang.confirm"),
          cancelButtonText: this.$t("lang.cancel"),
          inputPattern: /^YES$|^NO$/i,
          inputValue: "NO",
          customClass: "promptConfirmDel",
          inputErrorMessage: this.$t("lang.onlyAcceptYesOrNo")
        }).then(({ value }) => {
          if (value.toLowerCase() === 'yes') {
            $this.$set($this.deletingProjects, id, {
              id: id,
              name: name,
              show: true,
              status: 'deleting'
            });
          }
        });
      }
    },
    setDeletingProjectError(id) {
      const $this = this;
      $this.deletingProjects[id].status = 'error';
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.getTableData();
    }
  },
  components: {
    CreateProject,
    ViewUsage,
    DeleteProject
  }
}

</script>
