<template>
  <div>
      <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
      <div class="divider clearfix"></div>
      <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
      <el-table ref="shTable" :data="tableData" v-loading="loading" :element-loading-text="$t('opt.dataLoading')" highlight-current-row border stripe style="width: 100%;" slot="empty" max-height='500' row-key="orderId" :default-sort="{prop:'orderName', order:'ascending'}" @selection-change="handleSelectionChange" @sort-change="sortChange">
        <el-table-column reserve-selection type="selection" align="center" width="55">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('orderName') >= 0" prop="orderName" :label="$t('opt.orderNumber')" align="left" sortable="custom" min-width="100">
          <template slot-scope="scope">
            <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.orderName}}</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('projectName') >= 0 && projectShowFlag" prop="projectName" :label="$t('opt.project')" align="left" sortable="custom" min-width="100">
          <template slot-scope="scope">
            <span v-html="projectRender(scope.row.projectName, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('resType') >= 0" prop="resType" align="left" :label="$t('opt.businessType')" min-width="100">
          <template slot-scope="scope">
            <span v-html="resourceRender(scope.row.resType, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('proposer') >= 0" prop="proposer" align="left" :label="$t('opt.proposer')" min-width="100">
          <template slot-scope="scope">
            <span v-html="applyRender(scope.row.proposer, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('desc') >= 0" prop="desc" align="left" :label="$t('opt.description')" min-width="100">
          <template slot-scope="scope">
            <span v-html="descRender(scope.row.desc, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('applicantTime') >= 0" prop="applicantTime" align="left" :label="$t('opt.applicationTime')" min-width="100" sortable="custom">
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span>{{$t('opt.currentSelected')}}{{multipleSelection.length}}{{$t('opt.item')}}</span>
            <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <template v-for="(item, index) in columns" v-if="item.flg">
                  <el-checkbox class="item" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </template>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('opt.selectColumn')}}</el-tag>
              </div>
            </el-popover>
          </el-col>
          <el-col :span="19">
            <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
          </el-col>
        </el-row>
      </div>
      <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
      <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix">
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('opt.backTo')}}</el-button>
            </div>
            <div>
              <handle-operate ref="HandleOperate" :orderProId="orderProId" :selOrderId="selOrderId" :userMaps="userMaps" :userLists="userLists"></handle-operate>
            </div>
          </panel>
        </div>
      </transition>
  </div>
