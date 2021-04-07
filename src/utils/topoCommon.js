/**
 * Jtopo的一些公共方法
 */
export default function topoCommon(scene, stage) {
  var nodeTypeData = {
    root: "root", //"根节点",
    vdc: "vdc",
    net: "network",
    host: "host",
    vm: "vm",
    subnet: "ipSubnet",
    volume: "volumes",
    org: "org_pro",
    center: "virtualCenter",
    cluster: "cluster",
    stor: "storage"
  }
  var topoImg = {
    root: "6",
    vdc: "3",
    net: "3",
    host: "4",
    vm: "1",
    subnet: "subnet",
    volume: "volume",
    org: "2",
    center: "5",
    cluster: "2",
    stor: "3"
  }
  var miniIcon = false;
  var layout = "";
  var normalwidth = 50;
  var normalheight = 30;
  var miniwidth = 10;
  var miniheight = 10;
  var layoutSmallWidth = 2;
  var layoutSmallHeight = 200;
  var layoutBigWidth = 45;
  var layoutBigHeight = 200;
  var TOPOROOTNODEID = "root";
  var showStyle;
  var addNode = function(obj, type, setradius) {
    var id = obj.id;
    var oNode = getNodeById(id);
    var node = {};
    if (oNode && oNode.length > 0) {
      node = oNode[0];
    } else {
      node = new JTopo.Node();
      showStyle = $("#showStyle").val() || "1";
      if (showStyle && showStyle == "2") { //圆形
        var radius = 200;
        if (setradius) {
          radius = setradius;
        }
        node.layout = { type: 'circle', radius: radius };
      } else if (showStyle && showStyle == "1") { //树形
        node.layout = { type: 'tree' };
      }
      var statusIcon = "";
      if (obj.statusIcon && obj.statusIcon != "") {
        statusIcon = "_" + obj.statusIcon;
      }
      node.statusIcon = statusIcon;
      //node.layout = {type:'circle',radius:550};
      var img = (miniIcon ? topoImg[obj.type] : obj.type) + statusIcon;
      var imgSrc = "./static/img/topo/topoIcon/" + img + ".png";
      node.setImage(imgSrc, false);
      node.miniIcon = miniIcon;
      node.fontColor = '252,252,252';
      var width = miniIcon ? miniwidth : normalwidth;
      var height = miniIcon ? miniheight : normalheight;
      node.setSize(width, height);
      node.radius = 5;
      node.showChildNode = obj.showChildNode || true;
      if (obj.children) {
        node.children = obj.children;
      } else {
        node.children = [];
      }
      node.borderRadius = 2;
      if (!miniIcon) {
        node.text = obj.name;
      }
      node.name = obj.name;
      if (obj.x && obj.y) {
        node.setLocation(obj.x, obj.y);
      } else {
        //node.setLocation($(window).width()/2,$(window).height()/2);
      }
      node.id = obj.id;
      if (obj.pId && (obj.pId == "" || obj.pId.length == 0)) return;
      node.pId = obj.pId;
      node.tips = obj.tips;
      node.type = obj.type;
      node.showSelected = true;
      scene.add(node);
      node.alpha = 0;
      if (obj.statusIcon && obj.statusIcon == "red") {
        JTopo.Animate.stepByStep(node, { alpha: 1 }, 500, true).start();
      } else if (obj.statusIcon && obj.statusIcon == "yellow") {
        JTopo.Animate.stepByStep(node, { alpha: 1 }, 1000, true).start();
      } else {
        JTopo.Animate.stepByStep(node, { alpha: 1 }, 1000, false).start();
      }
    }
    node.addEventListener('mouseover', function(e) {
      var tips = this.tips;
      this.text = this.name;
      if (tips && tips.length != 0) {
        $("#topoTooltip").show();
        $("#topoTooltip ul").html("");
        $("#topoTooltip h5").html(nodeTypeData[this.type]);
        for (var i in tips) {
          var text = tips[i].text;
          var value = tips[i].value;
          if (typeof value == "undefined" || value == null) {
            value = "";
          }
          var unit = tips[i].unit;
          var li = $("<li>" + text + ":<span>" + value + " " + unit + "</span></li>");
          $("#topoTooltip ul").append(li);
        }
        locationTips(e);
      }
      var nodePids = this.pId;
      if (nodePids instanceof Array) {
        for (var j in nodePids) {
          addOneParentLink(this, nodePids[j], true);
        }
      }
    });
    node.mouseout(function() {
      var layoutStyle = $("#showStyle").val();
      if (miniIcon && layoutStyle != "4") { //小图标并且上下布局时才执行
        this.text = "";
      }
      $("#topoTooltip").hide();
      cleanLinks(this);
    });
    node.addEventListener('mousedrag', function(e) {
      if ($("#topoTooltip").is(":visible")) {
        locationTips(e);
      }
    });
    node.addEventListener('mouseup', function(e) {
      if (e.button == 2) {
        var top = e.pageY;
        var left = e.pageX;
        $("#contextMenu").css({
          top:top,
          left:left
        }).show();
      }
    });
    return node;
  }
  var locationTips = function(e) {
    var w = $("#topoTooltip").width();
    var h = $("#topoTooltip").height();
    var left = e.pageX - w / 2 - 10;
    var top = e.pageY - h - 25;
    if (left < 0) {
      left = 0;
    }
    if (top < 42) { //拓扑图菜单高度
      top = 42;
    }
    if ((left + w) > stage.width) {
      left = stage.width - w;
    }
    $("#topoTooltip").css("left", left);
    $("#topoTooltip").css("top", top);
  }
  var showHideChildrenNodes = function(node) {
    if (node.showChildNode) {
      removeChildrenNodes(node);
    } else {
      showChildrenNodes(node);
    }
    dolayout();
  }
  var removeChildrenNodes = function(node) {
    if (!node.children) return;
    node.showChildNode = false;
    var childrenNodes = node.ctopo_bubblinghildren;
    for (var i in childrenNodes) {
      var cnode = childrenNodes[i];
      delNode(cnode);
      removeChildrenNodes(cnode);
    }
  }
  var showChildrenNodes = function(node) {
    if (!node.children) return;
    node.showChildNode = true;
    var childrenNodes = node.children;
    node.children = [];
    for (var i in childrenNodes) {
      var cnode = childrenNodes[i];
      var newNode = addNode(cnode);
      addLink(node, newNode);
      node.children.push(newNode);
      showChildrenNodes(newNode);
    }
  }
  var getLinkByParentNode = function(node) {
    var links = scene.childs.filter(function(e) {
      return e instanceof JTopo.Link;
    });
    links = links.filter(function(e) {
      if (e.nodeA == null || e.nodeZ == null) return false;
      return e.nodeA.id == node.id;
    });
    return links;
  }
  var getLinkByChildNode = function(node) {
    var links = scene.childs.filter(function(e) {
      return e instanceof JTopo.Link;
    });
    links = links.filter(function(e) {
      if (e.nodeA == null || e.nodeZ == null) return false;
      return e.nodeZ.id == node.id;
    });
    return links;
  }
  var addLink = function(nodeA, nodeZ, type, temporary) {
    var olinks = checkLinkExist(nodeA.id, nodeZ.id);
    if (olinks.length == 0) {
      var link;
      if (type == "FlexionalLink") {
        link = new JTopo.FlexionalLink(nodeA, nodeZ); //二次折线
      } else if (type == "CurveLink") {
        link = new JTopo.CurveLink(nodeA, nodeZ); //弯曲
      } else if (type == "FoldLink") {
        link = new JTopo.FoldLink(nodeA, nodeZ); //折线
      } else {
        link = new JTopo.CurveLink(nodeA, nodeZ); //弯曲
        //link = new JTopo.Link(nodeA, nodeZ);//直线
      }
      link.strokeColor = '11,253,253';
      link.lineWidth = 1;
      link.temporary = temporary || false;
      scene.add(link);
      link.alpha = 0;
      JTopo.Animate.stepByStep(link, { alpha: 0.2 }, 1000, false).start();
      link.mouseover(function(e) {
        this.alpha = 1;
        this.shadow = true;
      });
      link.mouseout(function(e) {
        this.alpha = 0.2;
        this.shadow = false;
      });
      return link;
    }
  }
  var cleanLinks = function(node) {
    var links = getLinkByChildNode(node);
    for (var l = 0; l < links.length; l++) {
      if (links[l].temporary) {
        delNode(links[l]);
      }
    }
  }
  var addLinkToParentNode = function(node) {
    if (!node) return;
    var pId = node.pId;
    if (pId instanceof Array) {
      if (pId.length > 0) {
        addOneParentLink(node, pId[0]);
      }
    } else {
      addOneParentLink(node, pId)
    }
  }
  var addALLLinkToParentNodes = function(nodes) {
    if (!nodes || nodes.length == 0) return;
    for (var i in nodes) {
      var node = nodes[i];
      var pId = node.pId;
      if (pId instanceof Array) {
        for (var j in pId) {
          addOneParentLink(node, pId[j]);
        }
      } else {
        addOneParentLink(node, pId)
      }
    }
  }
  // var effect = JTopo.Effect.spring({
  //   //grivity : 9,
  //   spring: 0.1,
  //   friction: 0.2,
  //   minLength: 300
  // });
  var addOneParentLink = function(node, pid, temporary) {
    var r;
    var parentNode = getNodeById(pid);
    if (parentNode && parentNode.length != 0) {
      parentNode = parentNode[0];
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.push(node);
      r = addLink(parentNode, node, "", temporary);
    }
    return r;
  }
  var springLayout = function() {
    var nodes = getAllNodes();
    for (var i = 1; i < nodes.length; i++) {
      effect.addNode(nodes[i - 1], nodes[i]);
      effect.addNode(nodes[i], nodes[i - 1]);
    }
    effect.play();
    var links = getAllLinks();
    for (var l = 0; l < links.length; l++) {
      links[l].alpha = 0.1;
    }
  }
  var getNodeById = function(id) {
    var nodes = scene.childs.filter(function(e) {
      return e instanceof JTopo.Node;
    });
    nodes = nodes.filter(function(e) {
      if (!e.id || e.id == null) return false;
      return e.id == id;
    });
    return nodes;
  }
  var getAllNodes = function() {
    var nodes = scene.childs.filter(function(e) {
      return e instanceof JTopo.Node;
    });
    return nodes;
  }
  var getNodeByType = function(type) {
    var nodes = scene.childs.filter(function(e) {
      return e instanceof JTopo.Node;
    });
    nodes = nodes.filter(function(e) {
      if (!e.type || e.type == null) return false;
      return e.type == type;
    });
    return nodes;
  }
  var checkDisplay = function(refresh) {
    var nodes = getAllNodes();
    var iconStyle = $("#iconStyle").val();
    if (iconStyle == "1") { //小图标
      if (!$("#explainUl").is(":visible")) {
        $("#explainUl").show("slow");
      }
      miniIcon = true;
      if (refresh) {
        for (var i in nodes) {
          changeIcon(nodes[i]);
        }
        dolayout();
      }
    } else if (iconStyle == "2") {
      if ($("#explainUl").is(":visible")) {
        $("#explainUl").hide("slow");
      }
      miniIcon = false;
      if (refresh) {
        for (var j in nodes) {
          changeIcon(nodes[j]);
        }
        dolayout();
      }
    } else {
      if (scene.getDisplayedElements().length > 10) {
        miniIcon = true;
      } else {
        miniIcon = false;
      }
      for (var k in nodes) {
        changeIcon(nodes[k]);
      }
      dolayout();
    }
  }
  var changeIcon = function(node) {
    var img = (miniIcon ? topoImg[node.type] : node.type) + node.statusIcon;
    var imgSrc = "../../../images/topoIcon/" + img + ".png";
    var width = miniIcon ? miniwidth : normalwidth;
    var height = miniIcon ? miniheight : normalheight;
    if (node.miniIcon === miniIcon) return;
    // node.setImage(imgSrc, false);
    node.miniIcon = miniIcon;
    var text = miniIcon ? "" : node.name;
    node.text = text;
    JTopo.Animate.stepByStep(node, { width: width, height: height }, 1000, false).start();
  }
  var checkLinkExist = function(aId, zId) {
    var links = scene.childs.filter(function(e) {
      return e instanceof JTopo.Link;
    });
    links = links.filter(function(e) {
      if (e.nodeA == null || e.nodeZ == null) return false;
      return e.nodeA.id == aId && e.nodeZ.id == zId;
    });
    return links;
  }
  var getAllLinks = function() {
    var links = scene.childs.filter(function(e) {
      return e instanceof JTopo.Link;
    });
    return links;
  }
  var layoutNoLinkNode = function(rootNode) {
    var noLinkNodes = getAllNoLinkNode();
    var y = 700;
    var x = 20;
    for (var i in noLinkNodes) {
      var node = noLinkNodes[i];
      if (node.id == rootNode.id) {
        rootNode.setLocation(300, 300);
        continue;
      }
      delNode(node);
    }
  }
  var delNode = function(node) {
    var c = scene.childs;
    for (var i = 0; i < c.length; i++) {
      if (c[i] == node) {
        c = del(c, i);
      }
    }
    scene.childs = c;
    var sz = scene.zIndexMap;
    var arr = sz[node.zIndex];
    for (var j = 0; j < arr.length; j++) {
      if (arr[j] == node) {
        arr = del(arr, j);
      }
    }
    scene.zIndexMap[node.zIndex] = arr;
    delCallback(node, scene);
  }
  var delCallback = function(b, a) {
    b.outLinks && (b.outLinks.forEach(function(c) {
      c.nodeA === b && delNode(c)
    }), b.outLinks = null);
    b.inLinks && (b.inLinks.forEach(function(c) {
      c.nodeZ === b && delNode(c)
    }), b.inLinks = null)
  }

  var del = function(arr, i) {
    return arr.slice(0, i).concat(arr.slice(i + 1, arr.length));
  }
  var showNodesText = function(flag) { //true是show false是hide
    var nodes = getAllNodes();
    nodes.forEach(function(node) {
      if (flag) {
        node.text = node.name;
        node.textPosition = "Middle_Right";
      } else {
        if (!miniIcon) {
          node.text = node.name;
        } else {
          node.text = "";
        }
        node.textPosition = "Bottom_Center";
      }
    })
  }
  var dolayout = function() {
    var width = miniIcon ? layoutSmallWidth : layoutBigWidth;
    var height = miniIcon ? layoutSmallHeight : layoutBigHeight;
    var layoutStyle = $("#showStyle").val();
    if (layoutStyle == "3") { //自动布局
      springLayout();
      showNodesText(false);
    } else if (layoutStyle == "1") { //上下布局
      effect.stop();
      layout = JTopo.layout.TreeLayout("down", width, height);
      scene.doLayout(layout);
      showNodesText(false);
    } else if (layoutStyle == "4") { //左右布局
      effect.stop();
      layout = JTopo.layout.TreeLayout("right", width, height);
      scene.doLayout(layout);
      showNodesText(true);
    }
  }
  var doTreeLayout = function(node) {
    JTopo.layout.layoutNode(scene, node, true);
  }
  var reset = function() {
    scene.clear();
    scene.scaleX = 1;
    scene.scaleY = 1;
    //scene = new JTopo.Scene(stage);
    layout = "";
  }
  var getAllNoLinkNode = function() {
    var nodes = scene.childs.filter(function(e) {
      return e instanceof JTopo.Node;
    });
    nodes = nodes.filter(function(e) {
      return !checkNodeHaveLink(e);
    });
    return nodes;
  }
  var checkNodeHaveLink = function(node) {
    var links = scene.childs.filter(function(e) {
      return e instanceof JTopo.Link;
    });
    links = links.filter(function(e) {
      return e.nodeA.id == node.id || e.nodeZ.id == node.id;
    });
    return links.length > 0;
  }
  var toolbar = function(stage) {
    var toolbarDiv = $('<div class="topo_header">' +
      '<div class="topo_btn">' +
      '<div class="pull-left">' +
      '</div>' +
      '<div class="pull-right">' +
      '</div>' +
      '</div>' +
      '</div>');
    $("#topoContent").prepend(toolbarDiv);
    var fullScreenBtn = $('<div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button group">' +
      '<div class="btn-group">' +
      '<div class="btn btn-default btn-sm" title="' + "fullScreen" + '">' +
      '<div class="topo_icon toolbar_max"></div>' +
      '</div>' +
      '</div>' +
      '</div>');
    fullScreenBtn.click(function() {
      runPrefixMethod(stage.canvas, "RequestFullScreen");
    });
    var resizeCanvas = function() {
      stage.canvas.width = $(window).width();
      stage.canvas.height = $(window).height();
    }
    $(window).resize(resizeCanvas);

    $("#topoContent .pull-right").append(fullScreenBtn);
    var toolBtn = $('<div class="btn-toolbar" role="toolbar"' +
      'aria-label="Toolbar with button group">' +
      '<div class="btn-group">' +
      '<select id="showStyle" style="margin-right:5px;height:26px;" class="btn btn-default btn-sm">' +
      '<option value="4">' + "leftRightLayout" + '</option>' +
      '<option value="1">' + "upDownLayout" + '</option>' +
      '<option value="3">' + "autoLayout" + '</option>' +
      '</select>' +
      '<select id="iconStyle" style="margin-right:5px;height:26px;" class="btn btn-default btn-sm">' +
      '<option value="1">' + "miniIcon" + '</option>' +
      '<option value="2">' + "bigIcon" + '</option>' +
      //'<option value="3">' + "auto" + '</option>'+
      '</select>' +
      '<div class="btn btn-default btn-sm" title="' + "zoomOut" + '" id="zoomOutButton">' +
      '<div class="topo_icon toolbar_zoomin"></div>' +
      '</div>' +
      '<div class="btn btn-default btn-sm" title="' + "zoomIn" + '" id="zoomInButton">' +
      '<div class="topo_icon toolbar_zoomout"></div>' +
      '</div>' +
      //'<div class="btn btn-default btn-sm" title="' + "movecenter" +'" id="centerButton">'+
      //'<div class="topo_icon toolbar_middle"></div>'+
      //'</div>'+
      ' <div class="btn btn-default btn-sm" title="' + "wholeTemlate" + '" id="centerButton">' +
      '           <div class="topo_icon toolbar_global"></div>' +
      '         </div> ' +
      '         <div class="btn btn-default btn-sm" title="' + "reset" + '" id="resetButton">' +
      '            <div class="topo_icon toolbar_rest"></div>' +
      '         </div> ' +
      '<div class="btn btn-default btn-sm" title="' + "exportImg" + '" id="exportPng">' +
      '<div class="topo_icon toolbar_print"></div>' +
      '</div>' +
      '</div>' +
      '<div style="display: inline-block; vertical-align: middle; width: 170px; margin-left: 8px">' +
      '<div class="input-group">' +
      '<input class="form-control" placeholder="' + "nodeName" + '"' +
      'type="text" id="findText"> <span class="input-group-btn">' +
      '<div class="btn btn-default btn-sm" type="button" id="topoSearch">' +
      '<div class="topo_icon toolbar_search"></div>' +
      '</div>' +
      '</span>' +
      '</div>' +
      '</div>' +
      '</div>');
    $("#topoContent .pull-left").append(toolBtn);
    $('#zoomOutButton').click(function() {
      stage.zoomOut();
    });
    $('#zoomInButton').click(function() {
      stage.zoomIn();
    });
    $('#centerButton').click(function() {
      stage.centerAndZoom();
    });
    $('#resetButton').click(function() {
      scene.scaleX = 1;
      scene.scaleY = 1;
    });
    $("#exportPng").click(function() {
      stage.saveImageInfo();
    });
    $("#iconStyle").change(function() {
      scene.scaleX = 1;
      scene.scaleY = 1;
      checkDisplay(true);
    });
    $("#showStyle").change(function() {
      dolayout();
    });
    $("#topoSearch").click(function() {
      var text = $('#findText').val().trim();
      if (text == "") return;
      var nodes = scene.childs.filter(function(e) {
        return e instanceof JTopo.Node;
      });
      nodes = nodes.filter(function(e) {
        if (e.name == null) return false;
        return e.name.indexOf(text) != -1;
      });

      if (nodes.length > 0) {
        var node = nodes[0];
        var location = node.getCenterLocation();
        // 查询到的节点居中显示
        stage.setCenter(location.x, location.y);
        // 闪烁几下
        for (var i in nodes) {
          nodeFlash(nodes[i], 5);
        }
      }
    });
    window.onkeydown = function(ev) {
      var e = ev || event;
      var key = e.keyCode || e.which || e.charCode;
      if (key == 13) {
        $("#topoSearch").click();
      }
    };
  }
  var nodeShark = function(node, s) {
    JTopo.Animate.stepByStep(node, { alpha: 0 }, s, true).start();
  }
  var nodeFlash = function(node, n) {
    if (n == 0) {
      node.selected = false;
      node.text = node.text == "" ? node.name : "";
      return;
    };
    node.selected = !node.selected;
    node.text = node.text == "" ? node.name : "";
    setTimeout(function() {
      nodeFlash(node, n - 1);
    }, 300);
  }
  var platformRender = function(value) {
    if (value == 0) {
      return "virtaulPlatform";
    } else if (value == 1) {
      return "openstackPlatform";
    } else if (value == 2) {
      return "publicCloud";
    } else {
      return value;
    }
  }
  var loadExplainUl = function(types, contentId) {
    var content = $("#" + contentId);
    if (types && content.length > 0) {
      for (var i in types) {
        var image = "../../../images/topoIcon/" + topoImg[types[i]] + ".png";
        var li = $("<li style='cursor:pointer' type='" + types[i] + "'><img src=" + image + ">" + nodeTypeData[types[i]] + "</li>")
        li.mouseover(function() {
          highlight($(this).attr("type"));
        });
        li.mouseout(function() {
          highlightStop($(this).attr("type"));
        });
        content.append(li);
      }
    }
  }
  var highlight = function(type) {
    var nodes = getNodeByType(type);
    for (var i in nodes) {
      nodes[i].selected = true;
      nodes[i].text = nodes[i].name;
    }
  }
  var highlightStop = function(type) {
    var nodes = getNodeByType(type);
    var layoutStyle = $("#showStyle").val();
    for (var i in nodes) {
      nodes[i].selected = false;
      if (layoutStyle != "4") {
        nodes[i].text = "";
      }
    }
  }
  var showLoaddingMsg = function(text) {
    var r = noty({ text: text, layout: "topRight", timeout: false, dismissQueue: false });
    return r;
  }
  var vmStatusRender = function(state) {
    var text;
    color = "";
    if ("0" == state) {
      text = "<span class='label label-success'>" + 'openVm' + "</span>";
      color = "";
    } else if ("1" == state) {
      text = "<span class='label label-default'>" + 'closeVm' + "</span>";
      color = "grey";
    } else if ("2" == state) {
      text = "<span class='label label-warning'>" + 'pauseVm' + "</span>";
      color = "grey";
    } else if ("3" == state) {
      text = "<img src='../../../js/loadmask/images/loading.gif'></img>" + 'busyVm';
      color = "yellow";
    } else if ("4" == state) {
      text = "<span class='label label-warning'>" + 'errorVm' + "</span>";
      color = "yellow";
    } else if ("5" == state) {
      text = "<font color='red'>" + 'invalidVm' + "</font>";
      color = "red";
    } else if ("6" == state) {
      text = "<img src='../../../js/loadmask/images/loading.gif'></img>" + 'creatingVm';
      color = "grey";
    } else if ("7" == state) {
      text = "<img src='../../../js/loadmask/images/loading.gif'></img>" + 'busyVm';
      color = "yellow";
    } else if ("8" == state) {
      text = "<img src='../../../js/loadmask/images/loading.gif'></img>" + 'insatllingVmtools';
      color = "yellow";
    } else if ("9" == state) {
      text = "<span class='label label-warning'>" + "deleted" + "</span>";
      color = "grey";
    } else if ("10" == state) {
      text = "<span class='label label-warning'>" + "lostConnection" + "</span>";
      color = "grey";
    } else if ("11" == state) {
      text = "<span class='label label-warning'>" + "qqqrtz" + "</span>";
      color = "grey";
    } else if ("12" == state) {
      text = "<span class='label label-default'>" + "pause" + "</span>";
      color = "grey";
    } else {
      text = "--";
    }
    return { text: text, color: color };
  }
  return {
    vmStatusRender: vmStatusRender,
    nodetype: nodeTypeData,
    topoImg: topoImg,
    rootId: TOPOROOTNODEID,
    addNode: addNode,
    addLink: addLink,
    checkLinkExist: checkLinkExist,
    getNodeById: getNodeById,
    addOneParentLink: addOneParentLink,
    addLinkToParentNode: addLinkToParentNode,
    toolbar: toolbar,
    platformRender: platformRender,
    showLoaddingMsg: showLoaddingMsg,
    layoutNoLinkNode: layoutNoLinkNode,
    getNodeByType: getNodeByType,
    dolayout: dolayout,
    reset: reset,
    checkDisplay: checkDisplay,
    doTreeLayout: doTreeLayout,
    loadExplainUl: loadExplainUl,
    springLayout: springLayout,
    addALLLinkToParentNodes: addALLLinkToParentNodes,
    delNode: delNode
  }
};
