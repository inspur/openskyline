<template>
  <div>
    <icos-page-header :title="$t('network.balance')" />
    <icos-page>
    <icos-search-bar :conditions="searchBar.conditions" @search="handleSearch" />
    <div class="divider clearfix"></div>
    <div class="operation-panel margin-tb5">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="loadbalancerTable" :data="loadbalancerData" highlight-current-row stripe border style="width: 100%" row-key="id" v-loading="loading" :element-loading-text="$t('lang.loading')" @row-click="rowClick" @selection-change="handleSelectionChange" :default-sort="{prop: 'name'}" @sort-change="sortChange">
      <el-table-column reserve-selection type="selection" width="55" align="center">
      </el-table-column>
      <!--
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form label-width="80px" class="me-form" style="width:200px;" v-loading="loadingip">
            <el-form-item label="浮动IP">
              <span>{{scope.row.floatingIP}}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      -->
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="50" sortable="custom">
        <template slot-scope="scope">
          <el-button @click.stop="showDetail(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>

       <!-- <el-table-column v-if="columnsChecked.indexOf('amphora_id') >= 0" :render-header="amphoraRenderHeader" prop="amphora_id" :label="$t('network.AMPHORA_VIRTUAL_MACHINE')" min-width="50">
         <template slot-scope="scope">
          <el-button v-if="roleType=='0' && scope.row.amphora_id != '-'" @click.stop="showAmphoraDetail(scope.$index, scope.row)" type="text" size="small">{{scope.row.amphora_id}}</el-button>
          <span v-else>{{scope.row.amphora_id}}</span>
        </template>
      </el-table-column> -->

      <el-table-column v-if="columnsChecked.indexOf('project_id') >= 0" prop="project_id" :label="$t('lang.project')" min-width="50">
        <template slot-scope="scope">
          <span v-html="projectToName(scope.row.project_id)"></span>
        </template>
      </el-table-column>
      <el-table-column :render-header="operateStatusHeader" v-if="columnsChecked.indexOf('operating_status') >= 0" :label="$t('network.operateStatus')" prop="operating_status" min-width="50" align="left">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.operating_status)">
            <span v-html="operatingStatusRender(scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :render-header="provisioningStatusHeader" v-if="columnsChecked.indexOf('provisioning_status') >= 0" prop="provisioning_status" :label="$t('network.configStatus')" min-width="50" align="left">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.provisioning_status)">
            <span v-html="provisioningStatusRender(scope.row)"></span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('vip_address') >= 0" prop="vip_address" :label="$t('network.ipaddress')" min-width="50">
      </el-table-column>
      <!-- <el-table-column v-if="columnsChecked.indexOf('listeners') >= 0" prop="listeners" :label="$t('network.monitorNumber')" min-width="50" align="left">
        <template slot-scope="scope">
          <span v-html="listenersRender(scope.row.listeners, scope.row)"></span>
        </template>
      </el-table-column> -->
      <!-- <el-table-column v-if="columnsChecked.indexOf('vip_subnet_id') >= 0" prop="vip_subnet_id" :label="$t('network.subnet')" min-width="50">
        <template slot-scope="scope">
          <span v-html="subnetRender(scope.row.vip_subnet_id)"></span>
        </template>
      </el-table-column> -->
      <el-table-column v-if="columnsChecked.indexOf('fip_address') >= 0" prop="fip_address" :label="$t('network.floatIpaddress')" min-width="50">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" :label="$t('lang.desc')" min-width="50">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
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
    <add-balance v-if="addFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow"></add-balance>
    <edit-balance v-if="editFlag" @handleEditShow="handleEditShow" @handleCancelShow="handleCancelShow" :edit_id="edit_id" :edit_name="edit_name" :edit_description="edit_description" :edit_ipaddress="edit_ipaddress" :edit_subnet="edit_subnet"></edit-balance>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    <set-floatingip v-if="floatingIPFlag" @handleFloatingipShow="handleFloatingipShow" :balanceName="balanceName" :lbPortId="vip_port_id" :projectId="loadbalancer_projectid"></set-floatingip>
    </icos-page>
  </div>
