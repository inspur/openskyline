<template>
  <el-dialog :title="$t('network.addremovepoolmember')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-alert type="info" :closable="false" :title="$t('network.adddelMemberTip')" style="background-color:#f5f7fa;color:#333;margin-top:-5px"></el-alert>
    <el-form label-position="right" :model="stepfourForm" ref="stepfourForm" v-loading="loading4">
      <el-form-item>
        <el-collapse v-model="activeName">
          <el-collapse-item :title="$t('network.addpoolMember')" name="1">
            <div class="operation-panel margin-tb5">
              <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus" style="float:left;  margin-bottom:10px;">
              </operation-panel>
              <el-tooltip effect="dark" placement="top">
                <div slot="content">{{$t('network.addmemberButtonTip')}}</div>
                <i class="el-icon-fa-question-circle" style="float:left; margin: 8px 0 0 10px"></i>
              </el-tooltip>
            </div>
            <el-table ref="memberTable" :data="memberTableData" highlight-current-row border stripe style="width: 100%" row-key="id">
              <el-table-column prop="addresses" :label="$t('network.ipaddress')" align="left" min-width="120">
                <template slot-scope="scope">
                  <span v-if="showspanRender(scope.row.addresses)">{{scope.row.address}}</span>
                  <el-select v-if="showipselect(scope.row.addresses)" v-model="scope.row.address" @change="ipselectChange(scope.row.address, scope.row)" filterable>
                    <el-option v-for="item in scope.row.addresses" :key="item" :label="item" :value="item"></el-option>
                  </el-select>
                  <el-input v-if="scope.row.subnetFlag" v-model="scope.row.address" @change="addressChange(scope.row.address, scope.row)"></el-input>
                  <div class="col-24" v-if="scope.row.addressFlag && scope.row.address!=''">
                    <span style="color:red">{{$t('network.ipaddressError')}}</span>
                  </div>
                  <div class="col-24" v-if="scope.row.address==''">
                    <span style="color:red">{{$t('network.cannotempty')}}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="subnetname" :label="$t('network.subnet')" align="left" min-width="100">
                <template slot-scope="scope">
                  <span v-if="!scope.row.subnetFlag">{{scope.row.subnetname}}</span>
                  <el-select v-model="scope.row.subnetid" @change="ipversionChange(scope.row.subnetid, scope.row)" v-if="scope.row.subnetFlag" filterable>
                    <el-option v-for="item in subnetList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                  </el-select>
                  <div class="col-24" v-if="scope.row.subnetid==''">
                    <span style="color:red">{{$t('network.cannotempty')}}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="port" :label="$t('network.port')" align="left" min-width="120">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.port" style="width:140px;" @change="portChange(scope.row.port, scope.row)" :disabled="scope.row.portDisabled"></el-input>
                  <div class="col-24" v-if="scope.row.portFlag && scope.row.port!=''">
                    <span style="color:red">{{$t('network.portNote1')}}</span>
                  </div>
                  <div class="col-24" v-if="scope.row.port==''">
                    <span style="color:red">{{$t('network.cannotempty')}}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="weight" :label="$t('network.weight')" align="left" min-width="120">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.weight" style="width:140px;" @change="weightChange(scope.row.weight, scope.row)" :disabled="scope.row.weightDisabled"></el-input>
                  <div class="col-24" v-if="scope.row.weightFlag && scope.row.weight!=''">
                    <span style="color:red">{{$t('network.weightNote1')}}</span>
                  </div>
                  <div class="col-24" v-if="scope.row.weight==''">
                    <span style="color:red">{{$t('network.cannotempty')}}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('network.operation')" align="left" min-width="50">
                <template slot-scope="scope">
                  <el-button @click.native.prevent="deleteRow(scope.row)" v-if="!scope.row.oldFlag" type="text" size="small">{{$t('network.remove')}}</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
          <el-collapse-item :title="$t('network.memberuseinner')" name="2">
            <el-form :inline="true" class="form-inline">
              <el-form-item :label="$t('lang.name')">
                <el-input size="small" v-model="query_name"></el-input>
              </el-form-item>
              <el-form-item :label="$t('network.ipaddress')">
                <el-input size="small" v-model="query_ip"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon='fa-search' size="small" @click="queryserverTable">{{$t('lang.query')}}</el-button>
              </el-form-item>
            </el-form>
            <el-table ref="serverTable" :data="serverTableData" highlight-current-row border stripe v-loading="loading" :element-loading-text="$t('lang.loading')" style="width: 100%" row-key="id">
              <el-table-column prop="name" :label="$t('lang.name')" align="left" min-width="100">
              </el-table-column>
              <el-table-column prop="addresses" :label="$t('network.ipaddress')" align="left" min-width="100">
                <template slot-scope="scope">
                  <span v-html="serverIpRender(scope.row.addresses)"></span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('network.operation')" align="left" min-width="100">
                <template slot-scope="scope">
                  <el-button @click.native.prevent="addtoMember(scope.row)" type="text" size="small">{{$t('lang.addTo')}}</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div style="margin: 10px 0; position: relative">
              <el-row>
                <el-col :span="24">
                  <page :totalData="serverTotalData" @getCurrentData="getCurrentData" :pageCount="5"></page>
                </el-col>
              </el-row>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="createpoolmembers" type="primary" :disabled="isDisabled || !memberTableData.length">{{$t('lang.finish')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: "StepFour",
  props: ["memberInfo", "poolsId", "projectId"],
  data() {
    return {
      dialogVisible: false,
      isDisabled: false,
      loading4: false,
      activeName: ["1", "2"],
      stepfourForm: {},
      memberTableData: [],
      serverTableData: [],
      serverTotalData: [],
      multipleSelection: [],
      subnetList: Vue.subnetsList,
      subnet: "",
      query_name: "",
      query_ip: "",
      ipaddressvalue: "",
      loading: false,
      operationMenus: [
        {
          icon: "fa-plus",
          name: Vue.t("network.addoutmember"),
          showflg: true,
          readOnly: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            if (this.checkCount() >=5) {
              this.$message({
                type:"warning",
                message:Vue.t('network.ADD_UP_TO_N_NEW_NUMBERS', {numbers:5})
              });
              return;
            }
            if (this.memberTableData.length >= 20) {
              this.$message({
                type:"warning",
                message:Vue.t('network.TOTAL_OF_N_NUMBERS', {numbers:20})
              });
              return;
            }
            let timeId = new Date().getTime();
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
              subnetFlag: true,
              portDisabled: false,
              weightDisabled: false,
              external: true //外部成员
            });
          }.bind(this)
        }
      ]
    };
  },
  beforeDestroy() {
    if (this.intervalMem) {
      clearInterval(this.intervalMem);
    }
    if (this.intervalDel) {
      clearInterval(this.intervalDel);
    }
  },
  mounted() {
    this.dialogVisible = true;
    //子网展示IP段
    if (this.memberInfo.length > 0) {
      for (let i = 0; i < this.memberInfo.length; i++) {
        let oldmember = this.memberInfo[i];
        let tempobj = {};
        tempobj.vmid = oldmember["id"];
        tempobj.id = oldmember["id"];
        let ips = [];
        ips.push(oldmember.address);
        tempobj.address = oldmember.address;
        tempobj.addresses = ips;
        tempobj.port = oldmember["protocol_port"];
        tempobj.weight = oldmember["weight"];
        tempobj.addressFlag = false;
        tempobj.weightFlag = false;
        tempobj.portFlag = false;
        tempobj.portDisabled = true;
        tempobj.weightDisabled = true;
        tempobj.oldFlag = true;
        tempobj.subnetFlag = false;
        tempobj.subnetid = oldmember["subnet_id"];
        for (let j = 0; j < this.subnetList.length; j++) {
          let subnet = this.subnetList[j];
          if (subnet.id === oldmember["subnet_id"]) {
            tempobj.subnetversion = subnet["ip_version"];
            tempobj.subnetname = subnet["name"];
          }
        }
        this.memberTableData.push(tempobj);
      }
    }
    this.getServerList();
  },
  methods: {
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCancelShow");
    },
    async getServerList(name = "", ip = "") {
      let self = this;
      try {
        let roleType = Vue.roleType + "";
        let url = "";
        if (roleType == "0") {
          url =
            "api/nova/v2.1/servers-inspur/detail?limit=99999&all_tenants=1&project_id=" +
            self.projectId;
        } else if (roleType === '3') {
          url =`api/nova/v2.1/servers-inspur/detail?limit=99999&project_id=${self.projectId}&user_id=${Vue.userId}`;
        } else {
          url =
            "api/nova/v2.1/servers-inspur/detail?limit=99999&project_id=" +
            self.projectId;
        }
        url += `&not-tags-any=${encodeURIComponent('#,@,~')}`;
        self.loading = true;
        let result = await self.$ajax({
          type: "GET",
          url: url,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          }
        });
        let servers = result["servers"];
        let tempList = [];
        for (let i = 0; i < servers.length; i++) {
          let server = servers[i];
          if (server["status"] === "ACTIVE" || server["status"] === "SHUTOFF") {
            tempList.push(server);
          }
        }
        self.serverTotalData = [];
        for (let i = 0; i < tempList.length; i++) {
          let vm = tempList[i];
          let tempobj = {};
          tempobj.id = vm["id"];
          tempobj.name = vm["name"];
          let addresses = vm["addresses"];
          let ips = [];
          let addressesSize = 0;
          let f = false;
          for (let key in addresses) {
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
            tempobj.portDisabled = false;
            tempobj.weightDisabled = false;
            if (self.nameFilter(tempobj, name, ip)) {
              self.serverTotalData.push(tempobj);
            }
          }
        }
        for (let i = 0; i < tempList.length; i++) {
          let vm = tempList[i];
          self.getSubnetInfo(vm["id"]); //根据云主机ID获取子网详情
        }
        setTimeout(function() {
          self.loading = false;
        }, 3000);
      } catch (res) {}
    },
    nameFilter(item, name, ip) {
      let flagname = false;
      let flagip = false;
      if (name == "" && ip =="") {
        return true;
      } else {
        if (name == "") {
          flagname = true;
        }
        if (ip == "") {
          flagip = true;
        }
        if (item.name.indexOf(name) > -1) {
          flagname = true;
        }
        let ips = item.addresses;
        for (let i=0; i<ips.length; i++) {
          if (ips[i].indexOf(ip) > -1) {
            flagip = true;
            break;
          }
        }
        return flagname && flagip;
      }
    },
    async getSubnetInfo(vmId) {
      let self = this;
      try {
        let result = await self.$ajax({
          type: "GET",
          url: "api/nova/v2.1/servers/" + vmId + "/os-interface"
        });
        let tempList = result["interfaceAttachments"];
        //获取子网ID和名称
        if (tempList.length > 0) {
          for (let i = 0; i < self.serverTotalData.length; i++) {
            let tempobj = self.serverTotalData[i];
            if (tempobj["id"] === vmId) {
              let subnetmore = [];
              for (let t = 0; t < tempList.length; t++) {
                let fixedips = tempList[t]["fixed_ips"];
                for (let k = 0; k < fixedips.length; k++) {
                  let tempips = fixedips[k];
                  for (let j = 0; j < Vue.subnetsList.length; j++) {
                    let subnet = Vue.subnetsList[j];
                    if (subnet["id"] === tempips["subnet_id"]) {
                      subnetmore.push({
                        ipaddress: tempips["ip_address"],
                        subnet: subnet
                      });
                    }
                  }
                }
                tempobj.subnetmore = subnetmore;
              }
            }
          }
        }
      } catch (res) {}
    },
    getCurrentData(param) {
      this.serverTableData = param;
    },
    checkCount() {
      let list = this.memberTableData;
      let count = 0;
      for (let i=0; i<list.length; i++) {
        if (!list[i].oldFlag) {
          count++;
        }
      }
      return count;
    },
    addtoMember(row) {
      let self = this;
      if (self.checkCount() >=5) {
        self.$message({
          type:"warning",
          message:Vue.t('network.ADD_UP_TO_N_NEW_NUMBERS', {numbers:5})
        });
        return;
      }
      if (self.memberTableData.length >= 20) {
        self.$message({
          type:"warning",
          message:Vue.t('network.TOTAL_OF_N_NUMBERS', {numbers:20})
        });
        return;
      }
      let temp = {};
      let ipshow = "";
      for (let a in row) {
        temp[a] = row[a];
        if (a == "addresses") {
          ipshow = row[a][0];
        }
      }
      for (let a in temp) {
        if (a == "subnetmore") {
          let subnetmo = temp[a];
          if (ipshow != "") {
            for (let i = 0; i < subnetmo.length; i++) {
              if (subnetmo[i].ipaddress == ipshow) {
                let smore = subnetmo[i].subnet;
                temp.subnetid = smore["id"];
                temp.subnetname = smore["name"];
                temp.subnetversion = smore["ip_version"];
                temp.address = ipshow;
              }
            }
          }
        }
      }
      let timeId = new Date().getTime();
      temp.compute_id = temp.id;
      temp.external = false;
      temp["id"] = timeId + "";
      self.memberTableData.push(temp);
    },
    deleteRow(row) {
      let self = this;
      let temp;
      for (let i = 0; i < this.memberTableData.length; i++) {
        temp = this.memberTableData[i];
        if (temp["id"] === row["id"]) {
          this.memberTableData.splice(i, 1);
          break;
        }
      }
    },
    serverIpRender(fixedips) {
      let ipstring = "";
      for (let i = 0; i < fixedips.length; i++) {
        if (fixedips.length === i + 1) {
          ipstring += fixedips[i];
        } else {
          ipstring += fixedips[i] + ",  ";
        }
      }
      return ipstring;
    },
    ipselectChange(value, row) {
      let subnetmore = row["subnetmore"];
      for (let i = 0; i < this.memberTableData.length; i++) {
        let temp = this.memberTableData[i];
        if (temp.id === row.id) {
          temp.address = value;
          for (let j = 0; j < subnetmore.length; j++) {
            if (subnetmore[j].ipaddress == value) {
              temp.subnetname = subnetmore[j].subnet.name;
              temp.subnetid = subnetmore[j].subnet["id"];
              temp.subnetversion = subnetmore[j].subnet["ip_version"];
            }
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
          self.addressChange(row["address"], row);
        }
      }
    },
    queryserverTable() {
      this.getServerList(this.query_name, this.query_ip);
    },
    portChange(port, row) {
      let reg = /^\d+$/;
      let regFlag = false;
      if (reg.test(port) && port >= 1 && port <= 65535) {
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
      if (reg.test(weight) && weight >= 1 && weight <= 256) {
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
      } else if (row["subnetversion"] == "4") {
        if (regIPv4.test(address)) {
          regFlag = false;
        } else {
          regFlag = true;
        }
      } else {
        regFlag = false;
      }
      for (let i = 0; i < this.memberTableData.length; i++) {
        let temp = this.memberTableData[i];
        if (temp.id === row.id) {
          temp.addressFlag = regFlag;
          break;
        }
      }
    },
    createpoolmembers() {
      let self = this;
      self.isDisabled = true;
      self.loading4 = true;
      let ifNext = true;
      for (let i = 0; i < this.memberTableData.length; i++) {
        let member = this.memberTableData[i];
        if (
          member["addressFlag"] == true ||
          member["weightFlag"] == true ||
          member["portFlag"] == true
        ) {
          ifNext = false;
          break;
        }
        if (
          member["address"] == "" ||
          member["weight"] == "" ||
          member["port"] == "" ||
          member["subnetname"] == ""
        ) {
          ifNext = false;
          break;
        }
        // 是否有记录相同（IP和port一样）的数据
        for (let j = 0; j < this.memberTableData.length; j++) {
          if (j == i) {
            continue;
          }
          let obj = this.memberTableData[j];
          if (
            member.address.localeCompare(obj.address) == 0 &&
            parseInt(member.port) == parseInt(obj.port)
          ) {
            this.$notify.info({
              message:
                Vue.t("network.addmemberNote") +
                "(" +
                member.address +
                "，" +
                member.port +
                ")"
            });
            ifNext = false;
            break;
          }
        }
        if (!ifNext) {
          break;
        }
      }
      if (!ifNext) {
        self.isDisabled = false;
        self.loading4 = false;
        return;
      }
      let tag = [];
      for (let i = 0; i < self.memberTableData.length; i++) {
        tag[i] = 0;
      }
      try {
        let delMemList = [];
        for (let j = 0; j < self.memberInfo.length; j++) {
          let oldDt = self.memberInfo[j];
          let i = 0;
          for (; i < self.memberTableData.length; i++) {
            let newDt = self.memberTableData[i];
            if (
              newDt.address == oldDt.address &&
              newDt.port == oldDt.protocol_port
            ) {
              //旧数据，不需要调接口保存
              tag[i] = 1;
              break;
            }
          }
          if (i == self.memberTableData.length) {
            delMemList.push(oldDt); //该条数据self.memberInfo[i]要被删除
          }
        }
        self.deleteMember(delMemList, self.poolsId);
        //保存新增数据
        let newArr = [];
        for (let s = 0; s < self.memberTableData.length; s++) {
          if (tag[s] == 0) {
            newArr.push(self.memberTableData[s]);
          }
        }
        if (!newArr.length) {
          self.$emit("handleAddShow", {});
        }
        self.createpoolmembersreal(newArr, self.poolsId);
      } catch (res) {
      } finally {
        // setTimeout(function() {
        //   //延迟一段时间在关闭当前窗口，以给后台更多操作时间。不然成员列表会不准确
        //   self.isDisabled = false;
        //   self.loading4 = false;
        //   self.$emit("handleAddShow", {});
        // }, 3000);
      }
    },
    //删除资源池成员
    deleteMember(memList, poolId) {
      let self = this;
      if (memList.length == 0) {
        return;
      }
      let oldDt = memList.shift();
      self.$ajax({
        type: "DELETE",
        url:"api/octavia/v2.0/lbaas/pools/" + poolId + "/members/" + oldDt.id,
        data: {},
        errorKey: "NeutronError",
        log: {
          description: {
            en:"Remove Pool Member:(IP,PORT)=(" + oldDt.address + "，" + oldDt.protocol_port + ")",
            zh_cn:"移除资源池成员：（IP，PORT）=（" + oldDt.address + "，" + oldDt.protocol_port + "）"
          },
          target: Vue.logTarget.balance
        },
        successFun: function() {
          if (memList.length == 0) {
            self.$emit("handleAddShow", {});
            self.isDisabled = false;
            self.loading4 = false;
          } else {
            clearInterval(self.intervalDel);
            self.intervalDel = setInterval(() => {
              self.searchBalanceStatusForDel(memList, poolId);
            }, 5000);
          }
        }
      });
    },
    searchBalanceStatusForDel(memberData, poolId) {
      let self = this;
      let result = self.$ajax({
        type: "get",
        url:"api/octavia/v2.0/lbaas/loadbalancers/" + self.$route.params.balanceId,
        errorKey: "NeutronError",
        success: function(result) {
          let loadbalancer = result["loadbalancer"];
          if (loadbalancer["provisioning_status"] != "ERROR") {
            if (loadbalancer["provisioning_status"] == "ACTIVE") {
              clearInterval(self.intervalDel);
              self.deleteMember(memberData, poolId);
            }
          } else {
            clearInterval(self.intervalDel);
            self.$emit("handleAddShow", {});
          }
        }
      });
    },
    //资源池成员
    createpoolmembersreal(memberData, poolId) {
      let self = this;
      if (memberData.length == 0) {
        return;
      }
      let memberobj = memberData.shift();
      let reqdata = {
        member: {
          address: memberobj["address"],
          subnet_id: memberobj["subnetid"],
          protocol_port: memberobj["port"],
          weight: memberobj["weight"],
          project_id: memberobj["project_id"],
          tenant_id: memberobj["project_id"],
          compute_id: memberobj.compute_id || null,
          external: memberobj.external
        }
      };
      let result = self.$ajax({
        type: "POST",
        url: "api/octavia/v2.0/lbaas/pools/" + poolId + "/members",
        data: JSON.stringify(reqdata),
        errorKey: "NeutronError",
        log: {
          description: {
            en:
              "Add Pool Member:(IP,PORT)=(" +
              memberobj["address"] +
              "," +
              memberobj["port"] +
              ")",
            zh_cn:
              "添加资源池成员：（IP，PORT）=（" +
              memberobj["address"] +
              "，" +
              memberobj["port"] +
              "）"
          },
          target: Vue.logTarget.balance
        },
        successFun: function() {
          if (memberData.length == 0) {
            self.$emit("handleAddShow", {});
            self.isDisabled = false;
            self.loading4 = false;
          } else {
            clearInterval(self.intervalMem);
            self.intervalMem = setInterval(() => {
              self.searchBalanceStatusForMem(memberData, poolId);
            }, 5000);
          }
        },
        errFun: function() {
          self.isDisabled = false;
          self.loading4 = false;
        }
      });
    },
    searchBalanceStatusForMem(memberData, poolId) {
      let self = this;
      let result = self.$ajax({
        type: "get",
        url:
          "api/octavia/v2.0/lbaas/loadbalancers/" +
          self.$route.params.balanceId,
        errorKey: "NeutronError",
        success: function(result) {
          let loadbalancer = result["loadbalancer"];
          if (loadbalancer["provisioning_status"] != "ERROR") {
            if (loadbalancer["provisioning_status"] == "ACTIVE") {
              clearInterval(self.intervalMem);
              self.createpoolmembersreal(memberData, poolId);
            }
          } else {
            clearInterval(self.intervalMem);
            self.$emit("handleAddShow", {});
          }
        }
      });
    }
  }
};
</script>
