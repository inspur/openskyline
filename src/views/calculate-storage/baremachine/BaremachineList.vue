<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus" :operateMore="operateMore">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="acTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="uuid"  @selection-change="handleSelectionChange" :default-sort="{prop: 'name', order: 'ascending'}"  @sort-change="sortChange">
      <el-table-column
        reserve-selection
        type="selection"
        width="55"
        align="center"
        :selectable="function(row, index) { return !['deleting'].includes(row['provision_state']) }">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="50" sortable="custom">
        <template slot-scope="scope">
          <el-button @click="phyDetail(scope.row)" type="text" size="small">{{scope.row.name || scope.row.uuid || '-'}}</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('instance_uuid') >= 0" :label="$t('calcStorLang.physicalHost') + 'ID'" prop="instance_uuid" sortable="custom" min-width="50">
        <template slot-scope="scope">
          <span v-html="instanceRender(scope.row.instance_uuid, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('display_name') >= 0" :label="$t('calcStorLang.physicalHost') + $t('lang.name')" prop="display_name" min-width="50">
        <template slot-scope="scope">
          <span v-html="displayNameRender(scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('driver_info') >= 0" :label="$t('calcStorLang.bmcIP')" prop="driver_info" align="left" min-width="80">
        <template slot-scope="scope">
          <span v-html="bmcAddressRender(scope.row.driver_info, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('power_state') >= 0" prop="power_state" :label="$t('calcStorLang.powerStatus')" min-width="50" sortable="custom" align="left">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.power_state)">
            <span v-html="statusRender(scope.row.maintenance, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('provision_state') >= 0" prop="provision_state" :label="$t('calcStorLang.deployStatus')" min-width="50" sortable="custom" align="left">
        <template slot-scope="scope">
          <el-tag :type="provisonTagRender(scope.row.provision_state)">
            <span v-html="provisonRender(scope.row.provision_state, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('maintenance') >= 0" prop="maintenance" :label="$t('calcStorLang.maintenanceMode')" min-width="50" sortable="custom" align="left">
        <template slot-scope="scope">
          <span v-html="maintenanceRender(scope.row.maintenance, scope.row)" v-if="!scope.row.maintenance"></span>
          <el-tag :type="maintenanceTagRender(scope.row.maintenance)" v-if="scope.row.maintenance">
            <span v-html="maintenanceRender(scope.row.maintenance, scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('ports') >= 0" prop="ports" :label="$t('calcStorLang.portCount')" min-width="50" sortable="custom" align="left">
        <template slot-scope="scope">
          <span v-html="portRender(scope.row.ports, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('cpus') >= 0" prop="cpus" :label="$t('calcStorLang.cpuCore')" min-width="50" sortable="custom" align="left">
        <template slot-scope="scope">
          <span v-html="cpuRender(scope.row.properties, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('memory_mb') >= 0" prop="memory_mb" :label="$t('calcStorLang.memGB')" min-width="50" sortable="custom" align="left">
        <template slot-scope="scope">
          <span v-html="memoryGBRender(scope.row.properties, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('local_gb') >= 0" prop="local_gb" :label="$t('calcStorLang.ROOT_DISK') + '(GB)'" min-width="50" sortable="custom" align="left">
        <template slot-scope="scope">
          <span v-html="rootGbRender(scope.row.properties, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('driver') >= 0" prop="driver" :label="$t('calcStorLang.drive')" min-width="50" align="left">
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
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page ref="pageComponent" :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
        </el-col>
      </el-row>
    </div>
    <add-physical-host v-if="addPhyFlag" @handleAddShow="handlePhyHostShow" :operateType="operateType" :phyEntity="phyEntity" @onRefresh="onRefresh" @getDataList="getDataList"></add-physical-host>
    <batch-register-baremetal-machine v-if="batchRegisterBaremetalMachineDialog.visible" @close="batchRegisterBaremetalMachineDialog.visible = false" @refresh="onRefresh" />
    <bios v-if="biosFlag" @hide="biosFlag=false" :id="selId" :name="selName" @onRefresh="onRefresh"></bios>
    <edit-baremachine v-if="editBaremachineflag" :id="instanceUuid" @hide="editBaremachineflag=false" @onRefresh="onRefresh"></edit-baremachine>
    <raid-configuration v-if="raidConfFlag" :phyDetailUuid="phyDetailUuid" :phyName="phyName" @hide="raidConfFlag=false" @onRefresh="onRefresh"></raid-configuration>
    <transfer-to-available v-if="transferToAvailableDialog.visible" :baremetals="transferToAvailableDialog.baremetals" @close="transferToAvailableDialog.visible = false" @refresh="onRefresh" />
  </div>