</template>
<script>
import AddBalance from "./AddBalance";
import SetFloatingip from "./SetFloatingip";
import EditBalance from "./EditBalance";
import {onlyLetterNumberChinese} from '../validator/validator';
export default {
  name: "BalanceList",
  components: {
    AddBalance,
    SetFloatingip,
    EditBalance
  },
  data() {
    return {
      searchBar: {
        conditions: {
          query_name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: onlyLetterNumberChinese
          },
          query_porject: {
            label: this.$t('lang.project'),
            type: 'select',
            visible: String(Vue.roleType) === '0',
            options: []
          },
          query_vip_address: {
            label: this.$t('network.ipaddress'),
            type: 'input',
            validator: (value) => {
              if (!/^[\.0-9]*$/.test(value)) {
                throw new Error(this.$t('calcStorLang.NG_FILTER_IPV4_TIPS'));
              }
            }
          },
          query_operating_status: {
            label: this.$t('network.operateStatus'),
            type: 'select',
            options: [{
              label: this.$t('network.online'),
              value: 'ONLINE'
            }, {
              label: this.$t('network.offline'),
              value: 'OFFLINE'
            }, {
              label: this.$t('lang.ERROR'),
              value: 'ERROR'
            }, {
              label: this.$t('network.degrded'),
              value: 'DEGRADED'
            }]
          }
        }
      },
      searchBarValidatedParams: {},
      loadbalancer_floatingIP: "",
      floatipId: '',
      loadbalancer_projectid: '',
      vip_port_id: '',
      balanceName : "",
      addFlag: false,
      editFlag: false,
      floatingIPFlag: false,
      loadingip: false,
      loading: false,
      reloading: false,
      showBorder: true,
      query_porject: "",
      query_name: "",
      query_vip_address: "",
      query_operating_status: "",
      projectOption: [],
      projectName: "",
      selProjectFlg: false,
      close: "",
      floatingips: [],
      roleType: Vue.roleType + "",
      sortObj: {
        sortOrder: "ascending",
        sortField: "name"
      },
      edit_id: "",
      edit_name: "",
      edit_description: "",
      edit_ipaddress: "",
      edit_subnet: "",
      columns: [
        {
          prop: "name",
          label: Vue.t("lang.name")
        },
        {
          prop: "project_id",
          label: Vue.t("lang.project")
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
          prop: "vip_address",
          label: Vue.t("network.ipaddress")
        },
        // {
        //   prop: "vip_subnet_id",
        //   label: Vue.t("network.subnet")
        // },
        {
          prop: "fip_address",
          label: Vue.t("network.floatIpaddress")
        },
        {
          prop: "description",
          label: Vue.t("lang.desc")
        }
      ],
      columnsChecked: [
        "name",
        'amphora_id',
        "project_id",
        "operating_status",
        "provisioning_status",
        "vip_address",
        // "vip_subnet_id",
        "description",
        "fip_address"
      ],
      loadbalancerData: [],
      totalData: [],
      multipleSelection: [],
      operationMenus: [
        {
          icon: "fa-plus",
          name: Vue.t("network.create"),
          showflg: true,
          readOnly: true,
          enable(rowData) {
            return true;
          },
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
            let roleType = Vue.roleType + "";
            if (rowData["provisioning_status"] === "PENDING_UPDATE") {
              return false;
            } else {
              if (roleType != "0") {
                if (rowData["project_id"] == Vue.cookie.get("pid")) {
                  return true;
                } else {
                  return false;
                }
              }
              return true;
            }
          },
          handler: function(selectRows) {
            this.editFlag = true;
            let row = selectRows[0];
            this.edit_id = row["id"];
            this.edit_name = row["name"];
            this.edit_description = row["description"];
            this.edit_ipaddress = row["vip_address"];
            this.edit_subnet = row["vip_subnet_id"];
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: Vue.t("network.delete"),
          showflg: true,
          multi: true,
          enable(rowData) {
            if (rowData["provisioning_status"] == "PENDING_UPDATE") {
              return false;
            } else {
              let roleType = Vue.roleType + "";
              if (roleType != "0") {
                if (rowData["project_id"] == Vue.cookie.get("pid")) {
                  return true;
                } else {
                  return false;
                }
              }
              return true;
            }
          },
          handler: function(selectRows) {
            let self = this;
            let row = selectRows[0];
            self
              .$prompt(
                Vue.t("network.deleteLbTip") + Vue.t("network.confirmDelete"),
                Vue.t("network.attention"),
                {
                  confirmButtonText: Vue.t("lang.confirm"),
                  cancelButtonText: Vue.t("lang.cancel"),
                  inputPattern: /^YES$|^NO$/i,
                  inputValue: "NO",
                  customClass: "promptConfirmDel",
                  inputErrorMessage: Vue.t("lang.onlyAcceptYesOrNo"),
                  closeOnClickModal: false
                }
              )
              .then(async ({ value }) => {
                if ("yes" == value.toLowerCase()) {
                  self.$message(Vue.t("network.deleteSendSuccess"));
                  row["provisioning_status"] = "PENDING_UPDATE";
                  self
                    .$sequence({
                      type: "DELETE",
                      url: "api/octavia/v2.0/lbaas/inspurloadbalancers/{id}",
                      params: selectRows,
                      log: {
                        description: {
                          en: "Delete Balance",
                          zh_cn: "删除负载均衡"
                        },
                        key: "name",
                        target: Vue.logTarget.balance
                      }
                    })
                    .then(data => {
                      self.$refs.loadbalancerTable.clearSelection();
                      self.getData();
                    })
                    .catch(err => {
                      self.$refs.loadbalancerTable.clearSelection();
                      self.getData();
                    });
                }
              })
              .catch(() => {});
          }.bind(this)
        },
        {
          icon: "fa-bangdingFloatingip",
          name: Vue.t("network.bangdingFloatingip"),
          showflg: true,
          multi: false,
          enable(rowData) {
            return !rowData.fip_address && rowData.provisioning_status === "ACTIVE";
          },
          handler: function(selectRows) {
            this.vip_port_id = selectRows[0].vip_port_id;
            this.balanceName = selectRows[0] && selectRows[0].name;
            this.loadbalancer_projectid = selectRows[0].project_id;
            this.floatingIPFlag = true;
          }.bind(this)
        },
        {
          icon: "fa-unbangdingfloating",
          name: Vue.t("network.unbangdingfloating"),
          showflg: true,
          multi: false,
          enable(rowData) {
            return !!rowData.fip_address;
          },
          handler: function(selectRows) {
            this.floatipId = selectRows[0].fip_id;
            this.balanceName = selectRows[0] && selectRows[0].name;
            this.loadbalancer_floatingIP = selectRows[0].fip_address;
            this.freeFloatingIp();
          }.bind(this)
        }
      ]
    };
  },
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
    loadbalancerData: {
      immediate: false,
      handler: function(list) {
        let self = this;
        self.reloading = false;
        if (list != null) {
          for (let t = 0; t < list.length; t++) {
            let obj = list[t];
            if (obj["provisioning_status"].indexOf("PENDING_" >= 0)) {
              self.reloading = true;
              break;
            }
          }
        }
        if (self.totalData === null || self.totalData.length === 0) {
          self.reloading = true;
        }
        clearInterval(self.interPhyValid);
        if (self.reloading && !self._isDestroyed) {
          self.interPhyValid = setInterval(() => {
            self.getData(false);
          }, 10000);
        }
      }
    }
  },
  mounted() {
    let self = this;
    let roleType = Vue.roleType + "";
    if (roleType === "0") {
      Promise.all([self.getProjectList()]).then(function(result) {
        self.getData();
      });
    } else {
      Promise.all([
        self.getProjectListForuser()
      ]).then(function(result) {
        self.getData();
      });
    }
  },
  methods: {
    handleSearch(params) {
      let self = this;
      this.searchBarValidatedParams = params;
      self.getData();
    },
    freeFloatingIp() {
      let self = this;
      self.$confirm(
        Vue.t("network.confirmUnbanding"),
        Vue.t("network.attention"),
        {
          confirmButtonText: Vue.t("lang.confirm"),
          cancelButtonText: Vue.t("lang.cancel"),
          type: "warning",
          closeOnClickModal: false,
          callback: (action, instance) => {
            if (action === "confirm") {
              let reqdata = { floatingip: {} };
              self.$ajax({
                type: "get",
                url: "api/neutron/v2.0/floatingips/" + self.floatipId,
                errorKey: "NeutronError",
                success: function(result) {
                  if (result != null) {
                    let floatingip = result["floatingip"];
                    if (floatingip.fixed_ip_address == null) {
                      self.$message.error(Vue.t("network.thisfloatingrelesas"));
                    } else {
                      self.$ajax({
                        type: "PUT",
                        url: "api/neutron/v2.0/floatingips/" + self.floatipId,
                        data: JSON.stringify(reqdata),
                        successMsg: Vue.t("network.unbingsuccess"),
                        success: function(result) {
                          self.getData();
                        },
                        errorKey: "NeutronError",
                        log: {
                          description: {
                            en:
                              "Unbanding floating IP:" +
                              self.loadbalancer_floatingIP,
                            zh_cn: `为负载均衡器${self.balanceName}解除绑定浮动IP${self.loadbalancer_floatingIP}`
                          },
                          target: Vue.logTarget.balance
                        }
                      });
                    }
                  }
                },
                errFun() {
                }
              });
            }
          }
        }
      );
    },
    async getData(clear = true) {
      let self = this;
      let name = self.searchBarValidatedParams.query_name || "";
      let projectid = self.searchBarValidatedParams.query_porject || "";
      let operatingstatus = self.searchBarValidatedParams.query_operating_status || "";
      let vipaddress = self.searchBarValidatedParams.query_vip_address || "";
      if (clear) {
        self.$refs.loadbalancerTable.clearSelection();
      }
      if (roleType == "0") {
      } else {
        projectid = Vue.cookie.get("pid");
      }
      try {
        // self.loading = true;
        let obj = {};
        if (projectid != "") {
          obj.project_id = projectid;
        }
        if (operatingstatus != "") {
          obj.operating_status = operatingstatus;
        }
        let result = await self.$ajax({
          type: "get",
          url: "api/octavia/v2.0/lbaas/inspurloadbalancers?" + $.param(obj),
          errorKey: "NeutronError",
          complete: function(XMLHttpRequest, textStatus) {
            self.loading = false;
          }
        });

        let tempArr = result["loadbalancers"];
        tempArr.forEach(v => {
          if (v.amphora_id) {
            v.amphora_id = `amphora-${v.amphora_id}`;
          } else {
            v.amphora_id = '-';
          }
        });
        self.totalData = [];
        for (let i = 0; i < tempArr.length; i++) {
          let temp = tempArr[i];
          if (
            temp.name.indexOf(name) >= 0 &&
            temp["vip_address"].indexOf(vipaddress) >= 0
          ) {
            self.totalData.push(temp);
          }
        }
        self.loading = false;
      } catch (res) {}
    },
    getCurrentData(param) {
      this.loadbalancerData = param;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) {
        return;
      }
      self.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
      };
    },
    async getProjectList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default"
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
        console.log("获取项目列表失败");
      }
    },
    async getProjectListForuser() {
      let self = this;
      Vue.projectListforNet = [];
      let project = await self.$ajax({
        type: "GET",
        url: "api/keystone/v3/projects/" + Vue.cookie.get("pid"),
        showErrMsg: false
      });
      Vue.projectListforNet.push(project["project"]);
    },
    uniqueIds(arr) {
      let result = [];
      for (let i = 0; i < arr.length; i++) {
        if (result.indexOf(arr[i]) == -1) {
          result.push(arr[i]);
        }
      }
      return result;
    },
    handleAddShow() {
      this.addFlag = false;
      this.$refs.loadbalancerTable.clearSelection();
      this.getData();
    },
    handleEditShow() {
      this.editFlag = false;
      this.$refs.loadbalancerTable.clearSelection();
      this.getData();
    },
    handleCancelShow() {
      this.editFlag = false;
      this.addFlag = false;
    },
    handleFloatingipShow() {
      this.floatingIPFlag = false;
      this.getData();
    },
    showDetail(index, row, e) {
      if (row["provisioning_status"] === "ERROR") {
        this.$message(Vue.t("network.balanceDetailTip"));
        return;
      }
      this.$cookie.set("lbcommon", row["provisioning_status"]);
      let loadbalancerId = row["id"];
      let projectId = row["project_id"];
      this.$router.push({
        path: "/net/balanceView/balanceMonitor/" + loadbalancerId + "/" + projectId
      });
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.loadbalancerTable.toggleRowSelection(row, false);
      // })
      this.multipleSelection = val;
    },
    // handleExpandChange(row, expandedRows) {
    // let self = this;
    // self.loadingip = true;
    // let floatingIP = "";
    // self.$ajax({
    //   type: "GET",
    //   url: "api/neutron/v2.0/floatingips?port_id="+row["vip_port_id"],
    //   errorKey: "NeutronError",
    //   success: function(result2) {
    //     let fips = result2["floatingips"];
    //     if (fips.length > 0) {
    //       floatingIP = fips[0]["floating_ip_address"];
    //     } else {
    //       floatingIP = Vue.t('network.nothing');
    //     }
    //     for (let i = 0; i < self.totalData.length; i++) {
    //       let temp = self.totalData[i];
    //       if (row["id"] === temp["id"]) {
    //         temp.floatingIP = floatingIP;
    //       }
    //     }
    //     self.loadingip = false;
    //   }
    // });
    // },
    listenersRender(value, row) {
      return value.length;
    },
    //操作状态转换
    operatingStatusRender(row) {
      if (row["operating_status"] === "ONLINE") {
        return Vue.t("network.online");
      } else if (row["operating_status"] === "OFFLINE") {
        return Vue.t("network.offline");
      } else if (row["operating_status"] === "ERROR") {
        return Vue.t("lang.ERROR");
      } else if (row["operating_status"] === "DEGRADED") {
        return Vue.t("network.degrded");
      } else if (row["operating_status"] === "DRAINIG") {
        return Vue.t("network.drainig");
      } else if (row["operating_status"] === "NO_MONITOR") {
        return Vue.t("network.nomonitor");
      }
    },
    //配置状态转换
    provisioningStatusRender(row) {
      if (row["provisioning_status"] === "ACTIVE") {
        return Vue.t("lang.ACTIVE");
      } else if (
        row["provisioning_status"] === "PENDING_UPDATE"
      ) {
        return Vue.t("network.pendingupdate");
      } else if (
        row["provisioning_status"] === "PENDING_DELETE"
      ) {
        return Vue.t("network.pendingdelete");
      } else if (row["provisioning_status"] === "PENDING_CREATE") {
        return Vue.t("network.createing");
      } else if (row["provisioning_status"] === "ERROR") {
        return Vue.t("lang.ERROR");
      } else if (row["provisioning_status"] === "deleting") {
        return Vue.t("network.operating");
      } else if (row["provisioning_status"] === "INACTIVE") {
        return Vue.t("lang.DOWN");
      } else if (row["provisioning_status"] === "DELETD") {
        return Vue.t("network.deletd");
      } else {
        return row["provisioning_status"];
      }
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
        return "gray";
      } else {
        return "info";
      }
    },
    projectToName(projectId) {
      let proList = Vue.projectListforNet;
      for (let i = 0; i < proList.length; i++) {
        if (projectId === proList[i]["id"]) {
          return proList[i]["name"];
        }
      }
    },
    managestatusRender(value) {
      if (value == true) {
        return "UP";
      } else {
        return "DOWN";
      }
    },
    // subnetRender(value) {
    //   let name = "";
    //   let subnets = Vue.subnetsList;
    //   for (let i = subnets.length - 1; i >= 0; i--) {
    //     let subnet = subnets[i];
    //     if (subnet.id === value) {
    //       name = subnet.name;
    //     }
    //   }
    //   return name;
    // },
    queryClick() {
      let self = this;
      self.getData();
    },
    onRefresh() {
      this.getData();
    },
    rowClick(row) {
      this.$refs.loadbalancerTable.toggleRowSelection(row);
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
      this.close = "close";
    },
    onIconClick() {
      this.query_porject = "";
      this.projectName = "";
      this.close = "";
    },
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
            }, Vue.t('network.operateStatusHeaderTip')),
            h('i', {
              class:"el-icon-fa-question-circle"
            })
          ])
      ]);
    },
    provisioningStatusHeader(h, {column, $index}) {
      return h('span', [
        h('span', {
          style:"margin-right:5px;"
        }, column.label),
        h('el-tooltip', {
          effect:"dark",
          placement:"top"}, [
            h('div', {
              'slot':"content"
            }, Vue.t('network.provisioningStatusHeaderTip')),
            h('i', {
              class:"el-icon-fa-question-circle"
            })
          ])
      ]);
    }
    // amphoraRenderHeader(h, {column, $index}) {
    //   return h('span', [
    //     h('span', {
    //       style:"margin-right:5px;"
    //     }, column.label),
    //     h('el-tooltip', {
    //       effect:"dark",
    //       placement:"top"}, [
    //         h('div', {
    //           'slot':"content"
    //         }, Vue.t('network.AMPHORA_RENDERHEADER_TIP')),
    //         h('i', {
    //           class:"el-icon-fa-question-circle"
    //         })
    //       ])
    //   ]);
    // }
  }
};
</script>
