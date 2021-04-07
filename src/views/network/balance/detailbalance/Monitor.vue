<template>
  <div>
    <el-row>
      <el-col :spsn="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{$t('network.MONITOR_LIST')}}</span>
            <el-button size="small" type="text" icon="fa-refresh" @click="onRefreshBalance"></el-button>
            <el-button style="float:right;" size="small" @click="backToPreStep">
              <span style="font-weight:bold;">{{$t('lang.back')}}</span>
            </el-button>
          </div>
          <div v-loading="loading" class="table_panel">
            <el-form :inline="true" class="form-inline">
              <el-form-item :label="$t('lang.name')">
                <el-input size="small" v-model="query_name"></el-input>
              </el-form-item>
              <el-form-item :label="$t('network.protocol')">
                <el-select v-model="query_protocol" size="small" clearable>
                  <!-- <el-option label="HTTP" value="HTTP"></el-option>
                  <el-option label="HTTPS" value="HTTPS"></el-option>
                  <el-option label="TCP" value="TCP"></el-option>
                  <el-option label="UDP" value="UDP"></el-option>
                  <el-option label="TERMINATED_HTTPS" value="TERMINATED_HTTPS"></el-option> -->
                  <el-option v-for="(v,i) in protocol" :key="i" :label="v" :value="v"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon='search' size="small" @click="queryClick()">{{$t('lang.query')}}</el-button>
              </el-form-item>
            </el-form>
            <div class="divider clearfix"></div>
            <div class="operation-panel margin-tb5" @mousedown="detailMouseLeave">
              <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
              </operation-panel>
            </div>
            <div class="divider clearfix"></div>
            <el-table ref="monitorTable" :data="monitortableData" highlight-current-row stripe border style="width: 100%" :element-loading-text="$t('lang.loading')" row-key="id" :default-sort="{prop: 'name'}" @row-click="rowClick" @selection-change="handleSelectionChange" @sort-change="sortChange">
              <el-table-column reserve-selection type="selection" width="55">
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="100" sortable="custom">
                <template slot-scope="scope">
                  <el-button @click.stop="showDetail(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
                </template>
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('protocol') >= 0" prop="protocol" :label="$t('network.protocol')" min-width="50" sortable="custom">
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('protocol_port') >= 0" prop="protocol_port" :label="$t('network.port')" min-width="50">
              </el-table-column>
              <el-table-column v-if="columnsChecked.indexOf('default_pool_id') >= 0" :label="$t('network.respoolmo')" prop="default_pool_id" min-width="80">
                <template slot-scope="scope">
                  <el-button @click="goToPool(scope.row.default_pool_id)" type="text" size="small">{{scope.row.default_pool_id}}</el-button>
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
                  <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>

      </el-col>
    </el-row>
    <add-monitor v-if="addFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow" :balanceId="loadbalancerId" :projectId="loadbalancer_projectid" :totallistenerData="totallistenerData"></add-monitor>
    <edit-monitor v-if="editFlag" @handleEditShow="handleEditShow" @handleCancelShow="handleCancelShow" :listener="listener"></edit-monitor>
    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="lisenterDetailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t("lang.back")}}</el-button>
          </div>
          <div>
            <listener-detail :monitorId="monitorId" :loadbalancerId="loadbalancerId"></listener-detail>
          </div>
        </panel>
      </div>
    </transition>
  </div>
</template>
<script type="text/javascript">
import AddMonitor from "../AddMonitor";
import EditMonitor from "../EditStepTwo";
import ListenerDetail from "../ListenerDetail";
import protocol from 'views/network/common/protocol.json';

