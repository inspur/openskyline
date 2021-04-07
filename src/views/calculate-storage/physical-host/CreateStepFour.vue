<template>
  <el-form class="margin-tb20" label-position="left" :model="projectCreateForm" ref="projectCreateForm" label-width="100px">
    <el-form-item :label="$t('calcStorLang.type')" class="is-required">
      <el-radio-group v-model="projectCreateForm.type" @change="netTypeChange">
        <el-radio class="radio"  label="1">{{ $t('calcStorLang.net') }}</el-radio>
        <el-radio class="radio"  label="2">{{ $t('base.port') }}</el-radio>
      </el-radio-group>
      <el-tooltip placement="top" trigger="hover" :content="$t('network.SDN_TIP')">
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form :inline="true" v-model="formInline" class="form-inline"  v-show="projectCreateForm.type=='1'">
      <el-form-item :label="$t('lang.name')">
        <el-input :placeholder="$t('lang.name')" size="small" v-model="projectCreateForm.netName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.status')">
        <el-select v-model="netStatus" size="small"  @change="statusNetFilter">
          <el-option :label="$t('lang.all')" value="0"></el-option>
          <el-option :label="$t('calcStorLang.runningStatus')" value="ACTIVE"></el-option>
          <el-option :label="$t('lang.DOWN')" value="DOWN"></el-option>
          <el-option :label="$t('lang.BUILD')" value="BUILD"></el-option>
          <el-option :label="$t('lang.ERROR')" value="ERROR"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' size="small"  @click="searchNetList">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="acTable" :data="tableData" v-loading="loading" :element-loading-text="$t('calcStorLang.dataLoading')" highlight-current-row border stripe :default-sort="{prop: 'name', order: 'ascending'}" @selection-change="handleSelectionChange" row-key="id"  @sort-change="sortChange">
      <el-table-column reserve-selection type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" show-overflow-tooltip  min-width="70" align="left"  sortable="custom">
        <template slot-scope="scope">
          <span v-html="netOrPortNameRender(scope.row.name, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="(projectCreateForm.type + '') == '2'" prop="address" show-overflow-tooltip align="left" :label="$t('calcStorLang.IP')" min-width="80" >
        <template slot-scope="scope">
          <span v-html="ipAddressRender(scope.row.address, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="(projectCreateForm.type + '') == '1' && detailConfig.roleType!='3'" :label="$t('calcStorLang.instNetAllocation')" :render-header="instNetStatusHeader" show-overflow-tooltip min-width="80">
        <template slot-scope="scope">
          <el-form-item  id="ipAddressColumn" style="margin-bottom:0px;margin:5px 0px">
            <el-input :placeholder="$t('calcStorLang.createInstIpTip1')" size="small" :id="ipRender(scope.row)" v-model="scope.row.ipAllocation" :disabled="cardIpDisabled"></el-input>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column v-if="projectCreateForm.type === '1'" prop="subNet" :label="$t('calcStorLang.instConnectSubnet')" show-overflow-tooltip min-width="80" key="1">
        <template slot-scope="scope">
          <span v-html="subnetRender(scope.row.subNet, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column prop="admin_status_up"  :label="$t('calcStorLang.instNetManageStatus')"  align="left"  min-width="50">
      <template slot-scope="scope">
        <span v-html="managestatusRender(scope.row.admin_state_up)"></span>
      </template>
    </el-table-column>
      <!-- <el-table-column v-if="columnsChecked.indexOf('isShare') >= 0" prop="shared" align="left" label="是否共享" show-overflow-tooltip min-width="70" sortable>
        <template slot-scope="scope">
          <span v-html="netShareRender(scope.row.shared, scope.row)"></span>
        </template>
      </el-table-column> -->
      <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" align="left" :label="$t('lang.status')" show-overflow-tooltip min-width="70">
        <template slot-scope="scope">
          <span v-html="subnetStatusRender(scope.row.shared, scope.row)"></span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <!-- <div slot="reference" style="display: inline-block;">
              <el-tag>请选择列</el-tag>
            </div> -->
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData"  @getCurrentData="getCurrentData" :pageCount="pageCount" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
    </div>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary">{{$t('lang.finish')}}</el-button>
    </div>
  </el-form>
