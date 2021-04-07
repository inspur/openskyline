<template>
  <div v-loading="loading">
    <el-row v-loading="loadingPool">
      <el-col :spsn="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{$t('network.RESPOOL_LIST')}}</span>
            <el-button size="small" type="text" icon="fa-refresh" @click="onRefreshBalance"></el-button>
            <el-button style="float:right;" size="small" @click="backToPreStep">
              <span style="font-weight:bold;">{{$t('lang.back')}}</span>
            </el-button>
          </div>
          <div class="table_panel">
            <div class="operation-panel margin-tb5"  @mousedown="detailMouseLeave">
              <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
              </operation-panel>
            </div>
            <el-table ref="poolTable" :data="poolTableData" highlight-current-row stripe border style="width: 100%"  row-key="id" :default-sort="{prop: 'name'}" @selection-change="handleSelectionChange" @sort-change="sortChange">
              <el-table-column reserve-selection type="selection" width="55">
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="100" sortable="custom">
                <template slot-scope="scope">
                  <el-button @click="showDetail(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('protocol') >= 0" prop="protocol" :label="$t('network.protocol')" min-width="50" sortable="custom">
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('lb_algorithm') >= 0" prop="lb_algorithm" :label="$t('network.method')" min-width="50">
                <template slot-scope="scope">
                  <span v-html="methodRender(scope.row.lb_algorithm)"></span>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('session_persistence') >= 0" prop="session_persistence" :label="$t('network.sessionpersi')" min-width="50">
                <template slot-scope="scope">
                  <span v-html="getSessionPersistence(scope.row)"></span>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('healthmonitor_id') >= 0" prop="healthmonitor_id" :label="$t('network.healthmonitor')" min-width="80">
                <template slot-scope="scope">
                  <el-button @click="showHealthmonitorDetail(scope.row)" type="text" size="small" v-text="scope.row.healthmonitor_id"></el-button>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('listeners') >= 0" prop="listeners" :label="$t('network.monitor')" min-width="85">
                <template slot-scope="scope">
                    <el-button v-text="getListenerId(scope.row.listeners)" @click="goToMonitor(scope.row.listeners)" type="text" size="small"></el-button>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('operating_status') >= 0" :label="$t('network.operateStatus')" prop="operating_status" min-width="50" align="left">
                <template slot-scope="scope">
                  <el-tag :type="statusTagRender(scope.row.operating_status)">
                    <span v-html="operatingStatusRender(scope.row.operating_status)"></span>
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('provisioning_status') >= 0" prop="provisioning_status" :label="$t('network.configStatus')" min-width="50" align="left">
                <template slot-scope="scope">
                  <el-tag :type="statusTagRender(scope.row.provisioning_status)">
                    <span v-html="provisioningStatusRender(scope.row.provisioning_status)"></span>
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('admin_state_up') >= 0" prop="admin_state_up" :label="$t('network.manageStatus')" min-width="50" align="left">
                <template slot-scope="scope">
                  <span v-html="adminStateUpRender(scope.row.admin_state_up)"></span>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" :label="$t('lang.desc')" min-width="200">
              </el-table-column>
            </el-table>
            <div style="margin: 10px 0; position: relative">
              <el-row>
                <el-col :span="5">
                  <el-button type="text" icon="fa-refresh" @click="onRefreshBalance"></el-button>
                  <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
                  <el-popover placement="right" trigger="click">
                    <el-checkbox-group class="vertical" v-model="columnsChecked">
                      <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                      </el-checkbox>
                    </el-checkbox-group>
                    <div slot="reference" class="name-wrapper">
                      <el-tag>{{$t('network.columnSelected')}}</el-tag>
                    </div>
                  </el-popover>
                </el-col>
                <el-col :span="19">
                  <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-collapse v-model="activeName">
      <el-collapse-item :title="$t('network.respoolMember')" name="2" v-loading="loadingMember">
        <div class="operation-panel margin-tb5" @mousedown="detailMouseLeave">
          <operation-panel :select-rows="multipleSelectionMember" :operation-menus="operationMenusMember">
          </operation-panel>
        </div>
        <el-table ref="resmembertable" :data="resmemberstableData" highlight-current-row stripe border style="width: 100%" row-key="id" @row-click="rowClickMember" @selection-change="handleSelectionChangeMember">
          <el-table-column reserve-selection type="selection" width="55">
          </el-table-column>
          <el-table-column v-if="columnsCheckedMember.indexOf('address') >= 0" :label="$t('network.ipaddress')" prop="address" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsCheckedMember.indexOf('protocol_port') >= 0" prop="protocol_port" :label="$t('network.port')" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsCheckedMember.indexOf('weight') >= 0" prop="weight" :label="$t('network.weight')" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsCheckedMember.indexOf('external') >= 0" prop="external" :label="$t('network.EXTERNAL_MEMBER')" min-width="100" align="left">
            <template slot-scope="scope">
              <span v-html="externalRender(scope.row.external)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsCheckedMember.indexOf('status') >= 0" prop="status" :label="$t('network.OPERATING_STATUS')" min-width="50" align="left">
            <template slot-scope="scope">
              <instance-status :status="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column :render-header="operateStatusHeader" v-if="columnsCheckedMember.indexOf('operating_status') >= 0" :label="$t('network.operateStatus')" prop="operating_status" min-width="50" align="left">
            <template slot-scope="scope">
              <el-tag :type="statusTagRender(scope.row.operating_status)">
                <span v-html="operatingStatusRender(scope.row.operating_status)"></span>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsCheckedMember.indexOf('provisioning_status') >= 0" prop="provisioning_status" :label="$t('network.configStatus')" min-width="50" align="left">
            <template slot-scope="scope">
              <el-tag :type="statusTagRender(scope.row.provisioning_status)">
                <span v-html="provisioningStatusRender(scope.row.provisioning_status)"></span>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsCheckedMember.indexOf('admin_state_up') >= 0" prop="admin_state_up" :label="$t('network.manageStatus')" min-width="50" align="left">
            <template slot-scope="scope">
              <span v-html="adminStateUpRender(scope.row.admin_state_up)"></span>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="getOrRefreashPoolsMembersInfo"></el-button>
              <span>{{$t("lang.currentSelected")}} {{multipleSelectionMember.length}}{{$tc('lang.item', multipleSelectionMember.length)}}</span>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsCheckedMember">
                  <el-checkbox class="item" v-for="item in columnsMember" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
                <div slot="reference" class="name-wrapper">
                  <el-tag>{{$t('network.columnSelected')}}</el-tag>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="19">
              <page :totalData="totalDataMember" @getCurrentData="getCurrentDataMember"></page>
            </el-col>
          </el-row>
        </div>
      </el-collapse-item>
    </el-collapse>
    <add-member v-if="addMemberFlag" @handleAddShow="handleMemberAddShow" @handleCancelShow="handleCancelShow" :balancerId="balancerId" :memberInfo="totalDataMember" :poolsId="poolsId" :projectId="balancerProjectId"></add-member>
    <update-weight v-if="editMemberFlag" @handleEditShow="handleEditShow" @handleCancelShow="handleCancelShow" :weightInfo="weightInfo" :poolsId="poolsId" :poolsName="poolsName" :memberInfo="totalDataMember"></update-weight>
    <edit-pool v-if="editpoolFlag" @handleEditPoolShow="handleEditPoolShow" @handleCancelShow="handleCancelShow" :poolInfo="poolsInfo"></edit-pool>
    <add-respool v-if="addPoolFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow" :balancerId="balancerId" :projectId="balancerProjectId"></add-respool>
    <add-healthmonitor v-if="addHealthFlag" :protocol="protocol" @handleAddHealthShow="handleAddHealthShow" @handleCancelShow="handleCancelShow" :poolsId="poolsId" :poolsName="poolsName" :projectId="balancerProjectId"></add-healthmonitor>
    <edit-five v-if="editHealthFlag" @handleEditShow="handleEditHealthShow" @handleCancelShow="handleCancelShow" :healthmonitorInfo="healthmonitorInfo"></edit-five>
    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="poolDetailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t("lang.back")}}</el-button>
          </div>
          <div>
            <pool-detail :poolData="poolData"></pool-detail>
          </div>
        </panel>
      </div>
    </transition>
    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="healthmonitorDetailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-right" @click="onBackHealthmonitor">{{$t("lang.back")}}</el-button>
          </div>
          <div>
            <healthmonitor-detail :healthmonitorInfo="healthmonitorInfo"></healthmonitor-detail>
          </div>
        </panel>
      </div>
    </transition>
  </div>
