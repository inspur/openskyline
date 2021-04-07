<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="roleType !== '0'" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel margin-tb5">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="vpnserver" :data="endpointGroupsData" highlight-current-row stripe border style="width: 100%" :default-sort="{prop: 'name'}" :element-loading-text="$t('lang.loading')" row-key="id" @sort-change="sortChange" @row-click="rowClick" @selection-change="handleSelectionChange">
      <el-table-column reserve-selection type="selection" width="55" align="center">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" sortable="custom" min-width="50">
        <template slot-scope="scope">
          <el-button @click="showDetail(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('project_id') >= 0" :label="$t('lang.project')" prop="project_id" min-width="50">
        <template slot-scope="scope">
          <span v-html="projectToName(scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('type') >= 0" prop="type" :label="$t('lang.type')" align="left" min-width="50">
        <!-- <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status)">
            <span v-html="statusRender(scope.row.status)"></span>
          </el-tag>
        </template> -->
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('endpoints') >= 0" prop="endpoints" :label="'Endpoints'" align="left" min-width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.type=='cidr'">{{scope.row.endpoints.join(",")}}</span>
          <span v-else v-html="subnetToName(scope.row.endpoints)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" :label="$t('lang.desc')" min-width="100">
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
    <add-endpoint-groups ref="addServer" v-if="addFlag" @handleAddShow="handleAddShow" @handlerCancelShow="handlerCancelShow"></add-endpoint-groups>
    <edit-endpoint-group ref="editServer" v-if="editFlag" @handleEditShow="handleEditShow" @handlerCancelShow="handlerCancelShow" :editrow="editrow"></edit-endpoint-group>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    <transition name="slide-right" mode="out-in">
      <div style="width: 500px;" class="slide-panel" v-if="detailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
          </div>
          <div>
            <endpoint-groups-detail :subnetList="subnetList" :serviceId="serviceId" ref="subnetdetailId" @onBack="onBack" @onBackRefresh="onBackRefresh"></endpoint-groups-detail>
          </div>
        </panel>
      </div>
    </transition>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import AddEndpointGroups from "./AddEndpointGroups";
