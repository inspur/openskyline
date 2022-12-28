const net = resolve => {
  require.ensure(['views/network/net.vue'], () => {
    resolve(require('views/network/net.vue'));
  }, 'net');
};

const network = resolve => {
  require.ensure(['views/network/network/Network.vue'], () => {
    resolve(require('views/network/network/Network.vue'));
  }, 'network');
};
const networkview = resolve => {
  require.ensure(['views/network/network/NetworkView.vue'], () => {
    resolve(require('views/network/network/NetworkView.vue'));
  }, 'networkview');
};

const networktab = resolve => {
  require.ensure(['views/network/network/NetworkTab.vue'], () => {
    resolve(require('views/network/network/NetworkTab.vue'));
  }, 'networktab');
};
const networkreview = resolve => {
  require.ensure(['views/network/network/NetworkReview.vue'], () => {
    resolve(require('views/network/network/NetworkReview.vue'));
  }, 'networkreview');
};
const networksubnet = resolve => {
  require.ensure(['views/network/network/NetworkSubnet.vue'], () => {
    resolve(require('views/network/network/NetworkSubnet.vue'));
  }, 'networksubnet');
};
const networkport = resolve => {
  require.ensure(['views/network/network/NetworkPort.vue'], () => {
    resolve(require('views/network/network/NetworkPort.vue'));
  }, 'networkport');
};

const reservedAddr = resolve => {
  require.ensure(['views/network/network/ReservedAddr.vue'], () => {
    resolve(require('views/network/network/ReservedAddr.vue'));
  }, 'reservedAddr');
};

const netdetaildhcp = resolve => {
  require.ensure(['views/network/network/NetworkDhcp.vue'], () => {
    resolve(require('views/network/network/NetworkDhcp.vue'));
  }, 'netdetaildhcp');
};

const routerNet = resolve => {
  require.ensure(['views/network/router/RouterNet.vue'], () => {
    resolve(require('views/network/router/RouterNet.vue'));
  }, 'routerNet');
};
const detailrouterNet = resolve => {
  require.ensure(['views/network/router/RouterDetail.vue'], () => {
    resolve(require('views/network/router/RouterDetail.vue'));
  }, 'detailrouterNet');
};
const overviewrouterNet = resolve => {
  require.ensure(['views/network/router/RouterDetallOverview.vue'], () => {
    resolve(require('views/network/router/RouterDetallOverview.vue'));
  }, 'overviewrouterNet');
};
const interfacerouterNet = resolve => {
  require.ensure(['views/network/router/RouterInterface.vue'], () => {
    resolve(require('views/network/router/RouterInterface.vue'));
  }, 'interfacerouterNet');
};
const staticrouterNet = resolve => {
  require.ensure(['views/network/router/RouterStaticList.vue'], () => {
    resolve(require('views/network/router/RouterStaticList.vue'));
  }, 'staticrouterNet');
};

const firewall = resolve => {
  require.ensure(['views/network/firewall/Firewall.vue'], () => {
    resolve(require('views/network/firewall/Firewall.vue'));
  }, 'firewall');
};

const firewallList = resolve => {
  require.ensure(['views/network/firewall/FirewallList.vue'], () => {
    resolve(require('views/network/firewall/FirewallList.vue'));
  }, 'firewallList');
};

const firewallStrategy = resolve => {
  require.ensure(['views/network/firewall/FirewallStrategy.vue'], () => {
    resolve(require('views/network/firewall/FirewallStrategy.vue'));
  }, 'firewallStrategy');
};

const firewallRule = resolve => {
  require.ensure(['views/network/firewall/FirewallRule.vue'], () => {
    resolve(require('views/network/firewall/FirewallRule.vue'));
  }, 'firewallRule');
};

const balanceList = resolve => {
  require.ensure(['views/network/balance/BalanceList.vue'], () => {
    resolve(require('views/network/balance/BalanceList.vue'));
  }, 'balanceList');
};

