<template>
  <div>
    <icos-page-header :title="$t('opt.orderStatistics')" :show-bottom-border="true" />
    <icos-page>
      <icos-search-bar :conditions="searchBar.conditions" @search="searchHandle" />
      <el-form :inline="true" :model="formOrderList" class="formInline">
        <el-form-item :label="$t('opt.approving')"><span>{{formOrderList.approvingNum}};</span></el-form-item>
        <el-form-item :label="$t('opt.approved')"><span>{{formOrderList.approvedNum}};</span></el-form-item>
        <el-form-item :label="$t('opt.handled')"><span>{{formOrderList.handledNum}};</span></el-form-item>
        <el-form-item :label="$t('opt.repulse')"><span>{{formOrderList.repulseNum}};</span></el-form-item>
        <el-form-item :label="$t('opt.fail')"><span>{{formOrderList.failNum}}</span></el-form-item>
      </el-form>
      <div class="divider clearfix"></div>
      <el-table ref="historyTable" :data="tableData" v-loading="loading" :element-loading-text="$t('opt.dataLoading')" highlight-current-row border stripe style="width: 100%;" row-key="id" :default-sort="{prop:'orderName', order:'ascending'}" @selection-change="handleSelectionChange" @sort-change="sortChange">
        <el-table-column reserve-selection type="selection" align="center" width="55">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('orderName') >= 0" prop="orderName" align="left" :label="$t('opt.orderNumber')" min-width="100" sortable="custom">
          <template slot-scope="scope">
            <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.orderName}}</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('projectName') >= 0 && projectSelectFlag" prop="projectName" align="left" :label="$t('opt.project')" min-width="100">
          <template slot-scope="scope">
            <span v-html="projectRender(scope.row.projectName, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('resType') >= 0" prop="resType" align="left" :label="$t('opt.resourceType')" min-width="100">
          <template slot-scope="scope">
            <span v-html="resTypeRender(scope.row.resType, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('bussinessType') >= 0" prop="bussinessType" align="left" :label="$t('opt.businessType')" min-width="100">
          <template slot-scope="scope">
            <span v-html="bussinessTypeRender(scope.row.resType, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" align="left" :label="$t('opt.status')" min-width="100">
          <template slot-scope="scope">
            <span v-html="stateRender(scope.row.status, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('applicant') >= 0" prop="applicant" align="left" :label="$t('opt.proposer')" min-width="100">
          <template slot-scope="scope">
            <span v-html="applicantRender(scope.row.applicant, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('createTime') >= 0" prop="createTime" align="left" :label="$t('opt.applicationTime')" min-width="100" sortable="custom">
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
            <page :totalData="totalData"  @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
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
              <handle-operate ref="HandleOperate" :orderProId="orderProId" :selOrderId="selOrderId" :userMaps="userMaps" @handleShow="handleShow" @loadData="loadData" @clearSelOption="clearSelOption"></handle-operate>
            </div>
          </panel>
        </div>
      </transition>
    </icos-page>
  </div>
</template>
<script>
import HandleOperate from './FlowHisDialog';
import {loadProject} from 'utils/xmlHttpRequestCommon';

