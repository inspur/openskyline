<template>
<div>
  <icos-search-bar :conditions="searchBar.conditions" @search="queryClick" />
  <div class="divider clearfix"></div>
  <div class="operation-panel margin-tb5" v-show="showOperation">
    <operation-panel
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
  </div>
  <div class="divider clearfix"></div>
  <el-table
    ref="portsTable"
    :data="portstableData"
    highlight-current-row
    stripe
    border
    style="width: 100%;"
    row-key="id"
    @row-click="rowClick"
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      type="selection"
      width="55" align="center">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('id') >= 0"
      prop="name"
      label="ID"
      min-width="120">
      <template slot-scope="scope">
        <span>{{scope.row.id}}</span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('name') >= 0"
      prop="name"
      :label="$t('lang.name')"
      min-width="120">
      <template slot-scope="scope">
        <span>{{scope.row.name}}</span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('fixed_ip') >= 0"
      prop="fixed_ip"
      :label="$t('network.fixedipaddress')"
      min-width="100">
      <template slot-scope="scope">
        <span v-html="fixedIPRender(scope.row.fixed_ips, scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('network_id') >= 0"
      prop="fixed_ip"
      :label="$t('network.subnet')"
      min-width="100">
      <template slot-scope="scope">
        <span v-html="subnetsRender(scope.row.fixed_ips, scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('mac_address') >= 0"
      prop="mac_address"
      :label="$t('network.macAddress')"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.mac_address}}</span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('device_owner') >= 0"
      prop="device_owner"
      :label="$t('network.connectDevice')"
      min-width="100">
      <template slot-scope="scope">
        <span v-html="deviceownerRender(scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('status') >= 0"
      prop="status"
      :label="$t('lang.status')"
      align="left"
      min-width="50">
      <template slot-scope="scope">
        <span v-html="statusRender(scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('admin_status_up') >= 0"
      prop="admin_status_up"
      :label="$t('network.manageStatus')"
      align="left"
      min-width="50">
      <template slot-scope="scope">
        <span v-html="managestatusRender(scope.row.admin_state_up)"></span>
      </template>
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
        <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
        <el-popover
          placement="right"
          trigger="click">
          <el-checkbox-group class="vertical"
            v-model="columnsChecked">
            <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
            </el-checkbox>
          </el-checkbox-group>
          <div slot="reference" class="name-wrapper">
            <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
          </div>
        </el-popover>
      </el-col>
      <el-col :span="19">
        <page :totalData="totalData" @getCurrentData="getCurrentData" :objStorFlag="pageCount"></page>
      </el-col>
    </el-row>
  </div>
  <bind-reserved-addr ref="addPort" v-if="addportFlag" @handleAddPortShow="handleAddPortShow" :networkId="networkId" @handelCancelShow="handelCancelShow"></bind-reserved-addr>
