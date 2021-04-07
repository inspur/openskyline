<template>
  <div>
  <icos-page-header :title="$t('opt.processManagement')" :show-bottom-border="true" v-if="!addFlag"/>
    <icos-page v-if="!addFlag">
    <!-- <el-form :inline="true" :model="formInline" class="form-inline" :rules="rules">
      <el-form-item :label="$t('opt.name')" prop="name">
        <el-input v-model="formInline.name"></el-input>aaa
      </el-form-item>
      <el-form-item :label="$t('opt.project')" v-show="isAdmin()">
        <el-input auto-complete="off" style="width:160px;" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="formInline.projectName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' @click="loadData" size="small">{{$t('opt.doQuery')}}</el-button>
      </el-form-item>
    </el-form> -->
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="advancedDisabled" @search="searchHandle"/>
    <div class="divider clearfix"></div>
    <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
    </operation-panel>
    <el-table
      ref="shTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('opt.dataLoading')"
      highlight-current-row
      border
      stripe
      style="width: 100%;"
      row-key="id"
      :default-sort="{prop:'name', order:'ascending'}"
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
        :label="$t('opt.name')"
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="(columnsChecked.indexOf('project') >= 0) && roleType == '0'"
        prop="project"
        :label="$t('opt.project')"
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="projectRender(scope.row.project, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('resource_type') >= 0"
        prop="resource_type"
        :label="$t('opt.resourceType')"
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('sta') >= 0"
        prop="sta"
        align="left"
        :label="$t('opt.status')"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.sta)">
            <span v-html="statusRender(scope.row.sta, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('property') >= 0"
        prop="property"
        align="left"
        :label="$t('opt.property')"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="propertyRender(scope.row.property, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('desc') >= 0"
        prop="desc"
        align="left"
        :label="$t('opt.description')"
        min-width="100">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('opt.currentSelected')}}{{multipleSelection.length}}{{$t('opt.item')}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('opt.selectColumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData"  @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
      <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
      <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix" >
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('opt.backTo')}}</el-button>
            </div>
            <div style="text-align:left">
              <process-detail ref="ProcessDetail" :ProcessId="ProcessId" :projectMaps="projectMaps"></process-detail>
            </div>
          </panel>
        </div>
      </transition>
    </div>
  </icos-page>
  <process-add ref="ProcessAdd" v-if="addFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow"></process-add>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import ProcessAdd from './ProcessAdd';
