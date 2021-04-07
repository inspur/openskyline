<template>
  <div id="topoContent">
    <el-form :inline="true" v-model="formInline" class="form-inline">
    <el-form-item  label="资源域">
      <el-select v-model="volumeType" size="small">
        <el-option label="所有" value="0"></el-option>
        <el-option label="Region1" value="1"></el-option>
        <el-option label="Region2" value="2"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item  label="项目">
      <el-select v-model="volumeType" size="small">
        <el-option label="所有" value="0"></el-option>
        <el-option label="AZ1" value="1"></el-option>
        <el-option label="AZ2" value="2"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item  label="节点名称">
      <el-input  placeholder="节点名称" size="small"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon='fa-search'  size="small">查询</el-button>
    </el-form-item>
  </el-form>
    <canvas width="850" height="550" style="background-color: rgb(238, 238, 238); border: 1px solid #f1e9e9; cursor: default;" ref="topo"></canvas>
    <ul id="contextMenu" style="display:none;position:fixed;background-color:white;width:80px;border:1px solid grey;list-style:none">
      <li><a style="padding:10px;cursor:pointer;border-bottom:1px solid grey;display:block">删除</a></li>
      <li><a style="padding:10px;cursor:pointer;display:block">禁用</a></li>
    </ul>
    <div class="topo_bubbling" id="topoTooltip">
    <div class="bubb">
      <h5 style="color: white; font-weight: bold;"></h5>
      <ul>
      </ul>
      <div class="bubb_arrow"></div>
    </div>
  </div>
  <transition name="slide-right" mode="out-in">
    <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
      <panel style="height: 100%">
        <div slot="title" class="clearfix" >
         <el-button type="text" icon="fa-arrow-left" @click="onBack">返回</el-button>
        </div>
        <div>
          <instance-detail></instance-detail>
        </div>
      </panel>
    </div>
  </transition>
  </div>
</template>
<script>
import topoCommon from '../../utils/topoCommon.js'
import InstanceDetail from '../calculate-storage/instance/InstanceDetail';
  export default {
    name: "topo",
    components: {
      InstanceDetail
    },
    data() {
      return {
        detailFlag:false
      };
    },
    mounted() {
      let topoEle = this.$refs.topo;
      let _this = this;
      topoEle.width = $(topoEle).parent().width();
      // topoEle.height = $(window).height();
      let stage = new JTopo.Stage(topoEle);
      // stage.width = $(window).width();
      // stage.height = $(window).height()-20;
      stage.wheelZoom = 1.1;
    //  stage.eagleEye.visible = true;
      let scenevdc = new JTopo.Scene(stage);
      scenevdc.alpha = 1;
      scenevdc.setBackground("./static/img/topo/topobg_2.jpg");
      let tc = topoCommon(scenevdc, stage);
      // tc.toolbar(stage);
      // tc.loadExplainUl(["center", "cluster", "host", "stor", "vm"], "explainUl");

      function addLink(nodeA, nodeZ) {
        var link = new JTopo.FlexionalLink(nodeA, nodeZ);
        link.strokeColor = '204,204,204';
        link.lineWidth = 1;
        scenevdc.add(link);
        return link;
      }
      $("#contextMenu a").click(function() {
        alert($(this).text());
      });
      stage.click(function() {
        $("#contextMenu").hide();
      });
      var r = {
        type:"subnet",
        id:"root",
        pId:"",
        name:"资源域",
        statusIcon:"",
        tips:[{text:"名称", value:"网络名", unit:""}]
        }
      var rootNode = tc.addNode(r);
      rootNode.dbclick(function(e) {
        _this.showDetail();
      });
      var icons = ['green', 'blue', 'red1', 'red2'];
      for (var i=0; i<icons.length; i++) {
        var net = {
        type:"subnet",
        id:"net" + i,
        pId:"root",
        name:"项目" + i,
        statusIcon:"",
        tips:[{text:"名称", value:"网络名", unit:""}]
        }
        var node = tc.addNode(net);
        tc.addLinkToParentNode(node);
        // addLink(rootNode, node);
        if (i == 0 || i == icons.length - 1) {
          for (var j=0; j<4; j++) {
            var host = {
            type:"subnet",
            id:"host" + j,
            pId:"net" + i,
            name:"云主机" + j,
            statusIcon:j == 2 ? "yellow" : "",
            tips:[{text:"名称", value:"网络名", unit:""}]
            }
            var thirdNode = tc.addNode(host);
            thirdNode.dbclick(function(e) {
              _this.showDetail();
            });
            tc.addLinkToParentNode(thirdNode);
          }
        }
      }

      // 树形布局
      scenevdc.doLayout(JTopo.layout.TreeLayout('down', 30, 107));
    },
    methods: {
    showDetail() {
      this.detailFlag = true;
    },
    onBack() {
      this.detailFlag = false;
    }
    }
  };
</script>
<style scoped>
.topo_bubbling {
  position: fixed;
  display: none;
}

.bubb {
  position: relative;
  border: 1px solid #d6f0ff;
  border-radius: 8px;
  -webkit-border-radius: 8px;
  -moz-border-radius: 8px;
  padding: 6px;
  background: url('../../../static/img/topo/topoIcon/bubb_bg.png') repeat-x 0 0;
  width: 320px;
  height: auto;
}

.bubb ul li {
  font-size: 12px;
  font-weight: normal;
  color: #FFFFFF;
  line-height: 1.6;
  /* text-shadow: 0 1px 0 rgba(255, 255, 255, 1); */
}

.bubb ul li span {
  font-size: 12px;
  font-weight: bold;
  padding-left: 8px;
  color: #FFFFFF;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 1);
}

.bubb_arrow {
  position: absolute;
  width: 20px;
  height: 10px;
  bottom: -10px;
  left: 50%;
  background: url('../../../static/img/topo/topoIcon/bubb_arrow.png') no-repeat 0 0;
}
</style>