</template>
<script>
import HandleOperate from './FlowHisDialog';
export default {
  name: "Pending",
  components: {
      HandleOperate
  },
  data() {
    return {
      sortObj:{
        sortOrder:"ascending",
        sortField:"orderName"
      },
      orderProId:"",
      formInline: {
        name: "",
        query_project: '',
        projectName: "",
        resTypeSel: '',
        applicantTime: []
      },
      selProjectFlg: false,
      close: "",
      rules: {
        name: [
          { type: 'maxSize', value: 40 }
        ]
      },
      projectShowFlag: Vue.roleType == "0",
      multipleSelection: [],
      operFlag: false,
      detailFlag: false,
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('opt.approval'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          let parentPath = self.$route.matched[1].path;
          self.orderId = selectRows[0].orderId;
          this.$router.push({
            name:"flowDetail",
            params: {
              orderId: self.orderId,
              userMaps: self.userMaps,
              selectRow: selectRows[0]
            }
          });
        }.bind(this)
      }],
      orderId: "",
      tableData: [],
      listPara: {
        page: 1,
        pageSize: 10
      },
      loading: false,
      totalData: [],
      columnsChecked: ["orderName", "projectName", "desc", "resType", "proposer", "applicantTime"],
      columns: [{
        prop: "orderName",
        label: Vue.t('opt.orderNumber'),
        flg: true
      }, {
        prop: "projectName",
        label: Vue.t('opt.project'),
        flg: true
      }, {
        prop: "resType",
        label: Vue.t('opt.businessType'),
        flg: true
      }, {
        prop: "proposer",
        label: Vue.t('opt.proposer'),
        flg: true
      }, {
        prop: "desc",
        label: Vue.t('opt.description'),
        flg: true
      }, {
        prop: "applicantTime",
        label: Vue.t('opt.applicationTime'),
        flg: true
      }],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 50, 200],
      total: 1,
      userMaps: new Map(),
      userLists: [],
      resourceMaps: new Map(),
      selOrderId: "",
      searchBar: {
        conditions: {
          name: {
            label: this.$t('opt.orderNumber'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          query_project: {
            label: this.$t('opt.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          },
          resTypeSel: {
            label: this.$t('opt.resourceType'),
            type: 'select',
            options: []
          },
          applicantTime: {
            label: this.$t('opt.applicationTime'),
            type: 'date-picker',
            pickerType: 'daterange'
          }
        },
        validatedParams: {}
      }
    }
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
  },
  mounted() {
    var self = this;
    var roleType = Vue.roleType + "";
    if ("0" == roleType || "2" == roleType) {
      Promise.all([self.loadProjectList(), self.getUserList(), self.getResourceTypeList()]).then(function(result) {
        self.loadData();
      });
    }
    this.autoReloadTableData();
  },
  methods: {
    autoReloadTableData() {
      let self = this;
      clearInterval(self.interVmValid);
      self.interVmValid = setInterval(() => {
        self.loadData();
      }, 180000);
    },
    async loadProjectList() {
      const $this = this;
      var url = `api/keystone/v3/projects?domain_id=default`;
      if ($this.roleType === '2' || $this.roleType === '3') { //非超级管理员，查询一个项目信息
        url = `api/keystone/v3/projects/${this.$cookie.get("pid")}`;
      }
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        let projects = result['projects'];
        $this.searchBar.conditions.query_project.options = result.projects.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async getResourceTypeList() {
      var self = this;
      var resultData = [];
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/leo/v1/resource/get_flow_order_all"
        });
        let resources = ret.resource;
        for (let i = 0; i < resources.length; i++) {
          let type = resources[i];
          let name = "";
          if (type['resource_type'] == 'VM') {
            name = self.$t('opt.cloudHost');
          } else if (type['resource_type'] == 'VOLUME') {
            name = self.$t('opt.cloudHardDisk');
          } else if (type['resource_type'] == 'HOST'&&Vue.service.ironic) {
            name = self.$t('opt.cloudPhysicalHost');
          } else if (type['resource_type'] == 'PROJECT') {
            name = self.$t('opt.project');
          }
          if (name) {
            self.searchBar.conditions.resTypeSel.options.push({
              value: type['id'],
              label: name
            });
          }
        }
      } catch (data) {
        console.log(self.$t('opt.getResourceListFailed'));
      }
    },
    async loadData() {
      var self = this;
      self.$refs.shTable.clearSelection();
      self.loading = true;
      var approverId = Vue.userId;
      var approverName = Vue.userName;
      var roleType = Vue.roleType + "";
      var projectId = "";
      if ("0" == roleType) {
        projectId = self.searchBar.validatedParams.query_project;
      } else {
        projectId = "";
      };
      var queryOrderName = self.searchBar.validatedParams.name;
      var preApplicantTime = "";
      var aftApplicantTime = "";
      var applicantTime = self.searchBar.validatedParams.applicantTime;
      if (applicantTime !="" && applicantTime != null) {
        if (applicantTime[0] != null) {
          preApplicantTime = applicantTime[0].getFullYear() + '-' + (applicantTime[0].getMonth() + 1) + '-' + applicantTime[0].getDate();
        }
        if (applicantTime[1] != null) {
          aftApplicantTime = applicantTime[1].getFullYear() + '-' + (applicantTime[1].getMonth() + 1) + '-' + applicantTime[1].getDate();
        }
      };
      var queryResType = self.searchBar.validatedParams.resTypeSel;
      var params = {
        "role_type": Vue.roleType,
        "approver_id": approverId,
        "order_type": "FLOWORDER", //FLOWORDER
        "project_id": projectId,
        "pre_applicant_time": preApplicantTime,
        "aft_applicant_time": aftApplicantTime,
        "resource_id": queryResType,
        "order_name": queryOrderName
      };
      params = JSON.stringify(params);
      self.loading = false;
      try {
        let result = await self.$ajax({
          type: 'PUT',
          data: params,
          url: "api/leo/v1/order/get_approve_order_list"
        });
        self.loading = false;
        self.totalData = [];
        for (let i = 0; i < result.data.length; i++) {
          let applyProjectName = "";
          if (result.data[i].resource_type === "PROJECT.CREATE") {
            let orderData = JSON.parse(result.data[i].order_data);
            applyProjectName = orderData.create.name;
          }
          let {
            order_id: orderId,
            order_name: orderName,
            resource_type: resType,
            order_data: orderData,
            project_id,
            project_name:projectName,
            op_desc: desc,
            applicant_id: proposer,
            applicant_time: applicantTime
          } = result.data[i];
          let obj = { orderId, orderName, resType, orderData, projectName, project_id, desc, proposer, applicantTime, applyProjectName };
          self.totalData.push(obj);
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    rowNameClick(rowIndex, rowData) {
      this.detailFlag = true;
      this.selOrderId = rowData['orderId'];
      this.orderProId = rowData['projectId'];
      this.$refs.shTable.clearSelection();
    },
    onBack() {
      this.detailFlag = false;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData();
    },
    handleShow() {
      this.operFlag = false;
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    projectRender(value, rowData) {
      let self = this;
      let projectName = rowData['projectName'];
      let result = "";
      if (projectName != "" && projectName != null) {
        result = projectName;
      } else {
        result = "-";
      };
      return result;
    },
    resourceRender(value, rowData) {
      let self = this
      let resourceType = rowData['resType'];
      let resourceName = "";
      switch (resourceType) {
        case "VM.CREATE":
          resourceName = self.$t('opt.createCloudHost');
          break;
        case "VM.UPDATE":
          resourceName = self.$t('opt.updateCloudHost');
          break;
        case "VOLUME.CREATE":
          resourceName = self.$t('opt.createCloudHardDisk');
          break;
        case "VOLUME.UPDATE":
          resourceName = self.$t('opt.updateCloudHardDisk');
          break;
        case "PROJECT.CREATE":
          resourceName = self.$t('opt.createProject');
          break;
        case "HOST.CREATE":
          resourceName = self.$t('opt.cloudPhysicalHost');
          break;
        default:
          resourceName = "-"
      };
      return resourceName;
    },
    applyRender(value, rowData) {
      let self = this;
      let applyId = rowData['proposer'];
      let result = "";
      if (self.userMaps.has(applyId)) {
        result = self.userMaps.get(applyId);
      } else {
        result = "-";
      }
      return result;
    },
    descRender(value, rowData) {
      let self = this;
      let description = rowData['desc'];
      let result = "";
      if (description != "" && description != null) {
        result = description;
      } else {
        result = "-";
      };
      return result;
    },
    async getUserList() {
      var param = {
        domain_id: "default"
      };
      var self = this;
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/inspur/users?" + $.param(param)
        });
        let userList = result["users"];
        self.userLists = userList;
        for (var p = 0; p < userList.length; p++) {
          var obj = userList[p];
          self.userMaps.set(obj.id, obj.name);
        }
      } catch (res) {
        console.log(self.$t('opt.getUserFailed'));
      }
    },
    onIconClick() {
      this.formInline.query_project = '';
      this.formInline.projectName = '';
      this.close = '';
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
      this.close = 'circle-close';
    },
     //排序
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.loadData();
    }
  }
}
</script>