</template>
<script>
import AddPhysicalHost from './AddBaremachine';
import BatchRegisterBaremetalMachine from './batch-register-baremetal-machine';
import Bios from './Bios';
import EditBaremachine from './EditBaremachine';
import RaidConfiguration from './RaidConfiguration';
import TransferToAvailable from './TransferToAvailable';
export default {
  name: 'BareMachineManagement',
  components: { AddPhysicalHost, Bios, EditBaremachine, RaidConfiguration, BatchRegisterBaremetalMachine, TransferToAvailable },
  data() {
    return {
      vmMap: new Map(),
      intervalResetStatus: "",
      phyDetailUuid: "",
      raidConfFlag: false,
      instanceUuid: "",
      checkRows: '',
      checkCrrentIndex: 0,
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
      transferToAvailableDialog: {
        visible: false,
        baremetals: []
      },
      loading: true,
      reloadTblFlag: false,
      phyHostUuid: '',
      columnsChecked: ['name', 'display_name', 'driver_info', 'power_state', 'provision_state', 'maintenance', 'ports', 'cpus', 'memory_mb', 'local_gb', 'driver'],
      tableData: [],
      multipleSelection: [],
      batchRegisterBaremetalMachineDialog: {
        visible: false
      },
      operateMore: true,
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t("calcStorLang.register"),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.operateType = 1;
          this.addPhyFlag = true;
        }.bind(this)
      }, {
        icon: "fa-plus",
        name: Vue.t("calcStorLang.BAREMETAL_BATCH_REGISTER_BUTTON"),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.batchRegisterBaremetalMachineDialog.visible = true;
        }.bind(this)
      }, {
        icon: "fa-play",
        name: Vue.t("base.start"),
        multi: true,
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
            confirmMsg: Vue.t("calcStorLang.openBareConfirm"),
            successMsg: Vue.t("calcStorLang.openSendSuccess"),
            log: {
                  description: {
                    en: "Start Baremetal Machine",
                    zh_cn: "开启裸机"
                  },
                  key: "name",
                  target: Vue.logTarget.bareMachine
               }
          }).then(async(data) => {
            for (let i = 0; i < selectRows.length; i++) {
              let pmr = selectRows[i];
              if (typeof pmr["instance_uuid"] != "undefined" && pmr["instance_uuid"] != null && pmr["instance_uuid"] != "") {
                let body1 = { "os-start": null };
                body1 = JSON.stringify(body1);
                try {
                  let result = await self.$ajax({
                    type: 'post',
                    data:body1,
                    url: 'api/nova/v2.1/servers/' + pmr["instance_uuid"] + '/action'
                  });
                } catch (res) {
                }
              }
            }
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
        name: Vue.t("base.shutdown"),
        showflg: true,
        multi: true,
        enable(rowData) {
          return rowData['power_state'] == "power on";
        },
        handler: function(selectRows) {
          var self = this;
          var body = { "target": "power off" };
          body = JSON.stringify(body);
          self.$sequence({
            type: 'put',
            url: 'api/ironic/v1/nodes/{uuid}/states/power',
            data: body,
            params: selectRows,
            confirmMsg: Vue.t("calcStorLang.closeBareComfirm"),
            successMsg:  Vue.t("calcStorLang.closeSendSuccess"),
            log: {
                  description: {
                    en: "Close Baremetal Machine",
                    zh_cn: "关闭裸机"
                  },
                  key: "name",
                  target: Vue.logTarget.bareMachine
               }
          }).then(async(data) => {
            for (let i = 0; i < selectRows.length; i++) {
              let pmr = selectRows[i];
              if (typeof pmr["instance_uuid"] != "undefined" && pmr["instance_uuid"] != null && pmr["instance_uuid"] != "") {
                let body1 = { "os-stop": null };
                body1 = JSON.stringify(body1);
                try {
                  let result = await self.$ajax({
                    type: 'post',
                    data: body1,
                    url: 'api/nova/v2.1/servers/' + pmr["instance_uuid"] + '/action'
                  });
                } catch (res) {
                }
              }
            }
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
        icon: 'fa-repeat',
        name: Vue.t('calcStorLang.BAREMETAL_RESTART'),
        showflg: true,
        multi: true,
        enable(rowData) {
          if (['enroll', 'verifying', 'cleaning', 'clean wait', 'rebooting'].includes(rowData['provision_state'])) {
            return false;
          }
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          var body = { 'target': 'rebooting' };
          body = JSON.stringify(body);
          self.$sequence({
            type: 'put',
            url: 'api/ironic/v1/nodes/{uuid}/states/power',
            data: body,
            params: selectRows,
            confirmMsg: Vue.t('calcStorLang.BAREMETAL_RESTART_CONFIRM'),
            successMsg: Vue.t('calcStorLang.BAREMETAL_RESTART_SUCCESSFULLY'),
            log: {
              description: {
                en: 'Reboot Baremetal Machine',
                zh_cn: '重启裸机'
              },
              key: 'name',
              target: Vue.logTarget.bareMachine
            }
          }).then(async(data) => {
            for (let i = 0; i < selectRows.length; i++) {
              let pmr = selectRows[i];
              if (pmr.phyStatus === 'SHUTOFF') {
                if (typeof pmr['instance_uuid'] != 'undefined' && pmr['instance_uuid'] != null && pmr['instance_uuid'] != '') {
                  let body1 = { 'os-start': null };
                  body1 = JSON.stringify(body1);
                  try {
                    let result = await self.$ajax({
                      type: 'post',
                      data: body1,
                      url: 'api/nova/v2.1/servers/' + pmr['instance_uuid'] + '/action'
                    });
                  } catch (res) {
                  }
                }
              }
            }
            self.$refs.acTable.clearSelection();
            for (var r = 0; r < selectRows.length; r++) {
              var row = selectRows[r];
              var phy = self.phyMaps.get(row.uuid);
              phy['power_state'] = 'BUSY';
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
        icon: "fa-pencil-square-o",
        name: Vue.t('lang.edit'),
        showflg: Vue.roleType + "" == "0",
        enable(rowData) {
          return (rowData['provision_state'] == "manageable" || rowData['provision_state'] == "enroll");
        },
        handler: function(selectRows) {
          let row = selectRows[0];
          this.instanceUuid = row.uuid;
          this.selName = row.name;
          this.editBaremachineflag = true;
        }.bind(this)
      }, {
        icon: "fa-refresh",
        name: Vue.t("lang.refresh"),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          self.$refs.acTable.clearSelection();
          self.multipleSelection = [];
          self.getDataList();
        }.bind(this)
      }, {
        icon: "fa-chain-broken",
        name: Vue.t("calcStorLang.delete"),
        showflg: true,
        multi: true,
        operateMore: true,
        enable(rowData) {
          return ((rowData['provision_state'] == "manageable" || rowData['provision_state'] == "available" || rowData['provision_state'] == "enroll" || rowData['provision_state'] == "adopt failed") && rowData['power_state'] != "BUSY" && (rowData['maintenance'] + "") == "false");
        },
        handler: function(selectRows) {
          var self = this;
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
                    zh_cn: "删除裸机"
                  },
                  key: "name",
                  target: Vue.logTarget.bareMachine
               }
              }).then((data) => {
                self.loading = true;
                for (var r = 0; r < selectRows.length; r++) {
                  var row = selectRows[r];
                  var phy = self.phyMaps.get(row.uuid);
                  row['provision_state'] = 'deleting';
                  phy['provision_state'] = "deleting";
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
      }, {
        icon: "fa-deaf",
        name: Vue.t("calcStorLang.enterMaintenanceMode"),
        showflg: true,
        multi: true,
        operateMore: true,
        enable(rowData) {
          return (rowData['maintenance'] + "" == "false");
        },
        handler: function(selectRows) {
          var self = this;
          self.$prompt(Vue.t("lang.confirm") + Vue.t("calcStorLang.enterMaintenanceMode") + "?" + Vue.t("calcStorLang.reason") + ":", Vue.t("lang.confirmDo"), {
            confirmButtonText: Vue.t("lang.confirmDo"),
            cancelButtonText: Vue.t("lang.cancel"),
            inputPattern:/^\S{0,50}$/,
            inputErrorMessage:Vue.t("calcStorLang.nomorethan50andnospace")
          }).then(async({ value }) => {
            var body = {"reason": value};
            body = JSON.stringify(body);
            self.$sequence({
              type: 'put',
              url: 'api/ironic/v1/nodes/{uuid}/maintenance',
              data: body,
              params: selectRows,
              successMsg: Vue.t("calcStorLang.enterMaintenanceMode") + " "+ Vue.t("calcStorLang.sendSuccess"),
              log: {
                  description: {
                    en: "{name} Enter maintenance,Reason:" + value,
                    zh_cn: "裸机:{name}进入维护模式,原因:" + value
                  },
                  // key: "name",
                  target: Vue.logTarget.bareMachine
               }
          }).then((data) => {
            self.$refs.acTable.clearSelection();
            self.currentPage = 1;
            setTimeout(function() {
              self.getDataList({
                page: 1
              });
            }, 5000);
          }).catch((err) => {
            console.log(err);
          });
        }).catch(() => {
          //取消
        });
        }.bind(this)
      }, {
        icon: "fa-deaf",
        name: Vue.t("calcStorLang.quitMaintenanceMode"),
        showflg: true,
        multi: true,
        operateMore: true,
        enable(rowData) {
          return (rowData['maintenance'] + "" == "true");
        },
        handler: function(selectRows) {
          var self = this;
          self.$sequence({
            type: 'delete',
            url: 'api/ironic/v1/nodes/{uuid}/maintenance',
            params: selectRows,
            confirmMsg: Vue.t("lang.confirm") + Vue.t("calcStorLang.quitMaintenanceMode"),
            successMsg: Vue.t("calcStorLang.quitMaintenanceMode") + " " + Vue.t("calcStorLang.sendSuccess"),
            log: {
                  description: {
                    en: "{name} Exist maintenance",
                    zh_cn: "裸机:{name}退出维护模式"
                  },
                  // key: "name",
                  target: Vue.logTarget.bareMachine
               }
          }).then((data) => {
            self.$refs.acTable.clearSelection();
            self.currentPage = 1;
            setTimeout(function() {
              self.getDataList({
                page: 1
              });
            }, 5000);
          }).catch((err) => {
            console.log(err);
          });
        }.bind(this)
      }, {
        icon: "fa-external-link-square",
        name: Vue.t("calcStorLang.transferToAvailable"),
        showflg: true,
        multi: true,
        operateMore: true,
        enable(rowData) {
          return (rowData['provision_state'] == "manageable");
        },
        handler: function(selectRows) {
          let self = this;
          self.transferToAvailableDialog.baremetals = selectRows;
          self.transferToAvailableDialog.visible = true;
        }.bind(this)
      }, {
        icon: "fa-external-link-square",
        name: Vue.t("calcStorLang.transferToManageable"),
        showflg: true,
        operateMore: true,
        multi: true,
        enable(rowData) {
          return (rowData['provision_state'] == "enroll" || rowData['provision_state'] == "available" || rowData['provision_state'] == "inspect failed" || rowData['provision_state'] == "clean failed" || rowData['provision_state'] == "adopt failed");
        },
        handler: function(selectRows) {
          var self = this;
          var body = {"target": "manage"};
          body = JSON.stringify(body);
          self.$sequence({
            type: 'put',
            url: 'api/ironic/v1/nodes/{uuid}/states/provision',
            params: selectRows,
            data: body,
            confirmMsg: Vue.t("lang.confirm") + Vue.t("calcStorLang.transferToManageable") + "?",
            successMsg: Vue.t("calcStorLang.transferToManageable") + " " + Vue.t("calcStorLang.sendSuccess") + "," + Vue.t("calcStorLang.pleaseRefreshLater"),
            log: {
                  description: {
                    en: "Change manageable",
                    zh_cn: "裸机转为可管理"
                  },
                  key: "name",
                  target: Vue.logTarget.bareMachine
               }
          }).then((data) => {
            self.$refs.acTable.clearSelection();
            self.currentPage = 1;
            setTimeout(function() {
              self.getDataList({
                page: 1
              });
            }, 5000);
          }).catch((err) => {
            console.log(err);
          });
        }.bind(this)
      }, {
        icon: "fa-external-link-square",
        name: Vue.t("calcStorLang.checkup"),
        showflg: true,
        multi: true,
        operateMore: true,
        enable(rowData) {
          return (rowData['provision_state'] == "manageable" || rowData['provision_state'] == "inspect failed");
        },
        handler: function(selectRows) {
          let self = this;
          if (selectRows.length) {
            self.$confirm(
              Vue.t("calcStorLang.CHECK_MKSURE"),
              {
                confirmButtonText: Vue.t("lang.confirm"),
                cancelButtonText: Vue.t("lang.cancel"),
                type: "warning",
                closeOnClickModal: false,
                callback: async (action, instance) => {
                  if (action === "confirm") {
                    if (selectRows.length == 0) {
                      return;
                    }
                    self.checkRows = [].concat(selectRows);
                    self.checkCrrentIndex = 0;
                    self.checkup();
                  }
                }
              }
            );
          }
        }.bind(this)
      }, {
        icon: "fa-external-link-square",
        name: Vue.t("calcStorLang.setBios"),
        showflg: true,
        operateMore: true,
        enable(rowData) {
          return !["enroll", "error", "deploying", "wait call-back", "inspecting"].includes(rowData["provision_state"]);
        },
        handler: function(selectRows) {
          this.selId = selectRows[0].uuid;
          this.selName = selectRows[0].name;
          this.biosFlag = true;
        }.bind(this)
      }, {
        name: Vue.t("calcStorLang.RAID_CONF"),
        showflg: this.$archIs('x86'),
        operateMore: true,
        enable(rowData) {
          return rowData["provision_state"] === "manageable" && rowData.maintenance == false;
        },
        handler: function(selectRows) {
          this.phyDetailUuid = selectRows[0].uuid;
          this.phyName = selectRows[0].name;
          this.raidConfFlag = true;
        }.bind(this)
      }, {
        name: Vue.t("network.RESET_STATUS"),
        showflg: true,
        operateMore: true,
        enable(rowData) {
          return ['deploy failed', 'rescue failed', 'unrescue failed', 'error'].includes(rowData["provision_state"]);
        },
        handler: function(selectRows) {
          this.resetStatus(selectRows[0]);
        }.bind(this)
      }],
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumber'));
              }
            }
          },
          provision_state: {
            label: this.$t('calcStorLang.deployStatus'),
            type: 'select',
            options: [{
              label: this.$t('calcStorLang.register'),
              value: 'enroll'
            }, {
              label: this.$t('calcStorLang.manageable'),
              value: 'manageable'
            }, {
              label: this.$t('calcStorLang.active'),
              value: 'available'
            }, {
              label: this.$t('calcStorLang.running'),
              value: 'active'
            }, {
              label: this.$t('calcStorLang.verifying'),
              value: 'verifying'
            }, {
              label: this.$t('calcStorLang.cleaning'),
              value: 'cleaning'
            }, {
              label: this.$t('calcStorLang.cleanWait'),
              value: 'clean wait'
            }, {
              label: this.$t('calcStorLang.inspecting'),
              value: 'inspecting'
            }, {
              label: this.$t('calcStorLang.inspectWait'),
              value: 'inspect wait'
            }, {
              label: this.$t('calcStorLang.deploying'),
              value: 'deploying'
            }, {
              label: this.$t('calcStorLang.waittingCallback'),
              value: 'wait call-back'
            }, {
              label: this.$t('calcStorLang.task_deleting'),
              value: 'deleting'
            }, {
              label: this.$t('calcStorLang.error'),
              value: 'error'
            }, {
              label: this.$t('calcStorLang.inspectFailed'),
              value: 'inspect failed'
            }, {
              label: this.$t('calcStorLang.cleanFailed'),
              value: 'clean failed'
            }, {
              label: this.$t('calcStorLang.deployFailed'),
              value: 'deploy failed'
            }]
          },
          instance_uuid: {
            label: this.$t('calcStorLang.physicalHost') + 'ID',
            type: 'input',
            validator: (value) => {
              if (!/^[a-fA-F0-9\-]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyUUIDKeyword'));
              }
            }
          },
          maintenance: {
            label: this.$t('calcStorLang.maintenanceMode'),
            type: 'select',
            options: [{
              label: this.$t('lang.yes'),
              value: 'true'
            }, {
              label: this.$t('lang.no'),
              value: 'false'
            }]
          }
        },
        validatedParams: {}
      }
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
        if (index === 1) {
          this.columns.push({
            prop: "instance_uuid",
            label: Vue.t('calcStorLang.physicalHost') + 'ID'
          });
        }
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
              zh_cn: "裸机" + row.name + " 重置状态"
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
    displayNameRender(row) {
      return row.phyName || "";
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
            zh_cn: `裸机执行检查：主机名[${self.checkRows[self.checkCrrentIndex].name}] IP[${self.checkRows[self.checkCrrentIndex].driver_info.ipmi_address}]`
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
       if (keyOrder != null && self.totalData != null && (key === "ports" || key === "cpus" || key === "memory_mb" || key === "local_gb")) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder, "int"));
          self.sortObj.sortType = "Int";
       }
      if (keyOrder != null && self.totalData != null && !(key === "ports" || key === "cpus" || key === "memory_mb" || key === "local_gb")) {
        self.totalData.sort(this.$sortFormatter(key, keyOrder));
        self.sortObj.sortType = undefined;
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
      try {
        let result = await self.$ajax({
          type: 'get',
          headers: {
            "X-Openstack-Ironic-Api-Version": "latest"
          },
          url: 'api/ironic/v1/nodes_inspur?is_adopt=no&detail=True'
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
        for (let [k, v] of Object.entries(this.searchBar.validatedParams)) {
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
        await self.getPhyHostDetail();
        for (let vm of list) {
          let phyInstance = self.vmMap.get(vm.instance_uuid);
          vm.phyName = phyInstance ? phyInstance.name : '';
          vm.phyStatus = phyInstance ? phyInstance.status : '';
        }
        self.totalData = [];
        self.totalData = list;
        // 此三列排序用
        for (let i = 0; i < self.totalData.length; i++) {
          self.totalData[i].cpus = (self.totalData[i].properties && self.totalData[i].properties.cpus) || "0";
          self.totalData[i].memory_mb = (self.totalData[i].properties && self.totalData[i].properties.memory_mb) || "0";
          self.totalData[i].local_gb = (self.totalData[i].properties && self.totalData[i].properties.local_gb) || "0";
        }
      } catch (e) {
        console.error(e);
        // self.loading = false;
      }
    },
    async getPhyHostDetail() {
      const self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/servers-inspur/detail?all_tenants=1" + "&tags=@",
          headers: {
            'X-OpenStack-Nova-API-Version': '2.67'
          },
          showErrMsg: true
        });
        const vmList = result['servers'];
        for (let i = 0; i < vmList.length; i++) {
          self.vmMap.set(vmList[i].id, vmList[i]);
        }
      } catch (e) {
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
    provisonRender(value, rowData) {
       if ("enroll" == value) {
          return Vue.t("calcStorLang.register");
       } else if ("available" == value) {
          return Vue.t("calcStorLang.active");
       } else if ("verifying" == value) {
          return Vue.t("calcStorLang.verifying");
       } else if ("manageable" == value) {
          return Vue.t("calcStorLang.manageable");
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
        path: '/calculate-storage/baremachine-management/detail?phyHostUuid=' + self.phyHostUuid + '&name=' + row.name + '&phyStatus=' + row['provision_state'],
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
    handlePhyHostShow() {
      this.addPhyFlag = false;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
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
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.$refs.acTable.clearSelection();
      this.getDataList();
      this.$refs.pageComponent.setCurrentPage(1);
    }
  }
}

</script>
<style scoped>


</style>
