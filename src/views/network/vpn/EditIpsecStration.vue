<template>
  <el-dialog :title="$t('network.editipsecStation')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-form ref="form" :model="form" class="me-required-form" label-width="180px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-10"  v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" class="col-10" v-model="form.description"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.localendpointgroup')" class="is-required" prop="endpointsubnet">
        <el-select class="col-10" v-model="form.endpointsubnet" filterable>
          <el-option v-for="item in subnetList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-tooltip  effect="dark" :content="$t('network.localendpointTip')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.peeraddress')" class="is-required" prop="peeraddress">
        <el-input class="col-10"  v-model="form.peeraddress"></el-input>
        <el-tooltip effect="dark" placement="top">
          <div slot="content">{{$t('network.vpnNote1')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.parterId')" class="is-required" prop="peerid">
        <el-input class="col-10"  v-model="form.peerid"></el-input>
        <el-tooltip effect="dark" placement="top">
          <div slot="content">{{$t('network.vpnNote2')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.peerendpointgroup')" class="is-required" prop="endpointcidr">
        <el-select class="col-10" v-model="form.endpointcidr" filterable>
          <el-option v-for="item in cidrList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-tooltip  effect="dark" :content="$t('network.peerendpointTip')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <!-- <el-form-item :label="$t('network.peercidrs')" class="is-required" prop="peercidrs">
        <el-input class="col-10"  v-model="form.peercidrs"  @change="peercidrsChange"></el-input>
        <el-tooltip effect="dark" placement="top">
          <div slot="content">{{$t('network.vpnNote3')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div v-if="peercidrsFlag" class="col-24" style="position:absolute;font-size:12px;line-height: 0.8;padding-top: 3px;top: 100%;color:#dd4b39;">
          <span>{{$t('network.formaterror')}}</span>
        </div>
      </el-form-item> -->
      <el-form-item :label="$t('network.psk')" class="is-required" prop="psk">
        <el-input class="col-10"  v-model="form.psk" :type="pskType">
          <el-button type="info" slot="append" icon="fa-eye" @click="showpassword()"></el-button>
        </el-input>
        <el-tooltip effect="dark" :content="$t('network.vpnNote33')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-button type="text" style="padding-left:10px;" @click="showDetail()" href="advanceBtn"><span>{{advanceName}}</span></el-button>
      <div v-show="optionalStatus">
      <el-form-item :label="$t('network.mtumin')" prop="mtu">
        <el-input-number :min="form.mtumin" :max="2147483647" v-model="form.mtu" class="col-10"></el-input-number>
        <el-tooltip effect="dark" :content="$t('network.vpnNote4')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.dpdation')">
         <el-select v-model="form.dpdaction" class="col-10">
          <el-option :label="$t('network.keep')" value="hold"></el-option>
          <el-option :label="$t('network.clear')" value="clear"></el-option>
          <el-option :label="$t('network.disabled')" value="disabled"></el-option>
          <el-option :label="$t('network.restart')" value="restart"></el-option>
          <el-option :label="$t('network.restartbypeer')" value="restart-by-peer"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.dpdinterval')" prop="dpdinterval">
        <el-input-number :min="1" :max="2147483646" v-model="form.dpdinterval" class="col-10" @change="checkinterval"></el-input-number>
        <el-tooltip effect="dark":content="$t('network.vpnNote5')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div class="col-24" v-if="warninnote1">
            <span style="color:#dd4b39;font-size:12px;">{{$t('network.vpnNote6')}}</span>
        </div>
      </el-form-item>
      <el-form-item :label="$t('network.dpdtimeout')" prop="dpdtimeout">
        <el-input-number :min="1" :max="2147483647" v-model="form.dpdtimeout" class="col-10" @change="checktimeout"></el-input-number>
        <el-tooltip effect="dark" :content="$t('network.vpnNote7')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div class="col-24" v-if="warninnote2">
            <span style="color:#dd4b39;font-size:12px;">{{$t('network.vpnNote8')}}</span>
        </div>
      </el-form-item>
      <el-form-item :label="$t('network.initiator')">
        <el-select v-model="form.initiator" class="col-10">
          <el-option :label="$t('network.bidirectional')" value="bi-directional"></el-option>
          <el-option :label="$t('network.responseonly')" value="response-only"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.manageStatus')">
        <el-switch :width="75" on-text="UP" off-text="DOWN" v-model="form.adminstateup"></el-switch>
      </el-form-item>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="saveAdd" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script type="text/javascript">
export default {
  name:"EditIpsecStration",
  props: ["editrow"],
  data() {
    return {
      oldForm: new Map(),
      dialogVisible: false,
      loading: false,
      warninnote1: false,
      warninnote2: false,
      finishStatus: false,
      roleType: Vue.roleType + "",
      isDisabled: false,
      peercidrsFlag: false,
      pskType: "password",
      form: {
        name: "",
        description: "",
        project_id: "",
        vpnServer: "",
        ikeStrategy: "",
        ipsecStrategy: "",
        peeraddress: "",
        peerid: "",
        peercidrs: "",
        endpointsubnet:"",
        endpointcidr:"",
        psk: "",
        mtu: "",
        mtumin: 68,
        dpdaction: "hold",
        dpdinterval: "30",
        dpdtimeout: "120",
        initiator: "bi-directional",
        adminstateup: true
      },
      vpnserverList: [],
      ikestrategyList: [],
      ipsecstrategyList: [],
      subnetList:[],
      cidrList:[],
      advanceName: Vue.t('network.choosenattrright'),
      optionalStatus: false,
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 40}
        ],
        project_id: [
          {type: "requiredNet"}
        ],
        description: [
          {type: 'maxSize', value: 255}
        ],
        vpnServer: [
          {type: "requiredNet"}
        ],
        ikeStrategy: [
          {type: "requiredNet"}
        ],
        ipsecStrategy: [
          {type: "requiredNet"}
        ],
        endpointsubnet:[
          {type: "requiredNet"}
        ],
        endpointcidr:[
          {type: "requiredNet"}
        ],
        peeraddress: [
          {type: "requiredNet"},
          {type: 'ipv4oripv6'}
        ],
        peerid: [
          {type: "requiredNet"},
          {type: 'ipv4oripv6'}
        ],
        peercidrs: [
          {type: "requiredNet"},
          {type: 'maxSize', value: 100}
        ],
        psk: [
          {type: "requiredNet"},
          {type: 'maxSize', value: 100}
        ],
        mtu: [
          {type: "integer"}
        ],
        dpdinterval: [
          {type: "integer"}
        ],
        dpdtimeout: [
          {type: "integer"}
        ]
      }
    }
  },
  mounted() {
    this.$parent.$parent.active = "VpnList";
    this.initDialog();
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
      this.form.name = this.editrow["name"];
      this.form.description = this.editrow["description"];
      this.form.peeraddress = this.editrow["peer_address"];
      this.form.peerid = this.editrow["peer_id"];
      // let peercidrs = this.editrow["peer_cidrs"];
      // for (let i=0; i<peercidrs.length; i++) {
      //   if ( i+1 === peercidrs.length) {
      //     this.form.peercidrs += peercidrs[i];
      //   } else {
      //     this.form.peercidrs += peercidrs[i] + ",";
      //   }
      // }
      this.form.psk = this.editrow["psk"];
      this.form.dpdaction = this.editrow["dpd"]["action"];
      this.form.dpdtimeout = this.editrow["dpd"]["timeout"];
      this.form.dpdinterval = this.editrow["dpd"]["interval"];
      this.form.initiator = this.editrow["initiator"];
      this.form.mtu = this.editrow["mtu"];
      this.form.adminstateup = this.editrow["admin_state_up"];
      this.form.endpointsubnet = this.editrow["local_ep_group_id"];
      this.form.endpointcidr = this.editrow["peer_ep_group_id"];
      let vpnserviceId = this.editrow["vpnservice_id"];
      this.getEndpointGroupsList(this.editrow["project_id"]);
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/vpn/vpnservices/"+vpnserviceId,
        data: {},
        success: function(result) {
          let vpnservice = result["vpnservice"];
          if (vpnservice["external_v4_ip"]!=null) {
            self.form.mtumin = 68;
          } else {
            self.form.mtumin = 1280;
          }
          for (let [k, v] of Object.entries(self.form)) {
            self.oldForm.set(k, v);
          }
        }
      });
    },
    showDetail() {
      if (this.optionalStatus == false) {
        this.optionalStatus = true;
        this.advanceName = Vue.t('network.choosenattrleft');
      } else {
        this.optionalStatus = false;
        this.advanceName = Vue.t('network.choosenattrright');
      }
    },
    handleClose(done) {
      this.$emit("handlerCancelShow", {});
      done();
    },
    cancel() {
      this.$emit("handlerCancelShow", {});
    },
    async getEndpointGroupsList(projectId = "") {
      let self = this;
      let result = await self.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/vpn/endpoint-groups?project_id=" + projectId,
        errorKey: "NeutronError"
      });
      let vpnservices = result["endpoint_groups"];
      self.subnetList = [];
      self.cidrList = [];
      for (var i=0; i < vpnservices.length; i++) {
        if (vpnservices[i].type == "subnet") {
          self.subnetList.push(vpnservices[i]);
        } else if (vpnservices[i].type == "cidr") {
          self.cidrList.push(vpnservices[i]);
        }
      }
    },
    peercidrsChange(value) {
      let self = this;
      let result = true;
      let ipversion4 = 0;
      let ipversion6 = 0;
      let cidrs = value.split(",");
      if (cidrs.length > 0) {
        for (let i = 0; i < cidrs.length; i++) {
          let cidr = cidrs[i];
          if (!self.ipv4orv6Check(cidr)) {
            result = false;
          }
        }
        for (let i = 0; i < cidrs.length; i++) {
          let cidr = cidrs[i];
          if (self.ipv4v6Check(cidr) == "4") {
            ipversion4++;
          } else {
            ipversion6++;
          }
        }
      } else {
        result = false;
      }
      if (value == "") {
        result = true;
      }
      if (result) {
        self.peercidrsFlag = false;
      } else {
        self.peercidrsFlag = true;
      }
      return result;
    },
    ipv4orv6Check(cidr) {
      let regCIDR = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
      let regIPv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
      let result = false;
      let cidrIP = cidr.split("/");
      if (cidrIP.length === 2) {
        if (regCIDR.test(cidr)) {
          result = true;
        }
        if (regIPv6.test(cidrIP[0]) && Number(cidrIP[1])>=1 && Number(cidrIP[1])<=128 ) {
          result = true;
        }
      }
      return result;
    },
    ipv4v6Check(cidr) {
      let regCIDR = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
      let regIPv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
      let result = "4";
      let cidrIP = cidr.split("/");
      if (cidrIP.length === 2) {
        if (regCIDR.test(cidr)) {
          result = "4";
        }
        if (regIPv6.test(cidrIP[0]) && Number(cidrIP[1])>=1 && Number(cidrIP[1])<=128 ) {
          result = "6";
        }
      }
      return result;
    },
    getName(data, id) {
      for (let v of data) {
        if (v.id === id) {
          return v.name;
        }
      }
    },
    saveAdd() {
      let self = this;
      self.$refs.form.validate(async(valid) => {
        if (valid) {
          if (self.finishStatus) {
            return false;
          }
          if (!self.peercidrsChange(self.form.peercidrs)) {
            return false;
          }
          let formLabel = {
            name: Vue.t('lang.name'),
            description: Vue.t('lang.desc'),
            peeraddress: Vue.t('network.peeraddress'),
            peerid: Vue.t('network.parterId'),
            psk: Vue.t('network.psk'),
            dpdaction: Vue.t('network.dpdation'),
            dpdtimeout: Vue.t('network.dpdtimeout'),
            dpdinterval: Vue.t('network.dpdinterval'),
            initiator: Vue.t('network.initiator'),
            mtu: Vue.t('network.mtumin'),
            adminstateup: Vue.t('network.manageStatus'),
            endpointsubnet: Vue.t('network.localendpointgroup'),
            endpointcidr: Vue.t('network.peerendpointgroup')
          };
          let dpdactionLabel = {
            hold: Vue.t('network.keep'),
            clear: Vue.t('network.clear'),
            disabled: Vue.t('network.disabled'),
            restart: Vue.t('network.restart'),
            'restart-by-peer': Vue.t('network.restartbypeer')
          };
          let initiatorLabel = {
            'bi-directional': Vue.t('network.bidirectional'),
            'response-only': Vue.t('network.responseonly')
          };
          let logStr = '修改IPSec站点连接';
          self.oldForm.set('adminstateup', self.oldForm.get('adminstateup') ? "UP" : "DOWN");
          for (let [k, v] of Object.entries(formLabel)) {
            if (k === 'adminstateup') {
              logStr = logStr + `${v}修改前: ${self.oldForm.get(k)},${v}修改后: ${self.form[k] ? 'UP' : "DOWN"} `;
            } else if ( k === 'endpointsubnet') {
              logStr = logStr + `${v}修改前: ${self.getName(self.subnetList, self.oldForm.get(k))},${v}修改后: ${self.getName(self.subnetList, self.form[k])} `;
            } else if ( k === 'endpointcidr') {
              logStr = logStr + `${v}修改前: ${self.getName(self.cidrList, self.oldForm.get(k))},${v}修改后: ${self.getName(self.cidrList, self.form[k])} `;
            } else if ( k === 'dpdaction') {
              logStr = logStr + `${v}修改前: ${dpdactionLabel[self.oldForm.get(k)]},${v}修改后: ${dpdactionLabel[self.form[k]]} `;
            } else if ( k === 'initiator') {
              logStr = logStr + `${v}修改前: ${initiatorLabel[self.oldForm.get(k)]},${v}修改后: ${initiatorLabel[self.form[k]]} `;
            } else {
              logStr = logStr + `${v}修改前: ${self.oldForm.get(k)},${v}修改后: ${self.form[k]} `;
            }
          }
          // let peercidrs = [];
          // let peercidrsString = self.form.peercidrs;
          // peercidrs = peercidrsString.split(",");
          let reqdata = {"ipsec_site_connection":{
            "name": self.form.name,
            "description": self.form.description,
            "peer_address": self.form.peeraddress,
            "peer_id": self.form.peerid,
            // "peer_cidrs": peercidrs,
            "psk": self.form.psk,
            "local_ep_group_id":self.form.endpointsubnet,
            "peer_ep_group_id":self.form.endpointcidr,
            "dpd": {
              "action": self.form.dpdaction,
              "timeout": self.form.dpdtimeout,
              "interval": self.form.dpdinterval
            },
            "initiator": self.form.initiator,
            "mtu": self.form.mtu,
            "admin_state_up": self.form.adminstateup
          }};
          try {
            self.loading = true;
            self.isDisabled = true;
            let result = await self.$ajax({
              type: "PUT",
              url: "api/neutron/v2.0/vpn/ipsec-site-connections/"+self.editrow["id"],
              data: JSON.stringify(reqdata),
              errorKey: "NeutronError",
              successMsg: Vue.t('network.saveSuccess') + "，" + Vue.t('network.pleaseRefreshList'),
              success: function(result) {
                self.loading = false;
                self.isDisabled = false;
                self.$emit("handleEditShow", {});
              },
              errFun(xhr, status) {
                if (xhr.status == "404") {
                  self.$emit("handleEditShow", {});
                }
                self.loading = false;
                self.isDisabled = false;
              },
              log:{
                description:{
                  en:"Before edit IPSecStation:"+self.editrow["name"]+", After edit IPSecStation:"+self.form.name,
                  zh_cn:logStr
                },
                target:Vue.logTarget.ipsecStation
              }
            });
          } catch (res) {
          }
          return true;
        } else {
          return false;
        }
      });
    },
    checkinterval(value) {
      let dpdtimeout = this.form.dpdtimeout;
      if (value >= dpdtimeout) {
        this.warninnote1 = true;
        this.finishStatus = true;
      } else {
        this.warninnote1 = false;
        this.warninnote2 = false;
        this.finishStatus = false;
      }
    },
    checktimeout(value) {
      let dpdinterval = this.form.dpdinterval;
      if (value <= dpdinterval) {
        this.warninnote2 = true;
        this.finishStatus = true;
      } else {
        this.warninnote1 = false;
        this.warninnote2 = false;
        this.finishStatus = false;
      }
    },
    showpassword() {
      let self = this;
      if (self.pskType == "text") {
         self.pskType = "password";
      } else {
         self.pskType = "text";
      }
    }
  }
}
</script>
<style type="text/css">
  input::-ms-reveal{
    display:none;
  }
</style>
