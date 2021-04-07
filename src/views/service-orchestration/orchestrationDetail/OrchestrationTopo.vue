<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="15" ref="topo">
      </el-col>
      <el-col :span="9">
        <el-form ref="nodeDetailForm" :model="nodeDetailForm" label-position="left" label-width="150px" class="me-form" style="text-align:left;">
          <el-row>
            <el-col :span="10"><span style="font-size:20px;">{{$t('heat.resourceInfo')}}</span></el-col>
          </el-row>
          <el-row :gutter="20">
            <div class="divider clearfix"></div>
          </el-row>

          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath" style="width:20%">{{$t('lang.name')}}</th>
                  <td class="idatatd" style="width:80%">{{nodeDetailForm.nodeName}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('heat.resourceType')}}</th>
                  <td class="idatatd">{{resTypeRender(nodeDetailForm.nodeType)}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('heat.resourceStatus')}}</th>
                  <td class="idatatd">
                    <el-tag :type="statusTagRender(nodeDetailForm.status)" v-if="nodeDetailForm.status != ''">
                      <span>{{resStatusRender(nodeDetailForm.status)}}</span>
                    </el-tag>
                  </td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('lang.createTime')}}</th>
                  <td class="idatatd">{{timeRender(nodeDetailForm.createTime)}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-form>
        <el-form :inline="true" style="margin-top:60px;" label-position="top">
          <el-form-item >
            <img :src="src" v-if="language == 'en'">
            <img :src="srcEn" v-else>
          </el-form-item>
        </el-form>
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
export default {
  name: 'OrchestrationTopo',
  data() {
    return {
      nodeDetailForm: {
        nodeName: "",
        nodeType: "",
        status: "",
        createTime: ""//,
        // updateTime: ""
      },
      language:this.$cookie.get('defaultLanguage'),
      stackName: this.$route.params.stackName,
      stackId: this.$route.params.stackId,
      resTypeRender: Vue.resourceTypeFormatter,
      resStatusRender: Vue.resourceStatusFormatter,
      topoImageRender: Vue.topoImageFormatter,
      timeRender: Vue.tzTimeFormatter,
      src:this.$cookie.get('theme')=="dark"?topoIconsDark:topoIcons,
      srcEn:this.$cookie.get('theme')=="dark"?topoIconsDarkEn:topoIconsEn
    };
  },
  mounted() {
    this.getTemplateDetail();
  },
  methods: {
    async getTemplateDetail() {
      let self = this;
      try {
        let response = await this.$ajax({
          type: "get",
          url: "api/heat/v1/" + this.$cookie.get("pid") + "/stacks/" + self.stackName + "/" + self.stackId + "/resources",
          successFun: (response) => {
            let node = [];
            let link = [];
            let resources = response.resources;
            resources.forEach(function(item, index) {
              node.push({
                id: item.logical_resource_id,
                name: item.resource_name,
                type: item.resource_type,
                status: item.resource_status,
                creation_time: item.creation_time,
                updated_time: item.updated_time
              });

              if (item.required_by.length > 0) {
                let reqList = item.required_by;
                for (var i = 0; i < reqList.length; i++) {
                  link.push({
                    source: reqList[i],
                    target: item.logical_resource_id
                  });
                }
              }
            });
            this.initTopo(node, link);
          }
        });
      } catch (e) {
        console.log(e);
      }
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
        .force("link", d3.forceLink(links).id(function(d) { return d.id; }).distance(100)) // 指定连线数组
        .force("charge", d3.forceManyBody().strength(-400)) // 相互之间的作用力
        .force("center", d3.forceCenter(width / 2, height / 2));

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
        .on("start", function(d) {
          if (!d3.event.active) {
            simulation.alphaTarget(0.3).restart();
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

      // 添加节点
      let svgNodes = svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("g")
        // .attr("r", 20)
        // .style("fill", function(d, i) {
        //   return color(i);
        // })
        .on("click", function(d) {
          self.showNodeDetail(d);
        })
        .call(drag); //使得节点能够拖动

      svgNodes.append("svg:image")
        .attr("class", "image")
        .attr("xlink:href", function(d, i) {
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
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      });
    },
    showNodeDetail(node) {
      this.nodeDetailForm.nodeName = node.name;
      this.nodeDetailForm.nodeType = node.type;
      this.nodeDetailForm.status = node.status;
      this.nodeDetailForm.createTime = node.creation_time;
      // this.nodeDetailForm.updateTime = node.updated_time;
    },
      statusTagRender(value) {
        let tagType = "";
        if (value === "CREATE_COMPLETE" || value === "CHECK_COMPLETE" ||
          value === "ADOPT_COMPLETE" || value === "DELETE_COMPLETE" || value === "INIT_COMPLETE" ||
          value === "RESUME_COMPLETE" || value === "ROLLBACK_COMPLETE" || value === "SUSPEND_COMPLETE" || value === "UPDATE_COMPLETE" || value === "SNAPSHOT_COMPLETE") {
          tagType = "success";
        } else if (value === "CREATE_IN_PROGRESS" || value === "DELETE_IN_PROGRESS" ||
          value === "CHECK_IN_PROGRESS" || value === "ADOPT_IN_PROGRESS" ||
          value === "DELETE_IN_PROGRESS" || value === "INIT_IN_PROGRESS" || value === "RESUME_IN_PROGRESS" ||
          value === "ROLLBACK_IN_PROGRESS" || value === "SUSPEND_IN_PROGRESS" || value === "UPDATE_IN_PROGRESS" || value === "SNAPSHOT_IN_PROGRESS") {
          tagType = "info";
        } else if (value === "CREATE_FAILED" || value === "DELETE_FAILED" ||
          value === "CHECK_FAILED" || value === "ADOPT_FAILED" || value === "DELETE_FAILED" ||
          value === "INIT_FAILED" || value === "RESUME_FAILED" || value === "ROLLBACK_FAILED" ||
          value === "SUSPEND_FAILED" || value === "UPDATE_FAILED" || value === "SNAPSHOT_FAILED") {
          tagType = "danger";
        }
        return tagType;
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
