<template>
  <div :style="style">
    <el-alert type="info" title=""
      :description="$t('base.noRoleWarn')"
    ></el-alert>
    <div class="divider clearfix"></div>
    <el-form :inline="true" :model="formInline" class="form-inline" :rules="rules" v-if="hasLeo">
      <el-form-item :label="$t('opt.orderNumber')" prop="name">
        <el-input size="small" v-model="formInline.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('opt.applicationTime')">
        <el-date-picker v-model="formInline.applicantTime" type="daterange" :placeholder="$t('opt.selectTimeRange')" format="yyyy-MM-dd"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' size="small" @click="searchOrder">{{$t('opt.doQuery')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
    <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
    </operation-panel>
    <el-table ref="historyTable" :data="tableData" v-loading="loading" :element-loading-text="$t('opt.dataLoading')" highlight-current-row border stripe style="width: 100%;" slot="empty" max-height='500' row-key="id" :default-sort="{prop:'name', order:'ascending'}" @selection-change="handleSelectionChange" @sort-change="sortChange">
      <el-table-column reserve-selection type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" align="left" :label="$t('opt.orderNumber')" min-width="100" sortable="custom">
        <template slot-scope="scope">
          <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('resType') >= 0" prop="resType" align="left" :label="$t('opt.businessType')" min-width="100" sortable="custom">
        <template slot-scope="scope">
          <span v-html="resTypeRender(scope.row.resType, scope.row)"></span>
        </template> 
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" align="left" :label="$t('opt.status')" min-width="100" sortable="custom">
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
    </div>
    <transition name="slide-right" mode="out-in">
     <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('opt.backTo')}}</el-button>
          </div>
          <div>
            <handle-operate ref="HandleOperate" :selOrderId="selOrderId" :userMaps="userMaps" @handleShow="handleShow" @loadData="loadData" @clearSelOption="clearSelOption"></handle-operate>
          </div>
        </panel>
      </div>
    </transition>
    <project-apply-card ref="projectApplyCard" v-if="cardFlg" @loadData="loadData" @clearSelOption="clearSelOption">
    </project-apply-card>
  </div>
</template>
<script>
import ProjectApplyCard from './ProjectApplyCard';
import HandleOperate from '../../operations/flow/FlowHisDialog';
export default {
  name: "projectapply",
  components: {
    ProjectApplyCard, HandleOperate
  },
  data() {
    return {
      style:{
        padding:'10px'
      },
      cardFlg:false,
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      formInline: {
        name: "",
        applicantTime: []
      },
      rules: {
        name: [
          { type: 'maxSize', value: 40 }
        ]
      },
      detailFlag: false,
      multipleSelection: [],
      operationMenus:[{
        icon: "fa-plus-circle",
        name: Vue.t('base.applyProject'),
        showflg: ('leo' in Vue.service),
        readOnly: true,
        handler: function() {
          this.cardFlg = true;
          this.$nextTick(() => {
            this.$refs.projectApplyCard.show();
          });
        }.bind(this)
      }],
      tableData: [],
      totalData: [],
      listPara: {
        page: 1,
        pageSize: 10
      },
      loading: false,
      columnsChecked: ["name", "resType", "status", "desc", "createTime"],
      columns: [{
        prop: "name",
        label: Vue.t('opt.orderNumber')
      }, {
        prop: "resType",
        label: Vue.t('opt.businessType')
      }, {
        prop: "status",
        label: Vue.t('opt.status')
      }, {
        prop: "desc",
        label: Vue.t('opt.description')
      }, {
        prop: "createTime",
        label: Vue.t('opt.applicationTime')
      }],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 50, 200],
      total: 1,
      userMaps: new Map(),
      selOrderId: "",
      hasLeo: ('leo' in Vue.service)
    }
  },
  mounted() {
    console.log(Vue.service)
    var self = this;
    Promise.all([self.getUserList()]).then(function(result) {
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
      } catch (res) {
        console.log(Vue.t('opt.getUserFailed'));
      }
    },
    async loadData() {
      if ('leo' in Vue.service) {
        var self = this;
        self.loading = true;
        var projectUserId = Vue.userId;
        var projectUserName = Vue.userName;
        var projectId = self.$cookie.get('pid');
        var applicantTime = self.formInline.applicantTime;
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
        var queryOrderName = self.formInline.name;
        var params = {
          "applicant_id": projectUserId,
          "order_type": "FLOWORDER",
          "order_state": "2",
          "project_id": projectId,
          "order_name": queryOrderName,
          "resource_id": "",
          "pre_applicant_time": preApplicantTime,
          "aft_applicant_time": aftApplicantTime
        };
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
            obj.resType = result.data[i].resource_type;
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