const balanceView = resolve => {
  require.ensure(['views/network/balance/BalanceView.vue'], () => {
    resolve(require('views/network/balance/BalanceView.vue'));
  }, 'balanceView');
};

const balanceMonitor = resolve => {
  require.ensure(['views/network/balance/BalanceMonitor.vue'], () => {
    resolve(require('views/network/balance/BalanceMonitor.vue'));
  }, 'balanceMonitor');
};

const balanceRespool = resolve => {
  require.ensure(['views/network/balance/BalanceRespool.vue'], () => {
    resolve(require('views/network/balance/BalanceRespool.vue'));
  }, 'balanceRespool');
};

const balanceHealth = resolve => {
  require.ensure(['views/network/balance/BalanceHealth.vue'], () => {
    resolve(require('views/network/balance/BalanceHealth.vue'));
  }, 'balanceHealth');
};
const balanceHealthinfo = resolve => {
  require.ensure(['views/network/balance/BalanceHealthinfo.vue'], () => {
    resolve(require('views/network/balance/BalanceHealthinfo.vue'));
  }, 'balanceHealthinfo');
};

const detailbalance = resolve => {
  require.ensure(['views/network/balance/DetailBalance.vue'], () => {
    resolve(require('views/network/balance/DetailBalance.vue'));
  }, 'detailbalance');
};
const detailmonitor = resolve => {
  require.ensure(['views/network/balance/DetailMonitor.vue'], () => {
    resolve(require('views/network/balance/DetailMonitor.vue'));
  }, 'detailmonitor');
};
const detailpool = resolve => {
  require.ensure(['views/network/balance/DetailPool.vue'], () => {
    resolve(require('views/network/balance/DetailPool.vue'));
  }, 'detailpool');
};
const detailhealth = resolve => {
  require.ensure(['views/network/balance/DetailHealth.vue'], () => {
    resolve(require('views/network/balance/DetailHealth.vue'));
  }, 'detailhealth');
};

const floatingip = resolve => {
  require.ensure(['views/network/floatingip/FloatingIP.vue'], () => {
    resolve(require('views/network/floatingip/FloatingIP.vue'));
  }, 'floatingip');
};

const securitygroup = resolve => {
  require.ensure(['views/network/safeteam/SafeTeamList.vue'], () => {
    resolve(require('views/network/safeteam/SafeTeamList.vue'));
  }, 'securitygroup');
};

const manageruleSafeteam = resolve => {
  require.ensure(['views/network/safeteam/ManageRule.vue'], () => {
    resolve(require('views/network/safeteam/ManageRule.vue'));
  }, 'manageruleSafeteam');
};

const vpn = resolve => {
  require.ensure(['views/network/vpn/VpnList.vue'], () => {
    resolve(require('views/network/vpn/VpnList.vue'));
  }, 'vpn');
};
const vpnike = resolve => {
  require.ensure(['views/network/vpn/Vpnike.vue'], () => {
    resolve(require('views/network/vpn/Vpnike.vue'));
  }, 'vpnike');
};
const vpnsecstrategy = resolve => {
  require.ensure(['views/network/vpn/Vpnipsecstrategy.vue'], () => {
    resolve(require('views/network/vpn/Vpnipsecstrategy.vue'));
  }, 'vpnsecstrategy');
};

const vpnsecstation = resolve => {
  require.ensure(['views/network/vpn/Vpnipsecstation.vue'], () => {
    resolve(require('views/network/vpn/Vpnipsecstation.vue'));
  }, 'vpnsecstation');
};

const endpointgroups = resolve => {
  require.ensure(['views/network/vpn/EndpointGroups.vue'], () => {
    resolve(require('views/network/vpn/EndpointGroups.vue'));
  }, 'endpointgroups');
};

const vpnserver = resolve => {
  require.ensure(['views/network/vpn/Vpnserver.vue'], () => {
    resolve(require('views/network/vpn/Vpnserver.vue'));
  }, 'vpnserver');
};

