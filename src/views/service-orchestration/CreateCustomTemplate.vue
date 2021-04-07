<template>
  <div>
    <el-form
      ref="createCustomTopoForm"
      :model="createCustomTopoForm"
      v-loading="loading"
      label-width="150px" style="margin-top:5px;" class="me-required-form">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-row style="padding-bottom:7px">
            <el-col :span="10"><span style="font-size:16px;">{{$t('heat.resources')}}</span></el-col>
          </el-row>
          <el-row :gutter="20">
            <div class="divider clearfix"></div>
          </el-row>
          <el-collapse v-model="activeName" style="max-height:500px;overflow-y: scroll">
            <template v-for="(val, key) in nodeType">
              <el-collapse-item :title="$t('heat.' + key)" :name="key">
                <ul class="custom-ttpl-ul" style="overflow:hidden;">
                  <template v-for="(menu, index) in val">
                      <li style="float: left;padding: 8px;width:65px" :index="menu.id" :id="menu.id" :type="menu.type" :draggable="true" @dragstart="topoFlowDragStart($event)">
                        <div :draggable="false" style="text-align: center">
                          <img :draggable="false" :src="menu.icon" style="width: 24px;height: 24px;">
                          <div style="height: 20px;line-height: 20px;font-size: 12px">{{menu.name}}</div>
                        </div>
                      </li>
                  </template>
                </ul>
              </el-collapse-item>
            </template>
          </el-collapse>
        </el-col>
        <el-col :span="12">
          <el-form :inline="true" class="form-inline">
            <el-form-item>
              <el-button type="primary" icon='fa-plus' @click="submitTemplateAction" :disabled="loading" size="small">{{$t('heat.submit')}}</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon='fa-remove' @click="clearTopoCanvas" size="small">{{$t('heat.clearAll')}}</el-button>
            </el-form-item>
            <el-form-item>
              <el-button @click="cancel" size="small">{{$t('heat.return')}}</el-button>
            </el-form-item>
          </el-form>
          <div class="divider clearfix"></div>
          <div ref="topoflow" id="topoflowDiv" @drop="dropSelectedTopoNode($event)" @dragover="dragoverSelectedTopoNode($event)"
          :style="ieStyle"></div>
        </el-col>
        <el-col :span="7">
          <el-form
            ref="nodeConfigForm"
            :model="nodeConfigForm"
            :rules=rules
            v-loading="loadingConfig"
            label-width="115px" class="me-required-form">
            <el-row style="padding-bottom:7px">
              <el-col :span="10"><span style="font-size:16px;">{{$t('heat.resourceConfig')}}</span></el-col>
            </el-row>
            <el-row :gutter="20">
              <div class="divider clearfix"></div>
            </el-row>

            <template v-for="item in nodeConfigData">
              <el-form-item :label="$t('heat.' + item.label)"
                v-if="(item.type=='string' && !item.isSelect && !item.constraints[0].visible) || (item.type=='number' && 'true' == item.constraints[0].input && !item.constraints[0].visible)" :prop="item.key" :class="(item.constraints[0].required) ? '' : 'is-required'" :rules="item.rules">
                <el-input class="col-12" v-if="item.key.indexOf('description') != -1" v-model="nodeConfigForm[item.key]" type="textarea" :row="2" auto-complete="off"></el-input>
                <el-input class="col-12" v-if="item.key.indexOf('description') == -1 && item.label != 'heat_admin_pass'" v-model="nodeConfigForm[item.key]"></el-input>
                <el-input class="col-12 heatpassword" v-if="item.key.indexOf('description') == -1 && item.label === 'heat_admin_pass'" v-model="nodeConfigForm[item.key]" :type="inputTytpe" @change="savePass">
                </el-input>
                <i :class="[showPwdFlag ? eye : eyeSlash]" style="position: absolute; margin-left: -22px;margin-top: 8px;" v-if="item.label === 'heat_admin_pass'" @click="showPwd"></i>
                <!--<el-tooltip placement="right-start" v-if="item.description">
                  <div slot="content">{{$t('heat.' + item.description)}}</div>
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>-->
              </el-form-item>
              <el-form-item :label="$t('heat.' + item.label)" v-if="item.type=='string' && item.isSelect && !item.constraints[0].visible" :prop="item.key" :class="(item.constraints[0].required) ? '' : 'is-required'" :rules="item.rules">
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='glance.image' && !item.constraints[0].host_attr" @change="imageChange">
                  <el-option v-for="param in param_imageOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <el-select clearable class="col-12" @change="flavorChange(nodeConfigForm[item.key])" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='nova.flavor' && !item.constraints[0].host_attr">
                  <el-option v-for="param in param_flavorOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.network'"
                @change="getSubnetList">
                  <el-option v-for="param in param_networkOptions" v-if="param.subnets.length>0" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.publicnetwork'" filterable>
                  <el-option v-for="param in param_public_networkOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='nova.keypair'">
                  <el-option v-for="param in param_keypairOptions" :key="param.name" :label="param.name" :value="param.name"></el-option>
                </el-select>
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.subnet'">
                  <el-option v-for="param in param_subnetworkOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.subnetwork'" filterable>
                  <el-option v-for="param in param_subnetworkOptions" :key="param.id" :label="param.name + '(' + param.cidr + ')'" :value="param.id"></el-option>
                </el-select>
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='volume.volumetype'">
                  <el-option v-for="param in param_volumeTypeOptions" :key="param.id" :label="param.name" :value="param.id" :title="param.title"></el-option>
                </el-select>
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].allowed_values && !item.constraints[0].transform && !item.constraints[0].visible">
                  <el-option v-for="param in item.constraints[0].allowed_values" :key="param" :label="param" :value="param"></el-option>
                </el-select>
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].allowed_values && item.constraints[0].transform  && !item.constraints[0].visible">
                  <el-option v-for="param in item.constraints[0].allowed_values" :key="param" :label="$t('heat.' + param)" :value="param"></el-option>
                </el-select>
                <!--云物理可用域-->
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint!='glance.image' && item.constraints[0].custom_constraint!='nova.flavor' && item.constraints[0].host_attr" filterable>
                  <el-option v-for="item in zoneOptions" :key="item.id" :label="item.zoneName" :value="item.zoneName"></el-option>
                </el-select>
                <!--云物理机镜像-->
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='glance.image' && item.constraints[0].host_attr" filterable>
                  <el-option v-for="param in snapshots" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <!--云物理机资源规格-->
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='nova.flavor' && item.constraints[0].host_attr" filterable>
                  <el-option v-for="param in flavorList" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <!--端口安全组-->
                <el-select clearable class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.security_group'" filterable>
                  <el-option v-for="param in securityGroups" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <!--<el-tooltip placement="right-start" v-if="item.description">
                  <div slot="content">{{$t('heat.' + item.description)}}</div>
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>-->
              </el-form-item>
              <el-form-item
                :label="$t('heat.' + item.label)"
                v-if="(item.type=='number') && (!item.constraints[0].input)"
                :prop="item.key"
                class="is-required"
                :rules="[{type: 'required', trigger: 'blur change'},{type:'integer'}]">
                <el-input-number class="col-12" v-model="nodeConfigForm[item.key]" :min="item.min" :max="item.max"></el-input-number>
                <!--<el-tooltip placement="right-start" v-if="item.description">
                  <div slot="content">{{$t('heat.' + item.description)}}</div>
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>-->
              </el-form-item>
              <el-form-item :label="$t('base.confirmPassword')" v-if="item.label === 'heat_admin_pass'" prop="admin_pass_confirm" :class="'is-required'">
                <el-input class="col-12 heatpassword" v-model="nodeConfigForm.admin_pass_confirm" :type="inputTytpe">
                </el-input>
                <i :class="[item[item.key + 'showPwdFlag'] ? eye : eyeSlash]" style="position: absolute; margin-left: -22px;margin-top: 8px;" @click="showPwd(item)"></i>
              </el-form-item>
            </template>
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
            <el-form-item label="" v-if="nodeConfigData.length > 0">
              <el-button type="primary" @click="saveNodeConfig">{{$t('heat.save')}}</el-button>
            </el-form-item>

          </el-form>
        </el-col>
      </el-row>
    </el-form>

    <submit-template ref="submitTemplate" v-if="submitTemplateFlag" @handleAddShow="handleAddShow" :templateDetail="templateDetail"></submit-template>
  </div>