</template>
<script type="text/javascript">
  import UpdateWeight from '../UpdateWeight';
  import AddMember from '../EditStepFour';
  import PoolDetail from "../PoolDetail";
  import EditPool from '../EditStepThree';
  import AddRespool from '../AddRespool';
  import AddHealthmonitor from '../AddHealthMonitor';
  import EditFive from '../EditStepFive';
  import HealthmonitorDetail from '../HealthmonitorDetail';
  import InstanceStatus from "./InstanceStatus"
  export default {
    components: {
      PoolDetail,
      EditPool,
      AddRespool,
      AddHealthmonitor,
      EditFive,
      HealthmonitorDetail,
      AddMember,
      UpdateWeight,
      InstanceStatus
    },
    props: ["poolId", "refreshCount", "jumpflag"],
    data() {
      return {
        delFlag: false,
        getPoolInfoCount: 1,
        loadingPool: false,
        intervalDel: "",
        memberValid: false,
        memberReloading: false,
        poolReloading: false,
        poolValid: "",
        editMemberFlag: false,
        weightInfo: null,
        healthmonitorDetailFlag: false,
        loadingMember: false,
        totalDataMember: [],
        resmemberstableData: [],
        multipleSelectionMember:[],
        activeName: ["2"],
        healthmonitorInfo: null,
        editHealthFlag: false,
        poolsId: "",
        poolsName: "",
        balancerProjectId: this.$route.params.projectId,
        listenerId: "",
        addPoolFlag: false,
        poolData: {},
        poolTableData: [],
        sortObj: {
          sortOrder: "ascending",
          sortField: "name"
        },
        columnsChecked: [
          "name",
          "protocol",
          "lb_algorithm",
          "session_persistence",
          "healthmonitor_id",
          "monitor",
          "operating_status",
          "provisioning_status",
          "admin_state_up",
          "description",
          "listeners"
        ],
        columns: [
          {
            prop: "name",
            label: Vue.t("lang.name")
          },
          {
            prop: "protocol",
            label: Vue.t("network.protocol")
          },
          {
            prop: "lb_algorithm",
            label: Vue.t("network.method")
          },
          {
            prop: "session_persistence",
            label: Vue.t("network.sessionpersi")
          },
          {
            prop: "healthmonitor_id",
            label: Vue.t("network.healthmonitor")
          },
          {
            prop: "listeners",
            label: Vue.t("network.monitor")
          },
          {
            prop: "operating_status",
            label: Vue.t("network.operateStatus")
          },
          {
            prop: "provisioning_status",
            label: Vue.t("network.configStatus")
          },
          {
            prop: "admin_state_up",
            label: Vue.t("network.manageStatus")
          },
          {
            prop: "description",
            label: Vue.t("lang.desc")
          }
        ],
        poolDetailFlag: false,
        totalData: [],
        balancerId: this.$route.params.balanceId,
        loading: true,
        multipleSelection: [],
        addMemberFlag: false,
        editpoolFlag: false,
        addHealthFlag: false,
        isdeteleDisabled: false,
        haveHealth: false,
        cookieName: "",
        pool_description: "",
        projectId: "",
        pools_protocol: "",
        lb_algorithm: "",
        session_persistence: "",
        pools_admin_state_up: "",
        health_id: "",
        poolsInfo: null,
        operationMenus: [
          {
            icon: "fa-plus",
            name: Vue.t("network.create"),
            showflg: true,
            readOnly: true,
            handler: function(selectRows) {
              this.addRespool();
            }.bind(this)
          },
          {
            icon: "fa-edit",
            name: Vue.t("network.modify"),
            showflg: true,
            multi: false,
            enable(rowData) {
              if (rowData["provisioning_status"] == "PENDING_UPDATE" || rowData["provisioning_status"] == "ERROR" || rowData["provisioning_status"] == "PENDING_CREATE" || rowData["provisioning_status"] == "PENDING_DELETE") {
                return false;
              } else {
                return true;
              }
            },
            handler: function(selectRows) {
              let self = this;
              let row = selectRows[0];
              self.poolsInfo = row;
              self.editpoolFlag = true;
            }.bind(this)
          },
          {
            icon: "fa-times",
            name: Vue.t("network.delete"),
            showflg: true,
            multi: true,
            enable(rowData) {
              /*if (rowData["provisioning_status"] == "PENDING_UPDATE" || rowData["provisioning_status"] == "ERROR" || rowData["provisioning_status"] == "PENDING_CREATE" || rowData["provisioning_status"] == "PENDING_DELETE") {
                return false;
              } else {
                return true;
              }*/
            },
            handler: function(selectRows) {
              let self = this;
              let row = selectRows[0];
              self.deletepoolActionMK(selectRows);
            }.bind(this)
          },
          {
            icon: "fa-plus",
            name: Vue.t('network.creareHealth'),
            showflg: true,
            multi: false,
            enable(rowData) {
              if (!rowData["healthmonitor_id"]) {
                return true;
              } else {
                return false;
              }
            },
            handler: function (selectRows) {
              let row = selectRows[0];
              this.poolsName = row.name;
              this.poolsId = row.id;
              this.protocol = row.protocol;
              this.addHealthMonitorClick();
            }.bind(this)
          },
          {
            icon: "fa-edit",
            name: Vue.t("network.modifyHealth"),
            showflg: true,
            multi: false,
            enable(rowData) {
              if (rowData["healthmonitor_id"]) {
                return true;
              } else {
                return false;
              }
            },
            handler: function(selectRows) {
              let row = selectRows[0];
              this.getHealthInfo(row, true);
            }.bind(this)
          },
          {
            icon: "fa-times",
            name: Vue.t("network.deleteHealth"),
            showflg: true,
            multi: false,
            enable(rowData) {
              if (rowData["healthmonitor_id"]) {
                return true;
              } else {
                return false;
              }
            },
            handler: function(selectRows) {
              let self = this;
              let row = selectRows[0];
              self.deleteHealthMonitorClick(row);
            }.bind(this)
          }
        ],
        columnsCheckedMember: ['address', 'protocol_port', 'weight', 'external', 'status', 'operating_status', 'provisioning_status', 'admin_state_up'],
        columnsMember: [{
          prop: "address",
          label: Vue.t('network.ipaddress')
        }, {
          prop: "protocol_port",
          label: Vue.t('network.port')
        }, {
          prop: "weight",
          label: Vue.t('network.weight')
        }, {
          prop: "external",
          label: Vue.t('network.EXTERNAL_MEMBER')
        }, {
          prop: "status",
          label: Vue.t('network.OPERATING_STATUS')
        }, {
          prop: "operating_status",
          label: Vue.t('network.operateStatus')
        }, {
          prop: "provisioning_status",
          label: Vue.t("network.configStatus")
        }, {
          prop: "admin_state_up",
          label: Vue.t("network.manageStatus")
        }
        ],
        operationMenusMember: [{
          icon: "fa-plus",
          readOnly: false,
          name: Vue.t('network.addremovepoolmember'),
          showflg: true,
          handler: function (selectRows) {
            this.addMemberFlag = true;
          }.bind(this)
        }, {
          icon: "fa-edit",
          name: Vue.t('network.modify'),
          showflg: true,
          multi: false,
          enable(rowData) {
            if (rowData["provisioning_status"] == "PENDING_UPDATE" || rowData["provisioning_status"] == "ERROR" || rowData["provisioning_status"] == "PENDING_CREATE" || rowData["provisioning_status"] == "PENDING_DELETE") {
              return false;
            } else {
              return true;
            }
          },
          handler: function (selectRows) {
            let row = selectRows[0];
            this.weightInfo = row;
            this.editMemberFlag = true;
          }.bind(this)
        }, {
          icon: "fa-times",
          name: Vue.t("network.delete"),
          showflg: true,
          multi: true,
          enable: function(rowData) {
            /*if (rowData["provisioning_status"] == "PENDING_UPDATE" || rowData["provisioning_status"] == "PENDING_CREATE" || rowData["provisioning_status"] == "PENDING_DELETE") {
              return false;
            } else {
              let roleType = Vue.roleType + "";
              if (roleType != "0") {
                if (rowData["project_id"] == this.$cookie.get("pid")) {
                  return true;
                } else {
                  return false;
                }
              }
              return true;
            }*/
            let roleType = Vue.roleType + "";
            if (roleType != "0") {
              if (rowData["project_id"] == this.$cookie.get("pid")) {
                return true;
              } else {
                return false;
              }
            }
            return true;
          }.bind(this),
          handler: function (selectRows) {
            let self = this;
            self.deleteMemberMk(selectRows, self.poolsId);
          }.bind(this)
        }]
      }
    },
    watch: {
      refreshCount: {
        handler: function() {
          this.delFlag = false;
          this.getPoolInfo();
        }
      },
      columnsChecked: {
        handler: function(rows, oldVal) {
          this.columnsChecked = rows;
        },
        deep: true
      },
      columnsCheckedMember: {
        handler: function(rows, oldVal) {
          this.columnsCheckedMember = rows;
        },
        deep: true
      },

      multipleSelection: {
        handler: function(val, oldVal) {
          this.getOrRefreashPoolsMembersInfo();
        },
        deep: true
      },
      poolTableData: {
        immediate: false,
        handler: function(list) {
          let self = this;
          self.poolReloading = false;
          if (list != null) {
            for (let t = 0; t < list.length; t++) {
              let obj = list[t];
              if (obj["provisioning_status"].indexOf("PENDING_") >= 0) {
                self.poolReloading = true;
                break;
              }
            }
          }
          clearInterval(self.poolValid);
          if (self.poolReloading && !self._isDestroyed) {
            self.poolValid = setInterval(() => {
              if (self.getPoolInfoCount > 5) {
                clearInterval(self.poolValid);
                return;
              }
              self.getPoolInfo();
              self.getPoolInfoCount += 1;
            }, 5000);
          }
        }
      },
      resmemberstableData: {
        immediate: false,
        handler: function(list) {
          let self = this;
          self.memberReloading = false;
          if (list != null) {
            for (let t = 0; t < list.length; t++) {
              let obj = list[t];
              if (obj["provisioning_status"].indexOf("PENDING_") >= 0) {
                self.memberReloading = true;
                break;
              }
            }
          }
          clearInterval(self.memberValid);
          if (self.memberReloading && !self._isDestroyed) {
            self.memberValid = setInterval(() => {
              self.getOrRefreashPoolsMembersInfo();
              //this.getPoolsMembersInfo(this.poolsId);
            }, 5000);
          }
        }
      }
    },
    mounted() {
      this.getPoolInfo();
    },
    methods: {
      operateStatusHeader(h, {column, $index}) {
        return h('span', [
          h('span', {
            style:"margin-right:5px;"
          }, column.label),
          h('el-tooltip', {
            effect:"dark",
            placement:"top"}, [
            h('div', {
              'slot':"content"
            }, Vue.t('network.UDP_TIP')),
            h('i', {
              class:"el-icon-fa-question-circle"
            })
          ])
        ]);
      },
      detailMouseLeave() {
        this.poolDetailFlag = false;
        this.healthmonitorDetailFlag = false;
      },
      getSessionPersistence(poolsInfo) {
        if (poolsInfo['session_persistence'] == null || poolsInfo['session_persistence'] == "") {
          return "None";
        } else {
          return poolsInfo['session_persistence']["type"];
        }
      },
      //删除资源池成员
      deleteMemberMk(memList, poolId) {
        let self = this;
        self.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
          confirmButtonText: Vue.t('lang.confirm'),
          cancelButtonText:  Vue.t('lang.cancel'),
          type: "warning",
          closeOnClickModal: false,
          callback: async (action, instance) => {
            if (action === "confirm") {
              if (memList.length == 0) {
                return;
              }
              this.$refs.resmembertable.clearSelection();
              self.multipleSelectionMember = [];
              try {
                await self.deleteMember(memList, poolId);
              } catch (e) {
                self.loadingMember = true;
              }
            }
          }
        });
      },
      async deleteMember(memList, poolId) {
        let self = this;
        self.loadingMember = true;
        let oldDt = memList.shift();
        try {
          await self.$ajax({
            type: "DELETE",
            url: "api/octavia/v2.0/lbaas/pools/" + poolId + "/members/" + oldDt.id,
            data: {},
            errorKey: "NeutronError",
            log: {
              description: {
                en: "Remove Pool Member:(IP,PORT)=(" + oldDt.address + "，" + oldDt.protocol_port + ")",
                zh_cn: "移除资源池成员：（IP，PORT）=（" + oldDt.address + "，" + oldDt.protocol_port + "）"
              },
              target: Vue.logTarget.balance
            },
            successFun: function () {
              if (memList.length == 0) {
                clearInterval(self.intervalDel);
                self.loadingMember = false;
                let rowData = self.multipleSelection;
                if (rowData.length) {
                  self.getPoolsMembersInfo(rowData[0].id);
                }
              } else {
                clearInterval(self.intervalDel);
                self.intervalDel = setInterval(() => {
                  self.searchBalanceStatusForDel(memList, poolId);
                }, 5000);
              }
            },
            errFun: function() {
              if (memList.length == 0) {
                clearInterval(self.intervalDel);
                self.loadingMember = false;
                let rowData = self.multipleSelection;
                if (rowData.length) {
                  self.getPoolsMembersInfo(rowData[0].id);
                }
              } else {
                clearInterval(self.intervalDel);
                self.intervalDel = setInterval(() => {
                  self.searchBalanceStatusForDel(memList, poolId);
                }, 5000);
              }
            }
          });
        } catch (e) {
          self.loadingMember = false;
        }
      },
      searchBalanceStatusForDel(memberData, poolId) {
        let self = this;
        self.$ajax({
          type: "get",
          url: "api/octavia/v2.0/lbaas/loadbalancers/" + self.balancerId,
          errorKey: "NeutronError",
          success: function (result) {
            let loadbalancer = result["loadbalancer"];
            if (loadbalancer["provisioning_status"] != "ERROR") {
              if (loadbalancer["provisioning_status"] == "ACTIVE") {
                clearInterval(self.intervalDel);
                self.deleteMember(memberData, poolId);
              }
            } else {
              clearInterval(self.intervalDel);
            }
          }
        });
      },
      goToMonitor(listeners) {
        this.poolDetailFlag = false;
        this.healthmonitorDetailFlag = false;
        listeners = listeners || [];
        let monitorId = listeners[0] && listeners[0].id;
        if (monitorId) {
          this.$emit('goToMonitor', [monitorId, true]);
        }
      },
      setCurrent() {
        let row;
        this.$refs.poolTable.clearSelection();
        this.$refs.resmembertable.clearSelection();
        if (this.poolTableData.length) {
          for (let i = 0; i < this.poolTableData.length; i++) {
            if (this.poolTableData[i].id === this.poolId) {
              row = this.poolTableData[i];
              break;
            }
          }
          this.multipleSelection = [];
          if (row) {
            this.multipleSelection.push(row);
            this.$refs.poolTable.toggleRowSelection(row, true);
            this.$refs.poolTable.setCurrentRow(row, true);
            this.handleSelectionChange([row]);
          }
        }
      },
      onBackHealthmonitor() {
        this.healthmonitorDetailFlag = false;
      },
      showHealthmonitorDetail(row) {
        this.healthmonitorDetailFlag = true;
        this.poolDetailFlag = false;
        this.getHealthInfo(row);
      },
      //获取资源池成员信息
      async getPoolsMembersInfo(poolsId) {
        let self = this;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/octavia/v2.0/lbaas/pools/" + poolsId + "/members",
            complete: function (XMLHttpRequest, textStatus) {
            }
          });
          if (self.multipleSelection.length === 1) {
            self.totalDataMember = result['members'];
          }
        } catch (res) {
        }
      },
      getCurrentDataMember(param) {
        // param.forEach(v => {
        //   v.status = '-';
        // })
        this.resmemberstableData = param;
      },
      deleteHealthMonitorClick(row) {
        let self = this;
        self.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
          confirmButtonText: Vue.t('lang.confirm'),
          cancelButtonText:  Vue.t('lang.cancel'),
          type: "warning",
          closeOnClickModal: false,
          callback: (action, instance) => {
            if (action === "confirm") {
              self.loadingUp = true;
              self.multipleSelection = [];
              self.$refs.poolTable.clearSelection();
              self.$ajax({
                type: "DELETE",
                url: "api/octavia/v2.0/lbaas/healthmonitors/" + row.healthmonitor_id,
                data: {},
                successMsg: Vue.t('network.deleteSuccess'),
                success: function() {
                  self.getPoolInfo();
                },
                errorKey: "NeutronError",
                errFun() {
                },
                log:{
                  description:{
                    en:"Delete Health Monitor:"+row.healthmonitor_id,
                    zh_cn:"删除健康检查器:"+row.healthmonitor_id
                  },
                  target:Vue.logTarget.balance
                }
              });
            }
          }
        });
      },
      async getHealthInfo(row, editFlag) {
        let self = this;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/octavia/v2.0/lbaas/healthmonitors/" + row.healthmonitor_id,
            errorKey: "NeutronError",
            errFun() {
            }
          });
          let healthmonitor = result['healthmonitor'];
          self.healthmonitorInfo = healthmonitor;
          if (editFlag) {
            self.editHealthFlag = true;
          }
        } catch (res) {
        }
      },
      handleEditHealthShow() {
        this.editHealthFlag = false;
        this.multipleSelection = [];
        this.$refs.poolTable.clearSelection();
      },
      handleAddHealthShow() {
        this.addHealthFlag = false;
        this.multipleSelection = [];
        this.$refs.poolTable.clearSelection();
        this.getPoolInfo();
      },
      addHealthMonitorClick() {
        this.addHealthFlag = true;
      },
      handleAddShow() {
        this.addPoolFlag = false;
        this.getPoolInfo();
      },
      addRespool() {
        this.addPoolFlag = true;
      },
      deletepoolActionMK(row) {
        let self = this;
        self.$confirm(Vue.t('network.deletepoolnote'), Vue.t('network.attention'), {
          confirmButtonText: Vue.t('lang.confirm'),
          cancelButtonText: Vue.t('lang.cancel'),
          type: "warning",
          closeOnClickModal: false,
          callback: async (action, instance) => {
            if (action === "confirm") {
              self.$refs.poolTable.clearSelection();
              self.multipleSelection = [];
              if (row.length == 0) {
                return;
              }
              self.loadingPool = true;
              try {
                await self.deletepoolAction(row);
              } catch (e) {
                self.loadingPool = false;
              }
              self.getPoolInfo();
            }
          }
        });
      },
      async deletepoolAction(row) {
        let self = this;
        let oldRow = row.shift();
        let poolId = oldRow && oldRow.id;
        self.delFlag = true;
        if (!poolId) return;
        try {
          await self.$ajax({
            type: "DELETE",
            url: "api/octavia/v2.0/lbaas/pools/" + poolId,
            data: {},
            //successMsg: Vue.t('network.deleteSuccess'),
            errorKey: "NeutronError",
            log: {
              description: {
                en: "Delete Pool:" + oldRow.name,
                zh_cn: "删除资源池:" + oldRow.name
              },
              target: Vue.logTarget.balance
            },
            successFun: function () {
              self.getPoolInfo();
              if (row.length == 0) {
                clearInterval(self.intervalDel);
                self.loadingPool = false;
              } else {
                clearInterval(self.intervalDel);
                self.intervalDel = setInterval(() => {
                  self.deletepoolAction(row);
                }, 5000);
              }
            },
            errFun: function() {
              self.getPoolInfo();
              if (row.length == 0) {
                clearInterval(self.intervalDel);
                self.loadingPool = false;
              } else {
                clearInterval(self.intervalDel);
                self.intervalDel = setInterval(() => {
                  self.deletepoolAction(row);
                }, 5000);
              }
            }
          });
        } catch (e) {
          self.loadingPool = false;
        }
      },
      handleCancelShow() {
        this.editpoolFlag = false;
        this.addPoolFlag = false;
        this.addHealthFlag = false;
        this.editHealthFlag = false;
        this.addMemberFlag = false;
        this.editMemberFlag = false;
        //this.getPoolInfo();
        //this.getOrRefreashPoolsMembersInfo();
      },
      handleMemberAddShow() {
        this.addMemberFlag = false;
        let rowData = this.multipleSelection;
        if (rowData.length) {
          this.getPoolsMembersInfo(rowData[0].id);
        }
      },
      handleEditPoolShow() {
        this.editpoolFlag = false;
        this.multipleSelection = [];
        this.$refs.poolTable.clearSelection();
        this.getPoolInfo();
      },
      getListenerId(listeners) {
        listeners = listeners || [];
        return listeners[0] && listeners[0].id;
      },
      onBack() {
        this.poolDetailFlag = false;
      },
      adminStateUpTagRender(status) {
        if (status + "" == "true") {
          return "info";
        } else {
          return "";
        }
      },
      adminStateUpRender(status) {
        if (status + "" == "true") {
          return "UP";
        } else {
          return "Down";
        }
      },
      externalRender(status) {
        if (status + "" === "true") {
          return Vue.t("lang.yes");
        } else {
          return Vue.t("lang.no");
        }
      },
      methodRender(method) {
        if (method === "LEAST_CONNECTIONS") {
          return Vue.t(('network.leastconnect'))
        }
        if (method === "ROUND_ROBIN") {
          return Vue.t(('network.roundRobin'))
        }
        if (method === "SOURCE_IP") {
          return Vue.t(('network.sourceIP'))
        }
      },
      onRefreshBalance() {
        this.$refs.poolTable.clearSelection();
        this.$refs.resmembertable.clearSelection();
        this.resmemberstableData = [];
        this.getPoolInfo();
      },
      //根据loadlbalanceId 获取所有资源池
      async getPoolInfo() {
        let self = this;
        try {
          let result = await self.$ajax({
            type: "get",
            url:
              "api/octavia/v2.0/lbaas/pools/?loadbalancer_id=" + this.balancerId,
            error: "NeurtronError"
          });
          if (!self.jumpflag) {
            this.$refs.poolTable.clearSelection();
            this.$refs.resmembertable.clearSelection();
          }
          self.totalData = result['pools'];
          if (self.jumpflag && (!self.delFlag)) {
            self.$nextTick(() => {
              self.setCurrent();
            });
          }
          self.loading = false;
        } catch (res) {
          self.loading = false;
        }
      },
      getCurrentData(param) {
        this.poolTableData = param;
      },
      sortChange(column) {
        const self = this;
        if (!column.prop) {
          return;
        }
        self.sortObj = {
          sortOrder: column.order,
          sortField: column.prop
        };
      },
      statusTagRender(status) {
        if (status === "ACTIVE") {
          return "success";
        } else if (
          status === "PENDING_UPDATE" ||
          status === "PENDING_DELETE" ||
          status === "PENDING_CREATE" ||
          status === "deleting"
        ) {
          return "info";
        } else if (status === "ERROR" ) {
          return "danger";
        } else if (status === "ONLINE") {
          return "success";
        } else if (status === "OFFLINE") {
          return "info";
        } else {
          return "info";
        }
      },
      queryClick() {
        this.getPoolInfo(
          this.loadbalancer_ID,
          this.query_name,
          this.query_protocol
        );
      },
      handleSelectionChangeMember(val) {
        let rowData = val;
        this.multipleSelectionMember = rowData;
      },
      handleSelectionChange(val) {
        let rowData = val;
        this.multipleSelection = rowData;
        this.$refs.resmembertable.clearSelection();
        this.resmemberstableData = [];
        if (val.length === 1) {
          this.poolsId = rowData[0].id;
          this.poolsName = rowData[0].name;
        }
      },
      getOrRefreashPoolsMembersInfo() {
        let rowData = this.multipleSelection;
        if (rowData.length && rowData.length ===1) {
          this.getPoolsMembersInfo(rowData[0].id);
          if (!(rowData["provisioning_status"] == "PENDING_UPDATE" || rowData["provisioning_status"] == "ERROR" || rowData["provisioning_status"] == "PENDING_CREATE" || rowData["provisioning_status"] == "PENDING_DELETE")) {
            this.operationMenusMember[0].readOnly = true;
          }
        } else {
          this.resmemberstableData = [];
          this.$refs.resmembertable.clearSelection();
          this.operationMenusMember[0].readOnly = false;
        }
      },
      rowClick(row) {
        //this.$refs.poolTable.toggleRowSelection(row);
      },
      rowClickMember(row) {
        this.$refs.resmembertable.toggleRowSelection(row);
      },
      handleEditShow() {
        this.editMemberFlag = false;
        this.$refs.resmembertable.clearSelection();
        this.multipleSelectionMember = [];
        let rowData = this.multipleSelection;
        if (rowData.length) {
          this.getPoolsMembersInfo(rowData[0].id);
        }
      },
      showDetail(row) {
        this.poolDetailFlag = true;
        this.healthmonitorDetailFlag = false;
        this.poolData = row;
      },
      //操作状态转换
      operatingStatusRender(value) {
        if (value === "ONLINE") {
          return Vue.t("network.online");
        } else if (value === "DRAINIG") {
          return Vue.t("network.drainig");
        } else if (value === "NO_MONITOR") {
          return Vue.t("network.nomonitor");
        } else if (value === "OFFLINE") {
          return Vue.t("network.offline");
        } else if (value === "ERROR") {
          return Vue.t("lang.ERROR");
        } else if (value === "RETRIEVE_FAILED") {
          return Vue.t("network.RETRIEVE_FAILED");
        } else if (value === "DEGRADED") {
          return Vue.t('network.degrded');
        } else {
          return value;
        }
      },
      //配置状态转换
      provisioningStatusRender(value) {
        if (value === "ACTIVE") {
          return Vue.t("lang.ACTIVE");
        } else if (value === "DELETD") {
          return Vue.t("network.deletd");
        } else if (value === "PENDING_CREATE") {
          return Vue.t("network.createing");
        } else if (value === "PENDING_UPDATE") {
          return Vue.t("network.pendingupdate");
        } else if (value === "PENDING_DELETE") {
          return Vue.t("network.pendingdelete");
        } else if (value === "deleting") {
          return Vue.t("network.operating");
        } else if (value === "ERROR") {
          return Vue.t("lang.ERROR");
        } else if (value === "INACTIVE") {
          return Vue.t("lang.DOWN");
        } else {
          return value;
        }
      },
      onRefresh() {
        this.getPoolInfo(this.loadbalancer_ID);
      },
      backToPreStep() {
        this.$router.push({
          path: "/net/balanceView"
        });
      }
    }
  };
</script>
<style type="text/css">
  .idatath {
    width: 120px;
  }
</style>
