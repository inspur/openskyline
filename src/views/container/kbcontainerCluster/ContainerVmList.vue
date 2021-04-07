<template>
  <div>
    <el-collapse v-model="activeNames" style="text-align:left">
      <el-collapse-item :title="$t('container.basicInfo')" name="1">
      <el-form ref="containerTemplateDetailForm" v-loading="loading" :model="containerTemplateDetailForm" label-width="170px" label-position="left" class="me-form" style="text-align:left;">
        <div class="table_panel">
          <table class="table table-content table-hover idatatable" border="1">
              <tbody>
              <tr class="odd">
                  <th class="idatath" style="width:20%">{{$t('container.clusterName')}}:</th>
                  <td class="idatatd" style="width:30%">{{containerTemplateDetailForm.name}}</td>
                  <th class="idatath" style="width:20%">{{$t('scalingService.clusterId')}}:</th>
                  <td class="idatatd" style="width:30%">{{containerTemplateDetailForm.uuid}}</td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('container.clusterState')}}:</th>
                <td class="idatatd">
                <el-tag :type="this.statusTagRender(containerTemplateDetailForm.status)">
                    {{this.statusRender(containerTemplateDetailForm.status)}}
                </el-tag>
                </td>
                <th class="idatath">{{$t('container.belongProject')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.project_name}}</td>
              </tr>
              <tr class="odd">
                <th class="idatath">{{$t('container.masterAndNodes')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.master_count}}/{{containerTemplateDetailForm.worker_count}}</td>
                <th class="idatath">{{$t('container.k8sversion')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.k8s_version}}</td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('container.heatStack')}}:</th>
                <td class="idatatd"><el-button @click="rowStackClick(containerTemplateDetailForm.stack_id, containerTemplateDetailForm.stack_name)" type="text" size="small">{{containerTemplateDetailForm.stack_name}}</el-button></td>
                <th class="idatath">{{$t('container.timeoutMin')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.create_timeout}}</td>
              </tr>            
              <tr class="odd">
                  <th class="idatath">{{$t('container.keypair')}}:</th>
                  <td class="idatatd">{{containerTemplateDetailForm.keypair_id}}</td>
                  <th class="idatath">{{$t('lang.createTime')}}:</th>
                  <td class="idatatd">{{containerTemplateDetailForm.created_at | createTime}}</td>
              </tr>
              <tr class="even">
                  <th class="idatath">{{$t('container.configFile')}}:</th>
                  <td class="idatatd">
                    <el-button type="text" @click="showConfigFile">Kubeconfig File</el-button>
                  </td>
                  <th class="idatath" style="width:20%">{{$t('container.clusterDescription')}}:</th>
                  <td class="idatatd" style="width:80%">
                    <el-tooltip :content="containerTemplateDetailForm.description" v-show="containerTemplateDetailForm.description.length > 20">
                      <span>{{ containerTemplateDetailForm.description.substring(0, 20) + "..." }}</span>
                    </el-tooltip>
                    <span v-show="containerTemplateDetailForm.description.length <= 20">{{ containerTemplateDetailForm.description }}</span>
                  </td>
                  </tr>
                </tbody>
              </table>
            </div>  
        </el-form>
      </el-collapse-item>
   
    <config-file ref='configfile' :clusterId="rancherClusterId" v-if="configFileFlag"  @cancelShow="cancelShow"></config-file>
    <el-collapse-item :title="$t('container.nodeList')" name="2">
        <div class="operation-panel">
            <operation-panel-new ref="operationOperate" :select-rows="multipleSelection" :operation-menus="operationMenus" style="display:inline;">
            </operation-panel-new>
          </div>
        <div class="divider clearfix"></div>
        <el-table ref="umTable" 
          :data="tableData" 
          v-loading="loading" 
          :element-loading-text="$t('lang.loading')"
          style="min-height:120px;"
          highlight-current-row stripe 
          :default-sort="{prop: 'name', order: 'ascending'}" 
          row-key="node_id"
          @selection-change="handleSelectionChange">
          <el-table-column reserve-selection type="selection" width="55" align="center">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('console') >= 0" prop="console" :label="$t('calcStorLang.console')" min-width="35" align="center">
            <template slot-scope="scope">
              <el-button icon="fa-desktop" v-if="(scope.row.node_status === 'ACTIVE' || scope.row.node_status === 'RESCUE')" style="color:#2196F3" class="el-button el-button--small" @click="vmConsolePage(scope.row)"></el-button>
              <el-button icon="fa-desktop" v-if="(scope.row.node_status !== 'ACTIVE' && scope.row.node_status !== 'RESCUE')" class="el-button el-button--small"></el-button>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('node_name') >= 0" prop="node_name" 
            :label="$t('container.nodeName')"
            :show-overflow-tooltip="false"
            min-width="120">
            <template slot-scope="scope">
              <el-button @click="vmDetail(scope.row)" type="text" size="small">{{scope.row.node_name == null?'-':scope.row.node_name}}</el-button>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('address') >= 0" :label="$t('lang.ipAddress')" align="left" prop="address">
            <template slot-scope="scope">
              <span v-html="ipAddressRender(scope.row.addresses, scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('node_status') >= 0" prop="node_status" :label="$t('container.nodeState')" show-overflow-tooltip min-width="80" align="left">
            <template slot-scope="scope">
              <instance-status :status="scope.row.node_status" />
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('taksType') >= 0" prop="OS-EXT-STS:task_state" :label="$t('calcStorLang.task')" min-width="50" align="left">
            <template slot-scope="scope">
              <span v-html="taskRender(scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('flavor') >= 0" prop="flavor" :label="$t('container.nodesFlavor')" show-overflow-tooltip min-width="80" align="left">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('cluster_role') >= 0" prop="cluster_role" :label="$t('container.nodeRole')" show-overflow-tooltip min-width="80" align="left">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('service_status') >= 0" prop="node_status" :label="$t('container.serviceState')" show-overflow-tooltip min-width="80" align="left">
            <template slot-scope="scope">
              <div v-html="serviceStatusRender(scope.row.service_status)"></div>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0" prop="created_at" :label="$t('lang.createTime')" 
            :show-overflow-tooltip="false" min-width="120">
            <template slot-scope="scope">
              {{ scope.row.created_at | createTime }}
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh">
              </el-button>
            </el-col>
            <el-col :span="19">
              <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
            </el-col>
          </el-row>
        </div>
        <transition name="slide-right" mode="out-in">
          <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
            <panel style="height: 100%">
              <div slot="title" class="clearfix">
                <el-button type="text" icon="fa-arrow-right" @click="onBack">{{$t("lang.back")}}</el-button>
              </div>
              <div>
                <instance-detail @refresh="onRefresh" :from="ContainerVMList" :instanceId="InstanceId" :InstanceStatus="InstanceStatus" :projectMaps="projectMaps" :userMaps="userMaps"></instance-detail>
              </div>
            </panel>
          </div>
        </transition>
        <floating-ip ref='floatingip' :instance="instance" v-if="flaotingipFlag"  @cancelAddNode="cancelAddNode"/>
    </el-collapse-item>
  </el-collapse>
  </div>
