<template>
  <el-form class="margin-tb20" label-position="left" :model="projectCreateForm" ref="projectCreateForm" :rules="rules" v-loading="netloading" :element-loading-text="loadingCheckText">
    <el-form-item :label="$t('lang.type')" class="is-required">
      <el-radio-group v-model="projectCreateForm.type" @change="netTypeChange">
        <el-radio class="radio"  label="1">{{$t('network.network')}}</el-radio>
        <el-radio class="radio"  label="2" :disabled="portDisabled">{{$t('network.port')}}</el-radio>
        <el-radio class="radio" label="3">{{$t('network.NETWORK_STRATEGY')}}</el-radio>
      </el-radio-group>
    </el-form-item>
    <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
      <el-form :inline="true" v-model="formInline" class="form-inline" v-show="projectCreateForm.type=='1'">
        <el-form-item :label="$t('lang.name')">
          <el-input :placeholder="$t('lang.name')" size="small" v-model="projectCreateForm.netName"></el-input>
        </el-form-item>
        <!-- <el-form-item :label="$t('lang.status')">
          <el-select v-model="netStatus" size="small"  @change="statusNetFilter">
            <el-option :label="$t('lang.all')" value="0"></el-option>
            <el-option :label="$t('calcStorLang.runningStatus')" value="ACTIVE"></el-option>
            <el-option :label="$t('lang.DOWN')" value="DOWN"></el-option>
            <el-option :label="$t('lang.BUILD')" value="BUILD"></el-option>
            <el-option :label="$t('lang.ERROR')" value="ERROR"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" icon='fa-search' size="small"  @click="searchNetList">{{$t('lang.query')}}</el-button>
        </el-form-item>
      </el-form>
      <div v-if="columns.length > 0 && projectCreateForm.type === '1'">
        <el-checkbox-group class="vertical" v-model="columnsChecked">
          <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div v-if="projectCreateForm.type=='3'">
      <strategy-list @selectStrategy="selectStrategy" :projectId="projectId"></strategy-list>
    </div>
    <div v-show="projectCreateForm.type!='3'">
      <el-table ref="acTable" :data="tableData" highlight-current-row border stripe @selection-change="handleSelectionChange" @select="handleRowSelect" @select-all="handleRowSelectAll" :default-sort="defaultSort"  row-key="id"  @sort-change="sortChange" v-loading="loading" :element-loading-text="loadingText">
        <el-table-column reserve-selection type="selection" align="center" width="55">
        </el-table-column>
        <el-table-column prop="name" :label="$t('lang.name')" show-overflow-tooltip  min-width="70" align="left"  sortable="custom">
          <template slot-scope="scope">
            <span v-html="netOrPortNameRender(scope.row.name, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="(projectCreateForm.type + '') == '2'" prop="address" show-overflow-tooltip align="left"  :label="$t('calcStorLang.IP')" min-width="80" >
          <template slot-scope="scope">
            <span v-html="ipAddressRender(scope.row.address, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="(projectCreateForm.type + '') == '1'" prop="subNet" :label="$t('calcStorLang.instConnectSubnet')" show-overflow-tooltip min-width="80">
          <template slot-scope="scope">
            <span v-html="subnetRender(scope.row.subNet, scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="(projectCreateForm.type + '') == '1' && detailConfig.roleType!='3'" :label="$t('calcStorLang.instNetAllocation')" show-overflow-tooltip :render-header="instNetStatusHeader" min-width="80">
          <template slot-scope="scope">
            <el-form-item id="ipAddressColumn" style="margin-bottom:0px;margin:5px 0px">
              <el-input :placeholder="$t('calcStorLang.createInstIpTip1')" size="small" :id="ipRender(scope.row)" :disabled="cardIpDisabled"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column v-if="(projectCreateForm.type + '') == '1' && detailConfig.roleType!='3' && columnsChecked.indexOf('mac') >= 0" :label="$t('calcStorLang.VM_MAC')" show-overflow-tooltip min-width="80">
          <template slot-scope="scope">
            <el-form-item id="macColumn" style="margin-bottom:0px;margin:5px 0px">
              <el-input :placeholder="$t('calcStorLang.VM_MAC_CREATE_PLACEHOLDER')" v-model="scope.row.fixed_mac" size="small" :id="macRender(scope.row)" :disabled="cardIpDisabled"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="admin_status_up" :label="$t('calcStorLang.instNetManageStatus')" align="left"  min-width="55">
          <template slot-scope="scope">
            <span v-html="managestatusRender(scope.row.admin_state_up)"></span>
          </template>
        </el-table-column>
        <!-- <el-table-column v-if="columnsChecked.indexOf('isShare') >= 0" prop="shared" align="left" label="是否共享" show-overflow-tooltip min-width="70" sortable>
          <template slot-scope="scope">
            <span v-html="netShareRender(scope.row.shared, scope.row)"></span>
          </template>
        </el-table-column> -->
        <el-table-column prop="status" align="left" :label="$t('lang.status')" show-overflow-tooltip min-width="70">
          <template slot-scope="scope">
            <span v-html="subnetStatusRender(scope.row.shared, scope.row)"></span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <div style="display: flex; flex-direction: row; justify-content: space-between;">
          <div>
            <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
            <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          </div>
          <div>
            <page :totalData="totalData" @getCurrentData="getCurrentData" :pageCount="pageCount"></page>
          </div>
        </div>
      </div>
    </div>
    <el-collapse class="col-24" v-if="projectCreateForm.type!='3'">
      <el-collapse-item :title="$t('calcStorLang.securityGroup')" name="11">
        <!-- <el-form-item label="安全组" class="">
          <el-select v-model="safeGroupValue" filterable>
            <el-option v-for="(safe, index) in projectCreateForm.safeList" :key="safe.id" :label="safe.name"  :command="index" :value="safe.id">
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-transfer
            id="transferChoose"
            filterable
            v-model="valueT"
            :titles="[$t('calcStorLang.instAvailableSecGroup') , $t('calcStorLang.instExistSecGroup')]"
            :data="sgs"
            @change="transferChange">
          </el-transfer>
      </el-collapse-item>
    </el-collapse>
    <!-- </el-form-item> -->
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStepFive" type="primary">{{$t('lang.nextStep')}}</el-button>
      <el-button @click="nextStep" type="primary" id="createFinishBtn">{{$t('lang.finish')}}</el-button>
    </div>
  </el-form>