export default {
  name: "handling",
  components: {
    HandleOperate
  },
  data() {
    let that = this
    return {
      searchBar: {
        conditions: {
          orderNumber: {
            label: this.$t("opt.orderNumber"),
            type: "input",
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          project: {
            label: this.$t("base.project"),
            type: "select",
            visible: String(Vue.roleType) === "0",
            options: []
          },
          resourceType: {
            label: this.$t("opt.resourceType"),
            type: "select",
            options: []
          },
          status: {
            label: this.$t("opt.status"),
            type: "select",
            options: [
              {
                value: "SUPER_ADMIN_APPROVING,APPROVING",
                label: this.$t("opt.approving")
              },
              { value: "PASSED", label: this.$t("opt.approved") },
              { value: "HANDLED", label: this.$t("opt.handled") },
              { value: "REJECTED", label: this.$t("opt.repulse") },
              { value: "REVOCATION", label: this.$t("opt.fail") }
            ]
          },
          time: {
            label: this.$t("opt.applicationTime"),
            type: "date-picker",
            pickerType: "daterange"
          }
        }
      },
      sortObj:{
        sortOrder:"ascending",
        sortField:"orderName"
      },
      formInline: {
        query_project: "",
        projectName: "",
        name: "",
        applicantTime: [],
        resTypeSel: "",
        flow_status: ""
      },
      selProjectFlg: false,
      close: "",
      rules: {
        name: [
          { type: 'maxSize', value: 40 }
        ]
      },
      formOrderList: {
        approvedNum: "",
        approvingNum: "",
        handledNum: "",
        repulseNum: "",
        failNum: ""
      },
      orderProId:"",
      // resTypeOption: [],
      detailFlag: false,
      projectSelectFlag: Vue.roleType == "0",
      multipleSelection: [],
      tableData: [],
      totalData: [],
      listPara: {
        page: 1,
        pageSize: 10
      },
      loading: false,
      columnsChecked: ["orderName", "bussinessType", "createTime", "applicant", "projectName", "resType", "status"],
      columns: [{
        prop: "orderName",
        label: Vue.t('opt.orderNumber'),
        flg: true
      }, {
        prop: "projectName",
        label: Vue.t('opt.project'),
        flg: Vue.roleType !== "2"
      }, {
        prop: "resType",
        label: Vue.t('opt.resourceType'),
        flg: true
      }, {
        prop: "bussinessType",
        label: Vue.t('opt.businessType'),
        flg: true
      }, {
        prop: "status",
        label: Vue.t('opt.status'),
        flg: true
      }, {
        prop: "applicant",
        label: Vue.t('opt.proposer'),
        flg: true
      }, {
        prop: "createTime",
        label: Vue.t('opt.applicationTime'),
        flg: true
      }],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 50, 200],
      total: 1,
      userMaps: new Map(),
      projectMaps: new Map(),
      selOrderId: "",
      projectOption: []
    }
  },
  mounted() {
    var self = this;
    var roleType = Vue.roleType + "";
    if ("0" == roleType || "2" == roleType) {
      Promise.all([self.getProjectList(), self.getUserList(), self.getResourceTypeList(), self.getOrderNum()]).then(function(result) {
        self.loadData();
      });
    }

    if (String(Vue.roleType) === "0") {
      loadProject()
        .then(v => {
          this.searchBar.conditions.project.options = Array.from(v, v => {
            return { label: v.name, value: v.id };
          });
        })
        .catch(v => {});
    }
  },
  methods: {
    searchHandle(v = {}) {
      if (Vue.roleType == "0") {
        this.formInline.query_project = v.project ? v.project : '';
      }
      this.formInline.applicantTime = v.time ? v.time : [];
      this.formInline.name = v.orderNumber ? v.orderNumber : '';
      this.formInline.resTypeSel = v.resourceType ? v.resourceType : '';
      this.formInline.flow_status = v.status ? v.status : '';

      this.loadData();
    },
    async getProjectList() {
      var self = this;
      var roleType = Vue.roleType + "";
      if ("0" == roleType) {
        var url = "api/keystone/v3/projects?domain_id=default";
        self.loading = true;
        try {
          let result = await this.$ajax({
            type: "GET",
            url: url
          });
          self.loading = false;
          let projectList = result["projects"];
          self.projectOption = projectList;
          for (var q = 0; q < projectList.length; q++) {
            self.projectMaps.set(projectList[q].id, projectList[q].name);
          };
          self.loading = false;
        } catch (res) {
          console.log(Vue.t('opt.getProjectListFailed'));
        }
      }
    },
    async getOrderNum () {
      var self = this;
      var params = {
        "order_type": "FLOWORDER",
        "role_type": Vue.roleType,
        "project_id": self.$cookie.get('pid')
      };
      params = JSON.stringify(params);
      try {
        let ret = await self.$ajax({
          type: "PUT",
          data: params,
          url: "api/leo/v1/order/get_order_amount"
        });
        self.formOrderList.approvingNum = ret.data.approving_number;
        self.formOrderList.approvedNum = ret.data.passed_number;
        self.formOrderList.handledNum = ret.data.handled_number;
        self.formOrderList.repulseNum = ret.data.rejected_number;
        self.formOrderList.failNum = ret.data.revocation_number;
      } catch (res) {
        console.log(Vue.t('opt.getOrderCountNumberFailed'));
      }
    },
    async getResourceTypeList() {
      var self = this;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/leo/v1/resource/get_flow_order_all"
        });
        let resources = ret.resource;
        self.searchBar.conditions.resourceType.options = [];
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
            // self.resTypeOption.push({
            //   value: type['id'],
            //   label: name
            // })

            self.searchBar.conditions.resourceType.options.push({
              value: type['id'],
              label: name
            });
          }
        }
      } catch (data) {
        console.log(Vue.t('opt.getResourceListFailed'));
      }
    },
    async getUserList() {
      var param = {domain_id:"default"};
      var self = this;
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/inspur/users?"+ $.param(param)
        });
        let userList = result["users"];
        for (var p = 0; p < userList.length; p++) {
          var obj = userList[p];
          self.userMaps.set(obj.id, obj.name);
        }
      } catch (res) {
        console.log(Vue.t('opt.getUserFailed'));
      }
    },
    async loadData() {
      var self = this;
      self.$refs.historyTable.clearSelection();
      self.loading = false;
      var projectId = "";
      if (Vue.roleType == "0") {
        projectId = self.formInline.query_project;
      } else {
        projectId = self.$cookie.get('pid');
      };
      var queryOrderName = self.formInline.name;
      var applicantTime = self.formInline.applicantTime;
      var preApplicantTime = "";
      var aftApplicantTime = "";
      let currentTime = new Date();
      currentTime = currentTime.getTime();
      let num = 0;
      if (applicantTime !="" && applicantTime != null) {
        console.log(applicantTime);
        if (applicantTime[0] != null) {
          if (applicantTime[0].getTime() > currentTime) {
            num = num + 1;
          }
          preApplicantTime = applicantTime[0].getFullYear() + '-' + (applicantTime[0].getMonth() + 1) + '-' + applicantTime[0].getDate();
        }
        if (applicantTime[1] != null) {
          if (applicantTime[1].getTime() > currentTime) {
            num = num + 2;
          }
          aftApplicantTime = applicantTime[1].getFullYear() + '-' + (applicantTime[1].getMonth() + 1) + '-' + applicantTime[1].getDate();
        }
      };
      this.loading = true;
      var queryResType = self.formInline.resTypeSel;
      var queryFlowStatus = self.formInline.flow_status;
      var params = {
        "order_type": "FLOWORDER",
        "project_id": projectId,
        "pre_applicant_time": preApplicantTime,
        "aft_applicant_time": aftApplicantTime,
        "resource_id": queryResType,
        "order_name": queryOrderName,
        "order_state": queryFlowStatus
      };
      params = JSON.stringify(params);
      self.loading = false;
      try {
        let result = await self.$ajax({
          type: 'PUT',
          data: params,
          url: "api/leo/v1/order/get_order_list"
        });
        self.loading = false;
        self.totalData = [];
        for (let i=0; i<result.data.length; i++) {
          var obj = {};
          obj.id = result.data[i].order_id;
          obj.orderName = result.data[i].order_name;
          obj.resType = result.data[i].resource_type;
          obj.status = result.data[i].order_state;
          obj.projectId = result.data[i].project_id;
          obj.projectName = result.data[i].project_name;
          obj.applicant = result.data[i].applicant_id;
          obj.createTime = result.data[i].applicant_time;
          self.totalData.push(obj);
        }
        self.loading = false;
       } catch (res) {
        self.loading = false;
        console.log(Vue.t('opt.getOrderListFailed'));
      }
    },
    resTypeRender(value, rowData) {
      let self = this
      let resourceType = rowData['resType'];
      let resourceName = "";
      let resType = resourceType.split(".");
      switch (resType[0]) {
        case "VM":
          resourceName = self.$t('opt.cloudHost');
          break;
        case "VOLUME":
          resourceName = self.$t('opt.cloudHardDisk');
          break;
        case "PROJECT":
          resourceName = self.$t('opt.project');
          break;
        case "HOST":
          resourceName = self.$t('opt.cloudPhysicalHost');
          break;
        default:
          resourceName = "-"
      };
      return resourceName;
    },
    bussinessTypeRender(value, rowData) {
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
    stateRender(value, rowData) {
      let self = this
      let status = rowData['status'];
      let orderState = "";
      switch (status) {
        case "APPROVING":
          orderState = self.$t('opt.approving');
          break;
        case "SUPER_ADMIN_APPROVING":
          orderState = self.$t('opt.approving');
          break;
        case "PASSED":
          orderState = self.$t('opt.approved');
          break;
        case "HANDLED":
          orderState = self.$t('opt.handled');
          break;
        case "REVOCATION":
          orderState = self.$t('opt.fail');
          break;
        case "REJECTED":
          orderState = self.$t('opt.repulse');
          break;
        default:
          orderState = "-"
      };
      return orderState;
    },
    projectRender(value, rowData) {
      let self = this;
      let projectName = rowData['projectName'];
      let result = "";
      if (projectName != "" && projectName !=null) {
        result = projectName;
      } else {
        result = "-";
      };
      return result;
    },
    applicantRender(value, rowData) {
      let self = this;
      let result = "";
      let applicantId = rowData['applicant'];
      if (self.userMaps.has(applicantId)) {
        result = self.userMaps.get(applicantId);
      } else {
        result = "-";
      }
      return result;
    },
    rowNameClick(rowIndex, rowData) {
      this.detailFlag = true;
      this.selOrderId = rowData['id'];
      this.orderProId = rowData['projectId'];
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    onSubmit() {
      alert('Search')
    },
    approvalDetail(row) {
      this.detailFlag = true;
      this.$refs.historyTable.clearSelection();
    },
    onBack() {
      this.detailFlag = false;
    },
    handleShow() {
      this.detailFlag = false;
    },
    clearSelOption() {
      var self = this;
      self.$refs.historyTable.clearSelection();
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
    }
  }
}
</script>
