<template>
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
      ref="vpnconnect"
      :data="vpnconnectData"
      highlight-current-row
      stripe
      border
      style="width: 100%"
      :element-loading-text="$t('lang.loading')"
      row-key="id" @sort-change="sortChange"
      :default-sort="{prop: 'name'}"
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
        v-if="columnsChecked.indexOf('ikepolicy_id') >= 0"
        prop="ikepolicy_id"
        :label="$t('network.ikeStrategy')"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="ikeToName(scope.row.ikepolicy_id)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('ipsecpolicy_id') >= 0"
        prop="ipsecpolicy_id"
        :label="$t('network.ipsecStrategy')"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="ipsecToName(scope.row.ipsecpolicy_id)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('vpnservice_id') >= 0"
        prop="vpnservice_id"
        :label="$t('network.vpnServer')"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="vpnserviceToName(scope.row.vpnservice_id)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('status') >= 0"
        prop="status"
        align="left"
        :label="$t('lang.status')"
        min-width="50">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status)">
            <span v-html="statusRender(scope.row.status)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('admin_state_up') >= 0"
        prop="admin_state_up"
        :label="$t('network.manageStatus')"
        align="left"
        min-width="50">
        <template slot-scope="scope">
          <span v-html="managestatusRender(scope.row.admin_state_up)"></span>
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
    <addvpnsecstation ref="addsecstation" v-if="addFlag" @handleAddShow="handleAddShow" @handlerCancelShow="handlerCancelShow"></addvpnsecstation>
    <editvpnsecstation ref="editsecstation" v-if="editFlag" @handleEditShow="handleEditShow" @handlerCancelShow="handlerCancelShow" :editrow="editrow"></editvpnsecstation>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    <transition name="slide-right" mode="out-in">
      <div style="width: 600px;" class="slide-panel" v-if="detailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
           <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
          </div>
          <div>
           <station-detail :stationId="stationId" ref="subnetdetailId" @onBack="onBack" @onBackRefresh="onBackRefresh"></station-detail>
          </div>
        </panel>
      </div>
    </transition>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import uuid from 'uuid';