const netTopo = resolve => {
  require.ensure(['views/network/topo/NetworkTopo.vue'], () => {
    resolve(require('views/network/topo/NetworkTopo.vue'));
  }, 'netTopo');
};

const qosView = resolve => {
  require.ensure(['views/network/qos/QosView.vue'], () => {
    resolve(require('views/network/qos/QosView.vue'));
  }, 'qosView');
};
const qosList = resolve => {
  require.ensure(['views/network/qos/QosList.vue'], () => {
    resolve(require('views/network/qos/QosList.vue'));
  }, 'qosList');
};
const ruleView = resolve => {
  require.ensure(['views/network/qos/RuleView.vue'], () => {
    resolve(require('views/network/qos/RuleView.vue'));
  }, 'ruleView');
};
const ruleList = resolve => {
  require.ensure(['views/network/qos/RuleList.vue'], () => {
    resolve(require('views/network/qos/RuleList.vue'));
  }, 'ruleList');
};
const routes = [{
  name: 'net',
  path: '/net',
  alias: '/',
  component: net,
  meta: {
    title: Vue.t("network.networks"),
    des: Vue.t("network.networks")
  },
  children: [{
    name: 'networkview',
    path: 'networkview',
    alias: '/',
    component: networkview,
    meta: {
      des: Vue.t("network.networks")
    },
    children: [{
      name: "network",
      path: "",
      component: network
    }, {
      name: "networktab",
      path: "networktab/:networkId",
      component: networktab,
      alias: "/",
      meta: {
        des: Vue.t("network.networkdetail")
      },
      children: [{
        //   name: "networkreview",
        //   path: "networkreview",
        //   component: networkreview,
        //   alias: "/",
        //   meta: {
        //     des: Vue.t("network.overview")
        //   }
        // }, {
        name: "networksubnet",
        path: "networksubnet",
        component: networksubnet,
        alias: "/",
        meta: {
          des: Vue.t("network.subnet")
        }
      }, {
        name: "networkport",
        path: "networkport",
        component: networkport,
        alias: "/",
        meta: {
          des: Vue.t("network.port")
        }
      }, {
        name: "reservedAddr",
        path: "reservedAddr",
        component: reservedAddr,
        alias: "/",
        meta: {
          des: Vue.t("network.reservedAddr")
        }
      }, {
        name: "netdetaildhcp",
        path: "netdetaildhcp",
        component: netdetaildhcp,
        alias: "/",
        meta: {
          des: "DHCP"
        }
      }]
    }]
  }, {
    name: 'routerNet',
    path: 'routerNet',
    alias: '/',
    component: routerNet,
    meta: {
      des: Vue.t("network.router")
    },
    children: [{
      path: "",
      components: {
        overviewrouterNet: overviewrouterNet,
        interfacerouterNet: interfacerouterNet,
        staticrouterNet: staticrouterNet
      }
    }]
  }, {
    name: 'firewall',
    path: 'firewall',
    component: firewall,
    alias: '/',
    meta: {
      des: Vue.t("network.firewall")
    },
    children: [{
      name: 'firewallList',
      path: 'firewallList',
      alias: '/',
      meta: {
        des: Vue.t("network.firewall")
      },
      component: firewallList
    }, {
      name: 'firewallStrategy',
      path: 'firewallStrategy',
      alias: '/',
      meta: {
        des: Vue.t("network.firewallStrategy")
      },
      component: firewallStrategy
    }, {
      name: 'firewallRule',
      path: 'firewallRule',
      alias: '/',
      meta: {
        des: Vue.t("network.firewallRule")
      },
      component: firewallRule
    }]
  }, {
    name: 'balanceView',
    path: 'balanceView',
    component: balanceView,
    alias: '/',
    meta: {
      des: Vue.t("network.balancer")
    },
    children: [{
      name: "balanceList",
      path: "",
      component: balanceList
    }, {
      name: "balanceMonitor",
      path: "balanceMonitor/:balanceId/:projectId",
      component: balanceMonitor,
      alias: "/",
      meta: {
        des: Vue.t("network.balanceDetail")
      },
      children: [{
        name: "detailbalance",
        path: "",
        component: detailbalance
      }, {
        name: "balanceRespool",
        path: "balanceRespool/:monitorId",
        component: balanceRespool,
        alias: "/",
        meta: {
          des: Vue.t("network.monitorDetail")
        },
        children: [{
          name: "detailmonitor",
          path: "",
          component: detailmonitor
        }, {
          name: "balanceHealthinfo",
          path: "balanceHealthinfo/:healthId",
          component: balanceHealthinfo,
          alias: "/",
          meta: {
            des: Vue.t("network.monitorHealthMonitorDetail")
          },
          children: [{
            name: "detailhealth",
            path: "",
            component: detailhealth
          }]
        },
        {
          name: "balanceHealth",
          path: "balanceHealth/:poolId",
          component: balanceHealth,
          alias: "/",
          meta: {
            des: Vue.t("network.respool")
          },
          children: [{
            name: "detailpool",
            path: "",
            component: detailpool
          }, {
            name: "balanceHealthinfo",
            path: "balanceHealthinfo/:healthId",
            component: balanceHealthinfo,
            alias: "/",
            meta: {
              des: Vue.t("network.healthMonitorDetail")
            },
            children: [{
              name: "detailhealth",
              path: "",
              component: detailhealth
            }]
          }]
        }
        ]
      }]
    }]
  }, {
    name: 'floatingip',
    path: 'floatingip',
    component: floatingip,
    meta: {
      des: Vue.t("network.floatingIP")
    }
  }, {
    name: 'securitygroup',
    path: 'securitygroup',
    component: securitygroup,
    meta: {
      des: Vue.t("network.securityTeam")
    }
  }, {
    name: 'manage-rulesafeteam',
    path: 'manage-rulesafeteam',
    component: manageruleSafeteam,
    meta: {
      des: Vue.t("network.manageRule")
    }
  }, {
    name: 'vpn',
    path: 'vpn',
    component: vpn,
    alias: '/',
    meta: {
      des: "VPN"
    },
    children: [{
      name: 'vpnike',
      path: 'vpnike',
      component: vpnike,
      alias: '/',
      meta: {
        des: Vue.t("network.ikeStrategy")
      }
    }, {
      name: 'vpnsecstrategy',
      path: 'vpnsecstrategy',
      component: vpnsecstrategy,
      alias: '/',
      meta: {
        des: Vue.t("network.ipsecStrategy")
      }
    }, {
      name: 'vpnsecstation',
      path: 'vpnsecstation',
      component: vpnsecstation,
      meta: {
        des: Vue.t("network.ipsecstation")
      }
    }, {
      name: 'endpointgroups',
      path: 'endpointgroups',
      component: endpointgroups,
      meta: {
        des: Vue.t("network.endpointgroups")
      }
    }, {
      name: 'vpnserver',
      path: 'vpnserver',
      component: vpnserver,
      meta: {
        des: Vue.t("network.vpnServer")
      }
    }]
  }, {
    name: 'qosView',
    path: 'qosView',
    component: qosView,
    alias: '/',
    meta: {
      des: "QoS"
    },
    children: [{
      name: "qosList",
      path: "",
      component: qosList
    }, {
      name: "ruleView",
      path: "ruleView/:qosId",
      component: ruleView,
      alias: "/",
      meta: {
        des: Vue.t("network.qosRule")
      },
      children: [{
        name: "ruleList",
        path: "",
        component: ruleList
      }]
    }]
  }, {
    name: 'netTopo',
    path: 'netTopo',
    component: netTopo,
    meta: {
      des: Vue.t("network.networkTopo")
    }
  }]
}];

export default routes;
