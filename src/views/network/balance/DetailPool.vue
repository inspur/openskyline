<template>
  <div v-loading="loadingUp">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{$t('network.respoolDetail')}}</span>
        <el-button size="small" type="text" icon="fa-refresh" @click="onRefreshPool"></el-button>
        <el-button style="float:right;" size="small" @click="backToPreStep">
          <span style="font-weight:bold;">{{$t('lang.back')}}</span>
        </el-button>
      </div>
      <div style="padding-left:2px;padding-bottom:5px;">
        <el-button @click="editpoolAction" type="primary" size="small">{{$t('network.editrespool')}}</el-button>
        <el-button @click="deletepoolAction" type="primary" size="small" :disabled="isdeteleDisabled">{{$t('network.deleterespool')}}</el-button>
        <el-button type="primary" size="small" v-if="haveHealth" @click="addHealthMonitorClick" :disabled="isHealthDisabled">{{$t('network.creareHealth')}}</el-button>
      </div>
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath">{{$t('network.respoolName')}}：</th>
              <td class="idatatd">{{pools_name}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.respoolId')}}：</th>
              <td class="idatatd">{{pools_id}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.protocol')}}：</th>
              <td class="idatatd">{{pools_protocol}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('network.method')}}：</th>
              <td class="idatatd">{{lb_algorithm}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.sessionpersi')}}：</th>
              <td class="idatatd">{{session_persistence}}</td>
            </tr>
            <tr class="odd" v-if="cookieName!=''&&cookieName!=null">
              <th class="idatath">{{'Cookie'+$t('lang.name')}}：</th>
              <td class="idatatd">{{cookieName}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('lang.desc')}}:</th>
              <td class="idatatd">{{pool_description}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('network.healthTypeId')}}：</th>
              <td class="idatatd">
                <el-button @click="showHealthDetail()" type="text" size="small" v-if="!haveHealth">{{health_id}}</el-button>
                <span v-if="haveHealth">{{$t('network.nothing')}}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-card>
    <el-collapse v-model="activeName">
      <el-collapse-item :title="$t('network.respoolMember')" name="2" v-loading="loading">
        <div class="operation-panel margin-tb5">
          <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
          </operation-panel>
        </div>
        <el-table ref="resmembertable" :data="resmemberstableData" highlight-current-row stripe border style="width: 100%" row-key="id" :element-loading-text="$t('lang.loading')" @row-click="rowClick" @selection-change="handleSelectionChange">
          <el-table-column reserve-selection type="selection" width="55" align="center">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('address') >= 0" :label="$t('network.ipaddress')" prop="address" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('protocol_port') >= 0" prop="protocol_port" :label="$t('network.port')" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('weight') >= 0" prop="weight" :label="$t('network.weight')" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('operating_status') >= 0" prop="operating_status" :label="$t('network.operateStatus')" min-width="100">
            <template slot-scope="scope">
              <el-tag :type="statusTagRender(scope.row.operating_status)">
                <span v-html="operatingStatusRender(scope.row.operating_status)"></span>
              </el-tag>
            </template>
          </el-table-column>
          <!--<el-table-column v-if="columnsChecked.indexOf('provisioning_status') >= 0" prop="provisioning_status" :label="$t('network.configStatus')" min-width="100">
            <template slot-scope="scope">
              <el-tag :type="statusTagRender(scope.row.provisioning_status)">
                <span v-html="provisioningStatusRender(scope.row.provisioning_status)"></span>
              </el-tag>
            </template>
          </el-table-column>-->
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
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
              <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
            </el-col>
          </el-row>
        </div>
      </el-collapse-item>
    </el-collapse>
    <add-member v-if="addFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow" :balancerId="balancerId" :memberInfo="totalData" :poolsId="pools_id" :projectId="projectId"></add-member>
    <update-weight v-if="editFlag" @handleEditShow="handleEditShow" @handleCancelShow="handleCancelShow" :weightInfo="weightInfo" :poolsId="pools_id" :poolsName="pools_name"></update-weight>
    <edit-pool v-if="editpoolFlag" @handleEditPoolShow="handleEditPoolShow" @handleCancelShow="handleCancelShow" :poolInfo="poolsInfo"></edit-pool>
    <add-healthmonitor v-if="addHealthFlag" @handleAddHealthShow="handleAddHealthShow" @handleCancelShow="handleCancelShow" :poolsId="pools_id" :poolsName="pools_name" :projectId="projectId"></add-healthmonitor>
  </div>
