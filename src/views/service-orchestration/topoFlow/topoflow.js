import * as d3 from 'd3';

import {Message} from 'element-ui';
import VueCookie from 'vue-cookie';
import heatCn from '../../../locale/zh-cn/serviceOrchestration';
import heatEn from '../../../locale/en/serviceOrchestration';

import Contextmenu from './lib/contextmenu';
import mathLib from './lib/math';
// import genUUID from './lib/common';

import './styles/index.css';

export default class Flow {
    // 设置默认值
    constructor(config) {
        this.config = config; // 初始化配置参数

        this.Nodes = {}; // 当前画布中的节点信息(实时更新)
        this.Links = {}; // 当前画布的线条信息
        this.sourceNode = {}; // 源节点信息
        this.selectedElement = null; //当前选中节点的ID
        this.optionGroup = null;  // 操作按钮元素
        this.currentMouseXY = {};
        this.isSetData = false; // 是否是回填数据模式
        this.rwaElnContainer = document.querySelector(this.config.eln);

        this.rwaElnContainer.classList.add('topoflow-container');

        if (this.config.hasOwnProperty('onNodeContextMenuRender')) {
            this.initContextMenu();
        }

        // 初始化画布
        this.svg = d3
            .select(config.eln)
            .style('outline', 'none')
            .attr('tabIndex', '0')
            .append('svg')
            .attr('id', `svg_${mathLib.genUUID()}`)
            .attr('width', this.config.width)
            .attr('height', this.config.height);
        this.svg.append('svg:image')
            .attr('class', 'image')
            .attr('xlink:href', './static/topoImages/background.jpg')
            .attr('x', '0')
            .attr('y', '0');
        // 禁止拖拽画布，以防止drop节点时定位不准的bug
        let svgDragEvent = d3.drag()
                .on('start', null)
                .on('drag', null)
                .on('end', null);
        this.svg.call(svgDragEvent);

        // 初始化路径组信息
        this.pathGroup = this.svg.append('svg:g').attr('class', 'data-flow-path-group');
        this.nodeGroup = this.svg.append('svg:g').attr('class', 'data-flow-node-group');
    }

    // 组件初始化方法调用
    init() {
        this.initDefs();
        this.initSvgEvent();
    }

    initContextMenu() {
        // 初始化右键菜单
        this.contextmenu = new Contextmenu({
            render: this.config.onNodeContextMenuRender.bind(this),
            container: this.rwaElnContainer,
            onClick: (nodeInfo, iteminfo) => {
                if (this.config.contextmenuClick) {
                    this.config.contextmenuClick.call(this, nodeInfo, iteminfo);
                }
            }
        });
    }

    // 当图形发生变更的时候进行图形的变化
    onDataChange(type) {
        if (!this.isSetData && this.config.hasOwnProperty('onDataChange')) {
            this.config.onDataChange(type);
        }
    }

    // 初始化定义元素，如箭头
    initDefs() {
        let defs = this.svg.append('svg:defs').attr('id', 'arrow-defs');

        // 自定义
        if (this.config.hasOwnProperty('linkTemplate') && this.config.linkTemplate.hasOwnProperty('defs')) {
            this.config.linkTemplate.defs(defs);
        } else {
            defs.append('svg:marker')
                .attr('id', 'end-arrow')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 6)
                .attr('markerWidth', 5)
                .attr('markerHeight', 5)
                .attr('orient', 'auto')
                .append('svg:path')
                .attr('d', 'M0,-5L10,0L0,5');
        }

