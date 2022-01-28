module.exports = function() {
  return [{
    icon: "fa-plus",
    name: (Vue.roleType + "" !== "3") ? Vue.t('calcStorLang.create') : Vue.t('calcStorLang.applyInstance'),
    showflg: true,
    readOnly: true,
    handler: function(selectRows) {
      this.createInstanceDialog.visible = true;
    }.bind(this)
  }, {
    icon: "fa-plus-square",
    name: Vue.t('calcStorLang.BATCH_CREATE'),
    showflg: (Vue.roleType + "" === "0"),
    readOnly: true,
    handler: function(selectRows) {
      this.batchCreateInstances.show = true;
    }.bind(this)
  },
  {
    icon: "fa-play",
    name: Vue.t('base.start'),
    multi: true,
    showflg: true,
    enable(rowData) {
      if (rowData['locked'] === true) {
        return false;
      }
      return (rowData['status'] === "SHUTOFF" && rowData['OS-EXT-STS:task_state'] === null);
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
        confirmMsg: Vue.t('calcStorLang.openInstConfirm'),
        log: {
          description: {
            en: "Start Instance",
            zh_cn: "开启云主机"
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
          // successMsg: "开启发送成功",
      }).then((data) => {
        for (var r = 0; r < selectRows.length; r++) {
          var row = selectRows[r];
          var instance = self.instanceMaps.get(row.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.openSendSuccess'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    icon: "fa-stop",
    name: Vue.t('base.shutdown'),
    multi: true,
    showflg: true,
    enable(rowData) {
      if (rowData['status'] === "CRASHED") {
        return true;
      }
      if (rowData['locked'] === true) {
        return false;
      }
      return (rowData['status'] === "ACTIVE" && rowData['OS-EXT-STS:task_state'] === null);
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
        confirmMsg: Vue.t('calcStorLang.closeInstConfirm'),
        log: {
          description: {
            en: "Shutdown Instance",
            zh_cn: "关闭云主机"
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
      }).then((data) => {
        for (var r = 0; r < selectRows.length; r++) {
          var row = selectRows[r];
          var instance = self.instanceMaps.get(row.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.closeSendSuccess'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    icon: "fa-pencil-square-o",
    name: Vue.t('calcStorLang.rename'),
    showflg: (Vue.roleType + "" !== "3"),
    multi: false,
    enable(rowData) {
      return rowData['locked'] === false;
    },
    handler: function(selectRows) {
      var row = selectRows[0];
      this.instanceName = row.name;
      this.instUuid = row.id;
      this.renameFlag = true;
    }.bind(this)
  }, {
    icon: "fa-times",
    name: Vue.t('calcStorLang.delete'),
    showflg: true,
    multi: true,
    enable(rowData) {
      return rowData['locked'] === false;
    },
    handler: function(selectRows) {
      var $this = this;
      $this.deleteInstancesDialog.instances = selectRows;
      $this.deleteInstancesDialog.visible = true;
    }.bind(this)
  }, {
    icon: "fa-retweet",
    name: Vue.t('calcStorLang.instReconstruction'),
    showflg: (Vue.roleType + "" !== "3"),
    multi: false,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['locked'] === true) {
        return false;
      }
      return (rowData['status'] === "ACTIVE" || rowData['status'] === "SHUTOFF");
    },
    handler: function(selectRows) {
      var row = selectRows[0];
      this.instUuid = row.id;
      this.instProjectId = row['tenant_id'];
      this.instUserId = row['user_id'];
      this.instanceName = row['name'];
      this.reconFlag = true;
    }.bind(this)
  }, {
    icon: "fa-retweet",
    name: Vue.t('calcStorLang.instCreateSnapshot'),
    showflg: true,
    multi: false,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      var self = this;
      var status = rowData['status'];
      if (String(Vue.roleType) !== "0") {
        return ((status === "ACTIVE" || status === "SHUTOFF" || status === "PAUSED" || status === "SUSPENDED") && rowData['locked'] === false);
      } else {
        return (status === "ACTIVE" || status === "SHUTOFF" || status === "PAUSED" || status === "SUSPENDED");
      }
    },
    handler: function(selectRows) {
      var row = selectRows[0];
      this.instUuid = row.id;
      this.creIsoFlag = true;
    }.bind(this)
  }, {
    icon: 'fa-meh-o',
    name: Vue.t('calcStorLang.DEVICE_MANAGEMENT'),
    showflg: true,
    multi: true,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (Vue.roleType + '' === '0') {
        return (rowData.status === 'ACTIVE' || rowData.status === 'SHUTOFF');
      } else {
        return ((rowData.status === 'ACTIVE' || rowData.status === 'SHUTOFF') && !rowData.locked);
      }
    },
    handler: function(selectRows) {
      if (selectRows.length === 1) {
        this.deviceManagementDialog.instances = selectRows;
        this.deviceManagementDialog.visible = true;
      } else if (selectRows.length > 1 && selectRows.length <= 50) {
        this.batchDeviceManagementDialog.instances = selectRows;
        this.batchDeviceManagementDialog.visible = true;
      } else {
        this.$message.warning(this.$t('calcStorLang.DEVICE_MANAGEMENT_MOST_TIPS'));
      }
    }.bind(this)
  }, {
    icon: "fa-meh-o",
    name: Vue.t('calcStorLang.instMigrate'),
    showflg: (Vue.roleType + "" === "0"),
    multi: true,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return (rowData['status'] === "ACTIVE" || rowData['status'] === "SHUTOFF");
    },
    handler: function(selectRows) {
      if (selectRows.length > 1) {
        let hosts = selectRows.map(item => {
          return item['OS-EXT-SRV-ATTR:hypervisor_hostname'];
        });
        hosts = Array.from(new Set(hosts));
        if (hosts.length > 1) {
          this.$message.warning(this.$t('calcStorLang.MIGRATE_SAME_HOST_TIPS'));
          return;
        }
      }
      if (selectRows.length > 10) {
        this.$message.warning(this.$t('calcStorLang.MIGRATE_MAX_TIPS'));
        return;
      }
      this.migrateDialog.instances = selectRows;
      this.migrateDialog.type = 'offline';
      this.migrateDialog.visible = true;
    }.bind(this)
  }, {
    icon: "fa-meh-o",
    name: Vue.t('calcStorLang.instOnlineMigrate'),
    showflg: (Vue.roleType + "" === "0"),
    multi: true,
    operateMore: true,
    enable(rowData) {
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return (( rowData['status'] === "ACTIVE" || rowData['status'] === "PAUSED") && rowData['OS-EXT-STS:task_state'] === null);
    },
    handler: function(selectRows) {
      if (selectRows.length > 1) {
        let hosts = selectRows.map(item => {
          return item['OS-EXT-SRV-ATTR:hypervisor_hostname'];
        });
        hosts = Array.from(new Set(hosts));
        if (hosts.length > 1) {
          this.$message.warning(this.$t('calcStorLang.MIGRATE_SAME_HOST_TIPS'));
          return;
        }
      }
      if (selectRows.length > 10) {
        this.$message.warning(this.$t('calcStorLang.MIGRATE_MAX_TIPS'));
        return;
      }
      this.migrateDialog.instances = selectRows;
      this.migrateDialog.type = 'online';
      this.migrateDialog.visible = true;
    }.bind(this)
  }, {
    id: Symbol.for('restart'),
    icon: "fa-meh-o",
    name: Vue.t('calcStorLang.instRestart'),
    showflg: (Vue.roleType + "" !== "3"),
    operateMore: true,
    enable(rowData) {
      return true;
    }
  }, {
    pId: Symbol.for('restart'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instSoftRestart'),
    showflg: (Vue.roleType + "" !== "3"),
    multi: true,
    operateMore: true,
    enable(rowData) {
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return ((Vue.roleType + '' !== '3') && rowData['status'] === "ACTIVE" && rowData['OS-EXT-STS:task_state'] === null);
    },
    handler: async function(selectRows) {
      var self = this;
      let hasHotPlug = false;
      let hotPlugInstances = [];
      selectRows.forEach(row => {
        if (row.tags.findIndex(tag => tag === "HOTPLUG") > -1) {
          hasHotPlug = true;
          hotPlugInstances.push(row.name);
        }
      });
      if (!hasHotPlug) {
        var body = { "reboot": { "type": "SOFT" } };
        body = JSON.stringify(body);
        self.$sequence({
          type: 'post',
          data: body,
          url: 'api/nova/v2.1/servers/{id}/action',
          params: selectRows,
          errorKey: "conflictingRequest",
          confirmMsg: Vue.t('calcStorLang.softRebootInstConfirm'),
          log: {
            description: {
              en: "SoftReboot Instance",
              zh_cn: "软重启云主机"
            },
            key: "name",
            target: Vue.logTarget.computeInstance
          }
        }).then((data) => {
          for (var r = 0; r < selectRows.length; r++) {
            var row = selectRows[r];
            var instance = self.instanceMaps.get(row.id);
            instance['OS-EXT-STS:task_state'] = "BUSY";
          }
          self.$message(Vue.t('calcStorLang.softRebootSuccess'));
          self.$refs.umTable.clearSelection();
        }).catch((err) => {});
      } else {
        self.$alert(Vue.t('calcStorLang.cannotSoftRestartBecauseHotPlug').replace('%s', hotPlugInstances.join(', ')), {
          type: 'info'
        });
      }
    }.bind(this)
  }, {
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instHardRestart'),
    multi: false,
    showflg: (Vue.roleType + "" === "3"),
    operateMore: true,
    enable(rowData) {
      if (rowData['status'] === "CRASHED") {
        return true;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return ((rowData['status'] === "ACTIVE" || rowData['status'] === "SHUTOFF" || rowData['status'] === "PAUSED" || rowData['status'] === "SUSPENDED") && rowData['OS-EXT-STS:task_state'] === null);
    },
    handler: async function(selectRows) {
      var self = this;
      var body = { "reboot": { "type": "HARD" } };
      body = JSON.stringify(body);
      self.$sequence({
        type: 'post',
        data: body,
        url: 'api/nova/v2.1/servers/{id}/action',
        params: selectRows,
        errorKey: "conflictingRequest",
        confirmMsg: Vue.t('calcStorLang.hardRebootInstConfirm'),
        log: {
          description: {
            en: "HardReboot Instance",
            zh_cn: "硬重启云主机"
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
      }).then((data) => {
        for (var r = 0; r < selectRows.length; r++) {
          var row = selectRows[r];
          var instance = self.instanceMaps.get(row.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.hardRebootSuccess'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    pId: Symbol.for('restart'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instHardRestart'),
    multi: false,
    showflg: true,
    operateMore: true,
    enable(rowData) {
      if (rowData['status'] === "CRASHED") {
        return true;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return ((rowData['status'] === "ACTIVE" || rowData['status'] === "SHUTOFF" || rowData['status'] === "PAUSED" || rowData['status'] === "SUSPENDED") && rowData['OS-EXT-STS:task_state'] === null);
    },
    handler: async function(selectRows) {
      var self = this;
      var body = { "reboot": { "type": "HARD" } };
      body = JSON.stringify(body);
      self.$sequence({
        type: 'post',
        data: body,
        url: 'api/nova/v2.1/servers/{id}/action',
        params: selectRows,
        errorKey: "conflictingRequest",
        confirmMsg: Vue.t('calcStorLang.hardRebootInstConfirm'),
        log: {
          description: {
            en: "HardReboot Instance",
            zh_cn: "硬重启云主机"
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
      }).then((data) => {
        for (var r = 0; r < selectRows.length; r++) {
          var row = selectRows[r];
          var instance = self.instanceMaps.get(row.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.hardRebootSuccess'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    icon: "fa-stop",
    name: Vue.t('calcStorLang.FORCE_SHUTDOWN'),
    multi: true,
    showflg: false,
    operateMore: true,
    enable(rowData) {
      if (rowData['status'] === "CRASHED") {
        return true;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return (rowData['status'] === "ACTIVE" && rowData['OS-EXT-STS:task_state'] === null);
    },
    handler: async function(selectRows) {
      var self = this;
      var body = { "os-stop-hard": null };
      body = JSON.stringify(body);
      self.$sequence({
        type: 'post',
        data: body,
        url: 'api/nova/v2.1/servers/{id}/action',
        params: selectRows,
        confirmMsg: Vue.t('calcStorLang.FORCE_SHUTDOWN_CONFIRM'),
        log: {
          description: {
            en: "Force Shutdown Instance",
            zh_cn: "强制关闭云主机"
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
      }).then((data) => {
        for (var r = 0; r < selectRows.length; r++) {
          var row = selectRows[r];
          var instance = self.instanceMaps.get(row.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.FORCE_SHUTDOWN_SUCCESSFULLY'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    id: Symbol.for('status'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.STATUS_MANAGEMENT'),
    showflg: (Vue.roleType + "" !== "3"),
    readOnly: true,
    operateMore: true,
    handler: async function(selectRows) {
    }.bind(this)
  }, {
    pId: Symbol.for('status'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.suspend'),
    showflg: (Vue.roleType + "" !== "3"),
    operateMore: true,
    enable(rowData) {
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return (rowData['status'] === "ACTIVE" && rowData['OS-EXT-STS:task_state'] === null);
    },
    handler: async function(selectRows) {
      var self = this;
      var body = { "suspend": null };
      body = JSON.stringify(body);
      self.$sequence({
        type: 'post',
        data: body,
        url: 'api/nova/v2.1/servers/{id}/action',
        params: selectRows,
        confirmMsg: Vue.t('calcStorLang.suspendInstConfirm'),
        log: {
          description: {
            en: "Suspend Instance",
            zh_cn: "挂起云主机"
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
      }).then((data) => {
        for (var r = 0; r < selectRows.length; r++) {
          var row = selectRows[r];
          var instance = self.instanceMaps.get(row.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.suspendInstSuccess'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    pId: Symbol.for('status'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instRestore'),
    showflg: (Vue.roleType + "" !== "3"),
    operateMore: true,
    enable(rowData) {
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return (rowData['status'] === "SUSPENDED" && rowData['OS-EXT-STS:task_state'] === null);
    },
    handler: async function(selectRows) {
      var self = this;
      var body = { "resume": null };
      body = JSON.stringify(body);
      self.$sequence({
        type: 'post',
        data: body,
        url: 'api/nova/v2.1/servers/{id}/action',
        params: selectRows,
        confirmMsg: Vue.t('calcStorLang.recoverInstConfirm'),
        log: {
          description: {
            en: "Recover Instance",
            zh_cn: "恢复云主机"
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
      }).then((data) => {
        for (var r = 0; r < selectRows.length; r++) {
          var row = selectRows[r];
          var instance = self.instanceMaps.get(row.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.recoverInstSuccess'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    pId: Symbol.for('status'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.pause'),
    showflg: (Vue.roleType + "" !== "3"),
    operateMore: true,
    enable(rowData) {
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return (rowData['status'] === "ACTIVE" && rowData['OS-EXT-STS:task_state'] === null);
    },
    handler: async function(selectRows) {
      var self = this;
      var body = { "pause": null };
      body = JSON.stringify(body);
      self.$sequence({
        type: 'post',
        data: body,
        url: 'api/nova/v2.1/servers/{id}/action',
        params: selectRows,
        confirmMsg: Vue.t('calcStorLang.pausedInstConfirm'),
        log: {
          description: {
            en: "Pause Instance",
            zh_cn: "暂停云主机"
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
      }).then((data) => {
        for (var r = 0; r < selectRows.length; r++) {
          var row = selectRows[r];
          var instance = self.instanceMaps.get(row.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.pausedInstSuccess'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    pId: Symbol.for('status'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instUnpaused'),
    showflg: (Vue.roleType + "" !== "3"),
    operateMore: true,
    enable(rowData) {
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return (rowData['status'] === "PAUSED" && rowData['OS-EXT-STS:task_state'] === null);
    },
    handler: async function(selectRows) {
      var self = this;
      var body = { "unpause": null };
      body = JSON.stringify(body);
      self.$sequence({
        type: 'post',
        data: body,
        url: 'api/nova/v2.1/servers/{id}/action',
        params: selectRows,
        confirmMsg: Vue.t('calcStorLang.unPausedInstConfirm'),
        log: {
          description: {
            en: "Cancel pause Instance",
            zh_cn: "取消暂停云主机"
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
      }).then((data) => {
        for (var r = 0; r < selectRows.length; r++) {
          var row = selectRows[r];
          var instance = self.instanceMaps.get(row.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.unPausedInstSuccess'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    pId: Symbol.for('status'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instLocked'),
    showflg: (Vue.roleType + '' === '2'),
    operateMore: true,
    enable(rowData) {
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return rowData["locked"] !== true && rowData['OS-EXT-STS:task_state'] === null && rowData['status'] !== "ERROR";
    },
    handler: function(selectRows) {
      const $this = this;
      $this.$prompt($this.$t('calcStorLang.INSTANCE_LOCK_TIPS'), $this.$t('calcStorLang.INSTANCE_LOCK'), {
        confirmButtonText: $this.$t('lang.confirm'),
        cancelButtonText: $this.$t('lang.cancel'),
        inputPlaceholder: $this.$t('calcStorLang.INSTANCE_LOCK_REASON'),
        inputValue: '',
        inputValidator: (value) => {
          if (value.length > 255) {
            return $this.$t('calcStorLang.INSTANCE_LOCK_MAX_LEN');
          }
          return true;
        }
      }).then(async ({value}) => {
        let instance = selectRows[0];
        try {
          let res = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers/${instance.id}/action`,
            headers: {
              'X-OpenStack-Nova-API-Version': 2.73
            },
            data: JSON.stringify({
              lock: {
                locked_reason: value
              }
            }),
            log: {
              description: {
                en: `Locked Instance (Instance ID: ${instance.id}, Instance Name: ${instance.name})`,
                zh_cn: `锁定云主机（云主机ID：${instance.id}，云主机名：${instance.name}）`
              },
              key: "name",
              target: Vue.logTarget.computeInstance
            }
          });
          let instanceMap = $this.instanceMaps.get(instance.id);
          instanceMap['OS-EXT-STS:task_state'] = 'BUSY';
          $this.$message(Vue.t('calcStorLang.lockedInstSuccess'));
          $this.$refs.umTable.clearSelection();
        } catch (e) {
          __DEV__ && console.error(e);
        }
      });
    }.bind(this)
  }, {
    pId: Symbol.for('status'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instUnLocked'),
    showflg: (Vue.roleType + '' === '2'),
    operateMore: true,
    enable(rowData) {
      return rowData["locked"] !== false && rowData['OS-EXT-STS:task_state'] === null;
    },
    handler: function(selectRows) {
      var self = this;
      var body = { "unlock": true };
      body = JSON.stringify(body);
      self.$sequence({
        type: 'post',
        data: body,
        url: 'api/nova/v2.1/servers/{id}/action',
        params: selectRows,
        confirmMsg: Vue.t('calcStorLang.unLockedInstConfirm'),
        log: {
          description: {
            en: "Unlocked Instance",
            zh_cn: "解锁云主机"
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
      }).then((data) => {
        for (var r = 0; r < selectRows.length; r++) {
          var row = selectRows[r];
          var instance = self.instanceMaps.get(row.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.unLockedInstSuccess'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    pId: Symbol.for('status'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.rescue'),
    showflg: false,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (rowData.metadata.source_type === "volume") {
        return false;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return ((rowData['status'] === "ACTIVE" || rowData['status'] === "SHUTOFF") && rowData['metadata']['source_type'] !== "volume");
    },
    handler: async function(selectRows) {
      var self = this;
      var row = selectRows[0];
      self.instUuid = row['id'];
      self.instProjectId = row['tenant_id'];
      self.instanceName = row['name'];
      self.instImageId = row['image'].id || "";
      self.instSource = row['metadata']['source_type'];
      var instSourceType = row['metadata']['source_type'];
      if ("snapshot" === instSourceType) {
        try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/glance/v2/images/" + row.image.id,
            showErrMsg: true
          });
          var imageSize = result['size'];
          if (imageSize <= 0) {
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instRescueTip1'),
              type: 'warning'
            });
          } else {
            self.rescueFlag = true;
          }
        } catch (res) {
        }
      } else {
        self.rescueFlag = true;
      }
    }.bind(this)
  }, {
    pId: Symbol.for('status'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instUnRescue'),
    showflg: false,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return rowData["status"] === "RESCUE";
    },
    handler: function(selectRows) {
      var self = this;
      var body = { "unrescue_inspur": true };
      body = JSON.stringify(body);
      self.$sequence({
        type: 'post',
        data: body,
        url: 'api/nova/v2.1/servers/{id}/action',
        params: selectRows,
        confirmMsg: Vue.t('calcStorLang.unRescueInstConfirm'),
        log: {
          description: {
            en: "Rescue Instance",
            zh_cn: "解除援救云主机"
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
      }).then((data) => {
        for (var r = 0; r < selectRows.length; r++) {
          var row = selectRows[r];
          var instance = self.instanceMaps.get(row.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.unRescueInstSuccess'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    pId: Symbol.for('status'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instShelving'),
    showflg: (Vue.roleType + "" === "2" || Vue.roleType + "" === "0"),
    operateMore: true,
    enable(rowData) {
      if (rowData['locked'] === true) {
        return false;
      }
      return ((rowData['status'] === "PAUSED" || rowData['status'] === "ACTIVE" || rowData['status'] === "SHUTOFF" || rowData['status'] === "SUSPENDED") && rowData['OS-EXT-STS:task_state'] === null);
    },
    handler: function(selectRows) {
      const $this = this;
      $this.$confirm(Vue.t('calcStorLang.shelvingInstConfirm'), Vue.t('calcStorLang.confirm'), {
        type: 'warning'
      }).then(async () => {
        let instance = selectRows[0];
        try {
          await $this.$ajax({
            type: 'post',
            data: JSON.stringify({ "shelve": true }),
            url: `api/nova/v2.1/servers/${instance.id}/action`,
            log: {
              description: {
                en: `Shelve Instance(Instance ID: ${instance.id}, Instance Name: ${instance.name})`,
                zh_cn: `搁置云主机（云主机ID：${instance.id}，云主机名：${instance.name}）`
              },
              target: Vue.logTarget.computeInstance
            }
          });
          instance['OS-EXT-STS:task_state'] = "BUSY";
          $this.$message(Vue.t('calcStorLang.shelvingInstSuccess'));
          $this.$refs.umTable.clearSelection();
        } catch (e) {
          __DEV__ && console.error(e);
        }
      });
    }.bind(this)
  }, {
    pId: Symbol.for('status'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instUnShelving'),
    showflg: (Vue.roleType + "" === "2" || Vue.roleType + "" === "0"),
    operateMore: true,
    enable(rowData) {
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      return rowData['status'] === "SHELVED_OFFLOADED" && rowData['OS-EXT-STS:task_state'] === null;
    },
    handler: function(selectRows) {
      var self = this;
      self.selectRows1 = selectRows;
      self.detailFlg = true;
    }.bind(this)
  }, {
    icon: "fa-check-circle-o",
    name: Vue.t('calcStorLang.INSTANCE_CLONE_CLONE'),
    showflg: String(Vue.roleType) === '2',
    operateMore: true,
    multi: true,
    enable(rowData) {
      if (rowData['metadata']['source_type'] !== 'volume') {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      return ['SHUTOFF', 'PAUSED'].includes(rowData.status);
    },
    handler: function(selectRows) {
      this.instanceCloneDialog.instances = selectRows;
      this.instanceCloneDialog.visible = true;
    }.bind(this)
  }, {
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instEditSecurityGroup'),
    showflg: (Vue.roleType + "" !== "3"),
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== "0" && rowData['locked'] === true) {
        return false;
      }
      if (rowData["status"] === "ACTIVE") {
        return true;
      } else {
        return false;
      }
    },
    handler: function(selectRows) {
      let self = this;
      //self.securityGroupFlag = true;
      let row = selectRows[0];
      self.instUuid = row["id"];
      self.projectId = row["tenant_id"];
      self.instanceName = row["name"];
      self.selectNetCardDialog.instance = row;
      self.securityGroupFlag = true;
    }.bind(this)
  }, {
    id: Symbol.for('hotPlug'),
    icon: "fa-meh-o",
    name: Vue.t('calcStorLang.HotPlug'),
    showflg: (Vue.roleType + "" !== "3" && Vue.archIs('x86')),
    operateMore: true,
    enable(rowData) {
      return true;
    }
  }, {
    pId: Symbol.for('hotPlug'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.open'),
    showflg: false,
    operateMore: true,
    multi: false,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (roleType !== '0' && rowData['locked'] === true) {
        return false;
      }
      if (rowData.status === 'ACTIVE' || rowData.status === 'SHUTOFF' || rowData.status === 'PAUSED') { //运行或关机状态
        if (rowData.tags.indexOf('HOTPLUG') === -1) { //没有HOTPLUG标记
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    handler: function(selectRows) {
      const $this = this;
      const row = selectRows[0];
      const os = row.system_metadata.image_os_distro;
      if ($this.OSSupportsHotPlug.findIndex(item => item === os) === -1) {
        $this.$message.error(Vue.t('calcStorLang.currentSystemNotSupportHotPlug'));
      } else {
        $this.$ajax({
          type: 'put',
          url: 'api/nova/v2.1/servers/' + row.id + '/tags/HOTPLUG',
          data: {
            body: {}
          },
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          confirmMsg: (row.status === 'ACTIVE' || row.status === 'PAUSED') ? Vue.t('calcStorLang.opencloseConfirm') : Vue.t('calcStorLang.openhotConfirm'),
          log: {
            description: {
              en: "Open Online Expansion:" + row.name,
              zh_cn: "开启在线扩容:" + row.name
            },
            key: "name",
            target: Vue.logTarget.computeInstance
          }
        }).then((data) => {
          for (let r = 0; r < row.length; r++) {
            const rowd = row[r];
            const instance = $this.instanceMaps.get(rowd.id);
            instance['OS-EXT-STS:task_state'] = "BUSY";
          }
          $this.$message(Vue.t('calcStorLang.openSendSuccess'));
          $this.$refs.umTable.clearSelection();
        }).catch((err) => {});
      }
    }.bind(this)
  }, {
    pId: Symbol.for('hotPlug'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.closed'),
    showflg: Vue.archIs('x86'),
    multi: false,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (roleType !== '0' && rowData['locked'] === true) {
        return false;
      }
      if (rowData.status === 'ACTIVE' || rowData.status === 'SHUTOFF' || rowData.status === 'PAUSED') { //运行或关机状态
        if (rowData.tags.indexOf('HOTPLUG') === -1) { //没有HOTPLUG标记
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    handler: function(selectRows) {
      var self = this;
      var row = selectRows[0];
      self.$ajax({
        type: 'delete',
        url: 'api/nova/v2.1/servers-inspur/' + row.id + '/tags/HOTPLUG',
        data: {
          body: {}
        },
        headers: {
          'X-OpenStack-Nova-API-Version': 2.67
        },
        confirmMsg: (row.status ==='ACTIVE' || row.status === 'PAUSED') ? Vue.t('calcStorLang.opencloseConfirm') : Vue.t('calcStorLang.closehotConfirm'),
        log: {
          description: {
            en: "Close Online Expansion:" + row.name,
            zh_cn: "关闭在线扩容:" + row.name
          },
          key: "name",
          target: Vue.logTarget.computeInstance
        }
      }).then((data) => {
        for (var r = 0; r < row.length; r++) {
          var rowd = row[r];
          var instance = self.instanceMaps.get(rowd.id);
          instance['OS-EXT-STS:task_state'] = "BUSY";
        }
        self.$message(Vue.t('calcStorLang.closeSendSuccess'));
        self.$refs.umTable.clearSelection();
      }).catch((err) => {});
    }.bind(this)
  }, {
    pId: Symbol.for('hotPlug'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.instOnlineExpansion'),
    showflg: Vue.archIs('x86'),
    multi: false,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (roleType !== '0' && rowData['locked'] === true) {
        return false;
      }
      if (rowData.status === 'ACTIVE' || rowData.status === 'PAUSED') { //运行或暂停状态
        if (rowData.tags.indexOf('HOTPLUG') === -1) { //没有HOTPLUG标记
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    handler: function(selectRows) {
      this.reviseInstanceDialog.instances = selectRows;
      this.reviseInstanceDialog.hotplug = true;
      this.reviseInstanceDialog.visible = true;
    }.bind(this)
  }, {
    icon: "fa-wrench",
    name: Vue.t('calcStorLang.instAlterConfig'),
    showflg: (Vue.roleType + "" !== "3"),
    multi: true,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== "0") {
        return ((rowData['status'] === "ACTIVE" || rowData['status'] === "SHUTOFF") && rowData['locked'] === false);
      } else {
        return (rowData['status'] === "ACTIVE" || rowData['status'] === "SHUTOFF");
      }
    },
    handler: function(selectRows) {
      let projectIds = selectRows.map(item => {
        return item.tenant_id;
      });
      projectIds = Array.from(new Set(projectIds));
      if (projectIds.length > 1) {
        this.$message.warning(this.$t('calcStorLang.REVISE_INSTANCE_MUST_BE_SAME_PROJECT'));
      } else {
        this.reviseInstanceDialog.instances = selectRows;
        this.reviseInstanceDialog.hotplug = false;
        this.reviseInstanceDialog.visible = true;
      }
    }.bind(this)
  }, {
    id: Symbol.for('instAlterConfig'),
    icon: "fa-meh-o",
    name: Vue.t('calcStorLang.instAlterConfig'),
    showflg: (Vue.roleType + "" === '3'),
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      return true;
    }
  }, {
    pId: Symbol.for('instAlterConfig'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.applyAlterInstConfig'),
    showflg: true,
    multi: false,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== '0' && rowData.locked === true) {
        return false;
      }
      return rowData.applyModifySpec;
    },
    handler: function(selectRows) {
      this.reviseInstanceDialog.instances = selectRows;
      this.reviseInstanceDialog.hotplug = false;
      this.reviseInstanceDialog.visible = true;
    }.bind(this)
  }, {
    pId: Symbol.for('instAlterConfig'),
    icon: "fa-plus",
    name: Vue.t('calcStorLang.doAlterInstConfig'),
    showflg: true,
    multi: false,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== '0' && rowData.locked === true) {
        return false;
      }
      return rowData.confirmModifySpec;
    },
    handler: function(selectRows) {
      var self = this;
      var row = selectRows[0];
      self.approveOrder(row);
    }.bind(this)
  }, {
    icon: "fa-plus",
    name: Vue.t('calcStorLang.VM_TAGS_MANAGE'),
    showflg: Vue.roleType + '' !== '3',
    multi: false,
    operateMore: true,
    enable(rowData) {
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (String(Vue.roleType) !== '0' && rowData.locked === true) {
        return false;
      }
      return true;
    },
    handler: function(selectRows) {
      const $this = this;
      $this.instanceTags.show = true;
      $this.instanceTags.projectId = $this.$cookie.get('pid');
      $this.instanceTags.instanceId = selectRows[0].id;
    }.bind(this)
  }, {
    icon: "fa-plus",
    name: Vue.t('calcStorLang.MODIFY_PASSWORD'),
    showflg: false,
    multi: false,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (rowData.locked === true) {
        return false;
      }
      if (rowData.status === 'SHUTOFF') {
        return false;
      }
      return true;
    },
    handler: function(selectRows) {
      const $this = this;
      $this.modifyPasswordDialog.visible = true;
      $this.modifyPasswordDialog.instanceId = selectRows[0].id;
    }.bind(this)
  }, {
    icon: "fa-plus",
    name: Vue.t('calcStorLang.EDIT_INSTANCE'),
    showflg: false,
    multi: true,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (rowData['locked'] === true) {
        return false;
      }
      if (['ACTIVE', 'SHUTOFF', 'PAUSED', 'SUSPENDED'].includes(rowData.status)) { //运行、关闭、暂停、挂起状态
        return true;
      }
      return false;
    },
    handler: function(selectRows) {
      const $this = this;
      if (selectRows.length === 1) {
        const instance = selectRows[0];
        $this.editInstanceDialog.instance = instance;
        $this.editInstanceDialog.visible = true;
      } else {
        $this.batchEditInstanceDialog.instances = selectRows;
        $this.batchEditInstanceDialog.visible = true;
      }
    }.bind(this)
  }, {
    icon: "fa-plus",
    name: Vue.t('calcStorLang.RESET_INSTANCE'),
    showflg: true,
    multi: true,
    operateMore: true,
    enable(rowData) {
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (rowData.locked === true) {
        return false;
      }
      return rowData.status === 'ERROR';
    },
    handler: function(selectRows) {
      this.$confirm(Vue.t('calcStorLang.RESET_INSTANCE_CONFIRM_TIPS'), Vue.t('base.confirm'), {
        confirmButtonText: Vue.t('lang.confirm'),
        cancelButtonText: Vue.t('lang.cancel'),
        type: "warning",
        closeOnClickModal: false
      }).then(() => {
        this.resetInstanceDialog.instances = selectRows;
        this.resetInstanceDialog.visible = true;
      });
    }.bind(this)
  }, {
    icon: "fa-plus",
    name: Vue.t('calcStorLang.CPU_PIN'),
    showflg: false,
    multi: false,
    operateMore: true,
    enable(rowData) {
      if (rowData['OS-EXT-STS:task_state'] !== null) {
        return false;
      }
      if (rowData['metadata']['source_type'] === 'volume' && rowData['os-extended-volumes:volumes_attached'].findIndex(item => item.boot_disk === true) === -1) {
        return false;
      }
      if (rowData.locked === true) {
        return false;
      }
      if (['ACTIVE'].includes(rowData.status)) { //运行状态
        return true;
      }
      return false;
    },
    handler: function(selectRows) {
      const $this = this;
      const instance = selectRows[0];
      $this.cpuPinDialog.instance = instance;
      $this.cpuPinDialog.visible = true;
    }.bind(this)
  }];
};
