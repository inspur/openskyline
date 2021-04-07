<template>
  <div>
    <icos-page-header :title="$t('network.floatingIP')" />
    <icos-page>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch">
    </icos-search-bar>
    <div class="divider clearfix"></div>
    <div class="operation-panel margin-tb5">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="umTable" :data="floatingipData" highlight-current-row stripe border style="width: 100%;margin-top:5px;" row-key="id" v-loading="loading" :element-loading-text="$t('lang.loading')" @row-click="rowClick" :default-sort="{prop: 'floating_ip_address'}" @sort-change="sortChange" @selection-change="handleSelectionChange">
      <el-table-column reserve-selection type="selection" width="55" align="center">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('project_id') >= 0" :label="$t('lang.project')" prop="project_id" min-width="100">
        <template slot-scope="scope">
          <span v-html="projectToName(scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('floating_ip_address') >= 0" :label="$t('network.ipaddress')" prop="floating_ip_address" sortable="custom" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('fixed_ip_address') >= 0" prop="fixed_ip_address" :label="$t('network.fiexedipaddress')" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('port_forwardings') >= 0" prop="port_forwardings" :label="$t('network.portTransfer')" min-width="50" align="left">
        <template slot-scope="scope">
          <span v-html="portTransferRender(scope.row.port_forwardings)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('floating_network_id') >= 0" prop="floating_network_id" :label="$t('network.externalNet')" min-width="100">
        <template slot-scope="scope">
          <span v-html="networkRender(scope.row.floating_network_id)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('qos_policy_id') >= 0" prop="qos_policy_id" :label="$t('calcStorLang.netConfigQosPloy')" min-width="100">
        <template slot-scope="scope">
          <span v-html="qosRender(scope.row.qos_policy_id)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" align="left" :label="$t('lang.status')" min-width="50">
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
          <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj" :objStorFlag="true"></page>
        </el-col>
      </el-row>
      <add-floatingip ref="addFloatingIP" v-if="addFlag" @handleAddShow="handleAddShow"></add-floatingip>
      <connect-floatingip ref="connectFloatingIP" v-if="editFlag" @handleEditShowCancel="handleEditShowCancel" @handleEditShow="handleEditShow" :bangdingId="bangdingId" :bangdingIp="bangdingIp" :floating_network_id="floating_network_id" :project_id="project_id" :floatingList="totalData"></connect-floatingip>
      <floatingip-detail ref="FloatingipDetail" v-if="detailFlag" @handleDetailShow="handleDetailShow" @handleEditShowCancel="handleEditShowCancel"></floatingip-detail>
      <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
      <qos-config ref="qosConfig" :entity="selectData" v-if="qosConfigFlag" @hide="qosConfigFlag=false" @refresh="onRefresh"></qos-config>
      <porttransfer ref="portTransfer" :entity="selectData" v-if="portTransferFlag" @hide="portTransferFlag=false" @refresh="onRefresh"></porttransfer>
      <batch-add-porttransfer :unBindFloatIP="unBindFloatIP" v-if="batchPortTransferFlag" @hide="batchPortTransferFlag=false" @refresh="onRefresh"></batch-add-porttransfer>
    </div>
    </icos-page>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import AddFloatingip from './AddFloatingIP';