        this.dragLine = this.pathGroup.append('svg:path');
        if (this.config.hasOwnProperty('linkTemplate') && this.config.linkTemplate.hasOwnProperty('dragLink')) {
            this.config.linkTemplate.dragLink(this.dragLine)
        } else {
            this.dragLine.style('fill', 'white').attr('class', 'dragline hide').attr('d', 'M0,0L0,0');
            // this.dragLine.style('fill', 'white').style('marker-end', 'url(#end-arrow)').attr('class', 'dragline hide').attr('d', 'M0,0L0,0');
        }
    }

    // 重置，将会删掉所有的线条和节点
    reset() {
        if (this.rwaElnContainer !== null) {
            let isIE = false;
            if (!!window.ActiveXObject || "ActiveXObject" in window ||
                    (/Trident\/7\./).test(navigator.userAgent)) {
                isIE = true;
            }

            let pathGroup = this.rwaElnContainer.querySelector('.data-flow-path-group');
            if (pathGroup) {
                if (isIE) {
                    $(pathGroup).empty();
                } else {
                    pathGroup.innerHTML = '';
                }
            }
            let nodeGroup = this.rwaElnContainer.querySelector('.data-flow-node-group');
            if (nodeGroup) {
                if (isIE) {
                    $(nodeGroup).empty();
                } else {
                    nodeGroup.innerHTML = '';
                }
            }
            let arrowDefsDom = this.rwaElnContainer.querySelector('#arrow-defs');
            if (arrowDefsDom) {
                // if (isIE) {
                //     $(arrowDefsDom).empty();
                // } else {
                    $(arrowDefsDom).remove();
                // }
            }
        }
        this.Nodes = {};
        this.Links = [];
        this.initDefs();
        this.onDataChange('reset');
    }

    // 清理所有选中的元素信息
    clearAllActiveElement() {
        this.selectedElement = null;

        // d3.selectAll('.link').style('marker-end', 'url(#end-arrow)');
        d3.selectAll('.node').classed('active', false);
        d3.selectAll('.link').classed('active', false);

        if (this.optionGroup) {
            this.optionGroup.remove();
        }

        if (this.config.onClearActiveElement) {
            this.config.onClearActiveElement();
        }

        let nodes = this.Nodes;
        let nodeIDs = Object.keys(nodes);

        nodeIDs.map(item => {
            this.Nodes[item].selected = false;
        });
        this.onDataChange('clearActive');
    }

    zoom() {
        let then = this;

        // 画布移动缩放
        let zoom = d3.zoom().on('zoom', function () {
            d3.selectAll(`${then.config.eln} .data-flow-path-group, ${then.config.eln} .data-flow-node-group`).attr('transform', d3.event.transform);
        });

        // 限制缩放的范围
        zoom.scaleExtent([0.7, 1.0]);

        // 使用移动和缩放并禁用双击
        this.svg.call(zoom).on('dblclick.zoom', null);
    }

    // svg画布的事件绑定
    initSvgEvent() {
        let then = this;

        this.zoom();

        if (!this.config.readOnly) {
            this.svg.on('mousemove', function () {
                let xy = d3.mouse(this);
                then.currentMouseXY = {
                    x: xy[0],
                    y: xy[1]
                };
            });

            // 鼠标线条的操作
            let linkPoint = [0, 0, 0, 0];
            this.DragLinkEvent = d3.drag()
                .on('start', function (d) {     // 设置线条的起始点
                    linkPoint = [d3.event.x, d3.event.y];
                    then.sourceNode = then.Nodes[then.selectedElement.id];
                })
                .on('drag', function (d) {      // 线条跟随鼠标位置
                    linkPoint[2] = d3.event.x;
                    linkPoint[3] = d3.event.y;
                    then.dragLine.classed('hide', false).attr('d', `M${linkPoint[0]},${linkPoint[1]}L${linkPoint[2]},${linkPoint[3]}`);
                })
                .on('end', function () {
                    then.dragLine.classed('hide', true);
                    let classList = d3.event.sourceEvent.target.parentNode.classList;
                    if (!classList) {
                        classList = $(d3.event.sourceEvent.target.parentNode).attr("class").split(" ");
                    }
                    let flag = 0;
                    classList.forEach(v => {
                        if (v === 'data-flow-path-group') {
                            flag = 1;
                        } else if (v === 'node') {
                            flag = 2;
                        }
                    });

                    if (flag === 2) {
                        let nodeID = d3.event.sourceEvent.target.parentNode.id;
                        let targetNode = then.Nodes[nodeID];
                        then.addLink(then.sourceNode, targetNode);
                    }
                    if (then.config.hasOwnProperty('onDragLink')) {
                        let point = [d3.event.x, d3.event.y];
                        then.config.onDragLink(then.sourceNode, point, flag === 2);
                    }

                    then.sourceNode = {};
                    then.onDataChange('connect');
                });

            this.nodaDrag();
            this.hotKey();
        }
    }

    // 节点拖拽事件
    nodaDrag() {
        let nodeMouseXY = [];
        let then = this;
        this.dragEvent = d3.drag()
            .on('start', function () {
                nodeMouseXY = d3.mouse(this);
                if (then.optionGroup) {
                    then.optionGroup.remove();
                }
            })
            .on('drag', function (d) {
                let point = {
                    x: d3.event.x - nodeMouseXY[0],
                    y: d3.event.y - nodeMouseXY[1]
                };

                // 限制拖拽区域不能超出画布
                if (point.x < 0) {
                    point.x = 0;
                } else if (point.x > then.config.width-30) {
                    point.x = then.config.width-50;
                }

                if (point.y < 0) {
                    point.y = 0;
                } else if (point.y > then.config.height-50) {
                    point.y = then.config.height-50;
                }

                d3.select(this).attr('transform', `translate(${point.x},${point.y})`);

                // 移动节点,线条跟着变化
                let nodeID = this.id;

                then.Nodes[nodeID].x = point.x;
                then.Nodes[nodeID].y = point.y;

                let linksID = Object.keys(then.Links);
                linksID.map(linkID => {
                    let link = then.Links[linkID];
                    if (nodeID === link.from || nodeID === link.to) {
                        then.moveLink(link, linkID);
                    }
                });
            })
            .on('end', function () {
                then.onDataChange('moveNode');
            });
    }

    // 删除节点和线条的快捷键
    hotKey() {
        let then = this;
        document.querySelector(this.config.eln).addEventListener('keydown', function (e) {
            if (then.selectedElement && (e.keyCode === 8 || e.keyCode === 46)) {
                if (then.selectedElement.type === 'node') {
                    then.deleteNode(then.selectedElement.id);
                } else {
                    let link = then.Links[then.selectedElement.id];
                    then.deleteLink(link);
                }
            }
        });
    }

    // 删除节点
    deleteNode(nodeID) {
        let node = this.Nodes[nodeID];
        if (!node) {
            return false;
        }

        if (this.config.hasOwnProperty('onDeleteNode')) {
            if (!this.config.onDeleteNode(node)) {
                return;
            }
        }

        delete this.Nodes[nodeID];
        d3.select('#' + nodeID).remove();

        let linksID = Object.keys(this.Links);
        linksID.map((linkID) => {
            let link = this.Links[linkID];
            if (link.from === nodeID || link.to === nodeID) {
                this.deleteLink(link, 'force');
            }
        });

        if (this.optionGroup) {
            this.optionGroup.remove();
        }

        this.onDataChange('deleteNode');
    }

    // 选中节点
    selectNode(nodeID) {
        this.clearAllActiveElement()
        let nodeInfo = this.Nodes[nodeID];
        nodeInfo.selected = true;

        let node = d3.select(`#${nodeID}`);
        node.classed('active', true)

        this.selectedElement = {
            type: 'node',
            id: nodeID
        };
        this.onNodeClick(node, nodeInfo)
    }

    // 新增一个节点
    addNode(nodeInfo) {
        let then = this;

        if (!nodeInfo.id) {
            nodeInfo.id = 'node_' + mathLib.genUUID();
        }

        if (!this.config.nodeTemplate.hasOwnProperty(nodeInfo.type)) {
            return;
        }

        let template = this.config.nodeTemplate[nodeInfo.type];

        nodeInfo.width = template.width;
        nodeInfo.height = template.height;

        let node = this.nodeGroup
            .append('g')
            .attr('class', 'node')
            .attr('id', nodeInfo.id)
            .on('contextmenu', function () {
                d3.event.preventDefault();
                if (then.config.hasOwnProperty('onNodeContextMenuRender')) {
                    then.contextmenu.show({ contextType: 'node', ...nodeInfo }, then.currentMouseXY);
                }
            })
            .on('click', function () {
                then.config.onSelectNode(this, nodeInfo);
                then.selectNode(nodeInfo.id);
                then.onNodeClick(node, nodeInfo);
            })
            .attr('transform', `translate(${nodeInfo.x}, ${nodeInfo.y})`);

        if (this.dragEvent) {
            node.call(this.dragEvent);
        }

        // 调用参数定义的
        this.config.nodeTemplate[nodeInfo.type].renderNode(node, nodeInfo);

        // 保存节点信息
        this.Nodes[nodeInfo.id] = nodeInfo;
        this.onDataChange('addNode');
        return nodeInfo;
    }

    onNodeClick(node, nodeInfo) {
        let then = this;
        this.sourceNode = nodeInfo;
        let template = this.config.nodeTemplate[nodeInfo.type];
        if (!template) {
            console.warn(`${nodeInfo.type} template not found `);
            return;
        }

        if (this.optionGroup) {
            this.optionGroup.remove();
        }

        this.optionGroup = this.nodeGroup.append('g');
        if (!this.config.readOnly) {
            this.optionGroup.append('rect')
                .style('fill', 'none')
                .style('stroke', '#68a987')
                .style('stroke-width', '1px')
                .attr('width', nodeInfo.width)
                .attr('height', nodeInfo.height)
                .attr('transform', `translate(${nodeInfo.x}, ${nodeInfo.y}) `);

            template.operatingPoint.forEach((item) => {
                then.optionGroup
                    .append('svg:circle')
                    .attr('class', 'operating-point')
                    .attr('r', 5)
                    .attr('fill', 'white')
                    .attr('stroke', '#06a0e9')
                    .attr('transform', () => {
                        if (item === 'right') {
                            return `translate(${nodeInfo.x + nodeInfo.width}, ${nodeInfo.y + nodeInfo.height / 2})`;
                        } else if (item === 'left') {
                            return `translate(${nodeInfo.x}, ${nodeInfo.y + nodeInfo.height / 2})`;
                        }
                    }).call(then.DragLinkEvent);
            });

            if (template.deleteAble) {
                // 删除按钮
                let delBtn = this.optionGroup
                    .append('g')
                    .attr('class', 'delete-not-btn')
                    .attr('transform', `translate(${nodeInfo.width + nodeInfo.x}, ${nodeInfo.y}) `);

                delBtn
                    .append('svg:circle')
                    .attr('stroke', 'red')
                    .attr('fill', 'red')
                    .attr('r', 6);

                delBtn
                    .append('svg:path')
                    .attr('stroke', 'white')
                    .attr('stroke-width', 2)
                    .attr('d', 'M-3,-3L3,3');

                delBtn
                    .append('svg:path')
                    .attr('stroke', 'white')
                    .attr('stroke-width', 2)
                    .attr('d', 'M3,-3L-3,3');

                delBtn.on('click', function () {
                    then.deleteNode(nodeInfo.id);
                });
            }
        }
    }

    // 移动节点的时候节点相关的线条跟着移动
    moveLink(link, linkID) {
        let sourceNode = this.Nodes[link.from];
        let targetNode = this.Nodes[link.to];

        let points = mathLib.calculateLinkPoint(sourceNode, targetNode, this.config);
        if (points.length === 4) {
            d3.select(`#${linkID}`).attr('d', `M${points[0]},${points[1]}L${points[2]}, ${points[3]}`);
        }
    }

    // 增加线条
    addLink(sourceNode, targetNode) {
        let language = VueCookie.get('defaultLanguage');
        let heat = heatCn.heat;
        if (language == "en") {
            heat = heatEn.heat;
        }

        // 相同类型或者同一节点不可相连
        if (sourceNode.id === targetNode.id ||
            sourceNode.config.type === targetNode.config.type) {
            Message.error(heat.sameResTypeLinkError);
            return false;
        }
        // 判断是否重复连线
        let linkExist = false;
        let linkIds = Object.keys(this.Links);
        if (linkIds.length > 0) {
            for (let i = 0; i < linkIds.length; i++) {
                let link = this.Links[linkIds[i]];
                if ((sourceNode.id == link.from && targetNode.id == link.to) ||
                    (sourceNode.id == link.to && targetNode.id == link.from)) {
                    linkExist = true;
                    break;
                }
            }
        }
        if (linkExist) {
            return false; // 避免节点重复连线
        }
        // 判断节点是否存在关联关系
        let sourceRels = Object.keys(sourceNode.config.relations);
        let targetRels = Object.keys(targetNode.config.relations);
        if (sourceRels.indexOf(targetNode.config.uuid) < 0 &&
            targetRels.indexOf(sourceNode.config.uuid) < 0) {
            Message.error(heat.notAllowedLinkError);
            return false;
        }

        // 判断节点是否允许建立多个连接
        let slinkCount = 0;
        let tlinkCount = 0;
        if (linkIds.length > 0) {
            for (let i = 0; i < linkIds.length; i++) {
                let link = this.Links[linkIds[i]];
                if (sourceNode.id == link.from || sourceNode.id == link.to) {
                    if ((link.fromUUid == sourceNode.config.uuid && link.toUUid == targetNode.config.uuid) ||
                        (link.fromUUid == targetNode.config.uuid && link.toUUid == sourceNode.config.uuid)) {
                        slinkCount++;
                    }
                }
                if (targetNode.id == link.from || targetNode.id == link.to) {
                    if ((link.fromUUid == sourceNode.config.uuid && link.toUUid == targetNode.config.uuid) ||
                        (link.fromUUid == targetNode.config.uuid && link.toUUid == sourceNode.config.uuid)) {
                        tlinkCount++;
                    }
                }
            }
        }
        // debugger
        if (sourceNode.config.relations[targetNode.config.uuid] &&
            sourceNode.config.relations[targetNode.config.uuid].single == 1) {
            if (slinkCount > 0) {
                Message.error(heat.multiSameResTypeLinkError);
                return false;
            }
        }
        if (targetNode.config.relations[sourceNode.config.uuid] &&
            targetNode.config.relations[sourceNode.config.uuid].single == 1) {
            if (tlinkCount > 0) {
                Message.error(heat.multiSameResTypeLinkError);
                return false;
            }
        }

        let then = this;
        let gid = 'link_' + mathLib.genUUID();
        let points = mathLib.calculateLinkPoint(sourceNode, targetNode, this.config);

        if (points.length !== 4) {
            return;
        }

        let path = this.pathGroup.append('svg:path').attr('id', gid).attr('class', 'link');

        if (this.config.hasOwnProperty('linkTemplate') && this.config.linkTemplate.hasOwnProperty('path')) {
            this.config.linkTemplate.path(path);
        } else {
            // path.style('marker-end', 'url(#end-arrow)');
        }

        this.Links[gid] = {
            id: gid,
            from: sourceNode.id,
            fromUUid: sourceNode.config.uuid,
            to: targetNode.id,
            toUUid: targetNode.config.uuid
        };

        path.attr('d', `M${points[0]}, ${points[1]}L${points[2]}, ${points[3]}`)
            .on('contextmenu', function () {
                d3.event.preventDefault();
                if (then.config.hasOwnProperty('onNodeContextMenuRender')) {
                    then.contextmenu.show({ contextType: 'link', ...then.Links[gid] }, then.currentMouseXY);
                }
            })
            .on('click', function () {
                then.clearAllActiveElement();
                path.classed('active', true);

                then.selectedElement = {
                    type: 'link',
                    id: gid
                };
            });

        if (!this.isSetData && this.config.hasOwnProperty('onConnect')) {
            this.config.onConnect(this.Links[gid], sourceNode, targetNode);
        }

        this.onDataChange('addLink');
    }

    deleteLink(link, type) {
        if (type !== 'force' && !this.isSetData && this.config.hasOwnProperty('onDeleteLink')) {
            let promise = this.config.onDeleteLink(link);
            if (promise instanceof Promise) {
                promise.then(r => {
                    delete this.Links[link.id];
                    d3.select(`#${link.id}`).remove();
                    this.onDataChange('deleteLink');
                });
            }
        } else {
            delete this.Links[link.id];
            d3.select(`#${link.id}`).remove();
            this.onDataChange('deleteLink');
        }
    }
}
