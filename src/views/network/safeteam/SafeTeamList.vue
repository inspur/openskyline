<template>
<div>
  <div v-show="mainFlag">
    <icos-page-header :title="$t('network.securityTeam')" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="roleType !== '0'" @search="handleSearch" />
      <el-row>
        <el-col :span="24" class="margin-tb5">
          <span>{{$t('network.safeteamNote1')}}</span>
        </el-col>
      </el-row>
      <div class="operation-panel margin-tb5">
        <operation-panel
          :select-rows="multipleSelection"
          :operation-menus="operationMenus">
        </operation-panel>
      </div>
      <div class="divider clearfix"></div>
    <el-table
      ref="secgroupTable"
      :data="secgrouptableData"
      highlight-current-row
      stripe
      border
      style="width: 100%"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      row-key="id"
      :default-sort="{prop: 'name'}"
      @row-click="rowClick" @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        width="55" align="center">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        :label="$t('lang.name')"
        prop="name" sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <el-button @click="showDetail(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('project_id') >= 0"
        :label="$t('lang.project')"
        prop="project_id"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="projectToName(scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('description') >= 0"
        prop="description"
        :label="$t('lang.desc')"
        min-width="200">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
          <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('network.columnSelected')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" :objStorFlag="true"></page>
        </el-col>
      </el-row>
    </div>
    </icos-page>
    <add-safeteam ref="addSafeteam" v-if="addFlag" @handleAddShow="handleAddShow"></add-safeteam>
    <edit-safeteam ref="editSafeteam" v-if="editFlag" @handleEditShow="handleEditShow" :edit_name="edit_name" :edit_desc="edit_desc" :edit_id="edit_id"></edit-safeteam>
  </div>
  <div v-show="manageRuleFlag">
    <icos-page-header :title="$t('network.ruleManage')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
    <div class="network-detail">
      <manage-rulesafeteam ref="manageRule"></manage-rulesafeteam>
    </div>
  </div>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import AddSafeteam from './AddSafeteam';
