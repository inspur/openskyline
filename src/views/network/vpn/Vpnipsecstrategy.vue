<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="roleType !== '0'" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel margin-tb5">
      <operation-panel
        :select-rows="multipleSelection"
        :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table
      ref="ipsecpolicy"
      :data="ipsecpolicyData"
      highlight-current-row
      stripe
      border
      style="width: 100%;"
      :default-sort="{prop: 'name'}"
      row-key="id" @sort-change="sortChange"
      v-loading="loading"
     :element-loading-text="$t('lang.loading')"
      @row-click="rowClick"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        width="55"
        align="center">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        :label="$t('lang.name')" sortable="custom"
        prop="name"
        min-width="100">
        <template slot-scope="scope">
          <el-button @click="showDetail(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
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
        v-if="columnsChecked.indexOf('auth_algorithm') >= 0"
        prop="auth_algorithm"
        :label="$t('network.authalgorithm')"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('encryption_algorithm') >= 0"
        prop="encryption_algorithm"
        :label="$t('network.encryptionalgorithm')"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('pfs') >= 0"
        prop="pfs"
        :label="$t('network.psf')"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('ipsec_site_connections') >= 0"
        prop="ipsec_site_connections"
        :label="$t('network.ipsecstation')"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="stationRender(scope.row.ipsec_site_connections)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('description') >= 0"
        prop="description"
        :label="$t('lang.desc')"
        min-width="100">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
          <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}</el-checkbox>
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
    <add-ipsec ref="addstrategy" v-if="addFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow"></add-ipsec>
    <edit-ipsec ref="editstrategy" v-if="editFlag" @handleEditShow="handleEditShow" @handleCancelShow="handleCancelShow" :editrow="editrow"></edit-ipsec>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    <transition name="slide-right" mode="out-in">
      <div style="width: 500px;" class="slide-panel" v-if="detailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
           <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
          </div>
          <div>
           <ipsec-detail :ipsecid="ipsecid" ref="subnetdetailId" @onBack="onBack" @onBackRefresh="onBackRefresh"></ipsec-detail>
          </div>
        </panel>
      </div>
    </transition>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import AddIpsec from './AddIpsecStrategy';
