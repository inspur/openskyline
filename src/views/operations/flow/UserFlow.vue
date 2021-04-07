<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <el-table ref="historyTable" :data="tableData" v-loading="loading" :element-loading-text="$t('opt.dataLoading')" highlight-current-row border stripe style="width: 100%;" max-height='500' row-key="id" :default-sort="{prop:'name', order:'ascending'}" @selection-change="handleSelectionChange" @sort-change="sortChange">
      <el-table-column reserve-selection type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" align="left" :label="$t('opt.orderNumber')" min-width="100" sortable="custom">
        <template slot-scope="scope">
          <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('projectName') >= 0" prop="projectName" align="left" :label="$t('opt.project')" min-width="100" sortable="custom">
        <template slot-scope="scope">
          <span v-html="projectRender(scope.row.projectName, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('resType') >= 0" prop="resType" align="left" :label="$t('opt.businessType')" min-width="100" sortable="custom">
        <template slot-scope="scope">
          <span v-html="resTypeRender(scope.row.resType, scope.row)"></span>
        </template> 
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('status') >= 0 && showFlag" prop="status" align="left" :label="$t('opt.status')" min-width="100">
        <template slot-scope="scope">
          <span v-html="stateRender(scope.row.status, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('desc') >= 0" prop="desc" align="left" :label="$t('opt.description')" min-width="100">
        <template slot-scope="scope">
          <span v-html="descRender(scope.row.desc, scope.row)"></span>
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
              <el-checkbox class="item" v-for="(item, index) in columns" v-if="item.flg" :label="item.prop" :key="item.prop">{{item.label}}
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
    </div>
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
</template>
<script>
import HandleOperate from './FlowHisDialog';
export default {
  name: "handling",
  components: {
    HandleOperate
  },
  data() {
    return {
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      orderProId:"",
      rules: {
        name: [
          { type: 'maxSize', value: 40 }
        ]
      },
      resTypeOption: [],
      detailFlag: false,
      showFlag: Vue.roleType == "2",
      multipleSelection: [],
      tableData: [],
      totalData: [],
      loading: false,
      columnsChecked: ["name", "projectName", "resType", "desc", "createTime", "status"],
      columns: [{
        prop: "name",
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
        prop: "status",
        label: Vue.t('opt.status'),
        flg: Vue.roleType == "2"
      }, {
        prop: "desc",
        label: Vue.t('opt.description'),
        flg: true
      }, {
        prop: "createTime",
        label: Vue.t('opt.applicationTime'),
        flg: true
      }],
      userMaps: new Map(),
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
          resTypeSel: {
            label: this.$t('opt.resourceType'),
            type: 'select',
            options: []
          },
          flow_status: {
            label: this.$t('opt.status'),
            type: 'select',
            options: [{
              label: this.$t('opt.approving'),
              value: 'SUPER_ADMIN_APPROVING,APPROVING'
            }, {
              label: this.$t('opt.approved'),
              value: 'PASSED'
            }, {
              label: this.$t('opt.handled'),
              value: 'HANDLED'
            }, {
              label: this.$t('opt.repulse'),
              value: 'REJECTED'
            }, {
              label: this.$t('opt.fail'),
              value: 'REVOCATION'
            }],
            visible: String(Vue.roleType) === "2"
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
  mounted() {
    var self = this;
    Promise.all([self.getUserList(), self.getResourceTypeList()]).then(function(result) {
      self.loadData();
    });
  },
  methods: {
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
        self.userMaps.set("adminForWorkFlow", Vue.$t('base.superAdmin'));
      } catch (res) {
        console.log(Vue.t('opt.getUserFailed'));
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
            })
          }
        }
      } catch (data) {
        console.log(Vue.t('opt.getResourceListFailed'));
      }
    },
    async loadData() {
      var self = this;
      self.loading = true;
      var projectUserId = Vue.userId;
      var projectUserName = Vue.userName;
      var applicantTime = self.searchBar.validatedParams.applicantTime ? self.searchBar.validatedParams.applicantTime : '';
      var preApplicantTime = "";
      var aftApplicantTime = "";
      if (applicantTime !="" && applicantTime != null) {
        if (applicantTime[0] != null) {
          preApplicantTime = applicantTime[0].getFullYear() + '-' + (applicantTime[0].getMonth() + 1) + '-' + applicantTime[0].getDate();
        }
        if (applicantTime[1] != null) {
          aftApplicantTime = applicantTime[1].getFullYear() + '-' + (applicantTime[1].getMonth() + 1) + '-' + applicantTime[1].getDate();
        }
      };
      var queryOrderName = self.searchBar.validatedParams.name ? self.searchBar.validatedParams.name : '';
      var queryResType = self.searchBar.validatedParams.resTypeSel ? self.searchBar.validatedParams.resTypeSel : '';
      var queryFlowStatus = self.searchBar.validatedParams.flow_status ? self.searchBar.validatedParams.flow_status : '';
      var params = {};
      if ("2" == Vue.roleType) {
        params = {
          "applicant_id": projectUserId,
          "order_type": "FLOWORDER",
          "order_state": queryFlowStatus,
          "order_name": queryOrderName,
          "resource_id": queryResType,
          "pre_applicant_time": preApplicantTime,
          "aft_applicant_time": aftApplicantTime
        };
      } else {
        params = {
          "applicant_id": projectUserId,
          "order_type": "FLOWORDER",
          "order_state": "0",
          "order_name": queryOrderName,
          "resource_id": queryResType,
          "pre_applicant_time": preApplicantTime,
          "aft_applicant_time": aftApplicantTime
        };
      }
      params = JSON.stringify(params);
      self.loading = false;
      try {
        let result = await self.$ajax({
          type: 'PUT',
          data: params,
          url: "api/leo/v1/order/get_applicant_order_list"
        });
        self.loading = false;
        self.totalData = [];
        for (let i=0; i<result.data.length; i++) {
          var obj = {};
          obj.id = result.data[i].order_id;
          obj.name = result.data[i].order_name;
          obj.projectName = result.data[i].project_name;
          obj.resType = result.data[i].resource_type;
          if (obj.resType === "PROJECT.CREATE") {
            let orderData = JSON.parse(result.data[i].order_data);
            if (orderData && orderData["create"] && orderData["create"]["name"]) {
              obj.projectName = orderData["create"]["name"];
            }
          }
          obj.status = result.data[i].order_state;
          obj.desc = result.data[i].op_desc;
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
    descRender(value, rowData) {
      let self = this;
      let description = rowData['desc'];
      let result = "";
      if (description != "" && description !=null) {
        result = description;
      } else {
        result = "-";
      };
      return result;
    },
    rowNameClick(rowIndex, rowData) {
      this.detailFlag = true;
      this.selOrderId = rowData['id'];
      this.orderProId = this.$cookie.get("pid");
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
    searchOrder() {
      this.loadData();
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
