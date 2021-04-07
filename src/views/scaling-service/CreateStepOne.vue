<template>
  <div>
      <el-form label-position="left" class="me-required-form" :model="scalingSerCreateForm" :rules=rules ref="scalingSerCreateForm" label-width="120px" v-loading="loading">
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
          <el-col :span="24">
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
        <!-- 设置伸缩服务的负载均衡策略 -->
        <el-form-item :label="$t('scalingService.loadblancePolicy')">
          <el-switch :on-text="$t('lang.yes')" :off-text="$t('lang.no')" v-model="scalingSerCreateForm.blflag"  @change="lbpolicyChange"></el-switch>
        </el-form-item>
      </el-form>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="nextStep" type="primary" >{{$t('lang.nextStep')}}</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "CreateStepOne",
  data() {
    return {
      showDetail: false,
      detailData: "",
      loading: false,
      sDisabled: false,
      instanceTypeOptions: [],
      instanceTypeOptionsAll: [],
      imageOptions: [],
      networkOptions: [],
      securityGroups: [],
      keyPairOptions: [],
      zoneOptions: [],
      subnetOptions: [],
      scalingSerCreateForm: {
        scalingServiceName: "",
        instanceName: "",
        instanceType: "",
        domain: "",
        image: "",
        network: "",
        securityGroup: "",
        poolSubnet: "",
        blflag: false
      },
      rules: {
        scalingServiceName: [
          { type: "requiredNet", trigger: "blur change" },
          { type: "onlyLetterNumber_Chinese" },
          { type: "maxSize", value: 20 }
        ],
        instanceName: [
          { type: "requiredNet", trigger: "blur change" },
          { type: "onlyLetterNumber_Chinese" },
          { type: "maxSize", value: 20 }
        ],
        instanceType: [{ type: "required", trigger: "blur change" }],
        image: [{ type: "required", trigger: "blur change" }],
        network: [{ type: "required", trigger: "blur change" }],
        securityGroup: [{ type: "required", trigger: "blur change" }]
      }
    };
  },
  mounted() {
    let self = this;
    self.initInstanceTypes();
    self.initZones();
    self.initImages();
    self.initNetworks();
    self.initsecuryGroups();
  },
  methods: {
    async instanceTypeChange(val) {
      if (val) {
        let result = await this.$ajax({
          type: "get",
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
    async initInstanceTypes() {
      let self = this;
      let roleType = Vue.roleType + "";
      let url = "api/nova/v2.1/flavors/detail";
      if ("2" == roleType || "3" == roleType) {
        //项目
        url = "api/nova/v2.1/flavors/detail?is_public=true";
      }
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: true
        });
        let list = result["flavors"];
        let instanceTypes = [];
        if (list != null) {
          for (let z = 0; z < list.length; z++) {
            let instanceType = list[z];
            instanceTypes.push(instanceType);
          }
        }
        self.instanceTypeOptionsAll = instanceTypes.filter(item => {
          return !item.name.startsWith("Bare@");
        });
      } catch (res) {}
    },
    async initZones() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: "get",
          url: "api/nova/v2.1/inspur-availability-zone/detail"
        });
        let list = result["availabilityZoneInfo"];
        let zones = [];
        if (list != null) {
          for (let z = 0; z < list.length; z++) {
            let zone = list[z];
            let zoneState = zone["zoneState"];
            if (
              zone["zoneName"] != "internal" &&
              zoneState["available"] == true
            ) {
              let arr = self.loadZoneAndHostCompare(zone.hosts);
              if (arr.length > 0) {
                zones.push(zone);
              }
            }
          }
        }
        let zoneNull = {
          value: "",
          zoneName: ""
        };
        self.zoneOptions.push(zoneNull);
        for (let k = 0; k < zones.length; k++) {
          let obj = zones[k];
          self.zoneOptions.push(obj);
        }
      } catch (res) {}
    },
    loadZoneAndHostCompare(list) {
      let rets = [];
      for (let z in list) {
        let obj = list[z];
        if (z.indexOf("ironic") >= 0) {
          continue;
        } else {
          rets.push(z);
        }
      }
      return rets;
    },
    async initImages() {
      let self = this;
      let url = "api/glance/v2/images?limit=99999&status=active&sort=name:asc";
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: true
        });
        let list = result["images"];
        let images = [];
        if (list != null) {
          for (let z = 0; z < list.length; z++) {
            let image = list[z];
            if (
              image.name.indexOf("Bare@") >= 0 ||
              image["image_type"] == "snapshot" ||
              "backup" == image["image_type"] ||
              typeof image["block_device_mapping"] != "undefined"
            ) {
              continue;
            }
            images.push(image);
          }
        }
        self.imageOptions = images;
      } catch (res) {}
    },
    async initNetworks() {
      let self = this;
      try {
        let result1 = await self.$ajax({
          type: "get",
          url:
            "api/neutron/v2.0/networks?project_id=" +
            Vue.cookie.get("pid") +
            "&shared=false&not-tags=bm_deploy",
          errorKey: "NeutronError"
        });
        let result2 = await self.$ajax({
          type: "get",
          url: "api/neutron/v2.0/networks?shared=true&not-tags=bm_deploy",
          errorKey: "NeutronError"
        });
        let list1 = result1["networks"];
        let list2 = result2["networks"];
        let networks = [];
        if (list1 != null) {
          for (let z = 0; z < list1.length; z++) {
            let network1 = list1[z];
            networks.push(network1);
          }
        }
        if (list2 != null) {
          for (let x = 0; x < list2.length; x++) {
            let network2 = list2[x];
            networks.push(network2);
          }
        }
        self.networkOptions = networks;
      } catch (res) {}
    },
    initsecuryGroups() {
      let me = this;
      me.$ajax({
        type: "get",
        url:
          "api/neutron/v2.0/security-groups?project_id=" +
          me.$cookie.get("pid"),
        successFun(rtn) {
          me.securityGroups = rtn.security_groups;
        },
        errorKey: "NeutronError"
      });
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
      var instanceTypes = self.instanceTypeOptionsAll;
      var instanceTypeOptionsTemp = [];
      for (var i = 0; i < images.length; i++) {
        var image = images[i];
        if (image.id == value) {
          var tempSize = image.size / (1024 * 1024 * 1024);
          var minDisk = image.min_disk;
          var minMemory = image.min_ram;
          for (var j = 0; j < instanceTypes.length; j++) {
            var flavorMemory = instanceTypes[j].ram;
            var flavorDisk = instanceTypes[j].disk;
            if (
              flavorMemory >= minMemory &&
              flavorDisk >= tempSize &&
              flavorDisk >= minDisk
            ) {
              instanceTypeOptionsTemp.push(instanceTypes[j]);
            }
          }
          self.instanceTypeOptions = instanceTypeOptionsTemp;
          self.scalingSerCreateForm.instanceType =
            self.instanceTypeOptions[0].id;
        }
      }
    },
    networkChange(value) {
      this.getSubnetByNetworkId();
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
            self.scalingSerCreateForm.poolSubnet = subnets[z]['id'];
            break;
          }
        }
      } catch (res) {
      }
    },
    lbpolicyChange(value) {
      this.$emit("lbBalanceChange", value);
    },
    nextStep() {
      this.$refs.scalingSerCreateForm.validate(valid => {
        if (valid) {
          this.$emit("stepOneDone", this.scalingSerCreateForm);
        } else {
          return false;
        }
      });
    },
    cancel() {
      this.$emit("cancel");
    }
  }
};
</script>
<style scoped>
</style>