</div>
</template>
<script type="text/javascript">
import BindReservedAddr from './BindReservedAddr';
import {onlyLetterMinusNumberChinese, onlyNumberDot} from '../validator/validator';
export default {
  components: {
    BindReservedAddr
  },
  props: ["check_project"],
  data() {
    return {
      networkId: this.$route.params.networkId,
      searchBar: {
        conditions: {
          queryId: {
            label: "ID",
            type: 'input',
            validator: onlyLetterMinusNumberChinese
          },
          queryName: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: onlyLetterMinusNumberChinese
          },
          queryFixedIP: {
            label: this.$t('network.fixedipaddress'),
            type: 'input',
            validator: onlyNumberDot
          },
          querySubnet: {
            label: this.$t('network.subnet'),
            type: 'select',
            options: []
          }
        }
      },
      searchBarValidatedParams: {},
      query: {
        name: "",
        id: "",
        query_fixed_ip: "",
        subnet_id: ""
      },
      pageCount:false,
      showOperation: true,
      qosConfigFlag: false,
      portEntity:{},
      columns: [
        {
          prop: "id",
          label: "ID"
        }, {
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "fixed_ip",
        label: Vue.t('network.fixedipaddress')
      }, {
        prop: "network_id",
        label: Vue.t('network.subnet')
      }, {
        prop: "mac_address",
        label: Vue.t('network.macAddress')
      }, {
        prop: "device_owner",
        label: Vue.t('network.connectDevice')
      }, {
        prop: "status",
        label: Vue.t('lang.status')
      }, {
        prop: "admin_status_up",
        label: Vue.t('network.manageStatus')
      }],
      columnsChecked: ['id', 'name', 'fixed_ip', 'network_id', 'mac_address', 'device_owner', 'status', 'admin_status_up'],
      portstableData: [],
      addportFlag: false,
      totalData: [],
      multipleSelection: [],
      subnetList:[],
      subnetIdList:[],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.bindReservedAddr'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.addportFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('network.unbindReservedAddr'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          this.$confirm(Vue.t('network.confirmUnbindReservedAddr'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            closeOnClickModal: false,
            beforeClose: (action, instance, done) => {
              if (action === "confirm") {
                instance.confirmButtonLoading = true;
                for (let i = 0; i < selectRows.length; i++) {
                  let row = selectRows[i];
                  self.$ajax({
                    type: "DELETE",
                    url: "api/neutron/v2.0/ports/"+row["id"],
                    success: function() {
                      self.$notify({
                        message: Vue.t('network.unbindReservedAddrSuccess') + ":" + self.fixedIPRender(row.fixed_ips, row),
                        type: "success"
                        // duration: 2000
                      });
                      self.getData();
                      instance.confirmButtonLoading = false;
                      self.$refs.portsTable.clearSelection();
                      done();
                    },
                    errFun() {
                      instance.confirmButtonLoading = false;
                      self.$refs.portsTable.clearSelection();
                      done();
                    },
                    errorKey: "NeutronError",
                    log:{
                      description:{
                        en:"Unbind reserved IP:" + self.fixedIPRender(row.fixed_ips, row),
                        zh_cn:"解绑预留地址:" + self.fixedIPRender(row.fixed_ips, row)
                      },
                      target:Vue.logTarget.reservedAddr
                    }
                  });
                }
              } else {
                done();
              }
            }
          }).then(() => {
            self.getData();
          });
        }.bind(this)
      }]
    }
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
    let self = this;
    let roleType = Vue.roleType + "";
    if (roleType=="0" || roleType == "1") {
      self.showOperation = true;
    }
    self.getData();
  },
  methods: {
    // 前端实现查询功能
    queryClick(params) {
      let self = this;
      this.searchBarValidatedParams = params;
      self.$refs.portsTable.clearSelection();
      self.pageCount = true;
      self.getData();
    },
    getData() {
      let self = this;
      self.getSubnetList().then(() => {
        self.searchBar.conditions.querySubnet.options = self.subnetList.map((item) => {
          return {
            label: item.name + '(' + item.cidr + ')',
            value: item.id
          }
        });
        self._getData();
      });
    },
    async _getData() {
      const self = this;
      let data = [];
      let parameter = {
        name: this.searchBarValidatedParams.queryName,
        id: this.searchBarValidatedParams.queryId,
        query_fixed_ip: this.searchBarValidatedParams.queryFixedIP,
        query_subnet_id: this.searchBarValidatedParams.querySubnet
      };
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/ports?network_id="+this.networkId + "&device_owner=network:reserved&sort_dir=asc&sort_key=name"
        });
        self.loading = false;
        let ports = result['ports'];
        for (let i = 0; i < ports.length; i++) {
          ports[i]["query_fixed_ip"] = self.fixedIPRender(ports[i]["fixed_ips"]);
          ports[i]["query_subnet_id"] = ports[i]["fixed_ips"].map(item => {
            return item.subnet_id;
          }).join(',');
        }
        //按参数查询
        self.totalData = [];
        for (let [k, v] of Object.entries(parameter)) {
          let tmpData = [];
          for (let port of ports) {
            if (!v) {
              tmpData.push(port);
            } else {
              if ((port[k] + "") && (port[k] + "").indexOf(v) != -1) {
                tmpData.push(port);
              }
            }
          }
          ports = tmpData;
        }
        self.totalData = ports;
      } catch (res) {
        self.loading = false;
        self.$message.error(Vue.t('network.getFailed'));
      }
    },
    getCurrentData(param) {
      this.portstableData = param;
    },
    async getSubnetList() {
      let self = this;
      await self.$ajax({
        type: 'get',
        url: `api/neutron/v2.0/subnets?network_id=${self.networkId}`,
        errorKey: "NeutronError",
        success: function(resultData) {
          self.subnetList = [];
          self.subnetList = resultData['subnets'];
          self.subnetList = self.subnetList.filter((sub) => {
            return (sub['ip_version'] == 4) ||
                   (sub['ip_version'] == 6 &&
                    sub['ipv6_address_mode'] != 'dhcpv6-stateless' &&
                    sub['ipv6_ra_mode'] != 'dhcpv6-stateless' &&
                    sub['ipv6_address_mode'] != 'slaac' &&
                    sub['ipv6_ra_mode'] != 'slaac');
          });
          self.subnetIdList = self.subnetList.map((sub) => {
            return sub.id;
          });
        }
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.portsTable.toggleRowSelection(row);
    },
    handleAddPortShow() {
      this.addportFlag = false;
      this.getData();
    },
    handelCancelShow() {
      this.addportFlag = false;
    },
    fixedIPRender(ips, row) {
      let showIpList = [];
      for (let i = 0; i < ips.length; i++) {
        let ip = ips[i];
        if (this.subnetIdList.indexOf(ip['subnet_id']) >= 0) {
          showIpList.push(ip['ip_address']);
        }
      }
      return showIpList.join(',<br/>');
    },
    subnetsRender(value, row) {
      let nets = value;
      let showsubList = [];
      for (let i=0; i< nets.length; i++) {
        let subnetId = nets[i].subnet_id;
        for (let j = this.subnetList.length - 1; j >= 0; j--) {
          if (this.subnetList[j].id === subnetId) {
            let showSub = '';
            if (this.subnetList[j].name != "") {
              showSub = this.subnetList[j].name;
            } else {
              showSub = this.subnetList[j].id.substring(0, 12);
            }
            showSub += (`(${this.subnetList[j].cidr})`);
            if (showsubList.indexOf(showSub) == -1) {
              showsubList.push(showSub);
            }
          }
        }
      }
      return showsubList.join(",<br/>");
    },
    managestatusRender(value) {
      if (value == true) {
        return "UP";
      } else {
        return "DOWN";
      }
    },
    statusRender(row) {
      if (row["status"]==="ACTIVE") {
        return this.$t('lang.ACTIVE')
      } else if (row["status"]==="DOWN") {
        return this.$t('lang.DOWN')
      } else if (row["status"]==="BUILD") {
        return this.$t('lang.BUILD')
      } else if (row["status"]==="ERROR") {
        return this.$t('lang.ERROR')
      } else if (row["status"]==="N/A") {
        return this.$t('network.nothing')
      } else {
        return row["status"];
      }
    },
    deviceownerRender(row) {
      if (row["device_owner"]==="" && row["device_id"]==="") {
        return Vue.t('network.deviceDepart');
      } else if (row["device_owner"]==="" && row["device_id"]!="") {
        return Vue.t('network.connect');
      } else {
        return row["device_owner"];
      }
    },
    onRefresh() {
      this.$refs.portsTable.clearSelection();
      this.getData();
    }
  }
}
</script>
