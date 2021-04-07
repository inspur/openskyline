<template>
  <el-dialog  :title="$t('network.bindReservedAddr')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
  <div v-loading="loading">
    <el-form ref="ipTypeForm" :model="ipTypeForm" class="me-required-form" label-width="140px" :rules="rules">
      <el-form-item :label="$t('network.ipNumber')" class="is-required">
        <el-radio-group v-model="ipTypeForm.fixedIpType" prop="fixedIpType" @change="fixedIpChange">
          <el-radio class="radio" label="0">{{$t('network.singleIp')}}</el-radio>
          <el-radio class="radio" label="1">{{$t('network.ipRange')}}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <el-form v-show="ipTypeForm.fixedIpType == '0'" ref="singleIpForm" :model="singleIpForm" class="me-required-form" label-width="140px" :rules="rules">
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-15" v-model="singleIpForm.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.subnet')" class="is-required" prop="subnet">
        <el-select v-model="singleIpForm.subnet" class="col-15">
          <el-option v-for="item in subnetList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('network.fixedipaddress')"
        class="is-required"
        prop="fixedIp">
        <el-input class="col-15" v-model="singleIpForm.fixedIp"></el-input>
      </el-form-item>
    </el-form>
    <el-form v-show="ipTypeForm.fixedIpType == '1'" ref="ipRangeForm" :model="ipRangeForm" class="me-required-form" label-width="140px" :rules="rules">
      <el-form-item :label="$t('network.namePrefix')" prop="namePrefix" class="is-required">
        <el-input class="col-15" v-model="ipRangeForm.namePrefix"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.subnet')" class="is-required" prop="subnet">
        <el-select v-model="ipRangeForm.subnet" class="col-15">
          <el-option v-for="item in subnetList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('network.fixedipaddress')"
        prop="fixedIpRange"
        class="is-required">
        <el-row>
          <el-col :span="7">
            <el-form-item prop="fixedIpStart">
              <el-input v-model="ipRangeForm.fixedIpStart" :placeholder="$t('network.beginaddress')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1" style="text-align:center;">
            <span>-</span>
          </el-col>
          <el-col :span="7" style="padding-left:10px;">
            <el-form-item prop="fixedIpEnd">
              <el-input v-model="ipRangeForm.fixedIpEnd" :placeholder="$t('network.endaddress')"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
    	<el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    	<el-button type="primary" @click="addPortClick" :disabled="disabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
const ipRangeCheck = require('ip-range-check');
const Ip = require('ip.js');
import JSBI from 'jsbi';

