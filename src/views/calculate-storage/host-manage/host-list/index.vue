<template>
  <div>
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus" :operateMore="operateMore"></operation-panel>
    </div>
    <div class="divider clearfix"></div>
      <el-table ref="umTable" :data="tableData" v-loading="loading" highlight-current-row stripe border style="width: 100%" row-key="id" @row-click="rowClick" @selection-change="handleSelectionChange">
        <el-table-column reserve-selection type="selection" width="55" align="center"></el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="hypervisor_hostname" :label="$t('lang.name')" min-width="110">
        <template slot-scope="scope">
          <el-button @click="hostDetail(scope.row)" type="text" size="small">{{scope.row.hypervisor_hostname}}</el-button>
        </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('host_ip') >= 0" prop="host_ip" :label="$t('IP')">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('type') >= 0" prop="hypervisor_type" :label="$t('lang.type')">
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="state" :label="$t('calcStorLang.hostEnabledState')">
          <template slot-scope="scope">
            <span v-html="statusRender(scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('cpu') >= 0" :render-header="renderCPUTooltipHeader" prop="vcpus" :label="'CPU' + $t('calcStorLang.usedTotal')" min-width="80">
          <template slot-scope="scope">
            <span>{{ cpuRender(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('real_cpu') >= 0" prop="vcpus" :label="$t('calcStorLang.REAL_CPU')" min-width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.vcpus }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('memory') >= 0" :render-header="renderMemoryTooltipHeader" prop="ram" :label="$t('calcStorLang.memory') + $t('calcStorLang.usedTotal')" min-width="80">
          <template slot-scope="scope">
            <span>{{ memRender(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('real_memory') >= 0" prop="ram" :label="$t('calcStorLang.REAL_RAM')" min-width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.memory_mb * 1024 * 1024 | fileSize }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          v-if="columnsChecked.indexOf('cpu_usage') >= 0"
          prop="cpu_usage"
          :label="$t('monitor.CPU_USAGE')"
          min-width="120"
        >
          <template v-slot="scope">
            <el-progress
              :show-text="true"
              :percentage="scope.row.cpu_usage.value"
              :class="scope.row.cpu_usage.class"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columnsChecked.indexOf('mem_usage') >= 0"
          prop="mem_usage"
          :label="$t('monitor.MEM_USAGE')"
          min-width="120"
        >
          <template v-slot="scope">
            <el-progress
              :show-text="true"
              :percentage="scope.row.mem_usage.value"
              :class="scope.row.mem_usage.class"
            />
          </template>
        </el-table-column> -->
      </el-table>
      <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc('lang.item', multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData" :objStorFlag="true"></page>
        </el-col>
      </el-row>
    </div>
    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="hostDetailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
          <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t('lang.back')}}</el-button>
          </div>
          <div>
            <host-detail :hostname="hostname" :info="info"></host-detail>
          </div>
        </panel>
      </div>
    </transition>
    <bmc-ip v-if="bmcflg" @handlebmcFlag="handlebmcFlag" :selectedRow="selectedRow" @onRefresh="onRefresh"></bmc-ip>
    <batch-bmc-set v-if="batchBMCSetDialog.visible" :hosts="batchBMCSetDialog.hosts" @close="batchBMCSetDialog.visible = false" />
  </div>
</template>
<script>
import { utils } from "../../../intelligentMonitoring/public/utils";
import HostDetail from './HostDetail';
import BmcIp from '../BmcIp';
import BatchBMCSet from './BatchBMCSet';
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'domain',
  components: { HostDetail, BmcIp, 'batch-bmc-set': BatchBMCSet },
  data() {
    return {
      bmcflg:false,
      loading: true,
      operateMore:true,
      currentPage: 1,
      total: 0,
      pageSizes: [10, 20, 30],
      pageSize: 10,
      totalData:[],
      columns: [{
        prop: "name",
        label: Vue.t('lang.name')
      }, {
        prop: "host_ip",
        label: Vue.t('IP')
      }, {
        prop: "type",
        label: Vue.t('lang.type')
      }, {
        prop: "status",
        label: Vue.t('calcStorLang.hostEnabledState')
      }, {
        prop: "cpu",
        label: 'CPU' + Vue.t('calcStorLang.usedTotal')
      }, {
        prop: "real_cpu",
        label: Vue.t('calcStorLang.REAL_CPU')
      }, {
        prop: "memory",
        label: Vue.t('calcStorLang.memory') + Vue.t('calcStorLang.usedTotal')
      }, {
        prop: "real_cpu",
        label: Vue.t('calcStorLang.REAL_RAM')
      // }, {
      //   prop: 'cpu_usage',
      //   label: Vue.t('monitor.CPU_USAGE')
      // }, {
      //   prop: 'mem_usage',
      //   label: Vue.t('monitor.MEM_USAGE')
      }],
      columnsChecked: ['name', 'host_ip', 'type', 'status', 'cpu', 'memory', 'real_cpu', 'real_cpu'],
      tableData: [],
      selectedRow:[],
      hostname: "",
      info:{},
      multipleSelection: [],
      operFlag: false,
      domainId: '',
      formatFileSize:formatFileSize,
      hostDetailFlag: false,
      selectTblRow: '',
      batchBMCSetDialog: {
        hosts: [],
        visible: false
      },
      operationMenus: [{
        icon: "fa-play",
        name: Vue.t('base.start'),
        showflg: true,
        enable(rowData) {
          return true
        },
        handler: async function(selectRows) {
          var self = this;
          var body = { "poweron": null };
          body = JSON.stringify(body);
          self.$sequence({
            type: 'post',
            data: body,
            url: 'api/nova/v2.1/os-hypervisor-ipmis/' + selectRows[0].hypervisor_hostname + '/action',
            params: selectRows,
            confirmMsg: Vue.t('calcStorLang.openHostConfirm'),
            log: {
              description: {
                en: "Start Host：" + selectRows[0].hypervisor_hostname,
                zh_cn: "开启主机：" + selectRows[0].hypervisor_hostname
              },
              target: Vue.logTarget.hostmanage
            },
            successMsg: Vue.t('calcStorLang.openSendSuccess')
          }).then((data) => {
          }).catch((err) => {});
        }.bind(this)
      }, {
        icon: "fa-stop",
        name: Vue.t('base.shutdown'),
        showflg: true,
        enable(rowData) {
          return true
        },
        handler: async function(selectRows) {
          var self = this;
          var body = { "poweroff": null };
          body = JSON.stringify(body);
          self.$sequence({
            type: 'post',
            data: body,
            url: 'api/nova/v2.1/os-hypervisor-ipmis/' + selectRows[0].hypervisor_hostname + '/action',
            params: selectRows,
            confirmMsg:Vue.t('calcStorLang.closeHostConfirm'),
            log: {
              description: {
                en: "Shutdown Host" + selectRows[0].hypervisor_hostname,
                zh_cn: "关闭主机" + selectRows[0].hypervisor_hostname
              },
              target: Vue.logTarget.hostmanage
            },
            successMsg: Vue.t('calcStorLang.closeSendSuccess')
          }).then((data) => {
          }).catch((err) => {});
        }.bind(this)
      }, {
        icon: "fa-refresh",
        name: Vue.t('calcStorLang.instLogReboot'),
        showflg: true,
        enable(rowData) {
          return true
        },
        handler: async function(selectRows) {
          var self = this;
          var body = { "reboot": null };
          body = JSON.stringify(body);
          self.$sequence({
            type: 'post',
            data: body,
            url: 'api/nova/v2.1/os-hypervisor-ipmis/' + selectRows[0].hypervisor_hostname + '/action',
            params: selectRows,
            confirmMsg:Vue.t('calcStorLang.restartHostConfirm'),
            log: {
              description: {
                en: "Restart Host" + selectRows[0].hypervisor_hostname,
                zh_cn: "重启主机" + selectRows[0].hypervisor_hostname
              },
              target: Vue.logTarget.hostmanage
            },
            successMsg: Vue.t('calcStorLang.restartSendSuccess')
          }).then((data) => {
          }).catch((err) => {});
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: Vue.t('calcStorLang.BMC'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          if (selectRows.length === 1) {
            this.selectedRow = selectRows[0];
            this.bmcflg = true;
          } else {
            this.batchBMCSetDialog.hosts = selectRows;
            this.batchBMCSetDialog.visible = true;
          }
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
          self.$refs.umTable.clearSelection();
          self.multipleSelection = [];
          self.onRefresh();
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: Vue.t('calcStorLang.openHostService'),
        operateMore: true,
        showflg: true,
        enable(rowData) {
          if (rowData.status != "enabled") {
            return true;
          } else {
            return false;
          }
        },
        handler: function(selectRows) {
          this.openServiceOperate(selectRows[0]);
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: Vue.t('calcStorLang.closeHostService'),
        operateMore: true,
        showflg: true,
        enable(rowData) {
          if (rowData.status != "enabled") {
            return false;
          } else {
            return true;
          }
        },
        handler: function(selectRows) {
          this.closeServiceOperate(selectRows[0]);
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: Vue.t('calcStorLang.enterMaintenanceMode'),
        operateMore: true,
        showflg: true,
        enable(rowData) {
          if (rowData.status == "enabled") {
            return true;
          }
          return false;
        },
        handler: function(selectRows) {
          this.enterMaintenanceMode(selectRows[0]);
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: Vue.t('calcStorLang.quitMaintenanceMode'),
        operateMore: true,
        showflg: true,
        enable(rowData) {
          if (rowData.status == "disabled") {
            return true;
          }
          return false;
        },
        handler: function(selectRows) {
          this.quitMaintenanceMode(selectRows[0]);
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
          }
        },
        validatedParams: {}
      }
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    renderCPUTooltipHeader(h, { column, $index }) {
      return h('div', [
        h('span', column.label + ' '),
        h('el-tooltip', {
          attrs: {
            placement: 'top',
            trigger: 'hover',
            content: Vue.t('calcStorLang.HOST_LIST_CPU_HEADER_TIPS')
          }
        }, [
          h('i', {
            class: {
              'el-icon-fa-question-circle': true
            }
          })
        ])
      ]);
    },
    renderMemoryTooltipHeader(h, { column, $index }) {
      return h('div', [
        h('span', column.label + ' '),
        h('el-tooltip', {
          attrs: {
            placement: 'top',
            trigger: 'hover',
            content: Vue.t('calcStorLang.HOST_LIST_MEMORY_HEADER_TIPS')
          }
        }, [
          h('i', {
            class: {
              'el-icon-fa-question-circle': true
            }
          })
        ])
      ]);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    async getData() {
      var self = this;
      let name = 'name' in self.searchBar.validatedParams ? self.searchBar.validatedParams.name.toLowerCase() : '';
      let data = [];
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-hypervisors/detail'
        });
        self.loading = false;
        var dataResult = result['hypervisors'];
        var finalResult = [];
        for (let i = 0; i < dataResult.length; i++) {
          dataResult[i]['cpu_usage'] = {
            value: 0,
            class: ''
          };
          dataResult[i]['mem_usage'] = {
            value: 0,
            class: ''
          };
          if (dataResult[i]['hypervisor_type'] != 'ironic') {
            if (name === "") {
              finalResult.push(dataResult[i]);
            } else {
              if (result['hypervisors'][i].hypervisor_hostname.toLowerCase().indexOf(name) >= 0) {
                finalResult.push(result['hypervisors'][i]);
              }
            }
          }
        }
        self.tableData = finalResult;
        self.total = finalResult.length;
        self.totalData = finalResult;
        this.loadCetusData();
        self.loading = false;
      } catch (res) {
        self.loading = false;
        self.$message.error(Vue.t("calcStorLang.getError"));
      }
    },
    async loadCetusData() {
      const $this = this;
      const res = await $this.$ajax({
        type: 'get',
        url: 'api/pluto/v1/monitor/sub_resources?subclass_id=hs&page_size=999999'
      });
      $this.totalData.forEach(item => {
        let cetusHost = res.resource_list.find(c => c.collect_host === item.hypervisor_hostname);
        if (cetusHost) {
          item.cpu_usage = utils.getProgressPercentageStatus(cetusHost.cpu_usage);
          item.mem_usage = utils.getProgressPercentageStatus(cetusHost.mem_usage);
        }
      });
    },
    hostDetail(row) {
      this.hostDetailFlag = true;
      this.hostname = row["hypervisor_hostname"];
      this.info = row;
    },
    onBack() {
      this.hostDetailFlag = false;
    },
    onRefresh() {
      this.getData();
      this.$refs.umTable.clearSelection();
    },
    rowClick(row) {
      this.selectTblRow = row;
    },
    serviceConfigOperate(value, row) {
      var self = this;
      if ("openservice" == value) {
        self.openServiceOperate(self.selectTblRow);
      } else if ("closeservice" == value) {
        self.closeServiceOperate(self.selectTblRow);
      }
    },
    async openServiceOperate(row) {
      var self = this;
      self.$confirm(Vue.t('calcStorLang.OPEN_SERVICE_CONFIRM'), Vue.t('calcStorLang.confirm'), {
        type: 'warning'
      }).then(async() => {
        var body = { "host": row.service['host'], "binary":'nova-compute' };
        body = JSON.stringify(body);
        try {
          let result = await self.$ajax({
            type: 'put',
            url: 'api/nova/v2.1/os-services/enable',
            data: body,
            showErrMsg: true,
            log: {
              description: {
                en: "Open service:" + row['service'].host,
                zh_cn: "开启服务:" + row['service'].host
              },
              target: Vue.logTarget.hostmanage
            },
            successFun: function() {
              self.$message(Vue.t('calcStorLang.openHostServiceSuccess'));
              self.onRefresh();
            }
          });
        } catch (e) {
          __DEV__ && console.error(e);
        }
      });
    },
    async closeServiceOperate(row) {
      var self = this;
      self.$confirm(Vue.t('calcStorLang.CLOSE_SERVICE_CONFIRM'), Vue.t('calcStorLang.confirm'), {
        type: 'warning'
      }).then(async() => {
        var body = { "host": row.service['host'], "binary":'nova-compute' };
        body = JSON.stringify(body);
        try {
          let result = await self.$ajax({
          type: 'put',
            url: 'api/nova/v2.1/os-services/disable',
            data: body,
            showErrMsg: true,
            log: {
              description: {
                en: "Close service:" + row['service'].host,
                zh_cn: "关闭服务:" + row['service'].host
              },
              key: "name",
              target: Vue.logTarget.hostmanage
            },
            successFun: function() {
              self.$message(Vue.t('calcStorLang.closeHostServiceSuccess'));
              self.onRefresh();
            }
          });
        } catch (e) {
          __DEV__ && console.error(e);
        }
      });
    },
    async enterMaintenanceMode(row) {
      var self = this;
      self.$confirm(Vue.t('calcStorLang.ENTER_MAINTENANCE_MODE_CONFIRM'), Vue.t('calcStorLang.confirm'), {
        type: 'warning'
      }).then(async() => {
        try {
          let result = await self.$ajax({
            type: 'get',
            url: 'api/nova/v2.1/os-hypervisors/' + row.hypervisor_hostname + '/set_hosts_maintenance',
            params: row,
            showErrMsg: true,
            successFun: function() {
              self.$message(Vue.t("calcStorLang.enterMaintenanceMode") + " "+ Vue.t("calcStorLang.sendSuccess"));
              self.onRefresh();
            },
            log: {
              description: {
                en: "Enter maintenance:" + row.hypervisor_hostname,
                zh_cn: "主机管理:" + row.hypervisor_hostname + "进入维护模式"
              },
              target: Vue.logTarget.hostmanage
            }
          });
        } catch (e) {
          __DEV__ && console.error(e);
        }
      });
    },
    quitMaintenanceMode(row) {
      var self = this;
      self.$confirm(Vue.t('calcStorLang.QUIT_MAINTENANCE_MODE_CONFIRM'), Vue.t('calcStorLang.confirm'), {
        type: 'warning'
      }).then(async() => {
        try {
          let result = await self.$ajax({
            type: 'get',
            url: 'api/nova/v2.1/os-hypervisors/' + row.hypervisor_hostname + '/unset_hosts_maintenance',
            params: row,
            showErrMsg: true,
            successFun: function() {
              self.$message(Vue.t("calcStorLang.quitMaintenanceMode") + " "+ Vue.t("calcStorLang.sendSuccess"));
              self.onRefresh();
            },
            log: {
              description: {
                en: "Exist maintenance:" + row.hypervisor_hostname,
                zh_cn: "主机管理:" + row.hypervisor_hostname + "退出维护模式"
              },
              // key: "name",
              target: Vue.logTarget.hostmanage
            }
          });
        } catch (e) {
          __DEV__ && console.error(e);
        }
      });
    },
    operateFlag(row) {
      var flag = true;
      if ((row['status'] + "") != "enabled") {
        flag = false;
      }
      return flag;
    },
    cpuRender(row) {
      return `${row['vcpus_used']}/${row['vcpus']*(row['cpu_allocation_ratio'] || 1)}`;
    },
    memRender(row) {
      return `${this.formatFileSize(row['memory_mb_used'], 'MB')}/${this.formatFileSize(row['memory_mb']*(row['ram_allocation_ratio'] || 1), 'MB')}`;
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handlebmcFlag() {
      this.bmcflg = false;
    },
    statusRender(row) {
      if ( (row['status'] + "") == "enabled") {
        return Vue.t('lang.activation');
      } else {
        return Vue.t('calcStorLang.unActivation');
      }
    },
    handleSearch(params) {
      var self = this;
      this.searchBar.validatedParams = params;
      self.getData();
      self.$refs.umTable.clearSelection();
    }
  }
}
</script>
<style scoped>
</style>