import EditEndpointGroup from "./EditEndpointGroup";
import EndpointGroupsDetail from "./EndpointGroupsDetail";
import {onlyLetterNumberChinese} from '../validator/validator';
export default {
  name: "VPNServer",
  components: {
    AddEndpointGroups,
    EditEndpointGroup,
    EndpointGroupsDetail
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
      formInline: "",
      sortObj: {
        sortOrder: "ascending",
        sortField: "name"
      },
      addFlag: false,
      editFlag: false,
      detailFlag: false,
      query_name: "",
      query_porject: "",
      query_status: "",
      projectName: "",
      selProjectFlg: false,
      close: "",
      projectOption: [],
      totalData: [],
      roleType: Vue.roleType + "",
      subnetList: [],
      routerList: [],
      editrow: null,
      serviceId: "",
      columns: [
        {
          prop: "name",
          label: Vue.t("lang.name")
        },
        {
          prop: "project_id",
          label: Vue.t("lang.project")
        },
        {
          prop: "type",
          label: Vue.t("lang.type")
        },
        {
          prop: "endpoints",
          label: "Endpoints"
        },
        {
          prop: "description",
          label: Vue.t("lang.desc")
        }
      ],
      columnsChecked: [
        "name",
        "description",
        "endpoints",
        "type",
        "project_id"
      ],
      endpointGroupsData: [],
      multipleSelection: [],
      operationMenus: [
        {
          icon: "fa-plus",
          name: Vue.t("network.create"),
          showflg: true,
          readOnly: true,
          handler: function(selectRows) {
            this.addFlag = true;
            this.detailFlag = false;
          }.bind(this)
        },
        {
          icon: "fa-edit",
          name: Vue.t("network.modify"),
          showflg: true,
          multi: false,
          enable(rowData) {
            // if (rowData["ipsec_site_connections"].length > 0 && rowData["ipsec_site_connections"]!=undefined) {
            //   return false;
            // }
            return true;
          },
          handler: function(selectRows) {
            this.editrow = selectRows[0];
            this.editFlag = true;
            this.detailFlag = false;
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: Vue.t("network.delete"),
          showflg: true,
          multi: true,
          enable(rowData) {
            // if (rowData["ipsec_site_connections"].length > 0 && rowData["ipsec_site_connections"]!=undefined) {
            //   return false;
            // }
            return true;
          },
          handler: function(selectRows) {
            let self = this;
            self.detailFlag = false;
            self.$confirm(
              Vue.t("network.confirmSimpleDelete"),
              Vue.t("network.attention"),
              {
                confirmButtonText: Vue.t("lang.confirm"),
                cancelButtonText: Vue.t("lang.cancel"),
                type: "warning",
                closeOnClickModal: false,
                callback: (action, instance) => {
                  if (action === "confirm") {
                    self
                      .$sequence({
                        type: "delete",
                        url: "api/neutron/v2.0/vpn/endpoint-groups/{id}",
                        params: selectRows,
                        log: {
                          description: {
                            en: "Delete EndpointGroups",
                            zh_cn: "删除Endpoint组"
                          },
                          key: "name",
                          target: Vue.logTarget.endpointGroup
                        }
                      })
                      .then(data => {
                        self.$message(Vue.t("network.deleteSendSuccess"));
                        self.$refs.vpnserver.clearSelection();
                        self.getData();
                      })
                      .catch(err => {
                        self.getData();
                      });
                  }
                }
              }
            );
          }.bind(this)
        }
      ]
    };
  },
  watch: {
    columnsChecked: {
      handler: function(rows, oldVal) {
        this.columnsChecked = rows;
      },
      deep: true
    }
  },
  mounted() {
    let self = this;
    let roleType = Vue.roleType + "";
    if (roleType == "0") {
      Promise.all([
        self.getProjectList(),
        self.getSubnetList(),
        self.getRouterList()
      ]).then(function(result) {
        self.getData();
      });
    } else {
      Promise.all([
        self.getProjectInUser(),
        self.getSubnetList(),
        self.getRouterList()
      ]).then(function(result) {
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
      try {
        self.loading = true;
        self.totalData = [];
        let roleType = Vue.roleType + "";
        let result = await self.$ajax({
          type: "get",
          url: "api/neutron/v2.0/vpn/endpoint-groups",
          errorKey: "NeutronError",
          complete: function(XMLHttpRequest, textStatus) {
            self.loading = false;
          }
        });
        let vpnservices = result["endpoint_groups"];
        self.$refs.vpnserver.clearSelection();
        let resultData = [];
        for (var i = 0; i < vpnservices.length; i++) {
          if (
            roleType == "0" &&
            self.searchBarValidatedParams.query_porject &&
            self.searchBarValidatedParams.query_porject !== "" &&
            self.searchBarValidatedParams.query_porject != vpnservices[i].project_id
          ) {
            continue;
          }
          if (
            self.searchBarValidatedParams.query_name &&
            self.searchBarValidatedParams.query_name !== "" &&
            vpnservices[i].name.indexOf(self.searchBarValidatedParams.query_name) < 0
          ) {
            continue;
          }
          resultData.push(vpnservices[i]);
        }
        self.totalData = resultData;
        if (self.totalData.length > 0) {
          self.totalData.sort(this.$sortFormatter("name", "ascending"));
        }
      } catch (res) {}
    },
    getCurrentData(param) {
      this.endpointGroupsData = param;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) {
        return;
      }
      self.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
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
        url: "api/keystone/v3/projects/" + Vue.cookie.get("pid"),
        errorKey: "NeutronError",
        showErrMsg: false,
        success: function(project) {
          Vue.projectListforNet.push(project["project"]);
        }
      });
    },
    async getSubnetList() {
      let self = this;
      self.subnetList = [];
      let result = await self.$ajax({
        type: "get",
        url: "api/neutron/v2.0/subnets",
        errorKey: "NeutronError"
      });
      self.subnetList = result["subnets"];
    },
    async getRouterList() {
      let self = this;
      self.routerList = [];
      let result = await self.$ajax({
        type: "get",
        url: "api/neutron/v2.0/routers",
        errorKey: "NeutronError"
      });
      self.routerList = result["routers"];
    },
    projectToName(row) {
      let proId = row["project_id"];
      let proList = Vue.projectListforNet;
      for (let i = 0; i < proList.length; i++) {
        if (proId === proList[i]["id"]) {
          return proList[i]["name"];
        }
      }
    },
    subnetToName(subnetIds) {
      let names = [];
      for (let a = 0; a < subnetIds.length; a++) {
        for (let i = 0; i < this.subnetList.length; i++) {
          let row = this.subnetList[i];
          if (row["id"] === subnetIds[a]) {
            names.push(row["name"]);
          }
        }
      }
      return names.join(",");
    },
    routerToName(routerId) {
      let name = "";
      for (let i = 0; i < this.routerList.length; i++) {
        let row = this.routerList[i];
        if (row["id"] === routerId) {
          name = row["name"];
        }
      }
      return name;
    },
    statusRender(status) {
      if (status === "ACTIVE") {
        return Vue.t("lang.ACTIVE");
      } else if (status === "DOWN") {
        return Vue.t("network.close");
      } else if (status === "PENDING_UPDATE") {
        return Vue.t("network.UPDATE");
      } else if (status === "PENDING_CREATE") {
        return Vue.t("network.ready");
      } else if (status === "PENDING_DELETE") {
        return Vue.t("network.DELETING");
      } else if (status === "BUILD") {
        return Vue.t("network.BUILD");
      } else if (status === "ERROR") {
        return Vue.t("lang.ERROR");
      }
    },
    statusTagRender(status) {
      if (status === "ACTIVE") {
        return "success";
      } else if (status === "DOWN") {
        return "gray";
      } else if (status === "PENDING_UPDATE") {
        return "info";
      } else if (status === "PENDING_CREATE") {
        return "info";
      } else if (status === "PENDING_DELETE") {
        return "info";
      } else if (status === "BUILD") {
        return "success";
      } else if (status === "ERROR") {
        return "danger";
      }
    },
    managestatusRender(value) {
      if (value == true) {
        return "UP";
      } else {
        return "DOWN";
      }
    },
    publicIpRender(row) {
      if (row["external_v4_ip"] != null) {
        return row["external_v4_ip"];
      } else {
        return row["external_v6_ip"];
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
    handlerCancelShow() {
      this.addFlag = false;
      this.editFlag = false;
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.vpnserver.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    queryClick() {
      let self = this;
      self.getData();
    },
    onRefresh() {
      this.$refs.vpnserver.clearSelection();
      this.projectName = "";
      this.query_porject = "";
      this.query_name = "";
      this.getData();
    },
    rowClick(row) {
      //this.$refs.vpnserver.toggleRowSelection(row);
    },
    async showDetail(row) {
      this.detailFlag = true;
      this.serviceId = row["id"];
      this.$nextTick(async () => {
        await this.$refs.subnetdetailId.initDetail();
        this.$refs.vpnserver.clearSelection();
      });
      this.$refs.vpnserver.clearSelection();
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
          if (i + 1 === stations.length) {
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
      this.close = "close";
    },
    onIconClick() {
      this.query_porject = "";
      this.projectName = "";
      this.close = "";
    }
  }
};
</script>
