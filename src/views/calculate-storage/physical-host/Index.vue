<template>
  <div>
    <el-form :inline="true" v-model="formInline" class="form-inline">
      <el-form-item label="名称">
        <el-input placeholder="名称" size="small" v-model="phyName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' size="small" @click="searchPhyList">查询</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus" :operateMore="operateMore">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="acTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="uuid" @current-change="handleSelectionChange" :default-sort="{prop: 'name', order: 'ascending'}"  @sort-change="sortChange">
      <!-- <el-table-column reserve-selection type="selection" width="55">
      </el-table-column> -->
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" label="名称" prop="name" min-width="50" sortable="custom">
        <template slot-scope="scope">
          <el-button @click="phyDetail(scope.row)" type="text" size="small">{{scope.row.name || scope.row.uuid || '-'}}</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('instance_uuid') >= 0" label="云主机(ID)" prop="instance_uuid" min-width="120">
        <template slot-scope="scope">
          <span v-html="instanceRender(scope.row.instance_uuid, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('driver_info') >= 0" label="BMC地址" prop="driver_info" align="left" min-width="80">
        <template slot-scope="scope">
          <span v-html="bmcAddressRender(scope.row.driver_info, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('power_state') >= 0" prop="power_state" label="电源状态" min-width="50" sortable="custom" align="left">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.power_state)">
            <span v-html="statusRender(scope.row.maintenance, scope.row)"></span>
          </el-tag>
          <!-- <span v-html="statusRender(scope.row.maintenance, scope.row)"></span> -->
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('provision_state') >= 0" prop="provision_state" label="部署状态" min-width="30" align="left">
        <template slot-scope="scope">
          <span v-html="provisonRender(scope.row.provision_state, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('maintenance') >= 0" prop="maintenance" label="维护模式" min-width="30" align="left">
        <template slot-scope="scope">
          <span v-html="maintenanceRender(scope.row.maintenance, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('ports') >= 0" prop="ports" label="端口个数" min-width="50" sortable="custom" align="left">
        <template slot-scope="scope">
          <span v-html="portRender(scope.row.ports, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('driver') >= 0" prop="driver" label="驱动" min-width="50" align="left">
      </el-table-column>
      <!-- <el-table-column label="操作" min-width="50">
        <template slot-scope="scope">
          <el-button @click="phyDetail(scope.row)" type="text" size="small">详情</el-button>
        </template>
      </el-table-column> -->
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>当前选中 {{multipleSelection.length}}条</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>请选择列</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>
    <add-physical-host v-if="addPhyFlag" @handlePhyHostShow="handlePhyHostShow" :operateType="operateType" :phyEntity="phyEntity" @onRefresh="onRefresh" @getDataList="getDataList"></add-physical-host>
    <!-- <create-port v-if="portFlag" @phyPort="phyPort"></create-port> -->
    <!-- <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-left" @click="onBack">返回</el-button>
          </div>
          <div>
            <physical-tabs :phyHostUuid="phyHostUuid"></physical-tabs>
          </div>
        </panel>
      </div>
    </transition> -->
  </div>
