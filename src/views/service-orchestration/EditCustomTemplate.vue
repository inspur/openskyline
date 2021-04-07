<template>
  <div>
    <el-form
      ref="createCustomTopoForm"
      :model="createCustomTopoForm"
      v-loading="loading"
      label-width="150px" style="margin-top:5px;" class="me-required-form">
      <el-row :gutter="20">
       <!-- <el-col :span="4">
          <el-row style="padding-bottom:7px">
            <el-col :span="10"><span style="font-size:16px;">{{$t('heat.resources')}}</span></el-col>
          </el-row>
          <el-row :gutter="20">
            <div class="divider clearfix"></div>
          </el-row>
          <el-collapse v-model="activeName">
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
          <div style="margin-top: 10px;">{{$t('heat.defaultPassword')}}</div>
        </el-col>-->
        <el-col :span="12">
          <el-form :inline="true" class="form-inline">
            <el-form-item>
              <el-button type="primary" icon='fa-plus' @click="submitTemplateAction" :disabled="loading" size="small">{{$t('heat.submit')}}</el-button>
            </el-form-item>
            <!--<el-form-item>
              <el-button type="primary" icon='fa-remove' @click="clearTopoCanvas" size="small">{{$t('heat.clearAll')}}</el-button>
            </el-form-item>-->
            <el-form-item>
              <el-button @click="cancel" size="small">{{$t('heat.return')}}</el-button>
            </el-form-item>
          </el-form>
          <div class="divider clearfix"></div>
          <div ref="topoflow" id="topoflowDiv" @drop="dropSelectedTopoNode($event)" @dragover="dragoverSelectedTopoNode($event)"
          :style="ieStyle"></div>
        </el-col>
        <el-col :span="8">
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

            <template v-for="(item, index) in nodeConfigData">
              <el-form-item :label="$t('heat.' + item.label)"
                v-if="(item.type=='string' && !item.isSelect && !item.constraints[0].visible) || (item.type=='number' && 'true' == item.constraints[0].input && !item.constraints[0].visible)" :prop="item.key" class="is-required"
                :rules="item.rules">
                <el-input class="col-12" v-if="item.key.indexOf('description') != -1" v-model="nodeConfigForm[item.key]" type="textarea" :row="2" auto-complete="off"></el-input>
                <el-input class="col-12" v-if="item.key.indexOf('description') == -1" v-model="nodeConfigForm[item.key]"></el-input>
                <el-tooltip placement="right-start" v-if="item.description">
                  <div slot="content">{{$t('heat.' + item.description)}}</div>
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-form-item>
              <el-form-item :label="$t('heat.' + item.label)"
                v-if="item.type=='string' && item.isSelect && !item.constraints[0].visible" :prop="item.key" class="is-required"
                :rules="item.rules">
                <el-select class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='glance.image'" @change="imageChange">
                  <el-option v-for="param in param_imageOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <el-select class="col-12" @change="flavorChange(nodeConfigForm[item.key])" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='nova.flavor'">
                  <el-option v-for="param in param_flavorOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <el-select class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.network'"
                @change="getSubnetList">
                  <el-option v-for="param in param_networkOptions" v-if="param.subnets.length>0" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <el-select class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.publicnetwork'" filterable>
                  <el-option v-for="param in param_public_networkOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <el-select class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='nova.keypair'">
                  <el-option v-for="param in param_keypairOptions" :key="param.name" :label="param.name" :value="param.name"></el-option>
                </el-select>
                <el-select class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.subnet'">
                  <el-option v-for="param in param_subnetworkOptions" :key="param.id" :label="param.name" :value="param.id"></el-option>
                </el-select>
                <el-select class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='neutron.subnetwork'" filterable>
                  <el-option v-for="param in param_subnetworkOptions" :key="param.id" :label="param.name + '(' + param.cidr + ')'" :value="param.id"></el-option>
                </el-select>
                <el-select class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].custom_constraint=='volume.volumetype'">
                  <el-option v-for="param in param_volumeTypeOptions" :key="param.id" :label="param.name" :value="param.id" :title="param.title"></el-option>
                </el-select>
                <el-select class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].allowed_values && !item.constraints[0].transform && !item.constraints[0].visible">
                  <el-option v-for="param in item.constraints[0].allowed_values" :key="param" :label="param" :value="param"></el-option>
                </el-select>
                <el-select class="col-12" v-model="nodeConfigForm[item.key]" v-if="item.constraints[0].allowed_values && item.constraints[0].transform  && !item.constraints[0].visible">
                  <el-option v-for="param in item.constraints[0].allowed_values" :key="param" :label="$t('heat.' + param)" :value="param"></el-option>
                </el-select>
                <el-tooltip placement="right-start" v-if="item.description">
                  <div slot="content">{{$t('heat.' + item.description)}}</div>
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-form-item>
              <el-form-item :label="$t('heat.' + item.label)"
                v-if="(item.type=='number') && (!item.constraints[0].input)" :prop="item.key" class="is-required"
                :rules="[{type: 'required', trigger: 'blur change'},{type:'integer'}]">
                <el-input-number class="col-12" v-model="nodeConfigForm[item.key]" :min="item.min" :max="item.max"></el-input-number>
                <el-tooltip placement="right-start" v-if="item.description">
                  <div slot="content">{{$t('heat.' + item.description)}}</div>
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
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

    <submit-template ref="submitTemplate" v-if="submitTemplateFlag" @handleAddShow="handleAddShow" :resources="resources" :templateDetail="templateDetail" :rowData="rowData" :nodeConfigForm="editForm"></submit-template>
  </div>
