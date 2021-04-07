<template>
  <div>
    <div class="operation-panel">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="acTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="uuid"  @selection-change="handleSelectionChange">
      <el-table-column reserve-selection type="selection" width="55" align="center">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="50">
        <template slot-scope="scope">
          <span>{{scope.row.name || scope.row.uuid || '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('driver_info') >= 0" :label="$t('calcStorLang.bmcIP')" prop="driver_info" align="left" min-width="80">
        <template slot-scope="scope">
          <span v-html="bmcAddressRender(scope.row.driver_info, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('ipmi_username') >= 0" :label="$t('baremachine.BMC_USER_NAME')" prop="ipmi_username" align="left" min-width="80">
        <template slot-scope="scope">
          <span v-html="bmcUserNameRender(scope.row.driver_info, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('power_state') >= 0" prop="power_state" :label="$t('calcStorLang.powerStatus')" min-width="50" align="left">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.power_state)">
            <span v-html="statusRender(scope.row.maintenance, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('provision_state') >= 0" prop="provision_state" :label="$t('baremachine.MANAGEMENT_STATE')" min-width="50" align="left">
        <template slot-scope="scope">
          <el-tag :type="provisonTagRender(scope.row.provision_state)">
            <span v-html="provisonRender(scope.row.provision_state, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="regetNodesList">
          </el-button>
          <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc("lang.item", multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
    </div>
    <add-manage ref="addManage" v-if="addFlag" @handleAddShow="handleAddShow"  @handleCancelShow="handleCancelShow"></add-manage>
  </div>
</template>
<script>
import AddManage from "./AddManage";
export default {
  name: 'ExternalPhysicalServer',
  components: {
    AddManage
  },
  data() {
    return {
      addFlag: false,
      vmMap: new Map(),
      intervalResetStatus: "",
      query: {
        provision_state: "",
        name: "",
        instance_uuid: "",
        maintenance: ""
      },
      phyDetailUuid: "",
      radisconfFlag: false,
      instanceUuid: "",
      checkRows: '',
      checkCrrentIndex: 0,
      formInline: '',
      totalData: [],
      phyName: '',
      phyMaps: new Map(),
      portMaps: new Map(),
      addPhyFlag: false,
      editBaremachineflag: false,
      operateType: 1, //1添加 2 编辑
      phyEntity: '',
      specShareFlag: false,
      biosFlag: false,
      detailFlag: false,
      portFlag: false,
      specUuid: '',
      currentPage: 1,
      showBorder: true,
      selId: "",
      selName: "",
      columns: [],
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      loading: true,
      reloadTblFlag: false,
      phyHostUuid: '',
      columnsChecked: ['name', 'driver_info', 'ipmi_username', 'power_state', 'provision_state'],
      tableData: [],
      multipleSelection: [],
      operateMore: true,
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t("baremachine.MANAGE_PHYSICAL"),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.addFlag = true;
        }.bind(this)
      }, {
        icon: "fa-play",
        name: Vue.t("calcStorLang.open"),
        multi: false,
        showflg: true,
        enable(rowData) {
          return rowData['power_state'] == "power off";
        },
        handler: function(selectRows) {
          var self = this;
          var body = { "target": "power on" };
          body = JSON.stringify(body);
          self.$sequence({
            type: 'put',
            url: 'api/ironic/v1/nodes/{uuid}/states/power',
            data: body,
            params: selectRows,
            confirmMsg: Vue.t("baremachine.OPEN_SERVER_CONFIRM"),
            successMsg: Vue.t("calcStorLang.openSendSuccess"),
            log: {
                  description: {
                    en: "Start External Physical Server",
                    zh_cn: "开启外部服务器"
                  },
                  key: "name",
                  target: Vue.logTarget.bareMachine
               }
          }).then(async(data) => {
            self.$refs.acTable.clearSelection();
            for (var r = 0; r < selectRows.length; r++) {
              var row = selectRows[r];
              var phy = self.phyMaps.get(row.uuid);
              phy['power_state'] = "BUSY";
            }
            self.currentPage = 1;
            setTimeout(function() {
              self.getDataList({
                page: 1
              });
              self.loading = false;
            }, 15000);
          }).catch((err) => {
            console.log(err);
          });
        }.bind(this)
      }, {
        icon: "fa-stop",
        name: Vue.t("baremachine.SHUTDOWN"),
        showflg: true,
        multi: false,
        enable(rowData) {
          return rowData['power_state'] == "power on";
        },
        handler: function(selectRows) {
          const self = this;
          let body = { "target": "power off" };
          body = JSON.stringify(body);
          self.$sequence({
            type: 'put',
            url: 'api/ironic/v1/nodes/{uuid}/states/power',
            data: body,
            params: selectRows,
            confirmMsg: Vue.t("baremachine.CLOSE_SERVER_CONFIRM"),
            successMsg:  Vue.t("calcStorLang.closeSendSuccess"),
            log: {
                  description: {
                    en: "Close External Physica lServer",
                    zh_cn: "关闭外部服务器"
                  },
                  key: "name",
                  target: Vue.logTarget.bareMachine
               }
          }).then(async(data) => {
            self.$refs.acTable.clearSelection();
            for (var r = 0; r < selectRows.length; r++) {
              var row = selectRows[r];
              var phy = self.phyMaps.get(row.uuid);
              phy['power_state'] = "BUSY";
            }
            self.currentPage = 1;
            setTimeout(function() {
              self.getDataList({
                page: 1
              });
              self.loading = false;
            }, 15000);
          }).catch((err) => {});
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t("calcStorLang.delete"),
        showflg: true,
        multi: false,
        enable(rowData) {
          return ((rowData['provision_state'] == "manageable" || rowData['provision_state'] == "available" || rowData['provision_state'] == "enroll" || rowData['provision_state'] == "adopt failed") && rowData['power_state'] != "BUSY" && (rowData['maintenance'] + "") == "false");
        },
        handler: function(selectRows) {
          const self = this;
          self.$prompt(Vue.t("lang.inputYesToContinue"), Vue.t("lang.confirmDo"), {
            confirmButtonText: Vue.t("lang.confirmDo"),
            cancelButtonText: Vue.t("lang.cancel"),
            inputPattern: /^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage: Vue.t("lang.onlyAcceptYesOrNo")
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
              self.$sequence({
                type: 'delete',
                url: 'api/ironic/v1/nodes/{uuid}',
                params: selectRows,
                log: {
                  description: {
                    en: "Delete Baremetal Machine:",
                    zh_cn: "删除外部服务器"
                  },
                  key: "name",
                  target: Vue.logTarget.bareMachine
               }
              }).then((data) => {
                self.loading = true;
                for (var r = 0; r < selectRows.length; r++) {
                  var row = selectRows[r];
                  var phy = self.phyMaps.get(row.uuid);
                  phy['power_state'] = "BUSY";
                }
                self.$message(Vue.t("calcStorLang.deleteSendSuccess"));
                self.$refs.acTable.clearSelection();
                self.currentPage = 1;
                setTimeout(function() {
                  self.getDataList();
                  self.loading = false;
                }, 5000);
              }).catch((err) => {});
            }
          }).catch(() => {
            //取消
          });
        }.bind(this)
      }]
    };
  },
  computed: {},
  beforeDestroy() {
    if (this.interPhyValid != null) {
      clearInterval(this.interPhyValid);
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
            if (obj['power_state'] == "BUSY" || obj["provision_state"] == "inspecting" || obj["provision_state"] == "deleting" ||
              obj["provision_state"] == "verifying" || obj["provision_state"] == "wait call-back" || obj["provision_state"] == "cleaning" ||
              obj["provision_state"] == "clean wait" || obj["provision_state"] == "inspect wait" || obj["provision_state"] == "deploying") {
              self.reloadTblFlag = true;
              break;
            }
          }
        }
        clearInterval(self.interPhyValid);
        if (self.reloadTblFlag && !self._isDestroyed) {
          self.interPhyValid = setInterval(() => {
            this.getDataList()
          }, 5000);
        }
      }
    }
  },
  mounted() {
    let acTable = this.$refs.acTable;
    acTable.$children.forEach((item, index) => {
      if (item.label && item.prop) {
        this.columns.push({
          prop: item.prop,
          label: item.label
        });
      }
    });
    this.getDataList(this.currentPage);
  },
  methods: {
    resetStatus(row) {
      const self = this;
      self.$confirm(Vue.t('network.RESET_POINT'), Vue.t('network.attention'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        type: "warning",
        closeOnClickModal: false,
        callback: async (action, instance) => {
          if (action === "confirm") {
            self.$refs.acTable.clearSelection();
            self.multipleSelection = [];
            if (row.length == 0) {
              return;
            }
            self.loading = true;
            try {
              await self.resetAction(row);
              self.getDataList();
            } catch (e) {
              self.loading = false;
            }
          }
        }
      });
    },
    async resetAction(row) {
      let self = this;
      let strategyId = row && row.uuid;
      if (!strategyId) return;
      let param = {"target":"deleted"};
      try {
        await self.$ajax({
          type: "PUT",
          url: "api/ironic/v1/nodes/" + strategyId + "/states/provision",
          data: JSON.stringify(param),
          log: {
            description: {
              en: "Bare metal" + row.name + " reset status",
              zh_cn: "外部服务器" + row.name + " 重置状态"
            },
            target: Vue.logTarget.bareMachine
          },
          successFun: function () {
            self.$message(Vue.t("network.resetStatusSuccess"));
          }
        });
      } catch (e) {
      }
    },
    rootGbRender(properties) {
      return (properties && properties.local_gb) || "0";
    },
    memoryGBRender(properties) {
      if (properties) {
        return (properties.memory_mb && (properties.memory_mb / 1024)) || "0";
      } else {
        return "";
      }
    },
    cpuRender(properties) {
      return (properties && properties.cpus) || "0";
    },
    maintenanceTagRender(status) {
      if (status + "" == "true") {
        return "info";
      } else {
        return "";
      }
    },
    provisonTagRender(status) {
      status = status.toLowerCase();
      if ("enroll" === status || "manageable" === status || "available" === status || "active" === status) {
        return "success";
      } else if ("error" === status || "inspect failed" === status || "clean failed" === status || "adopt failed" === status || "deploy failed" === status || "rescue failed" === status || "unrescue failed" === status) {
        return "danger";
      } else if ("verifying" === status || "cleaning" === status || "clean wait" === status || "inspecting" === status || "inspect wait" === status || "adopting" === status || "deploying" ===
        status || "wait call-back" === status || "rescuing" === status || "rescue wait" === status || "unrescuing" === status || "deleting" === status) {
        return "warning";
      } else {
        return "";
      }
    },
    checkup() {
      let self = this;
      let body = {"target": "inspect"};
      if (self.checkCrrentIndex >= self.checkRows.length) {
        self.$refs.acTable.clearSelection();
        self.currentPage = 1;
        self.getDataList({
          page: 1
        });
        return;
      }
      body = JSON.stringify(body);
      self.$ajax({
        type: 'put',
        data:body,
        //confirmMsg: Vue.t("calcStorLang.CHECK_MKSURE"),
        //successMsg:"检查发送成功！",
        url: 'api/ironic/v1/nodes/' + self.checkRows[self.checkCrrentIndex].uuid + '/states/provision',
        successFun:function() {
          self.checkCrrentIndex++;
          self.checkup();
        },
        errFun() {
          self.checkCrrentIndex++;
          self.checkup();
        },
        log: {
          description: {
            en: `Inspect Baremachine: Host Name[${self.checkRows[self.checkCrrentIndex].name}] IP[${self.checkRows[self.checkCrrentIndex].driver_info.ipmi_address}]`,
            zh_cn: `外部服务器执行检查：主机名[${self.checkRows[self.checkCrrentIndex].name}] IP[${self.checkRows[self.checkCrrentIndex].driver_info.ipmi_address}]`
          },
          key: "name",
          target: Vue.logTarget.bareMachine
        }
      });
    },
    sortChange(column) {
       var self = this;
       var key = column.prop;
       var keyOrder = column.order;
       self.sortObj = {
           sortOrder:keyOrder,
           sortField:key
         };
       if (keyOrder != null && self.totalData != null && (key === "cpus" || key === "memory_mb" || key === "local_gb")) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder, "int"));
         self.sortObj.sortType = "Int";
       }
      if (keyOrder != null && self.totalData != null && !(key === "cpus" || key === "memory_mb" || key === "local_gb")) {
        self.totalData.sort(this.$sortFormatter(key, keyOrder));
      }
    },
    async getDataList() {
      var self = this;
      Promise.all([self.loadPortsList()]).then(function(result) {
          self.loadNodesList();
      });
    },
    async loadNodesList() {
      const self = this;
      let parameter = this.query;
      try {
        let result = await self.$ajax({
          type: 'get',
          headers: {
            "X-Openstack-Ironic-Api-Version": "latest"
          },
          url: 'api/ironic/v1/nodes_inspur?is_adopt=yes&detail=True'
        });
        let list = result['nodes'];
        if (list != null) {
          for (let p = 0; p < list.length; p++) {
            let phyObj = list[p];
            self.phyMaps.set(phyObj.uuid, phyObj);
          }
        }
        for (let v = 0; v < list.length; v++) {
            var phy = list[v];
            var nodeId = phy['uuid'];
            phy.ports = self.portMaps.get(nodeId) || "0";
            phy['power_state'] = phy['power_state'] || "";
        }
        //按参数查询
        for (let [k, v] of Object.entries(parameter)) {
          let tmpData = [];
          for (let data of list) {
            if (!v) {
              tmpData.push(data);
            } else {
              if ((data[k] + "") && (data[k] + "").indexOf(v) != -1) {
                tmpData.push(data);
              }
            }
          }
          list = tmpData;
        }
        self.totalData = [];
        self.totalData = list;
        // 此三列排序用
        for (let i = 0; i < self.totalData.length; i++) {
          self.totalData[i].cpus = (self.totalData[i].properties && self.totalData[i].properties.cpus) || "0";
          self.totalData[i].memory_mb = (self.totalData[i].properties && self.totalData[i].properties.memory_mb) || "0";
          self.totalData[i].local_gb = (self.totalData[i].properties && self.totalData[i].properties.local_gb) || "0";
        }
      } catch (res) {
        // self.loading = false;
      }
    },
    async loadPortsList() {
      var self = this;
      self.portMaps.clear();
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/ironic/v1/ports/detail'
        });
        var list = result['ports'];
        if (list != null) {
           for (let p = 0; p < list.length; p++) {
              var port = list[p];
              var nodeId = port['node_uuid'];
              if (self.portMaps.get(nodeId)) {
                var count = self.portMaps.get(nodeId);
                self.portMaps.set(port['node_uuid'], count + 1);
              } else {
                self.portMaps.set(port['node_uuid'], 1);
              }
           }
        }
      } catch (res) {
      }
    },
    searchPhyList() {
      const self = this;
      self.$refs.acTable.clearSelection();
      self.pageCount = true;
      self.loadNodesList();
    },
    instanceRender(value, rowData) {
      if (value != null && value != "") {
        return value;
      } else {
        return '-';
      }
    },
    bmcAddressRender(value, rowData) {
       if (value != null && value != "") {
          var targetUrl = "";
          var address = value['ipmi_address'] || "";
          if ("" == address) {
             targetUrl = "#";
          } else {
             targetUrl = "http://" + address;
          }
          return "<a href=" + targetUrl + " target='_blank'>" + address + "</a>";
       } else {
          return '-';
       }
    },
    bmcUserNameRender(value, rowData) {
      if (value != null && value != "") {
        return value.ipmi_username;
      } else {
        return '-';
      }
    },
    provisonRender(value, rowData) {
       if ("enroll" == value) {
          return Vue.t("calcStorLang.register");
       } else if ("available" == value) {
          return Vue.t("calcStorLang.active");
       } else if ("verifying" == value) {
          return Vue.t("calcStorLang.verifying");
       } else if ("manageable" == value) {
          return Vue.t("baremachine.MANAGED");
       } else if ("inspecting" == value) {
          return Vue.t("calcStorLang.inspecting");
       } else if ("inspect failed" == value) {
          return Vue.t("calcStorLang.inspectFailed");
       } else if ("cleaning" == value) {
          return Vue.t("calcStorLang.cleaning");
       } else if ("clean failed" == value) {
          return Vue.t("calcStorLang.cleanFailed");
       } else if ("deploying" == value) {
          return Vue.t("calcStorLang.deploying");
       } else if ("wait call-back" == value) {
          return Vue.t("calcStorLang.waittingCallback");
       } else if ("deploy failed" == value) {
          return Vue.t("calcStorLang.deployFailed");
       } else if ("active" == value) {
          return Vue.t("calcStorLang.running");
       } else if ("deleting" == value) {
          return Vue.t("calcStorLang.task_deleting");
       } else if ("error" == value) {
          return Vue.t("calcStorLang.error");
       } else if ("adopting" == value) {
          return Vue.t("calcStorLang.adopting");
       } else if ("adopt failed" == value) {
          return Vue.t("calcStorLang.adoptFailed");
       } else if ("rescue" == value) {
          return Vue.t("calcStorLang.rescue");
       } else if ("rescue wait" == value) {
         return Vue.t("calcStorLang.rescueWait");
       } else if ("rescue failed" == value) {
         return Vue.t("calcStorLang.rescueFailed");
       } else if ("rescuing" == value) {
         return Vue.t("calcStorLang.rescuing");
       } else if ("unrescuing" == value) {
         return Vue.t("calcStorLang.unrescuing");
       } else if ("unrescue failed" == value) {
         return Vue.t("calcStorLang.unrescueFailed");
       } else if ("clean wait" == value) {
         return Vue.t("calcStorLang.cleanWait");
       } else if ("inspect wait" == value) {
         return Vue.t("calcStorLang.inspectWait");
       }
    },
    statusRender(value, rowData) {
      var status = rowData['power_state'];
      if ("power on" == status) {
        return Vue.t("calcStorLang.poweron");
      } else if ("power off" == status) {
        return Vue.t("calcStorLang.poweroff");
      } else if ("BUSY" == status) {
        return Vue.t("calcStorLang.busy");
      } else if (null == status || "" == status) {
        return '-';
      } else {
        return status;
      }
    },
    statusTagRender(status) {
        if ("power on" == status) {
           return "success";
        } else if ("power off" == status) {
           return "gray";
        } else if ("BUSY" == status) {
           return "info";
        } else {
          return "gray";
        }
    },
    maintenanceRender(value, rowData) {
      if (value + "" == "true") {
        return Vue.t("lang.yes");
      } else {
        return Vue.t("lang.no");
      }
    },
    portRender(value, rowData) {
      var self = this;
      var nodeId = rowData['uuid'];
      return self.portMaps.get(nodeId) || "0";
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    phyDetail(row) {
      var self = this;
      self.phyHostUuid = row['uuid'];
      this.$router.push({
        path: '/calculate-storage/baremachine-management/baremachineList/detail?phyHostUuid=' + self.phyHostUuid + '&name=' + row.name + '&phyStatus=' + row['provision_state'],
        params: {
          phyHostUuid: self.phyHostUuid
        }
      });
    },
    phyPort() {
      this.portFlag = false;
    },
    onBack() {
      this.detailFlag = false;
    },
    memoryRender(value, row) {
      return value / 1024;
    },
    handleAddShow() {
      this.addFlag = false;
      this.getDataList(this.currentPage);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleCancelShow() {
      this.addFlag = false;
    },
    regetNodesList() {
      this.$refs.acTable.clearSelection();
      this.multipleSelection = [];
      this.loadNodesList();
    },
    onRefresh() {
      this.$refs.acTable.clearSelection();
      this.multipleSelection = [];
      this.getDataList();
    }
  }
}

</script>
<style scoped>


</style>
