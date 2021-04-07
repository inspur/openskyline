<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <el-form ref="" label-width="100px">
      <div class="operation-panel" @mousedown="onBack">
        <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
        </operation-panel>
      </div>
    </el-form>
    <div class="divider clearfix"></div>
    <el-table
      ref="submitTable"
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
        width="55"
        align="center">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('businessNum') >= 0"
        prop="businessNum"
        align="left"
        sortable="custom"
        :label="$t('opt.oddNumber')"
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
      <el-table-column v-if="columnsChecked.indexOf('businessStatus') >= 0"
        prop="businessStatus"
        align="left"
        sortable="custom"
        :label="$t('opt.handleStatus')"
        min-width="100">
        <template slot-scope="scope">
          <span v-html="handleStatusRender(scope.row.businessStatus, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('businessType') >= 0"
        prop="businessType"
        align="left"
        sortable="custom"
        :label="$t('opt.type')"
        min-width="100">
        <!-- <template slot-scope="scope">
          <span v-html="faultLevelRender(scope.row.businessType, scope.row)"></span>
        </template> -->
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('faultName') >= 0"
        prop="faultName"
        align="left"
        :label="$t('opt.description')"
        min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('createTime') >= 0"
        prop="createTime"
        align="left"
        sortable="custom"
        :label="$t('opt.submitTime')"
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
    <submit-operate ref='submitOperate' v-if="operFlag" @handleShow="handleShow" @loadData="loadData" @clearSelOption="clearSelOption"></submit-operate>
  </div>
