<template>
  <div>
    <div v-show="netmainVisable">
      <icos-page-header :title="$t('network.router')" />
      <icos-page>
        <div>
          <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
          <div class="divider clearfix"></div>
          <div class="operation-panel margin-tb5">
            <operation-panel
              :select-rows="multipleSelection"
              :operation-menus="operationMenus">
            </operation-panel>
          </div>
          <div class="divider clearfix"></div>
          <el-table
            ref="routerTable"
            :data="routerTableData"
            highlight-current-row
            stripe
            border
            v-loading="loading"
            :element-loading-text="$t('lang.loading')"
            style="width: 100%"
            row-key="id"
            :default-sort="{prop: 'name'}"
            @row-click="rowClick"
            @selection-change="handleSelectionChange" @sort-change="sortChange">
            <el-table-column
              reserve-selection
              type="selection" width="55" align="center">
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('name') >= 0"
              :label="$t('lang.name')"
              prop="name" sortable="custom"
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
              v-if="columnsChecked.indexOf('zone') >= 0"
              :label="$t('network.domainuse')"
              prop="availability_zones"
              min-width="100">
              <template slot-scope="scope">
                <span>{{(scope.row['availability_zones'] && scope.row['availability_zones'].length != 0) ? scope.row['availability_zones'].join(",") : "-"}}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('status') >= 0"
              prop="status"
              :label="$t('lang.status')"
              min-width="50">
              <template slot-scope="scope">
                <el-tag :type="statusTagRender(scope.row.status)">
                  <span v-html="statusRender(scope.row)"></span>
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('external_gateway_info') >= 0"
              prop="external_gateway_info"
              :label="$t('network.externalNet')"
              min-width="100">
              <template slot-scope="scope">
                <span v-html="externalNetRender(scope.row.external_gateway_info, scope.row)"></span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('admin_state_up') >= 0"
              prop="admin_state_up"
              :label="$t('network.manageStatus')"
              min-width="50">
              <template slot-scope="scope">
                <span v-html="manageStatusRender(scope.row.admin_state_up)"></span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('description') >= 0"
              prop="description"
              :label="$t('lang.desc')"
              min-width="50">
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
                <page :totalData="totalData" @getCurrentData="getCurrentData"  :sortObj="sortObj" :objStorFlag="pageCount"></page>
              </el-col>
            </el-row>
          </div>
        </div>
      </icos-page>
    </div>
    <div v-show="netdetailVisable">
      <icos-page-header :title="$t('network.routerdetail')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
      <router-detail ref="routerdetailId"></router-detail>
    </div>
    <add-router ref="addRouter" v-if="addFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow"></add-router>
    <edit-router @handleShow="handleShow" ref="EditRouter" v-if="editFlag" :editname="editname" :editdesc="editdesc" :editrouterid="editrouterid" :editadminstateup="editadminstateup" @handleCancelShow="handleCancelShow"></edit-router>
    <add-gateway @handleAddGatewayShow="handleAddGatewayShow" @handleCancelShow="handleCancelShow" ref="gateway" v-if="setgateFlag" :editname="editname" :editExternalgateway="editExternalgateway" :editrouterid="editrouterid" :editprojectid="editprojectid"></add-gateway>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import routerOperation from './routerOperation';
