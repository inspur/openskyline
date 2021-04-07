module.exports = function() {
  return [{
    icon: "fa-plus",
    name: this.$t('lang.addSchedule'),
    showflg: Vue.AuthList.m.ism.icloudmonitor.schedule.add.flg,
    readOnly: true,
    handler: function(selectRows) {
      let parentPath = this.$route.matched[1].path;
      this.$router.push({
        path: '/cloud-monitor/schedule-add'
      });
    }.bind(this)
  }, {
    icon: "fa-pencil-square-o",
    name: this.$t('lang.modify'),
    showflg: Vue.AuthList.m.ism.icloudmonitor.schedule.update.flg,
    multi: false,
    enable(rowData) {
      if (rowData.scheduleName == "24x7") {
        return false;
      }
      return true;
    },
    handler: function(selectRows) {
      let parentPath = this.$route.matched[1].path;
      this.$router.push({
        path: '/cloud-monitor/schedule-add/' + selectRows[0].scheduleId
      });
    }.bind(this)
  }, {
    icon: "fa-times",
    name: this.$t('lang.del'),
    showflg: Vue.AuthList.m.ism.icloudmonitor.schedule.delete.flg,
    multi: true,
    enable(rowData) {
      if (rowData.scheduleName == "24x7") {
        return false;
      }
      return true;
    },
    handler: async function(selectRows) {
      var self = this;
      var idList = [];
      selectRows.forEach((item, index) => {
        idList.push({
          id: item.scheduleId,
          name: item.scheduleName
        });
      });
      let data = {
        idList: idList
      };
      data = JSON.stringify(data);
      try {
        let ret = await this.$ajax({
          url: "api/icloudmonitor/v1/schedule/action/delete?" + $.param({language: Vue.Language}),
          data: data,
          type: 'post',
          confirmMsg: self.$t('lang.deleteScheduleConfirm'),
          successMsg: self.$t('lang.deleteSuccsss')
        });
        let resData = ret.resData;
        self.$refs.smTable.clearSelection();
        self.currentPage = 1;
        self.getData({
          page: 1
        });
      } catch (data) {
        __DEV__ && console.error(data);
      }
    }.bind(this)
  }];
};