export default {
  name: 'BindReservedAddr',
  props: ["networkId"],
  data() {
    let validInCidr = (rule, value, callback) => {
      let self = this;
      let subnetId = "";
      let isSingleIp = (self.ipTypeForm.fixedIpType == '0');
      if (isSingleIp) {
        subnetId = self.singleIpForm.subnet;
      } else {
        subnetId = self.ipRangeForm.subnet;
      }
      let cidrList = self.subnetList.filter((subnet) => {
        return subnet.id == subnetId;
      }).map((subnet) => {
        return subnet.cidr;
      });
      if (cidrList.length > 0) {
        let cidr = cidrList[0];
        let ip = value;
        if (!self.isIpInCidr(ip, cidr)) {
          if (!isSingleIp) {
            self.$refs.ipRangeForm.fields.forEach((field) => {
              if (field.prop == "fixedIpRange") {
                field.showMessage = false;
              }
            });
          }
          callback(new Error(self.$t('network.ipNotInSubnet')));
        } else {
          if (!isSingleIp) {
            self.$refs.ipRangeForm.fields.forEach((field) => {
              if (field.prop == "fixedIpRange") {
                field.showMessage = true;
              }
            });
            self.$refs.ipRangeForm.validateField('fixedIpRange');
          }
          callback();
        }
      } else {
        callback();
      }
    };
    let validEndBigThanStart = (rule, value, callback) => {
      let self = this;
      let isSingleIp = (self.ipTypeForm.fixedIpType == '0');
      if (!isSingleIp) {
        // IP段
        let startIp = self.ipRangeForm.fixedIpStart;
        let endIp = self.ipRangeForm.fixedIpEnd;
        if (startIp && endIp) {
          if (!self.isEndIpBigThanStartIp(startIp, endIp)) {
            callback(new Error(self.$t('network.endSmallerThanStart')));
          }
          callback();
        } else {
          callback();
        }
      } else {
        callback();
      }
    };
    return {
      dialogVisible: false,
      loading: false,
      subnetList: [],
      ipTypeForm: {
        fixedIpType: "0"
      },
      singleIpForm: {
        name: "",
        subnet: "",
        fixedIp: ""
      },
      ipRangeForm: {
        namePrefix: "",
        subnet: "",
        fixedIpStart: "",
        fixedIpEnd: ""
      },
      disabled: false,
      errorIPs: '',
      rules: {
        fixedIpType: [
          {type: "requiredNet"}
        ],
        name: [
          {type: "requiredNet"},
          {type: 'onlyLetter_NumberChinese'},
          {type: 'forbiddenSpace'},
          {type: 'maxSize', value: 40}
        ],
        namePrefix: [
          {type: "requiredNet"},
          {type: 'onlyLetter_NumberChinese'},
          {type: 'forbiddenSpace'},
          {type: 'maxSize', value: 37}
        ],
        subnet: [
          {type: "requiredNet"}
        ],
        fixedIp: [
          {type: 'requiredNet'},
          {type: 'ipv4oripv6'},
          {validator: validInCidr}
        ],
        fixedIpRange: [
          {validator: validEndBigThanStart}
        ],
        fixedIpStart: [
          {type: 'requiredNet'},
          {type: 'ipv4oripv6'},
          {validator: validInCidr}
        ],
        fixedIpEnd: [
          {type: 'requiredNet'},
          {type: 'ipv4oripv6'},
          {validator: validInCidr}
        ]
      }
    }
  },
  mounted() {
    let me = this;
    Promise.all([this.initDialog(), this.getSubnetList()]).then(function(result) {
    });
  },
  methods: {
    async initDialog() {
      this.dialogVisible = true;
      let self = this;
      await self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/networks/"+this.networkId,
        success: function(result) {
          let networkInfo = result['network'];
          self.projectid = networkInfo.project_id;
        }
      });
    },
    fixedIpChange(value) {
      // console.log('form', this.$refs.portForm);
      //this.$refs.portForm.resetFields();
      //
      //this.defaultSelectFirstSubnet();
    },
    handleClose(done) {
      this.$emit("handelCancelShow", {});
    },
    cancel() {
      this.$emit("handelCancelShow", {});
    },
    async getSubnetList() {
      let self = this;
      let result = self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/subnets?network_id="+self.networkId,
        success: function(result) {
          let sublist = [];
          sublist = result['subnets'];
          sublist = sublist.filter((sub) => {
            return (sub['ip_version'] == 4) ||
                   (sub['ip_version'] == 6 &&
                    sub['ipv6_address_mode'] != 'dhcpv6-stateless' &&
                    sub['ipv6_ra_mode'] != 'dhcpv6-stateless' &&
                    sub['ipv6_address_mode'] != 'slaac' &&
                    sub['ipv6_ra_mode'] != 'slaac');
          });
          for (let i = 0; i < sublist.length; i++) {
            let subname = sublist[i];
            subname["name"] = subname["name"]+"("+subname["cidr"] +")";
          }
          self.subnetList = sublist;
          self.defaultSelectFirstSubnet();
        }
      });
    },
    defaultSelectFirstSubnet() {
      // 默认选中第一个子网
      if (this.subnetList.length > 0) {
        this.singleIpForm.subnet = this.subnetList[0].id;
        this.ipRangeForm.subnet = this.subnetList[0].id;
      }
    },
    /**
     * IP地址转int数字.
     */
    convertIp2Int(ip) {
      let ipAddr = new Ip.Addr(ip);
      return ipAddr.toNum();
    },
    /**
     * 判断IP是否在CIDR范围.
     */
    isIpInCidr(ip, cidr) {
      return ipRangeCheck(ip, cidr);
    },
    /**
     * 根据起始IP生成地址列表.
     */
    getIpListFromRange(startIp, endIp) {
      let ipList = [];
      let startIpAddr = this.convertIp2Int(startIp);
      let endIpAddr = this.convertIp2Int(endIp);
      if ((typeof startIpAddr) == 'number') {
        for (let ipAddr = startIpAddr; ipAddr <= endIpAddr; ipAddr++) {
          let ip = (new Ip.Addr(ipAddr)).toString();
          ipList.push(ip);
        }
      } else {
        for (let ipAddr = startIpAddr; JSBI.lessThanOrEqual(ipAddr, endIpAddr); ipAddr = JSBI.add(ipAddr, JSBI.BigInt(1))) {
          let ip = (new Ip.Addr(ipAddr)).toString();
          ipList.push(ip);
        }
      }
      return ipList;
    },
    /**
     * 判断结束地址大于开始地址.
     */
    isEndIpBigThanStartIp(startIp, endIp) {
      let startIpAddr = this.convertIp2Int(startIp);
      let endIpAddr = this.convertIp2Int(endIp);
      return endIpAddr >= startIpAddr;
    },
    addPortClick() {
      let self = this;
      let isSingleIp = (self.ipTypeForm.fixedIpType == "0");
      if (isSingleIp) {
        // 单IP
        self.$refs.singleIpForm.validate((valid) => {
          if (valid) {
            self.disabled = true;
            self.loading = true;
            let name = self.singleIpForm.name;
            let ip = self.singleIpForm.fixedIp;
            this.bindReservedAddr([{
              reqdata: {
                "port": {
                  "admin_state_up": false,
                  "port_security_enabled": false,
                  "project_id": self.projectid,
                  "network_id": self.networkId,
                  "device_owner": "network:reserved",
                  "name": name,
                  "fixed_ips": [{
                    "subnet_id":self.singleIpForm.subnet,
                    "ip_address":ip
                  }]
                }
              },
              ipAddr: ip,
              name: name
            }]);
            return true;
          } else {
            return false;
          }
        });
      } else {
        // IP段
        this.$refs.ipRangeForm.validate((valid) => {
          if (valid) {
            self.disabled = true;
            self.loading = true;
            let fixedIpList = self.getIpListFromRange(self.ipRangeForm.fixedIpStart, self.ipRangeForm.fixedIpEnd);
            let reqInfoList = fixedIpList.map((ip, index, array) => {
              let suffix = index;
              if (suffix < 10) {
                suffix = '0' + suffix;
              }
              let name = self.ipRangeForm.namePrefix + '_' + suffix;
              let reqdata = {
                "port": {
                  "admin_state_up": false,
                  "port_security_enabled": false,
                  "project_id": self.projectid,
                  "network_id": self.networkId,
                  "device_owner": "network:reserved",
                  "name": name,
                  "fixed_ips": [{
                    "subnet_id":self.ipRangeForm.subnet,
                    "ip_address":ip
                  }]
                }
              };
              return {
                reqdata: reqdata,
                ipAddr: ip,
                name: name
              };
            });
            this.bindReservedAddr(reqInfoList);
            return true;
          } else {
            return false;
          }
        });
      }
    },
    bindReservedAddr(reqInfoList) {
      let self = this;
      if (reqInfoList.length > 0) {
        let reqInfo = reqInfoList.shift();
        try {
          this.sendBindReservedAddrReq(reqInfo.reqdata, reqInfo.ipAddr, reqInfo.name)
            .then(() => {
              // 发送下一请求
              this.bindReservedAddr(reqInfoList);
            })
            .catch((err) => {
              // 发送下一请求
              this.bindReservedAddr(reqInfoList);
            });
        } catch (err) {
          // 发送下一请求
          this.bindReservedAddr(reqInfoList);
        }
      } else {
        // 所有请求都处理完
        self.loading = false;
        self.disabled = false;
        if (self.errorIPs == "" || self.errorIPs == ";" || self.errorIPs == null) {
        } else {
          self.$notify({
            message: self.errorIPs+'\n'+Vue.t('network.bindFialed'),
            type: "error"
          });
        }
        self.$emit("handleAddPortShow", {});
      }
    },
    sendBindReservedAddrReq(reqdata, ipAddr, name) {
      let self = this;
      return self.$ajax({
        type: "POST",
        url: "api/neutron/v2.0/ports",
        data: JSON.stringify(reqdata),
        // successMsg: Vue.t("network.bindReservedAddrSuccess") + ":" + ipAddr,
        showErrMsg: false,
        success() {
          self.$notify({
            message: Vue.t("network.bindReservedAddrSuccess") + ":" + ipAddr,
            type: "success"
          });
        },
        errFun() {
          self.errorIPs+=ipAddr+';';
        },
        log:{
          description:{
            en:"Bind reserved IP:" + ipAddr,
            zh_cn:"绑定预留地址:" + ipAddr
          },
          target:Vue.logTarget.reservedAddr
        }
      });
    }
  }
}
</script>