</template>
<script>
export default {
  name: 'StepFour',
  props: ['projectId', 'detailConfig'],
  data() {
    return {
      projectCreateForm: {
        type: '1',
        netmask: '',
        ipPoolTable: [],
        safeList: [],
        netName: ""
      },
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      cardIpDisabled: false,
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
      netList: [], //组合查找的网络列表
      columns: [{
        prop: "name",
        label: "名称"
      }, {
        prop: "address",
        label: "地址"
      }, {
        prop: "subNet",
        label: "子网"
      }, /*, {
        prop: "isShare",
        label: "是否共享"
      }*/{
        prop: "status",
        label: "状态"
      }],
      columnsChecked: ['name', 'address', 'subNet', /*'isShare', */'status'],
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
      sgs: []
    }
  },
  watch: {
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
          self.projectCreateForm.type = "1";
          self.init();
       });
       Promise.all([self.loadNetSafeGroup()]).then(function(result) {
           var selList = [self.defaultSecValue];
           self.valueT = selList;
           self.$nextTick(() => {
              self.addTitleTip();
           });
       });
       // self.loadNetSafeGroup();
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
  },
  methods: {
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
    },
    ipRender(row) {
      return "ip" + row['id'];
    },
    sortChange(column) {
       var self = this;
       var key = column.prop;
       var keyOrder = column.order;
       self.sortObj = {
          sortOrder:keyOrder,
          sortField:key
        };
       if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
       }
    },
    init() {
       var self = this;
       self.projectCreateForm.netName = '';
       self.netStatus = '0';
       var nets = [];
       var netsList = [];
       Promise.all([self.loadProjectNetList(), self.loadSharedNetList()]).then(function(result) {
           var data1 = result[0];
           var data2 = result[1];
           nets = data1.concat(data2);
           for (let t = 0; t < nets.length; t++) {
              var netObj = nets[t];
              netObj.ipAllocation = '';
              if ((netObj['admin_state_up'] + "") == "true") {
                 netsList.push(netObj);
              }
           }
           self.totalData = netsList;
           self.netList = netsList;
       });
    },
    async loadProjectNetList() {
      var self = this;
      var url = 'api/neutron/v2.0/networks?project_id='+ self.projectId + "&shared=false&not-tags=bm_deploy";
      if (self.detailConfig.roleType == '3') {
          url = 'api/neutron/v2.0/networks?project_id='+ this.$cookie.get("pid") + "&shared=false&not-tags=bm_deploy";
      }
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        return result['networks'];
      } catch (res) {
        self.loading = false;
      }
    },
    async loadSharedNetList() {
       var self = this;
       self.loading = true;
       try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/neutron/v2.0/networks?shared=true&not-tags=bm_deploy',
          showErrMsg: true
        });
        self.loading = false;
        return result['networks'];
      } catch (res) {
        self.loading = false;
      }
    },
    async loadSubNetList() {
      var self = this;
       self.loading = true;
       try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/neutron/v2.0/subnets',
          showErrMsg: true
        });
        self.loading = false;
        return result['subnets'];
      } catch (res) {
        self.loading = false;
      }
    },
    async loadNetPortList() {
       var self = this;
       var url = 'api/neutron/v2.0/ports?project_id='+ self.projectId + '&admin_state_up=true&status=DOWN';
       if (self.detailConfig.roleType == '3') {
          url = 'api/neutron/v2.0/ports?project_id='+ this.$cookie.get("pid") + '&admin_state_up=true&status=DOWN';
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
        let networkIds = self.netList.map(item => item.id);
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
          if (!networkIds.includes(portObj.network_id)) {
            continue;
          }
          portResult.push(portObj);
        }
        self.totalData = portResult;
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
    searchNetList() {
       var self = this;
       var netName = self.projectCreateForm.netName;
       var status = self.netStatus == "0"?"":self.netStatus;
       var resultList = [];
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
        return this.$t('lang.ACTIVE')
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
      this.$refs.projectCreateForm.validate((valid) => {
        if (valid) {
          if (this.multipleSelection.length === 0) {
            self.$message({
              showClose: true,
              message: "请选择网络或端口.",
              type: 'warning'
            });
            return false;
          } else {
            if (self.valueT == "") {
              self.$message({
                showClose: true,
                message: "请选择添加安全组.",
                type: 'warning'
              });
            } else {
              //校验IP的合法性
              let flag1 = self.loadValidIpFlag() + "";
              if (flag1 == "true") {
                //校验IP是否在ip范围内
                Promise.all([self.loadValidIpInLegalFlag()]).then(function(result) {
                  let flag2 = result[0] + "";
                  if ("true" == flag2) {
                    //校验IP资源是否用尽
                    Promise.all([self.validateFreeIpsInNets()]).then(function(result) {
                      let validFlag = result[0];
                      if (validFlag != "") {
                        let validIps = self.loadValidFreeIps(validFlag);
                        if (validIps) {
                          self.$emit("stepFourDone", {"sgs":self.valueT});
                        }
                      } else {
                        self.$emit("stepFourDone", {"sgs":self.valueT});
                      }
                    });
                  } else {
                    setTimeout( function() {
                      self.$message({
                        showClose: true,
                        message: Vue.t('calcStorLang.instCreateNetTip1'),
                        type: 'warning'
                      });
                    }, 3000);
                  }
                });
              }
              //this.$emit("stepFourDone", {"sgs":self.valueT});
            }
          }
        } else {
          return false;
        }
      });
    },
    //网络校验1：ip是否合法
    loadValidIpFlag() {
      let self = this;
      let nList = self.multipleSelection;
      if (self.projectCreateForm.type == "1") {
        let reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
        let regV6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
        let isFlag = true;
        for (let e = 0; e < nList.length; e++) {
          let row = nList[e];
          let ip = $("#ip" + row.id).find("input[type='text']").val();
          if (ip != null && ip != "") {
            if (reg.test(ip) || regV6.test(ip)) {
              continue;
            } else {
              isFlag = false;
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
    //网络校验2：ip是否在合法的范围内
    async loadValidIpInLegalFlag() {
      let self = this;
      let validFlag = true;
      let nList = self.multipleSelection;
      for (let n = 0; n < nList.length; n++) {
        let net = nList[n];
        let ip = $("#ip" + net.id).find("input[type='text']").val();
        let body = {"ip":ip, "netId":net.id};
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
                  validFlag = false;
                }
              },
              errFun: function() {
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
      let self = this;
      let netList = self.multipleSelection;
      let nets = "";
      for (let n = 0; n < netList.length; n++) {
        var netObj = netList[n];
        nets += netObj['id'] + ",";
      }
      if (nets != "" && nets.length >1 ) {
        nets = nets.substring(0, nets.length - 1);
      }
      let body = {"net_ids": nets};
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
        return "";
      }
    },
    loadValidFreeIps(data) {
      let self = this;
      let validData = JSON.stringify(data);
      let freeIpData = JSON.parse(validData);
      if (freeIpData['has_exhaust_net'] + "" == "true") {
        self.$message({
          showClose: true,
          message: Vue.t('calcStorLang.net') + ":" + freeIpData['exhaust_net_list'] + Vue.t('calcStorLang.instCreateNetTip3'),
          type: 'warning'
        });
        return false;
      } else {
        return true;
      }
    },
    prevStep() {
      this.$emit("prevFourStep", 0);
    },
    cancel() {
      this.$emit("cancel");
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    onRefresh() {
      var self = this;
      if ("1" == self.projectCreateForm.type) {
        self.conSubnetFlag = true;
        self.ipAddressFlag = false;
        self.init();
       } else {
        self.ipAddressFlag = true;
        self.conSubnetFlag = false;
        self.loadNetPortList();
       }
    }/*,
    netShareRender(value, rowData) {
      if (value + "" == "true") {
          return "是";
      } else {
        return "否";
      }
    }*/
  }
}

</script>
<style>
#ipAddressColumn .el-form-item__content{
  margin-left: 0px !important;
}

</style>