import ProcessDetail from './ProcessDetail';
export default {
  name: "Process",
  components: {
    ProcessAdd,
    ProcessDetail
  },
  data() {
    return {
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      // formInline: {
      //   name:"",
      //   query_project: '',
      //   projectName: "",
      //   uuid:''
      // },
      selProjectFlg: false,
      close: "",
      multipleSelection: [],
      rules: {
        name: [
          { type: 'maxSize', value: 40 }
        ]
      },
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('opt.customizeProcess'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          let parentPath = this.$route.matched[1].path;
          // this.$router.push({
          //   path: '/operations/flow-manage/process-add'
          // });
          this.addFlag = true;
        }.bind(this)
      }, {
        icon: "fa-pencil",
        name: Vue.t('opt.modify'),
        showflg: true,
        multi: false,
        enable(rowData) {
          if (Vue.roleType == "0") {
            return (rowData['sta'] == 0);
          } else {
            return (rowData['sta'] == 0) && rowData['property'] != 0;
          }
        },
        handler: function(selectRows) {
          this.detailFlag = false;
          let parentPath = this.$route.matched[1].path;
          this.$router.push({
            path: '/operations/process-modify/' + selectRows[0].id
          });
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('opt.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          if (Vue.roleType == "0") {
            return (rowData['sta'] == 0) || rowData['sta'] == 2;
          } else {
            return (rowData['sta'] == 0 || rowData['sta'] == 2) && rowData['property'] != 0;
          }
        },
        handler: function(selectRows) {
        let self = this;
        this.detailFlag = false;
        let r = self.creatorRole;
        let reqdata = {
          "role": r
        };
        reqdata = JSON.stringify(reqdata);
        self.$prompt(self.$t('opt.enterYesContinuedOperation'), self.$t('opt.deleteConfirm'), {
            confirmButtonText: self.$t('opt.confirm'),
            cancelButtonText: self.$t('opt.cancel'),
            inputPattern:/^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage:self.$t('opt.onlyAcceptYesOrNo')
        }).then(async({ value }) => {
          if ("yes" == value.toLowerCase()) {
            self.$sequence({
              type: 'delete',
              url: 'api/leo/v1/flow/delete_flow/{id}',
              data: reqdata,
              params: selectRows,
              success: function(result) {
                self.$message.success(Vue.t('opt.deleteProcessSuccess'));
                self.$refs.shTable.clearSelection();
              },
              log:{
                description:{
                  en:"delete process",
                  zh_cn:self.$t('opt.deleteProcess')
                },
                key: "name",
                target:Vue.logTarget.process_manage
              },
              errFun:function() {
                self.$refs.shTable.clearSelection();
                setTimeout( function() {
                  self.loadData({
                    page: 1
                  });
                  self.loading = false;
                }, 5000);
              }
            }).then((data) => {
              self.loading = true;
              self.$refs.shTable.clearSelection();
              self.currentPage = 1;
              setTimeout( function() {
                self.loadData({
                  page: 1
                });
                self.loading = false;
              }, 5000);
            }).catch((err) => {});
          }
        }).catch(() => {
          //取消
        });
      }.bind(this)
      }, {
        icon: "fa-play",
        name: Vue.t('opt.available'),
        showflg: true,
        multi: true,
        enable(rowData) {
          if (Vue.roleType == "0") {
            return (rowData['sta'] == 0);
          } else {
            return (rowData['sta'] == 0) && rowData['property'] != 0;
          }
        },
        handler: async function(selectRows) {
          let self = this;
          this.detailFlag = false;
          let r = self.creatorRole;
          let reqdata = {
            "role": r
          };
          reqdata = JSON.stringify(reqdata);
          self.$sequence({
            type: "put",
            url: "api/leo/v1/flow/enable_flow/{id}",
            data: reqdata,
            params: selectRows,
            confirmMsg: Vue.t('opt.confirmAvailable'),
            success: function(result) {
              self.$message.success(Vue.t('opt.enableProcessSuccess'));
              self.$refs.shTable.clearSelection();
            },
            log:{
              description:{
                en:"available process",
                zh_cn:self.$t('opt.enableProcess')
              },
              key: "name",
              target:Vue.logTarget.process_manage
            },
            errFun:function() {
              self.$refs.shTable.clearSelection();
              setTimeout( function() {
                self.loadData({
                  page: 1
                });
                self.loading = false;
              }, 5000);
            }
          }).then((data) => {
          self.loading = true;
          self.$refs.shTable.clearSelection();
          self.currentPage = 1;
          setTimeout( function() {
            self.loadData({
              page: 1
            });
            self.loading = false;
          }, 5000);
        }).catch((err) => {
        });
      }.bind(this)
      }, {
        icon: "fa-stop",
        name: Vue.t('opt.disable'),
        showflg: true,
        multi: false,
        enable: function(rowData) {
          if (Vue.roleType == "0") {
            return (rowData['sta'] == 1);
          } else {
            return (rowData['sta'] == 1) && rowData['property'] != 0;
          }
        }.bind(this),
        handler: function(selectRows) {
          let self = this;
          this.detailFlag = false;
          let u = selectRows[0].id;
          let r = self.creatorRole;
          let uname = selectRows[0].name;
          let reqdata = {
            "flow_id": u,
            "role": r
          };
          self.$sequence({
            type: "put",
            url: "api/leo/v1/flow/disable_flow",
            data: JSON.stringify(reqdata),
            params: selectRows,
            confirmMsg: Vue.t('opt.confirmDisable'),
            success: function(result) {
              self.$message.success(Vue.t('opt.disableProcessSuccess'));
              self.$refs.shTable.clearSelection();
            },
            log:{
              description:{
                en:"disable process:"+uname,
                zh_cn:self.$t('opt.disableProcess')+uname
              },
              target:Vue.logTarget.process_manage
            },
            errFun:function() {
              self.$refs.shTable.clearSelection();
              setTimeout( function() {
                self.loadData({
                  page: 1
                });
                self.loading = false;
              }, 5000);
            }
          }).then((data) => {
            self.loading = true;
            self.$refs.shTable.clearSelection();
            self.currentPage = 1;
            setTimeout( function() {
              self.loadData({
                page: 1
              });
              self.loading = false;
            }, 5000);
          }).catch((err) => {
          });
        }.bind(this)
      }],
      tableData: [],
      totalData:[],
      projectOption: [],
      listPara: {
        page: 1,
        pageSize: 10
      },
      loading: false,
      columnsChecked: ["name", "project", "resource_type", "sta", "property", "desc"],
      columns: [{
        prop: "name",
        label: Vue.t('opt.name')
      }, {
        prop: "project",
        label: Vue.t('opt.project')
      }, {
        prop: "resource_type",
        label: Vue.t('opt.resourceType')
      }, {
        prop: "sta",
        label: Vue.t('opt.status')
      }, {
        prop: "property",
        label: Vue.t('opt.property')
      }, {
        prop: "desc",
        label: Vue.t('opt.description')
      }],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 50, 200],
      total: 0,
      detailFlag: false,
      addFlag: false,
      projectMaps: new Map(),
      roleType: Vue.roleType + "",
      ProcessId: '',
      creatorRole: Vue.roleType,
      searchBar: {
        conditions: {
          name: {
            label: this.$t('opt.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
              // if (value.length > 40) {
              //   throw new Error(this.$t('heat.fortyCharacterMaximum'));
              // }
            }
          },
          projectName: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          }
        }
      },
      searchBarValidatedParams: {}
    }
  },
  computed: {
    advancedDisabled() {
      return Object.values(this.searchBar.conditions).filter(v => v.visible !== false).length < 2;
    }
  },
  mounted() {
    let self = this;
    let roleType = Vue.roleType + "";
    if ("0" == roleType || "2" == roleType) {
      Promise.all([self.getProjectList()]).then(function(result) {
        self.loadData();
      });
    }
  },
  methods: {
    async loadData() {
      let self = this;
      if (self.$refs.shTable) {
        self.$refs.shTable.clearSelection();
      }
      console.log(21222)
      let queryProject = '';
      let queryName = self.searchBarValidatedParams.name || "";
      if (Vue.roleType == '0') {
        queryProject = self.searchBarValidatedParams.projectName || "";
      } else {
        queryProject = self.$cookie.get("pid");
      }
      let body = {
        "project_id": "",
        "name": "",
        "order_by": "",
        "desc": ""
      };
      if (queryName == "") {
      } else {
        body.name = queryName;
      }
      if (queryProject == "") {
      } else {
        body.project_id = queryProject;
      }
      body = JSON.stringify(body);
      try {
        self.loading = true;
        let result = await self.$ajax({
          type: 'PUT',
          data: body,
          url: "api/leo/v1/flow/get_flowlist"
        });
        self.loading = false;
        self.totalData = [];
        for (let i=0; i<result.data.length; i++) {
          let obj = {
            project: "",
            resource_type: "",
            desc: "",
            sta: "",
            property: "",
            name: ""
          };
          obj.id = result.data[i].flow_id;
          obj.property = result.data[i].creator_role;
          obj.desc = result.data[i].op_desc;
          obj.sta = result.data[i].state;
          obj.name = result.data[i].name;
          let resources = result.data[i].resource;
          if (Vue.roleType == '0') {
            for (let j=0; j<result.data[i].project.length; j++) {
              if (j == result.data[i].project.length - 1) {
                obj.project += result.data[i].project[j];
              } else {
                obj.project += result.data[i].project[j] + ",";
              }
            }
          } else {
            obj.project = result.data[i].project;
          }
          for (let k=0; k<resources.length; k++) {
            if (k == resources.length - 1) {
              if (resources[k] == 'VM') {
                resources[k] = self.$t('opt.cloudHost');
              } else if (resources[k] == 'VOLUME') {
                resources[k] = self.$t('opt.cloudHardDisk');
              } else if (resources[k] == 'HOST') {
                resources[k] = self.$t('opt.cloudPhysicalHost');
              }
              obj.resource_type += resources[k];
            } else {
              if (resources[k] == 'VM') {
                resources[k] = self.$t('opt.cloudHost');
              } else if (resources[k] == 'VOLUME') {
                resources[k] = self.$t('opt.cloudHardDisk');
              } else if (resources[k] == 'HOST') {
                resources[k] = self.$t('opt.cloudPhysicalHost');
              }
              obj.resource_type += resources[k] + ",";
            }
          }
          self.totalData.push(obj);
        }
        self.tableData = self.filterList(self.totalData, queryName, queryProject);
        self.loading = false;
      } catch (res) {
        self.loading = false;
        console.log(self.$t('opt.getProcessListFailed'));
      }
    },
    searchHandle(params) {
      this.searchBarValidatedParams = params;
      this.loadData();
    },
    async getProjectList() {
      let self = this;
      let roleType = Vue.roleType + "";
      let url = "api/keystone/v3/projects?domain_id=default";
      if ("2" == roleType || "3" == roleType) {
        url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
      }
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        self.loading = false;
        let allProjects = result['projects'];
        if ("2" == roleType || "3" == roleType) {
          self.projectOption.push(allProjects);
          self.projectMaps.set(allProjects.id, rallProjects.name);
        } else {
          for (let q = 0; q < allProjects.length; q++) {
            self.projectMaps.set(allProjects[q].id, allProjects[q].name);
            self.projectMaps.set("all", self.$t('opt.all'));
          }
          self.projectOption.push({"name":"", "id":""});
          self.projectOption = self.projectOption.concat(allProjects);
        }
        self.loading = false;
        self.searchBar.conditions.projectName.options = result.projects.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (res) {
        console.log(self.$t('opt.getProjectListFailed'));
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
    filterList(allData, name, projectId) {
      let nameFilteredData = [];
      if (name == '') {
        nameFilteredData = allData;
      } else {
        allData.forEach(function(obj) {
          if (obj.name.indexOf(name) > -1) {
            nameFilteredData.push(obj);
          }
        });
      }
      let projectFilteredData = [];
      if (projectId == '') {
        projectFilteredData = nameFilteredData;
      } else {
        nameFilteredData.forEach(function(obj) {
          if (obj.project.indexOf(projectId) > -1) {
            projectFilteredData.push(obj);
          }
        });
      }
      return projectFilteredData;
    },
    statusTagRender(status) {
      if ("1" == status) {
         return "success";
      } else if ("0" == status) {
         return "gray";
      } else {
        return "";
      }
    },
    statusRender(value, rowData) {
      if (value == "1") {
        return this.$t('opt.available');
      } else if (value == "0") {
        return this.$t('opt.disable');
      } else if (value == "2") {
        return this.$t('opt.error');
      } else {
        return "-";
      }
    },
    propertyRender(value, rowData) {
      if (value == 0) {
        return this.$t('opt.publicProcess');
      } else if (value == 2) {
        return this.$t('opt.projectProcess');
      } else {
        return "-";
      }
    },
    projectRender(value, rowData) {
      let self = this;
      let roleType = Vue.roleType + "";
      let projectIdss = rowData['project'];
      let result = "";
      if ("0" == roleType) {
        let projectIds = projectIdss.split(",");
        if (projectIds[0] != "") {
          for (let n = 0; n < projectIds.length; n++) {
            let projectId = projectIds[n];
            if (n == projectIds.length - 1) {
              result += self.projectMaps.get(projectId);
            } else {
              result += self.projectMaps.get(projectId) + ", ";
            }
          }
        } else {
          result = "-";
        }
      } else {
        for (let m = 0; m < projectIdss.length; m++) {
          let projectsId = projectIdss[m];
          result = self.projectMaps.get(projectsId);
        }
      }
      return result;
    },
    isAdmin() {
      let roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        return false;
      }
      return true;
    },
    handleAddShow() {
      this.addFlag = false;
      this.loadData();
      if (this.$refs.shTable) {
        this.$refs.shTable.clearSelection();
      }
    },
    handleCancelShow() {
      this.addFlag = false;
    },
    //刷新
    onRefresh() {
      this.loadData();
    },
    rowNameClick(rowIndex, rowData) {
      this.ProcessId = rowData['id'];
      this.detailFlag = true;
      this.$refs.shTable.clearSelection();
      this.$nextTick(() => {
        this.$refs.ProcessDetail.show();
      });
    },
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      this.loadData();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    //多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    sortChange(column) {
      let self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    onBack() {
      this.detailFlag = false;
    },
    // onIconClick() {
    //   this.formInline.query_project = '';
    //   this.formInline.projectName = '';
    //   this.close = '';
    // },
    // selectProject() {
    //   this.selProjectFlg = true;
    //   this.$nextTick(() => {
    //     this.$refs.selectProject.show();
    //   });
    // },
    // getSelProjects(id, name) {
    //   this.formInline.query_project = id;
    //   this.formInline.projectName = name;
    //   this.close = 'circle-close';
    // },
    handleCurrentChange(val) {
      this.listPara.page = val;
      this.loadData();
      this.currentRow=val;
    }
  }
}
</script>
