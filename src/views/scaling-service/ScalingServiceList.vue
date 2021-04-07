<template>
  <div>
    <div v-show="scalServicemainVisable">
      <icos-page-header :title="$t('scalingService.scalingService')" :show-bottom-border="true" />
      <icos-page>
        <div>
          <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="handleSearch" />
          <operation-panel
            class="margin-tb5"
            :select-rows="multipleSelection"
            :operation-menus="operationMenus">
          </operation-panel>
          <el-table
            ref="clusTable"
            :data="tableData"
            v-loading="loading"
            highlight-current-row
            border
            stripe
            style="width: 100%;"
            slot="empty"
            row-key="id"
            @row-click="rowClick"
            :default-sort="{prop: 'name', order: 'descending'}"
            @selection-change="handleSelectionChange" @sort-change="sortChange">
            <el-table-column
              v-if="roleType != '0'"
              reserve-selection
              type="selection"
              align="center"
              width="55">
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
              prop="name"
              :label="$t('lang.name')"
              align="left"
              sortable="custom"
              min-width="100">
              <template slot-scope="scope">
                  <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">
                  {{scope.row.name}}
                  </el-button>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('project') >= 0"
              prop="project"
              align="left"
              :label="$t('lang.project')"
              min-width="100">
              <template slot-scope="scope">
                <span v-html="projectRender(scope.row.project, scope.row)"></span>
              </template>      
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('status') >= 0"
              prop="status"
              align="left"
              :label="$t('lang.status')"
              min-width="50">
              <template slot-scope="scope">
                  <span v-if="statusRender(scope.row.status, scope.row)==='-'">-</span>
                  <el-tag v-else :type="statusTagRender(scope.row.status)">
                  <span v-html="statusRender(scope.row.status, scope.row)"></span>
                </el-tag>
              </template> 
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('max_size') >= 0"
              prop="max_size"
              align="left"
              :label="$t('scalingService.maxCapabilitySize')"
              min-width="40">
              <template slot-scope="scope">
                <span>{{scope.row.max_size}}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('min_size') >= 0"
              prop="min_size"
              align="left"
              :label="$t('scalingService.minCapabilitySize')"
              min-width="40">
              <template slot-scope="scope">
                <span>{{scope.row.min_size}}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('desired_capacity') >= 0"
              prop="desired_capacity"
              align="left"
              :label="$t('scalingService.desiredCapacity')"
              min-width="40">
              <template slot-scope="scope">
                <span>{{scope.row.desired_capacity}}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('lbpolicy') >= 0"
              prop="lbpolicy"
              align="left"
              :label="$t('scalingService.lbPolicy')"
              min-width="50">
              <template slot-scope="scope">
                <el-tag :type="balanceStatusTagRender(scope.row.data)">
                <span v-html="balanceStatusRender(scope.row.data, scope.row)"></span>
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('vipaddress') >= 0"
              prop="vipaddress"
              align="left"
              :label="$t('scalingService.vipAddress')"
              min-width="70">
              <template slot-scope="scope">
                <span v-html="balanceVipRender(scope.row.data, scope.row)"></span>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('init_at') >= 0"
              prop="init_at"
              align="left"
              :label="$t('lang.createTime')"
              min-width="80">
              <template slot-scope="scope">
                <span v-html="dateRender(scope.row.init_at, scope.row)"></span>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('updated_at') >= 0"
              prop="updated_at"
              align="left"
              :label="$t('lang.updatedTime')"
              min-width="80">  
              <template slot-scope="scope">
                <span v-html="dateRender(scope.row.updated_at, scope.row)"></span>
              </template>    
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative" >
            <el-row>
              <el-col :span="5">
                <el-button type="text" icon="fa-refresh" @click="onRefresh">
                </el-button>
                <span v-if="roleType != '0'">{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
                <el-popover
                  placement="right"
                  trigger="click">
                  <el-checkbox-group class="vertical"
                    v-model="columnsChecked">
                    <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
                    </el-checkbox>
                  </el-checkbox-group>
                  <div slot="reference" style="display: inline-block;">
                    <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
                  </div>
                </el-popover>
              </el-col>
              <el-col :span="19">
              <page :totalData="totalData" @getCurrentData="getCurrentData" ref="pageComponent" :sortObj="sortObj"></page>
              </el-col>
            </el-row>
            <create-scaling-service ref="CreateScalingService"  v-if="addFlag" @handleAddShow="handleAddShow" @refreshData="refreshData">
            </create-scaling-service>
            <edit-scaling-service ref="EditScalingService" v-if="editFlg" :scalingServiceName="scalingServiceName" :maxSize="maxSize" :minSize="minSize" :clusterId="clusterId" @handleShow="handleShow" @refreshData="refreshData">
            </edit-scaling-service>
            <resize-scaling-service ref="ResizeScalingService" v-if="resizeFlg" :scalingServiceName="scalingServiceName" :maxSize="maxSize" :minSize="minSize" :desiredSize="desiredSize" :clusterId="clusterId" @handleResizeShow="handleResizeShow" @refreshData="refreshData">
            </resize-scaling-service>
            <conf-lb-policy ref="ConfLbPolicy" v-if="lbFlg" :scalingServiceName="scalingServiceName" :clusterId="clusterId" :profileId="profileId" @handleLbShow="handleLbShow" @refreshData="refreshData">
            </conf-lb-policy>
            <conf-scaling-service ref="ConfScalingService" v-if="configFlg" :scalingServiceName="scalingServiceName" :clusterId="clusterId" :downAlertUrl="downAlertUrl" :upAlertUrl="upAlertUrl" @handleConfigShow="handleConfigShow" @refreshData="refreshData">
            </conf-scaling-service>
            <!-- <transition name="slide-right" mode="out-in">
              <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
                <panel style="height: 100%">
                  <div slot="title" class="clearfix" >
                  <el-button type="text" icon="fa-arrow-right" @click="onDetailPanelBack">返回</el-button>
                  </div>
                  <scaling-service-detail ref="scalingServiceDetail" :clusterId="clusterId" :projectId="projectId">
                    </scaling-service-detail>
                </panel>
              </div>
            </transition> -->
          </div>
        </div>
      </icos-page>
    </div>
    <div v-show="detailVisable">
      <icos-page-header :title="$t('scalingService.scalingService')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
      <scaling-service-detail :clusterId="clusterId" :projectId="projectId" ref="scalingServiceDetail"></scaling-service-detail>  
    </div>
  </div>
</template>
<script>
import CreateScalingService from './CreateScalingService';
import ConfLbPolicy from './ConfLbPolicy';
import EditScalingService from './EditScalingService';
import ResizeScalingService from './ResizeScalingService';
import ConfScalingService from './ConfScalingService';
import ScalingServiceDetail from "./ScalingServiceDetail";
export default {
  name: "ScalingServiceList",
  components: {
    CreateScalingService, ConfLbPolicy, EditScalingService, ResizeScalingService, ConfScalingService, ScalingServiceDetail
  },
  data() {
    return {
      sortObj:{
        sortOrder:"descending",
        sortField:"name"
      },
      formInline: {
      },
      projectlist: [],
      projectMap: new Map(),
      clusterId:"",
      scalingServiceName:"",
      maxSize:"",
      minSize:"",
      desiredSize:"",
      projectId: "",
      scadetailVisable: false,
      scamainVisable: true,
      statusTem: "",
      profileId: "",
      downAlertUrl: "",
      upAlertUrl: "",
      project: "",
      projectOptions:[{value:'1', label:'project1'}, {value:'2', label:'project2'}, {value:'3', label:'project3'}],
      totalData: [],
      multipleSelection:[],
      tableData:[],
      loading: false,
      scalServicemainVisable: true,
      detailVisable: false,
      addFlag: false,
      editFlg: false,
      resizeFlg: false,
      lbFlg:false,
      configFlg: false,
      reloadTblFlag: false,
      roleType: Vue.roleType + "",
      operationMenus:[{
        icon: "fa-plus",
        name: this.$t('scalingService.createService'),
        showflg: Vue.roleType==2||Vue.roleType==3,
        readOnly: true,
        multi: true,
        enable(rowData) {
          return true;
        },
         handler: function(selectRows) {
          this.addFlag = true;
        }.bind(this)
      }, {
        icon: "fa-pencil",
        name: this.$t('scalingService.editName'),
        showflg: Vue.roleType==2||Vue.roleType==3,
        multi: false,
        enable(rowData) {
          return (rowData['status'] == "ACTIVE" || rowData['status'] == "WARNING");
        },
         handler: function(selectRows) {
          this.scalingServiceName = selectRows[0].name;
          this.maxSize = selectRows[0].max_size;
          this.minSize = selectRows[0].min_size;
          this.clusterId = selectRows[0].id;
          this.editFlg = true;
        }.bind(this)
      }, {
        icon: "fa-clone",
        name: this.$t('scalingService.adjustCapacity'),
        showflg: Vue.roleType==2||Vue.roleType==3,
        multi: false,
        enable(rowData) {
          return (rowData['status'] == "ACTIVE" || rowData['status'] == "WARNING");
        },
         handler: function(selectRows) {
          this.scalingServiceName = selectRows[0].name;
          this.maxSize = selectRows[0].max_size;
          this.minSize = selectRows[0].min_size;
          this.desiredSize = selectRows[0].desired_capacity;
          this.clusterId = selectRows[0].id;
          this.resizeFlg = true;
        }.bind(this)
      }, {
        icon: "fa-cog",
        name: this.$t('scalingService.setBalance'),
        showflg: Vue.roleType==2||Vue.roleType==3,
        multi: false,
        enable(rowData) {
          let attachTem = rowData['data'];
          if (attachTem['loadbalancers']) {
            return false;
          } else {
            return (rowData['status'] == "ACTIVE");
          }
        },
         handler: function(selectRows) {
          this.scalingServiceName = selectRows[0].name;
          this.clusterId = selectRows[0].id;
          this.profileId = selectRows[0].profile_id;
          this.lbFlg = true;
        }.bind(this)
      }, {
        icon: "fa-square-o",
        name: this.$t('scalingService.detachBalance'),
        showflg: Vue.roleType==2||Vue.roleType==3,
        multi: false,
        enable(rowData) {
          let detachTem = rowData['data'];
          if (detachTem['loadbalancers']) {
            return (rowData['status'] == "ACTIVE" || rowData['status'] == "ERROR" || rowData['status'] == "WARNING");
          } else {
            return false;
          }
        },
         handler: function(selectRows) {
           var self = this;
           self.$prompt(this.$t('lang.inputYesToContinue'), this.$t('lang.confirm'), {
            confirmButtonText:this.$t('lang.confirm'),
            cancelButtonText:this.$t('lang.cancel'),
            inputPattern:/^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage:this.$t('lang.onlyAcceptYesOrNo')
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
              let row = selectRows[0];
              self.detachLoadbalance(row);
            }
          }).catch(() => {
          //取消
          });
        }.bind(this)
      }, {
        icon: "fa-wrench",
        name: this.$t('scalingService.alarmThreshold'),
        showflg: Vue.roleType==2||Vue.roleType==3,
        multi: false,
        enable(rowData) {
          return (rowData['status'] == "ACTIVE");
        },
         handler: function(selectRows) {
          this.clusterId = selectRows[0].id;
          this.scalingServiceName = selectRows[0].name;
          this.detailFun(this.clusterId);
          this.configFlg = true;
        }.bind(this)
      }, {
        icon: "fa-refresh",
        name: this.$t('scalingService.healthCheck'),
        showflg: Vue.roleType==2||Vue.roleType==3,
        multi: false,
        enable(rowData) {
          return (rowData['status'] == "ACTIVE" || rowData['status'] == "ERROR" || rowData['status'] == "WARNING");
        },
         handler: function(selectRows) {
           var self = this;
           let row = selectRows[0];
           self.healthCheck(row);
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('scalingService.deleteService'),
        showflg: Vue.roleType==2||Vue.roleType==3,
        multi: true,
        enable(rowData) {
          let tem = rowData['data'];
          if (tem['loadbalancers']) {
            return false;
          } else {
            return (rowData['status'] == "ACTIVE" || rowData['status'] == "ERROR" || rowData['status'] == "WARNING");
          }
        },
         handler: function(selectRows) {
           var self = this;
           self.$prompt(this.$t('lang.inputYesToContinue'), this.$t('lang.confirm'), {
            confirmButtonText:this.$t('lang.confirm'),
            cancelButtonText:this.$t('lang.cancel'),
            inputPattern:/^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage:this.$t('lang.onlyAcceptYesOrNo')
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
              // for (var t = 0; t < selectRows.length; t++) {
              //   let row = selectRows[t];
              //   self.deleteScalingService(row);
              // }
              // self.$message("删除请求发送成功");
              self.$sequence({
                type: 'POST',
                url: 'api/senlin/v1/clusters/{id}/actions',
                params: selectRows,
                datas:{
                  "senlin_service_delete":{
                    "policy_detach":{
                      "policy_ids": "{policies}"
                    }
                  },
                  "type":"array"
                },
                log:{
                  description:{
                    en:"delete scalingService",
                    zh_cn:"删除伸缩服务"
                  },
                  key: "name",
                  target:Vue.logTarget.ScalingService
                },
                successFun: () => {
                  self.refreshData();
                },
                paramKeys:["id", "name", "policies"]
              }).then((data) => {
                self.$message(Vue.t('scalingService.sendApplySuccess'));
              }).catch((err) => {
                self.refreshData();
              });
            }
          }).catch(() => {
          //取消
          });
        }.bind(this)
      }],
      listPara:{
        page:1,
        pageSize:10
      },
      columnsChecked:["name", "project", "status", "max_size", "min_size", "desired_capacity", "lbpolicy", "vipaddress", "init_at", "updated_at"],
      columns:[{
        prop:"name",
        label:this.$t('lang.name')
      }, {
        prop:"project",
        label:this.$t('lang.project')
      }, {
        prop:"status",
        label:this.$t('lang.status')
      }, {
        prop:"max_size",
        label:this.$t('scalingService.maxCapabilitySize')
      }, {
        prop:"min_size",
        label:this.$t('scalingService.minCapabilitySize')
      }, {
        prop:"desired_capacity",
        label:this.$t('scalingService.desiredCapacity')
      }, {
        prop:"lbpolicy",
        label:this.$t('scalingService.lbPolicy')
      }, {
        prop:"vipaddress",
        label:this.$t('scalingService.vipAddress')
      }, {
        prop:"init_at",
        label:this.$t('lang.createTime')
      }, {
        prop:"updated_at",
        label:this.$t('lang.updatedTime')
      }],
      currentPage:1,
      pageSize:10,
      pageSizes:[10, 50, 200],
      total:1,
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetterNumber_Chinese'));
              }
            }
          }
        },
        validatedParams: {}
      }
    }
  },
  beforeDestroy() {
    if (this.interValid != null) {
      clearInterval(this.interValid);
    }
  },
  watch: {
    columnsChecked: {
      handler: function(rows, oldVal) {
        this.columnsChecked = rows;
      },
      deep: true
    },
    tableData: {
      immediate: false,
      handler: function(list) {
        var self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (var t = 0; t < list.length; t++) {
            var obj = list[t];
            if (obj['OS-EXT-STS:task_state'] != null || obj['status'] == "CREATING" || obj['status'] == "UPDATING" ||
                obj['status'] == "RESIZING"|| obj['status'] == "DELETING" || obj['status'] == "CHECKING" || obj['status'] == "RECOVERING" ||
                obj['status'] == "OPERATING" || obj['status'] == "INIT" || obj['status'] == "PREDELETING" || obj['status'] == "WARNING") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interValid = setInterval(() => {
            self.getData();
          }, 5000);
        }
      }
    },
    '$route'(to, from) {
      let self = this;
      self.scalServicemainVisable = true;
      self.detailVisable = false;
      self.$refs.clusTable.clearSelection();
    }
  },
  mounted() {
    var self = this;
    Promise.all([self.loadProjectList()]).then(function(result) {
        self.getData();
    });
  },
  methods: {
    sortChange(column) {
       var self = this;
       if (!column.prop) { return; }
       self.sortObj = {
         sortOrder:column.order,
         sortField:column.prop
       };
    },
    queryClick() {
      var self = this;
      self.getData();
      self.$refs.clusTable.clearSelection();
    },
    async getData() {
      var self = this;
      let data = [];
      var roleType = Vue.roleType + "";
      var url = "api/senlin/v1/clusters/inspur?global_project=true&sort=init_at:desc";
      if ("2" == roleType || "3" == roleType) { //项目
        url = "api/senlin/v1/clusters/inspur?sort=init_at:desc";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.loading = false;
        //self.totalData = result['clusters'];
        //self.tableData = result['clusters'];
        //self.total = result['clusters'].length;
        let clustersQuery = result['clusters'];
        self.totalData = [];
        let queryName = '';
        if (self.searchBar.validatedParams.name) {
          queryName = self.searchBar.validatedParams.name.toLowerCase();
        }
        for (let i = clustersQuery.length - 1; i >= 0; i--) {
          if (clustersQuery[i].name.toLowerCase().indexOf(queryName) >= 0) {
            self.totalData.push(clustersQuery[i]);
          }
        }
        if (self.totalData.length > 0) {
          self.totalData.sort(this.$sortFormatter("name", "ascending"));
        }
      } catch (res) {
        self.loading = false;
        //self.$message.error('获取失败!');
      }
    },
    async detachLoadbalance(row) {
      var self = this;
      var dataObj = row['data'];
      var lbObj = dataObj['loadbalancers'];
      var policies = row['policies'];
      let lbId = '';
      for (var key in lbObj) {
        for (let i= policies.length -1; i >=0; i--) {
          if (policies[i] == key) {
            lbId = policies[i];
          }
        }
      }
      var detachData = {
        "policy_detach_lb":{
          "policy_id": lbId
        }
      };
      try {
        self.$ajax({
          type: 'POST',
          url: "api/senlin/v1/clusters/" + row['id'] +"/actions",
          data: JSON.stringify(detachData),
          successMsg: this.$t('scalingService.sendApplySuccess'),
          log:{
                description:{
                  en:"scalingService" + row.name + ":detachLoadbalance",
                  zh_cn:"伸缩服务" + row.name + ":分离负载均衡"
                },
                target:Vue.logTarget.ScalingService
              },
          successFun: () => {
            self.refreshData();
          },
          errFun: () => {
            self.refreshData();
          }
        });
      } catch (res) {
      }
    },
    async healthCheck(row) {
      var self = this;
      var data = {
        "check":{}
      };
      try {
        self.$ajax({
          type: 'POST',
          url: "api/senlin/v1/clusters/" + row['id'] +"/actions",
          data: JSON.stringify(data),
          successMsg: this.$t('scalingService.sendApplySuccess'),
          log:{
                description:{
                  en:"healthcheck scalingService:" + row.name,
                  zh_cn:"健康检查-伸缩服务:" + row.name
                },
                target:Vue.logTarget.ScalingService
              },
          successFun: () => {
            self.refreshData();
          },
          errFun: () => {
            self.refreshData();
          }
        });
      } catch (res) {
      }
    },
    async deleteScalingService(row) {
      var self = this;
      var delData = {
        "senlin_service_delete":{
          "policy_detach":{
            "policy_ids": row['policies']
          }
        }
      };
      try {
        self.$ajax({
          type: 'POST',
          url: "api/senlin/v1/clusters/" + row['id'] +"/actions",
          data: JSON.stringify(delData),
          log:{
                description:{
                  en:"delete scalingService:" + row.name,
                  zh_cn:"删除伸缩服务:" + row.name
                },
                target:Vue.logTarget.ScalingService
              },
          successFun: () => {
            // row['status'] = "DELETING";
            // setTimeout(function () {
            //   self.refreshData();
            // }, 10000);
            self.refreshData();
          }
        });
      } catch (res) {
      }
    },
    comDesc (desc) {
      if (desc) {
        return desc.replace(/,/g, ",<br/>").replace(/\./g, ".<br/>");
      } else {
        return '';
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleAddShow() {
      this.addFlag = false;
    },
    handleShow() {
      this.editFlg = false;
      // if (this.$refs.EditScalingService.updateNameFlag) {
      //   this.$refs.clusTable.selection[0].status = "UPDATING";
      // }
    },
    handleResizeShow() {
      this.resizeFlg = false;
      // if (this.$refs.ResizeScalingService.updateFlag) {
      //   this.$refs.clusTable.selection[0].status = "RESIZING";
      // }
    },
    handleLbShow() {
      this.lbFlg = false;
      // if (this.$refs.ConfLbPolicy.setLbFlag) {
      //   this.$refs.clusTable.selection[0].status = "UPDATING";
      // }
    },
    handleConfigShow() {
      this.configFlg = false;
    },
    rowClick(row) {
      this.$refs.clusTable.toggleRowSelection(row);
    },
    rowNameClick(rowIndex, rowData) {
      let clusterId = rowData.id;
      let projectId = rowData.project;
      let statusTem = rowData.status;
      this.scalServicemainVisable = false;
      this.detailVisable = true;
      this.$refs.scalingServiceDetail.initScalServiceDetail(clusterId, projectId, statusTem);
    },
    handlePageHeaderBack() {
      this.detailVisable = false;
      this.scalServicemainVisable = true;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      var self = this;
      self.getData();
      self.$refs.clusTable.clearSelection();
    },
    refreshData() {
      var self = this;
      self.getData();
      self.$refs.clusTable.clearSelection();
    },
    dateRender(value, rowData) {
      var self = this;
      var time = Date.parse(new Date(value));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    /**
     * 将时间戳格式化的方法
     * @param timeStamp时间戳值
     * @param fmt 要生成的格式，如yyyy-MM-dd HH:mm:ss
     * @returns
     */
    formatTimeStamp(timeStamp, fmt) {
      if (!timeStamp) {
        return "";
      }
      var date = new Date();
      date.setTime(timeStamp);
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : ""));
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    },
    async loadProjectList() {
      //查询所有的项目列表
      var self = this;
      self.loading = true;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/projects";
      if ("2" == roleType || "3" == roleType) { //非超级管理员，查询一个项目信息
        url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
      }
       try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false
        });
        self.loading = false;
        if ("2" == roleType || "3" == roleType) {
          self.projectlist.push(result['project']);
          self.projectMap.set(result['project'].id, result['project'].name);
        } else {
          //self.projectlist = result['projects'];
          var projects = result['projects'];
          for (var q = 0; q < projects.length; q++) {
            self.projectMap.set(projects[q].id, projects[q].name);
          }
          self.projectlist.push({"name":this.$t('lang.all'), "id":"0"});
          self.projectlist = self.projectlist.concat(result['projects']);
        }
      } catch (res) {
        self.loading = false;
      }
    },
    projectRender(value, rowData) {
      var name = this.projectMap.get(value);
      if (null == name || "" == name) {
        return value;
      } else {
        return name;
      }
    },
    statusTagRender(status) {
        if ("ACTIVE" == status) {
           return "success";
        } else if ("DELETING" == status || "PREDELETING" == status) {
           return "gray";
        } else if ("WARNING" == status || "CRITICAL" == status || "ERROR" == status) {
           return "danger";
        } else if ("INIT" == status || "RECOVERING" == status || "OPERATING" == status) {
           return "info";
        } else if ("CREATING" == status || "RESIZING" == status || "UPDATING" == status || "CHECKING" == status) {
           return "info";
        } else {
          return "";
        }
    },
    statusRender(value, rowData) {
       if (value == "INIT") {
           return this.$t('scalingService.init');
       } else if (value == "ACTIVE") {
           return this.$t('scalingService.available');
       } else if (value == "ERROR") {
           return this.$t('scalingService.error');
       } else if (value == "CRITICAL") {
           return this.$t('scalingService.critical');
       } else if (value == "WARNING") {
           return this.$t('scalingService.warning');
       } else if (value == "CREATING") {
           return this.$t('scalingService.creating');
       } else if (value == "UPDATING") {
           return this.$t('scalingService.updating');
       } else if (value == "RESIZING") {
           return this.$t('scalingService.resizing');
       } else if (value == "DELETING" || value == "PREDELETING") {
           return this.$t('scalingService.deleting');
       } else if (value == "CHECKING") {
           return this.$t('scalingService.checking');
       } else if (value == "RECOVERING") {
           return this.$t('scalingService.recovering');
       } else if (value == "OPERATING") {
           return this.$t('scalingService.operating');
       } else {
           return "-";
       }
    },
    balanceStatusTagRender(value) {
      if (value['loadbalancers']) {
        return "success";
      } else {
        return "gray";
      }
      // var size = parseInt(value.length);
      // if (size > 2) {
      //   return "success";
      // } else {
      //   return "";
      // }
    },
    balanceStatusRender(value, rowData) {
      if (value['loadbalancers']) {
        return this.$t('scalingService.hasSet');
      } else {
        return this.$t('scalingService.unSet');
      }
      // var size = parseInt(value.length);
      // if (size > 2) {
      //   return "已设置";
      // } else {
      //   return "未设置";
      // }
    },
    balanceVipRender(value, rowData) {
      let loadbalances = value['loadbalancers'];
      if (loadbalances) {
        var vip = "";
        for (var k in loadbalances) {
          for (var s in loadbalances[k]) {
            vip = loadbalances[k]["vip_address"];
            break;
          }
        }
        return vip;
      } else {
        return "-";
      }
    },
    async detailFun() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/senlin/v1/clusters/inspur/'+ self.clusterId
        });
        if (result['cluster']) {
          let cluster = result['cluster'];
          self.uuid = cluster['id'];
          self.clusterName = cluster['name'];
          let receiverList = cluster['receivers'];
          if (receiverList != null) {
          for (let i = 0; i < receiverList.length; i++) {
            let receiver = receiverList[i];
            if (receiver['action'] == "CLUSTER_SCALE_IN") {
              let s1 = receiver['channel'];
              this.downAlertUrl = s1['alarm_url'];
            }
            if (receiver['action'] == "CLUSTER_SCALE_OUT") {
              let s2 = receiver['channel'];
              this.upAlertUrl = s2['alarm_url'];
            }
           }
          }
        } else {
          return;
        }
      } catch (res) {
      }
    },
    handleSearch(params) {
      const $this = this;
      this.searchBar.validatedParams = params;
      $this.getData();
      $this.$refs.pageComponent.setCurrentPage(1);
      $this.$refs.clusTable.clearSelection();
    }
  }
}
</script>