</template>
<script>
import StrategyList from "./StrategyList"
export default {
  name: 'StepFour',
  props: ['projectId', 'detailConfig'],
  components: {
    StrategyList
  },
  data() {
    return {
      strategyInfo: [],
      projectCreateForm: {
        type: '1',
        netmask: '',
        ipPoolTable: [],
        safeList: [],
        netName: "",
        ipAddress: ''
      },
      defaultSort:{},
      portDisabled: false,
      cardIpDisabled: false,
      netloading: false,
      loadingCheckText:Vue.t('calcStorLang.dataValidLoading'),
      loadingText:Vue.t('calcStorLang.dataLoading'),
      totalData: [],
      pageCount: 5,
      formInline: '',
      isShareStatus: "0",
      netStatus: "0",
      safeGroupValue: "",
      currentPage: 1,
      showBorder: true,
      conSubnetFlag: true,
      ipAddressFlag: false,
      pageSizes: [5, 10, 20],
      pageSize: 5,
      total: 0,
      defaultSecValue: "",
      subnetMaps: new Map(),
      ipValidFlag: true,
      isDisabled:false,
      netList: [], //组合查找的网络列表
      columns: [/*{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "address",
        label: Vue.t('calcStorLang.instNetAddress')
      }, {
        prop: "subNet",
        label: Vue.t('calcStorLang.instSubnet')
      }, {
        prop: "isShare",
        label: "是否共享"
      }{
        prop: "status",
        label: Vue.t('lang.status')
      }*/],
      columnsChecked: [/*'name', 'address', 'subNet', 'isShare', 'status'*/],
      tableData: [],
      multipleSelection: [],
      queryParam: {
        "page": 1,
        "pageSize": 5,
        field: "",
        dir: ""
      },
      loading: false,
      valueT: [],
      sgs: [],
      rules: {
        ipAddress: [
          //{ validator:checkIpv4, trigger:'blur' }
        ]
      }
    }
  },
  watch: {
    'projectCreateForm.type': {
      handler(value) {
        if (value !== "3") {
          this.strategyInfo = [];
        }
      }
    },
    projectId() {
      var self = this;
      self.initForm = Object.assign({}, this.projectCreateForm);
      Promise.all([self.loadSubNetList()]).then(function(result) {
        let list = result[0];
        if (list != null) {
          for (var s = 0; s < list.length; s++) {
              var obj = list[s];
              var subValue = obj.name + "(" + obj.cidr + ")";
              self.subnetMaps.set(obj.id, subValue);
          }
        }
        self.netTypeChange(self.projectCreateForm.type);
        // self.init();
      });
      Promise.all([self.loadNetSafeGroup()]).then(function(result) {
          var selList = [self.defaultSecValue];
          self.valueT = selList;
          self.$nextTick(() => {
            self.addTitleTip();
          });
      });
    },
    columnsChecked(newValue, oldValue) {
      if (oldValue.includes('mac') && !newValue.includes('mac')) {
        // 如果去掉了mac的选择
        this.tableData.forEach(item => {
          item.fixed_mac = '';
        });
      }
    }
  },
  mounted() {
    var self = this;
    if (self.detailConfig.roleType == '3') {
      Promise.all([self.loadSubNetList()]).then(function(result) {
        let list = result[0];
        if (list != null) {
          for (var s = 0; s < list.length; s++) {
              var obj = list[s];
              var subValue = obj.name + "(" + obj.cidr + ")";
              self.subnetMaps.set(obj.id, subValue);
          }
        }
        self.init();
      });
      Promise.all([self.loadNetSafeGroup()]).then(function(result) {
        var selList = [self.defaultSecValue];
        self.valueT = selList;
        self.$nextTick(() => {
          self.addTitleTip();
        });
      });
    }
    if (Vue.roleType + '' !== '3') {
      this.columns.push({
        prop: 'mac',
        label: Vue.t('calcStorLang.VM_MAC')
      });
    }
  },
  methods: {
    selectStrategy(val) {
      this.strategyInfo = [];
      if (val) {
        this.strategyInfo.push(val);
      }
    },
    sortChange(column) {
      var self = this;
      var key = column.prop;
      var keyOrder = column.order;
      if (keyOrder != null && self.totalData != null) {
        self.totalData.sort(this.$sortFormatter(key, keyOrder));
      }
    },
    init() {
      const $this = this;
      $this.loadNetwork();
    },
    async loadNetwork() {
      const $this = this;

      $this.loading = true;

      const subNets = await $this.loadSubNetList();
      if (subNets != null) {
        $this.subnetMaps.clear();
        for (var s = 0; s < subNets.length; s++) {
          var obj = subNets[s];
          var subValue = obj.name + "(" + obj.cidr + ")";
          $this.subnetMaps.set(obj.id, subValue);
        }
      }

      let netsList = [];
      const data1 = await $this.loadProjectNetList();
      const data2 = await $this.loadSharedNetList();
      const nets = data1.concat(data2);
      for (let t = 0; t < nets.length; t++) {
        let netObj = nets[t];
        netObj['fixed_mac'] = '';
        if ((netObj['admin_state_up'] + "") == "true") {
            netsList.push(netObj);
        }
      }
      $this.totalData = netsList;
      $this.netList = netsList;
      $this.loading = false;
    },
    async loadProjectNetList() {
      var self = this;
      var url = 'api/neutron/v2.0/networks?project_id='+ self.projectId + "&shared=false&status=ACTIVE&router:external=false";
      if (self.detailConfig.roleType == '3') {
          url = 'api/neutron/v2.0/networks?project_id='+ this.$cookie.get("pid") + "&shared=false&status=ACTIVE&router:external=false";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        return result['networks'];
      } catch (res) {}
    },
    async loadSharedNetList() {
       var self = this;
       try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/neutron/v2.0/networks?shared=true&status=ACTIVE',
          showErrMsg: true
        });
        return result['networks'];
      } catch (res) {}
    },
    async loadSubNetList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/neutron/v2.0/subnets',
          showErrMsg: true
        });
        return result['subnets'];
      } catch (res) {}
    },
    async loadNetPortList() {
       var self = this;
       var url = 'api/neutron/v2.0/ports?project_id='+ self.projectId + '&device_id=+&admin_state_up=true&status=DOWN';
       if (self.detailConfig.roleType == '3') {
          url = 'api/neutron/v2.0/ports?project_id='+ this.$cookie.get("pid") + '&device_id=+&admin_state_up=true&status=DOWN';
       }
       self.loading = true;
       try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        var portsList = result['ports'];
        // 过滤掉device_owner为network:reserved的数据 -- 预留地址功能支持
        portsList = portsList.filter((port) => {
          return port['device_owner'] !== 'network:reserved';
        });
        var portResult = [];
        for (let p = 0; p < portsList.length; p++) {
          var portObj = portsList[p];
          //|| (portObj['device_owner'] != "" && portObj['device_owner'].indexOf("compute") >= 0)
          if (portObj['fixed_ips'] == "" || portObj['fixed_ips'] == null) {
              continue;
          }
          if (portObj.name == null || portObj.name == "") {
            portObj.name = portObj.id;
          }
          portResult.push(portObj);
        }
         let networkidArr = [];
         for (let i = 0; i < self.netList.length; i++) {
           networkidArr.push(self.netList[i].id);
         }
         let portResultTmp = [];
         for (let v of portResult) {
           let networkId = v.network_id;
           if (networkidArr.includes(networkId)) {
             portResultTmp.push(v);
           }
         }
        self.totalData = portResultTmp;
        // self.total = result['ports'].length;
      } catch (res) {
        self.loading = false;
      }
    },
    statusNetFilter() {
      var self = this;
      var netName = self.projectCreateForm.netName;
      var status = self.netStatus == "0"?"":self.netStatus;
      if (self.netList != null && status != "") {
        var results = self.searchByKey("status", status);
        self.totalData = results;
      } else {
        self.totalData = self.netList;
      }
    },
    async searchNetList() {
      var self = this;
      var netName = self.projectCreateForm.netName;
      var status = self.netStatus == "0"?"":self.netStatus;
      var resultList = [];
      await self.loadNetwork();
      if ( netName != "" && status != "") {
        for (let nn = 0; nn < self.netList.length; nn++) {
          var obj = self.netList[nn];
          if (obj.name.indexOf(netName) >= 0 && obj.status == status) {
              resultList.push(obj);
          }
        }
      } else if (netName == "" && status != "") {
        resultList = self.searchByKey("status", status);
      } else if (netName != "" && status == "") {
        resultList = self.searchByKey("name", netName);
      } else {
        resultList = self.netList;
      }
        self.totalData = resultList;
        self.$refs.acTable.clearSelection();
        self.currentPage = 1;
    },
    searchByKey(key, value) {
      var self = this;
      var rets = [];
      for (let k = 0; k < self.netList.length; k++) {
        var obj = self.netList[k];
        if (key == "name") {
          if (obj[key].indexOf(value) >= 0) {
            rets.push(obj);
          }
        } else {
          if (obj[key] == value) {
            rets.push(obj);
          }
        }
      }
      return rets;
    },
    transferChange() {
      this.$nextTick(() => {
        this.addTitleTip();
      });
    },
    ipv4Valid(row) {
      var self = this;
      var isValid = true;
      var id = "ip" + row.id;
      var ipValue = $("#" + id).find("input[type='text']").val();
      if (self.projectCreateForm.type == "1") {
        /*$("[id=ipAddressColumn]").each(function() {
        });*/
         if (ipValue != null && ipValue != "") {
          let reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
          let regV6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
          if (reg.test(ipValue) || regV6.test(ipValue)) {
            Promise.all([self.validIpInRange(ipValue, row.id)]).then(function(result) {
               var flag = result[0] + "";
               if ("false" == flag) {
                  self.$message({
                    showClose: true,
                    message: Vue.t('calcStorLang.instCreateNetTip1'),
                    type: 'warning'
                  });
                  $("#" + id).find("input[type='text']").val("");
               }
            });
          } else {
            isValid = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateNetTip2'),
              type: 'warning'
            });
            $("#" + id).find("input[type='text']").val("");
            return false;
          }
        }
     }
        return isValid;
    },
    async validIpInRange(ip, netId) {
      var self = this;
      var body = {"ip":ip, "netId":netId};
      body = JSON.stringify(body);
      // self.netloading = true;
      try {
        let result = await self.$ajax({
          type: 'post',
          url: 'api/neutron/v2.0/inspur/networkextension/validate_ip_in_net',
          data:body,
          showErrMsg: true
        });
        // self.netloading = false;
        return result;
      } catch (res) {
      }
    },
    ipRender(row) {
      return "ip" + row['id'];
    },
    macRender(row) {
      return 'mac' + row['id'];
    },
    addTitleTip() {
      var spanText = $("#transferChoose").find("span[class='el-checkbox__label']");
      if (spanText != null) {
        for (var s = 0; s < spanText.length; s++) {
          var obj = spanText[s];
          spanText[s].title = obj.innerText || "";
        }
      }
    },
    managestatusRender(value) {
      if (value == true) {
        return "UP";
      } else {
        return "DOWN";
      }
    },
    netTypeChange(value) {
      var self = this;
      self.$refs.acTable.columns[1].order = ""; //清空排序
      self.$refs.acTable.clearSelection();
      if ("1" == value) {
        self.conSubnetFlag = true;
        self.ipAddressFlag = false;
        self.init();
      } else {
        self.ipAddressFlag = true;
        self.conSubnetFlag = false;
        self.loadNetPortList();
      }
    },
    async loadNetSafeGroup() {
      var self = this;
      self.sgs = [];
      var projectUuid = self.projectId;
      if (self.detailConfig.roleType == '3') {
        projectUuid = self.$cookie.get("pid");
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/neutron/v2.0/security-groups?tenant_id=' + projectUuid,
          showErrMsg: true
        });
        for (let i = 0; i <= result['security_groups'].length; i++) {
          let sg = result['security_groups'][i];
          var name = sg.name;
          if (name == "default") {
            self.defaultSecValue = sg.id;
          }
          var desc = sg.description == ""?"": "--"+ sg.description;
          self.sgs.push({
            key: sg.id,
            label: name + desc//`${sg.name}  --  ${sg.description}` name + desc
          })
        }
      } catch (res) {
        // self.loading = false;
      }
    },
    subnetStatusRender(value, row) {
      if (row["status"] === "ACTIVE") {
        return this.$t('calcStorLang.runningStatus')
      } else if (row["status"] === "DOWN") {
        return this.$t('lang.DOWN')
      } else if (row["status"] === "BUILD") {
        return this.$t('lang.BUILD')
      } else if (row["status"] === "ERROR") {
        return this.$t('lang.ERROR')
      }
    },
    subnetRender(value, rowData) {
      var self = this;
      var list = rowData['subnets'];
      if (list != null && list.length > 0) {
        var results = "";
        for (let sb = 0; sb < list.length; sb++) {
            var subName = self.subnetMaps.get(list[sb]) || "";
            results += subName + "<br>";
        }
          return results;
      } else {
        return '-';
      }
    },
    netOrPortNameRender(value, rowData) {
      return rowData['name'] || rowData['id'] || "-";
    },
    ipAddressRender(value, rowData) {
      var ips = rowData['fixed_ips'] || "";
      if (ips != "") {
        var result = "";
        for (let p = 0; p < ips.length; p++) {
          result += ips[p]['ip_address'] + "<br>";
        }
          return result;
      } else {
        return "-";
      }
    },
    nextStep() {
      var self = this;
      self.btnStatusRender();
      self.loadingCheckText = Vue.t('calcStorLang.dataSubmission');
      self.netloading = true;
      this.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          self.netloading = true;
          if (this.multipleSelection.length === 0 && this.strategyInfo.length === 0) {
            self.netloading = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instChooseNetOrPort'),
              type: 'warning'
            });
            self.clearStatusRender();
            return false;
          } else {
            if (self.valueT == "") {
              self.netloading = false;
              self.$message({
                showClose: true,
                message: Vue.t('calcStorLang.instChooseSecuGroup'),
                type: 'warning'
              });
              self.clearStatusRender();
            } else if (self.projectCreateForm.type === "3") {
              self.$emit("stepFourDone", {});
            } else {
              //校验IP的合法性
              var flag1 = self.loadValidIpFlag() + "";
              if (flag1 == "true") {
                //校验IP是否在ip范围内
                Promise.all([self.loadValidIpInLegalFlag()]).then(function(result) {
                  var flag2 = result[0] + "";
                  if ("true" == flag2) {
                    //校验IP资源是否用尽
                    Promise.all([self.validateFreeIpsInNets()]).then(function(result) {
                      var validFlag = result[0];
                      if (validFlag != "") {
                        var validIps = self.loadValidFreeIps(validFlag);
                        if (validIps) {
                          const macValid = self.checkMacValid();
                          if (macValid) {
                            self.$emit("stepFourDone", {"sgs":self.valueT});
                          } else {
                            self.clearStatusRender();
                            self.netloading = false;
                          }
                          // self.netloading = false;
                        } else {
                          self.clearStatusRender();
                          self.netloading = false;
                        }
                      } else {
                        const macValid = self.checkMacValid();
                        if (macValid) {
                          self.$emit("stepFourDone", {"sgs":self.valueT});
                        } else {
                          self.clearStatusRender();
                          self.netloading = false;
                        }
                        // self.netloading = false;
                      }
                    });
                  } else {
                    setTimeout( function() {
                      self.$message({
                        showClose: true,
                        message: Vue.t('calcStorLang.instCreateNetTip1'),
                        type: 'warning'
                      });
                      self.clearStatusRender();
                      self.netloading = false;
                    }, 3000);
                  }
                });
              } else {
                self.clearStatusRender();
                self.netloading = false;
              }
            }
          }
        } else {
          return false;
        }
      });
    },
    nextStepFive() {
      var self = this;
      self.netloading = true;
      self.loadingCheckText = Vue.t('calcStorLang.dataValidLoading');
      this.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          if (this.multipleSelection.length === 0 && this.strategyInfo.length === 0) {
            self.netloading = false;
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instChooseNetOrPort'),
              type: 'warning'
            });
            return false;
          } else {
            if (self.valueT == "") {
              self.netloading = false;
              self.$message({
                showClose: true,
                message: Vue.t('calcStorLang.instChooseSecuGroup'),
                type: 'warning'
              });
            } else if (self.projectCreateForm.type === "3") {
              self.$emit("prevFiveStep", 4);
              self.netloading = false;
            } else {
              //校验IP的合法性
              var flag1 = self.loadValidIpFlag() + "";
              if (flag1 == "true") {
                //校验IP是否在ip范围内
                Promise.all([self.loadValidIpInLegalFlag()]).then(function(result) {
                  var flag2 = result[0] + "";
                  if ("true" == flag2) {
                  //校验IP资源是否用尽
                    Promise.all([self.validateFreeIpsInNets()]).then(function(result) {
                      var validFlag = result[0];
                      if (validFlag != "") {
                        var validIps = self.loadValidFreeIps(validFlag);
                        if (validIps) {
                          const macValid = self.checkMacValid();
                          if (macValid) {
                            self.$emit("prevFiveStep", 4);
                            self.netloading = false;
                          } else {
                            self.clearStatusRender();
                            self.netloading = false;
                          }
                        }
                      } else {
                        const macValid = self.checkMacValid();
                        if (macValid) {
                          self.$emit("prevFiveStep", 4);
                          self.netloading = false;
                        } else {
                          self.clearStatusRender();
                          self.netloading = false;
                        }
                      }
                    });
                  } else {
                    setTimeout( function() {
                      self.$message({
                        showClose: true,
                        message: Vue.t('calcStorLang.instCreateNetTip1'),
                        type: 'warning'
                      });
                      self.netloading = false;
                    }, 3000);
                  }
                });
              } else {
                self.netloading = false;
              }
            }
          }
        } else {
          return false;
        }
      });
    },
    prevStep() {
      this.$emit("prevFourStep", 0);
    },
    cancel() {
      this.$emit("cancel");
    },
    btnStatusRender() {
      $("#createFinishBtn").attr("disabled", "disabled");
      $("#createFinishBtn").addClass("is-disabled");
    },
    clearStatusRender() {
      var self = this;
      setTimeout( function() {
        $("#createFinishBtn").removeAttr("disabled");
        $("#createFinishBtn").removeClass("is-disabled");
      }, 500);
    },
    //网络校验1：ip是否合法
    loadValidIpFlag() {
      var self = this;
      var nList = self.multipleSelection;
      if (self.projectCreateForm.type == "1") {
        let reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
        let regV6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
        var isFlag = true;
        for (let e = 0; e < nList.length; e++) {
          var row = nList[e];
          var ip = $("#ip" + row.id).find("input[type='text']").val();
          if (ip != null && ip != "") {
            if (reg.test(ip) || regV6.test(ip)) {
              continue;
            } else {
              isFlag = false;
              // $("#ip" + row.id).find("input[type='text']").val("");
            }
          }
        }
        if (!isFlag) {
          self.$message({
            showClose: true,
            message: Vue.t('calcStorLang.instCreateNetTip2'),
            type: 'warning'
          });
        }
        return isFlag;
      } else {
        return true;
      }
    },
    checkMacValid() {
      let $this = this;
      let pattern = /^([a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2}$/;
      let netList = $this.multipleSelection;
      for (let i = 0; i < netList.length; i++) {
        const net = netList[i];
        if ('fixed_mac' in net) {
          const fixedMac = net.fixed_mac;
          if (fixedMac !== '') {
            if (!pattern.test(fixedMac)) {
              $this.$message({
                showClose: true,
                message: Vue.t('calcStorLang.VM_MAC_NOT_VALID'),
                type: 'warning'
              });
              return false;
            } else if (fixedMac.toLowerCase().startsWith('fe:')) {
              $this.$message({
                showClose: true,
                message: Vue.t('calcStorLang.VM_MAC_NOT_VALID_LIBVIRT_RESERVED'),
                type: 'warning'
              });
              return false;
            } else if (!/^[0-9a-f][02468ace]$/.test(fixedMac.toLowerCase().substr(0, 2))) {
              $this.$message({
                showClose: true,
                message: Vue.t('calcStorLang.VM_MAC_NOT_VALID_MULTICAST'),
                type: 'warning'
              });
              return false;
            } else if (fixedMac.toLowerCase() === 'ff:ff:ff:ff:ff:ff') {
              $this.$message({
                showClose: true,
                message: Vue.t('calcStorLang.VM_MAC_NOT_VALID_BOARDCAST'),
                type: 'warning'
              });
              return false;
            }
          }
        }
      }
      return true;
    },
    //网络校验2：ip是否在合法的范围内
    async loadValidIpInLegalFlag() {
      var self = this;
      self.netloading = true;
      var validFlag = true;
      var nList = self.multipleSelection;
      for (let n = 0; n < nList.length; n++) {
        var net = nList[n];
        var ip = $("#ip" + net.id).find("input[type='text']").val();
        var body = {"ip":ip, "netId":net.id};
        body = JSON.stringify(body);
        if (ip != null && ip != "") {
          try {
          let result = await self.$ajax({
            type: 'post',
            url: 'api/neutron/v2.0/inspur/networkextension/validate_ip_in_net',
            data:body,
            async: false,
            showErrMsg: true,
            successFun: function(data) {
              if ("false" == (data + "")) {
                // $("#ip" + net.id).find("input[type='text']").val("");
                validFlag = false;
              }
            },
            errFun: function() {
              self.netloading = false;
            }
          });
          } catch (res) {
          }
        }
      }
        return validFlag;
    },
    //网络校验3：ip资源是否用尽
    async validateFreeIpsInNets() {
      var self = this;
      // self.$emit("maskLoading", true);
      var netList = self.multipleSelection;
      var nets = "";
      for (let n = 0; n < netList.length; n++) {
         var netObj = netList[n];
         nets += netObj['id'] + ",";
      }
      if (nets != "" && nets.length >1 ) {
        nets = nets.substring(0, nets.length - 1);
      }
      var body = {"net_ids": nets};
      body = JSON.stringify(body);
      try {
        let result = await self.$ajax({
          type: 'post',
          url: "api/neutron/v2.0/inspur/networkextension/validate_free_ips_in_nets",
          showErrMsg: false,
          data: body
        });
        return result;
      } catch (res) {
        // self.$emit("maskLoading", false);
        // self.netloading = false;
        return "";
      }
    },
    loadValidFreeIps(data) {
      var self = this;
      var validData = JSON.stringify(data);
      var freeIpData = JSON.parse(validData);
      if (freeIpData['has_exhaust_net'] + "" == "true") {
        self.$message({
            showClose: true,
            message: Vue.t('calcStorLang.net') + ":" + freeIpData['exhaust_net_list'] + Vue.t('calcStorLang.instCreateNetTip3'),
            type: 'warning'
          });
        // self.$emit("maskLoading", false);
        return false;
      } else {
        return true;
      }
    },
    handleRowSelect(selection, row) {
      if (this.projectCreateForm.type === '2') {
        const vnicType = row['binding:vnic_type'];
        if (vnicType === 'direct-physical' || vnicType === 'macvtap') {
          this.$message.warning(this.$t('calcStorLang.SRIOV_TIPS'));
          this.$refs.acTable.toggleRowSelection(row, false);
        }
      }
    },
    handleRowSelectAll(selection) {
      selection.forEach(item => {
        const vnicType = item['binding:vnic_type'];
        if (vnicType === 'direct-physical' || vnicType === 'macvtap') {
          this.$message.warning(this.$t('calcStorLang.SRIOV_TIPS'));
          this.$refs.acTable.toggleRowSelection(item, false);
        }
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    onRefresh() {
      var self = this;
      self.$refs.acTable.clearSelection();
      self.projectCreateForm.netName = "";
      $('div[id^=ip]').find("input[type='text']").val("");
      if ("1" == self.projectCreateForm.type) {
        self.conSubnetFlag = true;
        self.ipAddressFlag = false;
        self.init();
       } else {
        self.ipAddressFlag = true;
        self.conSubnetFlag = false;
        self.loadNetPortList();
       }
    },
    instNetStatusHeader(h, {column, $index}) {
      return h('span', [
        h('span', {
          style:"margin-right:5px;"
        }, column.label),
        h('el-tooltip', {
          effect:"dark",
          placement:"top"}, [
            h('div', {
              'slot':"content"
            }, Vue.t('calcStorLang.createInstNetTip')),
            h('i', {
              class:"el-icon-fa-question-circle"
            })
          ])
      ]);
    }
  }
}

</script>
<style scoped>


</style>
