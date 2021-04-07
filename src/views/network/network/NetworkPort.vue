<template>
  <div>
    <el-row>
      <el-col :span="24" class="margin-tb5">
        <span>{{$t('network.portNote4')}}</span>
      </el-col>
    </el-row>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
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
          <el-button @click="portTab(scope.row)" type="text" size="small">{{scope.row.id}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('lang.name')"
        min-width="120">
        <template slot-scope="scope">
          <el-button @click="portTab(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
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
        v-if="columnsChecked.indexOf('vnic_type') >= 0"
        :label="$t('network.vnicType')"
        width="150"
        align="left">
        <template slot-scope="scope">
          {{ scope.row | bindVnic }}
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
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('network.columnSelected')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page ref="pageComponent" :totalData="totalData" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>
    <add-port ref="addPort" v-if="addportFlag" @handleAddPortShow="handleAddPortShow" :networkId="networkId" @handelCancelShow="handelCancelShow"></add-port>
    <edit-netport ref="editPort" v-if="editportFlag" :projectId="selProjectId" :secEnable="editSecEnabled" :secGroups="editsecGroups" @handleEditPortsShow="handleEditPortsShow" :editportId="editportId" :editportName="editportName" :editporthost="editporthost" :editportvnic="editportvnic" :editportDeviceid="editportDeviceid" :editmanagestatus="editmanagestatus" :editportDeviceowner="editportDeviceowner" @handelCancelShow="handelCancelShow"></edit-netport>
    <qos-config v-if="qosConfigFlag" :portEntity="portEntity" @hideQos="qosConfigFlag=false" @onRefresh="getData"></qos-config>
    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
           <el-button type="text" icon="fa-arrow-right" @click="onDetailBack">{{$t('lang.back')}}</el-button>
          </div>
          <div>
           <port-tab ref="porttab" :portId="editportId" :networkId="networkId" @onDetailBack="onDetailBack"></port-tab>
          </div>
        </panel>
      </div>
    </transition>
  </div>
</template>
<script type="text/javascript">
import EditNetport from './EditPort';
import AddPort from './AddPort';
import QosConfig from '../../calculate-storage/instance/QosConfig';
import PortTab from "./PortTab";
export default {
  components: {
    EditNetport, AddPort, QosConfig, PortTab
  },
  props: ["check_project"],
  data() {
    return {
      networkId: this.$route.params.networkId,
      showOperation: true,
      qosConfigFlag: false,
      portEntity:{},
      columns: [{
        prop: "id",
        label: "ID"
      }, {
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "fixed_ip",
        label: Vue.t('network.fixedipaddress')
      }, {
        prop: "vnic_type",
        label: Vue.t('network.vnicType')
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
      columnsChecked: ['id', 'name', 'fixed_ip', 'vnic_type', 'mac_address', 'device_owner', 'status', 'admin_status_up'],
      portstableData: [],
      addportFlag: false,
      editportFlag: false,
      detailFlag: false,
      totalData: [],
      multipleSelection: [],
      editportId: "",
      editportName: "",
      editportDeviceid: "",
      editportDeviceowner: "",
      editporthost: "",
      editportvnic: "",
      selProjectId:"",
      editmanagestatus: true,
      editSecEnabled:"",
      editsecGroups:[],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.createPort'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.addportFlag = true;
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
          this.editportFlag = true;
          let row = selectRows[0];
          this.editportId = row["id"];
          this.editportName = row["name"];
          this.editportDeviceid = row["device_id"];
          this.editportDeviceowner = row["device_owner"];
          this.editportvnic = row["binding:vnic_type"];
          this.editporthost = row["binding:host_id"];
          this.editmanagestatus = row["admin_state_up"];
          this.selProjectId = row["project_id"];
          this.editSecEnabled = row["port_security_enabled"];
          this.editsecGroups = row["security_groups"];
          this.detailFlag = false;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('network.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          if (rowData["device_owner"] == "network:dhcp") {
            return false;
          }
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          self.detailFlag = false;
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
                  self.$ajax({
                    type: "DELETE",
                    url: "api/neutron/v2.0/ports/"+row["id"],
                    data: {},
                    success: function() {
                      self.$notify({
                        message: row["name"]+Vue.t('network.deleteSuccess'),
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
                        en:"Delete Port:"+ (row["name"] || row["id"]),
                        zh_cn:"删除端口:"+ (row["name"] || row["id"])
                      },
                      target:Vue.logTarget.port
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
      }, {
        icon: "fa-edit",
        name: Vue.t('calcStorLang.netConfigQosConfig'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return rowData["device_owner"].indexOf("compute:") >= 0;
        },
        handler: function(selectRows) {
          this.qosConfigFlag = true;
          this.detailFlag = false;
          this.portEntity = selectRows[0];
        }.bind(this)
      }],
      searchBar: {
        conditions: {
          id: {
            label: 'ID',
            type: 'input',
            validator: (value) => {
              if (!/^[a-fA-F0-9\-]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyUUIDKeyword'));
              }
            }
          },
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          query_fixed_ip: {
            label: this.$t('network.fixedipaddress'),
            type: 'input',
            validator: (value) => {
              if (!/^[\:\.A-Fa-f0-9]*$/.test(value)) {
                throw new Error(this.$t('validation.ip'));
              }
            }
          },
          mac_address: {
            label: this.$t('network.macAddress'),
            type: 'input',
            validator: (value) => {
              if (!/^[\:A-Fa-f0-9]*$/.test(value)) {
                throw new Error(this.$t('validation.mac'));
              }
            }
          },
          device_ownerFind: {
            label: this.$t('network.connectDevice'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5\:]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberColonChinese'));
              }
            }
          },
          status: {
            label: this.$t('lang.status'),
            type: 'select',
            options: [{
              label: this.$t('lang.ACTIVE'),
              value: 'ACTIVE'
            }, {
              label: this.$t('lang.DOWN'),
              value: 'DOWN'
            }, {
              label: this.$t('lang.BUILD'),
              value: 'BUILD'
            }, {
              label: this.$t('lang.ERROR'),
              value: 'ERROR'
            }]
          },
          admin_state_up: {
            label: this.$t('network.manageStatus'),
            type: 'select',
            options: [{
              label: 'UP',
              value: 'true'
            }, {
              label: 'DOWN',
              value: 'false'
            }]
          }
        },
        validatedParams: {}
      }
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
    let roleType = Vue.roleType + "";
    if (roleType=="0") {
      this.showOperation = true;
    } else {
      let flg = this.check_project || undefined;
      if (flg == true) {
        this.showOperation = true;
      } else {
        this.showOperation = false;
      }
    }
    this.getData();
  },
  methods: {
    async getData() {
      const self = this;
      let data = [];
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/ports?network_id="+this.$route.params.networkId
        });
        self.loading = false;
        let ports = result['ports'];
        // 过滤掉device_owner为network:reserved的数据 -- 预留地址功能支持
        ports = ports.filter((port) => {
          return port['device_owner'] !== 'network:reserved';
        });
        for (let i = 0; i < ports.length; i++) {
          ports[i]["query_fixed_ip"] = self.fixedIPRender(ports[i]["fixed_ips"]);
          if (ports[i]["device_owner"]==="" && ports[i]["device_id"]==="") {
            ports[i].device_ownerFind = Vue.t('network.deviceDepart');
          } else if (ports[i]["device_owner"]==="" && ports[i]["device_id"]!="") {
            ports[i].device_ownerFind = Vue.t('network.connect');
          } else {
            ports[i].device_ownerFind = ports[i]["device_owner"];
          }
        }
        //按参数查询
        self.totalData = [];
        for (let [k, v] of Object.entries(self.searchBar.validatedParams)) {
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
    handleEditPortsShow() {
      this.editportFlag = false;
      this.$refs.portsTable.clearSelection();
      this.getData();
    },
    handelCancelShow() {
      this.addportFlag = false;
      this.editportFlag = false;
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
    portTab(row) {
      this.editportId = row["id"];
      this.detailFlag = true;
      this.$nextTick(() => {
         this.$refs.porttab.getNetworkInfo();
      });
    },
    onBack() {
      this.$refs.portsTable.clearSelection();
      this.getData();
    },
    onDetailBack() {
      this.detailFlag = false;
    },
    onRefresh() {
      this.$refs.portsTable.clearSelection();
      this.getData();
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.$refs.portsTable.clearSelection();
      this.getData();
    }
  },
  filters: {
    bindVnic(value) {
      switch (value['binding:vnic_type']) {
        case 'normal':
          return Vue.t('network.normal');
        case 'direct':
          if ('binding:profile' in value && value['binding:profile'] instanceof Object) {
            if ('capabilities' in value['binding:profile'] && value['binding:profile']['capabilities'] instanceof Array) {
              if (value['binding:profile']['capabilities'].includes('switchdev')) {
                return Vue.t('network.streght') + '(' + Vue.t('network.switchdevon') + ')';
              }
            }
          }
          return Vue.t('network.streght');
        case 'macvtap':
          return 'MacVTap';
        default:
          return value;
      }
    }
  }
}
</script>