export default {
  components: {
    AddMonitor,
    EditMonitor,
    ListenerDetail
  },
  props: {
    monitorIdFromPool: {
      type: String,
      default: ""
    },
    refreshCount: {
      type: Number,
      default: ""
    },
    poolJumpFlag: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      protocol,
      delFlag: false,
      intervalDel: "",
      monitorId: "",
      loadbalancerId: this.$route.params.balanceId,
      lisenterDetailFlag: false,
      loadbalancer_projectid: this.$route.params.projectId,
      sortObj: {
        sortOrder: "ascending",
        sortField: "name"
      },
      listener: null,
      query_name: "",
      query_protocol: "",
      columnsChecked: [
        "name",
        "description",
        "protocol",
        "operating_status",
        "provisioning_status",
        "protocol_port",
        "admin_state_up",
        "default_pool_id"
      ],
      valid: "",
      monitortableData: [],
      totalData: [],
      totallistenerData: [],
      multipleSelection: [],
      loading: false,
      addFlag: false,
      editFlag: false,
      activeName: ["2"],
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
          prop: "protocol_port",
          label: Vue.t("network.port")
        },
        {
          prop: "default_pool_id",
          label: Vue.t("network.respoolmo")
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
      operationMenus: [
        {
          icon: "fa-plus",
          name: Vue.t("network.create"),
          showflg: true,
          readOnly: true,
          handler: function(selectRows) {
            this.addFlag = true;
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
            self.listener = row;
            self.editFlag = true;
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: Vue.t("network.delete"),
          showflg: true,
          multi: true,
          enable(rowData) {
            /*if (rowData["provisioning_status"] == "PENDING_UPDATE" || rowData["provisioning_status"] == "PENDING_CREATE" || rowData["provisioning_status"] == "PENDING_DELETE") {
              return false;
            } else {
              return true;
            }*/
          },
          handler: function(selectRows) {
            let self = this;
            let row = selectRows[0];
            self.$confirm(
              Vue.t("network.monitorhaspool"),
              Vue.t("network.attention"),
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
                    this.$refs.monitorTable.clearSelection();
                    self.multipleSelection = [];
                    self.loading = true;
                    try {
                      await self.delMonitor(selectRows);
                      //self.loading = false;
                    } catch (e) {
                      self.loading = false;
                    }
                  }
                }
              }
            );
          }.bind(this)
        }
      ]
    };
  },
  watch: {
    refreshCount: {
      handler: function() {
        this.delFlag = false;
        this.getListenerInfo(this.loadbalancerId);
      }
    },
    columnsChecked: {
      handler: function(rows, oldVal) {
        this.columnsChecked = rows;
      },
      deep: true
    },
    monitortableData: {
      immediate: false,
      handler: function(list) {
        let self = this;
        self.reloading = false;
        if (list != null) {
          for (let t = 0; t < list.length; t++) {
            let obj = list[t];
            if (obj["provisioning_status"] == "PENDING_UPDATE" || obj["provisioning_status"] == "PENDING_CREATE" || obj["provisioning_status"] == "PENDING_DELETE") {
              self.reloading = true;
              break;
            }
          }
        }
        clearInterval(self.valid);
        if (self.reloading && !self._isDestroyed) {
          self.valid = setInterval(() => {
            self.getListenerInfo(this.loadbalancerId);
          }, 5000);
        }
      }
    }
  },
  mounted() {
    this.getListenerInfo(this.loadbalancerId);
  },
  methods: {
    detailMouseLeave() {
      this.lisenterDetailFlag = false;
    },
    async delMonitor(rows) {
      this.delFlag = true;
      let row = rows.shift();
      let self = this;
      try {
        await self.$ajax({
          type: "DELETE",
          url: "api/octavia/v2.0/lbaas/listeners/" + row["id"],
          data: {},
          //successMsg: Vue.t("network.deleteSendSuccess"),
          errorKey: "NeutronError",
          log: {
            description: {
              en: "Delete Monitor:" + row["name"],
              zh_cn: "删除监听器:" + row["name"]
            },
            target: Vue.logTarget.balance
          },
          successFun: function () {
            if (rows.length == 0) {
              self.getListenerInfo(self.loadbalancerId);
              clearInterval(self.intervalDel);
              self.loading = false;
            } else {
              clearInterval(self.intervalDel);
              self.intervalDel = setInterval(() => {
                self.delMonitor(rows);
              }, 5000);
            }
          },
          errFun: function() {
            if (rows.length == 0) {
              self.getListenerInfo(self.loadbalancerId);
              clearInterval(self.intervalDel);
              self.loading = false;
            } else {
              clearInterval(self.intervalDel);
              self.intervalDel = setInterval(() => {
                self.delMonitor(rows);
              }, 5000);
            }
          }
        });
      } catch (e) {
        self.loading = false;
      }
    },
    setCurrent() {
      let row;
      if (this.$refs.monitorTable) {
        this.$refs.monitorTable.clearSelection();
      }
      if (this.monitortableData.length) {
        for (let i = 0; i < this.monitortableData.length; i++) {
          if (this.monitortableData[i].id === this.monitorIdFromPool) {
            row = this.monitortableData[i];
            break;
          }
        }
        this.multipleSelection = [];
        if (row) {
          this.multipleSelection.push(row);
          this.$refs.monitorTable.toggleRowSelection(row, true);
          this.$refs.monitorTable.setCurrentRow(row, true);
        }
      }
    },
    goToPool(poolId) {
      this.lisenterDetailFlag = false;
      this.$emit('goToPool', [poolId, true]);
    },
    onBack() {
      this.lisenterDetailFlag = false;
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
    onRefreshBalance() {
      this.getListenerInfo(this.loadbalancerId);
    },
    //根据loadlbalanceId 获取监听器详情
    async getListenerInfo(loadbalancerId, name = "", protocol = "") {
      let self = this;
      self.loadbalancerId = self.loadbalancerId;
      try {
        let result = await self.$ajax({
          type: "get",
          url:
            "api/octavia/v2.0/lbaas/listeners?loadbalancer_id=" +
            loadbalancerId,
          complete: function(XMLHttpRequest, textStatus) {
          },
          error: "NeurtronError",
          errFun() {
          }
        });
        self.totalData = [];
        self.totallistenerData = [];
        self.totallistenerData = result["listeners"];
        if (name === "" && protocol === "") {
          self.totalData = result["listeners"];
        } else {
          let listeners = result["listeners"];
          for (let i = 0; i < listeners.length; i++) {
            let lis = listeners[i];
            if (name != "" && lis["name"].indexOf(name) < 0) {
              continue;
            }
            if (protocol != "" && protocol != lis["protocol"]) {
              continue;
            }
            self.totalData.push(lis);
          }
        }
        if (!self.poolJumpFlag) {
          self.$refs.monitorTable.clearSelection();
        }
        if (self.poolJumpFlag && !self.delFlag) {
          this.$nextTick(() => {
            self.setCurrent();
          })
        }
      } catch (res) {}
    },
    getCurrentData(param) {
      this.monitortableData = param;
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
    queryClick() {
      this.getListenerInfo(
        this.loadbalancerId,
        this.query_name,
        this.query_protocol
      );
    },
    handleSelectionChange(val) {
     /* val.forEach((row, index) => {
        if (index === val.length - 1) return;
        this.$refs.monitorTable.toggleRowSelection(row, false);
      });*/
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.monitorTable.toggleRowSelection(row);
    },
    handleAddShow() {
      this.addFlag = false;
      this.getListenerInfo(this.loadbalancerId);
    },
    handleEditShow() {
      this.editFlag = false;
      this.multipleSelection = [];
      this.$refs.monitorTable.clearSelection();
      this.getListenerInfo(this.loadbalancerId);
    },
    handleCancelShow() {
      this.addFlag = false;
      this.editFlag = false;
    },
    showDetail(row) {
      this.lisenterDetailFlag = true;
      this.monitorId = row["id"];
      this.loadbalancerId = this.$route.params.balanceId;
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
      this.getListenerInfo(this.loadbalancerId);
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