import ConnectFloatingip from './ConnectFloatingIP';
import QosConfig from './QosConfig';
import FloatingipDetail from './FloatingipDetail';
import Porttransfer from './Porttransfer';
import BatchAddPorttransfer from './BatchAddPorttransfer';
export default {
  name: "floatingIP",
  components: {
    AddFloatingip, ConnectFloatingip, FloatingipDetail, QosConfig, Porttransfer, BatchAddPorttransfer
  },
  data() {
    return {
      searchBar: {
        conditions: {
          query_porject: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          },
          query_ip: {
            label: this.$t('network.ipaddress'),
            type: 'input',
            validator: (value) => {
              if (!/^[\.0-9]*$/.test(value)) {
                throw new Error(this.$t('calcStorLang.NG_FILTER_IPV4_TIPS'));
              }
            }
          },
          query_status: {
            label: this.$t('lang.status'),
            type: 'select',
            options: [{
              label: this.$t('lang.ACTIVE'),
              value: 'ACTIVE'
            }, {
              label: this.$t('lang.DOWN'),
              value: 'DOWN'
            }, {
              label: this.$t('lang.ERROR'),
              value: 'ERROR'
            }]
          }
        }
      },
      searchBarValidatedParams: {},
      unBindFloatIP: [],
      formInline: '',
      sortObj: {
        sortOrder: "ascending",
        sortField: "floating_ip_address"
      },
      roleType: Vue.roleType + "",
      showBorder: true,
      addFlag: false,
      editFlag: false,
      portTransferFlag: false,
      batchPortTransferFlag: false,
      detailFlag: false,
      loading: false,
      query_ip: "",
      query_porject: "",
      projectName: "",
      selProjectFlg: false,
      qosConfigFlag: false,
      close: "",
      query_status: "",
      bangdingId: "",
      bangdingIp: "",
      project_id: "",
      floating_network_id: "",
      projectOption: [],
      exterNetworkList: [],
      qosList: [],
      totalData: [],
      columns: [{
        prop: "project_id",
        label: Vue.t('lang.project')
      }, {
        prop: "floating_ip_address",
        label: Vue.t('network.ipaddress')
      }, {
        prop: "fixed_ip_address",
        label: Vue.t('network.fiexedipaddress')
      }, {
        prop: "port_forwardings",
        label: Vue.t('network.portTransfer')
      }, {
        prop: "floating_network_id",
        label: Vue.t('network.externalNet')
      }, {
        prop: "qos_policy_id",
        label: Vue.t('calcStorLang.netConfigQosPloy')
      }, {
        prop: "status",
        label: Vue.t('lang.status')
      }],
      columnsChecked: ['project_id', 'floating_ip_address', 'fixed_ip_address', 'port_forwardings', 'floating_network_id', 'qos_policy_id', 'status'],
      floatingipData: [],
      multipleSelection: [],
      selectData: {},
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.allocatefloatingip'),
        showflg: true,
        readOnly: true,
        handler: function (selectRows) {
          this.addFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('network.releasefloatingip'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          let self = this;
          self.$confirm(Vue.t('network.confirmRelease'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            closeOnClickModal: false,
            callback: (action, instance) => {
              if (action === "confirm") {
                self.loading = true;
                self.$refs.umTable.clearSelection();
                for (let i = 0; i < selectRows.length; i++) {
                  let row = selectRows[i];
                  self.$ajax({
                    type: "DELETE",
                    url: "api/neutron/v2.0/floatingips/" + row["id"],
                    data: {},
                    success: function (result) {
                      self.$notify({
                        message: row["floating_ip_address"] + Vue.t('network.releaseSuccess'),
                        type: "success"
                      });
                    },
                    log: {
                      description: {
                        en: row["floating_ip_address"] + ":release success",
                        zh_cn: row["floating_ip_address"] + ":释放成功"
                      },
                      target: Vue.logTarget.floatingIP
                    }
                  });
                }
                setTimeout(function () {
                  self.getCallback();
                  self.loading = false;
                }, 1000)
              }
            }
          }).then((data) => {
          }).catch((err) => {
          });
        }.bind(this)
      }, {
        icon: "fa-plus-square",
        name: Vue.t('network.bangding'),
        showflg: true,
        multi: false,
        enable(rowData) {
          if (rowData["fixed_ip_address"] != null || (rowData["port_forwardings"] != null && rowData["port_forwardings"].length > 0)) {
            return false;
          } else {
            return true;
          }
        },
        handler: function (selectRows) {
          let self = this;
          let row = selectRows[0];
          self.editFlag = true;
          self.bangdingId = row["id"];
          self.bangdingIp = row["floating_ip_address"];
          self.floating_network_id = row["floating_network_id"];
          self.project_id = row["project_id"];
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('network.unbanding'),
        showflg: true,
        multi: false,
        enable(rowData) {
          if (rowData["fixed_ip_address"] != null) {
            return true;
          } else {
            return false;
          }
        },
        handler: function (selectRows) {
          let self = this;
          let row = selectRows[0];
          self.$confirm(Vue.t('network.confirmUnbanding'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            closeOnClickModal: false,
            callback: (action, instance) => {
              if (action === "confirm") {
                self.loading = true;
                //先判断是否存在
                self.$ajax({
                  type: "GET",
                  url: "api/neutron/v2.0/floatingips/" + row["id"],
                  success: function (result) {
                    let floatingTemp = result["floatingip"];
                    if (floatingTemp["fixed_ip_address"] == null) {
                      self.$notify({
                        message: Vue.t('network.bangdingipwarning'),
                        type: "error"
                      });
                      self.getCallback();
                    } else {
                      self.$refs.umTable.clearSelection();
                      let reqdata = { "floatingip": {} };
                      self.$ajax({
                        type: "PUT",
                        url: "api/neutron/v2.0/floatingips/" + row["id"],
                        data: JSON.stringify(reqdata),
                        success: function (result) {
                          self.$notify({
                            message: row["floating_ip_address"] + Vue.t('network.unbandingSuccess') + "," + Vue.t('network.pleaseRefreshList'),
                            type: "success"
                          });
                        },
                        errorKey: "NeutronError",
                        log: {
                          description: {
                            en: row["floating_ip_address"] + ":unbinding",
                            zh_cn: row["floating_ip_address"] + ":解除绑定"
                          },
                          target: Vue.logTarget.floatingIP
                        }
                      });
                      self.getCallback();
                    }
                  },
                  errorKey: "NeutronError"
                });
              }
            }
          }).then((data) => {
          }).catch((err) => {
          });
        }.bind(this)
      }, {
        icon: "fa-cogs",
        name: Vue.t('calcStorLang.netConfigQosConfig'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function (selectRows) {
          this.selectData = selectRows[0];
          this.qosConfigFlag = true;
        }.bind(this)
      }, {
        icon: "fa-exchange",
        name: Vue.t('network.portTransfer'),
        showflg: true,
        multi: false,
        enable(rowData) {
          if (rowData["fixed_ip_address"] != null) {
            return false;
          } else {
            return true;
          }
        },
        handler: function (selectRows) {
          this.selectData = selectRows[0];
          this.portTransferFlag = true;
        }.bind(this)
      }, {
        icon: "fa-exchange",
        name: Vue.t('network.portTransferBatch'),
        showflg: true,
        multi: false,
        nonSelected: true,
        enable(rowData) {
          return false;
        },
        handler: function (selectRows) {
          this.batchPortTransferFlag = true;
        }.bind(this)
      }, {
        icon: "fa-list",
        name: Vue.t('network.allFloatIP'),
        showflg: true,
        multi: false,
        nonSelected: true,
        enable(rowData) {
          return false;
        },
        handler: function (selectRows) {
          this.detailFlag = true;
        }.bind(this)
      }
      ]
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
    this.getCallback();
  },
  methods: {
    handleSearch(params) {
      let self = this;
      this.searchBarValidatedParams = params;
      self.$refs.umTable.clearSelection();
      self.getData();
    },
    async getData() {
      var self = this;
      let ip = self.searchBarValidatedParams.query_ip || "";
      let projectid = self.searchBarValidatedParams.query_porject || "";
      let status = self.searchBarValidatedParams.query_status || "";
      try {
        let roleType = Vue.roleType + "";
        if (roleType == "0") {
        } else {
          projectid = Vue.cookie.get('pid');
        }
        let data = [];
        let statusTransfer = { "ACTIVE": Vue.t('lang.ACTIVE'), "DOWN": Vue.t('lang.DOWN'), "ERROR": Vue.t('lang.ERROR') };
        self.loading = true;
        let p = {};
        if (projectid != null && projectid != "") {
          p.project_id = projectid;
        }
        if (status != null && status != "") {
          p.status = status;
        }
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/floatingips?" + $.param(p),
          complete: function (XMLHttpRequest, textStatus) {
            self.loading = false;
          },
          errorKey: "NeutronError"
        });
        let tempArr = result["floatingips"];
        self.loading = false;
        // self.$refs.umTable.clearSelection();
        self.totalData = [];
        for (let i = 0; i < tempArr.length; i++) {
          let floatingip = tempArr[i];
          if (floatingip.floating_ip_address.indexOf(ip) >= 0) {
            floatingip.status = statusTransfer[floatingip.status];
            self.totalData.push(floatingip);
          }
        }
        let unBindFloatIPArr = [];
        for (let floatIP of self.totalData) {
          if (!floatIP.port_id) {
            unBindFloatIPArr.push(floatIP);
          }
        }
        self.unBindFloatIP = unBindFloatIPArr;
      } catch (res) {
        self.loading = false;
      }
    },
    portTransferRender(value) {
      if (!value || value.length == 0) {
        return Vue.t("lang.no");
      } else {
        return Vue.t("lang.yes");
      }
    },
    getCurrentData(param) {
      this.floatingipData = param;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
      };
    },
    getCallback() {
      let self = this;
      let roleType = Vue.roleType + "";
      if (roleType == "0") {
        Promise.all([self.getProjectList(), self.getExterNetworkList(), this.getSubnetList(), this.getQosList()]).then(function (result) {
          self.getData();
          // setTimeout( function() {
          //   self.getData();
          // }, 3000);
        });
      } else {
        Promise.all([self.getProjectInUser(), self.getExterNetworkList(), this.getSubnetList(), this.getQosList()]).then(function (result) {
          self.getData();
          // setTimeout( function() {
          //   self.getData();
          // }, 3000);
        });
      }
    },
    async getProjectList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default",
          errorKey: "NeutronError"
        });
        Vue.projectListforNet = result["projects"];
        this.projectOption = Vue.projectListforNet;
        this.searchBar.conditions.query_porject.options = result.projects.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      } catch (res) {
      }
    },
    async getQosList() {
      try {
        let projectId = "";
        let roleType = Vue.roleType + "";
        if (roleType != "0") {
          projectId = Vue.cookie.get('pid');
        }
        let p = "";
        if (projectId != null && projectId != "") {
          p = '?project_id=' + projectId;
        }
        let result = await this.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/qos/policies" + p,
          errorKey: "NeutronError"
        });
        this.qosList = result["policies"];
      } catch (res) {
      }
    },
    getProjectInUser() {
      let self = this;
      self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/floatingips?project_id=" + Vue.cookie.get('pid'),
        errorKey: "NeutronError",
        success: function (result) {
          let firewalls = result['floatingips'];
          for (let i = 0; i < firewalls.length; i++) {
            let fw = firewalls[i];
            self.$ajax({
              type: "GET",
              url: "api/keystone/v3/projects/" + fw["project_id"],
              showErrMsg: false,
              success: function (project) {
                Vue.projectListforNet.push(project["project"]);
              }
            });
          }
        }
      });
    },
    async getExterNetworkList() {
      let self = this;
      let result = await self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/networks?router:external=true"
      });
      self.exterNetworkList = result['networks'];
      Vue.networkList = self.exterNetworkList;
    },
    async getSubnetList() {
      let self = this;
      let result = await self.$ajax({
        type: 'GET',
        url: "api/neutron/v2.0/subnets",
        errorKey: "NeutronError"
      });
      Vue.subnetsList = result['subnets'];
    },
    handleAddShow() {
      let self = this;
      self.detailFlag = false;
      self.addFlag = false;
      this.$refs.umTable.clearSelection();
      self.getCallback();
    },
    handleEditShowCancel() {
      let self = this;
      self.editFlag = false;
      self.detailFlag = false;
      self.getCallback();
    },
    handleEditShow() {
      this.editFlag = false;
      this.$refs.umTable.clearSelection();
      this.getCallback();
    },
    handleDetailShow() {
      this.detailFlag = false;
      // this.$refs.umTable.clearSelection();
      this.getCallback();
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.umTable.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    onRefresh() {
      this.$refs.umTable.clearSelection();
      this.getCallback();
    },
    handleNameChange() {
      var self = this;
      self.getData();
    },
    rowClick(row) {
      this.$refs.umTable.toggleRowSelection(row);
    },
    queryClick() {
      var self = this;
      self.$refs.umTable.clearSelection();
      self.getData();
    },
    queryAllFloatIP() {
      this.detailFlag = true;
    },
    networkRender(value) {
      let name = "";
      for (var i = this.exterNetworkList.length - 1; i >= 0; i--) {
        let network = this.exterNetworkList[i];
        if (value === network.id) {
          name = network.name;
        }
      }
      return name;
    },
    qosRender(id) {
      let qos = this.qosList.find((value) => {
        return value.id == id;
      });
      return qos ? qos.name : "-";
    },
    projectToName(row) {
      let proId = row["project_id"];
      let proList = Vue.projectListforNet;
      for (let i = 0; i < proList.length; i++) {
        if (proId === proList[i]["id"]) {
          return proList[i]["name"];
        }
      }
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.query_porject = id;
      this.projectName = name;
      this.close = 'close';
    },
    onIconClick() {
      this.query_porject = '';
      this.projectName = '';
      this.close = '';
    }
  }
}
</script>
