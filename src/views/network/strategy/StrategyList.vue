<template>
  <div>
    <icos-page-header :title="$t('network.NETWORK_STRATEGY')" :show-bottom-border="false" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
      <div class="divider clearfix"></div>
      <div class="operation-panel margin-b5">
        <operation-panel
          :select-rows="multipleSelection"
          :operation-menus="operationMenus">
        </operation-panel>
      </div>
      <div class="divider clearfix"></div>
      <el-table
        ref="strategyTable"
        :data="strateData"
        highlight-current-row
        stripe
        border
        style="width: 100%;"
        row-key="id"
        v-loading="loading"
        :default-sort="{prop: 'created_at', order: 'descending'}"
        @sort-change="sortChange"
        :element-loading-text="$t('lang.loading')"
        @row-click="rowClick"
        @selection-change="handleSelectionChange">
        <el-table-column
          reserve-selection
          type="selection"
          width="55" align="center">
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('id') >= 0"
          :label="$t('network.ID')"
          prop="name"
          min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
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
        <el-table-column v-if="columnsChecked.indexOf('network_id') >= 0" prop="network_id" :label="$t('network.network')" min-width="100">
          <template slot-scope="scope">
            <span v-html="networkRender(scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('subnet') >= 0"
          prop="subnet"
          :label="$t('network.subnet')"
          min-width="100">
          <template slot-scope="scope">
            <span v-html="subnetsRender(scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('qos_policy_id') >= 0" prop="qos_policy_id" :label="$t('network.netConfigQosPloy')" min-width="100">
          <template slot-scope="scope">
            <el-button @click="qosDetail(scope.row)" type="text" size="small">
              <span v-html="qosRender(scope.row.qos_policy_name)"></span>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('security_groups') >= 0" prop="security_groups" :label="$t('network.securityTeam')" min-width="100">
          <template slot-scope="scope">
            <el-button @click="safeDetail(scope.row)" type="text" size="small">
              <span v-html="safeRender(scope.row)"></span>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('status') >= 0"
          prop="status"
          :label="$t('lang.status')"
          min-width="50">
          <template slot-scope="scope">
            <el-tag :type="statusTagRender(scope.row.state)">
              <span v-html="statusRender(scope.row)"></span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('created_at') >= 0"
          :label="$t('network.UPDATEDAT')"
          prop="created_at"
          sortable="custom"
          min-width="100">
          <template slot-scope="scope">
            <span v-html="timeFormat(scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('description') >= 0"
          :label="$t('lang.desc')"
          prop="description"
          min-width="150">
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
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" :objStorFlag="pageCount"></page>
        </el-col>
      </el-row>
    </div>
    <add-strategy ref="addStrategy" v-if="addFlag" @handleAddShow="handleAddShow"  @handleCancelShow="handleCancelShow" :projectId="addProjectId"></add-strategy>
    <edit-strategy ref="editNetwork" v-if="editFlag" @handleEditShow="handleEditShow" @handleCancelShow="handleCancelShow" :row="row" :projectId="addProjectId"></edit-strategy>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="strategyDetailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t("lang.back")}}</el-button>
          </div>
          <div>
            <strategy-detail :strategyData="strategyData" :tabName="activeName"></strategy-detail>
          </div>
        </panel>
      </div>
    </transition>
    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="safeDetailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t("lang.back")}}</el-button>
          </div>
          <div>
            <safe-group :strategyData="strategyData"></safe-group>
          </div>
        </panel>
      </div>
    </transition>
    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="qosDetailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t("lang.back")}}</el-button>
          </div>
          <div>
            <qos-detail :strategyData="strategyData"></qos-detail>
          </div>
        </panel>
      </div>
    </transition>
  </icos-page>