</template>
<script>
import AddPhysicalHost from './AddPhysicalHost';
import PhysicalTabs from './PhysicalTabs';
export default {
  name: 'DomainManagement',
  components: { AddPhysicalHost, PhysicalTabs },
  data() {
    return {
      formInline: '',
      totalData: [],
      phyName: '',
      phyList: [],
      phyMaps: new Map(),
      portMaps: new Map(),
      addPhyFlag: false,
      operateType: 1, //1添加 2 编辑
      phyEntity: '',
      specShareFlag: false,
      detailFlag: false,
      portFlag: false,
      specUuid: '',
      currentPage: 1,
      showBorder: true,
      columns: [],
      loading: true,
      reloadTblFlag: false,
      phyHostUuid: '',
      columnsChecked: ['name', 'instance_uuid', 'driver_info', 'power_state', 'provision_state', 'maintenance', 'ports', 'driver'],
      tableData: [],
      multipleSelection: [],
      operateMore: true,
      operationMenus: [{
        icon: "fa-plus",
        name: "创建",
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
        icon: "fa-play",
        name: "开启",
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
            confirmMsg: "确定开启物理机？",
            successMsg: "开启发送成功",
            log: {
                  description: {
                    en: "Start Physical",
                    zh_cn: "开启物理机"
                  },
                  key: "name",
                  target: Vue.logTarget.computePhysical
               }
          }).then((data) => {
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
            }, 5000);
          }).catch((err) => {
            console.log(err);
          });
        }.bind(this)
      }, {
        icon: "fa-stop",
        name: "关闭",
        showflg: true,
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
            confirmMsg: "确定关闭物理机？",
            successMsg: "关闭发送成功",
            log: {
                  description: {
                    en: "Close Physical",
                    zh_cn: "关闭物理机"
                  },
                  key: "name",
                  target: Vue.logTarget.computePhysical
               }
          }).then((data) => {
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
            }, 5000);
          }).catch((err) => {});
        }.bind(this)
      }, {
        icon: "fa-refresh",
        name: "刷新",
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
      }, /*{
        icon: "fa-pencil-square-o",
        name: "编辑",
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          let row = selectRows[0];
          this.phyEntity = row;
          this.operateType = 2;
          this.addPhyFlag = true;
        }.bind(this)
      }, */{
        icon: "fa-chain-broken",
        name: "删除云物理机",
        showflg: true,
        operateMore: true,
        enable(rowData) {
          return ((rowData['provision_state'] == "manageable" || rowData['provision_state'] == "available") && rowData['power_state'] != "BUSY");
        },
        handler: function(selectRows) {
          var self = this;
          self.$prompt("输入 YES 继续确认操作", '确认', {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            inputPattern: /^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage: "只接受YES或NO"
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
              self.$sequence({
                type: 'delete',
                url: 'api/ironic/v1/nodes/{uuid}',
                params: selectRows,
                log: {
                  description: {
                    en: "Delete Baremetal Instance:",
                    zh_cn: "删除云物理机"
                  },
                  key: "name",
                  target: Vue.logTarget.computeInstance
               }
              }).then((data) => {
                self.loading = true;
                for (var r = 0; r < selectRows.length; r++) {
                  var row = selectRows[r];
                  var phy = self.phyMaps.get(row.uuid);
                  phy['power_state'] = "BUSY";
                }
                self.$message("删除发送成功");
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
        name: "进入维护模式",
        showflg: true,
        operateMore: true,
        enable(rowData) {
          return (rowData['maintenance'] + "" == "false");
        },
        handler: function(selectRows) {
          var self = this;
          self.$prompt("确定进入维护模式？进入维护模式原因：", '确认', {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            inputPattern:/^\S{0,50}$/,
            inputErrorMessage:"不能超过50个字符"
          }).then(async({ value }) => {
            var body = {"reason": value};
            body = JSON.stringify(body);
            self.$sequence({
              type: 'put',
              url: 'api/ironic/v1/nodes/{uuid}/maintenance',
              data: body,
              params: selectRows,
              successMsg: "进入维护模式发送成功",
              log: {
                  description: {
                    en: "Enter maintenance",
                    zh_cn: "物理机进入维护模式"
                  },
                  key: "name",
                  target: Vue.logTarget.computePhysical
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
        name: "退出维护模式",
        showflg: true,
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
            confirmMsg: "确定退出维护模式？",
            successMsg: "退出维护模式发送成功",
            log: {
                  description: {
                    en: "Exist maintenance",
                    zh_cn: "物理机退出维护模式"
                  },
                  key: "name",
                  target: Vue.logTarget.computePhysical
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
        name: "转为可用",
        showflg: true,
        operateMore: true,
        enable(rowData) {
          return rowData['provision_state'] == "manageable";
        },
        handler: function(selectRows) {
          var self = this;
          var body = {"target": "provide"};
          body = JSON.stringify(body);
          self.$sequence({
            type: 'put',
            url: 'api/ironic/v1/nodes/{uuid}/states/provision',
            params: selectRows,
            data: body,
            confirmMsg: "确定转为可用？",
            successMsg: "转为可用发送成功，请稍候点击刷新查看",
            log: {
                  description: {
                    en: "Change available",
                    zh_cn: "物理机转为可用"
                  },
                  key: "name",
                  target: Vue.logTarget.computePhysical
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
        name: "转为可管理",
        showflg: true,
        operateMore: true,
        enable(rowData) {
          return (rowData['provision_state'] == "enroll" || rowData['provision_state'] == "available");
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
            confirmMsg: "确定转为可管理？",
            successMsg: "转为可管理发送成功，请稍候点击刷新查看",
            log: {
                  description: {
                    en: "Change manageable",
                    zh_cn: "物理机转为可管理"
                  },
                  key: "name",
                  target: Vue.logTarget.computePhysical
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
            if (obj['power_state'] == "BUSY") {
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
    sortChange(column) {
       var self = this;
       var key = column.prop;
       var keyOrder = column.order;
       if (keyOrder != null && self.totalData != null) {
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
       var self = this;
      self.phyList = [];
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/ironic/v1/nodes/detail'
        });
        var list = result['nodes'];
        if (list != null) {
          for (let p = 0; p < list.length; p++) {
            var phyObj = list[p];
            self.phyList.push(phyObj);
            self.phyMaps.set(phyObj.uuid, phyObj);
          }
        }
        for (let v = 0; v < list.length; v++) {
            var phy = list[v];
            var nodeId = phy['uuid'];
            phy.ports = self.portMaps.get(nodeId) || "0";
            phy['power_state'] = phy['power_state'] || "";
        }
        if (self.phyName != "") {
          self.searchPhyList();
        } else {
          self.totalData = result['nodes'];
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
      var self = this;
      var name = (self.phyName).toLowerCase();
      var rets = [];
      if (name != "") {
        for (let s = 0; s < self.phyList.length; s++) {
          var obj = self.phyList[s];
          if (obj['name'] == null) {
            if (obj['uuid'].toLowerCase().indexOf(name) >= 0) {
              rets.push(obj);
            }
          } else {
            if (obj['name'].toLowerCase().indexOf(name) >= 0) {
              rets.push(obj);
            }
          }
        }
        self.totalData = rets;
      } else {
        self.getDataList();
      }
    },
    async deleteSpecs(row) {
      var self = this;
      try {
        let result = await this.$ajax({
          type: 'delete',
          url: 'api/nova/v2.1/flavors/' + row['id'],
          confirmMsg: "确定删除资源规格？",
          successMsg: "成功删除资源规格。"
          // showErrMsg: false
        });
        self.$refs.acTable.clearSelection();
        self.getTestData(this.currentPage);
      } catch (data) {
        __DEV__ && console.error(data);
      }
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
          return "注册";
       } else if ("available" == value) {
          return "可用";
       } else if ("verifying" == value) {
          return "验证中";
       } else if ("manageable" == value) {
          return "可管理";
       } else if ("inspecting" == value) {
          return "检查中";
       } else if ("insect failed" == value) {
          return "检查失败";
       } else if ("cleaning" == value) {
          return "清理中";
       } else if ("clean failed" == value) {
          return "清理失败";
       } else if ("deploying" == value) {
          return "部署中";
       } else if ("wait call-back" == value) {
          return "部署中";
       } else if ("deploy failed" == value) {
          return "部署失败";
       } else if ("active" == value) {
          return "部署完成";
       } else if ("deleting" == value) {
          return "回滚配置";
       } else if ("error" == value) {
          return "错误";
       } else if ("adopting" == value) {
          return "通过中";
       } else if ("adopt failed" == value) {
          return "通过失败";
       }
    },
    statusRender(value, rowData) {
      var status = rowData['power_state'];
      if ("power on" == status) {
        return "开机";
      } else if ("power off" == status) {
        return "关闭";
      } else if ("BUSY" == status) {
        return "忙碌";
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
        return "是";
      } else {
        return "否";
      }
    },
    portRender(value, rowData) {
      var self = this;
      var nodeId = rowData['uuid'];
      return self.portMaps.get(nodeId) || "0";
      /*if (rowData['ports'] != null) {
        return rowData['ports'].length;
      } else {
        return '-';
      }*/
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    phyDetail(row) {
      var self = this;
      self.phyHostUuid = row['uuid'];
      this.$router.push({
        path: '/calculate-storage/physical-host/detail?phyHostUuid=' + self.phyHostUuid + '&name=' + row.name,
        params: {
          phyHostUuid: self.phyHostUuid
        }
      });
      // self.detailFlag = true;
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
      if (val != null) {
        var list = [];
        list.push(val);
        this.multipleSelection = list;
      }
    },
    onRefresh() {
      this.$refs.acTable.clearSelection();
      this.multipleSelection = [];
      this.phyName = "";
      this.getDataList();
    }
  }
}

</script>
<style scoped>


</style>
