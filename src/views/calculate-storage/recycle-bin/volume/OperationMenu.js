module.exports = function() {
  return [
    {
      icon: 'fa-repeat',
      name: this.$t('calcStorLang.RECYCLE_BIN_RESTORE'),
      showflg: true,
      multi: true,
      enable: function(instance) {
        return true;
      },
      handler: async function(selectRows) {
        const self = this;
        self.$confirm(this.$t('calcStorLang.RECYCLE_BIN_RESTORE_VOLUME_CONFIRM'), self.$t('base.confirm'), {
          confirmButtonText: self.$t('base.confirm'),
          cancelButtonText: self.$t('base.cancel'),
          type: 'warning'
        }).then(async() => {
          var body = { "os-restore_inspur": null };
          body = JSON.stringify(body);
          self.$sequence({
            type: "post",
            url: "api/cinderv3/v3/" + this.$cookie.get("pid") + "/volumes/{id}/action",
            params: selectRows,
            data: body,
            headers: {
              "OpenStack-API-Version": "volume 3.0"
            },
            log: {
              description: {
                en: "Resotre the soft-delete volume",
                zh_cn: "恢复软删除的云硬盘"
              },
              key: "name",
              target: Vue.logTarget.storage_volume
            },
            successFun: function () {
              self.$refs.volumeTable.clearSelection();
              self.currentPage = 1;
              self.loadData(self.queryParams);
            }
          }).then(data => {
            self.$message(self.$t('calcStorLang.RECYCLE_BIN_RESTORE_SENT_SUCCESSFULLY'));
          }).catch(err => { });
          self.$refs.volumeTable.clearSelection();
          setTimeout(function() {
            self.loadData(self.queryParams);
          }, 3000);
        });
      }.bind(this)
    }, {
      icon: 'fa-ban',
      name: this.$t('calcStorLang.RECYCLE_BIN_FORCE_DELETE'),
      showflg: true,
      multi: true,
      enable: function(instance) {
        return true;
      },
      handler: async function(selectRows) {
        var self = this;
        self.$prompt(
          this.$t("lang.inputYesToContinue"),
          this.$t("lang.confirm"),
          {
            confirmButtonText: this.$t("lang.confirm"),
            cancelButtonText: this.$t("lang.cancel"),
            inputPattern: /^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage: this.$t("lang.onlyAcceptYesOrNo")
          }
        ).then(async ({ value }) => {
          if ("yes" == value.toLowerCase()) {
            let url = "";
            if (Vue.roleType == "0") {
              url = "api/cinderv3/v3/" + this.$cookie.get("pid") + "/volumes/{id}?force=True";
            } else {
              url = "api/cinderv3/v3/" + this.$cookie.get("pid") + "/volumes/{id}";
            }
            self.$sequence({
              type: "delete",
              url: url,
              params: selectRows,
              headers: {
                "OpenStack-API-Version": "volume 3.23"
              },
              errorKey: "badRequest",
              log: {
                description: {
                  en: "Complete delete volume {name}({id})",
                  zh_cn: "彻底删除云硬盘{name}({id})"
                },
                target: Vue.logTarget.storage_volume
              }
            }).then(data => {
              selectRows.forEach(item => {
                item['status'] = 'deleting';
              });
              self.$message(self.$t('calcStorLang.RECYCLE_BIN_FORCE_DELETE_SENT_SUCCESSFULLY'));
              self.$refs.volumeTable.clearSelection();
              setTimeout(function () {
                self.loadData(self.queryParams);
                self.loading = false;
              }, 2000);
            }).catch(err => { });
          }
        }).catch(() => {
            //取消
        });
      }.bind(this)
    }
  ];
}
