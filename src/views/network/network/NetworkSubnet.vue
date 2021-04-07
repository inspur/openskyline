<template>
  <div>
    <div class="operation-panel margin-tb5" v-show="showOperation">
      <operation-panel
        :select-rows="multipleSelection"
        :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table
    ref="subnetTable"
    :data="subnettableData"
    highlight-current-row
    stripe
    border
    v-loading="loading"
    style="width: 100%"
    row-key="id"
    @row-click="rowClick"
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      type="selection"
      width="55" align="center">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('name') >= 0"
      :label="$t('lang.name')"
      prop="name"
      min-width="100">
      <template slot-scope="scope">
        <el-button @click="showDetail(scope.$index, scope.row)" type="text" size="small">{{scope.row.name || scope.row.id}}</el-button>
      </template>
    </el-table-column>  
    <el-table-column
      v-if="columnsChecked.indexOf('cidr') >= 0"
      prop="cidr"
      label="CIDR"
      min-width="100">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('ip_version') >= 0"
      prop="ip_version"
      :label="$t('network.ipversion')"
      min-width="100">
      <template slot-scope="scope">
        <span v-html="ipversionRender(scope.row.ip_version)"></span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('gateway_ip') >= 0"
      prop="gateway_ip"
      :label="$t('network.gatewayip')"
      min-width="100">
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
            <el-tag>{{$t('network.columnSelected')}}</el-tag>
          </div>
        </el-popover>
      </el-col>
      <el-col :span="19">
        <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
      </el-col>
    </el-row>
  </div>
  <add-subnetwork ref="addSubNetwork" v-if="addSubnetFlag" @handleAddSubnetShow="handleAddSubnetShow" @handleEditCancleShow="handleEditCancleShow" :networkId="networkId"></add-subnetwork>
  <edit-subnetwork ref="editSubNetwork" v-if="editSubnetFlag" @handleEditSubnetShow="handleEditSubnetShow" @handleEditCancleShow="handleEditCancleShow" :editSubid="editSubid" :editSubmame="editSubmame" :editSubcidr="editSubcidr" :editSubgateway="editSubgateway" :editSubdhcpstatus="editSubdhcpstatus" :editSubpool="editSubpool" :editSubdns="editSubdns" :editSubhost="editSubhost" :editipversion="editipversion"></edit-subnetwork>
  <transition name="slide-right" mode="out-in">
    <div style="width: 500px;" class="slide-panel" v-if="detailFlag">
      <panel style="height: 100%">
        <div slot="title" class="clearfix" >
         <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
        </div>
        <div>
         <subnet-detail :editSubid="editSubid" ref="subnetdetailId" @onBack="onBack"></subnet-detail> 
        </div>
      </panel>
    </div>
  </transition>
  </div>
