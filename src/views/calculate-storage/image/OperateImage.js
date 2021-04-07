module.exports = function() {
  return [{
    icon: "fa-plus",
    name: Vue.t('calcStorLang.createImage'),
    showflg: Vue.uploadImageUseFakeS3 === false,
    readOnly: true,
    handler: function(selectRows) {
      //创建
      this.addFlag = true;
    }.bind(this)
  }, {
    icon: "fa-plus",
    name: Vue.t('calcStorLang.createImage'),
    showflg: Vue.uploadImageUseFakeS3 === true,
    readOnly: true,
    handler: function(selectRows) {
      //创建支持断点续传
      this.addImageBreakResumeDialog.visible = true;
    }.bind(this)
  }, {
    icon: "fa-cloud-upload",
    name: Vue.t('calcStorLang.IMAGE_RESUME_BUTTON'),
    showflg: Vue.uploadImageUseFakeS3 === true,
    multi: false,
    enable(rowData) {
      return (rowData['status'] + "" === "queued");
    },
    handler: function(selectRows) {
      this.imageBreakResumeDialog.id = selectRows[0].id;
      this.imageBreakResumeDialog.visible = true;
    }.bind(this)
  }, {
    icon: "fa-play",
    name:  Vue.t('lang.startUp'),
    showflg: true,
    multi: false,
    enable(rowData) {
      return (rowData['status'] + "" == "active");
    },
    handler: function(selectRows) {
      const image = selectRows[0];
      this.size = (((image.size)/1024)/1024)/1024;
      if (image.size === 0) {
        this.$message({
          showClose: true,
          message: Vue.t('calcStorLang.warnCreateImage'),
          type: 'warning'
        });
      } else {
        this.createInstanceDialog.sourceId = image.id;
        this.createInstanceDialog.sourceName = image.name;
        this.createInstanceDialog.sourceOSDistro = image.os_distro ? image.os_distro : '';
        this.createInstanceDialog.sourceMinRam = image.min_ram ? image.min_ram : 0;
        this.createInstanceDialog.sourceMinDisk = image.min_disk ? image.min_disk : 0;
        this.createInstanceDialog.sourceImageFormat = image.disk_format ? image.disk_format : '';
        this.createInstanceDialog.sourceSize = image.size ? image.size : 0;
        this.createInstanceDialog.sourceVirtualSize = image.inspur_virtual_size ? image.inspur_virtual_size : 0;
        if (image.visibility !== 'public' && image.visibility !== 'shared') {
          this.createInstanceDialog.projectIdLocked = true;
          this.createInstanceDialog.projectId = image.owner;
        } else {
          this.createInstanceDialog.projectIdLocked = false;
          this.createInstanceDialog.projectId = this.$cookie.get('pid');
        }
        this.createInstanceDialog.visible = true;
      }
    }.bind(this)
  }, {
    icon: "fa-pencil",
    name:  Vue.t('lang.edit'),
    showflg: true,
    multi: false,
    enable(rowData) {
      var roleType = rowData['roleType'] + "";
      if ("0" == roleType) { //超级管理员
        return rowData['status'] + "" == "active";
      } else {
        if (rowData['status'] + "" == "active" && rowData['owner'] == rowData['projectId']) {
          return true;
        } else {
          return false;
        }
      }
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
    icon: "fa-refresh",
    name: Vue.t('calcStorLang.EDIT_IMAGE_METADATA'),
    showflg: (Vue.roleType + '' === '0'),
    multi: false,
    enable(rowData) {
      return rowData.status === 'active';
    },
    handler: function(selectRows) {
      this.metadataList.imageId = selectRows[0].id;
      this.metadataList.visible = true;
    }.bind(this)
  }, {
    icon: "fa-plus",
    name: Vue.t('calcStorLang.createVolume'),
    showflg: true,
    multi: false,
    enable(rowData) {
      return (rowData['status'] + "" == "active");
    },
    handler: function(selectRows) {
      this.imageInfo = selectRows[0];
      this.newVolumeFlg = true;
      this.$nextTick(() => {
          this.$refs.NewVolume.show();
      });
    }.bind(this)
  }, /* {
    icon: "fa-download",
    name: Vue.t('calcStorLang.download'),
    showflg: true,
    multi: false,
    enable(rowData) {
      return (rowData['status'] + "" == Vue.t('calcStorLang.runningStatus'));
    },
    handler: function(selectRows) {
    }.bind(this)
  }, */
  {
    icon: "fa-plus",
    name: Vue.t('calcStorLang.imageShared'),
    showflg: (Vue.roleType + "" == "0"),
    multi: false,
    enable(rowData) {
      return (rowData['visibility'] + "" == "shared" && rowData['roleType'] == "0");
    },
    handler: function(selectRows) {
      var self = this;
      self.imageInfo = selectRows[0];
      self.shareImageFlag = true;
    }.bind(this)
  }, {
    icon: "fa-times",
    name: Vue.t('lang.delete'),
    showflg: true,
    multi: true,
    enable(rowData) {
      var owner = rowData['owner'];
      var curpid = rowData['projectId'];
      var protect = rowData['protected'];
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
        var self = this;
        self.$prompt(Vue.t('lang.inputYesToContinue'), Vue.t('calcStorLang.confirm'), {
          confirmButtonText: Vue.t('calcStorLang.confirm'),
          cancelButtonText: Vue.t('lang.cancel'),
          inputPattern:/^YES$|^NO$/i,
          inputValue: "NO",
          customClass: "promptConfirmDel",
          inputErrorMessage:Vue.t('lang.onlyAcceptYesOrNo')
        }).then(async({ value }) => {
          if ("yes" == value.toLowerCase()) {
            self.$sequence({
              type: 'delete',
              url: 'api/glance/v2/images/{id}',
              params: selectRows,
              successMsg: Vue.t('lang.sendDeleteSuccess'),
              log: {
                  description: {
                    en: "Delete Image",
                    zh_cn: "删除镜像"
                  },
                  key: "name",
                  target: Vue.logTarget.computeMirror
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
  }, {
    icon: "fa-tags",
    name: Vue.t('calcStorLang.IMAGE_TAGS_MANAGE'),
    showflg: Vue.roleType + '' !== '3',
    multi: false,
    operateMore: false,
    enable(rowData) {
      if (rowData.status !== 'active') {
        return false;
      }
      const roleType = rowData.roleType + '';
      if (roleType === '0') { //超级管理员
        return true;
      } else {
        return rowData['owner'] === rowData['projectId'];
      }
    },
    handler: function(selectRows) {
      const $this = this;
      $this.imageTags.visible = true;
      $this.imageTags.imageId = selectRows[0].id;
    }.bind(this)
  }];
};
