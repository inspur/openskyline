<template>
  <div>
  <icos-page-header title="QoS" :show-bottom-border="false" />
  <icos-page>
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
      ref="qoslistTable"
      :data="qoslistTableData"
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
        width="55"
        align="center">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        :label="$t('lang.name')"
        prop="name" sortable="custom"
        min-width="100">
        <!-- <template slot-scope="scope">
          <el-button @click="showDetail(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template> -->
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
        v-if="columnsChecked.indexOf('rules') >= 0"
        :label="$t('network.qosRule')"
        prop="rules"
        min-width="500">
        <template slot-scope="scope">
          <span v-html="rulesRender(scope.row.rules)"></span>
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
    <add-qos ref="addqos" v-if="addFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelQos"></add-qos>
    <!-- <edit-qos ref="editqos" v-if="editFlag" @handleQosShow="handleQosShow" @handleCancelShow="handleCancelQos" :editRow="editRow"></edit-qos> -->
    <qosrule-manage ref="qosrule" v-if="ruleFlag" @handleQosShow="handleQosShow" @handleCancelQos="handleCancelQos" :qosRow="editRow"></qosrule-manage>
  </icos-page>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import AddQos from './AddQos';
// import EditQos from './EditQos';
import QosruleManage from './QoSRuleManage';
import {onlyLetterNumberChinese} from '../validator/validator';
export default {
  name: "QosList",
  components: {
    AddQos, QosruleManage
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
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      loading: false,
      addFlag: false,
      editFlag: false,
      ruleFlag: false,
      roleType: Vue.roleType + "",
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "project_id",
        label: Vue.t('lang.project')
      }, {
        prop: "rules",
        label: Vue.t('network.qosRule')
      }, {
        prop: "description",
        label: Vue.t('lang.desc')
      }],
      columnsChecked: ['name', 'description', 'project_id', 'rules'],
      editRow: "",
      qoslistTableData: [],
      totalData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.createQosstrategy'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.addFlag = true;
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: Vue.t('network.editQosstrategy'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.ruleFlag = true;
          this.editRow = selectRows[0];
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('lang.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
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
                self.$refs.qoslistTable.clearSelection();
                for (let i = 0; i < selectRows.length; i++) {
                  let row = selectRows[i];
                  self.$ajax({
                    type: "DELETE",
                    url: "api/neutron/v2.0/qos/policies/"+row["id"],
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
                        en:"Delete QoS:" + row["name"],
                        zh_cn:"删除QoS策略:" + row["name"]
                      },
                      target:Vue.logTarget.qosList
                    }
                  });
                }
                setTimeout( function() {
                  self.getData();
                  self.loading = false;
                }, 1000)
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
        if (roleType != "0") {
          projectId = Vue.cookie.get('pid');
        }
        self.loading = true;
        let p = "";
        if (projectId != null && projectId != "") {
          p = '?project_id=' + projectId;
        }
        let result = await self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/qos/policies" + p,
          errorKey: "NeutronError"
        });
        let tempArr = result["policies"];
        self.totalData = [];
        for (let i =0; i< tempArr.length; i++) {
          let securityGroup = tempArr[i];
          if (securityGroup.name.indexOf(name) >=0) {
              self.totalData.push(securityGroup);
            }
        }
        self.loading = false;
        self.$refs.qoslistTable.clearSelection();
      } catch (res) {
        self.loading = false;
      }
    },
    getCurrentData(param) {
      this.qoslistTableData = param;
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
      this.getData();
    },
    onRefresh() {
      this.getData();
    },
    handleAddShow() {
      this.addFlag = false;
      this.getData();
    },
    handleQosShow() {
      this.editFlag = false;
      this.ruleFlag = false;
      this.getData();
    },
    handleCancelQos() {
      this.addFlag = false;
      this.editFlag = false;
      this.ruleFlag = false;
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.qoslistTable.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.qoslistTable.toggleRowSelection(row);
    },
    // showDetail(index, row) {
    //   let qosId = row["id"];
    //   this.$router.push({
    //     path: '/net/qosView/ruleView/'+qosId
    //   });
    // },
    async getProjectList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default",
          errorKey: "NeutronError"
        });
        Vue.projectListforNet = result["projects"];
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
    KbToKB(value) {
      let KBValue = 0;
      KBValue = parseInt(parseInt(value)/8)
      return KBValue;
    },
    rulesRender(rules) {
      if (rules.length == 0) {
        return "-"
      } else {
        let hasbrand = false;
        let hasdscp = false;
        for (let i=0; i<rules.length; i++) {
          let r = rules[i];
          if (r["type"] == "bandwidth_limit") {
            hasbrand = true
          } else if (r["type"] == "dscp_marking") {
            hasdscp = true;
          }
        }
        let ruleLabels = "<table style='width:100%;border:1px solid #ccc;margin-top: 5px; margin-bottom: 5px;'><tr><td style='border:1px solid #ccc; padding-left: 10px'>"+Vue.t('network.type')+"</td><td style='border:1px solid #ccc;padding-left: 10px'>"+
        Vue.t('network.direction')+"</td><td style='border:1px solid #ccc;padding-left: 10px'>"+
        Vue.t('network.maxkbpx')+"</td><td style='border:1px solid #ccc;padding-left: 10px'>"+
        Vue.t('network.burstkbps')+"</td><td style='border:1px solid #ccc;padding-left: 10px'>"+
        Vue.t('network.dscpmark')+"</td></tr>";
        for (let i=0; i<rules.length; i++) {
          let r = rules[i];
          if (r["type"] == "bandwidth_limit") {
            ruleLabels+= "<tr><td style='border:1px solid #ccc;padding-left: 10px'>Bandwidth</td><td style='border:1px solid #ccc;padding-left: 10px'>"+
              (r["direction"]=="ingress"?Vue.t('network.entrance'):Vue.t('network.chukou'))+"</td><td style='border:1px solid #ccc;padding-left: 10px'>"+
              this.KbToKB(r["max_kbps"])+"</td><td style='border:1px solid #ccc;padding-left: 10px'>"+
              this.KbToKB(r["max_burst_kbps"])+"</td><td style='border:1px solid #ccc;padding-left: 10px'>-</td></tr>"
          } else if (r["type"] == "dscp_marking") {
            ruleLabels+= "<tr><td style='border:1px solid #ccc;padding-left: 10px'>DSCP</td><td style='border:1px solid #ccc;padding-left: 10px'>"+
              Vue.t('network.chukou')+"</td><td style='border:1px solid #ccc;padding-left: 10px'>"+
              "-"+"</td><td style='border:1px solid #ccc;padding-left: 10px'>"+
              "-"+"</td><td style='border:1px solid #ccc;padding-left: 10px'>"+
              r["dscp_mark"]+"</td></tr>"
          }
        }
        ruleLabels+="</table>"
        return ruleLabels;
      }
    }
  }
}
</script>
