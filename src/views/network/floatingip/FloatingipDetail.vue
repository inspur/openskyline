<template>
  <el-dialog :title="$t('network.allFloatIP')"
    :visible.sync="dialogVisible"
    :before-close="handleClose" v-dialogDrag>
    <el-tag type="info">{{$t('network.floatingipdetailinfo')}}</el-tag>
  <div class="divider clearfix"></div>
  <el-form ref="form" :model="form" :inline="true" v-model="floatingmodel" :rules="rules">
    <el-form-item :label="$t('network.externalNet')" class="is-required" prop="query_external_net">
      <el-select v-model="query_external_net" filterable clearable @change="networkChange">
        <el-option v-for="item in externalnetOptionsOnly" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('network.useStatus')">
      <el-select v-model="isUsed" filterable clearable @change="isUsedChange">
        <el-option :label="$t('network.used')" value="true"></el-option>
        <el-option :label="$t('network.unused')" value="false"></el-option>
      </el-select>
    </el-form-item>
   <!-- <el-form-item :label="$t('network.allocateStatus')">
      <el-select v-model="isallocate" filterable clearable @change="isallocateChange">
        <el-option :label="$t('network.allocated')" value="true"></el-option>
        <el-option :label="$t('network.unallocated')" value="false"></el-option>
      </el-select>
    </el-form-item>-->
    <el-form-item :label="$t('network.ipaddress')">
      <el-input size="small" v-model="query_ip"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="search" size="small" @click="queryIpClick()">{{$t('lang.query')}}</el-button>
    </el-form-item>
  </el-form>
  <div class="divider clearfix"></div>
  <div class="operation-panel margin-tb5">
    <operation-panel
      :select-rows="multipleSelection"
      <!-- :operation-menus="operationMenus"> -->
    </operation-panel>
  </div>
  <div class="divider clearfix"></div>
  <el-table
    ref="floatingList"
    :data="iplistData"
    highlight-current-row
    stripe
    border
    style="width: 100%;margin-top:5px;"
    row-key="id"
    v-loading="loading"
    :element-loading-text="$t('lang.loading')"
    @row-click="rowClick"
    @selection-change="handleSelectionChange">
    <el-table-column
      v-if="columnsChecked.indexOf('ip') >= 0"
      :label="$t('network.ipaddress')"
      prop="ip"
      min-width="50">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('network_id') >= 0"
      prop="network_id"
      :label="$t('network.externalNet')"
      min-width="100">
      <template slot-scope="scope">
        <span v-html="networkNameRender(scope.row.network_id)"></span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('binded') >= 0"
      prop="binded" align="center"
      :label="$t('network.useStatus')"
      min-width="50">
      <template slot-scope="scope">
        <span v-html="assignedRender(scope.row.binded)"></span>
      </template>
    </el-table-column>
    <!--<el-table-column
      v-if="columnsChecked.indexOf('allocate') >= 0"
      prop="allocate" align="center"
      :label="$t('network.allocateStatus')"
      min-width="50">
      <template slot-scope="scope">
        <span v-html="isfloatingRender(scope.row.allocate)"></span>
      </template>
    </el-table-column>-->
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="4">
       <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
      </el-col>
      <el-col :span="20">
        <page :totalData="totalData" @getCurrentData="getCurrentData" :objStorFlag="pageCount"></page>
      </el-col>
    </el-row>
    <add-floatingip ref="addFloatingIP" v-if="addFlag" @handleAddShow="handleAddShow"></add-floatingip>
  </div>