import EditSafeteam from './EditSafeteam';
import ManageRulesafeteam from './ManageRule';
import {onlyLetterNumberChinese} from '../validator/validator';
export default {
  name: "Safeteam",
  components: {
    AddSafeteam, EditSafeteam, ManageRulesafeteam
  },
  data() {
    return {
      searchBar: {
        conditions: {
          query_name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: onlyLetterNumberChinese
          },
          query_porject: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          }
        }
      },
      searchBarValidatedParams: {},
      formInline: '',
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      loading: false,
      showBorder: true,
      addFlag: false,
      mainFlag: true,
      manageRuleFlag: false,
      editFlag: false,
      roleType: Vue.roleType + "",
      query_porject: [],
      query_name: "",
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "project_id",
        label: Vue.t('lang.project')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }],
      columnsChecked: ['name', 'description', 'project_id'],
      edit_name: "",
      edit_desc: "",
      edit_id: "",
      edit_projectid: "",
      secgrouptableData: [],
      totalData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.createSafeteam'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.addFlag = true;
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: Vue.t('lang.modify'),
        showflg: true,
        multi: false,
        enable(rowData) {
          if (rowData["name"] === "default") {
            return false;
          }
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          this.editFlag = true;
          var row = selectRows[0];
          self.edit_name = row["name"];
          self.edit_desc = row["description"];
          self.edit_id = row["id"];
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          if (rowData["name"] === "default") {
            return false;
          }
          return true;
        },
        handler: function(selectRows) {
          let self = this;
          self.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            closeOnClickModal: false,
            callback: (action, instance) => {
              if (action === "confirm") {
                self.loading = true;
                self.$refs.secgroupTable.clearSelection();
                for (let i = 0; i < selectRows.length; i++) {
                  let row = selectRows[i];
                  self.$ajax({
                    type: "DELETE",
                    url: "api/neutron/v2.0/security-groups/"+row["id"],
                    data: {},
                    success: function(result) {
                      self.$notify({
                        message: row["name"]+Vue.t('network.deleteSuccess'),
                        type: "success"
                      });
                    },
                    errorKey: "NeutronError",
                    log:{
                      description:{
                        en:"Delete Security Group:" + row["name"],
                        zh_cn:"删除安全组:" + row["name"]
                      },
                      target:Vue.logTarget.securityGroup
                    }
                  });
                }
                setTimeout( function() {
                  self.getData();
                  self.loading = false;
                }, 5000)
              }
            }
          });
        }.bind(this)
      }]
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
    this.getCallback();
  },
  methods: {
    handleSearch(params) {
      let self = this;
      this.searchBarValidatedParams = params;
      self.getData();
    },
    async getData() {
      let self = this;
      let projectId = self.searchBarValidatedParams.query_porject || "";
      let name = self.searchBarValidatedParams.query_name || "";
      try {
        let roleType = Vue.roleType + "";
        if (roleType == "0") {
        } else {
          projectId = Vue.cookie.get('pid');
        }
        self.loading = true;
        let url = "";
        if (projectId == "" || projectId == null) {
          url = "api/neutron/v2.0/security-groups";
        } else {
          url = "api/neutron/v2.0/security-groups?project_id=" + projectId;
        }
        let result = await self.$ajax({
          type: "GET",
          url: url,
          errorKey: "NeutronError"
        });
        let tempArr = result["security_groups"];
        self.totalData = [];
        for (let i =0; i< tempArr.length; i++) {
          let securityGroup = tempArr[i];
          if (securityGroup.name.indexOf(name) >=0) {
              self.totalData.push(securityGroup);
            }
        }
        self.loading = false;
        this.$refs.secgroupTable.clearSelection();
      } catch (res) {
        self.loading = false;
      }
    },
    getCurrentData(param) {
      this.secgrouptableData = param;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    getCallback() {
      let self = this;
      let roleType = Vue.roleType + "";
      if (roleType == "0") {
        Promise.all([self.getProjectList()]).then(function(result) {
          self.getData();
        });
      } else {
        Promise.all([self.getProjectInUser()]).then(function(result) {
          self.getData();
        });
      }
    },
    queryFunction() {
      var self = this;
      self.getData();
    },
    handleProjectChange(val) {
      var self = this;
      self.getData(val);
    },
    handleNameChange(val) {
      var self = this;
      self.getData();
    },
    onRefresh() {
      this.getData();
    },
    handleAddShow() {
      this.addFlag = false;
      this.getData();
    },
    handleEditShow() {
      this.editFlag = false;
      this.getData();
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.secgroupTable.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.secgroupTable.toggleRowSelection(row);
    },
    showDetail(index, row) {
      let self = this;
      this.edit_name = row["name"];
      this.edit_id = row["id"];
      this.edit_projectid = row["tenant_id"];
      this.mainFlag = false;
      this.manageRuleFlag = true;
      this.$refs.manageRule.getDetail(self.edit_id, self.edit_name, self.edit_projectid, self.secgrouptableData);
    },
    async getProjectList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default",
          errorKey: "NeutronError"
        });
        Vue.projectListforNet = result["projects"];
        this.query_porject = result["projects"];
        this.searchBar.conditions.query_porject.options = result.projects.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (res) {
      }
    },
    getProjectInUser() {
      let self = this;
      self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/security-groups?project_id="+Vue.cookie.get('pid'),
        errorKey: "NeutronError",
        success: function(result) {
          let securitygroups = result['security_groups'];
          for (let i = 0; i < securitygroups.length; i++) {
            let sg = securitygroups[i];
            self.$ajax({
              type: "GET",
              url: "api/keystone/v3/projects/"+sg["project_id"],
              showErrMsg: false,
              success: function(project) {
                Vue.projectListforNet.push(project["project"]);
              }
            });
          }
        }
      });
    },
    projectToName(row) {
      let proId = row["project_id"];
      let proList = Vue.projectListforNet;
      for (let i=0; i<proList.length; i++) {
        if (proId === proList[i]["id"]) {
          return proList[i]["name"];
        }
      }
    },
    handlePageHeaderBack() {
      this.manageRuleFlag = false;
      this.mainFlag = true;
    }
  }
}
</script>
<style type="text/css">
.network-detail {
  padding: 16px;
}
</style>

