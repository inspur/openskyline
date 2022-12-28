<template>
  <div>
    <el-dialog :title="$t('network.createNetwork')" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag>
      <el-steps :active="activeIndex" process-status="process" finish-status="success">
        <el-step :title="$t('network.network')"></el-step>
        <el-step :title="$t('network.subnet')"></el-step>
      </el-steps>
      <el-form ref="addResSpecForm" :model="addResSpecForm" label-width="140px" :rules="rules" @stepOneDone="stepOneDone" v-show="activeIndex == 0" class="me-required-form margin-tb20">
        <el-form-item :label="$t('network.networkName')" class="is-required" prop="name">
          <el-input class="col-15" v-model="addResSpecForm.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.project')" class="is-required" prop="projectName" v-if="roleType == '0'">
          <el-input auto-complete="off" class="col-15" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="addResSpecForm.projectName"></el-input>
        </el-form-item>
        <el-form-item :label="$t('network.networkType')" class="is-required" prop="provider_network_type">
          <el-select v-model="addResSpecForm.provider_network_type" @change="handlenettypeChange" class="col-15">
            <el-option label="local" value="local"></el-option>
            <el-option label="flat" value="flat"></el-option>
            <el-option label="vlan" value="vlan"></el-option>
            <el-option label="vxlan" value="vxlan"></el-option>
          </el-select>
          <el-tooltip effect="dark" :content="$t('network.networkNode6')" placement="top">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('network.physicalNetwork')" v-if="phynet" class="is-required" prop="provider_physical_network">
          <el-input class="col-15" v-model="addResSpecForm.provider_physical_network"></el-input>
          <el-tooltip effect="dark" :content="$t('network.networkNote8')" placement="top">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('network.secgement')" v-if="duanid" class="is-required" prop="provider_segmentation_id">
          <el-input class="col-15" v-model="addResSpecForm.provider_segmentation_id"></el-input>
          <el-tooltip effect="dark" :content="$t('network.networkNote9')" placement="top">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('network.domainuse')" prop="provider_network_zone">
          <el-select v-model="addResSpecForm.provider_network_zone" class="col-15" multiple>
            <el-option v-for="item in zoneOptions" :key="item.name" :label="item.name" :value="item.name"></el-option>
          </el-select>
          <el-tooltip effect="dark" :content="$t('network.netzoneNote')" placement="top">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('network.manageStatus')">
          <el-switch :width="75" on-text="UP" off-text="DOWN" v-model="admin_state_up"></el-switch>
        </el-form-item>
        <el-form-item :label="$t('network.externalNet')" v-show="roleType == '0'">
          <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="router_exteral" @change="externalNetChange"></el-switch>
        </el-form-item>
        <el-form-item :label="$t('network.networkshared')" v-show="roleType == '0'">
          <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="shared"></el-switch>
          <el-tooltip effect="dark" :content="$t('network.networksharedTooltip')" placement="top">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('lang.desc')" prop="description">
              <el-input type="textarea" class="col-15" v-model="addResSpecForm.description"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-collapse class="col-24">
          <el-collapse-item :title="$t('network.advanceOptions')" name="11">
            <el-form-item :label="$t('network.physicalMachineNetworkType')" label-width="160px">
              <el-select v-model="addResSpecForm.physicalMachineNetworkType" clearable>
                <el-option :label="$t('network.bmService')" value="bm_service"></el-option>
                <el-option :label="$t('network.bmManage')" value="bm_manage"></el-option>
                <el-option :label="$t('network.bmStorage')" value="bm_storage"></el-option>
                <el-option v-if="roleType === '0' && !router_exteral" :label="$t('network.bmDeploy')" value="bm_deploy"></el-option>
              </el-select>
              <el-tooltip effect="dark" :content="$t('network.networkTogTIp')" placement="top">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
        <div class="me-form-footer">
          <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
          <el-button @click="stepTwoDone" type="primary">{{$t('lang.nextStep')}}</el-button>
        </div>
      </el-form>
      <el-form ref="subnetForm" :model="subnetForm" label-width="140px" :rules="subrules" v-show="activeIndex == 1" @prevStep="prevStep" @stepTwoDone="stepTwoDone" class="me-required-form margin-tb20" v-loading="loading">
        <el-form-item :label="$t('network.subnetName')" class="is-required" prop="subnetname">
          <el-input class="col-15" v-model="subnetForm.subnetname"></el-input>
        </el-form-item>
        <el-form-item :label="$t('network.ipversion')" class="is-required">
          <el-select v-model="subnetForm.ipversion" @change="ipversionChange">
            <el-option label="IPv4" value="4"></el-option>
            <el-option label="IPv6" value="6"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('network.ipv6addressconfig')" v-if="subnetForm.ipversion == 6">
          <!-- subnetForm.ipversion == 6 -->
          <el-select v-model="subnetForm.ipv6mode">
            <el-option :label="$t('network.nothing')" value=""></el-option>
            <el-option :label="$t('network.ipv6config1')" value="slaac/slaac"></el-option>
            <el-option :label="$t('network.ipv6config2')" value="none/slaac"></el-option>
            <el-option :label="$t('network.ipv6config4')" value="dhcpv6-stateless/dhcpv6-stateless"></el-option>
          </el-select>
          <el-tooltip effect="dark" :content="$t('network.ipv6configNote')" placement="top">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="CIDR" class="is-required" prop="netaddress">
          <el-input class="col-15" v-model="subnetForm.netaddress" @blur="cidrChange"></el-input>
          <el-tooltip effect="dark" :content="$t('network.networkNote1')" placement="top">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('network.enablegate')">
          <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="disableGateway"></el-switch>
        </el-form-item>
        <el-form-item :label="$t('network.gatewayip')" v-if="disableGateway" prop="gatewayip">
          <el-input class="col-15" v-model="subnetForm.gatewayip"></el-input>
          <el-tooltip effect="dark" placement="top">
            <div slot="content">{{$t('network.networkNote2')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-button type="text" style="padding-left:60px;" @click="showDetail()" href="advanceBtn">
          <span>{{advanceName}}</span>
        </el-button>
        <div v-show="subnetdetailStatus">
          <el-form-item :label="$t('network.enableDHCP')">
            <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="activeDHCP"></el-switch>
          </el-form-item>
          <el-form-item :label="$t('network.addresspool')">
            <el-row>
              <el-col :span="6">
                <el-form-item prop="startAddr">
                  <el-input v-model="subnetForm.startAddr" :placeholder="$t('network.beginaddress')"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="1" style="text-align:center;">-</el-col>
              <el-col :span="6" style="padding-left:10px;">
                <el-form-item prop="endAddr">
                  <el-input v-model="subnetForm.endAddr" :placeholder="$t('network.endaddress')"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="3" style="padding-left:10px;">
                <el-button size="small" type="primary" @click="addNewPool">{{$t('lang.addTo')}}</el-button>
                <el-tooltip effect="dark" placement="top">
                  <div slot="content">{{$t('network.networkNote3')}}</div>
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-col>
              <el-col :span="24" style="padding-top:7px;">
                <span>{{$t('network.addedAddresses')}}</span>
                <span v-if="haverespool">{{$t('network.nothing')}}</span>
                <el-tag v-for="tag in addresspolltext" :key="tag" closable @close="handlePoolClose(tag)">{{tag}}</el-tag>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item :label="$t('network.dnsserver')">
            <el-form-item prop="dnsAddr">
              <el-input class="col-6" v-model="subnetForm.dnsAddr"></el-input>
              <el-button type="primary" size="small" @click="addNewDNS">{{$t('lang.addTo')}}</el-button>
              <el-tooltip effect="dark" placement="top">
                <div slot="content">{{$t('network.networkNote4')}}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <span>{{$t('network.dnsAdded')}}</span>
            <span v-if="havednsserver">{{$t('network.nothing')}}</span>
            <el-tag v-for="tag in dnsserver" :key="tag" closable @close="handleDNSClose(tag)">{{tag}}</el-tag>
          </el-form-item>
          <el-form-item :label="$t('network.hostrouter')">
            <el-row>
              <el-col :span="6">
                <el-form-item prop="startHost">
                  <el-input v-model="subnetForm.startHost" :placeholder="$t('network.targetCidr')"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6" style="padding-left:10px;">
                <el-form-item prop="endHost">
                  <el-input v-model="subnetForm.endHost" :placeholder="$t('network.nextJump')"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="3" style="padding-left:10px;">
                <el-button size="small" type="primary" @click="addNewHost">{{$t('lang.addTo')}}</el-button>
                <el-tooltip effect="dark" placement="top">
                  <div slot="content">{{$t('network.networkNote5')}}</div>
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-col>
            </el-row>
            <el-form-item :label="$t('network.hostAdded')" label-width="140px" style="padding-top:7px;">
              <span v-if="havehostrouter">{{$t('network.nothing')}}</span>
              <el-tag v-for="tag in hostroutertext" :key="tag" closable @close="handleHostClose(tag)">{{tag}}</el-tag>
            </el-form-item>
          </el-form-item>
        </div>
        <div class="me-form-footer">
          <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
          <el-button @click="stepOneDone" type="primary">{{$t('lang.preStep')}}</el-button>
          <el-button @click="finishStep" type="primary" :disabled="isDisabled">{{$t('lang.finish')}}</el-button>
        </div>
      </el-form>
    </el-dialog>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script type="text/javascript">
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "AddNetwork",
  data() {
    return {
      activeIndex: 0,
      dialogVisible: false,
      createSubnetStatus: false,
      activeName: "first",
      projectOption: Vue.projectListforNet,
      roleType: Vue.roleType + "",
      admin_state_up: true,
      shared: false,
      sharedDisabled: false,
      router_exteral: false,
      addresspoll: [],
      addresspolltext: [],
      dnsserver: [],
      hostrouter: [],
      hostroutertext: [],
      zoneOptions: [],
      disableGateway: true,
      activeDHCP: true,
      phynet: false,
      duanid: false,
      subnetdetailStatus: false,
      haverespool: true,
      havednsserver: true,
      havehostrouter: true,
      isDisabled: false,
      loading: false,
      advanceName: Vue.t("network.advanceRight"),
      networktypeOption: [],
      networkTypeVisable: false,
      selProjectFlg: false,
      close: "",
      addResSpecForm: {
        name: "",
        description: "",
        query_porject: "",
        projectName: "",
        provider_network_type: "",
        provider_physical_network: "",
        provider_segmentation_id: "",
        provider_network_zone: "",
        physicalMachineNetworkType: ''
      },
      subnetForm: {
        subnetname: "",
        netaddress: "",
        ipversion: "4",
        gatewayip: "",
        startAddr: "",
        endAddr: "",
        dnsAddr: "",
        startHost: "",
        endHost: "",
        ipv6mode: ""
      },
      rules: {
        name: [
          { type: "requiredNet" },
          { type: "maxSize", value: 40 },
          { type: "onlyLetter_NumberChinese" }
        ],
        description: [{ type: "maxSize", value: 255 }],
        provider_physical_network: [{ type: "required" }],
        projectName: [{ type: "requiredNet" }],
        provider_network_type: [{ type: "requiredNet" }],
        provider_segmentation_id: [
          { type: "requiredNet" },
          { type: "integer" },
          { type: "min", value: 1 },
          { type: "max", value: 16777215 }
        ]
      },
      subrules: {
        subnetname: [
          { type: "requiredNet" },
          { type: "maxSize", value: 40 },
          { type: "onlyLetterNumber_Chinese" }
        ],
        netaddress: [{ type: "requiredNet" }, { type: "cidr" }],
        ipversion: [{ type: "requiredNet" }],
        gatewayip: [{ type: "ipv4" }],
        startAddr: [{ type: "ipv4" }],
        endAddr: [{ type: "ipv4" }],
        dnsAddr: [{ type: "ipv4" }],
        startHost: [{ type: "cidr" }],
        endHost: [{ type: "ipv4" }]
      }
    };
  },
  mounted() {
    let self = this;
    let roleType = Vue.roleType + "";
    if (roleType == "0") {
    } else {
      self.addResSpecForm.query_porject = Vue.cookie.get("pid");
    }
    this.initZones();
    this.initDialog();
  },
  updated() {
    let self = this;
    if (self.addResSpecForm.provider_network_type === "vxlan") {
      self.rules.provider_segmentation_id = [
        { type: "requiredNet" },
        { type: "integer" },
        { type: "min", value: 1 },
        { type: "max", value: 16777215 }
      ];
    } else if (self.addResSpecForm.provider_network_type === "vlan") {
      self.rules.provider_segmentation_id = [
        { type: "requiredNet" },
        { type: "integer" },
        { type: "min", value: 1 },
        { type: "max", value: 4094 }
      ];
    }
    if (self.addresspolltext.length === 0) {
      self.haverespool = true;
    } else {
      self.haverespool = false;
    }
    if (self.dnsserver.length === 0) {
      self.havednsserver = true;
    } else {
      self.havednsserver = false;
    }
    if (self.hostroutertext.length === 0) {
      self.havehostrouter = true;
    } else {
      self.havehostrouter = false;
    }
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
      let roleType = Vue.roleType + "";
      if (roleType != "0") {
        this.phynet = false;
        this.duanid = false;
      }
    },
    async initZones() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: "get",
          url: "api/neutron/v2.0/availability_zones?resource=network"
        });
        self.loading = false;
        var list = result["availability_zones"];
        self.zoneOptions = list;
      } catch (res) {
        self.loading = false;
      }
    },
    handleClose() {
      this.$emit("handleCancelShow", {});
    },
    handleSubnetChange() {
      var self = this;
      if (this.createSubnetStatus === true) {
        this.activeName = "second";
      }
    },
    externalChange(value) {
      if (value === true) {
        this.shared = true;
        this.sharedDisabled = true;
      } else {
        this.sharedDisabled = false;
      }
    },
    cancel() {
      this.$emit("handleCancelShow", {});
    },
    handlenettypeChange(val) {
      if (val === "flat") {
        this.phynet = true;
        this.duanid = false;
      } else if (val === "vxlan") {
        this.phynet = false;
        this.duanid = true;
      } else if (val === "vlan") {
        this.phynet = true;
        this.duanid = true;
      } else {
        this.phynet = false;
        this.duanid = false;
      }
    },
    ipversionChange(value) {
      let self = this;
      if (self.subnetForm.ipversion === "4") {
        self.subrules.netaddress = [{ type: "requiredNet" }, { type: "cidr" }];
        if (self.disableGateway === false) {
          self.subrules.gatewayip = [];
        } else {
          self.subrules.gatewayip = [{ type: "ipv4" }];
        }
        self.subrules.startAddr = [{ type: "ipv4" }];
        self.subrules.endAddr = [{ type: "ipv4" }];
        self.subrules.dnsAddr = [{ type: "ipv4" }];
        self.subrules.startHost = [{ type: "cidr" }];
        self.subrules.endHost = [{ type: "ipv4" }];
      } else {
        self.subrules.netaddress = [
          { type: "requiredNet" },
          { type: "cidrIPV6Include0" }
        ];
        if (self.disableGateway === false) {
          self.subrules.gatewayip = [];
        } else {
          self.subrules.gatewayip = [{ type: "ipv6" }];
        }
        self.subrules.startAddr = [{ type: "ipv6" }];
        self.subrules.endAddr = [{ type: "ipv6" }];
        self.subrules.dnsAddr = [{ type: "ipv6" }];
        self.subrules.startHost = [{ type: "cidripv6" }];
        self.subrules.endHost = [{ type: "ipv6" }];
      }
      if (self.subnetForm.netaddress != "") {
        self.cidrChange();
      }
      self.$refs.subnetForm.validate(async valid => {
        if (valid) {
          return true;
        } else {
          return false;
        }
      });
    },
    prevStep(activeIndex) {
      this.activeIndex = activeIndex;
      Vue.scrollToHeader();
    },
    stepOneDone(param) {
      Vue.scrollToHeader();
      this.activeIndex = 0;
    },
    stepTwoDone(param) {
      Vue.scrollToHeader();
      this.$refs.addResSpecForm.validate(async valid => {
        if (valid) {
          this.activeIndex = 1;
          return true;
        } else {
          return false;
        }
      });
    },
    cidrChange(event = null) {
      let reg4 = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
      let reg6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
      if (this.subnetForm.ipversion == "4") {
        if (reg4.test(this.subnetForm.netaddress)) {
          // this.genernateaddrpool(this.subnetForm.netaddress);
        } else {
          this.subnetForm.startAddr = "";
          this.subnetForm.endAddr = "";
        }
      } else {
        let fields = this.subnetForm.netaddress.split("/");
        if (fields.length === 2) {
          let subNet = fields[1];
          let ipv6 = fields[0];
          if ((reg6.test(ipv6) || ipv6 === "::") && Number(subNet) >= 1 && Number(subNet) <= 128) {
            // this.genernateaddrpool(this.subnetForm.netaddress);
          } else {
            this.subnetForm.startAddr = "";
            this.subnetForm.endAddr = "";
          }
        } else {
          this.subnetForm.startAddr = "";
          this.subnetForm.endAddr = "";
        }
      }
    },
    addNewPool() {
      let self = this;
      let startIP = self.subnetForm.startAddr;
      let endIP = self.subnetForm.endAddr;
      if (startIP == "") {
        self.$notify({
          message: Vue.t("network.startAddressnotempty"),
          type: "warning"
        });
      } else if (endIP == "") {
        self.$notify({
          message: Vue.t("network.endAddressnotempty"),
          type: "warning"
        });
      }
      let reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
      let regIPv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
      if (self.subnetForm.ipversion === "4") {
        if (
          startIP != "" &&
          endIP != "" &&
          reg.test(startIP) &&
          reg.test(endIP)
        ) {
          startIP = self.removeZerofromip(startIP);
          endIP = self.removeZerofromip(endIP);
          self.addresspolltext.push(
            Vue.t("network.beginaddress") +
              ":" +
              startIP +
              "," +
              Vue.t("network.endaddress") +
              ":" +
              endIP
          );
          self.addresspoll.push({ start: startIP, end: endIP });
          self.subnetForm.startAddr = "";
          self.subnetForm.endAddr = "";
        }
      } else {
        if (
          startIP != "" &&
          endIP != "" &&
          regIPv6.test(startIP) &&
          regIPv6.test(endIP)
        ) {
          startIP = self.removeZerofromipv6(startIP);
          endIP = self.removeZerofromipv6(endIP);
          self.addresspolltext.push(
            Vue.t("network.beginaddress") +
              ":" +
              startIP +
              "," +
              Vue.t("network.endaddress") +
              ":" +
              endIP
          );
          self.addresspoll.push({ start: startIP, end: endIP });
          self.subnetForm.startAddr = "";
          self.subnetForm.endAddr = "";
        }
      }
    },
    handlePoolClose(tag) {
      let self = this;
      let tagList = tag.split(",");
      if (self.subnetForm.ipversion === "4") {
        let tag0 = tagList[0].split(":");
        let tag1 = tagList[1].split(":");
        for (let i = 0; i < self.addresspoll.length; i++) {
          let pool = self.addresspoll[i];
          if (pool.start == tag0[1] && pool.end == tag1[1]) {
            self.addresspoll.splice(i, 1);
          }
        }
      } else {
        let tag0 = tagList[0].toString();
        let tag1 = tagList[1].toString();
        let tag0head = tag0.split(":")[0].length + 1;
        let tag1head = tag1.split(":")[0].length + 1;
        tag0 = tag0.substring(tag0head);
        tag1 = tag1.substring(tag1head);
        for (let i = 0; i < self.addresspoll.length; i++) {
          let pool = self.addresspoll[i];
          if (pool.start == tag0 && pool.end == tag1) {
            self.addresspoll.splice(i, 1);
          }
        }
      }
      self.addresspolltext.splice(self.addresspolltext.indexOf(tag), 1);
    },
    addNewDNS() {
      let self = this;
      let dnsIP = self.subnetForm.dnsAddr;
      if (dnsIP == "") {
        self.$notify({
          message: Vue.t("network.dnsServerNotEmpty"),
          type: "warning"
        });
      }
      let reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
      let regIPv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
      if (self.subnetForm.ipversion === "4") {
        if (dnsIP != "" && reg.test(dnsIP)) {
          dnsIP = self.removeZerofromip(dnsIP);
          self.dnsserver.push(dnsIP);
          self.subnetForm.dnsAddr = "";
        }
      } else {
        if (dnsIP != "" && regIPv6.test(dnsIP)) {
          dnsIP = self.removeZerofromipv6(dnsIP);
          self.dnsserver.push(dnsIP);
          self.subnetForm.dnsAddr = "";
        }
      }
    },
    handleDNSClose(tag) {
      let self = this;
      self.dnsserver.splice(self.dnsserver.indexOf(tag), 1);
    },
    addNewHost() {
      let self = this;
      let startIP = self.subnetForm.startHost;
      let endIP = self.subnetForm.endHost;
      if (startIP == "") {
        self.$notify({
          message: Vue.t("network.targetCidrNotEmpty"),
          type: "warning"
        });
        return;
      } else if (endIP == "") {
        self.$notify({
          message: Vue.t("network.nextJumpNoEmpty"),
          type: "warning"
        });
        return;
      }
      let regCIDR = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
      let regIP = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
      let regIPv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
      if (self.subnetForm.ipversion === "4") {
        if (
          startIP != "" &&
          endIP != "" &&
          regCIDR.test(startIP) &&
          regIP.test(endIP)
        ) {
          startIP = self.removeZerofromCidr(startIP);
          endIP = self.removeZerofromip(endIP);
          self.hostroutertext.push(
            Vue.t("network.targetCidr") +
              ":" +
              startIP +
              "," +
              Vue.t("network.nextJump") +
              ":" +
              endIP
          );
          self.hostrouter.push({ destination: startIP, nexthop: endIP });
          self.subnetForm.startHost = "";
          self.subnetForm.endHost = "";
        }
      } else {
        if (startIP != "" && endIP != "" && regIPv6.test(endIP)) {
          endIP = self.removeZerofromipv6(endIP);
          let fields = startIP.split("/");
          if (fields.length === 2) {
            let subNet = fields[1];
            let ipv6 = fields[0];
            ipv6 = self.removeZerofromipv6(ipv6);
            startIP = ipv6 + "/" + subNet;
            if (
              regIPv6.test(ipv6) &&
              Number(subNet) >= 1 &&
              Number(subNet) <= 128
            ) {
              self.hostroutertext.push(
                Vue.t("network.targetCidr") +
                  ":" +
                  startIP +
                  "," +
                  Vue.t("network.nextJump") +
                  ":" +
                  endIP
              );
              self.hostrouter.push({
                destination: startIP,
                nexthop: endIP
              });
              self.subnetForm.startHost = "";
              self.subnetForm.endHost = "";
            }
          }
        }
      }
    },
    handleHostClose(tag) {
      let self = this;
      let tagarray = tag.split(",");
      if (self.subnetForm.ipversion === "4") {
        let destination = tagarray[0].split(":")[1];
        let nexthop = tagarray[1].split(":")[1];
        for (let i = self.hostrouter.length - 1; i >= 0; i--) {
          let pool = self.hostrouter[i];
          if (pool.destination === destination && pool.nexthop === nexthop) {
            self.hostrouter.splice(i, 1);
          }
        }
      } else {
        let tag0 = tagarray[0].toString();
        let tag1 = tagarray[1].toString();
        let tag0head = tag0.split(":")[0].length + 1;
        let tag1head = tag1.split(":")[0].length + 1;
        tag0 = tag0.substring(tag0head);
        tag1 = tag1.substring(tag1head);
        for (let i = 0; i < self.hostrouter.length; i++) {
          let pool = self.hostrouter[i];
          if (pool.destination == tag0 && pool.nexthop == tag1) {
            self.hostrouter.splice(i, 1);
          }
        }
      }
      self.hostroutertext.splice(self.hostroutertext.indexOf(tag), 1);
    },
    removeZerofromip(ip) {
      let newaddress = "";
      let address2 = ip.split(".");
      for (let i = 0; i < address2.length; i++) {
        if (address2[i].length == 2) {
          if (address2[i].substr(0, 1) == "0") {
            address2[i] = address2[i].substr(1);
          }
        } else if (address2[i].length == 3) {
          if (
            address2[i].substr(0, 1) == "0" &&
            address2[i].substr(1, 1) == "0"
          ) {
            address2[i] = address2[i].substr(2);
          } else if (
            address2[i].substr(0, 1) == "0" &&
            address2[i].substr(1, 1) != "0"
          ) {
            address2[i] = address2[i].substr(1);
          }
        }
        if (i != 3) {
          newaddress += address2[i] + ".";
        } else {
          newaddress += address2[i];
        }
      }
      return newaddress;
    },
    removeZerofromCidr(ip) {
      let self = this;
      let newaddress = "";
      let address0 = ip.split("/");
      let address1 = address0[0];
      newaddress = self.removeZerofromip(address1) + "/" + address0[1];
      return newaddress;
    },
    removeZerofromipv6(ip) {
      let newaddress = "";
      let address = ip.split(":");
      for (let i = 0; i < address.length; i++) {
        if (address[i].length == 2) {
          if (address[i].substr(0, 1) == "0") {
            address[i] = address[i].substr(1);
          }
        } else if (address[i].length == 3) {
          if (
            address[i].substr(0, 1) == "0" &&
            address[i].substr(1, 1) == "0"
          ) {
            address[i] = address[i].substr(2);
          } else if (
            address[i].substr(0, 1) == "0" &&
            address[i].substr(1, 1) != "0"
          ) {
            address[i] = address[i].substr(1);
          }
        } else if (address[i].length == 4) {
          if (
            address[i].substr(0, 1) == "0" &&
            address[i].substr(1, 1) == "0" &&
            address[i].substr(2, 1) == "0"
          ) {
            address[i] = address[i].substr(3);
          } else if (
            address[i].substr(0, 1) == "0" &&
            address[i].substr(1, 1) == "0" &&
            address[i].substr(2, 1) != "0"
          ) {
            address[i] = address[i].substr(2);
          } else if (
            address[i].substr(0, 1) == "0" &&
            address[i].substr(1, 1) != "0"
          ) {
            address[i] = address[i].substr(1);
          }
        }
        if (i != address.length - 1) {
          newaddress += address[i] + ":";
        } else {
          newaddress += address[i];
        }
      }
      return newaddress;
    },
    showDetail() {
      if (this.subnetdetailStatus == false) {
        this.subnetdetailStatus = true;
        this.advanceName = Vue.t("network.advanceLeft");
      } else {
        this.subnetdetailStatus = false;
        this.advanceName = Vue.t("network.advanceRight");
      }
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.addResSpecForm.query_porject = id;
      this.addResSpecForm.projectName = name;
      this.close = "close";
    },
    onIconClick() {
      this.addResSpecForm.query_porject = "";
      this.addResSpecForm.projectName = "";
      this.close = "";
    },
    finishStep(param) {
      let self = this;
      self.$refs.subnetForm.validate(async valid => {
        if (valid) {
          self.isDisabled = true;
          self.loading = true;
          let network = {};
          network["admin_state_up"] = self.admin_state_up;
          network["name"] = self.addResSpecForm.name;
          network["project_id"] = self.addResSpecForm.query_porject;
          network["tenant_id"] = self.addResSpecForm.query_porject;
          network["description"] = self.addResSpecForm.description;
          network["availability_zone_hints"] =
            self.addResSpecForm.provider_network_zone;
          if (self.roleType == "0") {
            network["router:external"] = self.router_exteral;
            network["shared"] = self.shared;
            let providerphysical =
              self.addResSpecForm.provider_physical_network;
            let providerduan = parseInt(
              self.addResSpecForm.provider_segmentation_id
            );
            if (self.addResSpecForm.provider_network_type === "local") {
              network["provider:network_type"] =
                self.addResSpecForm.provider_network_type;
            } else if (self.addResSpecForm.provider_network_type === "flat") {
              network["provider:network_type"] =
                self.addResSpecForm.provider_network_type;
              network["provider:physical_network"] = providerphysical;
            } else if (self.addResSpecForm.provider_network_type === "vlan") {
              network["provider:network_type"] =
                self.addResSpecForm.provider_network_type;
              network["provider:physical_network"] = providerphysical;
              network["provider:segmentation_id"] = providerduan;
            } else if (self.addResSpecForm.provider_network_type === "vxlan") {
              network["provider:network_type"] =
                self.addResSpecForm.provider_network_type;
              network["provider:segmentation_id"] = providerduan;
            }
          }
          let reqdata = {};
          reqdata["network"] = network;
          self.$ajax({
            type: "POST",
            url: "api/neutron/v2.0/networks",
            data: JSON.stringify(reqdata),
            log: {
              description: {
                en: "Create Network:" + self.addResSpecForm.name,
                zh_cn: "创建网络:" + self.addResSpecForm.name
              },
              target: Vue.logTarget.networkList
            },
            success: function(result) {
              let network = result["network"];
              let networkId = network["id"];
              let netaddress = self.subnetForm.netaddress;
              let ipversion = self.subnetForm.ipversion;
              let gatewayip = self.subnetForm.gatewayip;
              //处理CIDR中的0
              if (ipversion == "4") {
                netaddress = self.removeZerofromCidr(netaddress);
              }
              let activeDHCP = self.activeDHCP;
              // 禁用网关，gateway_ip字段传null代表禁用网关
              let reqdata = {
                subnet: {
                  network_id: networkId,
                  ip_version: ipversion,
                  cidr: netaddress,
                  name: self.subnetForm.subnetname,
                  enable_dhcp: activeDHCP,
                  dns_nameservers: self.dnsserver,
                  allocation_pools: self.addresspoll,
                  host_routes: self.hostrouter,
                  project_id: self.addResSpecForm.query_porject,
                  gateway_ip: null
                }
              };
              // 启用网关，页面不填gatewayip时，不发送gateway_ip字段；填了，则发送所填
              if (self.disableGateway === true) {
                if (gatewayip == "") {
                  reqdata = {
                    subnet: {
                      network_id: networkId,
                      ip_version: ipversion,
                      cidr: netaddress,
                      name: self.subnetForm.subnetname,
                      enable_dhcp: activeDHCP,
                      dns_nameservers: self.dnsserver,
                      allocation_pools: self.addresspoll,
                      project_id: self.addResSpecForm.query_porject,
                      host_routes: self.hostrouter
                    }
                  };
                } else {
                  if (ipversion == "4") {
                    gatewayip = self.removeZerofromip(gatewayip);
                  } else {
                    gatewayip = self.removeZerofromipv6(gatewayip);
                  }
                  reqdata = {
                    subnet: {
                      network_id: networkId,
                      ip_version: ipversion,
                      cidr: netaddress,
                      name: self.subnetForm.subnetname,
                      enable_dhcp: activeDHCP,
                      dns_nameservers: self.dnsserver,
                      allocation_pools: self.addresspoll,
                      host_routes: self.hostrouter,
                      project_id: self.addResSpecForm.query_porject,
                      gateway_ip: gatewayip
                    }
                  };
                }
              }
              if (ipversion == "6") {
                if (self.subnetForm.ipv6mode == "") {
                } else if (self.subnetForm.ipv6mode == "slaac/slaac") {
                  reqdata.subnet["ipv6_address_mode"] = "slaac";
                  reqdata.subnet["ipv6_ra_mode"] = "slaac";
                } else if (self.subnetForm.ipv6mode == "none/slaac") {
                  reqdata.subnet["ipv6_address_mode"] = "slaac";
                } else if (
                  self.subnetForm.ipv6mode ==
                  "dhcpv6-stateless/dhcpv6-stateless"
                ) {
                  reqdata.subnet["ipv6_address_mode"] = "dhcpv6-stateless";
                  reqdata.subnet["ipv6_ra_mode"] = "dhcpv6-stateless";
                }
              }
              if (gatewayip != "") {
                self.$ajax({
                  type: "POST",
                  url: "api/neutron/v2.0/subnets",
                  data: JSON.stringify(reqdata),
                  success: function(result) {
                    self.$notify({
                      message:
                        network["name"] + Vue.t("network.createSuccess"),
                      type: "success"
                    });
                    self.isDisabled = false;
                    self.loading = false;
                    self.$emit("handleAddShow", {});
                  },
                  errFun() {
                    self.$ajax({
                      type: "DELETE",
                      url: "api/neutron/v2.0/networks/" + networkId,
                      showErrMsg: false,
                      data: {}
                    });
                    self.isDisabled = false;
                    self.loading = false;
                  },
                  errorKey: "NeutronError"
                });
              } else {
                self.$ajax({
                  type: "POST",
                  url: "api/neutron/v2.0/subnets",
                  data: JSON.stringify(reqdata),
                  success: function(result) {
                    self.$notify({
                      message: network["name"] + Vue.t("network.createSuccess"),
                      type: "success"
                    });
                    self.isDisabled = false;
                    self.loading = false;
                    self.$emit("handleAddShow", {});
                  },
                  errFun() {
                    self.$ajax({
                      type: "DELETE",
                      url: "api/neutron/v2.0/networks/" + networkId,
                      showErrMsg: false,
                      data: {}
                    });
                    self.isDisabled = false;
                    self.loading = false;
                  },
                  errorKey: "NeutronError"
                });
              }
              if (networkId && self.addResSpecForm.physicalMachineNetworkType) {
                let parm = {tags:[self.addResSpecForm.physicalMachineNetworkType]};
                self.$ajax({
                  type: "PUT",
                  url: "api/neutron/v2.0/networks/" + networkId + '/tags',
                  data: JSON.stringify(parm),
                  showErrMsg: false,
                  success: function(result) {
                  }
                });
              }
            },
            errorKey: "NeutronError",
            errFun() {
              self.isDisabled = false;
              self.loading = false;
            }
          });
          return true;
        } else {
          return false;
        }
      });
    },
    externalNetChange(value) {
      if (value && this.addResSpecForm.physicalMachineNetworkType == "bm_deploy") {
        this.addResSpecForm.physicalMachineNetworkType = "";
      }
    }
  }
};
</script>
