<template>
  <div>
  <el-form class="margin-tb20 me-required-form" ref="createBySystemForm" :model="createBySystemForm" :rules=rules label-width="100px">
    <el-row :gutter="20">
      <el-col :span="10">
        <el-form-item :label="this.$t('heat.templateType')" v-if="createBySystemForm.templateType == 'system'">
          <el-table ref="table" :data="templateList" v-loading="loading"
            :element-loading-text="$t('lang.loading')"
            highlight-current-row
            stripe
            :default-sort="{prop: 'id', order: 'ascending'}"
            row-key="id"
            @row-click="rowClick"
            @selection-change="handleSelectionChange">
              <!-- <el-table-column reserve-selection type="selection" align="center" width="55">
              </el-table-column> -->
              <el-table-column prop="name" :label="this.$t('lang.name')" show-overflow-tooltip align="left" min-width="100">
              </el-table-column>
              <el-table-column prop="description" :label="this.$t('lang.desc')" show-overflow-tooltip align="left" min-width="100">
              </el-table-column>
            </el-table>
        </el-form-item>
        <!--<span>{{$t('heat.defaultPassword')}}</span>-->
      </el-col>
      <el-col :span="14" ref="topo" v-if="createBySystemForm.templateType == 'system'">
      </el-col>
    </el-row>

    <el-form-item :label="$t('heat.template_file')" class="is-required" v-if="createBySystemForm.templateType == 'custom1'">
      <el-upload
        class="col-12"
        ref="upload"
        accept=".yaml"
        action=""
        :multiple="false"
        :file-list="fileList"
        :auto-upload="false"
        :on-change="handleChange"
        :on-preview="handlePreview">
        <el-button slot="trigger" size="small" type="primary">{{$t('base.pleaseSelectFile')}}</el-button>
      </el-upload>
    </el-form-item>
    <el-form-item :label="$t('heat.template_data')" prop="templateData" class="is-required" v-if="createBySystemForm.templateType == 'custom1'"
    :rules="{type: 'required', trigger: 'blur change'}">
      <el-input type="textarea" :autosize="{minRows:2,maxRows:10}" class="col-12"
        v-model="createBySystemForm.templateData" auto-complete="off"></el-input>
    </el-form-item>

    <el-form-item label="" v-if="createBySystemForm.templateType == 'custom'">
      <el-row :gutter="20">
        <el-col :span="3">
          <ul class="custom-ttpl-ul">
            <template v-for="(menu, index) in nodeTypeOptions">
              <li class="custom-ttpl-li"
                :id="menu.id"
                :type="menu.type"
                :draggable="true"
                @dragstart="topoFlowDragStart($event)">
                {{menu.name}}
              </li>
            </template>
          </ul>
        </el-col>
        <el-col :span="21">
          <el-form :inline="true" class="form-inline">
            <!-- <el-form-item label="资源类型" size="small">
              <el-select class="col-2" v-model="createBySystemForm.nodeType" clearable>
                <el-option v-for="item in nodeTypeOptions" :key="item.id" :label="item.name" :value="item.type"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="addTopoFlowNode" type="primary" size="small">添加</el-button>
            </el-form-item> -->
            <el-form-item>
              <el-button type="primary" icon='fa-remove' @click="clearTopoCanvas" size="small">清空模板</el-button>
            </el-form-item>
          </el-form>
          <div class="divider clearfix"></div>
          <div ref="topoflow" id="topoflowDiv" @drop="dropSelectedTopoNode($event)" @dragover="dragoverSelectedTopoNode($event)"></div>
        </el-col>
      </el-row>
    </el-form-item>
  </el-form>
  <div class="me-form-footer">
    <el-button @click="cancel">{{this.$t("lang.cancel")}}</el-button>
    <el-button @click="nextStep" type="primary">{{this.$t("lang.nextStep")}}</el-button>
  </div>
  </div>
