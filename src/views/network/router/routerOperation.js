module.exports = function() {
  return [{
    icon: "fa-plus",
    name: Vue.t('network.createRouter'),
    showflg: true,
    readOnly: true,
    handler: function(selectRows) {
      this.addFlag = true;
    }.bind(this)
  }, {
    icon: "fa-edit",
    name: Vue.t('network.modify'),
    showflg: true,
    enable(rowData) {
      return true;
    },
    handler: function(selectRows) {
      var self = this;
      this.editFlag = true;
      var row = selectRows[0];
      self.editname = row["name"];
      self.editdesc = row["description"];
      self.editrouterid = row["id"];
      self.editadminstateup = row["admin_state_up"];
    }.bind(this)
  }, {
    icon: "fa-times",
    name: Vue.t('network.delete'),
    showflg: true,
    multi: true,
    enable(rowData) {
      return true;
    },
    handler: function(selectRows) {
      let self = this;
      this.$prompt(Vue.t('network.confirmDelete'), Vue.t('network.attention'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        inputPattern:/^YES$|^NO$/i,
        inputValue: "NO",
        customClass: "promptConfirmDel",
        inputErrorMessage:Vue.t('lang.onlyAcceptYesOrNo')
      }).then(async({ value }) => {
        if ("yes" == value.toLowerCase()) {
          // self.$sequence({
          //   type: 'delete',
          //   url: 'api/neutron/v2.0/routers/{id}',
          //   params: selectRows,
          //   log:{
          //     description:{
          //       en:"Delete Router",
          //       zh_cn:"删除路由"
          //     },
          //     key: "name",
          //     target:Vue.logTarget.router
          //   }
          // }).then((data) => {
          //   self.$message(Vue.t('network.deleteSendSuccess'));
          //   self.$refs.routerTable.clearSelection();
          //   self.loading = true;
          //   setTimeout( function() {
          //     self.getData();
          //     self.loading = false;
          //   }, 5000);
          // }).catch((err) => {
          //   ssetTimeout( function() {
          //     self.getData();
          //     self.loading = false;
          //   }, 5000)
          // });
          for (let i = 0; i < selectRows.length; i++) {
            let row = selectRows[i];
            self.$ajax({
              type: "DELETE",
              url: "api/neutron/v2.0/routers/"+row["id"],
              data: {},
              success: function() {
                self.$notify({
                  message: row["name"]+Vue.t('network.deleteSendSuccess'),
                  type: "success"
                });
                self.getData();
              },
              errFun() {
                self.getData();
              },
              log:{
                description:{
                  en:"Delete Router:"+row["name"],
                  zh_cn:"删除路由:"+row["name"]
                },
                target:Vue.logTarget.router
              },
              errorKey: "NeutronError"
            });
          }
        }
      }).catch(() => {
          //取消
          self.getData();
      });
    }.bind(this)
  }, {
    icon: "fa-edit",
    name: Vue.t('network.setGateway'),
    showflg: true,
    enable(rowData) {
      if (rowData["external_gateway_info"]===null) {
        return true;
      } else {
        return false;
      }
    },
    handler: function(selectRows) {
      var self = this;
      var row = selectRows[0];
      this.setgateFlag = true;
      self.editExternalgateway = row["external_gateway_info"];
      self.editname = row["name"];
      self.editrouterid = row["id"];
      self.editprojectid = row["project_id"];
    }.bind(this)
  }, {
    icon: "fa-square-o",
    name: Vue.t('network.clearGateway'),
    showflg: true,
    multi: false,
    enable(rowData) {
      if (rowData["external_gateway_info"]===null) {
        return false;
      } else {
        return true;
      }
    },
    handler: function(selectRows) {
      var self = this;
      var row = selectRows[0];
      self.$confirm(Vue.t('network.confirmCleanGateway'), Vue.t('network.attention'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        type: "warning",
        callback(action, instance) {
          if (action === "confirm") {
            self.$ajax({
              type: "GET",
              url: "api/neutron/v2.0/routers/" + row["id"]+"?fields=external_gateway_info",
              errFun: function(xhr, status) {
                self.getData();
              },
              success: function(ret) {
                // console.log('---external_gateway_info---'+ret['router'].external_gateway_info);
                if (ret['router'].external_gateway_info == null) {
                    self.$message({
                      message: Vue.t('network.clearGatewayerror')+row["name"],
                      type: "error"
                    });
                    self.$recordLog({
                      target:Vue.logTarget.router,
                      level:{
                        en:"error",
                        zh_cn:"错误"
                      },
                      description:{
                        en:"Clear gateway "+row["name"]+" failed",
                        zh_cn:"清除网关"+row["name"]+"失败"
                      }
                    });
                    self.getData();
                    self.$refs.routerTable.clearSelection();
                } else {
                  let reqdata = {
                            "router": {
                              "external_gateway_info": {
                              }
                            }
                          };
                  self.$ajax({
                    type: "PUT",
                    url: "api/neutron/v2.0/routers/" + row["id"],
                    data: JSON.stringify(reqdata),
                    successMsg: Vue.t('network.clearGatewaysuccess'),
                    success: function(result) {
                      self.getData();
                      self.$refs.routerTable.clearSelection();
                    },
                    errFun() {
                      self.getData();
                    },
                    errorKey: "NeutronError",
                    log:{
                      description:{
                        en:"Router" + row["name"] + "Clear Gateway",
                        zh_cn:"路由" + row["name"] + "清除网关"
                      },
                      target:Vue.logTarget.router
                    }
                  });
                }
              },
              errorKey: "NeutronError"
            });
          }
        }
      }).then(() => {
      }).catch((err) => {
        console.log(err);
      });
    }.bind(this)
  }];
};
