<template>
  <div>
    <icos-page-header :title="$t('network.networkTopo')" :show-bottom-border="false" />
    <icos-page>
    <el-form :inline="true" class="form-inline" style="height:30px;">
      <el-form-item :label="$t('lang.project')"   v-if="roleType == '0'">
        <!-- <el-select v-model="query_porject" filterable @change="projectChange">
          <el-option v-for="item in projectOption" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select> -->
        <el-input auto-complete="off" style="width:160px;" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="projectName"></el-input>
      </el-form-item>
      <el-form-item style="float:right;">
        <el-button size="small" icon="fa-plus" @click="createRouter">{{$t('network.createRouter')}}</el-button>
      </el-form-item>
      <el-form-item style="float:right;">
        <el-button size="small" icon="fa-plus" @click="createNetwork">{{$t('network.createNetwork')}}</el-button>
      </el-form-item>
      <el-form-item style="float:right;">
        <el-button size="small" icon="fa-plus" @click="createVM">{{$t('network.createvm')}}</el-button>
      </el-form-item>
      <el-form-item style="float:right;">
        <el-button size="small" icon="fa-repeat" @click="refershTopo">{{$t('network.refresh')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
    <el-row v-loading="loading">
      <el-col :span="22" ref="topo" style="overflow: hidden">
      </el-col>
      <el-col :span="2" style="float:right">
        <el-form :inline="true" style="margin-top:60px;width:60px;float:right" label-position="top">
          <el-form-item >
            <img :src="theme=='dark'?$t('network.networktopopath_dark'):$t('network.networktopopath')">
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <topo-detail v-if="topodetailvisable" ref="topodetailId" :toponode="toponode" @handleDetailShow="handleDetailShow" @createSubnet="createSubnet" @handleAddShow="handleAddShow" @createInterface="createInterface"></topo-detail>
    <add-network ref="addNetwork" v-if="addnetworkFlag" @handleAddShow="handleAddShow" @handleCancelShow="handleCancelShow"></add-network>
    <add-router ref="addRouter" v-if="addrouterFlag" @handleAddRouterShow="handleAddShow" @handleCancelShow="handleCancelShow"></add-router>
    <add-subnetwork ref="addSubNetwork" v-if="addSubnetFlag" @handleAddSubnetShow="handleAddSubnetShow" @handleEditCancleShow="handleCancelShow" :networkId="networkId"></add-subnetwork>
    <add-interface ref="addPort" v-if="addportFlag" @handleAddPortShow="handleAddPortShow" @handleEditPortsShow="handleCancelShow" :routerId="routerId"></add-interface>
    <add-instance ref="addInstance" v-if="addvmFlag" @handleAddShow="handleAddShow" @onRefresh="handleCancelShow" @reloadVolume="handleCancelShow"></add-instance>
    <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
    <host-list :vmTableData="vmTableData" ref="hostList" v-if="moreVMFlg" @showHostDetail="showHostDetail" @getSelectProjects="getSelProjects"></host-list>
    </icos-page>
   </div>
</template>
<script>
import * as d3 from "d3";
import TopoDetail from './TopoDetail';
import AddNetwork from '../network/AddNetwork';
import AddRouter from '../router/AddRouter';
import AddSubnetwork from '../network/AddSubnetwork';
import AddInterface from '../router/AddInterface';
import AddInstance from '../../calculate-storage/instance/AddInstance';
import HostList from './HostList';
export default {
  name: 'NetworkTopo',
  components: {
    TopoDetail, AddNetwork, AddRouter, AddSubnetwork, AddInterface, AddInstance, HostList
  },
  data() {
    return {
      vmSelectMoreList: {},
      vmTableData: [],
      moreVMFlg: false, // 虚拟机列表
      maxLink: 5, // 网络最多显示的虚机数量
      roleType: Vue.roleType + "",
      query_porject: "",
      projectName:"",
      selProjectFlg:false,
      close: "",
      projectOption: [],
      vmList: [],
      topoImageRender: Vue.topoImageFormatter,
      toponode:"",
      topodetailvisable: false,
      addnetworkFlag: false,
      addrouterFlag: false,
      addvmFlag: false,
      loading: false,
      addSubnetFlag: false,
      addportFlag: false,
      networkId: "",
      routerId: "",
      theme: this.$cookie.get('theme')
    };
  },
  mounted() {
    let self = this;
    let roleType = Vue.roleType + "";
    if (roleType == "0") {
      this.getProjectList();
    } else {
      self.query_porject = Vue.cookie.get('pid');
      Promise.all([self.getVMList(self.query_porject)]).then(function(result) {
        self.getTemplateDetail(self.query_porject);
      });
    }
    console.log(Vue.language);
  },
  methods: {
    async getProjectList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default"
        });
        this.projectOption = result["projects"];
        Vue.projectListforNet = result["projects"];
        for (let i = 0; i < this.projectOption.length; i++) {
          let s = this.projectOption[i];
          if (s.name === "admin") {
            this.query_porject = s.id;
            this.projectName = "admin";
            this.projectChange(s.id);
          }
        }
      } catch (res) {
        console.log("获取项目列表失败");
      }
    },
    projectChange(projectId) {
      let self = this;
      self.query_porject = projectId;
      self.loading = true;
      Promise.all([self.getVMList(projectId)]).then(function(result) {
        self.getTemplateDetail(projectId);
      });
      // this.getVMList(projectId);
      // this.getTemplateDetail(projectId);
    },
    refershTopo() {
      let self = this;
      Promise.all([self.getVMList(self.query_porject)]).then(function(result) {
        self.getTemplateDetail(self.query_porject);
      });
    },
    async getVMList(projectId) {
      let self = this;
      try {
        let [instanceVM, phyVM] = await Promise.all([this.getInstanceVMlist(projectId), this.getPhyVMlist(projectId)]);
        phyVM['servers'].map(function(item) {
          item.isPhy = true;
        })
        self.vmList = [].concat(instanceVM['servers'], phyVM['servers']);
      } catch (e) {
        console.error(e);
      }
    },
    async getInstanceVMlist(projectId) {
      let self = this;
      let roleType = Vue.roleType + "";
      let url = "";
      if ("2" == roleType) {
        url = "api/nova/v2.1/servers-inspur/detail?project_id=" + self.$cookie.get("pid") + "&not-tags=" + encodeURIComponent('@');
      } else if ("3" == roleType) {
        url = "api/nova/v2.1/servers-inspur/detail?project_id=" + self.$cookie.get("pid") + "&user_id=" + Vue.userId+ "&not-tags=" + encodeURIComponent('@');
      } else {
        url = "api/nova/v2.1/servers-inspur/detail?all_tenants=1&project_id=" + projectId+ "&not-tags=" + encodeURIComponent('@');
      }
      try {
        return await self.$ajax({
          type: 'get',
          url: url,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: false
        });
      } catch (e) {
        console.error(e);
      }
    },
    async getPhyVMlist(projectId) {
      let self = this;
      let roleType = Vue.roleType + "";
      let urlPhy = "";
      if ("2" == roleType) {
        urlPhy = "api/nova/v2.1/servers-inspur/detail?project_id=" + self.$cookie.get("pid") + "&tags=" + encodeURIComponent('@');
      } else if ("3" == roleType) {
        urlPhy = "api/nova/v2.1/servers-inspur/detail?project_id=" + self.$cookie.get("pid") + "&user_id=" + Vue.userId+ "&tags=" + encodeURIComponent('@');
      } else {
        urlPhy = "api/nova/v2.1/servers-inspur/detail?all_tenants=1&project_id=" + projectId+ "&tags=" + encodeURIComponent('@');
      }
      try {
        return await self.$ajax({
          type: 'get',
          url: urlPhy,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          showErrMsg: false
        });
      } catch (e) {
        console.error(e);
      }
    },
    async getTemplateDetail(projectId) {
      let self = this;
      self.loading = true;
      try {
        let response = await this.$ajax({
          type: "get",
          url: "api/neutron/v2.0/inspur/networkextension/network_topology/"+projectId,
          success: (response) => {
            let node = [];
            let link = [];
            let linkVisable = [];
            let networks = response["networks"];
            let ports = response["ports"];
            let routers = response["routers"];
            let subnets = [];
            let vmLinks = [];
            self.vmList.forEach(function(item, index) {
              node.push({
                id: item.id,
                name: item.name,
                type: "OS::Nova::VM",
                status: item.status,
                locked:item.locked,
                taskStatus:item['OS-EXT-STS:task_state'],
                ipaddress: item.addresses,
                linked: false,
                phyFlag: (item.isPhy ? 'true' : '')
              });
            });
            networks.forEach(function(item, index) {
              if (item["router:external"] == false) {
                node.push({
                  id: item.id,
                  name: item.name,
                  type: "OS::Neutron::Netinside",
                  external:item['router:external'],
                  status: item.status,
                  linked: false,
                  neutronType : true
                });
              } else {
                node.push({
                  id: item.id,
                  name: item.name,
                  type: "OS::Neutron::Net",
                  status: item.status,
                  external:item['router:external'],
                  linked: false,
                  neutronType : true
                });
              }
            });
            ports.forEach(function(item, index) {
              let havenet = false;
              for (let a = 0; a < networks.length; a++) {
                if (item["network_id"] == networks[a].id) {
                  havenet = true;
                }
              }
              if (havenet) {
                for (let i = 0; i < self.vmList.length; i++) {
                  let vm = self.vmList[i];
                  if (vm.id === item["device_id"]) {
                    link.push({
                      source: vm.id,
                      target: item["network_id"],
                      type : "VM", // 用来识别虚拟机
                      name : vm.name // 虚机名称
                    });
                    for (let j = 0; j < node.length; j++) {
                      if (node[j].id == vm.id || node[j].id == item["network_id"]) {
                        // 给一个虚机两个以上网络的link做记录
                        if (node[j].linked && node[j].id == vm.id) {
                          for (let m = 0; m < link.length; m++) {
                            if (link[m].source == node[j].id) {
                              link[m].linkMore = true;
                            }
                          }
                          node[j].linkMore = true;
                        }
                        // 添加网络所连接的虚机数量
                        if (node[j].id == item["network_id"]) {
                          if (node[j].vmLink) {
                            node[j].vmLink+=1;
                          } else {
                            node[j].vmLink = 1;
                          }
                        }
                        node[j].linked = true;
                      }
                    }
                  }
                }
              }
            });
            routers.forEach(function(item, index) {
              node.push({
                id: item.id,
                name: item.name,
                type: "OS::Neutron::Router",
                status: item.status,
                linked: false
              });
              let networkList = item["all_nets"];
              if (networkList.length > 0) {
                for (let j = 0; j < networkList.length; j++) {
                  for (let k = 0; k < networks.length; k++) {
                    if (networks[k].id == networkList[j]) {
                      link.push({
                        source: networkList[j],
                        target: item.id
                      });
                      for (let i = 0; i < node.length; i++) {
                        if (node[i].id == item.id || node[i].id == networkList[j]) {
                          node[i].linked = true;
                        }
                      }
                    }
                  }
                }
              }
            });
            for (let i = 0; i < node.length; i++) {
              // 网络节点并且网络节点上VM数大于5
              if (node[i].neutronType && (self.maxLink < node[i].vmLink)) {
                // 过滤link查找vm targe为以上网络并且类型为vm并且不连接多个网络
                let tmpLinks = link.filter(item => {
                  if (item.target == node[i].id && item.type && !item.linkMore) {
                    return item;
                  }
                });
                vmLinks = vmLinks.concat(tmpLinks);
              }
              // 以下代码与拓扑图以更多展示优化无关
              if (node[i].linked == false && i!=0) {
                linkVisable.push({
                  source: node[0].id,
                  target: node[i].id
                });
              }
            }
            let map = new Map();
            let tableMap = new Map();
            let tmpArr = [];
            let tmpTable = {};
            vmLinks.forEach(item => {
              // 获取Id
              if (map.has(item.target)) {
                map.get(item.target).push(item.source);
              } else {
                map.set(item.target, [item.source]);
              }
              // 获取表格数据
              if (tableMap.has(item.target)) {
                tableMap.get(item.target).push({name:item.name, id:item.source});
              } else {
                tableMap.set(item.target, [{name:item.name, id:item.source}]);
              }
            });
            for (let [key, value] of map) {
              tmpArr.push({networkId:key, vmIds:value});
            }
            for (let [key, value] of tableMap) {
              tmpTable[key] = value;
            }
            self.vmSelectMoreList = tmpTable;
            // 过滤node和link
            tmpArr.forEach(item => {
              if (item.vmIds.length > self.maxLink) {
                for (let a = 0; a < item.vmIds.length; a++) {
                  if (a > (self.maxLink-1)) {
                    // 过滤node
                    let indexVm = node.findIndex(itemNode => {
                      return itemNode.id == item.vmIds[a];
                    });
                    node.splice(indexVm, 1); // 删除node中第五项开始的vm
                    // 过滤link
                    let indexLink = link.findIndex(itemLink => {
                      return itemLink.source == item.vmIds[a];
                    });
                    link.splice(indexLink, 1);// 删除多余的节点
                  }
                }
                // 添加"更多"节点
                const vmId = "more" + item.networkId;
                node.push(
                  {
                    id: vmId,
                    name: "More",
                    type: "vmMore",
                    linked: true,
                    vmSelectId: item.networkId
                  }
                );
                link.push({
                  source: vmId,
                  target: item.networkId
                });
              }
            });
            self.loading = false;
            self.initTopo(node, link, linkVisable);
          }
        });
      } catch (e) {
        console.log(e);
      }
    },
    initTopo(nodes, links, linkVisable) {
      let self = this;
      d3.select(this.$refs.topo.$el).select("svg").remove();
      let width = this.$refs.topo.$el.offsetWidth;
      if (width < 1200) {
        width = 1200;
      }
      let height = 600;

      let svg = d3.select(this.$refs.topo.$el).append("svg").attr("width", width).attr("height", height);
      let g = svg.append("g");

      let simulation = d3.forceSimulation(nodes) //指定节点数组
        .force("link", d3.forceLink(links).id(function(d) { return d.id; }).distance(80).strength(0.9))
        .force("charge", d3.forceManyBody())
        .force("collide", d3.forceCollide(25).strength(0.2).iterations(5))
        .force("center", d3.forceCenter(width / 2, height / 2));
      let color = d3.scaleOrdinal(d3.schemeCategory20);

      //拖动
      let drag = d3.drag()
        .on("start", function(d) {
          if (!d3.event.active) {
            simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          }
        })
        .on("end", function(d) {
          if (!d3.event.active) {
            simulation.alphaTarget(0);
          }
          d.fx = null;
          d.fy = null;
        })
        .on("drag", function(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        });

      // 添加连线
      let svgLinks = g.selectAll("line")
        .data(links)
        .enter().append("line")
        .style("stroke", "#0060ff")
        .style("stroke-width", 1);

      // 添加节点
      let svgNodes = g.selectAll("circle")
        .data(nodes)
        .enter()
        .append("g")
        .on("click", function(d) {
          self.showNodeDetail(d);
        })
        .call(drag);
      //节点的图标
      svgNodes.append("svg:image")
        .attr("class", "image")
        .attr("xlink:href", function(d, i) {
          return self.topoImageRender(d.type, d.status, d.phyFlag);
        })
        .attr("x", -20)
        .attr("y", -20)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.size; })
        .attr("width", 40)
        .attr("height", 40);

      // 添加描述节点的文字
      svgNodes.append("text")
        .style("fill", self.theme=="dark"?"#00d8ff":"black")
        .attr("dx", 22)
        .attr("dy", 8)
        .text(function(d) {
          return d.name;
        });
      //缩放
      svg.call(d3.zoom()
        .scaleExtent([1/4, 4])
        .on("zoom", zoomed));
      function zoomed() {
        g.attr("transform", d3.event.transform)
      }

      simulation.on("tick", function() {
        svgLinks.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
        svgNodes
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      });
    },
    showNodeDetail(node) {
      let detailFlag = true;
      let self = this;
      if (node["type"] == "OS::Neutron::Netinside") {
        self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/networks/"+node.id,
          success: function(res) {
            self.topodetailvisable = true;
            node.shared = res.network.shared;
            self.toponode = node;
          },
          errorKey: "NeutronError",
          errFun() {
            self.getTemplateDetail(self.query_porject);
          }
        });
      } else if (node["type"] == "OS::Neutron::Net") {
        self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/networks/"+node.id,
          success: function(res) {
            self.topodetailvisable = true;
            node.shared = res.network.shared;
            self.toponode = node;
          },
          errorKey: "NeutronError",
          errFun() {
            self.getTemplateDetail(self.query_porject);
          }
        });
      } else if (node["type"] == "OS::Neutron::Router") {
        self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/routers/"+node.id,
          success: function() {
            self.topodetailvisable = true;
            self.toponode = node;
          },
          errorKey: "NeutronError",
          errFun() {
            self.getTemplateDetail(self.query_porject);
          }
        });
      } else if (node["type"] == "OS::Nova::VM") {
        self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/servers-inspur/"+node.id,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.41
          },
          success: function() {
            self.topodetailvisable = true;
            self.toponode = node;
          },
          errFun() {
            Promise.all([self.getVMList(self.query_porject)]).then(function(result) {
              self.getTemplateDetail(self.query_porject);
            });
          }
        });
      } else if (node["type"] === "vmMore") {
        this.vmTableData = this.vmSelectMoreList[node.vmSelectId];
        this.moreVM = true;
        this.hostList();
      }
      // this.topodetailvisable = true;
      // this.toponode = node;
    },
    showHostDetail(id) {
      let self = this;
      this.$ajax({
        type: 'get',
        url: "api/nova/v2.1/servers-inspur/" + id,
        headers: {
          'X-OpenStack-Nova-API-Version': 2.41
        },
        success: function(data) {
          let nodeData = data && data.server;
          self.topodetailvisable = true;
          self.toponode = {
            id: nodeData.id,
            name: nodeData.name,
            type: "OS::Nova::VM",
            status: nodeData.status,
            locked:nodeData.locked,
            taskStatus:nodeData['OS-EXT-STS:task_state'],
            ipaddress: nodeData.addresses,
            linked: true
          };
        },
        errFun() {
          Promise.all([self.getVMList(self.query_porject)]).then(function(result) {
            self.getTemplateDetail(self.query_porject);
          });
        }
      });
    },
    handleDetailShow() {
      this.topodetailvisable = false;
    },
    createRouter() {
      this.addrouterFlag = true;
    },
    createNetwork() {
      this.addnetworkFlag = true;
    },
    createVM() {
      this.addvmFlag = true;
    },
    createSubnet(Obj) {
      this.networkId = Obj["networkId"];
      this.addSubnetFlag = true;
    },
    createInterface(Obj) {
      this.routerId = Obj["routerId"];
      this.addportFlag = true;
    },
    handleAddShow() {
      let self = this;
      self.addnetworkFlag = false;
      self.addvmFlag = false;
      self.addrouterFlag = false;
      Promise.all([self.getVMList(self.query_porject)]).then(function(result) {
        self.getTemplateDetail(self.query_porject);
      });
    },
    handleAddSubnetShow(nonet="") {
      this.addSubnetFlag = false;
      this.$refs.topodetailId.getSubnetList();
      if (nonet.nonet == "true") {
        this.topodetailvisable = false;
        this.refershTopo();
      }
    },
    handleAddPortShow() {
      let self = this;
      self.addportFlag = false;
      self.$refs.topodetailId.getInterfaceList();
      Promise.all([self.getVMList(self.query_porject)]).then(function(result) {
        self.getTemplateDetail(self.query_porject);
      });
    },
    handleCancelShow() {
      this.addrouterFlag = false;
      this.addnetworkFlag = false;
      this.addvmFlag = false;
      this.addSubnetFlag = false;
      this.addportFlag = false;
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    hostList() {
      this.moreVMFlg = true;
      this.$nextTick(() => {
        this.$refs.hostList.show();
      });
    },
    getSelProjects(id, name) {
      this.projectChange(id);
      this.query_porject = id;
      this.projectName = name;
      this.close = 'close';
    },
    onIconClick() {
      this.query_porject = '';
      this.projectName = '';
      this.close = '';
    }
  }
}
</script>
