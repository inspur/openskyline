<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="15" ref="topo">
      </el-col>
      <el-col :span="9">
        <el-form ref="nodeDetailForm" :model="nodeDetailForm" label-position="left" label-width="100px" class="me-form" style="text-align:left;">
          <el-row>
            <el-col :span="10"><span style="font-size:20px;">{{$t('heat.resourceInfo')}}</span></el-col>
          </el-row>
          <el-row :gutter="20">
            <div class="divider clearfix"></div>
          </el-row>
          <div class="table_panel" v-show="nodeDetailForm.nodeName">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath" style="width:20%">ID</th>
                  <td class="idatatd" style="width:80%">{{nodeDetailForm.nodeName}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath" style="width:20%">{{$t('heat.resourceType')}}</th>
                  <td class="idatatd" style="width:80%">{{resTypeRender(nodeDetailForm.nodeType)}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath" style="width:20%">{{$t('lang.createTime')}}</th>
                  <td class="idatatd" style="width:80%">{{timeRender(nodeDetailForm.createTime)}}</td>
                </tr>
                <tr is="row" v-for="(val, k) in nodeConfig" :val="val" :k="k" :key="getKey()" v-if="k!=='heat_user_data'"></tr>
              </tbody>
            </table>
          </div>
        </el-form>
        <!--<el-form :inline="true" style="margin-top:60px;" label-position="top">
          <el-form-item >
            <img :src="src" v-if="language != 'en'">
            <img :src="srcEn" v-else>
          </el-form-item>
        </el-form>-->
      </el-col>
    </el-row>
  </div>
</template>
<script>
import * as d3 from "d3";
import topoIcons from "../../../../static/topoImages/topoIcons.png";
import topoIconsDark from "../../../../static/topoImages/topoIconsDark.png";
import topoIconsEn from "../../../../static/topoImages/topoIconsEn.png";
import topoIconsDarkEn from "../../../../static/topoImages/topoIconsDarkEn.png";
import Row from "./Row";
import yaml from "js-yaml";
export default {
  name: 'OrchestrationTopo',
  components: {
    Row
  },
  data() {
    return {
      IMAGE: 'image',
      FLAVOR: 'flavor',
      NETWORK: 'network',
      SUBNETWORK: 'subnetwork',
      PUBLICNETWORK: 'publicnetwork',
      KEYPAIR: 'keypair',
      SUBNET: 'subnet',
      VOLUMETYPE: 'volumetype',
      nodeId: {},
      nodeConfig: null,
      nodeInfo: [], // 处理过的每个节点的信息
      nodeInfos: null, // 最终处理后的信息
      param_flavorOptions:[],
      param_imageOptions:[],
      param_networkOptions:[],
      param_subnetworkOptions:[],
      param_public_networkOptions:[],
      param_keypairOptions:[],
      param_subnetOptions:[],
      param_volumeTypeOptions:[],
      param_securityGroupsOptions:[],
      templateData: [],
      nodeDetailForm: {
        nodeName: "",
        nodeType: "",
        createTime: ""
      },
      language:this.$cookie.get('defaultLanguage'),
      resTypeRender: Vue.resourceTypeFormatter,
      topoImageRender: Vue.topoImageFormatter,
      timeRender: Vue.tzTimeFormatter,
      theme: this.$cookie.get('theme'),
      src:this.$cookie.get('theme')=="dark"?topoIconsDark:topoIcons,
      srcEn:this.$cookie.get('theme')=="dark"?topoIconsDarkEn:topoIconsEn
    };
  },
  async mounted() {
    await this.getList(); // 获取镜像 网络 子网所有的下拉列表的值
    await this.getTemplateDetail(); // 获取模板的所有信息
  },
  methods: {
    getKey() {
      let key = Symbol();
      return key;
    },
    // 获取镜像 网络 子网所有的下拉列表的值
     async getList() {
      await this.getImageList();
      await this.getFlavorList();
      await this.getNetworkList();
      await this.getSubnetWorkList();
      await this.getKeypairList();
      await this.getVolumeTypeList();
      await this.getSecurityGroups();
      //this.getTopoFlowNodeTypeList();
    },
    // 获取节点配置信息
    async initNodeConfig(node) {
      this.nodeConfig = this.nodeInfos[node.id];
      console.log( this.nodeConfig)
      console.log("config-----------")
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
          if ("snapshot" == image['image_type'] || typeof (image['block_device_mapping']) != "undefined") {
            continue;
          }
          if ("2" == roleType || "3" == roleType) {
            if ("private" == image['visibility'] && projectId != image['owner']) {
              continue;
            }
          }
          this.param_imageOptions.push(image);
        }
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
        this.param_flavorOptions = dataList;
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
          this.param_public_networkOptions = [];
          for (let i = 0; i < dataList.length; i++) {
            let publicnetwork = dataList[i];
            if (publicnetwork["router:external"] === true &&
              (publicnetwork["project_id"] === projectid || publicnetwork["shared"] === true )) {
              this.param_public_networkOptions.push(publicnetwork);
            }
          }
        }
      } catch (data) {
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
      this.editTemplateForm[this.subnetField] = "";
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
    async getVolumeTypeList() {
      let projectId = this.$cookie.get("pid");
      try {
        let response = await this.$ajax({
          type: 'get',
          url: "api/cinderv3/v3/" + projectId + "/types"
        });
        let dataList = response.volume_types;
        this.param_volumeTypeOptions = dataList;
      } catch (data) {
      }
    },
    async getSecurityGroups() {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/neutron/v2.0/security-groups?tenant_id=${$this.$cookie.get('pid')}`
        });
        $this.param_securityGroupsOptions = res.security_groups;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    getValueById(list, id) {
      list = list || [];
      for (let v of list) {
        if (v.id === id) {
          return v.name;
        }
      }
    },
    // 获取模板的所有信息
    async getTemplateDetail() {
      let self = this;
      try {
        let response = await this.$ajax({
          type: "get",
          url: "api/heat/v1/" + this.$route.params.projectId + "/template/get_stack_template_detail/" + this.$route.params.id,
          successFun: (response) => {
            let node = [];
            let link = [];
            let resources = response.templatedetail.stacktemplateresource; // 模板的类型 属性
            let nodeParams = JSON.parse(response.templatedetail.stacktemplate.node_params); // 每个节点对应属性的具体值node_params: "{"monitor": {"id": "80d670a0dd0a493080ca9946d5cee467", "max_retries": 9}}",
            let resourceFlag = false;
            let resource = {};
            let resourceId = "";
            // 获取每个节点的属性值{"delay": 3, "max_retries": 9}
            for (let [key, value] of Object.entries(nodeParams)) {
              let attrTmp = {};
              let attr = {};
              let resourceTmp = {};
              // 特殊处理资源组
              if ("replace_vm_name" === key) resourceFlag = true;
              if (resourceFlag) {
                if ("replace_vm_name" === key) {
                  resourceId = value.id;
                  resource[resourceId] = {};
                  resource[resourceId].heat_vm_number = value.desired_capacity;
                } else {
                  for (let [kResource, vResource] of Object.entries(value)) {
                    vResource = self.valueChangeToC(kResource, vResource);
                    resourceTmp['heat_' + kResource] = vResource;
                  }
                }
                Object.assign(resource[resourceId], resourceTmp);
              } else {
                // 每个节点的属性值进行遍历{"delay": 3, "max_retries": 9}
                for (let [k, v] of Object.entries(value)) {
                  v = self.valueChangeToC(k, v, key); // 将网络 镜像等的值为id的转换成名称
                  if (k != "id") {
                    attrTmp[k] = v; // attrTmp = {"delay": 3, "max_retries": 9}
                  } else if (!attr[v]) {
                    attr[v] = attrTmp; // attr = {80d670a0dd0a493080ca9946d5cee467 : {"delay": 3, "max_retries": 9}}
                    self.nodeInfo = Object.assign({}, self.nodeInfo, attr); // 将每个节点转换成节点id对应所有属性值的形式 nodeInfo = {80d670a0dd0a493080ca9946d5cee467 : {"delay": 3, "max_retries": 9}}
                  }
                }
              }
            }
            let newNodeTmp = {};
            resources.forEach(function (item, index) {
              // 把key换为label的值
              if (item.properties) {
                let node = self.nodeInfo[item.id]; // 通过id将属性和属性真正的值关联起来 获取真正的属性值
                let newNode = {};
                // "loadbalancer": {"vip_subnet": "8bd0d83b-f37d-4b1b-914e-f13f6adc504b", "id": "7e2c19b933b445549c34e449d990c45d"},
                for (let properties of item.properties) {
                  for (let [key, value] of Object.entries(node)) {
                    if (key === properties.name) {
                      newNode[properties.label] = value; // 用label来展示属性汉语名称 label: "heat_lb_loadbalance_subnetwork"
                      break;
                    }
                }
                /*for (let [key, value] of Object.entries(node)) {
                  let flg = false;
                  for (let properties of item.properties) {
                    if (key === properties.name) {
                      newNode[properties.label] = value; // 用label来展示属性汉语名称 label: "heat_lb_loadbalance_subnetwork"
                      flg = true;
                      break;
                    }
                  }*/
                 /* if (!flg) {
                    newNode[key] = value;
                  }*/
                }
                newNodeTmp[item.id] = newNode; // {80d670a0dd0a493080ca9946d5cee467 : {"heat_lb_loadbalance_subnetwork": 3}}
              }
              let type = self.resTypeRender(item.type);
              node.push({
                id: item.id,
                name: type,
                type: item.type,
                created_at: item.created_at
              });
              if (item.requires) {
                console.log(item);
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
            });
            self.nodeInfos = Object.assign({}, newNodeTmp, resource);
            this.initTopo(node, link);
          }
        });
      } catch (e) {
        console.log(e);
      }
    },
    // 将ID翻译成名称
    valueChangeToC(k, v, type) {
      let self = this;
      let value = v;
      if (value) {
        switch (k) {
          case self.IMAGE:
            value = self.getValueById(self.param_imageOptions, v);
            break;
          case self.FLAVOR:
            value = self.getValueById(self.param_flavorOptions, v);
            break;
          case self.NETWORK:
            value = self.getValueById(self.param_networkOptions, v);
            break;
          case self.SUBNETWORK:
          case "vip_subnet":
          case "subnet_id":
            value = self.getValueById(self.param_subnetworkOptions, v);
            break;
          case self.PUBLICNETWORK:
          case "floating_network":
            value = self.getValueById(self.param_public_networkOptions, v);
            break;
          case self.KEYPAIR:
            value = self.getValueById(self.param_keypairOptions, v);
            break;
          case self.SUBNET:
            value = self.getValueById(self.param_subnetOptions, v);
            break;
          case self.VOLUMETYPE:
          case "volume_type":
            value = self.getValueById(self.param_volumeTypeOptions, v);
            break;
          case 'security_group':
            value = self.getValueById(self.param_securityGroupsOptions, v);
            break;
          case "lb_algorithm":
            value = self.$t('heat.' + v);
            break;
          case "action":
          case "ip_version":
          case "protocol":
            if (type && type.indexOf("firewall_rule") != -1) {
              value = self.$t('heat.' + v);
            }
            break;
        }
      }
      return value;
    },
    initTopo(nodes, links) {
      let self = this;

      let width = this.$refs.topo.$el.offsetWidth;
      let height = 600;

      let svg1 = d3.select(this.$refs.topo.$el)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
      let svg = svg1.append("g");
      //缩放
      svg1.call(d3.zoom()
        .scaleExtent([1/4, 4])
        .on("zoom", zoomed));
      function zoomed() {
        svg.attr("transform", d3.event.transform)
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
        // .attr("r", 20)
        // .style("fill", function(d, i) {
        //   return color(i);
        // })
        .on("click", function (d) {
          self.showNodeDetail(d);
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
    showNodeDetail(node) {
      this.nodeDetailForm.nodeName = node.id;
      this.nodeDetailForm.nodeType = node.type;
      this.nodeDetailForm.createTime = node.created_at;
    }
  }
}

</script>
<style scoped>
.formspan {
  font-weight: bold;
  float: right;
}

</style>
