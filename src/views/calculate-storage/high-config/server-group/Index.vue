<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="roleType !== '0'" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="acTable" :data="tableData" v-loading="loading" highlight-current-row stripe border style="width: 100%" row-key="id" @selection-change="handleSelectionChange" :default-sort="{prop: 'name', order: 'ascending'}" @row-click="rowClick">
      <el-table-column reserve-selection type="selection" width="55" align="center">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="80">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('project') >= 0 && roleType === '0'" :label="$t('lang.project')" prop="project" min-width="80">
        <template slot-scope="scope">
          {{ getProjectName(scope.row.project_id) }}
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('id') >= 0" label="ID" prop="id" min-width="80">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('policies') >= 0" prop="policies" :label="$t('calcStorLang.groupStrategies')" min-width="50">
        <template slot-scope="scope">
          <span v-html="serverStatisRender(scope.row.policies, scope.row)"></span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('calcStorLang.currentSelect')}} {{multipleSelection.length}} {{$t('calcStorLang.bar')}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :objStorFlag="currentPageReset"></page>
        </el-col>
      </el-row>
    </div>
    <add-group v-if="serverGroupFlag" @handleShow="handleShow" @loadServerGroupList="loadServerGroupList"></add-group>
  </div>
</template>

<script>
import AddGroup from './AddGroup';
export default {
  name: 'keyPair',
  components: { AddGroup },
  data() {
    return {
      roleType: Vue.roleType + '',
      currentPageReset: false,
      formInline: '',
      total: 0,
      projects: [],
      serverGroupFlag: false,
      currentPage: 1,
      columns: [{
        prop: 'name',
        label: this.$t('lang.name')
      }, {
        prop: 'project',
        label: this.$t('lang.project')
      }, {
        prop: 'id',
        label: 'ID'
      }, {
        prop: 'policies',
        label: this.$t('calcStorLang.groupStrategies')
      }],
      loading: true,
      columnsChecked: ['name', 'project', 'id', 'policies'],
      tableData: [],
      totalData: [],
      maxValue:255,
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name:  Vue.t('calcStorLang.create'),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.serverGroupFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          self.$sequence({
            type: 'delete',
            url: 'api/nova/v2.1/os-server-groups/{id}',
            params: selectRows,
            confirmMsg: Vue.t('calcStorLang.deleteServerGroupConfirm'),
            log: {
              description: {
                en: "Delete Group Affinity Strategy",
                zh_cn: "删除亲和性策略"
              },
              key: "name",
              target: Vue.logTarget.computeServerGroup
            }
          }).then((data) => {
            self.$message(Vue.t('calcStorLang.deleteServerGroupSuccess'));
            self.$refs.acTable.clearSelection();
            self.currentPage = 1;
            self.loadServerGroupList();
            self.loading = false;
          }).catch((err) => {});
        }.bind(this)
      }],
      selectProjectDialog: {
        visible: false
      },
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumber'));
              }
            }
          },
          project_id: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          }
        },
        validatedParams: {}
      }
    };
  },
  computed: {},
  async mounted() {
    if (this.roleType !== '0') {
      const projectColumnIndex = this.columns.findIndex(item => item.prop === 'project');
      this.columns.splice(projectColumnIndex, 1);
    }
    if (this.roleType === '0') {
      await this.getAllProjects();
    }
    await this.loadServerGroupList();
  },
  methods: {
    async loadServerGroupList(currentPageReset=false) {
      var self = this;
      let name = 'name' in self.searchBar.validatedParams ? self.searchBar.validatedParams.name.toLowerCase() : '';
      let projectId = 'project_id' in self.searchBar.validatedParams ? self.searchBar.validatedParams.project_id : '';

      self.loading = true;
      let url = "api/nova/v2.1/os-server-groups?all_projects=True";
      if (Vue.roleType == '2') {
        url = "api/nova/v2.1/os-server-groups";
      }
      try {
        let res = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.13
          }
        });
        var resData = res.server_groups;
        if (resData !== null) {
          resData = resData.filter(item => item.name.toLowerCase().includes(name));
          if (projectId !== '') {
            resData = resData.filter(item => item.project_id === projectId);
          }
          if (currentPageReset === true) {
            self.currentPageReset = true;
          }
          self.totalData = resData;
          self.$nextTick(() => {
            self.currentPageReset = false;
          });
        } else {
          self.totalData = [];
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    async deleteSpecs(row) {
      var self = this;
      var pairKeyName = row['keypair'].name
      try {
        let result = await this.$ajax({
          type: 'delete',
          url: 'api/nova/v2.1/os-keypairs/' + pairKeyName,
          confirmMsg: Vue.t('calcStorLang.deleteServerGroupConfirm'),
          successMsg: Vue.t('calcStorLang.deleteServerGroupSuccess'),
          log: {
            description: {
              en: "Delete KeyPair:" + pairKeyName,
              zh_cn: Vue.t('calcStorLang.deleteKeyPair') + pairKeyName
            },
            target: Vue.logTarget.computeServerGroup
          }
        });
        self.$refs.acTable.clearSelection();
        self.loadServerGroupList();
      } catch (data) {
        __DEV__ && console.error(data);
      }
    },
    async getAllProjects() {
      const $this = this;
      const res = await $this.$ajax({
        type: 'get',
        url: `api/keystone/v3/inspur/projects`
      });
      $this.projects = res.projects;
      $this.searchBar.conditions.project_id.options = res.projects.map(item => {
        return {
          label: item.name,
          value: item.id
        };
      });
    },
    getProjectName(projectId) {
      const project = this.projects.find(p => p.id === projectId);
      if (project !== null && project !== undefined) {
        return project.name;
      } else {
        return '-';
      }
    },
    serverStatisRender(value, rowData) {
      var self = this;
      if ("affinity" == value) {
        return Vue.t('calcStorLang.groupAffinity');
      } else {
        return Vue.t('calcStorLang.groupAntiAffinity')
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleShow() {
      this.serverGroupFlag = false;
    },
    rowClick(row) {
      this.selectTblRow = row;
      this.$refs.acTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.$refs.acTable.clearSelection();
      this.loadServerGroupList();
    },
    clearProject() {
      this.projectId = '';
      this.projectName = '';
    },
    showSelectProjectDialog() {
      this.selectProjectDialog.visible = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    handleSelectProject(id, name) {
      this.projectId = id;
      this.projectName = name;
      this.selectProjectDialog.visible = false;
    },
    handleSearch(params) {
      const $this = this;
      this.searchBar.validatedParams = params;
      $this.loadServerGroupList(true);
      $this.$refs.acTable.clearSelection();
    }
  }
}
</script>

<style scoped>
</style>