</template>
<script type="text/javascript">
import AddMember from './EditStepFour';
import UpdateWeight from './UpdateWeight';
import EditPool from './EditStepThree';
import AddHealthmonitor from './AddHealthMonitor';
export default {
  components: {
    AddMember, UpdateWeight, EditPool, AddHealthmonitor
  },
  data() {
    return {
      columnsChecked: ['address', 'protocol_port', 'weight', 'operating_status'],
      resmemberstableData: [],
      totalData: [],
      balancerId: this.$route.params.balanceId,
      loading: true,
      loadingUp: false,
      multipleSelection: [],
      addFlag: false,
      editFlag: false,
      editpoolFlag: false,
      addHealthFlag: false,
      isdeteleDisabled: false,
      haveHealth: false,
      cookieName: "",
      isHealthDisabled: false,
      activeName: ["2"],
      pools_name: "",
      pool_description: "",
      pools_id: "",
      projectId: "",
      pools_protocol: "",
      lb_algorithm: "",
      session_persistence: "",
      pools_admin_state_up: "",
      health_id: "",
      poolsInfo: null,
      weightInfo: null,
      columns: [{
        prop: "address",
        label: Vue.t('network.ipaddress')
      }, {
        prop: "protocol_port",
        label: Vue.t('network.port')
      }, {
        prop: "weight",
        label: Vue.t('network.weight')
      }, {
        prop: "operating_status",
        label: Vue.t('network.operateStatus')
      }],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.addremovepoolmember'),
        showflg: !["PENDING_UPDATE", "PENDING_DELETE", "PENDING_CREATE"].includes(this.$cookie.get("lbcommon")),
        readOnly: true,
        handler: function (selectRows) {
          this.addFlag = true;
        }.bind(this)
      }, {
        icon: "fa-edit",
        name: Vue.t('network.updateWeight'),
        showflg: true,
        multi: false,
        enable:function(rowData) {
          if (["PENDING_UPDATE", "PENDING_DELETE", "PENDING_CREATE"].includes(this.$cookie.get("lbcommon"))) {
            return false;
          } else {
            return true;
          }
        }.bind(this),
        handler: function (selectRows) {
          let row = selectRows[0];
          this.weightInfo = row;
          this.editFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t("network.delete"),
        showflg: true,
        multi: true,
        enable: function(rowData) {
          if (rowData["provisioning_status"] == "PENDING_UPDATE" || ["PENDING_UPDATE", "PENDING_DELETE", "PENDING_CREATE"].includes(this.$cookie.get("lbcommon"))) {
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
          }
        }.bind(this),
        handler: function (selectRows) {
          let self = this;
          self.$prompt(Vue.t("network.confirmDelete"), Vue.t("network.attention"),
            {
              confirmButtonText: Vue.t("lang.confirm"),
              cancelButtonText: Vue.t("lang.cancel"),
              inputPattern: /^YES$|^NO$/i,
              inputValue: "NO",
              customClass: "promptConfirmDel",
              inputErrorMessage: Vue.t("lang.onlyAcceptYesOrNo"),
              closeOnClickModal: false
            }
          ).then(async ({ value }) => {
            if ("yes" == value.toLowerCase()) {
              // row["provisioning_status"] = "PENDING_UPDATE";
              self.deleteMember(selectRows, self.pools_id);
              // self.$ajax({
              //   type: "DELETE",
              //   url: "api/octavia/v2.0/lbaas/pools/" + self.pools_id + "/members/" + row.id,
              //   data: {},
              //   errorKey: "NeutronError",
              //   log: {
              //     description: {
              //       en: "Remove Pool Member:(IP,PORT)=(" + row.address + "，" + row.protocol_port + ")",
              //       zh_cn: "移除资源池成员：（IP，PORT）=（" + row.address + "，" + row.protocol_port + "）"
              //     },
              //     target: Vue.logTarget.balance
              //   },
              //   successFun: function () {
              //     self.$message(Vue.t("network.deleteSendSuccess"));
              //     setTimeout(() => {
              //       self.onRefresh();
              //     }, 3000);
              //   }
              // });
            }
          }).catch(() => {
            self.onRefresh();
          });
        }.bind(this)
      }]
    }
  },
  mounted() {
    let self = this;
    Promise.all([self.getsubnetList()]).then(function (result) {
      self.getPoolsDetail();
    });
  },
  methods: {
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
      } else if (status === "ERROR") {
        return "danger";
      } else if (status === "ONLINE") {
        return "success";
      } else if (status === "OFFLINE") {
        return "info";
      } else {
        return "info";
      }
    },
    //操作状态转换
    operatingStatusRender(value) {
      if (value === "ONLINE") {
        return Vue.t("network.online");
      } else if (value === "OFFLINE") {
        return Vue.t("network.offline");
      } else if (value === "ERROR") {
        return Vue.t("lang.ERROR");
      } else if (value === "DEGRADED") {
        return Vue.t('network.degrded');
      } else {
        return value;
      }
    },
    //配置状态转换
