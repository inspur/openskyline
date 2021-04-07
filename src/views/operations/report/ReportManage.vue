
<template>
  <div>
    <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('report.resource')">
        <el-select v-model="formInline.resource" @change="getIndicatorList" :disabled="loadingResource">
          <el-option v-for="item in resourceOption" :key="item.name" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('report.indicator')" v-if="formInline.resource != 'system_overview'">
        <el-select v-model="formInline.indicator" @change="indicatorChange">
          <el-option v-for="item in indicatorOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('lang.project') " v-if="roleType == '0' && (formInline.indicator == 'operation_log_detail' || formInline.indicator == 'vm_detail')">
        <el-input auto-complete="off" size="small" icon="circle-close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="formInline.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('report.user')" v-if="formInline.indicator=='vm_performance_report' && formInline.resource != 'system_overview'">
        <el-input auto-complete="off" size="small" icon="circle-close" :on-icon-click="onIconClick2" :readonly="true" @focus="selectUser" v-model="formInline.userName"></el-input>
      </el-form-item>
      <!-- 云主机详细信息 -->
      <el-form-item :label="$t('lang.name')" v-if="formInline.resource == 'vm' && formInline.indicator != 'vm_alarm' && formInline.resource != 'system_overview'">
        <el-input v-model="formInline.name" size="small"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.status')" v-if="formInline.resource == 'vm' && formInline.indicator == 'vm_detail' && formInline.resource != 'system_overview'">
        <el-select v-model="vmProps.status" clearable filterable>
          <!-- <el-option label="所有" value=""></el-option> -->
          <el-option :label="$t('calcStorLang.running')" value="ACTIVE"></el-option>
          <el-option :label="$t('calcStorLang.closed')" value="SHUTOFF"></el-option>
          <el-option :label="$t('calcStorLang.suspended')" value="SUSPENDED"></el-option>
          <el-option :label="$t('calcStorLang.paused')" value="PAUSED"></el-option>
          <el-option :label="$t('calcStorLang.error')" value="ERROR"></el-option>
          <el-option :label="$t('calcStorLang.rescue')" value="RESCUE"></el-option>
          <el-option :label="$t('calcStorLang.build')" value="BUILD"></el-option>
          <el-option :label="$t('calcStorLang.migrating')" value="MIGRATING"></el-option>
          <el-option :label="$t('calcStorLang.reboot')" value="REBOOT"></el-option>
          <el-option :label="$t('calcStorLang.hard_reboot')" value="HARD_REBOOT"></el-option>
          <el-option :label="$t('calcStorLang.shelved_offloaded')" value="SHELVED_OFFLOADED"></el-option>
          <el-option :label="$t('calcStorLang.password')" value="PASSWORD"></el-option>
          <el-option :label="$t('calcStorLang.rebuild')" value="REBUILD"></el-option>
          <el-option :label="$t('calcStorLang.revert_resize')" value="REVERT_RESIZE"></el-option>
          <el-option :label="$t('calcStorLang.verify_resize')" value="VERIFY_RESIZE"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('db.availabilityZone')" v-if="formInline.resource == 'vm' && formInline.indicator == 'vm_detail' && formInline.resource != 'system_overview'">
        <el-select v-model="vmProps.availability_zone" clearable>
          <el-option v-for="item in availabilityZoneOptions" :key="item.zoneName" :label="item.zoneName" :value="item.zoneName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('scalingService.resourceSpec')" v-if="formInline.resource == 'vm' && formInline.indicator == 'vm_detail' && formInline.resource != 'system_overview'">
        <el-select v-model="vmProps.flavor" clearable>
          <el-option v-for="item in flavorOptions" :key="item.id" :label="item.detail" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.host')" v-if="formInline.resource == 'vm' && formInline.indicator == 'vm_detail' && formInline.resource != 'system_overview' && roleType == '0'">
        <el-select v-model="vmProps.host" clearable>
          <el-option v-for="item in hostOptions" :key="item.hypervisor_hostname" :label="item.hypervisor_hostname" :value="item.hypervisor_hostname"></el-option>
        </el-select>
      </el-form-item>
      <!-- 云主机详细信息 -->

      <!-- 云主机告警 -->
      <el-form-item :label="$t('base.resourceName')" v-if="formInline.indicator == 'vm_alarm' || formInline.indicator == 'host_alarm' && formInline.resource != 'system_overview'">
        <el-input v-model="vmAlarm.resourceName" size="small"></el-input>
      </el-form-item>
      <el-form-item :label="$t('report.alarmLevel')" v-if="formInline.indicator == 'vm_alarm' || formInline.indicator == 'host_alarm' && formInline.resource != 'system_overview'">
        <el-select v-model="vmAlarm.level" size="small" clearable>
          <el-option :label="$t('base.lostAlarm')" value="LOST"></el-option>
          <el-option :label="$t('network.serious')" value="CRITICAL"></el-option>
          <el-option :label="$t('network.middlewarn')" value="WARNING"></el-option>
          <el-option :label="$t('network.backtonormal')" value="OK_RECOVERY"></el-option>
          <el-option :label="$t('network.normal')" value="OK"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.ipAddress')" v-if="formInline.indicator == 'vm_alarm' || formInline.indicator == 'host_alarm' && formInline.resource != 'system_overview'">
        <el-input v-model="vmAlarm.ipAddress" size="small"></el-input>
      </el-form-item>
      <!-- 云主机告警 -->

      <!-- 操作日志 -->
      <el-form-item :label="$t('base.accountNumber')" v-if="formInline.resource == 'operation_log' && formInline.resource != 'system_overview'">
        <el-input v-model="operationLog.user_name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.operationObject')" v-if="formInline.resource == 'operation_log' && formInline.resource != 'system_overview'">
        <el-select v-model="operationLog.target" filterable>
          <el-option :label="$t('base.all')" value=""></el-option>
          <el-option v-for="item in targetList" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="IP" v-if="formInline.resource == 'operation_log' && formInline.resource != 'system_overview'">
        <el-input v-model="operationLog.ip"></el-input>
      </el-form-item>
       <!--主机性能报表start-->
      <el-form-item :label="$t('monitor.statisticsByTime')" v-if="formInline.indicator == 'host_performance_report' || formInline.indicator == 'vm_performance_report' && formInline.resource != 'system_overview'">
        <el-select v-model="hostPerformanceSelect" filterable>
          <el-option :label="$t('base.last24Hour')" value="1"></el-option>
          <el-option :label="$t('base.lastWeek')" value="2"></el-option>
          <el-option :label="$t('base.lastMonth')" value="3"></el-option>
          <el-option :label="$t('network.selfDefine')" value="4"></el-option>
        </el-select>
      </el-form-item>
      <!--主机性能报表end-->
      <el-form-item :label="hostPerformanceSelect=='4' && formInline.resource =='operation_log'?$t('monitor.statisticsByTime'):''" 
         v-if="(formInline.indicator == 'host_performance_report' || formInline.indicator == 'vm_performance_report' || formInline.resource =='operation_log') && hostPerformanceSelect=='4'">
        <el-date-picker v-model="operationLog.start_time" type="date" :editable="false" :placeholder="$t('base.startDate')" :picker-options="spickerOption"></el-date-picker>
      </el-form-item>
      <el-form-item v-if="(formInline.indicator == 'host_performance_report' || formInline.indicator == 'vm_performance_report' || formInline.resource =='operation_log') && hostPerformanceSelect=='4'">
        <span>-</span>
      </el-form-item>
      <el-form-item v-if="(formInline.indicator == 'host_performance_report' || formInline.indicator == 'vm_performance_report'|| formInline.resource =='operation_log') && hostPerformanceSelect=='4'">
        <el-date-picker v-model="operationLog.end_time" type="date" :editable="false" :placeholder="$t('base.endDate')" :picker-options="epickerOption"></el-date-picker>
      </el-form-item>
      <!-- 操作日志 end-->
      <el-form-item v-show="formInline.resource != 'system_overview'">
        <el-button type="primary" icon='fa-search' @click="onSubmit" size="small" :disabled="formInline.resource=='' || formInline.indicator==''">{{$t('lang.query')}}</el-button>
      </el-form-item>
      <el-form-item v-show="formInline.resource == 'system_overview'">
        <el-button type="primary" icon='fa-refresh' @click="onSubmit" size="small">{{$t('lang.refresh')}}</el-button>
        <el-button type="primary" icon='fa-plus' @click="onSubmit(true)" size="small">{{$t('report.export')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
    <operation-panel
      class="margin-tb5" 
      v-show="formInline.resource != 'system_overview'" 
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
    <el-table
      ref="table"
      :data="tableData"
      v-show="formInline.resource != 'system_overview' && (formInline.indicator != 'host_alarm' && formInline.indicator != 'vm_alarm')"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      stripe
      :default-sort = "{prop: '', order: ''}"
      row-key="id"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <template v-for="header in tableHeaderList">
        <el-table-column 
          :key="header.prop"
          v-if="columnsChecked.indexOf(header.prop) >= 0"
          :prop="header.prop"
          :label="header.label"
          :sortable="formInline.resource=='host'?'custom':false"
          show-overflow-tooltip
          min-width="90">
        </el-table-column>
      </template>
    </el-table>
    <el-table
      ref="table"
      :data="tableData"
      v-show="formInline.resource != 'system_overview' && (formInline.indicator == 'host_alarm'|| formInline.indicator == 'vm_alarm')"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      stripe
      :default-sort = "{prop: '', order: ''}"
      row-key="id"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <template v-for="header in tableHeaderList">
        <el-table-column 
          :key="header.prop"
          v-if="columnsChecked.indexOf(header.prop) >= 0"
          :prop="header.prop"
          :label="header.label"
          :sortable="formInline.resource=='host'?'custom':false"
          :show-overflow-tooltip="!header.prop=='alert_content_cn'"
          :min-width="header.prop=='alert_content_cn'?200:80">
          <template slot-scope="scope">
            <div style="max-height: 240px; overflow-y: auto;" v-html="alertrowRender(header.prop, scope.row)"></div>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <div style="margin: 10px 0; position: relative" v-show="formInline.resource != 'system_overview'">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onSubmit">
          </el-button>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in tableHeaderList" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" v-if="formInline.resource=='host'"></page>
          <el-pagination
            v-if="formInline.resource=='operation_log' || formInline.resource=='vm'"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[5, 10, 20, 30, 40, 60, 80, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-col>
      </el-row>
    </div>
    <el-collapse v-if="formInline.resource == 'system_overview'" v-loading="loading" v-model="activeNames">
      <div v-for="colItem in colPanelData" :key="colItem.name" style="border: 1px solid #f1f1f1">
	      <el-collapse-item :title="colItem.title" :name="colItem.name">
		      <el-row :gutter="10">
            <div v-for="Items in colItem.itemAry" :key="Items.name">
              <el-col :span="9">
                <div class="table_panel">
                  <table class="table table-content table-hover idatatable" border="1">
                    <tbody>
                      <tr v-for="item in Items" :key="item.key">
                        <th class="idatath" style="width: 50%;">{{item.key}}：</th>
                        <td class="idatatd">{{item.value}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </el-col>
            </div>
         </el-row>
	      </el-collapse-item>
      </div>
    </el-collapse>
    <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    <select-user ref="selectUser" v-if="selUserFlg" @getSelUser="getSelUser" :instProjectId="formInline.query_project"></select-user>
  </div>
</template>
<script>
  import uuid from 'uuid';
  export default {
    name: "ReportManage",
    data() {
      return {
        formInline: {
          name:"",
          query_project:'',
          projectName:"",
          resource:"",
          indicator:"",
          userId:"",
          userName:""
        },
        activeNames:[],
        colPanelData:[],
        hostInfoArry:{},
        netInfoArry:{},
        vmInfoArry:{},
        storageInfoArry:{},
        projectAndUserInfoArry :{},
        loadingResource:true,
        vmProps:{
          status:"",
          availability_zone:"",
          flavor:"",
          host:""
        },
        vmAlarm:{
          resourceName:"",
          level:"",
          ipAddress:""
        },
        operationLog:{
          user_name:"",
          target:"",
          ip:"",
          start_time:(function(d) {
            let date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
            date.setDate(date.getDate()-7);
            return date;
          })(new Date()),
          end_time:(function(d) {
            let date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
            return date;
          })(new Date())
        },
        targetList:(function(obj, lan) {
          let arr = [];
          for (let key in obj) {
            let ar = [];
            if (obj[key].flg!=undefined) {
              ar = obj[key].flg.split(',');
            }
            if (undefined!==ar.find( (item) => { return item.trim()==Vue.roleType } )) {
              arr.push({
                id:obj[key][lan],
                name:obj[key][lan]
              });
            }
          }
          return arr;
        })(Vue.logTarget, Vue.language),
        roleType:Vue.roleType,
        projectOption:[],
        userMap:{},
        resourceOption:[],
        indicatorOption:[],
        availabilityZoneOptions:[],
        flavorOptions:[],
        hostOptions:[],
        tzTimeFormatter:this.$tzTimeFormatter,
        tableHeaderList:[],
        columns: [],
        columnsChecked:[],
        tableData: [],
        totalData: [],
        markerList: [],
        multipleSelection: [],
        hostPerformanceSelect:"2",
        loading: false,
        selProjectFlg:false,
        selUserFlg:false,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        currentParams: {},
        operationMenus: [{
          icon: "fa-plus",
          name: Vue.t('report.export'),
          showflg: true, //Vue.roleType != "0",
          readOnly: true,
          handler: function() {
            let self = this;
            self.onSubmit(true);
          }.bind(this)
        }],
        sortObj: {
          sortOrder: "desc",
          sortField: "name"
        },
        spickerOption:function() {
          let me = this;
          return {
            disabledDate(time) {
              let date = new Date();
              date.setFullYear(1970);
              if (me.operationLog.end_time) {
                return time.getTime() < date.getTime() || time.getTime() > me.operationLog.end_time;
              } else {
                return time.getTime() < date.getTime() || time.getTime() > Date.now();
              }
            }
          }
        }.bind(this)(),
        epickerOption:function() {
          let me = this;
          return {
            disabledDate(time) {
              let date = new Date();
              date.setFullYear(1970);
              if (me.operationLog.start_time) {
                return time.getTime() < me.operationLog.start_time || time.getTime() > Date.now();
              } else {
                return time.getTime() < date.getTime() || time.getTime() > Date.now();
              }
            }
          }
        }.bind(this)()
      };
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
      this.initColPanelData();
      this.getProjectList();
      this.getResourceList();
    },
    methods: {
      async getResourceList() {
        let self = this;
        self.resourceOption = [];
        self.loadingResource = true;
        await self.$ajax({
          url:"api/leo/v1/report/get_resource",
          type:"get",
          data:{
            roleType:self.roleType
          },
          successFun:(response) => {
            let resourceList = response.resources;
            if (resourceList && resourceList.length > 0) {
              for (let i = 0; i < resourceList.length; i++) {
                let resource = resourceList[i];
                let resourceId = resource.id;
                self.resourceOption.push({
                  name:Vue.language == "en"?resource.name_en:resource.name,
                  id:resourceId
                });
              }
              self.formInline.resource = self.resourceOption[0].id;
              self.loadingResource = false;
            } else {
              self.loadingResource = false;
            }
          }
        });
      },
      async getIndicatorList(resourceId) {
        let self = this;
        if (resourceId != "system_overview") {
          self.vmAlarm.resourceName = "";
          self.vmAlarm.ipAddress = "";
          await self.$ajax({
            url:"api/leo/v1/report/get_indicator",
            type:"get",
            data:{
              resource_id:resourceId,
              role_type:self.roleType
            },
            successFun:(response) => {
              self.indicatorOption = [];
              let indicatorList = response.indicators;
              if (indicatorList && indicatorList.length > 0) {
                for (let i = 0; i < indicatorList.length; i++) {
                  let indicator = indicatorList[i];
                  if (!Vue.service[indicator.module]) continue;
                  let name = indicator.name;
                  if (Vue.language == "en") {
                    name = indicator.name_en;
                  }
                  self.indicatorOption.push({
                    id:indicator.id,
                    name:name
                  });
                }
                self.formInline.indicator = self.indicatorOption[0].id;
              }
            }
          });
        }
        if (resourceId == "vm") {
          self.getAvailabilityZone();
          self.getFlavorList();
          if (Vue.roleType == "0") {
            self.getHostList();
          }
        } else if (resourceId == "operation_log") {
          self.hostPerformanceSelect = "4";
        }
        if (self.formInline.resource == "system_overview") {
           self.onSubmit();
        }
      },
      indicatorChange() {
        this.hostPerformanceSelect = "2";
        this.onSubmit();
      },
      // 获取可用域
      async getAvailabilityZone() {
        let self = this;
        await this.$ajax({
          type:"get",
          url:"api/nova/v2.1/os-availability-zone",
          successFun:(response) => {
            let dataList = response.availabilityZoneInfo;
            self.availabilityZoneOptions = [];
            dataList.forEach(data => {
              if (data.zoneState.available === true) {
                self.availabilityZoneOptions.push(data);
              }
            });
          }
        });
      },
      // 获取实例规格
      async getFlavorList() {
        try {
          let publicFlavor = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/flavors/detail?is_public=true"
          });
          let privateFlavor = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/flavors/detail?is_public=false"
          });
          let dataList = [];
          let idList = [];
          publicFlavor.flavors.forEach(function(obj, index) {
            dataList.push(obj);
            idList.push(obj['id']);
          });
          privateFlavor.flavors.forEach(function(obj, index) {
            if (idList.indexOf(obj['id']) == -1) {
              dataList.push(obj);
            }
          });
          this.flavorOptions = [];
          for (let i = 0; i < dataList.length; i++) {
            let data = dataList[i];
            if (data.name.indexOf("Bare@") < 0) {
              data.detail = data.name;
              this.flavorOptions.push(data);
            }
          }
        } catch (data) {
        }
      },

      // 获取主机
      async getHostList() {
        let self = this;
        await this.$ajax({
          type:"get",
          url:"api/nova/v2.1/os-hypervisors/detail",
          successFun:(response) => {
            let dataList = response.hypervisors;
            self.hostOptions = [];
            dataList.forEach(data => {
              if (data['hypervisor_type'] == "ironic") {
                // continue;
              } else {
                self.hostOptions.push(data);
              }
            });
          }
        });
      },
      initColPanelData () {
        let self = this;
        let colItem ={
          name:"",
          title:"",
          itemAry:[]
        };
        self.projectAndUserInfoArry = Object.assign({}, colItem);
        self.projectAndUserInfoArry.name = 1;
        self.projectAndUserInfoArry.title = Vue.t("report.projectAndUserInfo");
        self.storageInfoArry = Object.assign({}, colItem);
        self.storageInfoArry.name = 2;
        self.storageInfoArry.title = Vue.t("report.storageInfo");
        self.hostInfoArry = Object.assign({}, colItem);
        self.hostInfoArry.name = 3;
        self.hostInfoArry.title = Vue.t("report.hostInfo");
        self.vmInfoArry = Object.assign({}, colItem);
        self.vmInfoArry.name = 4;
        self.vmInfoArry.title = Vue.t("report.vmInfo");
        self.netInfoArry = Object.assign({}, colItem);
        self.netInfoArry.name = 5;
        self.netInfoArry.title = Vue.t("report.netInfo");
        self.colPanelData=[self.projectAndUserInfoArry, self.storageInfoArry, self.hostInfoArry, self.vmInfoArry, self.netInfoArry];
      },
      async getData(param, page=1, clearSel=false) {
        let self = this;
        if (clearSel) {
          self.$refs.table.clearSelection();
        }
        if (self.formInline.resource == "operation_log") {
          param["props"]["limit"] = self.pageSize;
          param["props"]["page"] = page;
        } else if (self.formInline.resource == "vm") {
          if (self.formInline.indicator == "vm_detail" || self.formInline.indicator == "vm_performance_report") {
            param.props.limit = self.pageSize;
            if (page > 1 && self.markerList.length > page - 2) {
              param.props.marker = self.markerList[page - 2];
            } else {
              delete param["props"]['marker'];
            }
          } else {
            param["props"]["page_size"] = self.pageSize;
            param["props"]["page_num"] = self.currentPage;
            delete param["props"]["limit"];
            delete param["props"]["page"];
            delete param["props"]["marker"];
          }
        } else if (self.formInline.resource == "host") {
          delete param["props"]["limit"];
          delete param["props"]["page"];
          delete param["props"]["marker"];
        }
        self.activeNames=[];
        let projectAndUserInfo = [];
        let projectAndUserInfo1 = [];
        let storageInfo = [];
        let storageInfo1 = [];
        let hostInfo = [];
        let hostInfo1 = [];
        let vmInfo = [];
        let vmInfo1 = [];
        let netInfo = [];
        let netInfo1 = [];
        self.loading = true;
        try {
          let response = await this.$ajax({
            type: 'post',
            url: "api/leo/v1/report/get_query_data",
            data:JSON.stringify(param)
          });
          self.loading = false;
          let dataList = response.data;
          if (self.formInline.resource == "operation_log") {
            self.tableData = response.data;
            self.total = response.page_info.total;
          } else if (self.formInline.resource == "vm") {
            self.tableData = response.data;
            if (response.hasOwnProperty('page_info') && response.page_info!=null) {
              if (self.formInline.indicator == "vm_alarm") {
                self.total = response.page_info.total;
              } else {
                self.total = response.page_info.total_instances;
              }
              if (response.page_info.hasOwnProperty('marker_list')) {
                self.markerList = response.page_info.marker_list;
              }
            }
          } else {
            self.totalData = dataList;
            self.total = dataList.length;
          }
          // 初始化表头
          let headerList = response.properties;
          self.tableHeaderList = [];
          self.columnsChecked = [];
          let name = "";
          headerList.forEach((header) => {
            name = header.name;
            if (Vue.language == "en") {
              name = header.name_en;
            }
            self.tableHeaderList.push({
              label:name,
              prop:header.key
            });
            if (param.indicator_id == "system_overview") {
              if (header.quence == 1) {
                projectAndUserInfo.push({
                  key:name,
                  value:dataList[0][header.key]
                })
              }
              if (header.quence == 2) {
                projectAndUserInfo1.push({
                  key:name,
                  value:dataList[0][header.key]
                })
              }
              if (header.quence >=3 && header.quence <= 8 ) {
                hostInfo.push({
                  key:name,
                  value:dataList[0][header.key]
                })
              }
              if (header.quence >=9 && header.quence <= 13 ) {
                hostInfo1.push({
                  key:name,
                  value:dataList[0][header.key]
                })
              }
              if (header.quence >=14 && header.quence <= 17 ) {
                vmInfo.push({
                  key:name,
                  value:dataList[0][header.key]
                })
              }
              if (header.quence >=18 && header.quence <= 21 ) {
                vmInfo1.push({
                  key:name,
                  value:dataList[0][header.key]
                })
              }
              if (header.quence >=22 && header.quence <= 25 ) {
                storageInfo.push({
                  key:name,
                  value:dataList[0][header.key]
                })
              }
              if (header.quence >=26 && header.quence <= 29 ) {
                storageInfo1.push({
                  key:name,
                  value:dataList[0][header.key]
                })
              }
              if (header.quence >=30 && header.quence <= 34 ) {
                netInfo.push({
                  key:name,
                  value:dataList[0][header.key]
                })
              }
              if (header.quence >=35 && header.quence <= 39 ) {
                netInfo1.push({
                  key:name,
                  value:dataList[0][header.key]
                })
              }
            }
            self.columnsChecked.push(header.key);
          });
          if (param.indicator_id == "system_overview") {
            self.projectAndUserInfoArry.itemAry = [projectAndUserInfo, projectAndUserInfo1];
            self.storageInfoArry.itemAry = [storageInfo, storageInfo1];
            self.hostInfoArry.itemAry=[hostInfo, hostInfo1];
            self.vmInfoArry.itemAry=[vmInfo, vmInfo1];
            self.netInfoArry.itemAry=[netInfo, netInfo1];
            self.activeNames = [1, 2, 3, 4, 5];
          }
        } catch (data) {
          self.loading = false;
          self.tableHeaderList = [];
          self.columnsChecked = [];
          self.totalData = [];
        }
        self.activeNames=[1, 2, 3, 4, 5];
      },
      getCurrentData(param) {
        this.tableData = param;
      },
      //多选
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      sortChange(column) {
        var self = this;
        var key = column.prop;
        var keyOrder = column.order;
        self.sortObj = {
          sortOrder: keyOrder,
          sortField: column.prop
        };
        self.getData(self.currentParams, 1, false);
      },
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
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
      },
      onIconClick() {
        this.formInline.query_project = '';
        this.formInline.projectName = '';
      },
      onIconClick2() {
        this.formInline.userId = '';
        this.formInline.userName = '';
      },
      selectUser() {
        this.selUserFlg = true;
        this.$nextTick(() => {
          this.$refs.selectUser.show();
        });
      },
      async getProjectList() {
        try {
          let url = 'api/keystone/v3/users/' + Vue.userId + '/projects?domain_id=default';
          if (Vue.roleType == '0') {
            url = 'api/keystone/v3/projects?domain_id=default';
          }
          let result = await this.$ajax({
            type: "GET",
            url: url
          });
          let projectList = result["projects"];
          this.projectOption = projectList;
        } catch (res) {
        console.log("获取项目列表失败");
      }
    },
    getProjectNameById(row) {
      let projectId = row["tenant"];
      for ( let i = 0; i < this.projectOption.length; i++) {
        if (projectId == this.projectOption[i].id) {
          return this.projectOption[i].name
        }
      }
    },
    async getUserList() {
      try {
        let url = 'api/keystone/v3/inspur/users?domain_id=default';
        let result = await this.$ajax({
          type: "GET",
          url: url
        });
        let userList = result["users"];
        let me = this;
        userList.forEach(function(u) {
          me.userMap[u.id] = u.name;
        });
      } catch (err) {
        console.log("获取用户列表失败");
      }
    },
    getSelUser(id, name) {
      this.formInline.userId = id;
      this.formInline.userName = name;
    },
    handleAddShow() {
      this.createTemplateFlag = false;
      this.applyTemplateFlag = false;
    },
    onSubmit(isExport) {
      let self = this;
      if ( this.formInline.resource == "system_overview") {
        this.formInline.indicator="system_overview";
      }
      let reqBody = {};
      let reqProps = {};
      if (self.formInline.resource == "vm") {
        if (self.formInline.indicator != "vm_alarm") {
          if (self.formInline.name.length > 40) {
            this.$message.error(this.$t('heat.fortyCharacterMaximum'));
            return;
          }
          let vmNameReg = /^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/;
          if (self.formInline.name != "" && !vmNameReg.test(self.formInline.name)) {
            this.$message.error(this.$t('lang.name') + ": " + this.$t('validation.onlyLetter_MinusNumberChinese'));
            return false;
          }

          if (self.formInline.indicator == 'vm_performance_report') {
            if (self.hostPerformanceSelect == "1") {
              let date = new Date(new Date().getTime());
              let endTime = parseInt(new Date().getTime()/1000);
              let startTime = parseInt((date.setDate(date.getDate()-1))/1000);
              reqProps.starttime = startTime;
              reqProps.endtime = endTime;
            } else if (self.hostPerformanceSelect == "2") {
              let date = new Date(new Date().getTime());
              let endTime = parseInt(date.getTime()/1000);
              let startTime = parseInt((date.setDate(date.getDate()-7))/1000);
              reqProps.starttime = startTime;
              reqProps.endtime = endTime;
            } else if (self.hostPerformanceSelect == "3") {
              let date = new Date(new Date().getTime());
              let endTime = parseInt(date.getTime()/1000);
              let startTime = parseInt((date.setMonth(date.getMonth()-1))/1000);
              reqProps.starttime = startTime;
              reqProps.endtime = endTime;
            } else if (self.hostPerformanceSelect == "4") {
              if (self.operationLog.start_time == null || self.operationLog.start_time == "") {
                self.$message.error(Vue.t("network.selectStartdata"));
                return;
              }
              if (self.operationLog.end_time == null || self.operationLog.end_time == "") {
                self.$message.error(Vue.t("network.selectEnddata"));
                return;
              }
              reqProps.starttime = parseInt((new Date(self.operationLog.start_time).getTime())/1000);
              reqProps.endtime = parseInt((new Date(self.operationLog.end_time).getTime()+24*3600*1000-1)/1000);
            }
            reqProps.user_id = self.formInline.userId;
          }

          reqProps = Object.assign({}, reqProps, self.vmProps);
          reqProps.name = self.formInline.name;
          reqProps.project_id = self.formInline.query_project;
        }
      } else if (self.formInline.resource == "operation_log") {
        if (self.operationLog.user_name.length > 40 || self.operationLog.ip.length > 40) {
          this.$message.error(this.$t('heat.fortyCharacterMaximum'));
          return;
        }
        let ipReg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
        if (self.operationLog.ip != "" && !ipReg.test(self.operationLog.ip)) {
          this.$message.error(this.$t('base.ipFormatError'));
          return false;
        }

        reqProps = Object.assign({}, reqProps, self.operationLog);
        reqProps.start_time = new Date(self.operationLog.start_time).getTime()+new Date().getTimezoneOffset()*60*1000;
        reqProps.end_time = new Date(self.operationLog.end_time).getTime()+new Date().getTimezoneOffset()*60*1000+24*3600*1000-1;
        reqProps.language = Vue.language || "zh_cn";
        reqProps.project_id = self.roleType==0?self.formInline.query_project:this.$cookie.get('pid');
        reqProps.region_id = this.$cookie.get("region_id");
        reqProps.field = "create_time";
        reqProps.dir = "desc";
        reqProps.user_name_accurate = "0";
      } else if (self.formInline.resource == "host") {
        if (self.hostPerformanceSelect == "1") {
          let date = new Date(new Date().getTime());
          let endTime = parseInt(new Date().getTime()/1000);
          let startTime = parseInt((date.setDate(date.getDate()-1))/1000);
          reqProps.starttime = startTime;
          reqProps.endtime = endTime;
        } else if (self.hostPerformanceSelect == "2") {
          let date = new Date(new Date().getTime());
          let endTime = parseInt(date.getTime()/1000);
          let startTime = parseInt((date.setDate(date.getDate()-7))/1000);
          reqProps.starttime = startTime;
          reqProps.endtime = endTime;
        } else if (self.hostPerformanceSelect == "3") {
          let date = new Date(new Date().getTime());
          let endTime = parseInt(date.getTime()/1000);
          let startTime = parseInt((date.setMonth(date.getMonth()-1))/1000);
          reqProps.starttime = startTime;
          reqProps.endtime = endTime;
        } else if (self.hostPerformanceSelect == "4") {
          if (self.operationLog.start_time == null || self.operationLog.start_time == "") {
            self.$message.error(Vue.t("network.selectStartdata"));
            return;
          }
          if (self.operationLog.end_time == null || self.operationLog.end_time == "") {
            self.$message.error(Vue.t("network.selectEnddata"));
            return;
          }
          reqProps.starttime = parseInt((new Date(self.operationLog.start_time).getTime())/1000);
          reqProps.endtime = parseInt((new Date(self.operationLog.end_time).getTime()+24*3600*1000-1)/1000);
        }
      }
      if (self.formInline.indicator == "vm_alarm" || self.formInline.indicator == "host_alarm") {
        if (self.vmAlarm.ipAddress.length > 40) {
          this.$message.error(this.$t('heat.fortyCharacterMaximum'));
          return;
        }
        let ipReg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
        if (self.vmAlarm.ipAddress != "" && !ipReg.test(self.vmAlarm.ipAddress)) {
          this.$message.error(this.$t('base.ipFormatError'));
          return false;
        }

        reqProps = {};
        reqProps = {
          level:self.vmAlarm.level,
          resource_name:self.vmAlarm.resourceName,
          resource_ip:self.vmAlarm.ipAddress,
          page_num:1,
          page_size:999999
        }
      }

      if (self.roleType == '0') {
        reqBody.all_tenants = 1;
        reqProps.all_tenants = 1;
      } else {
        reqBody.all_tenants = 0;
      }
      reqBody.project_id = this.$cookie.get("pid");
      reqBody.indicator_id = self.formInline.indicator;
      reqBody.language = Vue.language || "zh_cn";
      reqBody.props = reqProps;

      if (isExport === true) {
        reqBody.user_id = Vue.userId;
        this.exportReport(reqBody);
      } else {
        self.currentParams = reqBody;
        self.currentPage = 1;
        self.markerList = [];
        self.getData(self.currentParams, 1, false);
      }
    },
    async exportReport(param) {
      let self = this;
      self.loading = true;
      let reportResource = "";
      let reportIndicator = "";
      self.resourceOption.forEach(data => {
        if (data.id == self.formInline.resource) {
          reportResource = data.name;
          return;
        }
      });
      self.indicatorOption.forEach(data => {
        if (data.id == self.formInline.indicator) {
          reportIndicator = data.name;
          return;
        }
      });
      try {
        let traceId = 'req-'+uuid.v1();
        await this.$ajax({
          url:"api/leo/v1/report/create_export_task",
          type:"post",
          data:JSON.stringify(param),
          headers: {
            'X-Openstack-Request-Id': traceId
          },
          successMsg:this.$t("report.exportReportSuccess"),
          // log:{
          //   description:{
          //     en:"Export report, resource:" + reportResource + ", indicator:" + reportIndicator,
          //     zh_cn:"生成报表, 资源:" + reportResource + ", 指标:" + reportIndicator
          //   },
          //   target:Vue.logTarget.Report
          // },
          successFun:(response) => {
            if (response.body.data) {
              self.$recordLog({
                target: Vue.logTarget.Report,
                level: {
                  en: 'info',
                  zh_cn: '信息'
                },
                description: {
                  en: "Export report:" + response.body.data.name,
                  zh_cn: "生成报表:" + response.body.data.name
                },
                trace_id: traceId
              });
            } else {
              self.$recordLog({
                target: Vue.logTarget.Report,
                level: {
                  en: 'info',
                  zh_cn: '信息'
                },
                description: {
                  en: "Export report, resource:" + reportResource + ", indicator:" + reportIndicator,
                  zh_cn: "生成报表, 资源:" + reportResource + ", 指标:" + reportIndicator
                },
                trace_id: traceId
              });
            }
            this.$router.push({
              path: '/operations/report/reportDownload'
            });
          }
        });
        self.loading = false;
      } catch (error) {
        self.loading = false;
      }
    },
    handleSizeChange(val) {
      const self = this;
      self.pageSize = val;
      self.currentPage = 1;
      self.getData(self.currentParams, 1, false);
    },
    handleCurrentChange(val) {
      const self = this;
      self.currentPage = val;
      self.getData(self.currentParams, val, false);
    },
    alertrowRender(value, row) {
      if (row[value]) {
        return row[value];
      } else {
        return "-";
      }
    }
  }
};
</script>