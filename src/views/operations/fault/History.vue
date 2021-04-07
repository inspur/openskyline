<template>
  <div>
<!--
    <el-form :inline="true" :model="formInline" class="form-inline" :rules="rules">
      <el-form-item :label="$t('opt.oddNumber')" prop="oddNumber">
        <el-input size="small" v-model="formInline.oddNumber"></el-input>
      </el-form-item>
      <el-form-item :label="$t('opt.project')" v-show="isAdmin()">
        <el-input auto-complete="off" style="width:160px;" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="formInline.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('opt.submitTime')">
        <el-date-picker v-model="formInline.applicantTime" type="daterange" :placeholder="$t('opt.selectTimeRange')" format="yyyy-MM-dd"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' size="small" @click="loadData">{{$t('opt.doQuery')}}</el-button>
      </el-form-item>
    </el-form>
-->
    <icos-search-bar :conditions="searchBar.conditions" @search="searchHandle" />

    <div class="divider clearfix"></div>
    <el-table
      ref="historyTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('opt.dataLoading')"
      highlight-current-row
      border
      stripe
      style="width: 100%;"
      slot="empty"
      max-height='500'
      row-key="businessId"
      :default-sort="{prop:'level', order:'ascending'}"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('businessNum') >= 0"
        prop="businessNum"
        align="left"
        :label="$t('opt.oddNumber')"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.businessNum}}</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('level') >= 0"
        prop="level"
        :label="$t('opt.faultLevel')"
        align="left"
        sortable="custom"
        min-width="50">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.level)">
            <span v-html="statusRender(scope.row.level, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('projectId') >= 0"
        prop="projectId"
        align="left"
        :label="$t('opt.project')"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="projectRender(scope.row.project, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('businessType') >= 0"
        prop="businessType"
        align="left"
        :label="$t('opt.type')"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="faultLevelRender(scope.row.businessType, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('auditUser') >= 0"
        prop="auditUser"
        align="left"
        :label="$t('opt.submitUser')"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="volumeUserRender(scope.row.auditUser, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('createTime') >= 0"
        prop="createTime"
        align="left"
        :label="$t('opt.submitTime')"
        sortable="custom"
        min-width="100">
      </el-table-column>
       <el-table-column v-if="columnsChecked.indexOf('approveTime') >= 0"
        prop="approveTime"
        align="left"
        :label="$t('opt.approvalTime')"
        sortable="custom"
        min-width="100">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('opt.currentSelected')}}{{multipleSelection.length}}{{$t('opt.item')}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
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
      <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
      <transition name="slide-right" mode="out-in">
        <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
          <panel style="height: 100%">
            <div slot="title" class="clearfix">
              <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('opt.backTo')}}</el-button>
            </div>
            <div>
              <fault-detail ref="FaultDetail" :selOrderId="selOrderId" :userMaps="userMaps" :faultTypeMaps="faultTypeMaps" @handleShow="handleShow" @loadData="loadData" @clearSelOption="clearSelOption"></fault-detail>
            </div>
          </panel>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import FaultDetail from './FaultHisDialog';