import EditIpsec from './EditIpsecStrategy';
import IpsecDetail from './IpsecDetail';
import {onlyLetterNumberChinese} from '../validator/validator';
export default {
  name: "VPNIpsecStrategy",
  components: {
    AddIpsec, EditIpsec, IpsecDetail
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
      addFlag: false,
      editFlag: false,
      detailFlag: false,
      loading: false,
      query_name: "",
      query_porject: "",
      projectName:"",
      selProjectFlg:false,
      close: "",
      projectOption: [],
      totalData: [],
      roleType: Vue.roleType + "",
      ipsecid: "",
      editrow: [],
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "project_id",
        label: Vue.t('lang.project')
      }, {
        prop: "auth_algorithm",
        label: Vue.t('network.authalgorithm')
      }, {
        prop: "encryption_algorithm",
        label: Vue.t('network.encryptionalgorithm')
      }, {
        prop: "pfs",
        label: Vue.t('network.psf')
      }, {
        prop: "ipsec_site_connections",
        label: Vue.t('network.ipsecstation')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }],
      columnsChecked: ['name', 'project_id', 'description', 'auth_algorithm', 'encryption_algorithm', 'ipsec_site_connections', 'pfs'],
      ipsecpolicyData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name:  Vue.t('network.create'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.addFlag = true;
          this.detailFlag = false;
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: Vue.t('network.modify'),
        showflg: true,
        multi: false,
        enable(rowData) {
          if (rowData["ipsec_site_connections"].length > 0 && rowData["ipsec_site_connections"]!=undefined) {
            return false;
          }
          return true;
        },
        handler: function(selectRows) {
          this.editrow = selectRows[0];
          this.editFlag = true;
          this.detailFlag = false;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('network.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          if (rowData["ipsec_site_connections"].length > 0 && rowData["ipsec_site_connections"]!=undefined) {
            return false;
          }
          return true;
        },
        handler: function(selectRows) {
          let self = this;
          self.detailFlag = false;
          self.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            closeOnClickModal: false,
            callback: (action, instance) => {
              if (action === "confirm") {
                self.$sequence({
                  type: 'delete',
                  url: 'api/neutron/v2.0/vpn/ipsecpolicies/{id}',
                  params: selectRows,
                  log:{
                    description:{
                      en:"Delete IPSec",
                      zh_cn:"删除IPSec策略"
                    },
                    key: "name",
                    target:Vue.logTarget.ipsecStrategy
                  }
                }).then((data) => {
                  self.$message(Vue.t('network.deleteSendSuccess'));
                  // self.$refs.ipsecpolicy.clearSelection();
                  self.getData();
                }).catch((err) => {
                  self.getData();
                });
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
    this.$parent.$parent.active = "VpnList";
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
  methods: {
    handleSearch(params) {
      let self = this;
      this.searchBarValidatedParams = params;
      self.getData();
    },
    async getData() {
      let self = this;
      let name = self.searchBarValidatedParams.query_name || "";
      let projectid = self.searchBarValidatedParams.query_porject || "";
      try {
        self.loading = true;
        self.totalData = [];
        let roleType = Vue.roleType + "";
        let queryStr="?";
        if (roleType == "0") {
          if (projectid != "") {
            queryStr += "project_id="+projectid;
          }
        } else {
          queryStr += "project_id="+Vue.cookie.get('pid');
        }
        if (queryStr === "?") {
          queryStr = "";
        }
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/vpn/ipsecpolicies"+queryStr,
          errorKey: "NeutronError"
        });
        let ipsecpolicies = result["ipsecpolicies"];
        self.$refs.ipsecpolicy.clearSelection();
        let resultData = [];
        for (let i = 0; i < ipsecpolicies.length; i++) {
          if (ipsecpolicies[i].name.indexOf(name) >= 0) {
            resultData.push(ipsecpolicies[i]);
          }
        }
        self.totalData = resultData;
        if (self.totalData.length > 0) {
          self.totalData.sort(this.$sortFormatter("name", "ascending"));
        }
        self.loading = false;
      } catch (res) {
      }
    },
    getCurrentData(param) {
      this.ipsecpolicyData = param;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    async getProjectList() {
      Vue.projectListforNet = [];
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default"
        });
        Vue.projectListforNet = result["projects"];
        this.projectOption = Vue.projectListforNet;
        this.searchBar.conditions.query_porject.options = result.projects.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (res) {
        console.log("获取项目列表失败");
      }
    },
    getProjectInUser() {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/keystone/v3/projects/"+Vue.cookie.get('pid'),
        showErrMsg: false,
        success: function(project) {
          Vue.projectListforNet.push(project["project"]);
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
    handleAddShow() {
      this.addFlag = false;
      this.getData();
    },
    handleEditShow() {
      this.editFlag = false;
      this.getData();
    },
    handleCancelShow() {
      this.addFlag = false;
      this.editFlag = false;
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.ipsecpolicy.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    onRefresh() {
      this.$refs.ipsecpolicy.clearSelection();
      this.getData();
    },
    queryClick() {
      let self = this;
      self.getData();
    },
    rowClick(row) {
      this.$refs.ipsecpolicy.toggleRowSelection(row);
    },
    showDetail(row) {
      this.detailFlag = true;
      this.ipsecid = row["id"];
      this.$nextTick(() => {
         this.$refs.subnetdetailId.initDetail();
      });
      this.$refs.ipsecpolicy.clearSelection();
    },
    onBack() {
      this.detailFlag = false;
    },
    onBackRefresh() {
      this.detailFlag = false;
      this.getData();
    },
    stationRender(stations) {
      let stationName = "";
      if (stations != undefined) {
        for (let i = 0; i < stations.length; i++) {
          if (i+1 === stations.length) {
            stationName += stations[i].name;
          } else {
            stationName += stations[i].name + ",  ";
          }
        }
      }
      return stationName;
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.query_porject = id;
      this.projectName = name;
      this.close = 'close';
    },
    onIconClick() {
      this.query_porject = '';
      this.projectName = '';
      this.close = '';
    }
  }
}
</script>