import AddRouter from './AddRouter'
import EditRouter from './EditRouter';
import AddGateway from './AddGateway';
import RouterDetail from './RouterDetail';
import {onlyLetterNumberChinese} from '../validator/validator';
export default {
  name: "routerNet",
  components: {
      AddRouter, EditRouter, AddGateway, RouterDetail
  },
  data () {
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
          },
          query_status: {
            label: this.$t('lang.status'),
            type: 'select',
            options: [{
              label: this.$t('lang.ACTIVE'),
              value: 'ACTIVE'
            }, {
              label: this.$t('lang.DOWN'),
              value: 'DOWN'
            }, {
              label: this.$t('lang.BUILD'),
              value: 'BUILD'
            }, {
              label: this.$t('lang.ERROR'),
              value: 'ERROR'
            }]
          },
          query_managestatus: {
            label: this.$t('network.manageStatus'),
            type: 'select',
            options: [{
              label: "UP",
              value: 'true'
            }, {
              label: "DOWN",
              value: 'false'
            }]
          }
        }
      },
      searchBarValidatedParams: {},
      loading: false,
      addFlag: false,
      editFlag: false,
      setgateFlag: false,
      netmainVisable: true,
      netdetailVisable: false,
      pageCount:true,
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      query_name: "",
      query_porject: "",
      projectName:"",
      selProjectFlg:false,
      close: "",
      query_managestatus: "",
      query_status: "",
      projectOption: [],
      networkOption: [],
      roleType: Vue.roleType + "",
      routerId: "",
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "project_id",
        label: Vue.t('lang.project')
      }, {
        prop: "zone",
        label: Vue.t('network.domainuse')
      }, {
        prop: "status",
        label: Vue.t('lang.status')
      }, {
        prop: "external_gateway_info",
        label: Vue.t('network.externalNet')
      }, {
        prop: "admin_state_up",
        label: Vue.t('network.manageStatus')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }],
      columnsChecked: ['name', 'description', 'project_id', 'zone', 'status', 'external_gateway_info', 'admin_state_up'],
      routerTableData: [],
      totalData: [],
      multipleSelection: [],
      operationMenus: routerOperation.bind(this)(),
      editname: "",
      editdesc: "",
      editrouterid: "",
      editprojectid: "",
      editadminstateup: true,
      editExternalgateway: ""
    }
  },
  watch: {
    columnsChecked: {
      handler: function (rows, oldVal) {
        this.columnsChecked = rows;
      },
      deep: true
    },
    '$route'(to, from) {
      this.netmainVisable = true;
      this.netdetailVisable = false;
      this.pageCount = true;
      this.onIconClick();
      this.getProjectList();
      this.getNetworkList();
      this.projectOption = Vue.projectListforNet;
      this.networkOption = Vue.networkList;
      this.getData();
    }
  },
  computed: {
    ...mapGetters({
      routers: 'getRouters'
    })
  },
  mounted() {
    this.netmainVisable = true;
    this.netdetailVisable = false;
    this.onIconClick();
    this.getProjectList();
    this.getNetworkList();
    this.projectOption = Vue.projectListforNet;
    this.networkOption = Vue.networkList;
    this.getData();
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
      let status = self.searchBarValidatedParams.query_status || "";
      let adminstatusup = self.searchBarValidatedParams.query_managestatus || "";
      this.loading = true;
      let data = [];
      if (this.roleType != '0') {
        projectid = Vue.cookie.get('pid');
      }
      try {
        let p = {};
        if (projectid != null && projectid != "") {
          p.project_id = projectid;
        }
        if (status != null && status != "") {
          p.status = status;
        }
        if (adminstatusup != null && adminstatusup != "") {
          p.admin_state_up = adminstatusup;
        }
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/routers?" + $.param(p),
          complete: function(XMLHttpRequest, textStatus) {
            self.loading = false;
          },
          errorKey: "NeutronError"
        });
        let nets = result['routers'];
        self.$refs.routerTable.clearSelection();
        self.totalData = [];
        if (name === "") {
          self.totalData = nets;
        } else {
          for (let i = nets.length - 1; i >= 0; i--) {
            if (nets[i].name.indexOf(name) >= 0) {
              self.totalData.push(nets[i]);
            }
          }
        }
      } catch (res) {
        self.loading = false;
      }
    },
    getCurrentData(param) {
      this.routerTableData = param;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    queryClick() {
      var self = this;
      self.getData();
    },
    async getProjectDetail(projectId) {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects/"+projectId,
          showErrMsg: false
        });
        let ret = result["project"];
        Vue.projectListforNet.push(ret);
        this.projectOption = Vue.projectListforNet;
      } catch (res) {
        console.log("获取项目失败");
      }
    },
    async getProjectList() {
      Vue.projectListforNet = [];
      this.projectOption = [];
      if (this.roleType != '0') {
        this.getProjectDetail(Vue.cookie.get('pid'));
        return;
      }
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
    async getNetworkList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/networks"
        });
        Vue.networkList = result["networks"];
        this.networkOption = result["networks"];
      } catch (res) {
      }
    },
    externalNetRender(value, row) {
      let netname = "";
      let gateway = value;
      if (gateway!="" && gateway != null) {
        for (let i = this.networkOption.length - 1; i >= 0; i--) {
          let network = this.networkOption[i];
          if (network.id === gateway.network_id) {
            netname = network.name;
          }
        }
      }
      return netname;
    },
    manageStatusRender(value, row) {
      if (value == true) {
        return "UP";
      } else {
        return "DOWN";
      }
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
    statusRender(row) {
      if (row["status"]==="ACTIVE") {
        return this.$t('lang.ACTIVE')
      } else if (row["status"]==="DOWN") {
        return this.$t('lang.DOWN')
      } else if (row["status"]==="BUILD") {
        return this.$t('lang.BUILD')
      } else if (row["status"]==="ERROR") {
        return this.$t('lang.ERROR')
      }
    },
    statusTagRender(status) {
      if (status==="ACTIVE") {
        return "success";
      } else if (status==="DOWN") {
        return "gray";
      } else if (status==="BUILD") {
        return "info";
      } else if (status==="ERROR") {
        return "danger";
      }
    },
    handleAddShow() {
      this.addFlag = false;
      this.getData();
    },
    handleShow() {
      this.editFlag = false;
      this.getData();
    },
    handleCancelShow() {
      this.editFlag = false;
      this.addFlag = false;
      this.setgateFlag = false;
    },
    handleAddGatewayShow() {
      this.setgateFlag = false;
      this.getData();
    },
    showDetail(row) {
      this.netdetailVisable = true;
      this.netmainVisable = false;
      this.routerId = row["id"];
      let routerId = row["id"];
      let checkproject = "true";
      if (this.roleType!="0") {
        if (row["project_id"] == Vue.cookie.get('pid')) {
          checkproject = "true";
        } else {
          checkproject = "false";
        }
      } else {
        checkproject = "true";
      }
      this.$refs.routerdetailId.initRouterDetail(routerId, checkproject, row["name"]);
      this.$refs.routerTable.toggleRowSelection(row);
      // this.$router.push({
      //   path: '/net/router-detail',
      //   query: {routerId: row["id"]}
      // });
    },
    rowClick(row) {
      this.$refs.routerTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.routerTable.toggleRowSelection(row, false);
      // })
      this.multipleSelection = val;
    },
    onRefresh() {
      this.getData();
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
    },
    handlePageHeaderBack() {
      this.netdetailVisable = false;
      this.netmainVisable = true;
    }
  }
}
</script>