</template>
<script>
import moment from 'moment';
import InstanceStatus from '../../calculate-storage/instance/InstanceStatus';
import InstanceDetail from '../../calculate-storage/instance/InstanceDetail';
import FloatingIp from './floating-ip';
import ConfigFile from './ConfigFile';
export default {
  name: 'ContainerVMList',
  components: {
    InstanceStatus, InstanceDetail, FloatingIp, ConfigFile
  },
  props: ["clusterId", "projectId", "projectName", "rancherClusterId"],
  data() {
    return {
      close:"",
      activeNames: ["1", "2"],
      roleType: Vue.roleType,
      pageSize: 10,
      total: 0,
      sortKey: 'created_at',
      sortDir: 'desc',
      columns: [],
      columnsChecked: ["node_name", "address", "node_status", "node_id", "cluster_role", "created_at", "service_status", "flavor", "console", "taksType"],
      tableData: [],
      totalData: [],
      multipleSelection: [],
      loading: false,
      instance:{},
      InstanceId: '',
      ContainerVMList: 'containerVMList',
      InstanceStatus: '',
      detailFlag: false,
      flaotingipFlag: false,
      projectMaps: new Map(),
      userMaps: new Map(),
      flavorMaps: new Map(),
      networkMaps: new Map(),
      volumeListMaps: new Map(),
      containerTemplateDetailForm: {
          name:'',
          description:'',
          uuid:'',
          status:'',
          master_count:'',
          worker_count:'',
          stack_name:'',
          stack_id:'',
          create_timeout:'',
          created_at:'',
          keypair_id:'',
          project_id:'',
          project_name:'',
          k8s_version:''
      },
      configFileFlag: false,
      operationMenus: [{
        icon: "fa-play",
        name: Vue.t('calcStorLang.open'),
        multi: true,
        showflg: true,
        enable(rowData) {
          return (rowData['node_status'] === "SHUTOFF" && rowData['OS-EXT-STS:task_state'] === null);
        },
        handler: async function(selectRows) {
          var self = this;
          var body = { "os-start": null };
          body = JSON.stringify(body);
          self.$sequence({
            type: 'post',
            data: body,
            url: 'api/nova/v2.1/servers/{node_id}/action',
            params: selectRows,
            confirmMsg: Vue.t('calcStorLang.openInstConfirm'),
            log: {
              description: {
                en: "Start Instance",
                zh_cn: "开启云主机"
              },
              key: "name",
              target: Vue.logTarget.containerCluster
            }
          }).then((data) => {
            for (var r = 0; r < selectRows.length; r++) {
              var row = selectRows[r];
              row['OS-EXT-STS:task_state'] = "BUSY";
            }
            self.getData(true);
            self.$message(Vue.t('calcStorLang.openSendSuccess'));
            self.$refs.umTable.clearSelection();
          }).catch((err) => {});
        }.bind(this)
      }, {
        icon: "fa-stop",
        name: Vue.t('calcStorLang.closed'),
        multi: true,
        showflg: true,
        enable(rowData) {
          if (rowData['node_status'] === "CRASHED") {
            return true;
          }
          return (rowData['node_status'] === "ACTIVE" && rowData['OS-EXT-STS:task_state'] === null);
        },
        handler: async function(selectRows) {
          var self = this;
          var body = { "os-stop": null };
          body = JSON.stringify(body);
          self.$sequence({
            type: 'post',
            data: body,
            url: 'api/nova/v2.1/servers-inspur/{node_id}/action',
            params: selectRows,
            confirmMsg: Vue.t('calcStorLang.closeInstConfirm'),
            log: {
              description: {
                en: "Shutdown Instance",
                zh_cn: "关闭云主机"
              },
              key: "name",
              target: Vue.logTarget.containerCluster
            }
          }).then((data) => {
            for (var r = 0; r < selectRows.length; r++) {
              var row = selectRows[r];
              row['OS-EXT-STS:task_state'] = "BUSY";
            }
            self.getData(true);
            self.$message(Vue.t('calcStorLang.closeSendSuccess'));
            self.$refs.umTable.clearSelection();
          }).catch((err) => {});
        }.bind(this)
      }, {
        icon: "fa-plus",
        name: Vue.t('calcStorLang.instRestart'),
        multi: false,
        showflg: true,
        enable(rowData) {
          if (rowData['node_status'] === "CRASHED") {
            return true;
          }
          return ((rowData['node_status'] === "ACTIVE" || rowData['node_status'] === "SHUTOFF" || rowData['node_status'] === "PAUSED" || rowData['node_status'] === "SUSPENDED") && rowData['OS-EXT-STS:task_state'] === null);
        },
        handler: async function(selectRows) {
          var self = this;
          var body = { "reboot": { "type": "HARD" } };
          body = JSON.stringify(body);
          self.$sequence({
            type: 'post',
            data: body,
            url: 'api/nova/v2.1/servers/{node_id}/action',
            params: selectRows,
            errorKey: "conflictingRequest",
            confirmMsg: Vue.t('calcStorLang.hardRebootInstConfirm'),
            log: {
              description: {
                en: "HardReboot Instance",
                zh_cn: "硬重启云主机"
              },
              key: "name",
              target: Vue.logTarget.containerCluster
            }
          }).then((data) => {
            for (var r = 0; r < selectRows.length; r++) {
              var row = selectRows[r];
              row['OS-EXT-STS:task_state'] = "BUSY";
            }
            self.getData(true);
            self.$message(Vue.t('calcStorLang.hardRebootSuccess'));
            self.$refs.umTable.clearSelection();
          }).catch((err) => {});
        }.bind(this)
      }, {
        icon: 'fa-meh-o',
        name: Vue.t('network.setfloatingIP'),
        showflg: true,
        multi: false,
        enable(rowData) {
          if (Vue.roleType + '' === '0') {
            return (rowData.node_status === 'ACTIVE' || rowData.node_status === 'SHUTOFF');
          } else {
            return (rowData.node_status === 'ACTIVE' || rowData.node_status === 'SHUTOFF');
          }
        },
        handler: function(selectRows) {
          let row = selectRows[0];
          let ins = {};
          ins["id"] = row["node_id"];
          ins["name"] = row["node_name"];
          ins["tenant_id"] = this.projectId;
          this.instance = ins;
          this.flaotingipFlag = true;
        }.bind(this)
      }]
    };
  },
  beforeDestroy() {
    if (this.reloadTabelInterval != null) {
      clearInterval(this.reloadTabelInterval);
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
      handler: function(dataList) {
        let self = this;
        self.reloadTblFlag = false;
        if (dataList != null) {
          self.reloadTblFlag = true;
        }
        clearInterval(self.reloadTabelInterval);

        if (self.reloadTblFlag && !self._isDestroyed) {
          self.reloadTabelInterval = setInterval(() => {
            self.getData(true);
          }, 5000);
        }
      }
    }
  },
  mounted() {
    var self = this;
    this.initContainerTemplateDetails();
    if ("0" == roleType || "2" == roleType) {
      Promise.all([
        self.loadProjectList(),
        self.loadUserList()
        // self.loadFlavorList(),
        // self.loadVolumeList(),
        // self.loadNetListData()
      ]);
    } else {
      Promise.all([
        self.loadUserList()
        // self.loadFlavorList(),
        // self.loadVolumeList(),
        // self.loadNetListData()
      ]);
    }
    self.getData();
  },
  methods: {
    async initContainerTemplateDetails() {
        let self = this;
        self.loading = true;
        try {
          await self.$ajax({
            type: 'get',
            url:'api/cetus/v1/cluster/' + this.clusterId,
            showErrMsg: false,
            successFun(response) {
              self.loading = false;
              let formData = Object.assign({}, self.containerTemplateDetailForm);
              for (let key of Object.keys(formData)) {
                self.containerTemplateDetailForm[key] = response[key];
              }
              self.containerTemplateDetailForm.project_name = self.projectName;
            },
            errFun() {
              let formData = Object.assign({}, self.containerTemplateDetailForm);
              for (let key of Object.keys(formData)) {
                self.containerTemplateDetailForm[key] = "";
              }
              self.loading = false;
            }
          });
        } catch (data) {
          self.loading = false;
        }
    },
    statusTagRender(value) {
        let tagType = "";
        if (value === "CREATE_COMPLETE" || value === "INIT_COMPLETE" ||
          value === "RESUME_COMPLETE" || value === "ROLLBACK_COMPLETE" || value === "SUSPEND_COMPLETE" ||
          value == "UPDATE_COMPLETE" || value == "active") {
          tagType = "success";
        } else if (value === "CREATE_IN_PROGRESS" || value === "DELETE_IN_PROGRESS" ||
          value === "RESUME_IN_PROGRESS" || value === "ROLLBACK_IN_PROGRESS" || value === "SUSPEND_IN_PROGRESS" ||
          value == "UPDATE_IN_PROGRESS" || value == "provisioning" || value == "waiting" || value == "removing" || value == "updating") {
          tagType = "info"; /*tag类型由primary统一改为了info*/
        } else if (value === "CREATE_FAILED" || value === "DELETE_FAILED" ||
          value === "RESUME_FAILED" || value === "ROLLBACK_FAILED" ||
          value === "SUSPEND_FAILED" || value == "UPDATE_FAILED") {
          tagType = "danger";
        } else if (value === "unavailable") {
          tagType = "gray" /*增加了unavailable的状态*/
        }
        return tagType;
    },
    statusRender(value) {
        if (value=="CREATE_IN_PROGRESS") {
          return this.$t('container.CREATE_IN_PROGRESS')
        } else if (value=="CREATE_FAILED") {
          return this.$t('container.CREATE_FAILED')
        } else if (value=="CREATE_COMPLETE") {
          return this.$t('container.CREATE_COMPLETE')
        } else if (value=="DELETE_IN_PROGRESS") {
          return this.$t('container.DELETE_IN_PROGRESS')
        } else if (value=="DELETE_COMPLETE") {
          return this.$t('container.DELETE_COMPLETE')
        } else if (value=="DELETE_FAILED") {
          return this.$t('container.DELETE_FAILED')
        } else if (value=="SUSPEND_IN_PROGRESS") {
          return this.$t('container.SUSPEND_IN_PROGRESS')
        } else if (value=="SUSPEND_COMPLETE") {
          return this.$t('container.SUSPEND_COMPLETE')
        } else if (value=="SUSPEND_FAILED") {
          return this.$t('container.SUSPEND_FAILED')
        } else if (value=="RESUME_IN_PROGRESS") {
          return this.$t('container.RESUME_IN_PROGRESS')
        } else if (value=="RESUME_COMPLETE") {
          return this.$t('container.RESUME_COMPLETE')
        } else if (value=="RESUME_FAILED") {
          return this.$t('container.RESUME_FAILED')
        } else if (value=="ROLLBACK_IN_PROGRESS") {
          return this.$t('container.ROLLBACK_IN_PROGRESS')
        } else if (value=="ROLLBACK_COMPLETE") {
          return this.$t('container.ROLLBACK_COMPLETE')
        } else if (value=="ROLLBACK_FAILED") {
          return this.$t('container.ROLLBACK_FAILED')
        } else if (value=="UPDATE_IN_PROGRESS") {
          return this.$t('container.UPDATE_IN_PROGRESS')
        } else if (value=="UPDATE_COMPLETE") {
          return this.$t('container.UPDATE_COMPLETE')
        } else if (value=="UPDATE_FAILED") {
          return this.$t('container.UPDATE_FAILED')
        } else if (value=="unavailable") {
          return this.$t('container.unavailable')
        } else if (value=="provisioning") {
          return this.$t('container.provisioning')
        } else if (value=="active") {
          return this.$t('container.active')
        } else if (value=="removing") {
          return this.$t('container.removing')
        } else if (value=="waiting") {
          return this.$t('container.provisioning')
        } else if (value=="updating") {
          return this.$t('container.UPDATE_IN_PROGRESS')
        } else {
          return value
        }
    },
    cancelShow() {
        this.configFileFlag = false;
      },
    showConfigFile() {
      this.configFileFlag = true;
    },
    rowStackClick(stackId, stackName) {
        this.$router.push({
          path: "/service-orchestration/orchestrationList/orchestrationDetail/" + stackName + "/" + stackId,
          params: {
            name: stackName
          }
        });
    },
    async getData(isClear=false) {
      let self = this;
      let novaUrl = "api/cetus/v1/cluster/get_cluster_nodes";
      try {
        let ajaxParam = {
          type: 'POST',
          url: novaUrl,
          data:JSON.stringify({
            "cluster_id": self.clusterId
          }),
          showErrMsg: true
        };
        if (!isClear) {
          self.loading = true;
        }
        let ret = await this.$ajax(ajaxParam);
        self.loading = false;
        self.totalData = ret.result;
        self.total = ret.total_count;
      } catch (res) {
        self.loading = false;
      }
      // if (isClear) {
      //   self.$refs.umTable.clearSelection();
      // }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    //多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //排序
    sortChange(column) {
      let self = this;
      let key = column.prop;
      let keyOrder = column.order;
      self.queryParam.key = column.prop;
      self.queryParam.keyOrder = column.order;
      if (keyOrder != null && self.totalData != null) {
        self.totalData.sort(this.$sortFormatter(key, keyOrder));
      }
    },
    rowClick(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    //刷新
    onRefresh() {
      this.getData(true);
    },
    ipAddressRender(value, rowData) {
      var address = rowData['addresses'];
      if (address != null) {
        var list = Object.keys(address).map(function(el) {
            return address[el];
        });
        if (list != null) {
           if (list.length > 1) {
             var ipShow = "";
             for (let addr in address) {
               var ipList = address[addr];
               var ips = "";
               for (let n = 0; n < ipList.length; n++) {
                 var net = ipList[n];
                 var type = net['OS-EXT-IPS:type'];
                 if (type == "floating") {
                   ips += net.addr + "(" + Vue.t('network.floatingIP') + ")" + "<br>";
                 } else {
                   ips += net.addr + "<br>";
                 }
               }
              //  ipShow += addr + "<br>" + ips;
               ipShow += ips;
             }
             return ipShow;
           } else if (list.length == 0) {
              return "-";
           } else {
             var ipShow2 = "";
             for (let addr in address) {
               var ipList2 = address[addr];
               var ips2 = "";
               for (let n = 0; n < ipList2.length; n++) {
                 var net2 = ipList2[n];
                 var type2 = net2['OS-EXT-IPS:type'];
                 if (type2 == "floating") {
                   ips2 += net2.addr + "(" + Vue.t('network.floatingIP') + ")" + "<br>";
                 } else {
                   ips2 += net2.addr + "<br>";
                 }
               }
               ipShow2 += ips2;
             }
             return ipShow2;
           }
        } else {
          return "-";
        }
      } else {
        return "-";
      }
    },
    serviceStatusRender(value) {
      if (value == "unknown") {
        return "-";
      } else if (value == "registering") {
        return this.$t("container.registering");
      } else if (value == "active") {
        return this.$t("container.running");
      } else {
        return "-";
      }
    },
    async vmConsolePage(row) {
      let self = this;
      let body = { "os-getVNCConsole": { "type": "novnc" } };
      body = JSON.stringify(body);
      let flavorType = row['flavor'];
      try {
        if (flavorType.indexOf("Bare@")<0) {
          let result = await self.$ajax({
            type: 'post',
            data: body,
            url: 'api/nova/v2.1/servers/' + row['node_id'] + '/action',
            showErrMsg: true
          });
          let data = result.console.url;
          window.open(data + "&title=" + encodeURIComponent(row['node_name']), '_blank');
        } else {
          let result = await self.$ajax({
            type: 'get',
            // data: body,
            url: 'api/ironic/v1/nodeinstances/' + row['node_id'],
            showErrMsg: true
          });
          var data = result.console_info.url;
          // var consoleToken = data.substring(data.indexOf("token") + 6, data.length);
          // self.$cookie.set('vmConsoleToken', data);
          window.open(data, '_blank');
        }
      } catch (res) {
      }
    },
    vmDetail(row) {
      if (row['node_name'] != null) {
        this.detailFlag = true;
        this.InstanceId = row['node_id'];
        this.InstanceStatus = row['node_name'];
        this.$refs.umTable.clearSelection();
      }
    },
    onBack() {
      this.detailFlag = false;
    },
    cancelAddNode() {
      this.flaotingipFlag=false;
    },
    async loadProjectList() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/keystone/v3/projects?domain_id=default";
      if ("2" == roleType) {
        url = "api/keystone/v3/users/" + Vue.userId + "/projects";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        var list = result['projects'];
        for (var p = 0; p < list.length; p++) {
          var obj = list[p];
          self.projectMaps.set(obj.id, obj.name);
        }
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async loadUserList() {
      var self = this;
      var url = "api/keystone/v3/inspur/users?dir=asc&field=name&domain_id=default";
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        url = `api/keystone/v3/inspur/assignments/projects/${self.$cookie.get('pid')}/users`;
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        let usersList = [];
        if (roleType === '0') {
          usersList = result.users;
        } else {
          usersList = result.users.map(item => {
            return item.user;
          });
        }
        for (var u = 0; u < usersList.length; u++) {
          var obj = usersList[u];
          self.userMaps.set(obj.id, obj.name);
        }
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
     async loadFlavorList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/flavors'
        });
        var list = result['flavors'];
        for (var u = 0; u < list.length; u++) {
          var obj = list[u];
          self.flavorMaps.set(obj.id, obj.name);
        }

        let result1 = await self.$ajax({
              type: 'get',
              data: {"is_public": false},
              url: 'api/nova/v2.1/flavors/detail',
              showErrMsg: true
        });
        var list1 = result1['flavors'];
        for (var u1 = 0; u1 < list1.length; u1++) {
          var obj1 = list1[u1];
          self.flavorMaps.set(obj1.id, obj1.name);
        }
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async loadNetListData() {
      var self = this;
      var url = "api/neutron/v2.0/networks";
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false,
          complete: function(XMLHttpRequest, textStatus) {}
        });
        var list = result['networks'];
        for (let v = 0; v < list.length; v++) {
          var obj = list[v];
          var network = obj.name || obj.id;
          self.networkMaps.set(obj.id, network);
        }
      } catch (data) {
      }
    },
    async loadVolumeList() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/cinderv2/v3/" + this.$cookie.get("pid") + "/volumes/detail?all_tenants=True";
      if ("2" == roleType || "3" == roleType) {
        url = "api/cinderv2/v3/" + this.$cookie.get("pid") + "/volumes/detail";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var volumeList = result['volumes'];
        for (let v = 0; v < volumeList.length; v++) {
            var volume = volumeList[v];
            var name = volume.name || volume.id;
            self.volumeListMaps.set(volume.id, volume);
        }
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    taskRender(rowData) {
      var taskType = rowData['OS-EXT-STS:task_state'];
      var taskMsg = "";
      if (taskType != null) {
        switch (taskType.toUpperCase()) {
        case "BUSY":
          taskMsg = this.$t('calcStorLang.task_busying');
          break;
        case "SCHEDULING":
          taskMsg = this.$t('calcStorLang.task_scheduling');
          break;
        case "BLOCK_DEVICE_MAPPING":
          taskMsg = this.$t('calcStorLang.task_block_device_mapping');
          break;
        case "NETWORKING":
          taskMsg = this.$t('calcStorLang.task_networking');
          break;
        case "SPAWNING":
          taskMsg = this.$t('calcStorLang.task_spawning');
          break;
        case "IMAGE_SNAPSHOT":
          taskMsg = this.$t('calcStorLang.task_image_snapshot');
          break;
        case "IMAGE_SNAPSHOT_PENDING":
          taskMsg = this.$t('calcStorLang.task_image_snapshot_pending');
          break;
        case "IMAGE_PENDING_UPLOAD":
          taskMsg = this.$t('calcStorLang.task_image_pending_upload');
          break;
        case "IMAGE_UPLOADING":
          taskMsg = this.$t('calcStorLang.task_image_uploading');
          break;
        case "IMAGE_BACKUP":
          taskMsg = this.$t('calcStorLang.task_image_backup');
          break;
        case "UPDATING_PASSWORD":
          taskMsg = this.$t('calcStorLang.task_updating_password');
          break;
        case "RESIZE_PREP":
          taskMsg = this.$t('calcStorLang.task_resize_prep');
          break;
        case "RESIZE_MIGRATING":
          taskMsg = this.$t('calcStorLang.task_resize_migrating');
          break;
        case "RESIZE_MIGRATED":
          taskMsg = this.$t('calcStorLang.task_resize_migrated');
          break;
        case "RESIZE_FINISH":
          taskMsg = this.$t('calcStorLang.task_resize_finish');
          break;
        case "RESIZE_REVERTING":
          taskMsg = this.$t('calcStorLang.task_resize_reverting');
          break;
        case "RESIZE_CONFIRMING":
          taskMsg = this.$t('calcStorLang.task_resize_confirming');
          break;
        case "REBOOTING":
          taskMsg = this.$t('calcStorLang.task_rebooting');
          break;
        case "REBOOT_PENDING":
          taskMsg = this.$t('calcStorLang.task_reboot_pending');
          break;
        case "REBOOT_STARTED":
          taskMsg = this.$t('calcStorLang.task_reboot_started');
          break;
        case "REBOOTING_HARD":
          taskMsg = this.$t('calcStorLang.task_rebooting_hard');
          break;
        case "REBOOT_PENDING_HARD":
          taskMsg = this.$t('calcStorLang.task_reboot_pending_hard');
          break;
        case "REBOOT_STARTED_HARD":
          taskMsg = this.$t('calcStorLang.task_reboot_started_hard');
          break;
        case "PAUSING":
          taskMsg = this.$t('calcStorLang.task_pausing');
          break;
        case "UNPAUSING":
          taskMsg = this.$t('calcStorLang.task_unpausing');
          break;
        case "SUSPENDING":
          taskMsg = this.$t('calcStorLang.task_suspending');
          break;
        case "RESUMING":
          taskMsg = this.$t('calcStorLang.task_resuming');
          break;
        case "POWERING_OFF":
          taskMsg = this.$t('calcStorLang.task_powering_off');
          break;
        case "POWERING-OFF":
          taskMsg = this.$t('calcStorLang.task_powering_off');
          break;
        case "POWERING_ON":
          taskMsg = this.$t('calcStorLang.task_powering_on');
          break;
        case "POWERING-ON":
          taskMsg = this.$t('calcStorLang.task_powering_on');
          break;
        case "RESCUING":
          taskMsg = this.$t('calcStorLang.task_rescuing');
          break;
        case "UNRESCUING":
          taskMsg = this.$t('calcStorLang.task_unrescuing');
          break;
        case "REBUILDING":
          taskMsg = this.$t('calcStorLang.task_rebuilding');
          break;
        case "REBUILD_BLOCK_DEVICE_MAPPING":
          taskMsg = this.$t('calcStorLang.task_rebuild_block_device_mapping');
          break;
        case "REBUILD_SPAWNING":
          taskMsg = this.$t('calcStorLang.task_rebuild_spawning');
          break;
        case "MIGRATING":
          taskMsg = this.$t('calcStorLang.task_migrating');
          break;
        case "DELETING":
          taskMsg = this.$t('calcStorLang.task_deleting');
          break;
        case "SOFT_DELETING":
          taskMsg = this.$t('calcStorLang.task_soft_deleting');
          break;
        case "SOFT-DELETING":
          taskMsg = this.$t('calcStorLang.task_soft_deleting');
          break;
        case "RESTORING":
          taskMsg = this.$t('calcStorLang.task_restoring');
          break;
        case "SHELVING":
          taskMsg = this.$t('calcStorLang.task_shelving');
          break;
        case "SHELVING_IMAGE_PENDING_UPLOAD":
          taskMsg = this.$t('calcStorLang.task_shelving_image_pending_upload');
          break;
        case "SHELVING_IMAGE_UPLOADING":
          taskMsg = this.$t('calcStorLang.task_shelving_image_uploading');
          break;
        case "SHELVING_OFFLOADING":
          taskMsg = this.$t('calcStorLang.task_shelving_offloading');
          break;
        case "UNSHELVING":
          taskMsg = this.$t('calcStorLang.task_unshelving');
          break;
        case "BACKUPING":
          taskMsg = this.$t('calcStorLang.task_backuping');
          break;
        default:
          break;
        }
      } else {
        taskMsg = "-";
      }
      return taskMsg;
    }
  },
  filters: {
    createTime(val) {
      const time = moment.utc(val);
      time.local();
      return time.format('YYYY-MM-DD HH:mm:ss');
    }
  }
};
</script>
<style scoped>
</style>
