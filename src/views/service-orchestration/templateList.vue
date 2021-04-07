<template>
  <div>
    <icos-page-header :title="$t('heat.heatTemplate')" :show-bottom-border="true" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="roleType !== '0'" @search="handleSearch" />
      <operation-panel
        class="margin-tb5"
        :select-rows="multipleSelection"
        :operation-menus="operationMenus">
      </operation-panel>
      <el-table
        ref="table"
        :data="tableData"
        v-loading="loading"
        :element-loading-text="$t('lang.loading')"
        highlight-current-row
        stripe
        :default-sort = "{prop: 'created_at', order: 'ascending'}"
        row-key="id"
        @row-click="rowClick"
        @sort-change="sortChange"
        @selection-change="handleSelectionChange">
        <el-table-column
          reserve-selection
          type="selection"
          align="center"
          width="55">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('name') >= 0"
          prop="name"
          :label="$t('lang.name')"
          show-overflow-tooltip
          sortable="custom"
          min-width="100">
          <template slot-scope="scope">
            <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column
        v-if="columnsChecked.indexOf('tenant') >= 0"
        prop="tenant"
        :label="$t('lang.project')"
        show-overflow-tooltip
        min-width="100">
        <template slot-scope="scope">
            <span v-html="getProjectNameById(scope.row)"></span>
        </template>
      </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('created_at') >= 0"
          prop="created_at"
          :label="$t('lang.createTime')"
          show-overflow-tooltip
          align="left"
          sortable="custom"
          min-width="100">
          <template slot-scope="scope">
            <span>{{tzTimeFormatter(scope.row.created_at)}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('source') >= 0"
          :label="$t('heat.TEMPLATE_SOURCE')">
          <template slot-scope="scope">
            {{ scope.row.source | sourceFilter }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('description') >= 0"
          prop="description"
          :label="$t('lang.desc')"
          show-overflow-tooltip
          min-width="100">
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc('lang.item', multipleSelection.length)}}</span>
            <el-popover
              placement="right"
              trigger="click">
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

      <create-custom ref="createCustom" v-if="createCustomFlag" @handleAddShow="handleAddShow" @refreshData="getData"></create-custom>
      <create-template ref="createTemplate" v-if="createTemplateFlag" @handleAddShow="handleAddShow" @refreshData="getData"></create-template>
      <apply-template ref="applyTemplate" v-if="applyTemplateFlag" @handleAddShow="handleAddShow" :selectedRowData="multipleSelection[0]"></apply-template>
      <edit-template ref="editTemplate" v-if="editTemplateFlag" @refreshData="getData" :selectedRowData="multipleSelection[0]"></edit-template>

      <!-- <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix" >
            <el-button type="text" icon="fa-arrow-right" @click="onDetailPanelBack">返回</el-button>
            </div>
            <div>
              <template-detail ref="templateDetail" :selectedRowData="rowData"></template-detail>
            </div>
          </panel>
        </div>
      </transition> -->
    </icos-page>
  </div>
