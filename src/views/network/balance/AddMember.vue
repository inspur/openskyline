<template>
<el-dialog
  :title="$t('network.respoolMember')"
  :visible.sync="dialogVisible"
  :before-close="handleClose">
  <el-form class="margin-tb20" label-position="right" >
    <el-form-item>
      <el-collapse v-model="activeName">
        <el-collapse-item :title="$t('network.addpoolMember')" name="1">
          <div class="operation-panel margin-tb5">
            <operation-panel
            :select-rows="multipleSelection"
            :operation-menus="operationMenus">
            </operation-panel>
          </div>
          <el-table
             ref="memberTable"
             :data="memberTableData"
             highlight-current-row
             border
             stripe
             style="width: 100%"
             row-key="id">
            <el-table-column
              prop="addresses"
              :label="$t('network.ipaddress')"
              align="left"
              min-width="120">
              <template slot-scope="scope">
                <span v-if="showspanRender(scope.row.addresses)">{{scope.row.address}}</span>
                <el-select v-if="showipselect(scope.row.addresses)" v-model="ipaddressvalue" @change="ipselectChange">
                  <el-option v-for="item in scope.row.addresses"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"></el-option>
                </el-select>
                <el-input v-if="scope.row.subnetFlag" v-model="scope.row.address" @change="addressChange(scope.row.address, scope.row)"></el-input>
                <div class="col-24" v-if="scope.row.addressFlag">
                  <span style="color:red">{{$t('network.ipaddressError')}}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="subnetname"
              :label="$t('network.subnet')"
              align="left"
              min-width="100">
              <template slot-scope="scope">
                <span v-if="!scope.row.subnetFlag">{{scope.row.subnetname}}</span>
                <el-select v-model="scope.row.subnetid" @change="ipversionChange(scope.row.subnetid, scope.row)" v-if="scope.row.subnetFlag">
                  <el-option v-for="item in subnetList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              prop="port"
              :label="$t('network.port')"
              align="left"
              min-width="120">
              <template slot-scope="scope">
                <el-input v-model="scope.row.port" style="width:140px;" @change="portChange(scope.row.port, scope.row)"></el-input>
                <div class="col-24" v-if="scope.row.portFlag">
                  <span style="color:red">{{$t('network.portNote1')}}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="weight"
              :label="$t('network.weight')"
              align="left"
              min-width="120">
              <template slot-scope="scope">
                <el-input v-model="scope.row.weight" style="width:140px;" @change="weightChange(scope.row.weight, scope.row)"></el-input>
                <div class="col-24" v-if="scope.row.weightFlag">
                  <span style="color:red">{{$t('network.weightNote1')}}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('network.operation')"
              align="left"
              min-width="50">
              <template slot-scope="scope">
                <el-button @click.native.prevent="deleteRow(scope.row)" type="text" size="small">{{$t('network.remove')}}</el-button>
              </template>
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
                  <!-- <el-checkbox-group class="vertical"
                    v-model="columnsChecked">
                    <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                    </el-checkbox>
                  </el-checkbox-group> -->
                  <div slot="reference" class="name-wrapper">
                    <el-tag>{{$t('network.columnSelected')}}</el-tag>
                  </div>
                </el-popover>
              </el-col>
              <el-col :span="19">
                <page :totalData="totalData" @getTotalData="getTotalData"></page>
              </el-col>
            </el-row>
          </div>
        </el-collapse-item>
        <el-collapse-item :title="$t('network.memberuseinner')" name="2">
          <el-form :inline="true" class="form-inline">
            <el-form-item :label="$t('lang.name')">
              <el-input  size="small" v-model="query_name"></el-input>
            </el-form-item>
            <!--
            <el-form-item label="IP地址">
              <el-input size="small" v-model="query_ip"></el-input>
            </el-form-item>
            -->
            <el-form-item>
              <el-button type="primary" icon='fa-search' size="small" @click="queryserverTable">{{$t('lang.query')}}</el-button>
            </el-form-item>
          </el-form>
          <el-table
             ref="serverTable"
             :data="serverTableData"
             highlight-current-row
             border
             stripe
             style="width: 100%"
             row-key="id">
            <el-table-column
              prop="name"
              :label="$t('lang.name')"
              align="left"
              min-width="100">
            </el-table-column>
            <el-table-column
              prop="addresses"
              :label="$t('network.ipaddress')"
              align="left"
              min-width="100">
              <template slot-scope="scope">
                <span v-html="serverIpRender(scope.row.addresses)"></span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('network.operation')"
              align="left"
              min-width="100">
              <template slot-scope="scope">
                <el-button @click.native.prevent="addtoMember(scope.row)" type="text" size="small">{{$t('base.addTo')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="24">
                <page :totalData="serverTotalData" @getCurrentData="getCurrentData"></page>
              </el-col>
            </el-row>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form-item>
    <el-form-item style="padding-left:100px;">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
     <el-button type="primary" @click="save">{{$t('lang.confirm')}}</el-button>
    </el-form-item>
  </el-form>
  </el-dialog>
</template>
<script>
export default {
  props: ["poolId"],
  data() {
    return {
      dialogVisible: false,
      activeIndex: 3,
      activeName: ['1', '2'],
      memberTableData: [],
      serverTableData: [],
      serverTotalData: [],
      multipleSelection: [],
      subnetList: Vue.subnetsList,
      totalData: [],
      // columnsChecked: ['address', 'subnet_id','port', 'weight'],
      subnet: "",
      projectId: "",
      query_name: "",
      query_ip: "",
      ipaddressvalue: "",
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('network.addoutmember'),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          let timeId = new Date().getTime();
          if (this.memberTableData.length >=5) {
            this.$message({
              type:"warning",
              message:Vue.t('network.ADD_UP_TO_N_NEW_NUMBERS', {numbers:5})
            });
            return;
          }
          this.memberTableData.push({
            id: timeId.toString(),
            vmid: "",
            name: "",
            address: "",
            addresses: [],
            subnetid: "",
            subnetversion: "",
            port: "",
            subnetname: "",
            weight: "1",
            addressFlag: false,
            weightFlag: false,
            portFlag: false,
            subnetFlag: true
          })
        }.bind(this)
      }]
    }
  },
  mounted() {
    //子网展示IP段
    this.dialogVisible = true;
    // for (let i=0; i<this.subnetList.length; i++) {
    //   let s = this.subnetList[i];
    //   s["name"] = s["cidr"] + "("+ s["name"]+")";
    // }
    this.getPoolsMembersInfo(this.poolId);
    this.getServerList();
  },
  methods: {
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("cancel");
    },
    async getServerList(name="", ip="") {
      let self = this;
      try {
        let roleType = Vue.roleType + "";
        let url = "";
        if (roleType == "0") {
          url = "api/nova/v2.1/servers/detail?all_tenants=1&project_id="+this.projectId;
        } else {
          url = "api/nova/v2.1/servers/detail?project_id="+this.projectId
        }
        let result = await self.$ajax({
          type: "GET",
          url: url
        });
        let tempList = result["servers"];
        self.serverTotalData = [];
        for (let i = 0; i < tempList.length; i++) {
          let vm = tempList[i];
          let tempobj = {};
          let timeId = new Date().getTime() + i;
          tempobj.id = timeId+"";
          tempobj.vmid = vm["id"];
          tempobj.name = vm["name"];
          let addresses = vm["addresses"];
          let ips = [];
          let addressesSize = 0;
          let f = false;
          for ( let key in addresses) {
            addressesSize++;
            let a = addresses[key];
            tempobj.address = a[0]["addr"];
            for (let j = 0; j < a.length; j++) {
              if ((a[j]["version"] + "") === "4") {
                f = true;
                ips.push(a[j]["addr"]);
              }
            }
          }
          if (!f) {
            continue;
          }
          if (addressesSize > 0) {
            tempobj.addresses = ips;
            tempobj.port = "";
            tempobj.weight = "1";
            tempobj.addressFlag = false;
            tempobj.weightFlag = false;
            tempobj.portFlag = false;
            tempobj.subnetFlag = false;
            if (tempobj.name.indexOf(name) >= 0) {
              self.serverTotalData.push(tempobj);
            }
          }
        }
        for (let i = 0; i < tempList.length; i++) {
          let vm = tempList[i];
          self.getSubnetInfo(vm["id"]);//根据云主机ID获取子网详情
        }
      } catch (res) {
      }
    },
    async getSubnetInfo(vmId) {
      let self = this;
      try {
        let result = await self.$ajax({
          type: "GET",
          url: "api/nova/v2.1/servers/"+vmId+"/os-interface"
        });
        let tempList = result["interfaceAttachments"];
        if (tempList.length > 0) {
          //获取子网ID和名称
          let fixedips = tempList[0]["fixed_ips"];
          let tempips = fixedips[0];
          let subnetId = tempips["subnet_id"];
          self.getSubnetName(subnetId, vmId);
          for (let i = 0; i < self.serverTotalData.length; i++) {
            let tempobj = self.serverTotalData[i];
            if (tempobj["vmid"] === vmId) {
              tempobj.subnetid = subnetId;
              break;
            }
          }
        }
      } catch (res) {
      }
    },
    getSubnetName(subnetId, vmId) {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/subnets/"+subnetId,
        data: {},
        errorKey: "NeutronError",
        success: function(subnetResult) {
          let subnet = subnetResult["subnet"];
          let subnetname = subnet["name"];
          for (let i = 0; i < self.serverTotalData.length; i++) {
            let tempobj = self.serverTotalData[i];
            if (tempobj["vmid"] === vmId) {
              tempobj.subnetname = subnetname;
              tempobj.subnetversion = subnet["ip_version"];
              break;
            }
          }
        }
      });
    },
    getCurrentData(param) {
      this.serverTableData = param;
    },
    addtoMember(row) {
      let self = this;
      if (this.memberTableData.length >=5) {
        this.$message({
          type:"warning",
          message:Vue.t('network.ADD_UP_TO_N_NEW_NUMBERS', {numbers:5})
        });
        return;
      }
      self.memberTableData.push(row);
      for (let i = 0; i < self.serverTotalData.length; i++) {
        let server = self.serverTotalData[i];
        if (server["id"] === row["id"]) {
          self.serverTotalData.splice(i, 1);
        }
      }
    },
    deleteRow(row) {
      let self = this;
      if (row["vmid"] != "") {
        self.serverTotalData.push(row);
      }
      for (let i = 0; i < this.memberTableData.length; i++) {
        let temp = this.memberTableData[i];
        if (temp["id"] === row["id"]) {
          this.memberTableData.splice(i, 1);
        }
      }
    },
    serverIpRender(fixedips) {
      let ipstring = "";
      if (fixedips.length > 1 ) {
        for (let i = 0; i < fixedips.length; i++) {
          if (fixedips.length === i+1) {
            ipstring += fixedips[i].name;
          } else {
            ipstring += fixedips[i].name + ",  ";
          }
        }
      } else {
        ipstring = fixedips[0];
      }
      return ipstring;
    },
    ipselectChange(value) {
      for (let i = 0; i < this.memberTableData.length; i++) {
        let temp = this.memberTableData[i];
        for (let j = 0; j < temp.addresses.length; j++) {
          if (temp.addresses[j].id === value) {
            temp.address = value;
          }
        }
      }
    },
    showipselect(fixedips) {
      if (fixedips.length > 1) {
        return true;
      } else {
        return false;
      }
    },
    showsubnetselect(value) {
      if (value === "") {
        return true;
      } else {
        return false;
      }
    },
    showspanRender(arr) {
      if (arr.length === 1) {
        return true;
      } else {
        return false;
      }
    },
    showInputipRender(arr) {
      if (arr.length === 0) {
        return true;
      } else {
        return false;
      }
    },
    ipversionChange(sid, row) {
      let self = this;
      for (let i = 0; i < self.subnetList.length; i++) {
        let subnet = self.subnetList[i];
        if (sid === subnet["id"]) {
          row.subnetversion = subnet["ip_version"];
          row.subnetname = subnet["name"];
        }
      }
    },
    queryserverTable() {
      this.getServerList(this.query_name, this.query_ip);
    },
    portChange(port, row) {
      let reg = /^\d+$/;
      let regFlag = false;
      if (reg.test(port) && port>=1 && port<=65535) {
        regFlag = false;
      } else {
        regFlag = true;
      }
      for (let i = 0; i < this.memberTableData.length; i++) {
        let temp = this.memberTableData[i];
        if (temp.id === row.id) {
          temp.portFlag = regFlag;
          break;
        }
      }
    },
    weightChange(weight, row) {
      let reg = /^\d+$/;
      let regFlag = false;
      if (reg.test(weight) && weight>=1 && weight<=256) {
        regFlag = false;
      } else {
        regFlag = true;
      }
      for (let i = 0; i < this.memberTableData.length; i++) {
        let temp = this.memberTableData[i];
        if (temp.id === row.id) {
          temp.weightFlag = regFlag;
          break;
        }
      }
    },
    addressChange(address, row) {
      let regIPv4 = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
      let regIPv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
      let regFlag = false;
      if (row["subnetversion"] == "6") {
        if (regIPv6.test(address)) {
          regFlag = false;
        } else {
          regFlag = true;
        }
      } else {
        if (regIPv4.test(address)) {
          regFlag = false;
        } else {
          regFlag = true;
        }
      }
      for (let i = 0; i < this.memberTableData.length; i++) {
        let temp = this.memberTableData[i];
        if (temp.id === row.id) {
          temp.addressFlag = regFlag;
          break;
        }
      }
    },
    save() {
      let self =this;
      let reqdata ={"members":[]}
      for (let i = this.memberTableData.length - 1; i >= 0; i--) {
        let inDt ={"address":this.memberTableData[i].address,
                  "subnet_id":this.memberTableData[i].subnetid,
                  "protocol_port":this.memberTableData[i].port,
                  "weight":this.memberTableData[i].weight,
                  "project_id": self.projectId,
                  "tenant_id": self.projectId
                  }
        reqdata["members"].push(inDt);
      }
      self.$ajax({
        type: 'POST',
        url: "api/octavia/v2.0/lbaas/pools/"+this.poolId+"/members",
        // url: "api/lbaas/pools/"+this.poolId+"/members",
        data: JSON.stringify(reqdata),
        complete: function(XMLHttpRequest, textStatus) {
          self.loading = false;
        },
        errorKey: "NeutronError"
      });
    },
    async getPoolsMembersInfo(poolsId) {
      let self = this;
      try {
        self.loading = true;
        let result = await self.$ajax({
          type: 'get',
          url: "api/octavia/v2.0/lbaas/pools/"+poolsId+"/members",
          complete: function(XMLHttpRequest, textStatus) {
            self.loading = false;
          }
        });
        self.totalData = result['members'];
      } catch (res) {
      }
    },
    getTotalData(param) {
      this.memberTableData = param;
    },
    onRefresh() {
      this.getPoolsMembersInfo(this.poolId);
    }
  }
}
</script>