</div>
</template>
<script>
import SafeGroup from './SafeGroup';
import QosDetail from './QosDetail';
import AddStrategy from './AddStrategy';
import EditStrategy from './EditStrategy';
import moment from 'moment';
import StrategyDetail from './StrategyDetail';
import {onlyLetterMinusNumberChinese} from '../validator/validator';
export default {
  name: "StrategyList",
  components: {
    StrategyDetail,
    AddStrategy,
    EditStrategy,
    QosDetail,
    SafeGroup
  },
  data() {
    return {
      searchBar: {
        conditions: {
          queryName: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: onlyLetterMinusNumberChinese
          },
          query_porject: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          },
          queryNetwork: {
            label: this.$t('network.network'),
            type: 'select',
            options: []
          },
          queryStatus: {
            label: this.$t('lang.status'),
            type: 'select',
            options: [{
              label: this.$t('network.VALID'),
              value: 'valid'
            }, {
              label: this.$t('network.RECOVERABLE'),
              value: 'invalid,recoverable,damaged'
            }]
          }
        }
      },
      searchBarValidatedParams: {},
      listProjectName: "",
      intervalDel: "",
      activeName: "detail",
      networks: [],
      addProjectId: "",
      queryStatus: "",
      row: {},
      strategyData: {},
      strategyDetailFlag: false,
      safeDetailFlag: false,
      qosDetailFlag: false,
      queryNetwork: "",
      addFlag: false,
      editFlag: false,
      loading: false,
      networkName: "",
      description: "",
      pageCount:true,
      networkEditId:"",
      networkId: "",
      queryName: "",
      query_porject: "",
      projectName:"",
      selProjectFlg:false,
      close: "",
      query_status: "",
      roleType: Vue.roleType + "",
      sortObj:{
        sortOrder:"ascending",
        sortField:"created_at"
      },
      columns: [
        {
          prop: "id",
          label: Vue.t('network.ID')
        }, {
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "project_id",
        label: Vue.t('lang.project')
      }, {
        prop: "network_id",
        label: Vue.t('network.network')
      }, {
        prop: "subnet",
        label: Vue.t('network.subnet')
      }, {
        prop: "qos_policy_id",
        label: Vue.t('calcStorLang.netConfigQosPloy')
      }, {
        prop: "security_groups",
        label: Vue.t('network.securityTeam')
      }, {
        prop: "status",
        label: Vue.t('lang.status')
      }, {
        prop: "created_at",
        label: Vue.t('network.UPDATEDAT')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      } ],
      columnsChecked: ['name', 'project_id', 'network_id', 'subnet', 'qos_policy_id', 'security_groups', 'created_at', 'status', 'admin_state_up', 'description'],
      strateData: [],
      totalData: [],
      multipleSelection: [],
      operationMenus: [
        {
          icon: "fa-plus",
          name: Vue.t('network.CREATE_NETWORK_STRATEGY'),
          showflg: true,
          readOnly: true,
          handler: function(selectRows) {
            this.onBack();
            this.addFlag = true;
            let roleType = Vue.roleType + "";
            if (roleType != "0") {
              this.addProjectId =Vue.cookie.get('pid');
            } else {
              this.addProjectId = "";
            }
          }.bind(this)
        }, {
          icon: "fa-edit",
          name: Vue.t('network.modify'),
          showflg: true,
          multi: false,
          handler: function(selectRows) {
            this.onBack();
            this.editFlag = true;
            this.row = selectRows[0];
          }.bind(this)
        }, {
        icon: "fa-times",
        name: Vue.t('network.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          let roleType = Vue.roleType + "";
          if (roleType!="0") {
            if (rowData["project_id"] == Vue.cookie.get('pid')) {
              return true;
            } else {
              return false;
            }
          }
          return true;
        },
        handler: function(selectRows) {
          this.onBack();
          this.delete(selectRows);
        }.bind(this)
      }]
    }
  },
  watch: {
  },
  async mounted() {
    let self = this;
    let roleType = Vue.roleType + "";
    if (roleType === "0") {
      this.loadProjectNetListAdmin();
    } else {
      this.getShareNetwork();
    }
    self.getListData();
  },
  methods: {
    handleSearch(params) {
      let self = this;
      this.searchBarValidatedParams = params;
      self.$refs.strategyTable.clearSelection();
      self.pageCount = true;
      self.getData();
    },
    async getListData() {
      let self = this;
      let roleType = Vue.roleType + "";
      if (roleType === "0") {
        Promise.all([self.getProjectList()]).then(function(result) {
          self.getData();
        });
      } else {
        await self.getData();
        //await self.getProjectName(projectId);
      }
    },
    async getProjectName(projectId) {
      if (projectId) {
        const self =this;
        await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects/" + projectId,
          showErrMsg: false,
          success: function(project) {
            self.listProjectName = project["project"].name;
          }
        });
      }
    },
    safeRender(row) {
      let show = "";
      if (row.security_groups && row.security_groups.length) {
        show = Vue.t('lang.view');
      } else {
        show = "-";
      }
      return show;
    },
    async loadProjectNetListAdmin() {
      const self = this;
      self.networks = [];
      self.searchBar.conditions.queryNetwork.options = [];
      let url = 'api/neutron/v2.0/networks';
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        self.networks = result['networks'];
        self.searchBar.conditions.queryNetwork.options = result['networks'].map((item) => {
          return {
            label: item.name,
            value: item.id
          }
        });
      } catch (res) {
      }
    },
    // 获取本项目下或者共享网络
    getShareNetwork() {
      const self =this;
      Promise.all([self.loadProjectNetList(), self.loadSharedNetList()]).then(function(result) {
        let data1 = result[0];
        let data2 = result[1];
        self.networks = [];
        self.searchBar.conditions.queryNetwork.options = [];
        let nets = data1.concat(data2);
        for (let t = 0; t < nets.length; t++) {
          let netObj = nets[t];
          if ((netObj['admin_state_up'] + "") == "true") {
            self.networks.push(netObj);
          }
        }
        self.searchBar.conditions.queryNetwork.options = self.networks.map((item) => {
          return {
            label: item.name,
            value: item.id
          }
        });
      });
    },
    async loadProjectNetList() {
      const self = this;
      let url = 'api/neutron/v2.0/networks?project_id='+ Vue.cookie.get('pid') + "&shared=false";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        return result['networks'];
      } catch (res) {
      }
    },
    async loadSharedNetList() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/neutron/v2.0/networks?shared=true',
          showErrMsg: true
        });
        return result['networks'];
      } catch (res) {
      }
    },
    delete(row) {
      const self = this;
      self.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        type: "warning",
        closeOnClickModal: false,
        callback: async (action, instance) => {
          if (action === "confirm") {
            self.$refs.strategyTable.clearSelection();
            self.multipleSelection = [];
            if (row.length == 0) {
              return;
            }
            self.loading = true;
            try {
              await self.deleteAction(row);
            } catch (e) {
              self.loading = false;
            }
          }
        }
      });
    },
    async deleteAction(row) {
      let self = this;
      let oldRow = row.shift();
      let strategyId = oldRow && oldRow.id;
      if (!strategyId) return;
      try {
        await self.$ajax({
          type: "DELETE",
          url: "api/neutron/v2.0/inspur/network_policy_templates/" + strategyId,
          data: {},
          errorKey: "NeutronError",
          log: {
            description: {
              en: "Delete network strategy:" + oldRow.name,
              zh_cn: "删除网络策略模板:" + oldRow.name
            },
            target: Vue.logTarget.strategy
          },
          successFun: function () {
            if (row.length == 0) {
              clearInterval(self.intervalDel);
              self.getData();
              self.loading = false;
              self.$notify({
                message:
                  Vue.t("network.deleteSendSuccess"),
                type: "success"
              });
            } else {
              clearInterval(self.intervalDel);
              self.intervalDel = setInterval(() => {
                self.deleteAction(row);
              }, 1000);
            }
          },
          errFun: function() {
            if (row.length == 0) {
              clearInterval(self.intervalDel);
              self.getData();
              self.loading = false;
            } else {
              clearInterval(self.intervalDel);
              self.intervalDel = setInterval(() => {
                self.deleteAction(row);
              }, 1000);
            }
          }
        });
      } catch (e) {
        self.loading = false;
      }
    },
    onBack() {
      this.strategyDetailFlag = false;
      this.safeDetailFlag = false;
      this.qosDetailFlag = false;
    },
    networkRender(row) {
      return row.network_name || "-"
    },
    qosRender(name) {
      if (name) {
        return name;
      } else {
        return "-";
      }
    },
    timeFormat(row) {
      let utc = row.created_at;
      let createTime = moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
      row.createTime = createTime;
      return createTime;
    },
    async getData() {
      let self = this;
      let name = self.searchBarValidatedParams.queryName || "";
      let reg = /^[_\-0-9a-zA-Z\u4e00-\u9fa5@]+$/;
      if ( (reg.test(name) && name != "") || "" == name) {
        name = encodeURI(name);
      }
      let parm = {
        'name': name,
        'network_id': self.searchBarValidatedParams.queryNetwork || "",
        'project_id': self.searchBarValidatedParams.query_porject || "",
        'state': (self.searchBarValidatedParams.queryStatus && self.searchBarValidatedParams.queryStatus.split(",")) || ""
      };
      let roleType = Vue.roleType + "";
      if (roleType != "0") {
        parm.project_id = Vue.cookie.get('pid');
      }
      let temp = "";
      for (let [k, v] of Object.entries(parm)) {
        switch (Object.prototype.toString.call(v)) {
          case "[object String]":
            if (v) {
              temp += k + "=" + v + "&";
            }
            break;
          case "[object Array]":
            for (let value of v) {
              if (value) {
                temp += k + "=" + value + "&";
              }
            }
            break;
        }
      }
      let parmString = "";
      if (temp.length) {
        parmString = temp.substring(0, temp.lastIndexOf("&"));
      }
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/inspur/network_policy_templates"+"?" + parmString,
          complete: function(XMLHttpRequest, textStatus) {
            self.loading = false;
          },
          errorKey: "NeutronError"
        });
        self.$refs.strategyTable.clearSelection();
        let roleType = Vue.roleType + "";
        if (roleType === "0") {
          self.totalData = result['network_policy_templates'];
        } else {
          let list = result['network_policy_templates'];
          await self.getProjectName(list[0] && list[0].project_id);
          self.totalData = list;
        }
      } catch (res) {
        self.loading = false;
      }
    },
    sortChange(column) {
      const self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    getCurrentData(param) {
      this.strateData = param;
    },
    async getProjectList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default"
        });
        Vue.projectListforNet = result["projects"];
        this.searchBar.conditions.query_porject.options = result.projects.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (res) {
      }
    },
    handleAddShow() {
      let self = this;
      self.addFlag = false;
      self.getListData();
    },
    handleEditShow() {
      this.editFlag = false;
      this.getData();
    },
    handleCancelShow() {
      this.addFlag = false;
      this.editFlag = false;
    },
    onRefresh() {
      let self = this;
      self.getListData();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    queryClick() {
      let self = this;
      self.$refs.strategyTable.clearSelection();
      self.pageCount = true;
      self.getData();
    },
    rowClick(row) {
      //this.$refs.strategyTable.toggleRowSelection(row);
    },
    subnetsRender(row) {
      let subnet = "";
      if (row.subnet_name || row.cidr) {
        subnet = row.subnet_name + '(' + row.cidr + ')';
      } else {
        subnet = "-";
      }
      row.subName = subnet;
      return subnet;
    },
    projectToName(row) {
      let roleType = Vue.roleType + "";
      if (roleType === "0") {
        let proId = row["project_id"];
        let proList = Vue.projectListforNet;
        for (let i=0; i<proList.length; i++) {
          if (proId === proList[i]["id"]) {
            row.projectName = proList[i]["name"];
            return proList[i]["name"];
          }
        }
      } else {
        row.projectName = this.listProjectName;
        return this.listProjectName;
      }
    },
    statusRender(row) {
      if (row["state"]==="valid") {
        return this.$t('network.VALID');
      } else if (row["state"]==="recoverable" || row["state"]==="invalid" || row["state"]==="damaged") {
        return this.$t('network.RECOVERABLE');
      }
    },
    statusTagRender(status) {
      if (status==="valid") {
        return "success";
      } else if (status === "invalid" || status === "recoverable" || status === "damaged") {
        return "danger";
      }
    },
    showDetail(index, row, activeName) {
      this.strategyData = row;
      this.strategyDetailFlag = true;
      this.safeDetailFlag = false;
      this.qosDetailFlag = false;
      this.activeName = activeName;
    },
    safeDetail(row) {
      this.strategyData = row;
      if (!row.security_groups.length) {
        this.safeDetailFlag = false;
        return;
      }
      this.strategyDetailFlag = false;
      this.safeDetailFlag = true;
      this.qosDetailFlag = false;
    },
   qosDetail(row) {
      this.strategyData = row;
      if (!row.qos_policy_id) {
        this.qosDetailFlag = false;
        return;
      }
      this.strategyDetailFlag = false;
      this.safeDetailFlag = false;
      this.qosDetailFlag = true;
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
