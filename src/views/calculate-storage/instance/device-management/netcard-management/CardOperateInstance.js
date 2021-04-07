module.exports = function() {
  return [{
    icon: "fa-plus",
    name: Vue.t('calcStorLang.netConfigAddCard'),
    showflg: true,
    readOnly: true,
    handler: function(selectRows) {
        //创建
      this.addFlag = true;
    }.bind(this)
  }, {
    icon: "fa-times",
    name: Vue.t('calcStorLang.netConfigDepCard'),
    showflg: true,
    enable(rowData) {
      return true;
    },
    handler: function(selectRows) {
      var self = this;
      var netCardName = self.netCardMaps.get(selectRows[0].net_id) || selectRows[0].net_id;
      let port = self.portCardMaps.get(selectRows[0].port_id);
      console.log(selectRows);
      console.log(port);
      if (port && port['binding:vnic_type'] === 'direct') {
        self.$message.warning('您选择的端口是直连类型端口，暂不支持分离。');
        return false;
      }
      try {
        self
          .$ajax({
            type: 'delete',
            url: 'api/nova/v2.1/servers/' + self.hostEntity['id'] + '/os-interface/'+selectRows[0].port_id,
            params: selectRows,
            confirmMsg: "确定删除所选择的网卡？",
            log: {
              description: {
                en: "Separate Netcard(net: " + netCardName + ")" + self.hostEntity['name'],
                zh_cn: "网卡配置:分离网卡(网络:" + netCardName + ")从云主机:" + self.hostEntity['name']
              },
              target: Vue.logTarget.computeInstance
            },
            successFun(data) {
            }
          }).then((data) => {
            setTimeout(function() {
              self.getData();
            }, 8000);
            self.loading = true;
            self.$message(Vue.t("lang.sendDeleteSuccess"));
          }).catch((err) => {});
      } catch (res) {
        self.loading = false;
      }
    }.bind(this)
  }, {
    icon: "fa-cog",
    name: Vue.t('calcStorLang.netConfigQosConfig'),
    showflg: true,
    enable(rowData) {
      return true;
    },
    handler: function(selectRows) {
      this.qosConfigFlag = true;
      this.selectRows = selectRows;
    }.bind(this)
  }
  ];
};