import addvpnsecstation from './AddIpsecStation';
import editvpnsecstation from './EditIpsecStration';
import stationDetail from './VpnstationDetail';
import {onlyLetterNumberChinese} from '../validator/validator';
export default {
  name: "VPNIpSecStation",
  components: {
    addvpnsecstation, editvpnsecstation, stationDetail
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
          },
          query_status: {
            label: this.$t('lang.status'),
            type: 'select',
            options: [{
              label: this.$t('lang.ACTIVE'),
              value: 'ACTIVE'
            }, {
              label: this.$t('network.close'),
              value: 'DOWN'
            }, {
              label: this.$t('network.UPDATE'),
              value: 'PENDING_UPDATE'
            }, {
              label: this.$t('network.ready'),
              value: 'PENDING_CREATE'
            }, {
              label: this.$t('network.DELETING'),
              value: 'PENDING_DELETE'
            }, {
              label: this.$t('network.BUILD'),
              value: 'BUILD'
            }, {
              label: this.$t('lang.ERROR'),
              value: 'ERROR'
            }]
          }
        }
      },
      searchBarValidatedParams: {},
      addFlag: false,
      editFlag: false,
      loading: false,
      detailFlag: false,
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      query_status: "",
      query_name: "",
      query_porject: "",
      projectName:"",
      selProjectFlg:false,
      close: "",
      projectOption: [],
      totalData: [],
      roleType: Vue.roleType + "",
      ikepoliciesList: [],
      ipsecpoliciesList: [],
      vpnservicesList: [],
      stationId: "",
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "project_id",
        label: Vue.t('lang.project')
      }, {
        prop: "ikepolicy_id",
        label: Vue.t('network.ikeStrategy')
      }, {
        prop: "ipsecpolicy_id",
        label: Vue.t('network.ipsecStrategy')
      }, {
        prop: "vpnservice_id",
        label: Vue.t('network.vpnServer')
      }, {
        prop: "status",
        label: Vue.t('lang.status')
      }, {
        prop: "admin_state_up",
        label: Vue.t('network.manageStatus')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }],
      columnsChecked: ['name', 'description', 'vpnservice_id', 'ikepolicy_id', 'ipsecpolicy_id', 'status', 'admin_state_up', 'project_id'],
      vpnconnectData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.create'),
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
          if (rowData['status'] == "PENDING_UPDATE" || rowData['status'] == "PENDING_CREATE" || rowData['status'] == "PENDING_DELETE") {
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
                for (var i = 0; i < selectRows.length; i++) {
                  let row = selectRows[i];
                  if (row["status"] == "PENDING_CREATE") {
                    let traceId = 'req-'+uuid.v1();
                    self.$ajax({
                      type: "DELETE",
                      url: "api/neutron/v2.0/vpn/ipsec-site-connections/"+row["id"],
                      data: {},
                      headers: {
                        'X-Openstack-Request-Id': traceId
                      },
                      success: function() {
                        self.$notify({
                          message: row["name"]+Vue.t('network.deleteSendSuccess'),
                          type: "success"
                        });
                      },
                      showErrMsg:false,
                      errFun() {
                        self.$notify({
                          message: row["name"]+Vue.t('network.deleteSendSuccess'),
                          type: "success"
                        });
                        self.getData();
                      },
                      errorKey: "NeutronError"
                    });
                    self.$recordLog({
                      target:Vue.logTarget.ipsecStation,
                      level: {
                        en: 'info',
                        zh_cn: '信息'
                      },
                      description: {
                        en: 'Delete IPSec Site Connections:'+row["name"],
                        zh_cn: '删除IPSec站点连接:'+row["name"]
                      },
                      trace_id: traceId
                    });
                  } else {
                    let traceId = 'req-'+uuid.v1();
                    self.$ajax({
                      type: "DELETE",
                      url: "api/neutron/v2.0/vpn/ipsec-site-connections/"+row["id"],
                      data: {},
                      headers: {
                        'X-Openstack-Request-Id': traceId
                      },
                      success: function() {
                        self.$notify({
                          message: row["name"]+Vue.t('network.deleteSendSuccess'),
                          type: "success"
                        });
                        self.getData();
                      },
                      showErrMsg:true,
                      errFun() {
                      },
                      errorKey: "NeutronError"
                    });
                    self.$recordLog({
                      target:Vue.logTarget.ipsecStation,
                      level: {
                        en: 'info',
                        zh_cn: '信息'
                      },
                      description: {
                        en: 'Delete IPSec Site Connections:'+row["name"],
                        zh_cn: '删除IPSec站点连接:'+row["name"]
                      },
                      trace_id: traceId
                    });
                  }
                }
              }
            }
          });
        }.bind(this)
      }]
    }
  },
  beforeDestroy() {
    if (this.interPhyValid != null) {
      clearInterval(this.interPhyValid);
    }
  },
  watch: {
    columnsChecked: {
      handler: function (rows, oldVal) {
       this.columnsChecked = rows;
      },
      deep: true
    },
    vpnconnectData: {
      immediate: false,
      handler: function(list) {
        let self = this;
        self.loading = false;
        if (list != null) {
          for (let t = 0; t < list.length; t++) {
            let obj = list[t];
            if (obj['status'] == "PENDING_UPDATE" || obj['status'] == "PENDING_CREATE" || obj['status'] == "PENDING_DELETE") {
              self.loading = true;
              break;
            }
          }
        }
        clearInterval(self.interPhyValid);
        if (self.loading && !self._isDestroyed) {
          self.interPhyValid = setInterval(() => {
            self.getData()
          }, 10000);
        }
      }
    }
  },
  mounted() {
    let self = this;
    let roleType = Vue.roleType + "";
    if (roleType == "0") {
      Promise.all([self.getProjectList(), self.getikeList(), self.getipsecList(), self.getvpnserviceList()]).then(function(result) {
        self.getData();
      });
    } else {
      Promise.all([self.getProjectInUser(), self.getikeList(), self.getipsecList(), self.getvpnserviceList()]).then(function(result) {
        self.getData();
      });
    }
  },
  methods: {
    handleSearch(params) {
      let self = this;
      this.searchBarValidatedParams = params;
      this.$refs.vpnconnect.clearSelection();
      self.getData();
    },
    async getData() {
      let self = this;
      let name = self.searchBarValidatedParams.query_name || "";
      let projectid = self.searchBarValidatedParams.query_porject || "";
      let querystatus = self.searchBarValidatedParams.query_status || "";
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
          url: "api/neutron/v2.0/vpn/ipsec-site-connections"+queryStr,
          errorKey: "NeutronError",
          complete: function(XMLHttpRequest, textStatus) {
            self.loading = false;
          }
        });
        let ipsecsite = result["ipsec_site_connections"];
        // self.$refs.vpnconnect.clearSelection();
        let resultData = [];
        if (name === "" && querystatus==="") {
          resultData = ipsecsite;
        } else if (name != "" && querystatus==="") {
          for (let i = 0; i < ipsecsite.length; i++) {
            if (ipsecsite[i].name.indexOf(name) >= 0) {
              resultData.push(ipsecsite[i]);
            }
          }
        } else if (name === "" && querystatus!="") {
          for (let i = 0; i < ipsecsite.length; i++) {
            if (ipsecsite[i]["status"].indexOf(querystatus) >= 0) {
              resultData.push(ipsecsite[i]);
            }
          }
        } else {
          for (let i = 0; i < ipsecsite.length; i++) {
            if (ipsecsite[i].name.indexOf(name) >= 0 && ipsecsite[i]["status"].indexOf(querystatus) >= 0) {
              resultData.push(ipsecsite[i]);
            }
          }
        }
        self.totalData = resultData;
        if (self.totalData.length > 0) {
          self.totalData.sort(this.$sortFormatter("name", "ascending"));
        }
      } catch (res) {
      }
    },
    getCurrentData(param) {
      this.vpnconnectData = param;
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
    async getikeList() {
      let self = this;
      try {
        self.ikepoliciesList = [];
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/vpn/ikepolicies",
          errorKey: "NeutronError"
        });
        self.ikepoliciesList = result["ikepolicies"];
      } catch (res) {
      }
    },
    async getipsecList() {
      let self = this;
      try {
        self.ipsecpoliciesList = [];
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/vpn/ipsecpolicies",
          errorKey: "NeutronError"
        });
        self.ipsecpoliciesList = result["ipsecpolicies"];
      } catch (res) {
      }
    },
    async getvpnserviceList() {
      let self = this;
      try {
        self.vpnservicesList = [];
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/vpn/vpnservices",
          errorKey: "NeutronError"
        });
        self.vpnservicesList = result["vpnservices"];
      } catch (res) {
      }
    },
    ikeToName(ikeId) {
      let name = "";
      for (let i = 0; i < this.ikepoliciesList.length; i++) {
        let row = this.ikepoliciesList[i];
        if (row["id"] === ikeId) {
          name = row["name"];
          break;
        }
      }
      return name;
    },
    ipsecToName(ipsecId) {
      let name = "";
      for (let i = 0; i < this.ipsecpoliciesList.length; i++) {
        let row = this.ipsecpoliciesList[i];
        if (row["id"] === ipsecId) {
          name = row["name"];
          break;
        }
      }
      return name;
    },
    vpnserviceToName(serviceId) {
      let name = "";
      for (let i = 0; i < this.vpnservicesList.length; i++) {
        let row = this.vpnservicesList[i];
        if (row["id"] === serviceId) {
          name = row["name"];
          break;
        }
      }
      return name;
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
    statusRender(status) {
      if (status==="ACTIVE") {
        return Vue.t('lang.ACTIVE');
      } else if (status==="DOWN") {
        return Vue.t('network.close');
      } else if (status==="PENDING_UPDATE") {
        return Vue.t('network.UPDATE');
      } else if (status==="PENDING_CREATE") {
        return Vue.t('network.ready');
      } else if (status==="PENDING_DELETE") {
        return Vue.t('network.DELETING');
      } else if (status==="BUILD") {
        return Vue.t('network.BUILD');
      } else if (status==="ERROR") {
        return Vue.t('lang.ERROR');
      }
    },
    statusTagRender(status) {
      if (status==="ACTIVE") {
        return "success";
      } else if (status==="DOWN") {
        return "gray";
      } else if (status==="PENDING_UPDATE") {
        return "info";
      } else if (status==="PENDING_CREATE") {
        return "info";
      } else if (status==="PENDING_DELETE") {
        return "info";
      } else if (status==="BUILD") {
        return "success";
      } else if (status==="ERROR") {
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
      //   this.$refs.vpnconnect.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    onRefresh() {
      // this.$refs.vpnconnect.clearSelection();
      this.getData();
    },
    queryClick() {
      let self = this;
      self.getData();
    },
    rowClick(row) {
      this.$refs.vpnconnect.toggleRowSelection(row);
    },
    showDetail(row) {
      this.detailFlag = true;
      this.stationId = row["id"];
      this.$nextTick(() => {
         this.$refs.subnetdetailId.initDetail();
      });
      this.$refs.vpnconnect.clearSelection();
    },
    onBack() {
      this.detailFlag = false;
    },
    onBackRefresh() {
      this.detailFlag = false;
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
    }
  }
}
</script>