/*    provisioningStatusRender(value) {
      if (value === "ACTIVE") {
        return Vue.t("lang.ACTIVE");
      } else if (
        value === "PENDING_UPDATE" ||
        value === "PENDING_DELETE" ||
        value === "PENDING_CREATE"
      ) {
        return Vue.t("network.operating");
      } else if (value === "deleting") {
        return Vue.t("network.operating");
      } else if (value === "ERROR") {
        return Vue.t("lang.DOWN");
      } else if (value === "INACTIVE") {
        return Vue.t("lang.DOWN");
      } else {
        return value;
      }
    },*/
    //获取资源池信息
    async getPoolsDetail() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/octavia/v2.0/lbaas/pools/" + self.$route.params.poolId,
          complete: function (XMLHttpRequest, textStatus) {
          },
          errorKey: "NeutronError",
          errFun() {
            let balanceId = self.$route.params.balanceId;
            let monitorId = self.$route.params.monitorId;
            self.$router.push({
              path: '/net/balanceView/balanceMonitor/' + balanceId + "/balanceRespool/" + monitorId
            });
          }
        });
        let poolsInfo = result['pool'];
        self.poolsInfo = poolsInfo;
        self.projectId = poolsInfo["tenant_id"];
        self.pools_id = poolsInfo["id"];
        self.pools_name = poolsInfo["name"];
        self.pool_description = poolsInfo["description"];
        self.pools_protocol = poolsInfo['protocol'];
        if (poolsInfo['lb_algorithm'] === "LEAST_CONNECTIONS") {
          self.lb_algorithm = Vue.t('network.leastconnect');
        } else if (poolsInfo['lb_algorithm'] === "ROUND_ROBIN") {
          self.lb_algorithm = Vue.t('network.roundRobin');
        } else if (poolsInfo['lb_algorithm'] === "SOURCE_IP") {
          self.lb_algorithm = Vue.t('network.sourceIP');
        } else {
          self.lb_algorithm = poolsInfo['lb_algorithm'];
        }
        if (poolsInfo['session_persistence'] == null || poolsInfo['session_persistence'] == "") {
          self.session_persistence = Vue.t('network.nothing');
        } else {
          self.session_persistence = poolsInfo['session_persistence']["type"];
          if (self.session_persistence == "APP_COOKIE") {
            self.cookieName = poolsInfo['session_persistence']["cookie_name"]
          } else {
            self.cookieName = "";
          }
        }
        self.health_id = poolsInfo['healthmonitor_id'];
        if (poolsInfo['healthmonitor_id'] == null) {
          self.haveHealth = true;
        } else {
          self.haveHealth = false;
        }
        self.getPoolsMembersInfo(poolsInfo["id"]);
      } catch (res) {
      }
    },
    //获取资源池成员信息
    async getPoolsMembersInfo(poolsId) {
      let self = this;
      try {
        self.loading = true;
        let result = await self.$ajax({
          type: 'get',
          url: "api/octavia/v2.0/lbaas/pools/" + poolsId + "/members",
          complete: function (XMLHttpRequest, textStatus) {
            self.loading = false;
          }
        });
        self.totalData = result['members'];
      } catch (res) {
      }
    },
    getCurrentData(param) {
      this.resmemberstableData = param;
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.resmembertable.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    onRefresh() {
      this.getPoolsMembersInfo(this.pools_id);
    },
    onRefreshPool() {
      this.getPoolsDetail();
    },
    rowClick(row) {
      this.$refs.resmembertable.toggleRowSelection(row);
    },
    handleAddShow() {
      this.addFlag = false;
      this.getPoolsMembersInfo(this.pools_id);
    },
    handleEditShow() {
      this.editFlag = false;
      this.getPoolsMembersInfo(this.pools_id);
    },
    handleEditPoolShow() {
      this.editpoolFlag = false;
      this.getPoolsDetail();
    },
    handleCancelShow() {
      this.addFlag = false;
      this.editFlag = false;
      this.editpoolFlag = false;
      this.addHealthFlag = false;
      this.isHealthDisabled = false;
    },
    showHealthDetail() {
      let loadbalancerId = this.$route.params.balanceId;
      let monitorId = this.$route.params.monitorId;
      let poolId = this.$route.params.poolId;
      let healthId = this.health_id;
      this.$router.push({
        path: '/net/balanceView/balanceMonitor/' + loadbalancerId + "/balanceRespool/" + monitorId + "/balanceHealth/" + poolId + "/balanceHealthinfo/" + healthId
      });
    },
    backToPreStep() {
      this.$router.push({
        path: '/net/balanceView/balanceMonitor/' + this.$route.params.balanceId + "/balanceRespool/" + this.$route.params.monitorId
      });
    },
    editpoolAction() {
      this.editpoolFlag = true;
    },
    deletepoolAction() {
      let self = this;
      self.$confirm(Vue.t('network.deletepoolnote'), Vue.t('network.attention'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        type: "warning",
        closeOnClickModal: false,
        callback: (action, instance) => {
          if (action === "confirm") {
            self.loadingUp = true;
            self.isdeteleDisabled = true;
            let balanceId = self.$route.params.balanceId;
            let monitorId = self.$route.params.monitorId;
            let poolId = this.$route.params.poolId;
            self.$ajax({
              type: "DELETE",
              url: "api/octavia/v2.0/lbaas/pools/" + poolId,
              data: {},
              successMsg: Vue.t('network.deleteSuccess'),
              errorKey: "NeutronError",
              success: function () {
                // 退回到监听器页面
                self.isdeteleDisabled = false;
                self.loadingUp = false;
                self.$router.push({
                  path: '/net/balanceView/balanceMonitor/' + balanceId + "/balanceRespool/" + monitorId
                });
              },
              errFun() {
                self.isdeteleDisabled = false;
                self.loadingUp = false;
                self.$router.push({
                  path: '/net/balanceView/balanceMonitor/' + balanceId + "/balanceRespool/" + monitorId
                });
              },
              log: {
                description: {
                  en: "Delete Pool:" + self.pools_name,
                  zh_cn: "删除资源池:" + self.pools_name
                },
                target: Vue.logTarget.balance
              }
            });
          }
        }
      });
    },
    addHealthMonitorClick() {
      this.addHealthFlag = true;
      this.isHealthDisabled = true;
    },
    handleAddHealthShow() {
      this.addHealthFlag = false;
      this.isHealthDisabled = false;
      this.getPoolsDetail();
    },
    //删除资源池成员
    deleteMember(memList, poolId) {
      let self = this;
      if (memList.length == 0) {
        self.loading = false;
        return;
      }
      let oldDt = memList.shift();
      self.loading = true;
      self.$ajax({
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
            self.loading = false;
            self.onRefresh();
          } else {
            clearInterval(self.intervalDel);
            self.intervalDel = setInterval(() => {
              self.searchBalanceStatusForDel(memList, poolId);
            }, 5000);
          }
        },
        errFun: function() {
          self.onRefresh();
        }
      });
    },
    searchBalanceStatusForDel(memberData, poolId) {
      let self = this;
      let result = self.$ajax({
        type: "get",
        url: "api/octavia/v2.0/lbaas/loadbalancers/" + self.$route.params.balanceId,
        errorKey: "NeutronError",
        success: function (result) {
          let loadbalancer = result["loadbalancer"];
          if (loadbalancer["provisioning_status"] != "ERROR") {
            if (loadbalancer["provisioning_status"] == "ACTIVE") {
              clearInterval(self.intervalDel);
              self.deleteMember(memberData, poolId);
            }
          } else {
            self.loading = false;
            self.onRefresh();
            clearInterval(self.intervalDel);
          }
        }
      });
    },
    async getsubnetList() {
      try {
        let resultData = await this.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/subnets"
        });
        let sublist1 = [];
        let sublist = resultData["subnets"];
        for (let i = 0; i < sublist.length; i++) {
          let subname = sublist[i];
          subname["name"] = subname["cidr"] + "(" + subname["name"] + ")";
          if (subname["ip_version"] == 4) {
            sublist1.push(subname);
          }
        }
        Vue.subnetsList = sublist1;
      } catch (res) {
        console.log('获取子网失败!');
      }
    }
  }
}
</script>
<style scoped>
.idatath {
  width: 150px;
}
</style>
