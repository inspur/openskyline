<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.logictopo')" />
    <icos-page>
    <el-row :gutter="20">
      <el-form :inline="true" label-position="top">
        <el-form-item>
          <img src="../../../../static/topoImages/logical2.png" v-show="language=='zh-cn' && theme != 'dark'">
          <img src="../../../../static/topoImages/logical3.png" v-show="language=='en' && theme != 'dark'">
          <img src="../../../../static/topoImages/logical2_dark.png" v-show="language=='zh-cn' && theme == 'dark'">
          <img src="../../../../static/topoImages/logical3_dark.png" v-show="language=='en' && theme == 'dark'">
        </el-form-item>
      </el-form>
      <div class="divider clearfix"></div>
      <el-col :span="24" ref="topo">
      </el-col>
    </el-row>
    <logicaltopo-list v-if="topodetailvisable" ref="topodetailId" :hostnode="hostnode" @handleDetailShow="handleDetailShow"></logicaltopo-list>
    </icos-page>
  </div>
</template>
<script>
import * as d3 from "d3";
import LogicaltopoList from './LogicalTopoList.vue';
import { getInstanceStatusName } from '../../../utils/util';
export default {
  name: 'LogicalTopo',
  components: {
    LogicaltopoList
  },
  data() {
    return {
      topoImageRender: Vue.topoImageFormatter,
      nodeMap: [],
      servers: [],
      topodetailvisable: false,
      hostnode: {},
      language: 'zh-cn',
      theme: this.$cookie.get('theme')
    };
  },
  async mounted() {
    let self = this;
    self.getLanguage();
    let regionName = this.$cookie.get('region_id');
    self.nodeMap.push({"id":regionName, "type": "OS::Nova::Region", "value": ""});
    const azList = await self.loadAzList();
    await self.loadSereversList();
    for (let i = 0; i < azList.length; i++) {
      let azObj = azList[i];
      if (azObj.zoneName !== 'internal') {
        self.nodeMap.push({"id":regionName + "." + azObj.zoneName, "type": "OS::Nova::Zone", "value": ""});
        let hosts = azObj.hosts;
        for (let host in hosts) {
          if (host.indexOf("-ironic") == -1) {
            self.nodeMap.push({"id":regionName + "." + azObj.zoneName + "."+host, "type": "OS::Nova::Node", "value": ""});
            await self.loadVMTempList(host, azObj.zoneName, host);
          }
        }
      }
    }
    self.initTopo();
  },
  methods: {
    async loadRegionsList() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/keystone/v3/regions"
        });
        return result['regions'];
      } catch (res) {
      }
    },
    async loadAzList() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/os-availability-zone/detail"
        });
        return result['availabilityZoneInfo'];
      } catch (res) {
      }
    },
    async loadSereversList() {
      let self = this;
      try {
        let params = {
          soft_deleted: true,
          all_tenants: 1,
          'not-tags': encodeURIComponent('@'),
          limit: 999999
        };
        const paramsStr = Object.keys(params).map(key => {
          return `${key}=${params[key]}`;
        }).join('&');
        let res = await self.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/detail?${paramsStr}`
        });
        self.servers = res.servers;
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    loadVMTempList(hostname, zoneName, host) {
      let self = this;
      let regionName = this.$cookie.get('region_id');
      let servers = self.servers.filter(item => item['OS-EXT-SRV-ATTR:host'] === host);
      for (let i = 0; i < servers.length; i++) {
        let s = servers[i];
        if (s.status === 'ACTIVE') {
          self.nodeMap.push({"id":regionName + "." + zoneName + "."+host+"."+s.name, "type": "OS::Nova::VM", "value": "", status: s.status});
        } else if (s.status === 'ERROR') {
          self.nodeMap.push({"id":regionName + "." + zoneName + "."+host+"."+s.name, "type": "OS::Nova::VM", "value": "", status: s.status});
        } else {
          self.nodeMap.push({"id":regionName + "." + zoneName + "."+host+"."+s.name, "type": "OS::Nova::VM", "value": "", status: s.status});
        }
      }
    },
    handleDetailShow() {
      this.topodetailvisable = false;
    },
    initTopo() {
      let self = this;

      // let width = this.$refs.topo.$el.offsetWidth;
      let width = self.nodeMap.length * 50;
      let svgWidth = this.$refs.topo.$el.offsetWidth - 20;
      let svgHeight = 800;

      let svg = d3.select(this.$refs.topo.$el)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
      let g = svg.append("g");

      let tree = d3.tree().size([width, svgHeight]);

      let stratify = d3.stratify()
        .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

      let root = stratify(self.nodeMap)
        .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

      tree(root);

      //拖动
      let dragListener = d3.drag()
        .on("start", function(d) {
          if (!d3.event.active) {
            d.fx = d.x;
            d.fy = d.y;
          }
        })
        .on("end", function(d) {
          d.fx = null;
          d.fy = null;
        })
        .on("drag", function(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        });

      //缩放
      let zoom = d3.zoom()
                  .scaleExtent([0.01, 4])
                  .on("zoom", zoomed);
      svg.call(zoom);
      function zoomed() {
        g.attr("transform", d3.event.transform);
      }
      svg.call(zoom.transform, d3.zoomIdentity.scale(0.1));
      svg.call(zoom.transform, d3.zoomIdentity.translate(100, svgHeight / 2 - root.x));

      function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
      }

      function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
      }

      let link = g.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr('d', function(d) {
          return `M${d.y},${d.x} C${(d.y + d.parent.y) / 2},${d.x} ${(d.y + d.parent.y) / 2},${d.x} ${d.parent.y},${d.parent.x}`;
        });
        // .attr("d", diagonal);

      let node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .on("click", function(d) {
          self.showTopoDetail(d.data)
        })
        .call(dragListener);

      node.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

      node.append("svg:image")
        .attr("class", "image")
        .attr("xlink:href", function(d, i) {
          return self.topoImageRender(d.data.type, d.data.status);
        })
        .attr("x", -20)
        .attr("y", -20)
        .attr("width", 40)
        .attr("height", 40);
      if (this.theme != null && this.theme == "dark") {
        node.append("text")
        .attr("dx", -25)
        .attr("dy", 0)
        .attr('text-anchor', 'end')
        .text(function(d) {
          return d.id.substring(d.id.lastIndexOf(".") + 1);
        }).style("fill", "#00d8ff");
        node.append("text")
        .attr("dx", -25)
        .attr("dy", 15)
        .attr('text-anchor', 'end')
        .text(function(d) {
          if (d.data.type === "OS::Nova::VM") {
            return `(${getInstanceStatusName(d.data.status)})`;
          }
          return '';
        });
        link.style("stroke", "#3b9ce7");
      } else {
        node.append("text")
        .attr("dx", -25)
        .attr("dy", 0)
        .attr('text-anchor', 'end')
        .text(function(d) {
          return d.id.substring(d.id.lastIndexOf(".") + 1);
        });
        node.append("text")
        .attr("dx", -25)
        .attr("dy", 15)
        .attr('text-anchor', 'end')
        .text(function(d) {
          if (d.data.type === "OS::Nova::VM") {
            return `(${getInstanceStatusName(d.data.status)})`;
          }
          return '';
        });
      }

      function diagonal(d) {
        return "M" + (d.x) + "," + (d.y) + "T" + (d.parent.x) + "," + (d.parent.y);
      }
    },
    showTopoDetail(node) {
      this.hostnode = node;
      this.topodetailvisable = true;
    },
    getLanguage() {
      if (this.$cookie.get("defaultLanguage") == "en") {
         this.language = "en";
      }
    }
  }
}

</script>