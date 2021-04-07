module.exports = function() {
  return [{
    icon: 'fa-plus',
    name: Vue.t('calcStorLang.EDIT_INSTANCE_QOS_ADD'),
    enableFlg: false,
    showflg: true,
    readOnly: true,
    handler: function(selectRows) {
      if (this.formData.qos.length === this.qosKeys.length) {
        this.$message.error(this.$t('calcStorLang.EDIT_INSTANCE_NO_MORE_QOS'));
      } else {
        this.showEditQosDialog('add');
      }
    }.bind(this)
  }, {
    icon: 'fa-pencil-square-o',
    name: Vue.t('calcStorLang.EDIT_INSTANCE_QOS_EDIT'),
    showflg: true,
    enable(rowData) {
      return true;
    },
    handler: function(selectRows) {
      const row = selectRows[0];
      this.showEditQosDialog('edit', row);
    }.bind(this)
  }, {
    icon: 'fa-times',
    name: Vue.t('calcStorLang.EDIT_INSTANCE_QOS_DELETE'),
    showflg: true,
    multi: true,
    enable(rowData) {
      return true;
    },
    handler: function(selectRows) {
      this.formData.qos = this.formData.qos.filter(item => {
        return !selectRows.map(s => s.key).includes(item.key);
      });
      this.$refs.qosTable.clearSelection();
    }.bind(this)
  }];
};
