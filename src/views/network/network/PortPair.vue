<template>
<div>
  <div class="operation-panel margin-tb5"  v-show="showOperation">
    <operation-panel
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
  </div>
  <div class="divider clearfix"></div>
  <el-table
    ref="ipaddressTable"
    :data="ipaddresstableData"
    highlight-current-row
    stripe
    border
    v-loading="loading"
    style="width: 100%;"
    row-key="id"
    @row-click="rowClick"
    @selection-change="handleSelectionChange">
    <el-table-column
      reserve-selection
      type="selection"
      width="55" align="center">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('ip_address') >= 0"
      :label="$t('network.iporcidr')"
      prop="ip_address"
      min-width="100">
    </el-table-column>
    <el-table-column
      v-if="columnsChecked.indexOf('mac_address') >= 0"
      :label="$t('network.macAddress')"
      prop="mac_address"
      min-width="100">
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
        <span>{{$t("lang.currentSelected")}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
        <el-popover
          placement="right"
          trigger="click">
          <el-checkbox-group class="vertical"
            v-model="columnsChecked">
            <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
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
  <add-ippare v-if="addpareFlag" @handleAddpareShow="handleAddpareShow" :portId="portId" :totalData="totalData" @handleCancelShow="handleCancelShow"></add-ippare>
</div>  
</template>
<script>
import AddIppare from './AddIppare';
export default {
  name: "detail",
  components: {
    AddIppare
  },
  props: ["check_project", "portId"],
  data() {
    return {
      loading:false,
      showOperation: true,
      columnsChecked: ['ip_address', 'mac_address'],
      columns: [{
        prop: "ip_address",
        label: Vue.t('network.iporcidr')
      }, {
        prop: "mac_address",
        label: Vue.t('network.macAddress')
      }],
      totalData: [],
      ipaddresstableData: [],
      multipleSelection: [],
      addpareFlag: false,
      operationMenus:[{
        icon: "fa-plus",
        name: Vue.t('lang.addTo'),
        showflg: true,
        readOnly: true,
        handler: function(selectRows) {
          this.addpareFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('network.delete'),
        showflg: true,
        multi: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          this.$confirm(Vue.t('network.confirmSimpleDelete'), Vue.t('network.attention'), {
            confirmButtonText: Vue.t('lang.confirm'),
            cancelButtonText: Vue.t('lang.cancel'),
            type: "warning",
            closeOnClickModal: false,
            callback: (action, instance) => {
              if (action === "confirm") {
                let deleteNames = [];
                let tData = [];
                for (let i = 0; i < self.totalData.length; i++) {
                  tData.push(self.totalData[i]);
                }
                for (let i = 0; i < tData.length; i++) {
                  let obj = tData[i];
                  obj.delflag = "0";
                  for (let j=0; j <selectRows.length; j++) {
                    let row = selectRows[j];
                    if (row["id"] == obj["id"]) {
                        deleteNames.push(obj["ip_address"]);
                      obj.delflag = "1";
                      break;
                    }
                  }
                }
                for (let i = tData.length-1; i>=0; i--) {
                  let obj = tData[i];
                  if (obj.delflag == "1") {
                    tData.splice(i, 1);
                  }
                }
                let newtotalData = [];
                for (let i = 0; i < tData.length; i++) {
                  let obj = tData[i];
                  let newobj = {};
                  newobj["ip_address"] = obj["ip_address"];
                  newobj["mac_address"] = obj["mac_address"];
                  newtotalData.push(newobj);
                }
                let reqdata = {"port":{
                  "allowed_address_pairs": newtotalData
                  }
                };
                self.loading = true;
                self.$ajax({
                  type: "PUT",
                  url: "api/neutron/v2.0/ports/"+this.portId,
                  data: JSON.stringify(reqdata),
                   complete: function(XMLHttpRequest, textStatus) {
                    self.loading = false;
                  },
                  success: function(result) {
                    self.$notify({
                      message: Vue.t('network.deleteaddresspairs'),
                      type: "success"
                    });
                    self.getIPpareList();
                  },
                  errorKey: "NeutronError",
                  log:{
                    description:{
                      en:"Delete IP Pair:"+deleteNames.join(","),
                      zh_cn:"删除可用地址对:"+deleteNames.join(",")
                    },
                    target:Vue.logTarget.port
                  }
                });
              }
            }
          });
        }.bind(this)
      }]
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
  updated() {
  },
  mounted() {
    this.initDetail(this.check_project);
  },
  methods: {
    initDetail(checkproject) {
      // let roleType = Vue.roleType + "";
      // if (roleType=="0") {
      //   this.showOperation = true;
      // } else {
      //   if (checkproject == "true") {
      //     this.showOperation = true;
      //   } else {
      //     this.showOperation = false;
      //   }
      // }
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/ports/"+this.portId,
        data: {},
        success: function(result) {
          let port = result["port"];
          let pairs = [];
          pairs = port["allowed_address_pairs"];
          for (let i = 0; i < pairs.length; i++) {
            pairs[i].id = (new Date().getTime()).toString() + i;
          }
          self.totalData = pairs;
        },
        errorKey: "NeutronError"
      });
    },
    getIPpareList() {
      let self = this;
      self.$refs.ipaddressTable.clearSelection();
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/ports/"+this.portId,
        data: {},
        success: function(result) {
          let port = result["port"];
          self.portid = port["id"];
          let pairs = [];
          pairs = port["allowed_address_pairs"];
          for (let i = 0; i < pairs.length; i++) {
            pairs[i].id = (new Date().getTime()).toString() + i;
          }
          self.totalData = pairs;
        },
        errorKey: "NeutronError"
      });
    },
    getCurrentData(param) {
      this.ipaddresstableData = param;
    },
    rowClick(row) {
      this.$refs.ipaddressTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      // val.forEach((row, index) => {
      //   if (index === val.length - 1) return;
      //   this.$refs.ipaddressTable.toggleRowSelection(row, false);
      // });
      this.multipleSelection = val;
    },
    handleAddpareShow() {
      this.addpareFlag = false;
      this.getIPpareList();
    },
    handleCancelShow() {
      this.addpareFlag = false;
    },
    onRefresh() {
      this.getIPpareList();
    },
    backToPortList() {
      this.$emit("onBack", {});
    }
  }
}
</script>