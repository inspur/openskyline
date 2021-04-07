<template>
<div>
  <el-dialog :title="$t('network.addipsecStation')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-row>
    <el-col :span="24">  
    <el-form ref="form" :model="form" class="me-required-form" label-width="180px" :rules="rules" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-10"  v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.desc')" prop="description">
        <el-input type="textarea" class="col-10" v-model="form.description"></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
        <!--<el-select v-model="form.project_id" filterable clearable  @change="projectChange">
          <el-option v-for="item in query_porject" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>-->
        <el-input auto-complete="off" class="col-10" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="form.projectName"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.vpnServer')" class="is-required" prop="vpnServer">
        <el-select class="col-10" v-model="form.vpnServer" filterable @change="vpnServerChange">
          <el-option v-for="item in vpnserverList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.localendpointgroup')" class="is-required" prop="endpointsubnet">
        <el-select class="col-10" v-model="form.endpointsubnet" filterable>
          <el-option v-for="item in subnetList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-tooltip  effect="dark" :content="$t('network.localendpointTip')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.ikeStrategy')" class="is-required" prop="ikeStrategy">
        <el-select class="col-10" v-model="form.ikeStrategy" filterable>
          <el-option v-for="item in ikestrategyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.ipsecStrategy')" class="is-required" prop="ipsecStrategy">
        <el-select class="col-10" v-model="form.ipsecStrategy" filterable>
          <el-option v-for="item in ipsecstrategyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
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
      <!-- <el-form-item :label="$t('network.peercidrs')" prop="peercidrs">
        <el-input class="col-10" v-model="form.peercidrs" @change="peercidrsChange"></el-input>
        <el-tooltip effect="dark" placement="top">
          <div slot="content">{{$t('network.vpnNote3')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
        <div v-if="peercidrsFlag" class="col-24" style="position:absolute;font-size:12px;line-height: 0.8;padding-top: 3px;top: 100%;color:#dd4b39;">
          <span>{{$t('network.formaterror')}}</span>
        </div>
      </el-form-item> -->
      <el-form-item :label="$t('network.psk')" class="is-required" prop="psk">
        <el-input class="col-10" v-model="form.psk" :type="pskType">
          <el-button type="info" slot="append" icon="fa-eye" @click="showpassword()"></el-button>
        </el-input>
        <el-tooltip effect="dark" :content="$t('network.vpnNote33')" placement="top">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-button type="text" style="padding-left:10px;" @click="showDetail()" href="advanceBtn"><span>{{advanceName}}</span></el-button>
      <div v-show="optionalStatus">
      <el-form-item :label="$t('network.mtumin')" prop="mtu">
        <el-input-number class="col-10" :min="form.mtumin" :max="2147483647" v-model="form.mtu"></el-input-number>
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
        <el-tooltip effect="dark" :content="$t('network.vpnNote5')" placement="top">
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
    </el-col>
    <!-- <el-col :span="8">
      <div>
        {{$t("network.addIpsecstationNote1")}}
      </div>
    </el-col> -->
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="saveAdd" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
  <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script type="text/javascript">
export default {
  name:"AddIpsecStation",
  data() {
    return {
      dialogVisible: false,
      loading: false,
      warninnote1: false,
      warninnote2: false,
      finishStatus: false,
      roleType: Vue.roleType + "",
      query_porject: Vue.projectListforNet,
      isDisabled: false,
      peercidrsFlag: false,
      pskType: "password",
      selProjectFlg:false,
      subnetList:[],
      cidrList:[],
      close: "",
      form: {
        name: "",
        description: "",
        project_id: "",
        endpointsubnet:"",
        endpointcidr:"",
        projectName:"",
        vpnServer: "",
        ikeStrategy: "",
        ipsecStrategy: "",
        peeraddress: "",
        peerid: "",
        peercidrs: "",
        psk: "",
        mtu: 1500,
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
      advanceName: Vue.t('network.choosenattrright'),
      optionalStatus: false,
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 40}
        ],
        projectName: [
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
        peeraddress: [
          {type: "requiredNet"},
          {type: 'ipv4oripv6'}
        ],
        endpointsubnet:[
          {type: "requiredNet"}
        ],
        endpointcidr:[
          {type: "requiredNet"}
        ],
        peerid: [
          {type: "requiredNet"},
          {type: 'ipv4oripv6'}
        ],
        peercidrs: [
          // {type: "requiredNet"},
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
    let roletype = Vue.roleType + "";
    if (roletype != "0") {
      this.form.project_id = Vue.cookie.get('pid');
      this.getvpnserviceList(this.form.project_id);
      this.getikestrategyList(this.form.project_id);
      this.getipsecstrategyList(this.form.project_id);
      this.getEndpointGroupsList(this.form.project_id);
    }
  },
  methods: {
    initDialog() {
      this.dialogVisible = true;
      // setTimeout(function() {
      //   for (var i = 0; i < document.querySelector(".el-dialog__body").querySelectorAll(".el-form-item__label").length; i++) {
      //     console.log(i+"---"+document.querySelector(".el-dialog__body").querySelectorAll(".el-form-item__label")[i]);
      //     document.querySelector(".el-dialog__body").querySelectorAll(".el-form-item__label")[i].style["margin-bottom"] = "-12px";
      //     document.querySelector(".el-dialog__body").querySelectorAll(".el-form-item__label")[i].style["margin-top"] = "-4px";
      //   }
      // }, 100);
    },
    projectChange(projectId) {
      this.form.vpnServer = "";
      this.form.ikeStrategy = "";
      this.form.ipsecStrategy = "";
      this.getvpnserviceList(projectId);
      this.getikestrategyList(projectId);
      this.getipsecstrategyList(projectId);
      this.getEndpointGroupsList(projectId);
    },
    async getvpnserviceList(projectId) {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/vpn/vpnservices?project_id="+projectId,
          errorKey: "NeutronError"
        });
        self.vpnserverList = [];
        let lists = result["vpnservices"];
        for (let i = 0; i < lists.length; i++) {
          let list = lists[i];
          if (list["ipsec_site_connections"].length === 0) {
            self.vpnserverList.push(list);
          }
        }
      } catch (res) {
      }
    },
    async getikestrategyList(projectId) {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/vpn/ikepolicies?project_id="+projectId,
          errorKey: "NeutronError"
        });
        self.ikestrategyList = result["ikepolicies"];
      } catch (res) {
      }
    },
    async getipsecstrategyList(projectId) {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/vpn/ipsecpolicies?project_id="+projectId,
          errorKey: "NeutronError"
        });
        self.ipsecstrategyList = result["ipsecpolicies"];
      } catch (res) {
      }
    },
    async getEndpointGroupsList(projectId) {
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
    vpnServerChange(value) {
      let self = this;
      let subnetworkId = "";
      for (let i = 0; i < self.vpnserverList.length; i++) {
        let vpns = self.vpnserverList[i];
        if (vpns["id"] === value) {
          subnetworkId = vpns["subnet_id"];
          break;
        }
      }
      if (subnetworkId != "" && subnetworkId != null) {
        self.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/subnets/"+subnetworkId,
          data: {},
          success: function(result) {
            let subnet = result["subnet"];
            if (subnet["ip_version"] == 4) {
              self.form.mtumin = 68;
            } else {
              self.form.mtumin = 1280;
              if (self.form.mtu <= self.form.mtumin) {
                self.form.mtu = 1280;
              }
            }
          },
          errorKey: "NeutronError"
        });
      }
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
          self.loading = true;
          self.isDisabled = true;
          self.$ajax({
            type: "GET",
            url: "api/neutron/v2.0/vpn/vpnservices/"+self.form.vpnServer,
            data: {},
            success: function(result) {
              let vpnservice = result["vpnservice"];
              let connetcions = vpnservice["ipsec_site_connections"];
              if (connetcions.length != 0) {
                 self.$notify.error({
                  message: Vue.t('network.vpnNote9')
                 });
                 self.loading = false;
                 self.isDisabled = false;
                 return false;
              } else {
                let peercidrs = [];
                let peercidrsString = self.form.peercidrs;
                peercidrs = peercidrsString.split(",");
                let reqdata = {"ipsec_site_connection":{
                  "name": self.form.name,
                  "description": self.form.description,
                  "project_id": self.form.project_id,
                  "ikepolicy_id": self.form.ikeStrategy,
                  "vpnservice_id": self.form.vpnServer,
                  "ipsecpolicy_id": self.form.ipsecStrategy,
                  "peer_address": self.form.peeraddress,
                  "peer_id": self.form.peerid,
                  "local_ep_group_id":self.form.endpointsubnet,
                  "peer_ep_group_id":self.form.endpointcidr,
                  "peer_cidrs": peercidrs,
                  "psk": self.form.psk,
                  "dpd": {
                    "action": self.form.dpdaction,
                    "timeout": self.form.dpdtimeout,
                    "interval": self.form.dpdinterval
                  },
                  "initiator": self.form.initiator,
                  "mtu": self.form.mtu,
                  "admin_state_up": self.form.adminstateup
                }};
                if (self.form.peercidrs == "") {
                  delete reqdata.ipsec_site_connection.peer_cidrs;
                }
                if (self.form.endpointsubnet == "") {
                  delete reqdata.ipsec_site_connection.local_ep_group_id;
                }
                if (self.form.endpointcidr == "") {
                  delete reqdata.ipsec_site_connection.peer_ep_group_id;
                }
                self.$ajax({
                  type: "POST",
                  url: "api/neutron/v2.0/vpn/ipsec-site-connections",
                  data: JSON.stringify(reqdata),
                  errorKey: "NeutronError",
                  successMsg: Vue.t('network.saveSuccess'),
                  success: function(result) {
                    self.loading = false;
                    self.isDisabled = false;
                    self.$emit("handleAddShow", {});
                  },
                  errFun() {
                    self.loading = false;
                    self.isDisabled = false;
                  },
                  log:{
                    description:{
                      en:"Create IPSec:"+self.form.name,
                      zh_cn:"创建IPSec站点连接:"+self.form.name
                    },
                    target:Vue.logTarget.ipsecStation
                  }
                });
              }
            },
            errFun() {
              self.loading = false;
              self.isDisabled = false;
            }
          });
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
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.form.project_id = id;
      this.form.projectName = name;
      this.close = 'close';
      this.projectChange(id);
    },
    onIconClick() {
      this.form.project_id = '';
      this.form.projectName = '';
      this.close = '';
    }
  }
}
</script>
<style type="text/css">
  input::-ms-reveal{
    display:none;
  }
</style>