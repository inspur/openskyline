module.exports = function() {
  return [{
    icon: 'fa-plus',
    name: Vue.t('calcStorLang.GPU_ADD'),
    enableFlg: false,
    showflg: true,
    readOnly: true,
    handler: function(selectRows) {
      let newGroup = {
        type: '',
        vendor: '',
        product_id: '',
        amount: 1
      };
      this.formData.groups.push(newGroup);
    }.bind(this)
  }, {
    icon: 'fa-times',
    name: Vue.t('calcStorLang.GPU_DELETE'),
    showflg: true,
    multi: true,
    enable(rowData) {
      return true;
    },
    handler: function(selectRows) {
      const $this = this;
      selectRows.forEach(item => {
        let index = $this.formData.groups.indexOf(item);
        if (index > -1) {
          $this.formData.groups.splice(index, 1);
        }
        $this.$refs.groupsTable.clearSelection();
      });
    }.bind(this)
  }];
};
