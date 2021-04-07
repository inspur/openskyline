<template>
<el-dialog
  :title="scalingServiceTitle"
  :visible.sync="dialogVisible"
  :before-close="handleClose">
  <el-form label-position="left" class="me-required-form" :model="scalingSerCreateForm" :rules=rules ref="scalingSerCreateForm" label-width="120px" v-loading="loading">
    <el-collapse v-model="activeNames" style="text-align:left">
      <el-collapse-item :title="$t('scalingService.baseInfo')" name="baseConfig">
        <el-row>
          <el-col :span="20">
            <el-form-item :label="$t('scalingService.scalingServiceName')" class="is-required" prop="scalingServiceName">
              <el-input class="col-15" v-model="scalingSerCreateForm.scalingServiceName" auto-complete="off"></el-input>
              <el-tooltip  effect="dark" placement="top">
                  <div slot="content">{{$t('scalingService.inputScalingServiceName')}}</div>
                  <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('scalingService.instanceName')" class="is-required" prop="instanceName">
              <el-input class="col-15" v-model="scalingSerCreateForm.instanceName" auto-complete="off"></el-input>
              <el-tooltip  effect="dark" placement="top">
                  <div slot="content">{{$t('scalingService.inputClusterInstanceName')}}</div>
                  <div slot="content">{{$t('scalingService.instanceNameInClusterIsDiffer')}}</div>
                  <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('calcStorLang.az')" prop="domain">
              <el-select v-model="scalingSerCreateForm.domain"  class="col-15" filterable>
                <el-option v-for="item in zoneOptions" :key="item.value" :label="item.zoneName" :value="item.zoneName"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item  :label="$t('storage.image')" class="is-required" prop="image">
              <el-select v-model="scalingSerCreateForm.image" @change="imageChange" class="col-15" filterable>
                <el-option v-for="item in imageOptions" :key="item.id" :label="item.name.length>20?item.name.substring(0, 20) + '...':item.name" :value="item.id"></el-option>
              </el-select>
              <el-tooltip  effect="dark" placement="top">
                  <div slot="content">{{$t('scalingService.selectClusterImage')}}</div>
                  <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item  :label="$t('scalingService.resourceSpec')" class="is-required" prop="instanceType">
              <el-select v-model="scalingSerCreateForm.instanceType" @change="instanceTypeChange(scalingSerCreateForm.instanceType)" class="col-15" filterable>
                <el-option v-for="item in instanceTypeOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
              <el-tooltip  effect="dark" placement="top">
                <div slot="content">{{$t('scalingService.selectClusterInstanceType')}}</div>
                <div slot="content">{{$t('scalingService.pleaseSelectImage')}}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item  :label="$t('scalingService.network')" class="is-required" prop="network">
              <el-select v-model="scalingSerCreateForm.network" class="col-15" filterable @change="networkChange">
                <el-option v-for="item in networkOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
              <el-tooltip  effect="dark" placement="top">
                  <div slot="content">{{$t('scalingService.selectClusterNetwork')}}</div>
                  <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item  :label="$t('scalingService.securityGroup')" class="is-required" prop="securityGroup">
              <el-select v-model="scalingSerCreateForm.securityGroup" class="col-15" filterable>
                <el-option v-for="item in securityGroups" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
              <el-tooltip  effect="dark" placement="top">
                  <div slot="content">{{$t('scalingService.addScaleServerPrompt')}}</div>
                  <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('lang.userName')" prop="userName">
              <el-input class="col-15" v-model="scalingSerCreateForm.userName" auto-complete="off" disabled></el-input>
              <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstLoginTip1')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('lang.password')" prop="userPass" class="is-required">
              <el-input class="col-15" v-model="scalingSerCreateForm.userPass" auto-complete="off" type="password"></el-input>
              <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstLoginTip2')">
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('lang.confirmPassword')" prop="userConfirmPass" class="is-required">
              <el-input class="col-15" v-model="scalingSerCreateForm.userConfirmPass" auto-complete="off" type="password"></el-input>
            </el-form-item>
            <!-- 设置伸缩服务的负载均衡策略 -->
            <el-form-item :label="$t('scalingService.loadblancePolicy')">
              <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="scalingSerCreateForm.blflag"  @change="lbpolicyChange"></el-switch>
            </el-form-item>
            <div v-if="scalingSerCreateForm.blflag">
              <el-form-item :label="$t('network.subnet')"  class="is-required" prop="subnet">
                <el-select v-model="scalingSerCreateForm.subnet" class="col-15" filterable>
                  <el-option v-for="item in subnetOptions" :key="item.id" :label="item.name + '(' + item.cidr + ')'" :value="item.id"></el-option>
                </el-select>
                <el-tooltip  effect="dark" placement="top">
                  <div slot="content">{{$t('network.balanceNote1')}}</div>
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-form-item>
              <el-form-item :label="$t('network.ipaddress')" prop="ipaddress">
                <el-input class="col-15" v-model="scalingSerCreateForm.ipaddress"></el-input>
                <el-tooltip  effect="dark" placement="top">
                  <div slot="content">{{$t('network.balanceNote22')}}</div>
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-form-item>
              <el-form-item :label="$t('scalingService.method')" prop="method" class="is-required">
                  <el-select v-model="scalingSerCreateForm.method" class="col-15">
                    <el-option :label="$t('scalingService.leastConnections')" value="LEAST_CONNECTIONS"></el-option>
                    <el-option :label="$t('scalingService.roundRobin')" value="ROUND_ROBIN"></el-option>
                    <el-option :label="$t('scalingService.sourceIp')" value="SOURCE_IP"></el-option>
                  </el-select>
                  <el-tooltip  effect="dark" placement="top">
                    <div slot="content">{{$t('scalingService.leastConnectionsInfo')}}</div>
                    <div slot="content">{{$t('scalingService.roundRobinInfo')}}</div>
                    <div slot="content">{{$t('scalingService.sourceIpInfo')}}</div>
                    <i class="el-icon-fa-question-circle"></i>
                  </el-tooltip>
                </el-form-item>
                <el-form-item :label="$t('scalingService.protocol')" prop="protocol" class="is-required" >
                  <el-select v-model="scalingSerCreateForm.protocol" class="col-15">
                    <el-option label="HTTP" value="HTTP"></el-option>
                    <el-option label="HTTPS" value="HTTPS"></el-option>
                    <el-option label="TCP" value="TCP"></el-option>
                  </el-select>
                  <el-tooltip  effect="dark" placement="top">
                    <div slot="content">{{$t('scalingService.selectProtocol')}}</div>
                    <i class="el-icon-fa-question-circle"></i>
                  </el-tooltip>
                </el-form-item>
                <el-form-item :label="$t('scalingService.port')" prop="port" class="is-required">
                  <el-input-number v-model="scalingSerCreateForm.port" :min="1" :max="65535" class="col-15">
                  </el-input-number>
                  <el-tooltip  effect="dark" placement="top">
                    <div slot="content">{{$t('scalingService.portInfo')}}</div>
                    <i class="el-icon-fa-question-circle"></i>
                  </el-tooltip>
                </el-form-item>
              </div>
          </el-col>
          <el-col :span="8">
            <div class="table_panel" v-if="showDetail">
              <table class="table table-content table-hover idatatable">
                <tbody>
                  <thead>
                    <tr>
                      <th class="idatath"> <el-tag size="mini">{{$t('calcStorLang.resourceSpec')}}</el-tag></th>
                    </tr>
                  </thead>
                  <tr class="odd">
                    <th class="idatath">{{$t('lang.name')}}</th>
                    <td class="idatatd">{{detailData.name}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('calcStorLang.cpuCore')}}</th>
                    <td class="idatatd">{{detailData.vcpus}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('base.memory')}}(GB)</th>
                    <td class="idatatd">{{Number(detailData.ram)/1024}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('container.hardDisk')}}(GB)</th>
                    <td class="idatatd">{{detailData.disk}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('calcStorLang.isPublic')}}</th>
                    <td class="idatatd">{{detailData['os-flavor-access:is_public']?$t('lang.yes'):$t('lang.no')}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item :title="$t('scalingService.scalingSpec')" name="flavors">
        <el-row>
          <el-col :span="20">
            <el-form-item :label="$t('scalingService.maxCapabilitySize')" prop="maxSize" class="is-required">
                <el-input class="col-15" v-model="scalingSerCreateForm.maxSize" auto-complete="off"></el-input>
                <el-tooltip  effect="dark" placement="top">
                    <div slot="content">{{$t('scalingService.inputMaxCapabilty')}}</div>
                    <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-form-item>
              <el-form-item :label="$t('scalingService.minCapabilitySize')" prop="minSize" class="is-required">
                <el-input class="col-15" v-model="scalingSerCreateForm.minSize" auto-complete="off"></el-input>
                <el-tooltip  effect="dark" placement="top">
                    <div slot="content">{{$t('scalingService.inputMinCapabilty')}}</div>
                    <div slot="content">{{$t('scalingService.capabiltyMinGreaterThanMax')}}</div>
                    <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-form-item>
              <el-form-item :label="$t('scalingService.desiredCapacity')" prop="desiredSize" class="is-required">
                <el-input class="col-15" v-model="scalingSerCreateForm.desiredSize" auto-complete="off"></el-input>
                <el-tooltip  effect="dark" placement="top">
                    <div slot="content">{{$t('scalingService.inputCurrentCapabilty')}}</div>
                    <div slot="content">{{$t('scalingService.currentCapability')}}</div>
                    <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-form-item>
              <el-form-item :label="$t('scalingService.addNodeNum')" prop="increaseSize" class="is-required">
                <el-input class="col-15" v-model="scalingSerCreateForm.increaseSize" auto-complete="off"></el-input>
                <el-tooltip  effect="dark" placement="top">
                    <div slot="content">{{$t('scalingService.inputAddNodeNum')}}</div>
                    <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-form-item>
            <el-form-item :label="$t('scalingService.reduceNodeNum')" prop="reduceSize" class="is-required">
              <el-input class="col-15" v-model="scalingSerCreateForm.reduceSize" auto-complete="off"></el-input>
              <el-tooltip  effect="dark" placement="top">
                  <div slot="content">{{$t('scalingService.inputReduceNodeNum')}}</div>
                  <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
          </el-col>
         </el-row>  
      </el-collapse-item>
    </el-collapse>
  </el-form>
  <div slot="footer" class="dialog-footer">
     <el-button :disabled="isDisabled" @click="cancel">{{$t('lang.cancel')}}</el-button>
     <el-button type="primary" :disabled="isDisabled" @click="confirm">{{$t('lang.confirm')}}</el-button>
   </div>
</el-dialog>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
// import StepOne from './CreateStepOne';
// import StepTwo from './CreateStepTwo';
// import StepThree from './CreateStepThree';
export default {
  name: 'CreatScalingService',
  // components: {
  //   StepOne, StepTwo, StepThree
  // },
  data() {
    return {
      showDetail:false,
      detailData:"",
      activeNames: 'baseConfig',
      activeIndex: 0,
      loading: false,
      flag: false,
      dialogVisible: false,
      isDisabled: false,
      privateNetworkId: "",
      scalingServiceTitle: this.$t('scalingService.createScalingService'),
      instanceTypeOptions: [],
      instanceTypeOptionsAll: [],
      imageOptions: [],
      networkOptions: [],
      securityGroups:[],
      keyPairOptions: [],
      zoneOptions: [],
      poolSubnet: "",
      currentlbNum: "",
      maxlbNum: "",
      currentPoolNum: "",
      maxPoolNum: "",
      subnetOptions: [],
      scalingSerCreateForm: {
        scalingServiceName:'',
        instanceName:'',
        instanceType: '',
        domain: '',
        image:'',
        network:'',
        securityGroup:'',
        userName:"Administrator/root",
        userPass: '',
        userConfirmPass: '',
        //keyPair:'',
        maxSize: '10',
        minSize: '1',
        desiredSize: '1',
        increaseSize:'1',
        reduceSize:'1',
        subnet:'',
        method:'LEAST_CONNECTIONS',
        protocol:'HTTP',
        port: '8080',
        blflag: false,
        ipaddress: ''
      },
      rules: {
        scalingServiceName: [
          {type: 'requiredNet', trigger: 'blur change'},
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'maxSize', value: 20}
        ],
        instanceName: [
          {type: 'requiredNet', trigger: 'blur change'},
          {type: 'onlyLetterNumber_Chinese'},
          {type: 'maxSize', value: 20}
        ],
        instanceType: [
           {type: 'required', trigger: 'blur change'}
        ],
        image: [
           {type: 'required', trigger: 'blur change'}
        ],
        network: [
           {type: 'required', trigger: 'blur change'}
        ],
        securityGroup: [
           {type: 'required', trigger: 'blur change'}
        ],
        userPass: [
          { type: 'required', trigger: 'blur change' },
          { type: 'passwordLegal' }
        ],
        userConfirmPass: [
          { type: 'required', trigger: 'blur change' },
          { type: 'passwordEquals', context: this, value: "scalingSerCreateForm.userPass" }
        ],
        // keyPair: [
        //    {type: 'required', trigger: 'blur change'}
        // ],
        maxSize: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value: 100},
          {type: 'min', value: 1}
        ],
        minSize: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value: 100},
          {type: 'min', value: 1}
        ],
        desiredSize: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value: 100},
          {type: 'min', value: 1}
        ],
        increaseSize: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value: 100},
          {type: 'min', value: 0}
        ],
        reduceSize: [
          {type: 'required', trigger: 'blur change'},
          {type: 'integer'},
          {type: 'max', value: 100},
          {type: 'min', value: 0}
        ],
        subnet: [
          { type: 'required', trigger: 'blur change' }
        ],
        ipaddress: [
          {type: 'ipv4'}
        ]
      }
    }
  },
  mounted() {
   // this.$parent.$parent.active = "instances";
    var self = this;
    self.initForm = Object.assign({}, self.scalingSerCreateForm);
    self.dialogVisible = true;
    self.initInstanceTypes();
    self.initZones();
    self.initImages();
    self.initNetworks();
    self.initsecuryGroups();
    //self.initKeyPairs();
  },
  methods: {
    async instanceTypeChange(val) {
      if (val) {
        let result = await this.$ajax({
          type: 'get',
          url: "api/nova/v2.1/flavors/" + val,
          showErrMsg: true,
          successFun: data => {
            this.detailData = data.flavor;
            this.showDetail = true;
          }
        });
      } else {
        this.showDetail = false;
      }
    },
    // initDialog() {
    //   var self = this;
    //   self.dialogVisible = true;
    // },
    async initInstanceTypes() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/nova/v2.1/flavors/detail";
      if ("2" == roleType || "3" == roleType) { //项目
        url = "api/nova/v2.1/flavors/detail?is_public=true";
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        var list = result['flavors'];
        var instanceTypes = [];
        if (list != null) {
          for (var z = 0; z < list.length; z++) {
            var instanceType = list[z];
            instanceTypes.push(instanceType);
          }
        }
        self.instanceTypeOptionsAll = instanceTypes.filter((item) => { return !item.name.startsWith('Bare@') });
      } catch (res) {
        self.loading = false;
      }
    },
    async initZones() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/inspur-availability-zone/detail'
        });
        self.loading = false;
        var list = result['availabilityZoneInfo'];
        var zones = [];
        if (list != null) {
          for (var z = 0; z < list.length; z++) {
            var zone = list[z];
            var zoneState = zone['zoneState'];
            if (zone['zoneName'] != "internal" && zoneState['available'] == true) {
              var arr = self.loadZoneAndHostCompare(zone.hosts);
              if (arr.length > 0) {
                zones.push(zone);
              }
            }
          }
        }
        //self.zoneOptions = zones;
        var zoneNull ={
          "value":'',
          "zoneName":''
        }
        self.zoneOptions.push(zoneNull);
        for (var k = 0; k < zones.length; k++) {
        var obj = zones[k];
          self.zoneOptions.push(obj);
      }
        self.projectCreateForm.domain ="";
      } catch (res) {
        self.loading = false;
      }
    },
    loadZoneAndHostCompare(list) {
      var rets = [];
      for (var z in list) {
        var obj = list[z];
        if (z.indexOf("ironic") >= 0) {
          continue;
        } else {
          rets.push(z);
        }
      }
        return rets;
    },
    async initImages() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/glance/v2/images?limit=99999&status=active&sort=name:asc";
      // if ("2" == roleType || "3" == roleType) { //项目
      //   url = "api/glance/v2/images?owner=" + this.$cookie.get("pid");
      //   //url = "api/glance/v2/images?visibility=private";
      // }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        var list = result['images'];
        var images = [];
        if (list != null) {
          for (var z = 0; z < list.length; z++) {
            var image = list[z];
            if (image.name.indexOf("Bare@") >= 0||image['image_type']=="snapshot"||"backup" == image['image_type']||typeof (image['block_device_mapping']) != "undefined") {
              continue;
            }
            images.push(image);
          }
        }
        self.imageOptions = images;
      } catch (res) {
        self.loading = false;
      }
    },
    async initNetworks() {
      var self = this;
      var roleType = Vue.roleType + "";
      // var url= "api/neutron/v2.0/networks";
      try {
        // let result = await self.$ajax({
        //   type: 'get',
        //   url: url,
        //   showErrMsg: true
        // });
        let result1 = await self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks?project_id=" + Vue.cookie.get('pid') + "&shared=false",
            errorKey: "NeutronError"
        });
        let result2 = await self.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks?shared=true",
            errorKey: "NeutronError"
        });
        self.loading = false;
        var list1 = result1['networks'];
        var list2 = result2['networks'];
        var networks = [];
        if (list1 != null) {
          for (var z = 0; z < list1.length; z++) {
            var network1 = list1[z];
            networks.push(network1);
          }
        }
        if (list2 != null) {
          for (var x = 0; x < list2.length; x++) {
            var network2 = list2[x];
            networks.push(network2);
          }
        }
        self.networkOptions = networks;
      } catch (res) {
        self.loading = false;
      }
    },
    initsecuryGroups() {
      var me = this;
      me.$ajax({
        type: 'get',
        url: "api/neutron/v2.0/security-groups?project_id="+me.$cookie.get('pid'),
        successFun(rtn) {
          me.securityGroups = rtn.security_groups;
        },
        errorKey: "NeutronError"
      })
    },
    async initKeyPairs() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/os-keypairs",
          showErrMsg: true
        });
        self.loading = false;
        var list = result['keypairs'];
        var keypairs = [];
        if (list != null) {
          for (var z = 0; z < list.length; z++) {
            var keypair = list[z];
            keypairs.push(keypair);
          }
        }
        self.keyPairOptions = keypairs;
      } catch (res) {
        self.loading = false;
      }
    },
    checkNum(value) {
      var self = this;
      if (value.length > 1) {
        if (value.substr(0, 1) == "0") {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    },
    imageChange(value) {
     var self = this;
     var images = self.imageOptions;
     var instanceTypes =self.instanceTypeOptionsAll;
     var instanceTypeOptionsTemp =[];
     for (var i = 0; i < images.length; i++) {
          var image = images[i];
          if (image.id==value) {
            var tempSize = image.size / (1024 * 1024 * 1024);
            var minDisk = image.min_disk;
            var minMemory = image.min_ram;
            for (var j = 0; j < instanceTypes.length; j++) {
              var flavorMemory = instanceTypes[j].ram;
              var flavorDisk = instanceTypes[j].disk;
              if (flavorMemory >= minMemory && flavorDisk >= tempSize && flavorDisk >= minDisk) {
                instanceTypeOptionsTemp.push(instanceTypes[j]);
              }
          }
          self.instanceTypeOptions = instanceTypeOptionsTemp;
          self.scalingSerCreateForm.instanceType = self.instanceTypeOptions[0].id;
        }
      }
    },
    confirm() {
      var self = this;
      self.$refs.scalingSerCreateForm.validate((valid) => {
        if (valid) {
          var flag1 = self.checkNum(self.scalingSerCreateForm.maxSize);
          var flag2 = self.checkNum(self.scalingSerCreateForm.minSize);
          var flag3 = self.checkNum(self.scalingSerCreateForm.desiredSize);
          var flag4 = self.checkNum(self.scalingSerCreateForm.increaseSize);
          var flag5 = self.checkNum(self.scalingSerCreateForm.reduceSize);
          if (flag1 && flag2 && flag3 && flag4 && flag5) {
            var min = parseInt(self.scalingSerCreateForm.minSize);
            var desire = parseInt(self.scalingSerCreateForm.desiredSize);
            var max = parseInt(self.scalingSerCreateForm.maxSize);
            if (min <= desire && desire <= max) {
              self.createAction();
            } else {
              self.$message({
                showClose: true,
                message: Vue.t('scalingService.capabilityNotMeetTheRequirements'),
                type: 'warning'
              });
            }
          } else {
            self.$message({
              showClose: true,
              message: Vue.t('scalingService.cannotStartWithZero'),
              type: 'warning'
            });
           }
          } else {
            return false;
         }
      });
    },
    async createAction() {
      let self = this;
      let scalingServiceName = self.scalingSerCreateForm.scalingServiceName;
      let instanceName = self.scalingSerCreateForm.instanceName;
      let flavor = self.scalingSerCreateForm.instanceType;
      let zone = self.scalingSerCreateForm.domain;
      let image = self.scalingSerCreateForm.image;
      //let keyName = self.scalingSerCreateForm.keyPair;
      let network = self.scalingSerCreateForm.network;
      let maxSize = self.scalingSerCreateForm.maxSize;
      let minSize = self.scalingSerCreateForm.minSize;
      let desiredCapacity = self.scalingSerCreateForm.desiredSize;
      let outSize = self.scalingSerCreateForm.increaseSize;
      let inSize = self.scalingSerCreateForm.reduceSize;

      let body = {
        "senlin_service": {
        "profile": {
            "profile": {
                "metadata": {},
                "name": "profile001",
                "spec": {
                        "properties": {
                        "flavor": flavor,
                        "image": image,
                        admin_pass:self.scalingSerCreateForm.userPass,
                        //"key_name": keyName,
                        "name": instanceName,
                        "availability_zone": zone,
                        "networks":[
                            {
                                "network": network,
                                "security_groups": [self.scalingSerCreateForm.securityGroup]
                            }
                        ],
                        "security_groups":[
                            "default"
                        ]
                    },
                    "type": "os.nova.server",
                    "version": "1.0"
                  }
                }
            },
        "cluster": {
            "cluster": {
                "config": {},
                "desired_capacity": desiredCapacity,
                "max_size": maxSize,
                "min_size": minSize,
                "name": scalingServiceName,
                "metadata": {
                },
                "profile_id": "mystack",
                "timeout": 3600
            }
        },
        "out": {
            "policy": {
                "name": "sp001",
                "spec": {
                    "properties": {
                        "adjustment": {
                            "min_step": 1,
                            "number": outSize,
                            "type": "CHANGE_IN_CAPACITY"
                        },
                        "event": "CLUSTER_SCALE_OUT"
                    },
                    "type": "senlin.policy.scaling",
                    "version": "1.0"
                }
            }
        },
        "in": {
            "policy": {
                "name": "sp001",
                "spec": {
                    "properties": {
                        "adjustment": {
                            "min_step": 1,
                            "number": inSize,
                            "type": "CHANGE_IN_CAPACITY"
                        },
                        "event": "CLUSTER_SCALE_IN"
                    },
                    "type": "senlin.policy.scaling",
                    "version": "1.0"
                }
            }
        }
        }
      }
      if (zone=="") {
        delete body.senlin_service.profile.profile.spec.properties.availability_zone;
      }
      if (self.scalingSerCreateForm.blflag == true) {
        //LoadBalance
        let lbSubnet = self.scalingSerCreateForm.subnet;
        let lbMethod = self.scalingSerCreateForm.method;
        let lbProtocol = self.scalingSerCreateForm.protocol;
        let lbPort = self.scalingSerCreateForm.port;
        let lbPoolSubnet = self.poolSubnet;
        body.senlin_service.lb = {
            "policy": {
                "name": "sp001",
                "spec": {
                    "properties": {
                        "pool": {
                            "protocol": lbProtocol,
                            "protocol_port": lbPort,
                            "subnet": lbPoolSubnet,
                            "lb_method": lbMethod,
                            "admin_state_up": true,
                            "session_persistence": {
                                "type": "HTTP_COOKIE",
                                "cookie_name": "hello"
                            }
                        },
                        "vip": {
                            "protocol": lbProtocol,
                            "protocol_port": lbPort,
                            "connection_limit": -1,
                            "subnet": lbSubnet,
                            "admin_state_up": true,
                            "address": self.removeZerofromip(self.scalingSerCreateForm.ipaddress)
                        },
                        "health_monitor": {
                            "type": "PING",
                            "delay": 20,
                            "timeout": 20,
                            "max_retries": 3,
                            "http_method": "GET",
                            "url_path": "/health",
                            "expected_codes": 200,
                            "admin_state_up": true
                        },
                        "lb_status_timeout": 300
                    },
                    "type": "senlin.policy.loadbalance",
                    "version": "1.1"
                }
            }
        }
        if (self.scalingSerCreateForm.ipaddress != "") {
          body = JSON.stringify(body);
          //校验IP地址是否在子网内，IP地址是否被占用
          let cidr = "";
          for (let i = 0; i < self.subnetOptions.length; i++) {
            let item = self.subnetOptions[i];
            if (item.id === self.scalingSerCreateForm.subnet) {
              cidr = item["cidr"];
            }
          }
          let reqdata = {
            "ip": self.removeZerofromip(self.scalingSerCreateForm.ipaddress),
            "cidr": cidr
          };
          self.$ajax({
            type: 'post',
            url: "api/neutron/v2.0/inspur/networkextension/validate_ip_in_cidr",
            data: JSON.stringify(reqdata),
            showErrMsg: false,
            success: function(res) {
              if (res) {
                let ipreqdata = {
                  "ip": self.removeZerofromip(self.scalingSerCreateForm.ipaddress),
                  "subnet_id": self.scalingSerCreateForm.subnet
                }
                self.$ajax({
                  type: 'post',
                  url: "api/neutron/v2.0/inspur/networkextension/ip_is_used_in_subnet",
                  data: JSON.stringify(ipreqdata),
                  showErrMsg: false,
                  success: function(res) {
                    if (!res) {
                      self.submitParams(body, scalingServiceName)
                    } else {
                      self.$notify.error({
                        message: Vue.t('scalingService.ipisOccupy')
                      });
                      return;
                    }
                  },
                  errFun() {
                  }
                });
              } else {
                self.$notify.error({
                  message: Vue.t('network.ipnotsubnet')
                });
                return;
              }
            },
            errFun() {
            }
          });
        } else {
          delete body.senlin_service.lb.policy.spec.properties.vip.address;
          body = JSON.stringify(body);
          self.submitParams(body, scalingServiceName);
        }
      } else {
        body = JSON.stringify(body);
        self.submitParams(body, scalingServiceName);
      }
    },
    async submitParams(body, scalingServiceName) {
      let self = this;
      self.loading = true;
      self.isDisabled = true;
      try {
        let ret = await this.$ajax({
          url: "api/senlin/v1/clusters/001/actions",
          data: body,
          type: 'post',
          successMsg: this.$t('scalingService.sendApplySuccess'),
          log:{
                description:{
                  en:"create scalingService:" + scalingServiceName,
                  zh_cn:"创建伸缩服务:" + scalingServiceName
                },
                target:Vue.logTarget.ScalingService
              },
          successFun: () => {
            setTimeout( function() {
              self.loading = false;
              self.isDisabled = false;
              self.$emit("handleAddShow", {});
              self.$emit("refreshData");
            }, 3000);
          },
          errorKey: "Error",
          errFun: () => {
            self.loading = false;
            self.isDisabled = false;
            self.$emit("handleAddShow", {});
          }
        });
      } catch (res) {
        self.loading = false;
        self.isDisabled = false;
      }
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleAddShow", {});
    },
    lbpolicyChange(value) {
      if (value == true) {
        this.initSubnetList();
      }
    },
    networkChange(value) {
      this.getSubnetByNetworkId();
    },
    async initSubnetList() {
     let self = this;
     let url = "api/neutron/v2.0/subnets"
     try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        let list = result['subnets'];
        let subnets = [];
        if (list != null) {
          for (let z = 0; z < list.length; z++) {
            let subnet = list[z];
            subnets.push(subnet);
          }
        }
        self.subnetOptions = subnets;
      } catch (res) {
      }
    },
    async getSubnetByNetworkId() {
      let self = this;
      let url = "api/neutron/v2.0/subnets?network_id=" + self.scalingSerCreateForm.network;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        if (result['subnets']) {
          let subnets = result['subnets'];
          for (let z = 0; z < subnets.length; z++) {
            self.poolSubnet = subnets[z]['id'];
            break;
          }
        }
      } catch (res) {
      }
    },
    checkLoadbalancer(current, max) {
      let usedNum = parseInt(current);
      let maxNum = parseInt(max);
      if (maxNum == -1) {
        return true;
      } else {
        if (usedNum < maxNum) {
          return true;
        } else {
          return false;
        }
      }
    },
    checkPool(current, max) {
      let usedNum = parseInt(current);
      let maxNum = parseInt(max);
      if (maxNum == -1) {
        return true;
      } else {
        if (usedNum < maxNum) {
          return true;
        } else {
          return false;
        }
      }
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
          if (address2[i].substr(0, 1) == "0" && address2[i].substr(1, 1) == "0") {
            address2[i] = address2[i].substr(2);
          } else if (address2[i].substr(0, 1) == "0" && address2[i].substr(1, 1) != "0") {
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
    }
  }
}
</script>
<style scoped>
</style>