</template>
<script type="text/javascript">
import AddSubnetwork from './AddSubnetwork';
import EditSubnetwork from './EditSubnetwork';
import SubnetDetail from './SubnetDetail';
export default {
  components: {
    AddSubnetwork, EditSubnetwork, SubnetDetail
  },
  data() {
    return {
      networkId: this.$route.params.networkId,
      showOperation: true,
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "cidr",
        label: "CIDR"
      }, {
        prop: "ip_version",
        label: Vue.t('network.ipversion')
      }, {
        prop: "gateway_ip",
        label: Vue.t('network.gatewayip')
      }],
      columnsChecked: ['name', 'cidr', 'ip_version', 'gateway_ip'],
      subnettableData: [],
      multipleSelection: [],
      totalData: [],
      addSubnetFlag: false,
      editSubnetFlag: false,
      detailFlag: false,
      loading: false,
      editSubid: "",
      editSubmame: "",
      editSubcidr: "",
      editSubgateway: "",
      editSubdhcpstatus: "",
      editipversion: "",
      editSubpool: [],
      editSubdns: [],
      editSubhost: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.createSubnet'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.addSubnetFlag = true;
          this.detailFlag = false;
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: Vue.t('network.modify'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.editSubnetFlag = true;
          this.detailFlag = false;
          var self = this;
          var row = selectRows[0];
          self.editSubmame = row["name"];
          self.editSubid = row["id"];
          self.editSubgateway = row["gateway_ip"];
          this.editSubcidr = row["cidr"];
          self.editSubdhcpstatus = row["enable_dhcp"];
          self.editSubpool = row["allocation_pools"];
          self.editSubhost = row["host_routes"];
          self.editSubdns = row["dns_nameservers"];
          self.editipversion = row["ip_version"];
        }.bind(this)
      }, {
        icon: "fa-times",
        name:  Vue.t('network.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.detailFlag = false;
          let self = this;
          self.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            closeOnClickModal: false,
            callback: (action, instance) => {
              if (action === "confirm") {
                self.loading = true;
                self.$refs.subnetTable.clearSelection();

                /*
                for (let i = 0; i < selectRows.length; i++) {
                  let row = selectRows[i];
                  self.$ajax({
                    type: "DELETE",
                    url: "api/neutron/v2.0/subnets/"+row["id"],
                    data: {},
                    success: function() {
                      self.$notify({
                        message: row["name"]+Vue.t('network.deleteSuccess'),
                        type: "success"
                      });
                      self.getData();
                    },
                    errorKey: "NeutronError",
                    errFun() {
                      self.loading = false;
                      self.getData();
                    },
                    log:{
                      description:{
                        en:"Delete Subnet:"+row["name"],
                        zh_cn:"删除子网:"+row["name"]
                      },
                      target:Vue.logTarget.subnetwork
                    }
                  });
                }
                */

                let length = selectRows.length; // 放在引用的外部，因为里面有操作数组引用的地方，会改变数组的数据
                let hasError = false;
                let f = v => {
                  let i = v.shift();
                  if (!i) {
                    self.loading = false;
                    if (hasError) {
                      let s = 'Some subnets failed to be deleted，One or more ports have an IP allocation from this subnets';
                      if (length === 1) {
                        s = "Deletion failed，One or more ports have an IP allocation from this subnets";
                      }
                      if (String(Vue.config.lang) === "zh-cn") {
                        s = "部分子网删除失败，子网中可能存在一个或者多个IP地址被分配，如端口的使用";
                        if (length === 1) {
                          s = '删除失败，子网中可能存在一个或者多个IP地址被分配，如端口的使用';
                        }
                      }
                      setTimeout(() => { // 当两个notify同时发生的时候，显示对象会重叠在一起。所以不要发生的时机离得很近。所以就放在一个任务里后执行
                        self.$notify({
                          message: s,
                          type: "error"
                        });
                      }, 0);
                    }
                    self.getData();
                    return;
                  }
                  self.$ajax({
                    type: "DELETE",
                    url: "api/neutron/v2.0/subnets/"+i["id"],
                    data: {},
                    success() {
                      self.$notify({
                        message: i["name"]+Vue.t('network.deleteSuccess'),
                        type: "success"
                      });
                      f(v); // 递归函数---大晚上后端给我打电话，让我来解决问题，我飞速从家跑到公司。由原来的for循环全部请求改为队列请求。快速解决问题，回家睡觉。
                    },
                    showErrMsg: false,
                    errorKey: "NeutronError",
                    errFun() {
                      hasError = true;
                      f(v);
                    },
                    log:{
                      description:{
                        en:"Delete Subnet:"+i["name"],
                        zh_cn:"删除子网:"+i["name"]
                      },
                      target:Vue.logTarget.subnetwork
                    }
                  });
                }
                f(selectRows || []);

                // setTimeout( function() {
                //   self.loading = false;
                // }, 3000)
              }
            }
          });
        }.bind(this)
      }]
    }
  },
  mounted() {
    this.getNetworkInfo();
  },
  methods: {
    async getNetworkInfo() {
      let self = this;
      let roleType = Vue.roleType + "";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/networks/"+this.$route.params.networkId
        });
        let networkInfo = result['network'];
        if (roleType!="0") {
          if (networkInfo["project_id"] == Vue.cookie.get('pid')) {
            self.showOperation = true;
          } else {
            self.showOperation = false;
          }
        } else {
          self.showOperation = true;
        }
        self.initSubnet();
      } catch (res) {
      }
    },
    initSubnet() {
      this.getData();
    },
    async getData() {
      var self = this;
      let data = [];
      this.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/subnets?network_id="+this.$route.params.networkId
        });
        self.totalData = result['subnets'];
        self.$refs.subnetTable.clearSelection();
      } catch (res) {
      }
      this.loading = false;
    },
    getCurrentData(param) {
      this.subnettableData = param;
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.subnetTable.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.subnetTable.toggleRowSelection(row);
    },
    handleAddSubnetShow() {
      this.addSubnetFlag = false;
      this.getData();
    },
    handleEditSubnetShow() {
      this.editSubnetFlag = false;
      this.getData();
    },
    handleEditCancleShow() {
      this.editSubnetFlag = false;
      this.addSubnetFlag = false;
    },
    showDetail(index, row) {
      this.detailFlag = true;
      this.editSubid = row["id"];
      this.$nextTick(() => {
         this.$refs.subnetdetailId.initDetail();
      });
      // this.$refs.subnetTable.toggleRowSelection(row);
    },
    onBack() {
      this.detailFlag = false;
      this.getData();
    },
    onRefresh() {
      this.getData();
    },
    ipversionRender(value) {
      if (value == 4) {
        return "IPv4";
      } else {
        return "IPv6";
      }
    }
  }
}
</script>