</template>
<script>
import yaml from "js-yaml";
Vue.use(yaml);
import * as d3 from "d3";
import TopoFlow from "./topoFlow/topoflow";
export default {
  name: "CreateBySystemStepOne",
  data() {
    return {
      createBySystemForm: {
        templateType:"system",
        templateData:"",
        nodeType:""
      },
      template_yaml:"",
      templateContent:{},
      fileList: [],
      rules: {
        templateData: [
          {type: 'required'}
        ]
      },
      loading: false,
      templateList: [],
      multipleSelection: [],
      resTypeRender: Vue.resourceTypeFormatter,
      topoImageRender: Vue.topoImageFormatter,
      topoFlow:null,
      nodeTypeOptions:[],
      mouseX:0,
      mouseY:0
    }
  },
  mounted() {
    let self = this;
    self.getSystemTemplateData();
    // self.getTopoFlowNodeTypeList();
  },
  methods: {
    radioChange(value) {
      // this.$emit("templateTypeChange", value);
      this.multipleSelection = [];
      this.templateContent = "";
      this.template_yaml = "";
      if (value == "custom") {
        this.initCustomTopoFlow();
        this.getTopoFlowNodeTypeList();
      }
    },
    async getSystemTemplateData() {
      let self = this;
      self.loading = true;
      try {
        let response = await this.$ajax({
          type: 'get',
          url: "api/heat/v1/" + this.$cookie.get("pid") + "/systemtemplate"
          // url: "api/heat/v1/systemtemplate"
        });
        self.loading = false;
        let dataList = response.template;
        let language = this.$cookie.get("defaultLanguage");
        if (language == "en") {
          let newDataList = [];
          for (let i = 0; i < dataList.length; i++) {
            let data = dataList[i];
            data.name = data.name_en;
            data.description = data.description_en;
            newDataList.push(data);
          }
          self.templateList = newDataList;
        } else {
          self.templateList = dataList;
        }
        self.total = dataList.length;
      } catch (data) {
        self.loading = false;
      }
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
            self.nodeTypeOptions.push({
              id:data.id,
              name:self.resTypeRender(data.type),
              type:data.type
            });
          });
        }
      } catch (data) {
        self.loading = false;
      }
    },
    rowClick(row) {
      this.$refs.table.toggleRowSelection(row, true);

      try {
        this.template_yaml = row.template;
        let templateYaml = yaml.safeLoad(row.template);
        this.templateContent = templateYaml;
      } catch (e) {
        this.$message.error(this.$t('heat.templateFormatterError'));
      }
      this.getTemplateDetail(row.resource);
    },
    async getTemplateDetail(resource) {
      let self = this;
      let node = [];
      let link = [];
      let resources = resource;
      resources.forEach(function (item, index) {
        let type = self.resTypeRender(item.type);
        node.push({
          id: item.id,
          name: type,
          type: item.type
        });
        if (item.requires) {
          if (item.requires.indexOf(",") >= 0) {
            let reqList = item.requires.split(",");
            for (let i = 0; i < reqList.length; i++) {
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
      this.initTopo(node, link);
    },
    initTopo(nodes, links) {
      let self = this;
      d3.select(this.$refs.topo.$el).select("svg").remove();

      let width = this.$refs.topo.$el.offsetWidth-30;
      let height = 400;

      let svg1 = d3.select(this.$refs.topo.$el)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
      let svg = svg1.append("g");
      let simulation = d3.forceSimulation(nodes) //指定节点数组
        .force("link", d3.forceLink(links).id(function (d) { return d.id; }).distance(80)) //指定连线数组
        .force("charge", d3.forceManyBody().strength(-400)) //相互之间的作用力
        .force("center", d3.forceCenter(width/3, height/2 - 30));

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
        // .on("click", function (d) {
        //   self.showNodeDetail(d);
        // })
        .call(drag); //使得节点能够拖动
      //缩放
      svg1.call(d3.zoom()
        .scaleExtent([1/4, 4])
        .on("zoom", zoomed));
      function zoomed() {
        svg.attr("transform", d3.event.transform)
      }
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
      svgNodes.append("text")
        .style("fill", "black")
        .attr("dx", 22)
        .attr("dy", 8)
        .text(function(d) {
          return d.name;
        });

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
    onRefresh() {
      this.getSystemTemplateData();
    },
    handleSelectionChange(val) {
      val.forEach((row, index) => {
        if (index === val.length - 1) return;
        this.$refs.table.toggleRowSelection(row, false);
      });
      this.multipleSelection = val;
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-1);
      let fielName = file.name;
      this.createBySystemForm.templateData = "";
      let suffix = fielName.substring(fielName.lastIndexOf("."), fielName.length);
      if (suffix != ".yaml") {
        this.$message.error(Vue.$t('heat.selectyaml'));
        this.fileList = [];
        this.$refs.upload.clearFiles();
        return false;
      }
      try {
        let fr = new FileReader();
        fr.onload = (e) => {
          this.createBySystemForm.templateData = fr.result;
          let doc = yaml.safeLoad(fr.result);
          this.templateContent = doc;
        };
        fr.readAsText(file.raw, 'utf8');
      } catch (e) {
        this.$message.error(this.$t('heat.templateFormatterError'));
      }
    },
    handlePreview(file) {
      try {
        let fr = new FileReader();
        fr.onload = (e) => {
          this.createBySystemForm.templateData = fr.result;
          let doc = yaml.safeLoad(fr.result);
          this.templateContent = doc;
        };
        fr.readAsText(file.raw, 'utf8');
      } catch (e) {
        this.$message.error(this.$t('heat.templateFormatterError'));
      }
    },
    // 初始化拖拽Drag
    initCustomTopoFlow() {
      let self = this;
      let config = {
        eln: "#" + self.$refs.topoflow.id,
        // data: data,
        width:self.$refs.topoflow.offsetWidth-30 + "px",
        height: '400px',
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
        },
        onClearActiveElement: () => {
        },
        onNodeContextMenuRender: (nodeInfo) => {
        },
        contextmenuClick: (node, action) => {
        },
        onChange: data => {
        }
      };

      // 初始化
      self.topoFlow = new TopoFlow(config);
      self.topoFlow.init();
    },
    // 开始拖拽
    topoFlowDragStart(event) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text", event.target.type);
      this.mouseX = event.offsetX || event.layerX;
      this.mouseY = event.offsetY || event.layerY;
      return true;
    },
    dropSelectedTopoNode(event) {
      event.preventDefault();
      let nodeType = event.dataTransfer.getData("text");

      let svgX = this.$refs.topoflow.offsetLeft;
      let svgY = this.$refs.topoflow.offsetTop;
      let x = event.pageX - this.mouseX - svgX;
      let y = event.pageY - this.mouseY - svgY;
      this.addTopoFlowNode(nodeType, x, y);
    },
    dragoverSelectedTopoNode(event) {
      event.preventDefault();
    },
    addTopoFlowNode(nodeType, x, y) {
      let self = this;
      self.topoFlow.addNode({
          type: "newNode",
          x: 100,
          y: 100,
          config: {
            name:nodeType,
            height:"40",
            width:"40",
            type: nodeType
          }
        });
    },
    clearTopoCanvas() {
      let self = this;
      self.$confirm(Vue.$t('heat.clearAllConfirmMsg'), Vue.$t('base.confirm1'), {
        confirmButtonText:this.$t('lang.confirm'),
        cancelButtonText:this.$t('lang.cancel'),
        type:'warning'
      }).then(() => {
        self.topoFlow.reset();
        }).catch(() => {
      });
    },
    nextStep() {
      this.$refs.createBySystemForm.validate((valid) => {
        let self = this;
        if (valid) {
          if (self.createBySystemForm.templateType == "system") { // 系统模板表单校验
            if (self.multipleSelection.length == 0) {
              self.$message.error(this.$t('heat.selecteTemplateError'));
              return false;
            } else {
              let param = {};
              param.template_yaml = this.template_yaml;
              param.templateContent = self.templateContent;
              self.$emit("stepOneDone", param);
            }
          } else { // 自定义模板表单校验
            this.$refs.createBySystemForm.validate(function (isValided) {
              if (isValided) {
                // YAML文件格式验证
                let yamlValidate = true;
                try {
                  self.template_yaml = self.createBySystemForm.templateData;
                  let templateYaml = yaml.safeLoad(self.createBySystemForm.templateData);
                  self.templateContent = templateYaml;
                  if (typeof self.templateContent != "object") {
                    yamlValidate = false;
                  } else {
                    let keyList = Object.keys(self.templateContent);
                    if ((keyList.includes("HeatTemplateFormatVersion") || keyList.includes("heat_template_version") ||
                      keyList.includes("AWSTemplateFormatVersion")) && keyList.includes("resources")) {
                      yamlValidate = true;
                    } else {
                      yamlValidate = false;
                    }
                  }
                } catch (e) {
                  console.log(e);
                  yamlValidate = false;
                }
                if (!yamlValidate) {
                  self.$message.error(self.$t('heat.templateFormatterError'));
                  return false;
                }
                let param = {};
                param.template_yaml = self.template_yaml;
                param.templateContent = self.templateContent;
                self.$emit("stepOneDone", param);
              }
            });
          }
        } else {
          return false;
        }
      });
    },
    cancel() {
      this.$emit("cancel");
    }
  }
}

</script>
<style scoped>

</style>