</el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"FloatingipDetail",
  data() {
    return {
      dialogVisible: false,
      roleType: Vue.roleType + "",
      projectOption: [],
      externalnetOptions: [],
      externalnetOptionsOnly: [],
      externalSubnetMap: {},
      addIpAddress: "",
      externalNetList: [],
      iplistData: [],
      totalData: [],
      floatipTotaldata: [],
      floatingmodel: "",
      query_external_net: "",
      isUsed: "",
      isallocate: "",
      query_ip: "",
      floating_network: "",
      pageCount:false,
      allExternalNetList: [],
      form: {
        query_external_net: ""
      },
      rules: {
        query_external_net: [
          {type: 'requiredNet'}
        ]
      },
      loading: false,
      addFlag: false,
      columns: [{
        prop: "ip",
        label: Vue.t('network.ipaddress')
      }, {
        prop: "network_id",
        label: Vue.t('network.externalNet')
      }, {
        prop: "binded",
        label: Vue.t('network.useStatus')
      }/*, {
        prop: "allocate",
        label: Vue.t('network.allocateStatus')
      }*/],
      columnsChecked: ['ip', 'network_id', 'binded'],
      multipleSelection: []
    }
  },
  mounted() {
    let self = this;
    self.$parent.$parent.active = "floatingIP";
    self.initDialog();
  },
  methods: {
    initDialog() {
      let self = this;
      self.dialogVisible = true;
      // self.getFloatingIPList();
      // 获取外部网络下拉列表中的值，格式：网络名称（子网cidr）
      // self.getDisplayNetNameAndCidr();
      Promise.all([self.getFloatingIPList()]).then(function(result) {
        self.getDisplayNetNameAndCidr();
      });
    },
    //获取可分配ip列表
    async getIpsAvailable(selectSubnet, networkId="", name="", isUsed="", isallocate="") {
      let self = this;
      self.totalData = [];
      try {
        if (networkId == "") {
          self.$notify({
            message: Vue.t('network.outnetempty'),
            type: "warning"
          });
          return;
        }
        self.loading = true;
        let result = await self.$ajax({
          type: 'get',
          //url: "api/neutron/v2.0/inspur/networkextension/network_floatingip_detail/"+networkId,
          url: "api/neutron/v2.0/floatingips?floating_network_id=" + networkId,
          complete: function(XMLHttpRequest, textStatus) {
            self.loading = false;
          },
          errorKey: "NeutronError"
        });
        let data = result && result.floatingips;
        let tempData = [];
        for (let j = 0; j < data.length; j++) {
          data[j].ip = data[j].floating_ip_address;
          data[j].network_id = data[j].floating_network_id;
          if (data[j].fixed_ip_address || data[j].port_forwardings.length) {
            data[j].binded = "true";
          } else {
            data[j].binded = "false";
          }
        }
        if (isUsed == "" && name == "") {
          self.totalData = data;
        } else if (isUsed != "" && name == "") {
          for (let i = 0; i < data.length; i++) {
            if (data[i]["binded"] == isUsed) {
              tempData.push(data[i]);
            }
          }
          self.totalData = tempData;
        } else if (isUsed == "" && name != "") {
          for (let i = 0; i < data.length; i++) {
            if (data[i]["ip"].indexOf(name) >= 0) {
              tempData.push(data[i]);
            }
          }
          self.totalData = tempData;
        } else if (isUsed != "" && name != "") {
          for (let i = 0; i < data.length; i++) {
            if (data[i]["binded"] == isUsed && data[i]["ip"].indexOf(name) >= 0) {
              tempData.push(data[i]);
            }
          }
          self.totalData = tempData;
        }
      } catch (res) {
      }
    },
    //获取project列表
    async getProjectList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default",
          errorKey: "NeutronError"
        });
        Vue.projectListforNet = result["projects"];
        this.projectOption = Vue.projectListforNet;
      } catch (res) {
      }
    },
    // 获取浮动IP
    async getFloatingIPList() {
      this.floatipTotaldata = [];
      let result = await this.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/floatingips",
        errorKey: "NeutronError"
      });
      this.floatipTotaldata = result["floatingips"];
    },
    // 获取外部网络下拉列表中的值，格式：网络名称（子网cidr）
    async getDisplayNetNameAndCidr() {
      let self = this;
      let allSubnetList = Vue.subnetsList;
      let allExternalNetList = Vue.networkList;

      let externalNetMap = new Map();
      let externalNet = [];
      for (let j = 0; j < allExternalNetList.length; j++) {
        externalNet = allExternalNetList[j];
        externalNetMap.set(externalNet.id, externalNet);
      }
      for (let i =0; i< allSubnetList.length; i++) {
        let subnet = allSubnetList[i];
        if (subnet["ip_version"] === 4) {
          externalNet = externalNetMap.get(subnet.network_id);
          if (externalNet!= null && externalNet!= undefined && externalNet["router:external"] === true) {
            subnet.name = externalNet["name"];
            subnet.network_name = externalNet["name"];
            self.externalnetOptions.push(subnet);
          }
        }
      }
      // 去除网络为同一个网络的重复项外部网络那个下拉里只显示 网络名字 不显示网段。每个网络只显示一个选项，
      // 例如00AA_TFIP这个网络只包含两个子网，也只显示一条下拉记录。筛选时也是筛选这两个子网
      let hash = {};
      self.externalnetOptionsOnly = self.externalnetOptions.reduce( (preVal, curVal) => {
        hash[curVal.network_id] ? "" : hash[curVal.network_id] = true && preVal.push(curVal);
        return preVal;
      }, []);
    },
    getCurrentData(param) {
      this.iplistData = param;
    },
    networkChange(value) {
      let self = this;
      self.form.query_external_net = self.query_external_net;
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          for (let i = 0; i < self.externalnetOptions.length; i++) {
            let subnet = self.externalnetOptions[i];
            if (value === subnet["network_id"]) {
              self.floating_network = subnet["network_name"];
              break;
            }
          }
          if (value == "") {
            self.totalData = [];
          } else {
            // 填充网络名称
            let externalNetMap = new Map();
            let externalNet = [];
            for (let j = 0; j < Vue.networkList.length; j++) {
              externalNet = Vue.networkList[j];
              externalNetMap.set(externalNet.id, externalNet);
            }
            // value是子网id，需查出对应的网络id
            for (let k = 0; k < self.externalnetOptions.length; k++) {
              if (value == self.externalnetOptions[k].id) {
                self.externalSubnetSelected = self.externalnetOptions[k];
                // 填充网络名称
                self.floating_network = self.externalSubnetSelected.network_name;
                break;
              }
            }
            self.getIpsAvailable(self.externalSubnetSelected, self.externalSubnetSelected.network_id,
              self.query_ip, self.isUsed, self.isallocate);
          }
        }
      });
    },
    isUsedChange(value) {
      let self = this;
      // self.query_external_net是子网id，需查出对应的网络id
      let netId;
      for (let k = 0; k < this.externalnetOptions.length; k++) {
          if (self.query_external_net == this.externalnetOptions[k].id) {
            this.externalSubnetSelected = this.externalnetOptions[k];
            netId = this.externalSubnetSelected.network_id;
            break;
          }
        }
      self.getIpsAvailable(this.externalSubnetSelected, netId, self.query_ip, self.isUsed, self.isallocate);
    },
    isallocateChange(value) {
      let self = this;
      // self.query_external_net是子网id，需查出对应的网络id
      let netId;
      for (let k = 0; k < this.externalnetOptions.length; k++) {
          if (self.query_external_net == this.externalnetOptions[k].id) {
            this.externalSubnetSelected = this.externalnetOptions[k];
            netId = this.externalSubnetSelected.network_id;
            break;
          }
        }
      self.getIpsAvailable(this.externalSubnetSelected, netId, self.query_ip, self.isUsed, self.isallocate);
    },
    queryIpClick() {
      let self = this;
      self.form.query_external_net = self.query_external_net;
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          if (self.query_external_net == "") {
            self.$notify({
                message: Vue.t('network.outnetempty'),
                type: "warning"
              });
            return;
          }
          // self.query_external_net是子网id，需查出对应的网络id
          let netId;
          for (let k = 0; k < this.externalnetOptions.length; k++) {
            if (self.query_external_net == this.externalnetOptions[k].id) {
              this.externalSubnetSelected = this.externalnetOptions[k];
              netId = this.externalSubnetSelected.network_id;
              break;
            }
          }
          self.getIpsAvailable(this.externalSubnetSelected, netId, self.query_ip, self.isUsed, self.isallocate);
        }
      });
    },
    rowClick(row) {
      this.$refs.floatingList.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      /*val.forEach((row, index) => {
        if (index === val.length - 1) return;
        this.$refs.floatingList.toggleRowSelection(row, false);
      });
      this.multipleSelection = val;*/
    },
    assignedRender( value ) {
      if (value === "true") {
        return Vue.t('network.used');
      } else {
        return Vue.t('network.unused');
      }
    },
    isfloatingRender(value) {
      if (value === "true") {
        return Vue.t('network.allocated');
      } else {
        return Vue.t('network.unallocated');
      }
    },
    handleClose() {
      this.$emit("handleEditShowCancel", {});
    },
    onRefresh() {
      let self = this;
      if (self.query_external_net!="") {
        self.getIpsAvailable(self.externalSubnetSelected, self.externalSubnetSelected.network_id,
              self.query_ip, self.isUsed, self.isallocate);
      }
    },
    networkNameRender(networkId) {
      for (let i = 0; i < Vue.networkList.length; i++) {
        let net = Vue.networkList[i];
        if (net["id"] == networkId) {
          return net["name"];
        }
      }
    }
  }
}
</script>