</template>
<script>
  import * as d3 from "d3";
  import SubmitTemplate from "./EditSubmitTemplateConfirm";
  import yaml from "js-yaml";
  export default {
    name: "createCustomTopo",
    components:{
      SubmitTemplate
    },
    data() {
      return {
        resources: {},
        initData: {},
        rowData: null,
        editForm: {},
        nodes: [],
        responseData: null,
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
        },
        selectedNodeId:"",
        templateDetail:{},
        submitTemplateFlag:false,
        rules: {},
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
      this.getTemplateDetail();
      //this.initCustomTopoFlow();
      this.getTopoFlowNodeTypeList();

      this.getImageList();
      this.getFlavorList();
      this.getNetworkList();
      this.getSubnetWorkList();
      this.getKeypairList();
      this.getVolumeTypeList();

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
      // 修改
      async getTemplateDetail() {
        let self = this;
        try {
          await this.$ajax({
            type: "get",
            url: "api/heat/v1/" + this.$route.params.projectId + "/template/get_stack_template_detail/" + this.$route.params.id,
            successFun: (response) => {
              self.responseData = response;
              let node = [];
              let link = [];
              let resources = response.templatedetail.stacktemplateresource;
              self.resources = resources;
              self.rowData = response.templatedetail.stacktemplate;
              resources.forEach(function (item, index) {
                let type = self.resTypeRender(item.type);
                node.push({
                  id: item.id,
                  name: type,
                  type: item.type,
                  created_at: item.created_at,
                  source: item.name,
                  values: item.parameters
                });
                if (item.requires) {
                  if (item.requires.indexOf(",") >= 0) {
                    let reqList = item.requires.split(",");
                    for (var i = 0; i < reqList.length; i++) {
                      link.push({
                        source: item.id,
                        target: reqList[i]
                      });
                    }
                  } else {
                    link.push({
                      source: item.id,
                      target: item.requires
                    });
                  }
                }
                //组装数据
                let name = item.name;
                let parameters = JSON.parse(item.parameters);
                for (let v in parameters) {
                  self.editForm[name + '_' + v] = parameters[v];
                }
              });
              self.nodes = node;
              self.getTopoFlowNodeTypeList(node);
              this.initTopo(node, link);
            }
          });
        } catch (e) {
        }
      },
      // 获取拖拽编排资源类型
      async getTopoFlowNodeTypeList(node) {
        let self = this;
        self.loading = true;
        try {
          let response = await this.$ajax({
            type: 'post',
            url: "api/heat/v1/" + this.$cookie.get("pid") + "/template/get_cus_resource"
          });
          let dataList = response.resources;
          if (dataList && dataList.length > 0) {
            dataList.forEach((data) => {
              self.nodeIdMap.set(data.type, data.id);
            });
          }
         for (let v of node) {
            v.typeId = self.nodeIdMap.get(v.type);
          }
          self.loading = false;
        } catch (data) {
          self.loading = false;
        }
      },
      // 获取节点配置信息
      async initNodeConfig(node) {
        let self = this;
        if (!node.typeId) {
          return;
        }
        this.loadingConfig = true;
        let response = await this.$ajax({
          type: 'post',
          url: "api/heat/v1/" + this.$cookie.get("pid") + "/template/get_cus_properties/" + node.typeId
        });
        // 路由器端口禁止编辑代号006
        if (node.typeId === "006") {
          this.loadingConfig = false;
          return;
        }
        this.loadingConfig = false;
        let parameters = response.properties;
        node.properties = response.properties;
        let source = node.source;
        let pName = {};
        let pData = [];
        if (!parameters.length) return;
        for (let i = 0; i < parameters.length; i++) {
          parameters[i].name = source + '_' + parameters[i].name;
        }
        if (parameters) {
          for (let index = 0; index< parameters.length; index++) {
            let data = parameters[index];
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
                if (constraints[i].custom_constraint || constraints[i].allowed_values) {
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
            data.isSelect = isSelect;
            pData.push(data);
          }
          this.nodeConfigData = pData;
          this.nodeConfigForm = {};
          //this.nodeConfigForm = Object.assign({}, this.nodeConfigForm, pName);
        }
        let values = JSON.parse(node.values);
        let valuesTmp = {};
        for (let v in values) {
          valuesTmp[source + '_' + v] = values[v];
        }
        this.nodeConfigForm = Object.assign({}, valuesTmp, this.editForm);
        // 镜像与资源规格联动
        this.$nextTick(() => {
          let image = null;
          let flavor = null;
          Object.keys(valuesTmp).forEach( key => {
            let isImage = key.substring(key.length-5);
            let isFlavor = key.substring(key.length-6);
            if (isImage === "image") {
              image = valuesTmp[key];
            }
            if (isFlavor === "flavor") {
              flavor = valuesTmp[key];
            }
          });
          self.imageChange(image);
          self.flavorChange(flavor);
        });
      },
      initTopo(nodes, links) {
        let self = this;

        let width = self.$refs.topoflow.offsetWidth-30;
        let height = 600;

        let svg1 = d3.select('#' + this.$refs.topoflow.id)
          .append("svg")
          .attr("width", width)
          .attr("height", height);
        let svg = svg1.append("g");
        //缩放
        svg1.call(d3.zoom()
          .scaleExtent([1/4, 4])
          .on("zoom", zoomed));
        function zoomed() {
          svg.attr("transform", d3.event.transform);
        }
        let simulation = d3.forceSimulation(nodes) //指定节点数组
          .force("link", d3.forceLink(links).id(function (d) { return d.id; }).distance(100)) //指定连线数组
          .force("charge", d3.forceManyBody().strength(-100)) //相互之间的作用力
          .force("center", d3.forceCenter(width/2, height/2));

        let color = d3.scaleOrdinal(d3.schemeCategory20);
        // 添加连线
        let svgLinks = svg.selectAll("line")
          .data(links)
          .enter()
          .append("line")
          .style("stroke", "#ccc")
          .style("stroke-width", 1);

        // 拖动
        let drag = d3.drag()
          .on("start", function (d) {
            if (!d3.event.active) {
              simulation.alphaTarget(0.3).restart();
            }
          })
          .on("end", function (d) {
            if (!d3.event.active) {
              simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
          })
          .on("drag", function (d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
          });

        // 添加节点
        let svgNodes = svg.selectAll("circle")
          .data(nodes)
          .enter()
          .append("g")
          .on("click", function (d) {
            self.initNodeConfig(d);
          })
          .call(drag); //使得节点能够拖动

        svgNodes.append("svg:image")
          .attr("class", "image")
          .attr("xlink:href", function (d, i) {
            return self.topoImageRender(d.type);
          })
          .attr("x", -20)
          .attr("y", -20)
          .attr("width", 40)
          .attr("height", 40);

        // 添加描述节点的文字
        if (this.$cookie.get('theme')=="dark") {
          svgNodes.append("text")
            .style("fill", "black")
            .attr("dx", 22)
            .attr("dy", 8)
            .text(function(d) {
              return d.name;
            }).style("fill", "#00d8ff");
        } else {
          svgNodes.append("text")
            .style("fill", "black")
            .attr("dx", 22)
            .attr("dy", 8)
            .text(function(d) {
              return d.name;
            });
        }

        simulation.on("tick", function() { // 对于每一个时间间隔
          // 更新连线坐标
          svgLinks.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

          // 更新节点坐标
          svgNodes
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
        });
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
              image["tags"].includes("*")) {
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
            url: "api/neutron/v2.0/networks"
          });
          let dataList = response.networks;
          this.param_networkOptions = dataList;

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

      // 保存节点配置信息
      saveNodeConfig() {
        let self = this;
        this.$refs.nodeConfigForm.validate((valid) => {
          if (valid) {
            self.editForm = Object.assign({}, self.nodeConfigForm);
            self.$message.success(this.$t('heat.resourceConfigSaveSuccessMsg'));
          } else {
            return false;
          }
        });
      },
      // 创建模板
      submitTemplateAction() {
        let self = this;
        self.submitTemplateFlag = true;
      },
      handleAddShow() {
        this.submitTemplateFlag = false;
      }
    }
  }
</script>
<style scoped>

</style>
