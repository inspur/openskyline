<template>
<div>
    <div class="operation-panel margin-tb5">
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
      type="selection"
      :reserve-selection="true"
      width="55" align="center">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('name') >= 0"
      :label="$t('lang.name')"
      prop="name"
      min-width="120">
      <template slot-scope="scope">
        <el-button @click="portDetail(scope.row)" type="text" size="small">{{scope.row.name || scope.row.id}}</el-button>
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
      min-width="50">
      <template slot-scope="scope">
        <span v-html="statusRender(scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('admin_status_up') >= 0"
      prop="admin_status_up"
      :label="$t('network.manageStatus')"
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
            <el-tag>{{$t('network.columnSelected')}}</el-tag>
          </div>
        </el-popover>
      </el-col>
      <el-col :span="19">
        <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
      </el-col>
    </el-row>
  </div>
  <add-interface ref="addPort" v-if="addportFlag" @handleAddPortShow="handleAddPortShow" @handleEditPortsShow="handleEditPortsShow" :routerId="routerId" :interfaceList="totalData"></add-interface>
  <edit-netport ref="editPort" v-if="editportFlag" @handleEditPortsShow="handleEditPortsShow"></edit-netport>
  <transition name="slide-right" mode="out-in">
    <div style="width: 900px;" class="slide-panel" v-if="detailFlag">
      <panel style="height: 100%">
        <div slot="title" class="clearfix" >
         <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('base.back')}}</el-button>
        </div>
        <div>
          <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick">
            <el-tab-pane name="vm-detail" :label="$t('base.outline')">
              <interface-detail :editportId="editportId" ref="portdetailId"></interface-detail>
            </el-tab-pane>
            <el-tab-pane name="vm-per" :label="$t('base.performanceMonitoring')">
              <vm-performance :router_id="router_Id" :port_id='editportId' :check_project="check_project"/>
            </el-tab-pane>
          </el-tabs>
        </div>
      </panel>
    </div>
  </transition>
</div>
</template>
<script type="text/javascript">
import { mapGetters, mapMutations } from 'vuex';
import AddInterface from './AddInterface';
import InterfaceDetail from './InterfaceDetail';
import VmPerformance from "./VmPerformance";
export default {
  components: {
    AddInterface, InterfaceDetail, VmPerformance
  },
  props: ["router_Id", "check_project", "portName"],
  data() {
    return {
      activeName: 'vm-detail',
      routerId: this.routerId,
      portstableData: [],
      totalData: [],
      addportFlag: false,
      editportFlag: false,
      detailFlag: false,
      reloadTblFlag: false,
      multipleSelection: [],
      editportId: "",
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "fixed_ip",
        label: Vue.t('network.fixedipaddress')
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
      columnsChecked: ['name', 'fixed_ip', 'device_owner', 'status', 'admin_status_up'],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.addInterface'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.addportFlag = true;
          this.detailFlag = false;
          this.routerId = this.router_Id;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('network.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.detailFlag = false;
          let self = this;
          this.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            closeOnClickModal: false,
            beforeClose: (action, instance, done) => {
              if (action === "confirm") {
                instance.confirmButtonLoading = true;
                for (let i = 0; i < selectRows.length; i++) {
                  let row = selectRows[i];
                  let reqdata = {
                    "port_id": row["id"]
                  };
                  let removeUrl = "api/neutron/v2.0/routers/"+this.router_Id+"/remove_router_interface";
                  if (row["device_owner"] == "network:router_gateway") {
                    removeUrl = "api/neutron/v2.0/routers/" + this.router_Id;
                     reqdata = {
                            "router": {
                              "external_gateway_info": {
                              }
                            }
                          };
                  }
                  self.$ajax({
                    type: "PUT",
                    url: removeUrl,
                    data: JSON.stringify(reqdata),
                    success: function() {
                      self.$notify({
                        message: row["name"]+Vue.t('network.deleteSendSuccess'),
                        type: "success"
                        // duration: 2000
                      });
                      done();
                      self.getData();
                    },
                    errorKey: "NeutronError",
                    errFun() {
                      self.getData();
                      done();
                    },
                    log:{
                      description:{
                        en:"Delete Interface:" + (row["name"] || row["id"]),
                        zh_cn:`路由:${self.portName}` + "删除接口:" + (row["name"] || row["id"])
                      },
                      target:Vue.logTarget.interface
                    }
                  });
                }
                instance.confirmButtonLoading = false;
              } else {
                instance.confirmButtonLoading = false;
                done();
              }
              done();
            }
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
    },
    portstableData: {
      immediate: false,
      handler: function(list) {
        let self = this;
        self.reloadTblFlag = false;
        if (list != null) {
          for (let t = 0; t < list.length; t++) {
            let obj = list[t];
            if (obj['status'] == 'DOWN' || obj['status'] == "BUILD") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interVmValid);
        if (self.reloadTblFlag) {
          self.interVmValid = setInterval(() => {
              self.getData()
            }, 5000);
        }
      }
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'vm-detail':
          break
        case 'vm-per':
          break
      }
    },
    async getData() {
      let self = this;
      self.loading = true;
      let data = [];
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/ports?device_id="+this.router_Id,
          errorKey: "NeutronError"
        });
        self.loading = false;
        data = result['ports'];
        self.totalData = [];
        self.totalData = data;
        self.$refs.portsTable.clearSelection();
      } catch (res) {
        self.loading = false;
      }
    },
    getCurrentData(param) {
      this.portstableData = param;
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.portsTable.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.portsTable.toggleRowSelection(row);
    },
    handleAddPortShow() {
      this.addportFlag = false;
      this.getData();
    },
    handleEditPortsShow() {
      this.editportFlag = false;
      this.addportFlag = false;
    },
    fixedIPRender(value, row) {
      let showip = "";
      for (let i=0; i< value.length; i++) {
        let ips = value[i];
        if (i=== value.length-1) {
          showip += ips.ip_address
        } else {
          showip += ips.ip_address + ",  ";
        }
      }
      return showip;
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
    portDetail(row) {
      if (!this.detailFlag) {
        this.activeName = 'vm-detail';
      }
      this.detailFlag = true;
      this.editportId = row["id"];
      this.$nextTick(() => {
         this.$refs.portdetailId.initDetail(row["id"], row["name"]);
      });
      // this.$refs.portsTable.toggleRowSelection(row);
    },
    onBack() {
      this.detailFlag = false;
      this.$refs.portsTable.clearSelection();
      this.getData();
    },
    onRefresh() {
      this.$refs.portsTable.clearSelection();
      this.getData();
    }
  }
}
</script>