</template>
<script>
  import CreateTemplate from "./CreateBySystemTemplateGuide";
  import CreateCustom from "./CreateByCustomTemplateGuide";
  import applyTemplate from "./ApplyTemplate";
  import editTemplate from "./EditTemplate";
  // import templateDetail from "./TemplateDetail"
  export default {
    name: "TemplateList",
    components: {
      CreateCustom, CreateTemplate, applyTemplate, editTemplate
    },
    data() {
      return {
        close:"",
        roleType: String(Vue.roleType),
        projectOption:[],
        tzTimeFormatter:this.$tzTimeFormatter,
        columns: [],
        columnsChecked:['name', 'tenant', 'created_at', 'source', 'description'],
        tableData: [],
        totalData: [],
        multipleSelection: [],
        loading: false,
        selProjectFlg:false,
        createTemplateFlag:false,
        createCustomFlag:false,
        applyTemplateFlag:false,
        editTemplateFlag: false,
        operationMenus: [{
          icon: "fa-plus",
          name: Vue.t('heat.createSystemTemplate'),
          showflg: Vue.roleType != "0",
          readOnly: true,
          handler: function() {
            let me = this;
            me.createTemplateFlag = true;
          }.bind(this)
        }, {
          icon: "fa-plus",
          name: Vue.t('heat.createCustomTemplate'),
          showflg: Vue.roleType != "0",
          readOnly: true,
          handler: function() {
            let me = this;
            this.$router.push({
              path: '/service-orchestration/orchestrationTemplate/createCustomTemplate'
            });
          }.bind(this)
        }, {
          icon: "fa-plus",
          name:  Vue.t('heat.createCustom'),
          showflg: Vue.roleType != "0",
          readOnly: true,
          handler: function() {
            this.createCustomFlag = true;
          }.bind(this)
        }, {
          icon: "fa-check",
          name: Vue.t('heat.applyTemplate'),
          showflg: Vue.roleType != "0",
          readOnly: false,
          enable(rowData) {
            return true;
          },
          handler: function() {
            let me = this;
            me.applyTemplateFlag = true;
            me.$nextTick(() => {
              me.$refs.applyTemplate.show();
            });
          }.bind(this)
        }, {
          icon: "fa-edit",
          name: Vue.t('lang.modify'),
          showflg: Vue.roleType != "0",
          readOnly: false,
          enable(rowData) {
            return true;
          },
          handler: function(selectedRows) {
            let me = this;
            me.editTemplateFlag = true;
            me.$nextTick(() => {
              me.$refs.editTemplate.show();
            });
            /*this.$router.push({
              path:"/service-orchestration/orchestrationTemplate/editCustomTemplate/" + selectedRows[0].tenant + "/" + selectedRows[0].id
            });*/
          }.bind(this)
        }, {
          icon: "fa-remove",
          name: Vue.t('lang.delete'),
          showflg: Vue.roleType != "0",
          multi:true,
          readOnly: false,
          enable(rowData) {
            return true;
          },
          handler: function(selectedRows) {
            let me = this;
            me.$confirm(this.$t('heat.deleteConfirmMsg'), this.$t('heat.operateConfirm'), {
              confirmButtonText:this.$t('lang.confirm'),
              cancelButtonText:this.$t('lang.cancel'),
              type:'warning'
            }).then(() => {
              me.$sequence({
                type:'delete',
                url:"api/heat/v1/" + this.$cookie.get("pid") + "/template/{id}",
                params:selectedRows,
                // successMsg:"删除成功",
                log:{
                  description:{
                    en:"Delete heat template:{name}",
                    zh_cn:"删除编排模板:{name}"
                  },
                  target:Vue.logTarget.heatTemplate
                },
                successFun:() => {
                  me.$message.success(Vue.t("heat.deleteSuccessMsg"));
                }
              });
              setTimeout(() => { this.getData(); }, 500);
            }).catch(() => {
            });
          }.bind(this)
        }],
        sortObj: {
          sortOrder: '',
          sortField: ''
        },
        searchBar: {
          conditions: {
            name: {
              label: this.$t('lang.name'),
              type: 'input',
              validator: (value) => {
                if (!/^[0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                  throw new Error(this.$t('validation.onlyLetterNumberChinese'));
                }
              }
            },
            project_id: {
              label: this.$t('base.project'),
              visible: String(Vue.roleType) === '0',
              type: 'select',
              options: []
            }
          },
          validatedParams: {}
        }
      };
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
    methods: {
      async getData(isClear = true) {
        var self = this;
        self.loading = true;
        let isAdmin = false;
        if (String(Vue.roleType) === '0') {
          isAdmin = true;
        }
        let stackProjectId = this.$cookie.get("pid");
        //存在查询条件 不使用admin权限查看所有
        if (self.searchBar.validatedParams.project_id) {
          stackProjectId = self.searchBar.validatedParams.project_id;
          isAdmin = false;
        }

        let queryName = '';
        if (self.searchBar.validatedParams.name) {
          queryName = self.searchBar.validatedParams.name;
        }

        if (isClear) {
          // 是否清空选中
          self.$nextTick(() => {
            self.$refs.table.clearSelection();
          });
        }

        try {
          let response = await this.$ajax({
            type: 'post',
            url: "api/heat/v1/" + stackProjectId + "/template/get_stack_template",
            data:JSON.stringify({
              isAdmin: isAdmin,
              name: queryName
            })
          });
          self.loading = false;
          let dataList = response.templates.templates;

          self.totalData = dataList;
        } catch (data) {
          self.loading = false;
        }
      },
      getCurrentData(param) {
        this.tableData = param;
      },
      //多选
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
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
      rowNameClick(rowIndex, rowData) {
        // this.detailFlag = true;
        this.$router.push({
          path:"/service-orchestration/orchestrationTemplate/templateDetailIndex/" + rowData.tenant + "/" + rowData.id
        });
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
        this.close = 'close';
      },
      onIconClick() {
        this.formInline.query_project = '';
        this.formInline.projectName = '';
        this.close = '';
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
      let projectId = row["tenant"];
      for ( let i = 0; i < this.projectOption.length; i++) {
        if (projectId == this.projectOption[i].id) {
          return this.projectOption[i].name
        }
      }
    },
    filterList(allData, name, projectId) {
       let nameFilteredData = [];
        if (name === '') {
          nameFilteredData = allData;
        } else {
          allData.forEach(function(obj) {
            if (obj.name.indexOf(name) > -1) {
              nameFilteredData.push(obj);
            }
          });
        }
        let projectFilteredData = [];
        if (projectId === '') {
          projectFilteredData = nameFilteredData;
        } else {
          nameFilteredData.forEach(function(obj) {
            if (obj.tenant == projectId) {
              projectFilteredData.push(obj);
            }
          });
        }
        return projectFilteredData;
      },
      handleAddShow() {
        this.createTemplateFlag = false;
        this.applyTemplateFlag = false;
        this.createCustomFlag = false;
      },
      onSubmit() {
        if (this.formInline.name.length > 40) {
          this.$message.error(this.$t('heat.fortyCharacterMaximum'));
          return;
        }
        this.getData();
      },
      handleSearch(params) {
        const $this = this;
        this.searchBar.validatedParams = params;
        $this.getData(true);
        $this.$refs.pageComponent.setCurrentPage(1);
        $this.$refs.table.clearSelection();
      }
    },
    filters: {
      sourceFilter(value) {
        let source = value;
        switch (value) {
          case null:
            source = '-';
            break;
          case 0:
            source = Vue.t('heat.TEMPLATE_SOURCE_SYSTEM_TEMPLATE');
            break;
          case 1:
            source = Vue.t('heat.TEMPLATE_SOURCE_CUSTOM_TEMPLATE');
            break;
          case 2:
            source = Vue.t('heat.TEMPLATE_SOURCE_YAML_TEMPLATE');
            break;
        }
        return source;
      }
    }
  };
</script>
