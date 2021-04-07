module.exports = function() {
  return [{
    icon: 'fa-plus',
    name: Vue.t('calcStorLang.GPU_ADD'),
    enableFlg: false,
    showflg: true,
    readOnly: true,
    handler: function(selectRows) {
      this.editProfileDialog.type = 'add';
      this.editProfileDialog.visible = true;
    }.bind(this)
  }, {
    icon: 'fa-pencil-square-o',
    name: Vue.t('calcStorLang.GPU_EDIT'),
    showflg: true,
    enable(rowData) {
      return true;
    },
    handler: function(selectRows) {
      const row = selectRows[0];
      this.editProfileDialog.type = 'edit';
      this.editProfileDialog.profile = JSON.parse(JSON.stringify(row));
      this.editProfileDialog.visible = true;
    }.bind(this)
  }, {
    icon: 'fa-times',
    name: Vue.t('calcStorLang.GPU_DELETE'),
    showflg: true,
    multi: true,
    enable(rowData) {
      return rowData.in_use === false;
    },
    handler: function(selectRows) {
      const $this = this;
      $this.$confirm(Vue.t('calcStorLang.GPU_PROFILE_DELETE_CONFIRM'), Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      }).then(async () => {
        for (let i = 0; i < selectRows.length; i++) {
          const row = selectRows[i];
          try {
            await $this.$ajax({
              type: 'delete',
              url: `api/cyborg/v2/device_profiles/${row.uuid}`,
              showErrMsg: true,
              errorKey: 'error_message',
              log: {
                description: {
                  en: `Delete GPU Profile: ${row.name}`,
                  zh_cn: `删除加速器规格：${row.name}`
                },
                target: Vue.logTarget.computeGPU
              }
            });
          } catch (e) {
            __DEV__ && console.error(e);
          }
        }
        $this.$refs.table.clearSelection();
        $this.loadDeviceProfiles();
      });
    }.bind(this)
  }];
};