</template>
<script>
  import SubmitTemplate from "./SubmitTemplateConfirm";
  import TopoFlow from "./topoFlow/topoflow";
  export default {
    name: "createCustomTopo",
    components:{
      SubmitTemplate
    },
    data() {
      return {
        flavorList: [],
        snapshots: [],
        zoneOptions: [],
        securityGroups: [],
        showPwdFlag: false,
        eye: "el-icon-fa-eye",
        eyeSlash: "el-icon-fa-eye-slash",
        inputTytpe: "password",
        protocol: null,
        loadBalancer: "OS::Octavia::LoadBalancer", // 负载均衡
        listener: "OS::Octavia::Listener", // 监听器
        pool: "OS::Octavia::Pool", // 资源池
        healthMonitor: "OS::Octavia::HealthMonitor", // 健康检查器
        firewallPolicy: "OS::Neutron::FirewallPolicy", // 防火墙策略
        firewallRule: "OS::Neutron::FirewallRule", // 防火墙规则
        firewall: "OS::Neutron::Firewall", // 防火墙
        poolMember: "OS::Octavia::PoolMember", // 资源池成员
        server: "OS::Nova::Server", // 云主机
        floatip: "OS::Neutron::FloatingIP",
        routerInterface: "OS::Neutron::RouterInterface",
        router: "OS::Neutron::Router",
        nodeType: {},
        activeName: [],
        showDetail:false,
        detailData: "",
        loading:false,
        loadingConfig:false,
        createCustomTopoForm: {
        },
        subnetField:'',
        nodeConfigForm: {
          admin_pass_confirm: ""
        },
        selectedNodeId:"",
        admin_pass_origi: "",
        templateDetail:{},
        submitTemplateFlag:false,
        rules: {
          admin_pass_confirm: [
            { type: 'required', trigger: 'blur change' },
            { type: 'passwordEquals', context: this, value: "admin_pass_origi" }
          ]
        },
        resTypeRender: Vue.resourceTypeFormatter,
        topoImageRender: Vue.topoImageFormatter,
        topoIconRender: Vue.topoIconFormatter,
        topoFlow:null,
        nodeTypeOptions:[],
        nodeIdMap:new Map(),
        nodeTypeMap:new Map(),
        nodeConfigData:[],
        nodeLinkData:{},
        param_imageOptions:[],
        param_flavorOptions:[],
        param_flavorOptionsAll:[],
        param_networkOptions:[],
        param_subnetworkOptions:[],
        param_public_networkOptions:[],
        param_keypairOptions:[],
        param_subnetOptions:[],
        param_volumeTypeOptions:[],
        svgX:20,
        svgY:20,
        ieStyle:""
      }
    },
    mounted() {
      this.initCustomTopoFlow();
      this.getTopoFlowNodeTypeList();
      this.getImageList();
      this.getFlavorList();
      this.getNetworkList();
      this.getSubnetWorkList();
      this.getKeypairList();
      this.getVolumeTypeList();
      this.getZones();
      this.loadImageTypeList();
      this.getFlavors();
      this.getSecurityGroups();
      let isIE = false;
      if (!!window.ActiveXObject || "ActiveXObject" in window ||
              (/Trident\/7\./).test(navigator.userAgent)) {
          isIE = true;
      }
      if (isIE) {
        this.ieStyle = "border:1px solid #bcbcbc";
      }
    },
    methods: {
      savePass (row) {
        this.admin_pass_origi = this.nodeConfigForm["admin_pass"]
      },
      async getSecurityGroups() {
        const $this = this;
        try {
          const res = await $this.$ajax({
            type: 'get',
            url: `api/neutron/v2.0/security-groups?tenant_id=${$this.$cookie.get('pid')}`
          });
          $this.securityGroups = res.security_groups;
        } catch (e) {
          __DEV__ && console.error(e);
        }
      },
      async getFlavors() {
        const self = this;
        let url = "api/nova/v2.1/flavors/detail";
        try {
          let result = await self.$ajax({
            type: 'get',
            url: url,
            showErrMsg: false
          });
          let list = [];
          let flavors = result['flavors']
          for (let i in flavors) {
            if (flavors[i].name != null && flavors[i].name.indexOf("Bare@") >= 0) {
              list.push(flavors[i]);
            }
          }
          self.flavorList = list;
        } catch (res) {
        }
      },
      //镜像类型列表
      loadImageTypeList() {
        var self = this;
        var middleList = [];
        var images = [];
        Promise.all([self.loadProjectImageList(), self.loadPublicImageList()]).then(function(result) {
          var data1 = result[0];
          var data2 = result[1];
          middleList = data1.concat(data2);
          for (let m = 0; m < middleList.length; m++) { //遍历提出snap类型的镜像
            var obj = middleList[m];
            if ((obj.hasOwnProperty("image_type") && obj['image_type'] == "snapshot") || typeof (obj['block_device_mapping']) != "undefined") {
              continue;
            } else {
              if ("private" == obj['visibility'] && self.projectId != obj['owner']) {
                continue;
              } else {
                images.push(obj);
              }
            }
          }
          self.snapshots = images;
        });
      },
      //查询项目下私有镜像 不要传owner 会过滤掉相关其他数据, 不加limit漏数据
      async loadProjectImageList() {
        const self = this;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/glance/v2/images?limit=99999&visibility=private&status=active&tag=@",
            showErrMsg: false
          });
          return result['images'];
        } catch (res) {
        }
      },
      //public的镜像列表
      async loadPublicImageList() {
        const self = this;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/glance/v2/images?limit=99999&visibility=public&status=active&tag=@",
            showErrMsg: false
          });
          return result['images'];
        } catch (res) {
        }
      },
      async getZones() {
        const self = this;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: 'api/nova/v2.1/inspur-availability-zone/detail'
          });
          let list = result['availabilityZoneInfo'];
          let zones = [];
          if (list != null) {
            for (let z = 0; z < list.length; z++) {
              let zone = list[z];
              zone.id = Symbol();
              let zoneState = zone['zoneState'];
              if (zone['zoneName'] != "internal" && zoneState['available'] == true) {
                zones.push(zone);
              }
            }
          }
          self.zoneOptions = zones;
        } catch (res) {
        }
      },
      showPwd() {
        this.showPwdFlag = !this.showPwdFlag;
        if (this.showPwdFlag) {
          this.inputTytpe = "";
        } else {
          this.inputTytpe = "password";
        }
      },
      // 先选择镜像后，云主机类型列表根据所选镜像进行过滤显示
      imageChange(value) {
        let self = this;
        let images = self.param_imageOptions;
        let instanceTypes =self.param_flavorOptionsAll;
        let instanceTypeOptionsTemp =[];
        for (let i = 0; i < images.length; i++) {
          let image = images[i];
          if (image.id==value) {
            let tempSize = image.size / (1024 * 1024 * 1024);
            let minDisk = image.min_disk;
            let minMemory = image.min_ram;
            for (let j = 0; j < instanceTypes.length; j++) {
              let flavorMemory = instanceTypes[j].ram;
              let flavorDisk = instanceTypes[j].disk;
              if (flavorMemory >= minMemory && flavorDisk >= tempSize && flavorDisk >= minDisk) {
                instanceTypeOptionsTemp.push(instanceTypes[j]);
              }
            }
            self.param_flavorOptions = instanceTypeOptionsTemp;
            //self.nodeConfigForm.flavor = self.param_flavorOptions[0].id;
          }
        }
      },
      async flavorChange(val) {
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
      async getImageList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/glance/v2/images?limit=99999"
          });
          let dataList = response.images;

          let roleType = Vue.roleType;
          let projectId = this.$cookie.get('pid');
          this.param_imageOptions = [];
          for (let i = 0; i < dataList.length; i++) {
            let image = dataList[i];
            if ("snapshot" == image['image_type'] || typeof (image['block_device_mapping']) != "undefined" ||
              image["tags"].includes("*") ) {
              continue;
            }
            if ("2" == roleType || "3" == roleType) {
              if ("private" == image['visibility'] && projectId != image['owner']) {
                continue;
              }
            }
            // 只要“可用”状态的镜像
            if ("active" === image['status']) {
              this.param_imageOptions.push(image);
            }
          }
          // this.param_imageOptions = dataList;
        } catch (data) {
        }
      },
      async getFlavorList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/flavors/detail?is_public=true"
          });
          let dataList = response.flavors;
          dataList = dataList.filter((item) => {
            return !item.name.startsWith('Bare@')
          })
          this.param_flavorOptionsAll = dataList;
        } catch (data) {
        }
      },
      async getNetworkList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/neutron/v2.0/networks?not-tags=bm_deploy"
          });
          let dataList = response.networks;
          //this.param_networkOptions = dataList;

          // Public network
          if (dataList && dataList.length > 0) {
            let projectid = this.$cookie.get("pid");
            for (let i = 0; i < dataList.length; i++) {
              let publicnetwork = dataList[i];
              if (publicnetwork["router:external"] === true &&
                (publicnetwork["project_id"] === projectid || publicnetwork["shared"] === true ) &&
                publicnetwork["subnets"].length != 0) {
                this.param_public_networkOptions.push(publicnetwork);
              }
              if (
                (publicnetwork["project_id"] === projectid || publicnetwork["shared"] === true ) &&
                publicnetwork["subnets"].length != 0) {
                this.param_networkOptions.push(publicnetwork);
              }
            }
          }
        } catch (data) {
        }
      },
      async getKeypairList() {
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/os-keypairs"
          });
          let dataList = response.keypairs;
          this.param_keypairOptions = dataList;
        } catch (data) {
        }
      },
      async getSubnetList(netId) {
        if (!this.subnetField) {
          return;
        }
        this.nodeConfigForm[this.subnetField] = "";
        if (netId) {
          try {
            let response = await this.$ajax({
              type: 'get',
              url: "api/neutron/v2.0/subnets?network_id=" + netId
            });
            let dataList = response.subnets;
            this.param_subnetOptions = dataList;
          } catch (data) {
          }
        }
      },
      async getSubnetWorkList() {
        let projectId = this.$cookie.get("pid");
      let self = this;
      try {
        self.param_subnetworkOptions = [];
        let resultData = await self.$ajax({
          type: 'post',
          data:JSON.stringify({'project_id':projectId}),
          url: "api/neutron/v2.0/inspur/networkextension/get_subnets_by_project_id"
        });
        let sublist = [];
        for (let i=0; i<resultData.length; i++) { //后台要求只显示IPV4的子网
          if (resultData[i].ip_version == 4) {
            sublist.push(resultData[i]);
          }
        }
        self.param_subnetworkOptions = sublist;
      } catch (res) {
      }
     },
      async getVolumeTypeList() {
        let projectId = this.$cookie.get("pid");
        try {
          let response = await this.$ajax({
            type: 'get',
            url: "api/cinderv3/v3/" + projectId + "/types"
          });
          let dataList = response.volume_types;
          dataList.forEach((item) => {
            item.title = item.name;
            if (item.name.length>30) {
              item.name = item.name.substring(0, 30) + "...";
            }
          })
          this.param_volumeTypeOptions = dataList;
        } catch (data) {
        }
      },
      cancel() {
        this.$router.push({
          path:"/service-orchestration/orchestrationTemplate"
        });
      },
      // 获取拖拽编排资源类型
      async getTopoFlowNodeTypeList() {
        let self = this;
        self.loading = true;
        try {
          let response = await this.$ajax({
            type: 'post',
            url: "api/heat/v1/" + this.$cookie.get("pid") + "/template/get_cus_resource"
          });
          self.loading = false;
          let dataList = response.resources;
          self.nodeTypeOptions = [];
          if (dataList && dataList.length > 0) {
            dataList.forEach((data) => {
              self.nodeIdMap.set(data.type, data.id);
              self.nodeTypeMap.set(data.id, data.type);
              self.nodeTypeOptions.push({
                id:data.id,
                name:self.resTypeRender(data.type),
                type:data.type,
                icon:self.topoIconRender(data.type)
              });
            });
            let active = [];
            for (let i = 0; i < self.nodeTypeOptions.length; i++) {
              let tmpType = self.nodeTypeOptions[i].type;
              let type = tmpType.substring(0, tmpType.lastIndexOf("::")).split("::")[1];
              active.push(type);
              if (self.nodeType[type]) {
                self.nodeType[type].push(self.nodeTypeOptions[i]);
              } else {
                self.nodeType[type] = [self.nodeTypeOptions[i]];
              }
            }
            self.activeName = [...new Set(active)];
          }
        } catch (data) {
          self.loading = false;
        }
      },
      // 初始化拖拽Drag
      initCustomTopoFlow() {
        let self = this;
        let config = {
          eln: "#" + self.$refs.topoflow.id,
          // data: data,
          width:self.$refs.topoflow.offsetWidth-30,
          height: 500,
          nodeTemplate: {
              // 对应的nodes信息数据结构中的type字段
              "newNode": {
                  width: 50,
                  height: 50,
                  deleteAble: true,
                  operatingPoint: [
                      'left', 'right'
                  ],
                  renderNode: (node, nodeInfo) => {
                    node.append("svg:image")
                      .attr("class", "image")
                      .attr("xlink:href", function (d, i) {
                        return self.topoImageRender(nodeInfo.config.type);
                      })
                      .attr("width", nodeInfo.width)
                      .attr("height", nodeInfo.height);

                    // 添加描述节点的文字
                    node.append("text")
                      .style("fill", "black")
                      .attr("dx", 55)
                      .attr("dy", 30)
                      .text(function(d) {
                        return self.resTypeRender(nodeInfo.config.name);
                      });
                  }
              }
          },
          onSelectNode: (eln, node) => {
            self.showDetail =false;
            self.selectedNodeId = node.id;
            self.initNodeConfig(node);
            // self.getNodeRelations(node);
          },
          onClearActiveElement: () => {
            // console.log('清空所有选中状态');
          },
          onNodeContextMenuRender: (nodeInfo) => {
              return [{ label: self.$t('lang.delete'), action: 'delete' }];
          },
          contextmenuClick: (node, action) => {
            // 删除操作
            if (action.action === "delete") {
              if (node.contextType == "node") {
                self.topoFlow.deleteNode(node.id);
              } else if (node.contextType == "link") {
                self.topoFlow.deleteLink(node);
              }
              self.nodeConfigData = [];
            }
          },
          onDeleteNode: (node) => {
            // 删除资源清空资源配置页面
            self.nodeConfigData = [];
            return true;
          },
          onDataChange: data => {
            // console.log('onDataChange      ' + data);
          }
        };

        // 初始化
        self.topoFlow = new TopoFlow(config);
        self.topoFlow.init();
      },
      // 开始拖拽
      topoFlowDragStart(event) {
        let self = this;
        let target = event.target || event.srcElement;
        event.dataTransfer.effectAllowed = "move";
        if (self.testDragImage()) {
          event.dataTransfer.setDragImage(target.children[0], 12, 12); // 设置拖动时图片
        }
        let type = target.type || $(event.srcElement).attr("type");
        event.dataTransfer.setData("text", type);
        return true;
      },
      testDragImage() {
        // 浏览器兼容性修改，"setDragImage"不支持IE
        let tester = window.DataTransfer;
        if ("setDragImage" in tester.prototype) {
          return true;
        } else {
          return false;
        }
      },
      dropSelectedTopoNode(event) {
        let self = this;
        event.preventDefault();
        let nodeType = event.dataTransfer.getData("text");
        if (!self.nodeIdMap.get(nodeType)) {
          return false;
        }

        this.svgX = 20;
        this.svgY = 20;
        // 定位画布位置
        this.getSvgPosition(this.$refs.topoflow);
        let pageX = event.pageX;
        let pageY = event.pageY;
        if (pageX === undefined) {
          pageX = event.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft);
        }
        if (pageY === undefined) {
          pageY = event.clientY + (document.body.scrollTop || document.documentElement.scrollTop);
        }

        let x = pageX - this.svgX;
        let y = pageY - this.svgY;
        this.addTopoFlowNode(nodeType, x, y);
      },
      dragoverSelectedTopoNode(event) {
        event.preventDefault();
      },
      addTopoFlowNode(nodeType, x, y) {
        let self = this;
        let node = {
          type: "newNode",
          x: x,
          y: y,
          config: {
            uuid:self.nodeIdMap.get(nodeType),
            name:nodeType,
            height:40,
            width:40,
            type: nodeType,
            relations:[],
            properties:{}
          }
        };
        let result = self.checkLink(nodeType);
        if (result === false) return false;
        self.topoFlow.addNode(node);
        self.getNodeRelations(node);
      },
      checkLink(nodeType) {
        let self = this;
        let allNodes = self.topoFlow.Nodes;
        // 浮动IP关联确认
        if (allNodes) {
          if (self.floatip === nodeType) {
            let isRouterInterface = false;
            let isRouter = false;
            for (let key of Object.keys(allNodes)) {
              let n = allNodes[key];
              if (n.config.type === self.routerInterface) {
                isRouterInterface = true;
                break;
              }
            }
            for (let key of Object.keys(allNodes)) {
              let n = allNodes[key];
              if (n.config.type === self.router) {
                isRouter = true;
                break;
              }
            }
            if (!isRouterInterface || !isRouter) {
              self.$message.warning(this.$t('heat.routerAndInterface'));
            }
          }
        }
        // 负载均衡关联关系
        // 监听器负载均衡存在才可以拖拽
        if (allNodes) {
          if (self.listener === nodeType) {
            let isLoadBalancerLink = false;
            for (let key of Object.keys(allNodes)) {
              let n = allNodes[key];
              if (n.config.type === self.loadBalancer) {
                isLoadBalancerLink = true;
                break;
              }
            }
            if (!isLoadBalancerLink) {
              self.$message.warning(this.$t('heat.balancerFirst'));
            }
          }
        }
        // 资源池当监听器存在
        if (allNodes) {
          if (self.pool === nodeType) {
            let isPoolListenerLink = false;
            for (let key of Object.keys(allNodes)) {
              let n = allNodes[key];
              if (n.config.type === self.listener) {
                isPoolListenerLink = true;
                break;
              }
            }
            if (!isPoolListenerLink) {
              self.$message.warning(this.$t('heat.listenerFirst'));
            }
          }
        }
        // 健康检查器与资源池
        if (allNodes) {
          if (self.healthMonitor === nodeType) {
            let isHealthMonitorPoolLink = false;
            for (let key of Object.keys(allNodes)) {
              let n = allNodes[key];
              if (n.config.type === self.pool) {
                isHealthMonitorPoolLink = true;
                break;
              }
            }
            if (!isHealthMonitorPoolLink) {
              self.$message.warning(this.$t('heat.poolFirst'));
            }
          }
        }
        // 资源池成员需要关联云主机
        if (allNodes) {
          if (self.poolMember === nodeType) {
            let isPoolMembertorHostLink = false;
            for (let key of Object.keys(allNodes)) {
              let n = allNodes[key];
              if (n.config.type === self.server) {
                isPoolMembertorHostLink = true;
                break;
              }
            }
            if (!isPoolMembertorHostLink) {
              self.$message.warning(this.$t('heat.serverFirst'));
            }
          }
        }
      },
      clearTopoCanvas() {
        let self = this;
        self.$confirm(this.$t('heat.clearAllConfirmMsg'), this.$t('heat.operateConfirm'), {
          confirmButtonText:this.$t('lang.confirm'),
          cancelButtonText:this.$t('lang.cancel'),
          type:'warning'
        }).then(() => {
          self.topoFlow.reset();
          self.nodeConfigData = [];
          }).catch(() => {
        });
      },
      // 获取节点配置信息
      async initNodeConfig(node) {
        this.loadingConfig = true;
        let response = await this.$ajax({
          type: 'post',
          url: "api/heat/v1/" + this.$cookie.get("pid") + "/template/get_cus_properties/" + node.config.uuid
        });
        this.loadingConfig = false;
        let parameters = response.properties;
        this.topoFlow.Nodes[node.id].config.properties = response.properties;

        let pName = {};
        let pData = [];
        if (parameters) {
          for (let index = 0; index< parameters.length; index++) {
            let data = parameters[index];
            if (data.name == 'user_data' || data.name == "user_data_format") {
              break;
            }
            // 多层嵌套的数据不加载页面
            if (data.sub_properties !== null && data.sub_properties !== "") {
              continue;
            }

            pName[data.name] = '';
            data.key = data.name;
            // 判断是否为下拉框，判断输入框校验规则
            let isSelect = false;
            let validateRules = [{type: 'required', trigger: 'blur change'}];

            let temp = data.constraints;
            if (temp) {
              let tempArray = [];
              tempArray.push(JSON.parse(temp));
              data.constraints = tempArray;
              let constraints = data.constraints;
              if (constraints && constraints[0].custom_constraint == "neutron.subnet") {
                this.subnetField = data.name;
              }

              for (let i = 0; i < constraints.length; i++) {
                // validateRules = [{type: 'required', trigger: 'blur change'}];
                if (constraints[i].custom_constraint || constraints[i].allowed_values || constraints[i].host_attr === 'True') {
                  validateRules = [{type: 'required', trigger: 'blur change'}];
                  isSelect = true;
                  break;
                }

                if (constraints[i].allowed_pattern) {
                  // let reg = constraints[i].allowed_pattern.substring(1, constraints[i].allowed_pattern.length-1);
                  // let newReg = new RegExp(reg);
                  let newReg = new RegExp(constraints[i].allowed_pattern);
                  validateRules.push({pattern:newReg, message: this.$t('heat.' + constraints[i].description)});
                }

                if (constraints[i].length && constraints[i].length.max) {
                  validateRules.push({type:"maxSize", value:constraints[i].length.max});
                }

                if (constraints[i].length && constraints[i].length.min) {
                  validateRules.push({type:"minSize", value:constraints[i].length.min});
                }
                if (constraints[i].input && data.type === "number") {
                  validateRules.push({type:"integer"});
                }
                if (constraints[i].input && (constraints[i].range.min + "")) {
                  validateRules.push({type:"min", value:constraints[i].range.min});
                }
                if (constraints[i].input && constraints[i].range.max) {
                  validateRules.push({type:"max", value:constraints[i].range.max});
                }
              }

              data.rules = validateRules;
              if (data.type=="number") {
                data.min = data.constraints[0].range.min;
                data.max = data.constraints[0].range.max;
              }
            } else {
              data.rules = [{type: 'required', trigger: 'blur change'},
              {type:'maxSize', value:100}];
            }
            if (data.constraints[0].required) {
              for (let v of data.rules) {
                switch (v.type) {
                  case "required":
                    v.type = "";
                    break;
                  case "minSize":
                    v.value = 0;
                    break;
                }
              }
            }
            data.isSelect = isSelect;
            pData.push(data);
          }
          this.nodeConfigData = pData;
          this.nodeConfigForm = {};
          this.nodeConfigForm = Object.assign({}, this.nodeConfigForm, pName);
          // 后台默认值显示
          this.$nextTick(() => {
            for (let m = 0; m < this.nodeConfigData.length; m++) {
              if (this.nodeConfigData[m].constraints[0].default) {
                this.nodeConfigForm[this.nodeConfigData[m].key] = this.nodeConfigData[m].constraints[0].default;
              }
            }
          })
        }

        let nodeFormData = node.config.parameters;
        if (nodeFormData) {
          // 初始化页面数据
          for (let key of Object.keys(this.nodeConfigForm)) {
            this.nodeConfigForm[key] = nodeFormData[key];
            if (node.config.type === "OS::Nova::Server" || node.config.type === "OS::Nova::Host") {
              // 云主机和物理机网络特殊处理
              this.nodeConfigForm["network"] = nodeFormData["networks"][0]["network"];
            } else if (node.config.type === "OS::Neutron::Router") {
              this.nodeConfigForm["network"]= nodeFormData["external_gateway_info"][0]["network"];
            } else if (node.config.type === 'OS::Neutron::Port') {
              this.nodeConfigForm["security_group"] = nodeFormData["security_groups"][0]["security_group"];
            }
            this.nodeConfigForm.admin_pass_confirm = nodeFormData["admin_pass"];
            this.admin_pass_origi = nodeFormData["admin_pass"];
          }
        }
      },
      // 获取节点关系信息
      async getNodeRelations(node) {
        let response = await this.$ajax({
          type: 'post',
          url: "api/heat/v1/" + this.$cookie.get("pid") + "/template/get_cus_relations/" + node.config.uuid
        });
        // this.nodeLinkData = response.relations;
        let dataList = response.relations;
        let nodeRel = {};
        if (dataList && dataList.length > 0) {
          dataList.forEach(obj => {
            nodeRel[obj.rel_resource_id] = {
              single:obj.single
            };
            // nodeRel.push(rel);
          });
        }
        this.topoFlow.Nodes[node.id].config.relations = nodeRel;
      },
      // 定位画布位置
      getSvgPosition(element) {
        this.svgX += element.offsetLeft;
        this.svgY += element.offsetTop;
        if (element.offsetParent) {
          this.getSvgPosition(element.offsetParent);
        }
      },
      // 保存节点配置信息
      saveNodeConfig() {
        let self = this;
        this.$refs.nodeConfigForm.validate((valid) => {
          if (valid) {
            let formData = Object.assign({}, self.nodeConfigForm);
            let tempProperties = self.topoFlow.Nodes[self.selectedNodeId].config.properties;
            tempProperties.forEach(prop => {
              if (prop.sub_properties !== null && prop.sub_properties !== "") {
                let childName = prop.sub_properties;
                let children = childName.split(",");
                formData[prop.name] = [];
                for (let i = 0; i < children.length; i++) {
                  let d = formData[children[i]];
                  let p = {};
                  p[children[i]] = d;
                  formData[prop.name].push(p);
                  delete formData[children[i]];
                }
              }
            });
            delete formData["admin_pass_confirm"];
            self.topoFlow.Nodes[self.selectedNodeId].config.parameters = formData;
            self.$message.success(this.$t('heat.resourceConfigSaveSuccessMsg'));
          } else {
            return false;
          }
        });
      },
      // 创建模板
      async submitTemplateAction() {
        let self = this;
        let allNodes = self.topoFlow.Nodes;
        let allLinks = self.topoFlow.Links;
        self.templateDetail = {};
        // 节点数据处理
        let nodeList = [];
        if (JSON.stringify(allNodes) !== "{}" && JSON.stringify(allNodes) !== "") {
          for (let key of Object.keys(allNodes)) {
            let node = allNodes[key];
            if (typeof (node.config.parameters) !== "undefined" && JSON.stringify(node.config.parameters) !== "{}") {
              let newNode = {};
              let portNode = JSON.parse(JSON.stringify(node.config));
              if (node.config.type === 'OS::Neutron::Port') {
                portNode.parameters.security_groups = portNode.parameters.security_groups.map(item => item.security_group);
                newNode[key] = portNode;
              } else {
                if (node.config.parameters.admin_pass) {
                  let osDistro = "";
                    this.param_imageOptions.forEach((item) => {
                    if (item.id == node.config.parameters.image) {
                        if (item.os_distro != null) {
                          osDistro = item.os_distro;
                          try {
                            let ret = self.$ajax({
                              type: 'POST',
                              url: "api/heat/v1/" + this.$cookie.get("pid") + "/template/get_adminpass_template",
                              data:JSON.stringify({
                                admin_pass:node.config.parameters.admin_pass,
                                os_distro:osDistro
                              }),
                              successFun(data) {
                                node.config.parameters["user_data"] = data.user_data;
                              },
                              errFun() {
                                node.config.parameters["user_data"] = '#!/bin/bash \n echo "'+node.config.parameters.admin_pass+'" | passwd --stdin root \n';
                              }
                            })
                          } catch (data) {
                            node.config.parameters["user_data"] = '#!/bin/bash \n echo "'+node.config.parameters.admin_pass+'" | passwd --stdin root \n';
                          }
                        } else {
                          node.config.parameters["user_data"] = '#!/bin/bash \n echo "'+node.config.parameters.admin_pass+'" | passwd --stdin root \n';
                        }
                    }
                    })
                  node.config.parameters["user_data_format"] = "RAW";
                  node.config.parameters["metadata"] = {"admin_pass":node.config.parameters.admin_pass};
                }
                newNode[key] = node.config;
              }
              nodeList.push(newNode);
            } else {
              self.$message.warning(this.$t('heat.resourceNotConfigMsg1') + self.resTypeRender(node.config.type) +
                this.$t('heat.resourceNotConfigMsg2'));
              return false;
            }
          }
        } else {
          self.$message.warning(this.$t('heat.canvasNoResource'));
          return false;
        }
        // 连接数据处理
        let linkList = [];
        if (allLinks) {
          for (let key of Object.keys(allLinks)) {
            let link = allLinks[key];
            linkList.push(link);
          }
        }

        // 单独一个子网不允许提交
        if (nodeList.length == 1) {
          for (let key of Object.keys(nodeList[0])) {
            if (nodeList[0][key].type == "OS::Neutron::Subnet") {
              self.$message.warning(this.$t('heat.subnetAloneMsg'));
              return false;
            }
          }
        }
        // 如果存在浮动IP 则请加入路由接口跟路由连接到外网，并且浮动ip与路由配置的外部网络相同
        if (nodeList.length >= 1) {
          let floatipFlag = false;
          let routerFlag = false;
          let routerInterfaceFlag = false;
          let networkFlag = false;
          let routerNetworkId = "";
          let floatipNetworkId = "";
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type == self.floatip) {
              floatipFlag = true;
              break;
              /*if (!isSubnetLink) {
                self.$message.warning(this.$t('heat.subnetHasNoNetwork'));
                return false;
              }*/
            }
          }
          if (floatipFlag) {
            for (let nodes of nodeList) {
              for (let [key, value] of Object.entries(nodes)) {
                if (value.type === self.router) {
                  routerNetworkId = value.parameters.external_gateway_info[0].network;
                  routerFlag = true;
                }
                if (value.type === self.routerInterface) {
                  routerInterfaceFlag = true;
                }
                if (value.type === self.floatip) {
                  floatipNetworkId = value.parameters.floating_network;
                  networkFlag = true;
                }
              }
            }
            if (!(routerNetworkId && (routerNetworkId === floatipNetworkId) && routerFlag && routerInterfaceFlag && networkFlag)) {
              self.$message.warning(this.$t('heat.routerAndInterface'));
              return false;
            }
          }
        }
        // 子网必须跟网络关联
        if (nodeList.length >= 1) {
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type == "OS::Neutron::Subnet") {
              let isSubnetLink = false;
              for (let i = 0; i < linkList.length; i++) {
                if (linkList[i].from == key || linkList[i].to == key) {
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) == "OS::Neutron::Net" ||
                    self.nodeTypeMap.get(linkList[i].toUUid) == "OS::Neutron::Net") {
                    isSubnetLink = true;
                    break;
                  }
                }
              }
              if (!isSubnetLink) {
                self.$message.warning(this.$t('heat.subnetHasNoNetwork'));
                return false;
              }
            }
          }
        }
        // 端口必须跟网络和子网关联
        if (nodeList.length >= 1) {
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type == "OS::Neutron::Port") {
              let isPortLink1 = false;
              let isPortLink2 = false;
              for (let i = 0; i < linkList.length; i++) {
                if (linkList[i].from == key || linkList[i].to == key) {
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) == "OS::Neutron::Net" ||
                    self.nodeTypeMap.get(linkList[i].toUUid) == "OS::Neutron::Net") {
                      isPortLink1 = true;
                    if (isPortLink2== true) {
                      break;
                    }
                  }
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) == "OS::Neutron::Subnet" ||
                    self.nodeTypeMap.get(linkList[i].toUUid) == "OS::Neutron::Subnet") {
                    isPortLink2 = true;
                    if (isPortLink1 == true) {
                      break;
                    }
                  }
                }
              }
              if (!isPortLink1) {
                self.$message.warning(this.$t('heat.portHasNoNetwork'));
                return false;
              }
              if (!isPortLink2) {
                self.$message.warning(this.$t('heat.portHasNoSubnet'));
                return false;
              }
              if (!isPortLink1 && !isPortLink2) {
                self.$message.warning(this.$t('heat.portHasNoNetworkAddSubnet'));
                return false;
              }
            }
          }
        }
        // 防火墙必须与防火墙策略
        if (nodeList.length >= 1) {
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type === self.firewall) {
              let isFirewallLinkFirewallPolicy = false;
              for (let i = 0; i < linkList.length; i++) {
                if (linkList[i].from == key || linkList[i].to == key) {
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) === self.firewallPolicy ||
                    self.nodeTypeMap.get(linkList[i].toUUid) === self.firewallPolicy) {
                    isFirewallLinkFirewallPolicy = true;
                    break;
                  }
                }
              }
              if (!isFirewallLinkFirewallPolicy) {
                self.$message.warning(this.$t('heat.firewallHasFirewallPolicy'));
                return false;
              }
            }
          }
        }
        // 浮动IP必须跟端口关联
        if (nodeList.length >= 1) {
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type == "OS::Neutron::FloatingIP") {
              let isFloatIpLink = false;
              for (let i = 0; i < linkList.length; i++) {
                if (linkList[i].from == key || linkList[i].to == key) {
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) == "OS::Neutron::Port" ||
                    self.nodeTypeMap.get(linkList[i].toUUid) == "OS::Neutron::Port") {
                    isFloatIpLink = true;
                    break;
                  }
                }
              }
              if (!isFloatIpLink) {
                self.$message.warning(this.$t('heat.floatIpHasNoPort'));
                return false;
              }
            }
          }
        }
        // 路由接口必须跟路由器关联
        if (nodeList.length >= 1) {
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type == "OS::Neutron::RouterInterface") {
              let isRouterInterfaceLink = false;
              for (let i = 0; i < linkList.length; i++) {
                if (linkList[i].from == key || linkList[i].to == key) {
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) == "OS::Neutron::Router" ||
                    self.nodeTypeMap.get(linkList[i].toUUid) == "OS::Neutron::Router") {
                    isRouterInterfaceLink = true;
                    break;
                  }
                }
              }
              if (!isRouterInterfaceLink) {
                self.$message.warning(this.$t('heat.RouterInterfaceHasNoRouter'));
                return false;
              }
            }
          }
        }
        // 负载均衡关联关系
        // 负载均衡与至少一个监听器
        if (nodeList.length) {
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type === self.loadBalancer) {
              let isLoadBalancerLink = false;
              for (let i = 0; i < linkList.length; i++) {
                if (linkList[i].from == key || linkList[i].to == key) {
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) === self.listener ||
                    self.nodeTypeMap.get(linkList[i].toUUid) === self.listener) {
                    isLoadBalancerLink = true;
                    break;
                  }
                }
              }
              if (!isLoadBalancerLink) {
                self.$message.warning(this.$t('heat.loadBalancerHasNoListener'));
                return false;
              }
            }
          }
        }
        // 监听器与至少一个资源池和一个负载均衡
        if (nodeList.length) {
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type === self.listener) {
              let isPoolLink = false;
              let isPoolLoadBalancerLink = false;
              for (let i = 0; i < linkList.length; i++) {
                if (linkList[i].from == key || linkList[i].to == key) {
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) === self.pool ||
                    self.nodeTypeMap.get(linkList[i].toUUid) === self.pool) {
                    isPoolLink = true;
                    if (isPoolLoadBalancerLink) {
                      break;
                    }
                  }
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) === self.loadBalancer ||
                    self.nodeTypeMap.get(linkList[i].toUUid) === self.loadBalancer) {
                    isPoolLoadBalancerLink = true;
                    if (isPoolLink) {
                      break;
                    }
                  }
                }
              }
              if (!isPoolLink && !isPoolLoadBalancerLink) {
                self.$message.warning(this.$t('heat.listenerHasNoLoadBalancerAndPool'));
                return false;
              }
              if (!isPoolLink) {
                self.$message.warning(this.$t('heat.listenerHasNoPool'));
                return false;
              }
              if (!isPoolLoadBalancerLink) {
                self.$message.warning(this.$t('heat.listenerHasNoLoadBalancer'));
                return false;
              }
            }
          }
        }
        // 资源池与至少一个监听器和一个健康检查器
        if (nodeList.length) {
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type === self.pool) {
              let isPoolListenerLink = false;
              let isPoolHealthMonitorLink = false;
              for (let i = 0; i < linkList.length; i++) {
                if (linkList[i].from == key || linkList[i].to == key) {
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) === self.healthMonitor ||
                    self.nodeTypeMap.get(linkList[i].toUUid) === self.healthMonitor) {
                    isPoolHealthMonitorLink = true;
                    if (isPoolListenerLink) {
                      break;
                    }
                  }
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) === self.listener ||
                    self.nodeTypeMap.get(linkList[i].toUUid) === self.listener) {
                    isPoolListenerLink = true;
                    if (isPoolHealthMonitorLink) {
                      break;
                    }
                  }
                }
              }
              if (!isPoolListenerLink && !isPoolHealthMonitorLink) {
                self.$message.warning(this.$t('heat.poolHasNoListenerAndHealthMonitorLink'));
                return false;
              }
              if (!isPoolListenerLink) {
                self.$message.warning(this.$t('heat.poolHasNoListener'));
                return false;
              }
              if (!isPoolHealthMonitorLink) {
                self.$message.warning(this.$t('heat.poolHasNoHealthMonitor'));
                return false;
              }
              // 资源池的协议获取监听器的协议值
              for (let i = 0; i < nodeList.length; i++) {
                let nodeDetail = Object.values(nodeList[i]);
                if (self.listener === nodeDetail[0].type) {
                  self.protocol = nodeDetail[0].parameters.protocol;
                  break;
                }
              }
              for (let j = 0; j < nodeList.length; j++) {
                let nodeDetails = Object.values(nodeList[j]);
                let keyPool = Object.keys(nodeList[j])[0];
                if (self.pool === nodeDetails[0].type && self.protocol) {
                  nodeList[j][keyPool].parameters.protocol = self.protocol;
                  break;
                }
              }
            }
          }
        }
        // 健康检查器至少与一个资源池
        if (nodeList.length) {
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type === self.healthMonitor) {
              let isHealthMonitorLinkPool = false;
              for (let i = 0; i < linkList.length; i++) {
                if (linkList[i].from == key || linkList[i].to == key) {
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) === self.pool ||
                    self.nodeTypeMap.get(linkList[i].toUUid) === self.pool) {
                    isHealthMonitorLinkPool = true;
                  }
                }
              }
              if (!isHealthMonitorLinkPool) {
                self.$message.warning(this.$t('heat.healthMonitorHasNoPool'));
                return false;
              }
            }
          }
        }
        // 资源池成员至少与一个云主机
        if (nodeList.length) {
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type === self.poolMember) {
              let isPoolMemberLinkServer = false;
              let isPoolMemberLinkPool = false;
              for (let i = 0; i < linkList.length; i++) {
                if (linkList[i].from == key || linkList[i].to == key) {
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) === self.server ||
                    self.nodeTypeMap.get(linkList[i].toUUid) === self.server) {
                    isPoolMemberLinkServer = true;
                    if (isPoolMemberLinkPool) {
                      break;
                    }
                  }
                }
                if (self.nodeTypeMap.get(linkList[i].fromUUid) === self.pool ||
                  self.nodeTypeMap.get(linkList[i].toUUid) === self.pool) {
                  isPoolMemberLinkPool = true;
                  if (isPoolMemberLinkServer) {
                    break;
                  }
                }
              }
              if (!isPoolMemberLinkServer && !isPoolMemberLinkPool) {
                self.$message.warning(this.$t('heat.poolMemberHasNoServerAndPool'));
                return false;
              }
              if (!isPoolMemberLinkPool) {
                self.$message.warning(this.$t('heat.poolMemberHasNoPool'));
                return false;
              }
              if (!isPoolMemberLinkServer) {
                self.$message.warning(this.$t('heat.poolMemberHasNoServer'));
                return false;
              }
            }
          }
        }
        // 放火墙策略至少与一个防火墙规则
        /*if (nodeList.length) {
          for (let key of Object.keys(allNodes)) {
            let n = allNodes[key];
            if (n.config.type === self.firewallPolicy) {
              let isFirewallPolicyLinkFirewallRule = false;
              for (let i = 0; i < linkList.length; i++) {
                if (linkList[i].from == key || linkList[i].to == key) {
                  if (self.nodeTypeMap.get(linkList[i].fromUUid) === self.firewallRule ||
                    self.nodeTypeMap.get(linkList[i].toUUid) === self.firewallRule) {
                    isFirewallPolicyLinkFirewallRule = true;
                  }
                }
              }
              if (!isFirewallPolicyLinkFirewallRule) {
                self.$message.warning(this.$t('heat.isFirewallPolicyLinkFirewallRule'));
                return false;
              }
            }
          }
        }*/
        self.templateDetail.nodeList = nodeList;
        self.templateDetail.linkList = linkList;
        self.submitTemplateFlag = true;
      },
      handleAddShow() {
        this.submitTemplateFlag = false;
      }
    }
  }
</script>
<style>
  .heatpassword input{
    padding-right: 35px;
  }
</style>
