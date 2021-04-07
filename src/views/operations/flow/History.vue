<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" @search="searchHandle" />
    <div class="divider clearfix"></div>
    <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
    </operation-panel>
    <el-table ref="historyTable" :data="tableData" v-loading="loading" :element-loading-text="$t('opt.dataLoading')" highlight-current-row border stripe style="width: 100%;" slot="empty" row-key="actionId" :default-sort="{prop:'auditTime', order:'descending'}" @selection-change="handleSelectionChange" @sort-change="sortChange">
      <el-table-column reserve-selection type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('orderName') >= 0" prop="orderName" align="left" :label="$t('opt.orderNumber')" min-width="100" sortable="custom">
        <template slot-scope="scope">
          <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.orderName}}</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('projectName') >= 0" prop="projectName" align="left" :label="$t('opt.project')" min-width="100">
        <template slot-scope="scope">
          <span v-html="projectRender(scope.row.projectName, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('resType') >= 0" prop="resType" align="left" :label="$t('opt.businessType')" min-width="100">
        <template slot-scope="scope">
          <span v-html="resTypeRender(scope.row.resType, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('applicant') >= 0 && showFlag" prop="applicant" align="left" :label="$t('opt.proposer')" min-width="100">
        <template slot-scope="scope">
          <span v-html="applicantRender(scope.row.applicant, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('createTime') >= 0" prop="createTime" align="left" :label="$t('opt.applicationTime')" min-width="100" sortable="custom">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('approveResult') >= 0" prop="approveResult" align="left" :label="orderResult" min-width="100">
        <template slot-scope="scope">
         <span v-html="approverResultRender(scope.row.approveResult, scope.row)" v-if="showFlag"></span>
         <span v-html="stateRender(scope.row.approveResult, scope.row)" v-if="!showFlag"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('auditTime') >= 0" prop="auditTime" align="left" :label="$t('opt.approvalTime')" min-width="100" sortable="custom">
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
          <page :totalData="totalData" @getCurrentData="getCurrentData"
          :sortObj="sortObj"></page>
        </el-col>
      </el-row>
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
    </div>
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
            label: this.$t('opt.orderNumber'),
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
            label: this.$t('opt.resourceType'),
            type: "select",
            options: []
          },
          time: {
            label: this.$t('opt.applicationTime'),
            type: "date-picker",
            pickerType: 'daterange'
          }
        }
      },
      sortObj:{
        sortOrder:"ascending",
        sortField:"auditTime"
      },
      formInline: {
        name: '',
        query_project: '',
        projectName: '',
        resTypeSel: "",
        applicantTime: []
      },
      selProjectFlg: false,
      orderProId:"",
      close: "",
      rules: {
        name: [
          { type: 'maxSize', value: 40 }
        ]
      },
      // resTypeOption: [],
      showFlag: Vue.roleType != "3",
      showProjectFlag: Vue.roleType == "0",
      orderResult: Vue.roleType == "3" ? this.$t('opt.status') : this.$t('opt.approveResult'),
      detailFlag: false,
      operationMenus: [{
        icon: "fa-times",
        name: Vue.t('opt.delete'),
        showflg: Vue.roleType == "3",
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          self.$prompt(self.$t('opt.enterYesContinuedOperation'), self.$t('opt.deleteConfirm'), {
            confirmButtonText: self.$t('opt.confirm'),
            cancelButtonText: self.$t('opt.cancel'),
            inputPattern:/^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage:self.$t('opt.onlyAcceptYesOrNo')
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
              self.$sequence({
                type: 'DELETE',
                url: 'api/leo/v1/order/delete_order/{id}',
                params: selectRows,
                success: function(result) {
                  self.$message.success(Vue.t('opt.deleteSuccess'));
                  self.$refs.historyTable.clearSelection();
                  self.loadData();
                },
                log:{
                  description:{
                    en:"delete order",
                    zh_cn:self.$t('opt.deleteOrder')
                  },
                  key: "orderName",
                  target:Vue.logTarget.Order
                },
                errFun:function() {
                  self.$refs.historyTable.clearSelection();
                  setTimeout( function() {
                    self.loadData({
                      page: 1
                    });
                    self.loading = false;
                  }, 5000);
                }
              }).then((data) => {
                self.loading = true;
                self.$refs.historyTable.clearSelection();
                self.currentPage = 1;
                setTimeout( function() {
                  self.loadData({
                    page: 1
                  });
                  self.loading = false;
                }, 5000);
              }).catch((err) => {});
            }
          }).catch(() => {
          });
        }.bind(this)
      }],
      multipleSelection: [],
      projectOption: [],
      tableData: [],
      totalData: [],
      listPara: {
        page: 1,
        pageSize: 10
      },
      loading: false,
      columnsChecked: ["orderName", "resType", "approveResult", "applicant", "projectName", "createTime", "auditTime"],
      columns: [{
        prop: "orderName",
        label: Vue.t('opt.orderNumber'),
        flg: true
      }, {
        prop: "projectName",
        label: this.$t('opt.project'),
        flg: true
      }, {
        prop: "resType",
        label: Vue.t('opt.businessType'),
        flg: true
      }, {
        prop: "applicant",
        label: this.$t('opt.proposer'),
        flg: Vue.roleType !== "3"
      }, {
        prop: "createTime",
        label: Vue.t('opt.applicationTime'),
        flg: true
      }, {
        prop: "approveResult",
        label: Vue.roleType == "3" ? this.$t('opt.status') : this.$t('opt.approveResult'),
        flg: true
      }, {
        prop: "auditTime",
        label: Vue.t('opt.approvalTime'),
        flg: true
      }],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 50, 200],
      total: 1,
      userMaps: new Map(),
      projectMaps: new Map(),
      selOrderId: ""
    }
  },
  mounted() {
    var self = this;
    var roleType = Vue.roleType + "";
    if ("0" == roleType || "2" == roleType) {
      Promise.all([self.getProjectList(), self.getUserList(), self.getResourceTypeList()]).then(function(result) {
          self.loadData();
      });
    } else {
      Promise.all([self.getUserList(), self.getResourceTypeList()]).then(function(result) {
          self.loadData();
      });
    };
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
  methods:{
    searchHandle(v = {}) {
      if (Vue.roleType == "0") {
        this.formInline.query_project = v.project ? v.project : '';
      }
      this.formInline.applicantTime = v.time ? v.time : [];
      this.formInline.name = v.orderNumber ? v.orderNumber : '';
      this.formInline.resTypeSel = v.resourceType ? v.resourceType : '';

      this.loadData();
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
        for (var p = 0; p < userList.length; p++) {
          var obj = userList[p];
          self.userMaps.set(obj.id, obj.name);
        }
      } catch (res) {
        console.log(self.$t('opt.getUserFailed'));
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
        console.log(self.$t('opt.getResourceListFailed'));
      }
    },
    async getProjectList() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/projects?domain_id=default";
      if ("2" == roleType || "3" == roleType) {
        //非超级管理员，查询一个项目信息
        url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
      }
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        self.loading = false;
        if ("2" == roleType || "3" == roleType) {
          self.projectOption.push(result['project']);
          self.projectMaps.set(result['project'].id, result['project'].name);
        } else {
          var projects = result['projects'];
          for (var q = 0; q < projects.length; q++) {
            self.projectMaps.set(projects[q].id, projects[q].name);
            self.projectMaps.set("all", self.$t('opt.all'));
          }
          self.projectOption.push({"name":"", "id":""});
          self.projectOption = self.projectOption.concat(result['projects']);
        }
        self.loading = false;
      } catch (res) {
        console.log(self.$t('opt.getProjectListFailed'));
      }
    },
    async loadData() {
      var self = this;
      self.loading = true;
      var projectUserId = "";
      if (Vue.roleType == "3") {
        projectUserId = Vue.userId;
      } else {
        projectUserId = "";
      };
      var roleType = Vue.roleType + "";
      var projectId = "";
      if ("0" == roleType) {
        projectId = self.formInline.query_project;
      }
      var applicantTime = self.formInline.applicantTime;
      var preApplicantTime = "";
      var aftApplicantTime = "";
      if (applicantTime != "" && applicantTime != null) {
        if (applicantTime[0] != null) {
          preApplicantTime = applicantTime[0].getFullYear() + '-' + (applicantTime[0].getMonth() + 1) + '-' + applicantTime[0].getDate();
        }
        if (applicantTime[1] != null) {
          aftApplicantTime = applicantTime[1].getFullYear() + '-' + (applicantTime[1].getMonth() + 1) + '-' + applicantTime[1].getDate();
        }
      };
      var queryOrderName = self.formInline.name;
      var queryResType = self.formInline.resTypeSel;
      var params = {};
      var url = "";
      if (Vue.roleType == "3") {
        params = {
          "applicant_id": projectUserId,
          "order_type": "FLOWORDER",
          "order_state": "1",
          "project_id": projectId,
          "order_name": queryOrderName,
          "pre_applicant_time": preApplicantTime,
          "aft_applicant_time": aftApplicantTime,
          "resource_id": queryResType
        };
        url = "api/leo/v1/order/get_applicant_order_list";
      } else {
        params = {
          "order_type": "FLOWORDER",
          "approver_id": Vue.userId,
          "project_id": projectId,
          "order_name": queryOrderName,
          "pre_applicant_time": preApplicantTime,
          "aft_applicant_time": aftApplicantTime,
          "resource_id": queryResType
        };
        url = "api/leo/v1/order/get_approve_history_list";
      };
      params = JSON.stringify(params);
      self.loading = false;
      try {
        let result = await self.$ajax({
          type: 'PUT',
          data: params,
          url: url
        });
        self.loading = false;
        self.totalData = [];
        for (let i = 0; i < result.data.length; i++) {
          var obj = {};
          obj.id = result.data[i].order_id;
          obj.actionId = result.data[i].action_id;
          obj.orderName = result.data[i].order_name;
          obj.projectName = result.data[i].project_name;
          obj.resType = result.data[i].resource_type;
          obj.projectId = result.data[i].project_id;
          obj.applicant = result.data[i].applicant_id;
          obj.createTime = result.data[i].created_at || result.data[i].applicant_time;
          obj.approveResult = result.data[i].approver_result || result.data[i].order_state;
          obj.auditTime = result.data[i].approve_time;
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
    approverResultRender(value, rowData) {
      let self = this;
      let approveResult = rowData['approveResult'];
      let result = "";
      switch (approveResult) {
        case "PASSED":
          result = self.$t('opt.approvePass');
          break;
        case "REJECTED":
          result = self.$t('opt.approveFail');
          break;
        case "AUTO_PASSED":
          result = self.$t('opt.autoPassed');
          break;
        default:
          result = "-"
      };
      return result;
    },
    stateRender(value, rowData) {
      let self = this
      let status = rowData['approveResult'];
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
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData();
    },
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.listPara.page = val;
      this.loadData();
    },
    searchOrder() {
      this.loadData();
    },
    rowNameClick(rowIndex, rowData) {
      this.detailFlag = true;
      this.selOrderId = rowData['id'];
      this.orderProId = rowData['projectId'];
    },
    onBack() {
      this.detailFlag = false;
    },
    handleShow() {
      this.detailFlag = false;
    },
    getCurrentData(param) {
      this.tableData = param;
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
