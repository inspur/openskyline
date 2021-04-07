/**
 * 格式化渲染公用方法
 */
import moment from 'moment';
;(function() {
  var formatterUtils = {};
  // 暴露出的全局配置项，也就是在调用 Vue.use(Vue, options) 时传入的第二个选项参数
  formatterUtils.config = {};
  formatterUtils.install = function(Vue) {
    if (formatterUtils.installed) {
      return;
    }
    formatterUtils.installed = true;

    /**
     * 格式化时间 YYYY-MM-DDTHH:mm:ssZ 转换为YYYY-MM-DD HH:mm:ss
     * @param  {string} time 时间格式 YYYY-MM-DDTHH:mm:ss
     * @return {String}
     */
    Vue.tzTimeFormatter = function (dateTime) {
      if (dateTime) {
        let dateJson = new Date(dateTime).toJSON();
        let date = new Date(+new Date(dateJson) + 8*3600*1000).toISOString().replace(/T/g, " ").replace(/\.[\d]{3}Z/, "");
        return date;
      } else {
        return "";
      }
    };

    /**
     * 格式化日期，转换为固定格式，默认YYYY-MM-DD HH:mm:ss
     * @param  {string} date 日期
     * @param  {string} format 格式，默认YYYY-MM-DD HH:mm:ss
     * @return {String}
     */
    Vue.dateFormatter = function (date, format = 'YYYY-MM-DD HH:mm:ss') {
      if (date) {
        let dateJson = new Date(date.replace(/-/g, '/')).toJSON();
        let newDate = moment(+new Date(dateJson) + 8*3600*1000).format(format);
        return newDate;
      } else {
        return "";
      }
    };

    /**
     * 资源类型转换
     * @param  {string} type
     * @return {String}
     */
    Vue.resourceTypeFormatter = function (type) {
      switch (type) {
      case "OS::Nova::Server":
        return this.$t('calcStorLang.instance');
      case "OS::Nova::VM":
        return this.$t('calcStorLang.instance');
      case "OS::Neutron::LBaaS::PoolMember":
        return this.$t('heat.loadbalanceMember');
      case "OS::Neutron::LBaaS::HealthMonitor":
        return this.$t('heat.loadbalanceHealthMonitor');
      case "OS::Neutron::LBaaS::Pool":
        return this.$t('heat.loadbalancePool');
      case "OS::Neutron::LBaaS::Listener":
        return this.$t('heat.loadbalanceListener');
      case "OS::Neutron::LBaaS::LoadBalancer":
        return this.$t('network.balancer');
      case "OS::Neutron::Net":
        return this.$t('network.network');
      case "OS::Neutron::Netinside":
        return this.$t('network.externalNet');
      case "OS::Neutron::Subnet":
        return this.$t('network.subnet');
      case "OS::Neutron::Router":
        return this.$t('network.router');
      case "OS::Neutron::RouterInterface":
        return this.$t('heat.routerInterface');
      case "OS::Neutron::SecurityGroup":
        return this.$t('network.securityTeam');
      case "OS::Neutron::Port":
        return this.$t('network.port');
      case "OS::Neutron::FloatingIP": case "Magnum::FloatingIPAddressSwitcher":
        return this.$t('network.floatingIP');
      case "OS::Cinder::Volume":
        return this.$t('calcStorLang.volume');
      case "OS::Cinder::VolumeAttachment":
        return this.$t('heat.volumeAttachment');
      case "OS::Heat::AutoScalingGroup": case "OS::Heat::ResourceGroup":
        return this.$t('heat.resourceGroup');
      case "OS::Nova::Region":
        return "Region";
      case "OS::Nova::Zone":
        return Vue.t('calcStorLang.az');
      case "OS::Nova::Node":
        return Vue.t('calcStorLang.host');
      case "OS::Neutron::FirewallRule":
        return Vue.t('network.firewallRule');
      case "OS::Octavia::LoadBalancer":
        return Vue.t('network.loadbalancer');
      case "OS::Octavia::Listener":
        return Vue.t('network.listener');
      case "OS::Octavia::Pool":
        return Vue.t('network.pool');
      case "OS::Octavia::HealthMonitor":
        return Vue.t('network.healthmonitor');
      case "OS::Neutron::FirewallPolicy":
        return Vue.t('network.firewallpolicy');
      case "OS::Octavia::PoolMember":
        return Vue.t('heat.poolmember');
      case "OS::Neutron::Firewall":
        return Vue.t('network.firewall');
      case "OS::Nova::Host":
        return Vue.t('calcStorLang.physicalHost'); // 云物理机
      default:
        return type;
      }
    };

    /**
     * 根据国际化语言修改名称
     * @param  {string} type
     * @return {String}
     */
    Vue.taskNameFormatter = function (status) {
      switch (status) {
      case "start_vm" :
        return this.$t('lang.start_vm'); // 云主机
      case "stop_vm":
        return this.$t('lang.stop_vm'); // 云主机
      default:
        return status; // 默认
      }
    };

    /**
     * 根据资源类型展示拓扑图图标
     * @param  {string} type
     * @return {String}
     */
    Vue.topoImageFormatter = function (type, status, phyFlag) {
      switch (type) {
      case "OS::Nova::Host":
        return "./static/topoImages/physicalhost.png"; // 云物理机
      case "OS::Nova::Server":
        return "./static/topoImages/server.png"; // 云主机
      case "OS::Nova::VM":
        if (!phyFlag) {
          if (status === 'ACTIVE') {
            return "./static/topoImages/cloudvm-green.png";
          } else if (status === 'ERROR') {
            return "./static/topoImages/cloudvm-red.png";
          } else {
            return "./static/topoImages/cloudvm-gray.png";
          }
        } else {
          if (status === 'ACTIVE') {
            return "./static/topoImages/physicalhost-green.png"; // 云物理机
          } else if (status === 'ERROR') {
            return "./static/topoImages/physicalhost-red.png"; // 云物理机
          } else {
            return "./static/topoImages/physicalhost-gray.png"; // 云物理机
          }
        }
      case "OS::Neutron::LBaaS::PoolMember":
        return "./static/topoImages/loadbalance.png"; // 负载均衡成员
      case "OS::Neutron::LBaaS::HealthMonitor":
        return "./static/topoImages/loadbalance.png"; // 负载均衡健康检查
      case "OS::Neutron::LBaaS::Pool":
        return "./static/topoImages/loadbalance.png"; // 负载均衡资源池
      case "OS::Neutron::LBaaS::Listener":
        return "./static/topoImages/loadbalance.png"; // 负载均衡监听器
      case "OS::Neutron::LBaaS::LoadBalancer":
        return "./static/topoImages/loadbalance.png"; // 负载均衡器
      case "OS::Neutron::Net":
        return "./static/topoImages/network.png"; // 网络
      case "OS::Neutron::Netinside":
        return "./static/topoImages/networkinside.png"; // 网络
      case "OS::Neutron::Subnet":
        return "./static/topoImages/subnet.png"; // 子网
      case "OS::Neutron::Router":
        return "./static/topoImages/router.png"; // 路由器
      case "OS::Neutron::RouterInterface":
        return "./static/topoImages/routerinterface.png"; // 路由接口
      case "OS::Neutron::SecurityGroup":
        return "./static/topoImages/securitygroup.png"; // 安全组
      case "OS::Neutron::Port":
        return "./static/topoImages/port.png"; // 端口
      case "OS::Neutron::FloatingIP": case "Magnum::FloatingIPAddressSwitcher":
        return "./static/topoImages/ip.png"; // 浮动IP
      case "OS::Cinder::Volume":
        return "./static/topoImages/volume.png"; // 卷
      case "OS::Cinder::VolumeAttachment":
        return "./static/topoImages/volumeattachment.png"; // 卷挂载
      case "OS::Heat::AutoScalingGroup": case "OS::Heat::ResourceGroup":
        return "./static/topoImages/servergroup.png"; // 云主机组
      case "OS::Nova::Region":
        return "./static/topoImages/region.png";
      case "OS::Nova::Zone":
        return "./static/topoImages/az.png";
      case "OS::Nova::Node":
        return "./static/topoImages/host.png";
      case "vmMore":
        return "./static/topoImages/vmmore.png";
      case "OS::Neutron::FirewallRule":
        return "./static/topoIcons/firewallrule.png";
      case "OS::Octavia::LoadBalancer":
        return "./static/topoIcons/loadbalancer.png";
      case "OS::Octavia::Listener":
        return "./static/topoIcons/listener.png";
      case "OS::Octavia::Pool":
        return "./static/topoIcons/pool.png";
      case "OS::Octavia::HealthMonitor":
        return "./static/topoIcons/healthmonitor.png";
      case "OS::Neutron::FirewallPolicy":
        return "./static/topoIcons/firewallpolicy.png";
      case "OS::Octavia::PoolMember":
        return "./static/topoIcons/poolmember.png";
      case "OS::Neutron::Firewall":
        return "./static/topoIcons/firewall.png";
      default:
        return "./static/topoImages/default.png"; // 默认
      }
    };

    /**
     * 根据资源类型展示拓扑图图标ICON
     * @param  {string} type
     * @return {String}
     */
    Vue.topoIconFormatter = function (type) {
      switch (type) {
      case "OS::Nova::Server":
        return "./static/topoIcons/server.png"; // 云主机
      case "OS::Nova::VM":
        return "./static/topoIcons/cloudvm.png";
      case "OS::Neutron::LBaaS::PoolMember":
        return "./static/topoIcons/loadbalance.png"; // 负载均衡成员
      case "OS::Neutron::LBaaS::HealthMonitor":
        return "./static/topoIcons/loadbalance.png"; // 负载均衡健康检查
      case "OS::Neutron::LBaaS::Pool":
        return "./static/topoIcons/loadbalance.png"; // 负载均衡资源池
      case "OS::Neutron::LBaaS::Listener":
        return "./static/topoIcons/loadbalance.png"; // 负载均衡监听器
      case "OS::Neutron::LBaaS::LoadBalancer":
        return "./static/topoIcons/loadbalance.png"; // 负载均衡器
      case "OS::Neutron::Net":
        return "./static/topoIcons/network.png"; // 网络
      case "OS::Neutron::Netinside":
        return "./static/topoIcons/networkinside.png"; // 网络
      case "OS::Neutron::Subnet":
        return "./static/topoIcons/subnet.png"; // 子网
      case "OS::Neutron::Router":
        return "./static/topoIcons/router.png"; // 路由器
      case "OS::Neutron::RouterInterface":
        return "./static/topoIcons/routerinterface.png"; // 路由接口
      case "OS::Neutron::SecurityGroup":
        return "./static/topoIcons/securitygroup.png"; // 安全组
      case "OS::Neutron::Port":
        return "./static/topoIcons/port.png"; // 端口
      case "OS::Neutron::FloatingIP": case "Magnum::FloatingIPAddressSwitcher":
        return "./static/topoIcons/ip.png"; // 浮动IP
      case "OS::Cinder::Volume":
        return "./static/topoIcons/volume.png"; // 卷
      case "OS::Cinder::VolumeAttachment":
        return "./static/topoIcons/volumeattachment.png"; // 卷挂载
      case "OS::Heat::AutoScalingGroup": case "OS::Heat::ResourceGroup":
        return "./static/topoIcons/servergroup.png"; // 云主机组
      case "OS::Neutron::FirewallRule":
        return "./static/topoIcons/firewallrule.png"; // 防火墙规则
      case "OS::Octavia::HealthMonitor":
        return "./static/topoIcons/healthmonitor.png"; // 健康检查
      case "OS::Octavia::Listener":
        return "./static/topoIcons/listener.png"; // 监听器
      case "OS::Octavia::LoadBalancer":
        return "./static/topoIcons/loadbalancer.png"; // 负载均衡
      case "OS::Octavia::Pool":
        return "./static/topoIcons/pool.png"; // 资源池
      case "OS::Neutron::FirewallPolicy":
        return "./static/topoIcons/firewallpolicy.png"; // 防火墙策略
      case "OS::Octavia::PoolMember":
        return "./static/topoIcons/poolmember.png"; //资源池成员
      case "OS::Neutron::Firewall":
        return "./static/topoIcons/firewall.png"; // 防火墙
      case "OS::Nova::Host":
        return "./static/topoIcons/physicalhost.png"; // 云物理机
      default:
        return "./static/topoIcons/default.png"; // 默认
      }
    };

    /**
     * 资源状态转换
     * @param  {string} type
     * @return {String}
     */
    Vue.resourceStatusFormatter = function (status) {
      switch (status) {
      case "CREATE_FAILED":
        return this.$t("heat.CREATE_FAILED");
      case "CREATE_COMPLETE": //创建成功
        return this.$t("heat.CREATE_COMPLETE");
      case "CREATE_IN_PROGRESS":
        return this.$t("heat.CREATE_IN_PROGRESS");
      case "CHECK_COMPLETE":
        return this.$t("heat.CHECK_COMPLETE");
      case "CHECK_IN_PROGRESS":
        return this.$t("heat.CHECK_IN_PROGRESS");
      case "CHECK_FAILED":
        return this.$t("heat.CHECK_FAILED");
      case "ADOPT_COMPLETE":
        return this.$t("heat.ADOPT_COMPLETE");
      case "ADOPT_FAILED":
        return this.$t("heat.ADOPT_FAILED");
      case "ADOPT_IN_PROGRESS":
        return this.$t("heat.ADOPT_IN_PROGRESS");
      case "DELETE_COMPLETE":
        return this.$t("heat.DELETE_COMPLETE");
      case "DELETE_FAILED":
        return this.$t("heat.DELETE_FAILED");
      case "DELETE_IN_PROGRESS":
        return this.$t("heat.DELETE_IN_PROGRESS");
      case "INIT_COMPLETE":
        return this.$t("heat.INIT_COMPLETE");
      case "INIT_FAILED":
        return this.$t("heat.INIT_FAILED");
      case "INIT_IN_PROGRESS":
        return this.$t("heat.INIT_IN_PROGRESS");
      case "RESUME_COMPLETE": //恢复完成
        return this.$t("heat.RESUME_COMPLETE");
      case "RESUME_FAILED": //恢复失败
        return this.$t("heat.RESUME_FAILED");
      case "RESUME_IN_PROGRESS":
        return this.$t("heat.RESUME_IN_PROGRESS");
      case "ROLLBACK_COMPLETE":
        return this.$t("heat.ROLLBACK_COMPLETE");
      case "ROLLBACK_FAILED":
        return this.$t("heat.ROLLBACK_FAILED");
      case "ROLLBACK_IN_PROGRESS":
        return this.$t("heat.ROLLBACK_IN_PROGRESS");
      case "SNAPSHOT_COMPLETE":
        return this.$t("heat.SNAPSHOT_COMPLETE");
      case "SNAPSHOT_FAILED":
        return this.$t("heat.SNAPSHOT_FAILED");
      case "SNAPSHOT_IN_PROGRESS":
        return this.$t("heat.SNAPSHOT_IN_PROGRESS");
      case "SUSPEND_COMPLETE": //挂起成功
        return this.$t("heat.SUSPEND_COMPLETE");
      case "SUSPEND_FAILED": //挂起失败
        return this.$t("heat.SUSPEND_FAILED");
      case "SUSPEND_IN_PROGRESS":
        return this.$t("heat.SUSPEND_IN_PROGRESS");
      case "UPDATE_COMPLETE":
        return this.$t("heat.UPDATE_COMPLETE");
      case "UPDATE_FAILED":
        return this.$t("heat.UPDATE_FAILED");
      case "UPDATE_IN_PROGRESS":
        return this.$t("heat.UPDATE_IN_PROGRESS");
      default:
        return status;
      }
    };

    /**
     * 字符串去重
     * @param  {String} str [要去重的字符串]
     * @return {String}     [去重之后的结果]
     */
    Vue.strDuplicateRemoval = function(str) {
      let newStr = "";
      for (var i = 0; i < str.length; i++) {
        if (newStr.indexOf(str[i]) == -1) {
          newStr += str[i];
        }
      }
      return newStr;
    };

    // 添加实例方法
    Vue.prototype.$tzTimeFormatter = function(dateTime) {
      return Vue.tzTimeFormatter.call(this, dateTime);
    };
    Vue.prototype.$dateFormatter = function(date, format) {
      return Vue.dateFormatter.call(this, date, format);
    };
    Vue.prototype.$resourceTypeFormatter = function(type) {
      return Vue.resourceTypeFormatter.call(this, type);
    };
    Vue.prototype.$resourceStatusFormatter = function(status) {
      return Vue.resourceStatusFormatter.call(this, status);
    };
    Vue.prototype.$topoImageFormatter = function(status) {
      return Vue.topoImageFormatter.call(this, status);
    };
    Vue.prototype.$topoIconFormatter = function(status) {
      return Vue.topoIconFormatter.call(this, status);
    };
    Vue.prototype.$taskNameFormatter = function(name) {
      return Vue.taskNameFormatter.call(this, name);
    };
    Vue.prototype.$strDuplicateRemoval = function(str) {
      return Vue.strDuplicateRemoval.call(this, str);
    };
  };

  if (typeof exports === "object") {
    module.exports = formatterUtils;
  } else if (typeof define === "function" && define.amd) {
    define([], function () {
      return formatterUtils;
    });
  } else if (window.Vue) {
    window.formatterUtils = formatterUtils;
    Vue.use(formatterUtils);
  }
})();

