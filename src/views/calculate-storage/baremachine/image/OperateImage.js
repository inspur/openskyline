module.exports = function() {
  return [{
    icon: "fa-plus",
    name: Vue.t("calcStorLang.createImage"),
    showflg: true,
    readOnly: true,
    handler: function(selectRows) {
      //创建
      this.addFlag = true;
    }.bind(this)
  }, {
    icon: "fa-cloud-upload",
    name: Vue.t('calcStorLang.IMAGE_RESUME_BUTTON'),
    showflg: true,
    multi: false,
    enable(rowData) {
      return (rowData['status'] + "" === "queued");
    },
    handler: function(selectRows) {
      this.imageBreakResumeDialog.id = selectRows[0].id;
      this.imageBreakResumeDialog.visible = true;
    }.bind(this)
  }, {
    icon: "fa-pencil",
    name: Vue.t("lang.edit"),
    showflg: true,
    multi: false,
    enable(rowData) {
      if (rowData['status'] + "" == "active" && rowData['owner'] == rowData['projectId']) {
        if (rowData['roleType'] == "0" && rowData['visibility'] == "private") {
          return false;
        }
        return true;
      }
      return false;
    },
    handler: function(selectRows) {
      this.imageName = selectRows[0].name;
      this.imageInfo = selectRows[0];
      this.editFlag = true;
      if ( this.detailFlag ) {
          this.detailFlag = false;
      }
      this.$nextTick(() => {
        this.$refs.editImage.dialogVisible = true;
        this.$refs.editImage.initDialog();
      });
    }.bind(this)
  }, {
    icon: "fa-times",
    name: Vue.t("lang.delete"),
    showflg: true,
    multi: true,
    enable(rowData) {
      let owner = rowData['owner'];
      let curpid = rowData['projectId'];
      let protect = rowData['protected'];
      if (protect === true) {
        return false;
      }
      if ("2" == rowData['roleType'] || "3" == rowData['roleType']) {
        if (owner == curpid) {
          return true;
        }
        return false;
      } else {
        return true;
      }
    },
    handler: function(selectRows) {
        let self = this;
        self.$prompt(Vue.t("lang.inputYesToContinue"), Vue.t("calcStorLang.confirm"), {
          confirmButtonText: Vue.t("calcStorLang.confirm"),
          cancelButtonText: Vue.t("lang.cancel"),
          inputPattern:/^YES$|^NO$/i,
          inputValue: "NO",
          customClass: "promptConfirmDel",
          inputErrorMessage:Vue.t("lang.onlyAcceptYesOrNo")
        }).then(async({ value }) => {
          if ("yes" == value.toLowerCase()) {
            self.$sequence({
              type: 'delete',
              url: 'api/glance/v2/images/{id}',
              params: selectRows,
              successMsg: Vue.t("lang.sendDeleteSuccess"),
              log: {
              description: {
                en: "Delete image:",
                zh_cn: "删除裸机镜像"
              },
              key: "name",
              target: Vue.logTarget.bareMachineImage
           }
             // errorKey: "message"
            }).then((data) => {
              selectRows.forEach(item => {
                item['status'] = 'pending_delete';
              });
              self.loading = true;
              self.$refs.imageTable.clearSelection();
              self.currentPage = 1;
              setTimeout( function() {
                self.getData({
                  page: 1
                });
                self.loading = false;
              }, 5000);
            }).catch((err) => {});
          }
        }).catch(() => {
          //取消
        });
    }.bind(this)
  }];
};
