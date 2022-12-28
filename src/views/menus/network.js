module.exports = function () {
  return {
    flg: Vue.AuthList["m.network"],
    key: "net",
    path: "/net/",
    iconType: "el-icon-fa-globe",
    name: Vue.t("network.networks"),
    subMenus: [{
      flg: Vue.AuthList["m.network.network"],
      key: "networkview",
      path: "networkview",
      iconType: "el-icon-fa-slack",
      name: Vue.t("network.networks")
    }, {
      flg: Vue.AuthList["m.network.router"],
      key: "routerNet",
      path: "routerNet",
      iconType: "el-icon-fa-link",
      name: Vue.t("network.router")
    }, {
      flg: Vue.AuthList["m.network.firewall"] && false,
      key: "firewall",
      path: "firewall",
      iconType: "el-icon-fa-shield",
      name: Vue.t("network.firewall")
    }, {
      flg: Vue.AuthList["m.network.balance"] && Vue.service['octavia'],
      key: "balanceView",
      path: "balanceView",
      iconType: "el-icon-fa-random",
      name: Vue.t("network.balance")
    }, {
      flg: Vue.AuthList["m.network.flaotingip"],
      key: "floatingip",
      path: "floatingip",
      iconType: "el-icon-fa-desktop",
      name: Vue.t("network.floatingIP")
    }, {
      flg: Vue.AuthList["m.network.securitygroup"],
      key: "securitygroup",
      path: "securitygroup",
      iconType: "el-icon-fa-lock",
      name: Vue.t("network.securityTeam")
    }, {
      flg: Vue.AuthList["m.network.vpn"] && Vue.archIs('x86') && false,
      key: "vpn",
      path: "vpn",
      iconType: "el-icon-fa-exchange",
      name: "VPN"
    }, {
      flg: Vue.AuthList["m.network.qos"] && false,
      key: "qosView",
      path: "qosView",
      iconType: "el-icon-fa-dedent",
      name: "QoS"
    }, {
      flg: Vue.AuthList["m.network.topo"],
      key: "netTopo",
      path: "netTopo",
      iconType: "el-icon-fa-joomla",
      name: Vue.t("network.networkTopo")
    }]
  };
}
