<template>
  <div id="netTopoDiv">
  <el-form :inline="true" :model="formInline" class="form-inline">
    <el-form-item  label="项目">
      <el-select v-model="project" size="small">
        <el-option label="所有" value="0"></el-option>
        <el-option label="pro1" value="1"></el-option>
        <el-option label="pro2" value="2"></el-option>
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
  </div>
</template>
<script>
import topoCommon from '../../utils/topoCommon.js'
  export default {
    name: "topo",
    data() {
      return {
        formInline:{
          project:"1"
        }
      };
    },
    mounted() {
      let topoEle = this.$refs.topo;
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
      $("#contextMenu a").click(function() {
        alert($(this).text());
      });
      stage.click(function() {
        $("#contextMenu").hide();
      });
      for (var r = 0; r < 4; r++) {
          var rN = {
          type:"subnet",
          id:"net" + r,
          pId:"",
          x:100 + r * 50,
          y:200,
          name:"Net",
          statusIcon:"",
          tips:[{text:"名称", value:"网络名", unit:""}]
        }
        var rootNode = tc.addNode(rN);
      }
      for (var i = 0; i < 4; i++) {
        var rN1 = {
          type:"subnet",
          id:"router" + i,
          pId:"net" + i,
          x:100 + i * 60,
          y:300,
          name:"Router",
          statusIcon:"",
          tips:[{text:"名称", value:"网络名", unit:""}]
        }
        var rootNode1 = tc.addNode(rN1);
        tc.addLinkToParentNode(rootNode1);
      }
      for (var j = 0; j < 4; j++) {
        var rN2 = {
          type:"subnet",
          id:"vm" + j,
          pId:"net" + j,
          x:100 + j * 100,
          y:400,
          name:"VM",
          statusIcon:"",
          tips:[{text:"名称", value:"网络名", unit:""}]
        }
        var rootNode2 = tc.addNode(rN2);
        tc.addLinkToParentNode(rootNode2);
      }
      for (var f = 0; f < 4; f++) {
        var rN3 = {
          type:"subnet",
          id:"firewall" + f,
          pId:"net" + f,
          x:100 + f * 80,
          y:350,
          name:"FireWall",
          statusIcon:"",
          tips:[{text:"名称", value:"网络名", unit:""}]
        }
        var rootNode3 = tc.addNode(rN3);
        tc.addLinkToParentNode(rootNode3);
      }
      for (var l = 0; l < 4; l++) {
        var rN4 = {
          type:"subnet",
          id:"lb" + l,
          pId:"net" + l,
          x:100 + l * 80,
          y:150,
          name:"LoadBalance",
          statusIcon:"",
          tips:[{text:"名称", value:"网络名", unit:""}]
        }
        var rootNode4 = tc.addNode(rN4);
        tc.addLinkToParentNode(rootNode4);
      }
      // var rN = {
      //   type:"subnet",
      //   id:"net",
      //   pId:"",
      //   name:"Region",
      //   statusIcon:"",
      //   tips:[{text:"名称", value:"网络名", unit:""}]
      //   }
      // var rootNode = tc.addNode('root', 'gray');

      // var icons = ['green', 'blue', 'red1', 'red2'];
      // for (var i=0; i<icons.length; i++) {
      //   var node = addNode('second_' + i, icons[i]);
      //   addLink(rootNode, node);
      //   if (i == 0 || i == icons.length - 1) {
      //     for (var j=0; j<4; j++) {
      //       var thirdNode = addNode('third_' + j, 'green');
      //       addLink(node, thirdNode);
      //       if (j == 3) {
      //         for (var k=0; k<4; k++) {
      //           var kNode = addNode('leaf_' + k, 'gray');
      //           addLink(thirdNode, kNode);
      //         }
      //       }
      //     }
      //   }
      // }

      // 树形布局
      scenevdc.doLayout(JTopo.layout.TreeLayout('down', 30, 107));
    },
    methods: {

    }
  };
</script>
