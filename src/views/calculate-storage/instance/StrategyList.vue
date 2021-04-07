<template>
  <div>
    <el-form :inline="true" class="form-inline">
      <el-form-item :label="$t('lang.name')">
        <el-input size="small" v-model="queryName" style="width:210px;"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" size="small" @click="queryClick()">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>
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
      @current-change="handleSelectionChange">
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
          <span>{{scope.row.name}}</span>
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
          <span v-html="qosRender(scope.row.qos_policy_name)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('security_groups') >= 0" prop="security_groups" :label="$t('network.securityTeam')" min-width="100">
        <template slot-scope="scope">
          <span v-html="safeRender(scope.row.securityGroupsNames)">
          </span>
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
</div>
</template>
<script>
import moment from 'moment';
export default {
  name: "StrategyList",
  props: ['projectId'],
  data() {
    return {
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
      pageCount:false,
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
        prop: "created_at",
        label: Vue.t('network.UPDATEDAT')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      } ],
      columnsChecked: ['name', 'network_id', 'subnet', 'qos_policy_id', 'security_groups', 'created_at', 'description'],
      strateData: [],
      totalData: [],
      multipleSelection: [],
      operationMenus: []
    }
  },
  watch: {
  },
  async mounted() {
    let self = this;
    self.getListData();
  },
  methods: {
    async getSafeName(safeId) {
      let self = this;
      try {
        if (safeId) {
          let result = await self.$ajax({
            type: "GET",
            url: "api/neutron/v2.0/security-groups/" + safeId,
            errorKey: "NeutronError"
          });
          return result.security_group.name || "";
        }
      } catch (res) {
      }
    },
    async getListData() {
      let self = this;
      try {
        await self.getData();
      } catch (e) {
        ;
      }
    },
    safeRender(securityGroupsNames) {
      let show = "";
      if (securityGroupsNames) {
        show = securityGroupsNames;
      } else {
        show = "-";
      }
      return show;
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
      let name = self.queryName;
      let reg = /^[_\-0-9a-zA-Z\u4e00-\u9fa5@]+$/;
      if ( (reg.test(name) && name != "") || "" == name) {
        name = encodeURI(name);
      }
      let parm = {
        'name': name,
        'network_id': self.queryNetwork,
        'project_id': self.query_porject,
        'state': "valid"
      };
      let roleType = Vue.roleType + "";
      if (roleType != "0") {
        parm.project_id = Vue.cookie.get('pid');
      } else {
        parm.project_id = this.projectId;
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
        let tmpData = [];
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/inspur/network_policy_templates"+"?" + parmString,
          errorKey: "NeutronError"
        });
        self.$refs.strategyTable.clearSelection();
        tmpData = result['network_policy_templates'];
        for (let i = 0; i < tmpData.length; i++) {
          let safeIds = tmpData[i].security_groups;
          let safeNames = "";
          for (let safeId of safeIds) {
            let safeName = await self.getSafeName(safeId);
            safeNames += safeName + ",";
          }
          if (safeNames) {
            safeNames = safeNames.substring(0, safeNames.lastIndexOf(","));
          }
          tmpData[i].securityGroupsNames = safeNames;
        }
        self.totalData = tmpData;
        self.loading = false;
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
    async onRefresh() {
      let self = this;
      await self.getListData();
      this.multipleSelection = [];
      this.$emit("selectStrategy", "");
    },
    handleSelectionChange(val) {
      let strategyInfo = Object.assign({}, val);
      this.multipleSelection = [val];
      this.$emit("selectStrategy", strategyInfo);
    },
    async queryClick() {
      let self = this;
      self.$refs.strategyTable.clearSelection();
      self.pageCount = true;
      await self.getData();
      this.multipleSelection = [];
      this.$emit("selectStrategy", "");
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
    }
  }
}
</script>
