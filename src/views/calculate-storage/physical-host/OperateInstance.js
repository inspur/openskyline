module.exports = function() {
  return [{
      icon: "fa-plus",
      name: Vue.t("calcStorLang.create"),
      showflg: Vue.roleType + "" == "0" || Vue.roleType + "" === "2",
      readOnly: true,
      handler: function(selectRows) {
        //创建
        this.addFlag = true;
      }.bind(this)
    }, {
      icon: "fa-plus",
      name: Vue.t("calcStorLang.apply"),
      showflg: Vue.roleType + "" != "0" && Vue.roleType + "" !== "2",
      readOnly: true,
      handler: function(selectRows) {
        this.applyFlag = true;
      }.bind(this)
    },
    /*{
       icon: "fa-plus",
       name: "控制台",
       showflg: true,
       handler: function(selectRows) {
         //
       }.bind(this)
     },*/
    {
      icon: "fa-play",
      name: Vue.t("base.start"),
      multi: true,
      showflg: true,
      enable(rowData) {
        if ((Vue.roleType + "") != "0" && rowData['locked'] == true) {
           return false;
        }
        return (rowData['status'] == "SHUTOFF" && rowData['OS-EXT-STS:task_state'] == null);
      },
      handler: async function(selectRows) {
        var self = this;
        var body = { "os-start": null };
        body = JSON.stringify(body);
        self.$sequence({
          type: 'post',
          data: body,
          url: 'api/nova/v2.1/servers/{id}/action',
          params: selectRows,
          confirmMsg: Vue.t('calcStorLang.openPhysicalHostConfirm'),
          log: {
                  description: {
                    en: "Start Instance",
                    zh_cn: "开启云物理机"
                  },
                  key: "name",
                  target: Vue.logTarget.computePhysical
               }
          // successMsg: "开启发送成功",
        }).then((data) => {
          self.loading = true;
          for (var r = 0; r < selectRows.length; r++) {
              var row = selectRows[r];
              var instance = self.instanceMaps.get(row.id);
              instance['OS-EXT-STS:task_state'] = "BUSY";
          }
          self.$message(Vue.t("calcStorLang.openSendSuccess"));
          self.$refs.umTable.clearSelection();
          self.currentPage = 1;
          setTimeout( function() {
            self.getData({
              page: 1
            });
            self.loading = false;
          }, 5000);
        }).catch((err) => {});
      }.bind(this)
    }, {
      icon: "fa-stop",
      name: Vue.t("base.shutdown"),
      multi: true,
      showflg: true,
      enable(rowData) {
        if ((Vue.roleType + "") != "0" && rowData['locked'] == true) {
          return false;
        }
        return (rowData['status'] == "ACTIVE" && rowData['OS-EXT-STS:task_state'] == null);
      },
      handler: async function(selectRows) {
        var self = this;
        var body = { "os-stop": null };
        body = JSON.stringify(body);
        self.$sequence({
          type: 'post',
          data: body,
          url: 'api/nova/v2.1/servers/{id}/action',
          params: selectRows,
          confirmMsg: Vue.t("calcStorLang.closePhysicalHostConfirm"),
          log: {
            description: {
              en: "Shutdown Instance",
              zh_cn: "关闭云物理机"
            },
            key: "name",
            target: Vue.logTarget.computePhysical
          }
        }).then((data) => {
          self.loading = true;
          for (var r = 0; r < selectRows.length; r++) {
            var row = selectRows[r];
            var instance = self.instanceMaps.get(row.id);
            instance['OS-EXT-STS:task_state'] = "BUSY";
          }
          self.$message(Vue.t("calcStorLang.closeSendSuccess"));
          self.$refs.umTable.clearSelection();
          self.currentPage = 1;
          setTimeout( function() {
            self.getData({
              page: 1
            });
            self.loading = false;
          }, 8000);
        }).catch((err) => {});
      }.bind(this)
    }, {
      icon: "fa-refresh",
      name: Vue.t("calcStorLang.physicalForcedRestart"),
      multi: true,
      showflg: true,
      enable(rowData) {
        if (rowData['locked'] == true) {
          return false;
        }
        return ((rowData['status'] == "ACTIVE" || rowData['status'] == "SHUTOFF" || rowData['status'] == "PAUSED" || rowData['status'] == "SUSPENDED") && rowData['OS-EXT-STS:task_state'] == null);
      },
      handler: async function(selectRows) {
        let self = this;
        let body = { "reboot": { "type": "HARD" } };
        body = JSON.stringify(body);
        self.$sequence({
          type: 'post',
          data: body,
          url: 'api/nova/v2.1/servers/{id}/action',
          params: selectRows,
          errorKey: "conflictingRequest",
          confirmMsg: Vue.t("calcStorLang.rebootPhysicalConfirm"),
          log: {
            description: {
              en: "Reboot Instance",
              zh_cn: "重启云物理机"
            },
            key: "name",
            target: Vue.logTarget.computePhysical
          }
        }).then((data) => {
          self.loading = true;
          for (let r = 0; r < selectRows.length; r++) {
            let row = selectRows[r];
            let instance = self.instanceMaps.get(row.id);
            instance['OS-EXT-STS:task_state'] = "BUSY";
          }
          self.$message(Vue.t("calcStorLang.rebootSuccess"));
          self.$refs.umTable.clearSelection();
          self.currentPage = 1;
          setTimeout( function() {
            self.getData({
              page: 1
            });
            self.loading = false;
          }, 5000);
        }).catch((err) => {});
      }.bind(this)
    }, {
      icon: "fa-meh-o",
      name: Vue.t('network.bangdingFloatingip'),
      showflg: (Vue.roleType + "" != "3"),
      multi: false,
      operateMore: true,
      // operateMore: true,
      enable(rowData) {
        var self = this;
        if ((Vue.roleType + "") != "0" && rowData['locked'] == true) {
           return false;
        }
        var status = rowData['status'] + "";
        if (status == "ACTIVE" || status == "SHUTOFF" || status == "PAUSED" || status == "SUSPENDED") {
          var floatingId;
          var row = rowData;
          var addresses = row.addresses;
          for (var key in addresses) {
            var net = addresses[key];
              for (let i = net.length - 1; i >= 0; i--) {
                var ip = net[i];
                if (ip != null && ip['OS-EXT-IPS:type'] === 'floating') {
                  return false;
                }
             }
          }
          return true;
        } else {
          return false;
        }
      },
      handler: function(selectRows) {
        var row = selectRows[0];
        this.instUuid = row.id;
        this.projectId = row["tenant_id"];
        this.instanceName = row["name"];
        this.floatFlag = true;
      }.bind(this)
    }, {
      icon: "fa-stop",
      name: Vue.t('calcStorLang.unbangdingfloating'),
      multi: false,
      operateMore: true,
      showflg: (Vue.roleType + "" != "3"),
      // operateMore: true,
      enable(rowData) {
        var self = this;
        if ((Vue.roleType + "") != "0" && rowData['locked'] == true) {
           return false;
        }
        var status = rowData['status'] + "";
        if (status == "ACTIVE" || status == "SHUTOFF" || status == "PAUSED" || status == "SUSPENDED") {
          var floatingId;
          var row = rowData;
          var addresses = row.addresses;
          for (var key in addresses) {
            var net = addresses[key];
              for (let i = net.length - 1; i >= 0; i--) {
                var ip = net[i];
                if (ip != null && ip['OS-EXT-IPS:type'] === 'floating') {
                  return true;
                }
             }
          }
            return false;
          } else {
            return false;
          }
      },
      handler: async function(selectRows) {
        var self = this;
        var row = selectRows[0];
        let showips = "";
        let floatingId;
        var tenantId = row.tenant_id;
        var addresses = row.addresses;
        let havefloating = false;
        var body = { "floatingip": { } };
        body = JSON.stringify(body);
        self.$confirm(Vue.t('calcStorLang.unBingFloatIpConfirm'), Vue.t('network.attention'), {
          confirmButtonText: Vue.t('lang.confirm'),
          cancelButtonText: Vue.t('lang.cancel'),
          type: "warning",
          callback: (action, instance) => {
            if (action === "confirm") {
              //获取详情，看看浮动IP还在不在
              self.$ajax({
                type: 'get',
                url: "api/nova/v2.1/servers-inspur/" + row["id"],
                success: function(vmdatails) {
                  let vmdatail = vmdatails['server'];
                  let address = vmdatail['addresses'];
                  let status = vmdatail['status'];
                  if (status == "SHELVED_OFFLOADED" || status == "SHELVED") {
                    self.$notify.error({
                      message: Vue.t('network.cloudvmstatusdelete')
                    });
                    setTimeout( function() {
                        self.getData({
                          page: 1
                        });
                        self.loading = false;
                      }, 1000);
                    self.$refs.umTable.clearSelection();
                  } else {
                    for (let a in address) {
                    for ( let i in address[a]) {
                      if (address[a][i]['OS-EXT-IPS:type'] === 'floating') {
                        havefloating = true;
                        for (var key in addresses) {
                          var net = addresses[key];
                          for (let i = net.length - 1; i >= 0; i--) {
                            var ip = net[i];
                            if (ip != null && ip['OS-EXT-IPS:type'] === 'floating') {
                              var floatingIP = ip['addr'];
                              showips += floatingIP+"  ";
                            }
                          }
                        }
                      }
                    }
                  }
                  if (!havefloating) {
                    self.$notify.error({
                      message: Vue.t('calcStorLang.instBindingFloatIpTip1')
                    });
                    setTimeout( function() {
                        self.getData({
                          page: 1
                        });
                        self.loading = false;
                      }, 1000);
                    self.$refs.umTable.clearSelection();
                  } else {
                    instance.confirmButtonLoading = true;
                    self.$ajax({
                      type: "get",
                      url: "api/neutron/v2.0/floatingips?floating_ip_address="+floatingIP+"&project_id="+tenantId,
                      data: body,
                      success: function(result) {
                        floatingId= result["floatingips"][0].id;
                        self.$ajax({
                          type: "PUT",
                          url: "api/neutron/v2.0/floatingips/"+floatingId,
                          data: body,
                          complete: function(XMLHttpRequest, textStatus) {
                            instance.confirmButtonLoading = false;
                            self.loading = true;
                            setTimeout( function() {
                              self.$refs.umTable.clearSelection();
                              self.getData({
                                page: 1
                              });
                              self.loading = false;
                            }, 2000);
                            setTimeout(function() {
                              self.$refs.umTable.clearSelection();
                              self.getData({
                                page: 1
                              });
                            }, 5000);
                            setTimeout(function() {
                              self.getData({
                                page: 1
                              });
                            }, 8000);
                          },
                          success: function(result) {
                            self.$message.success(Vue.t('calcStorLang.instRecyFloatIpSucess'));
                            self.$refs.umTable.clearSelection();
                          },
                          errorKey: "NeutronError",
                          log:{
                            description:{
                              en:row["name"]+" Remove floating IP:" + showips,
                              zh_cn:row["name"]+" 解除绑定浮动IP:" + showips
                            },
                            target:Vue.logTarget.computePhysical
                          }
                        });
                      },
                      errorKey: "NeutronError"
                    });
                  }
                  }
                }
              });
            }
          }
        });
      }.bind(this)
    }, {
      icon: "fa-pencil-square-o",
      name: Vue.t("calcStorLang.rename"),
      showflg: true,
      multi: false,
      enable(rowData) {
        if ((Vue.roleType + "") != "0") {
          return rowData['locked'] == false;
        } else {
          return true;
        }
      },
      handler: function(selectRows) {
        var row = selectRows[0];
        this.instanceName = row.name;
        this.instUuid = row.id;
        this.description = row.id;
        this.editFlag = true;
      }.bind(this)
    }, {
      icon: "fa-times",
      name: Vue.t("base.delete"),
      showflg: true,
      multi: true,
      enable(rowData) {
        if (String(Vue.roleType) !== "0") {
          return rowData['locked'] === false;
        } else {
          return true;
        }
      },
      handler: function(selectRows) {
        var $this = this;
        $this.deleteInstancesDialog.instances = selectRows;
        $this.deleteInstancesDialog.visible = true;
      }.bind(this)
    }, {
      icon: "fa-retweet",
      name: Vue.t('calcStorLang.instMountOrUnMountDisk'),
      showflg: this.$archIs('x86'),
      multi: false,
      operateMore: true,
      enable(rowData) {
        if ((Vue.roleType + "") != "0") {
          return ((rowData["OS-EXT-STS:power_state"] === 1 && (!rowData["OS-EXT-STS:task_state"]) && rowData["OS-EXT-STS:vm_state"] === "active") && rowData['locked'] == false);
        } else {
          return (rowData["OS-EXT-STS:power_state"] === 1 && (!rowData["OS-EXT-STS:task_state"]) && rowData["OS-EXT-STS:vm_state"] === "active");
        }
      },
      handler: function(selectRows) {
        const row = selectRows[0];
        this.hostEntity = row;
        this.volumeFlag = true;
      }.bind(this)
    }, {
      icon: "fa-pencil-square-o",
      name: Vue.t("calcStorLang.resetPassword"),
      showflg: this.$archIs('x86'),
      multi: false,
      enable(rowData) {
        if (Vue.userId != rowData['user_id'] || !(rowData['status'] === "ACTIVE")) {
          return false;
        } else {
          return true;
        }
      },
      handler: function(selectRows) {
        var row = selectRows[0];
        this.instanceName = row.name;
        this.instUuid = row.id;
        this.description = row.id;
        this.changePasswordFlag = true;
      }.bind(this)
    }
  ];
};
