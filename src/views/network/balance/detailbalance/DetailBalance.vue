<template>
  <div>
    <el-row>
      <el-col :spsn="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{$t('network.balanceDetail')}}</span>
            <el-button size="small" type="text" icon="fa-refresh" @click="onRefreshBalance"></el-button>
             <el-tooltip effect="dark" placement="top">
                <div slot="content">
                  <div style="font-size: 12px;padding: 10px;">
                    <div><span>{{$t('network.BALANCE_DESCTIPTION')}}</span></div>
                    <div><span>{{$t('network.LISTENER_DESCRIPTION')}}</span></div>
                    <div><span>{{$t('network.POOL_DESCRIPTION')}}</span></div>
                    <div><span>{{$t('network.POOL_MEMBER_DESCTIPTION')}}</span></div>
                    <div><span>{{$t('network.HELTH_DESCRIPTION')}}</span></div>
                  </div>
                </div>
                <i class="el-icon-fa-info-circle"></i>
              </el-tooltip>
          </div>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath">{{$t('network.balanceName')}}：</th>
                    <td class="idatatd">{{loadbalancer_name}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('network.balanceId')}}：</th>
                    <td class="idatatd">{{loadbalancer_ID}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('network.ipaddress')}}：</th>
                    <td class="idatatd">{{loadbalancer_vip_address}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('network.operateStatus')}}：</th>
                    <td class="idatatd">{{loadbalancer_operating_status}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('network.configStatus')}}：</th>
                    <td class="idatatd">{{loadbalancer_provisioning_status}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="even">
                    <th class="idatath">{{$t('network.provider')}}：</th>
                    <td class="idatatd">{{loadbalancer_provider}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('network.floatIpaddress')}}：</th>
                    <td class="idatatd">
                      {{loadbalancer_floatingIP}}
                      <el-tooltip effect="dark" placement="top">
                        <div slot="content">{{$t('network.balstepTwoTip')}}</div>
                        <i class="el-icon-fa-question-circle"></i>
                      </el-tooltip>
                    </td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('network.subnet')}}：</th>
                    <td class="idatatd">{{loadbalancer_subnet}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('network.portId')}}：</th>
                    <td class="idatatd">{{loadbalancer_port}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">{{$t('lang.desc')}}：</th>
                    <td class="idatatd">
                      <el-tooltip class="item" effect="dark" placement="top" :content="loadbalancer_desc" v-if="loadbalancer_desc.length>20">
                        <span>{{loadbalancer_desc.substr(0, 10)+"..."}}</span>
                      </el-tooltip>
                      <span v-if="loadbalancer_desc.length<=20">{{loadbalancer_desc}}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-card>

         <el-card class="box-card" style="margin-top:5px;">
          <div slot="header" class="clearfix">
            <span>{{$t('network.AMPHORAE_LIST')}}</span>
            <el-button size="small" type="text" icon="fa-refresh" @click="getTableData"></el-button>
          </div>
          <el-table class="amphora" :class="{isClick:roleType==='0'}" :data="tableData" @cell-click="cellClick" border style="width:100%">
            <el-table-column prop="compute_id" :label="$t('storage.instanceId')">
<!-- 
              <template slot-scope="scope">
                <el-button v-if="roleType=='0' && scope.row.compute_id != '-'" @click.stop="cellClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.compute_id}}</el-button>
                <span v-else>{{scope.row.compute_id}}</span>
              </template> -->
            </el-table-column>
            <el-table-column prop="lb_network_ip" :label="$t('network.MANAGE_IP')"></el-table-column>
            <el-table-column prop="vrrp_ip" label="VRRP IP"></el-table-column>
            <el-table-column prop="cached_zone" :label="$t('network.domainuse')"></el-table-column>
          </el-table>
        </el-card>

         <el-card class="box-card" style="margin-top:5px;">
          <div slot="header" class="clearfix">
            <span>{{$t('network.monitorLine')}}</span>
            <!-- <el-button size="small" type="text" icon="fa-refresh" @click="()=>{$refs.performance.getData();}"></el-button> -->
          </div>
          <performance ref="performance" :loadbalancerID='loadbalancer_ID' :amphoraList='tableData' @refershPerformance="refershPerformance"/>
        </el-card>
      </el-col>
    </el-row>

    <transition name="slide-right" mode="out-in">
      <div style="width: 50%;" class="slide-panel" v-if="detailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button type="text" icon="fa-arrow-right" @click="detailFlag=false;">{{$t("lang.back")}}</el-button>
          </div>
          <div>
            <amphora-detail :data="{instanceID,userMaps,projectMaps,networkMaps}"></amphora-detail>
          </div>
        </panel>
      </div>
    </transition>
  </div>
</template>
<script type="text/javascript">
import Performance from "./Performance";
import AddMonitor from "../AddMonitor";
import EditMonitor from "../EditStepTwo";
import SetFloatingip from "../SetFloatingip";
import AmphoraDetail from '../amphora-detail/index';

import * as d3 from "d3";
export default {
  name: "DetailBalance",
  components: {
    Performance,
    AmphoraDetail,
    AddMonitor,
    EditMonitor,
    SetFloatingip
  },
  data() {
    return {
      roleType: String(Vue.roleType),
      tableData: [],
      instanceID: '',
      userMaps: new Map(),
      projectMaps: new Map(),
      networkMaps: new Map(),
      topoImageRender: Vue.topoImageFormatter,
      lbFloatIp: "",
      floatipId: "",
      vip_port_id: "",
      floatingIPFlag: false,
      unBindFloatingIPFlag: false,
      loadbalancer_ID: "",
      loadbalancer_name: "",
      loadbalancer_vip_address: "",
      loadbalancer_operating_status: "",
      loadbalancer_provisioning_status: "",
      loadbalancer_provider: "",
      loadbalancer_admin_state_up: "",
      loadbalancer_floatingIP: "",
      loadbalancer_subnet: "",
      loadbalancer_port: "",
      loadbalancer_projectid: "",
      loadbalancer_desc: "",
      sortObj: {
        sortOrder: "ascending",
        sortField: "name"
      },
      listener: null,
      poolInfo: null,
      memberInfo: null,
      healthmonitorInfo: null,
      query_name: "",
      query_protocol: "",
      columnsChecked: [
        "name",
        "description",
        "protocol",
        "operating_status",
        "provisioning_status",
        "protocol_port"
      ],
      monitortableData: [],
      totalData: [],
      totallistenerData: [],
      portList: [],
      multipleSelection: [],
      loading: false,
      addFlag: false,
      reloading: false,
      editFlag: false,
      detailFlag: false,
      havefloatingip: false,
      activeName: ["2"],
      columns: [
        {
          prop: "name",
          label: Vue.t("lang.name")
        },
        {
          prop: "protocol",
          label: Vue.t("network.protocol")
        },
        {
          prop: "protocol_port",
          label: Vue.t("network.port")
        },
        {
          prop: "operating_status",
          label: Vue.t("network.operateStatus")
        },
        {
          prop: "provisioning_status",
          label: Vue.t("network.configStatus")
        },
        {
          prop: "description",
          label: Vue.t("lang.desc")
        }
      ],
      operationMenus: [
        {
          icon: "fa-plus",
          name: Vue.t("network.create"),
          showflg: true,
          readOnly: true,
          handler: function(selectRows) {
            this.addFlag = true;
          }.bind(this)
        },
        {
          icon: "fa-edit",
          name: Vue.t("network.modify"),
          showflg: true,
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            let self = this;
            let row = selectRows[0];
            self.listener = row;
            self.editFlag = true;
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: Vue.t("network.delete"),
          showflg: true,
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            let self = this;
            let row = selectRows[0];
            self.$confirm(
              Vue.t("network.monitorhaspool"),
              Vue.t("network.attention"),
              {
                confirmButtonText: Vue.t("lang.confirm"),
                cancelButtonText: Vue.t("lang.cancel"),
                type: "warning",
                closeOnClickModal: false,
                callback: (action, instance) => {
                  if (action === "confirm") {
                    self.$ajax({
                      type: "DELETE",
                      url: "api/octavia/v2.0/lbaas/listeners/" + row["id"],
                      data: {},
                      successMsg: Vue.t("network.deleteSendSuccess"),
                      errorKey: "NeutronError",
                      success: function() {
                        self.$refs.monitorTable.clearSelection();
                        self.getListenerInfo(self.loadbalancer_ID);
                      },
                      errFun() {
                        self.$refs.monitorTable.clearSelection();
                        self.getListenerInfo(self.loadbalancer_ID);
                      },
                      log: {
                        description: {
                          en: "Delete Monitor:" + row["name"],
                          zh_cn: "删除监听器:" + row["name"]
                        },
                        target: Vue.logTarget.balance
                      }
                    });
                  }
                }
              }
            );
          }.bind(this)
        }
      ]
    };
  },
  watch: {
    columnsChecked: {
      handler: function(rows, oldVal) {
        this.columnsChecked = rows;
      },
      deep: true
    },
    monitortableData: {
      immediate: false,
      handler: function(list) {
        let self = this;
        self.reloading = false;
        if (list != null) {
          for (let t = 0; t < list.length; t++) {
            let obj = list[t];
            if (
              obj["provisioning_status"] == "PENDING_UPDATE" ||
              obj["provisioning_status"] == "PENDING_DELETE" ||
              obj["provisioning_status"] == "deleting" ||
              obj["provisioning_status"] == "PENDING_CREATE"
            ) {
              self.reloading = true;
              break;
            }
          }
        }
        clearInterval(self.interPhyValid);
        if (self.reloading && !self._isDestroyed) {
          self.interPhyValid = setInterval(() => {
            self.getListenerInfo(self.loadbalancer_ID);
          }, 5000);
        }
      }
    }
  },
  created() {
  },
  mounted() {
    let self = this;
    Promise.all([self.getsubnetList()]).then(function(result) {
      self.getloadbalancerInfo();

      if (self.roleType === '0') {
        Promise.all([
          self.loadNetListData(),
          self.getProjectList(),
          self.loadUserList()
        ]);
      }
    });
    //this.initTopo();
  },
  methods: {
    cellClick(row, column, cell, event) {
      switch (column.property) {
        case 'compute_id':
            if (this.roleType !== '0') {
              break;
            }
            this.detailFlag = row["provisioning_status"] !== "ERROR";
            if (this.detailFlag) {
              this.instanceID = row["compute_id"];
            } else {
              this.$message.error('配置状态错误无法获取到概要信息!');
            // let provisioning_status = row["provisioning_status"];//provisioning_status: "ERROR"
            }
          break;
        default:
          break;
      }
    },
    async loadNetListData() {
      let url = "api/neutron/v2.0/networks";
      try {
        let result = await this.$ajax({
          type: 'get',
          url: url,
          showErrMsg: false,
          complete: function(XMLHttpRequest, textStatus) {}
        });
          let a = result['networks'];
          a.forEach(v => {
            this.networkMaps.set(v.id, v.name || v.id);
          });
        } catch (data) {
        }
    },
     async getProjectList() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/projects?domain_id=default"
        });

        let a = JSON.parse(JSON.stringify(result["projects"]));
        a.forEach(v => {
          this.projectMaps.set(v.id, v.name);
        });
      } catch (res) {
        console.log("获取项目列表失败");
      }
    },
    async loadUserList() {
      let url = "api/keystone/v3/inspur/users?dir=asc&field=name&domain_id=default";
      let roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        url = `api/keystone/v3/inspur/assignments/projects/${this.$cookie.get('pid')}/users`;
      }
      try {
        let result = await this.$ajax({
          type: 'get',
          url: url
        });
        let a = [];
        if (roleType === '0') {
          a = result.users;
        } else {
          a = result.users.map(item => {
            return item.user;
          });
        }
        a.forEach(v => {
          this.userMaps.set(v.id, v.name);
        });
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async getTableData(v = {}) {
      let param = {
        loadbalancer_id: this.loadbalancer_ID
      };
      let url = "api/octavia/v2.0/octavia/amphorae?" + $.param(param);
      let data = await this.$ajax({
        type: "get",
        url: url
      }).catch( v => {
      });
      let d = data || {};

      this.tableData = d.amphorae || [];
      this.detailFlag = false;
    },
    initTopo() {
      let self = this;
      const links = [
        {
          "source": "pool_member1",
          "target": "server1"
        },
        {
          "source": "pool_member2",
          "target": "server2"
        },
        {
          "source": "pool",
          "target": "listener"
        },
        {
          "source": "monitor",
          "target": "pool"
        },
        {
          "source": "pool_member1",
          "target": "pool"
        },
        {
          "source": "pool_member2",
          "target": "pool"
        },
        {
          "source": "listener",
          "target": "loadbalancer"
        }
      ];
      const nodes = [
        {
          "id": "monitor",
          "name": Vue.t("network.TOPO_MONITOR"),
          "type": "OS::Octavia::HealthMonitor",
          "status": "CREATE_COMPLETE"
        },
        {
          "id": "server1",
          "name": Vue.t("network.TOPO_SERVER1"),
          "type": "OS::Nova::Server",
          "status": "CREATE_COMPLETE"
        },
        {
          "id": "server2",
          "name": Vue.t("network.TOPO_SERVER2"),
          "type": "OS::Nova::Server",
          "status": "CREATE_COMPLETE"
        },
        {
          "id": "listener",
          "name": Vue.t("network.TOPO_LISTENER"),
          "type": "OS::Octavia::Listener",
          "status": "CREATE_COMPLETE"
        },
        {
          "id": "pool",
          "name": Vue.t("network.TOPO_POOL"),
          "type": "OS::Octavia::Pool",
          "status": "CREATE_COMPLETE"
        },
        {
          "id": "pool_member1",
          "name": Vue.t("network.TOPO_POOL_MEMBER1"),
          "type": "OS::Octavia::PoolMember",
          "status": "CREATE_COMPLETE"
        },
        {
          "id": "loadbalancer",
          "name": Vue.t("network.TOPO_POOL_LOADBALANCER"),
          "type": "OS::Octavia::LoadBalancer",
          "status": "CREATE_COMPLETE"
        },
        {
          "id": "pool_member2",
          "name": Vue.t("network.TOPO_POOL_MEMBER2"),
          "type": "OS::Octavia::PoolMember",
          "status": "CREATE_COMPLETE"
        }
      ];
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
    async getloadbalancerInfo() {
      let self = this;
      try {
        self.loading = true;
        let result = await self.$ajax({
          type: "get",
          url:
            "api/octavia/v2.0/lbaas/inspurloadbalancers/" +
            this.$route.params.balanceId,
          error: "NeurtronError",
          errFun() {
          }
        });
        let balanceInfo = result["loadbalancer"];
        self.loadbalancer_ID = balanceInfo["id"];
        self.loadbalancer_name = balanceInfo["name"];
        self.loadbalancer_vip_address = balanceInfo["vip_address"];
        self.loadbalancer_provider = balanceInfo["provider"];
        self.loadbalancer_operating_status = self.operatingStatusRender(
          balanceInfo["operating_status"]
        );
        self.loadbalancer_provisioning_status = self.provisioningStatusRender(
          balanceInfo["provisioning_status"]
        );
        self.loadbalancer_projectid = balanceInfo["tenant_id"];
        self.loadbalancer_port = balanceInfo["vip_port_id"];
        self.loadbalancer_floatingIP = balanceInfo.fip_address;
        if (self.loadbalancer_floatingIP) {
          self.floatipId = balanceInfo.fip_id;
          self.havefloatingip = true;
        } else {
          self.loadbalancer_floatingIP = Vue.t("network.nothing");
          self.havefloatingip = false;
        }
        self.subnetRender(balanceInfo["vip_subnet_id"]);
        self.vip_port_id = balanceInfo["vip_port_id"];
        self.loadbalancer_desc = balanceInfo["description"];
        this.getTableData(); // 获取到self.loadbalancer_ID后，才可以用这个参数请求这个接口
      } catch (res) {}
    },
    onRefreshBalance() {
      this.getloadbalancerInfo();
      this.detailFlag = false;
    },
    //根据loadlbalanceId 获取监听器详情
    async getListenerInfo(loadbalancerId, name = "", protocol = "") {
      let self = this;
      try {
        let result = await self.$ajax({
          type: "get",
          url:
            "api/octavia/v2.0/lbaas/listeners?loadbalancer_id=" +
            loadbalancerId,
          complete: function(XMLHttpRequest, textStatus) {
            self.loading = false;
          },
          error: "NeurtronError",
          errFun() {
          }
        });
        self.totalData = [];
        self.totallistenerData = [];
        self.totallistenerData = result["listeners"];
        if (name === "" && protocol === "") {
          self.totalData = result["listeners"];
        } else {
          let listeners = result["listeners"];
          for (let i = 0; i < listeners.length; i++) {
            let lis = listeners[i];
            if (name != "" && lis["name"].indexOf(name) < 0) {
              continue;
            }
            if (protocol != "" && protocol != lis["protocol"]) {
              continue;
            }
            self.totalData.push(lis);
          }
        }
      } catch (res) {}
    },
    getCurrentData(param) {
      this.monitortableData = param;
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) {
        return;
      }
      self.sortObj = {
        sortOrder: column.order,
        sortField: column.prop
      };
    },
    statusTagRender(status) {
      if (status === "ACTIVE") {
        return "success";
      } else if (
        status === "PENDING_UPDATE" ||
        status === "PENDING_DELETE" ||
        status === "PENDING_CREATE" ||
        status === "deleting"
      ) {
        return "info";
      } else if (status === "ERROR") {
        return "danger";
      } else if (status === "ONLINE") {
        return "success";
      } else if (status === "OFFLINE") {
        return "info";
      } else {
        return "info";
      }
    },
    handleSelectionChange(val) {
      val.forEach((row, index) => {
        if (index === val.length - 1) return;
        this.$refs.monitorTable.toggleRowSelection(row, false);
      });
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.monitorTable.toggleRowSelection(row);
    },
    handleAddShow() {
      this.addFlag = false;
      this.getListenerInfo(this.loadbalancer_ID);
    },
    handleEditShow() {
      this.editFlag = false;
      this.getListenerInfo(this.loadbalancer_ID);
    },
    handleCancelShow() {
      this.addFlag = false;
      this.editFlag = false;
    },
    showDetail(row) {
      let monitorId = row["id"];
      let loadbalancerId = this.$route.params.balanceId;
      this.$router.push({
        path:
          "/net/balanceView/balanceMonitor/" +
          loadbalancerId +
          "/balanceRespool/" +
          monitorId
      });
    },
    async getsubnetList() {
      try {
        let resultData = await this.$ajax({
          type: "get",
          url: "api/neutron/v2.0/subnets"
        });
        let sublist1 = [];
        let sublist = resultData["subnets"];
        for (let i = 0; i < sublist.length; i++) {
          let subname = sublist[i];
          subname["name"] = subname["cidr"] + "(" + subname["name"] + ")";
          if (subname["ip_version"] == 4) {
            sublist1.push(subname);
          }
        }
        Vue.subnetsList = sublist1;
      } catch (res) {
        console.log("获取子网失败!");
      }
    },
    subnetRender(value) {
      let name = "";
      let subnets = Vue.subnetsList;
      for (let i = subnets.length - 1; i >= 0; i--) {
        let subnet = subnets[i];
        if (subnet.id === value) {
          name = subnet.name;
        }
      }
      this.loadbalancer_subnet = name;
    },
    //操作状态转换
    operatingStatusRender(value) {
      if (value === "ONLINE") {
        return Vue.t("network.online");
      } else if (value === "OFFLINE") {
        return Vue.t("network.offline");
      } else if (value === "ERROR") {
        return Vue.t("lang.ERROR");
      } else if (value === "DEGRADED") {
        return Vue.t('network.degrded');
      } else {
        return value;
      }
    },
    //配置状态转换
    provisioningStatusRender(value) {
      if (value === "ACTIVE") {
        return Vue.t("lang.ACTIVE");
      } else if (
        value === "PENDING_UPDATE"
      ) {
        return Vue.t("network.pendingupdate");
      } else if (
        value === "PENDING_DELETE"
      ) {
        return Vue.t("network.pendingdelete");
      } else if (value === "PENDING_CREATE") {
        return Vue.t("network.createing");
      } else if (value === "ERROR") {
        return Vue.t("lang.ERROR");
      } else if (value === "deleting") {
        return Vue.t("network.operating");
      } else if (value === "INACTIVE") {
        return Vue.t("lang.DOWN");
      } else if (value === "DELETD") {
        return Vue.t("network.deletd");
      } else {
        return value;
      }
    },
    async getFloatingipRender(portId) {
      let self = this;
      let result = await self.$ajax({
        type: "GET",
        url: "api/neutron/v2.0/floatingips?port_id=" + portId,
        errorKey: "NeutronError"
      });
      let fips = result["floatingips"];
      if (fips.length > 0) {
        self.loadbalancer_floatingIP = fips[0]["floating_ip_address"];
        self.floatipId = fips[0]["id"];
        self.havefloatingip = true;
      } else {
        self.loadbalancer_floatingIP = Vue.t("network.nothing");
        self.havefloatingip = false;
      }
    },
    onRefresh() {
      this.getListenerInfo(this.loadbalancer_ID);
    },
    bindFloatingIp() {
      this.floatingIPFlag = true;
    },
    handleFloatingipShow() {
      this.floatingIPFlag = false;
      this.getFloatingipRender(this.vip_port_id);
    },
    freeFloatingIp() {
      let self = this;
      self.$confirm(
        Vue.t("network.confirmUnbanding"),
        Vue.t("network.attention"),
        {
          confirmButtonText: Vue.t("lang.confirm"),
          cancelButtonText: Vue.t("lang.cancel"),
          type: "warning",
          closeOnClickModal: false,
          callback: (action, instance) => {
            if (action === "confirm") {
              let reqdata = { floatingip: {} };
              self.$ajax({
                type: "get",
                url: "api/neutron/v2.0/floatingips/" + self.floatipId,
                errorKey: "NeutronError",
                success: function(result) {
                  if (result != null) {
                    let floatingip = result["floatingip"];
                    if (floatingip.fixed_ip_address == null) {
                      self.$message.error(Vue.t("network.thisfloatingrelesas"));
                      self.getFloatingipRender(self.vip_port_id);
                    } else {
                      self.$ajax({
                        type: "PUT",
                        url: "api/neutron/v2.0/floatingips/" + self.floatipId,
                        data: JSON.stringify(reqdata),
                        successMsg: Vue.t("network.unbingsuccess"),
                        success: function(result) {
                          self.getFloatingipRender(self.vip_port_id);
                        },
                        errorKey: "NeutronError",
                        log: {
                          description: {
                            en:
                              "Unbanding floating IP:" +
                              self.loadbalancer_floatingIP,
                            zh_cn: "解除绑定浮动IP:" + self.loadbalancer_floatingIP
                          },
                          target: Vue.logTarget.balance
                        }
                      });
                    }
                  }
                },
                errFun() {
                  self.getFloatingipRender(self.vip_port_id);
                }
              });
            }
          }
        }
      );
    },
    handleUnBindFloatingipShow() {
      this.unBindFloatingIPFlag = false;
    },
    refershPerformance() {
      this.detailFlag = false;
    }
  }
};
</script>
<style type="text/css" scoped>
.idatath {
  width: 120px;
}

.amphora.isClick >>> table tbody tr td:first-child:hover {
  text-decoration: underline;
}
.amphora.isClick >>> table tbody tr td:first-child{
  cursor: pointer;
  color: #1991eb;
}
</style>