</template>
<script>
import SubmitOperate from './SubmitOperate';
import FaultDetail from './FaultHisDialog';
export default {
  name: 'Submit',
  components: { SubmitOperate, FaultDetail },
  data() {
    return {
      sortObj:{
        sortOrder:"ascending",
        sortField:"level"
      },
      rules: {
        name: [
          { type: 'maxSize', value: 40 }
        ]
      },
      listPara:{
        page:1,
        pageSize:10
      },
      columns:[{
        prop:"businessNum",
        label:Vue.t('opt.oddNumber')
      }, {
        prop:"level",
        label:Vue.t('opt.faultLevel')
      }, {
        prop:"businessStatus",
        label:Vue.t('opt.handleStatus')
      }, {
        prop:"businessType",
        label:Vue.t('opt.type')
      }, {
        prop:"faultName",
        label:Vue.t('opt.description')
      }, {
        prop:"createTime",
        label:Vue.t('opt.submitTime')
      }],
      currentPage: 1,
      pageSize:10,
      pageSizes:[10, 50, 200],
      total:1,
      columnsChecked: ["businessNum", "level", "faultName", "businessStatus", "businessType", "createTime"],
      tableData: [],
      totalData: [],
      selOrderId: "",
      multipleSelection: [],
      operFlag: false,
      userMaps: new Map(),
      faultTypeMaps: new Map(),
      detailFlag: false,
      proAdminShow: Vue.roleType == "2",
      userShow: Vue.roleType == "3",
      loading:false,
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('opt.establish'),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.operFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('opt.delete'),
        showflg: false,
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
                url: 'api/leo/v1/order/delete_order/{businessId}',
                params: selectRows,
                success: function(result) {
                  self.$message.success(Vue.t('opt.deleteSuccess'));
                  self.$refs.submitTable.clearSelection();
                  self.loadData();
                },
                log:{
                  description:{
                    en:"delete fault",
                    zh_cn:self.$t('opt.deleteFault')
                  },
                  key: "businessNum",
                  target:Vue.logTarget.Fault_manage
                },
                errFun:function() {
                  self.$refs.submitTable.clearSelection();
                  setTimeout( function() {
                    self.loadData({
                      page: 1
                    });
                    self.loading = false;
                  }, 5000);
                }
              }).then((data) => {
                self.loading = true;
                self.$refs.submitTable.clearSelection();
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
      searchBar: {
        conditions: {
          name: {
            label: this.$t('opt.oddNumber'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          fault_level: {
            label: this.$t('opt.faultLevel'),
            type: 'select',
            options: [{
              label: this.$t('opt.serious'),
              value: '1'
            }, {
              label: this.$t('opt.commonly'),
              value: '2'
            }, {
              label: this.$t('opt.slight'),
              value: '6'
            }]
          },
          handle_status: {
            label: this.$t('opt.handleStatus'),
            type: 'select',
            options: [{
              label: this.$t('opt.pending'),
              value: '0'
            }, {
              label: this.$t('opt.handled'),
              value: '1'
            }]
          },
          applicantTime: {
            label: this.$t('opt.submitTime'),
            type: 'date-picker',
            pickerType: 'daterange'
          }
        },
        validatedParams: {}
      }
    }
  },
  mounted() {
    let self = this;
    Promise.all([self.getFaultTypeList(), self.loadUserList()]).then(function(result) {
      self.loadData();
    });
  },
  methods: {
    async loadData() {
      this.loading = true;
      let me = this;
      var queryOrderName = me.searchBar.validatedParams.name ? me.searchBar.validatedParams.name : '';
      var preApplicantTime = "";
      var aftApplicantTime = "";
      var applicantTime = me.searchBar.validatedParams.applicantTime ? me.searchBar.validatedParams.applicantTime : '';
      var faultLevel = me.searchBar.validatedParams.fault_level ? me.searchBar.validatedParams.fault_level : '';
      var handleStatus = me.searchBar.validatedParams.handle_status ? me.searchBar.validatedParams.handle_status : '';
      var projectId = me.$cookie.get("pid");
      if (applicantTime !="" && applicantTime != null) {
        if (applicantTime[0] != null) {
          preApplicantTime = applicantTime[0].getFullYear() + '-' + (applicantTime[0].getMonth() + 1) + '-' + applicantTime[0].getDate();
        }
        if (applicantTime[1] != null) {
          aftApplicantTime = applicantTime[1].getFullYear() + '-' + (applicantTime[1].getMonth() + 1) + '-' + applicantTime[1].getDate();
        }
      };
      let reqdata = {
        "pre_applicant_time": preApplicantTime,
        "aft_applicant_time": aftApplicantTime,
        "fault_level":faultLevel,
        "order_name": queryOrderName,
        "applicant_id":Vue.userId,
        "approver_id":"",
        "order_state":handleStatus, //0待处理,1已处理
        "order_type":"WORKORDER", //1订单2工单
        "project_id":projectId
      };
      try {
        let ret = await this.$ajax({
          type: 'put',
          url: "api/leo/v1/order/get_applicant_order_list",
          data:JSON.stringify(reqdata)
        });
        var dataList = ret.data;
        me.totalData = [];
        for (let i = 0; i < dataList.length; i++) {
          let obj = {};
          obj.businessId = dataList[i].order_id;
          obj.businessNum = dataList[i].order_name;
          let orderDatas2 = dataList[i].order_data;
          let orderDatas = JSON.parse(orderDatas2);
          obj.level = orderDatas["fault_level"];
          obj.businessStatus = dataList[i].order_state;
          obj.faultName = dataList[i].op_desc;
          obj.businessType = me.faultLevelRender(orderDatas["fault_type"], dataList[i]);
          obj.createTime = dataList[i].applicant_time;
          me.totalData.push(obj);
        }
        this.loading = false;
      } catch (data) {
        this.loading = false;
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
      this.operFlag = false;
      this.detailFlag = false;
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
    faultLevelRender(value, rowData) {
      var self = this;
      let result = self.faultTypeMaps.get(value);
      return result;
    },
    handleStatusRender(value, rowData) {
      if (value == "PROJECT_ADMIN_APPROVING" || value == "SUPER_ADMIN_APPROVING") {
        return this.$t('opt.pending');
      } else if (value == "HANDLED") {
        return this.$t('opt.handled');
      } else {
        return "-";
      }
    },
    rowNameClick(rowIndex, rowData) {
      this.detailFlag = true;
      this.selOrderId = rowData['businessId'];
    },
    onBack() {
      this.detailFlag = false;
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
      self.$refs.submitTable.clearSelection();
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.loadData();
    }
  }
}
</script>
<style scoped>
</style>