import {loadProject} from 'utils/xmlHttpRequestCommon';
export default {
  name: "handling",
  components: { FaultDetail },
  data() {
    let that = this
    return {
      searchBar: {
        conditions: {
          oddNumber: {
            label: this.$t("opt.oddNumber"),
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
          time: {
            label: this.$t("opt.submitTime"),
            type: "date-picker",
            pickerType: "daterange"
          }
        }
      },
      sortObj:{
        sortOrder:"ascending",
        sortField:"level"
      },
      formInline: {
        oddNumber: "",
        query_project: '',
        projectName: "",
        applicantTime: []
      },
      selProjectFlg: false,
      close: "",
      rules: {
        oddNumber: [
          { type: 'maxSize', value: 40 }
        ]
      },
      handleFlag: false,
      detailFlag: false,
      startTime:'',
      endTime:'',
      pickerOptionStart: {
        disabledDate(time) {
          return time.getTime() > Date.now()// - 8.64e7 打开注释 变为 今天不能选
        }
      },
      pickerOptionEnd: {
        disabledDate(time) {
          return time.getTime() > Date.now() || time.getTime() < new Date(that.startTime).getTime()
        }
      },
      userMaps: new Map(),
      projectMaps: new Map(),
      projectOption: [],
      multipleSelection:[],
      tableData:[],
      totalData: [],
      listPara:{
        page:1,
        pageSize:10
      },
      faultTypeMaps: new Map(),
      userList: [],
      loading:false,
      columnsChecked:["level", "businessNum", "projectId", "businessType", "auditUser", "createTime", "approveTime"],
      columns:[{
        prop:"businessNum",
        label:Vue.t('opt.oddNumber')
      }, {
        prop:"level",
        label:Vue.t('opt.faultLevel')
      }, {
        prop:"projectId",
        label:Vue.t('opt.project')
      }, {
        prop:"businessType",
        label:Vue.t('opt.type')
      }, {
        prop:"auditUser",
        label:Vue.t('opt.submitUser')
      }, {
        prop:"createTime",
        label:Vue.t('opt.submitTime')
      }, {
        prop:"approveTime",
        label:Vue.t('opt.approvalTime')
      }],
      currentPage:1,
      pageSize:10,
      pageSizes:[10, 50, 200],
      total:1,
      selOrderId: ""
    }
  },
  mounted() {
    let self = this;
    Promise.all([self.getFaultTypeList(), self.loadUserList(), self.getProjectList()]).then(function(result) {
      self.loadData();
    });

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
      this.formInline.oddNumber = v.oddNumber ? v.oddNumber : '';

      this.loadData();
    },
    async loadData() {
      let me = this;
      me.$refs.historyTable.clearSelection();
      let reqdata = {};
      var url = "";
      var queryOrderName = me.formInline.oddNumber;
      var preApplicantTime = "";
      var aftApplicantTime = "";
      var applicantTime = me.formInline.applicantTime;
      var queryProject = me.formInline.query_project;
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
      reqdata = {
        "pre_applicant_time": preApplicantTime,
        "aft_applicant_time": aftApplicantTime,
        "order_name": queryOrderName,
        "project_id": ("0" == roleType) ? queryProject : me.$cookie.get('pid'),
        "approver_id": ("3" == Vue.roleType || "2" == Vue.roleType) ? "" : Vue.userId,
        "approver_role": Vue.roleType,
        "order_type": "WORKORDER"
      };
      url = "api/leo/v1/order/get_approve_history_list";
      try {
        let ret = await this.$ajax({
          type: 'put',
          url: url,
          data:JSON.stringify(reqdata)
        });
        var dataList = ret.data;
        me.totalData = [];
        for (let i = 0; i < dataList.length; i++) {
          let obj = {};
          obj.businessId = dataList[i].order_id;
          obj.projectId = dataList[i].project_id;
          obj.businessNum = dataList[i].order_name;
          let orderDatas2 = dataList[i].order_data;
          let orderDatas = JSON.parse(orderDatas2);
          obj.level = orderDatas["fault_level"];
          obj.businessType = orderDatas["fault_type"];
          obj.approve_opinion = dataList[i].approve_opinion;
          obj.createTime = dataList[i].applicant_time;
          obj.approveTime = dataList[i].approve_time;
          obj.auditUser = dataList[i].applicant_id;
          me.totalData.push(obj);
        }
        this.loading = false;
      } catch (data) {
        this.loading = false;
      }
    },
    async getFaultTypeList() {
      var self = this;
      self.loading = true;
      try {
        let res = await this.$ajax({
          type: "GET",
          url: "api/leo/v1/fault"
        });
        let result = res.data;
        self.loading = false;
        for (let p = 0; p < result.length; p++) {
          var obj = result[p];
          self.faultTypeMaps.set(obj.id, obj.name);
        }
        self.loading = false;
      } catch (res) {
        console.log(self.$t('opt.getFaultTypeListFailed'));
      }
    },
    async loadUserList() {
      var self = this;
      self.loading = true;
      self.userList = [];
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/inspur/users";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        var users = result['users'];
        for (var q = 0; q < users.length; q++) {
          self.userMaps.set(users[q].id, users[q].name);
        }
        self.loading = false;
        self.userList.push({"name":"", "id":""});
        self.userList = self.userList.concat(result['users']);
      } catch (res) {
        self.loading = false;
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
    getProjectNameById(row) {
      let projectId = this.$cookie.get("pid")
      if (roleType == 0) {
        projectId = row["project"];
      }
      for (let i = 0; i < this.projectOption.length; i++) {
        if (projectId == this.projectOption[i].id) {
          return this.projectOption[i].name
        }
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getCurrentData(param) {
      this.tableData = param;
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
    handleShow() {
      this.detailFlag = false;
    },
    onSubmit() {
      alert('Search')
    },
    statusTagRender(status) {
      if ("6" == status) {
         return "success";
      } else if ("1" == status) {
         return "danger";
      } else if ("2" == status) {
         return "info";
      } else {
        return "gray";
      }
    },
    statusRender(value, rowData) {
      if (value == "1") {
        return this.$t('opt.serious');
      } else if (value == "2") {
        return this.$t('opt.commonly');
      } else if (value == "6") {
        return this.$t('opt.slight');
      } else {
        return "-";
      }
    },
    projectRender(value, rowData) {
      var self = this;
      var projectIds = rowData['projectId'].split(",");
      var result = "";
      if (projectIds[0] != "") {
        for (var n = 0; n < projectIds.length; n++) {
          var projectId = projectIds[n];
          if (n == projectIds.length - 1) {
            result += self.projectMaps.get(projectId)||"";
          } else {
            result += (self.projectMaps.get(projectId)||"") + ", ";
          }
        }
      } else {
        result = "-";
      }
      return result||"-";
    },
    faultLevelRender(value, rowData) {
      var self = this;
      let result = self.faultTypeMaps.get(value);
      return result;
    },
    volumeUserRender(value, rowData) {
      var name = this.userMaps.get(value);
      if (null == name || "" == name) {
        return "-";
      } else {
        return name;
      }
    },
    isAdmin() {
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        return false;
      }
      return true;
    },
    rowNameClick(rowIndex, rowData) {
      this.detailFlag = true;
      this.selOrderId = rowData['businessId'];
    },
    onBack() {
      this.detailFlag = false;
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
    clearSelOption() {
      var self = this;
      self.$refs.historyTable.clearSelection();
    }
  }
}
</script>
