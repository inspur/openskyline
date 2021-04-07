<template>
  <div>
    <icos-page-header :title="$t('container.heatStack')" :show-bottom-border="true" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
      <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
      <el-table ref="table" :data="tableData" v-loading="loading" :element-loading-text="$t('lang.loading')" highlight-current-row stripe :default-sort="{prop: 'creation_time', order: 'descending'}" row-key="id" @row-click="rowClick" @sort-change="sortChange" @selection-change="handleSelectionChange">
        <el-table-column reserve-selection type="selection" align="center" width="55">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('stack_name') >= 0" prop="stack_name" :label="$t('lang.name')" show-overflow-tooltip sortable="custom" min-width="100">
          <template slot-scope="scope">
            <el-button @click="orchestrationNameRender(scope.$index, scope.row)" type="text" size="small">{{scope.row.stack_name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('project') >= 0" prop="project" :label="$t('lang.project')" show-overflow-tooltip min-width="100">
          <template slot-scope="scope">
            <span v-html="getProjectNameById(scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('stack_status') >= 0" prop="stack_status" :label="$t('lang.status')" show-overflow-tooltip align="left" sortable="custom" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="statusTagRender(scope.row.stack_status)">
              <span>{{statusToCH(scope.row.stack_status, scope.row)}}</span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('creation_time') >= 0" prop="creation_time" :label="$t('lang.createTime')" show-overflow-tooltip align="left" sortable="custom" min-width="100">
          <template slot-scope="scope">
            <span>{{tzTimeFormatter(scope.row.creation_time)}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc('lang.item', multipleSelection.length)}}</span>
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="19">
            <page ref="pageComponent" :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
          </el-col>
        </el-row>
      </div>
    </icos-page>
  </div>
</template>
<script>
export default {
  name: "OrchestrationList",
  data() {
    return {
      roleType: String(Vue.roleType),
      projectOption: [],
      reloadTblFlag: false,
      tzTimeFormatter: this.$tzTimeFormatter,
      statusToCH:Vue.resourceStatusFormatter,
      showBorder: true,
      total: 0,
      columns: [],
      columnsChecked: ["stack_name", "project", "stack_status", "creation_time"],
      tableData: [],
      totalData: [],
      multipleSelection: [],
      loading: false,
      operationMenus: [{
        icon: "fa-pause",
        name: this.$t('heat.suspend'),
        showflg: Vue.roleType != "0",
        multi: true,
        readOnly: false,
        enable(rowData) {
          let rowStatus = rowData.stack_status;
          return rowStatus=="CREATE_COMPLETE"||rowStatus=="RESUME_COMPLETE"||rowStatus=="RESUME_FAILED"||rowStatus=="SUSPEND_FAILED";
        },
        handler: function(selectedRows) {
          let self = this;
          self.$prompt(this.$t('heat.suspendStackConfirmMsg'), this.$t('heat.operateConfirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            inputPattern:/^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage:this.$t('lang.onlyAcceptYesOrNo')
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
              self.suspendStack(selectedRows);
            }
          }).catch(() => {
            //取消
          });
        }.bind(this)
      }, {
        icon: "fa-repeat",
        name: this.$t('heat.recover'),
        showflg: Vue.roleType != "0",
        multi: true,
        readOnly: false,
        enable(rowData) {
          let rowStatus = rowData.stack_status;
          return rowStatus=="SUSPEND_COMPLETE"||rowStatus=="RESUME_FAILED";
        },
        handler: function(selectedRows) {
          let me = this;
          this.$confirm(this.$t('heat.recoverStackConfirmMsg'), this.$t('heat.operateConfirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            type: 'warning'
          }).then(() => {
            this.resumeStack(selectedRows);
          });
        }.bind(this)
      }, {
        icon: "fa-remove",
        name: this.$t('lang.delete'),
        showflg: Vue.roleType != "0",
        readOnly: false,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectedRows) {
          let self = this;
          self.$prompt(this.$t('heat.deleteStackConfirmMsg'), this.$t('heat.operateConfirm'), {
            confirmButtonText: this.$t('lang.confirm'),
            cancelButtonText: this.$t('lang.cancel'),
            inputPattern:/^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage:this.$t('lang.onlyAcceptYesOrNo')
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
              self.deleteStack(selectedRows);
            }
          }).catch(() => {
            //取消
          });
        }.bind(this)
      }],
      sortObj: {
        sortField: "",
        sortOrder: ""
      },
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\.]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberPointer'));
              }
            }
          },
          project_id: {
            label: this.$t('lang.project'),
            visible: String(Vue.roleType) === '0',
            type: 'select',
            options: []
          },
          status: {
            label: this.$t('lang.status'),
            type: 'select',
            options: [{
              value: 'CREATE_IN_PROGRESS',
              label: this.$t('heat.CREATE_IN_PROGRESS')
            }, {
              value: 'CREATE_FAILED',
              label: this.$t('heat.CREATE_FAILED')
            }, {
              value: 'CREATE_COMPLETE',
              label: this.$t('heat.CREATE_COMPLETE')
            }, {
              value: 'DELETE_IN_PROGRESS',
              label: this.$t('heat.DELETE_IN_PROGRESS')
            }, {
              value: 'DELETE_COMPLETE',
              label: this.$t('heat.DELETE_COMPLETE')
            }, {
              value: 'DELETE_FAILED',
              label: this.$t('heat.DELETE_FAILED')
            }, {
              value: 'SUSPEND_IN_PROGRESS',
              label: this.$t('heat.SUSPEND_IN_PROGRESS')
            }, {
              value: 'SUSPEND_COMPLETE',
              label: this.$t('heat.SUSPEND_COMPLETE')
            }, {
              value: 'SUSPEND_FAILED',
              label: this.$t('heat.SUSPEND_FAILED')
            }, {
              value: 'RESUME_IN_PROGRESS',
              label: this.$t('heat.RESUME_IN_PROGRESS')
            }, {
              value: 'RESUME_COMPLETE',
              label: this.$t('heat.RESUME_COMPLETE')
            }, {
              value: 'RESUME_FAILED',
              label: this.$t('heat.RESUME_FAILED')
            }, {
              value: 'ROLLBACK_IN_PROGRESS',
              label: this.$t('heat.ROLLBACK_IN_PROGRESS')
            }, {
              value: 'ROLLBACK_COMPLETE',
              label: this.$t('heat.ROLLBACK_COMPLETE')
            }, {
              value: 'ROLLBACK_FAILED',
              label: this.$t('heat.ROLLBACK_FAILED')
            }, {
              value: 'SNAPSHOT_IN_PROGRESS',
              label: this.$t('heat.SNAPSHOT_IN_PROGRESS')
            }, {
              value: 'SNAPSHOT_COMPLETE',
              label: this.$t('heat.SNAPSHOT_COMPLETE')
            }, {
              value: 'SNAPSHOT_FAILED',
              label: this.$t('heat.SNAPSHOT_FAILED')
            }, {
              value: 'UPDATE_IN_PROGRESS',
              label: this.$t('heat.UPDATE_IN_PROGRESS')
            }, {
              value: 'UPDATE_COMPLETE',
              label: this.$t('heat.UPDATE_COMPLETE')
            }, {
              value: 'UPDATE_FAILED',
              label: this.$t('heat.UPDATE_FAILED')
            }, {
              value: 'CHECK_IN_PROGRESS',
              label: this.$t('heat.CHECK_IN_PROGRESS')
            }, {
              value: 'CHECK_COMPLETE',
              label: this.$t('heat.CHECK_COMPLETE')
            }, {
              value: 'CHECK_FAILED',
              label: this.$t('heat.CHECK_FAILED')
            }, {
              value: 'INIT_IN_PROGRESS',
              label: this.$t('heat.INIT_IN_PROGRESS')
            }, {
              value: 'INIT_COMPLETE',
              label: this.$t('heat.INIT_COMPLETE')
            }, {
              value: 'INIT_FAILED',
              label: this.$t('heat.INIT_FAILED')
            }, {
              value: 'ADOPT_IN_PROGRESS',
              label: this.$t('heat.ADOPT_IN_PROGRESS')
            }, {
              value: 'ADOPT_COMPLETE',
              label: this.$t('heat.ADOPT_COMPLETE')
            }, {
              value: 'ADOPT_FAILED',
              label: this.$t('heat.ADOPT_FAILED')
            }]
          }
        },
        validatedParams: {}
      }
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
    this.getProjectList();
    this.getData();
  },
  beforeDestroy() {
    if (this.reloadTabelInterval != null) {
      clearInterval(this.reloadTabelInterval);
    }
  },
  watch: {
    tableData: {
      immediate: false,
      handler: function(dataList) {
        let self = this;
        self.reloadTblFlag = false;
        if (dataList != null) {
          for (let t = 0; t < dataList.length; t++) {
            let data = dataList[t];
            if (data['stack_status'] == "CREATE_IN_PROGRESS" || data['stack_status'] == "CHECK_IN_PROGRESS" ||
              data['stack_status'] == "ADOPT_IN_PROGRESS" || data['stack_status'] == "DELETE_IN_PROGRESS" ||
              data['stack_status'] == "INIT_IN_PROGRESS" || data['stack_status'] == "RESUME_IN_PROGRESS" ||
              data['stack_status'] == "ROLLBACK_IN_PROGRESS" || data['stack_status'] == "SNAPSHOT_IN_PROGRESS" ||
              data['stack_status'] == "SUSPEND_IN_PROGRESS" || data['stack_status'] == "UPDATE_IN_PROGRESS") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.reloadTabelInterval);

        if (self.reloadTblFlag && !self._isDestroyed) {
          self.reloadTabelInterval = setInterval(() => {
            this.getData(false);
          }, 5000);
        }
      }
    }
  },
  methods: {
    async getData(isClear = true) {
      let $this = this;
      try {
        $this.loading = true;
        let ret = await $this.$ajax({
          type: 'get',
          url: "api/heat/v1/" + $this.$cookie.get("pid") + "/stacks"
        });
        let dataList = ret.stacks;
        dataList = dataList.filter(item => {
          let queryName = '';
          if ($this.searchBar.validatedParams.name) {
            queryName = $this.searchBar.validatedParams.name.toLowerCase();
          }
          return item.stack_name.toLowerCase().includes(queryName);
        });
        dataList = dataList.filter(item => {
          if ($this.roleType === '0') {
            if ($this.searchBar.validatedParams.project_id) {
              return item.project === $this.searchBar.validatedParams.project_id;
            }
          } else {
            if (item.project) {
              return item.project === $this.$cookie.get('pid');
            }
          }
          return true;
        });
        dataList = dataList.filter(item => {
          let queryStatus = '';
          if ($this.searchBar.validatedParams.status) {
            queryStatus = $this.searchBar.validatedParams.status;
          }
          if (queryStatus !== '') {
            return item.stack_status === queryStatus;
          }
          return true;
        });
        $this.totalData = dataList;
        $this.total = dataList.length;
        $this.loading = false;
      } catch (data) {
        $this.loading = false;
      }
      if (isClear) {
        // 是否清空选中
        $this.$nextTick(() => {
          $this.$refs.table.clearSelection();
        });
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    async deleteStack(rowData) {
      try {
        let ret = await this.$sequence({
          type: 'DELETE',
          url: "api/heat/v1/" + this.$cookie.get("pid") + "/stacks/{stack_name}/{id}",
          params: rowData,
          paramKeys: ["stack_name", "id"],
          successMsg: this.$t('heat.startDelete'),
          log:{
            description:{
              en:"Delete heat stack:{stack_name}",
              zh_cn:"删除编排实例:{stack_name}"
            },
            target:Vue.logTarget.heatInstance
          },
          successFun: () => {
            setTimeout(() => { this.getData(); }, 1000);
          }
        })
      } catch (data) {
        console.log('删除失败');
      }
    },
    async suspendStack(selectedRows) {
      try {
        let suspendData = { "suspend": null }
        let ret = await this.$sequence({
          type: 'POST',
          url: "api/heat/v1/" + this.$cookie.get("pid") + "/stacks/{stack_name}/{id}/actions",
          params: selectedRows,
          paramKeys: ["stack_name", "id"],
          data: JSON.stringify(suspendData),
          successMsg: this.$t('heat.startSuspend'),
          log:{
            description:{
              en:"Suspend heat stack:{stack_name}",
              zh_cn:"挂起编排实例:{stack_name}"
            },
            target:Vue.logTarget.heatInstance
          },
          successFun: () => {
            setTimeout(() => { this.getData(true); }, 1000);
          }
        });
      } catch (data) {
        console.log('挂起失败');
      }
    },
    async resumeStack(selectedRows) {
      try {
        let resumeData = { "resume": null }
        let ret = await this.$sequence({
          type: 'POST',
          url: "api/heat/v1/" + this.$cookie.get("pid") + "/stacks/{stack_name}/{id}/actions",
          params: selectedRows,
          paramKeys: ["stack_name", "id"],
          data: JSON.stringify(resumeData),
          successMsg: this.$t('heat.startRecover'),
          log:{
            description:{
              en:"Resume heat stack:{stack_name}",
              zh_cn:"恢复编排实例:{stack_name}"
            },
            target:Vue.logTarget.heatInstance
          },
          successFun: () => {
            setTimeout(() => { this.getData(true); }, 1000);
          }
        });
      } catch (data) {
        console.log('恢复失败');
      }
    },
    //多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //排序
    sortChange(column) {
      var self = this;
      self.sortObj.sortOrder = column.order;
      self.sortObj.sortField = column.prop;
    },
    rowClick(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    //刷新
    onRefresh() {
      this.getData(true);
    },
    orchestrationNameRender(rowIndex, rowData) {
      this.$router.push({
        path: "/service-orchestration/orchestrationList/orchestrationDetail/" + rowData.stack_name + "/" + rowData.id,
        params: {
          name: rowData.stack_name
        }
      });
    },
    async getProjectList() {
      try {
        let url = 'api/keystone/v3/users/' + Vue.userId + '/projects?domain_id=default';
        if (Vue.roleType == '0') {
          url = 'api/keystone/v3/projects?domain_id=default';
        }
        let result = await this.$ajax({
          type: "GET",
          url: url
        });
        let projectList = result["projects"];
        this.projectOption = projectList;
        this.searchBar.conditions.project_id.options = projectList.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (res) {
        console.log("获取项目列表失败");
      }
    },
    getProjectNameById(row) {
      let projectId = this.$cookie.get("pid")
      if (roleType == 0) {
        projectId = row["project"];
      }
      for (let i = 0; i < this.projectOption.length; i++) {
        if (projectId == this.projectOption[i].id) {
          return this.projectOption[i].name
        }
      }
    },
    statusTagRender(value) {
        let tagType = "";
        if (value === "CREATE_COMPLETE" || value === "CHECK_COMPLETE" ||
          value === "ADOPT_COMPLETE" || value === "DELETE_COMPLETE" || value === "INIT_COMPLETE" ||
          value === "RESUME_COMPLETE" || value === "ROLLBACK_COMPLETE" || value === "SUSPEND_COMPLETE" || value === "UPDATE_COMPLETE" || value === "SNAPSHOT_COMPLETE") {
          tagType = "success";
        } else if (value === "CREATE_IN_PROGRESS" || value === "DELETE_IN_PROGRESS" ||
          value === "CHECK_IN_PROGRESS" || value === "ADOPT_IN_PROGRESS" ||
          value === "DELETE_IN_PROGRESS" || value === "INIT_IN_PROGRESS" || value === "RESUME_IN_PROGRESS" ||
          value === "ROLLBACK_IN_PROGRESS" || value === "SUSPEND_IN_PROGRESS" || value === "UPDATE_IN_PROGRESS" || value === "SNAPSHOT_IN_PROGRESS") {
          tagType = "info";
        } else if (value === "CREATE_FAILED" || value === "DELETE_FAILED" ||
          value === "CHECK_FAILED" || value === "ADOPT_FAILED" || value === "DELETE_FAILED" ||
          value === "INIT_FAILED" || value === "RESUME_FAILED" || value === "ROLLBACK_FAILED" ||
          value === "SUSPEND_FAILED" || value === "UPDATE_FAILED" || value === "SNAPSHOT_FAILED") {
          tagType = "danger";
        }
        return tagType;
    },
    handleSearch(params) {
      const $this = this;
      this.searchBar.validatedParams = params;
      $this.getData(true);
      $this.$refs.pageComponent.setCurrentPage(1);
      $this.$refs.table.clearSelection();
    }
  }
};

</script>
